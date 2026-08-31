import { Question } from '../types';
import {
  CANONICAL_CHAPTERS,
  CANONICAL_PAPERS,
  CANONICAL_SUBJECTS,
} from '../data/canonicalTaxonomy';

export interface SynthesisOptions {
  subjectId: string;
  paperId: string;
  selectedChapters: string[];
  selectedBoard: string;
  questionType: 'both' | 'cq_only' | 'mcq_only';
  targetCqCount: number;
  targetMcqCount: number;
  seed: number;
  baseQuestions: Question[];
}

export interface AiGenerationRequest {
  subjectId: string;
  paperId: string;
  chapters: { id: string; nameBn: string; nameEn: string }[];
  subjectNameBn: string;
  paperNameBn: string;
  cqCount: number;
  mcqCount: number;
  seed: number;
}

/**
 * Generate questions using Gemini AI in a SINGLE batched API call.
 * This sends one request for all CQs + MCQs across all chapters,
 * staying within free-tier rate limits (5 req/min).
 */
export async function generateAiWorksheetQuestions(
  request: AiGenerationRequest
): Promise<{ cqs: Question[]; mcqs: Question[]; error?: string }> {
  const { chapters, subjectId, paperId, subjectNameBn, paperNameBn, cqCount, mcqCount, seed } = request;

  if (chapters.length === 0) {
    return { cqs: [], mcqs: [] };
  }

  try {
    const res = await fetch('/api/gemini/generate-worksheet-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        paperId,
        subjectNameBn,
        paperNameBn,
        chapters,
        cqCount,
        mcqCount,
        seed,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { cqs: [], mcqs: [], error: errData.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const rawCqs = data.cqs || [];
    const rawMcqs = data.mcqs || [];

    // Convert raw CQ responses into Question[]
    const cqs: Question[] = rawCqs.map((raw: any, idx: number) => {
      const chapterId = raw.chapter_id || chapters[idx % chapters.length]?.id || 'unknown';
      const id = `ai_cq_${chapterId}_${seed}_${idx}`;
      return {
        id,
        scope: 'global_official',
        subject_id: subjectId,
        paper_id: paperId,
        chapter_id: chapterId,
        concept_ids: [],
        board: raw.board || 'Dhaka',
        exam_year: raw.year || 2023,
        origin_type: 'board',
        question_format: 'CQ',
        difficulty_tier: 'medium',
        stem_text: raw.stem_text,
        subparts: [
          { id: `${id}_a`, part_label: 'a', cognitive_level: 'knowledge', marks: 1, prompt_text: raw.part_a_prompt, solution_latex: raw.part_a_solution },
          { id: `${id}_b`, part_label: 'b', cognitive_level: 'understanding', marks: 2, prompt_text: raw.part_b_prompt, solution_latex: raw.part_b_solution },
          { id: `${id}_c`, part_label: 'c', cognitive_level: 'application', marks: 3, prompt_text: raw.part_c_prompt, solution_latex: raw.part_c_solution },
          { id: `${id}_d`, part_label: 'd', cognitive_level: 'higher_ability', marks: 4, prompt_text: raw.part_d_prompt, solution_latex: raw.part_d_solution },
        ],
        full_solution_latex: raw.part_a_solution || '',
        is_verified: true,
        created_at: new Date().toISOString(),
      } as Question;
    });

    // Convert raw MCQ responses into Question[]
    const mcqs: Question[] = rawMcqs.map((raw: any, idx: number) => {
      const chapterId = raw.chapter_id || chapters[idx % chapters.length]?.id || 'unknown';
      const id = `ai_mcq_${chapterId}_${seed}_${idx}`;
      return {
        id,
        scope: 'global_official',
        subject_id: subjectId,
        paper_id: paperId,
        chapter_id: chapterId,
        concept_ids: [],
        board: raw.board || 'Dhaka',
        exam_year: raw.year || 2023,
        origin_type: 'board',
        question_format: 'MCQ',
        difficulty_tier: 'medium',
        stem_text: raw.stem_text,
        mcq_options: [
          { key: 'A', text: raw.option_a },
          { key: 'B', text: raw.option_b },
          { key: 'C', text: raw.option_c },
          { key: 'D', text: raw.option_d },
        ],
        correct_option: raw.correct_option || 'A',
        full_solution_latex: raw.solution || '',
        is_verified: true,
        created_at: new Date().toISOString(),
      } as Question;
    });

    return { cqs, mcqs };
  } catch (err) {
    console.error('AI question generation failed:', err);
    return { cqs: [], mcqs: [], error: String(err) };
  }
}

import { generateProceduralWorksheetQuestions } from './proceduralQuestionEngine';

/**
 * Synchronous offline synthesizer: uses existing question bank and
 * procedural generation engine. Works 100% offline with zero latency,
 * generating full CQs and MCQs for ANY selected chapters (Vectors, Dynamics, etc.).
 */
export function synthesizeWorksheetQuestions(options: SynthesisOptions): {
  questions: Question[];
  cqs: Question[];
  mcqs: Question[];
} {
  const {
    subjectId,
    paperId,
    selectedChapters,
    selectedBoard,
    questionType,
    targetCqCount,
    targetMcqCount,
    seed,
    baseQuestions,
  } = options;

  // Determine active chapters
  let activeChapterIds: string[] = [];
  if (selectedChapters.length > 0) {
    activeChapterIds = [...selectedChapters];
  } else {
    activeChapterIds = CANONICAL_CHAPTERS.filter((ch) => {
      const p = CANONICAL_PAPERS.find((paper) => paper.id === ch.paper_id);
      return p?.subject_id === subjectId && (paperId === 'all' || ch.paper_id === paperId);
    }).map((ch) => ch.id);
  }

  // Filter base question bank strictly matching active chapters
  const strictlyFiltered = baseQuestions.filter((q) => {
    if (q.subject_id !== subjectId) return false;
    if (paperId !== 'all' && q.paper_id !== paperId) return false;
    if (activeChapterIds.length > 0 && !activeChapterIds.includes(q.chapter_id)) return false;
    if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
    return true;
  });

  // Deterministic shuffle
  const shuffledBase = [...strictlyFiltered].sort((a, b) => {
    if (seed === 0) return 0;
    const hA = (a.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hB = (b.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hA % 97) - (hB % 97);
  });

  let cqs = shuffledBase.filter((q) => q.question_format === 'CQ');
  let mcqs = shuffledBase.filter((q) => q.question_format === 'MCQ');

  const neededCqs = questionType === 'mcq_only' ? 0 : Math.max(0, targetCqCount - cqs.length);
  const neededMcqs = questionType === 'cq_only' ? 0 : Math.max(0, targetMcqCount - mcqs.length);

  // If static bank doesn't have enough questions for the selected chapter(s),
  // seamlessly generate procedural board-standard questions offline!
  if (neededCqs > 0 || neededMcqs > 0) {
    const procedural = generateProceduralWorksheetQuestions({
      subjectId,
      paperId,
      selectedChapters: activeChapterIds,
      targetCqCount: neededCqs,
      targetMcqCount: neededMcqs,
      seed,
      questionType,
    });
    cqs = [...cqs, ...procedural.cqs];
    mcqs = [...mcqs, ...procedural.mcqs];
  }

  const finalCqs = questionType === 'mcq_only' ? [] : cqs.slice(0, targetCqCount);
  const finalMcqs = questionType === 'cq_only' ? [] : mcqs.slice(0, targetMcqCount);

  let finalQuestions: Question[];
  if (questionType === 'cq_only') {
    finalQuestions = finalCqs;
  } else if (questionType === 'mcq_only') {
    finalQuestions = finalMcqs;
  } else {
    finalQuestions = [...finalCqs, ...finalMcqs];
  }

  return {
    questions: finalQuestions,
    cqs: finalCqs,
    mcqs: finalMcqs,
  };
}

