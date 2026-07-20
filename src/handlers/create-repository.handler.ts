import { createRepositorySchema } from "../schemas/create-repository-schema.js";
import { createRepository } from "../github/operations.js";
import { ValidationError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function createRepositoryHandler(input: unknown) {
    // 1. Validar input ANTES de tocar la API.
    const parsed = createRepositorySchema.safeParse(input);
    if (!parsed.success) {
        throw new ValidationError(
            "Los datos para crear el repositorio no son válidos.",
            { issues: parsed.error.issues }
        );
    }

    // 2. Ejecutar, traduciendo cualquier error de GitHub a lenguaje natural.
    try {
        return await createRepository(parsed.data);
    } catch (err) {
        throw mapGitHubError(err, { resource: parsed.data.name });
    }
}