import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listRepositoriesHandler } from "./handlers/list-repositories.handler.js";
import { createRepositoryHandler } from "./handlers/create-repository.handler.js";
import { createCommitHandler } from "./handlers/create-commit.handler.js";
import { listIssuesHandler } from "./handlers/list-issues.handler.js";
import { createIssueHandler } from "./handlers/create-issue.handler.js";
import { AppError } from "./errors/app-errors.js";
import { healthCheckHandler } from "./handlers/health-check.handler.js";

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

// Tool: health check — verifica conectividad y autenticación con GitHub.
server.registerTool(
    "health_check",
    {
        description:
            "Verifica que el servidor puede conectarse a GitHub y que el token es válido. Devuelve el usuario autenticado si todo está OK. Usar para diagnosticar problemas de conexión o autenticación.",
        inputSchema: {},
    },
    async () => {
        try {
            const result = await healthCheckHandler();
            return {
                content: [
                    {
                        type: "text",
                        text: `Conexión OK. Autenticado como: ${result.user}`,
                    },
                ],
            };
        } catch (err) {
            const message = err instanceof AppError ? err.message : "Error inesperado.";
            return {
                content: [{ type: "text", text: `Health check falló: ${message}` }],
                isError: true,
            };
        }
    }
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

// Tool: listar repositorios del usuario autenticado.
server.registerTool(
    "list_repositories",
    {
        description:
            "Lista los repositorios de la cuenta autenticada de GitHub. Usar cuando el usuario quiere ver, listar o descubrir sus repos. Permite filtrar por visibilidad y ordenar.",
        inputSchema: {
            visibility: z.enum(["all", "public", "private"]).optional().describe("Filtrar por visibilidad (default: all)"),
            sort: z.enum(["created", "updated", "pushed", "full_name"]).optional().describe("Criterio de orden (default: updated)"),
            per_page: z.number().int().optional().describe("Cantidad de repos a traer, máx 100 (default: 30)"),
        },
    },
    async (args) => {
        try {
            const repos = await listRepositoriesHandler(args);
            const text = repos.length
                ? repos.map((r) => `- ${r.fullName} (${r.url})`).join("\n")
                : "No se encontraron repositorios.";
            return {
                content: [{ type: "text", text: `Repositorios (${repos.length}):\n${text}` }],
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

// Tool: crear un issue en un repositorio.
server.registerTool(
    "create_issue",
    {
        description:
            "Crea un nuevo issue en un repositorio de GitHub. Usar cuando el usuario quiere abrir un issue, reportar un bug o registrar una tarea. Requiere owner, repo y título.",
        inputSchema: {
            owner: z.string().describe("Dueño del repositorio (usuario u organización)"),
            repo: z.string().describe("Nombre del repositorio"),
            title: z.string().describe("Título del issue"),
            body: z.string().optional().describe("Descripción/cuerpo del issue (opcional)"),
        },
    },
    async (args) => {
        try {
            const issue = await createIssueHandler(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Issue #${issue.number} creado: ${issue.title}\nURL: ${issue.url}`,
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

// Tool: listar issues de un repositorio.
server.registerTool(
    "list_issues",
    {
        description:
            "Lista los issues de un repositorio de GitHub. Por defecto muestra los abiertos. Usar cuando el usuario quiere ver el backlog o los issues de un repo. Requiere owner y repo.",
        inputSchema: {
            owner: z.string().describe("Dueño del repositorio"),
            repo: z.string().describe("Nombre del repositorio"),
            state: z.enum(["open", "closed", "all"]).optional().describe("Filtrar por estado (default: open)"),
        },
    },
    async (args) => {
        try {
            const issues = await listIssuesHandler(args);
            const text = issues.length
                ? issues.map((i: any) => `- #${i.number} [${i.state}] ${i.title} (${i.url})`).join("\n")
                : "No se encontraron issues.";
            return {
                content: [{ type: "text", text: `Issues (${issues.length}):\n${text}` }],
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

// Tool: crear un commit agregando o modificando un archivo.
server.registerTool(
    "create_commit",
    {
        description:
            "Crea un commit agregando o modificando un archivo en un repositorio de GitHub. Usar cuando el usuario quiere agregar/editar un archivo y commitear el cambio. Requiere owner, repo, path del archivo, contenido y mensaje de commit.",
        inputSchema: {
            owner: z.string().describe("Dueño del repositorio"),
            repo: z.string().describe("Nombre del repositorio"),
            branch: z.string().optional().describe("Rama destino (default: main)"),
            path: z.string().describe("Ruta del archivo dentro del repo, ej: docs/README.md"),
            content: z.string().describe("Contenido del archivo en texto plano"),
            message: z.string().describe("Mensaje del commit"),
        },
    },
    async (args) => {
        try {
            const result = await createCommitHandler(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Commit creado: ${result.commitSha}\nURL: ${result.commitUrl}`,
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

}

main().catch((err) => {
    console.error("[fatal]", err);
    process.exit(1);
});