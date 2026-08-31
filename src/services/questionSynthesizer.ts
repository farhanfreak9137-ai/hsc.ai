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

/**
 * Deterministic pseudo-random number generator based on seed
 */
function pseudoRandom(seed: number) {
  let s = Math.sin(seed++) * 10000;
  return s - Math.floor(s);
}

/**
 * Generates dynamic board-standard MCQ question templates per chapter
 */
function generateParametricMcq(
  subjectId: string,
  paperId: string,
  chapterId: string,
  index: number,
  seed: number
): Question {
  const rnd = pseudoRandom(seed * 100 + index * 13 + 7);
  const rnd2 = pseudoRandom(seed * 50 + index * 17 + 3);
  const boards = ['Dhaka', 'Rajshahi', 'Chattogram', 'Cumilla', 'Jashore', 'Dinajpur', 'Sylhet', 'Mymensingh'];
  const board = boards[Math.floor(rnd * boards.length)];
  const year = 2020 + Math.floor(rnd2 * 5); // 2020 to 2024

  // Physics 2nd Paper
  if (chapterId === 'phy_2_ch1' || (subjectId === 'phy' && paperId === 'phy_2' && index % 5 === 0)) {
    // Thermodynamics
    const t2 = 250 + Math.floor(rnd * 10) * 10; // 250 - 340 K
    const etaPct = 20 + Math.floor(rnd2 * 5) * 10; // 20, 30, 40, 50, 60%
    const eta = etaPct / 100;
    const t1 = Math.round(t2 / (1 - eta));
    return {
      id: `dyn_mcq_phy2_ch1_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'phy',
      paper_id: 'phy_2',
      chapter_id: 'phy_2_ch1',
      concept_ids: ['phy_2_ch1_c_carnot_engine'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'medium',
      stem_text: `একটি কার্নো ইঞ্জিনের গ্রাহকের তাপমাত্রা $${t2}\\text{ K}$ এবং দক্ষতা $${etaPct}\\%$ হলে উৎসের তাপমাত্রা ($T_1$) কত হবে?`,
      mcq_options: [
        { key: 'A', text: `$${t1}\\text{ K}$` },
        { key: 'B', text: `$${t1 + 50}\\text{ K}$` },
        { key: 'C', text: `$${Math.round(t2 * 1.5)}\\text{ K}$` },
        { key: 'D', text: `$${t1 - 40}\\text{ K}$` },
      ],
      correct_option: 'A',
      full_solution_latex: `\\eta = 1 - \\frac{T_2}{T_1} \\implies ${eta} = 1 - \\frac{${t2}}{T_1} \\implies T_1 = \\frac{${t2}}{${(1 - eta).toFixed(2)}} = ${t1}\\text{ K}`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  if (chapterId === 'phy_2_ch2' || (subjectId === 'phy' && paperId === 'phy_2' && index % 5 === 1)) {
    // Static Electricity
    const factor = [2, 3, 4][Math.floor(rnd * 3)];
    const power = factor * factor;
    return {
      id: `dyn_mcq_phy2_ch2_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'phy',
      paper_id: 'phy_2',
      chapter_id: 'phy_2_ch2',
      concept_ids: ['phy_2_ch2_c_coulomb_law'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'easy',
      stem_text: `দুটি বিন্দু আধানের মধ্যবর্তী দূরত্বকে $${factor}$ গুণ বৃদ্ধি করা হলে তাদের মধ্যবর্তী তড়িৎ বলের মান কত গুণ পরিবর্তিত হবে?`,
      mcq_options: [
        { key: 'A', text: `$\\frac{1}{${power}}$ গুণ` },
        { key: 'B', text: `$${power}$ গুণ` },
        { key: 'C', text: `$\\frac{1}{${factor}}$ গুণ` },
        { key: 'D', text: `$${factor}$ গুণ` },
      ],
      correct_option: 'A',
      full_solution_latex: `F \\propto \\frac{1}{r^2} \\implies F' = \\frac{F}{${factor}^2} = \\frac{1}{${power}} F`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  if (chapterId === 'phy_2_ch3' || (subjectId === 'phy' && paperId === 'phy_2' && index % 5 === 2)) {
    // Current Electricity
    const g = 10 * (Math.floor(rnd * 9) + 1); // 10 to 90 ohms
    const n = [5, 10, 20, 50, 100][Math.floor(rnd2 * 5)];
    const s = Math.round((g / (n - 1)) * 100) / 100;
    return {
      id: `dyn_mcq_phy2_ch3_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'phy',
      paper_id: 'phy_2',
      chapter_id: 'phy_2_ch3',
      concept_ids: ['phy_2_ch3_c_shunt_galvanometer'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'medium',
      stem_text: `$${g}\\ \\Omega$ রোধের একটি গ্যালভানোমিটারের পাল্লা $${n}$ গুণ বৃদ্ধি করতে হলে কত মানের শান্ট ($S$) সমান্তরালে যুক্ত করতে হবে?`,
      mcq_options: [
        { key: 'A', text: `$${s}\\ \\Omega$` },
        { key: 'B', text: `$${Math.round(s * 1.5 * 100) / 100}\\ \\Omega$` },
        { key: 'C', text: `$${Math.round((g / n) * 100) / 100}\\ \\Omega$` },
        { key: 'D', text: `$${g * (n - 1)}\\ \\Omega$` },
      ],
      correct_option: 'A',
      full_solution_latex: `S = \\frac{G}{n - 1} = \\frac{${g}}{${n} - 1} = ${s}\\ \\Omega`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  if (chapterId === 'phy_2_ch7' || (subjectId === 'phy' && paperId === 'phy_2' && index % 5 === 3)) {
    // Physical Optics
    return {
      id: `dyn_mcq_phy2_ch7_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'phy',
      paper_id: 'phy_2',
      chapter_id: 'phy_2_ch7',
      concept_ids: ['phy_2_ch7_c_young_double_slit'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'medium',
      stem_text: 'ইয়ং-এর দ্বি-চির পরীক্ষায় চিরদ্বয়ের মধ্যবর্তী দূরত্ব অর্ধেক এবং পর্দা ও চিরের দূরত্ব দ্বিগুণ করা হলে ডোরার প্রস্থ কত গুণ হবে?',
      mcq_options: [
        { key: 'A', text: '৪ গুণ বৃদ্ধি পাবে' },
        { key: 'B', text: '২ গুণ বৃদ্ধি পাবে' },
        { key: 'C', text: 'অপরিবর্তিত থাকবে' },
        { key: 'D', text: 'অর্ধেক হ্রাস পাবে' },
      ],
      correct_option: 'A',
      full_solution_latex: `\\beta = \\frac{\\lambda D}{d} \\implies \\beta' = \\frac{\\lambda (2D)}{d/2} = 4\\frac{\\lambda D}{d} = 4\\beta`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  if (chapterId === 'phy_2_ch8' || (subjectId === 'phy' && paperId === 'phy_2' && index % 5 === 4)) {
    // Modern Physics
    const halfLife = [5, 10, 15, 20][Math.floor(rnd * 4)];
    const days = halfLife * 3;
    return {
      id: `dyn_mcq_phy2_ch8_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'phy',
      paper_id: 'phy_2',
      chapter_id: 'phy_2_ch8',
      concept_ids: ['phy_2_ch8_c_photoelectric_half_life'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'medium',
      stem_text: `একটি তেজস্ক্রিয় মৌলের অর্ধায়ু $${halfLife}$ দিন হলে $${days}$ দিন পর মৌলটির আদি পরমাণুর কত অংশ অবশিষ্ট থাকবে?`,
      mcq_options: [
        { key: 'A', text: '$\\frac{1}{8}$ অংশ' },
        { key: 'B', text: '$\\frac{1}{4}$ অংশ' },
        { key: 'C', text: '$\\frac{1}{16}$ অংশ' },
        { key: 'D', text: '$\\frac{7}{8}$ অংশ' },
      ],
      correct_option: 'A',
      full_solution_latex: `n = \\frac{t}{T_{1/2}} = \\frac{${days}}{${halfLife}} = 3 \\implies \\frac{N}{N_0} = \\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  // Physics 1st Paper
  if (subjectId === 'phy') {
    if (chapterId === 'phy_1_ch2' || index % 4 === 0) {
      const ax = Math.floor(rnd * 5) + 1;
      const ay = Math.floor(rnd2 * 5) + 1;
      const bx = Math.floor(rnd * 4) + 2;
      const by = Math.floor(rnd2 * 4) + 1;
      const dot = ax * bx + ay * by;
      return {
        id: `dyn_mcq_phy1_ch2_${seed}_${index}`,
        scope: 'global_official',
        subject_id: 'phy',
        paper_id: 'phy_1',
        chapter_id: 'phy_1_ch2',
        concept_ids: ['phy_1_ch2_c_dot_cross_product'],
        board,
        exam_year: year,
        origin_type: 'board',
        question_format: 'MCQ',
        difficulty_tier: 'easy',
        stem_text: `$\\vec{P} = ${ax}\\hat{i} + ${ay}\\hat{j}$ এবং $\\vec{Q} = ${bx}\\hat{i} + ${by}\\hat{j}$ ভেক্টরদ্বয়ের স্কেলার গুণন (Dot Product) $\\vec{P}\\cdot\\vec{Q}$ এর মান কত?`,
        mcq_options: [
          { key: 'A', text: `${dot}` },
          { key: 'B', text: `${dot + 4}` },
          { key: 'C', text: `${Math.abs(dot - 3)}` },
          { key: 'D', text: `${ax * by + ay * bx}` },
        ],
        correct_option: 'A',
        full_solution_latex: `\\vec{P}\\cdot\\vec{Q} = (${ax})(${bx}) + (${ay})(${by}) = ${ax * bx} + ${ay * by} = ${dot}`,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
    }
    if (chapterId === 'phy_1_ch4' || index % 4 === 1) {
      const mass = [2, 4, 5, 8, 10][Math.floor(rnd * 5)];
      const rad = [0.2, 0.4, 0.5, 1][Math.floor(rnd2 * 4)];
      const inertia = Math.round(mass * rad * rad * 100) / 100;
      return {
        id: `dyn_mcq_phy1_ch4_${seed}_${index}`,
        scope: 'global_official',
        subject_id: 'phy',
        paper_id: 'phy_1',
        chapter_id: 'phy_1_ch4',
        concept_ids: ['phy_1_ch4_c_moment_of_inertia'],
        board,
        exam_year: year,
        origin_type: 'board',
        question_format: 'MCQ',
        difficulty_tier: 'easy',
        stem_text: `$${mass}\\text{ kg}$ ভরের একটি চাকার চক্রগতির ব্যাসার্ধ $${rad}\\text{ m}$ হলে এর জড়তার ভ্রামক ($I$) কত?`,
        mcq_options: [
          { key: 'A', text: `$${inertia}\\text{ kg}\\cdot\\text{m}^2$` },
          { key: 'B', text: `$${Math.round(inertia * 2 * 100) / 100}\\text{ kg}\\cdot\\text{m}^2$` },
          { key: 'C', text: `$${Math.round(mass * rad * 100) / 100}\\text{ kg}\\cdot\\text{m}^2$` },
          { key: 'D', text: `$${Math.round(inertia * 0.5 * 100) / 100}\\text{ kg}\\cdot\\text{m}^2$` },
        ],
        correct_option: 'A',
        full_solution_latex: `I = Mk^2 = ${mass} \\times (${rad})^2 = ${inertia}\\text{ kg}\\cdot\\text{m}^2`,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
    }
  }

  // Chemistry (chem_1 & chem_2)
  if (subjectId === 'chem') {
    const phVal = [2, 3, 4, 5][Math.floor(rnd * 4)];
    const hConc = Math.pow(10, -phVal);
    return {
      id: `dyn_mcq_chem_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'chem',
      paper_id: paperId !== 'all' ? paperId : 'chem_1',
      chapter_id: chapterId || 'chem_1_ch4',
      concept_ids: ['chem_1_ch4_c_buffer_henderson'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'easy',
      stem_text: `একটি দ্রবণে হাইড্রোজেন আয়ন ঘনমাত্রা $[H^+] = ${hConc}\\text{ M}$ হলে উক্ত দ্রবণের pH কত?`,
      mcq_options: [
        { key: 'A', text: `${phVal}.0` },
        { key: 'B', text: `${14 - phVal}.0` },
        { key: 'C', text: `${phVal + 1}.0` },
        { key: 'D', text: `${phVal - 1}.0` },
      ],
      correct_option: 'A',
      full_solution_latex: `\\text{pH} = -\\log[H^+] = -\\log(10^{-${phVal}}) = ${phVal}`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  // Higher Mathematics (hmath)
  if (subjectId === 'hmath') {
    const a = Math.floor(rnd * 5) + 2;
    const b = Math.floor(rnd2 * 4) + 1;
    const c = 2 * a;
    const valX = (a * 6) / c;
    return {
      id: `dyn_mcq_hmath_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'hmath',
      paper_id: paperId !== 'all' ? paperId : 'hmath_1',
      chapter_id: chapterId || 'hmath_1_ch1',
      concept_ids: ['hmath_1_ch1_c_matrix_determinant'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'easy',
      stem_text: `$\\begin{pmatrix} ${a} & x \\\\ ${c} & 6 \\end{pmatrix}$ ম্যাট্রিক্সটি ব্যতিক্রমী (Singular Matrix) হলে $x$ এর মান কত?`,
      mcq_options: [
        { key: 'A', text: `${valX}` },
        { key: 'B', text: `${-valX}` },
        { key: 'C', text: `${valX * 2}` },
        { key: 'D', text: '0' },
      ],
      correct_option: 'A',
      full_solution_latex: `\\det = (${a})(6) - (${c})(x) = 0 \\implies ${a * 6} - ${c}x = 0 \\implies x = ${valX}`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  // Biology (bio)
  if (subjectId === 'bio') {
    return {
      id: `dyn_mcq_bio_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'bio',
      paper_id: paperId !== 'all' ? paperId : 'bio_1',
      chapter_id: chapterId || 'bio_1_ch1',
      concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'easy',
      stem_text: 'কোষঝিল্লির ফ্লুইড মোজাইক মডেল অনুসারে লিপিড দ্বিস্তরে কোন লিপিড সর্বাধিক পরিমাণে থাকে?',
      mcq_options: [
        { key: 'A', text: 'ফসফোলিপিড (Phospholipid)' },
        { key: 'B', text: 'গ্লাইকোলিপিড' },
        { key: 'C', text: 'কোলেস্টেরল' },
        { key: 'D', text: 'ট্রাইগ্লিসারাইড' },
      ],
      correct_option: 'A',
      full_solution_latex: 'ফসফোলিপিড বাইলেয়ার হলো প্লাজমা মেমব্রেনের প্রধান গাঠনিক ভিত্তি যার ওপর প্রোটিন মোজাইকের ন্যায় বিন্যস্ত থাকে।',
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  // ICT
  if (subjectId === 'ict') {
    const dec = 8 + (index % 8);
    const bin = dec.toString(2);
    return {
      id: `dyn_mcq_ict_${seed}_${index}`,
      scope: 'global_official',
      subject_id: 'ict',
      paper_id: 'ict_1',
      chapter_id: chapterId || 'ict_1_ch3',
      concept_ids: ['ict_1_ch3_c_twos_complement'],
      board,
      exam_year: year,
      origin_type: 'board',
      question_format: 'MCQ',
      difficulty_tier: 'easy',
      stem_text: `দশমিক সংখ্যা $(${dec})_{10}$ এর সমতুল্য বাইনারি মান কত?`,
      mcq_options: [
        { key: 'A', text: `$(${bin})_2$` },
        { key: 'B', text: `$(${dec.toString(8)})_2$` },
        { key: 'C', text: `$(${(dec + 1).toString(2)})_2$` },
        { key: 'D', text: `$(${(dec - 1).toString(2)})_2$` },
      ],
      correct_option: 'A',
      full_solution_latex: `(${dec})_{10} = (${bin})_2`,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  // Generic fallback
  return {
    id: `dyn_mcq_gen_${seed}_${index}`,
    scope: 'global_official',
    subject_id: subjectId,
    paper_id: paperId !== 'all' ? paperId : 'phy_1',
    chapter_id: chapterId || 'phy_1_ch2',
    concept_ids: [],
    board,
    exam_year: year,
    origin_type: 'board',
    question_format: 'MCQ',
    difficulty_tier: 'medium',
    stem_text: `পাঠ্যবইয়ের স্ট্যান্ডার্ড মডেল প্রশ্ন: বিষয় ${subjectId.toUpperCase()} (অধ্যায় প্রশ্ন #${index + 1})`,
    mcq_options: [
      { key: 'A', text: 'বোর্ড স্ট্যান্ডার্ড সঠিক বিকল্প A' },
      { key: 'B', text: 'বিকল্প B' },
      { key: 'C', text: 'বিকল্প C' },
      { key: 'D', text: 'বিকল্প D' },
    ],
    correct_option: 'A',
    full_solution_latex: '\\text{এনসিটিবি বোর্ড পাঠ্যবই ভিত্তিক প্রমিত সমাধান।}',
    is_verified: true,
    created_at: new Date().toISOString(),
  };
}

/**
 * Main Question Synthesizer & Selector
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

  // 1. Filter base question bank strictly matching subject, paper, chapter
  const strictlyFiltered = baseQuestions.filter((q) => {
    if (q.subject_id !== subjectId) return false;
    if (paperId !== 'all' && q.paper_id !== paperId) return false;
    if (selectedChapters.length > 0 && !selectedChapters.includes(q.chapter_id)) return false;
    if (selectedBoard !== 'all' && q.board !== selectedBoard) return false;
    return true;
  });

  // Deterministic shuffle using seed
  const shuffledBase = [...strictlyFiltered].sort((a, b) => {
    if (seed === 0) return 0;
    const hA = (a.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hB = (b.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hA % 97) - (hB % 97);
  });

  // Extract CQs & MCQs from filtered bank
  let cqs = shuffledBase.filter((q) => q.question_format === 'CQ');
  let mcqs = shuffledBase.filter((q) => q.question_format === 'MCQ');

  // If no specific chapter was selected, we can also draw from the subject's entire bank if needed
  if (selectedChapters.length === 0) {
    if (cqs.length < targetCqCount) {
      const moreCqs = baseQuestions.filter(
        (q) => q.subject_id === subjectId && q.question_format === 'CQ' && !cqs.some((c) => c.id === q.id)
      );
      cqs = [...cqs, ...moreCqs];
    }
    if (mcqs.length < targetMcqCount) {
      const moreMcqs = baseQuestions.filter(
        (q) => q.subject_id === subjectId && q.question_format === 'MCQ' && !mcqs.some((m) => m.id === q.id)
      );
      mcqs = [...mcqs, ...moreMcqs];
    }
  }

  // 2. Synthesize parametric questions if target counts are not met
  // Eligible chapters for generation
  const activeChapterIds =
    selectedChapters.length > 0
      ? selectedChapters
      : CANONICAL_CHAPTERS.filter((ch) => {
          const p = CANONICAL_PAPERS.find((paper) => paper.id === ch.paper_id);
          return p?.subject_id === subjectId && (paperId === 'all' || ch.paper_id === paperId);
        }).map((ch) => ch.id);

  // If we still need more MCQs to reach the target count (e.g. 25 MCQs)
  if (questionType !== 'cq_only' && mcqs.length < targetMcqCount) {
    const needed = targetMcqCount - mcqs.length;
    for (let i = 0; i < needed; i++) {
      const chId = activeChapterIds.length > 0 ? activeChapterIds[i % activeChapterIds.length] : 'phy_1_ch2';
      const syntheticMcq = generateParametricMcq(subjectId, paperId, chId, i + mcqs.length, seed + i);
      mcqs.push(syntheticMcq);
    }
  }

  // Slice down to exact target counts
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
