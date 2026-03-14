import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
import { createAgent } from "./agent.js";

dotenv.config();

export async function handler(event: { headers: any; body: string }) {
    console.log("Received event:", event);

    try {
        const agent = createAgent();

        const prNumber = 1;
        const owner = 'sudhanshu8302';
        const repo = 'PR_Review_Agent';

        const result = await agent.invoke({
            messages: [
                new HumanMessage(
                    `review_request = f"""
        Please review Pull Request ${prNumber} in repository ${repo} of owner ${owner}.
        
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



