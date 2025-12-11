import { Applicant, ApplicationStatus, Gender, AIMetrics, SystemLog, AdminUser, ExamQuestion, InterviewSlot, SystemConfig } from '../types';

const STORAGE_KEY = 'rnp_applicants_v3';
const SESSION_KEY = 'rnp_current_session_id';
const LOGS_KEY = 'rnp_system_logs';
const ADMINS_KEY = 'rnp_admin_users';
const EXAM_KEY = 'rnp_exam_questions';
const INTERVIEW_KEY = 'rnp_interview_slots';
const CONFIG_KEY = 'rnp_system_config';

// Helper to simulate Blockchain Hash
const generateHash = (data: string) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16) + Math.random().toString(16).substr(2, 10);
};

// --- SEED DATA ---

const seedData: Applicant[] = [
  {
    id: '1',
    applicationId: 'RNP-2024-0001',
    firstName: 'Jean',
    lastName: 'Mugisha',
    nationalId: '1199580000000001',
    email: 'jean.m@example.com',
    phone: '0788000001',
    gender: Gender.MALE,
    dateOfBirth: '1995-05-12',
    province: 'Kigali City',
    district: 'Gasabo',
    educationLevel: 'Bachelor Degree',
    criminalRecord: false,
    physicalFitnessDeclaration: true,
    status: ApplicationStatus.SHORTLISTED,
    appliedDate: '2024-05-10T10:00:00Z',
    documents: [],
    blockchainHash: '0x8f2a3b9c1d4e5f6',
    fraudScore: 0,
    ipAddress: '197.243.0.1',
    verification: {
      nida: { verified: true, data: 'Identity Confirmed' },
      nesa: { verified: true, data: 'Degree: Computer Science (A0)' },
      police: { verified: true, cleared: true, data: 'No Record Found' }
    },
    adminComments: [],
    aiMetrics: {
        estimatedHeight: '1.78m',
        bodyProportions: 'Athletic',
        fitnessScore: '85/100',
        isPhotoEdited: false,
        confidenceScore: 98
    }
  },
  {
    id: '2',
    applicationId: 'RNP-2024-0002',
    firstName: 'Aline',
    lastName: 'Keza',
    nationalId: '1199870000000002',
    email: 'aline.k@example.com',
    phone: '0788000002',
    gender: Gender.FEMALE,
    dateOfBirth: '1998-08-20',
    province: 'Northern Province',
    district: 'Musanze',
    educationLevel: 'High School Diploma',
    criminalRecord: false,
    physicalFitnessDeclaration: true,
    status: ApplicationStatus.UNDER_REVIEW,
    appliedDate: '2024-05-11T14:30:00Z',
    documents: [],
    blockchainHash: '0x1a2b3c4d5e6f7g8',
    fraudScore: 10,
    ipAddress: '197.243.0.55',
    verification: {
        nida: { verified: false },
        nesa: { verified: false },
        police: { verified: false, cleared: false }
    },
    adminComments: []
  }
];

const seedQuestions: ExamQuestion[] = [
    { id: 1, q: "What is the core motto of RNP?", opts: ["Service, Protection, Integrity", "Power and Justice", "Law and Order", "Defend and Serve"], ans: 0 },
    { id: 2, q: "Which of the following is NOT a department of RNP?", opts: ["Traffic Police", "Criminal Investigation", "Space Exploration", "Fire and Rescue"], ans: 2 },
    { id: 3, q: "Integrity means:", opts: ["Being honest and having strong moral principles", "Being physically strong", "Being able to shoot well", "Being on time"], ans: 0 },
    { id: 4, q: "The mission of the Rwanda National Police is to:", opts: ["Make money", "Deliver high quality service, accountability and transparency", "Control the army", "None of the above"], ans: 1 },
];

const seedSlots: InterviewSlot[] = [
    { id: '1', date: 'Monday, June 12', time: '09:00 AM', capacity: 20, booked: 5 },
    { id: '2', date: 'Monday, June 12', time: '11:00 AM', capacity: 20, booked: 12 },
    { id: '3', date: 'Tuesday, June 13', time: '09:00 AM', capacity: 20, booked: 2 }
];

const defaultConfig: SystemConfig = {
  recruitmentOpen: true,
  announcement: null,
  maintenanceMode: false
};

// --- CORE APPLICANT FUNCTIONS ---

export const getApplicants = (): Applicant[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  try {
      return JSON.parse(data);
  } catch (e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return seedData;
  }
};

export const saveApplicant = (applicant: Applicant): void => {
  const applicants = getApplicants();
  
  // Fraud Detection
  const duplicateIP = applicants.filter(a => a.ipAddress === applicant.ipAddress).length;
  if (duplicateIP > 0) applicant.fraudScore += 20;
  
  // Blockchain Hash
  applicant.blockchainHash = generateHash(applicant.nationalId + applicant.appliedDate);

  applicants.push(applicant);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
  
  logAction('NEW_APPLICATION', 'System', `New application received: ${applicant.applicationId}`);
};

