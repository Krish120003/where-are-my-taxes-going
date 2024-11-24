import { generateText } from "ai";

import { createGroq } from "@ai-sdk/groq";

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

const index = pc.index("quickstart");

const groq = createGroq({
  // custom settings
});

export async function POST(req: Request) {
  console.log("Getting Embeddings");
  const res = await embeddingModel.doEmbed({
    values: ["This is a query document about hawaii"],
  });
  console.log("Got Embeddings");
  console.log(res.embeddings[0].length);

  const text = "wow";

  // const { text } = await generateText({
  //   model: groq("llama-3.1-8b-instant"), // @ts-ignore
  //   prompt: "Write a vegetarian lasagna recipe for 4 people.",
  // });

  console.log("TEXT", text);

  return new Response(JSON.stringify({ text }));
}
