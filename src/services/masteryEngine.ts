import { UserConceptMastery, MasteryState, StudentAttempt, MistakePattern } from '../types';
import { CANONICAL_ARCHETYPES } from '../data/canonicalTaxonomy';

/**
 * Updates or computes the 5-Tier Spaced Mastery State for a concept
 * Enforces Milestone 2 Scenario Archetype & Cognitive Diversity Matrix:
 * - Anti-Gaming Constraint: Solving the exact same archetype repeatedly cannot advance mastery beyond 'in_progress'.
 * - Unseen -> In Progress: First attempt logged
 * - In Progress -> Weak/Struggling: Accuracy < 0.60 across >= 2 attempts OR active mistakes >= 2
 * - Weak/In Progress -> Proficient: Accuracy >= 0.75 across >= 3 attempts AND >= 2 distinct scenario archetypes solved
 * - Proficient -> Mastered: Accuracy >= 0.85 across >= 5 attempts, zero active mistakes, tested on >= 2 distinct days, AND >= 2 distinct scenario archetypes solved
 */
export function evaluateMasteryTransition(
  currentMastery: UserConceptMastery | undefined,
  attemptsForConcept: StudentAttempt[],
  activeMistakesForConcept: MistakePattern[],
  conceptId?: string
): {
  mastery_state: MasteryState;
  accuracy_rate: number;
  total_attempts: number;
  successful_attempts: number;
  distinct_practice_days: number;
  distinct_variants_solved: number;
  solved_archetype_ids: string[];
  cognitive_coverage_ratio: number;
} {
  const total_attempts = attemptsForConcept.length;
  const targetConceptId = conceptId || currentMastery?.concept_id || '';
  const totalConceptArchetypes = CANONICAL_ARCHETYPES.filter((a) => a.concept_id === targetConceptId);

  if (total_attempts === 0) {
    return {
      mastery_state: 'unseen',
      accuracy_rate: 0,
      total_attempts: 0,
      successful_attempts: 0,
      distinct_practice_days: 0,
      distinct_variants_solved: 0,
      solved_archetype_ids: [],
      cognitive_coverage_ratio: 0,
    };
  }

  const successfulAttempts = attemptsForConcept.filter((a) => a.is_correct);
  const successful_attempts = successfulAttempts.length;
  const accuracy_rate = total_attempts > 0 ? successful_attempts / total_attempts : 0;

  // Track distinct scenario archetypes solved correctly
  const solvedArchetypeSet = new Set<string>();
  for (const att of successfulAttempts) {
    if (att.scenario_archetype_id) {
      solvedArchetypeSet.add(att.scenario_archetype_id);
    }
  }
  const solved_archetype_ids = Array.from(solvedArchetypeSet);
  const distinct_variants_solved = solved_archetype_ids.length;

  const cognitive_coverage_ratio =
    totalConceptArchetypes.length > 0
      ? Math.min(1.0, distinct_variants_solved / totalConceptArchetypes.length)
      : distinct_variants_solved > 0 ? 1.0 : 0.5;

  // Calculate distinct calendar days
  const practiceDaysSet = new Set(
    attemptsForConcept.map((a) => new Date(a.created_at).toISOString().split('T')[0])
  );
  const distinct_practice_days = practiceDaysSet.size;

  const unrectifiedMistakes = activeMistakesForConcept.filter((m) => !m.is_rectified).length;

  let nextState: MasteryState = 'in_progress';

  // Diversity requirements: If concept has >= 2 archetypes, at least 2 must be solved for Proficient/Mastered
  const meetsArchetypeDiversity =
    totalConceptArchetypes.length <= 1 || distinct_variants_solved >= 2;

  if (
    total_attempts >= 5 &&
    accuracy_rate >= 0.85 &&
    unrectifiedMistakes === 0 &&
    distinct_practice_days >= 2 &&
    meetsArchetypeDiversity
  ) {
    nextState = 'mastered';
  } else if (
    total_attempts >= 3 &&
    accuracy_rate >= 0.75 &&
    unrectifiedMistakes <= 1 &&
    meetsArchetypeDiversity
  ) {
    nextState = 'proficient';
  } else if (total_attempts >= 2 && (accuracy_rate < 0.6 || unrectifiedMistakes >= 2)) {
    nextState = 'weak_struggling';
  } else {
    nextState = 'in_progress';
  }

  return {
    mastery_state: nextState,
    accuracy_rate,
    total_attempts,
    successful_attempts,
    distinct_practice_days,
    distinct_variants_solved,
    solved_archetype_ids,
    cognitive_coverage_ratio,
  };
}
