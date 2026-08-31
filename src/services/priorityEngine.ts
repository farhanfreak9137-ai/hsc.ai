import { Concept, UserConceptMastery, MistakePattern, PriorityBreakdown, Chapter } from '../types';

export interface PriorityWeights {
  weakness: number; // default 0.35
  recurrence: number; // default 0.30
  syllabus: number; // default 0.20
  retention: number; // default 0.15
}

export const DEFAULT_WEIGHTS: PriorityWeights = {
  weakness: 0.35,
  recurrence: 0.30,
  syllabus: 0.20,
  retention: 0.15,
};

/**
 * Deterministic evidence-based priority calculation
 * Combines Weakness, Historical Recurrence, Syllabus Weight, and Retention Decay
 */
export function calculateConceptPriority(
  concept: Concept,
  chapter: Chapter | undefined,
  mastery: UserConceptMastery | undefined,
  activeMistakes: MistakePattern[],
  maxBoardFrequency: number = 20,
  weights: PriorityWeights = DEFAULT_WEIGHTS
): PriorityBreakdown {
  const attempts = mastery?.total_attempts || 0;
  const accuracy = attempts > 0 ? (mastery?.accuracy_rate || 0) : 0;
  const conceptActiveMistakes = activeMistakes.filter(
    (m) => m.concept_id === concept.id && !m.is_rectified
  );

  // 1. Weakness Index (0 - 100)
  let weaknessIndex = 50; // default for unseen concepts
  if (attempts > 0) {
    const errorBonus = Math.min(40, conceptActiveMistakes.length * 15);
    weaknessIndex = Math.min(100, Math.max(0, (100 - accuracy * 100) + errorBonus));
  } else {
    // Unseen concept gets slight priority boost if high board recurrence
    weaknessIndex = 60;
  }

  // 2. Historical Recurrence Index (0 - 100)
  const safeMaxFreq = Math.max(1, maxBoardFrequency);
  const historicalRecurrenceIndex = Math.min(
    100,
    Math.round((concept.board_appearance_count / safeMaxFreq) * 100)
  );

  // 3. Syllabus Importance Index (0 - 100)
  const chapterWeight = chapter?.syllabus_weight || 1.0;
  const conceptWeight = concept.syllabus_weight || 1.0;
  const syllabusImportance = Math.min(
    100,
    Math.round(((chapterWeight * 0.5 + conceptWeight * 0.5) / 2.0) * 100)
  );

  // 4. Retention Decay Index (0 - 100)
  let retentionDecay = 40; // baseline
  if (mastery?.last_tested_at) {
    const daysSince = Math.max(
      0,
      (Date.now() - new Date(mastery.last_tested_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    // Exponential forgetting curve: 100 * (1 - e^(-t / 7))
    retentionDecay = Math.min(100, Math.round(100 * (1 - Math.exp(-daysSince / 7))));
  } else if (attempts === 0) {
    retentionDecay = 70; // High decay urgency because never tested
  }

  // Composite Deterministic Score
  const rawScore =
    weights.weakness * weaknessIndex +
    weights.recurrence * historicalRecurrenceIndex +
    weights.syllabus * syllabusImportance +
    weights.retention * retentionDecay;

  const priorityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Generate clear explainable recommendation reason
  let recommendedReason = '';
  if (conceptActiveMistakes.length > 0) {
    recommendedReason = `উচ্চ প্রায়োরিটি: এই টপিকে ${conceptActiveMistakes.length}টি সক্রিয় ভুল বিদ্যমান এবং বিগত বোর্ড পরীক্ষায় ${concept.board_appearance_count} বার এসেছে।`;
  } else if (attempts === 0 && concept.board_appearance_count >= 10) {
    recommendedReason = `বোর্ড পৌনঃপুনিকতা বেশি (${concept.board_appearance_count} বার), কিন্তু আপনি এখনো প্র্যাকটিস করেননি।`;
  } else if (accuracy < 0.6 && attempts > 0) {
    recommendedReason = `আপনার নির্ভুলতা কম (${Math.round(accuracy * 100)}%), অবিলম্বে রিভিশন প্রয়োজন।`;
  } else if (retentionDecay > 65) {
    recommendedReason = `অনেকদিন চর্চা করা হয়নি (স্মৃতি ধরে রাখার হার কমেছে)। দ্রুত ব্রাশ-আপ করুন।`;
  } else {
    recommendedReason = `সিলেবাসের গুরুত্ব ও বিগত পরীক্ষার ধারা অনুসারে নিয়মিত অনুশীলন বজায় রাখুন।`;
  }

  return {
    concept_id: concept.id,
    concept_name_bn: concept.name_bn,
    concept_name_en: concept.name_en,
    chapter_name_bn: chapter?.name_bn || '',
    subject_id: concept.subject_id,
    paper_id: concept.paper_id,
    priority_score: priorityScore,
    weakness_index: Math.round(weaknessIndex),
    historical_recurrence_index: Math.round(historicalRecurrenceIndex),
    syllabus_importance: Math.round(syllabusImportance),
    retention_decay: Math.round(retentionDecay),
    board_appearance_count: concept.board_appearance_count,
    accuracy_rate: accuracy,
    active_mistakes_count: conceptActiveMistakes.length,
    mastery_state: mastery?.mastery_state || 'unseen',
    recommended_reason: recommendedReason,
  };
}
