import { describe, it, expect } from "vitest";
import { createRepositorySchema } from "../src/schemas/create-repository-schema.js";
import { createIssueSchema } from "../src/schemas/create-issue-schema.js";
import { listIssuesSchema } from "../src/schemas/list-issues-schema.js";

describe("createRepositorySchema", () => {
    it("acepta un nombre válido", () => {
        const result = createRepositorySchema.safeParse({ name: "mi-repo-valido" });
        expect(result.success).toBe(true);
    });

    it("rechaza un nombre demasiado corto (< 3 caracteres)", () => {
        const result = createRepositorySchema.safeParse({ name: "ab" });
        expect(result.success).toBe(false);
    });

    it("rechaza un nombre con espacios", () => {
        const result = createRepositorySchema.safeParse({ name: "repo con espacios" });
        expect(result.success).toBe(false);
    });

    it("aplica el default private=false cuando no se envía", () => {
        const result = createRepositorySchema.safeParse({ name: "mi-repo" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.private).toBe(false);
        }
    });
});

describe("createIssueSchema", () => {
    it("acepta un issue con owner, repo y title", () => {
        const result = createIssueSchema.safeParse({
            owner: "juampi",
            repo: "test",
            title: "Un bug",
        });
        expect(result.success).toBe(true);
    });

    it("rechaza un issue sin title", () => {
        const result = createIssueSchema.safeParse({
            owner: "juampi",
            repo: "test",
        });
        expect(result.success).toBe(false);
    });
});

describe("listIssuesSchema", () => {
    it("aplica el default state='open'", () => {
        const result = listIssuesSchema.safeParse({ owner: "juampi", repo: "test" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.state).toBe("open");
        }
    });

    it("rechaza un state inválido", () => {
        const result = listIssuesSchema.safeParse({
            owner: "juampi",
            repo: "test",
            state: "abierto", // no es open/closed/all
        });
        expect(result.success).toBe(false);
    });
});