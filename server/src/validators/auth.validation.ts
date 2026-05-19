import z from 'zod';


export const authRegisterSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    name: z.nullish(z.string())
});


export const authLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

export type userInputRegister = z.infer<typeof authRegisterSchema>


export type userInputLogin = z.infer<typeof authLoginSchema>;
