import { createIssueSchema } from "../schemas/create-issue-schema.js";
import { createIssue } from "../github/operations.js";
import { ValidationError } from "../errors/app-errors.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function createIssueHandler(input: unknown) {
    const parsed = createIssueSchema.safeParse(input);
    if (!parsed.success) {
        throw new ValidationError(
            "Los datos para crear el issue no son válidos.",
            { issues: parsed.error.issues }
        );
    }

    try {
        return await createIssue(parsed.data);
    } catch (err) {
        throw mapGitHubError(err, { owner: parsed.data.owner, repo: parsed.data.repo });
    }
}