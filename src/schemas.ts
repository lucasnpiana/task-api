import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: "O título é obrigatório." })
    .trim()
    .min(3, "O título deve ter no mínimo 3 caracteres."),
  description: z.string().trim().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;