const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(['driver', 'passenger', 'admin']),
  plate: z.string().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const tripSchema = z.object({
  score: z.number().min(0).max(100),
  speedAvg: z.number().nonnegative(),
  fatigueMax: z.number().min(0).max(100),
  distance: z.number().nonnegative(),
  durationSeconds: z.number().int().nonnegative(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

const auditSchema = z.object({
  driverPlate: z.string().min(7).max(8),
  roadContext: z.string(),
  weatherContext: z.string(),
  score: z.number().min(0).max(100),
  ratingStars: z.number().int().min(1).max(5),
  positiveActions: z.array(z.string()).default([]),
  infractions: z.array(z.string()).default([]),
  feedback: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

module.exports = {
  registerSchema,
  loginSchema,
  tripSchema,
  auditSchema,
};
