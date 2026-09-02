export type HSCGroup = 'Science' | 'Humanities' | 'Business Studies';
export type LanguagePreference = 'bn' | 'en' | 'bilingual';

export type QuestionFormat = 'CQ' | 'MCQ';
export type QuestionScope = 'global_official' | 'user_custom';
export type DifficultyTier = 'easy' | 'medium' | 'hard' | 'olympiad_grade';

export type CognitiveLevel = 'knowledge' | 'understanding' | 'application' | 'higher_ability';

export type MasteryState = 'unseen' | 'in_progress' | 'weak_struggling' | 'proficient' | 'mastered';

export type ErrorCategory = 
  | 'calculation_slip'
  | 'formula_amnesia'
  | 'conceptual_misconception'
  | 'wrong_method'
  | 'incomplete_reasoning'
  | 'unit_error'
  | 'sign_error'
  | 'misread_question';

export type SourceAuthorityLevel =
  | 'official_nctb_textbook'
  | 'official_board_paper'
  | 'verified_guide_book'
  | 'user_personal_notes'
  | 'ai_generated_material';

export type TutoringMode = 'socratic' | 'expository' | 'exam' | 'revision';

// --- NCTB Curriculum Taxonomy Types ---
export interface Subject {
  id: string; // 'phy', 'chem', 'hmath', 'bio'
  name_en: string;
  name_bn: string;
  code: string;
  icon: string;
  color: string;
}

export interface Paper {
  id: string; // 'phy_1', 'phy_2'
  subject_id: string;
  paper_number: 1 | 2;
  name_en: string;
  name_bn: string;
}

export interface Chapter {
  id: string; // 'phy_1_ch4'
  paper_id: string;
  chapter_number: number;
  name_en: string;
  name_bn: string;
  syllabus_weight: number; // 1.0 - 2.0
  total_board_questions_analyzed?: number;
}

export interface Topic {
  id: string;
  chapter_id: string;
  topic_number: number;
  name_en: string;
  name_bn: string;
}

export interface Concept {
  id: string;
  topic_id: string;
  chapter_id: string;
  paper_id: string;
  subject_id: string;
  name_en: string;
  name_bn: string;
  formula_latex?: string;
  core_principle_bn: string;
  core_principle_en: string;
  syllabus_weight: number;
  board_appearance_count: number;
  variants_count: number;
}

export interface ScenarioArchetype {
  id: string;
  concept_id: string;
  code: string; // e.g. 'ARCH_BANKING_FRICTIONLESS', 'ARCH_CARNOT_EFFICIENCY_MAX'
  title_bn: string;
  title_en: string;
  description_bn: string;
  cognitive_dimension: 'recall' | 'direct_application' | 'boundary_case' | 'multi_concept';
  key_variables: string[];
  sample_formula_latex?: string;
}

export interface ConceptVariant {
  id: string;
  concept_id: string;
  name: string;
  description: string;
  cognitive_dimension: 'recall' | 'direct_application' | 'boundary_case' | 'multi_concept';
  scenario_archetype: string;
  formula_variant_latex?: string;
}

// --- Question Intelligence Types ---
export interface CQSubpart {
  id: string;
  part_label: 'a' | 'b' | 'c' | 'd';
  cognitive_level: CognitiveLevel;
  marks: number; // a=1, b=2, c=3, d=4
  prompt_text: string;
  prompt_text_bn?: string;
  concept_ids?: string[];
  scenario_archetype_id?: string;
  solution_latex?: string;
  marking_rubric?: { step: number; mark: number; criteria: string }[];
}

export interface MCQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  scope: QuestionScope;
  created_by_user_id?: string;
  subject_id: string;
  paper_id: string;
  chapter_id: string;
  chapter_name?: string;
  topic_id?: string;
  concept_ids: string[];
  scenario_archetype_id?: string;
  
  board?: string; // 'Dhaka', 'Chattogram', 'Rajshahi', 'Cumilla', 'Jashore', 'Barishal', 'Sylhet', 'Dinajpur', 'Mymensingh', 'All Boards'
  exam_year?: number; // 2019, 2021, 2022, 2023, 2024
  origin_type: 'board' | 'model_test' | 'college_exam' | 'custom';
  question_format: QuestionFormat;
  difficulty_tier: DifficultyTier;
  
  stem_text: string;
  stem_diagram_url?: string;
  source_image?: string;
  has_official_solution?: boolean;
  
  // CQ Subparts
  subparts?: CQSubpart[];
  
  // MCQ Specifics
  mcq_options?: MCQOption[];
  correct_option?: string;
  
  full_solution_latex: string;
  solution_explanation_bn?: string;
  is_verified: boolean;
  created_at: string;
}

// --- Knowledge Library & Full Textbook (RAG) Types ---
export interface TextbookChapterIndex {
  chapter_number: number;
  title_bn: string;
  title_en: string;
  start_page: number;
  end_page: number;
  key_topics: string[];
  summary_text?: string;
  high_yield_formulas?: string[];
}

