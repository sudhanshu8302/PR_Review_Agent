import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import { createAgent } from "./agent.js";

dotenv.config();

export async function handler(event: { 
    owner: string;
    repo: string;
    prNumber: number[];
 }) {
    console.log("Received event:", event);

    try {
        const agent = createAgent();

        const result = await agent.invoke({
            messages: [
                new HumanMessage(
                    `review_request = f"""
        Please review Pull Request ${event.prNumber} in repository ${event.repo} of owner ${event.owner}.
        
        Steps:
        1. Get the PR details and analyze the changes
        2. Review the code for quality, security, and best practices
        3. Post a comprehensive review with your findings
        
        Focus on the most important issues and provide actionable feedback.`
                ),
            ]
        },
            {
                configurable: {
                    thread_id: "pr-review-42"
                }
            });

        console.log("Agent result:", result);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Review completed successfully", result }),
        }
    }
    catch (error) {
        console.error("Error in handler:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred while processing the review", error: (error as any).message }),
        }
    }
}



