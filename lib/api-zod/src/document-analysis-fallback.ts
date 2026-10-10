import type { DocumentAnalysis } from './generated/types/documentAnalysis';

const fallbackRules: {
  pattern: RegExp;
  clauseTitle: string;
}[] = [
  { pattern: /non-compete|competing business/i, clauseTitle: 'Non-compete wording' },
  {
    pattern: /indemnif\w*.{0,180}(?:solely|unilateral|irrespective|directors)|(?:solely|unilateral|irrespective|directors).{0,180}indemnif\w*/i,
    clauseTitle: 'Indemnity wording',
  },
  {
    pattern: /without cause.{0,180}(?:without any notice|immediately)|(?:without any notice|immediately).{0,180}without cause/i,
    clauseTitle: 'Termination wording',
  },
  {
    pattern: /appointed solely|sole arbitrator appointed by|solely by the company/i,
    clauseTitle: 'Arbitrator appointment wording',
  },
  {
    pattern: /outside the territory of india|foreign court/i,
    clauseTitle: 'Foreign-court wording',
  },
];

function exactExcerpt(text: string, matchIndex: number, matchLength: number): string {
  const excerptStart = Math.max(0, matchIndex - 180);
  const excerptEnd = Math.min(text.length, matchIndex + matchLength + 180);
  return text.slice(excerptStart, Math.min(excerptEnd, excerptStart + 600)).trim();
}

function detectDocumentType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('rent') || lower.includes('lease') || lower.includes('tenan')) {
    return 'Residential Rental Agreement';
  }
  if (lower.includes('employ') || lower.includes('service agreement')) {
    return 'Employment & Service Agreement';
  }
  if (lower.includes('nda') || lower.includes('non-disclosure') || lower.includes('confidential')) {
    return 'Non-Disclosure Agreement (NDA)';
  }
  if (lower.includes('loan') || lower.includes('promissory')) {
    return 'Loan Agreement & Promissory Deed';
  }
  if (lower.includes('vendor') || lower.includes('master service') || lower.includes('supplier')) {
    return 'Commercial Vendor Contract';
  }
  return 'Unknown';
}

function extractDateMentions(text: string): { label: string; dateOrPeriod: string }[] {
  const mentions = new Map<string, { label: string; dateOrPeriod: string }>();
  const patterns = [
    /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    /\b\d{1,3}\s+(?:calendar\s+)?(?:days?|months?)\s+(?:written\s+)?notice\b/gi,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[0]) {
        mentions.set(match[0].toLowerCase(), {
          label: 'Date or period mentioned',
          dateOrPeriod: match[0],
        });
      }
    }
  }

  return [...mentions.values()];
}

export function generateDocumentAnalysisFallback(text: string): DocumentAnalysis {
  const flaggedClauses = fallbackRules.flatMap((rule) => {
    const match = rule.pattern.exec(text);
    if (!match || match.index === undefined) return [];

    const evidenceSnippet = exactExcerpt(text, match.index, match[0].length);
    if (!evidenceSnippet) return [];

    return [{
      clauseTitle: rule.clauseTitle,
      issue: 'A local keyword rule matched this exact passage. This is not a legal conclusion.',
      recommendation: 'Review this quoted passage in its full context with a qualified advocate.',
      evidenceSnippet,
    }];
  });
  const documentType = detectDocumentType(text);

  return {
    summary: `A limited keyword screen retained ${flaggedClauses.length} exact passage(s) for review. It does not determine their legal effect.`,
    plainLanguageExplanation: 'Only the quoted passages below were selected by local keyword rules. No legal citations or outcomes were verified.',
    documentType,
    subject: 'Not determined from supplied text.',
    governingLawCompliance: 'Not assessed; no legal sources were verified.',
    extractedFacts: {
      documentType,
      subject: 'Not determined from supplied text.',
      parties: [],
      importantDates: extractDateMentions(text),
      keyObligations: [],
      importantClauses: [],
    },
    flaggedClauses,
    missingProtections: [],
    positiveAspects: [],
    recommendedNextSteps: [
      'Have a qualified advocate review the complete document and any quoted passage in context.',
    ],
    officialSources: [],
  };
}
