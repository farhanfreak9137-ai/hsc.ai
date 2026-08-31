import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  BookOpen,
  Search,
  Layers,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Zap,
  Bookmark,
  ExternalLink,
  BookMarked,
  Quote,
} from 'lucide-react';
import { Question, CQSubpart, TextbookRecord, BookSearchResult, AppSettings } from '../types';
import { CANONICAL_CHAPTERS, CANONICAL_SUBJECTS } from '../data/canonicalTaxonomy';
import {
  loadTextbooks,
  addTextbook,
  deleteTextbook,
  searchBookKnowledge,
  loadDocumentChunks,
  saveDocumentChunks,
} from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { Language } from '../services/i18n';

interface IngestionStudioProps {
  selectedSubjectId: string;
  onQuestionAdded: (newQuestion: Question) => void;
  onNavigateToTab: (tab: any) => void;
  settings?: AppSettings;
}

export const IngestionStudio: React.FC<IngestionStudioProps> = ({
  selectedSubjectId,
  onQuestionAdded,
  onNavigateToTab,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';
  // Main Studio Mode: 'books_library' (Full PDF/Book Ingest & AI Search) | 'question_ocr' (Single Question Ingestion)
  const [studioMode, setStudioMode] = useState<'books_library' | 'question_ocr'>('books_library');

  // ----------------------------------------------------
  // Full Book / PDF State
  // ----------------------------------------------------
  const [textbooks, setTextbooks] = useState<TextbookRecord[]>([]);
  const [selectedBook, setSelectedBook] = useState<TextbookRecord | null>(null);
  const [bookUploadFile, setBookUploadFile] = useState<File | null>(null);
  const [bookFileBase64, setBookFileBase64] = useState<string | null>(null);
  const [bookTitleInput, setBookTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [bookSubjectId, setBookSubjectId] = useState(selectedSubjectId || 'phy');
  const [bookPaperId, setBookPaperId] = useState('phy_1');
  const [isIngestingBook, setIsIngestingBook] = useState(false);
  const [bookIngestError, setBookIngestError] = useState('');
  const [bookIngestSuccess, setBookIngestSuccess] = useState(false);

  // Direct Book AI Q&A Engine (RAG)
  const [bookQuery, setBookQuery] = useState('');
  const [isAnalyzingBook, setIsAnalyzingBook] = useState(false);
  const [bookAnalysisResult, setBookAnalysisResult] = useState<{
    book_citation: string;
    exact_book_quote?: string;
    answer_markdown: string;
    page_numbers: number[];
    confidence_score?: number;
    related_board_topics?: string[];
    key_takeaway_bn: string;
  } | null>(null);
  const [instantSearchResults, setInstantSearchResults] = useState<BookSearchResult[]>([]);

  // ----------------------------------------------------
  // Single Question OCR State
  // ----------------------------------------------------
  const [activeInputType, setActiveInputType] = useState<'image' | 'text'>('image');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('phy_1_ch4');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);
  const [stagedQuestion, setStagedQuestion] = useState<Partial<Question> | null>(null);

  useEffect(() => {
    const loaded = loadTextbooks();
    setTextbooks(loaded);
    if (loaded.length > 0) {
      setSelectedBook(loaded[0]);
    }
  }, []);

  const availableChapters = CANONICAL_CHAPTERS.filter((ch) =>
    ch.paper_id.startsWith(selectedSubjectId)
  );

  // ----------------------------------------------------
  // Handlers for Full Book / PDF Ingestion
  // ----------------------------------------------------
  const handleBookFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBookUploadFile(file);
      if (!bookTitleInput) {
        setBookTitleInput(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        setBookFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIngestBookPDF = async () => {
    if (!bookUploadFile && !bookFileBase64) {
      setBookIngestError('অনুগ্রহ করে বইয়ের স্ক্যান করা PDF বা পৃষ্ঠা আপলোড করুন।');
      return;
    }

    setIsIngestingBook(true);
    setBookIngestError('');
    setBookIngestSuccess(false);

    try {
      const res = await fetch('/api/gemini/ingest-book-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: bookFileBase64,
          mimeType: bookUploadFile?.type || 'application/pdf',
          fileName: bookUploadFile?.name || bookTitleInput,
          bookTitle: bookTitleInput || 'HSC Textbook',
          authorName: authorInput || 'Standard NCTB Author',
          subjectId: bookSubjectId,
          paperId: bookPaperId,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        const newBookRecord: TextbookRecord = {
          id: `book_uploaded_${Date.now()}`,
          subject_id: parsed.subject_id || bookSubjectId,
          paper_id: parsed.paper_id || bookPaperId,
          title: parsed.title_bn || bookTitleInput,
          title_en: parsed.title_en || bookTitleInput,
          author: parsed.author || authorInput || 'NCTB Author',
          edition: parsed.edition || '2024 Latest Edition',
          is_official_nctb: false,
          total_pages: parsed.total_pages_estimated || 120,
          summary: parsed.summary || 'স্বয়ংক্রিয়ভাবে ইনজেস্ট ও সূচিপত্র সূচিত করা হয়েছে।',
          chapters: parsed.chapters || [],
          file_name: bookUploadFile?.name,
          uploaded_at: new Date().toISOString(),
        };

        // Save to persistent storage
        const updatedBooks = addTextbook(newBookRecord);
        setTextbooks(updatedBooks);
        setSelectedBook(newBookRecord);

        // Add extracted chunks to Document Chunks index for RAG
        if (Array.isArray(parsed.extracted_chunks)) {
          const currentChunks = loadDocumentChunks();
          const newChunks = parsed.extracted_chunks.map((c: any, i: number) => ({
            id: `chunk_${newBookRecord.id}_${i}`,
            document_title: newBookRecord.title,
            authority_level: 'user_uploaded_scan' as const,
            subject_id: newBookRecord.subject_id,
            paper_id: newBookRecord.paper_id,
            chapter_id: `${newBookRecord.paper_id}_ch1`,
            concept_ids: [],
            page_number: c.page_number || 1,
            section_title: c.section_title || 'অধ্যায় সারাংশ',
            content_text: c.content_text || '',
            formula_latex: c.formula_latex,
          }));
          saveDocumentChunks([...newChunks, ...currentChunks]);
        }

        setBookIngestSuccess(true);
        setBookUploadFile(null);
        setBookFileBase64(null);
        setBookTitleInput('');
        setAuthorInput('');
      } else {
        setBookIngestError(data.error || 'পিডিএফ প্রসেসিং ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      console.error('Book ingestion failed:', err);
      setBookIngestError('সার্ভার রিকোয়েস্টে ত্রুটি হয়েছে।');
    } finally {
      setIsIngestingBook(false);
    }
  };

  const handleSearchAndAnalyzeBook = async () => {
    if (!bookQuery.trim()) return;

    setIsAnalyzingBook(true);
    setBookAnalysisResult(null);

    // 1. Local chunk search
    const localMatches = searchBookKnowledge(bookQuery, {
      subjectId: selectedSubjectId,
    });
    setInstantSearchResults(localMatches);

    // 2. Deep Gemini RAG Analysis against the uploaded book pages
    try {
      const res = await fetch('/api/gemini/analyze-book-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionQuery: bookQuery,
          subjectHint: selectedSubjectId,
          uploadedBookContext: selectedBook
            ? {
                title: selectedBook.title,
                author: selectedBook.author,
                chapters: selectedBook.chapters,
              }
            : null,
          matchedChunks: localMatches,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setBookAnalysisResult(data.data);
      }
    } catch (e) {
      console.error('Book analysis query error:', e);
    } finally {
      setIsAnalyzingBook(false);
    }
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('আপনি কি এই বইটি লাইব্রেরি থেকে মুছতে চান?')) {
      const updated = deleteTextbook(id);
      setTextbooks(updated);
      if (selectedBook?.id === id) {
        setSelectedBook(updated[0] || null);
      }
    }
  };

  // ----------------------------------------------------
  // Handlers for Single Question OCR
  // ----------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOCR = async () => {
    if (!imageBase64 && !rawText.trim()) {
      setErrorMessage('অনুগ্রহ করে একটি ছবি আপলোড করুন অথবা প্রশ্ন টেক্সট পেস্ট করুন।');
      return;
    }

    setIsExtracting(true);
    setErrorMessage('');
    setSuccessNotice(false);

    try {
      const currentChapter = CANONICAL_CHAPTERS.find((ch) => ch.id === selectedChapterId);
      const res = await fetch('/api/gemini/extract-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mimeType: imageBase64 ? 'image/jpeg' : undefined,
          rawText: rawText,
          subjectHint: selectedSubjectId,
          chapterHint: currentChapter?.name_bn,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const ext = data.data;
        const mappedSubparts: CQSubpart[] = ext.subparts
          ? ext.subparts.map((s: any, i: number) => ({
              id: `sub_${Date.now()}_${i}`,
              part_label: s.part_label || (['a', 'b', 'c', 'd'][i] as any),
              cognitive_level: s.cognitive_level || 'knowledge',
              marks: s.marks || (i === 0 ? 1 : i === 1 ? 2 : i === 2 ? 3 : 4),
              prompt_text: s.prompt_text,
              concept_ids: [],
              solution_latex: s.solution_latex || '',
            }))
          : undefined;

        setStagedQuestion({
          id: `q_custom_${Date.now()}`,
          scope: 'user_custom',
          subject_id: ext.subject_id || selectedSubjectId,
          paper_id: ext.paper_id || `${selectedSubjectId}_1`,
          chapter_id: selectedChapterId,
          concept_ids: [],
          board: ext.board || 'Dhaka',
          exam_year: ext.exam_year || 2024,
          origin_type: 'custom',
          question_format: (ext.question_format as any) || 'CQ',
          difficulty_tier: (ext.difficulty_tier as any) || 'medium',
          stem_text: ext.stem_text || '',
          subparts: mappedSubparts,
          mcq_options: ext.mcq_options,
          correct_option: ext.correct_option,
          full_solution_latex: ext.full_solution_latex || '',
          is_verified: true,
          created_at: new Date().toISOString(),
        });
      } else {
        setErrorMessage(data.error || 'প্রশ্ন স্ট্রাকচার করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setErrorMessage('সার্ভার রিকোয়েস্ট ব্যর্থ হয়েছে।');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommitQuestion = () => {
    if (!stagedQuestion || !stagedQuestion.stem_text) return;

    const finalQuestion: Question = {
      id: stagedQuestion.id || `q_custom_${Date.now()}`,
      scope: 'user_custom',
      subject_id: stagedQuestion.subject_id || selectedSubjectId,
      paper_id: stagedQuestion.paper_id || `${selectedSubjectId}_1`,
      chapter_id: stagedQuestion.chapter_id || selectedChapterId,
      concept_ids: stagedQuestion.concept_ids || [],
      board: stagedQuestion.board || 'Dhaka',
      exam_year: stagedQuestion.exam_year || 2024,
      origin_type: 'custom',
      question_format: stagedQuestion.question_format || 'CQ',
      difficulty_tier: stagedQuestion.difficulty_tier || 'medium',
      stem_text: stagedQuestion.stem_text,
      subparts: stagedQuestion.subparts,
      mcq_options: stagedQuestion.mcq_options,
      correct_option: stagedQuestion.correct_option,
      full_solution_latex: stagedQuestion.full_solution_latex || '',
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    onQuestionAdded(finalQuestion);
    setSuccessNotice(true);
    setStagedQuestion(null);
    setImageBase64(null);
    setRawText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header with Mode Switching */}
      <div className="glass-panel p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                AI Multimodal & Book RAG Engine
              </span>
              <span className="text-xs text-slate-500 font-bengali">
                বইয়ের স্ক্যান ও প্রশ্ন ইনজেকশন
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-bengali mt-1">
              {studioMode === 'books_library'
                ? '📚 স্ক্যান করা বই ও পিডিএফ লাইব্রেরি (RAG Analyzer)'
                : '📝 একক বোর্ড প্রশ্ন ও টেস্ট পেপার স্ক্যানার'}
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setStudioMode('books_library')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-bengali transition-all ${
                studioMode === 'books_library'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>বই ও পিডিএফ লাইব্রেরি</span>
            </button>
            <button
              onClick={() => setStudioMode('question_ocr')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-bengali transition-all ${
                studioMode === 'question_ocr'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>একক প্রশ্ন ইনজেকশন</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODE 1: FULL BOOK & PDF INGESTION / RAG ANALYZER */}
      {/* ==================================================== */}
      {studioMode === 'books_library' && (
        <div className="space-y-6">
          {/* Top Banner: Direct Book Search / Ask Uploaded Book */}
          <div className="glass-panel p-5 rounded-2xl shadow-sm border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white font-bengali text-base">
                    আপলোড করা বই থেকে সরাসরি উত্তর ও পৃষ্ঠা রেফারেন্স খুঁজুন
                  </h3>
                  <p className="text-xs text-slate-500 font-bengali">
                    এআই ইন্টারনেটের বদলে সরাসরি আপনার আপলোড করা বই ও এনসিটিবি টেক্সটবুকের পৃষ্ঠা বিশ্লেষণ করে সূত্রসহ উত্তর দেবে
                  </p>
                </div>
              </div>
            </div>

            {/* Book Query Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAnalyzeBook()}
                  placeholder="বই থেকে যেকোনো প্রশ্ন বা থিওরি লিখুন... (যেমন: জড়তার ভ্রামকের লম্ব অক্ষ উপপাদ্য, ২ এর পরিপূরক, অপরিচিতা)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
              <button
                onClick={handleSearchAndAnalyzeBook}
                disabled={isAnalyzingBook || !bookQuery.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 font-bengali flex items-center justify-center gap-2 shrink-0"
              >
                {isAnalyzingBook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>বই বিশ্লেষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-slate-950" />
                    <span>বই থেকে উত্তর বের করো</span>
                  </>
                )}
              </button>
            </div>

            {/* Book Analysis Deep Result */}
            {bookAnalysisResult && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-emerald-300 dark:border-emerald-800 space-y-3 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-bengali">
                    <BookMarked className="w-4 h-4 text-emerald-600" />
                    <span>সাইটেশন: {bookAnalysisResult.book_citation}</span>
                  </div>
                  {bookAnalysisResult.page_numbers.length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-[11px] font-mono font-bold">
                      পৃষ্ঠা: {bookAnalysisResult.page_numbers.join(', ')}
                    </span>
                  )}
                </div>

                {/* Exact Book Quotation */}
                {bookAnalysisResult.exact_book_quote && (
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl text-xs font-bengali text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                      <Quote className="w-3.5 h-3.5" />
                      <span>বইয়ের সরাসরি উদ্ধৃতি:</span>
                    </div>
                    <p className="italic">{bookAnalysisResult.exact_book_quote}</p>
                  </div>
                )}

                {/* Analytical Explanation */}
                <div className="font-bengali text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <MathRenderer content={bookAnalysisResult.answer_markdown} />
                </div>

                {/* Key Takeaway & Traps */}
                {bookAnalysisResult.key_takeaway_bn && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs font-bengali text-slate-700 dark:text-slate-300 flex items-start gap-2 border border-slate-200 dark:border-slate-800">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>বোর্ড পরীক্ষার টিপ:</strong> {bookAnalysisResult.key_takeaway_bn}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid Layout: Upload New Book PDF vs Book Library Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Upload Scanned Book Form (5 cols) */}
            <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-bengali flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  <span>নতুন বই বা স্ক্যান করা অধ্যায় আপলোড</span>
                </h3>
                <p className="text-xs text-slate-500 font-bengali">
                  সম্পূর্ণ টেক্সটবুক বা স্ক্যান করা চ্যাপ্টার PDF যুক্ত করুন
                </p>
              </div>

              {/* Subject & Paper Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                    বিষয়:
                  </label>
                  <select
                    value={bookSubjectId}
                    onChange={(e) => {
                      setBookSubjectId(e.target.value);
                      setBookPaperId(`${e.target.value}_1`);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CANONICAL_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                    পত্র:
                  </label>
                  <select
                    value={bookPaperId}
                    onChange={(e) => setBookPaperId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={`${bookSubjectId}_1`}>১ম পত্র</option>
                    <option value={`${bookSubjectId}_2`}>২য় পত্র</option>
                  </select>
                </div>
              </div>

              {/* Title & Author Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                  বইয়ের নাম (Title):
                </label>
                <input
                  type="text"
                  value={bookTitleInput}
                  onChange={(e) => setBookTitleInput(e.target.value)}
                  placeholder="যেমন: উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ১ম পত্র"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                  লেখক / প্রকাশক (Author):
                </label>
                <input
                  type="text"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  placeholder="যেমন: ড. শাহজাহান তপন / এনসিটিবি"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* PDF Dropzone */}
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-bengali">
                    {bookUploadFile ? bookUploadFile.name : 'বইয়ের স্ক্যান করা PDF বা ছবি ড্রপ করুন'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG সাপোর্টেড</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleBookFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {bookIngestError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bengali flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  {bookIngestError}
                </div>
              )}

              {bookIngestSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-bengali flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  বইটি সফলভাবে ইনজেস্ট ও ইনডেক্স করা হয়েছে!
                </div>
              )}

              <button
                onClick={handleIngestBookPDF}
                disabled={isIngestingBook || (!bookUploadFile && !bookFileBase64)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 font-bengali"
              >
                {isIngestingBook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>এআই দিয়ে বই ইনডেক্স করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>বই ইনজেস্ট ও ইনডেক্স করুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Available Books & Table of Contents (7 cols) */}
            <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-bengali">
                    ইনডেক্সকৃত টেক্সটবুক সমূহ ({textbooks.length} টি বই)
                  </h3>
                  <p className="text-xs text-slate-500 font-bengali">
                    এনসিটিবি অনুমোদিত ও আপনার আপলোড করা বইয়ের অধ্যায় সূচি
                  </p>
                </div>
              </div>

              {/* Book Select Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {textbooks.map((b) => {
                  const isSelected = selectedBook?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBook(b)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="font-bengali">{b.title}</span>
                      {b.is_official_nctb && (
                        <span className="text-[9px] px-1 bg-emerald-400 text-slate-950 rounded font-bold">
                          NCTB
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Book Details & Chapter Index */}
              {selectedBook && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white font-bengali">
                          {selectedBook.title}
                        </h4>
                        <span className="text-xs text-slate-500 font-bengali">
                          ({selectedBook.author})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bengali mt-0.5">
                        {selectedBook.summary || 'বোর্ড পরীক্ষার উচ্চফলনশীল কনসেপ্ট সংবলিত'}
                      </p>
                    </div>

                    {!selectedBook.is_official_nctb && (
                      <button
                        onClick={() => handleDeleteBook(selectedBook.id)}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold font-bengali flex items-center gap-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>

                  {/* Chapters List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali">
                      অধ্যায় সূচি ও পৃষ্ঠা রেঞ্জ ({selectedBook.chapters.length} টি অধ্যায়):
                    </h5>
                    {selectedBook.chapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white font-bengali">
                            অধ্যায় {ch.chapter_number}: {ch.title_bn}
                          </span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                            পৃষ্ঠা {ch.start_page} - {ch.end_page}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bengali line-clamp-2">
                          {ch.summary_text}
                        </p>

                        {ch.key_topics && ch.key_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ch.key_topics.map((t, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bengali"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: SINGLE QUESTION OCR & INGESTION WORKSPACE */}
      {/* ==================================================== */}
      {studioMode === 'question_ocr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Question Ingestion Input (5 cols) */}
          <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-bengali">
                ১. সোর্স উপাদান প্রদান করুন
              </h3>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveInputType('image')}
                  className={`px-2.5 py-1 rounded-lg font-semibold font-bengali transition-all ${
                    activeInputType === 'image'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ছবি আপলোড
                </button>
                <button
                  onClick={() => setActiveInputType('text')}
                  className={`px-2.5 py-1 rounded-lg font-semibold font-bengali transition-all ${
                    activeInputType === 'text'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  টেক্সট পেস্ট
                </button>
              </div>
            </div>

            {/* Chapter Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                অধ্যায় নির্বাচন (ট্যাগিং সহায়তা):
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.chapter_number}ম অধ্যায়: {ch.name_bn}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Area */}
            {activeInputType === 'image' ? (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-bengali">
                    বোর্ড প্রশ্ন বা টেস্ট পেপারের ছবি ড্রপ করুন
                  </span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG সাপোর্টেড</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {imageBase64 && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={imageBase64}
                      alt="Uploaded Question"
                      className="w-full max-h-48 object-cover"
                    />
                    <button
                      onClick={() => setImageBase64(null)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali">
                  প্রশ্ন ও সমাধান টেক্সট পেস্ট করুন:
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={8}
                  placeholder="যেমন: উদ্দীপক: একটি বৈদ্যুতিক পাখার জড়তার ভ্রামক... (ক) কৌণিক ভরবেগ কাকে বলে?..."
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bengali flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleRunOCR}
              disabled={isExtracting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 font-bengali"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>এআই স্ট্রাকচার তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>এআই দিয়ে এক্সট্র্যাক্ট করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Extracted Review & Validation Workspace (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-bengali">
                  ২. যাচাইকরণ ও ডেটাবেজ সেভ
                </h3>
                <p className="text-xs text-slate-500 font-bengali">
                  স্বয়ংক্রিয়ভাবে ফর্মুলা ও সাবপার্ট (ক, খ, গ, ঘ) ম্যাপিং হয়েছে
                </p>
              </div>

              {stagedQuestion && (
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-lg font-bengali">
                  রেডি টু সেভ
                </span>
              )}
            </div>

            {successNotice && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-950 dark:text-emerald-100 text-sm font-bengali flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>প্রশ্নটি সফলভাবে প্রশ্ন ভান্ডারে যুক্ত হয়েছে!</span>
                </div>
                <button
                  onClick={() => onNavigateToTab('questions')}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  প্রশ্ন ভান্ডারে দেখুন
                </button>
              </div>
            )}

            {!stagedQuestion ? (
              <div className="text-center py-16 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bengali space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm">বামের প্যানেল থেকে প্রশ্ন ইনপুট দিয়ে এক্সট্র্যাক্ট চাপুন</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stem Preview / Edit */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali">
                    উদ্দীপক (Stem in LaTeX):
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bengali text-sm text-slate-800 dark:text-slate-200">
                    <MathRenderer content={stagedQuestion.stem_text || ''} />
                  </div>
                </div>

                {/* Subparts Preview */}
                {stagedQuestion.subparts && (
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali">
                      সাবপার্টসমূহ (a, b, c, d):
                    </label>
                    {stagedQuestion.subparts.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                            ({sub.part_label})
                          </span>
                          <span>
                            {sub.cognitive_level} • [{sub.marks} Mark]
                          </span>
                        </div>
                        <div className="font-bengali text-slate-800 dark:text-slate-200">
                          <MathRenderer content={sub.prompt_text} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Full Solution Preview */}
                {stagedQuestion.full_solution_latex && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali">
                      যাচাইকৃত সমাধান (LaTeX):
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-mono-math text-xs text-slate-800 dark:text-slate-200">
                      <MathRenderer content={stagedQuestion.full_solution_latex} />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setStagedQuestion(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors font-bengali"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    onClick={handleCommitQuestion}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 font-bengali flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>প্রশ্ন ভান্ডারে সেভ করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
