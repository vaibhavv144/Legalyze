from collections.abc import Iterable
import json
import logging
import asyncio
import re

import httpx

from app.core.config import settings

VALID_SEVERITY = {"low", "medium", "high", "critical"}
SEVERITY_SCORE = {"low": 20, "medium": 50, "high": 80, "critical": 100}

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

    async def _call_gemini_json(self, prompt: str) -> dict | None:
        """Call Gemini in JSON mode and return a parsed dict, or None on failure."""
        if not settings.gemini_api_key:
            self.logger.warning("Gemini API key missing; using fallback analysis.")
            return None
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2},
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            for attempt in range(2):
                try:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        self.logger.warning("Gemini returned no candidates; using fallback.")
                        return None
                    raw = candidates[0]["content"]["parts"][0].get("text", "")
                    return self._parse_json_block(raw)
                except httpx.HTTPStatusError as exc:
                    status_code = exc.response.status_code
                    self.logger.warning(
                        "Gemini analysis HTTP error %s on attempt %s; model=%s",
                        status_code,
                        attempt + 1,
                        settings.gemini_model,
                    )
                    if status_code in {429, 500, 502, 503, 504} and attempt == 0:
                        await asyncio.sleep(0.8)
                        continue
                    return None
                except Exception as exc:
                    self.logger.warning("Gemini analysis failed (%s); using fallback.", str(exc))
                    return None
        return None

    @staticmethod
    def _parse_json_block(raw: str) -> dict | None:
        """Parse a JSON object from model output, tolerating markdown code fences."""
        if not raw:
            return None
        text = raw.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            start, end = text.find("{"), text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    parsed = json.loads(text[start : end + 1])
                    return parsed if isinstance(parsed, dict) else None
                except json.JSONDecodeError:
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

    @staticmethod
    def _norm_severity(value: object, default: str = "medium") -> str:
        v = str(value or "").strip().lower()
        if v in {"moderate"}:
            return "medium"
        return v if v in VALID_SEVERITY else default

    @staticmethod
    def _as_str_list(value: object, limit: int = 8) -> list[str]:
        if isinstance(value, list):
            return [str(x).strip() for x in value if str(x).strip()][:limit]
        if isinstance(value, str) and value.strip():
            return [value.strip()]
        return []

    def _build_analysis_prompt(self, text: str) -> str:
        return (
            "You are an expert contract review and risk-assessment engine specialised in INDIAN law "
            "(Indian Contract Act 1872, and other applicable Indian statutes such as labour, IT/data, "
            "stamp, and arbitration laws). Identify, classify, and explain contractual obligations, "
            "rights, restrictions, liabilities, and risks.\n\n"
            "PRINCIPLES:\n"
            "- Analyse every clause, schedule, and annexure. Do not assume a clause is safe just because "
            "it is common. Evaluate the actual language, not just headings.\n"
            "- Treat every clause as a potential source of risk; if a clause has multiple risks, list each "
            "separately. Continue until the whole document is reviewed.\n"
            "- Review for financial, liability, termination, employment, intellectual-property, "
            "privacy/data, operational, legal/regulatory, and renewal/duration risks, and overall fairness.\n"
            "- Ground reasoning in Indian law where relevant. Provide educational guidance, not formal legal advice.\n\n"
            "SEVERITY: use only one of low | medium | high | critical.\n"
            "  low = minor administrative/operational risk.\n"
            "  medium = noticeable legal/operational/financial risk.\n"
            "  high = significant legal/financial/privacy/employment/liability exposure.\n"
            "  critical = could cause major loss, loss of rights, regulatory exposure, litigation, "
            "ownership transfer, or unlimited liability.\n\n"
            "Return ONLY a valid JSON object with EXACTLY this shape (no markdown, no commentary):\n"
            "{\n"
            '  "contract_type": "short label, e.g. Employment Agreement",\n'
            '  "overall_risk_level": "low | moderate | high | critical",\n'
            '  "summary": {\n'
            '    "plain_summary": "2-4 sentence plain-language overview",\n'
            '    "obligations": ["key obligations"],\n'
            '    "deadlines": ["time-bound duties / notice periods"],\n'
            '    "payment_terms": ["payment / fee terms"],\n'
            '    "termination_conditions": ["termination triggers"],\n'
            '    "key_risks": ["the most important risks in plain language"]\n'
            "  },\n"
            '  "clauses": [\n'
            '    {"clause_type": "snake_case type e.g. termination, indemnity, non_compete, data_privacy",\n'
            '     "content": "the actual clause text or close paraphrase",\n'
            '     "explanation": "plain-language meaning under Indian law",\n'
            '     "risk_level": "low | medium | high | critical"}\n'
            "  ],\n"
            '  "risks": [\n'
            '    {"clause_type": "snake_case type",\n'
            '     "severity": "low | medium | high | critical",\n'
            '     "issue": "short risk title",\n'
            '     "risky_text": "the specific risky wording",\n'
            '     "why_risky": "why this is a risk (cite Indian-law angle if relevant)",\n'
            '     "recommendation": "safer alternative wording / action"}\n'
            "  ]\n"
            "}\n\n"
            "If the document has no extractable text, return empty arrays and say so in plain_summary.\n\n"
            f"CONTRACT TEXT:\n{text[:14000]}"
        )

    def _normalize_analysis(self, data: dict) -> dict:
        raw_summary = data.get("summary") if isinstance(data.get("summary"), dict) else {}
        summary = {
            "plain_summary": str(raw_summary.get("plain_summary") or "No summary generated.").strip(),
            "obligations": self._as_str_list(raw_summary.get("obligations")),
            "deadlines": self._as_str_list(raw_summary.get("deadlines")),
            "payment_terms": self._as_str_list(raw_summary.get("payment_terms")),
            "termination_conditions": self._as_str_list(raw_summary.get("termination_conditions")),
            "key_risks": self._as_str_list(raw_summary.get("key_risks")),
        }

        clauses: list[dict] = []
        for c in data.get("clauses", []) if isinstance(data.get("clauses"), list) else []:
            if not isinstance(c, dict):
                continue
            content = str(c.get("content") or "").strip()
            if not content:
                continue
            ctype = str(c.get("clause_type") or "general").strip().lower().replace(" ", "_") or "general"
            clauses.append(
                {
                    "clause_type": ctype,
                    "content": content[:2000],
                    "explanation": str(c.get("explanation") or "").strip()[:1500]
                    or f"This is a {ctype.replace('_', ' ')} clause.",
                    "risk_level": self._norm_severity(c.get("risk_level")),
                }
            )

        risks: list[dict] = []
        for r in data.get("risks", []) if isinstance(data.get("risks"), list) else []:
            if not isinstance(r, dict):
                continue
            issue = str(r.get("issue") or "").strip()
            if not issue:
                continue
            ctype = str(r.get("clause_type") or "general").strip().lower().replace(" ", "_") or "general"
            risks.append(
                {
                    "clause_type": ctype,
                    "severity": self._norm_severity(r.get("severity")),
                    "issue": issue[:300],
                    "risky_text": str(r.get("risky_text") or "").strip()[:2000],
                    "why_risky": str(r.get("why_risky") or issue).strip()[:1500],
                    "recommendation": str(r.get("recommendation") or "Seek legal review.").strip()[:1500],
                }
            )

        contract_type = str(data.get("contract_type") or "").strip() or None
        overall = self._norm_severity(data.get("overall_risk_level"), default="") or None
        return {
            "contract_type": contract_type,
            "overall_risk_level": overall,
            "summary": summary,
            "clauses": clauses,
            "risks": risks,
        }

    async def analyze_contract(self, text: str) -> dict:
        """AI-driven contract analysis with graceful fallback to rule-based heuristics."""
        self.logger.info("Contract analysis requested. Gemini enabled: %s", bool(settings.gemini_api_key))
        if text and text.strip():
            parsed = await self._call_gemini_json(self._build_analysis_prompt(text))
            if parsed is not None:
                result = self._normalize_analysis(parsed)
                if result["clauses"] or result["risks"] or result["summary"]["plain_summary"]:
                    return result
            self.logger.warning("Falling back to rule-based contract analysis.")

        clauses = await self.extract_clauses(text)
        risks = await self.detect_risks(clauses, text)
        summary = await self.summarize_contract(text)
        return {
            "contract_type": None,
            "overall_risk_level": None,
            "summary": summary,
            "clauses": clauses,
            "risks": risks,
        }

    async def legal_chat(self, question: str, context: str) -> dict:
        self.logger.info(
            "Legal chat request received. Gemini enabled: %s",
            bool(settings.gemini_api_key),
        )
        has_context = bool(context.strip())
        scope_rules = (
            "You are Legalyze, a legal assistant. You must ONLY answer questions that are about "
            "(a) the uploaded document context provided below, or (b) Indian law specifically "
            "(statutes, acts, sections, case law, legal procedure, contracts, legal rights, and "
            "obligations under Indian law).\n"
            "Being merely about India is NOT enough. You MUST refuse general-knowledge questions about "
            "India that are not legal, such as its capital, geography, history, population, politics, "
            "economy, culture, sports, or famous people.\n"
            "You MUST also refuse any other unrelated topic (chit-chat, coding, math, cooking, current "
            "events, the law of other countries, etc.).\n"
            "When you refuse, reply with exactly this sentence and nothing else: "
            "\"I can only help with questions about your uploaded document or Indian law. Please ask "
            "something related to those.\"\n"
            "Examples of questions you MUST refuse: \"What is the capital of India?\", \"Who is the PM "
            "of India?\", \"Write me a poem.\", \"What is 2+2?\".\n"
            "Examples of questions you may answer: \"What is Section 138 of the Negotiable Instruments "
            "Act?\", \"What are my rights as a tenant under Indian law?\", \"Explain the indemnity "
            "clause in my uploaded contract.\"\n"
            "Do not invent facts. Provide concise educational guidance, not formal legal advice.\n\n"
        )
        if has_context:
            prompt = (
                scope_rules
                + "Use the uploaded context first. If the context is insufficient to answer a valid "
                "Indian-law question, say so explicitly and then give a general Indian-law explanation.\n\n"
                f"Uploaded Context:\n{context[:4000]}\n\nQuestion: {question}"
            )
        else:
            prompt = (
                scope_rules
                + "No uploaded document context is available, so for valid questions answer from general "
                "knowledge of Indian law in a practical, plain-language way.\n\n"
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
