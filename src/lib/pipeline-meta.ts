// 客户端与服务端共用的智能体清单，保证扫描台和流水线是同一套定义。
export type AgentMeta = {
  key: string;
  name: string;
  displayName: string;
  role: string;
};

export const PIPELINE_AGENTS: AgentMeta[] = [
  { key: "jd", name: "JdParserAgent", displayName: "岗位解析智能体", role: "识别岗位中的关键要求" },
  { key: "claim", name: "ResumeClaimAgent", displayName: "简历声明智能体", role: "提取简历中的核心经历" },
  { key: "bind", name: "EvidenceBindingAgent", displayName: "证据绑定智能体", role: "检查经历是否有材料支撑" },
  { key: "gap", name: "GapVerifierAgent", displayName: "缺口核验智能体", role: "标出缺少支撑的匹配点" },
  { key: "recruiter", name: "RecruiterTwinAgent", displayName: "招聘官视角智能体", role: "评估招聘官可能关注的问题" },
  { key: "action", name: "ActionAgent", displayName: "行动建议智能体", role: "给出是否投递与优化建议" }
];

// 扫描台用的短标签（节奏更紧凑）。
export const AGENT_SHORT_LABELS: Record<string, string> = {
  jd: "拆解岗位要求",
  claim: "提取简历经历",
  bind: "匹配证明材料",
  gap: "发现证据缺口",
  recruiter: "招聘官视角",
  action: "生成投递建议"
};

// 规则兜底类引擎标签（非真实模型，照原样展示）。
const RULE_ENGINE_LABELS = new Set(["规则兜底", "无材料·跳过模型"]);

// 对外统一把具体厂商模型名收敛成「AI Thinking」，只有规则兜底标签保持原样。
export function displayEngine(engine?: string | null): string {
  if (!engine) return "";
  if (RULE_ENGINE_LABELS.has(engine) || engine.includes("兜底") || engine.includes("跳过")) {
    return engine;
  }
  return "AI Thinking";
}
