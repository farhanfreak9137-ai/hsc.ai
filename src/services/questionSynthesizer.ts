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
  existingStems?: string[];
}

/**
 * Call the Gemini-powered API to generate real questions for a chapter
 */
async function fetchAiQuestions(
  chapterId: string,
  chapterNameBn: string,
  chapterNameEn: string,
  subjectId: string,
  paperId: string,
  subjectNameBn: string,
  paperNameBn: string,
  questionFormat: 'MCQ' | 'CQ',
  count: number,
  seed: number,
  existingStems: string[] = []
): Promise<Question[]> {
  try {
    const res = await fetch('/api/gemini/generate-worksheet-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        paperId,
        chapterId,
        chapterNameBn,
        chapterNameEn,
        subjectNameBn,
        paperNameBn,
        questionFormat,
        count,
        seed,
        existingStems,
      }),
    });

    if (!res.ok) {
      console.error('AI generation failed:', res.status);
      return [];
    }

    const data = await res.json();
    const rawQuestions = data.questions || [];

    // Convert raw AI response into Question[] format
    return rawQuestions.map((raw: any, idx: number) => {
      const board = raw.board || 'Dhaka';
      const year = raw.year || 2023;
      const id = `ai_${questionFormat.toLowerCase()}_${chapterId}_${seed}_${idx}`;

      if (questionFormat === 'MCQ') {
        return {
          id,
          scope: 'global_official',
          subject_id: subjectId,
          paper_id: paperId,
          chapter_id: chapterId,
          concept_ids: [],
          board,
          exam_year: year,
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
      } else {
        return {
          id,
          scope: 'global_official',
          subject_id: subjectId,
          paper_id: paperId,
          chapter_id: chapterId,
          concept_ids: [],
          board,
          exam_year: year,
          origin_type: 'board',
          question_format: 'CQ',
          difficulty_tier: 'medium',
          stem_text: raw.stem_text,
          subparts: [
            {
              id: `${id}_a`,
              part_label: 'a',
              cognitive_level: 'knowledge',
              marks: 1,
              prompt_text: raw.part_a_prompt,
              solution_latex: raw.part_a_solution,
            },
            {
              id: `${id}_b`,
              part_label: 'b',
              cognitive_level: 'understanding',
              marks: 2,
              prompt_text: raw.part_b_prompt,
              solution_latex: raw.part_b_solution,
            },
            {
              id: `${id}_c`,
              part_label: 'c',
              cognitive_level: 'application',
              marks: 3,
              prompt_text: raw.part_c_prompt,
              solution_latex: raw.part_c_solution,
            },
            {
              id: `${id}_d`,
              part_label: 'd',
              cognitive_level: 'higher_ability',
              marks: 4,
              prompt_text: raw.part_d_prompt,
              solution_latex: raw.part_d_solution,
            },
          ],
          full_solution_latex: raw.part_a_solution || '',
          is_verified: true,
          created_at: new Date().toISOString(),
        } as Question;
      }
    });
  } catch (err) {
    console.error('AI question generation failed:', err);
    return [];
  }
}

/**
 * Generate questions using Gemini AI, with proper chapter distribution:
 * - CQs: distribute evenly across selected chapters (1 CQ per chapter, round-robin)
 * - MCQs: spread across all selected chapters (doesn't matter which gets how many)
 * - Regenerate always produces completely different questions via seed
 */
export async function generateAiWorksheetQuestions(
  request: AiGenerationRequest
): Promise<{ cqs: Question[]; mcqs: Question[] }> {
  const { chapters, subjectId, paperId, subjectNameBn, paperNameBn, cqCount, mcqCount, seed, existingStems } = request;

  if (chapters.length === 0) {
    return { cqs: [], mcqs: [] };
  }

  const allCqs: Question[] = [];
  const allMcqs: Question[] = [];

  // === CQ DISTRIBUTION ===
  // Distribute CQs evenly: 1 CQ per chapter round-robin
  // e.g., 3 chapters, 5 CQs → ch1 gets 2, ch2 gets 2, ch3 gets 1
  if (cqCount > 0) {
    const cqsPerChapter: Record<string, number> = {};
    for (let i = 0; i < cqCount; i++) {
      const ch = chapters[i % chapters.length];
      cqsPerChapter[ch.id] = (cqsPerChapter[ch.id] || 0) + 1;
    }

    const cqPromises = Object.entries(cqsPerChapter).map(([chId, count]) => {
      const ch = chapters.find((c) => c.id === chId)!;
      return fetchAiQuestions(
        chId,
        ch.nameBn,
        ch.nameEn,
        subjectId,
        paperId,
        subjectNameBn,
        paperNameBn,
        'CQ',
        count,
        seed,
        existingStems
      );
    });

    const cqResults = await Promise.all(cqPromises);
    cqResults.forEach((qs) => allCqs.push(...qs));
  }

  // === MCQ DISTRIBUTION ===
  // Spread MCQs across all chapters (doesn't matter which gets how many)
  if (mcqCount > 0) {
    // Split evenly, remainder goes to first chapters
    const basePerChapter = Math.floor(mcqCount / chapters.length);
    const remainder = mcqCount % chapters.length;

    const mcqPromises = chapters.map((ch, idx) => {
      const count = basePerChapter + (idx < remainder ? 1 : 0);
      if (count === 0) return Promise.resolve([] as Question[]);
      return fetchAiQuestions(
        ch.id,
        ch.nameBn,
        ch.nameEn,
        subjectId,
        paperId,
        subjectNameBn,
        paperNameBn,
        'MCQ',
        count,
        seed + idx * 17,
        existingStems
      );
    });

    const mcqResults = await Promise.all(mcqPromises);
    mcqResults.forEach((qs) => allMcqs.push(...qs));
  }

  return { cqs: allCqs, mcqs: allMcqs };
}

/**
 * Synchronous fallback: uses existing question bank only (no AI).
 * Used as initial render while AI questions load.
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
