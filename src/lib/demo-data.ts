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

export function statusText(status: EvidenceStatus) {
  if (status === "proven") return "有直接证据";
  if (status === "weak") return "证据弱或间接";
  if (status === "risky") return "需人工复核";
  return "无证据支撑";
}
