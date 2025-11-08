// netlify/functions/aiChat.js
import { getTokenPayloadFromEvent } from "./_auth.js";
import { callEmbedSearch } from "./_embed.js";

/**
 * RAG-enabled aiChat
 * - Authenticates user via cookie
 * - Calls embedding service /search to retrieve relevant user-specific docs
 * - Sends prompt + retrieved context to OpenRouter chat/completions
 */

const MODEL_CANDIDATES = [
  "alibaba/tongyi-deepresearch-30b-a3b:free",
  "meituan/longcat-flash-chat:free",
  "z-ai/glm-4.5-air:free",
];

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

// Helper to call OpenRouter
async function callOpenRouter(model, messages) {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  const data = await resp.json();
  return { status: resp.status, data };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405 };

  console.log("--- aiChat function started ---");
  
  try {
    // 1) authenticate user (cookie)
    const payload = getTokenPayloadFromEvent(event);
    const userId = payload.userId;

    console.log(`Authenticated user: ${userId}`);

    const body = JSON.parse(event.body || "{}");
    const prompt = (body.prompt || "").toString().trim();
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: "prompt required" }) };

    console.log(`Received prompt: "${prompt}"`);

    // 2) call embedding service search to retrieve topK relevant pieces for this user
    const EMBED_SERVICE_URL = process.env.EMBED_SERVICE_URL;
    const EMBED_API_KEY = process.env.EMBED_API_KEY;
    const TOP_K = Number(process.env.RAG_TOP_K || 5);

    let retrieved = [];
    if (EMBED_SERVICE_URL && EMBED_API_KEY) {
      console.log(`Calling embed search service at: ${EMBED_SERVICE_URL}/search`);
      try {
        const searchResp = await callEmbedSearch({
          serviceUrl: EMBED_SERVICE_URL,
          apiKey: EMBED_API_KEY,
          userId,
          query: prompt,
          k: TOP_K
        });

        console.log("Embed search response:", JSON.stringify(searchResp, null, 2));

        if (searchResp.ok && searchResp.body && Array.isArray(searchResp.body.results)) {
          retrieved = searchResp.body.results;
          console.log(`Retrieved ${retrieved.length} documents.`);

        } else {
          console.warn("Embedding search returned no results or error:", searchResp);
        }
      } catch (err) {
        console.error("callEmbedSearch error (ignored):", err);
      }
    } else {
      console.info("Embed search not configured (EMBED_SERVICE_URL / EMBED_API_KEY). Proceeding without retrieval.");
    }

    // 3) Build concise context string from retrieved docs (limit size)
    // We'll include todo text and score (if present). Truncate long texts for safety.
    function safeText(s, max = 400) {
      if (!s) return "";
      return s.length > max ? s.slice(0, max - 3) + "..." : s;
    }

    const contextChunks = (retrieved || []).map((r, i) => {
      const text = safeText(r.text ?? r.plot ?? "");
      const score = typeof r.score !== "undefined" ? ` (score: ${Number(r.score).toFixed(3)})` : "";
      return `#${i + 1}${score}: ${text}`;
    });

    const retrievalContext = contextChunks.length > 0
      ? `Here are the ${contextChunks.length} most relevant todo snippets from the user's data:\n${contextChunks.join("\n")}\n\nUse them to answer the user's question where helpful.`
      : "";

      console.log("Constructed retrieval context snippet:", retrievalContext.substring(0, 500) + (retrievalContext.length > 500 ? "..." : ""));

    // 4) Compose system + user messages for OpenRouter
    const systemMessage = {
      role: "system",
      content:
`You are an intelligent AI assistant deeply integrated into a personal productivity todo application. Your role is to help users manage, understand, and optimize their tasks and workflows through thoughtful analysis and actionable guidance.

## Core Identity & Purpose
- You are a productivity-focused AI advisor with deep understanding of task management, prioritization, and personal effectiveness
- You prioritize clarity, actionability, and user agency—never making decisions for users, but presenting well-reasoned options
- You are honest about limitations and uncertainties while remaining helpful and resourceful

## How to Use Retrieved Todo Data
- The retrieved snippets represent the user's actual task ecosystem and are your primary source of truth
- Use these snippets to provide contextualized, personalized advice that reflects their real workload and priorities
- Reference specific todos when offering suggestions: "I see you have 'X' on your list—this connects to..."
- Never invent tasks or assume details not present in the retrieved data
- If data is incomplete, acknowledge the gap: "I don't have full visibility into [topic], but based on what I see..."

## Conversation Guidelines

### Analysis & Insights
- Identify patterns, bottlenecks, and opportunities in the user's tasks without being prescriptive
- Highlight connections between seemingly unrelated todos that might indicate a larger project or workflow
- Point out potential duplicates, conflicts, or missing dependencies
- Offer evidence-based observations: "I notice you have 4 tasks related to X—would consolidating help?"

### Actionability
- Always provide specific, implementable suggestions grounded in their actual task list
- When suggesting priorities, explain the reasoning: "Based on dependencies and deadlines..."
- Offer multiple approaches when appropriate: "You could tackle this by... or alternatively..."
- Include effort/impact estimates when helpful: "Quick win" vs. "substantial undertaking"

### Tone & Style
- Be conversational yet professional; avoid robotic or overly formal language
- Use encouragement without being patronizing; acknowledge complexity and effort
- Be direct about trade-offs: don't hide hard truths behind positivity
- Adapt tone to context: urgent situations warrant directness; exploratory questions warrant curiosity

### Scope Boundaries
- Focus on productivity, task management, time management, and workflow optimization
- For domain-specific advice (legal, medical, financial), flag limitations and recommend consulting experts
- For tasks outside todo management, gently redirect: "That's outside my wheelhouse, but I can help with..."
- If asked about personal/sensitive information, respect privacy and decline appropriately

## Response Structure
1. **Acknowledge** their question and connect it to their task context where relevant
2. **Analyze** using the retrieved data; highlight patterns and insights
3. **Recommend** specific, actionable steps or next actions
4. **Clarify** any assumptions you made and offer follow-up options

## What NOT to Do
- Don't invent task details or user intentions not clearly present in retrieved data
- Don't overwhelm with options; prioritize the 2-3 most valuable suggestions
- Don't assume urgency or importance—ask or infer from context
- Don't generate purely generic productivity advice; always ground it in their reality
- Don't make commitments on the user's behalf ("You should definitely...")
- Do not use preamble, conversational fillers, or introductory sentences like 'Based on the retrieved snippets...' or 'To answer your question...'. Be direct and get straight to the point.

## Example Interaction Patterns
- "I see you're juggling [X], [Y], and [Z]. Are these all equally urgent, or is there a blocking dependency?"
- "These 3 todos seem related to [theme]. Consolidating them might create clarity."
- "Based on what I see, I'd suggest focusing on [X] first because [reason]. Want help breaking it down?"

You are helpful, honest, and focused on making the user more effective with their tasks. When uncertain, ask clarifying questions rather than guessing.`
    };

    const userMessageContent = retrievalContext
      ? `${retrievalContext}\nUser question: ${prompt}`
      : `${prompt}\n(Note: no user data retrieved)`;

    const userMessage = { role: "user", content: userMessageContent };

    console.log("Final User Message Content (snippet):", userMessageContent.substring(0, 500) + (userMessageContent.length > 500 ? "..." : ""));

    // 5) Try model candidates with retries/backoff
    console.log("Calling OpenRouter...");

    for (const model of MODEL_CANDIDATES) {
      console.log(`Trying model: ${model}`);
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise(r => setTimeout(r, delay));
        }

        let result;
        try {
          result = await callOpenRouter(model, [systemMessage, userMessage]);
        } catch (err) {
          console.warn("Network error calling OpenRouter:", err);
          if (attempt === MAX_RETRIES) break;
          else continue;
        }

        const { status, data } = result;
        if (!data) {
          console.warn("OpenRouter returned empty response", result);
          if (attempt === MAX_RETRIES) break;
          else continue;
        }

        // Handle provider error wrapper
        if (data?.error) {
          const code = data.error.code;
          const message = data.error.message || JSON.stringify(data.error);
          console.warn(`OpenRouter error (model=${model}, code=${code}):`, message);
          // Rate limited -> retry
          if (code === 429 && attempt < MAX_RETRIES) continue;
          // otherwise try next model
          break;
        }

        // Extract reply (chat-completion)
        const reply = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";
        if (reply) {
          console.log(`OpenRouter Success (model=${model}). Reply snippet:`, reply.substring(0, 100) + "...");
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply, retrieved: retrieved || [] })
          };
        } else {
          console.warn("OpenRouter returned no reply field; raw data:", JSON.stringify(data));
          if (attempt < MAX_RETRIES) continue;
          else break;
        }
      } // attempts
      // try next model
    } // models

    // all failed
    console.error("All OpenRouter models failed.");
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "All model endpoints failed or are rate-limited" })
    };

  } catch (err) {
    // auth helper throws known messages
    console.error("aiChat top-level error:", err);
    if (err.message === "no-token" || err.message === "invalid-token" || err.message === "no-cookie") {
      return { statusCode: 401, body: JSON.stringify({ error: "not authenticated" }) };
    }
    console.error("aiChat (RAG) error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "AI call failed" }) };
  } finally {
    console.log("--- aiChat function finished ---"); // <-- LOGGING
  }
}
