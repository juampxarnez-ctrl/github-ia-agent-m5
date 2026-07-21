import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../src/utils/retry.js";
import { RequestError } from "@octokit/request-error";

// Helper: simula un error HTTP de Octokit con un status dado.
function fakeRequestError(status: number, headers: Record<string, string> = {}) {
    return new RequestError("Simulated", status, {
        request: { method: "GET", url: "https://api.github.com/test", headers: {} },
        response: { status, url: "https://api.github.com/test", headers, data: {} },
    } as any);
}

describe("withRetry", () => {
    it("devuelve el resultado si la función tiene éxito al primer intento", async () => {
        const fn = vi.fn().mockResolvedValue("ok");
        const result = await withRetry(fn);
        expect(result).toBe("ok");
        expect(fn).toHaveBeenCalledTimes(1); // no reintentó
    });

    it("NO reintenta un error no-recuperable (404) y lo lanza de inmediato", async () => {
        const fn = vi.fn().mockRejectedValue(fakeRequestError(404));
        await expect(withRetry(fn)).rejects.toMatchObject({ code: "GITHUB_API_ERROR" });
        expect(fn).toHaveBeenCalledTimes(1); // se lanzó al toque, sin reintentar
    });

    it("reintenta un error recuperable (rate limit) y luego tiene éxito", async () => {
        const rateLimitErr = fakeRequestError(403, { "x-ratelimit-remaining": "0" });
        // Falla la 1ra vez, tiene éxito la 2da.
        const fn = vi
            .fn()
            .mockRejectedValueOnce(rateLimitErr)
            .mockResolvedValueOnce("recuperado");

        // baseDelayMs bajo para que el test sea rápido.
        const result = await withRetry(fn, { baseDelayMs: 1 });
        expect(result).toBe("recuperado");
        expect(fn).toHaveBeenCalledTimes(2); // reintentó una vez
    });
});
