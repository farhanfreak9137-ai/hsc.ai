import React, { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Flame,
  HelpCircle,
  PlayCircle,
  Zap,
  Check,
} from 'lucide-react';
import {
  CANONICAL_CONCEPTS,
  CANONICAL_CHAPTERS,
  CANONICAL_SUBJECTS,
  CANONICAL_ARCHETYPES,
} from '../data/canonicalTaxonomy';
import {
  Question,
  CQSubpart,
  UserConceptMastery,
  MistakePattern,
  PriorityBreakdown,
  AppSettings,
} from '../types';
import { calculateConceptPriority } from '../services/priorityEngine';
import { selectNextAdaptiveQuestion, AdaptiveSelectionResult } from '../services/adaptiveEngine';
import { loadStudentAttempts } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { MasteryTrendChart } from './MasteryTrendChart';
import { getSubjectDisplayName, Language } from '../services/i18n';
import { NavTab } from './Navbar';

interface DashboardProps {
  selectedSubjectId: string;
  questions: Question[];
  masteryMap: Record<string, UserConceptMastery>;
  mistakes: MistakePattern[];
  onSelectConceptToStudy: (conceptId: string, mode?: 'socratic' | 'expository') => void;
  onStartAdaptivePractice?: (question: Question, subpart?: CQSubpart) => void;
  onNavigateToTab: (tab: NavTab) => void;
  onOpenGuide?: () => void;
  settings?: AppSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({
  selectedSubjectId,
  questions,
  masteryMap,
  mistakes,
  onSelectConceptToStudy,
  onStartAdaptivePractice,
  onNavigateToTab,
  onOpenGuide,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';

  // Current subject metadata
  const currentSubject = CANONICAL_SUBJECTS.find((s) => s.id === selectedSubjectId) || CANONICAL_SUBJECTS[0];

  // Filter concepts for selected subject
  const subjectConcepts = useMemo(() => {
    return CANONICAL_CONCEPTS.filter((c) => c.subject_id === selectedSubjectId);
  }, [selectedSubjectId]);

  // Load past attempts
  const attempts = useMemo(() => {
    return loadStudentAttempts();
  }, [masteryMap, mistakes]);

  // Deterministic Adaptive Recommendation
  const adaptiveTarget: AdaptiveSelectionResult | null = useMemo(() => {
    return selectNextAdaptiveQuestion(selectedSubjectId, masteryMap, mistakes, questions, attempts);
  }, [selectedSubjectId, masteryMap, mistakes, questions, attempts]);

  // Compute prioritized list
  const prioritizedConcepts: PriorityBreakdown[] = useMemo(() => {
    return subjectConcepts
      .map((concept) => {
        const chapter = CANONICAL_CHAPTERS.find((ch) => ch.id === concept.chapter_id);
        const mastery = masteryMap[concept.id];
        return calculateConceptPriority(concept, chapter, mastery, mistakes);
      })
      .sort((a, b) => b.priority_score - a.priority_score);
  }, [subjectConcepts, masteryMap, mistakes]);

  // Top recommended concept
  const topFocus = prioritizedConcepts[0];

  // Subject Stats Summary
  const stats = useMemo(() => {
    const totalConcepts = subjectConcepts.length;
    const masteredCount = subjectConcepts.filter(
      (c) => masteryMap[c.id]?.mastery_state === 'mastered'
    ).length;
    const weakCount = subjectConcepts.filter(
      (c) => masteryMap[c.id]?.mastery_state === 'weak_struggling'
    ).length;
    const inProgressCount = subjectConcepts.filter(
      (c) => masteryMap[c.id]?.mastery_state === 'in_progress'
    ).length;

    const subjectMistakes = mistakes.filter(
      (m) => m.subject_id === selectedSubjectId && !m.is_rectified
    );

    const subjectQuestions = questions.filter((q) => q.subject_id === selectedSubjectId);

    return {
      totalConcepts,
      masteredCount,
      weakCount,
      inProgressCount,
      activeMistakesCount: subjectMistakes.length,
      totalQuestions: subjectQuestions.length,
      readinessPercent: totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0,
    };
  }, [subjectConcepts, masteryMap, mistakes, questions, selectedSubjectId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Getting Started & Guide Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-md font-bengali">
              {currentSubject.name_bn}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bengali">এইচএসসি পরীক্ষা প্রস্তুতি ইন্টেলিজেন্স</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 font-bengali tracking-tight">
            কীভাবে শুরু করবেন? (সহজ ৩টি ধাপ)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali">
            অন্ধের মতো সবকিছু না পড়ে তথ্যভিত্তিক স্মার্ট স্টাডি করুন:
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold font-bengali transition-colors flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ব্যবহার নির্দেশিকা</span>
            </button>
          )}
          <button
            onClick={() => onNavigateToTab('tutor')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>যেকোনো প্রশ্ন জিজ্ঞেস করুন</span>
          </button>
        </div>
      </div>

      {/* 5 Card High-Impact Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => onNavigateToTab('tutor')}
          className="p-4 glass-card-hover rounded-2xl cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">
              ১
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs font-bengali group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            এআই ডাউট সলভিং
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
            যেকোনো কঠিন অঙ্ক, সূত্রের ব্যাখ্যা বা বইয়ের প্রশ্ন সরাসরি বুঝে নিন।
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('exam')}
          className="p-4 glass-card-hover rounded-2xl cursor-pointer group space-y-2 border-emerald-300/60 dark:border-emerald-700/60 bg-emerald-50/30 dark:bg-emerald-950/30"
        >
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-mono font-bold flex items-center justify-center">
              ২
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs font-bengali group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            টাইমড মক টেস্ট
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
            পূর্ণাঙ্গ সময়াবদ্ধ বোর্ড সিমুলেশন ও পারফরম্যান্স ডায়াগনস্টিক।
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('worksheet')}
          className="p-4 glass-card-hover rounded-2xl cursor-pointer group space-y-2 border-blue-300/60 dark:border-blue-700/60 bg-blue-50/30 dark:bg-blue-950/30"
        >
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-mono font-bold flex items-center justify-center">
              ৩
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-blue-950 dark:text-blue-200 text-xs font-bengali group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            PDF প্রশ্নপত্র জেনারেটর
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
            প্রিন্টযোগ্য বোর্ড স্ট্যান্ডার্ড মডেল প্রশ্নপত্র ও রিভিশন শিট তৈরি করুন।
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('questions')}
          className="p-4 glass-card-hover rounded-2xl cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-mono font-bold flex items-center justify-center">
              ৪
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs font-bengali group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            বিগত বোর্ড প্রশ্ন
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
            সকল শিক্ষা বোর্ডের সৃজনশীল ও বহুনির্বাচনি প্রশ্নের সমাধান ব্যাংক।
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('mistakes')}
          className="p-4 glass-card-hover rounded-2xl cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold flex items-center justify-center">
              ৫
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs font-bengali group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            ভুল শোধনাগার
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
            ভুল হওয়া কনসেপ্টগুলোর অনুরূপ নতুন প্রশ্ন প্র্যাকটিস করে ঘাটতি পূরণ।
          </p>
        </div>
      </div>

      {/* Top Banner: What Should I Study First? */}
      {topFocus && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/90 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  সর্বোচ্চ প্রায়োরিটি টপিক
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Priority Score: <span className="text-emerald-400 font-bold">{topFocus.priority_score}/100</span>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-bengali text-white">
                  {topFocus.concept_name_bn}
                </h2>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{topFocus.concept_name_en} • {topFocus.chapter_name_bn}</p>
              </div>

              {/* Recommendation Rationale */}
              <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 font-bengali flex items-start gap-2.5 backdrop-blur-sm">
                <BrainCircuit className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300">কেন এটি প্রথমে পড়বেন? </span>
                  {topFocus.recommended_reason}
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="px-2.5 py-1 bg-slate-900/80 rounded-lg border border-white/10 text-slate-300">
                  🏛️ বিগত বোর্ডে এসেছে: <strong className="text-white">{topFocus.board_appearance_count} বার</strong>
                </span>
                <span className="px-2.5 py-1 bg-slate-900/80 rounded-lg border border-white/10 text-slate-300">
                  🎯 দুর্বলতা সূচক: <strong className="text-rose-400">{topFocus.weakness_index}%</strong>
                </span>
                <span className="px-2.5 py-1 bg-slate-900/80 rounded-lg border border-white/10 text-slate-300">
                  ⚠️ সক্রিয় ভুল: <strong className="text-amber-400">{topFocus.active_mistakes_count}টি</strong>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => onSelectConceptToStudy(topFocus.concept_id, 'socratic')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>সক্রেটিক পদ্ধতিতে শিখুন</span>
              </button>
              <button
                onClick={() => onSelectConceptToStudy(topFocus.concept_id, 'expository')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>পাঠ্যবই ভিত্তিক নোট ও সূত্র</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adaptive Targeted Practice Dispatcher Card */}
      {adaptiveTarget && (
        <div className="glass-panel rounded-2xl border-emerald-500/40 p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-fadeIn">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-extrabold rounded-md text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-current" />
                পরবর্তী টার্গেটেড প্রশ্ন প্র্যাকটিস
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                ম্যাচ স্কোর: <strong className="text-emerald-700 dark:text-emerald-400">{adaptiveTarget.compositeScore}</strong>/100
              </span>
              {adaptiveTarget.question.board && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded text-xs font-bengali border border-slate-200 dark:border-slate-700">
                  🏛️ {adaptiveTarget.question.board} বোর্ড {adaptiveTarget.question.exam_year || ''}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold font-bengali text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {adaptiveTarget.concept.name_bn}
                {adaptiveTarget.targetSubpart && (
                  <span className="text-xs font-normal text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ({adaptiveTarget.targetSubpart.part_label.toUpperCase()}) {adaptiveTarget.targetSubpart.cognitive_level === 'application' ? 'প্রয়োগমূলক' : 'উচ্চতর দক্ষতা'}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bengali mt-0.5 leading-relaxed">
                🎯 <strong>সুপারিশের কারণ:</strong> {adaptiveTarget.selectionSummaryBn}
              </p>
            </div>

            {/* Evidence Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {adaptiveTarget.selectionReasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 rounded-md text-[11px] font-bengali border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {reason}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                if (onStartAdaptivePractice) {
                  onStartAdaptivePractice(adaptiveTarget.question, adaptiveTarget.targetSubpart);
                } else {
                  onNavigateToTab('questions');
                }
              }}
              className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              <span>টার্গেটেড প্র্যাকটিস শুরু করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>পরীক্ষা প্রস্তুতি সূচক</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">{stats.readinessPercent}%</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bengali">
            {stats.masteredCount} / {stats.totalConcepts} টি টপিক আয়ত্তে এসেছে
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>সক্রিয় দুর্বলতা / ভুল</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{stats.activeMistakesCount}</div>
          <button
            onClick={() => onNavigateToTab('mistakes')}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold mt-1 font-bengali flex items-center gap-1"
          >
            ভুল শোধনাগারে দেখুন <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>অ্যানালাইজড বোর্ড প্রশ্ন</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">{stats.totalQuestions}</div>
          <button
            onClick={() => onNavigateToTab('questions')}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold mt-1 font-bengali flex items-center gap-1"
          >
            প্রশ্ন ভান্ডারে ফিল্টার করুন <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>স্মার্ট স্প্রিন্ট প্ল্যানার</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bengali mt-1">টাইম-বক্সড স্টাডি</div>
          <button
            onClick={() => onNavigateToTab('sprint')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold mt-2 font-bengali flex items-center gap-1"
          >
            ৪৫/৯০ মিনিট স্প্রিন্ট শুরু করুন <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mastery & Accuracy Trend Line Visualization */}
      <MasteryTrendChart
        selectedSubjectId={selectedSubjectId}
        masteryMap={masteryMap}
        attempts={attempts}
      />

      {/* High-Yield Ranked Concept Matrix */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 font-bengali">
              {currentSubject.name_bn}: অধ্যায়ভিত্তিক প্রায়োরিটি র‍্যাঙ্কিং
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
              বিগত board পরীক্ষার পৌনঃপুনিকতা, আপনার ভুলের ইতিহাস ও সিলেবাস গুরুত্বের সমন্বয়ে গণনাকৃত।
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> দুর্বল
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> প্রগ্রেস
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> আয়ত্ত
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bengali">টপিক ও মূল সূত্র</th>
                <th className="py-3 px-3 font-bengali">অধ্যায়</th>
                <th className="py-3 px-3 text-center">বোর্ড পৌনঃপুনিকতা</th>
                <th className="py-3 px-3 text-center">সিনারিও আর্কেটাইপ কাভারেজ</th>
                <th className="py-3 px-3 text-center">নির্ভুলতা</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-center font-mono">Priority</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {prioritizedConcepts.map((item, idx) => {
                const conceptRaw = CANONICAL_CONCEPTS.find((c) => c.id === item.concept_id);
                const userMastery = masteryMap[item.concept_id];
                const conceptArchetypes = CANONICAL_ARCHETYPES.filter((a) => a.concept_id === item.concept_id);
                const solvedArchetypes = userMastery?.solved_archetype_ids || [];
                const isTop = idx === 0;

                return (
                  <tr
                    key={item.concept_id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isTop ? 'bg-emerald-50/30 dark:bg-emerald-950/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-2">
                        {isTop && (
                          <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded text-[10px] font-mono font-extrabold">
                            #1
                          </span>
                        )}
                        {item.concept_name_bn}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.concept_name_en}</div>
                      {conceptRaw?.formula_latex && (
                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 inline-block px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono-math">
                          <MathRenderer content={`$${conceptRaw.formula_latex}$`} />
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 font-bengali">
                      {item.chapter_name_bn}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.board_appearance_count} বার
                      </span>
                    </td>

                    {/* Scenario Archetype Matrix Coverage */}
                    <td className="py-3.5 px-3 text-center">
                      {conceptArchetypes.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                              solvedArchetypes.length >= conceptArchetypes.length
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : solvedArchetypes.length > 0
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {solvedArchetypes.length} / {conceptArchetypes.length} আর্কেটাইপ
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            {Math.round(
                              ((userMastery?.cognitive_coverage_ratio ||
                                (conceptArchetypes.length > 0
                                   ? solvedArchetypes.length / conceptArchetypes.length
                                   : 0)) *
                                100)
                            )}
                            % কগনিটিভ কাভারেজ
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">1/1 Standard</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {item.mastery_state === 'unseen' ? (
                        <span className="text-xs text-slate-400 font-bengali">দেখা হয়নি</span>
                      ) : (
                        <span
                          className={`text-xs font-bold ${
                            item.accuracy_rate >= 0.75
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.accuracy_rate >= 0.5
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {Math.round(item.accuracy_rate * 100)}%
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-bengali ${
                          item.mastery_state === 'mastered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.mastery_state === 'proficient'
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                            : item.mastery_state === 'weak_struggling'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : item.mastery_state === 'in_progress'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.mastery_state === 'mastered' && 'আয়ত্ত'}
                        {item.mastery_state === 'proficient' && 'দক্ষ'}
                        {item.mastery_state === 'weak_struggling' && 'দুর্বল'}
                        {item.mastery_state === 'in_progress' && 'চলমান'}
                        {item.mastery_state === 'unseen' && 'নতুন'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.priority_score > 75
                                ? 'bg-rose-500'
                                : item.priority_score > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${item.priority_score}%` }}
                          />
                        </div>
                        <span className="text-xs">{item.priority_score}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectConceptToStudy(item.concept_id, 'socratic')}
                        className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-xs border dark:border-slate-700"
                      >
                        <span>পড়ুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
