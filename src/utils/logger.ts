type LogLevel = "debug" | "info" | "warn" | "error";

// Orden de severidad: debug < info < warn < error.
const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// Nivel mínimo a loguear. Configurable por variable de entorno LOG_LEVEL.
// Por defecto "info" (no muestra debug salvo que se pida explícitamente).
const configuredLevel = (process.env.LOG_LEVEL as LogLevel) ?? "info";
const minPriority = LEVEL_PRIORITY[configuredLevel] ?? LEVEL_PRIORITY.info;

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    // Solo logueamos si el nivel es igual o más severo que el configurado.
    if (LEVEL_PRIORITY[level] < minPriority) return;

    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    const line = meta ? `${base} ${JSON.stringify(meta)}` : base;

    // SIEMPRE a stderr: stdout está reservado para el protocolo MCP (JSON-RPC).
    console.error(line);
}

export const logger = {
    debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
    info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};