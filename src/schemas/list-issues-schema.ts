import { z } from "zod";

export const listIssuesSchema = z.object({
    owner: z.string().min(1, "El owner es obligatorio"),
    repo: z.string().min(1, "El repo es obligatorio"),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
});