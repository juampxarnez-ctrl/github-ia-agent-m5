import { getRepositoryHandler } from "../handlers/repository.handler.js";

async function main() {

    console.log("=== VALID INPUT ===");

    const validResult = await getRepositoryHandler({
        owner: "facebook",
        repo: "react",
    });

    console.log(validResult);

    console.log("=== INVALID INPUT ===");

    const invalidResult = await getRepositoryHandler({
        owner: "",
        repo: "",
    });

    console.log(invalidResult);
}

main();