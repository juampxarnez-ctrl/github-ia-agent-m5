import { Octokit } from "@octokit/rest";
import { env } from "../config/env.js";

const token = env.githubToken;

if (!token) {
    throw new Error("GITHUB_TOKEN no encontrado");
}

export const octokit = new Octokit({
    auth: token,
    userAgent: "github-ia-agent-m5",
});