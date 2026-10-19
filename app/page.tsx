"use client";

import { FormEvent, useState } from "react";

type Usage = { workspaceId: string; used: number; limit: number; remaining: number };
type ChatMessage = { role: "user" | "assistant"; text: string };

export default function Home() {
  const [workspace, setWorkspace] = useState("demo-workspace");
  const [message, setMessage] = useState("Explain how RAG can improve an internal knowledge assistant.");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usage, setUsage] = useState<Usage>({ workspaceId: "demo-workspace", used: 0, limit: 50, remaining: 50 });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setStatus("");
    const prompt = message.trim();
    setMessages((items) => [...items, { role: "user", text: prompt }]);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace, message: prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Assistant request failed.");
      setMessages((items) => [...items, { role: "assistant", text: data.answer }]);
      setUsage(data.usage);
      setMessage("");
      setStatus(data.disclaimer);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  const percent = Math.min(100, (usage.used / Math.max(usage.limit, 1)) * 100);

  return (
    <main className="shell">
      <nav className="topbar">
        <div className="brand"><div className="brand-mark">AI</div><div>Optimity <span className="muted">Studio</span><div className="muted" style={{fontSize:12,fontWeight:500,letterSpacing:0}}>AI SaaS starter kit</div></div></div>
        <span className="badge">LOCAL MOCK MODE · NO API KEY</span>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Workspace overview</div>
          <h1>Build your next AI product with a stronger starting point.</h1>
          <p>A small full-stack reference app with a working assistant endpoint, workspace-scoped demo usage, request validation, and a clean dashboard. The provider is mocked so you can explore it for free.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}><span className="badge">Next.js + TypeScript</span><span className="badge">API route</span><span className="badge">Usage limits</span></div>
        </div>
        <div className="stats">
          <div className="stat"><span>Provider</span><strong style={{fontSize:23}}>Mock</strong><span>No external request</span></div>
          <div className="stat"><span>Workspace</span><strong style={{fontSize:23}}>Demo</strong><span>Selectable workspace ID</span></div>
          <div className="stat"><span>Requests used</span><strong>{usage.used}</strong><span>Since server start</span></div>
          <div className="stat"><span>Remaining</span><strong>{usage.remaining}</strong><span>Demo request allowance</span></div>
        </div>
      </section>
      <div className="layout">
        <section className="panel">
          <h2>AI product assistant</h2><p className="muted">Try a question about RAG, agents, automation, or SaaS architecture.</p>
          <label className="field" htmlFor="workspace">Demo workspace ID</label>
          <input className="input" id="workspace" value={workspace} onChange={(e) => setWorkspace(e.target.value)} maxLength={64} />
          <div className="chat" aria-live="polite">
            {messages.length === 0 ? <div className="empty">Your conversation will appear here.<br/>Send a message to try the mock assistant.</div> : messages.map((item, index) => <div className={"bubble " + item.role} key={index}><strong>{item.role === "user" ? "You" : "Assistant"}</strong><br/>{item.text}</div>)}
          </div>
          <form onSubmit={submit}>
            <label className="field" htmlFor="message">Your question</label>
            <textarea className="input" id="message" value={message} onChange={(e) => setMessage(e.target.value)} minLength={3} maxLength={2000} rows={3} required />
            <button className="btn" type="submit" disabled={loading || usage.remaining <= 0} style={{marginTop:12}}>{loading ? "Thinking…" : "Send message"}</button>
          </form>
          {status && <p role="status" className="muted">{status}</p>}
        </section>
        <aside className="panel">
          <h2>Usage & workspace</h2><p className="muted">A demonstration counter shows how an application can communicate usage to the UI.</p>
          <div style={{display:"flex",justifyContent:"space-between",gap:8}}><strong>Requests used</strong><span>{usage.used} / {usage.limit}</span></div>
          <div className="usagebar"><div style={{width:percent+"%"}} /></div>
          <p className="muted">{usage.remaining} requests remain for <strong>{workspace || "this workspace"}</strong> in this running server process.</p>
          <h2 style={{marginTop:28}}>Included in this starter</h2>
          <ul className="list"><li>Responsive product dashboard</li><li>Validated assistant API route</li><li>Workspace-keyed demo usage counter</li><li>Mock responses without paid services</li><li>Explicit production-readiness checklist</li></ul>
          <div className="empty">Prototype note: workspace IDs are not authentication. Do not use this demo to isolate real customer data.</div>
        </aside>
      </div>
      <footer className="footer">Optimity Studio · AI SaaS Starter Kit · Mock mode · No customer data stored</footer>
    </main>
  );
}
