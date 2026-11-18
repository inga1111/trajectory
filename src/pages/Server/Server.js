
import http from "node:http";

const PORT = Number(process.env.PORT || 8787);
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-6-astra";

const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const instructions = `
You are the Trajectory productivity companion.

Trajectory helps neurodivergent users with task initiation, executive dysfunction,
prioritisation, planning, overwhelm and breaking tasks into manageable actions.

Your tone is warm, respectful, practical and encouraging. Never shame the user,
call them lazy, or imply that productivity determines their worth. Avoid overwhelming
them with long lists. Prefer one small, achievable next action.

Use the user's onboarding answers and existing missions as context when relevant.
Do not diagnose conditions or provide medical advice.

You must return valid JSON with exactly this structure:
{
  "message": "A helpful conversational response",
  "missionDraft": null
}

When the user explicitly asks you to break down a task or create a mission,
return a missionDraft object:
{
  "title": "Short mission title",
  "description": "A concise description",
  "category": "Study, Work, Personal, Daily life, Wellbeing, or Other",
  "steps": [
    {
      "title": "A small actionable step",
      "description": "Brief practical guidance",
      "duration": "10 min"
    }
  ]
}

Mission steps must be specific, realistic, sequential and manageable.
Aim for 3 to 7 steps. Avoid vague steps such as "get started" or "do the work".
For ordinary conversation, missionDraft must be null.
Do not put markdown fences around the JSON.
`;

function sendJSON(response, statusCode, payload, origin) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Request is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function safeText(value, maxLength = 4000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeArray(value, maxItems = 15) {
  return Array.isArray(value) ? value.slice(0, maxItems) : [];
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  const textParts = [];
  for (const item of data.output || []) {
    if (item.type !== "message") continue;
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        textParts.push(content.text);
      }
    }
  }
  return textParts.join("\n");
}

function validateDraft(draft) {
  if (!draft || typeof draft !== "object") return null;

  const title = safeText(draft.title, 100);
  const description = safeText(draft.description, 500);
  const steps = safeArray(draft.steps, 7)
    .map((step) => ({
      title: safeText(step?.title, 120),
      description: safeText(step?.description, 300),
      duration: safeText(step?.duration, 30) || "10 min",
    }))
    .filter((step) => step.title);

  if (!title || steps.length === 0) return null;

  const categories = ["Study", "Work", "Personal", "Daily life", "Wellbeing", "Other"];
  const category = categories.includes(draft.category) ? draft.category : "Personal";

  return { title, description, category, steps };
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin || allowedOrigin;

  if (origin !== allowedOrigin) {
    sendJSON(response, 403, { error: "This origin is not allowed." }, allowedOrigin);
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    });
    response.end();
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/chat") {
    sendJSON(response, 404, { error: "Endpoint not found." }, allowedOrigin);
    return;
  }

  if (!API_KEY) {
    sendJSON(response, 503, {
      error: "The AI service is not configured yet. Add OPENAI_API_KEY to your server environment.",
    }, allowedOrigin);
    return;
  }

  try {
    const body = await readBody(request);
    const message = safeText(body.message, 3000);

    if (!message) {
      sendJSON(response, 400, { error: "Please enter a message." }, allowedOrigin);
      return;
    }

    const history = safeArray(body.history, 12)
      .map((item) => ({
        role: item?.role === "assistant" ? "assistant" : "user",
        content: safeText(item?.content, 2000),
      }))
      .filter((item) => item.content);

    const profile = safeArray(body.profile, 10)
      .map((item) => ({
        question: safeText(item?.question, 300),
        answer: safeText(item?.answer, 300),
      }));

    const missions = safeArray(body.missions, 15)
      .map((item) => ({
        title: safeText(item?.title, 100),
        category: safeText(item?.category, 40),
      }));

    const context = [
      "USER PRODUCTIVITY PROFILE:",
      profile.length
        ? profile.map((item) => `${item.question} ${item.answer}`).join("\n")
        : "No onboarding profile has been provided.",
      "",
      "EXISTING MISSIONS:",
      missions.length
        ? missions.map((item) => `- ${item.title} (${item.category})`).join("\n")
        : "No existing missions.",
      "",
      "USER MESSAGE:",
      message,
    ].join("\n");

    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: [
          ...history.slice(0, -1).map((item) => ({
            role: item.role,
            content: item.content,
          })),
          { role: "user", content: context },
        ],
        text: {
          format: { type: "json_object" },
        },
        max_output_tokens: 1200,
      }),
    });

    const apiData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("OpenAI API error:", apiData);
      sendJSON(response, 502, {
        error: apiData.error?.message || "The AI provider returned an error.",
      }, allowedOrigin);
      return;
    }

    const outputText = extractOutputText(apiData);

    let result;
    try {
      result = JSON.parse(outputText);
    } catch {
      throw new Error("The AI response could not be read. Please try again.");
    }

    const reply = safeText(result.message, 5000) ||
      "Let's take this one step at a time.";

    const missionDraft = validateDraft(result.missionDraft);

    sendJSON(response, 200, {
      message: reply,
      missionDraft,
    }, allowedOrigin);
  } catch (error) {
    console.error("Assistant server error:", error);
    sendJSON(response, 500, {
      error: error.message || "Something went wrong on the assistant server.",
    }, allowedOrigin);
  }
});

server.listen(PORT, () => {
  console.log(`Trajectory assistant server listening on http://localhost:${PORT}`);
});
