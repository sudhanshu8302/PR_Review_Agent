import dotenv from 'dotenv';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getPullRequestFiles, postComment } from './githubActions.mjs';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

dotenv.config();

export function createAgent() {
    console.log("Creating agent with the following configuration:");
    const llm = new ChatGoogleGenerativeAI({
        model: process.env.AI_MODEL || 'gemini-2.5-flash',
        apiKey: process.env.API_KEY || '',
        temperature: 0.1,
    });

    console.log("Defining tools:");
    // 1. Wrap function as a tool
    const tools = [
        tool(
            async (input) => {
                return await getPullRequestFiles(input.owner, input.repo, input.prNumber);
            },
            {
                name: "getPullRequestFiles",
                description: "Get the list of files changed in a GitHub pull request",
                schema: z.object({
                    owner: z.string().describe("Repository owner"),
                    repo: z.string().describe("Repository name"),
                    prNumber: z.number().describe("Pull request number"),
                }),
            }
        ),
        tool(
            async (input) => {
                return await postComment(input.owner, input.repo, input.prNumber, input.comment);
            },
            {
                name: "postComment",
                description: "Post a comment on a GitHub pull request",
                schema: z.object({
                    owner: z.string().describe("Repository owner"),
                    repo: z.string().describe("Repository name"),
                    prNumber: z.number().describe("Pull request number"),
                    comment: z.string().describe("Comment text"),
                }),
            }
        ),
    ];

    const systemPrompt = `You are an expert code reviewer and senior software engineer.
    Your job is to review GitHub Pull Requests and provide constructive, actionable feedback.

    ## Your Review Process:
    1. **Analyze the Pull Request**: Use the getPullRequestFiles tool to understand what changed
    2. **Review Code Quality**: Check for bugs, performance issues, security concerns
    3. **Suggest Improvements**: Provide specific, actionable recommendations
    4. **Post Review**: Use the postComment tool to share your feedback

    ## Review Focus Areas:
    - **Code Quality**: Clean, readable, maintainable code
    - **Security**: Potential vulnerabilities or security issues
    - **Performance**: Inefficient algorithms or resource usage
    - **Best Practices**: Following language/framework conventions
    - **Testing**: Adequate test coverage for changes
    - **Documentation**: Clear comments and documentation

    ## Review Style:
    - Be constructive and encouraging
    - Provide specific examples and suggestions
    - Explain the "why" behind your recommendations
    - Recognize good code practices when you see them
    - Use markdown formatting for clarity

    ## When to Skip:
    - Don't review auto-generated files
    - Skip files with minimal changes (whitespace, formatting)
    - Focus on the most impactful files first

    Remember: Your goal is to help developers improve while maintaining team velocity.`;

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "{messages}"]
    ]);

    // 2. Create agent
    const agentExecutor = createReactAgent({
        llm,
        tools,
        checkpointSaver: new MemorySaver(),
        prompt
    });
    
    console.log("Agent created successfully.");
    return agentExecutor;
}
