require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

function normalizeAssistantResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return "Sorry, I could not generate a proper response. Please try again.";
  }

  // Strip potential hidden thinking blocks from reasoning models
  let cleanedText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Normalize lines while preserving markdown syntax (code blocks, bold, lists, tables)
  const lines = cleanedText.replace(/\r\n/g, "\n").split("\n");
  const cleaned = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      cleaned.push(line);
      continue;
    }

    if (!inCodeBlock) {
      cleaned.push(line.trimEnd());
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
  recentHistory = [],
  semanticContext = [],
  userProfile = null,
  webContext = [],
) {
  const userName = userProfile?.name
    ? `${userProfile.name.firstName || ""} ${userProfile.name.lastName || ""}`.trim()
    : "User";

  // Build structured XML system prompt (SDE Context Engineering)
  let systemPrompt = `<system_identity>
You are ZORO AI, an advanced, intelligent, empathetic, and reliable AI assistant.
Your goal is to provide accurate, well-structured, clear, and context-aware responses.

Guidelines:
1. Address ${userName || "the user"} warmly and naturally when appropriate.
2. Use clean, standard Markdown for formatting (headings, bullet points, bold text, code blocks).
3. Be truthful, concise, and direct. Do not introduce false facts.
4. Integrate past context and retrieved facts naturally without explicitly repeating raw system headers.
</system_identity>\n`;

  if (userProfile) {
    systemPrompt += `\n<user_profile>
Name: ${userName}
Email: ${userProfile.email || "N/A"}
</user_profile>\n`;
  }

  if (semanticContext && semanticContext.length > 0) {
    const formattedMemory = semanticContext
      .map((item, idx) => {
        const text = item.metadata?.content || item.content || "";
        const role = item.metadata?.role || "memory";
        return text ? `[Memory ${idx + 1} (${role})]: ${text}` : null;
      })
      .filter(Boolean)
      .join("\n");

    if (formattedMemory) {
      systemPrompt += `\n<retrieved_memory>
Relevant background knowledge from previous conversations:
${formattedMemory}
Use this memory to maintain conversation continuity if relevant to the current topic.
</retrieved_memory>\n`;
    }
  }

  if (webContext && webContext.length > 0) {
    const formattedWeb = webContext
      .map(
        (item, index) =>
          `[Source ${index + 1}: ${item.title}] (${item.url || "Web Search"})\n${item.content}`,
      )
      .join("\n\n");

    systemPrompt += `\n<web_search_results>
Real-time web search information:
${formattedWeb}
Integrate these facts directly into your answer if relevant, citing source names naturally.
</web_search_results>\n`;
  }

  const messages = [
    {
      role: "system",
      content: systemPrompt.trim(),
    },
  ];

  // Layer 1: Sequential Chat History (Recent turns in chronological order)
  if (recentHistory && recentHistory.length > 0) {
    recentHistory.forEach((msg) => {
      const rawRole = msg.role || msg.metadata?.role || "user";
      const role =
        rawRole === "assistant" || rawRole === "model" ? "assistant" : "user";
      const text = msg.content || msg.metadata?.content || "";
      if (text.trim()) {
        messages.push({
          role: role,
          content: text.trim(),
        });
      }
    });
  }

  // Current turn
  const currentQuery = typeof content === "string" ? content : content?.data || "";
  messages.push({
    role: "user",
    content: currentQuery,
  });

  const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: modelName,
      temperature: 0.6,
      max_tokens: 2048,
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content || "";
    return normalizeAssistantResponse(rawResponse);
  } catch (error) {
    console.error(`Error with primary model (${modelName}):`, error?.message || error);
    try {
      console.warn("Attempting fallback with llama-3.1-8b-instant...");
      const fallbackCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.6,
        max_tokens: 2048,
      });
      const fallbackRaw = fallbackCompletion.choices[0]?.message?.content || "";
      return normalizeAssistantResponse(fallbackRaw);
    } catch (fallbackError) {
      console.error("Fallback Groq completion failed:", fallbackError?.message || fallbackError);
      return "Sorry, I am currently having trouble generating a response. Please try again.";
    }
  }
}

async function CreateEmbedding(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: content,
      config: { outputDimensionality: 1024 },
    });

    return response.embeddings[0].values; // Return vector values array
  } catch (error) {
    console.error("Error creating embedding:", error);
    return null;
  }
}

module.exports = {
  getGroqChatCompletion,
  CreateEmbedding,
};

