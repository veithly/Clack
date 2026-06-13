export type DemoRole = "candidate" | "enterprise" | "school" | "admin";

export type DemoUser = {
  role: DemoRole;
  name: string;
  org: string;
  title: string;
  defaultRoute: string;
  homeTitle: string;
  homeSubtitle: string;
  username: string;
  password: string;
  tagline: string;
  permissions: string[];
  restrictions: string[];
};

export const DEMO_USER_STORAGE_KEY = "clack-demo-role";
export const DEMO_SESSION_STORAGE_KEY = "clack-demo-session";

export const demoUsers: DemoUser[] = [
  {
    role: "candidate",
    name: "林知然",
    org: "应届生",
    title: "候选人",
    defaultRoute: "/candidate",
    homeTitle: "候选人工作台",
    homeSubtitle: "上传材料、补证据、授权只读证据卡",
    username: "lin.zhiran",
    password: "kada-demo",
    tagline: "上传一次，拿到投递灯",
    permissions: ["上传简历和证明材料", "生成岗位证据就绪度", "决定证据卡可见范围"],
    restrictions: ["不能查看其他候选人", "不能代替企业复核", "不能修改审计日志"]
  },
  {
    role: "enterprise",
    name: "周晨",
    org: "星桥科技",
    title: "企业复核员",
    defaultRoute: "/enterprise",
    homeTitle: "企业复核工作台",
    homeSubtitle: "只看候选人授权证据，不做自动淘汰",
    username: "zhou.chen",
    password: "kada-demo",
    tagline: "看授权证据，人工下结论",
    permissions: ["查看授权证据卡", "填写人工复核结论", "发送补证据请求"],
    restrictions: ["不能查看候选人私密材料", "不能按敏感属性排序", "不能让 AI 自动淘汰"]
  },
  {
    role: "school",
    name: "许老师",
    org: "软件学院就业办",
    title: "高校导师",
    defaultRoute: "/school",
    homeTitle: "高校就业证据看板",
    homeSubtitle: "查看缺口热力、训练包和导师待跟进",
    username: "xu.mentor",
    password: "kada-demo",
    tagline: "看缺口热力，配训练包",
    permissions: ["查看学生准备度", "发送补证据建议", "配置院系训练包"],
    restrictions: ["不能查看企业复核备注", "不能查看学生私密材料原文", "不能给学生能力打分"]
  },
  {
    role: "admin",
    name: "叶安",
    org: "咔哒平台",
    title: "平台管理员",
    defaultRoute: "/admin",
    homeTitle: "权限与审计控制台",
    homeSubtitle: "管理角色权限、敏感字段过滤和模型成本",
    username: "ye.an",
    password: "kada-demo",
    tagline: "管权限、审计与模型边界",
    permissions: ["查看系统审计日志", "配置权限模板", "检查 AI 服务与模型状态"],
    restrictions: ["不能编辑候选人材料", "不能替企业作录用决定", "不能绕过用户授权"]
  }
];

export const roleLabels: Record<DemoRole, string> = {
  candidate: "候选人",
  enterprise: "企业",
  school: "高校",
  admin: "管理员"
};

export function getDemoUser(role: string | null | undefined) {
  return demoUsers.find((user) => user.role === role) ?? demoUsers[0];
}

export function findDemoUserByCredentials(username: string, password: string) {
  const id = username.trim().toLowerCase();
  return demoUsers.find(
    (user) => user.username.toLowerCase() === id && user.password === password.trim()
  );
}
