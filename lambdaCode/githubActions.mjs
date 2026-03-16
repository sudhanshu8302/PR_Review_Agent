import { Octokit } from "@octokit/rest"
import dotenv from 'dotenv';

dotenv.config();
    
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || '',
});

export async function getPullRequestFiles(owner, repo, pr_number) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
        owner: owner,
        repo: repo,
        pull_number: pr_number,
        headers: {
            'X-GitHub-Api-Version': '2026-03-10'
        }
    });

    var data = '';
    for (const file of response.data) {
        data += `Filename: ${file.filename}\n`;
        data += `Status: ${file.status}\n`;
        data += `Additions: ${file.additions}\n`;
        data += `Deletions: ${file.deletions}\n`;
        data += `Changes: ${file.changes}\n`;
        data += `Patch:\n${file.patch}\n\n`;
    }

    return data;
}

export async function postComment(owner, repo, pr_number, comment) {
    await octokit.pulls.createReview({
        owner: owner,
        repo: repo,
        pull_number: pr_number,
        body: comment,
        event: "COMMENT"
    });
}
