export type TrafficLight = "green" | "yellow" | "red";
export type EvidenceStatus = "proven" | "weak" | "missing" | "risky";

export type JobRequirement = {
  id: string;
  title: string;
  detail: string;
  weight: "high" | "medium" | "low";
};

export type ResumeClaim = {
  id: string;
  title: string;
  detail: string;
};

export type EvidenceGap = {
  id: string;
  requirementId: string;
  title: string;
  requirement: string;
  currentEvidence: string;
  missingEvidence: string;
  impact: "高影响" | "中影响" | "低影响";
  status: EvidenceStatus;
};

export type BestFix = {
  title: string;
  detail: string;
  evidenceText: string;
  relatedRequirementId: string;
};

export type AgentTrace = {
  id: string;
  agentName: string;
  displayName: string;
  status: "success" | "fallback" | "failed";
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  impactSummary: string;
  orderIndex: number;
};

export type EvidenceCard = {
  reportId: string;
  shareToken: string;
  version: number;
  targetRole: string;
  trafficLight: TrafficLight;
  score: number;
  provenPoints: string[];
  weakPoints: string[];
  nextAction: string;
  generatedAt: string;
  boundaryText: string;
};

export type CheckReport = {
  id: string;
  sessionId: string;
  ownerId: string;
  shareToken: string;
  role: "candidate" | "readonly";
  state: "draft" | "scanning" | "reviewed" | "evidence_added" | "card_refreshed" | "trace_opened" | "failed_fallback";
  createdAt: string;
  updatedAt: string;
  targetRole: string;
  jdText: string;
  resumeText: string;
  jdSourceUrl?: string;
  resumeFileName?: string;
  proofFileName?: string;
  inputSource?: "sample" | "paste" | "jd-url" | "resume-file" | "mixed";
  score: number;
  beforeScore?: number;
  afterScore?: number;
  scoreDelta?: number;
  trafficLight: TrafficLight;
  trafficLightLabel: string;
  scoreReason: string;
  requirements: JobRequirement[];
  claims: ResumeClaim[];
  gaps: EvidenceGap[];
  bestFix: BestFix;
  traces: AgentTrace[];
  card: EvidenceCard;
  evidenceText?: string;
  fallbackUsed: boolean;
  version: number;
};

export type CreateReportInput = {
  jdText?: string;
  resumeText?: string;
  jdSourceUrl?: string;
  resumeFileName?: string;
  proofFileName?: string;
  evidenceText?: string;
  inputSource?: "sample" | "paste" | "jd-url" | "resume-file" | "mixed";
  useSample?: boolean;
  sessionId?: string;
  ownerId?: string;
  role?: "candidate" | "readonly";
};

export type AddEvidenceInput = {
  evidenceText: string;
};
