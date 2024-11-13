import { z } from 'zod';

export const candidateSchema = z.object({
  collarType: z.enum(['blue', 'white']),
  fullName: z.string().min(1, 'Ad Soyad gereklidir'),
  birthDate: z.string(),
  registeredCity: z.string().min(1, 'Nüfusa kayıtlı il gereklidir'),
  hometown: z.string().min(1, 'Memleket gereklidir'),
  militaryStatus: z.string().min(1, 'Askerlik durumu gereklidir'),
  totalExperience: z.number().min(0, 'Tecrübe 0 veya daha büyük olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  interviewDate: z.string(),
  serviceRoute: z.string(),
  result: z.enum(['positive', 'negative', 'null']).nullable(),
  negativeReason: z.string().optional(),
  invitationDate: z.string().optional(),
});

export const interviewSchema = z.object({
  candidateId: z.number(),
  collarType: z.enum(['blue', 'white']),
  education: z.string().min(1, 'Eğitim durumu gereklidir'),
  offeredSalary: z.number().min(0, 'Teklif edilen ücret 0 veya daha büyük olmalıdır'),
  hasRelative: z.boolean(),
  applicationSource: z.string().min(1, 'Başvuru kaynağı gereklidir'),
  firstManager: z.string().min(1, 'İlk amir gereklidir'),
  cvFile: z.string().optional(),
});

export const positionSchema = z.object({
  name: z.string().min(1, 'Pozisyon adı gereklidir'),
  description: z.string().min(1, 'Pozisyon açıklaması gereklidir'),
  isActive: z.boolean(),
});