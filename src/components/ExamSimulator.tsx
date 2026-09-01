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
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  GraduationCap,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Question,
  CQSubpart,
  ExamConfig,
  ExamAnswerRecord,
  ExamEvaluationRecord,
  CognitiveLevel,
  AppSettings,
  AnswerEvaluationResult,
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
  getErrorCategoryTitle,
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
  const [examFormat, setExamFormat] = useState<'mixed' | 'mcq_only' | 'cq_only'>('mcq_only');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [targetMcqCount, setTargetMcqCount] = useState<number>(25);
  const [targetCqCount, setTargetCqCount] = useState<number>(0);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState<boolean>(true);
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(false);

  // Running Exam State
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswerRecord>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [examStartTime, setExamStartTime] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Active subpart for current CQ question
  const [activeSubpartIndex, setActiveSubpartIndex] = useState<number>(0);
  const [cqImageUploads, setCqImageUploads] = useState<Record<string, string>>({}); // subpartId -> base64
  const [cqScratchpad, setCqScratchpad] = useState<string>('');

  // AI Evaluation Phase State
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiEvalProgress, setAiEvalProgress] = useState<number>(0);
  const [cqAiEvaluations, setCqAiEvaluations] = useState<Record<string, AnswerEvaluationResult>>({});

  // Result View Sub-tabs
  const [resultTab, setResultTab] = useState<'review' | 'analytics' | 'remediation'>('review');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const availablePapers = useMemo(() => {
    return CANONICAL_PAPERS.filter((p) => p.subject_id === examSubjectId);
  }, [examSubjectId]);

  const getChapterDisplayName = (chapterId?: string) => {
    if (!chapterId) return 'সাধারণ অধ্যায়';
    const ch = CANONICAL_CHAPTERS.find((c) => c.id === chapterId);
    return ch ? ch.name_bn : 'সাধারণ অধ্যায়';
  };

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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Launch Exam with custom or preset parameters
  const handleLaunchExam = (format = examFormat, mcqCount = targetMcqCount, cqCount = targetCqCount, mins = durationMinutes) => {
    let pool = questions.filter((q) => {
      if (q.subject_id !== examSubjectId) return false;
      if (paperId !== 'all' && q.paper_id !== paperId) return false;
      if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter_id)) return false;
      if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
      return true;
    });

    if (pool.length === 0) {
      pool = questions.filter((q) => q.subject_id === examSubjectId);
    }

    const mcqs = pool.filter((q) => q.question_format === 'MCQ');
    const cqs = pool.filter((q) => q.question_format === 'CQ');

    const shuffledMcqs = [...mcqs].sort(() => 0.5 - Math.random());
    const shuffledCqs = [...cqs].sort(() => 0.5 - Math.random());

    let selected: Question[] = [];
    if (format === 'mcq_only') {
      selected = shuffledMcqs.slice(0, Math.min(mcqCount, shuffledMcqs.length));
    } else if (format === 'cq_only') {
      selected = shuffledCqs.slice(0, Math.min(cqCount, shuffledCqs.length));
    } else {
      const takeMcq = shuffledMcqs.slice(0, Math.min(mcqCount, shuffledMcqs.length));
      const takeCq = shuffledCqs.slice(0, Math.min(cqCount, shuffledCqs.length));
      selected = [...takeMcq, ...takeCq];
    }

    if (selected.length === 0) {
      alert('নির্বাচিত মানদণ্ডে পর্যাপ্ত প্রশ্ন পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার শিথিল করুন।');
      return;
    }

    setExamQuestions(selected);
    setCurrentQuestionIndex(0);
    setActiveSubpartIndex(0);
    setAnswers({});
    setFlaggedQuestionIds(new Set());
    setCqImageUploads({});
    setSecondsRemaining(mins * 60);
    setExamStartTime(new Date().toISOString());
    setViewMode('running');
  };

  const handleTimeUpAutoSubmit = () => {
    alert('⏰ পরীক্ষার নির্ধারিত সময় শেষ হয়েছে! আপনার উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা নেওয়া হচ্ছে।');
    handleFinishExamSubmit();
  };

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Select MCQ option
  const handleSelectMcqOption = (qId: string, optionKey: string) => {
    const q = examQuestions.find((item) => item.id === qId);
    if (!q) return;

    const isCorrect = q.correct_option?.trim().toUpperCase() === optionKey.trim().toUpperCase();
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        question_id: qId,
        selected_option: optionKey,
        selected_mcq_option: optionKey,
        is_correct: isCorrect,
        awarded_marks: isCorrect ? 1 : enableNegativeMarking ? -0.25 : 0,
        max_marks: 1,
        time_spent_seconds: (prev[qId]?.time_spent_seconds || 0) + 5,
      },
    }));
  };

  // Type CQ Answer
  const handleCqTextChange = (qId: string, subpartId: string, text: string) => {
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

  const getSubpartMaxMarks = (qId: string, subpartId: string): number => {
    const q = examQuestions.find((item) => item.id === qId);
    const sub = q?.subparts?.find((s) => s.id === subpartId);
    return sub?.marks || (sub?.part_label === 'a' ? 1 : sub?.part_label === 'b' ? 2 : sub?.part_label === 'c' ? 3 : 4);
  };

  // Upload handwritten photo for CQ subpart
  const handleCqImageSelect = (subpartId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setCqImageUploads((prev) => ({ ...prev, [subpartId]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Exam click -> Trigger AI evaluation if CQ exists
  const handleFinishExamSubmit = async () => {
    setShowSubmitModal(false);
    const hasCq = examQuestions.some((q) => q.question_format === 'CQ');

    if (hasCq) {
      setViewMode('evaluating');
      setIsAiEvaluating(true);
      setAiEvalProgress(10);

      // Perform AI evaluations for submitted CQ subparts
      const cqList = examQuestions.filter((q) => q.question_format === 'CQ');
      const totalSubparts = cqList.reduce((acc, q) => acc + (q.subparts?.length || 0), 0);
      let completedSubparts = 0;

      for (const cq of cqList) {
        if (!cq.subparts) continue;
        for (const sub of cq.subparts) {
          const userText = answers[cq.id]?.cq_subpart_answers?.[sub.id]?.user_text || '';
          const userImage = cqImageUploads[sub.id];

          if (userText.trim() || userImage) {
            try {
              const res = await fetch('/api/gemini/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  questionStem: cq.stem_text,
                  subpartPrompt: sub.prompt_text,
                  maxMarks: sub.marks || 4,
                  officialSolutionLatex: sub.solution_latex || '',
                  studentAnswerText: userText,
                  studentAnswerImageBase64: userImage,
                  conceptName: getChapterDisplayName(cq.chapter_id),
                }),
              });
              const data = await res.json();
              if (data.success && data.data) {
                setCqAiEvaluations((prev) => ({ ...prev, [sub.id]: data.data }));
                // Update awarded marks in answers
                handleCqSubpartGradeChange(cq.id, sub.id, data.data.score_obtained);
              }
            } catch (err) {
              console.error('AI evaluation failed for subpart', sub.id, err);
            }
          }
          completedSubparts++;
          setAiEvalProgress(Math.round((completedSubparts / Math.max(1, totalSubparts)) * 90) + 10);
        }
      }

      setIsAiEvaluating(false);
      evaluateAndFinalizeExam();
    } else {
      evaluateAndFinalizeExam();
    }
  };

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
        totalObtainedMarks += awarded;

        if (ans?.is_correct) {
          chapterPerformanceMap[q.chapter_id].correct_questions += 1;
          cognitiveScoreMap.application.obtained += 1;
        }
        cognitiveScoreMap.application.total += 1;

        if (q.concept_ids && q.concept_ids[0]) {
          recordStudentAttempt({
            user_id: 'local_student',
            concept_id: q.concept_ids[0],
            question_id: q.id,
            attempt_type: 'mcq_quiz',
            student_answer_text: ans?.selected_option || '',
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
              corrective_advice_bn: ans?.is_correct ? 'চমৎকার! কনসেপ্ট আয়ত্তে আছে।' : 'সঠিক উত্তর ও ব্যাখ্যা দেখে রিভিশন দিন।',
            },
          });
        }
      } else {
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
        });
      }
    });

    const netObtained = Math.max(0, Math.round(totalObtainedMarks * 10) / 10);
    const percentage = totalMaxMarks > 0 ? Math.round((netObtained / totalMaxMarks) * 100) : 0;
    
    let grade = 'F';
    let gpa = 0.0;
    if (percentage >= 80) { grade = 'A+'; gpa = 5.0; }
    else if (percentage >= 70) { grade = 'A'; gpa = 4.0; }
    else if (percentage >= 60) { grade = 'A-'; gpa = 3.5; }
    else if (percentage >= 50) { grade = 'B'; gpa = 3.0; }
    else if (percentage >= 40) { grade = 'C'; gpa = 2.0; }
    else if (percentage >= 33) { grade = 'D'; gpa = 1.0; }

    const chapterBreakdownList = Object.values(chapterPerformanceMap).map((item) => ({
      chapter_id: item.chapter_id,
      total_questions: item.total_questions,
      correct_questions: item.correct_questions,
      score_percent: item.total_questions > 0 ? Math.round((item.correct_questions / item.total_questions) * 100) : 0,
    }));

    const cogObj = {
      knowledge: cognitiveScoreMap.knowledge.total > 0 ? Math.round((cognitiveScoreMap.knowledge.obtained / cognitiveScoreMap.knowledge.total) * 100) : 100,
      understanding: cognitiveScoreMap.understanding.total > 0 ? Math.round((cognitiveScoreMap.understanding.obtained / cognitiveScoreMap.understanding.total) * 100) : 100,
      application: cognitiveScoreMap.application.total > 0 ? Math.round((cognitiveScoreMap.application.obtained / cognitiveScoreMap.application.total) * 100) : 100,
      higher_ability: cognitiveScoreMap.higher_ability.total > 0 ? Math.round((cognitiveScoreMap.higher_ability.obtained / cognitiveScoreMap.higher_ability.total) * 100) : 100,
    };

    const subjectObj = CANONICAL_SUBJECTS.find((s) => s.id === examSubjectId);

    const record: ExamEvaluationRecord = {
      id: `exam_${Date.now()}`,
      exam_title: `${subjectObj?.name_bn || 'এইচএসসি'} ${examFormat === 'mcq_only' ? 'MCQ স্পিড টেস্ট' : examFormat === 'cq_only' ? 'সৃজনশীল টেস্ট' : 'মডেল টেস্ট'}`,
      subject_id: examSubjectId,
      paper_id: paperId !== 'all' ? paperId : undefined,
      exam_type: examFormat === 'mcq_only' ? 'full_mcq' : examFormat === 'cq_only' ? 'full_cq' : 'combo_board',
      total_questions: examQuestions.length,
      total_marks: totalMaxMarks,
      obtained_marks: netObtained,
      percentage,
      grade,
      gpa,
      time_spent_seconds: durationMinutes * 60 - secondsRemaining,
      completed_at: new Date().toISOString(),
      answers,
      cognitive_performance: cogObj,
      chapter_breakdown: chapterBreakdownList,
    };

    const updatedHistory = saveExamResult(record);
    setHistory(updatedHistory);
    setActiveExamRecord(record);
    setViewMode('result');
    if (onAttemptRecorded) onAttemptRecorded();
  };

  const currentQ = examQuestions[currentQuestionIndex];

  // Count answered questions
  const answeredCount = examQuestions.filter((q) => {
    if (q.question_format === 'MCQ') return !!answers[q.id]?.selected_option;
    const subAnswers = answers[q.id]?.cq_subpart_answers || {};
    return Object.values(subAnswers).some((a) => a.user_text && a.user_text.trim().length > 0) || !!cqImageUploads[q.subparts?.[0]?.id || ''];
  }).length;

  return (
    <div className="space-y-6 pb-16">
      
      {/* =========================================================================
          VIEW 1: CLEAN 1-CLICK EXAM PRESET PICKER & SETUP
      ========================================================================== */}
      {viewMode === 'setup' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-bengali tracking-tight">
                  এইচএসসি মক টেস্ট ও বোর্ড পরীক্ষা সিমুলেটর
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
                  টাইমার, ওএমআর বৃত্ত ভরাট এবং এআই খাতা মূল্যায়নের মাধ্যমে নিখুঁত প্রস্তুতি নিন
                </p>
              </div>
            </div>

            {/* View History Button */}
            <button
              onClick={() => {
                setHistory(loadExamHistory());
                setViewMode('history');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-2xs self-end sm:self-auto"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>পূর্ববর্তী রেকর্ড ({history.length})</span>
            </button>
          </div>

          {/* 3 Prominent 1-Click Express Preset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: 25 MCQ OMR Speed Blitz */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm flex flex-col justify-between space-y-5 hover:border-emerald-500 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black uppercase px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg shadow-2xs">
                    সবচেয়ে জনপ্রিয়
                  </span>
                  <Zap className="w-5 h-5 text-emerald-500 fill-current" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-bengali">
                  ⚡ ২৫ MCQ স্পিড বুস্টার (OMR Blitz)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
                  বোর্ড পরীক্ষার স্ট্যান্ডার্ড ২৫ টি বহুনিবার্চনী প্রশ্ন। দ্রুত ওএমআর বৃত্ত ভরাট, নেগেটিভ মার্কিং এবং তাত্ক্ষণিক স্কোরকার্ড।
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold pt-1">
                  <span>⏱️ ২৫ মিনিট</span>
                  <span>•</span>
                  <span>📝 ২৫ নম্বর</span>
                  <span>•</span>
                  <span>🎯 -০.২৫ নেগেটিভ</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchExam('mcq_only', 25, 0, 25)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>তাত্ক্ষণিক শুরু করুন (Start MCQ Blitz)</span>
              </button>
            </div>

            {/* Card 2: Full Board Model Test (CQ + MCQ) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:border-blue-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-lg">
                    পূর্ণাঙ্গ পরীক্ষা
                  </span>
                  <FileCheck2 className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-bengali">
                  ✍️ পূর্ণাঙ্গ বোর্ড মডেল টেস্ট (CQ + MCQ)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
                  ১৫টি MCQ + ২টি পূর্ণাঙ্গ সৃজনশীল প্রশ্ন (ক, খ, গ, ঘ)। আসল খাতায় লিখে ছবি আপলোড করে বোর্ড পরীক্ষক দ্বারা যাচাই।
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold pt-1">
                  <span>⏱️ ৬০ মিনিট</span>
                  <span>•</span>
                  <span>📝 ৩৫ নম্বর</span>
                  <span>•</span>
                  <span>📸 AI খাতা মূল্যায়ন</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchExam('mixed', 15, 2, 60)}
                className="w-full py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black rounded-2xl text-xs sm:text-sm font-bengali transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>মডেল টেস্ট দিন (Full Mock Exam)</span>
              </button>
            </div>

            {/* Card 3: Creative Question (CQ Deep Test) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:border-purple-500/50 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-1 bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-lg">
                    সৃজনশীল গভীরতা
                  </span>
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-bengali">
                  📖 ৩টি সৃজনশীল প্রশ্ন (CQ Deep Test)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bengali leading-relaxed">
                  কেবল সৃজনশীল উদ্দীপক ও (ক, খ, গ, ঘ) অংশ। গণিত সমাধান, প্রতিপাদন ও উচ্চতর দক্ষতা যাচাই।
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold pt-1">
                  <span>⏱️ ৬০ মিনিট</span>
                  <span>•</span>
                  <span>📝 ৩০ নম্বর</span>
                  <span>•</span>
                  <span>💡 ধাপভিত্তিক মার্কিং</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchExam('cq_only', 0, 3, 60)}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl text-xs sm:text-sm font-bengali transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>সৃজনশীল টেস্ট দিন (Start CQ Test)</span>
              </button>
            </div>
          </div>

          {/* Custom Configuration Accordion */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <button
              onClick={() => setShowCustomConfig(!showCustomConfig)}
              className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bengali"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>কাস্টম পরীক্ষার সময়, প্রশ্ন সংখ্যা ও অধ্যায় নির্বাচন করুন (Custom Setup)</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${showCustomConfig ? 'rotate-90' : ''}`} />
            </button>

            {showCustomConfig && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                {/* Paper Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-bengali">পত্র (Paper):</label>
                  <select
                    value={paperId}
                    onChange={(e) => setPaperId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-bengali text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">উভয় পত্র (১ম ও ২য় পত্র সমন্বিত)</option>
                    {availablePapers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-bengali">সময়সীমা (মিনিট):</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Board Preference */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 font-bengali">বোর্ড প্রাধান্য:</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-bengali text-slate-800 dark:text-slate-100"
                  >
                    <option value="all">সকল শিক্ষা বোর্ড</option>
                    <option value="Dhaka">ঢাকা বোর্ড</option>
                    <option value="Rajshahi">রাজশাহী বোর্ড</option>
                    <option value="Chattogram">চট্টগ্রাম বোর্ড</option>
                    <option value="Dinajpur">দিনাজপুর বোর্ড</option>
                    <option value="Cumilla">কুমিল্লা বোর্ড</option>
                  </select>
                </div>

                <div className="md:col-span-3 pt-2">
                  <button
                    onClick={() => handleLaunchExam()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm font-bengali shadow-md transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>কাস্টম পরীক্ষা শুরু করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE RUNNING EXAM WITH OMR SHEET & QUESTION PALETTE
      ========================================================================== */}
      {viewMode === 'running' && currentQ && (
        <div className="space-y-5">
          
          {/* Top Sticky Header */}
          <div className="sticky top-20 z-30 p-4 px-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-black px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                {currentQuestionIndex + 1} / {examQuestions.length}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali hidden sm:inline">
                {currentQ.question_format === 'MCQ' ? 'বহুনিবার্চনী প্রশ্ন (MCQ)' : 'সৃজনশীল প্রশ্ন (CQ)'}
              </span>
              {currentQ.board && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 hidden md:inline">
                  {currentQ.board} {currentQ.exam_year}
                </span>
              )}
            </div>

            {/* Center Live Timer */}
            <div
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-2xl font-mono font-black text-sm transition-all shadow-xs ${
                secondsRemaining < 300
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/20'
                  : secondsRemaining < 600
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQ.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-bengali border transition-all flex items-center gap-1.5 shadow-2xs ${
                  flaggedQuestionIds.has(currentQ.id)
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
                title="পরবর্তীতে রিভিউর জন্য চিহ্নিত করুন"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">রিভিউ ফ্ল্যাগ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black font-bengali rounded-xl shadow-md transition-all active:scale-95"
              >
                পরীক্ষা জমা দিন (Submit)
              </button>
            </div>
          </div>

          {/* Question Grid Split: Main Question & Answer (Left 8 cols) + OMR Palette (Right 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Question Stem & Interactive Answering */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Question Stem Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 font-bengali">
                  <span className="font-bold">প্রশ্ন নং {currentQuestionIndex + 1}</span>
                  <span>{getChapterDisplayName(currentQ.chapter_id)}</span>
                </div>
                <div className="prose dark:prose-invert max-w-none text-slate-900 dark:text-white font-bengali text-sm sm:text-base leading-relaxed">
                  <MathRenderer content={currentQ.stem_text} />
                </div>
              </div>

              {/* Interactive MCQ OMR Answer Options */}
              {currentQ.question_format === 'MCQ' && currentQ.mcq_options && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase font-bengali block">
                    সঠিক ওএমআর বৃত্ত নির্বাচন করুন:
                  </span>
                  <div className="space-y-2.5">
                    {currentQ.mcq_options.map((opt) => {
                      const isSelected = answers[currentQ.id]?.selected_option === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleSelectMcqOption(currentQ.id, opt.key)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center space-x-3.5 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-slate-900 dark:text-white ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {/* OMR Bubble Indicator */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30'
                                : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {opt.key}
                          </div>
                          <div className="font-bengali text-sm flex-1 leading-relaxed">
                            <MathRenderer content={opt.text} inline />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive CQ Subpart Answering (With Dual Option: Photo Upload / Typing) */}
              {currentQ.question_format === 'CQ' && currentQ.subparts && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
                  {/* Subpart Tabs (ক, খ, গ, ঘ) */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 gap-2">
                    {currentQ.subparts.map((sub, sIdx) => {
                      const isActive = sIdx === activeSubpartIndex;
                      const hasText = !!answers[currentQ.id]?.cq_subpart_answers?.[sub.id]?.user_text;
                      const hasImage = !!cqImageUploads[sub.id];
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setActiveSubpartIndex(sIdx)}
                          className={`px-4 py-2.5 text-xs font-bold border-b-2 font-bengali transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                          }`}
                        >
                          <span>অংশ ({sub.part_label === 'a' ? 'ক' : sub.part_label === 'b' ? 'খ' : sub.part_label === 'c' ? 'গ' : 'ঘ'})</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            {sub.marks || 1}
                          </span>
                          {(hasText || hasImage) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Subpart Body */}
                  {currentQ.subparts[activeSubpartIndex] && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20">
                        <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase block mb-1 font-bengali">
                          প্রশ্ন ({currentQ.subparts[activeSubpartIndex].part_label.toUpperCase()}):
                        </span>
                        <div className="text-sm font-bengali font-bold text-slate-900 dark:text-white">
                          <MathRenderer content={currentQ.subparts[activeSubpartIndex].prompt_text} />
                        </div>
                      </div>

                      {/* Photo Upload Option for Real Paper Solving */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-slate-700 dark:text-slate-200 font-bengali flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-emerald-600" />
                            <span>আসল খাতায় লিখে ছবি আপলোড করুন (বাস্তব পরীক্ষার অভিজ্ঞতা):</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-2 shadow-2xs">
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                            <span>খাতার পৃষ্ঠার ছবি তুলুন / দিন</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCqImageSelect(currentQ.subparts![activeSubpartIndex].id, e)}
                              className="hidden"
                            />
                          </label>

                          {cqImageUploads[currentQ.subparts[activeSubpartIndex].id] && (
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-bengali">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ছবি সংযুক্ত হয়েছে</span>
                              <button
                                onClick={() => setCqImageUploads((prev) => ({ ...prev, [currentQ.subparts![activeSubpartIndex].id]: '' }))}
                                className="p-1 hover:bg-rose-100 rounded text-rose-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Text / Typing Alternative */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-1 font-bengali">
                          অথবা লিখিত সমাধান টাইপ করুন (ঐচ্ছিক):
                        </label>
                        <textarea
                          rows={4}
                          value={
                            answers[currentQ.id]?.cq_subpart_answers?.[
                              currentQ.subparts[activeSubpartIndex].id
                            ]?.user_text || ''
                          }
                          onChange={(e) =>
                            handleCqTextChange(
                              currentQ.id,
                              currentQ.subparts![activeSubpartIndex].id,
                              e.target.value
                            )
                          }
                          placeholder="সমীকরণ, সূত্র এবং উত্তরের ধাপসমূহ লিখুন..."
                          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bengali text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prev / Next Bottom Navigator */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                    setActiveSubpartIndex(0);
                  }}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold font-bengali rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold font-bengali rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>পরবর্তী প্রশ্ন</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Live OMR Palette & Scratchpad */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Live OMR Palette */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 font-bengali">
                    ওএমআর ও প্রশ্ন প্যালেট
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {answeredCount}/{examQuestions.length} উত্তরকৃত
                  </span>
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-3 text-[10px] font-bengali text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> উত্তরকৃত</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ফ্ল্যাগ</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> বাকি</span>
                </div>

                {/* Question Bubbles Grid */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {examQuestions.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered =
                      q.question_format === 'MCQ'
                        ? !!answers[q.id]?.selected_option
                        : !!answers[q.id]?.cq_subpart_answers &&
                          Object.values(answers[q.id]?.cq_subpart_answers || {}).some(
                            (a) => a.user_text && a.user_text.trim().length > 0
                          ) || !!cqImageUploads[q.subparts?.[0]?.id || ''];
                    const isFlagged = flaggedQuestionIds.has(q.id);

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                          setActiveSubpartIndex(0);
                        }}
                        className={`h-9 rounded-xl font-mono text-xs font-black transition-all relative flex items-center justify-center ${
                          isCurrent
                            ? 'ring-2 ring-emerald-500 bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                            : isFlagged
                            ? 'bg-amber-500 text-white'
                            : isAnswered
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scratchpad Draft Notepad */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 font-bengali">
                    খসড়া রাফ প্যাড
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCqScratchpad('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-bengali"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={cqScratchpad}
                  onChange={(e) => setCqScratchpad(e.target.value)}
                  placeholder="গণিত ও একক রূপান্তরের জন্য দ্রুত রাফ হিসাব..."
                  className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Confirmation Modal */}
          {showSubmitModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-bengali">
                    পরীক্ষা জমা দিতে চান?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    মোট {examQuestions.length} টি প্রশ্নের মধ্যে আপনি <strong>{answeredCount} টি</strong> উত্তর দিয়েছেন এবং <strong>{examQuestions.length - answeredCount} টি</strong> বাকি রয়েছে।
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs font-bengali"
                  >
                    ফিরে যান
                  </button>
                  <button
                    onClick={handleFinishExamSubmit}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs font-bengali shadow-md"
                  >
                    হ্যাঁ, জমা দিন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: AUTOMATED AI GRADING & EVALUATION PROGRESS
      ========================================================================== */}
      {viewMode === 'evaluating' && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm max-w-xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-bengali">
              বোর্ড পরীক্ষক খাতা মূল্যায়ন করছেন...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
              আপনার লিখিত ধাপ, সূত্রের প্রয়োগ ও গাণিতিক ফলাফলের পুঙ্খানুপুঙ্খ বিশ্লেষণ চলছে
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${aiEvalProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {aiEvalProgress}% মূল্যায়ন সম্পন্ন
          </span>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: POST-EXAM DIAGNOSTIC SCORECARD & QUESTION REVIEW
      ========================================================================== */}
      {viewMode === 'result' && activeExamRecord && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Hero Diagnostic Scorecard */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  PERFORMANCE REPORT
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-bengali text-white">
                  {activeExamRecord.exam_title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                  <span>মোট প্রশ্ন: {activeExamRecord.total_questions} টি</span>
                  <span>•</span>
                  <span>ব্যয়িত সময়: {formatTime(activeExamRecord.time_spent_seconds || 0)}</span>
                </div>
              </div>

              {/* Grade Badge Banner */}
              <div className="flex items-center gap-5 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-inner">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-400 font-mono">
                    {activeExamRecord.grade}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">লেটার গ্রেড</span>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-white font-mono">
                    {activeExamRecord.obtained_marks} / {activeExamRecord.total_marks}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    নম্বর ({activeExamRecord.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-tabs: Review vs Analytics */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setResultTab('review')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
                resultTab === 'review'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>প্রশ্ন পর্যালোচনা ও মডেল সমাধান ({examQuestions.length})</span>
            </button>
            <button
              onClick={() => setResultTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
                resultTab === 'analytics'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>দক্ষতা ও দুর্বলতা বিশ্লেষণ</span>
            </button>
          </div>

          {/* Sub-tab 1: Question Review & Step Solution Reveal */}
          {resultTab === 'review' && (
            <div className="space-y-4">
              {examQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const isMcq = q.question_format === 'MCQ';
                const isCorrect = isMcq ? !!ans?.is_correct : (ans?.awarded_marks || 0) >= 7;

                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-4 shadow-sm ${
                      isCorrect
                        ? 'border-emerald-500/40 dark:border-emerald-500/30'
                        : 'border-rose-500/40 dark:border-rose-500/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-bengali">
                          {getChapterDisplayName(q.chapter_id)} ({q.board || 'বোর্ড'} {q.exam_year || ''})
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-xl ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isMcq
                          ? ans?.is_correct
                            ? '+১.০০'
                            : enableNegativeMarking
                            ? '-০.২৫'
                            : '০.০০'
                          : `${ans?.awarded_marks || 0} / ১০ নম্বর`}
                      </span>
                    </div>

                    {/* Question Stem */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bengali text-xs sm:text-sm leading-relaxed">
                      <MathRenderer content={q.stem_text} />
                    </div>

                    {/* MCQ Options with Correct Key Highlight */}
                    {isMcq && q.mcq_options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bengali">
                        {q.mcq_options.map((opt) => {
                          const isUserSelected = ans?.selected_option === opt.key;
                          const isActualCorrect = q.correct_option?.trim().toUpperCase() === opt.key.trim().toUpperCase();
                          return (
                            <div
                              key={opt.key}
                              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                                isActualCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : isUserSelected
                                  ? 'bg-rose-500/15 border-rose-500 text-rose-900 dark:text-rose-200'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                                {opt.key}
                              </span>
                              <div className="flex-1">
                                <MathRenderer content={opt.text} inline />
                              </div>
                              {isActualCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {isUserSelected && !isActualCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* CQ Step Solutions */}
                    {!isMcq && q.subparts && (
                      <div className="space-y-2 pt-1">
                        {q.subparts.map((sub) => (
                          <div key={sub.id} className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300 font-bengali">
                              <span>অংশ ({sub.part_label.toUpperCase()}): {sub.prompt_text}</span>
                              <span className="font-mono">[{sub.marks || 1} নম্বর]</span>
                            </div>
                            {sub.solution_latex && (
                              <div className="text-slate-800 dark:text-slate-200 font-bengali pt-1 border-t border-emerald-500/20">
                                <MathRenderer content={sub.solution_latex} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Send to Tutor Remediation Button */}
                    {onSendToTutor && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onSendToTutor(q)}
                          className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1.5"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>এই প্রশ্নের ডাউট এআই টিউটরে বুঝুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-tab 2: Analytics & Bloom's Taxonomy Breakdown */}
          {resultTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cognitive Performance */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white font-bengali flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  জ্ঞান ও দক্ষতা ভিত্তিক বিশ্লেষণ (Bloom's Taxonomy)
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'জ্ঞানমূলক (Knowledge - ক)', score: activeExamRecord.cognitive_performance?.knowledge || 100 },
                    { label: 'অনুধাবনমূলক (Understanding - খ)', score: activeExamRecord.cognitive_performance?.understanding || 100 },
                    { label: 'প্রয়োগমূলক (Application - গ)', score: activeExamRecord.cognitive_performance?.application || 100 },
                    { label: 'উচ্চতর দক্ষতা (Higher Ability - ঘ)', score: activeExamRecord.cognitive_performance?.higher_ability || 100 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 font-bengali">
                        <span>{item.label}</span>
                        <span className="font-mono">{item.score}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapter Performance */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white font-bengali flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  অধ্যায়ভিত্তিক দক্ষতা বিশ্লেষণ
                </h4>
                <div className="space-y-3 text-xs">
                  {activeExamRecord.chapter_breakdown?.map((cb) => {
                    const chObj = CANONICAL_CHAPTERS.find((c) => c.id === cb.chapter_id);
                    return (
                      <div key={cb.chapter_id} className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 font-bengali">
                          <span className="truncate max-w-[200px]">
                            {chObj ? `অধ্যায় ${chObj.chapter_number}: ${chObj.name_bn}` : cb.chapter_id}
                          </span>
                          <span className="font-mono">
                            {cb.correct_questions}/{cb.total_questions} ({cb.score_percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
          )}

          {/* Return / Retake Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setViewMode('setup')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm font-bengali shadow-md transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন আরেকটি পরীক্ষা দিন</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: EXAM HISTORY ARCHIVE
      ========================================================================== */}
      {viewMode === 'history' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white font-bengali">
              অংশগ্রহণকৃত পরীক্ষার ইতিহাস ও স্কোর অগ্রগতি
            </h3>
            <button
              onClick={() => setViewMode('setup')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold font-bengali shadow-xs"
            >
              + নতুন পরীক্ষা দিন
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Calendar className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-sm font-bengali">এখনো কোনো মক টেস্ট সম্পন্ন করা হয়নি।</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((rec) => (
                <div key={rec.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-bengali">
                        {rec.exam_title}
                      </span>
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {rec.grade} ({rec.percentage}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 font-mono">
                      <span>নম্বর: {rec.obtained_marks} / {rec.total_marks}</span>
                      <span>•</span>
                      <span>ব্যয়িত সময়: {formatTime(rec.time_spent_seconds || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveExamRecord(rec);
                        setViewMode('result');
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl font-bengali transition-all"
                    >
                      রিপোর্ট দেখুন
                    </button>
                    <button
                      onClick={() => {
                        const updated = deleteExamResult(rec.id!);
                        setHistory(updated);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
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
