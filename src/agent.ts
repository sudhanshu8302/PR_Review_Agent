import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';

dotenv.config();

const llm = new ChatGoogleGenerativeAI({
  model: process.env.AI_MODEL || 'gemini-2.5-flash',
  apiKey: process.env.API_KEY || '',
  temperature: 0.1
});

// Invoke the LLM directly
const response = await llm.invoke([
  new HumanMessage("Explain pull request review in simple words"),
]);

console.log(response.content);

