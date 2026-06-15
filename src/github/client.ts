import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("GITHUB_TOKEN no encontrado");
}

export const octokit = new Octokit({
    auth: token,
    userAgent: "github-ia-agent-m5",
});