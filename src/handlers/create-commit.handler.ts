import { createCommitSchema } from "../schemas/create-commit-schema.js";
import { createCommit } from "../github/operations.js";
import { ValidationError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function createCommitHandler(input: unknown) {
    const parsed = createCommitSchema.safeParse(input);
    if (!parsed.success) {
        throw new ValidationError(
            "Los datos para crear el commit no son válidos.",
            { issues: parsed.error.issues }
        );
    }

    try {
        return await createCommit(parsed.data);
    } catch (err) {
        throw mapGitHubError(err, { owner: parsed.data.owner, repo: parsed.data.repo });
    }
}