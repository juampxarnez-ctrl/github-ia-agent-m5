import { AppError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

interface RetryOptions {
    maxRetries?: number;   // cuántos reintentos como máximo
    baseDelayMs?: number;  // delay base (se duplica en cada intento)
}

/**
 * Ejecuta una función async con reintentos y exponential backoff.
 * Solo reintenta errores marcados como `retryable` (rate limit, 5xx).
 * Los errores no recuperables (404, 401, validación) se lanzan de inmediato.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 1000;

    let lastError: AppError | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            // Normalizamos a nuestro AppError para poder leer `retryable`.
            const appError = mapGitHubError(err);
            lastError = appError;

            // Si no es recuperable, o ya agotamos los intentos, cortamos.
            if (!appError.retryable || attempt === maxRetries) {
                throw appError;
            }

            // Exponential backoff: 1s, 2s, 4s...
            const delay = baseDelayMs * Math.pow(2, attempt);
            // Log a stderr (nunca stdout, rompe el protocolo MCP).
            console.error(
                `[retry] Error recuperable (${appError.code}). Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // No debería llegar acá, pero por seguridad de tipos:
    throw lastError ?? new AppError({ code: "UNKNOWN_ERROR", message: "Error desconocido en retry" });
}