require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

function normalizeAssistantResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return "Sorry, I could not generate a proper response. Please try again.";
  }

  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const cleaned = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      cleaned.push(line);
      continue;
    }

    if (!inCodeBlock) {
      // Remove noisy separator lines from malformed markdown tables.
      if (/^\s*[:|\-]{3,}\s*$/.test(line)) {
        continue;
      }

      const plainLine = line
        .replace(/[|_\-]{10,}/g, " ")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1");

      cleaned.push(plainLine.trimEnd());
    } else {
      cleaned.push(line);
    }
  }

  const compact = cleaned
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return (
    compact ||
    "Sorry, I could not generate a proper response. Please try again."
  );
}

async function getGroqChatCompletion(
  content,
  previousContext = [],
  userProfile = null,
  webContext = [],
) {
  try {
    const userName = userProfile?.name
      ? `${userProfile.name.firstName || ""} ${userProfile.name.lastName || ""}`.trim()
      : "User";

    const messages = [
      {
        role: "system",
        content: `You are ZORO AI, an intelligent, empathetic, and highly capable AI assistant.

Current User Details:
- User's Name: ${userName}
- User's Email: ${userProfile?.email || "Unknown"}

Your Instructions:
1. Personalized Tone & Identity: You are interacting with ${userName}. Address the user warmly and naturally when appropriate. Introduce yourself as ZORO AI when asked.
2. Truthfulness & Accuracy: Be accurate, objective, and truthful. Do NOT invent or hallucinate facts. If you do not know something, admit it clearly.
3. Response Formatting: Keep output clean and readable for a chat UI.
- Prefer short paragraphs and bullet points.
- Use headings only when helpful.
- Use plain text formatting. Do not use bold/italic markdown markers like **text** or _text_.
- Do not use markdown tables unless the user explicitly asks for a table.
- Do not use decorative separators like ----, ||||, or ASCII art.
- Keep answers direct and avoid repeated boilerplate.
4. Context & Memory: Incorporate past conversation context seamlessly.`,
      },
    ];

    if (webContext && webContext.length > 0) {
      const formattedWebContext = webContext
        .map(
          (item, index) =>
            `${index + 1}. ${item.title}\nSource: ${item.url}\nSummary: ${item.content}`,
        )
        .join("\n\n");

      messages.push({
        role: "system",
        content: `Fresh web context (may be recent facts):\n${formattedWebContext}\n\nIf this web context is present and relevant, use it directly in the answer. Do not say you cannot access live news/real-time data. Mention key source names when sharing major claims. If uncertain, say you are not fully sure.`,
      });
    }

    // Add previous context messages
    if (previousContext && previousContext.length > 0) {
      previousContext.forEach((message) => {
        const rawRole = message.metadata?.role || "user";
        const role =
          rawRole === "model" || rawRole === "system" ? "assistant" : rawRole;
        messages.push({
          role: role,
          content: message.metadata?.content || "",
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: content.data,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "openai/gpt-oss-20b",
      temperature: 0.6,
      max_completion_tokens: 2048,
      reasoning_effort: "medium",
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    return normalizeAssistantResponse(rawResponse);
  } catch (error) {
    console.error("Error getting chat completion:", error);
    return "Sorry, I'm having trouble processing your request right now.";
  }
}

async function CreateEmbedding(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: content,
      config: { outputDimensionality: 1024 },
    });

    return response.embeddings[0].values; // Return the array of float vector values
  } catch (error) {
    console.error("Error creating embedding:", error);
    return null;
  }
}

module.exports = {
  getGroqChatCompletion,
  CreateEmbedding,
};
