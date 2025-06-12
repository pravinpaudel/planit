import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string()
        .email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters'),
    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .optional(),
    email: z.string()
        .email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .refine(
            (password) => /[A-Z]/.test(password),
            'Password must contain at least one uppercase letter'
        )
        .refine(
            (password) => /[0-9]/.test(password),
            'Password must contain at least one number'
        ),
    confirmPassword: z.string()
        .min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type LoginFormInputs = z.infer<typeof loginSchema>;
export type RegisterFormInputs = z.infer<typeof registerSchema>;
