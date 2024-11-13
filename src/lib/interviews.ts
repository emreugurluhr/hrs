import { db, Interview } from './db';

export async function createInterview(data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date().toISOString();
  const interview: Interview = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  return await db.interviews.add(interview);
}

export async function getInterviewByCandidateId(candidateId: number): Promise<Interview | undefined> {
  return await db.interviews.where('candidateId').equals(candidateId).first();
}

export async function updateInterview(id: number, data: Partial<Omit<Interview, 'id' | 'candidateId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  await db.interviews.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteInterview(id: number): Promise<void> {
  await db.interviews.delete(id);
}