import {
  Question,
  DocumentChunk,
  StudentAttempt,
  MistakePattern,
  UserConceptMastery,
  SmartStudySprint,
  ExamEvaluationRecord,
  WorksheetConfig,
  UserProfile,
  AppSettings,
  TextbookRecord,
  BookSearchResult,
} from '../types';
import {
  PRESEEDED_QUESTIONS,
  PRESEEDED_DOCUMENT_CHUNKS,
  CANONICAL_CONCEPTS,
  CANONICAL_CHAPTERS,
} from '../data/canonicalTaxonomy';
import { COLLEGE_TEST_QUESTIONS } from '../data/collegeTestPapersData';
import { PRESEEDED_TEXTBOOKS } from '../data/preseededTextbooks';
import { evaluateMasteryTransition } from './masteryEngine';
import { calculateConceptPriority } from './priorityEngine';

const STORAGE_KEYS = {
  QUESTIONS: 'hsc_study_questions_v1',
  DOCUMENT_CHUNKS: 'hsc_study_chunks_v1',
  STUDENT_ATTEMPTS: 'hsc_study_attempts_v1',
  MISTAKE_PATTERNS: 'hsc_study_mistakes_v1',
  USER_MASTERY: 'hsc_study_mastery_v1',
  STUDY_SPRINTS: 'hsc_study_sprints_v1',
  EXAM_HISTORY: 'hsc_study_exam_history_v1',
  SAVED_WORKSHEETS: 'hsc_study_saved_worksheets_v1',
  USER_PROFILE: 'hsc_study_user_profile_v1',
  APP_SETTINGS: 'hsc_study_app_settings_v1',
  TEXTBOOKS: 'hsc_study_textbooks_v1',
};

const ALL_DEFAULT_QUESTIONS = [...PRESEEDED_QUESTIONS, ...COLLEGE_TEST_QUESTIONS];

// Initial state helpers
export function loadQuestions(): Question[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (saved) {
      const parsed: Question[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with all default questions to ensure newly added taxonomy questions are included
        const existingIds = new Set(parsed.map((q) => q.id));
        let hasNew = false;
        const merged = [...parsed];
        for (const pq of ALL_DEFAULT_QUESTIONS) {
          if (!existingIds.has(pq.id)) {
            merged.push(pq);
            hasNew = true;
          }
        }
        if (hasNew) {
          saveQuestions(merged);
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load questions from storage', e);
  }
  saveQuestions(ALL_DEFAULT_QUESTIONS);
  return ALL_DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: Question[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Failed to save questions', e);
  }
}

export function loadDocumentChunks(): DocumentChunk[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENT_CHUNKS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load document chunks', e);
  }
  saveDocumentChunks(PRESEEDED_DOCUMENT_CHUNKS);
  return PRESEEDED_DOCUMENT_CHUNKS;
}

export function saveDocumentChunks(chunks: DocumentChunk[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_CHUNKS, JSON.stringify(chunks));
  } catch (e) {
    console.error('Failed to save document chunks', e);
  }
}

export function loadStudentAttempts(): StudentAttempt[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_ATTEMPTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load attempts', e);
  }
  return [];
}

export function saveStudentAttempts(attempts: StudentAttempt[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ATTEMPTS, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save attempts', e);
  }
}

export function loadMistakePatterns(): MistakePattern[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MISTAKE_PATTERNS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load mistakes', e);
  }
  return [];
}

export function saveMistakePatterns(mistakes: MistakePattern[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKE_PATTERNS, JSON.stringify(mistakes));
  } catch (e) {
    console.error('Failed to save mistakes', e);
  }
}

export function loadUserMastery(): Record<string, UserConceptMastery> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_MASTERY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load mastery', e);
  }
  // Initialize default mastery for canonical concepts
  const initialMastery: Record<string, UserConceptMastery> = {};
  CANONICAL_CONCEPTS.forEach((c) => {
    initialMastery[c.id] = {
      concept_id: c.id,
      mastery_state: 'unseen',
      total_attempts: 0,
      successful_attempts: 0,
      accuracy_rate: 0,
      distinct_variants_solved: 0,
      distinct_practice_days: 0,
      retention_decay_factor: 1.0,
      priority_score: 70,
    };
  });
  return initialMastery;
}

