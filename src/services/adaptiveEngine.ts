import {
  Question,
  CQSubpart,
  Concept,
  Chapter,
  UserConceptMastery,
  MistakePattern,
  StudentAttempt,
  PriorityBreakdown,
} from '../types';
import {
  CANONICAL_CONCEPTS,
  CANONICAL_CHAPTERS,
} from '../data/canonicalTaxonomy';
import { calculateConceptPriority } from './priorityEngine';

export interface AdaptiveScoreBreakdown {
  conceptPriorityScore: number;
  masteryFitBonus: number;
  mistakeRelevanceBonus: number;
  scenarioDiversityBonus: number;
  difficultyFitBonus: number;
  sourceQualityBonus: number;
  recentExposurePenalty: number;
}

export interface AdaptiveSelectionResult {
  question: Question;
  targetSubpart?: CQSubpart;
  concept: Concept;
  priorityBreakdown: PriorityBreakdown;
  compositeScore: number;
  scoreBreakdown: AdaptiveScoreBreakdown;
  selectionReasons: string[];
  selectionSummaryBn: string;
}

export interface AdaptiveSelectionOptions {
  preferredChapterId?: string;
  excludeQuestionIds?: string[];
  targetFormat?: 'CQ' | 'MCQ';
}

/**
 * Deterministic Adaptive Practice Dispatcher
 * Selects the optimal question for a student using multi-signal scoring:
 * CompositeScore = ConceptPriority + MasteryFit + MistakeRelevance + ScenarioDiversity + DifficultyFit + SourceQuality - RecentExposurePenalty
 */
