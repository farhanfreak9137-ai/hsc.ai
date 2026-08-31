import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Sparkles,
  BarChart3,
  FileText,
  HelpCircle,
  Eye,
  Trash2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Timer,
  FileCheck2,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  Question,
  CQSubpart,
  ExamConfig,
  ExamAnswerRecord,
  ExamEvaluationRecord,
  CognitiveLevel,
  AppSettings,
} from '../types';
import {
  CANONICAL_SUBJECTS,
  CANONICAL_PAPERS,
  CANONICAL_CHAPTERS,
  CANONICAL_CONCEPTS,
} from '../data/canonicalTaxonomy';
import {
  saveExamResult,
  loadExamHistory,
  deleteExamResult,
  recordStudentAttempt,
} from '../services/storage';
import { getSubjectDisplayName, getPaperDisplayName, Language } from '../services/i18n';
import { MathRenderer } from './MathRenderer';

interface ExamSimulatorProps {
  questions: Question[];
  selectedSubjectId: string;
  onAttemptRecorded?: () => void;
  onSendToTutor?: (question: Question, subpart?: CQSubpart) => void;
  settings?: AppSettings;
}

type ExamViewMode = 'setup' | 'running' | 'evaluating' | 'result' | 'history';

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  questions,
  selectedSubjectId,
  onAttemptRecorded,
  onSendToTutor,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';
  // Navigation & Workflow state
  const [viewMode, setViewMode] = useState<ExamViewMode>('setup');
  const [history, setHistory] = useState<ExamEvaluationRecord[]>(() => loadExamHistory());
  const [activeExamRecord, setActiveExamRecord] = useState<ExamEvaluationRecord | null>(null);

  // Setup configuration state
  const [examSubjectId, setExamSubjectId] = useState<string>(selectedSubjectId);
  const [paperId, setPaperId] = useState<string>('all');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [examFormat, setExamFormat] = useState<'mixed' | 'mcq_only' | 'cq_only'>('mixed');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [targetMcqCount, setTargetMcqCount] = useState<number>(10);
  const [targetCqCount, setTargetCqCount] = useState<number>(2);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState<boolean>(true);
  const [selectedBoard, setSelectedBoard] = useState<string>('all');

  // Running Exam State
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswerRecord>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [examStartTime, setExamStartTime] = useState<string>('');

  // Active subpart for current CQ question
  const [activeSubpartIndex, setActiveSubpartIndex] = useState<number>(0);

  // Scratchpad / Formula helper state
  const [showFormulaHelper, setShowFormulaHelper] = useState<boolean>(false);
  const [cqScratchpad, setCqScratchpad] = useState<string>('');

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Available chapters for selected subject & paper
  const filteredChapters = useMemo(() => {
    return CANONICAL_CHAPTERS.filter((ch) => {
      const paper = CANONICAL_PAPERS.find((p) => p.id === ch.paper_id);
      if (!paper) return false;
      if (paper.subject_id !== examSubjectId) return false;
      if (paperId !== 'all' && ch.paper_id !== paperId) return false;
      return true;
    });
  }, [examSubjectId, paperId]);

  // Available papers for selected subject
  const availablePapers = useMemo(() => {
    return CANONICAL_PAPERS.filter((p) => p.subject_id === examSubjectId);
  }, [examSubjectId]);

  // Sync subject change
  useEffect(() => {
    setExamSubjectId(selectedSubjectId);
  }, [selectedSubjectId]);

  // Timer countdown hook
  useEffect(() => {
    if (viewMode === 'running' && !isPaused && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUpAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode, isPaused, secondsRemaining]);

  // Start Exam generator
  const handleStartExam = () => {
    // Filter questions matching subject, paper, chapters, board, format
    let pool = questions.filter((q) => {
      if (q.subject_id !== examSubjectId) return false;
      if (paperId !== 'all' && q.paper_id !== paperId) return false;
      if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter_id)) return false;
      if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
      return true;
    });

    // If pool is empty, relax filter to subject
    if (pool.length === 0) {
      pool = questions.filter((q) => q.subject_id === examSubjectId);
    }

    const mcqs = pool.filter((q) => q.question_format === 'MCQ');
    const cqs = pool.filter((q) => q.question_format === 'CQ');

    let chosen: Question[] = [];
    if (examFormat === 'mcq_only') {
      chosen = mcqs.slice(0, targetMcqCount);
      if (chosen.length === 0) chosen = pool.slice(0, targetMcqCount);
    } else if (examFormat === 'cq_only') {
      chosen = cqs.slice(0, targetCqCount);
      if (chosen.length === 0) chosen = pool.slice(0, targetCqCount);
    } else {
      // Mixed format
      const chosenMcqs = mcqs.slice(0, targetMcqCount);
      const chosenCqs = cqs.slice(0, targetCqCount);
      chosen = [...chosenMcqs, ...chosenCqs];
      if (chosen.length === 0) chosen = pool.slice(0, 10);
    }

    if (chosen.length === 0) {
      alert('নির্বাচিত মানদণ্ডে কোনো প্রশ্ন পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।');
      return;
    }

    setExamQuestions(chosen);
    setCurrentQuestionIndex(0);
    setActiveSubpartIndex(0);
    setAnswers({});
    setFlaggedQuestionIds(new Set());
    setSecondsRemaining(durationMinutes * 60);
    setExamStartTime(new Date().toISOString());
    setIsPaused(false);
    setViewMode('running');
  };

  const handleTimeUpAutoSubmit = () => {
    evaluateAndFinalizeExam();
  };

  // Toggle Flag Question
  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Handle MCQ Option Select
  const handleSelectMcqOption = (qId: string, optionKey: string) => {
    const q = examQuestions.find((item) => item.id === qId);
    if (!q) return;

    const isCorrect = q.correct_option === optionKey;
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        question_id: qId,
        selected_option: optionKey,
        is_correct: isCorrect,
        awarded_marks: isCorrect ? 1 : enableNegativeMarking ? -0.25 : 0,
        max_marks: 1,
        time_spent_seconds: (prev[qId]?.time_spent_seconds || 0) + 5,
      },
    }));
  };

  // Handle CQ Subpart Text Change
  const handleCqAnswerChange = (qId: string, subpartId: string, text: string) => {
    setAnswers((prev) => {
      const existing = prev[qId] || {
        question_id: qId,
        cq_subpart_answers: {},
        awarded_marks: 0,
        max_marks: 10,
        time_spent_seconds: 0,
      };

      const updatedSubparts = {
        ...(existing.cq_subpart_answers || {}),
        [subpartId]: {
          subpart_id: subpartId,
          user_text: text,
          self_awarded_marks: existing.cq_subpart_answers?.[subpartId]?.self_awarded_marks || 0,
          max_marks: getSubpartMaxMarks(qId, subpartId),
        },
      };

      return {
        ...prev,
        [qId]: {
          ...existing,
          cq_subpart_answers: updatedSubparts,
        },
      };
    });
  };

  // Helper to get max marks for a subpart
  const getSubpartMaxMarks = (qId: string, subpartId: string): number => {
    const q = examQuestions.find((item) => item.id === qId);
    const sub = q?.subparts?.find((s) => s.id === subpartId);
    return sub?.marks || (sub?.part_label === 'a' ? 1 : sub?.part_label === 'b' ? 2 : sub?.part_label === 'c' ? 3 : 4);
  };

  // Handle CQ Subpart Mark Grading during evaluation
  const handleCqSubpartGradeChange = (qId: string, subpartId: string, marks: number) => {
    setAnswers((prev) => {
      const existing = prev[qId];
      if (!existing || !existing.cq_subpart_answers) return prev;

      const subEntry = existing.cq_subpart_answers[subpartId] || {
        subpart_id: subpartId,
        user_text: '',
        self_awarded_marks: 0,
        max_marks: getSubpartMaxMarks(qId, subpartId),
      };

      const updatedSubparts = {
        ...existing.cq_subpart_answers,
        [subpartId]: {
          ...subEntry,
          self_awarded_marks: marks,
        },
      };

      // Sum all subpart marks
      const totalCqMarks = Object.values(updatedSubparts).reduce(
        (sum, item) => sum + (item.self_awarded_marks || 0),
        0
      );

      return {
        ...prev,
        [qId]: {
          ...existing,
          awarded_marks: totalCqMarks,
          cq_subpart_answers: updatedSubparts,
        },
      };
    });
  };

  // Quick formula insert into active CQ answer
  const handleInsertFormula = (formula: string) => {
    const currentQ = examQuestions[currentQuestionIndex];
    if (!currentQ || currentQ.question_format !== 'CQ' || !currentQ.subparts) return;
    const currentSubpart = currentQ.subparts[activeSubpartIndex];
    if (!currentSubpart) return;

    const existingText =
      answers[currentQ.id]?.cq_subpart_answers?.[currentSubpart.id]?.user_text || '';
    handleCqAnswerChange(
      currentQ.id,
      currentSubpart.id,
      existingText ? `${existingText} ${formula}` : formula
    );
  };

  // Transition from Running to Self-Evaluation (for CQ verification) or direct Result
  const handleFinishExamClick = () => {
    const hasCq = examQuestions.some((q) => q.question_format === 'CQ');
    if (hasCq) {
      setViewMode('evaluating');
    } else {
      evaluateAndFinalizeExam();
    }
  };

  // Finalize and Save Exam Record
  const evaluateAndFinalizeExam = () => {
    let totalMaxMarks = 0;
    let totalObtainedMarks = 0;

    const cognitiveScoreMap: Record<CognitiveLevel, { obtained: number; total: number }> = {
      knowledge: { obtained: 0, total: 0 },
      understanding: { obtained: 0, total: 0 },
      application: { obtained: 0, total: 0 },
      higher_ability: { obtained: 0, total: 0 },
    };

    const chapterPerformanceMap: Record<
      string,
      { chapter_id: string; total_questions: number; correct_questions: number; score_percent: number }
    > = {};

    examQuestions.forEach((q) => {
      const ans = answers[q.id];

      // Chapter tracker
      if (!chapterPerformanceMap[q.chapter_id]) {
        chapterPerformanceMap[q.chapter_id] = {
          chapter_id: q.chapter_id,
          total_questions: 0,
          correct_questions: 0,
          score_percent: 0,
        };
      }
      chapterPerformanceMap[q.chapter_id].total_questions += 1;

      if (q.question_format === 'MCQ') {
        const maxM = 1;
        totalMaxMarks += maxM;
        const awarded = ans?.awarded_marks || 0;
        totalObtainedMarks += Math.max(0, awarded);

        if (ans?.is_correct) {
          chapterPerformanceMap[q.chapter_id].correct_questions += 1;
        }

        // Cognitive score
        cognitiveScoreMap.application.total += 1;
        if (ans?.is_correct) cognitiveScoreMap.application.obtained += 1;

        // Auto record attempt to mastery
        if (q.concept_ids && q.concept_ids[0]) {
          recordStudentAttempt({
            user_id: 'local_student',
            concept_id: q.concept_ids[0],
            question_id: q.id,
            attempt_type: 'mcq_quiz',
            student_answer_text: ans?.selected_mcq_option || ans?.selected_option || '',
            is_correct: !!ans?.is_correct,
            score_obtained: ans?.is_correct ? 1 : 0,
            max_score: 1,
            time_spent_seconds: ans?.time_spent_seconds || 60,
            evaluation: {
              is_correct: !!ans?.is_correct,
              score_obtained: ans?.is_correct ? 1 : 0,
              max_score: 1,
              evaluation_confidence: 1.0,
              reasoning_correct: !!ans?.is_correct,
              evaluation_summary: ans?.is_correct ? 'মক টেস্টে সঠিক উত্তর' : 'মক টেস্টে ভুল উত্তর',
              step_evaluations: [],
              corrective_advice_bn: ans?.is_correct ? 'চমৎকার! কনসেপ্ট আয়ত্তে আছে।' : 'টপিকটি পুনরায় রিভিশন দিন।',
            },
          });
        }
      } else {
        // CQ evaluation
        const maxM = 10;
        totalMaxMarks += maxM;
        const awarded = ans?.awarded_marks || 0;
        totalObtainedMarks += Math.max(0, Math.min(maxM, awarded));

        if (awarded >= 7) {
          chapterPerformanceMap[q.chapter_id].correct_questions += 1;
        }

        q.subparts?.forEach((sub) => {
          const subMax = sub.marks || 1;
          const subAwarded = ans?.cq_subpart_answers?.[sub.id]?.self_awarded_marks || 0;
          const cog = sub.cognitive_level || 'application';
          cognitiveScoreMap[cog].total += subMax;
          cognitiveScoreMap[cog].obtained += subAwarded;

          // Record each subpart attempt
          if (sub.concept_ids && sub.concept_ids[0]) {
            recordStudentAttempt({
              user_id: 'local_student',
              concept_id: sub.concept_ids[0],
              question_id: q.id,
              subpart_id: sub.id,
              attempt_type: 'cq_practice',
              student_answer_text: ans?.cq_subpart_answers?.[sub.id]?.user_text || '',
              is_correct: subAwarded >= subMax * 0.75,
              score_obtained: subAwarded,
              max_score: subMax,
              time_spent_seconds: 180,
              evaluation: {
                is_correct: subAwarded >= subMax * 0.75,
                score_obtained: subAwarded,
                max_score: subMax,
                evaluation_confidence: 0.9,
                reasoning_correct: subAwarded >= subMax * 0.5,
                evaluation_summary: `সৃজনশীল সাবপার্ট সেলফ-ইভালুয়েশন: ${subAwarded}/${subMax}`,
                step_evaluations: [],
                corrective_advice_bn: subAwarded >= subMax * 0.75 ? 'ভালো হয়েছে।' : 'মডেল সমাধানের সাথে মিলিয়ে খাতায় আবার লিখুন।',
              },
            });
          }
        });
      }
    });

    // Calculate percentages
    const percentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0;
    let grade = 'F';
    if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'A-';
    else if (percentage >= 50) grade = 'B';
    else if (percentage >= 40) grade = 'C';
    else if (percentage >= 33) grade = 'D';

    const timeSpentSecs = durationMinutes * 60 - secondsRemaining;

    // Identify weak & strong concepts
    const weakConcepts: string[] = [];
    const strongConcepts: string[] = [];
    examQuestions.forEach((q) => {
      const isGood =
        q.question_format === 'MCQ'
          ? answers[q.id]?.is_correct
          : (answers[q.id]?.awarded_marks || 0) >= 7;
      const cid = q.concept_ids?.[0];
      if (cid) {
        if (isGood && !strongConcepts.includes(cid)) strongConcepts.push(cid);
        else if (!isGood && !weakConcepts.includes(cid)) weakConcepts.push(cid);
      }
    });

    const newRecord: ExamEvaluationRecord = {
      id: `exam_${Date.now()}`,
      exam_title: `HSC Model Test — ${CANONICAL_SUBJECTS.find((s) => s.id === examSubjectId)?.name_bn || 'বিজ্ঞান'}`,
      subject_id: examSubjectId,
      paper_id: paperId !== 'all' ? paperId : undefined,
      total_questions: examQuestions.length,
      total_marks: totalMaxMarks,
      obtained_marks: Math.round(totalObtainedMarks * 10) / 10,
      percentage,
      grade,
      time_spent_seconds: Math.max(10, timeSpentSecs),
      allocated_minutes: durationMinutes,
      answers,
      cognitive_performance: {
        knowledge:
          cognitiveScoreMap.knowledge.total > 0
            ? Math.round((cognitiveScoreMap.knowledge.obtained / cognitiveScoreMap.knowledge.total) * 100)
            : 100,
        understanding:
          cognitiveScoreMap.understanding.total > 0
            ? Math.round((cognitiveScoreMap.understanding.obtained / cognitiveScoreMap.understanding.total) * 100)
            : 100,
        application:
          cognitiveScoreMap.application.total > 0
            ? Math.round((cognitiveScoreMap.application.obtained / cognitiveScoreMap.application.total) * 100)
            : 100,
        higher_ability:
          cognitiveScoreMap.higher_ability.total > 0
            ? Math.round((cognitiveScoreMap.higher_ability.obtained / cognitiveScoreMap.higher_ability.total) * 100)
            : 100,
      },
      chapter_breakdown: Object.values(chapterPerformanceMap).map((cp) => ({
        chapter_id: cp.chapter_id,
        score_percent: cp.total_questions > 0 ? Math.round((cp.correct_questions / cp.total_questions) * 100) : 0,
        total_questions: cp.total_questions,
        correct_questions: cp.correct_questions,
      })),
      weak_concept_ids: weakConcepts,
      strong_concept_ids: strongConcepts,
      completed_at: new Date().toISOString(),
    };

    saveExamResult(newRecord);
    setHistory(loadExamHistory());
    setActiveExamRecord(newRecord);
    setViewMode('result');

    if (onAttemptRecorded) {
      onAttemptRecorded();
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = examQuestions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              বোর্ড সিমুলেটর
            </span>
            <span className="text-xs text-slate-500 font-medium">HSC Board Examination Simulator</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            পূর্ণাঙ্গ বোর্ড পরীক্ষার সিমুলেশন ও সময়াবদ্ধ মক টেস্ট
          </h2>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('setup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'setup'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            নতুন পরীক্ষা
          </button>
          <button
            onClick={() => {
              setHistory(loadExamHistory());
              setViewMode('history');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            পরীক্ষার ইতিহাস ({history.length})
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: SETUP & CONFIGURATION SCREEN
      ========================================================================== */}
      {viewMode === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configurator (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="w-5 h-5 text-emerald-600" />
              মক টেস্ট কনফিগারেশন
            </h3>

            {/* Subject & Paper Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">বিষয় নির্বাচন</label>
                <select
                  value={examSubjectId}
                  onChange={(e) => {
                    setExamSubjectId(e.target.value);
                    setPaperId('all');
                    setSelectedChapters([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {CANONICAL_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name_bn} ({sub.name_en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">পত্র (Paper)</label>
                <select
                  value={paperId}
                  onChange={(e) => {
                    setPaperId(e.target.value);
                    setSelectedChapters([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">উভয় পত্র (১ম ও ২য় পত্র সমন্বিত)</option>
                  {availablePapers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_bn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Format & Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">পরীক্ষার ফরম্যাট</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExamFormat('mixed');
                    setDurationMinutes(45);
                    setTargetMcqCount(10);
                    setTargetCqCount(2);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    examFormat === 'mixed'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900">পূর্ণাঙ্গ মিক্সড (CQ + MCQ)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">বোর্ড প্রশ্নপত্রের আদর্শ সংমিশ্রণ</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExamFormat('mcq_only');
                    setDurationMinutes(25);
                    setTargetMcqCount(25);
                    setTargetCqCount(0);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    examFormat === 'mcq_only'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900">কেবল বহুনিবার্চনী (MCQ Blitz)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">স্পিড ও নেগেটিভ মার্কিং টেস্ট</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExamFormat('cq_only');
                    setDurationMinutes(60);
                    setTargetMcqCount(0);
                    setTargetCqCount(3);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    examFormat === 'cq_only'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900">কেবল সৃজনশীল (CQ Deep Test)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">ক, খ, গ, ঘ ধাপভিত্তিক মূল্যায়ন</div>
                </button>
              </div>
            </div>

            {/* Time & Count Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">সময়সীমা (মিনিট)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>

              {examFormat !== 'cq_only' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MCQ প্রশ্নের সংখ্যা</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={targetMcqCount}
                    onChange={(e) => setTargetMcqCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              )}

              {examFormat !== 'mcq_only' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CQ প্রশ্নের সংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={targetCqCount}
                    onChange={(e) => setTargetCqCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              )}
            </div>

            {/* Chapter Scope Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">অধ্যায় নির্বাচন (ঐচ্ছিক ফিল্টার)</label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChapters(filteredChapters.map((c) => c.id))}
                    className="text-[11px] text-emerald-700 hover:underline font-medium"
                  >
                    সকল অধ্যায়
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedChapters([])}
                    className="text-[11px] text-slate-500 hover:underline"
                  >
                    ক্লিয়ার
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {filteredChapters.map((ch) => {
                  const isChecked = selectedChapters.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChapters([...selectedChapters, ch.id]);
                          } else {
                            setSelectedChapters(selectedChapters.filter((id) => id !== ch.id));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">
                        অধ্যায় {ch.chapter_number}: {ch.name_bn}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableNegativeMarking}
                  onChange={(e) => setEnableNegativeMarking(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>MCQ তে নেগেটিভ মার্কিং প্রয়োগ (-০.২৫ মার্কস)</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-slate-500">বোর্ড প্রাধান্য:</span>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                >
                  <option value="all">সকল শিক্ষা বোর্ড</option>
                  <option value="Dhaka">ঢাকা বোর্ড</option>
                  <option value="Rajshahi">রাজশাহী বোর্ড</option>
                  <option value="Chattogram">চট্টগ্রাম বোর্ড</option>
                  <option value="Dinajpur">দিনাজপুর বোর্ড</option>
                  <option value="Cumilla">কুমিল্লা বোর্ড</option>
                </select>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartExam}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>পরীক্ষা শুরু করুন (Start Timed Mock Exam)</span>
            </button>
          </div>

          {/* Right Sidebar: Exam Guidelines & Quick Presets */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>বোর্ড পরীক্ষা নির্দেশিকা</span>
              </div>
              <h4 className="text-sm font-bold text-white">আদর্শ বোর্ড পরীক্ষার পরিবেশ</h4>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    পরীক্ষা শুরু হলে স্ক্রিনে কাউন্টডাউন টাইমার সক্রিয় হবে। সময় শেষ হলে পরীক্ষা স্বয়ংক্রিয়ভাবে সাবমিট হবে।
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    সৃজনশীল প্রশ্নের জন্য ক, খ, গ ও ঘ প্রতিটি অংশের উত্তর ধাপে ধাপে লিখুন অথবা ড্রাফট করুন।
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>
                    পরীক্ষা শেষে বোর্ড স্ট্যান্ডার্ড মডেল সমাধান ও মার্কিং স্কিমের সাথে আপনার উত্তর মূল্যায়ন করুন।
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Preset Cards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">জনপ্রিয় প্রি-সেট</h4>

              <button
                onClick={() => {
                  setExamFormat('mixed');
                  setDurationMinutes(60);
                  setTargetMcqCount(15);
                  setTargetCqCount(2);
                  handleStartExam();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all"
              >
                <div className="text-xs font-bold text-slate-900">⚡ ৬০ মিনিটের স্ট্যান্ডার্ড মডেল টেস্ট</div>
                <div className="text-[11px] text-slate-500 mt-0.5">১৫ টি MCQ + ২ টি পূর্ণাঙ্গ CQ</div>
              </button>

              <button
                onClick={() => {
                  setExamFormat('mcq_only');
                  setDurationMinutes(20);
                  setTargetMcqCount(20);
                  setTargetCqCount(0);
                  handleStartExam();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all"
              >
                <div className="text-xs font-bold text-slate-900">🎯 ২০ মিনিটের MCQ স্পিড বুস্টার</div>
                <div className="text-[11px] text-slate-500 mt-0.5">২০ টি MCQ দ্রুত সমাধান ও নেগেটিভ মার্কিং</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE RUNNING EXAM ENVIRONMENT
      ========================================================================== */}
      {viewMode === 'running' && currentQ && (
        <div className="space-y-4">
          {/* Top Sticky Status Bar */}
          <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                প্রশ্ন {currentQuestionIndex + 1} / {examQuestions.length}
              </span>
              <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">
                {currentQ.question_format === 'MCQ' ? 'বহুনিবার্চনী প্রশ্ন (MCQ)' : 'সৃজনশীল প্রশ্ন (CQ)'}
              </span>
              {currentQ.board && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium hidden md:inline-block">
                  {currentQ.board} Board {currentQ.exam_year}
                </span>
              )}
            </div>

            {/* Center Live Timer */}
            <div
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm transition-all ${
                secondsRemaining < 300
                  ? 'bg-rose-100 text-rose-700 animate-pulse ring-2 ring-rose-400'
                  : secondsRemaining < 600
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>অবশিষ্ট সময়: {formatTime(secondsRemaining)}</span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQ.id)}
                className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                  flaggedQuestionIds.has(currentQ.id)
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="পরবর্তীতে পর্যালোচনার জন্য চিহ্নিত করুন"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">রিভিউ ফ্ল্যাগ</span>
              </button>

              <button
                type="button"
                onClick={handleFinishExamClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                পরীক্ষা জমা দিন (Submit)
              </button>
            </div>
          </div>

          {/* Question Navigator Grid */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap pl-1">ন্যাভিগেটর:</span>
            <div className="flex items-center gap-1.5">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered =
                  q.question_format === 'MCQ'
                    ? !!answers[q.id]?.selected_option
                    : !!answers[q.id]?.cq_subpart_answers &&
                      Object.values(answers[q.id]?.cq_subpart_answers || {}).some(
                        (a) => a.user_text && a.user_text.trim().length > 0
                      );
                const isFlagged = flaggedQuestionIds.has(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setActiveSubpartIndex(0);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-emerald-500 bg-emerald-600 text-white shadow-xs'
                        : isFlagged
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Question Body & Interactive Answer Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Stem & Subparts (Left 2 cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              {/* Question Stem */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  উদ্দীপক / Question Stem
                </div>
                <div className="text-sm sm:text-base font-bengali leading-relaxed text-slate-900">
                  <MathRenderer content={currentQ.stem_text} className="text-slate-900 font-bengali text-sm sm:text-base" />
                </div>
              </div>

              {/* MCQ Format UI */}
              {currentQ.question_format === 'MCQ' && currentQ.mcq_options && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    সঠিক উত্তরটি নির্বাচন করুন:
                  </div>
                  <div className="space-y-2">
                    {currentQ.mcq_options.map((opt) => {
                      const isSelected = answers[currentQ.id]?.selected_option === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSelectMcqOption(currentQ.id, opt.key)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center space-x-3 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500 font-medium'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="text-sm font-bengali flex-1">
                            <MathRenderer content={opt.text} inline className="text-slate-800 font-bengali text-sm" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CQ Format UI */}
              {currentQ.question_format === 'CQ' && currentQ.subparts && (
                <div className="space-y-4 pt-2">
                  {/* Subpart Tabs (ক, খ, গ, ঘ) */}
                  <div className="flex border-b border-slate-200 gap-2">
                    {currentQ.subparts.map((sub, sIdx) => {
                      const isActive = sIdx === activeSubpartIndex;
                      const hasText = !!answers[currentQ.id]?.cq_subpart_answers?.[sub.id]?.user_text;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveSubpartIndex(sIdx)}
                          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'border-emerald-600 text-emerald-700'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span>অংশ ({sub.part_label === 'a' ? 'ক' : sub.part_label === 'b' ? 'খ' : sub.part_label === 'c' ? 'গ' : 'ঘ'})</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            {sub.marks || 1} নম্বর
                          </span>
                          {hasText && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Subpart Prompt */}
                  {currentQ.subparts[activeSubpartIndex] && (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                          প্রশ্ন ({currentQ.subparts[activeSubpartIndex].part_label.toUpperCase()}):
                        </span>
                        <div className="text-sm font-bengali font-medium text-slate-900">
                          <MathRenderer content={currentQ.subparts[activeSubpartIndex].prompt_text} className="text-slate-900 font-bengali text-sm" />
                        </div>
                      </div>

                      {/* Math & Formula Quick Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">দ্রুত সূত্র:</span>
                        {['\\theta', '\\alpha', '\\omega', '\\Delta', '\\pi', 'x^2', '\\sqrt{x}', '\\frac{a}{b}', '\\approx', '\\rightarrow', '\\pm', 'K_a', 'E_{\\text{cell}}', 'I\\omega'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => handleInsertFormula(`$${sym}$`)}
                            className="px-2 py-0.5 bg-white hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-mono text-slate-800 transition-colors"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>

                      {/* Textarea for CQ Answer */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          আপনার সমাধান ও যুক্তি লিখুন (Math / LaTeX সমর্থনযোগ্য):
                        </label>
                        <textarea
                          rows={6}
                          value={
                            answers[currentQ.id]?.cq_subpart_answers?.[
                              currentQ.subparts[activeSubpartIndex].id
                            ]?.user_text || ''
                          }
                          onChange={(e) =>
                            handleCqAnswerChange(
                              currentQ.id,
                              currentQ.subparts[activeSubpartIndex].id,
                              e.target.value
                            )
                          }
                          placeholder="সমাধানের সূত্র, সমীকরণ ও ফলাফল লিখুন..."
                          className="w-full font-bengali text-sm bg-slate-50/70 border border-slate-300 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prev / Next Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    setActiveSubpartIndex(0);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী প্রশ্ন</span>
                </button>

                <button
                  type="button"
                  disabled={currentQuestionIndex === examQuestions.length - 1}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => Math.min(examQuestions.length - 1, prev + 1));
                    setActiveSubpartIndex(0);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                >
                  <span>পরবর্তী প্রশ্ন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Helper / Scratchpad & Concept Notes */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    পরীক্ষার ড্রাফট / রাফ খাতা
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCqScratchpad('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={cqScratchpad}
                  onChange={(e) => setCqScratchpad(e.target.value)}
                  placeholder="গণিত ও একক রূপান্তরের জন্য খসড়া রাফ হিসাব..."
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Tips */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>সময় ব্যবস্থাপনা টিপস</span>
                </div>
                <p>
                  MCQ প্রতি প্রশ্নে সর্বোচ্চ ৫০-৬০ সেকেন্ড সময় ব্যয় করুন। কঠিন CQ প্রশ্নগুলোতে পরে ফিরে আসার জন্য <strong>রিভিউ ফ্ল্যাগ</strong> ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: CQ SELF-EVALUATION & MARKING PHASE
      ========================================================================== */}
      {viewMode === 'evaluating' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-md space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <FileCheck2 className="w-4 h-4" />
              <span>বোর্ড সমাধান ও মার্কিং স্কিম ভিত্তিক স্ব-মূল্যায়ন</span>
            </div>
            <h3 className="text-xl font-bold">সৃজনশীল প্রশ্নের উত্তর মূল্যায়ন করুন</h3>
            <p className="text-xs text-slate-300">
              নিচের অফিশিয়াল মডেল সমাধানের সাথে আপনার প্রদত্ত উত্তর তুলনা করে প্রাপ্ত নম্বর প্রদান করুন।
            </p>
          </div>

          <div className="space-y-6">
            {examQuestions
              .filter((q) => q.question_format === 'CQ')
              .map((q, qIndex) => (
                <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-bold text-slate-900">
                      সৃজনশীল প্রশ্ন {qIndex + 1}: {q.stem_text.slice(0, 70)}...
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                      পূর্ণমান: ১০
                    </span>
                  </div>

                  {q.subparts?.map((sub) => {
                    const studentAns =
                      answers[q.id]?.cq_subpart_answers?.[sub.id]?.user_text || 'উত্তর লেখা হয়নি';
                    const maxM = sub.marks || (sub.part_label === 'a' ? 1 : sub.part_label === 'b' ? 2 : sub.part_label === 'c' ? 3 : 4);
                    const awardedM =
                      answers[q.id]?.cq_subpart_answers?.[sub.id]?.self_awarded_marks ?? 0;

                    return (
                      <div key={sub.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-slate-800 flex-1">
                            <MathRenderer content={`**অংশ (${sub.part_label.toUpperCase()}):** ${sub.prompt_text}`} inline className="text-slate-800 font-bengali text-xs" />
                          </div>
                          <span className="text-xs font-semibold text-emerald-800 shrink-0">
                            সর্বোচ্চ নম্বর: {maxM}
                          </span>
                        </div>

                        {/* Student answer vs Model solution comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-600 block mb-1">আপনার উত্তর:</span>
                            <div className="font-bengali text-slate-800">
                              <MathRenderer content={studentAns} className="text-slate-800 font-bengali text-xs" />
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
                            <span className="font-semibold text-emerald-900 block mb-1">
                              অফিশিয়াল মডেল সমাধান ও মূল সূত্র:
                            </span>
                            <div className="text-emerald-950 font-bengali">
                              <MathRenderer content={sub.solution_latex} className="text-emerald-950 text-xs" />
                            </div>
                          </div>
                        </div>

                        {/* Marks selector */}
                        <div className="flex items-center justify-end space-x-2 pt-2">
                          <span className="text-xs font-semibold text-slate-700">প্রাপ্ত নম্বর দিন:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: maxM + 1 }).map((_, mVal) => (
                              <button
                                key={mVal}
                                type="button"
                                onClick={() => handleCqSubpartGradeChange(q.id, sub.id, mVal)}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  awardedM === mVal
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {mVal}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={evaluateAndFinalizeExam}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>মূল্যায়ন সম্পন্ন করুন ও স্কোরকার্ড দেখুন</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: POST-EXAM DIAGNOSTIC SCORECARD
      ========================================================================== */}
      {viewMode === 'result' && activeExamRecord && (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-2">
                  পরীক্ষা সম্পন্ন • Performance Diagnostic
                </span>
                <h3 className="text-2xl font-bold text-white">{activeExamRecord.exam_title}</h3>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                  <span>মোট প্রশ্ন: {activeExamRecord.total_questions} টি</span>
                  <span>•</span>
                  <span>ব্যয়িত সময়: {formatTime(activeExamRecord.time_spent_seconds)}</span>
                </div>
              </div>

              {/* Grade Badge */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-400">{activeExamRecord.grade}</div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">গ্রেড</div>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {activeExamRecord.obtained_marks} / {activeExamRecord.total_marks}
                  </div>
                  <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                    নম্বর ({activeExamRecord.percentage}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive & Chapter Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cognitive Performance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                জ্ঞান ও দক্ষতা ভিত্তিক বিশ্লেষণ (Bloom's Taxonomy)
              </h4>

              <div className="space-y-3 text-xs">
                {[
                  { key: 'knowledge', label: 'জ্ঞানমূলক (Knowledge - ক)', score: activeExamRecord.cognitive_performance.knowledge },
                  { key: 'understanding', label: 'অনুধাবনমূলক (Understanding - খ)', score: activeExamRecord.cognitive_performance.understanding },
                  { key: 'application', label: 'প্রয়োগমূলক (Application - গ)', score: activeExamRecord.cognitive_performance.application },
                  { key: 'higher_ability', label: 'উচ্চতর দক্ষতা (Higher Ability - ঘ)', score: activeExamRecord.cognitive_performance.higher_ability },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between font-medium text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 80 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                অধ্যায়ভিত্তিক দক্ষতা বিশ্লেষণ
              </h4>

              <div className="space-y-3 text-xs">
                {activeExamRecord.chapter_breakdown.map((cb) => {
                  const chObj = CANONICAL_CHAPTERS.find((c) => c.id === cb.chapter_id);
                  return (
                    <div key={cb.chapter_id} className="space-y-1">
                      <div className="flex justify-between font-medium text-slate-700">
                        <span className="truncate max-w-[220px]">
                          {chObj ? `অধ্যায় ${chObj.chapter_number}: ${chObj.name_bn}` : cb.chapter_id}
                        </span>
                        <span className="font-bold">
                          {cb.correct_questions}/{cb.total_questions} সঠিক ({cb.score_percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cb.score_percent >= 75 ? 'bg-emerald-500' : cb.score_percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${cb.score_percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setViewMode('setup')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all"
            >
              নতুন আরেকটি পরীক্ষা দিন
            </button>

            <button
              onClick={() => {
                setHistory(loadExamHistory());
                setViewMode('history');
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>পূর্ববর্তী সকল পরীক্ষার রেকর্ড দেখুন</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: EXAM HISTORY ARCHIVE
      ========================================================================== */}
      {viewMode === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">অংশগ্রহণকৃত পরীক্ষার ইতিহাস ও স্কোর অগ্রগতি</h3>
            <span className="text-xs text-slate-500">মোট পরীক্ষা: {history.length} টি</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Calendar className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-sm">এখনো কোনো মক টেস্টে অংশগ্রহণ করা হয়নি।</p>
              <button
                onClick={() => setViewMode('setup')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                প্রথম পরীক্ষা শুরু করুন
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((rec) => (
                <div key={rec.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rec.exam_title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.grade === 'A+'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.grade === 'A' || rec.grade === 'A-'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Grade: {rec.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>নম্বর: {rec.obtained_marks} / {rec.total_marks} ({rec.percentage}%)</span>
                      <span>•</span>
                      <span>সময়: {formatTime(rec.time_spent_seconds)}</span>
                      <span>•</span>
                      <span>{new Date(rec.completed_at).toLocaleDateString('bn-BD')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveExamRecord(rec);
                        setViewMode('result');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
                    >
                      ডায়াগনস্টিক দেখুন
                    </button>
                    <button
                      onClick={() => {
                        const updated = deleteExamResult(rec.id);
                        setHistory(updated);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
