import React, { useState, useMemo } from 'react';
import {
  Building2,
  Filter,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Timer,
  FileDown,
  Camera,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  ExternalLink,
  Award,
  ArrowRight,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { TOP_COLLEGES, COLLEGE_TEST_PAPERS, COLLEGE_QUESTIONS, CollegeInfo } from '../data/collegeTestPapersData';
import { Question, UserProfile, AppSettings } from '../types';

interface CollegeTestPapersProps {
  onStartExamWithQuestions?: (questionIds: string[], title: string, durationMinutes: number) => void;
  onExportWorksheet?: (subjectId: string, paperId: string, customTitle: string) => void;
  onOpenScannerWithQuestion?: (question: Question) => void;
  onOpenTutorWithContext?: (query: string, conceptName?: string) => void;
  profile?: UserProfile;
  settings?: AppSettings;
}

export const CollegeTestPapers: React.FC<CollegeTestPapersProps> = ({
  onStartExamWithQuestions,
  onExportWorksheet,
  onOpenScannerWithQuestion,
  onOpenTutorWithContext,
  settings,
}) => {
  const isBn = settings?.language !== 'en';

  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Filtered College Papers
  const filteredPapers = useMemo(() => {
    return COLLEGE_TEST_PAPERS.filter((paper) => {
      if (selectedCollegeId !== 'all' && paper.college_id !== selectedCollegeId) return false;
      if (selectedSubjectId !== 'all' && paper.subject_id !== selectedSubjectId) return false;
      if (selectedYear !== 'all' && paper.exam_year.toString() !== selectedYear) return false;
      return true;
    });
  }, [selectedCollegeId, selectedSubjectId, selectedYear]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return COLLEGE_QUESTIONS.filter((q) => {
      if (selectedSubjectId !== 'all' && q.subject_id !== selectedSubjectId) return false;
      if (selectedCollegeId !== 'all') {
        const matchingCollege = TOP_COLLEGES.find((c) => c.id === selectedCollegeId);
        if (matchingCollege && !q.board?.toLowerCase().includes(matchingCollege.short_name.toLowerCase()) && !q.board?.toLowerCase().includes(matchingCollege.name_en.toLowerCase())) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const qText = (q.stem_text + ' ' + (q.board || '') + ' ' + (q.solution_explanation_bn || '')).toLowerCase();
        if (!qText.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [selectedSubjectId, selectedCollegeId, searchQuery]);

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs font-bold font-mono uppercase tracking-wider backdrop-blur-md mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'দেশের শীর্ষ টেস্ট পেপার আর্কাইভ' : 'Elite College Test Papers'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-bengali">
              {isBn ? 'টপ কলেজ টেস্ট পেপার প্রশ্ন ও সমাধান' : 'Top College Test Paper Archive'}
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl mt-1 font-bengali">
              {isBn
                ? 'নটর ডেম, রাজউক, রেসিডেনসিয়াল, ভিকারুননিসা, চট্টগ্রাম কলেজ ও ক্যাডেট কলেজসমূহের নির্বাচনী ও প্রাক-নির্বাচনী টেস্ট পরীক্ষার জটিল ও স্ট্যান্ডার্ড সৃজনশীল প্রশ্ন সংগ্রহ।'
                : 'Curated test and pre-test exam question papers with verified step-by-step LaTeX solutions from top institutions across Bangladesh.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[100px]">
              <div className="text-xl font-black font-mono">{COLLEGE_TEST_PAPERS.length}</div>
              <div className="text-[11px] font-bengali text-blue-100">{isBn ? 'টেস্ট পেপার' : 'Test Papers'}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[100px]">
              <div className="text-xl font-black font-mono">{TOP_COLLEGES.length}</div>
              <div className="text-[11px] font-bengali text-blue-100">{isBn ? 'শীর্ষ কলেজ' : 'Top Colleges'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* College Horizontal Grid Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isBn ? 'কলেজ নির্বাচন করুন' : 'Select College'}
          </h2>
          {selectedCollegeId !== 'all' && (
            <button
              onClick={() => setSelectedCollegeId('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline font-bengali"
            >
              {isBn ? 'সকল কলেজ দেখুন' : 'View All'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            onClick={() => setSelectedCollegeId('all')}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedCollegeId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="text-lg mb-1">🏛️</div>
            <div className="text-xs font-bold font-bengali">{isBn ? 'সকল কলেজ' : 'All Colleges'}</div>
            <div className="text-[10px] opacity-75 font-mono">HSC All</div>
          </button>

          {TOP_COLLEGES.map((college) => {
            const isSelected = selectedCollegeId === college.id;
            return (
              <button
                key={college.id}
                onClick={() => setSelectedCollegeId(college.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-lg mb-1">{college.logo_symbol}</div>
                <div className="text-xs font-bold font-bengali truncate">{college.short_name}</div>
                <div className="text-[10px] opacity-75 font-bengali truncate">{college.city.split(',')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'প্রশ্ন বা বিষয় অনুসন্ধান করুন (যেমন: ব্যাংকিং, সংকরায়ন, চরম মান...)' : 'Search questions or concepts...'}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-bengali"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 font-bengali focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{isBn ? 'সকল বিষয় (All Subjects)' : 'All Subjects'}</option>
            <option value="phy">{isBn ? 'পদার্থবিজ্ঞান (Physics)' : 'Physics'}</option>
            <option value="chem">{isBn ? 'রসায়ন (Chemistry)' : 'Chemistry'}</option>
            <option value="hmath">{isBn ? 'উচ্চতর গণিত (Higher Math)' : 'Higher Math'}</option>
            <option value="bio">{isBn ? 'জীববিজ্ঞান (Biology)' : 'Biology'}</option>
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 font-bengali focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">{isBn ? 'সকল বছর (2022-2024)' : 'All Years'}</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* College Test Papers Full Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {isBn ? 'উপলব্ধ টেস্ট প্রশ্নপত্র তালিকা' : 'Available Test Papers'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-normal">
              {filteredPapers.length} Papers
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => {
            const college = TOP_COLLEGES.find((c) => c.id === paper.college_id);
            return (
              <div
                key={paper.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {paper.exam_year} • {paper.exam_type}
                    </span>
                    <span className="text-sm">{college?.logo_symbol}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bengali">
                    {paper.college_name_bn}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium font-bengali mt-0.5">
                    {paper.subject_name_bn}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bengali">{isBn ? 'সময়' : 'Time'}</div>
                      <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{paper.duration_minutes}m</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bengali">{isBn ? 'নম্বর' : 'Marks'}</div>
                      <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{paper.total_marks}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bengali">{isBn ? 'সৃজনশীল' : 'CQs'}</div>
                      <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{paper.cq_count}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {onStartExamWithQuestions && (
                    <button
                      onClick={() =>
                        onStartExamWithQuestions(
                          paper.question_ids,
                          `${paper.college_name_bn} - ${paper.subject_name_bn} (${paper.exam_year})`,
                          paper.duration_minutes
                        )
                      }
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মক টেস্ট শুরু' : 'Start Exam'}</span>
                    </button>
                  )}

                  {onExportWorksheet && (
                    <button
                      onClick={() =>
                        onExportWorksheet(
                          paper.subject_id,
                          paper.paper_id,
                          `${paper.college_name_bn} টেস্ট পরীক্ষা ${paper.exam_year}`
                        )
                      }
                      title="Export as Printable PDF Worksheet"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive College Question Drill Stream */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {isBn ? 'নির্বাচিত সৃজনশীল ও বহুনির্বাচনী প্রশ্ন ব্যাংক' : 'Selected Questions & Step Solutions'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-normal">
              {filteredQuestions.length} Questions
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id || idx === 0;
            const isSolutionOpen = !!revealedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-all"
              >
                {/* Question Header Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-md font-bengali">
                      {q.board}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-mono font-bold rounded-md">
                      {q.question_format} • {q.difficulty_tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenScannerWithQuestion && (
                      <button
                        onClick={() => onOpenScannerWithQuestion(q)}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold font-bengali flex items-center gap-1 hover:bg-emerald-100 transition-all"
                      >
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>{isBn ? 'খাতা স্ক্যান করে মিলাও' : 'Scan & Grade'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-sm font-bengali text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
                  <MathRenderer content={q.stem_text} />
                </div>

                {/* Subparts if CQ */}
                {q.subparts && q.subparts.length > 0 && (
                  <div className="space-y-2.5 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800">
                    {q.subparts.map((sub) => (
                      <div key={sub.id} className="text-xs space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400 shrink-0">
                            ({sub.part_label})
                          </span>
                          <div className="flex-1 font-bengali text-slate-800 dark:text-slate-200">
                            <MathRenderer content={sub.prompt_text} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                            [{sub.marks} {isBn ? 'নম্বর' : 'm'}]
                          </span>
                        </div>

                        {/* Individual Subpart Solution if revealed */}
                        {isSolutionOpen && sub.solution_latex && (
                          <div className="mt-1 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 text-xs font-bengali">
                            <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300 block mb-0.5">
                              {isBn ? 'ধাপভিত্তিক সমাধান:' : 'Step Solution:'}
                            </span>
                            <MathRenderer content={sub.solution_latex} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* MCQ Options if MCQ */}
                {q.mcq_options && q.mcq_options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.mcq_options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs font-bengali flex items-center gap-2 ${
                          isSolutionOpen && opt.key === q.correct_option
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] shadow-xs">
                          {opt.key}
                        </span>
                        <div className="flex-1">
                          <MathRenderer content={opt.text} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Bar: Solution Toggle & Tutor Action */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="text-xs font-bold font-bengali text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                  >
                    {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{isSolutionOpen ? (isBn ? 'সমাধান লুকান' : 'Hide Solution') : isBn ? 'পূর্ণাঙ্গ সমাধান দেখুন' : 'View Verified Solution'}</span>
                  </button>

                  {onOpenTutorWithContext && (
                    <button
                      onClick={() =>
                        onOpenTutorWithContext(
                          `আমাকে ${q.board} এর এই প্রশ্নটি স্টেপ-বাই-স্টেপ বুঝিয়ে দিন:\n${q.stem_text}`,
                          q.board
                        )
                      }
                      className="text-xs font-bold font-bengali text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isBn ? 'টিউটরের সাথে বুঝুন' : 'Ask Tutor'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
