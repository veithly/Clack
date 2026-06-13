"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Cpu,
  GitCompareArrows,
  Loader2,
  MessageSquareText,
  Plus,
  SendHorizonal,
  Sparkles,
  Trophy,
  Wand2
} from "lucide-react";
import { displayEngine } from "@/lib/pipeline-meta";

// ---------------------------------------------------------------------------
// 1) STAR 改写：把一条证据不足的声明，一键改写成可放进简历的有证据要点
// ---------------------------------------------------------------------------

type RewriteResponse = {
  star: string;
  tips: string[];
  usedAi: boolean;
  engine: string;
  gapTitle?: string;
};

export function StarRewriteButton({ reportId, gapId }: { reportId: string; gapId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/report/${reportId}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gapId })
      });
      const data = (await res.json()) as RewriteResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "改写失败");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "改写失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.star);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("复制失败，请手动选择文本");
    }
  }

  return (
    <div className="star-rewrite" data-testid="star-rewrite">
      <button className="ghost-button star-trigger min-h-11" onClick={run} disabled={loading} type="button" data-testid="star-rewrite-button">
        {loading ? <Loader2 className="spin" size={15} /> : <Wand2 size={15} />}
        {loading ? "AI 改写中…" : result ? "重新改写" : "AI 改写成有证据的简历句"}
      </button>
      {error ? <p className="star-error"><AlertCircle size={13} />{error}</p> : null}
      {result ? (
        <div className="star-result" data-testid="star-result">
          <div className="star-line">
            <p data-testid="star-sentence">{result.star}</p>
            <button className="icon-button" onClick={copy} type="button" aria-label="复制改写后的简历句" data-testid="star-copy-button">
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          {result.tips?.length ? (
            <ul className="star-tips">
              {result.tips.map((tip) => (
                <li key={tip}><Sparkles size={11} />{tip}</li>
              ))}
            </ul>
          ) : null}
          <small className="star-engine">
            <Cpu size={11} />
            {result.usedAi ? `${displayEngine(result.engine)} 改写 · 数字用 [方括号] 留空待你填，绝不编造` : "规则兜底改写 · 未配置模型时的保底版本"}
          </small>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2) 面试追问预演：招聘官就证据缺口追问，你作答，模型当场判断答没答上来
// ---------------------------------------------------------------------------

type InterviewResponse = {
  verdict: "strong" | "partial" | "weak";
  score: number;
  feedback: string;
  followUp: string;
  usedAi: boolean;
  engine: string;
};

type InterviewRound = {
  question: string;
  answer: string;
  result: InterviewResponse;
};

function verdictLabel(verdict: InterviewResponse["verdict"]) {
  if (verdict === "strong") return "答到点上";
  if (verdict === "weak") return "还没答上";
  return "方向对，欠细节";
}

export function MockInterviewPanel({ reportId, questions }: { reportId: string; questions: string[] }) {
  const starters = questions.length ? questions : ["请展开说明你这段经历里的具体动作和结果。"];
  const [question, setQuestion] = useState(starters[0]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rounds, setRounds] = useState<InterviewRound[]>([]);

  async function submit() {
    if (loading || !answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/report/${reportId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
      });
      const data = (await res.json()) as InterviewResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "评估失败");
      setRounds((prev) => [...prev, { question, answer, result: data }]);
      setQuestion(data.followUp || question);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "评估失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel mock-interview" data-testid="mock-interview">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><MessageSquareText size={20} />面试追问预演</div>
          <p>把招聘官分身的追问练一遍——你作答，模型当场判断有没有把证据缺口补上。</p>
        </div>
      </div>

      <div className="mock-starters" aria-label="可选追问">
        {starters.map((item) => (
          <button
            key={item}
            type="button"
            className={`mock-chip ${item === question ? "active" : ""}`}
            onClick={() => setQuestion(item)}
            data-testid="mock-question-chip"
          >
            {item}
          </button>
        ))}
      </div>

      <label className="mock-question" data-testid="mock-current-question">
        <span>当前追问</span>
        <b>{question}</b>
      </label>

      <textarea
        className="mock-answer"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="像在面试里一样回答：你具体做了什么、用了什么数据、结果如何。"
        aria-label="你的回答"
        data-testid="mock-answer-input"
      />
      {error ? <p className="star-error"><AlertCircle size={13} />{error}</p> : null}
      <button className="primary-button min-h-11" onClick={submit} disabled={loading || !answer.trim()} type="button" data-testid="mock-submit-button">
        {loading ? <Loader2 className="spin" size={16} /> : <SendHorizonal size={16} />}
        {loading ? "模型评估中…" : "提交回答，让模型打分"}
      </button>

      {rounds.length ? (
        <div className="mock-rounds" data-testid="mock-rounds">
          {rounds
            .slice()
            .reverse()
            .map((round, index) => (
              <article className={`mock-round ${round.result.verdict}`} key={`${rounds.length - index}-${round.question}`} data-testid="mock-round">
                <div className="mock-round-top">
                  <span className={`mock-verdict ${round.result.verdict}`}>{verdictLabel(round.result.verdict)}</span>
                  <b className="mock-score">{round.result.score}<small>/100</small></b>
                </div>
                <p className="mock-q">追问：{round.question}</p>
                <p className="mock-a">你答：{round.answer}</p>
                <p className="mock-feedback"><b>点评</b>{round.result.feedback}</p>
                <p className="mock-follow"><b>继续追问</b>{round.result.followUp}</p>
                <small className="star-engine">
                  <Cpu size={11} />{round.result.usedAi ? `${displayEngine(round.result.engine)} 评估` : "规则兜底评估"}
                </small>
              </article>
            ))}
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3) 多岗位就绪度对比：同一份简历证据，贴几个岗位，看先投哪个
// ---------------------------------------------------------------------------

type CompareRanking = {
  id: string;
  title: string;
  readiness: number;
  light: "green" | "yellow" | "red";
  reason: string;
  topGap: string;
};

type CompareResponse = {
  ranking: CompareRanking[];
  usedAi: boolean;
  engine: string;
};

type JobDraft = { title: string; jdText: string };

const MAX_EXTRA_JOBS = 3;

export function MultiJobComparePanel({ reportId, currentRole }: { reportId: string; currentRole: string }) {
  const [drafts, setDrafts] = useState<JobDraft[]>([{ title: "", jdText: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareResponse | null>(null);

  function update(index: number, patch: Partial<JobDraft>) {
    setDrafts((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addJob() {
    setDrafts((prev) => (prev.length >= MAX_EXTRA_JOBS ? prev : [...prev, { title: "", jdText: "" }]));
  }

  async function run() {
    const jobs = drafts.filter((item) => item.jdText.trim().length > 20);
    if (loading || jobs.length === 0) {
      setError("至少贴一个完整一点的岗位 JD（20 字以上）。");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/report/${reportId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs })
      });
      const data = (await res.json()) as CompareResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "对比失败");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "对比失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel multi-job" data-testid="multi-job">
      <div className="panel-head clean">
        <div>
          <div className="panel-title"><GitCompareArrows size={20} />多岗位就绪度对比</div>
          <p>同一份简历和证据，再贴 1-3 个岗位，模型按“证据覆盖度”排个先后，告诉你先投哪个。</p>
        </div>
      </div>

      <div className="multi-job-inputs">
        <div className="multi-job-current" data-testid="multi-job-current">
          <span className="status-pill blue">当前岗位</span>
          <b>{currentRole}</b>
          <small>已在上方完成完整体检，作为对比基准。</small>
        </div>
        {drafts.map((draft, index) => (
          <div className="multi-job-draft" key={index}>
            <input
              value={draft.title}
              onChange={(event) => update(index, { title: event.target.value })}
              placeholder={`对比岗位 ${index + 1} 名称（可选）`}
              aria-label={`对比岗位 ${index + 1} 名称`}
              data-testid="compare-title-input"
            />
            <textarea
              value={draft.jdText}
              onChange={(event) => update(index, { jdText: event.target.value })}
              placeholder="粘贴这个岗位的 JD……"
              aria-label={`对比岗位 ${index + 1} JD`}
              data-testid="compare-jd-input"
            />
          </div>
        ))}
      </div>

      <div className="multi-job-actions">
        {drafts.length < MAX_EXTRA_JOBS ? (
          <button className="ghost-button min-h-11" onClick={addJob} type="button" data-testid="compare-add-button">
            <Plus size={15} />再加一个岗位
          </button>
        ) : null}
        <button className="primary-button min-h-11" onClick={run} disabled={loading} type="button" data-testid="compare-run-button">
          {loading ? <Loader2 className="spin" size={16} /> : <GitCompareArrows size={16} />}
          {loading ? "模型对比中…" : "对比就绪度"}
        </button>
      </div>
      {error ? <p className="star-error"><AlertCircle size={13} />{error}</p> : null}

      {result ? (
        <div className="compare-result" data-testid="compare-result">
          {result.ranking.map((item, index) => (
            <article className={`compare-row ${item.light}`} key={item.id} data-testid="compare-row">
              <div className="compare-rank">{index === 0 ? <Trophy size={16} /> : index + 1}</div>
              <div className="compare-main">
                <div className="compare-title-row">
                  <b>{item.title}</b>
                  <span className={`evidence-badge ${item.light}`}>{item.readiness} 分</span>
                </div>
                <div className="compare-bar"><i className={`compare-bar-fill ${item.light}`} style={{ width: `${item.readiness}%` }} /></div>
                <p className="compare-reason">{item.reason}</p>
                <small className="compare-gap">最该补：{item.topGap}</small>
              </div>
            </article>
          ))}
          <small className="star-engine">
            <Cpu size={11} />{result.usedAi ? `${displayEngine(result.engine)} 对比 · 分数只代表证据覆盖度，不代表能力或录用概率` : "规则兜底对比 · 关键词重合度粗估"}
          </small>
        </div>
      ) : null}
    </section>
  );
}
