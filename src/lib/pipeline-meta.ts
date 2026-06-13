// 客户端与服务端共用的智能体清单，保证扫描台和流水线是同一套定义。
export type AgentMeta = {
  key: string;
  name: string;
  displayName: string;
  role: string;
};

export const PIPELINE_AGENTS: AgentMeta[] = [
  { key: "jd", name: "JdParserAgent", displayName: "岗位解析智能体", role: "把岗位 JD 拆成可对齐的要求和证据偏好" },
  { key: "claim", name: "ResumeClaimAgent", displayName: "简历声明智能体", role: "抽取简历声明并对齐到对应岗位要求" },
  { key: "bind", name: "EvidenceBindingAgent", displayName: "证据绑定智能体", role: "把证明材料片段绑定到声明并判断匹配强度" },
  { key: "gap", name: "GapVerifierAgent", displayName: "缺口核验智能体", role: "判定每条要求的证据状态和判断置信度" },
  { key: "recruiter", name: "RecruiterTwinAgent", displayName: "招聘官分身智能体", role: "模拟招聘官第一眼判断并生成追问清单" },
  { key: "action", name: "ActionAgent", displayName: "行动建议智能体", role: "锁定唯一最高杠杆的补证据动作" }
];

// 扫描台用的短标签（节奏更紧凑）。
export const AGENT_SHORT_LABELS: Record<string, string> = {
  jd: "解析岗位",
  claim: "抽取声明",
  bind: "绑定证据",
  gap: "核验缺口",
  recruiter: "招聘官分身",
  action: "生成建议"
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
