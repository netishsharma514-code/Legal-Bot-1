import { SECTIONS } from './sections';
import { ACTS } from './acts';
import { CITIZEN_RIGHTS } from './rights';
import { CONSTITUTION_ARTICLES } from './constitution';
import {
  Section,
  Act,
  CitizenRight,
  ConstitutionArticle,
} from './types';

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
    return {
      sections: [],
      acts: [],
      rights: [],
      constitutionArticles: [],
      matchedKeywords: [],
    };
  }

  const queryWords = normalized
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 2);

  // Match Sections
  const matchedSections = SECTIONS.filter(s => {
    const sectionNumber = s.number.toLowerCase();
    const ipcNumber = s.ipcNumber?.toLowerCase();

    if (
      normalized.includes(sectionNumber) ||
      (!!ipcNumber && normalized.includes(ipcNumber))
    ) {
      return true;
    }

    if (
      s.title.toLowerCase().includes(normalized) ||
      s.description.toLowerCase().includes(normalized)
    ) {
      return true;
    }

    return s.keywords.some(keyword => {
      const key = keyword.toLowerCase();

      return (
        normalized.includes(key) ||
        queryWords.some(word => key.includes(word))
      );
    });
  });

  // Match Acts
  const matchedActs = ACTS.filter(a => {
    return (
      a.name.toLowerCase().includes(normalized) ||
      a.shortName.toLowerCase().includes(normalized) ||
      a.keyTopics.some(topic => {
        const key = topic.toLowerCase();

        return (
          normalized.includes(key) ||
          queryWords.some(word => key.includes(word))
        );
      })
    );
  });

  // Match Citizen Rights
  const matchedRights = CITIZEN_RIGHTS.filter(r => {
    return (
      r.title.toLowerCase().includes(normalized) ||
      r.category.toLowerCase().includes(normalized) ||
      r.description.toLowerCase().includes(normalized) ||
      queryWords.some(
        word =>
          r.title.toLowerCase().includes(word) ||
          r.governingLaw.toLowerCase().includes(word)
      )
    );
  });

   // Match Constitution Articles
const articleMatch = normalized.match(
  /\b(?:article|art\.?)\s*(\d+[a-z]?)\b/i
);

const requestedArticle = articleMatch?.[1]?.toLowerCase();

const matchedArticles = requestedArticle
  ? CONSTITUTION_ARTICLES.filter(c => {
      const storedMatch = c.article
        .toLowerCase()
        .match(/\b(?:article|art\.?)\s*(\d+[a-z]?)\b/i);

      return storedMatch?.[1]?.toLowerCase() === requestedArticle;
    })
  : CONSTITUTION_ARTICLES.filter(c => {
      return (
        c.title.toLowerCase().includes(normalized) ||
        c.description.toLowerCase().includes(normalized) ||
        queryWords.some(
          word =>
            c.title.toLowerCase().includes(word) ||
            c.description.toLowerCase().includes(word)
        )
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