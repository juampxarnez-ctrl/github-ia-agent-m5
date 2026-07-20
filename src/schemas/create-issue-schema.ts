import { z } from "zod";

export const createIssueSchema = z.object({
    owner: z.string().min(1, "El owner es obligatorio"),
    repo: z.string().min(1, "El repo es obligatorio"),
    title: z.string().min(1, "El título es obligatorio"),
    body: z.string().optional(),
});