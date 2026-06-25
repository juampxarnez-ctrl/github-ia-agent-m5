import type {
    ErrorCode,
    ToolError,
} from "../types.js";

export function createToolError(
    code: ErrorCode,
    message: string,
    documentationUrl?: string
): ToolError {

    return {
        code,
        message,
        documentationUrl,
    };
}