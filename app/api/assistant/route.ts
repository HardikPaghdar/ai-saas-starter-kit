import { NextResponse } from "next/server";
import { consumeUsage, getUsage } from "@/lib/usage";

export const runtime = "nodejs";

type RequestBody = { workspaceId?: string; message?: string };

function mockAnswer(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("rag") || text.includes("retrieval")) {
    return "RAG (retrieval-augmented generation) retrieves relevant passages from a trusted knowledge source and gives them to a language model as context. A production implementation should cite sources, evaluate retrieval quality, and say when the answer is not supported.";
  }
  if (text.includes("agent") || text.includes("automation")) {
    return "A reliable AI workflow usually combines a bounded goal, approved tools, validated inputs, observable execution steps, and human approval for consequential actions. Start with a narrow workflow and measure failure cases before expanding autonomy.";
  }
  if (text.includes("saas") || text.includes("product")) {
    return "For an AI SaaS MVP, start with one user problem, a small validated API surface, clear usage limits, tenant-safe data access, and observable costs. This starter is in mock mode and does not call a paid provider.";
  }
  return "This is a deterministic mock response from the AI SaaS starter. Add a provider adapter only after configuring secrets on the server, validating inputs, enforcing usage limits, and defining safe fallback behavior.";
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const workspaceId = (body.workspaceId ?? "demo-workspace").trim();
  const message = (body.message ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{2,64}$/.test(workspaceId)) {
    return NextResponse.json({ error: "Workspace ID must be 2–64 letters, numbers, dashes, or underscores." }, { status: 400 });
  }
  if (message.length < 3 || message.length > 2000) {
    return NextResponse.json({ error: "Message must be between 3 and 2000 characters." }, { status: 400 });
  }

  const usage = consumeUsage(workspaceId);
  if (!usage) {
    return NextResponse.json({ error: "Demo usage limit reached for this workspace.", usage: getUsage(workspaceId) }, { status: 429 });
  }

  return NextResponse.json({
    answer: mockAnswer(message),
    provider: process.env.AI_PROVIDER ?? "mock",
    usage,
    disclaimer: "Mock response for demonstration; no external AI provider was called.",
  });
}