export const updateApplicantStatus = (id: string, newStatus: ApplicationStatus, extraData: Partial<Applicant> = {}): void => {
  const applicants = getApplicants();
  const index = applicants.findIndex(a => a.id === id);
  if (index !== -1) {
    applicants[index] = { ...applicants[index], status: newStatus, ...extraData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
    logAction('STATUS_UPDATE', 'Admin', `Updated ${applicants[index].applicationId} to ${newStatus}`);
  }
};

export const submitExam = (id: string, score: number): void => {
    updateApplicantStatus(id, ApplicationStatus.EXAM_SUBMITTED, { examScore: score, examDate: new Date().toISOString() });
    logAction('EXAM_SUBMISSION', 'System', `Applicant ${id} submitted exam. Score: ${score}`);
};

export const scheduleInterview = (id: string, dateSlot: string): void => {
    updateApplicantStatus(id, ApplicationStatus.INTERVIEW_SCHEDULED, { interviewDate: dateSlot });
    
    // Update slot booking count
    const slots = getInterviewSlots();
    // Simplified: find slot where match happens (In real app, update by ID)
    // For mock visualization, we won't strictly update the slot count in this array because status is primary
    logAction('INTERVIEW_BOOKING', 'System', `Applicant ${id} booked ${dateSlot}`);
};

export const setCurrentApplicantId = (id: string) => {
    localStorage.setItem(SESSION_KEY, id);
};

export const getCurrentApplicantId = (): string | null => {
    return localStorage.getItem(SESSION_KEY);
};

export const addAdminComment = (id: string, comment: string) => {
    const applicants = getApplicants();
    const index = applicants.findIndex(a => a.id === id);
    if (index !== -1) {
        if (!applicants[index].adminComments) applicants[index].adminComments = [];
        applicants[index].adminComments.push({
            author: 'Admin',
            text: comment,
            date: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
    }
};

// --- SUPER ADMIN & LOGS FUNCTIONS ---

export const getSystemLogs = (): SystemLog[] => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
};

export const logAction = (action: string, user: string, details: string) => {
    const logs = getSystemLogs();
    logs.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        user,
        details
    });
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getAdmins = (): AdminUser[] => {
    const data = localStorage.getItem(ADMINS_KEY);
    return data ? JSON.parse(data) : [];
};

export const addAdmin = (name: string, email: string): AdminUser => {
    const admins = getAdmins();
    const newAdmin: AdminUser = {
        id: Date.now().toString(),
        name,
        email,
        role: 'RECRUITER',
        accessCode: `RNP-ADMIN-${Math.floor(1000 + Math.random() * 9000)}`,
        dateAdded: new Date().toISOString()
    };
    admins.push(newAdmin);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    logAction('ADD_ADMIN', 'SuperAdmin', `Created admin account for ${email}`);
    return newAdmin;
};

export const getExamQuestions = (): ExamQuestion[] => {
    const data = localStorage.getItem(EXAM_KEY);
    if (!data) {
        localStorage.setItem(EXAM_KEY, JSON.stringify(seedQuestions));
        return seedQuestions;
    }
    return JSON.parse(data);
};

export const saveExamQuestions = (questions: ExamQuestion[]) => {
    localStorage.setItem(EXAM_KEY, JSON.stringify(questions));
    logAction('UPDATE_EXAM', 'SuperAdmin', 'Updated exam questions repository');
};

export const getInterviewSlots = (): InterviewSlot[] => {
    const data = localStorage.getItem(INTERVIEW_KEY);
    if (!data) {
        localStorage.setItem(INTERVIEW_KEY, JSON.stringify(seedSlots));
        return seedSlots;
    }
    return JSON.parse(data);
};

export const saveInterviewSlots = (slots: InterviewSlot[]) => {
    localStorage.setItem(INTERVIEW_KEY, JSON.stringify(slots));
    logAction('UPDATE_INTERVIEW', 'SuperAdmin', 'Updated interview calendar');
};

export const getSystemConfig = (): SystemConfig => {
    const data = localStorage.getItem(CONFIG_KEY);
    if(!data) {
        return defaultConfig;
    }
    return JSON.parse(data);
};

export const saveSystemConfig = (config: SystemConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    logAction('UPDATE_CONFIG', 'SuperAdmin', 'Updated Global System Configuration');
};

export const resetSystemData = () => {
    localStorage.clear();
    logAction('SYSTEM_RESET', 'SuperAdmin', 'Performed Full System Factory Reset');
};

// --- MOCK API SERVICES ---

export const mockNIDACheck = async (nid: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`NIDA Verified: ${nid} matches database records. Parents: Verified.`), 1500);
    });
};

export const mockNESACheck = async (nid: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(`NESA Verified: A2 Diploma (2018) - Physics, Chem, Bio. Grade: Excellent.`), 2000);
    });
};

export const mockPoliceClearance = async (nid: string): Promise<{cleared: boolean, msg: string}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (nid.endsWith('9')) {
                resolve({ cleared: false, msg: 'ALERT: Past minor offense (2020). Requires manual review.' });
            } else {
                resolve({ cleared: true, msg: 'CR Record: CLEAR. No history found.' });
            }
        }, 1800);
    });
};

export const mockAIPhotoAnalysis = async (): Promise<AIMetrics> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                estimatedHeight: (1.70 + Math.random() * 0.15).toFixed(2) + 'm',
                bodyProportions: 'Within RNP Standards',
                fitnessScore: Math.floor(70 + Math.random() * 30).toString() + '/100',
                isPhotoEdited: Math.random() > 0.9,
                confidenceScore: 95
            });
        }, 3000);
    });
};

export const checkStatus = (nid: string, appId: string): Applicant | undefined => {
  const applicants = getApplicants();
  return applicants.find(
    a => a.nationalId === nid && a.applicationId.toUpperCase() === appId.toUpperCase()
  );
};

export const generateApplicationId = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RNP-2024-${random}`;
};