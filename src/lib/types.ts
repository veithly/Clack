export type TrafficLight = "green" | "yellow" | "red";
export type EvidenceStatus = "proven" | "weak" | "missing" | "risky";

export type JobRequirement = {
  id: string;
  title: string;
  detail: string;
  weight: "high" | "medium" | "low";
  /** 这条要求最看重的可展示证据类型，例如“样本量、转化率”。 */
  evidencePreference?: string;
};

export type ResumeClaim = {
  id: string;
  title: string;
  detail: string;
  /** 这条声明对应的岗位要求 id，让“声明→要求”可追溯。 */
  requirementId?: string;
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
  /** 该状态判定的置信度（0-100），让“红黄绿”不再是黑箱。 */
  confidence?: number;
};

/** 证据材料与简历声明的绑定关系——“哪一段材料支撑哪一条声明”。 */
export type EvidenceMatch = "direct" | "partial" | "none";

export type EvidenceBinding = {
  id: string;
  claimId: string;
  claimTitle: string;
  /** 从证明材料里抽出的、最能支撑该声明的引用片段。 */
  evidenceQuote: string;
  match: EvidenceMatch;
  confidence: number;
  note: string;
};

/** 招聘官分身：第一眼判断 + 追问清单，但不替企业做录用决定。 */
export type RecruiterVerdict = {
  headline: string;
  stance: "advance" | "hold" | "pass";
  confidence: number;
  strengths: string[];
  concerns: string[];
  interviewQuestions: string[];
  boundary: string;
};

export type BestFix = {
  title: string;
  detail: string;
  evidenceText: string;
  relatedRequirementId: string;
};

export type AgentStatus = "success" | "fallback" | "failed";

export type AgentTrace = {
  id: string;
  agentName: string;
  displayName: string;
  status: AgentStatus;
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  impactSummary: string;
  orderIndex: number;
  /** 这个智能体在流水线里负责的一句话职责。 */
  role?: string;
  /** 本步判断的置信度（0-100）。 */
  confidence?: number;
  /** 实际驱动这步的引擎：模型名或“规则兜底”。 */
  engine?: string;
  /** 1-3 条具体产出，证明这步真的算过东西。 */
  findings?: string[];
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
  /** 整份判断的综合置信度（0-100）。 */
  confidence?: number;
  /** 招聘官分身给出的第一眼判断和追问清单。 */
  recruiterVerdict?: RecruiterVerdict;
  /** 证明材料与简历声明的绑定结果。 */
  evidenceBindings?: EvidenceBinding[];
  /** 这次分析的“真实度”：全模型 / 模型+规则混合 / 纯规则兜底。 */
  pipelineDepth?: "ai" | "hybrid" | "fallback";
  /** 是否为“离线稳定版”报告：强制规则路径与固定分数，断网也能演示。 */
  offlineDemo?: boolean;
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
  /** “离线稳定版”：强制规则路径 + 固定分数，用于断网演示兜底。 */
  offline?: boolean;
  sessionId?: string;
  ownerId?: string;
  role?: "candidate" | "readonly";
};

export type AddEvidenceInput = {
  evidenceText: string;
};
