import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  Clock,
  ShieldCheck,
  Image as ImageIcon,
  X,
  MessageSquarePlus,
  Lightbulb,
  Zap,
  ArrowRight,
  Copy,
  Check,
  BookMarked,
  HelpCircle,
  FileCheck2,
  GraduationCap,
} from 'lucide-react';
import {
  Concept,
  DocumentChunk,
  Question,
  CQSubpart,
  AnswerEvaluationResult,
  TutoringMode,
  AppSettings,
} from '../types';
import {
  CANONICAL_CONCEPTS,
  PRESEEDED_DOCUMENT_CHUNKS,
  CANONICAL_SUBJECTS,
} from '../data/canonicalTaxonomy';
import {
  recordStudentAttempt,
  getErrorCategoryTitle,
  loadQuestions,
  loadUserMastery,
  loadMistakePatterns,
  loadStudentAttempts,
  loadDocumentChunks,
} from '../services/storage';
import { selectNextAdaptiveQuestion } from '../services/adaptiveEngine';
import { MathRenderer } from './MathRenderer';
import { Language } from '../services/i18n';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  attachedImage?: string;
}

interface GroundedTutorProps {
  selectedSubjectId: string;
  initialConceptId?: string;
  initialQuestion?: Question | null;
  initialSubpart?: CQSubpart | null;
  initialMode?: TutoringMode;
  onAttemptRecorded?: () => void;
  settings?: AppSettings;
}

