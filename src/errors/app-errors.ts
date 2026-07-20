// src/errors/app-errors.ts

export type ErrorCode =
    | "VALIDATION_ERROR"
    | "AUTH_ERROR"
    | "GITHUB_API_ERROR"
    | "NETWORK_ERROR"
    | "UNKNOWN_ERROR";

// Clase base: todos los errores del dominio heredan de esta.
export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly status?: number;
    public readonly retryable: boolean;
    public readonly details?: Record<string, unknown>;

    constructor(opts: {
        code: ErrorCode;
        message: string;
        status?: number;
        retryable?: boolean;
        details?: Record<string, unknown>;
    }) {
        super(opts.message);
        this.name = "AppError";
        this.code = opts.code;
        this.status = opts.status;
        this.retryable = opts.retryable ?? false;
        this.details = opts.details;
    }
}

// Input inválido (falló el schema de Zod). Nunca retryable: el problema es del input.
export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, unknown>) {
        super({ code: "VALIDATION_ERROR", message, status: 400, retryable: false, details });
        this.name = "ValidationError";
    }
}

// Credenciales ausentes o inválidas (token). No se reintenta: hay que arreglar el token.
export class AuthenticationError extends AppError {
    constructor(message = "Token de GitHub inválido o ausente.") {
        super({ code: "AUTH_ERROR", message, status: 401, retryable: false });
        this.name = "AuthenticationError";
    }
}

// Fallo transitorio de red (timeout, ECONNRESET). Sí retryable.
export class NetworkError extends AppError {
    constructor(message = "Error de red al conectar con GitHub.", details?: Record<string, unknown>) {
        super({ code: "NETWORK_ERROR", message, status: 503, retryable: true, details });
        this.name = "NetworkError";
    }
}

// La API de GitHub respondió con un rechazo (404, 403, 422, 5xx...).
export class GitHubAPIError extends AppError {
    constructor(
        message: string,
        opts?: { status?: number; retryable?: boolean; details?: Record<string, unknown> }
    ) {
        super({
            code: "GITHUB_API_ERROR",
            message,
            status: opts?.status,
            retryable: opts?.retryable ?? false,
            details: opts?.details,
        });
        this.name = "GitHubAPIError";
    }
}