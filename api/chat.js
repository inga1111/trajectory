
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OpenAI API key is not configured.",
    });
  }

  try {
    const { message, profile, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "A message is required.",
      });
    }

    const instructions = `
You are Trajectory's built-in AI productivity assistant.

Your purpose is to help neurodivergent users manage tasks,
build routines, overcome procrastination, and make progress
without shame or unnecessary pressure.

The user's productivity profile is:
${JSON.stringify(profile || "Not provided")}

Adapt your suggestions to the user's profile, energy,
motivation, and working preferences.

Be warm, practical, encouraging, and concise.
Break overwhelming tasks into manageable steps.
Avoid guilt, judgement, and unrealistic productivity advice.
Do not claim to have changed tasks or saved anything
unless the application actually confirms that action.
`;

    const conversation = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }))
      : [];

    conversation.push({
      role: "user",
      content: message,
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions,
      input: conversation,
      max_output_tokens: 600,
      store: false,
    });

    return res.status(200).json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("Trajectory AI error:", error);

    return res.status(500).json({
      error: "The AI assistant could not respond. Please try again.",
    });
  }
}
