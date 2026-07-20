import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createRepositoryHandler } from "./handlers/create-repository.handler.js";
import { AppError } from "./errors/app-errors.js";

const server = new McpServer({
    name: "github-ia-agent",
    version: "1.0.0",
});

// Tool mínima de health-check para validar que el server responde.
server.registerTool(
    "ping",
    {
        description:
            "Health-check del servidor. Devuelve 'pong' para confirmar que el MCP server está vivo y respondiendo.",
        inputSchema: {
            message: z.string().optional().describe("Mensaje opcional a devolver"),
        },
    },
    async ({ message }) => ({
        content: [
            {
                type: "text",
                text: message ? `pong: ${message}` : "pong",
            },
        ],
    })
);

// Tool: crear un repositorio en la cuenta autenticada.
server.registerTool(
    "create_repository",
    {
        description:
            "Crea un nuevo repositorio en la cuenta autenticada de GitHub. Usar cuando el usuario quiere crear/inicializar un repo nuevo. Requiere un nombre válido (3-100 caracteres, sin espacios).",
        inputSchema: {
            name: z.string().describe("Nombre del repositorio (3-100 caracteres, letras, números, - _ .)"),
            description: z.string().optional().describe("Descripción breve del repositorio"),
            private: z.boolean().optional().describe("Si el repo debe ser privado (default: false)"),
        },
    },
    async (args) => {
        try {
            const repo = await createRepositoryHandler(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Repositorio creado: ${repo.fullName}\nURL: ${repo.url}`,
                    },
                ],
            };
        } catch (err) {
            const message = err instanceof AppError ? err.message : "Error inesperado.";
            return {
                content: [{ type: "text", text: `Error: ${message}` }],
                isError: true,
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // OJO: log SIEMPRE a stderr, nunca a stdout (stdout es el canal del protocolo).
    console.error("[mcp] github-ia-agent v1.0.0 iniciado por stdio");
}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});