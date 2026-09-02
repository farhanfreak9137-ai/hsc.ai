import { preprocessMathText } from '../src/utils/mathPreprocessor';
import { PRESEEDED_QUESTIONS } from '../src/data/canonicalTaxonomy';

console.log('Testing Canonical Questions Solutions...');
let passed = 0;
let total = 0;

for (const q of PRESEEDED_QUESTIONS) {
  if (q.subparts) {
    for (const sub of q.subparts) {
      if (sub.solution_latex) {
        total++;
        const processed = preprocessMathText(sub.solution_latex);
        if (processed.includes('\\text{ঘূর্ণন')) {
          console.error('Failed to unwrap Bengali in', sub.id);
        } else {
          passed++;
        }
      }
    }
  }
}

// Test specific question from user's screenshot
const testQ = PRESEEDED_QUESTIONS.find(q => q.id === 'q_db_2023_phy1_cq4');
if (testQ && testQ.subparts) {
  console.log('\n--- Specific Test Case (Dhaka Board 2023 Phy 1st Paper CQ 4 Part A) ---');
  console.log('Original Part A solution:\n', testQ.subparts[0].solution_latex);
  console.log('\nProcessed Output for Renderer:\n', preprocessMathText(testQ.subparts[0].solution_latex));
}

console.log(`\nResults: ${passed}/${total} solutions verified successfully!`);
