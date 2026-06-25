import { z } from "zod";

export const getRepositorySchema = z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
});