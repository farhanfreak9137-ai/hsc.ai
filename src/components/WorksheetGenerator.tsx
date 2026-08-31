import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Sparkles,
  Settings2,
  CheckCircle2,
  FileText,
  Bookmark,
  Layers,
  BookOpen,
  Filter,
  Eye,
  Copy,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Save,
  FolderOpen,
  Trash2,
  Download,
  Info,
  X,
  Shuffle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  Question,
  WorksheetConfig,
  CQSubpart,
  AppSettings,
} from '../types';
import {
  CANONICAL_SUBJECTS,
  CANONICAL_PAPERS,
  CANONICAL_CHAPTERS,
  CANONICAL_CONCEPTS,
} from '../data/canonicalTaxonomy';
import {
  saveWorksheetConfig,
  loadSavedWorksheets,
  deleteSavedWorksheet,
} from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { t, Language, getSubjectDisplayName, getPaperDisplayName } from '../services/i18n';

interface WorksheetGeneratorProps {
  questions: Question[];
  selectedSubjectId: string;
  settings?: AppSettings;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  questions,
  selectedSubjectId,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';

  // Config state
  const [subjectId, setSubjectId] = useState<string>(selectedSubjectId);
  const [paperId, setPaperId] = useState<string>('all');
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [questionType, setQuestionType] = useState<'both' | 'cq_only' | 'mcq_only'>('both');
  const [layoutStyle, setLayoutStyle] = useState<'standard' | 'compact' | 'workbook'>('standard');
  const [targetCqCount, setTargetCqCount] = useState<number>(3);
  const [targetMcqCount, setTargetMcqCount] = useState<number>(10);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  // Toggle options
  const [includeSolutions, setIncludeSolutions] = useState<boolean>(true);
  const [includeAnswerKey, setIncludeAnswerKey] = useState<boolean>(true);
  const [includeFormulaCheat, setIncludeFormulaCheat] = useState<boolean>(true);
  const [includeStudentHeader, setIncludeStudentHeader] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>(
    isBn ? 'এইচএসসি প্রস্তুতি মডেল প্রশ্নপত্র ও প্র্যাকটিস শিট' : 'HSC Model Question Paper & Practice Worksheet'
  );
  const [instituteName, setInstituteName] = useState<string>(
    isBn ? 'উচ্চ মাধ্যমিক শিক্ষা বোর্ড ও মডেল কলেজ' : 'Higher Secondary Education Board & Model College'
  );

  // Preview mode toggle: 'worksheet' (A4 Document), 'questions_list' (Interactive Cards), 'solutions' (Model Solutions)
  const [previewTab, setPreviewTab] = useState<'worksheet' | 'questions_list' | 'solutions'>('worksheet');
  const [questionPreviewFilter, setQuestionPreviewFilter] = useState<'all' | 'cq' | 'mcq'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Preset management state
  const [savedWorksheets, setSavedWorksheets] = useState<WorksheetConfig[]>([]);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [presetTitleInput, setPresetTitleInput] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

  // Sync with selectedSubjectId prop changes
  useEffect(() => {
    setSubjectId(selectedSubjectId);
    setPaperId('all');
    setSelectedChapters([]);
  }, [selectedSubjectId]);

