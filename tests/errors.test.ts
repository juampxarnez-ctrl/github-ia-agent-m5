import { describe, it, expect } from "vitest";
import { RequestError } from "@octokit/request-error";
import { mapGitHubError } from "../src/errors/map-github-error.js";
import {
    AuthenticationError,
    GitHubAPIError,
    NetworkError,
} from "../src/errors/app-errors.js";

// Helper para simular un error HTTP de Octokit con un status dado.
function fakeRequestError(status: number, headers: Record<string, string> = {}) {
    return new RequestError("Simulated", status, {
        request: { method: "GET", url: "https://api.github.com/test", headers: {} },
        response: {
            status,
            url: "https://api.github.com/test",
            headers,
            data: {},
        },
    } as any);
}

describe("mapGitHubError", () => {
    it("traduce un 401 a AuthenticationError con mensaje claro", () => {
        const result = mapGitHubError(fakeRequestError(401));
        expect(result).toBeInstanceOf(AuthenticationError);
        expect(result.code).toBe("AUTH_ERROR");
        expect(result.message).toMatch(/token/i);
    });

    it("traduce un 404 a GitHubAPIError incluyendo el nombre del recurso", () => {
        const result = mapGitHubError(fakeRequestError(404), { owner: "juampi", repo: "no-existe" });
        expect(result).toBeInstanceOf(GitHubAPIError);
        expect(result.code).toBe("GITHUB_API_ERROR");
        expect(result.message).toContain("juampi/no-existe");
        expect(result.retryable).toBe(false);
    });

    it("traduce un 403 con rate limit agotado a error retryable", () => {
        const result = mapGitHubError(
            fakeRequestError(403, { "x-ratelimit-remaining": "0" })
        );
        expect(result.code).toBe("GITHUB_API_ERROR");
        expect(result.retryable).toBe(true);
    });

    it("traduce un 403 sin rate limit a error de permisos (no retryable)", () => {
        const result = mapGitHubError(
            fakeRequestError(403, { "x-ratelimit-remaining": "50" })
        );
        expect(result.retryable).toBe(false);
        expect(result.message).toMatch(/permisos/i);
    });

    it("traduce un error de red (ECONNRESET) a NetworkError retryable", () => {
        const netErr = Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" });
        const result = mapGitHubError(netErr);
        expect(result).toBeInstanceOf(NetworkError);
        expect(result.retryable).toBe(true);
    });
});