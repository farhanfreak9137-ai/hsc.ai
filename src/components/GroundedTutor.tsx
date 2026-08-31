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

  // Student Answering & Evaluator Tab State
  const [showSidePanel, setShowSidePanel] = useState<boolean>(!!initialQuestion);
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
          text: `স্বাগতম! আমি আপনার **এইচএসসি এআই শিক্ষক**। 🎓\n\nআপনার যেকোনো বিষয়—**বাংলা, ইংরেজি, আইসিটি, পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত কিংবা জীববিজ্ঞান**-এর যেকোনো প্রশ্ন, অঙ্ক, ব্যাকরণ বা থিওরির ডাউট এখানে জিজ্ঞেস করতে পারেন।\n\nবইয়ের নির্দিষ্ট প্রশ্ন ছাড়াও যেকোনো টেস্ট পেপার, গাইড বই বা ক্লাসের জটিল সমস্যা লিখে বা সরাসরি **খাতার ছবি** তুলে দিতে পারেন! আপনার আপলোড করা বইয়ের পৃষ্ঠা থেকেও সরাসরি রেফারেন্স দেওয়া হবে।`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      const welcomeByMode = {
        socratic: `আমরা এখন **${activeConcept.name_bn}** (${activeConcept.name_en}) নিয়ে আলোচনা করব。\n\nএই বিষয়ে আপনার কোনো প্রশ্ন থাকলে লিখুন, অথবা বলুন এই টপিকের মূল সূত্র বা রাশিমালাটি কীভাবে গঠিত হয়? আমি আপনাকে ধাপে ধাপে নির্দেশনা দেব।`,
        expository: `**${activeConcept.name_bn}**-এর পূর্ণাঙ্গ লেকচারে আপনাকে স্বাগতম。\n\nএখানে এনসিটিবি অনুমোদিত পাঠ্যবই অনুযায়ী মূলনীতি, প্রতিপাদন ও বোর্ড স্ট্যান্ডার্ড নমুনা অংক বিশ্লেষণ করা হবে।`,
        exam: `**${activeConcept.name_bn}**-এর পরীক্ষা ও খাতা মূল্যায়ন মোড। ডান পাশের প্যানেলে আপনার সমাধান লিখে বা ছবি দিয়ে জমা দিন।`,
        revision: `**${activeConcept.name_bn}** দ্রুত রিভিশন চিটশিট:\n- সূত্র: $${activeConcept.formula_latex || ''}$\n- মূলনীতি: ${activeConcept.core_principle_bn}\n- সতর্কবার্তা: একক রূপান্তর (SI unit) এবং সূত্রের শর্তে খেয়াল রাখুন।`,
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

  // Sample quick questions to help students test asking random things
  const samplePrompts = [
    'পানিতে নিমজ্জিত অবস্থায় বস্তুর ওজন কম অনুভূত হয় কেন?',
    'কৌণিক ভরবেগের সংরক্ষণ সূত্র ও উদাহরণ বুঝিয়ে দিন',
    'লুইস এসিড ও ক্ষারকের মধ্যে প্রধান পার্থক্য কী?',
    'কার্নো ইঞ্জিনের দক্ষতা $\\eta = 1 - \\frac{T_2}{T_1}$ সমীকরণটি কীভাবে আসে?',
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Scope Selector Header: Ask Any Question vs Textbook Chapter */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Scope Mode */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 font-bengali flex items-center gap-2 tracking-tight">
                এইচএসসি এআই টিউটর ও ডাউট সমাধান
              </h1>
              <p className="text-xs text-slate-500 font-bengali">
                যেকোনো র্যান্ডম প্রশ্ন, কঠিন অঙ্ক বা পাঠ্যবইয়ের অধ্যায় সম্পর্কে সরাসরি আলোচনা করুন
              </p>
            </div>
          </div>

          {/* Scope Toggle: Open Doubt vs Textbook Topic */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bengali self-start md:self-auto">
            <button
              onClick={() => setTutorScope('open_doubt')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                tutorScope === 'open_doubt'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>যেকোনো প্রশ্ন / ডাউট জিজ্ঞেস করুন</span>
            </button>
            <button
              onClick={() => setTutorScope('textbook_topic')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                tutorScope === 'textbook_topic'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>পাঠ্যবইয়ের নির্দিষ্ট অধ্যায়</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector if Textbook Topic is chosen */}
        {tutorScope === 'textbook_topic' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 font-bengali">অধ্যায়/টপিক:</span>
              <select
                value={selectedConceptId}
                onChange={(e) => setSelectedConceptId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {subjectConcepts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_bn} ({c.name_en})
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Mode Buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bengali border border-slate-200">
              <button
                onClick={() => setActiveMode('socratic')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeMode === 'socratic' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                💡 ইঙ্গিত দিয়ে শেখানো (Socratic)
              </button>
              <button
                onClick={() => setActiveMode('expository')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeMode === 'expository' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                📖 পূর্ণাঙ্গ লেকচার
              </button>
              <button
                onClick={() => setActiveMode('revision')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeMode === 'revision' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                ⚡ দ্রুত রিভিশন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Interactive Chat vs. Answer Evaluation / Citations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Chat (8 or 12 cols depending on side panel) */}
        <div
          className={`${
            showSidePanel ? 'lg:col-span-7' : 'lg:col-span-12'
          } glass-panel rounded-2xl flex flex-col h-[650px] overflow-hidden transition-all shadow-sm`}
        >
          {/* Chat Header */}
          <div className="p-3.5 px-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-xs">
                AI
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm font-bengali">
                  {tutorScope === 'open_doubt'
                    ? 'ওপেন ডাউট সমাধান ও টিউটর'
                    : `${activeConcept.name_bn} (${activeMode === 'socratic' ? 'সক্রেটিক গাইড' : 'লেকচার'})`}
                </h3>
                <p className="text-[11px] text-slate-500 font-bengali">
                  {activeMode === 'socratic'
                    ? 'ধাপে ধাপে ক্লু ও সূত্রের ইঙ্গিত দিয়ে স্বাবলম্বী করে তোলে'
                    : 'এনসিটিবি পাঠ্যবই অনুসারে পূর্ণাঙ্গ সমাধান ও সূত্র প্রদান করে'}
                </p>
              </div>
            </div>

            {/* Toggle Side Panel Button */}
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold font-bengali transition-colors flex items-center gap-1.5 border border-slate-200 shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showSidePanel ? 'খাতা প্যানেল লুকান' : 'খাতা মূল্যায়ন প্যানেল'}</span>
            </button>
          </div>

          {/* Quick Suggestion Chips (when chat is new or in open doubt) */}
          {chatMessages.length <= 2 && (
            <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-emerald-800 shrink-0 font-bengali flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-emerald-600" /> নমুনা প্রশ্ন:
              </span>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, prompt)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/80 border border-emerald-200/60 rounded-lg text-xs font-bengali text-slate-700 whitespace-nowrap transition-colors shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
            {chatMessages.map((msg, index) => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                      T
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-sm leading-relaxed space-y-2 shadow-xs ${
                      isAi
                        ? 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none font-bengali'
                    }`}
                  >
                    {msg.attachedImage && (
                      <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs mb-2 shadow-sm">
                        <img src={msg.attachedImage} alt="Attached Problem" className="w-full h-auto object-cover" />
                      </div>
                    )}
                    <MathRenderer content={msg.text} />
                    <div className={`text-[10px] mt-1 text-right ${isAi ? 'text-slate-400' : 'text-emerald-100'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs p-2.5 bg-white border border-slate-200 rounded-xl inline-flex shadow-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span className="font-bengali font-semibold">টিউটর আপনার প্রশ্ন বিশ্লেষণ করছেন...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Staged Chat Image Preview */}
          {chatImageBase64 && (
            <div className="p-2 px-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={chatImageBase64} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-emerald-200" />
                <span className="text-xs text-emerald-900 font-bengali font-semibold">ছবি সংযুক্ত হয়েছে</span>
              </div>
              <button
                onClick={() => setChatImageBase64(null)}
                className="p-1 hover:bg-emerald-200 rounded-full text-emerald-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar with Direct Photo Attachment */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
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
              title="খাতার অঙ্ক বা টেস্ট পেপারের ছবি তুলুন/আপলোড করুন"
              className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl transition-colors shrink-0 border border-slate-200/80"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="যেকোনো প্রশ্ন, অঙ্ক বা ডাউট লিখুন (যেমন: কৌণিক বেগ ও রৈখিক বেগের সম্পর্ক কী?)..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />

            <button
              type="submit"
              disabled={isLoading || (!userInput.trim() && !chatImageBase64)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline font-bengali">পাঠান</span>
            </button>
          </form>
        </div>

        {/* Right Column: Answer Evaluation Studio & Verified Textbook Grounding (5 cols) */}
        {showSidePanel && (
          <div className="lg:col-span-5 space-y-5">
            {/* Active Question Context if opened from Question Bank */}
            {activeQuestion && (
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-emerald-400 font-bengali">
                    অনুশীলনাধীন প্রশ্ন: {activeQuestion.board} {activeQuestion.exam_year}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[10px]">CQ</span>
                </div>
                <div className="text-xs text-slate-200 bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-bengali">
                  <MathRenderer content={activeQuestion.stem_text} />
                </div>
                {activeSubpart && (
                  <div className="text-xs text-emerald-300 font-bengali pt-1">
                    <strong>({activeSubpart.part_label})</strong> {activeSubpart.prompt_text} [{activeSubpart.marks} নম্বর]
                  </div>
                )}
              </div>
            )}

            {/* Student Answer Evaluation Studio */}
            <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-bengali flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    উত্তর খাতা মূল্যায়ন ও ভুল বিশ্লেষণ
                  </h4>
                  <p className="text-xs text-slate-500 font-bengali">
                    টাইপ করুন বা খাতার ছবি আপলোড করে নম্বর যাচাই করুন
                  </p>
                </div>
              </div>

              {/* Typing / Input Area */}
              <div className="space-y-3">
                <textarea
                  value={studentAnswerText}
                  onChange={(e) => setStudentAnswerText(e.target.value)}
                  rows={3}
                  placeholder="আপনার উত্তরের ধাপসমূহ, সূত্র এবং মান বসিয়ে হিসাব লিখুন..."
                  className="w-full p-3 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />

                {/* Photo Upload for Handwriting */}
                <div className="flex items-center justify-between text-xs">
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition-colors font-bengali border border-slate-200">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>খাতার ছবি আপলোড</span>
                    <input type="file" accept="image/*" onChange={handleStudentEvaluationImage} className="hidden" />
                  </label>

                  {studentImageBase64 && (
                    <span className="text-emerald-700 font-semibold font-bengali flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ছবি যুক্ত হয়েছে
                    </span>
                  )}
                </div>

                {/* Submit for Evaluation Button */}
                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span className="font-bengali">বোর্ড পরীক্ষক খাতা দেখছেন...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-slate-950" />
                      <span className="font-bengali">বোর্ড স্ট্যান্ডার্ড নম্বর দেখুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Evaluation Result Card */}
              {evaluationResult && (
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-bengali">
                      ফলাফল:
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-xs">
                      নম্বর: {evaluationResult.score_obtained} / {evaluationResult.max_score}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {evaluationResult.is_correct ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-bengali flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        সম্পূর্ণ সঠিক ও নির্ভুল সমাধান!
                      </div>
                    ) : (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold font-bengali flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        ভুল শনাক্ত হয়েছে: {evaluationResult.error_category ? getErrorCategoryTitle(evaluationResult.error_category) : 'ত্রুটি'}
                      </div>
                    )}
                  </div>

                  {/* Step Evaluations */}
                  {evaluationResult.step_evaluations && evaluationResult.step_evaluations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 font-bengali uppercase">ধাপভিত্তিক নম্বর:</div>
                      {evaluationResult.step_evaluations.map((step) => (
                        <div
                          key={step.step}
                          className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-200/80 font-bengali"
                        >
                          <span className="text-slate-700">{step.description}</span>
                          <span className={`font-mono font-bold ${step.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                            +{step.score_obtained}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Corrective Advice */}
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 font-bengali leading-relaxed">
                    <strong className="text-slate-900">পরামর্শ: </strong>
                    {evaluationResult.corrective_advice_bn}
                  </div>

                  {/* NEXT ADAPTIVE PRACTICE DISPATCHER BUTTON */}
                  <div className="pt-2">
                    <button
                      onClick={handleLoadNextAdaptiveQuestion}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-slate-950 fill-current" />
                      <span>পরবর্তী টার্গেটেড প্রশ্ন প্র্যাকটিস করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grounded Source Citations Box */}
            <div className="glass-panel p-4 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-bengali flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  পাঠ্যবই রেফারেন্স (Source Authority)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">NCTB Approved</span>
              </div>

              {relevantChunks.length > 0 ? (
                relevantChunks.slice(0, 2).map((chk) => (
                  <div key={chk.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-900 font-bengali">{chk.document_title}</span>
                      <span className="text-[10px] font-mono bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        পৃষ্ঠা {chk.page_number}
                      </span>
                    </div>
                    <div className="text-slate-600 font-bengali leading-relaxed">
                      {chk.content_text}
                    </div>
                    {chk.formula_latex && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono-math text-emerald-800">
                        <MathRenderer content={`$${chk.formula_latex}$`} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 font-bengali p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  এনসিটিবি বিজ্ঞান পাঠ্যবইয়ের সূত্র ও প্রমাণমালা সংযুক্ত।
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
