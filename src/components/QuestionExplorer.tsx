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
  const isBn = lang === 'bn';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  
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
    return CANONICAL_CHAPTERS.filter((ch) => ch.paper_id.startsWith(selectedSubjectId));
  }, [selectedSubjectId]);

  // Extract unique boards and years from questions
  const boards = useMemo(() => {
    const bSet = new Set<string>();
    questions.forEach((q) => {
      if (q.board) bSet.add(q.board);
    });
    return Array.from(bSet);
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.subject_id !== selectedSubjectId) return false;
      if (selectedChapterId !== 'all' && q.chapter_id !== selectedChapterId) return false;
      if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
      if (selectedYear !== 'all' && q.exam_year?.toString() !== selectedYear) return false;
      if (selectedFormat !== 'all' && q.question_format !== selectedFormat) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inStem = q.stem_text.toLowerCase().includes(query);
        const inBoard = q.board?.toLowerCase().includes(query);
        const inSubparts = q.subparts?.some((s) => s.prompt_text.toLowerCase().includes(query));
        if (!inStem && !inBoard && !inSubparts) return false;
      }
      return true;
    });
  }, [questions, selectedSubjectId, selectedChapterId, selectedBoard, selectedYear, selectedFormat, searchQuery]);

  const toggleSolution = (key: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMcqSelect = (questionId: string, optionKey: string) => {
    setSelectedMcqAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const getCognitiveLabel = (level: string) => {
    switch (level) {
      case 'knowledge':
        return { label: 'জ্ঞানমূলক', mark: '১ নম্বর', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'understanding':
        return { label: 'অনুধাবনমূলক', mark: '২ নম্বর', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'application':
        return { label: 'প্রয়োগমূলক', mark: '৩ নম্বর', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'higher_ability':
        return { label: 'উচ্চতর দক্ষতা', mark: '৪ নম্বর', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'সাধারণ', mark: '১', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Smart Adaptive Recommendation Banner */}
      {adaptiveTarget && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg text-[11px] uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                অ্যাডাপ্টিভ অ্যালগরিদম নির্বাচিত টার্গেটেড প্রশ্ন
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ম্যাচ স্কোর: <strong className="text-emerald-400">{adaptiveTarget.compositeScore}</strong>/100
              </span>
            </div>
            <div className="font-bold text-sm sm:text-base font-bengali text-slate-100">
              {adaptiveTarget.concept.name_bn}
              {adaptiveTarget.question.board && (
                <span className="text-xs text-slate-400 font-normal ml-2">
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
              className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4 text-slate-950" />
              <span>টার্গেটেড পরীক্ষা দিন</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Search / Filters Bar */}
      <div className="glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-bengali tracking-tight">
              এইচএসসি বোর্ড প্রশ্ন ব্যাংক ও বিশ্লেষণ
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
              বোর্ড ও সাল অনুসারে সাজানো সৃজনশীল (CQ) ও বহুনির্বাচনী (MCQ) প্রশ্নের ডেটাবেজ
            </p>
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
            মোট ফলাফল: <strong className="text-slate-900 dark:text-slate-100">{filteredQuestions.length}</strong> টি প্রশ্ন
          </div>
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="উদ্দীপক, সূত্র বা কীওয়ার্ড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bengali shadow-xs"
            />
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">সকল অধ্যায়</option>
              {availableChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.chapter_number}ম অধ্যায়: {ch.name_bn}
                </option>
              ))}
            </select>
          </div>

          {/* Board Filter */}
          <div>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">সকল বোর্ড</option>
              {boards.map((b) => (
                <option key={b} value={b}>
                  {b} বোর্ড
                </option>
              ))}
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              <option value="all">সব ফরম্যাট (CQ + MCQ)</option>
              <option value="CQ">সৃজনশীল প্রশ্ন (CQ)</option>
              <option value="MCQ">বহুনির্বাচনী প্রশ্ন (MCQ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-bengali">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mt-1">
              ফিল্টার পরিবর্তন করুন অথবা 'প্রশ্ন ইনজেকশন' স্টুডিও থেকে নতুন প্রশ্ন যুক্ত করুন।
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isCQ = q.question_format === 'CQ';
            const chapterObj = CANONICAL_CHAPTERS.find((ch) => ch.id === q.chapter_id);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Question Header Meta */}
                <div className="bg-slate-50/90 dark:bg-slate-800/80 px-5 py-3 border-b border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {q.question_format}
                    </span>
                    {q.board && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bengali">
                        {q.board} বোর্ড {q.exam_year}
                      </span>
                    )}
                    {chapterObj && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bengali hidden sm:inline">
                        • {chapterObj.name_bn}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSendToTutor(q)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bengali">টিউটরে বুঝুন</span>
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Stem (উদ্দীপক) */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 font-bengali">
                      উদ্দীপক:
                    </div>
                    <MathRenderer content={q.stem_text} className="text-slate-900 dark:text-slate-100 font-bengali text-base" />
                  </div>

                  {/* If CQ: Render Subparts a, b, c, d */}
                  {isCQ && q.subparts && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bengali">
                        প্রশ্নসমূহ ও সাবপার্ট মূল্যায়ন:
                      </h4>

                      {q.subparts.map((sub) => {
                        const cogMeta = getCognitiveLabel(sub.cognitive_level);
                        const isRevealed = revealedSolutions[`${q.id}_${sub.id}`];

                        return (
                          <div
                            key={sub.id}
                            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 space-y-3 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                                  ({sub.part_label})
                                </span>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${cogMeta.color} dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 font-bengali`}>
                                      {cogMeta.label}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">[{sub.marks} নম্বর]</span>
                                  </div>
                                  <div className="text-slate-800 dark:text-slate-200 font-bengali text-sm sm:text-base">
                                    <MathRenderer content={sub.prompt_text} />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5 shrink-0">
                                <button
                                  onClick={() => onSendToEvaluator(q, sub)}
                                  className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 font-bengali border border-emerald-200 dark:border-emerald-800"
                                >
                                  <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span className="hidden sm:inline">উত্তর জমা দিন</span>
                                </button>
                                <button
                                  onClick={() => toggleSolution(`${q.id}_${sub.id}`)}
                                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold transition-colors flex items-center gap-1"
                                  title="সমাধান দেখুন"
                                >
                                  {isRevealed ? <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Subpart Solution Drawer */}
                            {isRevealed && sub.solution_latex && (
                              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm space-y-2 animate-fadeIn">
                                <div className="font-bold text-emerald-800 dark:text-emerald-300 font-bengali flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  বোর্ড স্ট্যান্ডার্ড আদর্শ সমাধান:
                                </div>
                                <div className="font-mono-math bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                                  <MathRenderer content={sub.solution_latex} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* If MCQ: Options Selection */}
                  {!isCQ && q.mcq_options && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.mcq_options.map((opt) => {
                          const isSelected = selectedMcqAnswers[q.id] === opt.key;
                          const isCorrect = q.correct_option === opt.key;
                          const isChecked = selectedMcqAnswers[q.id] !== undefined;

                          let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700';
                          if (isChecked) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-semibold';
                            }
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleMcqSelect(q.id, opt.key)}
                              className={`p-3 rounded-xl border text-left text-sm transition-all flex items-center space-x-3 shadow-xs ${btnStyle}`}
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-800 dark:text-slate-200">
                                {opt.key}
                              </span>
                              <div className="font-bengali">
                                <MathRenderer content={opt.text} />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation for MCQ */}
                      {selectedMcqAnswers[q.id] && (
                        <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            {selectedMcqAnswers[q.id] === q.correct_option ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-bengali flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> সঠিক উত্তর! (Option {q.correct_option})
                              </span>
                            ) : (
                              <span className="text-rose-700 dark:text-rose-400 font-bold font-bengali flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> ভুল হয়েছে! সঠিক উত্তর: Option {q.correct_option}
                              </span>
                            )}
                          </div>
                          {q.full_solution_latex && (
                            <div className="mt-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono-math text-slate-800 dark:text-slate-200">
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
    </div>
  );
};