  // Load saved presets on mount
  useEffect(() => {
    setSavedWorksheets(loadSavedWorksheets());
  }, []);

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    return CANONICAL_CHAPTERS.filter((ch) => {
      const paper = CANONICAL_PAPERS.find((p) => p.id === ch.paper_id);
      if (!paper) return false;
      if (paper.subject_id !== subjectId) return false;
      if (paperId !== 'all' && ch.paper_id !== paperId) return false;
      return true;
    });
  }, [subjectId, paperId]);

  const availablePapers = useMemo(() => {
    return CANONICAL_PAPERS.filter((p) => p.subject_id === subjectId);
  }, [subjectId]);

  // Selected questions for the worksheet
  const generatedQuestions = useMemo(() => {
    // 1. Filtered primary pool matching subject, paper, chapter, board
    let pool = questions.filter((q) => {
      if (q.subject_id !== subjectId) return false;
      if (paperId !== 'all' && q.paper_id !== paperId) return false;
      if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter_id)) return false;
      if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
      return true;
    });

    if (pool.length === 0) {
      pool = questions.filter((q) => q.subject_id === subjectId);
    }

    // Apply deterministic or randomized ordering based on shuffleSeed
    const shuffledPool = [...pool].sort((a, b) => {
      if (shuffleSeed === 0) return 0;
      const hashA = (a.id + shuffleSeed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = (b.id + shuffleSeed).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hashA % 97) - (hashB % 97);
    });

    // 2. Subject fallback pools
    const subjectCqs = questions.filter((q) => q.subject_id === subjectId && q.question_format === 'CQ');
    let subjectMcqs = questions.filter((q) => q.subject_id === subjectId && q.question_format === 'MCQ');
    if (subjectMcqs.length === 0) {
      // Global fallback if no MCQs exist for this exact subject
      subjectMcqs = questions.filter((q) => q.question_format === 'MCQ');
    }

    // 3. Extract and fill CQs
    const filteredCqs = shuffledPool.filter((q) => q.question_format === 'CQ');
    const cqs = [...filteredCqs];
    for (const q of subjectCqs) {
      if (cqs.length >= targetCqCount) break;
      if (!cqs.some((item) => item.id === q.id)) {
        cqs.push(q);
      }
    }

    // 4. Extract and fill MCQs
    const filteredMcqs = shuffledPool.filter((q) => q.question_format === 'MCQ');
    const mcqs = [...filteredMcqs];
    for (const q of subjectMcqs) {
      if (mcqs.length >= targetMcqCount) break;
      if (!mcqs.some((item) => item.id === q.id)) {
        mcqs.push(q);
      }
    }

    if (questionType === 'cq_only') {
      return cqs.slice(0, targetCqCount);
    } else if (questionType === 'mcq_only') {
      return mcqs.slice(0, targetMcqCount);
    } else {
      return [...cqs.slice(0, targetCqCount), ...mcqs.slice(0, targetMcqCount)];
    }
  }, [questions, subjectId, paperId, selectedChapters, selectedBoard, questionType, targetCqCount, targetMcqCount, shuffleSeed]);

  // Formulas for selected chapters
  const relevantConcepts = useMemo(() => {
    return CANONICAL_CONCEPTS.filter((c) => {
      if (c.subject_id !== subjectId) return false;
      if (selectedChapters.length > 0 && !selectedChapters.includes(c.chapter_id)) return false;
      return !!c.formula_latex;
    }).slice(0, 6);
  }, [subjectId, selectedChapters]);

  const currentSubjectObj = CANONICAL_SUBJECTS.find((s) => s.id === subjectId);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  const handleCopyAnswerKey = () => {
    const mcqs = generatedQuestions.filter((q) => q.question_format === 'MCQ');
    const text = mcqs
      .map((q, i) => `${i + 1}. [${q.correct_option || 'A'}]`)
      .join('   ');
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const toggleSolutionExpanded = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Save current worksheet config with precise format handling
  const handleSaveConfig = () => {
    const titleToUse = presetTitleInput.trim() || customTitle || `${getSubjectDisplayName(subjectId, lang)} ${isBn ? 'ওয়ার্কশিট' : 'Worksheet'}`;
    const newConfig: WorksheetConfig = {
      id: `ws_${Date.now()}`,
      worksheet_type: 'board_question_paper',
      subject_id: subjectId,
      paper_id: paperId,
      chapter_ids: selectedChapters,
      board: selectedBoard,
      question_format_filter: questionType,
      layout_style: layoutStyle,
      target_cq_count: questionType === 'mcq_only' ? 0 : targetCqCount,
      target_mcq_count: questionType === 'cq_only' ? 0 : targetMcqCount,
      include_solution_key: includeAnswerKey,
      include_marking_rubrics: includeSolutions,
      include_formula_cheat: includeFormulaCheat,
      include_student_header: includeStudentHeader,
      custom_title: titleToUse,
      custom_institution_name: instituteName,
      created_at: new Date().toISOString(),
    };

    const updatedList = saveWorksheetConfig(newConfig);
    setSavedWorksheets(updatedList);
    setShowSaveDialog(false);
    setPresetTitleInput('');
    setSaveSuccessMsg(
      isBn ? `'${titleToUse}' প্রিসেট সফলভাবে সংরক্ষিত হয়েছে!` : `'${titleToUse}' preset saved successfully!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Load a saved configuration with exact type handling
  const handleLoadConfig = (config: WorksheetConfig) => {
    if (config.subject_id) setSubjectId(config.subject_id);
    if (config.paper_id) setPaperId(config.paper_id);
    if (config.chapter_ids) setSelectedChapters(config.chapter_ids);
    if (config.board) setSelectedBoard(config.board);

    if (config.question_format_filter) {
      if (config.question_format_filter === 'cq_only' || config.question_format_filter === 'CQ') {
        setQuestionType('cq_only');
      } else if (config.question_format_filter === 'mcq_only' || config.question_format_filter === 'MCQ') {
        setQuestionType('mcq_only');
      } else {
        setQuestionType('both');
      }
    } else {
      if (config.target_cq_count === 0 && (config.target_mcq_count ?? 0) > 0) {
        setQuestionType('mcq_only');
      } else if ((config.target_cq_count ?? 0) > 0 && config.target_mcq_count === 0) {
        setQuestionType('cq_only');
      } else {
        setQuestionType('both');
      }
    }

    if (config.layout_style) {
      if (config.layout_style === 'compact' || config.layout_style === 'two_column') {
        setLayoutStyle('compact');
      } else if (config.layout_style === 'workbook') {
        setLayoutStyle('workbook');
      } else {
        setLayoutStyle('standard');
      }
    }
    if (config.target_cq_count !== undefined && config.target_cq_count > 0) {
      setTargetCqCount(config.target_cq_count);
    }
    if (config.target_mcq_count !== undefined && config.target_mcq_count > 0) {
      setTargetMcqCount(config.target_mcq_count);
    }
    if (config.include_solution_key !== undefined) setIncludeAnswerKey(config.include_solution_key);
    if (config.include_marking_rubrics !== undefined) setIncludeSolutions(config.include_marking_rubrics);
    if (config.include_formula_cheat !== undefined) setIncludeFormulaCheat(config.include_formula_cheat);
    if (config.include_student_header !== undefined) setIncludeStudentHeader(config.include_student_header);
    if (config.custom_title) setCustomTitle(config.custom_title);
    if (config.custom_institution_name) setInstituteName(config.custom_institution_name);

    setShowSavedModal(false);
    setSaveSuccessMsg(
      isBn ? `'${config.custom_title || 'কনফিগারেশন'}' সফলভাবে লোড করা হয়েছে!` : `'${config.custom_title || 'Configuration'}' loaded successfully!`
    );
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Delete a saved configuration
  const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSavedWorksheet(id);
    setSavedWorksheets(updated);
  };

  // Export JSON configuration
  const handleExportJson = () => {
    const configData = {
      subjectId,
      paperId,
      selectedChapters,
      selectedBoard,
      questionType,
      layoutStyle,
      targetCqCount: questionType === 'mcq_only' ? 0 : targetCqCount,
      targetMcqCount: questionType === 'cq_only' ? 0 : targetMcqCount,
      includeSolutions,
      includeAnswerKey,
      includeFormulaCheat,
      includeStudentHeader,
      customTitle,
      instituteName,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worksheet-config-${subjectId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cqsInWorksheet = questionType === 'mcq_only' ? [] : generatedQuestions.filter((q) => q.question_format === 'CQ');
  const mcqsInWorksheet = questionType === 'cq_only' ? [] : generatedQuestions.filter((q) => q.question_format === 'MCQ');

  const totalMarks = cqsInWorksheet.length * 10 + mcqsInWorksheet.length * 1;
  const suggestedTimeMins = cqsInWorksheet.length * 20 + mcqsInWorksheet.length * 1;

  return (
    <div className="space-y-6 font-sans">
      {/* Save Success Toast */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <FileDown className="w-3.5 h-3.5" />
              {t('ws_badge', lang)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('ws_subbadge', lang)}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 font-bengali">
            {t('ws_heading', lang)}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shuffle Questions Button */}
          <button
            type="button"
            onClick={() => setShuffleSeed((prev) => prev + 1)}
            title={isBn ? 'প্রশ্নগুলো র‍্যান্ডমাইজ বা পরিবর্তন করুন' : 'Shuffle or pick new questions'}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
          >
            <Shuffle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isBn ? 'প্রশ্ন বদলান (Shuffle)' : 'Shuffle Questions'}</span>
          </button>

          {/* Saved Presets Button */}
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
          >
            <FolderOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{t('ws_saved_presets_btn', lang)} ({savedWorksheets.length})</span>
          </button>

          {/* Save Configuration Button */}
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{t('ws_save_config_btn', lang)}</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>{t('print', lang)}</span>
          </button>
        </div>
      </div>

      {/* Guidance Info Banner */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 p-3.5 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5 print:hidden">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-semibold text-blue-950 dark:text-blue-100">
            {t('ws_instructions_title', lang)}
          </p>
          <p className="text-blue-800 dark:text-blue-300 leading-relaxed text-[11.5px] whitespace-pre-line">
            {t('ws_instructions_body', lang)}
          </p>
        </div>
      </div>

      {/* Main Grid: Controls (Left) vs Live Printable / Question Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (4 cols) - Hidden in Print */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('ws_config_title', lang)}
              </h3>
              <button
                type="button"
                onClick={handleExportJson}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                title={t('export_json', lang)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            {/* Subject & Paper */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('ws_subject_label', lang)}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setPaperId('all');
                    setSelectedChapters([]);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {CANONICAL_SUBJECTS.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {isBn ? `${sub.name_bn} (${sub.name_en})` : `${sub.name_en} (${sub.name_bn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('ws_paper_label', lang)}
                </label>
                <select
                  value={paperId}
                  onChange={(e) => {
                    setPaperId(e.target.value);
                    setSelectedChapters([]);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="all">{getPaperDisplayName('all', lang)}</option>
                  {availablePapers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getPaperDisplayName(p.id, lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('ws_format_label', lang)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'both', label: t('ws_format_both', lang) },
                  { id: 'cq_only', label: t('ws_format_cq_only', lang) },
                  { id: 'mcq_only', label: t('ws_format_mcq_only', lang) },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setQuestionType(item.id as any)}
                    className={`py-2 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                      questionType === item.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-3">
              {questionType !== 'mcq_only' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ws_cq_count_label', lang)}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={targetCqCount}
                    onChange={(e) => setTargetCqCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}

              {questionType !== 'cq_only' && (
                <div className={questionType === 'mcq_only' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ws_mcq_count_label', lang)}
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={40}
                    value={targetMcqCount}
                    onChange={(e) => setTargetMcqCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Chapter Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('ws_chapters_label', lang)}
                </label>
                {selectedChapters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedChapters([])}
                    className="text-[10px] text-emerald-600 hover:underline"
                  >
                    {isBn ? 'সকল অধ্যায়' : 'Select All'}
                  </button>
                )}
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {filteredChapters.map((ch) => {
                  const isChecked = selectedChapters.includes(ch.id);
                  return (
                    <label
                      key={ch.id}
                      className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
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
                      <span className="truncate">{isBn ? ch.name_bn : ch.name_en}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Layout Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('ws_layout_label', lang)}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: t('ws_layout_standard', lang) },
                  { id: 'compact', label: t('ws_layout_compact', lang) },
                  { id: 'workbook', label: t('ws_layout_workbook', lang) },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayoutStyle(item.id as any)}
                    className={`py-2 px-1 text-[11px] font-medium rounded-lg border text-center transition-all ${
                      layoutStyle === item.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStudentHeader}
                  onChange={(e) => setIncludeStudentHeader(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('ws_toggle_header', lang)}</span>
              </label>

              {questionType !== 'cq_only' && (
                <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnswerKey}
                    onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t('ws_toggle_answer_key', lang)}</span>
                </label>
              )}

              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSolutions}
                  onChange={(e) => setIncludeSolutions(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{t('ws_toggle_solutions', lang)}</span>
              </label>
            </div>

            {/* Custom Titles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('ws_institute_label', lang)}
                </label>
                <input
                  type="text"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('ws_exam_title_label', lang)}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Bottom Save Preset Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSaveDialog(true)}
                className="w-full py-2.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{t('ws_save_config_btn', lang)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Preview / Questions List Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Preview Tab Switcher - Hidden in print */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tab 1: A4 Printable Document View */}
              <button
                type="button"
                onClick={() => setPreviewTab('worksheet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  previewTab === 'worksheet'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('ws_tab_paper_preview', lang)}
              </button>

              {/* Tab 2: Interactive Question Cards & CQ/MCQ Preview */}
              <button
                type="button"
                onClick={() => setPreviewTab('questions_list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  previewTab === 'questions_list'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t('ws_tab_question_preview', lang)}</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                  {cqsInWorksheet.length + mcqsInWorksheet.length}
                </span>
              </button>

              {/* Tab 3: Model Solutions View */}
              {includeSolutions && (
                <button
                  type="button"
                  onClick={() => setPreviewTab('solutions')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    previewTab === 'solutions'
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t('ws_tab_solutions', lang)}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {includeAnswerKey && mcqsInWorksheet.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyAnswerKey}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? t('copied', lang) : (isBn ? 'MCQ উত্তর কপি করুন' : 'Copy MCQ Keys')}</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              VIEW 1: INTERACTIVE QUESTION CARDS PREVIEW (CQ & MCQ CARD EXPLORER)
          ========================================================================== */}
          {previewTab === 'questions_list' && (
            <div className="space-y-4">
              {/* Filter Sub-bar */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isBn ? 'ফিল্টার:' : 'Filter:'}
                  </span>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'all', label: isBn ? `সকল প্রশ্ন (${cqsInWorksheet.length + mcqsInWorksheet.length})` : `All (${cqsInWorksheet.length + mcqsInWorksheet.length})` },
                      ...(cqsInWorksheet.length > 0
                        ? [{ id: 'cq', label: isBn ? `সৃজনশীল CQ (${cqsInWorksheet.length})` : `CQ (${cqsInWorksheet.length})` }]
                        : []),
                      ...(mcqsInWorksheet.length > 0
                        ? [{ id: 'mcq', label: isBn ? `বহুনির্বাচনি MCQ (${mcqsInWorksheet.length})` : `MCQ (${mcqsInWorksheet.length})` }]
                        : []),
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setQuestionPreviewFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          questionPreviewFilter === f.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isBn ? 'পূর্ণমান:' : 'Total Marks:'} <strong className="text-emerald-700 dark:text-emerald-400">{totalMarks}</strong>
                </div>
              </div>

              {/* CQ Questions Preview Cards */}
              {(questionPreviewFilter === 'all' || questionPreviewFilter === 'cq') && cqsInWorksheet.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>{t('ws_section_a_title', lang)} ({cqsInWorksheet.length}টি CQ • {cqsInWorksheet.length * 10} নম্বর)</span>
                  </div>

                  {cqsInWorksheet.map((cq, cqIdx) => {
                    const chObj = CANONICAL_CHAPTERS.find((c) => c.id === cq.chapter_id);
                    const isSolutionOpen = expandedSolutions[cq.id];

                    return (
                      <div
                        key={cq.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                              {cqIdx + 1}
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {isBn ? `সৃজনশীল প্রশ্ন ${cqIdx + 1}` : `Creative Question ${cqIdx + 1}`}
                            </span>
                            {chObj && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                {isBn ? chObj.name_bn : chObj.name_en}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {cq.board && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                                {cq.board} Board {cq.exam_year}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              ১০ নম্বর
                            </span>
                          </div>
                        </div>

                        {/* CQ Stem with Math Rendering */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 font-bengali text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                          <div className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-1">
                            {isBn ? 'উদ্দীপক (Stem):' : 'Stem Context:'}
                          </div>
                          <MathRenderer content={cq.stem_text} />
                        </div>

                        {/* Subparts (a, b, c, d) */}
                        <div className="space-y-2.5 pt-1">
                          {cq.subparts?.map((sub) => {
                            const label =
                              sub.part_label === 'a'
                                ? '(ক)'
                                : sub.part_label === 'b'
                                ? '(খ)'
                                : sub.part_label === 'c'
                                ? '(গ)'
                                : '(ঘ)';
                            const mark =
                              sub.marks || (sub.part_label === 'a' ? 1 : sub.part_label === 'b' ? 2 : sub.part_label === 'c' ? 3 : 4);
                            const cognitiveName =
                              sub.cognitive_level === 'knowledge'
                                ? (isBn ? 'জ্ঞানমূলক' : 'Knowledge')
                                : sub.cognitive_level === 'understanding'
                                ? (isBn ? 'অনুধাবনমূলক' : 'Understanding')
                                : sub.cognitive_level === 'application'
                                ? (isBn ? 'প্রয়োগমূলক' : 'Application')
                                : (isBn ? 'উচ্চতর দক্ষতা' : 'Higher Ability');

                            return (
                              <div
                                key={sub.id}
                                className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 font-bengali text-sm">
                                      {label}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                      {cognitiveName}
                                    </span>
                                  </div>
                                  <div className="font-bengali text-slate-800 dark:text-slate-200 leading-relaxed text-sm pt-0.5">
                                    <MathRenderer content={sub.prompt_text} />
                                  </div>
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 font-bengali text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg whitespace-nowrap">
                                  {mark} {isBn ? 'নম্বর' : 'Marks'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Model Solution Toggle & Preview */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => toggleSolutionExpanded(cq.id)}
                            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1.5"
                          >
                            {isSolutionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            <span>
                              {isSolutionOpen
                                ? (isBn ? 'মডেল সমাধান ও মার্কিং রুব্রিক লুকান' : 'Hide Model Solutions')
                                : (isBn ? 'মডেল সমাধান ও মার্কিং রুব্রিক দেখুন' : 'View Full Model Solution & Rubrics')}
                            </span>
                          </button>

                          {isSolutionOpen && (
                            <div className="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in duration-200 text-xs">
                              {cq.subparts?.map((sub) => (
                                <div key={sub.id} className="space-y-1">
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                    <span>
                                      ({sub.part_label.toUpperCase()}) {sub.prompt_text} ({sub.marks || 1} নম্বর)
                                    </span>
                                  </div>
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900 text-slate-800 dark:text-slate-200 leading-relaxed font-bengali">
                                    <MathRenderer content={sub.solution_latex} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MCQ Questions Preview Cards */}
              {(questionPreviewFilter === 'all' || questionPreviewFilter === 'mcq') && mcqsInWorksheet.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('ws_section_b_title', lang)} ({mcqsInWorksheet.length}টি MCQ • {mcqsInWorksheet.length} নম্বর)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mcqsInWorksheet.map((mcq, mIdx) => {
                      const isSolutionOpen = expandedSolutions[mcq.id];

                      return (
                        <div
                          key={mcq.id}
                          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                {mIdx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {mcq.board && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                                    {mcq.board} {mcq.exam_year}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                  উত্তর: [{mcq.correct_option || 'A'}]
                                </span>
                              </div>
                            </div>

                            <div className="font-bengali text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                              <MathRenderer content={mcq.stem_text} />
                            </div>

                            {/* 4 MCQ Options */}
                            <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bengali">
                              {mcq.mcq_options?.map((opt) => {
                                const isCorrect = opt.key.toUpperCase() === (mcq.correct_option || '').toUpperCase();
                                return (
                                  <div
                                    key={opt.key}
                                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                      isCorrect
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    <span className="w-4 h-4 rounded-full bg-white dark:bg-slate-700 border flex items-center justify-center text-[10px] font-bold">
                                      {opt.key}
                                    </span>
                                    <span className="truncate">{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* MCQ Solution Snippet */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => toggleSolutionExpanded(mcq.id)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>{isSolutionOpen ? (isBn ? 'ব্যাখ্যা লুকান' : 'Hide Explanation') : (isBn ? 'ব্যাখ্যা ও সূত্র দেখুন' : 'View Explanation')}</span>
                            </button>

                            {isSolutionOpen && (
                              <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 font-bengali leading-relaxed border border-slate-200 dark:border-slate-700">
                                <MathRenderer content={mcq.full_solution_latex || 'সরাসরি এনসিটিবি বোর্ড পাঠ্যবই ভিত্তিক সমাধান।'} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: A4 PRINTABLE DOCUMENT CANVAS (HIGH QUALITY PRINT OUTPUT)
          ========================================================================== */}
          {previewTab === 'worksheet' && (
            <div
              id="printable-worksheet"
              className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-300 shadow-sm print:p-0 print:border-none print:shadow-none print:m-0 max-w-4xl mx-auto font-bengali-serif leading-relaxed"
            >
              {/* Header: Institute & Exam Title */}
              <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 space-y-1">
                <h1 className="text-lg sm:text-xl font-bold tracking-wide text-slate-950 font-bengali">
                  {instituteName}
                </h1>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-bengali">{customTitle}</h2>
                <div className="text-sm font-semibold text-slate-800 font-bengali">
                  {t('ws_subject_label', lang)}: {getSubjectDisplayName(subjectId, lang)} {paperId !== 'all' && `(${getPaperDisplayName(paperId, lang)})`}
                </div>

                {/* Time & Marks Bar */}
                <div className="flex items-center justify-between text-xs font-bengali font-semibold pt-2 px-2 text-slate-800">
                  <span>{t('ws_time_label', lang)}: {suggestedTimeMins} {t('ws_minutes', lang)}</span>
                  <span className="font-bold">{t('ws_full_marks', lang)}: {totalMarks}</span>
                </div>
              </div>

              {/* Student Info Box */}
              {includeStudentHeader && (
                <div className="mb-6 p-3 border border-slate-800 rounded-lg text-xs font-bengali grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-bold">{t('ws_student_name', lang)}:</span> ______________________
                  </div>
                  <div>
                    <span className="font-bold">{t('ws_roll_no', lang)}:</span> ______________
                  </div>
                  <div>
                    <span className="font-bold">{t('ws_section', lang)}:</span> _________
                  </div>
                </div>
              )}

              {/* Section A: Creative Questions (CQ) - Rendered ONLY if NOT mcq_only */}
              {cqsInWorksheet.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center font-bengali font-bold text-sm uppercase tracking-wider border-b border-slate-400 pb-1">
                    {mcqsInWorksheet.length > 0 ? t('ws_section_a_title', lang) : (isBn ? 'সৃজনশীল প্রশ্ন (Creative Questions)' : 'Creative Questions (CQ)')} ({isBn ? `মান: ${cqsInWorksheet.length * 10}` : `Marks: ${cqsInWorksheet.length * 10}`})
                  </div>
                  <div className="text-xs text-slate-600 italic font-bengali text-center">
                    {isBn ? '[প্রতিটি প্রশ্নের মান ১০। ক=১, খ=২, গ=৩, ঘ=৪]' : '[Each question carries 10 marks: a=1, b=2, c=3, d=4]'}
                  </div>

                  <div className="space-y-6">
                    {cqsInWorksheet.map((cq, cqIdx) => (
                      <div key={cq.id} className="space-y-3 page-break-inside-avoid">
                        <div className="flex items-start justify-between gap-4">
                          <span className="font-bold font-bengali text-sm text-slate-900">
                            {isBn ? `প্রশ্ন ${cqIdx + 1}.` : `Question ${cqIdx + 1}.`}
                          </span>
                          {cq.board && (
                            <span className="text-[10px] font-bengali px-1.5 py-0.5 border border-slate-300 rounded text-slate-600">
                              [{cq.board} Board {cq.exam_year}]
                            </span>
                          )}
                        </div>

                        {/* Stem */}
                        <div className="pl-4 text-sm leading-relaxed text-slate-900 border-l-2 border-slate-300 font-bengali">
                          <MathRenderer content={cq.stem_text} className="text-slate-900 font-bengali text-sm" />
                        </div>

                        {/* Subparts (a, b, c, d) */}
                        <div className="pl-4 space-y-2 pt-1 text-sm font-bengali">
                          {cq.subparts?.map((sub) => {
                            const label =
                              sub.part_label === 'a'
                                ? '(ক)'
                                : sub.part_label === 'b'
                                ? '(খ)'
                                : sub.part_label === 'c'
                                ? '(গ)'
                                : '(ঘ)';
                            const mark =
                              sub.marks || (sub.part_label === 'a' ? 1 : sub.part_label === 'b' ? 2 : sub.part_label === 'c' ? 3 : 4);

                            return (
                              <div key={sub.id} className="space-y-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="font-bold shrink-0">{label}</span>
                                    <div className="leading-relaxed flex-1">
                                      <MathRenderer content={sub.prompt_text} inline className="text-slate-900 font-bengali text-sm" />
                                    </div>
                                  </div>
                                  <span className="font-bengali font-semibold text-xs text-slate-700 whitespace-nowrap">
                                    {mark}
                                  </span>
                                </div>

                                {/* Ruled lines for workbook layout */}
                                {layoutStyle === 'workbook' && (
                                  <div className="my-3 space-y-2 opacity-60">
                                    {Array.from({ length: mark === 1 ? 2 : mark === 2 ? 4 : 6 }).map(
                                      (_, lineIdx) => (
                                        <div key={lineIdx} className="border-b border-dashed border-slate-300 h-4" />
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section B: Multiple Choice Questions (MCQ) - Rendered ONLY if NOT cq_only */}
              {mcqsInWorksheet.length > 0 && (
                <div className={`space-y-6 ${cqsInWorksheet.length > 0 ? 'pt-8 border-t-2 border-slate-300' : ''}`}>
                  <div className="text-center font-bengali font-bold text-sm uppercase tracking-wider border-b border-slate-400 pb-1">
                    {cqsInWorksheet.length > 0 ? t('ws_section_b_title', lang) : (isBn ? 'বহুনির্বাচনি প্রশ্ন (Multiple Choice Questions)' : 'Multiple Choice Questions (MCQ)')} ({isBn ? `মান: ${mcqsInWorksheet.length * 1}` : `Marks: ${mcqsInWorksheet.length * 1}`})
                  </div>
                  <div className="text-xs text-slate-600 italic font-bengali text-center">
                    {isBn ? '[প্রতিটি প্রশ্নের মান ১। সঠিক উত্তরের বৃত্তটি ভরাট করো]' : '[Each question carries 1 mark. Fill in the correct option bubble]'}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm font-bengali">
                    {mcqsInWorksheet.map((mcq, mIdx) => (
                      <div key={mcq.id} className="space-y-1.5 page-break-inside-avoid">
                        <div className="font-medium text-slate-900 flex items-start gap-1.5">
                          <span className="font-bengali font-bold">{mIdx + 1}.</span>
                          <div className="leading-relaxed flex-1">
                            <MathRenderer content={mcq.stem_text} inline className="text-slate-900 font-bengali text-sm" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-4 text-xs font-bengali">
                          {mcq.mcq_options?.map((opt) => (
                            <div key={opt.key} className="flex items-center gap-1.5">
                              <span className="font-bold">({opt.key.toLowerCase()})</span>
                              <MathRenderer content={opt.text} inline className="text-slate-900 font-bengali text-xs" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Key Grid at bottom (if enabled) */}
              {includeAnswerKey && mcqsInWorksheet.length > 0 && (
                <div className="pt-8 mt-8 border-t-2 border-dashed border-slate-400 page-break-inside-avoid font-bengali">
                  <div className="text-center font-bengali font-bold text-xs uppercase tracking-wider mb-2">
                    {t('ws_mcq_answer_key_title', lang)}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                    {mcqsInWorksheet.map((mcq, mIdx) => (
                      <div
                        key={mcq.id}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-semibold"
                      >
                        {mIdx + 1}: <span className="text-emerald-800 font-bold">{mcq.correct_option || 'A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-bengali">
                HSC Board Exam Master Preparation Worksheet • {instituteName}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: COMPLETE MODEL SOLUTIONS VIEW (FOR TEACHERS / SELF-STUDY)
          ========================================================================== */}
          {previewTab === 'solutions' && (
            <div className="space-y-6 font-bengali bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-center font-bengali font-bold text-base uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 text-emerald-900 dark:text-emerald-300">
                {isBn ? 'অফিশিয়াল মডেল সমাধান ও পূর্ণাঙ্গ মার্কিং রুব্রিক' : 'Official Model Solutions & Marking Rubrics'}
              </div>

              {/* CQ Solutions */}
              {cqsInWorksheet.length > 0 && (
                <div className="space-y-4">
                  {cqsInWorksheet.map((cq, cqIdx) => (
                    <div key={cq.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 page-break-inside-avoid font-bengali">
                      <div className="font-bold font-bengali text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                        {isBn ? `সৃজনশীল প্রশ্ন ${cqIdx + 1} এর পূর্ণাঙ্গ সমাধান` : `Creative Question ${cqIdx + 1} Solution`}
                      </div>

                      <div className="space-y-3 text-xs">
                        {cq.subparts?.map((sub) => (
                          <div key={sub.id} className="space-y-1">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              ({sub.part_label.toUpperCase()}) {sub.prompt_text} ({sub.marks || 1} নম্বর)
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bengali text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                              <MathRenderer content={sub.solution_latex} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MCQ Solutions */}
              {mcqsInWorksheet.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 page-break-inside-avoid font-bengali">
                  <div className="font-bold font-bengali text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1">
                    {isBn ? 'বহুনির্বাচনি প্রশ্নের ব্যাখ্যা ও সমাধান' : 'MCQ Solutions & Explanations'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {mcqsInWorksheet.map((mcq, mIdx) => (
                      <div key={mcq.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {mIdx + 1}. {isBn ? 'সঠিক উত্তর:' : 'Correct:'} <span className="text-emerald-700 dark:text-emerald-400">[{mcq.correct_option}]</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bengali">
                          <MathRenderer content={mcq.full_solution_latex || 'সরাসরি পাঠ্যবই ভিত্তিক উত্তর।'} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: SAVE CONFIG PRESET DIALOG
      ========================================================================== */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Save className="w-5 h-5 text-sky-600" />
                {t('ws_save_config_btn', lang)}
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isBn
                ? 'বর্তমান প্রশ্নের বিষয়, অধ্যায় ও অপশনগুলো প্রিসেট হিসেবে সংরক্ষণ করুন যাতে ভবিষ্যতে এক ক্লিকেই পুনরায় ব্যবহার করতে পারেন।'
                : 'Save your current worksheet filters, counts, and layout as a preset for one-click re-use.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রিসেটের নাম (Preset Name)' : 'Preset Name'}
              </label>
              <input
                type="text"
                value={presetTitleInput}
                onChange={(e) => setPresetTitleInput(e.target.value)}
                placeholder={customTitle || (isBn ? 'যেমন: পদার্থবিজ্ঞান ১ম পত্র - অধ্যায় ২ ও ৪ টেস্ট' : 'e.g. Physics 1st Paper - Dynamics Exam')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>{t('ws_subject_label', lang)}:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{getSubjectDisplayName(subjectId, lang)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('ws_format_label', lang)}:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {questionType === 'mcq_only'
                    ? (isBn ? `শুধুমাত্র ${targetMcqCount}টি MCQ (MCQ Only)` : `Only ${targetMcqCount} MCQs`)
                    : questionType === 'cq_only'
                    ? (isBn ? `শুধুমাত্র ${targetCqCount}টি CQ (CQ Only)` : `Only ${targetCqCount} CQs`)
                    : `${targetCqCount} CQ + ${targetMcqCount} MCQ`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('ws_chapters_label', lang)}:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {selectedChapters.length === 0 ? t('all_chapters', lang) : `${selectedChapters.length} ${isBn ? 'টি অধ্যায়' : 'Chapters'}`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                {t('cancel', lang)}
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('save', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SAVED PRESETS LIST & LOADER
      ========================================================================== */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('ws_saved_presets_btn', lang)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {savedWorksheets.length === 0 ? (
                <div className="text-center py-10 text-slate-500 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">
                    {isBn ? 'এখনো কোনো প্রিসেট সংরক্ষিত হয়নি।' : 'No saved presets yet.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isBn
                      ? 'ওয়ার্কশিট কনফিগার করে ‘কনফিগারেশন সেভ করুন’ বাটনে চাপুন।'
                      : 'Configure options and click "Save Configuration" to save a preset.'}
                  </p>
                </div>
              ) : (
                savedWorksheets.map((ws) => {
                  const isMcqOnly = ws.question_format_filter === 'mcq_only' || (ws.target_cq_count === 0 && (ws.target_mcq_count ?? 0) > 0);
                  const isCqOnly = ws.question_format_filter === 'cq_only' || ((ws.target_cq_count ?? 0) > 0 && ws.target_mcq_count === 0);

                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleLoadConfig(ws)}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-2">
                          <span>{ws.custom_title || (isBn ? 'ওয়ার্কশিট প্রিসেট' : 'Worksheet Preset')}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            {getSubjectDisplayName(ws.subject_id, lang)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isMcqOnly
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              : isCqOnly
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                          }`}>
                            {isMcqOnly
                              ? (isBn ? `MCQ (${ws.target_mcq_count || 10}টি)` : `MCQ Only (${ws.target_mcq_count || 10})`)
                              : isCqOnly
                              ? (isBn ? `CQ (${ws.target_cq_count || 3}টি)` : `CQ Only (${ws.target_cq_count || 3})`)
                              : (isBn ? `${ws.target_cq_count || 3} CQ + ${ws.target_mcq_count || 10} MCQ` : `${ws.target_cq_count || 3} CQ + ${ws.target_mcq_count || 10} MCQ`)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                          <span>
                            {isBn ? 'লেআউট:' : 'Layout:'} {ws.layout_style === 'workbook' ? (isBn ? 'ওয়ার্কবুক' : 'Workbook') : ws.layout_style === 'compact' ? (isBn ? 'কমপ্যাক্ট' : 'Compact') : (isBn ? 'স্ট্যান্ডার্ড' : 'Standard')}
                          </span>
                          {ws.created_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(ws.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                          {t('load', lang)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => ws.id && handleDeleteConfig(ws.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title={t('delete', lang)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{isBn ? `মোট সংরক্ষিত: ${savedWorksheets.length}টি প্রিসেট` : `Total: ${savedWorksheets.length} presets`}</span>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
              >
                {t('close', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
