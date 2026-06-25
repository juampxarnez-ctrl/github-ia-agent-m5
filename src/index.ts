import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
    name: "github-ia-agent",
    version: "1.0.0",
});

console.error("MCP Server initialized");