export const GroundedTutor: React.FC<GroundedTutorProps> = ({
  selectedSubjectId,
  initialConceptId,
  initialQuestion,
  initialSubpart,
  initialMode = 'socratic',
  onAttemptRecorded,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';

  // Tutor Scope: 'open_doubt' (any random question) or 'textbook_topic' (specific chapter)
  const [tutorScope, setTutorScope] = useState<'open_doubt' | 'textbook_topic'>(
    initialConceptId || initialQuestion ? 'textbook_topic' : 'open_doubt'
  );

  const [activeMode, setActiveMode] = useState<TutoringMode>(initialMode);
  const [selectedConceptId, setSelectedConceptId] = useState<string>(
    initialConceptId || 'phy_1_ch4_c_torque_angular_momentum'
  );

  // Active question and subpart states
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(initialQuestion || null);
  const [activeSubpart, setActiveSubpart] = useState<CQSubpart | null>(initialSubpart || null);

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatImageBase64, setChatImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Student Answering & Evaluator Tab State
  const [showSidePanel, setShowSidePanel] = useState<boolean>(!!initialQuestion);
  const [sidePanelTab, setSidePanelTab] = useState<'evaluator' | 'formulas'>('evaluator');
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [studentImageBase64, setStudentImageBase64] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<AnswerEvaluationResult | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Available concepts for subject
  const subjectConcepts = CANONICAL_CONCEPTS.filter((c) => c.subject_id === selectedSubjectId);
  const activeConcept =
    CANONICAL_CONCEPTS.find((c) => c.id === selectedConceptId) || subjectConcepts[0] || CANONICAL_CONCEPTS[0];
  const currentSubject = CANONICAL_SUBJECTS.find((s) => s.id === selectedSubjectId);

  // Retrieved Grounded Chunks from canonical & uploaded books
  const allStoredChunks = loadDocumentChunks();
  const relevantChunks: DocumentChunk[] = allStoredChunks.filter(
    (chk) =>
      chk.concept_ids.includes(activeConcept.id) ||
      (chk.subject_id === selectedSubjectId && chk.chapter_id === activeConcept.chapter_id)
  );

  useEffect(() => {
    if (initialConceptId) {
      setSelectedConceptId(initialConceptId);
      setTutorScope('textbook_topic');
    }
  }, [initialConceptId]);

  useEffect(() => {
    if (initialQuestion) {
      setActiveQuestion(initialQuestion);
      setActiveSubpart(initialSubpart || null);
      setShowSidePanel(true);
      setTutorScope('textbook_topic');
    }
  }, [initialQuestion, initialSubpart]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Initial tutor greeting
  useEffect(() => {
    if (tutorScope === 'open_doubt') {
      setChatMessages([
        {
          role: 'model',
          text: `স্বাগতম! আমি আপনার **এইচএসসি এআই মেন্টর**। 🎓\n\n**পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞান, বাংলা, ইংরেজি কিংবা আইসিটি**-র যেকোনো জটিল গাণিতিক সমস্যা, সূত্রের প্রমাণ বা কঠিন কনসেপ্ট এখানে জিজ্ঞেস করুন।\n\nআপনি চাইলে সরাসরি **হাতের লেখার খাতার ছবি বা টেস্ট পেপারের স্ন্যাপশট** আপলোড করতে পারেন!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const welcomeByMode = {
        socratic: `আমরা এখন **${activeConcept.name_bn}** (${activeConcept.name_en}) নিয়ে আলোচনা করব। 💡\n\nএই টপিকের মূল সূত্র বা রাশিমালাটি কীভাবে গঠিত হয় তা নিয়ে আপনার কোনো প্রশ্ন আছে? আমি আপনাকে ধাপে ধাপে বুঝিয়ে দেব।`,
        expository: `**${activeConcept.name_bn}**-এর পূর্ণাঙ্গ লেকচারে আপনাকে স্বাগতম। 📖\n\nএনসিটিবি অনুমোদিত পাঠ্যবই অনুযায়ী মূলনীতি, প্রতিপাদন ও বোর্ড স্ট্যান্ডার্ড নমুনা অংক বিশ্লেষণ করা হচ্ছে।`,
        exam: `**${activeConcept.name_bn}**-এর খাতা মূল্যায়ন ও পরীক্ষা মোড। ✍️\n\nডান পাশের প্যানেলে আপনার লিখিত সমাধান বা ছবি আপলোড করে নম্বর যাচাই করুন।`,
        revision: `⚡ **${activeConcept.name_bn} দ্রুত রিভিশন চিটশিট:**\n\n- **মূল সূত্র:** $${activeConcept.formula_latex || ''}$\n- **মূলনীতি:** ${activeConcept.core_principle_bn}\n- **সতর্কতা:** একক রূপান্তর (SI unit) এবং সূত্রের শর্ত সবসময় খেয়াল রাখুন।`,
      };

      setChatMessages([
        {
          role: 'model',
          text: welcomeByMode[activeMode] || welcomeByMode.socratic,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, [tutorScope, selectedConceptId, activeMode]);

  const handleSendMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const query = directText || userInput;
    if ((!query.trim() && !chatImageBase64) || isLoading) return;

    const userText = query.trim();
    const newMsg: Message = {
      role: 'user',
      text: userText || (chatImageBase64 ? 'এই ছবিটির প্রশ্ন সমাধান করে বুঝিয়ে দিন।' : ''),
      timestamp: new Date().toLocaleTimeString(),
      attachedImage: chatImageBase64 || undefined,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setUserInput('');
    const currentImg = chatImageBase64;
    setChatImageBase64(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          conceptName: tutorScope === 'textbook_topic' ? activeConcept.name_bn : undefined,
          formulaLatex: tutorScope === 'textbook_topic' ? activeConcept.formula_latex : undefined,
          corePrinciple: tutorScope === 'textbook_topic' ? activeConcept.core_principle_bn : undefined,
          questionContext: initialQuestion ? initialQuestion.stem_text : undefined,
          retrievedChunks: tutorScope === 'textbook_topic' ? relevantChunks : [],
          conversationHistory: chatMessages,
          userQuery: userText,
          imageBase64: currentImg,
          mimeType: currentImg ? 'image/jpeg' : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.text,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: 'দুঃখিত, উত্তর প্রসেস করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Tutor fetch error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'সার্ভারের সাথে সংযোগে বিঘ্ন ঘটেছে। আপনার প্রশ্নটি আবার পাঠান।',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setChatImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentEvaluationImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setStudentImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!studentAnswerText.trim() && !studentImageBase64) {
      alert('অনুগ্রহ করে লিখিত সমাধান দিন বা খাতার ছবি আপলোড করুন।');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    const questionStem = activeQuestion?.stem_text || activeConcept.core_principle_bn;
    const subpartPrompt = activeSubpart?.prompt_text || 'গাণিতিক বিশ্লেষণপূর্বক সমাধান করো।';
    const officialSol = activeSubpart?.solution_latex || activeConcept.formula_latex || '';

    try {
      const res = await fetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionStem,
          subpartPrompt,
          maxMarks: activeSubpart?.marks || 4,
          officialSolutionLatex: officialSol,
          studentAnswerText,
          studentAnswerImageBase64: studentImageBase64,
          mimeType: studentImageBase64 ? 'image/jpeg' : undefined,
          conceptName: activeConcept.name_bn,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const evalData: AnswerEvaluationResult = data.data;
        setEvaluationResult(evalData);

        // Record attempt to storage & update mastery state machine
        recordStudentAttempt({
          user_id: 'current_user',
          question_id: activeQuestion?.id || `practice_${activeConcept.id}`,
          subpart_id: activeSubpart?.id,
          concept_id: activeConcept.id,
          attempt_type: 'cq_practice',
          student_answer_text: studentAnswerText,
          student_answer_image_url: studentImageBase64 || undefined,
          is_correct: evalData.is_correct,
          score_obtained: evalData.score_obtained,
          max_score: evalData.max_score,
          time_spent_seconds: 180,
          evaluation: evalData,
        });

        if (onAttemptRecorded) {
          onAttemptRecorded();
        }
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLoadNextAdaptiveQuestion = () => {
    const currentQuestions = loadQuestions();
    const currentMastery = loadUserMastery();
    const currentMistakes = loadMistakePatterns();
    const currentAttempts = loadStudentAttempts();

    const nextTarget = selectNextAdaptiveQuestion(
      selectedSubjectId,
      currentMastery,
      currentMistakes,
      currentQuestions,
      currentAttempts,
      { excludeQuestionIds: activeQuestion ? [activeQuestion.id] : [] }
    );

    if (nextTarget) {
      setActiveQuestion(nextTarget.question);
      setActiveSubpart(nextTarget.targetSubpart || null);
      setSelectedConceptId(nextTarget.concept.id);
      setStudentAnswerText('');
      setStudentImageBase64(null);
      setEvaluationResult(null);
      setShowSidePanel(true);
    }
  };

  // Sample quick questions
  const samplePrompts = [
    'পানিতে নিমজ্জিত অবস্থায় বস্তুর ওজন কম অনুভূত হয় কেন?',
    'কৌণিক ভরবেগের সংরক্ষণ সূত্র ও উদাহরণ বুঝিয়ে দিন',
    'লুইস এসিড ও ক্ষারকের মধ্যে প্রধান পার্থক্য কী?',
    'কার্নো ইঞ্জিনের দক্ষতা $\\eta = 1 - \\frac{T_2}{T_1}$ সমীকরণটি কীভাবে আসে?',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Studio Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Badge */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-bengali tracking-tight">
                  এইচএসসি এআই মেন্টর ও ডাউট সমাধান স্টুডিও
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                  NCTB Grounded
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
                যেকোনো জটিল অঙ্ক, সূত্রের প্রমাণ বা পাঠ্যবইয়ের অধ্যায় নিয়ে ১-অন-১ লাইভ আলোচনা ও খাতা মূল্যায়ন
              </p>
            </div>
          </div>

          {/* Scope Segmented Pill Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bengali self-start md:self-auto shadow-inner">
            <button
              onClick={() => setTutorScope('open_doubt')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                tutorScope === 'open_doubt'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>🔍 যেকোনো প্রশ্ন / ডাউট</span>
            </button>
            <button
              onClick={() => setTutorScope('textbook_topic')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                tutorScope === 'textbook_topic'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>📖 পাঠ্যবই টপিক ভিত্তিক</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector if Textbook Topic is chosen */}
        {tutorScope === 'textbook_topic' && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 font-bengali">অধ্যায় / টপিক:</span>
              <select
                value={selectedConceptId}
                onChange={(e) => setSelectedConceptId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {subjectConcepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn} ({c.name_en})
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Mode Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bengali border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveMode('socratic')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeMode === 'socratic'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💡 ইঙ্গিত দিয়ে শেখানো (Socratic)
              </button>
              <button
                onClick={() => setActiveMode('expository')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeMode === 'expository'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📖 পূর্ণাঙ্গ লেকচার
              </button>
              <button
                onClick={() => setActiveMode('revision')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeMode === 'revision'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ দ্রুত রিভিশন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace: Interactive Chat (Left) + Studio Side Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Chat Canvas */}
        <div
          className={`${
            showSidePanel ? 'lg:col-span-7' : 'lg:col-span-12'
          } bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl flex flex-col h-[700px] overflow-hidden transition-all shadow-sm`}
        >
          {/* Chat Header Bar */}
          <div className="p-4 px-5 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                AI
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm font-bengali">
                  {tutorScope === 'open_doubt'
                    ? 'ওপেন ডাউট সমাধান ও এআই মেন্টর'
                    : `${activeConcept.name_bn} (${activeMode === 'socratic' ? 'সক্রেটিক গাইড' : 'লেকচার মোড'})`}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                  {activeMode === 'socratic'
                    ? 'ধাপে ধাপে ক্লু ও সূত্রের ইঙ্গিত দিয়ে স্বাবলম্বী করে তোলে'
                    : 'এনসিটিবি পাঠ্যবই অনুসারে পূর্ণাঙ্গ সমাধান ও সূত্র প্রদান করে'}
                </p>
              </div>
            </div>

            {/* Toggle Side Panel Button */}
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 border shadow-xs ${
                showSidePanel
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{showSidePanel ? 'প্যানেল লুকান' : 'খাতা মূল্যায়ন প্যানেল'}</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          {chatMessages.length <= 2 && (
            <div className="px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-950/30 border-b border-emerald-500/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 shrink-0 font-bengali flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> নমুনা প্রশ্ন:
              </span>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, prompt)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bengali text-slate-700 dark:text-slate-200 whitespace-nowrap transition-colors shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Canvas */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
            {chatMessages.map((msg, index) => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow-2xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] p-4 rounded-3xl text-sm leading-relaxed space-y-2 shadow-2xs relative group ${
                      isAi
                        ? 'bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tl-sm'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm font-bengali'
                    }`}
                  >
                    {msg.attachedImage && (
                      <div className="rounded-2xl overflow-hidden border border-white/20 max-w-xs mb-2.5 shadow-sm">
                        <img src={msg.attachedImage} alt="Attached Problem" className="w-full h-auto object-cover" />
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none text-inherit leading-relaxed font-bengali text-sm sm:text-base">
                      <MathRenderer content={msg.text} />
                    </div>

                    {/* Bottom Metadata & Copy Button */}
                    <div className={`flex items-center justify-between text-[11px] mt-2 pt-1 border-t ${
                      isAi ? 'border-slate-100 dark:border-slate-700/60 text-slate-400' : 'border-white/20 text-emerald-100'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isAi && (
                        <button
                          onClick={() => handleCopyMessage(msg.text, index)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                          title="উত্তর কপি করুন"
                        >
                          {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[10px] font-mono">{copiedIndex === index ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 text-xs p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl inline-flex shadow-xs animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span className="font-bengali font-bold">এআই মেন্টর আপনার প্রশ্ন বিশ্লেষণ ও সমাধান তৈরি করছেন...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Staged Image Attachment Banner */}
          {chatImageBase64 && (
            <div className="p-2.5 px-4 bg-emerald-500/10 dark:bg-emerald-950/40 border-t border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img src={chatImageBase64} alt="Preview" className="w-11 h-11 rounded-xl object-cover border border-emerald-500/30 shadow-2xs" />
                <div>
                  <span className="text-xs text-emerald-900 dark:text-emerald-300 font-bengali font-bold block">খাতা বা টেস্ট পেপারের ছবি সংযুক্ত হয়েছে</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Image attached ready to send</span>
                </div>
              </div>
              <button
                onClick={() => setChatImageBase64(null)}
                className="p-1.5 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-full text-emerald-700 dark:text-emerald-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Chat Input Dock */}
          <form onSubmit={handleSendMessage} className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={chatFileInputRef}
              onChange={handleChatImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => chatFileInputRef.current?.click()}
              title="খাতা বা টেস্ট পেপারের ছবি সংযুক্ত করুন"
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-2xl transition-colors shrink-0 border border-slate-200 dark:border-slate-700"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="যেকোনো প্রশ্ন, গাণিতিক সমস্যা বা ডাউট লিখুন (যেমন: কার্নো ইঞ্জিনের দক্ষতা কীভাবে বের করব?)..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bengali shadow-inner"
            />

            <button
              type="submit"
              disabled={isLoading || (!userInput.trim() && !chatImageBase64)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline font-bengali">পাঠান</span>
            </button>
          </form>
        </div>

        {/* Right Column: Studio Side Panel (Evaluation + Verified Citations) */}
        {showSidePanel && (
          <div className="lg:col-span-5 space-y-5">
            {/* Active Question Banner if opened from Explorer */}
            {activeQuestion && (
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-400 font-bengali flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" />
                    অনুশীলনাধীন প্রশ্ন: {activeQuestion.board} {activeQuestion.exam_year}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[10px] font-bold">CQ</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 font-bengali leading-relaxed">
                  <MathRenderer content={activeQuestion.stem_text} />
                </div>
                {activeSubpart && (
                  <div className="text-xs text-emerald-300 font-bengali pt-1 flex items-center gap-1.5">
                    <strong>({activeSubpart.part_label})</strong> {activeSubpart.prompt_text} [{activeSubpart.marks} নম্বর]
                  </div>
                )}
              </div>
            )}

            {/* Side Panel Tabs: Evaluator vs Formulas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidePanelTab('evaluator')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
                      sidePanelTab === 'evaluator'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>খাতা মূল্যায়ন</span>
                  </button>
                  <button
                    onClick={() => setSidePanelTab('formulas')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
                      sidePanelTab === 'formulas'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>পাঠ্যবই সূত্র</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Answer Evaluator */}
              {sidePanelTab === 'evaluator' && (
                <div className="space-y-3.5">
                  <textarea
                    value={studentAnswerText}
                    onChange={(e) => setStudentAnswerText(e.target.value)}
                    rows={4}
                    placeholder="আপনার উত্তরের ধাপসমূহ, ব্যবহৃত সূত্র এবং মান বসিয়ে হিসাব লিখুন..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bengali text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                  />

                  {/* Photo Upload for Handwriting */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="cursor-pointer px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors font-bengali border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>হাতের লেখার খাতার ছবি আপলোড</span>
                      <input type="file" accept="image/*" onChange={handleStudentEvaluationImage} className="hidden" />
                    </label>

                    {studentImageBase64 && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold font-bengali flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ছবি যুক্ত হয়েছে
                      </span>
                    )}
                  </div>

                  {/* Submit for Evaluation Button */}
                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={isEvaluating}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span className="font-bengali">বোর্ড পরীক্ষক খাতা মূল্যায়ন করছেন...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-slate-950" />
                        <span className="font-bengali">বোর্ড স্ট্যান্ডার্ড নম্বর ও ফিডব্যাক দেখুন</span>
                      </>
                    )}
                  </button>

                  {/* Live Evaluation Result Card */}
                  {evaluationResult && (
                    <div className="mt-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bengali">
                          মূল্যায়ন ফলাফল:
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                          প্রাপ্ত নম্বর: {evaluationResult.score_obtained} / {evaluationResult.max_score}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {evaluationResult.is_correct ? (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold font-bengali flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            সম্পূর্ণ সঠিক ও বোর্ড স্ট্যান্ডার্ড নির্ভুল সমাধান!
                          </div>
                        ) : (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold font-bengali flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            ভুল শনাক্ত হয়েছে: {evaluationResult.error_category ? getErrorCategoryTitle(evaluationResult.error_category) : 'ত্রুটি'}
                          </div>
                        )}
                      </div>

                      {/* Step Evaluations */}
                      {evaluationResult.step_evaluations && evaluationResult.step_evaluations.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-bengali uppercase">ধাপভিত্তিক নম্বর:</div>
                          {evaluationResult.step_evaluations.map((step) => (
                            <div
                              key={step.step}
                              className="flex items-center justify-between text-xs p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 font-bengali shadow-2xs"
                            >
                              <span className="text-slate-800 dark:text-slate-200">{step.description}</span>
                              <span className={`font-mono font-black ${step.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                +{step.score_obtained}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Corrective Advice */}
                      <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 font-bengali leading-relaxed shadow-2xs">
                        <strong className="text-slate-900 dark:text-white font-bold">শিক্ষক পরামর্শ: </strong>
                        {evaluationResult.corrective_advice_bn}
                      </div>

                      {/* Next Adaptive Question Practice Button */}
                      <button
                        onClick={handleLoadNextAdaptiveQuestion}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 text-slate-950 fill-current" />
                        <span>পরবর্তী টার্গেটেড প্রশ্ন প্র্যাকটিস করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Textbook Formulas & Grounding */}
              {sidePanelTab === 'formulas' && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase font-bengali">
                      টপিক মূলনীতি:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-bengali leading-relaxed">
                      {activeConcept.core_principle_bn}
                    </p>
                    {activeConcept.formula_latex && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 font-mono-math">
                        <MathRenderer content={`$${activeConcept.formula_latex}$`} />
                      </div>
                    )}
                  </div>

                  {relevantChunks.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase font-bengali flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        পাঠ্যবই রেফারেন্স:
                      </div>
                      {relevantChunks.slice(0, 2).map((chk) => (
                        <div key={chk.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-900 dark:text-white font-bengali">{chk.document_title}</span>
                            <span className="text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              পৃষ্ঠা {chk.page_number}
                            </span>
                          </div>
                          <div className="text-slate-700 dark:text-slate-300 font-bengali leading-relaxed">
                            {chk.content_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
