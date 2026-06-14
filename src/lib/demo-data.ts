import type { EvidenceStatus } from "./types";

export type EvidenceArtifactDemo = {
  id: string;
  type: "简历" | "项目" | "实习" | "作品" | "证书" | "推荐";
  title: string;
  source: string;
  visibility: "私密" | "对企业可见" | "对高校导师可见" | "公开链接可见";
  status: "已解析" | "待确认" | "解析失败";
  claims: number;
  evidenceLinks: number;
  updatedAt: string;
};

export type RecentJobDemo = {
  id: string;
  role: string;
  company: string;
  readiness: number;
  light: "green" | "yellow" | "red";
  gaps: number;
  updatedAt: string;
};

export type ReviewCandidateDemo = {
  id: string;
  candidate: string;
  role: string;
  submittedAt: string;
  readiness: number;
  gaps: number;
  reviewPoints: number;
  status: "待人工复核" | "需补证据" | "证据充分" | "无法判断";
};

export type StudentReadinessDemo = {
  id: string;
  target: string;
  readiness: number;
  gap: string;
  updatedAt: string;
  mentorState: "待跟进" | "已提醒" | "稳定推进";
};

export type HeatCellDemo = {
  role: string;
  project: number;
  internship: number;
  portfolio: number;
  certificate: number;
  outcome: number;
};

export const evidenceArtifacts: EvidenceArtifactDemo[] = [
  {
    id: "ev-001",
    type: "项目",
    title: "校园活动报名页优化复盘",
    source: "Notion 项目复盘",
    visibility: "对企业可见",
    status: "已解析",
    claims: 3,
    evidenceLinks: 5,
    updatedAt: "今天 09:42"
  },
  {
    id: "ev-002",
    type: "简历",
    title: "产品运营实习简历 v3",
    source: "PDF 简历",
    visibility: "私密",
    status: "已解析",
    claims: 8,
    evidenceLinks: 6,
    updatedAt: "昨天 18:20"
  },
  {
    id: "ev-003",
    type: "作品",
    title: "用户调研报告截图",
    source: "图片上传",
    visibility: "对高校导师可见",
    status: "待确认",
    claims: 2,
    evidenceLinks: 2,
    updatedAt: "2 天前"
  }
];

export const recentJobs: RecentJobDemo[] = [
  { id: "job-1", role: "产品运营实习生", company: "星桥科技", readiness: 78, light: "green", gaps: 1, updatedAt: "刚刚" },
  { id: "job-2", role: "数据分析实习生", company: "云策增长", readiness: 62, light: "yellow", gaps: 2, updatedAt: "今天 11:10" },
  { id: "job-3", role: "用户研究助理", company: "橙屿互娱", readiness: 43, light: "red", gaps: 4, updatedAt: "昨天 21:08" }
];

export const reviewCandidates: ReviewCandidateDemo[] = [
  { id: "C-2048", candidate: "候选人 A", role: "产品运营实习生", submittedAt: "10:16", readiness: 78, gaps: 1, reviewPoints: 2, status: "待人工复核" },
  { id: "C-2049", candidate: "候选人 B", role: "数据分析实习生", submittedAt: "10:22", readiness: 64, gaps: 2, reviewPoints: 4, status: "需补证据" },
  { id: "C-2050", candidate: "候选人 C", role: "内容运营实习生", submittedAt: "10:31", readiness: 82, gaps: 0, reviewPoints: 1, status: "证据充分" },
  { id: "C-2051", candidate: "候选人 D", role: "用户研究助理", submittedAt: "10:39", readiness: 48, gaps: 3, reviewPoints: 5, status: "无法判断" }
];

export const studentReadiness: StudentReadinessDemo[] = [
  { id: "S-1021", target: "产品运营", readiness: 72, gap: "项目结果指标", updatedAt: "今天", mentorState: "待跟进" },
  { id: "S-1022", target: "数据分析", readiness: 58, gap: "数据作品链接", updatedAt: "昨天", mentorState: "已提醒" },
  { id: "S-1023", target: "前端开发", readiness: 81, gap: "线上项目说明", updatedAt: "今天", mentorState: "稳定推进" },
  { id: "S-1024", target: "用户研究", readiness: 46, gap: "调研样本和方法", updatedAt: "3 天前", mentorState: "待跟进" }
];

