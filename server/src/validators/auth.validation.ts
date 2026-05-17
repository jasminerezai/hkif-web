import z from 'zod';


export const authRegisterInput = z.object({
    email: z.email(),
    password: z.string().length(8),
    name: z.nullish(z.string())
});


export const authLoginInput = z.object({
    email: z.email(),
    password: z.string().length(8),
});