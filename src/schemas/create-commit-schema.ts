import { z } from "zod";

export const createCommitSchema = z.object({
    owner: z.string().min(1, "El owner es obligatorio"),
    repo: z.string().min(1, "El repo es obligatorio"),
    branch: z.string().min(1).optional().default("main"),
    path: z.string().min(1, "El path del archivo es obligatorio"),
    content: z.string(),
    message: z.string().min(1, "El mensaje de commit es obligatorio"),
});