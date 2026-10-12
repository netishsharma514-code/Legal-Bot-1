import { z } from "zod";

const boundedText = (maximum: number) => z.string().trim().min(1).max(maximum);

export const ConsultationInquirySubmissionSchema = z.object({
  inquiry: z.object({
    id: boundedText(80),
    lawyerId: boundedText(120),
    lawyerName: boundedText(200),
    lawyerBarCouncil: boundedText(120),
    lawyerCourt: boundedText(200),
    lawyerCity: boundedText(120),
    documentName: boundedText(255),
    documentType: boundedText(120),
    documentSummary: z.string().max(6000),
    extractedIssues: z.array(boundedText(1000)).max(30),
    userName: boundedText(200),
    userPhone: boundedText(40),
    userEmail: z.string().trim().email().max(254),
    userLocation: boundedText(160),
    userNote: z.string().max(4000).optional(),
    consentGiven: z.literal(true),
    status: z.literal("Pending Advocate Review"),
    createdAt: z.string().datetime(),
  }).strict(),
  mode: z.enum(["chamber", "phone", "video"]).optional(),
}).strict();

export const LawyerApplicationSubmissionSchema = z.object({
  name: boundedText(200),
  barCouncilNumber: boundedText(120),
  state: boundedText(120),
  city: boundedText(120),
  court: boundedText(200),
  experienceYears: z.number().int().min(0).max(70),
  specializations: z.array(boundedText(100)).min(1).max(15),
  phone: boundedText(40),
  email: z.string().trim().email().max(254),
  feeEstimate: z.string().max(200),
  bio: z.string().max(4000),
}).strict();
