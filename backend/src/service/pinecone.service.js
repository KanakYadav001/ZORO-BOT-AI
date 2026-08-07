require("dotenv").config();

const { Pinecone } = require("@pinecone-database/pinecone");


const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,

});

const index = pc.index(process.env.PINECONE_INDEX_NAME);

async function uploadToPinecone(id, vector, metadata) {
  try {
    if (!id || !vector) {
      console.error("Missing id or vector for Pinecone upload");
      return;
    }

    await index.upsert({
      records: [
        {
          id: id.toString(),
          values: vector,
          metadata: metadata,
    
        },
        
      ],
    });

    console.log("Vector uploaded to Pinecone with ID:", id);
  } catch (error) {
    console.error("Error uploading vector to Pinecone:", error);
  }
}

async function queryPinecone(vector, topK = 50, userId) {
  try {
    const result = await index.query({
      vector: vector,
      topK: topK,
      includeMetadata: true,
      filter: {
        userId: userId,
      },
    });
    return result;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    return null;
  }
}

async function getContextFromPinecone(userMessageEmbedding, userId, chatId, topK = 5) {
  try {
    if (!userMessageEmbedding || !userId || !chatId) {
      console.warn("Missing arguments for getContextFromPinecone");
      return [];
    }

    const result = await index.query({
      vector: userMessageEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: {
        userId: String(userId),
        chatId: String(chatId),
      },
    });

    console.log(`Pinecone retrieved ${result.matches?.length || 0} context matches for chat ${chatId}`);
    return result.matches || [];
  } catch (error) {
    console.error("Error retrieving context from Pinecone:", error);
    return [];
  }
}

module.exports = {
  uploadToPinecone,
  queryPinecone,
  getContextFromPinecone,
};
