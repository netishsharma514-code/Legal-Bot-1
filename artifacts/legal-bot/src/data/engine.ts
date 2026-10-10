import { SECTIONS } from './sections';
import { ACTS } from './acts';
import { CITIZEN_RIGHTS } from './rights';
import { CONSTITUTION_ARTICLES } from './constitution';
import { Section, Act, CitizenRight, ConstitutionArticle } from './types';

export interface SearchResult {
  sections: Section[];
  acts: Act[];
  rights: CitizenRight[];
  constitutionArticles: ConstitutionArticle[];
  matchedKeywords: string[];
}

export function searchLegalKnowledge(query: string): SearchResult {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return { sections: [], acts: [], rights: [], constitutionArticles: [], matchedKeywords: [] };
  }

  const queryWords = normalized.split(/\s+/).filter(w => w.length > 2);

  // Match Sections
  const matchedSections = SECTIONS.filter(s => {
    // Direct match on section numbers
    if (normalized.includes(s.number.toLowerCase()) || (s.ipcNumber && normalized.includes(s.ipcNumber.toLowerCase()))) {
      return true;
    }
    // Match in title or description
    if (s.title.toLowerCase().includes(normalized) || s.description.toLowerCase().includes(normalized)) {
      return true;
    }
    // Match keywords
    return s.keywords.some(k => normalized.includes(k.toLowerCase()) || queryWords.some(qw => k.toLowerCase().includes(qw)));
  });

  // Match Acts
  const matchedActs = ACTS.filter(a => {
    return (
      a.name.toLowerCase().includes(normalized) ||
      a.shortName.toLowerCase().includes(normalized) ||
      a.keyTopics.some(t => normalized.includes(t.toLowerCase()) || queryWords.some(qw => t.toLowerCase().includes(qw)))
    );
  });

  // Match Rights
  const matchedRights = CITIZEN_RIGHTS.filter(r => {
    return (
      r.title.toLowerCase().includes(normalized) ||
      r.category.toLowerCase().includes(normalized) ||
      r.description.toLowerCase().includes(normalized) ||
      queryWords.some(qw => r.title.toLowerCase().includes(qw) || r.governingLaw.toLowerCase().includes(qw))
    );
  });

  // Match Constitution
  const matchedArticles = CONSTITUTION_ARTICLES.filter(c => {
    return (
      c.article.toLowerCase().includes(normalized) ||
      c.title.toLowerCase().includes(normalized) ||
      c.description.toLowerCase().includes(normalized) ||
      queryWords.some(qw => c.title.toLowerCase().includes(qw))
    );
  });

  return {
    sections: matchedSections.slice(0, 5),
    acts: matchedActs.slice(0, 3),
    rights: matchedRights.slice(0, 3),
    constitutionArticles: matchedArticles.slice(0, 3),
    matchedKeywords: queryWords,
  };
}
