import { ArrowLeft, ArrowRight, FileQuestion, Home, PhoneCall } from 'lucide-react';

interface NotFoundProps {
  onNavigateTab: (tab: string) => void;
}

export function NotFound({ onNavigateTab }: NotFoundProps) {
  return (
    <section className="error-page" aria-labelledby="not-found-title">
      <div className="error-page-mark" aria-hidden="true">
        <FileQuestion />
      </div>
      <p className="error-page-kicker">PAGE NOT FOUND · 404</p>
      <h1 id="not-found-title">This page isn’t in the record.</h1>
      <p className="error-page-copy">
        The address may be out of date, or the page may have moved. Choose a
        destination below to continue.
      </p>
      <div className="error-page-actions">
        <button
          type="button"
          className="error-page-primary"
          onClick={() => onNavigateTab('home')}
        >
          <Home aria-hidden="true" />
          Return to home
        </button>
        <button
          type="button"
          className="error-page-secondary"
          onClick={() => onNavigateTab('assistant')}
        >
          Ask the legal assistant
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="error-page-back"
        onClick={() => window.history.back()}
      >
        <ArrowLeft aria-hidden="true" />
        Go back to the previous page
      </button>
      <div className="error-page-notice">
        <PhoneCall aria-hidden="true" />
        <p>
          Need urgent help? Call <strong>112</strong> for emergencies or{' '}
          <strong>1930</strong> to report cyber fraud.
        </p>
      </div>
    </section>
  );
}
