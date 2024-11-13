import Dexie from 'dexie';

export interface Candidate {
  id?: number;
  fullName: string;
  birthDate: Date;
  cityOfRegistry: string;
  hometown: string;
  militaryStatus: string;
  experience: number;
  email: string;
  interviewDate: Date;
  serviceRoute: string;
  result: string;
  rejectionReason?: string;
  invitationDate?: Date;
  collarType: 'blue' | 'white';
  positionId?: number;
  createdAt: Date;
}

export interface Position {
  id?: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Interview {
  id?: number;
  candidateId: number;
  education: string;
  offeredSalary: number;
  hasRelativesInCompany: boolean;
  applicationSource: string;
  directManager: string;
  cvPath?: string;
  createdAt: Date;
}

export interface Reference {
  id?: number;
  candidateId: number;
  referrerName: string;
  referrerCurrentCompany: string;
  workedTogether: string;
  yearsWorkedTogether: string;
  candidatePosition: string;
  reasonForLeaving: string;
  referenceResult: string;
  referenceDate: Date;
  referenceNotes: string;
  createdAt: Date;
}

export interface ApprovalForm {
  id?: number;
  candidateId: number;
  approvalDate: Date;
  approvalStatus: string;
  notes: string;
  createdAt: Date;
}

class HRDatabase extends Dexie {
  candidates: Dexie.Table<Candidate, number>;
  positions: Dexie.Table<Position, number>;
  interviews: Dexie.Table<Interview, number>;
  references: Dexie.Table<Reference, number>;
  approvalForms: Dexie.Table<ApprovalForm, number>;

  constructor() {
    super('HRDatabase');

    this.version(4200).stores({
      candidates: '++id, fullName, email, positionId, collarType, result, createdAt',
      positions: '++id, name, isActive, createdAt',
      interviews: '++id, candidateId, createdAt',
      references: '++id, candidateId, createdAt',
      approvalForms: '++id, candidateId, approvalStatus, createdAt'
    });

    this.candidates = this.table('candidates');
    this.positions = this.table('positions');
    this.interviews = this.table('interviews');
    this.references = this.table('references');
    this.approvalForms = this.table('approvalForms');
  }
}

const initializeDatabase = async () => {
  try {
    // Delete existing database
    await Dexie.delete('HRDatabase');
    
    // Create new instance
    const db = new HRDatabase();
    
    // Open database
    await db.open();
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const db = await initializeDatabase();