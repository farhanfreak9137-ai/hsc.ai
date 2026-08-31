import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  GraduationCap,
  CheckCircle,
  XCircle,
  Send,
  HelpCircle,
  Zap,
  PlayCircle,
  BookOpen,
  Copy,
  Check,
  Printer,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import { Question, CQSubpart, UserConceptMastery, MistakePattern, AppSettings } from '../types';
import { CANONICAL_CHAPTERS } from '../data/canonicalTaxonomy';
import { selectNextAdaptiveQuestion } from '../services/adaptiveEngine';
import { loadStudentAttempts } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { Language } from '../services/i18n';

interface QuestionExplorerProps {
  questions: Question[];
  selectedSubjectId: string;
  masteryMap?: Record<string, UserConceptMastery>;
  mistakes?: MistakePattern[];
  onSendToTutor: (question: Question, subpart?: CQSubpart) => void;
  onSendToEvaluator: (question: Question, subpart?: CQSubpart) => void;
  settings?: AppSettings;
}

const BOARDS_LIST = [
  { id: 'all', nameBn: 'সকল বোর্ড', nameEn: 'All Boards' },
  { id: 'Dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'Rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'Chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 'Cumilla', nameBn: 'কুমিল্লা', nameEn: 'Cumilla' },
  { id: 'Dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur' },
  { id: 'Jashore', nameBn: 'যশোর', nameEn: 'Jashore' },
  { id: 'Sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'Barishal', nameBn: 'বরিশাল', nameEn: 'Barishal' },
  { id: 'Mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
];

const YEARS_LIST = ['all', '2024', '2023', '2022', '2021', '2020', '2019'];

const SUBJECT_THEMES: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  phy: { bg: 'from-cyan-500/10 to-blue-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30', badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' },
  chem: { bg: 'from-amber-500/10 to-orange-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
  hmath: { bg: 'from-indigo-500/10 to-purple-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30', badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' },
  bio: { bg: 'from-emerald-500/10 to-teal-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
  bangla: { bg: 'from-rose-500/10 to-pink-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30', badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300' },
  english: { bg: 'from-sky-500/10 to-indigo-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30', badge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300' },
  ict: { bg: 'from-teal-500/10 to-cyan-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30', badge: 'bg-teal-500/20 text-teal-700 dark:text-teal-300' },
};

const ITEMS_PER_PAGE = 10;

export const QuestionExplorer: React.FC<QuestionExplorerProps> = ({
  questions,
  selectedSubjectId,
  masteryMap = {},
  mistakes = [],
  onSendToTutor,
  onSendToEvaluator,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Solution visibility state per question / subpart
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selectedMcqAnswers, setSelectedMcqAnswers] = useState<Record<string, string>>({});

  // Compute adaptive recommendation for Question Explorer
  const attempts = useMemo(() => loadStudentAttempts(), [masteryMap, mistakes]);
  const adaptiveTarget = useMemo(() => {
    return selectNextAdaptiveQuestion(selectedSubjectId, masteryMap, mistakes, questions, attempts);
  }, [selectedSubjectId, masteryMap, mistakes, questions, attempts]);

  // Filter chapters for subject
  const availableChapters = useMemo(() => {
    return CANONICAL_CHAPTERS.filter((ch) => {
      if (selectedPaper !== 'all') {
        return ch.paper_id === selectedPaper;
      }
      return ch.paper_id.startsWith(selectedSubjectId);
    });
  }, [selectedSubjectId, selectedPaper]);

  // Subject theme styling
  const currentTheme = SUBJECT_THEMES[selectedSubjectId] || SUBJECT_THEMES.phy;

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.subject_id !== selectedSubjectId) return false;
      if (selectedPaper !== 'all' && q.paper_id !== selectedPaper) return false;
      if (selectedChapterId !== 'all' && q.chapter_id !== selectedChapterId) return false;
      if (selectedBoard !== 'all' && q.board && !q.board.toLowerCase().includes(selectedBoard.toLowerCase())) return false;
      if (selectedYear !== 'all' && q.exam_year?.toString() !== selectedYear) return false;
      if (selectedFormat !== 'all' && q.question_format !== selectedFormat) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inStem = q.stem_text.toLowerCase().includes(query);
        const inBoard = q.board?.toLowerCase().includes(query);
        const inChapter = (q as any).chapter_name?.toLowerCase().includes(query);
        const inSubparts = q.subparts?.some((s) => s.prompt_text.toLowerCase().includes(query));
        if (!inStem && !inBoard && !inChapter && !inSubparts) return false;
      }
      return true;
    });
  }, [questions, selectedSubjectId, selectedPaper, selectedChapterId, selectedBoard, selectedYear, selectedFormat, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  // Reset to page 1 on filter changes
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  // Counts summary
  const cqCount = useMemo(() => filteredQuestions.filter((q) => q.question_format === 'CQ').length, [filteredQuestions]);
  const mcqCount = useMemo(() => filteredQuestions.filter((q) => q.question_format === 'MCQ').length, [filteredQuestions]);

  const toggleSolution = (key: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFullQuestionSolution = (q: Question) => {
    const isAnyOpen = q.subparts?.some((s) => revealedSolutions[`${q.id}_${s.id || s.part_label}`]);
    const newState = !isAnyOpen;
    setRevealedSolutions((prev) => {
      const next = { ...prev };
      q.subparts?.forEach((s) => {
        next[`${q.id}_${s.id || s.part_label}`] = newState;
      });
      next[`${q.id}_full`] = newState;
      return next;
    });
  };

  const handleMcqSelect = (questionId: string, optionKey: string) => {
    setSelectedMcqAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleCopyLatex = (q: Question) => {
    let latexText = `%% HSC Question ID: ${q.id}\n`;
    latexText += `%% Board: ${q.board || 'Dhaka'} ${q.exam_year || 2023}\n\n`;
    latexText += `\\textbf{উদ্দীপক:}\n${q.stem_text}\n\n`;
    if (q.question_format === 'CQ' && q.subparts) {
      latexText += `\\textbf{প্রশ্নসমূহ:}\n\\begin{enumerate}\n`;
      q.subparts.forEach((s) => {
        latexText += `  \\item [(${s.part_label})] ${s.prompt_text} [${s.marks}]\n`;
        if (s.solution_latex) {
          latexText += `  \\\\ \\textbf{সমাধান:} ${s.solution_latex}\n`;
        }
      });
      latexText += `\\end{enumerate}\n`;
    }
    navigator.clipboard.writeText(latexText);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCognitiveLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'knowledge':
      case 'জ্ঞান':
        return { label: 'জ্ঞানমূলক', mark: '১ নম্বর', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' };
      case 'understanding':
      case 'অনুধাবন':
        return { label: 'অনুধাবনমূলক', mark: '২ নম্বর', color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' };
      case 'application':
      case 'প্রয়োগ':
        return { label: 'প্রয়োগমূলক', mark: '৩ নম্বর', color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' };
      case 'higher_ability':
      case 'উচ্চতর দক্ষতা':
        return { label: 'উচ্চতর দক্ষতা', mark: '৪ নম্বর', color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' };
      default:
        return { label: 'সাধারণ', mark: '১', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Stats Overview */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r ${currentTheme.bg} bg-white dark:bg-slate-900 border ${currentTheme.border} shadow-sm backdrop-blur-md relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-bengali uppercase tracking-wider flex items-center gap-1.5 ${currentTheme.badge}`}>
                <BookOpen className="w-3.5 h-3.5" />
                অফলাইন প্রশ্ন ব্যাংক ও বোর্ড আর্কাইভ
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                100% Offline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-bengali tracking-tight">
              এইচএসসি বিগত বছরের প্রশ্ন ও শিক্ষক সলিউশন এক্সপ্লোরার
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bengali max-w-2xl leading-relaxed">
              বোর্ড ও সাল অনুসারে ফিল্টার করে নিখুঁত $\LaTeX$ সমীকরণ, গাণিতিক সমাধান ও (ক, খ, গ, ঘ) নম্বর রুব্রিক্স অনুশীলন করুন।
            </p>
          </div>

          {/* Stat Badges Grid */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{filteredQuestions.length}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali mt-0.5">মোট প্রশ্ন</div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{cqCount}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali mt-0.5">সৃজনশীল (CQ)</div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{mcqCount}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali mt-0.5">বহুনির্বাচনি (MCQ)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Adaptive Recommendation Banner */}
      {adaptiveTarget && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg text-[11px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                অ্যাডাপ্টিভ অ্যালগরিদম নির্বাচিত টার্গেটেড প্রশ্ন
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ম্যাচ স্কোর: <strong className="text-emerald-400">{adaptiveTarget.compositeScore}</strong>/100
              </span>
            </div>
            <div className="font-bold text-sm sm:text-base font-bengali text-slate-100 flex items-center gap-2">
              <span>{adaptiveTarget.concept.name_bn}</span>
              {adaptiveTarget.question.board && (
                <span className="text-xs text-slate-400 font-normal">
                  ({adaptiveTarget.question.board} বোর্ড {adaptiveTarget.question.exam_year || ''})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-bengali">
              {adaptiveTarget.selectionSummaryBn}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onSendToEvaluator(adaptiveTarget.question, adaptiveTarget.targetSubpart)}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <PlayCircle className="w-4 h-4 text-slate-950" />
              <span>টার্গেটেড পরীক্ষা দিন</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Control Studio */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl space-y-5 shadow-sm">
        {/* Paper Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleFilterChange(setSelectedPaper, 'all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-bengali transition-all shrink-0 ${
              selectedPaper === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📚 উভয় পত্র (Paper 1 & 2)
          </button>
          <button
            onClick={() => handleFilterChange(setSelectedPaper, `${selectedSubjectId}_1`)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-bengali transition-all shrink-0 ${
              selectedPaper === `${selectedSubjectId}_1`
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📖 ১ম পত্র (Paper 1)
          </button>
          <button
            onClick={() => handleFilterChange(setSelectedPaper, `${selectedSubjectId}_2`)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-bengali transition-all shrink-0 ${
              selectedPaper === `${selectedSubjectId}_2`
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📖 ২য় পত্র (Paper 2)
          </button>
        </div>

        {/* Search & Main Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder="উদ্দীপক, সূত্র, অধ্যায় বা কীওয়ার্ড দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
            />
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={selectedChapterId}
              onChange={(e) => handleFilterChange(setSelectedChapterId, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">📂 সকল অধ্যায়</option>
              {availableChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.chapter_number}ম অধ্যায়: {ch.name_bn}
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => handleFilterChange(setSelectedFormat, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">📝 সব ফরম্যাট (CQ + MCQ)</option>
              <option value="CQ">📄 সৃজনশীল প্রশ্ন (CQ)</option>
              <option value="MCQ">🔘 বহুনির্বাচনী প্রশ্ন (MCQ)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange(setSelectedYear, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">📅 সকল শিক্ষাবর্ষ</option>
              {YEARS_LIST.filter((y) => y !== 'all').map((y) => (
                <option key={y} value={y}>
                  {y} সালের প্রশ্ন
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Board Chips Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            বোর্ড দ্রুত নির্বাচন:
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BOARDS_LIST.map((b) => (
              <button
                key={b.id}
                onClick={() => handleFilterChange(setSelectedBoard, b.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bengali font-semibold transition-all ${
                  selectedBoard === b.id
                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {b.nameBn} {b.id !== 'all' && 'বোর্ড'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-3">
            <HelpCircle className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 font-bengali">
              কোনো প্রশ্ন পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bengali max-w-md mx-auto">
              অনুগ্রহ করে ফিল্টার পরিবর্তন করুন অথবা 'কাঁচা প্রশ্নপত্রের ছবি' ফোল্ডারে ইমেজ যুক্ত করে ডিজিটাইজ করুন।
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            const isCQ = q.question_format === 'CQ';
            const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
            const chapterObj = CANONICAL_CHAPTERS.find((ch) => ch.id === q.chapter_id);
            const isAllRevealed = isCQ && q.subparts?.every((s) => revealedSolutions[`${q.id}_${s.id || s.part_label}`]);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Question Header Meta */}
                <div className="bg-slate-50/90 dark:bg-slate-800/80 px-5 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950">
                      #{globalIndex}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {q.question_format === 'CQ' ? '📄 সৃজনশীল (CQ)' : '🔘 বহুনির্বাচনি (MCQ)'}
                    </span>
                    {q.board && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bengali">
                        🏛️ {q.board} বোর্ড {q.exam_year || ''}
                      </span>
                    )}
                    {chapterObj && (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bengali hidden sm:inline">
                        • {chapterObj.name_bn}
                      </span>
                    )}
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Copy LaTeX */}
                    <button
                      onClick={() => handleCopyLatex(q)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs"
                      title="সম্পূর্ণ প্রশ্নের LaTeX কোড কপি করুন"
                    >
                      {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span className="font-mono text-[11px]">{copiedId === q.id ? 'কপি হয়েছে' : 'LaTeX'}</span>
                    </button>

                    {/* Grounded Tutor */}
                    <button
                      onClick={() => onSendToTutor(q)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 shadow-xs"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bengali">টিউটরে বুঝুন</span>
                    </button>

                    {/* Toggle Full Question Solution (for CQ) */}
                    {isCQ && (
                      <button
                        onClick={() => toggleFullQuestionSolution(q)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 shadow-xs font-bengali"
                      >
                        {isAllRevealed ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
                        <span>{isAllRevealed ? 'সমাধান লুকান' : 'সব সমাধান'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Stem (উদ্দীপক) */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 font-bengali flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      উদ্দীপক (দৃশ্যকল্প):
                    </div>
                    <MathRenderer content={q.stem_text} className="text-slate-900 dark:text-slate-100 font-bengali text-sm sm:text-base leading-relaxed" />
                  </div>

                  {/* If CQ: Subparts a, b, c, d */}
                  {isCQ && q.subparts && (
                    <div className="space-y-3.5 pt-1">
                      <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bengali flex items-center gap-1.5">
                        <span>প্রশ্ন ও সাবপার্ট মূল্যায়ন (ক, খ, গ, ঘ):</span>
                      </h4>

                      {q.subparts.map((sub, sIdx) => {
                        const cogMeta = getCognitiveLabel(sub.cognitive_level || '');
                        const subKey = `${q.id}_${sub.id || sub.part_label || sIdx}`;
                        const isRevealed = revealedSolutions[subKey];

                        return (
                          <div
                            key={subKey}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 space-y-3 shadow-2xs transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-bengali font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                  {sub.part_label?.includes('(') ? sub.part_label : `(${sub.part_label})`}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cogMeta.color} font-bengali`}>
                                      {cogMeta.label}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">[{sub.marks} নম্বর]</span>
                                  </div>
                                  <div className="text-slate-800 dark:text-slate-100 font-bengali text-sm sm:text-base leading-relaxed">
                                    <MathRenderer content={sub.prompt_text} />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => onSendToEvaluator(q, sub)}
                                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 font-bengali border border-emerald-200 dark:border-emerald-800 shadow-2xs active:scale-95"
                                >
                                  <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span className="hidden sm:inline">অনুশীলন করুন</span>
                                </button>
                                <button
                                  onClick={() => toggleSolution(subKey)}
                                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                                  title="সমাধান দেখুন"
                                >
                                  {isRevealed ? <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Subpart Solution Drawer */}
                            {isRevealed && sub.solution_latex && (
                              <div className="mt-3 p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm space-y-2.5 animate-fadeIn">
                                <div className="font-bold text-emerald-900 dark:text-emerald-200 font-bengali flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  বোর্ড স্ট্যান্ডার্ড অফিসিয়াল শিক্ষক সমাধান:
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 text-slate-800 dark:text-slate-100 shadow-2xs leading-relaxed">
                                  <MathRenderer content={sub.solution_latex} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* If MCQ: Options Selection Sandbox */}
                  {!isCQ && q.mcq_options && (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.mcq_options.map((opt) => {
                          const isSelected = selectedMcqAnswers[q.id] === opt.key;
                          const isCorrect = q.correct_option === opt.key;
                          const isChecked = selectedMcqAnswers[q.id] !== undefined;

                          let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80';
                          if (isChecked) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 font-bold ring-2 ring-emerald-500/20';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-100 font-bold ring-2 ring-rose-500/20';
                            }
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleMcqSelect(q.id, opt.key)}
                              className={`p-3.5 rounded-2xl border text-left text-sm transition-all flex items-center space-x-3.5 shadow-2xs ${btnStyle}`}
                            >
                              <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-800 dark:text-slate-200">
                                {opt.key}
                              </span>
                              <div className="font-bengali text-sm sm:text-base leading-relaxed">
                                <MathRenderer content={opt.text} />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation for MCQ */}
                      {selectedMcqAnswers[q.id] && (
                        <div className="mt-3 p-5 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm space-y-2.5 animate-fadeIn">
                          <div className="flex items-center gap-2">
                            {selectedMcqAnswers[q.id] === q.correct_option ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold font-bengali flex items-center gap-1.5">
                                <CheckCircle className="w-5 h-5" /> সঠিক উত্তর! (Option {q.correct_option})
                              </span>
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 font-extrabold font-bengali flex items-center gap-1.5">
                                <XCircle className="w-5 h-5" /> ভুল উত্তর! সঠিক উত্তর: Option {q.correct_option}
                              </span>
                            )}
                          </div>
                          {q.full_solution_latex && (
                            <div className="mt-2 text-xs sm:text-sm bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed shadow-2xs">
                              <MathRenderer content={q.full_solution_latex} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
            পৃষ্ঠা <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> / {totalPages} (মোট {filteredQuestions.length} টি প্রশ্ন)
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-2 rounded-xl text-xs font-bold font-bengali border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী</span>
            </button>

            {/* Quick Page Jump Buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(totalPages - 4 + i, Math.max(1, currentPage - 2 + i));
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-2 rounded-xl text-xs font-bold font-bengali border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
            >
              <span>পরবর্তী</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
