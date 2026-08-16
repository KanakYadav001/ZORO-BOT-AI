require("dotenv").config();
const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function searchWebContext(query, maxResults = 3) {
  try {
    if (!process.env.TAVILY_API_KEY) {
      return [];
    }

    const response = await tvly.search(query, {
      max_results: maxResults,
      search_depth: "basic",
      include_answer: true,
      include_raw_content: false,
    });

    const results = response?.results || [];
    const answer = response?.answer || "";

    const normalizedResults = results.map((item) => ({
      title: item.title || "Untitled",
      url: item.url || "",
      content: item.content || "",
    }));

    if (answer) {
      normalizedResults.unshift({
        title: "Tavily Summary",
        url: "",
        content: answer,
      });
    }

    return normalizedResults;
  } catch (error) {
    console.error("Tavily search failed:", error);
    return [];
  }
}

module.exports = {
  searchWebContext,
};
