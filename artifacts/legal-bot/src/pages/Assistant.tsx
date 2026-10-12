import { useState, useEffect, useRef } from 'react';
import { searchLegalKnowledge } from '../data/engine';
import { generateStatutoryAnswer } from '../data/answerGenerator';
import { ChatMessage, ChatSession, Section } from '../data/types';
import { StructuredAnswerCard } from '../components/StructuredAnswerCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useSendLegalChatMessage } from '@workspace/api-client-react';
import { 
  Send, 
  Bot, 
  User, 
  Scale, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  ShieldAlert,
  Loader2,
  Clock,
  PhoneCall
} from 'lucide-react';

interface AssistantProps {
  onNavigateTab?: (tab: string, filterSection?: string) => void;
  initialQuery?: string;
}

export function Assistant({ onNavigateTab, initialQuery = '' }: AssistantProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default-session');
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<string>('Checking');
  const sendLegalChatMessage = useSendLegalChatMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or load sessions
  useEffect(() => {
    loadSessions();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void loadSessions(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadSessions = async () => {
    try {
      let data: Record<string, any>[] | null = null;
      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (authData.user) {
          const { data: cloudData, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('updated_at', { ascending: false });
          if (error) throw error;
          data = cloudData as Record<string, any>[];
          setStorageStatus('Synced');
        } else {
          setStorageStatus('Sign in to sync');
        }
      } else {
        const { data: localData, error } = await supabase.from('conversations').select('*');
        if (error) throw error;
        data = localData as Record<string, any>[];
        setStorageStatus('Local');
      }

      if (data && data.length > 0) {
        const sessionMap = new Map<string, ChatSession>();
        data.forEach((d: any) => {
          const sid = d.id || ('session-' + Math.random().toString(36).substring(2, 9));
          if (!sessionMap.has(sid)) {
            sessionMap.set(sid, {
              id: sid,
              title: d.title || 'Legal Consultation',
              createdAt: d.created_at || new Date().toISOString(),
              updatedAt: d.updated_at || new Date().toISOString(),
              messages: d.messages || [],
            });
          }
        });
        const uniqueSessions = Array.from(sessionMap.values());
        setSessions(uniqueSessions);
        if (uniqueSessions.length > 0) {
          setActiveSessionId(uniqueSessions[0].id);
        }
      } else {
        // Fallback default initial session with unique identifier
        const defaultSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const defaultSession: ChatSession = {
          id: defaultSessionId,
          title: 'New Legal Consultation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'welcome-msg',
              sender: 'assistant',
              text: `Welcome to **Legal Bot** (Nyaya Sahayak). I am your interactive assistant for Indian law.\n\nYou can consult me on:\n- **New Criminal Laws**: Bharatiya Nyaya Sanhita (BNS), BNSS, and BSA alongside historic IPC/CrPC provisions.\n- **Commercial & Civil**: Cheque bounce (Section 138 NI Act), contract breach, consumer disputes.\n- **Citizen Rights**: Mandatory FIR registration, bail procedure, arrest protections (D.K. Basu guidelines).\n- **Cyber Frauds**: Online banking scams, helpline 1930 recovery.\n\n*How can I assist you with your legal query today?*`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'statutory-engine',
            },
          ],
        };
        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
      }
    } catch (error) {
      console.error('Could not load consultation history:', error);
      setStorageStatus('History unavailable');
    }
  };

  const persistSession = async (session: ChatSession) => {
    let userId: string | undefined;
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) {
        setStorageStatus('Sign in to sync');
        return;
      }
      userId = data.user.id;
    }

    const record = {
      id: session.id,
      title: session.title,
      updated_at: session.updatedAt,
      messages: session.messages,
      ...(userId ? { user_id: userId } : {}),
    };
    const { error } = await (supabase.from('conversations') as any).upsert(record);
    if (error) throw error;
    setStorageStatus(isSupabaseConfigured ? 'Synced' : 'Local');
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isLoading]);

  const handleNewChat = async () => {
    const newSessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          sender: 'assistant',
          text: `Starting a new consultation session. Please describe your legal scenario, statutory question, or dispute details.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'statutory-engine',
        },
      ],
    };

    const updated = [newSession, ...sessions.filter((s) => s.id !== newSession.id)];
    setSessions(updated);
    setActiveSessionId(newSession.id);

    try {
      await persistSession(newSession);
    } catch (error) {
      console.error('Could not save the consultation session:', error);
      setStorageStatus('Save unavailable');
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== sessionId);
    if (updated.length === 0) {
      handleNewChat();
      return;
    }
    setSessions(updated);
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!data.user) {
          setStorageStatus('Sign in to sync');
          return;
        }
        const { error: deleteError } = await supabase
          .from('conversations')
          .delete()
          .eq('user_id', data.user.id)
          .eq('id', sessionId);
        if (deleteError) throw deleteError;
      } else {
        const { error } = await supabase.from('conversations').delete().eq('id', sessionId);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Could not delete the consultation session:', error);
      setStorageStatus('Save unavailable');
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Instant statutory matching from local engine
    const searchResult = searchLegalKnowledge(query);

    // Update active session with user message
    const updatedMessages = [...(activeSession?.messages || []), userMessage];
    const sessionTitle =
      activeSession?.messages.length <= 1
        ? query.slice(0, 32) + (query.length > 32 ? '...' : '')
        : activeSession?.title || 'Legal Consultation';

    const updatedSessions = sessions.map((s) =>
      s.id === activeSessionId
        ? {
            ...s,
            title: sessionTitle,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
          }
        : s
    );
    setSessions(updatedSessions);
    setIsLoading(true);

    try {
      // 2. Hybrid enhancement: Call Gemini API proxy on server
      let replyText = '';
      let replySource: 'gemini-2.5-flash' | 'statutory-engine' = 'statutory-engine';

      try {
        const response = await sendLegalChatMessage.mutateAsync({
          data: {
            message: query,
            matchedSections: searchResult.sections,
            history: (activeSession?.messages || []).slice(-6).map((m) => ({
              sender: m.sender,
              text: m.text,
            })),
          },
        });
        replyText = response.reply;
        replySource = response.source;
      } catch {
        // Fallback to deterministic statutory engine
        const fallback = generateStatutoryAnswer(query, searchResult);
        replyText = fallback.text;
        replySource = 'statutory-engine';
      }

      const assistantMessage: ChatMessage = {
        id: 'msg-assistant-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sectionsReferenced: searchResult.sections,
        source: replySource,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const finalSessions = sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: new Date().toISOString(),
              messages: finalMessages,
            }
          : s
      );

      setSessions(finalSessions);

      await persistSession({
        id: activeSessionId,
        title: sessionTitle,
        createdAt: activeSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: finalMessages,
      });
    } catch (err) {
      console.error('Error during message exchange:', err);
      setStorageStatus('Save unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    'Agar police meri FIR nahi likhti to main kya kar sakta hu?',
    'Cheque bounce hone par Section 138 notice kaise bhejein?',
    'What is the notice period for Cheque Bounce under Section 138 NI Act?',
    'Can police arrest without warrant under Section 35 BNSS?',
    'अगर साइबर फ्रॉड में पैसे कट जाएं तो तुरंत क्या करें?',
    'Anticipatory bail lene ka procedure kya hota hai?',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-10.5rem)] min-h-[580px]">
      {/* Sidebar: Consultation Sessions Drawer */}
      <div className="hidden lg:flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Consultation History
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {storageStatus}
          </span>
        </div>

        <button
          onClick={handleNewChat}
          className="w-full mb-4 py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Consultation</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {sessions.map((session, sIndex) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={`${session.id}-${sIndex}`}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <div className="truncate">{session.title}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {session.messages.length} messages
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Indian Penal Laws (BNS 2023)</span>
          <Scale className="w-3.5 h-3.5 text-blue-600" />
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Nyaya Sahayak — AI Legal Assistant</span>
                <span className="text-[10px] py-0.5 px-2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                  Auto Language Match (Hinglish / English / Hindi)
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hybrid Intelligence grounded in Indian Statutes, Supreme Court ratios & Penal Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="lg:hidden p-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeSession?.messages.map((msg, mIndex) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={`${msg.id}-${mIndex}`}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Scale className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/40 dark:border-slate-700/60 text-[11px] opacity-80">
                    <span className="font-semibold">
                      {isUser ? 'Citizen Inquiry' : 'Legal Bot Guidance'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.source && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {msg.source === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : 'Statutory Engine'}
                        </span>
                      )}
                      {msg.source === 'statutory-engine' && !isUser && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-300">
                          Deterministic statutory fallback; verify against official sources.
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:opacity-100 p-0.5"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Message Content: Structured Answer for Assistant, plain text for User */}
                  {isUser ? (
                    <div className="space-y-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <StructuredAnswerCard
                      content={msg.text}
                      onNavigateTab={onNavigateTab}
                      sectionsReferenced={msg.sectionsReferenced}
                    />
                  )}

                  {/* Referenced Statutory Sections (Rich Cards) */}
                  {msg.sectionsReferenced && msg.sectionsReferenced.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Referenced Statutory Sections:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sectionsReferenced.map((section) => (
                          <div
                            key={section.id}
                            onClick={() => onNavigateTab?.('acts', section.id)}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-colors text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-blue-700 dark:text-blue-400">
                              <span>{section.act} Sec {section.number}</span>
                              <span className="text-[10px] text-slate-400">
                                {section.bailable ? 'Bailable' : 'Non-Bailable'}
                              </span>
                            </div>
                            <div className="text-slate-800 dark:text-slate-200 font-medium truncate mt-0.5">
                              {section.title}
                            </div>
                            {section.ipcNumber && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                Formerly IPC Section {section.ipcNumber}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Evaluating Indian statutes, BNS/IPC provisions & legal precedents...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {activeSession?.messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Common Legal Consultations:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] text-left py-1 px-2.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              aria-label="Ask a legal question in English, Hindi, or Hinglish"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Legal Disclaimer Subtitle */}
          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              Informative guidance under Indian Law. Not formal advocate-client privilege. For courtroom bail/suits, consult a verified advocate.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
