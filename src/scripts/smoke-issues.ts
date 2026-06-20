import { getRepositoryIssues, getIssue } from "../github/operations.js";

async function main() {
    const issues = await getRepositoryIssues(
        "facebook",
        "react"
    );

    console.log("=== ISSUES SUMMARY ===");
    console.log(issues);

    const firstIssue = issues[0]

    console.log("=== ISSUE INFO ===");
    const details = await getIssue(
        "facebook",
        "react",
        firstIssue.number
    );

    console.log(details);
}

main();