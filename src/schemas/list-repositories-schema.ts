import { z } from "zod";

export const listRepositoriesSchema = z.object({
    visibility: z.enum(["all", "public", "private"]).optional().default("all"),
    sort: z.enum(["created", "updated", "pushed", "full_name"]).optional().default("updated"),
    per_page: z.number().int().min(1).max(100).optional().default(30),
});