export const heatCells: HeatCellDemo[] = [
  { role: "产品运营", project: 22, internship: 34, portfolio: 41, certificate: 18, outcome: 47 },
  { role: "数据分析", project: 18, internship: 29, portfolio: 52, certificate: 16, outcome: 39 },
  { role: "前端开发", project: 14, internship: 38, portfolio: 24, certificate: 9, outcome: 31 },
  { role: "用户研究", project: 31, internship: 42, portfolio: 45, certificate: 12, outcome: 36 }
];

// ---------------------------------------------------------------------------
// 候选人证据包：企业复核员看到的「同一条证据链」的只读视图
// 复用候选人端 6 智能体流水线的结构，企业只能人工复核，不做自动淘汰。
// ---------------------------------------------------------------------------

export type PackageAgentStep = {
  key: "jd" | "claim" | "bind" | "gap" | "recruiter" | "action";
  name: string;
  finding: string;
  confidence: number;
  status: "success" | "fallback";
};

export type PackageMatrixRow = {
  requirement: string;
  weight: "high" | "medium" | "low";
  claim: string;
  evidence: string;
  status: EvidenceStatus;
  detail: string;
};

export type PackageBinding = {
  claim: string;
  quote: string;
  match: "direct" | "partial" | "none";
  confidence: number;
  note: string;
};

export type PackageGap = {
  title: string;
  impact: "高影响" | "中影响" | "低影响";
  missing: string;
  status: EvidenceStatus;
};

export type ReviewLogEntry = { at: string; actor: string; action: string };

export type CandidateEvidencePackage = {
  authorizedScope: string;
  authorizedAt: string;
  trafficLight: "green" | "yellow" | "red";
  stance: "advance" | "hold" | "pass";
  confidence: number;
  recruiterHeadline: string;
  strengths: string[];
  concerns: string[];
  interviewQuestions: string[];
  agentRun: PackageAgentStep[];
  matrix: PackageMatrixRow[];
  bindings: PackageBinding[];
  gaps: PackageGap[];
  reviewLog: ReviewLogEntry[];
};

