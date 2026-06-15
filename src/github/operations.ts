import { octokit } from "./client.js";
import type {
    RepositoryInfo,
    UserInfo,
} from "../types.js";

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



















