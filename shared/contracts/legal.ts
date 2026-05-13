export const clauseTypes = [
  "payment",
  "termination",
  "liability",
  "indemnity",
  "arbitration",
  "confidentiality",
  "renewal",
  "jurisdiction",
  "force_majeure",
] as const;

export type ClauseType = (typeof clauseTypes)[number];
export type RiskSeverity = "low" | "medium" | "high";