export const candidatePackages: Record<string, CandidateEvidencePackage> = {
  "C-2048": {
    authorizedScope: "产品运营岗位只读证据卡（含调研与转化率证据）",
    authorizedAt: "今天 10:16",
    trafficLight: "green",
    stance: "advance",
    confidence: 86,
    recruiterHeadline: "初步判断：方向匹配，可进入面试复核；重点追问转化率口径与个人贡献",
    strengths: ["用户调研有真实样本量（86 人）", "活动转化率有前后对比数据", "报名页优化动作链路清晰"],
    concerns: ["跨团队协作只有描述，缺个人动作", "转化率统计口径需现场确认"],
    interviewQuestions: [
      "转化率 21%→39% 的统计口径与时间周期是什么？",
      "报名页具体改了哪几处，为什么这么改？",
      "协作项目里哪一段是你独立负责的？"
    ],
    agentRun: [
      { key: "jd", name: "岗位要求解析", finding: "拆出 5 条要求，2 条高重要性：用户调研、用数据复盘活动效果", confidence: 92, status: "success" },
      { key: "claim", name: "简历经历提取", finding: "提取 7 条经历，6 条对齐到对应岗位要求", confidence: 88, status: "success" },
      { key: "bind", name: "证据匹配", finding: "3 条经历有直接材料引用，1 条仅部分支撑", confidence: 84, status: "success" },
      { key: "gap", name: "证据缺口核验", finding: "5 条要求中 4 条已证实，1 条（跨团队协作）证据弱", confidence: 81, status: "success" },
      { key: "recruiter", name: "面试关注点生成", finding: "建议进入面试复核，重点追问转化率口径与个人贡献", confidence: 86, status: "success" },
      { key: "action", name: "补证建议生成", finding: "锁定一个最高收益动作：补『跨团队协作』个人动作说明", confidence: 90, status: "success" }
    ],
    matrix: [
      { requirement: "用户调研能力", weight: "high", claim: "负责问卷调研与流失分析", evidence: "调研 86 人样本 + 2 个流失点结论", status: "proven", detail: "岗位要求参与用户调研；已有样本量与可复述结论。" },
      { requirement: "用数据复盘活动效果", weight: "high", claim: "用数据评估活动转化", evidence: "转化率 21%→39% 截图", status: "proven", detail: "岗位要求用数据说明转化变化；已有前后对比。" },
      { requirement: "校园活动运营执行", weight: "medium", claim: "负责报名与宣传", evidence: "报名页优化记录", status: "proven", detail: "岗位要求活动策划执行；已有具体动作记录。" },
      { requirement: "跨团队协作", weight: "medium", claim: "与设计、内容同学协作", evidence: "仅文字描述，无个人动作", status: "weak", detail: "仍需：说明你在协作中的具体职责与产出。" },
      { requirement: "产品体验分析", weight: "low", claim: "完成体验分析课程项目", evidence: "课程项目说明", status: "weak", detail: "仍需：补充分析方法与可展示结论。" }
    ],
    bindings: [
      { claim: "负责报名页优化", quote: "调整页面说明后报名转化率从 21% 提升到 39%", match: "direct", confidence: 91, note: "有明确指标变化，可现场追问口径" },
      { claim: "具备用户调研能力", quote: "调研 86 名同学，发现 2 个主要流失点", match: "direct", confidence: 89, note: "样本量与结论齐全" },
      { claim: "跨团队推进项目", quote: "与设计、内容同学协作推进", match: "partial", confidence: 58, note: "缺少个人具体动作，建议补证据" }
    ],
    gaps: [
      { title: "跨团队协作的个人动作", impact: "中影响", missing: "你主导的协作环节与可衡量产出", status: "weak" },
      { title: "产品体验分析深度", impact: "低影响", missing: "分析方法、对比与结论", status: "weak" }
    ],
    reviewLog: [{ at: "10:16", actor: "系统", action: "生成岗位匹配证据完成度 78，等待人工复核" }]
  },
  "C-2049": {
    authorizedScope: "数据分析岗位只读证据卡（作品链接待补）",
    authorizedAt: "今天 10:22",
    trafficLight: "yellow",
    stance: "hold",
    confidence: 76,
    recruiterHeadline: "初步判断：基础匹配，但缺可验证的数据作品；建议先补证据再约面",
    strengths: ["能给出业务向的数据结论", "工具栈（Excel/Python）覆盖基础需求"],
    concerns: ["没有可访问的数据可视化作品", "SQL 取数仅停留在课程描述"],
    interviewQuestions: [
      "有没有一个可以打开看的看板或报告？",
      "课程项目里你写过哪些查询，解决了什么问题？",
      "如果给你一份脏数据，你的清洗流程是什么？"
    ],
    agentRun: [
      { key: "jd", name: "岗位要求解析", finding: "拆出 6 条要求，高重要性：SQL 取数、数据可视化、业务结论", confidence: 90, status: "success" },
      { key: "claim", name: "简历经历提取", finding: "提取 6 条经历，4 条对齐到岗位要求", confidence: 83, status: "success" },
      { key: "bind", name: "证据匹配", finding: "1 条直接支撑，2 条部分支撑，数据作品链接缺失", confidence: 72, status: "success" },
      { key: "gap", name: "证据缺口核验", finding: "6 条要求中 3 条证实、2 条弱、1 条缺证据", confidence: 76, status: "success" },
      { key: "recruiter", name: "面试关注点生成", finding: "方向匹配，先补一个可公开访问的数据作品再约面", confidence: 79, status: "success" },
      { key: "action", name: "补证建议生成", finding: "锁定动作：补一个可公开访问的数据分析作品链接", confidence: 88, status: "success" }
    ],
    matrix: [
      { requirement: "SQL 取数与清洗", weight: "high", claim: "熟悉 SQL 基础查询", evidence: "课程作业描述", status: "weak", detail: "仍需：线上可见或可复述的真实取数案例。" },
      { requirement: "数据可视化", weight: "high", claim: "会用图表表达结论", evidence: "无作品链接", status: "missing", detail: "仍需：公开看板或报告链接。" },
      { requirement: "业务结论输出", weight: "medium", claim: "能给出业务建议", evidence: "课程项目 3 条增长建议", status: "proven", detail: "已有可复述的业务结论。" },
      { requirement: "A/B 实验理解", weight: "medium", claim: "了解实验设计", evidence: "文字描述", status: "weak", detail: "仍需：实验设计与读数细节。" },
      { requirement: "工具熟练度", weight: "low", claim: "熟悉 Excel / Python", evidence: "简历自述 + 课程项目", status: "proven", detail: "工具栈基本满足初级岗位。" }
    ],
    bindings: [
      { claim: "数据可视化能力", quote: "（未找到可引用的作品材料）", match: "none", confidence: 30, note: "缺作品链接，建议候选人补充" },
      { claim: "业务结论输出", quote: "基于课程数据给出 3 条增长建议", match: "partial", confidence: 64, note: "结论存在，缺过程数据支撑" }
    ],
    gaps: [
      { title: "可访问的数据作品", impact: "高影响", missing: "公开看板 / 报告链接", status: "missing" },
      { title: "SQL 取数实例", impact: "中影响", missing: "真实取数场景与结果", status: "weak" },
      { title: "A/B 实验经历", impact: "中影响", missing: "实验设计与读数", status: "weak" }
    ],
    reviewLog: [
      { at: "10:22", actor: "系统", action: "生成岗位匹配证据完成度 64" },
      { at: "10:25", actor: "周晨", action: "已发送补证据请求：补一个可访问的数据作品链接" }
    ]
  },
  "C-2050": {
    authorizedScope: "内容运营岗位只读证据卡（含增长数据与爆款复盘）",
    authorizedAt: "今天 10:31",
    trafficLight: "green",
    stance: "advance",
    confidence: 90,
    recruiterHeadline: "初步判断：证据充分，可进入面试复核；重点追问增长归因",
    strengths: ["账号从 0 做到 1.2w 粉丝，有过程数据", "单篇 10w+ 阅读爆款有完整复盘", "跨平台分发与社群运营都有材料"],
    concerns: ["增长归因里平台红利与个人动作需区分"],
    interviewQuestions: [
      "1.2w 粉丝里，哪几篇内容贡献最大？",
      "那篇 10w+ 是怎么复盘的，可复制吗？",
      "社群运营的留存数据是多少？"
    ],
    agentRun: [
      { key: "jd", name: "岗位要求解析", finding: "拆出 5 条要求，高重要性：选题策划、数据增长", confidence: 91, status: "success" },
      { key: "claim", name: "简历经历提取", finding: "提取 8 条经历，全部对齐到岗位要求", confidence: 90, status: "success" },
      { key: "bind", name: "证据匹配", finding: "5 条核心经历均有直接材料引用", confidence: 89, status: "success" },
      { key: "gap", name: "证据缺口核验", finding: "5 条要求全部证实，无关键缺口", confidence: 88, status: "success" },
      { key: "recruiter", name: "面试关注点生成", finding: "证据充分，可进入面试复核，追问增长归因", confidence: 90, status: "success" },
      { key: "action", name: "补证建议生成", finding: "锁定动作：把证据同步写回简历项目经历", confidence: 86, status: "success" }
    ],
    matrix: [
      { requirement: "选题与内容策划", weight: "high", claim: "独立负责账号选题", evidence: "选题表 + 30 篇内容记录", status: "proven", detail: "有完整选题与产出记录。" },
      { requirement: "数据增长", weight: "high", claim: "账号从 0 做到 1.2w", evidence: "粉丝增长曲线截图", status: "proven", detail: "有过程数据，可现场追问归因。" },
      { requirement: "爆款复盘", weight: "medium", claim: "产出 10w+ 阅读内容", evidence: "爆款复盘文档", status: "proven", detail: "复盘可复用，方法清晰。" },
      { requirement: "跨平台分发", weight: "medium", claim: "多平台同步运营", evidence: "三平台数据对比", status: "proven", detail: "分发策略有数据支撑。" },
      { requirement: "社群运营", weight: "low", claim: "维护核心用户社群", evidence: "社群活跃度记录", status: "proven", detail: "社群运营有留存数据。" }
    ],
    bindings: [
      { claim: "账号增长能力", quote: "三个月把账号从 0 做到 1.2 万粉丝", match: "direct", confidence: 92, note: "有增长曲线截图" },
      { claim: "爆款内容能力", quote: "其中一篇内容阅读量达到 12.8 万", match: "direct", confidence: 90, note: "有平台后台截图与复盘" }
    ],
    gaps: [],
    reviewLog: [
      { at: "10:31", actor: "系统", action: "生成岗位匹配证据完成度 82" },
      { at: "10:34", actor: "周晨", action: "标记为证据充分，进入面试排期" }
    ]
  },
  "C-2051": {
    authorizedScope: "用户研究岗位只读证据卡（研究材料待补）",
    authorizedAt: "今天 10:39",
    trafficLight: "red",
    stance: "pass",
    confidence: 66,
    recruiterHeadline: "初步判断：方向相关但证据不足，暂无法判断；建议补研究报告",
    strengths: ["对用户研究方向有明确兴趣", "修过研究方法相关课程"],
    concerns: ["材料多为课堂作业，缺真实研究", "没有样本规模与抽样说明", "结论缺少落地动作"],
    interviewQuestions: [
      "你做过最完整的一次用户研究是什么？",
      "样本怎么选的，多少人？",
      "研究结论最后被谁用了，怎么用的？"
    ],
    agentRun: [
      { key: "jd", name: "岗位要求解析", finding: "拆出 5 条要求，高重要性：研究方法、样本设计", confidence: 89, status: "success" },
      { key: "claim", name: "简历经历提取", finding: "提取 5 条经历，仅 2 条对齐到岗位要求", confidence: 75, status: "success" },
      { key: "bind", name: "证据匹配", finding: "0 条直接支撑，材料多为课堂作业", confidence: 60, status: "fallback" },
      { key: "gap", name: "证据缺口核验", finding: "5 条要求中 1 条证实、2 条弱、2 条缺证据", confidence: 70, status: "success" },
      { key: "recruiter", name: "面试关注点生成", finding: "信息不足以判断，需补研究方法与样本", confidence: 66, status: "success" },
      { key: "action", name: "补证建议生成", finding: "锁定动作：补一份完整用户研究报告（方法+样本+结论）", confidence: 84, status: "success" }
    ],
    matrix: [
      { requirement: "研究方法掌握", weight: "high", claim: "学过用户研究方法", evidence: "课程作业", status: "weak", detail: "仍需：在真实项目中应用方法的证据。" },
      { requirement: "样本设计与抽样", weight: "high", claim: "了解抽样概念", evidence: "无具体样本说明", status: "missing", detail: "仍需：样本规模、抽样方式与偏差控制。" },
      { requirement: "访谈与问卷执行", weight: "medium", claim: "做过课堂访谈", evidence: "课堂练习记录", status: "weak", detail: "仍需：真实访谈记录与发现。" },
      { requirement: "研究结论落地", weight: "medium", claim: "能写研究结论", evidence: "无落地记录", status: "missing", detail: "仍需：结论被采纳或落地的证据。" },
      { requirement: "工具与报告", weight: "low", claim: "会写研究报告", evidence: "课程报告", status: "weak", detail: "仍需：结构完整的研究报告样本。" }
    ],
    bindings: [
      { claim: "用户研究方法掌握", quote: "在《用户研究》课程中完成访谈练习", match: "partial", confidence: 52, note: "课堂练习，非真实项目" },
      { claim: "样本设计能力", quote: "（未找到样本规模与抽样说明）", match: "none", confidence: 28, note: "缺关键证据，无法判断" }
    ],
    gaps: [
      { title: "研究方法的真实应用", impact: "高影响", missing: "真实项目中的方法选择与执行", status: "weak" },
      { title: "样本规模与抽样", impact: "高影响", missing: "样本量、抽样方式、偏差控制", status: "missing" },
      { title: "研究结论落地", impact: "中影响", missing: "结论被采纳或落地的记录", status: "missing" }
    ],
    reviewLog: [
      { at: "10:39", actor: "系统", action: "生成岗位匹配证据完成度 48" },
      { at: "10:41", actor: "周晨", action: "标记为无法判断，等待候选人补研究报告" }
    ]
  }
};

