import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL']),
  areaId: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val)),
});

export const createAreaSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal válido'),
});

export const loginSchema = z.object({
  email: z.string().email('Email válido requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Nombre requerido'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