export function saveUserMastery(mastery: Record<string, UserConceptMastery>) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_MASTERY, JSON.stringify(mastery));
  } catch (e) {
    console.error('Failed to save mastery', e);
  }
}

export function loadStudySprints(): SmartStudySprint[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDY_SPRINTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load study sprints', e);
  }
  return [];
}

export function saveStudySprints(sprints: SmartStudySprint[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDY_SPRINTS, JSON.stringify(sprints));
  } catch (e) {
    console.error('Failed to save sprints', e);
  }
}

/**
 * Atomic attempt submission: records attempt, aggregates mistake patterns, and recalculates mastery & priority
 */
export function recordStudentAttempt(
  attempt: Omit<StudentAttempt, 'id' | 'created_at'>
): {
  attempt: StudentAttempt;
  updatedMastery: UserConceptMastery;
  newMistake?: MistakePattern;
} {
  const attempts = loadStudentAttempts();
  const mistakes = loadMistakePatterns();
  const masteryMap = loadUserMastery();

  const newAttempt: StudentAttempt = {
    ...attempt,
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };

  attempts.push(newAttempt);
  saveStudentAttempts(attempts);

  // Error Intelligence Aggregation
  let recordedMistake: MistakePattern | undefined = undefined;
  if (!newAttempt.is_correct && newAttempt.evaluation.error_category) {
    const errorCat = newAttempt.evaluation.error_category;
    const existingIndex = mistakes.findIndex(
      (m) => m.concept_id === newAttempt.concept_id && m.error_category === errorCat
    );

    const conceptObj = CANONICAL_CONCEPTS.find((c) => c.id === newAttempt.concept_id);

    if (existingIndex >= 0) {
      mistakes[existingIndex].occurrence_count += 1;
      mistakes[existingIndex].last_occurred_at = new Date().toISOString();
      mistakes[existingIndex].is_rectified = false;
      mistakes[existingIndex].root_cause_explanation = newAttempt.evaluation.corrective_advice_bn;
      recordedMistake = mistakes[existingIndex];
    } else {
      recordedMistake = {
        id: `mstk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        concept_id: newAttempt.concept_id,
        concept_name_bn: conceptObj?.name_bn || 'টপিক',
        concept_name_en: conceptObj?.name_en || 'Concept',
        chapter_id: conceptObj?.chapter_id || '',
        subject_id: conceptObj?.subject_id || '',
        error_category: errorCat,
        signature_title: getErrorCategoryTitle(errorCat),
        root_cause_explanation: newAttempt.evaluation.corrective_advice_bn,
        occurrence_count: 1,
        is_rectified: false,
        last_occurred_at: new Date().toISOString(),
        next_spaced_review_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        example_question_id: newAttempt.question_id,
      };
      mistakes.push(recordedMistake);
    }
    saveMistakePatterns(mistakes);
  }

  // Update Mastery
  const conceptAttempts = attempts.filter((a) => a.concept_id === newAttempt.concept_id);
  const conceptMistakes = mistakes.filter((m) => m.concept_id === newAttempt.concept_id);
  const transition = evaluateMasteryTransition(
    masteryMap[newAttempt.concept_id],
    conceptAttempts,
    conceptMistakes,
    newAttempt.concept_id
  );

  const conceptObj = CANONICAL_CONCEPTS.find((c) => c.id === newAttempt.concept_id);
  const chapterObj = CANONICAL_CHAPTERS.find((ch) => ch.id === conceptObj?.chapter_id);

  const updatedMastery: UserConceptMastery = {
    concept_id: newAttempt.concept_id,
    mastery_state: transition.mastery_state,
    total_attempts: transition.total_attempts,
    successful_attempts: transition.successful_attempts,
    accuracy_rate: transition.accuracy_rate,
    distinct_variants_solved: transition.distinct_variants_solved,
    distinct_practice_days: transition.distinct_practice_days,
    solved_archetype_ids: transition.solved_archetype_ids,
    cognitive_coverage_ratio: transition.cognitive_coverage_ratio,
    last_studied_at: new Date().toISOString(),
    last_tested_at: new Date().toISOString(),
    retention_decay_factor: 1.0,
    priority_score: 50,
  };

  if (conceptObj) {
    const priorityBreakdown = calculateConceptPriority(
      conceptObj,
      chapterObj,
      updatedMastery,
      mistakes
    );
    updatedMastery.priority_score = priorityBreakdown.priority_score;
  }

  masteryMap[newAttempt.concept_id] = updatedMastery;
  saveUserMastery(masteryMap);

  return {
    attempt: newAttempt,
    updatedMastery,
    newMistake: recordedMistake,
  };
}

export function markMistakeRectified(mistakeId: string): MistakePattern | undefined {
  const mistakes = loadMistakePatterns();
  const target = mistakes.find((m) => m.id === mistakeId);
  if (target) {
    target.is_rectified = true;
    saveMistakePatterns(mistakes);
  }
  return target;
}

export function getErrorCategoryTitle(category: string): string {
  switch (category) {
    case 'calculation_slip':
      return 'গণনা ও রূপান্তরের ভুল (Calculation Slip)';
    case 'formula_amnesia':
      return 'সূত্র প্রয়োগে বিভ্রান্তি (Formula Amnesia)';
    case 'conceptual_misconception':
      return 'মৌলিক ধারণাগত অসঙ্গতি (Conceptual Misconception)';
    case 'wrong_method':
      return 'ভুল পদ্ধতি বা সমীকরণ নির্বাচন (Wrong Method)';
    case 'incomplete_reasoning':
      return 'অসম্পূর্ণ ধাপ বা যুক্তি (Incomplete Reasoning)';
    case 'unit_error':
      return 'একক রূপান্তরের ত্রুটি (Unit Error)';
    case 'sign_error':
      return 'দিক ও ধনাত্মক/ঋণাত্মক চিহ্নের ভুল (Sign Error)';
    case 'misread_question':
      return 'উদ্দীপক পাঠে অসতর্কতা (Misread Question)';
    default:
      return 'ত্রুটি (Error)';
  }
}

export function recordManualMistake(
  mistakeData: Omit<MistakePattern, 'id' | 'last_occurred_at' | 'next_spaced_review_due'>
): MistakePattern {
  const mistakes = loadMistakePatterns();
  const newMistake: MistakePattern = {
    ...mistakeData,
    id: `mstk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    last_occurred_at: new Date().toISOString(),
    next_spaced_review_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  mistakes.unshift(newMistake);
  saveMistakePatterns(mistakes);
  return newMistake;
}

export function loadExamHistory(): ExamEvaluationRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load exam history', e);
  }
  return [];
}

export function saveExamResult(result: ExamEvaluationRecord): ExamEvaluationRecord[] {
  try {
    const history = loadExamHistory();
    const updated = [result, ...history];
    localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save exam result', e);
    return [];
  }
}

export function deleteExamResult(examId: string): ExamEvaluationRecord[] {
  try {
    const history = loadExamHistory().filter((e) => e.id !== examId);
    localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.error('Failed to delete exam result', e);
    return [];
  }
}

export function loadSavedWorksheets(): WorksheetConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_WORKSHEETS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load worksheets', e);
  }
  return [];
}

