import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
  full_name: z.string().optional(),
  badge_number: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  badge_number: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  avatar_url: z.string().optional()
});

export const CaseSchema = z.object({
  title: z.string().min(3, 'Case title must be at least 3 characters'),
  case_number: z.string().min(3, 'Case number must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().min(2, 'Location is required'),
  officer: z.string().min(2, 'Officer name is required'),
  crime_type: z.string().min(2, 'Crime type is required'),
  incident_date: z.string().min(4, 'Incident date is required'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional()
});

export const ChatSchema = z.object({
  case_id: z.string().min(1, 'Case ID is required'),
  message: z.string().min(1, 'Message cannot be empty')
});

export const AnalyzeSchema = z.object({
  case_id: z.string().min(1, 'Case ID is required')
});
