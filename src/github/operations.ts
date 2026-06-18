import { octokit } from "./client.js";
import type {
    RepositoryInfo,
    UserInfo,
    UserSummary,
    CommitInfo,
    CommitSummary,
} from "../types.js";

// repositories
export async function getRepository(
    owner: string,
    repo: string
): Promise<RepositoryInfo> {
    const response = await octokit.repos.get({
        owner,
        repo,
    });
    return {
        id: response.data.id,
        fullName: response.data.full_name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        defaultBranch: response.data.default_branch,
        url: response.data.html_url,
        language: response.data.language,
        visibility: response.data.visibility ?? "unknown",
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
    };
}

// users-info-summary
export async function getUser(
    username: string
): Promise<UserInfo> {

    const response = await octokit.users.getByUsername({
        username,
    });

    return {
        login: response.data.login,
        id: response.data.id,

        avatarUrl: response.data.avatar_url,
        htmlUrl: response.data.html_url,

        name: response.data.name,
        company: response.data.company,
        blog: response.data.blog,
        location: response.data.location,
        email: response.data.email,
        bio: response.data.bio,

        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,

        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
    };
}

export async function getUserSummary(
    username: string
): Promise<UserSummary> {

    const response = await octokit.users.getByUsername({
        username,
    });

    return {
        login: response.data.login,
        avatarUrl: response.data.avatar_url,
        name: response.data.name,
        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        htmlUrl: response.data.html_url,
    };
}


// commits-info-summary

export async function getRepositoryCommits(
    owner: string,
    repo: string
): Promise<CommitSummary[]> {

    const response = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 10,
    });

    return response.data.map(commit => ({
        sha: commit.sha,

        message: commit.commit.message,

        author: commit.commit.author?.name ?? "Unknown",

        date: commit.commit.author?.date ?? "",
    }));
}

export async function getCommit(
    owner: string,
    repo: string,
    sha: string
): Promise<CommitInfo> {

    const response = await octokit.repos.getCommit({
        owner,
        repo,
        ref: sha,
    });

    return {
        sha: response.data.sha,

        message: response.data.commit.message,

        author: {
            name: response.data.commit.author?.name ?? null,
            email: response.data.commit.author?.email ?? null,
            date: response.data.commit.author?.date ?? "",
        },

        url: response.data.html_url,
    };
}











