import { z } from "zod";

export const createRepositorySchema = z.object({
    name: z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres")
        .regex(
            /^[A-Za-z0-9._-]+$/,
            "El nombre solo puede contener letras, números, puntos, guiones y guiones bajos (sin espacios)"
        ),
    description: z
        .string()
        .max(350, "La descripción no puede superar los 350 caracteres")
        .optional(),
    private: z.boolean().optional().default(false),
});