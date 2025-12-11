export enum ApplicationStatus {
  RECEIVED = 'Received',
  UNDER_REVIEW = 'Under Review',
  SHORTLISTED = 'Shortlisted',
  EXAM_INVITE = 'Invited for Exam',
  EXAM_SUBMITTED = 'Exam Submitted',
  EXAM_PASSED = 'Exam Passed',
  EXAM_FAILED = 'Exam Failed',
  INTERVIEW_INVITE = 'Invited for Interview',
  INTERVIEW_SCHEDULED = 'Interview Scheduled',
  FINAL_REVIEW = 'Final Review',
  FINAL_SELECTION = 'Selected for Training',
  NOT_SELECTED = 'Not Selected',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface DocumentUpload {
  name: string;
  type: string;
  url: string;
  dateUploaded: string;
}

export interface VerificationStatus {
  nida: { verified: boolean; data?: string; timestamp?: string };
  nesa: { verified: boolean; data?: string; timestamp?: string };
  police: { verified: boolean; cleared: boolean; data?: string; timestamp?: string };
}

export interface AIMetrics {
  estimatedHeight: string;
  bodyProportions: string;
  fitnessScore: string;
  isPhotoEdited: boolean;
  confidenceScore: number;
}

export interface Applicant {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  province: string;
  district: string;
  educationLevel: string;
  criminalRecord: boolean;
  physicalFitnessDeclaration: boolean;
  status: ApplicationStatus;
  appliedDate: string;
  documents: DocumentUpload[];
  blockchainHash: string;
  fraudScore: number;
  ipAddress: string;
  aiMetrics?: AIMetrics;
  verification: VerificationStatus;
  adminComments: { author: string; text: string; date: string }[];
  examScore?: number;
  examDate?: string;
  interviewDate?: string;
}

// --- NEW TYPES FOR SUPER ADMIN ---

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string; // e.g., "LOGIN", "UPDATE_STATUS", "ADD_ADMIN"
  user: string; // "SuperAdmin", "Admin-1", "Applicant-ID"
  details: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'RECRUITER' | 'SUPER_ADMIN';
  accessCode: string;
  dateAdded: string;
  lastLogin?: string;
}

export interface ExamQuestion {
  id: number;
  q: string;
  opts: string[];
  ans: number; // Index of correct option
}

export interface InterviewSlot {
  id: string;
  date: string; // e.g. "Monday, June 12"
  time: string; // e.g. "09:00 AM"
  capacity: number;
  booked: number;
}

export interface SystemConfig {
  recruitmentOpen: boolean;
  announcement: string | null; // e.g., "Deadline Extended to 15th July"
  maintenanceMode: boolean;
}