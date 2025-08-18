import { z } from 'zod';

// Base user schema with common fields
const userBaseSchema = z.object({
  email: z.email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(30),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(30),
});

// Register-specific schema
export const registerSchema = userBaseSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Login schema (example of another schema)
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string("Password is required").min(8, 'Invalid credentials'),
});

// Export types for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;