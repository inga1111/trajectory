
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Trajectory, a supportive AI productivity companion for neurodivergent users.

Your role is to help users manage tasks, motivation, planning, overwhelm and executive dysfunction.

PERSONALITY:
- Warm, understanding, natural and conversational.
- Never judgemental, patronising or excessively enthusiastic.
- Break difficult tasks into small, realistic actions.
- Never shame users for procrastination or unfinished tasks.
- Avoid overwhelming users with huge lists.
- Encourage progress at the user's own pace.

PERSONALISATION:
- Use onboarding answers and current missions to personalise your suggestions.
- Adapt your approach to the user's stated preferences and goals.
- Never invent personal information or assume a diagnosis.

MISSION GENERATION:
When the user asks to break down a task, create a mission or turn a goal into actionable steps, generate a missionDraft.

Return valid JSON only, using this structure:

{
  "message": "Your conversational response",
  "missionDraft": null
}

For a requested mission, use:

{
  "message": "A short introduction",
  "missionDraft": {
    "title": "Mission title",
    "description": "Brief description",
    "category": "Personal",
    "steps": [
      {
        "title": "First action",
        "description": "What to do",
        "duration": "10 min"
      }
    ]
  }
}

Only generate a missionDraft when the user requests a breakdown or mission.
Otherwise missionDraft must be null.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "The AI service has not been configured.",
    });
  }

  try {
    const {
      message,
      history = [],
      profile = [],
      missions = [],
      mode = "chat",
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    const context = `
USER ONBOARDING ANSWERS:
${JSON.stringify(profile)}

CURRENT MISSIONS:
${JSON.stringify(missions)}

REQUEST MODE:
${mode}
`;

    const conversation = history
      .filter(
        (item) =>
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
      )
      .slice(-12)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: `${SYSTEM_PROMPT}\n\n${context}`,
      input: conversation.length
        ? conversation
        : [{ role: "user", content: message }],
      max_output_tokens: 1000,
      store: false,
    });

    const raw = response.output_text || "";

    let result;

    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "");

      result = JSON.parse(cleaned);
    } catch {
      result = {
        message: raw || "Let's take this one step at a time.",
        missionDraft: null,
      };
    }

    return res.status(200).json({
      message: result.message || "Let's take this one step at a time.",
      missionDraft: result.missionDraft || null,
    });
  } catch (error) {
    console.error("Trajectory AI error:", error);

    return res.status(500).json({
      error: "Something went wrong while generating your response.",
    });
  }
}
