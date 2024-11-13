import { z } from 'zod';

export const candidateSchema = z.object({
  collarType: z.enum(['blue', 'white']),
  fullName: z.string().min(2).max(100),
  birthDate: z.string(),
  registeredCity: z.string(),
  hometown: z.string(),
  militaryStatus: z.string().optional(),
  experience: z.number().min(0).max(50),
  email: z.string().email(),
  interviewDate: z.string().optional(),
  serviceLine: z.string().optional(),
  result: z.enum(['Olumlu', 'Olumsuz']).optional(),
  rejectionReason: z.string().optional(),
  invitationDate: z.string().optional(),
});

export const interviewSchema = z.object({
  candidateId: z.number(),
  education: z.string(),
  proposedSalary: z.number().positive(),
  hasAcquaintance: z.boolean(),
  applicationSource: z.string(),
  supervisor: z.string(),
  cvPath: z.string().optional(),
});