import { listIssuesSchema } from "../schemas/list-issues-schema.js";
import { getRepositoryIssues } from "../github/operations.js";
import { ValidationError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function listIssuesHandler(input: unknown) {
    const parsed = listIssuesSchema.safeParse(input);
    if (!parsed.success) {
        throw new ValidationError(
            "Los parámetros para listar issues no son válidos.",
            { issues: parsed.error.issues }
        );
    }

    try {
        return await getRepositoryIssues(
            parsed.data.owner,
            parsed.data.repo,
            parsed.data.state
        );
    } catch (err) {
        throw mapGitHubError(err, { owner: parsed.data.owner, repo: parsed.data.repo });
    }
}