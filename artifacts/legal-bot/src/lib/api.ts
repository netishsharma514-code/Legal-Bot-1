type PublicSubmissionRoute = 'consultation-inquiries' | 'lawyer-applications';

export async function submitPublicRequest(
  route: PublicSubmissionRoute,
  data: unknown,
): Promise<void> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') || '';
  const response = await fetch(`${baseUrl}/api/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result && typeof result === 'object' && 'error' in result &&
      typeof result.error === 'string'
        ? result.error
        : 'The server could not save the submission.';
    throw new Error(message);
  }

  if (!result || typeof result !== 'object' || !('success' in result) || result.success !== true) {
    throw new Error('The server did not confirm that the submission was saved.');
  }
}