export function saveWorksheetConfig(config: WorksheetConfig): WorksheetConfig[] {
  try {
    const list = loadSavedWorksheets();
    const filtered = list.filter((w) => w.id !== config.id);
    const updated = [config, ...filtered];
    localStorage.setItem(STORAGE_KEYS.SAVED_WORKSHEETS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save worksheet config', e);
    return [];
  }
}

export function deleteSavedWorksheet(worksheetId: string): WorksheetConfig[] {
  try {
    const list = loadSavedWorksheets();
    const updated = list.filter((w) => w.id !== worksheetId);
    localStorage.setItem(STORAGE_KEYS.SAVED_WORKSHEETS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete saved worksheet', e);
    return [];
  }
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'student_main',
  name: 'ফারহান আহমেদ',
  avatar_id: 'scholar',
  current_class: 'hsc_2nd',
  age: 17,
  target_exam_batch: 'HSC 2025',
  target_track: 'engineering',
  institution_name: 'ঢাকা কলেজ / নটর ডেম কলেজ',
  education_board: 'Dhaka',
  daily_study_goal_hours: 4,
  daily_question_target: 20,
  dream_institution: 'BUET / ঢাকা বিশ্ববিদ্যালয়',
  bio_motto: 'লক্ষ্য স্থির, প্রস্তুতি নিখুঁত — ইনশাআল্লাহ সফল হব।',
  strong_subject_ids: ['phy', 'hmath'],
  weak_subject_ids: ['chem'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function loadUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (saved) {
      return { ...DEFAULT_USER_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load user profile', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  try {
    const updated = { ...profile, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save user profile', e);
    return profile;
  }
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'bn',
  sound_effects: true,
  auto_timer_alerts: true,
  font_preference: 'sans',
  default_exam_mode: 'combo_board',
  default_worksheet_layout: 'standard',
};

export function loadAppSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (saved) {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load app settings', e);
  }
  return DEFAULT_APP_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): AppSettings {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save app settings', e);
  }
  return settings;
}

// ----------------------------------------------------
// Textbook & Scanned PDF Ingestion Management
// ----------------------------------------------------

export function loadTextbooks(): TextbookRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TEXTBOOKS);
    if (saved) {
      const parsed: TextbookRecord[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with preseeded textbooks if any are missing
        const existingIds = new Set(parsed.map((b) => b.id));
        let hasNew = false;
        const merged = [...parsed];
        for (const pt of PRESEEDED_TEXTBOOKS) {
          if (!existingIds.has(pt.id)) {
            merged.push(pt);
            hasNew = true;
          }
        }
        if (hasNew) {
          saveTextbooks(merged);
        }
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load textbooks', e);
  }
  saveTextbooks(PRESEEDED_TEXTBOOKS);
  return PRESEEDED_TEXTBOOKS;
}

export function saveTextbooks(books: TextbookRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXTBOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save textbooks', e);
  }
}

export function addTextbook(book: TextbookRecord): TextbookRecord[] {
  const books = loadTextbooks();
  const updated = [book, ...books.filter((b) => b.id !== book.id)];
  saveTextbooks(updated);
  return updated;
}

export function deleteTextbook(bookId: string): TextbookRecord[] {
  const books = loadTextbooks();
  const updated = books.filter((b) => b.id !== bookId);
  saveTextbooks(updated);
  return updated;
}

export function searchBookKnowledge(
  query: string,
  options?: {
    subjectId?: string;
    paperId?: string;
    chapterId?: string;
  }
): BookSearchResult[] {
  const chunks = loadDocumentChunks();
  const textbooks = loadTextbooks();
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);

  const results: BookSearchResult[] = [];

  for (const chunk of chunks) {
    if (options?.subjectId && chunk.subject_id !== options.subjectId) continue;
    if (options?.paperId && chunk.paper_id !== options.paperId) continue;
    if (options?.chapterId && chunk.chapter_id !== options.chapterId) continue;

    const textToMatch = `${chunk.document_title} ${chunk.section_title} ${chunk.content_text} ${chunk.formula_latex || ''}`.toLowerCase();
    
    let matchScore = 0;
    for (const word of queryWords) {
      if (textToMatch.includes(word)) {
        matchScore += 1;
      }
    }

    if (matchScore > 0 || queryWords.length === 0) {
      const parentBook = textbooks.find(b => b.title === chunk.document_title || b.subject_id === chunk.subject_id);
      
      results.push({
        book_id: parentBook?.id || 'book_custom',
        book_title: chunk.document_title,
        page_number: chunk.page_number,
        chapter_title: chunk.section_title,
        relevance_score: Math.min(1, (matchScore / (queryWords.length || 1)) * 0.9 + 0.1),
        snippet_text: chunk.content_text.slice(0, 300) + (chunk.content_text.length > 300 ? '...' : ''),
        highlighted_terms: queryWords.filter(w => textToMatch.includes(w)),
        formula_latex: chunk.formula_latex
      });
    }
  }

  // Sort by highest relevance score
  return results.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 8);
}

