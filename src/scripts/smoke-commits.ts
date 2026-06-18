import {
    getRepositoryCommits,
    getCommit
} from "../github/operations.js";
async function main() {

    const commits = await getRepositoryCommits(
        "facebook",
        "react"
    );

    const firstCommit = commits[0];

    console.log("=== COMMIT SUMMARY ===");
    console.log(firstCommit);

    console.log("\n=== COMMIT INFO ===");

    const detail = await getCommit(
        "facebook",
        "react",
        firstCommit.sha
    );

    console.log(detail);
}

main();