export interface TextbookRecord {
  id: string;
  title: string;
  title_bn?: string;
  title_en?: string;
  subject_id: string;
  paper_id?: string;
  author: string;
  edition: string;
  total_pages: number;
  is_official_nctb: boolean;
  cover_color?: string;
  summary?: string;
  file_name?: string;
  file_size_mb?: number;
  uploaded_at?: string;
  chapters: TextbookChapterIndex[];
  extracted_chunks?: DocumentChunk[];
}

export interface BookSearchResult {
  chunk?: DocumentChunk;
  book_id?: string;
  book_title?: string;
  relevance_score: number;
  matched_text_snippet?: string;
  snippet_text?: string;
  chapter_title_bn?: string;
  chapter_title?: string;
  page_number: number;
  highlighted_terms?: string[];
  formula_latex?: string;
}

export interface DocumentChunk {
  id: string;
  document_title: string;
  authority_level: SourceAuthorityLevel;
  subject_id: string;
  paper_id: string;
  chapter_id: string;
  concept_ids: string[];
  page_number: number;
  section_title: string;
  content_text: string;
  formula_latex?: string;
}

// --- Student Learning & Mastery Types ---
export interface StepEvaluation {
  step: number;
  description: string;
  is_correct: boolean;
  score_obtained: number;
  max_score: number;
  feedback: string;
}

export interface AnswerEvaluationResult {
  is_correct: boolean;
  score_obtained: number;
  max_score: number;
  evaluation_confidence: number; // 0.0 to 1.0
  reasoning_correct: boolean;
  error_category?: ErrorCategory;
  evaluation_summary: string;
  step_evaluations: StepEvaluation[];
  corrective_advice_bn: string;
  source_citation?: {
    book_title: string;
    chapter_name: string;
    section: string;
    page: number;
  };
}

export interface StudentAttempt {
  id: string;
  user_id: string;
  question_id: string;
  subpart_id?: string;
  concept_id: string;
  scenario_archetype_id?: string;
  attempt_type: 'socratic_drill' | 'timed_sprint' | 'cq_practice' | 'mcq_quiz';
  student_answer_text: string;
  student_answer_image_url?: string;
  is_correct: boolean;
  score_obtained: number;
  max_score: number;
  time_spent_seconds: number;
  evaluation: AnswerEvaluationResult;
  created_at: string;
}

export interface MistakePattern {
  id: string;
  concept_id: string;
  concept_name_bn: string;
  concept_name_en: string;
  chapter_id: string;
  subject_id: string;
  error_category: ErrorCategory;
  signature_title: string;
  root_cause_explanation: string;
  occurrence_count: number;
  is_rectified: boolean;
  last_occurred_at: string;
  next_spaced_review_due: string;
  example_question_id?: string;
}

export interface UserConceptMastery {
  concept_id: string;
  mastery_state: MasteryState;
  total_attempts: number;
  successful_attempts: number;
  accuracy_rate: number;
  distinct_variants_solved: number;
  distinct_practice_days: number;
  solved_archetype_ids?: string[];
  cognitive_coverage_ratio?: number; // 0.0 to 1.0 based on archetypes completed
  last_studied_at?: string;
  last_tested_at?: string;
  retention_decay_factor: number;
  priority_score: number; // 0 - 100
}

export interface PriorityBreakdown {
  concept_id: string;
  concept_name_bn: string;
  concept_name_en: string;
  chapter_name_bn: string;
  subject_id: string;
  paper_id: string;
  priority_score: number;
  weakness_index: number;
  historical_recurrence_index: number;
  syllabus_importance: number;
  retention_decay: number;
  board_appearance_count: number;
  accuracy_rate: number;
  active_mistakes_count: number;
  mastery_state: MasteryState;
  recommended_reason: string;
}

export interface SprintStage {
  id: string;
  stage_name: string;
  stage_name_bn: string;
  duration_minutes: number;
  activity_type: 'concept_refinement' | 'targeted_practice' | 'hsc_board_cq' | 'error_rectification' | 'retrieval_drill';
  concept_ids: string[];
  description: string;
  is_completed: boolean;
}

export interface SmartStudySprint {
  id: string;
  chapter_id: string;
  chapter_name_bn: string;
  subject_id: string;
  total_allocated_minutes: number;
  archetype: 'weakness_triage' | 'balanced_sprint' | 'exam_drill' | 'revision_sprint';
  stages: SprintStage[];
  created_at: string;
}

// --- Mock Exam Simulator Types ---
export type ExamType = 'full_cq' | 'full_mcq' | 'combo_board' | 'chapter_speed';

export interface ExamConfig {
  id: string;
  title_bn: string;
  subject_id: string;
  paper_id: string;
  exam_type: ExamType;
  total_marks: number;
  time_limit_minutes: number;
  chapter_ids: string[];
  cq_question_ids?: string[];
  mcq_question_ids?: string[];
  required_cq_count?: number; // e.g. 5 out of 8
}

export interface ExamSubpartAnswer {
  subpart_id: string;
  user_text: string;
  self_awarded_marks?: number;
  max_marks: number;
}

