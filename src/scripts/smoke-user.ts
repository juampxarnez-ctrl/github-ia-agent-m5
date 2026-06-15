import {
    getUser,
    getUserSummary,
} from "../github/operations.js";

async function main() {

    console.log("=== USER INFO ===");

    const user = await getUser("sritasugar");

    console.log(user);

    console.log("=== USER SUMMARY ===");

    const summary = await getUserSummary("juampxarnez-ctrl");

    console.log(summary);
}

main();