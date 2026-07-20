import { listRepositoriesSchema } from "../schemas/list-repositories-schema.js";
import { listRepositories } from "../github/operations.js";
import { ValidationError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function listRepositoriesHandler(input: unknown) {
    const parsed = listRepositoriesSchema.safeParse(input);
    if (!parsed.success) {
        throw new ValidationError(
            "Los parámetros para listar repositorios no son válidos.",
            { issues: parsed.error.issues }
        );
    }

    try {
        return await listRepositories(parsed.data);
    } catch (err) {
        throw mapGitHubError(err);
    }
}