export interface ExamAnswerRecord {
  question_id: string;
  subpart_id?: string;
  selected_mcq_option?: string;
  selected_option?: string;
  written_text_answer?: string;
  cq_subpart_answers?: Record<string, ExamSubpartAnswer>;
  is_marked_for_review?: boolean;
  is_correct?: boolean;
  awarded_marks?: number;
  max_marks?: number;
  time_spent_seconds: number;
}

export interface ExamEvaluationRecord {
  id?: string;
  exam_id?: string;
  exam_title: string;
  subject_id: string;
  paper_id?: string;
  exam_type?: ExamType;
  total_marks_obtained?: number;
  obtained_marks?: number;
  total_max_marks?: number;
  total_marks?: number;
  total_questions?: number;
  percentage: number;
  gpa?: number; // 5.0 scale
  letter_grade?: string; // 'A+', 'A', 'A-', 'B', 'C', 'D', 'F'
  grade?: string;
  time_taken_seconds?: number;
  time_spent_seconds?: number;
  allocated_time_seconds?: number;
  allocated_minutes?: number;
  answers?: Record<string, ExamAnswerRecord>;
  weak_concept_ids?: string[];
  strong_concept_ids?: string[];
  cognitive_performance?: {
    knowledge_pct?: number;
    understanding_pct?: number;
    application_pct?: number;
    higher_ability_pct?: number;
    knowledge?: number;
    understanding?: number;
    application?: number;
    higher_ability?: number;
  };
  chapter_breakdown?: {
    chapter_id: string;
    chapter_name?: string;
    score?: number;
    max_score?: number;
    score_percent?: number;
    total_questions?: number;
    correct_questions?: number;
    percentage?: number;
  }[];
  question_evaluations?: {
    question_id: string;
    question_format: QuestionFormat;
    score_obtained: number;
    max_score: number;
    is_correct: boolean;
    student_answer: string;
    model_solution_latex: string;
    feedback_bn: string;
    time_spent_seconds: number;
  }[];
  speed_accuracy_metric?: {
    avg_seconds_per_mark: number;
    rushed_errors_count: number;
    optimal_answers_count: number;
    concept_weakness_summary: string[];
  };
  completed_at: string;
}

// --- Worksheet & Printable Document Types ---
export type WorksheetType = 'board_question_paper' | 'weakness_remedial' | 'formula_cheat_sheet';

export interface WorksheetConfig {
  id?: string;
  worksheet_type: WorksheetType;
  subject_id: string;
  paper_id: string;
  chapter_ids: string[];
  board?: string;
  board_name?: string;
  exam_year?: number;
  question_format_filter?: 'all' | 'CQ' | 'MCQ' | 'both' | 'cq_only' | 'mcq_only';
  layout_style?: 'standard' | 'compact' | 'two_column' | 'workbook';
  target_cq_count?: number;
  target_mcq_count?: number;
  include_solution_key: boolean;
  include_marking_rubrics: boolean;
  include_formula_cheat?: boolean;
  include_student_header?: boolean;
  custom_title?: string;
  custom_institution_name?: string;
  created_at?: string;
}

// --- User Profile & Preferences Types ---
export type StudentClassLevel =
  | 'hsc_1st' // এইচএসসি ১ম বর্ষ (একাদশ)
  | 'hsc_2nd' // এইচএসসি ২য় বর্ষ (দ্বাদশ)
  | 'hsc_examinee' // এইচএসসি পরীক্ষার্থী / প্রি-টেস্ট
  | 'admission_seeker' // এডমিশন পরীক্ষার্থী (Engineering/Medical/Varsity)
  | 'alumni';

export type TargetTrack =
  | 'engineering' // বুয়েট / চুয়েট / কুয়েট / রুয়েট / আইইউটি
  | 'medical' // ডিএমসি / সরকারি মেডিকেল কলেজ
  | 'varsity_science' // ঢাবি ‘ক’ ইউনিট / গুচ্ছ বিজ্ঞান
  | 'architecture' // স্থাপত্যবিদ্যা
  | 'board_gpa5'; // বোর্ড পরীক্ষায় গোল্ডেন এ+

export interface UserProfile {
  id: string;
  name: string;
  avatar_id: string; // 'scholar', 'physicist', 'chemist', 'mathematician', 'doctor', 'coder'
  current_class: StudentClassLevel;
  age: number;
  target_exam_batch: string; // 'HSC 2025', 'HSC 2026', 'HSC 2027'
  target_track: TargetTrack;
  institution_name: string;
  education_board: string;
  daily_study_goal_hours: number;
  daily_question_target: number;
  dream_institution: string;
  bio_motto: string;
  strong_subject_ids: string[];
  weak_subject_ids: string[];
  created_at: string;
  updated_at: string;
}

// --- App Settings Types ---
export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'bn' | 'en';
  sound_effects: boolean;
  auto_timer_alerts: boolean;
  font_preference: 'sans' | 'serif';
  default_exam_mode: 'combo_board' | 'full_cq' | 'full_mcq';
  default_worksheet_layout: 'standard' | 'compact' | 'workbook';
}
