import { describe, it, expect, vi, beforeEach } from "vitest";

// 1. Mockeamos el módulo del cliente ANTES de importar operations.
//    vi.mock se "eleva" (hoisting) al tope del archivo automáticamente.
vi.mock("../src/github/client.js", () => ({
    octokit: {
        repos: {
            createForAuthenticatedUser: vi.fn(),
            listForAuthenticatedUser: vi.fn(),
        },
        issues: {
            create: vi.fn(),
        },
    },
}));

// 2. Importamos DESPUÉS del mock: operations va a usar el octokit falso.
import { createRepository, listRepositories, createIssue } from "../src/github/operations.js";
import { octokit } from "../src/github/client.js";

describe("createRepository (Octokit mockeado)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("llama a createForAuthenticatedUser y devuelve el DTO correcto", async () => {
        // Preparamos la respuesta falsa de GitHub.
        (octokit.repos.createForAuthenticatedUser as any).mockResolvedValue({
            data: {
                id: 123,
                full_name: "juampi/mi-repo",
                description: "test",
                stargazers_count: 0,
                default_branch: "main",
                html_url: "https://github.com/juampi/mi-repo",
            },
        });

        const result = await createRepository({ name: "mi-repo" });

        // Verificamos que se llamó con los args correctos.
        expect(octokit.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
            name: "mi-repo",
            description: undefined,
            private: undefined,
        });

        // Verificamos que el DTO salió bien mapeado.
        expect(result.fullName).toBe("juampi/mi-repo");
        expect(result.url).toBe("https://github.com/juampi/mi-repo");
    });
});

describe("listRepositories (Octokit mockeado)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("mapea la lista de repos a DTOs", async () => {
        (octokit.repos.listForAuthenticatedUser as any).mockResolvedValue({
            data: [
                {
                    id: 1,
                    full_name: "juampi/repo-a",
                    description: null,
                    stargazers_count: 5,
                    default_branch: "main",
                    html_url: "https://github.com/juampi/repo-a",
                },
            ],
        });

        const result = await listRepositories({});

        expect(result).toHaveLength(1);
        expect(result[0].fullName).toBe("juampi/repo-a");
    });
});

describe("createIssue (Octokit mockeado)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("crea un issue y devuelve el DTO con número y url", async () => {
        (octokit.issues.create as any).mockResolvedValue({
            data: {
                number: 42,
                title: "Bug importante",
                state: "open",
                html_url: "https://github.com/juampi/test/issues/42",
            },
        });

        const result = await createIssue({
            owner: "juampi",
            repo: "test",
            title: "Bug importante",
        });

        expect(result.number).toBe(42);
        expect(result.state).toBe("open");
        expect(result.url).toContain("/issues/42");
    });
});