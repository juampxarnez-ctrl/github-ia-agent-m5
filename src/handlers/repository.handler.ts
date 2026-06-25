import { getRepository } from "../github/operations.js";
import { getRepositorySchema } from "../schemas/repository-schema.js";
import { createToolError } from "../errors/tool-errors.js";

export async function getRepositoryHandler(
    input: unknown
) {
    const parsed = getRepositorySchema.safeParse(input);

    if (!parsed.success) {
        return createToolError(
            "VALIDATION_ERROR",
            "Invalid repository input"
        );
    }

    return getRepository(
        parsed.data.owner,
        parsed.data.repo
    );
}