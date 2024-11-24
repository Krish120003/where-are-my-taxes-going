import { generateText, streamText } from "ai";

import { createOpenAI as createGroq } from "@ai-sdk/openai"; // based on the typing for docs

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

import { createOllama } from "ollama-ai-provider";

const ollama = createOllama({
  // optional settings, e.g.
  // baseURL: "http://100.110.46.126:11434/api",
});

const embeddingModel = ollama.embedding("nomic-embed-text");

const index = pc.index("gov-nomic");

const groq = createGroq({
  // custom settings
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const input_data = await req.json();
  const query = input_data.prompt;
  // const query = "Highway projects in Toronto downtown";

  console.log("Getting Embeddings");

  const embedRes = await embeddingModel.doEmbed({
    values: [query],
  });

  const embedding = embedRes.embeddings[0];
  console.log("Got Embeddings");

  console.log("Querying Pinecone");
  const relevantDocs = await index.query({
    topK: 5,
    vector: embedding,
    includeMetadata: true,
  });

  const context = relevantDocs.matches
    .map((match) => {
      match.metadata = match.metadata || {};
      return Object.entries(match.metadata)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n ");
    })
    .join("\n\n");

  console.log("Got Pinecone Results");
  console.log("Context", context);

  const prompt = `You are a helpful AI assistant passionate about government developments in Canada. Specifically, you have access to the upcoming government contracts database and want to help users find information about government projects.
  
  The user is a curious individual who is querying you about this information:
  ${query}

  Here's some context that may be related to the user's query:
  \n\n${context}
  
  Given this context, please provide a helpful response to the user's query.
  Only respond with information that is relevant to the user's query. Avoid asking about any follow-up questions or clarifications.`;

  const result = await streamText({
    model: groq("llama-3.1-8b-instant"), // @ts-ignore
    prompt: prompt,
  });

  return result.toDataStreamResponse();
}