export function selectNextAdaptiveQuestion(
  subjectId: string,
  masteryMap: Record<string, UserConceptMastery>,
  mistakes: MistakePattern[],
  questions: Question[],
  attempts: StudentAttempt[],
  options?: AdaptiveSelectionOptions
): AdaptiveSelectionResult | null {
  const subjectQuestions = questions.filter((q) => q.subject_id === subjectId);
  if (subjectQuestions.length === 0) return null;

  // Filter out explicitly excluded questions if requested
  const excludedSet = new Set(options?.excludeQuestionIds || []);
  let candidatePool = subjectQuestions.filter((q) => !excludedSet.has(q.id));

  if (options?.preferredChapterId) {
    const chapterCandidates = candidatePool.filter((q) => q.chapter_id === options.preferredChapterId);
    if (chapterCandidates.length > 0) {
      candidatePool = chapterCandidates;
    }
  }

  if (options?.targetFormat) {
    const formatCandidates = candidatePool.filter((q) => q.question_format === options.targetFormat);
    if (formatCandidates.length > 0) {
      candidatePool = formatCandidates;
    }
  }

  if (candidatePool.length === 0) {
    candidatePool = subjectQuestions; // graceful fallback to all subject questions
  }

  const subjectConcepts = CANONICAL_CONCEPTS.filter((c) => c.subject_id === subjectId);
  const conceptMap = new Map<string, Concept>(subjectConcepts.map((c) => [c.id, c]));
  const chapterMap = new Map<string, Chapter>(CANONICAL_CHAPTERS.map((ch) => [ch.id, ch]));

  const activeMistakes = mistakes.filter((m) => m.subject_id === subjectId && !m.is_rectified);
  const activeMistakeConceptIds = new Set(activeMistakes.map((m) => m.concept_id));

  // Map question attempts
  const questionAttemptCounts = new Map<string, number>();
  const questionLastAttemptTime = new Map<string, number>();
  for (const att of attempts) {
    questionAttemptCounts.set(att.question_id, (questionAttemptCounts.get(att.question_id) || 0) + 1);
    const time = new Date(att.created_at).getTime();
    const prevTime = questionLastAttemptTime.get(att.question_id) || 0;
    if (time > prevTime) {
      questionLastAttemptTime.set(att.question_id, time);
    }
  }

  const now = Date.now();
  const scoredCandidates: AdaptiveSelectionResult[] = [];

  for (const question of candidatePool) {
    // Determine the primary concept for this question
    const primaryConceptId = (question.concept_ids && question.concept_ids[0]) || '';
    const concept = conceptMap.get(primaryConceptId) || subjectConcepts[0];
    if (!concept) continue;

    const chapter = chapterMap.get(question.chapter_id) || chapterMap.get(concept.chapter_id);
    const mastery = masteryMap[concept.id];

    // 1. Concept Priority Calculation (0 - 100)
    const priorityBreakdown = calculateConceptPriority(concept, chapter, mastery, mistakes);
    const conceptPriorityScore = priorityBreakdown.priority_score * 0.35; // max ~35 pts

    // 2. Mastery Fit Bonus (0 - 25)
    let masteryFitBonus = 15;
    const masteryState = mastery?.mastery_state || 'unseen';
    if (masteryState === 'weak_struggling') {
      masteryFitBonus = 25;
    } else if (masteryState === 'in_progress') {
      masteryFitBonus = 20;
    } else if (masteryState === 'unseen') {
      masteryFitBonus = 15;
    } else if (masteryState === 'proficient') {
      masteryFitBonus = 8;
    } else if (masteryState === 'mastered') {
      // Mastered concept gets low bonus unless retention decay is high (spaced review due)
      masteryFitBonus = priorityBreakdown.retention_decay > 60 ? 18 : 2;
    }

    // 3. Mistake Relevance Bonus (0 - 25)
    let mistakeRelevanceBonus = 0;
    const hasActiveMistake = activeMistakeConceptIds.has(concept.id);
    if (hasActiveMistake) {
      const mistakeCount = activeMistakes.filter((m) => m.concept_id === concept.id).length;
      mistakeRelevanceBonus = Math.min(25, 15 + mistakeCount * 5);
    }

    // 4. Scenario & Question Diversity Bonus (0 - 25)
    // Checks if the student has already mastered this physical scenario archetype
    const qArchetypeId = question.scenario_archetype_id;
    const solvedArchetypes = mastery?.solved_archetype_ids || [];
    const isUnsolvedArchetype = qArchetypeId ? !solvedArchetypes.includes(qArchetypeId) : true;

    const attemptsOnThisQuestion = questionAttemptCounts.get(question.id) || 0;
    let scenarioDiversityBonus = 0;
    if (isUnsolvedArchetype && attemptsOnThisQuestion === 0) {
      scenarioDiversityBonus = 22; // Maximum diversity boost for novel physical context
    } else if (isUnsolvedArchetype) {
      scenarioDiversityBonus = 15;
    } else if (attemptsOnThisQuestion === 0) {
      scenarioDiversityBonus = 10;
    } else if (attemptsOnThisQuestion === 1) {
      scenarioDiversityBonus = 4;
    } else {
      scenarioDiversityBonus = 0;
    }

    // 5. Difficulty Fit Bonus (0 - 15)
    let difficultyFitBonus = 10;
    const diff = question.difficulty_tier || 'medium';
    if (masteryState === 'weak_struggling' || masteryState === 'unseen') {
      if (diff === 'easy' || diff === 'medium') difficultyFitBonus = 15;
      else if (diff === 'hard' || diff === 'olympiad_grade') difficultyFitBonus = 5;
    } else if (masteryState === 'proficient' || masteryState === 'mastered') {
      if (diff === 'hard' || diff === 'olympiad_grade') difficultyFitBonus = 15;
      else if (diff === 'easy') difficultyFitBonus = 5;
    }

    // 6. Source Quality Bonus (0 - 10)
    let sourceQualityBonus = 0;
    if (question.origin_type === 'board' || question.board) {
      sourceQualityBonus += 6;
    }
    if (question.is_verified) {
      sourceQualityBonus += 4;
    }

    // 7. Recent Exposure Penalty (-40 to 0)
    let recentExposurePenalty = 0;
    const lastAttemptTime = questionLastAttemptTime.get(question.id);
    if (lastAttemptTime) {
      const minutesAgo = (now - lastAttemptTime) / (1000 * 60);
      if (minutesAgo < 15) {
        recentExposurePenalty = 35; // strong cooldown for immediately repeated question
      } else if (minutesAgo < 60) {
        recentExposurePenalty = 20;
      } else if (minutesAgo < 24 * 60) {
        recentExposurePenalty = 10;
      }
    }
    if (attemptsOnThisQuestion > 2) {
      recentExposurePenalty += (attemptsOnThisQuestion - 2) * 5;
    }

    // Composite Score
    const compositeScore = Math.max(
      0,
      conceptPriorityScore +
        masteryFitBonus +
        mistakeRelevanceBonus +
        scenarioDiversityBonus +
        difficultyFitBonus +
        sourceQualityBonus -
        recentExposurePenalty
    );

    // Identify target subpart (for CQ, prefer 'c' or 'd' subparts linked to priority concept)
    let targetSubpart: CQSubpart | undefined = undefined;
    if (question.subparts && question.subparts.length > 0) {
      // Look for application (c) or higher ability (d)
      targetSubpart =
        question.subparts.find((s) => s.part_label === 'c' || s.part_label === 'd') ||
        question.subparts[question.subparts.length - 1];
    }

    // Generate evidence-based explanations in Bengali
    const reasons: string[] = [];
    if (hasActiveMistake) {
      reasons.push(`এই টপিকে আপনার সক্রিয় ভুল সংশোধনের প্রয়োজন।`);
    }
    if (masteryState === 'weak_struggling') {
      reasons.push(`আপনার সাম্প্রতিক নির্ভুলতা কম (${Math.round((mastery?.accuracy_rate || 0) * 100)}%)।`);
    } else if (masteryState === 'unseen') {
      reasons.push(`এই গুরুত্বপূর্ণ টপিকটি আপনি এখনো অনুশীলন করেননি।`);
    }
    if (question.board && question.exam_year) {
      reasons.push(`${question.board} বোর্ড ${question.exam_year}-এর আসল প্রশ্ন।`);
    }
    if (attemptsOnThisQuestion === 0) {
      reasons.push(`নতুন ভ্যারিয়েন্ট যা আপনি পূর্বে সমাধান করেননি।`);
    }
    if (priorityBreakdown.retention_decay > 60) {
      reasons.push(`দীর্ঘদিন চর্চা না করায় স্পেসড রিটেনশন রিভিশন প্রয়োজন।`);
    }

    let summaryBn = '';
    if (hasActiveMistake) {
      summaryBn = `সক্রিয় ভ্রান্তি নিরসন: ${concept.name_bn}-এ বিগত ভুলটি কাটিয়ে ওঠার জন্য এই প্রশ্নটি নির্বাচন করা হয়েছে।`;
    } else if (masteryState === 'weak_struggling') {
      summaryBn = `দুর্বলতা দূরীকরণ: ${concept.name_bn} টপিকে নির্ভুলতা বৃদ্ধি করতে টার্গেটেড ড্রিল।`;
    } else if (question.board) {
      summaryBn = `বোর্ড পৌনঃপুনিকতা: ${question.board} বোর্ড ${question.exam_year || ''}-এর গুরুত্বপূর্ণ স্ট্যান্ডার্ড প্রশ্ন।`;
    } else {
      summaryBn = `সিলেবাস অগ্রাধিকার: ${concept.name_bn} টপিকের প্রস্তুতি মজবুত করার জন্য প্রস্তাবিত।`;
    }

    scoredCandidates.push({
      question,
      targetSubpart,
      concept,
      priorityBreakdown,
      compositeScore: Math.round(compositeScore * 10) / 10,
      scoreBreakdown: {
        conceptPriorityScore: Math.round(conceptPriorityScore * 10) / 10,
        masteryFitBonus,
        mistakeRelevanceBonus,
        scenarioDiversityBonus,
        difficultyFitBonus,
        sourceQualityBonus,
        recentExposurePenalty,
      },
      selectionReasons: reasons.slice(0, 3),
      selectionSummaryBn: summaryBn,
    });
  }

  if (scoredCandidates.length === 0) return null;

  // Sort descending by composite score
  scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);
  return scoredCandidates[0];
}

/**
 * Returns top-N adaptive candidates for previewing the practice queue
 */
export function getTopAdaptiveCandidates(
  subjectId: string,
  masteryMap: Record<string, UserConceptMastery>,
  mistakes: MistakePattern[],
  questions: Question[],
  attempts: StudentAttempt[],
  count: number = 3
): AdaptiveSelectionResult[] {
  const subjectQuestions = questions.filter((q) => q.subject_id === subjectId);
  if (subjectQuestions.length === 0) return [];

  const results: AdaptiveSelectionResult[] = [];
  const excludedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const candidate = selectNextAdaptiveQuestion(
      subjectId,
      masteryMap,
      mistakes,
      questions,
      attempts,
      { excludeQuestionIds: excludedIds }
    );
    if (candidate) {
      results.push(candidate);
      excludedIds.push(candidate.question.id);
    } else {
      break;
    }
  }

  return results;
}
