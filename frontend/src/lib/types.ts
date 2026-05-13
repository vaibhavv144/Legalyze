export type RiskSeverity = "low" | "medium" | "high";
export type AnalysisStatus = "uploaded" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  file_name: string;
  file_type: string;
  analysis_status: AnalysisStatus;
  risk_score?: number | null;
  created_at: string;
}
