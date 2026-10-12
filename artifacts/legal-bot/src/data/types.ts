export interface Section {
  id: string;
  act: string;
  number: string;
  title: string;
  chapter?: string;
  description: string;
  penalty?: string;
  bailable?: boolean;
  cognizable?: boolean;
  compoundable?: boolean;
  triableBy?: string;
  bnsEquivalent?: string;
  bnsNumber?: string;
  ipcEquivalent?: string;
  ipcNumber?: string;
  keywords: string[];
  officialLink?: string;
}

export interface Act {
  id: string;
  name: string;
  shortName: string;
  year: number;
  description: string;
  totalSections: number;
  category: 'Criminal' | 'Civil' | 'Constitutional' | 'Commercial' | 'Cyber' | 'Family' | 'Labour';
  keyTopics: string[];
  officialLink?: string;
}

export interface ConstitutionArticle {
  article: string;
  title: string;
  part: string;
  description: string;
  keyPrinciples: string[];
  landmarkCases: string[];
}

export interface CitizenRight {
  id: string;
  title: string;
  category: 'Arrest & Detention' | 'FIR & Police Station' | 'Women & Child' | 'Cyber & Digital' | 'Consumer' | 'Workplace & Labour' | 'Property & Tenant';
  description: string;
  governingLaw: string;
  remedies: string[];
  keyTakeaway: string;
}

export interface Lawyer {
  id: string;
  name: string;
  barCouncilNumber: string;
  state: string;
  city: string;
  experienceYears: number;
  specializations: string[];
  rating: number;
  reviewsCount: number;
  languages: string[];
  court: string;
  phone: string;
  email: string;
  feeEstimate: string;
  isVerified: boolean;
  bio?: string;
  isDemo?: boolean;
  isFreeInitialConsultation?: boolean;
  consultationFee?: number;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredFields: string[];
  sampleDraft: string;
  keyClauses: string[];
}

export interface LegalAidCenter {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  authorityType: 'NALSA' | 'SLSA' | 'DLSA' | 'TLSC';
  services: string[];
}

export interface EmergencyContact {
  id: string;
  service: string;
  number: string;
  description: string;
  availableHours: string;
  category: 'Police' | 'Cyber Crime' | 'Women & Child' | 'Legal Aid' | 'Senior Citizens';
}

export interface LimitationDeadline {
  id: string;
  matter: string;
  limitationPeriod: string;
  startingPoint: string;
  statute: string;
  provision: string;
}

export interface PrecedentCase {
  id: string;
  title: string;
  citation: string;
  year: number;
  bench: string;
  constitutionalIssue: string;
  keyRatio: string;
  impact: string;
}

export interface ApplicableProvision {
  actName: string;
  sectionNumber: string;
  explanation: string;
  whyApplicable: string;
  conditionsOrLimitations?: string;
  officialSourceLink: string;
}

export interface StructuredLegalAnswer {
  quickAnswer: string;
  detailedExplanation: string;
  applicableLaws: ApplicableProvision[];
  immediateSteps?: string[];
  officialSources: { title: string; url: string; authority: string }[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sectionsReferenced?: Section[];
  quickActions?: string[];
  source?: 'gemini-2.5-flash' | 'statutory-engine';
  structured?: StructuredLegalAnswer;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface FlaggedClause {
  clauseTitle: string;
  severity?: 'Low' | 'Medium' | 'High';
  issue: string;
  recommendation: string;
  evidenceSnippet: string;
  relevantLaw?: string;
}

export interface ExtractedParty {
  role: string;
  name: string;
}

export interface ExtractedDate {
  label: string;
  dateOrPeriod: string;
}

export interface ExtractedClause {
  clauseTitle: string;
  originalTextSnippet: string;
  purpose: string;
}

export interface ExtractedFacts {
  documentType: string;
  subject: string;
  parties: ExtractedParty[];
  importantDates: ExtractedDate[];
  keyObligations: string[];
  importantClauses: ExtractedClause[];
}

export interface OfficialSource {
  title: string;
  statute: string;
  url: string;
  relevance: string;
}

export interface DocumentAnalysisResult {
  summary: string;
  plainLanguageExplanation: string;
  documentType: string;
  subject: string;
  riskScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  governingLawCompliance?: string;
  extractedFacts: ExtractedFacts;
  flaggedClauses: FlaggedClause[];
  missingProtections?: string[];
  positiveAspects?: string[];
  recommendedNextSteps: string[];
  officialSources: OfficialSource[];
}

export interface ConsultationInquiry {
  id: string;
  lawyerId: string;
  lawyerName: string;
  lawyerBarCouncil: string;
  lawyerCourt: string;
  lawyerCity: string;
  documentName: string;
  documentType: string;
  documentSummary: string;
  extractedIssues: string[];
  userName: string;
  userPhone: string;
  userEmail: string;
  userLocation: string;
  userNote?: string;
  consentGiven: boolean;
  status: 'Pending Advocate Review' | 'Accepted' | 'Completed';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'citizen' | 'lawyer' | 'admin';
  phone?: string;
  barCouncilNumber?: string;
  createdAt: string;
}
