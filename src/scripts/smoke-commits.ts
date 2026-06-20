import { getRepositoryIssues } from "../github/operations.js";

async function main() {

    const issues = await getRepositoryIssues(
        "facebook",
        "react"
    );

    console.log("=== ISSUES SUMMARY ===");
    console.log(issues);

}

main();