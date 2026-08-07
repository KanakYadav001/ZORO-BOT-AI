require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function getGroqChatCompletion(content, previousContext = [], userProfile = null) {
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
3. Response Formatting: Adapt your output naturally. Use clean Markdown formatting (bullet points, bold text, code blocks) where helpful.
4. Context & Memory: Incorporate past conversation context seamlessly.`,
      },
    ];

    // Add previous context messages
    if (previousContext && previousContext.length > 0) {
      previousContext.forEach((message) => {
        const rawRole = message.metadata?.role || "user";
        const role = (rawRole === "model" || rawRole === "system") ? "assistant" : rawRole;
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

    return chatCompletion.choices[0].message.content;
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
