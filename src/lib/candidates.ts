import { db, type Candidate } from './db';

export const createCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const candidate: Omit<Candidate, 'id'> = {
    ...candidateData,
    interviewDate: candidateData.interviewDate || null,
    serviceLine: candidateData.serviceLine || null,
    result: candidateData.result || null,
    rejectionReason: candidateData.rejectionReason || null,
    invitationDate: candidateData.invitationDate || null,
    createdAt: now,
    updatedAt: now,
  };
  
  return await db.candidates.add(candidate);
};

export const updateCandidate = async (id: number, candidateData: Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const now = new Date().toISOString();
  await db.candidates.update(id, {
    ...candidateData,
    updatedAt: now,
  });
};

export const deleteCandidate = async (id: number) => {
  await db.candidates.delete(id);
};