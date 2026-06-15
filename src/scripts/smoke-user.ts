import { getUser } from "../github/operations.js";

async function main() {
    const user = await getUser("torvalds");

    console.log("Usuario Obtenido:", user);
}

main();