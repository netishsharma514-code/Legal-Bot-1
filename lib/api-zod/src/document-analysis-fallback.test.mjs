import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateDocumentAnalysisFallback } from './document-analysis-fallback.ts';

test('fallback leaves unmatched documents unknown and unscored', () => {
  const result = generateDocumentAnalysisFallback('A short letter about a meeting.');

  assert.equal(result.documentType, 'Unknown');
  assert.equal(result.riskScore, undefined);
  assert.equal(result.riskLevel, undefined);
  assert.deepEqual(result.flaggedClauses, []);
  assert.deepEqual(result.officialSources, []);
});

test('fallback flags only exact quoted passages and emits no unverified citations', () => {
  const text = 'Confidentiality terms apply. The non-compete restriction lasts twelve months.';
  const result = generateDocumentAnalysisFallback(text);

  assert.equal(result.flaggedClauses.length, 1);
  assert.ok(text.includes(result.flaggedClauses[0].evidenceSnippet));
  assert.equal(result.flaggedClauses[0].relevantLaw, undefined);
  assert.deepEqual(result.officialSources, []);
  assert.equal(result.riskScore, undefined);
  assert.equal(result.riskLevel, undefined);
});