// ---------------------------------------------------------------------------
// 高校导师：单个学生的缺口明细与智能体洞察（只看缺口，不看企业备注）
// ---------------------------------------------------------------------------

export type StudentGapDetail = {
  title: string;
  status: EvidenceStatus;
  flaggedBy: string;
  suggestion: string;
};

export type StudentDetail = {
  summary: string;
  readinessTrend: string;
  agentInsight: string;
  recommendedPack: string;
  gaps: StudentGapDetail[];
};

export const studentDetails: Record<string, StudentDetail> = {
  "S-1021": {
    summary: "产品运营方向，材料覆盖度中等，主要缺少『项目结果指标』。",
    readinessTrend: "近两周 58% → 72%",
    agentInsight: "缺口提示：活动经历已有，但缺少可量化的结果指标。",
    recommendedPack: "项目作品页训练包",
    gaps: [
      { title: "项目结果指标", status: "weak", flaggedBy: "缺口核验智能体", suggestion: "补充活动前后转化率、留存率或报名完成率数据。" },
      { title: "个人动作说明", status: "weak", flaggedBy: "证据绑定智能体", suggestion: "说明本人负责的环节、具体动作和产出。" }
    ]
  },
  "S-1022": {
    summary: "数据分析方向，理论够但缺可访问的数据作品。",
    readinessTrend: "近两周 49% → 58%",
    agentInsight: "缺口提示：学生提到可视化能力，但缺少可打开的作品链接。",
    recommendedPack: "项目作品页训练包",
    gaps: [
      { title: "数据作品链接", status: "missing", flaggedBy: "证据绑定智能体", suggestion: "做一个可公开访问的看板或报告。" },
      { title: "SQL 取数实例", status: "weak", flaggedBy: "缺口核验智能体", suggestion: "用真实数据完成一次取数到结论。" }
    ]
  },
  "S-1023": {
    summary: "前端开发方向，准备度较高，仅缺线上项目说明。",
    readinessTrend: "近两周 74% → 81%",
    agentInsight: "缺口提示：已有作品材料，但缺少线上可访问的项目说明页。",
    recommendedPack: "实习经历证据整理包",
    gaps: [
      { title: "线上项目说明", status: "weak", flaggedBy: "缺口核验智能体", suggestion: "补一个可访问的部署链接与说明。" }
    ]
  },
  "S-1024": {
    summary: "用户研究方向，缺真实研究材料，准备度偏低。",
    readinessTrend: "近两周 41% → 46%",
    agentInsight: "缺口提示：材料多为课堂作业，缺少真实研究的方法与样本。",
    recommendedPack: "面试追问准备包",
    gaps: [
      { title: "调研样本与方法", status: "missing", flaggedBy: "缺口核验智能体", suggestion: "完成一次有样本量的真实调研。" },
      { title: "研究结论落地", status: "missing", flaggedBy: "招聘官视角智能体", suggestion: "说明结论被谁采纳、怎么用。" }
    ]
  }
};

// 高校看板顶部的院系级智能体洞察（来自批量体检的聚合）
export const schoolAgentInsight = {
  scanned: 24,
  topGap: "项目结果指标",
  topGapShare: 62,
  note: "24 份材料检查中，『项目结果指标』是最高频缺口。"
};

export function statusText(status: EvidenceStatus) {
  if (status === "proven") return "有直接证据";
  if (status === "weak") return "证据弱或间接";
  if (status === "risky") return "需人工复核";
  return "无证据支撑";
}
