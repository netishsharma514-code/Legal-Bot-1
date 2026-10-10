import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Scale, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { Section } from '../data/types';

interface StructuredAnswerCardProps {
  content: string;
  onNavigateTab?: (tab: string, filterSection?: string) => void;
  sectionsReferenced?: Section[];
}

export function StructuredAnswerCard({ content, onNavigateTab, sectionsReferenced }: StructuredAnswerCardProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (label: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Helper to extract Quick Answer section if present
  const extractQuickAnswer = (text: string): string | null => {
    const match = text.match(/(?:###\s*(?:1\.\s*)?Quick Answer[^\n]*\n)([\s\S]*?)(?=\n###|\n\*\*Detailed|\n\*\*Applicable|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Fallback: look for "Quick Answer:" prefix
    const lineMatch = text.match(/Quick Answer:?\s*([^\n]+(?:\n[^\n#]+)?)/i);
    if (lineMatch && lineMatch[1]) {
      return lineMatch[1].trim();
    }
    return null;
  };

  // Helper to render markdown links as clickable <a> elements with external link icon
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Check for H3 / H4 headers
          if (trimmed.startsWith('### ')) {
            const heading = trimmed.replace(/^###\s+/, '');
            const isQuickAnswerHeader = /Quick Answer/i.test(heading);

            return (
              <div 
                key={idx} 
                className={`pt-3 pb-1 border-b text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  isQuickAnswerHeader 
                    ? 'text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60' 
                    : 'text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{heading}</span>
                </div>
                {isQuickAnswerHeader && (
                  <button
                    type="button"
                    onClick={() => {
                      const qa = extractQuickAnswer(rawText) || '';
                      handleCopyText('quick', qa);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer transition-colors"
                    title="Copy Quick Answer only"
                  >
                    {copiedSection === 'quick' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Quick Answer</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          }

          if (trimmed.startsWith('#### ')) {
            const subhead = trimmed.replace(/^####\s+/, '');
            return (
              <h5 key={idx} className="font-bold text-xs text-indigo-700 dark:text-indigo-400 pt-2">
                {renderInlineMarkdown(subhead)}
              </h5>
            );
          }

          // Bullet item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed pl-1 text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 mt-1 shrink-0">●</span>
                <span className="flex-1">{renderInlineMarkdown(bulletText)}</span>
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s+/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s+/)?.[1];
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed pl-1 text-slate-700 dark:text-slate-300">
                <span className="font-bold text-blue-700 dark:text-blue-400 shrink-0">{num}.</span>
                <span className="flex-1">{renderInlineMarkdown(itemText)}</span>
              </div>
            );
          }

          // Standard paragraph
          return (
            <p key={idx} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {renderInlineMarkdown(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Inline formatting for **bold**, *italic*, `code`, and [links](url)
  const renderInlineMarkdown = (text: string) => {
    // Match Markdown link: [Title](URL) or plain URL
    const parts: (string | React.ReactNode)[] = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBoldItalic(text.substring(lastIndex, match.index)));
      }
      const title = match[1];
      const url = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
        >
          <span>{title}</span>
          <ExternalLink className="w-3 h-3 shrink-0 inline ml-0.5" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderBoldItalic(text.substring(lastIndex)));
    }

    return parts;
  };

  const renderBoldItalic = (text: string) => {
    // Process **bold** and `code`
    const elements: (string | React.ReactNode)[] = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIdx = 0;
    let boldMatch: RegExpExecArray | null;

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastIdx) {
        elements.push(text.substring(lastIdx, boldMatch.index));
      }
      elements.push(
        <strong key={`b-${boldMatch.index}`} className="font-bold text-slate-900 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      lastIdx = boldRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      elements.push(text.substring(lastIdx));
    }

    return elements;
  };

  const quickAnswerText = extractQuickAnswer(content);

  return (
    <div className="space-y-4">
      {/* Quick Answer Highlight Banner if detected */}
      {quickAnswerText && (
        <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-blue-800 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Quick Answer Summary</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyText('quick-banner', quickAnswerText)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer transition-colors"
            >
              {copiedSection === 'quick-banner' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Quick Answer</span>
                </>
              )}
            </button>
          </div>
          <p className="leading-relaxed font-medium">
            {quickAnswerText}
          </p>
        </div>
      )}

      {/* Rendered Markdown Sections */}
      <div className="text-xs">
        {renderFormattedText(content)}
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyText('full', content)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            {copiedSection === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full Answer Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Full Answer</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.('lawyers')}
            className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Consult Nearby Advocate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab?.('legal-aid')}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Free Legal Aid (NALSA)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
