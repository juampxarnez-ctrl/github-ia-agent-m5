import { getRepositorySchema } from "../schemas/repository-schema.js";

async function main() {

    const validInput = {
        owner: "facebook",
        repo: "react",
    };

    const invalidInput = {
        owner: "",
        repo: "",
    };

    console.log("=== VALID INPUT ===");

    console.log(
        getRepositorySchema.safeParse(validInput)
    );

    console.log("=== INVALID INPUT ===");

    console.log(
        getRepositorySchema.safeParse(invalidInput)
    );
}

main();