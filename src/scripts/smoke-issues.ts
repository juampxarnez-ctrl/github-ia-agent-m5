import { getRepositoryIssues } from "../github/operations.js";

async function main() {
    try {
        console.log("Fetching issues for juampxarnez-ctrl/test-mcp-repo-1...");
        const issues = await getRepositoryIssues(
            "juampxarnez-ctrl",
            "test-mcp-repo-1"
        );

        console.log("=== ISSUES SUMMARY ===");
        console.log(issues);
    } catch (error) {
        console.error("Error fetching issues:", error);
    }
}

main();