from collections.abc import Iterable
import logging
import asyncio
import re

import httpx

from app.core.config import settings

CLAUSE_KEYWORDS: dict[str, list[str]] = {
    "payment": ["payment", "fees", "invoice", "consideration"],
    "termination": ["terminate", "termination", "notice period"],
    "liability": ["liability", "damages", "loss"],
    "indemnity": ["indemnify", "indemnity", "hold harmless"],
    "arbitration": ["arbitration", "arbitrator", "conciliation"],
    "confidentiality": ["confidential", "non-disclosure", "nda"],
    "renewal": ["renewal", "auto-renewal", "extension"],
    "jurisdiction": ["jurisdiction", "governing law", "courts of"],
    "force_majeure": ["force majeure", "act of god", "unforeseen events"],
}


class AIService:
    def __init__(self) -> None:
        self.logger = logging.getLogger(__name__)

    async def _call_gemini(self, prompt: str) -> str | None:
        if not settings.gemini_api_key:
            self.logger.warning("Gemini API key missing; using fallback response.")
            return None
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient(timeout=40.0) as client:
            for attempt in range(2):
                try:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        self.logger.warning("Gemini returned no candidates; using fallback.")
                        return None
                    return candidates[0]["content"]["parts"][0].get("text")
                except httpx.HTTPStatusError as exc:
                    status_code = exc.response.status_code
                    self.logger.warning(
                        "Gemini HTTP error %s on attempt %s; model=%s",
                        status_code,
                        attempt + 1,
                        settings.gemini_model,
                    )
                    # Retry transient upstream failures once, then fallback.
                    if status_code in {429, 500, 502, 503, 504} and attempt == 0:
                        await asyncio.sleep(0.8)
                        continue
                    return None
                except Exception as exc:
                    self.logger.warning("Gemini call failed (%s); using fallback.", str(exc))
                    return None
        return None

    @staticmethod
    def _split_sentences(text: str) -> list[str]:
        return [s.strip() for s in text.replace("\n", " ").split(".") if s.strip()]

    @staticmethod
    def _find_matching_sentences(text: str, patterns: list[str], limit: int = 2) -> list[str]:
        sentences = AIService._split_sentences(text)
        matches: list[str] = []
        for sentence in sentences:
            s = sentence.lower()
            if any(re.search(pattern, s) for pattern in patterns):
                matches.append(sentence)
            if len(matches) >= limit:
                break
        return matches

    @staticmethod
    def _fallback_legal_chat_answer(question: str, context: str) -> str:
        q = question.lower().strip()

        if "ipc 321" in q or "section 321" in q:
            return (
                "IPC Section 321 defines 'voluntarily causing hurt'. In simple terms, a person causes hurt "
                "voluntarily when they do an act intending to cause hurt, or knowing it is likely to cause hurt, "
                "and hurt is actually caused. Punishment is generally addressed under IPC Section 323, subject to "
                "facts, exceptions, and related sections."
            )
        if "breach of contract" in q:
            return (
                "Under Indian law, breach of contract generally means one party fails to perform "
                "a promise that is enforceable under the Indian Contract Act, 1872. The non-breaching "
                "party may seek damages, specific performance in suitable cases, or other contractual remedies. "
                "Check the contract's notice, cure period, and dispute resolution clause first."
            )
        if "landlord" in q or "rental" in q or "lease" in q:
            return (
                "If a landlord breaches a rental agreement, the tenant's options usually depend on the lease terms "
                "and applicable rent-control/tenancy rules in the relevant state. Practical steps include issuing a "
                "written notice, documenting breach events, and using the dispute mechanism in the agreement."
            )
        if "terminate" in q and "employer" in q:
            return (
                "Whether an employer can terminate without notice depends on the employment contract, company policy, "
                "and applicable labour law framework. Many contracts permit termination only with notice/pay in lieu, "
                "except for defined misconduct. Review termination, notice, and severance terms carefully."
            )
        if "indemnity" in q:
            return (
                "An indemnity clause shifts financial risk from one party to another. In practice, you should verify "
                "scope (what claims are covered), cap (maximum exposure), exclusions, and claim procedure timelines."
            )
        if "liability" in q:
            return (
                "Liability clauses allocate risk for losses and damages. Key checks are liability cap, exclusions "
                "(indirect/consequential losses), and carve-outs (fraud, willful misconduct, IP infringement)."
            )
        if "arbitration" in q or "dispute" in q:
            return (
                "Dispute resolution clauses usually set forum, seat, governing law, and arbitration procedure. "
                "Ensure these are clear and mutually balanced to avoid expensive jurisdiction disputes later."
            )

        context_hint = ""
        sentences = [s for s in AIService._split_sentences(context) if len(s) > 30]
        if sentences:
            context_hint = f" Document hint: {sentences[0][:220]}."

        return (
            "Here is a practical Indian-law-focused review approach: identify parties and obligations, verify payment "
            "and termination triggers, check indemnity/liability exposure, and confirm governing law plus dispute forum."
            + context_hint
        )

    async def extract_clauses(self, text: str) -> list[dict]:
        sentences = self._split_sentences(text)
        clauses: list[dict] = []
        for clause_type, words in CLAUSE_KEYWORDS.items():
            hits = [s for s in sentences if any(w in s.lower() for w in words)]
            if hits:
                joined = ". ".join(hits[:2])
                clauses.append(
                    {
                        "clause_type": clause_type,
                        "content": joined,
                        "explanation": f"This is a {clause_type.replace('_', ' ')} clause in plain language.",
                        "risk_level": "medium",
                    }
                )
        return clauses

    async def detect_risks(self, clauses: Iterable[dict], full_text: str = "") -> list[dict]:
        corpus = full_text or ". ".join(c.get("content", "") for c in clauses)
        checks = [
            {
                "check": "one-sided termination",
                "clause_type": "termination",
                "severity": "high",
                "patterns": [r"terminate.*without notice", r"sole discretion", r"for any reason"],
                "why_risky": "Allows one party to end the contract unilaterally, creating business uncertainty.",
                "recommendation": "Require mutual termination rights, notice period, and cure opportunity.",
            },
            {
                "check": "unlimited liability",
                "clause_type": "liability",
                "severity": "high",
                "patterns": [r"unlimited liabilit", r"fully liable", r"indefinitely"],
                "why_risky": "Creates uncapped financial exposure that can be disproportionate to contract value.",
                "recommendation": "Cap liability to a reasonable amount, often linked to fees paid.",
            },
            {
                "check": "broad indemnity",
                "clause_type": "indemnity",
                "severity": "high",
                "patterns": [r"any and all claims", r"regardless of fault", r"hold harmless.*all"],
                "why_risky": "Transfers very broad risk to one party, including risks outside its control.",
                "recommendation": "Limit indemnity to third-party claims caused by breach, negligence, or misconduct.",
            },
            {
                "check": "unilateral amendments",
                "clause_type": "general",
                "severity": "high",
                "patterns": [r"may amend.*without consent", r"right to modify.*at any time"],
                "why_risky": "Permits one party to change obligations without negotiation.",
                "recommendation": "Require mutual written consent for material amendments.",
            },
            {
                "check": "auto-renewal",
                "clause_type": "renewal",
                "severity": "medium",
                "patterns": [r"automatically renew", r"auto.?renew", r"successive periods"],
                "why_risky": "Can lock parties into renewals if notice deadlines are missed.",
                "recommendation": "Add clear reminder/notice windows and explicit opt-out language.",
            },
            {
                "check": "hidden penalties",
                "clause_type": "payment",
                "severity": "medium",
                "patterns": [r"penalt", r"liquidated damages", r"deduct.*amount"],
                "why_risky": "May impose disproportionate monetary consequences with unclear triggers.",
                "recommendation": "Define objective triggers, caps, and reasonable calculation formula.",
            },
            {
                "check": "intellectual property overreach",
                "clause_type": "general",
                "severity": "high",
                "patterns": [r"all intellectual property", r"irrevocable assignment", r"perpetual rights"],
                "why_risky": "Can transfer more IP rights than necessary, including pre-existing IP.",
                "recommendation": "Limit assignment to deliverables created under this contract and preserve background IP.",
            },
            {
                "check": "unfair confidentiality duration",
                "clause_type": "confidentiality",
                "severity": "medium",
                "patterns": [r"confidentiality.*\b(2[0-9]|[3-9][0-9])\b", r"confidentiality.*indefinite"],
                "why_risky": "Excessively long confidentiality obligations can be impractical and one-sided.",
                "recommendation": "Use reasonable confidentiality period based on data sensitivity.",
            },
            {
                "check": "exclusivity/non-compete overreach",
                "clause_type": "general",
                "severity": "high",
                "patterns": [r"exclusive", r"non-?compete", r"shall not provide.*to any other"],
                "why_risky": "May unreasonably restrict business operations and market opportunities.",
                "recommendation": "Narrow scope, geography, and duration with clear commercial rationale.",
            },
            {
                "check": "governing law mismatch",
                "clause_type": "jurisdiction",
                "severity": "medium",
                "patterns": [r"governed.*laws of.*(usa|delaware|new york|england|singapore)"],
                "why_risky": "Cross-border governing law may increase enforcement complexity and legal costs.",
                "recommendation": "Choose a governing law and forum aligned with party operations and dispute strategy.",
            },
            {
                "check": "unfair dispute resolution",
                "clause_type": "arbitration",
                "severity": "medium",
                "patterns": [r"exclusive jurisdiction.*one party", r"venue.*solely determined"],
                "why_risky": "One-sided forum selection can increase burden and reduce fairness.",
                "recommendation": "Use neutral seat/forum and balanced procedural terms.",
            },
            {
                "check": "non-solicitation overreach",
                "clause_type": "general",
                "severity": "medium",
                "patterns": [r"non-?solicit.*\b(2[0-9]|[3-9][0-9])\b", r"non-?solicit.*all clients"],
                "why_risky": "Overbroad restrictions can harm legitimate business relationships.",
                "recommendation": "Limit non-solicit scope to relevant personnel/customers and reasonable duration.",
            },
        ]

        risks: list[dict] = []
        for check in checks:
            hits = self._find_matching_sentences(corpus, check["patterns"], limit=3)
            for hit in hits:
                risks.append(
                    {
                        "clause_type": check["clause_type"],
                        "severity": check["severity"],
                        "issue": check["check"],
                        "risky_text": hit,
                        "why_risky": check["why_risky"],
                        "recommendation": check["recommendation"],
                    }
                )

        if not risks:
            risks.append(
                {
                    "severity": "low",
                    "issue": "No major explicit red flags detected automatically.",
                    "risky_text": "",
                    "why_risky": "Automated checks did not find clear textual patterns.",
                    "recommendation": "Request lawyer review for enforceability and negotiation strategy.",
                    "clause_type": "general",
                }
            )
        return risks

    async def summarize_contract(self, text: str) -> dict:
        sentences = self._split_sentences(text)
        summary = " ".join(sentences[:4]) or "No text extracted."
        return {
            "plain_summary": summary,
            "obligations": [s for s in sentences if "shall" in s.lower()][:3],
            "deadlines": [s for s in sentences if "days" in s.lower()][:3],
            "payment_terms": [s for s in sentences if "payment" in s.lower()][:3],
            "termination_conditions": [s for s in sentences if "terminate" in s.lower()][:3],
            "key_risks": ["Potential one-sided obligations", "Review indemnity and liability caps"],
        }

    async def legal_chat(self, question: str, context: str) -> dict:
        self.logger.info(
            "Legal chat request received. Gemini enabled: %s",
            bool(settings.gemini_api_key),
        )
        has_context = bool(context.strip())
        if has_context:
            prompt = (
                "You are a legal assistant focused on Indian law. "
                "Provide concise educational guidance, not legal advice. "
                "Use uploaded context first. If context is insufficient, explicitly say so and then provide "
                "a general Indian-law explanation.\n\n"
                f"Uploaded Context:\n{context[:4000]}\n\nQuestion: {question}"
            )
        else:
            prompt = (
                "You are a legal assistant focused on Indian law. "
                "Provide concise educational guidance, not legal advice. "
                "No uploaded document context is available, so answer from general legal knowledge of Indian law "
                "in a practical plain-language way.\n\n"
                f"Question: {question}"
            )
        answer = await self._call_gemini(prompt)
        if not answer:
            answer = self._fallback_legal_chat_answer(question, context)
        return {
            "assistant_message": answer,
            "citations": [
                {
                    "source": "Uploaded document context" if has_context else "General Indian law guidance",
                    "excerpt": context[:220] if has_context else "No uploaded context provided for this query.",
                }
            ],
        }

    async def explain_clause(self, clause_type: str, content: str) -> dict:
        return {
            "meaning": f"This {clause_type} clause defines duties and rights between parties.",
            "risk_level": "medium",
            "practical_implications": "If breached, this clause can trigger penalties or disputes.",
            "better_alternative": "Use balanced, mutual obligations and clearly scoped remedies.",
            "content": content,
        }


ai_service = AIService()
