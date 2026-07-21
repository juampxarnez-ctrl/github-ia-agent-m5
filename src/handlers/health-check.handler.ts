import { healthCheck } from "../github/operations.js";
import { mapGitHubError } from "../errors/map-github-error.js";

export async function healthCheckHandler() {
    try {
        return await healthCheck();
    } catch (err) {
        throw mapGitHubError(err);
    }
}