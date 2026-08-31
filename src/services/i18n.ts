import { CANONICAL_SUBJECTS, CANONICAL_PAPERS } from '../data/canonicalTaxonomy';

export type Language = 'bn' | 'en';

export const DICTIONARY = {
  // --- Common UI & Global ---
  app_name: {
    bn: 'HSC Study Intelligence',
    en: 'HSC Study Intelligence',
  },
  app_tagline: {
    bn: 'তথ্যভিত্তিক অ্যানালাইসিস, ডাউট সলভ ও খাতা মূল্যায়ন',
    en: 'Evidence-grounded learning, exam simulation & paper evaluation',
  },
  nctb_badge: {
    bn: 'NCTB কারিকুলাম',
    en: 'NCTB Science & Arts',
  },
  search_placeholder: {
    bn: 'প্রশ্ন, সূত্র বা টপিক খুঁজুন...',
    en: 'Search questions, formulas, or topics...',
  },
  all: {
    bn: 'সব / সকল',
    en: 'All',
  },
  all_papers: {
    bn: 'উভয় পত্র (১ম ও ২য়)',
    en: 'Both Papers (1st & 2nd)',
  },
  all_chapters: {
    bn: 'সকল অধ্যায়',
    en: 'All Chapters',
  },
  all_boards: {
    bn: 'সকল শিক্ষা বোর্ড',
    en: 'All Education Boards',
  },
  save: {
    bn: 'সংরক্ষণ করুন',
    en: 'Save',
  },
  cancel: {
    bn: 'বাতিল',
    en: 'Cancel',
  },
  close: {
    bn: 'বন্ধ করুন',
    en: 'Close',
  },
  delete: {
    bn: 'মুছে ফেলুন',
    en: 'Delete',
  },
  load: {
    bn: 'লোড করুন',
    en: 'Load',
  },
  copy: {
    bn: 'কপি করুন',
    en: 'Copy',
  },
  copied: {
    bn: 'কপি হয়েছে!',
    en: 'Copied!',
  },
  print: {
    bn: 'প্রিন্ট / PDF সেভ',
    en: 'Print / Save PDF',
  },
  export_json: {
    bn: 'JSON এক্সপোর্ট',
    en: 'Export JSON',
  },
  confirm: {
    bn: 'নিশ্চিত করুন',
    en: 'Confirm',
  },
  loading: {
    bn: 'লোড হচ্ছে...',
    en: 'Loading...',
  },

  // --- Navigation Tabs ---
  nav_dashboard: {
    bn: 'ড্যাশবোর্ড',
    en: 'Dashboard',
  },
  nav_scanner: {
    bn: 'খাতা ও চিত্র স্ক্যানার',
    en: 'Paper Scanner',
  },
  nav_colleges: {
    bn: 'টপ কলেজ টেস্ট পেপার',
    en: 'Top Colleges',
  },
  nav_exam: {
    bn: 'মক টেস্ট সিমুলেটর',
    en: 'Exam Simulator',
  },
  nav_worksheet: {
    bn: 'ওয়ার্কশিট ও PDF',
    en: 'Worksheet & PDF',
  },
  nav_tutor: {
    bn: 'এআই টিউটর',
    en: 'AI Tutor',
  },
  nav_questions: {
    bn: 'প্রশ্ন ভান্ডার',
    en: 'Question Bank',
  },
  nav_mistakes: {
    bn: 'ভুল শোধনাগার',
    en: 'Mistake Vault',
  },
  nav_sprint: {
    bn: 'স্টাডি স্প্রিন্ট',
    en: 'Study Sprint',
  },
  nav_ingest: {
    bn: 'বই ও পিডিএফ লাইব্রেরি',
    en: 'Book Library & OCR',
  },
  nav_taxonomy: {
    bn: 'সিলেবাস ও সূত্র',
    en: 'Syllabus & Formulas',
  },
  nav_profile: {
    bn: 'প্রোফাইল',
    en: 'Profile',
  },
  nav_settings: {
    bn: 'সেটিংস',
    en: 'Settings',
  },

  // --- Worksheet Generator Specific ---
  ws_badge: {
    bn: 'প্রশ্নপত্র ও ওয়ার্কশিট জেনারেটর',
    en: 'Question Paper & Worksheet Generator',
  },
  ws_subbadge: {
    bn: 'Printable PDF & Practice Sheets',
    en: 'Printable PDF & Practice Sheets',
  },
  ws_heading: {
    bn: 'বোর্ড স্ট্যান্ডার্ড প্রিন্টেবল প্রশ্নপত্র ও রিভিশন শিট',
    en: 'Board Standard Printable Question Paper & Revision Sheet',
  },
  ws_save_config_btn: {
    bn: 'কনফিগারেশন সেভ করুন',
    en: 'Save Configuration',
  },
  ws_saved_presets_btn: {
    bn: 'সংরক্ষিত প্রিসেট',
    en: 'Saved Presets',
  },
  ws_instructions_title: {
    bn: 'কীভাবে সেভ করবেন ও PDF ডাউনলোড করবেন?',
    en: 'How to save presets and download PDFs?',
  },
  ws_instructions_body: {
    bn: '• কনফিগারেশন সেভ করুন: বিষয়, অধ্যায় ও প্রশ্নের অপশন ব্রাউজারে সংরক্ষিত থাকবে।\n• PDF সেভ: "প্রিন্ট / PDF সেভ" বাটনে ক্লিক করে Destination থেকে "Save as PDF" নির্বাচন করুন।',
    en: '• Save Configuration: Saves your selected subject, chapters, and question format in browser memory.\n• Save as PDF: Click "Print / Save PDF" and choose "Save as PDF" in your print dialog.',
  },
  ws_config_title: {
    bn: 'ওয়ার্কশিট কনফিগারেশন',
    en: 'Worksheet Configuration',
  },
  ws_subject_label: {
    bn: 'বিষয়',
    en: 'Subject',
  },
  ws_paper_label: {
    bn: 'পত্র',
    en: 'Paper',
  },
  ws_format_label: {
    bn: 'প্রশ্নের ধরন',
    en: 'Question Format',
  },
  ws_format_both: {
    bn: 'সমন্বিত (CQ+MCQ)',
    en: 'Combined (CQ + MCQ)',
  },
  ws_format_cq_only: {
    bn: 'কেবলমাত্র CQ',
    en: 'CQ Only (Creative)',
  },
  ws_format_mcq_only: {
    bn: 'কেবলমাত্র MCQ',
    en: 'MCQ Only',
  },
  ws_cq_count_label: {
    bn: 'CQ সংখ্যা',
    en: 'CQ Count',
  },
  ws_mcq_count_label: {
    bn: 'MCQ সংখ্যা',
    en: 'MCQ Count',
  },
  ws_chapters_label: {
    bn: 'নির্দিষ্ট অধ্যায় নির্বাচন',
    en: 'Chapter Filter',
  },
  ws_board_label: {
    bn: 'বোর্ড ফিল্টার',
    en: 'Board Filter',
  },
  ws_layout_label: {
    bn: 'প্রিন্ট লেআউট ও ফাঁকা স্থান',
    en: 'Print Layout & Spacing',
  },
  ws_layout_standard: {
    bn: 'স্ট্যান্ডার্ড বোর্ড',
    en: 'Standard Board',
  },
  ws_layout_compact: {
    bn: 'কমপ্যাক্ট রিভিশন',
    en: 'Compact Revision',
  },
  ws_layout_workbook: {
    bn: 'ওয়ার্কবুক (উত্তর লেখার লাইনসহ)',
    en: 'Workbook (With Ruled Lines)',
  },
  ws_toggle_header: {
    bn: 'পরীক্ষার্থীর নাম ও রোল নাম্বার হেডার',
    en: 'Student Name & Roll No. Header',
  },
  ws_toggle_formula: {
    bn: 'গুরুত্বপূর্ণ সূত্রের তালিকা (Formula Cheat-Sheet)',
    en: 'Key Formula Cheat Sheet',
  },
  ws_toggle_answer_key: {
    bn: 'MCQ উত্তরপত্র (Answer Key) অন্তর্ভুক্ত করুন',
    en: 'Include MCQ Answer Key',
  },
  ws_toggle_solutions: {
    bn: 'পূর্ণাঙ্গ মডেল সমাধান ও মার্কিং রুব্রিক পেজ',
    en: 'Full Model Solutions & Rubrics Sheet',
  },
  ws_institute_label: {
    bn: 'প্রতিষ্ঠানের নাম',
    en: 'Institution Name',
  },
  ws_exam_title_label: {
    bn: 'পরীক্ষার শিরোনাম',
    en: 'Exam Title',
  },
  ws_tab_paper_preview: {
    bn: '📄 প্রিন্টেবল প্রশ্নপত্র (A4 Sheet)',
    en: '📄 Printable Paper (A4 Sheet)',
  },
  ws_tab_question_preview: {
    bn: '🔍 প্রশ্ন প্রিভিউ ও তালিকা (Live Preview)',
    en: '🔍 Questions Preview & List',
  },
  ws_tab_solutions: {
    bn: '💡 মডেল সমাধান শিট (Model Solutions)',
    en: '💡 Model Solutions Sheet',
  },
  ws_time_label: {
    bn: 'সময়',
    en: 'Time',
  },
  ws_minutes: {
    bn: 'মিনিট',
    en: 'minutes',
  },
  ws_full_marks: {
    bn: 'পূর্ণমান',
    en: 'Full Marks',
  },
  ws_student_name: {
    bn: 'পরীক্ষার্থীর নাম',
    en: 'Student Name',
  },
  ws_roll_no: {
    bn: 'রোল নং',
    en: 'Roll No',
  },
  ws_section: {
    bn: 'সেকশন / ব্যাচ',
    en: 'Section / Batch',
  },
  ws_section_a_title: {
    bn: 'বিভাগ — ‘ক’ : সৃজনশীল প্রশ্ন',
    en: 'Section — A : Creative Questions (CQ)',
  },
  ws_section_b_title: {
    bn: 'বিভাগ — ‘খ’ : বহুনির্বাচনি প্রশ্ন',
    en: 'Section — B : Multiple Choice Questions (MCQ)',
  },
  ws_mcq_answer_key_title: {
    bn: 'বহুনির্বাচনি উত্তরমালা (MCQ Answer Key)',
    en: 'MCQ Answer Key Table',
  },

  // --- Dashboard ---
  db_welcome: {
    bn: 'এইচএসসি প্রস্তুতি ইন্টেলিজেন্স ড্যাশবোর্ড',
    en: 'HSC Preparation Intelligence Dashboard',
  },
  db_overview: {
    bn: 'সামগ্রিক প্রস্তুতি ও পারফরম্যান্স ওভারভিউ',
    en: 'Overall Readiness & Performance Overview',
  },
  db_accuracy: {
    bn: 'গড় নির্ভুলতা (Accuracy)',
    en: 'Average Accuracy',
  },
  db_mastered_concepts: {
    bn: 'দক্ষতা অর্জিত কনসেপ্ট',
    en: 'Mastered Concepts',
  },
  db_weak_concepts: {
    bn: 'দুর্বল কনসেপ্ট ও ঘাটতি',
    en: 'Weak Concepts & Gaps',
  },
  db_unrectified_mistakes: {
    bn: 'অশোধিত ভুলসমূহ',
    en: 'Unrectified Mistakes',
  },
  db_start_practice: {
    bn: 'অ্যাডাপ্টিভ অনুশীলন শুরু করুন',
    en: 'Start Adaptive Practice',
  },
  db_view_mistakes: {
    bn: 'ভুল শোধনাগারে যান',
    en: 'Go to Mistake Vault',
  },
  db_top_colleges_quick: {
    bn: 'টপ কলেজ টেস্ট পেপার প্রশ্ন',
    en: 'Top College Test Papers',
  },
  db_study_plan: {
    bn: 'আজকের প্রস্তাবিত রিভিশন',
    en: 'Today’s Suggested Revision',
  },

  // --- Exam Simulator ---
  exam_title: {
    bn: 'এইচএসসি মক টেস্ট সিমুলেটর',
    en: 'HSC Mock Test Simulator',
  },
  exam_subtitle: {
    bn: 'বোর্ড প্রশ্ন স্ট্যান্ডার্ড সময়াবদ্ধ পরীক্ষা ও নিখুঁত মার্কিং',
    en: 'Timed Board Exam Simulation & Precision Evaluation',
  },
  exam_start_btn: {
    bn: 'পরীক্ষা শুরু করুন',
    en: 'Start Exam',
  },
  exam_submit_btn: {
    bn: 'পরীক্ষা জমা দিন (Submit Exam)',
    en: 'Submit Exam',
  },
  exam_time_left: {
    bn: 'বাকি সময়',
    en: 'Time Remaining',
  },
  exam_review_mode: {
    bn: 'সমাধান ও রিভিউ মোড',
    en: 'Solutions & Review Mode',
  },

  // --- Scanner ---
  scanner_title: {
    bn: 'খাতা মূল্যায়ন ও চিত্র স্ক্যানার',
    en: 'Handwritten Answer & Diagram Evaluator',
  },
  scanner_subtitle: {
    bn: 'হাতে লেখা উত্তর, সমীকরণ ও ডায়াগ্রাম সরাসরি ছবি তুলে এআই চেকিং',
    en: 'Photograph your handwritten answer script for instant step-by-step grading',
  },
  scanner_capture_btn: {
    bn: 'ক্যামেরায় ছবি তুলুন',
    en: 'Take Photo with Camera',
  },
  scanner_upload_btn: {
    bn: 'গ্যালারি / ফাইল থেকে আপলোড',
    en: 'Upload from Files / Gallery',
  },
  scanner_evaluating: {
    bn: 'খাতা মূল্যায়ন ও সমাধান যাচাই হচ্ছে...',
    en: 'Grading handwriting & analyzing steps...',
  },

  // --- Mistake Vault ---
  mv_title: {
    bn: 'ব্যক্তিগত ভুল শোধনাগার (Mistake Vault)',
    en: 'Personal Mistake Vault',
  },
  mv_subtitle: {
    bn: 'পরীক্ষা ও প্র্যাকটিসে করা ভুলের নিখুঁত বিশ্লেষণ ও স্পেসড রিপিটেশন',
    en: 'Detailed taxonomy of errors, traps, and spaced repetition review',
  },
  mv_rectified: {
    bn: 'শোধিত ভুল',
    en: 'Rectified',
  },
  mv_unrectified: {
    bn: 'অশোধিত ভুল (পুনরায় সমাধান প্রয়োজন)',
    en: 'Unrectified (Needs Review)',
  },

  // --- Grounded Tutor ---
  tutor_title: {
    bn: 'বই-রেফারেন্সভিত্তিক এআই শিক্ষক (Grounded Socratic Tutor)',
    en: 'Book-Grounded Socratic AI Tutor',
  },
  tutor_subtitle: {
    bn: 'এনসিটিবি পাঠ্যবই ও আপলোড করা বইয়ের পৃষ্ঠা কোটেশনসহ ডাউট সলভিং',
    en: 'Doubt resolution with exact NCTB citations & scanned textbook page references',
  },
  tutor_input_placeholder: {
    bn: 'পদার্থ, রসায়ন, গণিত, বায়োলজি, বাংলা, ইংরেজি বা আইসিটির যেকোনো প্রশ্ন বা অঙ্ক লিখুন...',
    en: 'Type any doubt in Physics, Chemistry, Math, Biology, Bangla, English, or ICT...',
  },
  tutor_ask_btn: {
    bn: 'জিজ্ঞেস করুন',
    en: 'Ask Tutor',
  },

  // --- Settings ---
  settings_title: {
    bn: 'অ্যাপ্লিকেশন সেটিংস ও ডেটা ব্যাকআপ',
    en: 'Application Settings & Data Backup',
  },
  settings_theme_label: {
    bn: 'থিম ও ডিসপ্লে মোড',
    en: 'Theme & Display Mode',
  },
  settings_theme_light: {
    bn: 'লাইট মোড (Light Mode)',
    en: 'Light Mode',
  },
  settings_theme_dark: {
    bn: 'ডার্ক মোড (Dark Mode)',
    en: 'Dark Mode',
  },
  settings_lang_label: {
    bn: 'ভাষা (Language)',
    en: 'Language',
  },
  settings_lang_bn: {
    bn: 'বাংলা (Bengali)',
    en: 'Bengali (বাংলা)',
  },
  settings_lang_en: {
    bn: 'English (ইংরেজি)',
    en: 'English',
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

export function t(key: TranslationKey, lang: Language = 'bn'): string {
  const entry = DICTIONARY[key];
  if (!entry) return key;
  return entry[lang] || entry['bn'] || key;
}

export function getSubjectDisplayName(subjectId: string, lang: Language = 'bn'): string {
  const sub = CANONICAL_SUBJECTS.find((s) => s.id === subjectId);
  if (!sub) return subjectId;
  return lang === 'en' ? sub.name_en : sub.name_bn;
}

export function getPaperDisplayName(paperId: string, lang: Language = 'bn'): string {
  if (paperId === 'all') {
    return lang === 'en' ? 'Both Papers (Combined)' : 'উভয় পত্র (সমন্বিত)';
  }
  const paper = CANONICAL_PAPERS.find((p) => p.id === paperId);
  if (!paper) return paperId;
  return lang === 'en' ? paper.name_en : paper.name_bn;
}
