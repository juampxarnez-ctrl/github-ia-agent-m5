import { getRepository } from "../github/operations.js";

async function main() {
    const repo = await getRepository(
        "facebook",
        "react"
    );

    console.log("Repositorio Obtenido:", repo);
}

main();