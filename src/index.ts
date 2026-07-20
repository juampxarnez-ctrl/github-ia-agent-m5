import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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