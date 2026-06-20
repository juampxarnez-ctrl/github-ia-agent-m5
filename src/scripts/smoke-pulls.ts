import { getRepositoryPullRequests, getPullRequest } from "../github/operations.js";
async function main() {
    const pulls = await getRepositoryPullRequests(
        "facebook",
        "react"
    );
    console.log("=== PULL REQUESTS SUMMARY ===");
    console.log(pulls);

    const firstPull = pulls[0];
    const prInfo = await getPullRequest(
        "facebook",
        "react",
        firstPull.number
    );
    console.log("=== PULL REQUEST INFO ===");
    console.log(prInfo);
}
main();