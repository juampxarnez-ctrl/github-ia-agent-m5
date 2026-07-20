import { octokit } from "./client.js";
import type {
    RepositoryInfo,
    RepoSummary,
    UserInfo,
    UserSummary,
    CommitInfo,
    CommitSummary,
    IssueSummary,
    IssueInfo,
    PullRequestSummary,
    PullRequestInfo,
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

// create repository
export async function createRepository(input: {
    name: string;
    description?: string;
    private?: boolean;
}): Promise<RepoSummary> {
    const response = await octokit.repos.createForAuthenticatedUser({
        name: input.name,
        description: input.description,
        private: input.private,
    });

    return {
        id: response.data.id,
        fullName: response.data.full_name,
        description: response.data.description,
        stars: response.data.stargazers_count,
        defaultBranch: response.data.default_branch,
        url: response.data.html_url,
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



// issues-info-summary

export async function getIssue(
    owner: string,
    repo: string,
    issueNumber: number
): Promise<IssueInfo> {

    const response = await octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
    });

    return {
        number: response.data.number,

        title: response.data.title,

        body: response.data.body ?? null,

        state: response.data.state as "open" | "closed",

        author: response.data.user?.login ?? "unknown",

        createdAt: response.data.created_at,

        updatedAt: response.data.updated_at,

        url: response.data.html_url,
    };
}

export async function getRepositoryIssues(
    owner: string,
    repo: string
): Promise<IssueSummary[]> {

    const response = await octokit.issues.listForRepo({
        owner,
        repo,
        per_page: 10,
        state: "all",
    });

    return response.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state as "open" | "closed",
        url: issue.html_url,
    }));
}

// Pull requests-info-summary

export async function getRepositoryPullRequests(
    owner: string,
    repo: string
): Promise<PullRequestSummary[]> {

    const response = await octokit.pulls.list({
        owner,
        repo,
        state: "all",
        per_page: 10,
    });

    return response.data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state as "open" | "closed",
        url: pr.html_url,
    }));
}

export async function getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number
): Promise<PullRequestInfo> {

    const response = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
    });

    return {
        number: response.data.number,

        title: response.data.title,

        body: response.data.body ?? null,

        state: response.data.state as "open" | "closed",

        author: response.data.user?.login ?? "unknown",

        createdAt: response.data.created_at,

        updatedAt: response.data.updated_at,

        url: response.data.html_url,
    };
}

// list repositories (del usuario autenticado)
export async function listRepositories(input: {
    visibility?: "all" | "public" | "private";
    sort?: "created" | "updated" | "pushed" | "full_name";
    per_page?: number;
}): Promise<RepoSummary[]> {
    const response = await octokit.repos.listForAuthenticatedUser({
        visibility: input.visibility ?? "all",
        sort: input.sort ?? "updated",
        per_page: input.per_page ?? 30,
    });

    return response.data.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        defaultBranch: repo.default_branch,
        url: repo.html_url,
    }));
}





