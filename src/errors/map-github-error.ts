// src/errors/map-github-error.ts
import { RequestError } from "@octokit/request-error";
import {
    AppError,
    AuthenticationError,
    GitHubAPIError,
    NetworkError,
} from "./app-errors.js";

export function mapGitHubError(
    err: unknown,
    context?: { owner?: string; repo?: string; resource?: string }
): AppError {
    // Ya es un error nuestro: lo dejamos pasar tal cual.
    if (err instanceof AppError) {
        return err;
    }

    // Errores de red (antes de recibir respuesta HTTP).
    if (err instanceof Error && "code" in err) {
        const netCode = (err as { code?: string }).code;
        if (netCode === "ECONNRESET" || netCode === "ETIMEDOUT" || netCode === "ENOTFOUND") {
            return new NetworkError(
                "No se pudo conectar con GitHub. Revisá tu conexión e intentá de nuevo.",
                { code: netCode }
            );
        }
    }

    // Errores con respuesta HTTP de GitHub (Octokit).
    if (err instanceof RequestError) {
        const status = err.status;
        const target = context?.resource ?? [context?.owner, context?.repo].filter(Boolean).join("/");

        switch (status) {
            case 401:
                return new AuthenticationError(
                    "El token de GitHub es inválido o expiró. Verificá tu GITHUB_TOKEN."
                );
            case 403: {
                // 403 puede ser rate limit o permisos. Distinguimos por el header.
                const remaining = err.response?.headers?.["x-ratelimit-remaining"];
                if (remaining === "0") {
                    return new GitHubAPIError(
                        "Se alcanzó el límite de peticiones de GitHub. Esperá unos minutos e intentá de nuevo.",
                        { status: 403, retryable: true }
                    );
                }
                return new GitHubAPIError(
                    "No tenés permisos suficientes para esta operación. Revisá los scopes de tu token.",
                    { status: 403, retryable: false }
                );
            }
            case 404:
                return new GitHubAPIError(
                    target
                        ? `El recurso "${target}" no fue encontrado. Verificá el nombre e intentá de nuevo.`
                        : "El recurso solicitado no fue encontrado.",
                    { status: 404, retryable: false }
                );
            case 422:
                return new GitHubAPIError(
                    "GitHub rechazó la operación por datos inválidos (nombre duplicado, campos incorrectos, etc.).",
                    { status: 422, retryable: false, details: { errors: (err.response?.data as any)?.errors } }
                );
            default:
                return new GitHubAPIError(
                    `GitHub respondió con un error inesperado (status ${status}).`,
                    { status, retryable: status >= 500 }
                );
        }
    }

    // Cualquier otra cosa.
    return new AppError({
        code: "UNKNOWN_ERROR",
        message: "Ocurrió un error inesperado.",
        retryable: false,
    });
}