import {
  Subject,
  Paper,
  Chapter,
  Topic,
  Concept,
  ScenarioArchetype,
  ConceptVariant,
  Question,
  DocumentChunk,
} from '../types';

export const CANONICAL_SUBJECTS: Subject[] = [
  {
    id: 'phy',
    name_en: 'Physics',
    name_bn: 'পদার্থবিজ্ঞান',
    code: '174',
    icon: 'Atom',
    color: 'emerald'
  },
  {
    id: 'chem',
    name_en: 'Chemistry',
    name_bn: 'রসায়ন',
    code: '176',
    icon: 'FlaskConical',
    color: 'sky'
  },
  {
    id: 'hmath',
    name_en: 'Higher Mathematics',
    name_bn: 'উচ্চতর গণিত',
    code: '265',
    icon: 'Binary',
    color: 'amber'
  },
  {
    id: 'bio',
    name_en: 'Biology',
    name_bn: 'জীববিজ্ঞান',
    code: '178',
    icon: 'Dna',
    color: 'rose'
  },
  {
    id: 'bangla',
    name_en: 'Bangla',
    name_bn: 'বাংলা',
    code: '101',
    icon: 'BookOpen',
    color: 'pink'
  },
  {
    id: 'english',
    name_en: 'English',
    name_bn: 'ইংরেজি',
    code: '107',
    icon: 'Languages',
    color: 'indigo'
  },
  {
    id: 'ict',
    name_en: 'Information & Comm. Technology',
    name_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    code: '275',
    icon: 'Cpu',
    color: 'teal'
  }
];

export const CANONICAL_PAPERS: Paper[] = [
  { id: 'phy_1', subject_id: 'phy', paper_number: 1, name_en: 'Physics 1st Paper', name_bn: 'পদার্থবিজ্ঞান ১ম পত্র' },
  { id: 'phy_2', subject_id: 'phy', paper_number: 2, name_en: 'Physics 2nd Paper', name_bn: 'পদার্থবিজ্ঞান ২য় পত্র' },
  { id: 'chem_1', subject_id: 'chem', paper_number: 1, name_en: 'Chemistry 1st Paper', name_bn: 'রসায়ন ১ম পত্র' },
  { id: 'chem_2', subject_id: 'chem', paper_number: 2, name_en: 'Chemistry 2nd Paper', name_bn: 'রসায়ন ২য় পত্র' },
  { id: 'hmath_1', subject_id: 'hmath', paper_number: 1, name_en: 'Higher Math 1st Paper', name_bn: 'উচ্চতর গণিত ১ম পত্র' },
  { id: 'hmath_2', subject_id: 'hmath', paper_number: 2, name_en: 'Higher Math 2nd Paper', name_bn: 'উচ্চতর গণিত ২য় পত্র' },
  { id: 'bio_1', subject_id: 'bio', paper_number: 1, name_en: 'Biology 1st Paper (Botany)', name_bn: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)' },
  { id: 'bio_2', subject_id: 'bio', paper_number: 2, name_en: 'Biology 2nd Paper (Zoology)', name_bn: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)' },
  { id: 'bangla_1', subject_id: 'bangla', paper_number: 1, name_en: 'Bangla 1st Paper (Sahitya & Sahapath)', name_bn: 'বাংলা ১ম পত্র (সাহিত্যপাঠ ও সহপাঠ)' },
  { id: 'bangla_2', subject_id: 'bangla', paper_number: 2, name_en: 'Bangla 2nd Paper (Byakaran & Nirmiti)', name_bn: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)' },
  { id: 'english_1', subject_id: 'english', paper_number: 1, name_en: 'English 1st Paper (English For Today)', name_bn: 'ইংরেজি ১ম পত্র (English For Today)' },
  { id: 'english_2', subject_id: 'english', paper_number: 2, name_en: 'English 2nd Paper (Grammar & Writing)', name_bn: 'ইংরেজি ২য় পত্র (Grammar & Composition)' },
  { id: 'ict_1', subject_id: 'ict', paper_number: 1, name_en: 'ICT Complete Paper', name_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি' }
];

export const CANONICAL_CHAPTERS: Chapter[] = [
  // Physics 1st Paper
  { id: 'phy_1_ch2', paper_id: 'phy_1', chapter_number: 2, name_en: 'Vectors', name_bn: 'ভেক্টর', syllabus_weight: 1.2, total_board_questions_analyzed: 24 },
  { id: 'phy_1_ch3', paper_id: 'phy_1', chapter_number: 3, name_en: 'Dynamics', name_bn: 'গতিবিদ্যা', syllabus_weight: 1.3, total_board_questions_analyzed: 28 },
  { id: 'phy_1_ch4', paper_id: 'phy_1', chapter_number: 4, name_en: 'Newtonian Mechanics', name_bn: 'নিউটনীয় বলবিদ্যা', syllabus_weight: 1.5, total_board_questions_analyzed: 36 },
  { id: 'phy_1_ch5', paper_id: 'phy_1', chapter_number: 5, name_en: 'Work, Energy & Power', name_bn: 'কাজ, শক্তি ও ক্ষমতা', syllabus_weight: 1.4, total_board_questions_analyzed: 32 },
  { id: 'phy_1_ch8', paper_id: 'phy_1', chapter_number: 8, name_en: 'Periodic Motion', name_bn: 'পর্যায়বৃত্ত গতি', syllabus_weight: 1.3, total_board_questions_analyzed: 26 },
  { id: 'phy_1_ch10', paper_id: 'phy_1', chapter_number: 10, name_en: 'Ideal Gas & Kinetic Theory', name_bn: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', syllabus_weight: 1.4, total_board_questions_analyzed: 30 },

  // Physics 2nd Paper
  { id: 'phy_2_ch1', paper_id: 'phy_2', chapter_number: 1, name_en: 'Thermodynamics', name_bn: 'তাপগতিবিদ্যা', syllabus_weight: 1.5, total_board_questions_analyzed: 38 },
  { id: 'phy_2_ch2', paper_id: 'phy_2', chapter_number: 2, name_en: 'Static Electricity', name_bn: 'স্থির তড়িৎ', syllabus_weight: 1.4, total_board_questions_analyzed: 32 },
  { id: 'phy_2_ch3', paper_id: 'phy_2', chapter_number: 3, name_en: 'Current Electricity', name_bn: 'চল তড়িৎ', syllabus_weight: 1.5, total_board_questions_analyzed: 40 },
  { id: 'phy_2_ch7', paper_id: 'phy_2', chapter_number: 7, name_en: 'Physical Optics', name_bn: 'ভৌত আলোকবিজ্ঞান', syllabus_weight: 1.3, total_board_questions_analyzed: 22 },
  { id: 'phy_2_ch8', paper_id: 'phy_2', chapter_number: 8, name_en: 'Modern Physics', name_bn: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', syllabus_weight: 1.4, total_board_questions_analyzed: 29 },

  // Chemistry 1st Paper
  { id: 'chem_1_ch2', paper_id: 'chem_1', chapter_number: 2, name_en: 'Qualitative Chemistry', name_bn: 'গুণগত রসায়ন', syllabus_weight: 1.5, total_board_questions_analyzed: 35 },
  { id: 'chem_1_ch3', paper_id: 'chem_1', chapter_number: 3, name_en: 'Periodic Properties & Chemical Bonds', name_bn: 'পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', syllabus_weight: 1.4, total_board_questions_analyzed: 34 },
  { id: 'chem_1_ch4', paper_id: 'chem_1', chapter_number: 4, name_en: 'Chemical Changes', name_bn: 'রাসায়নিক পরিবর্তন', syllabus_weight: 1.5, total_board_questions_analyzed: 39 },

  // Chemistry 2nd Paper
  { id: 'chem_2_ch1', paper_id: 'chem_2', chapter_number: 1, name_en: 'Environmental Chemistry', name_bn: 'পরিবেশ রসায়ন', syllabus_weight: 1.4, total_board_questions_analyzed: 33 },
  { id: 'chem_2_ch2', paper_id: 'chem_2', chapter_number: 2, name_en: 'Organic Chemistry', name_bn: 'জৈব রসায়ন', syllabus_weight: 1.8, total_board_questions_analyzed: 52 },
  { id: 'chem_2_ch3', paper_id: 'chem_2', chapter_number: 3, name_en: 'Quantitative Chemistry', name_bn: 'পরিমাণগত রসায়ন', syllabus_weight: 1.5, total_board_questions_analyzed: 37 },

  // Higher Mathematics 1st Paper
  { id: 'hmath_1_ch1', paper_id: 'hmath_1', chapter_number: 1, name_en: 'Matrices & Determinants', name_bn: 'ম্যাট্রিক্স ও নির্ণায়ক', syllabus_weight: 1.2, total_board_questions_analyzed: 24 },
  { id: 'hmath_1_ch3', paper_id: 'hmath_1', chapter_number: 3, name_en: 'Straight Lines', name_bn: 'সরলরেখা', syllabus_weight: 1.4, total_board_questions_analyzed: 34 },
  { id: 'hmath_1_ch9', paper_id: 'hmath_1', chapter_number: 9, name_en: 'Differentiation', name_bn: 'অন্তরীকরণ', syllabus_weight: 1.6, total_board_questions_analyzed: 42 },
  { id: 'hmath_1_ch10', paper_id: 'hmath_1', chapter_number: 10, name_en: 'Integration', name_bn: 'যোগজীকরণ', syllabus_weight: 1.6, total_board_questions_analyzed: 44 },

  // Higher Mathematics 2nd Paper
  { id: 'hmath_2_ch3', paper_id: 'hmath_2', chapter_number: 3, name_en: 'Complex Numbers', name_bn: 'জটিল সংখ্যা', syllabus_weight: 1.3, total_board_questions_analyzed: 25 },
  { id: 'hmath_2_ch4', paper_id: 'hmath_2', chapter_number: 4, name_en: 'Polynomials & Equations', name_bn: 'বহুপদী ও বহুপদী সমীকরণ', syllabus_weight: 1.4, total_board_questions_analyzed: 30 },
  { id: 'hmath_2_ch6', paper_id: 'hmath_2', chapter_number: 6, name_en: 'Conics', name_bn: 'কণিক (পরাবৃত্ত, উপবৃত্ত, অধিবৃত্ত)', syllabus_weight: 1.5, total_board_questions_analyzed: 35 },
  { id: 'hmath_2_ch7', paper_id: 'hmath_2', chapter_number: 7, name_en: 'Inverse Trigonometric Functions', name_bn: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ', syllabus_weight: 1.4, total_board_questions_analyzed: 28 },

  // Chemistry 2nd Paper
  { id: 'chem_2_ch4', paper_id: 'chem_2', chapter_number: 4, name_en: 'Electrochemistry', name_bn: 'তড়িৎ রসায়ন', syllabus_weight: 1.5, total_board_questions_analyzed: 38 },

  // Biology 1st Paper (Botany)
  { id: 'bio_1_ch1', paper_id: 'bio_1', chapter_number: 1, name_en: 'Cell & Its Structure', name_bn: 'কোষ ও এর গঠন', syllabus_weight: 1.5, total_board_questions_analyzed: 36 },
  { id: 'bio_1_ch2', paper_id: 'bio_1', chapter_number: 2, name_en: 'Cell Division', name_bn: 'কোষ বিভাজন', syllabus_weight: 1.4, total_board_questions_analyzed: 32 },
  { id: 'bio_1_ch9', paper_id: 'bio_1', chapter_number: 9, name_en: 'Plant Physiology', name_bn: 'উদ্ভিদ শারীরতত্ত্ব', syllabus_weight: 1.6, total_board_questions_analyzed: 45 },
  { id: 'bio_1_ch11', paper_id: 'bio_1', chapter_number: 11, name_en: 'Biotechnology', name_bn: 'জীবপ্রযুক্তি', syllabus_weight: 1.4, total_board_questions_analyzed: 30 },

  // Biology 2nd Paper (Zoology)
  { id: 'bio_2_ch1', paper_id: 'bio_2', chapter_number: 1, name_en: 'Animal Diversity & Classification', name_bn: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', syllabus_weight: 1.4, total_board_questions_analyzed: 34 },
  { id: 'bio_2_ch3', paper_id: 'bio_2', chapter_number: 3, name_en: 'Human Physiology: Digestion & Absorption', name_bn: 'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', syllabus_weight: 1.5, total_board_questions_analyzed: 38 },
  { id: 'bio_2_ch4', paper_id: 'bio_2', chapter_number: 4, name_en: 'Human Physiology: Blood & Circulation', name_bn: 'মানব শারীরতত্ত্ব: রক্ত ও সংবহন', syllabus_weight: 1.5, total_board_questions_analyzed: 40 },
  { id: 'bio_2_ch11', paper_id: 'bio_2', chapter_number: 11, name_en: 'Genetics & Evolution', name_bn: 'জিনতত্ত্ব ও বিবর্তন', syllabus_weight: 1.6, total_board_questions_analyzed: 42 },

  // Bangla 1st Paper (Sahitya & Sahapath)
  { id: 'bangla_1_ch1', paper_id: 'bangla_1', chapter_number: 1, name_en: 'Oporichita (Story)', name_bn: 'অপরিচিতা (গল্প) - রবীন্দ্রনাথ ঠাকুর', syllabus_weight: 1.5, total_board_questions_analyzed: 28 },
  { id: 'bangla_1_ch2', paper_id: 'bangla_1', chapter_number: 2, name_en: 'Bilashi (Story)', name_bn: 'বিলাসী (গল্প) - শরৎচন্দ্র চট্টোপাধ্যায়', syllabus_weight: 1.4, total_board_questions_analyzed: 26 },
  { id: 'bangla_1_ch3', paper_id: 'bangla_1', chapter_number: 3, name_en: 'Raincoat (Story)', name_bn: 'রেইনকোট (গল্প) - আখতারুজ্জামান ইলিয়াস', syllabus_weight: 1.6, total_board_questions_analyzed: 32 },
  { id: 'bangla_1_ch4', paper_id: 'bangla_1', chapter_number: 4, name_en: 'Bidrohi (Poem)', name_bn: 'বিদ্রোহী (কবিতা) - কাজী নজরুল ইসলাম', syllabus_weight: 1.5, total_board_questions_analyzed: 30 },
  { id: 'bangla_1_ch5', paper_id: 'bangla_1', chapter_number: 5, name_en: 'Lalsalu (Novel)', name_bn: 'লালসালু (উপন্যাস) - সৈয়দ ওয়ালীউল্লাহ', syllabus_weight: 1.6, total_board_questions_analyzed: 35 },
  { id: 'bangla_1_ch6', paper_id: 'bangla_1', chapter_number: 6, name_en: 'Sirajuddaula (Drama)', name_bn: 'সিরাজউদ্দৌলা (নাটক) - সিকান্দার আবু জাফর', syllabus_weight: 1.6, total_board_questions_analyzed: 36 },

  // Bangla 2nd Paper (Byakaran & Nirmiti)
  { id: 'bangla_2_ch1', paper_id: 'bangla_2', chapter_number: 1, name_en: 'Pronunciation & Spelling Rules', name_bn: 'বাংলা উচ্চারণের নিয়ম ও শুদ্ধ বানান', syllabus_weight: 1.4, total_board_questions_analyzed: 24 },
  { id: 'bangla_2_ch2', paper_id: 'bangla_2', chapter_number: 2, name_en: 'Noto & Shato Bidhan', name_bn: 'ণ-ত্ব ও ষ-ত্ব বিধান', syllabus_weight: 1.3, total_board_questions_analyzed: 22 },
  { id: 'bangla_2_ch3', paper_id: 'bangla_2', chapter_number: 3, name_en: 'Parts of Speech & Word Formation', name_bn: 'ব্যাকরণিক শব্দশ্রেণি, সমাস ও প্রত্যয়', syllabus_weight: 1.6, total_board_questions_analyzed: 38 },
  { id: 'bangla_2_ch4', paper_id: 'bangla_2', chapter_number: 4, name_en: 'Sentence Transformation & Correction', name_bn: 'বাক্যতত্ত্ব, বাক্য রূপান্তর ও অপপ্রয়োগ শুদ্ধি', syllabus_weight: 1.5, total_board_questions_analyzed: 34 },

  // English 1st Paper (English For Today)
  { id: 'english_1_ch1', paper_id: 'english_1', chapter_number: 1, name_en: 'Unit 1: Personalities Making History', name_bn: 'Unit 1: Personalities Making History (Mandela & Bangabandhu)', syllabus_weight: 1.5, total_board_questions_analyzed: 30 },
  { id: 'english_1_ch2', paper_id: 'english_1', chapter_number: 2, name_en: 'Unit 2: Dreams & Poetry Analysis', name_bn: 'Unit 2: Dreams and Poetry Theme', syllabus_weight: 1.4, total_board_questions_analyzed: 25 },
  { id: 'english_1_ch3', paper_id: 'english_1', chapter_number: 3, name_en: 'Unit 3: Traffic Education & Etiquette', name_bn: 'Unit 3: Traffic Education & Etiquette', syllabus_weight: 1.3, total_board_questions_analyzed: 22 },
  { id: 'english_1_ch4', paper_id: 'english_1', chapter_number: 4, name_en: 'Unit 4: Human Rights & Amerigo', name_bn: 'Unit 4: Human Rights & Street Children', syllabus_weight: 1.4, total_board_questions_analyzed: 26 },

  // English 2nd Paper (Grammar & Composition)
  { id: 'english_2_ch1', paper_id: 'english_2', chapter_number: 1, name_en: 'Prepositions & Special Phrases', name_bn: 'Prepositions and Special Words / Phrases', syllabus_weight: 1.4, total_board_questions_analyzed: 32 },
  { id: 'english_2_ch2', paper_id: 'english_2', chapter_number: 2, name_en: 'Completing Sentences & Conditionals', name_bn: 'Completing Sentences & Conditional Clauses', syllabus_weight: 1.5, total_board_questions_analyzed: 35 },
  { id: 'english_2_ch3', paper_id: 'english_2', chapter_number: 3, name_en: 'Right Form of Verbs & Subject-Verb Agreement', name_bn: 'Right Form of Verbs and Subject-Verb Agreement', syllabus_weight: 1.6, total_board_questions_analyzed: 40 },
  { id: 'english_2_ch4', paper_id: 'english_2', chapter_number: 4, name_en: 'Modifiers (Pre & Post Modifiers)', name_bn: 'Use of Modifiers in Context', syllabus_weight: 1.5, total_board_questions_analyzed: 36 },
  { id: 'english_2_ch5', paper_id: 'english_2', chapter_number: 5, name_en: 'Sentence Connectors & Cohesion', name_bn: 'Sentence Connectors & Logical Linkers', syllabus_weight: 1.4, total_board_questions_analyzed: 30 },
  { id: 'english_2_ch6', paper_id: 'english_2', chapter_number: 6, name_en: 'Synonyms, Antonyms & Punctuation', name_bn: 'Synonyms, Antonyms & Punctuation Marks', syllabus_weight: 1.4, total_board_questions_analyzed: 28 },

  // ICT Complete Paper
  { id: 'ict_1_ch1', paper_id: 'ict_1', chapter_number: 1, name_en: 'Global & Bangladesh Perspective', name_bn: '১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত (VR, AI, ক্রায়োসার্জারি)', syllabus_weight: 1.3, total_board_questions_analyzed: 28 },
  { id: 'ict_1_ch2', paper_id: 'ict_1', chapter_number: 2, name_en: 'Communication Systems & Networking', name_bn: '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং (টপোলজি, মিডিয়া)', syllabus_weight: 1.4, total_board_questions_analyzed: 32 },
  { id: 'ict_1_ch3', paper_id: 'ict_1', chapter_number: 3, name_en: 'Number Systems & Digital Logic Devices', name_bn: '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস (গেট, পরিপূরক, অ্যাডার)', syllabus_weight: 1.8, total_board_questions_analyzed: 54 },
  { id: 'ict_1_ch4', paper_id: 'ict_1', chapter_number: 4, name_en: 'Web Design & HTML', name_bn: '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি এবং HTML', syllabus_weight: 1.5, total_board_questions_analyzed: 36 },
  { id: 'ict_1_ch5', paper_id: 'ict_1', chapter_number: 5, name_en: 'Programming in C Language', name_bn: '৫ম অধ্যায়: প্রোগ্রামিং ভাষা (সি প্রোগ্রামিং, লুপ, অ্যারে)', syllabus_weight: 1.7, total_board_questions_analyzed: 48 },
  { id: 'ict_1_ch6', paper_id: 'ict_1', chapter_number: 6, name_en: 'Database Management System (DBMS)', name_bn: '৬ষ্ঠ অধ্যায়: ডাটাবেজ ম্যানেজমেন্ট সিস্টেম ও SQL', syllabus_weight: 1.4, total_board_questions_analyzed: 30 }
];

export const CANONICAL_TOPICS: Topic[] = [
  // Physics 1st Ch 4 (Newtonian Mechanics)
  { id: 'top_phy1_4_1', chapter_id: 'phy_1_ch4', topic_number: 1, name_en: 'Momentum & Conservation', name_bn: 'ভরবেগ ও রৈখিক ভরবেগের সংরক্ষণ' },
  { id: 'top_phy1_4_2', chapter_id: 'phy_1_ch4', topic_number: 2, name_en: 'Rotational Motion & Inertia', name_bn: 'ঘূর্ণন গতি, জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ' },
  { id: 'top_phy1_4_3', chapter_id: 'phy_1_ch4', topic_number: 3, name_en: 'Torque & Angular Momentum', name_bn: 'টর্ক ও কৌণিক ভরবেগ' },
  { id: 'top_phy1_4_4', chapter_id: 'phy_1_ch4', topic_number: 4, name_en: 'Centripetal Force & Banking of Roads', name_bn: 'কেন্দ্রমুখী বল ও রাস্তার ব্যাংকিং' },

  // Physics 2nd Ch 1 (Thermodynamics)
  { id: 'top_phy2_1_1', chapter_id: 'phy_2_ch1', topic_number: 1, name_en: 'First Law & Thermodynamic Processes', name_bn: 'প্রথম সূত্র ও তাপগতীয় প্রক্রিয়াসমূহ (সমোষ্ণ ও রুদ্ধতাপীয়)' },
  { id: 'top_phy2_1_2', chapter_id: 'phy_2_ch1', topic_number: 2, name_en: 'Carnot Engine & Efficiency', name_bn: 'কার্নো ইঞ্জিন ও দক্ষতা' },
  { id: 'top_phy2_1_3', chapter_id: 'phy_2_ch1', topic_number: 3, name_en: 'Entropy & Second Law', name_bn: 'এনট্রপি ও তাপগতিবিদ্যার দ্বিতীয় সূত্র' },

  // Chemistry 1st Ch 4 (Chemical Changes)
  { id: 'top_chem1_4_1', chapter_id: 'chem_1_ch4', topic_number: 1, name_en: 'Chemical Equilibrium & Le Chatelier', name_bn: 'রাসায়নিক সাম্যাবস্থা ও লা-শাতেলিয়ার নীতি' },
  { id: 'top_chem1_4_2', chapter_id: 'chem_1_ch4', topic_number: 2, name_en: 'Equilibrium Constants (Kp and Kc)', name_bn: 'সাম্যধ্রুবক (Kp ও Kc এর সম্পর্ক ও গাণিতিক প্রয়োগ)' },
  { id: 'top_chem1_4_3', chapter_id: 'chem_1_ch4', topic_number: 3, name_en: 'pH and Buffer Solutions', name_bn: 'pH হিসাব ও বাফার দ্রবণ ও ক্রিয়া-কৌশল' },

  // Higher Math 1st Ch 9 (Differentiation)
  { id: 'top_hmath1_9_1', chapter_id: 'hmath_1_ch9', topic_number: 1, name_en: 'Successive Differentiation', name_bn: 'পর্যায়ক্রমিক অন্তরীকরণ ($y_n$ নির্ণয়)' },
  { id: 'top_hmath1_9_2', chapter_id: 'hmath_1_ch9', topic_number: 2, name_en: 'Maxima and Minima', name_bn: 'ফাংশনের গুরুমান ও লঘুমান' },

  // Higher Math 2nd Ch 6 (Conics)
  { id: 'top_hmath2_6_1', chapter_id: 'hmath_2_ch6', topic_number: 1, name_en: 'Parabola Standard Equations', name_bn: 'পরাবৃত্তের প্রমিত সমীকরণ, উপকেন্দ্র ও নিয়ামক' },
  { id: 'top_hmath2_6_2', chapter_id: 'hmath_2_ch6', topic_number: 2, name_en: 'Ellipse and Hyperbola Eccentricity', name_bn: 'উপবৃত্ত ও অধিবৃত্তের উৎকেন্দ্রিকতা ও সমীকরণ' },

  // Chemistry 2nd Ch 2 (Organic Chemistry)
  { id: 'top_chem2_2_1', chapter_id: 'chem_2_ch2', topic_number: 1, name_en: 'Electrophilic Aromatic Substitution', name_bn: 'বেনজিনের ইলেকট্রোফিলিক প্রতিস্থাপন বিক্রিয়া (নাইট্রেশন, ফ্রিডেল-ক্রাফটস)' },
  { id: 'top_chem2_2_2', chapter_id: 'chem_2_ch2', topic_number: 2, name_en: 'Carbonyl Identification & Reactions', name_bn: 'কার্বনিল যৌগের শনাক্তকরণ (টলেন ও ফেহলিং দ্রবণ পরীক্ষা)' },

  // Chemistry 2nd Ch 4 (Electrochemistry)
  { id: 'top_chem2_4_1', chapter_id: 'chem_2_ch4', topic_number: 1, name_en: 'Galvanic Cell & Nernst Equation', name_bn: 'গ্যালভানিক কোষের EMF ও নার্নস্ট সমীকরণ' },

  // Biology 1st Ch 1 (Botany - Cell Structure)
  { id: 'top_bio1_1_1', chapter_id: 'bio_1_ch1', topic_number: 1, name_en: 'Fluid Mosaic Model of Plasma Membrane', name_bn: 'প্লাজমামেমব্রেনের ফ্লুইড মোজাইক মডেল ও প্রোটিন বিন্যাস' },
  { id: 'top_bio1_1_2', chapter_id: 'bio_1_ch1', topic_number: 2, name_en: 'DNA Double Helix & Replication', name_bn: 'ডিএনএ-এর দ্বি-সূত্রক মডেল (ওয়াটসন-ক্রিক) ও অনুলিপন' },

  // Biology 1st Ch 9 (Botany - Plant Physiology)
  { id: 'top_bio1_9_1', chapter_id: 'bio_1_ch9', topic_number: 1, name_en: 'C3 vs C4 Photosynthetic Pathways', name_bn: 'সালোকসংশ্লেষণের C3 ও C4 চক্রের তুলনামূলক বিশ্লেষণ' },

  // Biology 2nd Ch 3 (Zoology - Digestion)
  { id: 'top_bio2_3_1', chapter_id: 'bio_2_ch3', topic_number: 1, name_en: 'Carbohydrate and Protein Digestion Enzymes', name_bn: 'পাকস্থলী ও ক্ষুদ্রান্ত্রে শর্করা ও আমিষ পরিপাকের এনজাইমিক ক্রিয়া' },

  // Biology 2nd Ch 11 (Zoology - Genetics)
  { id: 'top_bio2_11_1', chapter_id: 'bio_2_ch11', topic_number: 1, name_en: 'Mendelian Genetics & Dihybrid Cross', name_bn: 'মেন্ডেলের দ্বিতীয় সূত্র ও ৯:৩:৩:১ অনুপাতের জিনতাত্ত্বিক ব্যাখ্যা' },
  { id: 'top_bio2_11_2', chapter_id: 'bio_2_ch11', topic_number: 2, name_en: 'Sex-Linked Inheritance (Hemophilia & Color Blindness)', name_bn: 'সেক্স-লিঙ্কড ডিসঅর্ডার (হিমোফিলিয়া ও বর্ণান্ধতা সঞ্চারণ)' },

  // Bangla 1st Paper (Sahitya & Sahapath)
  { id: 'top_bangla1_1_1', chapter_id: 'bangla_1_ch1', topic_number: 1, name_en: 'Oporichita Character Analysis', name_bn: 'কল্যাণী ও অনুপমের চরিত্রায়ন এবং যৌতুক বিরোধী চেতনা' },
  { id: 'top_bangla1_3_1', chapter_id: 'bangla_1_ch3', topic_number: 1, name_en: 'Raincoat Context & Symbolism', name_bn: '১৯৭১ সালের মুক্তিযুদ্ধ এবং রেইনকোটের রূপক তাৎপর্য' },
  { id: 'top_bangla1_4_1', chapter_id: 'bangla_1_ch4', topic_number: 1, name_en: 'Bidrohi Poem Thematic Stanzas', name_bn: 'বিদ্রোহী কবিতার রণতূর্য, মানবতার বন্দনা ও পরাক্রম' },
  { id: 'top_bangla1_5_1', chapter_id: 'bangla_1_ch5', topic_number: 1, name_en: 'Lalsalu Majid Hypocrisy', name_bn: 'লালসালু উপন্যাসে মজিদের ধর্মব্যবসা ও গ্রামীণ শোষণ' },

  // Bangla 2nd Paper (Byakaran & Nirmiti)
  { id: 'top_bangla2_2_1', chapter_id: 'bangla_2_ch2', topic_number: 1, name_en: 'Noto & Shato Bidhan Rules', name_bn: 'তৎসম শব্দে ণ-ত্ব ও ষ-ত্ব বিধানের ৫টি নিয়ম' },
  { id: 'top_bangla2_3_1', chapter_id: 'bangla_2_ch3', topic_number: 1, name_en: 'Samas Identification & Vyasvakya', name_bn: 'ব্যাসবাক্যসহ সমাস নির্ণয় (তৎপুরুষ, কর্মধারয়, বহুব্রীহি)' },
  { id: 'top_bangla2_4_1', chapter_id: 'bangla_2_ch4', topic_number: 1, name_en: 'Sentence Transformation Patterns', name_bn: 'সরল, জটিল ও যৌগিক বাক্যের রূপান্তর' },

  // English 1st Paper
  { id: 'top_eng1_1_1', chapter_id: 'english_1_ch1', topic_number: 1, name_en: 'Mandela Apartheid & Historic 7th March', name_bn: 'Reading Comprehension Analysis & Flow Charts' },
  { id: 'top_eng1_2_1', chapter_id: 'english_1_ch2', topic_number: 1, name_en: 'Dream Poetry Analysis & Themes', name_bn: 'Theme Writing and Poem Analysis' },

  // English 2nd Paper
  { id: 'top_eng2_1_1', chapter_id: 'english_2_ch1', topic_number: 1, name_en: 'Appropriate Prepositions', name_bn: 'Appropriate Prepositions in Context' },
  { id: 'top_eng2_2_1', chapter_id: 'english_2_ch2', topic_number: 1, name_en: 'Completing Sentences & Conditionals', name_bn: 'Conditional Clauses, Lest, As if, High Time' },
  { id: 'top_eng2_3_1', chapter_id: 'english_2_ch3', topic_number: 1, name_en: 'Right Form of Verbs', name_bn: 'Subject-Verb Agreement and Verb Forms' },
  { id: 'top_eng2_4_1', chapter_id: 'english_2_ch4', topic_number: 1, name_en: 'Modifiers Usage', name_bn: 'Pre-modifiers and Post-modifiers Rules' },

  // ICT
  { id: 'top_ict1_1_1', chapter_id: 'ict_1_ch1', topic_number: 1, name_en: 'VR, AI & Cryosurgery Applications', name_bn: 'ভার্চুয়াল রিয়েলিটি, এআই, ক্রায়োসার্জারি ও বায়োমেট্রিক্স' },
  { id: 'top_ict1_2_1', chapter_id: 'ict_1_ch2', topic_number: 1, name_en: 'Network Topologies & Cloud', name_bn: 'স্টার, মেশ, রিং টপোলজি এবং ক্লাউড কম্পিউটিং' },
  { id: 'top_ict1_3_1', chapter_id: 'ict_1_ch3', topic_number: 1, name_en: 'Number System Conversions & 2s Complement', name_bn: 'বাইনারি রূপান্তর ও ২-এর পরিপূরকে যোগ-বিয়োগ' },
  { id: 'top_ict1_3_2', chapter_id: 'ict_1_ch3', topic_number: 2, name_en: 'Logic Gates, De Morgan & Adders', name_bn: 'মৌলিক/সর্বজনীন গেট, ডিমরগ্যান ও ফুল অ্যাডার' },
  { id: 'top_ict1_4_1', chapter_id: 'ict_1_ch4', topic_number: 1, name_en: 'HTML Tables & Hyperlinks', name_bn: 'HTML টেবিল তৈরি (rowspan, colspan) ও লিংক' },
  { id: 'top_ict1_5_1', chapter_id: 'ict_1_ch5', topic_number: 1, name_en: 'C Programming Loops & Arrays', name_bn: 'সি প্রোগ্রামিং (if-else, for/while লুপ, অ্যারে)' }
];

export const CANONICAL_CONCEPTS: Concept[] = [
  // --- Physics 1st Ch 4 ---
  {
    id: 'phy_1_ch4_c_torque_angular_momentum',
    topic_id: 'top_phy1_4_3',
    chapter_id: 'phy_1_ch4',
    paper_id: 'phy_1',
    subject_id: 'phy',
    name_en: 'Torque and Conservation of Angular Momentum',
    name_bn: 'টর্ক ও কৌণিক ভরবেগের সংরক্ষণ সূত্র',
    formula_latex: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I\\vec{\\alpha}, \\quad L = I\\omega = \\text{constant}',
    core_principle_bn: 'বাহ্যিক টর্ক প্রযুক্ত না হলে (\\tau_{ext} = 0) কোনো ঘূর্ণায়মান ব্যবস্থার মোট কৌণিক ভরবেগ (L = I\\omega) সংরক্ষিত থাকে। জড়তার ভ্রামক কমলে কৌণিক বেগ বাড়ে।',
    core_principle_en: 'When external net torque is zero, total angular momentum (L = I omega) remains constant. Decreasing moment of inertia increases angular velocity.',
    syllabus_weight: 1.5,
    board_appearance_count: 14,
    variants_count: 4
  },
  {
    id: 'phy_1_ch4_c_road_banking',
    topic_id: 'top_phy1_4_4',
    chapter_id: 'phy_1_ch4',
    paper_id: 'phy_1',
    subject_id: 'phy',
    name_en: 'Banking of Road and Safe Velocity',
    name_bn: 'রাস্তার ব্যাংকিং ও নিরাপদ বেগ নির্ণয়',
    formula_latex: '\\tan\\theta = \\frac{v^2}{rg} = \\frac{h}{\\sqrt{w^2 - h^2}} \\approx \\frac{h}{w}',
    core_principle_bn: 'বাঁকা পথে উলম্বের সাথে ঢাল বা ব্যাংকিং সৃষ্টি করে কেন্দ্রমুখী বল জোগান দেওয়া হয় যেন গাড়ি না পিছলিয়ে নিরাপদে মোড় নিতে পারে।',
    core_principle_en: 'Road inclination provides the necessary centripetal component without relying on friction for safe turning.',
    syllabus_weight: 1.6,
    board_appearance_count: 16,
    variants_count: 5
  },
  {
    id: 'phy_1_ch4_c_moment_of_inertia',
    topic_id: 'top_phy1_4_2',
    chapter_id: 'phy_1_ch4',
    paper_id: 'phy_1',
    subject_id: 'phy',
    name_en: 'Moment of Inertia and Radius of Gyration',
    name_bn: 'জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ',
    formula_latex: 'I = \\sum mr^2 = MK^2, \\quad I = I_G + Md^2 \\text{ (Parallel Axis Theorem)}',
    core_principle_bn: 'নির্দিষ্ট ঘূর্ণন অক্ষের সাপেক্ষে ঘূর্ণন জড়তার পরিমাপই জড়তার ভ্রামক। সমান্তরাল ও লম্ব অক্ষ উপপাদ্য প্রয়োগ করে বিভিন্ন জ্যামিতিক বস্তুর I নির্ণয় করা যায়।',
    core_principle_en: 'Rotational inertia depends on mass distribution from axis. Calculated via parallel and perpendicular axis theorems.',
    syllabus_weight: 1.4,
    board_appearance_count: 11,
    variants_count: 3
  },

  // --- Physics 2nd Ch 1 ---
  {
    id: 'phy_2_ch1_c_carnot_engine',
    topic_id: 'top_phy2_1_2',
    chapter_id: 'phy_2_ch1',
    paper_id: 'phy_2',
    subject_id: 'phy',
    name_en: 'Carnot Engine Efficiency and Source/Sink Temperature',
    name_bn: 'কার্নো ইঞ্জিনের কর্মদক্ষতা ও উৎস-গ্রাহক তাপমাত্রা',
    formula_latex: '\\eta = 1 - \\frac{T_2}{T_1} = 1 - \\frac{Q_2}{Q_1} = \\frac{W}{Q_1}',
    core_principle_bn: 'আদর্শ প্রত্যবর্তী ইঞ্জিনের কর্মদক্ষতা শুধুমাত্র উৎস (T1) ও তাপ গ্রাহকের (T2) পরম তাপমাত্রার ওপর নির্ভর করে।',
    core_principle_en: 'Carnot cycle efficiency depends strictly on source (T1) and sink (T2) absolute temperatures.',
    syllabus_weight: 1.5,
    board_appearance_count: 18,
    variants_count: 4
  },
  {
    id: 'phy_2_ch1_c_entropy_change',
    topic_id: 'top_phy2_1_3',
    chapter_id: 'phy_2_ch1',
    paper_id: 'phy_2',
    subject_id: 'phy',
    name_en: 'Entropy Change in State Transformation',
    name_bn: 'তাপগতীয় প্রক্রিয়ায় এনট্রপির পরিবর্তন',
    formula_latex: 'dS = \\frac{dQ}{T}, \\quad \\Delta S = m s \\ln\\left(\\frac{T_2}{T_1}\\right) + \\frac{m L}{T}',
    core_principle_bn: 'অবস্থার রূপান্তরে বা তাপমাত্রার পরিবর্তনে সিস্টেমের বিশৃঙ্খলার পরিমাপ এনট্রপি বাড়ে। প্রত্যবর্তী প্রক্রিয়ায় মোট এনট্রপি পরিবর্তন শূন্য কিন্তু অপ্রত্যবর্তীতে ধনাত্মক।',
    core_principle_en: 'Entropy measures system disorder. Delta S = int dQ/T. Irreversible natural processes always increase entropy.',
    syllabus_weight: 1.4,
    board_appearance_count: 12,
    variants_count: 4
  },

  // --- Chemistry 1st Ch 4 ---
  {
    id: 'chem_1_ch4_c_buffer_henderson',
    topic_id: 'top_chem1_4_3',
    chapter_id: 'chem_1_ch4',
    paper_id: 'chem_1',
    subject_id: 'chem',
    name_en: 'Buffer Solution and Henderson-Hasselbalch Equation',
    name_bn: 'বাফার দ্রবণের pH ও হেন্ডারসন-হ্যাসেলবালখ সমীকরণ',
    formula_latex: 'pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}, \\quad pOH = pK_b + \\log\\frac{[\\text{Salt}]}{[\\text{Base}]}',
    core_principle_bn: 'সামান্য এসিড বা ক্ষার যোগ করলেও যে দ্রবণ তার pH এর মান অপরিবর্তিত রাখে তাই বাফার। হেন্ডারসন সমীকরণ দিয়ে অম্লীয়/ক্ষারীয় বাফারের pH নির্ণয় করা হয়।',
    core_principle_en: 'Resists pH changes upon small acid/base additions. Calculated via Henderson-Hasselbalch relation.',
    syllabus_weight: 1.6,
    board_appearance_count: 15,
    variants_count: 4
  },
  {
    id: 'chem_1_ch4_c_kp_kc_relation',
    topic_id: 'top_chem1_4_2',
    chapter_id: 'chem_1_ch4',
    paper_id: 'chem_1',
    subject_id: 'chem',
    name_en: 'Kp and Kc Equilibrium Relationships',
    name_bn: 'Kp ও Kc এর সম্পর্ক এবং গাণিতিক মান নির্ণয়',
    formula_latex: 'K_p = K_c (RT)^{\\Delta n}, \\quad \\Delta n = n_p - n_r \\text{ (gaseous moles)}',
    core_principle_bn: 'আংশিক চাপ সাম্যধ্রুবক (Kp) এবং মোলার ঘনমাত্রা সাম্যধ্রুবক (Kc) এর সম্পর্ক ডেল্টা n এর ওপর নির্ভরশীল। ডেল্টা n = 0 হলে Kp = Kc।',
    core_principle_en: 'Relationship between partial pressure and molar concentration equilibrium constants.',
    syllabus_weight: 1.4,
    board_appearance_count: 13,
    variants_count: 3
  },

  // --- Higher Mathematics 1st Ch 9 ---
  {
    id: 'hmath_1_ch9_c_maxima_minima',
    topic_id: 'top_hmath1_9_2',
    chapter_id: 'hmath_1_ch9',
    paper_id: 'hmath_1',
    subject_id: 'hmath',
    name_en: 'Determination of Maxima and Minima',
    name_bn: 'ফাংশনের চরমমান (গুরুমান ও লঘুমান) নির্ণয়',
    formula_latex: 'f\'(x) = 0 \\implies x = c, \\quad f\'\'(c) < 0 \\implies \\text{Max}, \\quad f\'\'(c) > 0 \\implies \\text{Min}',
    core_principle_bn: 'প্রথম অন্তরীজ শূন্য ধরে স্পর্শকের ঢাল সমান্তরাল বিন্দু বের করে দ্বিতীয় অন্তরীজের চিহ্নের সাহায্যে চরমমান ও সংশ্লিষ্ট সর্বোচ্চ/সর্বনিম্ন মান নির্ণয় করা হয়।',
    core_principle_en: 'Locating stationary points with first derivative and classifying extrema using second derivative test.',
    syllabus_weight: 1.5,
    board_appearance_count: 15,
    variants_count: 3
  },

  // --- Higher Mathematics 2nd Ch 6 (Conics) ---
  {
    id: 'hmath_2_ch6_c_parabola_standard',
    topic_id: 'top_hmath2_6_1',
    chapter_id: 'hmath_2_ch6',
    paper_id: 'hmath_2',
    subject_id: 'hmath',
    name_en: 'Parabola Focus, Vertex & Directrix Analysis',
    name_bn: 'পরাবৃত্তের শীর্ষবিন্দু, উপকেন্দ্র ও নিয়ামকরেখার সমীকরণ',
    formula_latex: '(y-k)^2 = 4a(x-h), \\quad e = 1, \\quad \\text{উপকেন্দ্র } (h+a, k), \\quad \\text{নিয়ামক } x = h-a',
    core_principle_bn: 'উপকেন্দ্র S ও নিয়ামক রেখা M হতে চলমান বিন্দু P এর দূরত্বের অনুপাত (উৎকেন্দ্রিকতা e = SP/PM) ১ হলে সঞ্চারপথ একটি পরাবৃত্ত নির্দেশ করে।',
    core_principle_en: 'Locus of points equidistant from focus and directrix (eccentricity e = 1).',
    syllabus_weight: 1.5,
    board_appearance_count: 16,
    variants_count: 4
  },
  {
    id: 'hmath_2_ch6_c_ellipse_eccentricity',
    topic_id: 'top_hmath2_6_2',
    chapter_id: 'hmath_2_ch6',
    paper_id: 'hmath_2',
    subject_id: 'hmath',
    name_en: 'Ellipse Geometry and Eccentricity Calculation',
    name_bn: 'উপবৃত্তের উৎকেন্দ্রিকতা, ফোকাস ও উপকেন্দ্রিক লম্বের দৈর্ঘ্য',
    formula_latex: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad (a > b), \\quad e = \\sqrt{1 - \\frac{b^2}{a^2}}, \\quad \\text{উপকেন্দ্র } (\\pm ae, 0), \\quad \\text{লম্ব } = \\frac{2b^2}{a}',
    core_principle_bn: 'উৎকেন্দ্রিকতা e < 1 হলে উপবৃত্ত গঠিত হয়। প্রধান অক্ষের দৈর্ঘ্য 2a এবং অপ্রধান অক্ষ 2b হলে ফোকাসদ্বয় এবং সমীকরণ নির্ধারিত হয়।',
    core_principle_en: 'Conic with eccentricity e < 1. Major axis 2a, minor axis 2b, focal distance ae.',
    syllabus_weight: 1.5,
    board_appearance_count: 18,
    variants_count: 4
  },

  // --- Chemistry 2nd Ch 2 (Organic Chemistry) ---
  {
    id: 'chem_2_ch2_c_electrophilic_sub',
    topic_id: 'top_chem2_2_1',
    chapter_id: 'chem_2_ch2',
    paper_id: 'chem_2',
    subject_id: 'chem',
    name_en: 'Benzene Electrophilic Substitution & Directing Groups',
    name_bn: 'বেনজিন বলয়ে ইলেকট্রোফিলিক প্রতিস্থাপন ও অর্থো-প্যারা/মেটা নির্দেশক',
    formula_latex: '\\text{C}_6\\text{H}_6 + \\text{HNO}_3 \\xrightarrow{\\text{conc. }\\text{H}_2\\text{SO}_4, 50-60^\\circ\\text{C}} \\text{C}_6\\text{H}_5\\text{NO}_2 + \\text{H}_2\\text{O}',
    core_principle_bn: 'বেনজিনের পাই ইলেকট্রন মেঘ ইলেকট্রোফাইলকে (NO2+, CH3+, Cl+) আকর্ষণ করে সিগমা কমপ্লেক্স গঠনের মাধ্যমে প্রতিস্থাপন বিক্রিয়া সম্পন্ন করে। -OH, -CH3 অর্থো-প্যারা এবং -NO2 মেটা নির্দেশক।',
    core_principle_en: 'Electrophilic attack on delocalized pi electrons forming arenium ion intermediate.',
    syllabus_weight: 1.7,
    board_appearance_count: 22,
    variants_count: 5
  },

  // --- Chemistry 2nd Ch 4 (Electrochemistry) ---
  {
    id: 'chem_2_ch4_c_nernst_equation',
    topic_id: 'top_chem2_4_1',
    chapter_id: 'chem_2_ch4',
    paper_id: 'chem_2',
    subject_id: 'chem',
    name_en: 'Galvanic Cell EMF and Nernst Equation',
    name_bn: 'নার্নস্ট সমীকরণ ও কোষ বিভব (EMF) নির্ণয়',
    formula_latex: 'E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n}\\log \\frac{[\\text{Anode Ion}]}{[\\text{Cathode Ion}]}',
    core_principle_bn: 'অ-প্রমাণ ঘনমাত্রায় বা তাপমাত্রায় কোষ বিভব প্রমাণ বিভব হতে আয়নের সক্রিয়তার অনুপাতের লগারিদমের ওপর নির্ভর করে পরিবর্তিত হয়।',
    core_principle_en: 'Nernst relationship connecting non-standard electromotive force with reaction quotient Q.',
    syllabus_weight: 1.5,
    board_appearance_count: 17,
    variants_count: 4
  },

  // --- Biology 1st Ch 1 (Botany - Cell Structure) ---
  {
    id: 'bio_1_ch1_c_fluid_mosaic',
    topic_id: 'top_bio1_1_1',
    chapter_id: 'bio_1_ch1',
    paper_id: 'bio_1',
    subject_id: 'bio',
    name_en: 'Fluid Mosaic Model of Biological Membrane',
    name_bn: 'প্লাজমা মেমব্রেনের ফ্লুইড মোজাইক মডেল (সিঙ্গার ও নিকলসন)',
    core_principle_bn: 'ফসফোলিপিড বাইলেয়ার একটি তরল সমুদ্রের মতো আচরণ করে যাতে প্রোটিন অণুগুলো হিমশৈলের মতো মোজাইক বিন্যাসে ভাসমান থাকে। এতে লিপিড, প্রোটিন ও গ্লাইকোক্যালিক্স থাকে।',
    core_principle_en: 'Singer & Nicolson lipid bilayer fluid matrix embedded with integral, peripheral and channel proteins.',
    syllabus_weight: 1.5,
    board_appearance_count: 14,
    variants_count: 3
  },

  // --- Biology 1st Ch 9 (Botany - Plant Physiology) ---
  {
    id: 'bio_1_ch9_c_photosynthesis_c3_c4',
    topic_id: 'top_bio1_9_1',
    chapter_id: 'bio_1_ch9',
    paper_id: 'bio_1',
    subject_id: 'bio',
    name_en: 'C3 (Calvin) vs C4 (Hatch-Slack) Carbon Fixation',
    name_bn: 'সালোকসংশ্লেষণে C3 ও C4 কার্বন বিজারণ চক্র',
    formula_latex: '6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow{\\text{Light, Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 + 6\\text{H}_2\\text{O}',
    core_principle_bn: 'C3 উদ্ভিদের প্রথম স্থায়ী পদার্থ ৩-ফসফোগ্লিসারিক এসিড (3-PGA) এবং গ্রাহক RuBP; C4 উদ্ভিদের প্রথম স্থায়ী পদার্থ ৪ কার্বনবিশিষ্ট অক্সালোঅ্যাসিটিক এসিড (OAA) এবং ক্রাঞ্জ অ্যানাটমি বিশিষ্ট।',
    core_principle_en: 'Comparison between C3 RuBisCO pathway and C4 Kranz anatomy PEP carboxylase fixation.',
    syllabus_weight: 1.6,
    board_appearance_count: 19,
    variants_count: 4
  },

  // --- Biology 2nd Ch 3 (Zoology - Digestion) ---
  {
    id: 'bio_2_ch3_c_digestion_enzymes',
    topic_id: 'top_bio2_3_1',
    chapter_id: 'bio_2_ch3',
    paper_id: 'bio_2',
    subject_id: 'bio',
    name_en: 'Enzymatic Digestion of Carbohydrates, Proteins and Lipids',
    name_bn: 'পাকস্থলী ও অন্ত্রে শর্করা, আমিষ ও চর্বি পরিপাকের এনজাইম মেকানিজম',
    core_principle_bn: 'পাকস্থলীতে পেপসিনোজেন অম্লীয় HCl মাধ্যমে সক্রিয় পেপসিনে পরিণত হয়ে প্রোটিনকে প্রোটিওজ ও পেপটনে ভাঙে; অগ্ন্যাশয় রসে ট্রিপসিন, অ্যামাইলেজ ও লাইপেজ ক্ষুদ্রান্ত্রে পূর্ণ পরিপাক ঘটায়।',
    core_principle_en: 'Sequential enzymatic degradation in acidic gastric and alkaline duodenal environments.',
    syllabus_weight: 1.5,
    board_appearance_count: 16,
    variants_count: 3
  },

  // --- Biology 2nd Ch 11 (Zoology - Genetics) ---
  {
    id: 'bio_2_ch11_c_mendel_second_law',
    topic_id: 'top_bio2_11_1',
    chapter_id: 'bio_2_ch11',
    paper_id: 'bio_2',
    subject_id: 'bio',
    name_en: 'Mendel Second Law (Independent Assortment) & Sex-Linkage',
    name_bn: 'মেন্ডেলের স্বাধীনভাবে সঞ্চারণের সূত্র ও সেক্স-লিঙ্কড জিন সঞ্চারণ',
    formula_latex: '\\text{F}_2 \\text{ Phenotypic Ratio} = 9 : 3 : 3 : 1',
    core_principle_bn: 'দুই বা ততোধিক জোড়া বিপরীত বৈশিষ্ট্যের মধ্যে সংকরায়ন ঘটালে গ্যামেট সৃষ্টির সময় বৈশিষ্ট্যগুলো পরস্পরের ওপর নির্ভর না করে স্বাধীনভাবে বিন্যস্ত হয়। সেক্স লিঙ্কড জিনসমূহ X ক্রোমোজোম মারফত সঞ্চারিত হয়।',
    core_principle_en: 'Law of independent assortment and X-linked inheritance mechanisms (criss-cross pattern).',
    syllabus_weight: 1.6,
    board_appearance_count: 20,
    variants_count: 4
  },

  // --- Bangla 1st Paper Concepts ---
  {
    id: 'bangla_1_ch1_c_oporichita',
    topic_id: 'top_bangla1_1_1',
    chapter_id: 'bangla_1_ch1',
    paper_id: 'bangla_1',
    subject_id: 'bangla',
    name_en: 'Oporichita: Dowry Protest & Character Evolution',
    name_bn: 'অপরিচিতা: যৌতুক প্রথার প্রতিবাদ ও আত্মমর্যাদাবোধ',
    core_principle_bn: 'যৌতুক প্রথার বিরুদ্ধে শম্ভুনাথ সেনের দৃঢ় অবস্থান ও কল্যাণীর দেশব্রতে আত্মনিয়োগ নারী জাগরণের এক উজ্জ্বল প্রতীক। অনুপমের ভীরুতা ও আত্মোপলব্ধির দ্বন্দ্ব এতে প্রতিভাত হয়।',
    core_principle_en: 'Defiance against traditional dowry exploitation and awakening of female self-worth and dignity.',
    syllabus_weight: 1.5,
    board_appearance_count: 18,
    variants_count: 3
  },
  {
    id: 'bangla_1_ch3_c_raincoat',
    topic_id: 'top_bangla1_3_1',
    chapter_id: 'bangla_1_ch3',
    paper_id: 'bangla_1',
    subject_id: 'bangla',
    name_en: 'Raincoat: Symbol of Freedom & Transformation',
    name_bn: 'রেইনকোট: মুক্তিযুদ্ধের চেতনা ও নুরুল হুদার মানসিক রূপান্তর',
    core_principle_bn: 'বীর মুক্তিযোদ্ধা শ্যালক মিন্টুর রেইনকোট গায়ে জড়ানোর পর ভীরু শিক্ষক নুরুল হুদার মধ্যে অসীম সাহস ও দেশপ্রেমের সঞ্চার হয় যা পাকিস্তানি হানাদারদের টর্চারের মুখেও অবিচল রাখে।',
    core_principle_en: 'Symbolic mantle of patriotic courage transforming an ordinary fearful individual into an unyielding resister.',
    syllabus_weight: 1.6,
    board_appearance_count: 22,
    variants_count: 4
  },
  {
    id: 'bangla_1_ch4_c_bidrohi',
    topic_id: 'top_bangla1_4_1',
    chapter_id: 'bangla_1_ch4',
    paper_id: 'bangla_1',
    subject_id: 'bangla',
    name_en: 'Bidrohi: Anti-Oppression & Universal Humanism',
    name_bn: 'বিদ্রোহী: ঔপনিবেশিক শাসনবিরোধিতা ও সাম্যবাদী চেতনা',
    formula_latex: '\\text{"বল বীর – বল উন্নত মম শির!"}',
    core_principle_bn: 'কাজী নজরুল ইসলামের কালজয়ী কবিতা যেখানে পরাধীনতার বিরুদ্ধে দ্রোহ, অত্যাচারীর ধ্বংস এবং বিশ্বের নির্যাতিত মানুষের মুক্তির চিরন্তন অঙ্গীকার ঘোষিত হয়েছে।',
    core_principle_en: 'Epic declaration of human sovereignty against tyranny and oppressive social structures.',
    syllabus_weight: 1.5,
    board_appearance_count: 19,
    variants_count: 3
  },

  // --- Bangla 2nd Paper Concepts ---
  {
    id: 'bangla_2_ch2_c_noto_shato',
    topic_id: 'top_bangla2_2_1',
    chapter_id: 'bangla_2_ch2',
    paper_id: 'bangla_2',
    subject_id: 'bangla',
    name_en: 'Noto & Shato Bidhan Rules in Tatsama Words',
    name_bn: 'তৎসম শব্দে ণ-ত্ব ও ষ-ত্ব বিধানের নিয়ম',
    formula_latex: '\\text{ঋ, র, ষ এর পর মূর্ধন্য ণ ও ষ হয়। যেমন: ঋণ, কারণ, কাণ্ড, কৃষক, পরিষ্কার।}',
    core_principle_bn: 'তৎসম (সংস্কৃত) শব্দে মূর্ধন্য-ণ এবং মূর্ধন্য-ষ ব্যবহারের ব্যাকরণিক বিধিমালার পাঁচটি প্রমিত সূত্র ও ব্যতিক্রম (স্বভাবতই ণ/ষ)।',
    core_principle_en: 'Phonological retroflex nasal and sibilant assimilation rules in Sanskrit loanwords.',
    syllabus_weight: 1.4,
    board_appearance_count: 16,
    variants_count: 3
  },
  {
    id: 'bangla_2_ch3_c_samas',
    topic_id: 'top_bangla2_3_1',
    chapter_id: 'bangla_2_ch3',
    paper_id: 'bangla_2',
    subject_id: 'bangla',
    name_en: 'Samas Identification & Vyasvakya Construction',
    name_bn: 'ব্যাসবাক্যসহ সমাস নির্ণয় (তৎপুরুষ, কর্মধারয়, বহুব্রীহি)',
    formula_latex: '\\text{সিংহ চিহ্নিত আসন = সিংহাসন (মধ্যপদলোপী কর্মধারয়)}',
    core_principle_bn: 'পরস্পর অর্থসঙ্গতিবিশিষ্ট দুই বা ততোধিক পদের এক পদে পরিণত হওয়ার প্রক্রিয়া সমাস। দ্বন্দ্ব, তৎপুরুষ, কর্মধারয়, বহুব্রীহি ও দ্বিগু সমাসের ব্যাসবাক্য বিশ্লেষণ।',
    core_principle_en: 'Compound word formation and semantic role relations in standard Bengali morphology.',
    syllabus_weight: 1.6,
    board_appearance_count: 24,
    variants_count: 4
  },

  // --- English 2nd Paper Concepts ---
  {
    id: 'english_2_ch2_c_conditionals_completion',
    topic_id: 'top_eng2_2_1',
    chapter_id: 'english_2_ch2',
    paper_id: 'english_2',
    subject_id: 'english',
    name_en: 'Conditional Sentences & Special Structures',
    name_bn: 'Completing Sentences (Conditionals, Lest, As if, High Time)',
    formula_latex: '\\text{If + Past Perfect} \\to \\text{Subject + would/could + have + } V_3',
    core_principle_bn: 'HSC বোর্ড পরীক্ষায় ৩ নম্বর প্রশ্নে ব্যবহৃত ক্লজ সমাপ্তিকরণ সূত্রসমূহ: 1st, 2nd, 3rd Conditionals; Lest + Sub + should + V1; It is high time + Past Indefinite।',
    core_principle_en: 'Hypothetical conditionals, inverted clauses, and past subjunctive structures in formal English syntax.',
    syllabus_weight: 1.6,
    board_appearance_count: 25,
    variants_count: 4
  },
  {
    id: 'english_2_ch4_c_modifiers',
    topic_id: 'top_eng2_4_1',
    chapter_id: 'english_2_ch4',
    paper_id: 'english_2',
    subject_id: 'english',
    name_en: 'Pre-modifiers and Post-modifiers in Context',
    name_bn: 'Use of Modifiers (Participles, Appositives, Infinitives)',
    formula_latex: '\\text{Determiner / Adjective / Participle} + \\text{Noun (Head)} + \\text{Post-modifier (Prepositional Phrase / Relative Clause)}',
    core_principle_bn: 'বাক্যে কোনো Noun বা Verb-কে বিশেষায়িত করার জন্য Pre-modifier (Noun adjunct, Present participle, Intensifier) ও Post-modifier (Appositive, Infinitive phrase, Adverbial) এর সঠিক প্রয়োগ।',
    core_principle_en: 'Pre- and post-head nominal and verbal modification structures specified by instructional clues.',
    syllabus_weight: 1.5,
    board_appearance_count: 22,
    variants_count: 4
  },

  // --- ICT Concepts ---
  {
    id: 'ict_1_ch3_c_twos_complement',
    topic_id: 'top_ict1_3_1',
    chapter_id: 'ict_1_ch3',
    paper_id: 'ict_1',
    subject_id: 'ict',
    name_en: '2\'s Complement Arithmetic & Number Conversions',
    name_bn: '২-এর পরিপূরক গঠন এবং যোগের মাধ্যমে বিয়োগ সম্পাদন',
    formula_latex: '\\text{2\'s Complement} = \\text{1\'s Complement} + 1, \\quad (+A) + (-B) = A + (\\text{2\'s comp of } B)',
    core_principle_bn: 'কম্পিউটার সিস্টেমে যোগের সার্কিট (Adder) দিয়েই বিয়োগ করার জন্য ২-এর পরিপূরক পদ্ধতি ব্যবহার করা হয়। ৮-বিট বা ১৬-বিট রেজিস্টারে সর্ববামের বিটটি চিহ্ন বিট (Sign Bit) হিসেবে কাজ করে (০ = ধনাত্মক, ১ = ঋণাত্মক)।',
    core_principle_en: 'Binary radix subtraction via two\'s complement addition in fixed-width registers with carry overflow handling.',
    syllabus_weight: 1.8,
    board_appearance_count: 28,
    variants_count: 4
  },
  {
    id: 'ict_1_ch3_c_logic_gates_de_morgan',
    topic_id: 'top_ict1_3_2',
    chapter_id: 'ict_1_ch3',
    paper_id: 'ict_1',
    subject_id: 'ict',
    name_en: 'Universal Gates (NAND, NOR), De Morgan & Adders',
    name_bn: 'সার্বজনীন গেট দ্বারা লজিক বাস্তবায়ন ও হাফ/ফুল অ্যাডার সার্কিট',
    formula_latex: '(A + B)\' = A\' \\cdot B\', \\quad (A \\cdot B)\' = A\' + B\', \\quad S = A \\oplus B \\oplus C_{in}, \\quad C_{out} = AB + C_{in}(A \\oplus B)',
    core_principle_bn: 'NAND ও NOR গেট দিয়ে সকল মৌলিক গেট তৈরি করা যায় বিধায় এরা সার্বজনীন গেট। হাফ অ্যাডার দুটি বিট যোগ করে (S = A XOR B, C = AB), আর ফুল অ্যাডার দুটি হাফ অ্যাডার ও একটি OR গেট দিয়ে গঠিত হয়।',
    core_principle_en: 'Logic simplification via Boolean theorems and arithmetic synthesis with half and full adder designs.',
    syllabus_weight: 1.8,
    board_appearance_count: 30,
    variants_count: 4
  },
  {
    id: 'ict_1_ch5_c_c_programming_control',
    topic_id: 'top_ict1_5_1',
    chapter_id: 'ict_1_ch5',
    paper_id: 'ict_1',
    subject_id: 'ict',
    name_en: 'C Language Control Flow (Loops, Conditionals & Series)',
    name_bn: 'সি প্রোগ্রামিং: লুপ কন্ট্রোল, লিপ ইয়ার ও ধারার যোগফল নির্ণয়',
    formula_latex: '\\text{for}(i=1; i<=n; i++) \\{ \\text{sum} += i; \\}',
    core_principle_bn: 'সি ভাষায় অ্যালগরিদম ও ফ্লোচার্ট হতে প্রোগ্রামে রূপান্তর, if-else শর্তযুক্ত সিদ্ধান্ত গ্রহণ এবং for/while/do-while লুপ ব্যবহার করে সমান্তর ও গুণোত্তর ধারার যোগফল এবং মৌলিক সংখ্যা নির্ণয়।',
    core_principle_en: 'Structured programming constructs: iteration, branch logic, relational expressions, and iterative accumulation in C.',
    syllabus_weight: 1.7,
    board_appearance_count: 26,
    variants_count: 4
  }
];

export const CANONICAL_ARCHETYPES: ScenarioArchetype[] = [
  // 1. Road Banking Archetypes
  {
    id: 'arch_bank_frictionless_angle',
    concept_id: 'phy_1_ch4_c_road_banking',
    code: 'ARCH_BANK_FRICTIONLESS_ANGLE',
    title_bn: 'ঘর্ষণহীন ব্যাংকিং কোণ ও উচ্চতার পার্থক্য নির্ণয়',
    title_en: 'Frictionless Banking Angle & Elevation Difference',
    description_bn: 'রাস্তার প্রস্থ w, উচ্চতার ব্যবধান h এবং বাঁকের ব্যাসার্ধ r হতে নির্দিষ্ট বেগে নিরাপদ বাঁকের ব্যাংকিং কোণ হিসাব।',
    cognitive_dimension: 'direct_application',
    key_variables: ['v', 'r', 'g', 'w', 'h', 'theta'],
    sample_formula_latex: '\\tan\\theta = \\frac{v^2}{rg} \\approx \\frac{h}{w}',
  },
  {
    id: 'arch_bank_friction_limits',
    concept_id: 'phy_1_ch4_c_road_banking',
    code: 'ARCH_BANK_FRICTION_LIMITS',
    title_bn: 'ঘর্ষণযুক্ত ব্যাংকিং ও সর্বোচ্চ/সর্বনিম্ন নিরাপদ বেগ',
    title_en: 'Friction-Assisted Banking & Speed Limits',
    description_bn: 'বৃষ্টির দিন বা শুষ্ক দিনে টায়ার-রাস্তার ঘর্ষণ গুণাঙ্ক \\mu_s সহ গাড়ি পিছলানো রোধে সর্বোচ্চ সীমা বিশ্লেষণ।',
    cognitive_dimension: 'boundary_case',
    key_variables: ['v_{max}', 'r', 'g', 'theta', '\\mu_s'],
    sample_formula_latex: 'v_{\\max} = \\sqrt{\\frac{rg(\\tan\\theta + \\mu)}{1 - \\mu \\tan\\theta}}',
  },
  {
    id: 'arch_bank_railway_cant',
    concept_id: 'phy_1_ch4_c_road_banking',
    code: 'ARCH_BANK_RAILWAY_CANT',
    title_bn: 'রেললাইনের বাঁকে বাইরের লাইনের উচ্চতা (সুপার এলিভেশন)',
    title_en: 'Railway Track Outer Rail Elevation',
    description_bn: 'রেললাইনের দুই পাতের মধ্যবর্তী দূরত্ব d এবং নির্ধারিত বেগের জন্য বাইরের পাতকে কতটুকু উঁচুতে স্থাপন করতে হবে।',
    cognitive_dimension: 'direct_application',
    key_variables: ['d', 'h', 'v', 'r'],
    sample_formula_latex: 'h = \\frac{v^2 d}{rg}',
  },

  // 2. Torque & Angular Momentum Archetypes
  {
    id: 'arch_torque_stopping_decel',
    concept_id: 'phy_1_ch4_c_torque_angular_momentum',
    code: 'ARCH_TORQUE_STOPPING_DECEL',
    title_bn: 'ঘর্ষণ ও ব্রেকিং টর্কে ঘূর্ণায়মান বস্তুর মন্দন ও ঘূর্ণন সংখ্যা',
    title_en: 'Frictional & Braking Torque Deceleration',
    description_bn: 'প্রাথমিক কৌণিক বেগ \\omega_0 হতে ব্রেকিং টর্ক \\tau প্রযুক্ত হলে থেমে যাওয়ার পূর্বে মোট অতিক্রান্ত কৌণিক সরণ বা ঘূর্ণন সংখ্যা n নির্ণয়।',
    cognitive_dimension: 'direct_application',
    key_variables: ['I', '\\omega_0', '\\tau', '\\alpha', '\\theta', 'n'],
    sample_formula_latex: '\\tau = I\\alpha, \\quad \\omega^2 = \\omega_0^2 - 2\\alpha\\theta, \\quad n = \\frac{\\theta}{2\\pi}',
  },
  {
    id: 'arch_torque_momentum_conservation',
    concept_id: 'phy_1_ch4_c_torque_angular_momentum',
    code: 'ARCH_TORQUE_MOMENTUM_CONSERVATION',
    title_bn: 'বাহ্যিক টর্কবিহীন অবস্থায় জড়তার ভ্রামক পরিবর্তন ও গতিশক্তি বিশ্লেষণ',
    title_en: 'Conservation of Angular Momentum & Rotational Kinetic Energy',
    description_bn: 'হাত গোটানো/প্রসারণের মাধ্যমে জড়তার ভ্রামক পরিবর্তিত হলে কৌণিক বেগ ও ঘূর্ণন গতিশক্তির পরিবর্তন বিশ্লেষণ।',
    cognitive_dimension: 'multi_concept',
    key_variables: ['I_1', 'I_2', '\\omega_1', '\\omega_2', 'E_{k1}', 'E_{k2}'],
    sample_formula_latex: 'I_1\\omega_1 = I_2\\omega_2, \\quad E_k = \\frac{1}{2}I\\omega^2',
  },

  // 3. Carnot Engine Archetypes
  {
    id: 'arch_carnot_source_sink_temp',
    concept_id: 'phy_2_ch1_c_carnot_engine',
    code: 'ARCH_CARNOT_SOURCE_SINK_TEMP',
    title_bn: 'উৎস ও গ্রাহকের তাপমাত্রার সাপেক্ষে দক্ষতা ও তাপমাত্রা বৃদ্ধি বিশ্লেষণ',
    title_en: 'Carnot Source/Sink Temperature & Efficiency Tuning',
    description_bn: 'নির্দিষ্ট তাপমাত্রায় কার্যরত ইঞ্জিনের দক্ষতা বৃদ্ধি করতে উৎস বা গ্রাহকের প্রয়োজনীয় তাপমাত্রা বৃদ্ধি/হ্রাস নির্ণয়।',
    cognitive_dimension: 'direct_application',
    key_variables: ['T_1', 'T_2', 'Q_1', 'Q_2', '\\eta', '\\Delta T'],
    sample_formula_latex: '\\eta = 1 - \\frac{T_2}{T_1}, \\quad \\Delta T_1 = T_1\' - T_1',
  },
  {
    id: 'arch_carnot_reversibility_entropy',
    concept_id: 'phy_2_ch1_c_carnot_engine',
    code: 'ARCH_CARNOT_REVERSIBILITY_ENTROPY',
    title_bn: 'কার্নো চক্রের মোট এনট্রপি পরিবর্তন ও প্রত্যবর্তীতা প্রমাণ',
    title_en: 'Carnot Cycle Net Entropy & Reversibility Verification',
    description_bn: 'সমোষ্ণ প্রসারণ ও রুদ্ধতাপীয় ধাপে তাপ শোষণ ও বর্জনের মাধ্যমে পূর্ণ চক্রে \\Delta S = 0 প্রমাণ।',
    cognitive_dimension: 'boundary_case',
    key_variables: ['\\Delta S_1', '\\Delta S_2', 'Q_1', 'T_1', 'Q_2', 'T_2'],
    sample_formula_latex: '\\Delta S = \\frac{Q_1}{T_1} - \\frac{Q_2}{T_2} = 0',
  },

  // 4. Buffer Solution Archetypes
  {
    id: 'arch_buffer_henderson_ph',
    concept_id: 'chem_1_ch4_c_buffer_henderson',
    code: 'ARCH_BUFFER_HENDERSON_PH',
    title_bn: 'মৃদু এসিড ও তীব্র ক্ষারের মিশ্রণে গঠিত বাফারের pH নির্ণয়',
    title_en: 'Acidic Buffer Formation & pH Calculation',
    description_bn: 'মিশ্রণে অবশিষ্ট এসিডের মোল ও উৎপন্ন লবণের ঘনমাত্রা থেকে হেন্ডারসন সমীকরণের মাধ্যমে pH হিসাব।',
    cognitive_dimension: 'direct_application',
    key_variables: ['n_{acid}', 'n_{salt}', 'pK_a', 'pH'],
    sample_formula_latex: 'pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}',
  },
  {
    id: 'arch_buffer_resistance_mechanism',
    concept_id: 'chem_1_ch4_c_buffer_henderson',
    code: 'ARCH_BUFFER_RESISTANCE_MECHANISM',
    title_bn: 'সামান্য তীব্র এসিড/ক্ষার সংযোজনে বাফার প্রতিরোধ ক্রিয়া-কৌশল',
    title_en: 'Buffer Resistance Mechanism upon Acid/Base Addition',
    description_bn: 'বাইরে থেকে H+ বা OH- যোগ করলে বাফার দ্রবণে সাম্যাবস্থার স্থানান্তর ও pH অপরিবর্তিত থাকার সমীকরণ ভিত্তিক ব্যাখ্যা।',
    cognitive_dimension: 'multi_concept',
    key_variables: ['[H^+]', '[OH^-]', 'CH_3COO^-', 'CH_3COOH'],
    sample_formula_latex: '\\text{CH}_3\\text{COO}^- + \\text{H}^+ \\rightleftharpoons \\text{CH}_3\\text{COOH}',
  },

  // 5. Maxima Minima Archetypes
  {
    id: 'arch_math_poly_extrema',
    concept_id: 'hmath_1_ch9_c_maxima_minima',
    code: 'ARCH_MATH_POLY_EXTREMA',
    title_bn: 'বহুপদী বা ত্রিকোণমিতিক ফাংশনের গুরুমান ও লঘুমান নির্ণয়',
    title_en: 'Polynomial / Trig Function Extrema Determination',
    description_bn: 'প্রথম অন্তরীজ শূন্য ধরে বিন্দু নির্ণয় এবং দ্বিতীয় অন্তরীজের চিহ্নের সাহায্যে চরমমান ও সংশ্লিষ্ট সর্বোচ্চ মান নির্ণয়।',
    cognitive_dimension: 'direct_application',
    key_variables: ['f(x)', 'f\'(x)', 'f\'\'(x)', 'x_0'],
    sample_formula_latex: 'f\'(x) = 0 \\implies x_0, \\quad f\'\'(x_0) < 0 \\implies \\text{Max}',
  }
];

export const CANONICAL_VARIANTS: ConceptVariant[] = [
  // Variants for Torque & Angular Momentum
  {
    id: 'var_torque_1',
    concept_id: 'phy_1_ch4_c_torque_angular_momentum',
    name: 'Electric Fan Stopping under Constant Frictional Torque',
    description: 'Rotational deceleration from initial angular speed omega_0 to rest via constant torque tau = I*alpha.',
    cognitive_dimension: 'direct_application',
    scenario_archetype: 'rotational_stopping_distance',
    formula_variant_latex: '\\omega^2 = \\omega_0^2 - 2\\alpha\\theta, \\quad \\tau = I\\alpha'
  },
  {
    id: 'var_torque_2',
    concept_id: 'phy_1_ch4_c_torque_angular_momentum',
    name: 'Diver/Skater Modifying Moment of Inertia (I1*omega1 = I2*omega2)',
    description: 'Folding or stretching limbs changes radius of gyration, increasing angular velocity while conserving angular momentum.',
    cognitive_dimension: 'boundary_case',
    scenario_archetype: 'isolated_rotational_inertia_change',
    formula_variant_latex: 'I_1 \\omega_1 = I_2 \\omega_2 \\implies \\frac{1}{2}I_1\\omega_1^2 \\neq \\frac{1}{2}I_2\\omega_2^2'
  },
  // Variants for Banking
  {
    id: 'var_banking_1',
    concept_id: 'phy_1_ch4_c_road_banking',
    name: 'Railway Track / Road Inclination with Height difference h and width w',
    description: 'Determining if a vehicle at velocity v will safely turn or skid without frictional aid.',
    cognitive_dimension: 'direct_application',
    scenario_archetype: 'safe_speed_calculation',
    formula_variant_latex: 'h = w \\sin\\theta \\approx w \\tan\\theta = \\frac{w v^2}{r g}'
  },
  {
    id: 'var_banking_2',
    concept_id: 'phy_1_ch4_c_road_banking',
    name: 'Rainy Day vs Dry Day Friction Boundary Banking',
    description: 'Considering coefficient of static friction mu_s with banking angle for maximum safe speed.',
    cognitive_dimension: 'multi_concept',
    scenario_archetype: 'frictional_banking_limits',
    formula_variant_latex: 'v_{\\max} = \\sqrt{\\frac{rg(\\tan\\theta + \\mu)}{1 - \\mu \\tan\\theta}}'
  }
];

export const PRESEEDED_QUESTIONS: Question[] = [
  // 1. Dhaka Board 2023 Physics 1st Paper - CQ
  {
    id: 'q_db_2023_phy1_cq4',
    scope: 'global_official',
    subject_id: 'phy',
    paper_id: 'phy_1',
    chapter_id: 'phy_1_ch4',
    concept_ids: ['phy_1_ch4_c_torque_angular_momentum', 'phy_1_ch4_c_moment_of_inertia'],
    scenario_archetype_id: 'arch_torque_stopping_decel',
    board: 'Dhaka',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'medium',
    stem_text: 'একটি বৈদ্যুতিক পাখার জড়তার ভ্রামক $0.5\\text{ kg}\\cdot\\text{m}^2$। পাখাটি প্রতি মিনিটে $300$ বার ঘুরছিল। সুইচ বন্ধ করার $20\\text{ s}$ পর এটি থেমে গেল। পরবর্তীতে সুইচ বন্ধ করার পর বাতাস ও ঘূর্ণন ঘর্ষণের পাশাপাশি অতিরিক্ত $1.5\\text{ N}\\cdot\\text{m}$ এর একটি ব্রেকিং টর্ক প্রয়োগ করা হলো।',
    subparts: [
      {
        id: 'q_db_2023_phy1_cq4_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'কৌণিক ভরবেগ কাকে বলে?',
        concept_ids: ['phy_1_ch4_c_torque_angular_momentum'],
        solution_latex: '\\text{ঘূর্ণন অক্ষের সাপেক্ষে কোনো ঘূর্ণায়মান কণার রৈখিক ভরবেগের ভ্রামককে কৌণিক ভরবেগ বলে। } \\vec{L} = \\vec{r} \\times \\vec{p}'
      },
      {
        id: 'q_db_2023_phy1_cq4_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'রাস্তার বাঁকে ব্যাংকিং এর প্রয়োজনীয়তা ব্যাখ্যা করো।',
        concept_ids: ['phy_1_ch4_c_road_banking'],
        scenario_archetype_id: 'arch_bank_frictionless_angle',
        solution_latex: '\\text{বাঁকা পথে দ্রুতগামী গাড়িকে নিরাপদে মোড় নিতে কেন্দ্রমুখী বলের জোগান দিতে হয়। রাস্তার বাইরের প্রান্ত ভিতরের প্রান্ত অপেক্ষা উঁচু করে ব্যাংকিং তৈরি করা হলে গাড়ির ওজনের লম্ব প্রতিক্রিয়া বলের অনুভূমিক উপাংশ } (R\\sin\\theta) \\text{ প্রয়োজনীয় কেন্দ্রমুখী বল প্রদান করে, ফলে ঘর্ষণ বলের ওপর নির্ভর না করে পিছলানো এড়ানো যায়।}'
      },
      {
        id: 'q_db_2023_phy1_cq4_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'উদ্দীপকের পাখাটির উপর প্রযুক্ত ঘর্ষণজনিত টর্কের মান নির্ণয় করো।',
        concept_ids: ['phy_1_ch4_c_torque_angular_momentum'],
        scenario_archetype_id: 'arch_torque_stopping_decel',
        solution_latex: `\\text{প্রদত্ত: } I = 0.5\\text{ kg}\\cdot\\text{m}^2, \\quad N = 300\\text{ rpm} \\implies \\omega_0 = \\frac{2\\pi \\times 300}{60} = 10\\pi\\text{ rad/s} \\approx 31.416\\text{ rad/s} \\\\
\\text{থেমে যাওয়ার সময় } t = 20\\text{ s}, \\quad \\omega = 0 \\\\
\\text{কৌণিক মন্দন } \\alpha = \\frac{\\omega_0 - \\omega}{t} = \\frac{10\\pi}{20} = \\frac{\\pi}{2} = 1.571\\text{ rad/s}^2 \\\\
\\text{প্রযুক্ত ঘর্ষণজনিত টর্ক } \\tau = I\\alpha = 0.5 \\times 1.571 = 0.785\\text{ N}\\cdot\\text{m} \\text{ বা } \\frac{\\pi}{4}\\text{ N}\\cdot\\text{m}`
      },
      {
        id: 'q_db_2023_phy1_cq4_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'অতিরিক্ত ব্রেকিং টর্ক প্রয়োগের ফলে পাখাটি থেমে যাওয়ার পূর্বে মোট কতটি ঘূর্ণন সম্পন্ন করবে? গাণিতিক বিশ্লেষণপূর্বক মতামত দাও।',
        concept_ids: ['phy_1_ch4_c_torque_angular_momentum'],
        scenario_archetype_id: 'arch_torque_stopping_decel',
        solution_latex: `\\text{মোট প্রযুক্ত প্রতিরোধী টর্ক } \\tau_{total} = \\tau_{friction} + \\tau_{braking} = 0.785 + 1.5 = 2.2854\\text{ N}\\cdot\\text{m} \\\\
\\text{নতুন কৌণিক মন্দন } \\alpha' = \\frac{\\tau_{total}}{I} = \\frac{2.2854}{0.5} = 4.5708\\text{ rad/s}^2 \\\\
\\text{কৌণিক সরণ } \\theta \\text{ নির্ণয়: } \\omega^2 = \\omega_0^2 - 2\\alpha'\\theta \\implies 0 = (10\\pi)^2 - 2(4.5708)\\theta \\\\
\\theta = \\frac{100\\pi^2}{2 \\times 4.5708} = \\frac{986.96}{9.1416} \\approx 107.96\\text{ rad} \\\\
\\text{সম্পন্ন ঘূর্ণন সংখ্যা } n = \\frac{\\theta}{2\\pi} = \\frac{107.96}{2\\pi} \\approx 17.18 \\text{ বার।}`
      }
    ],
    full_solution_latex: '\\text{সম্পূর্ণ সমাধান উপরিউক্ত পার্টসমূহে বর্ণিত।}',
    is_verified: true,
    created_at: '2024-01-15T00:00:00Z'
  },

  // 2. Rajshahi Board 2022 Physics 1st Paper - CQ
  {
    id: 'q_rb_2022_phy1_cq3',
    scope: 'global_official',
    subject_id: 'phy',
    paper_id: 'phy_1',
    chapter_id: 'phy_1_ch4',
    concept_ids: ['phy_1_ch4_c_road_banking'],
    scenario_archetype_id: 'arch_bank_friction_limits',
    board: 'Rajshahi',
    exam_year: 2022,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'medium',
    stem_text: 'একটি বাঁকা রাস্তার ব্যাসার্ধ $120\\text{ m}$ এবং প্রস্থ $5\\text{ m}$। রাস্তাটি সর্বোচ্চ $50.4\\text{ km/h}$ বেগে চলার উপযোগী করে ব্যাংকিং করা হয়েছে। একদিন বৃষ্টি হওয়ায় রাস্তার ঘর্ষণ গুণাঙ্ক কমে $0.1$ হলো এবং একজন চালক $60\\text{ km/h}$ বেগে মোড় নিচ্ছিল। ($g = 9.8\\text{ ms}^{-2}$)',
    subparts: [
      {
        id: 'q_rb_2022_phy1_cq3_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'জড়তার ভ্রামক কাকে বলে?',
        concept_ids: ['phy_1_ch4_c_moment_of_inertia'],
        solution_latex: '\\text{কোনো নির্দিষ্ট অক্ষের চারদিকে ঘূর্ণায়মান কোনো বস্তুর প্রতিটি কণার ভর এবং ঘূর্ণন অক্ষ হতে দূরত্বের বর্গের গুণফলের সমষ্টিকে জড়তার ভ্রামক বলে।}'
      },
      {
        id: 'q_rb_2022_phy1_cq3_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'একটি বৃত্তাকার রিং ও একই ভর ও ব্যাসার্ধের বৃত্তাকার চাকতির মধ্যে কার জড়তার ভ্রামক বেশি এবং কেন?',
        concept_ids: ['phy_1_ch4_c_moment_of_inertia'],
        solution_latex: '\\text{রিং-এর জড়তার ভ্রামক } I_{ring} = MR^2 \\text{ এবং চাকতির } I_{disc} = \\frac{1}{2}MR^2\\text{। রিং-এর ক্ষেত্রে সমস্ত ভর কেন্দ্র হতে সর্ব্বোচ্চ দূরত্ব R এ অবস্থান করে, তাই রিং-এর জড়তার ভ্রামক বেশি।}'
      },
      {
        id: 'q_rb_2022_phy1_cq3_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'উদ্দীপকের বাঁকে রাস্তার দুই প্রান্তের উচ্চতার পার্থক্য কত?',
        concept_ids: ['phy_1_ch4_c_road_banking'],
        scenario_archetype_id: 'arch_bank_frictionless_angle',
        solution_latex: `\\text{প্রদত্ত: } r = 120\\text{ m}, \\quad w = 5\\text{ m}, \\quad v = 50.4\\text{ km/h} = \\frac{50.4 \\times 1000}{3600} = 14\\text{ m/s} \\\\
\\tan\\theta = \\frac{v^2}{rg} = \\frac{14^2}{120 \\times 9.8} = \\frac{196}{1176} = 0.1667 \\implies \\theta = \\tan^{-1}(0.1667) = 9.46^\\circ \\\\
\\text{উচ্চতার পার্থক্য } h = w\\sin\\theta = 5 \\times \\sin(9.46^\\circ) = 5 \\times 0.1644 = 0.822\\text{ m}`
      },
      {
        id: 'q_rb_2022_phy1_cq3_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'বৃষ্টির দিনে ৬০ কিমি/ঘণ্টা বেগে মোড় নেওয়া গাড়িটির ক্ষেত্রে কোনো দুর্ঘটনা ঘটার সম্ভাবনা আছে কি না— গাণিতিকভাবে বিশ্লেষণ করো।',
        concept_ids: ['phy_1_ch4_c_road_banking'],
        scenario_archetype_id: 'arch_bank_friction_limits',
        solution_latex: `\\text{চালকের বেগ } v_{driver} = 60\\text{ km/h} = 16.67\\text{ m/s} \\\\
\\text{ঘর্ষণযুক্ত ব্যাংকিং করা রাস্তায় সর্বোচ্চ নিরাপদ বেগ: } \\\\
v_{\\max} = \\sqrt{\\frac{rg(\\tan\\theta + \\mu)}{1 - \\mu \\tan\\theta}} = \\sqrt{\\frac{120 \\times 9.8 \\times (0.1667 + 0.1)}{1 - 0.1 \\times 0.1667}} \\\\
= \\sqrt{\\frac{1176 \\times 0.2667}{1 - 0.01667}} = \\sqrt{\\frac{313.64}{0.9833}} = \\sqrt{318.96} = 17.86\\text{ m/s} = 64.3\\text{ km/h} \\\\
\\text{যেহেতু } v_{driver} (60\\text{ km/h}) < v_{\\max} (64.3\\text{ km/h})\\text{, তাই বৃষ্টির দিনেও গাড়িটি পিছলিয়ে দুর্ঘটনা ঘটার সম্ভাবনা নেই।}`
      }
    ],
    full_solution_latex: '\\text{সম্পূর্ণ সমাধান উপরিউক্ত বিশ্লেষণ অনুসারে প্রস্তুত।}',
    is_verified: true,
    created_at: '2024-01-16T00:00:00Z'
  },

  // 3. Chattogram Board 2023 Physics 2nd Paper - CQ (Carnot Engine)
  {
    id: 'q_ctg_2023_phy2_cq1',
    scope: 'global_official',
    subject_id: 'phy',
    paper_id: 'phy_2',
    chapter_id: 'phy_2_ch1',
    concept_ids: ['phy_2_ch1_c_carnot_engine', 'phy_2_ch1_c_entropy_change'],
    scenario_archetype_id: 'arch_carnot_source_sink_temp',
    board: 'Chattogram',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'medium',
    stem_text: 'একটি কার্নো ইঞ্জিন $500\\text{ K}$ তাপমাত্রার উৎস হতে প্রতি চক্রে $1200\\text{ J}$ তাপ গ্রহণ করে এবং তাপ গ্রাহকে $800\\text{ J}$ তাপ বর্জন করে। পরবর্তীতে গ্রাহকের তাপমাত্রা স্থির রেখে উৎসের তাপমাত্রা বাড়িয়ে ইঞ্জিনের দক্ষতা $50\\%$ এ উন্নীত করার প্রস্তাব করা হলো।',
    subparts: [
      {
        id: 'q_ctg_2023_phy2_cq1_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'তাপগতিবিদ্যার শূন্যতম সূত্রটি বিবৃত করো।',
        concept_ids: ['phy_2_ch1_c_carnot_engine'],
        solution_latex: '\\text{দুটি বস্তু যদি তৃতীয় কোনো বস্তুর সাথে পৃথকভাবে তাপীয় সাম্যাবস্থায় থাকে, তবে প্রথমোক্ত বস্তুদ্বয় পরস্পরের সাথেও তাপীয় সাম্যাবস্থায় থাকবে।}'
      },
      {
        id: 'q_ctg_2023_phy2_cq1_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'পানির ত্রৈধবিন্দুর তাৎপর্য ব্যাখ্যা করো।',
        concept_ids: ['phy_2_ch1_c_carnot_engine'],
        solution_latex: '\\text{যে নির্দিষ্ট চাপ }(4.58\\text{ mm Hg})\\text{ ও তাপমাত্রায় }(273.16\\text{ K})\\text{ বিশুদ্ধ পানি একই সাথে বরফ, তরল ও বাষ্পীয় তিনটি রূপে সাম্যাবস্থায় থাকে, তাকে পানির ত্রৈধবিন্দু বলে। এটি পরম স্কেলের ভিত্তি।}'
      },
      {
        id: 'q_ctg_2023_phy2_cq1_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'উদ্দীপকের ইঞ্জিনটির তাপ গ্রাহকের তাপমাত্রা কত ছিল?',
        concept_ids: ['phy_2_ch1_c_carnot_engine'],
        scenario_archetype_id: 'arch_carnot_source_sink_temp',
        solution_latex: `\\text{প্রদত্ত: } T_1 = 500\\text{ K}, \\quad Q_1 = 1200\\text{ J}, \\quad Q_2 = 800\\text{ J} \\\\
\\text{আমরা জানি, কার্নো ইঞ্জিনের ক্ষেত্রে: } \\frac{Q_1}{Q_2} = \\frac{T_1}{T_2} \\implies T_2 = T_1 \\times \\frac{Q_2}{Q_1} \\\\
T_2 = 500 \\times \\frac{800}{1200} = 500 \\times \\frac{2}{3} = 333.33\\text{ K} \\text{ (বা } 60.33^\\circ\\text{C)}`
      },
      {
        id: 'q_ctg_2023_phy2_cq1_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'প্রস্তাবিত দক্ষতা অর্জনে উৎসের তাপমাত্রা কত বৃদ্ধি করতে হবে? গাণিতিক যুক্তিসহ মতামত দাও।',
        concept_ids: ['phy_2_ch1_c_carnot_engine'],
        scenario_archetype_id: 'arch_carnot_source_sink_temp',
        solution_latex: `\\text{নতুন দক্ষতা } \\eta' = 50\\% = 0.5, \\quad T_2 = 333.33\\text{ K (স্থির)} \\\\
\\eta' = 1 - \\frac{T_2}{T_1'} \\implies 0.5 = 1 - \\frac{333.33}{T_1'} \\implies \\frac{333.33}{T_1'} = 0.5 \\\\
T_1' = \\frac{333.33}{0.5} = 666.67\\text{ K} \\\\
\\text{উৎসের তাপমাত্রা বৃদ্ধি } \\Delta T_1 = T_1' - T_1 = 666.67 - 500 = 166.67\\text{ K} \\\\
\\text{অতএব, উৎসের তাপমাত্রা } 166.67\\text{ K (বা } ^\\circ\\text{C)} \\text{ বৃদ্ধি করলে ইঞ্জিনের দক্ষতা ৫০\\% হবে।}`
      }
    ],
    full_solution_latex: '\\text{পূর্ণ সমাধান প্রস্তুত।}',
    is_verified: true,
    created_at: '2024-01-17T00:00:00Z'
  },

  // 4. Dhaka Board 2024 Chemistry 1st Paper - CQ (Buffer & pH)
  {
    id: 'q_db_2024_chem1_cq5',
    scope: 'global_official',
    subject_id: 'chem',
    paper_id: 'chem_1',
    chapter_id: 'chem_1_ch4',
    concept_ids: ['chem_1_ch4_c_buffer_henderson'],
    scenario_archetype_id: 'arch_buffer_henderson_ph',
    board: 'Dhaka',
    exam_year: 2024,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'hard',
    stem_text: 'পাত্র A: $50\\text{ mL } 0.1\\text{ M } \\text{CH}_3\\text{COOH}$ দ্রবণ ($K_a = 1.8 \\times 10^{-5}$)। পাত্র B: $30\\text{ mL } 0.1\\text{ M } \\text{NaOH}$ দ্রবণ। পাত্র C তে A ও B মিশ্রিত করা হলো।',
    subparts: [
      {
        id: 'q_db_2024_chem1_cq5_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'বাফার দ্রবণ কাকে বলে?',
        concept_ids: ['chem_1_ch4_c_buffer_henderson'],
        solution_latex: '\\text{যে দ্রবণে সামান্য পরিমাণ তীব্র এসিড বা তীব্র ক্ষার যোগ করা সত্ত্বেও দ্রবণের pH মানের কোনো উল্লেখযোগ্য পরিবর্তন হয় না, তাকে বাফার দ্রবণ বলে।}'
      },
      {
        id: 'q_db_2024_chem1_cq5_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'অসওয়াল্ডের লঘুকরণ সূত্রটি তীব্র তড়িৎ বিশ্লেষ্যের জন্য প্রযোজ্য নয় কেন?',
        concept_ids: ['chem_1_ch4_c_buffer_henderson'],
        solution_latex: '\\text{অসওয়াল্ডের লঘুকরণ সূত্রটি মৃদু তড়িৎ বিশ্লেষ্যের বিয়োজন সাম্যাবস্থার ওপর ভিত্তি করে প্রতিষ্ঠিত। তীব্র তড়িৎ বিশ্লেষ্য সব ঘনমাত্রায় প্রায় সম্পূর্ণ বিয়োজিত থাকে, ফলে কোনো সাম্যাবস্থা তৈরি হয় না।}'
      },
      {
        id: 'q_db_2024_chem1_cq5_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'পাত্র C এর দ্রবণের pH নির্ণয় করো।',
        concept_ids: ['chem_1_ch4_c_buffer_henderson'],
        scenario_archetype_id: 'arch_buffer_henderson_ph',
        solution_latex: `\\text{মোল সংখ্যা হিসাব: } \\\\
n(\\text{CH}_3\\text{COOH}) = \\frac{50 \\times 0.1}{1000} = 5 \\times 10^{-3}\\text{ mol} \\\\
n(\\text{NaOH}) = \\frac{30 \\times 0.1}{1000} = 3 \\times 10^{-3}\\text{ mol} \\\\
\\text{বিক্রিয়া: } \\text{CH}_3\\text{COOH} + \\text{NaOH} \\rightarrow \\text{CH}_3\\text{COONa} + \\text{H}_2\\text{O} \\\\
\\text{অবশিষ্ট } \\text{CH}_3\\text{COOH} = (5 - 3) \\times 10^{-3} = 2 \\times 10^{-3}\\text{ mol} \\\\
\\text{উৎপন্ন লবণ } \\text{CH}_3\\text{COONa} = 3 \\times 10^{-3}\\text{ mol} \\\\
\\text{হেন্ডারসন সমীকরণানুসারে: } \\\\
pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]} = -\\log(1.8 \\times 10^{-5}) + \\log\\frac{3 \\times 10^{-3}}{2 \\times 10^{-3}} \\\\
pH = 4.745 + \\log(1.5) = 4.745 + 0.176 = 4.921`
      },
      {
        id: 'q_db_2024_chem1_cq5_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'পাত্র C এর দ্রবণে অল্প পরিমাণ তীব্র এসিড বা ক্ষার যোগ করলে pH কীভাবে অপরিবর্তিত থাকে? আয়নিক সমীকরণসহ বাফার ক্রিয়া-কৌশল ব্যাখ্যা করো।',
        concept_ids: ['chem_1_ch4_c_buffer_henderson'],
        scenario_archetype_id: 'arch_buffer_resistance_mechanism',
        solution_latex: `\\text{পাত্র C একটি অম্লীয় বাফার দ্রবণ যেখানে অবিয়োজিত } \\text{CH}_3\\text{COOH} \\text{ এবং সম্পূর্ণ আয়নিত } \\text{CH}_3\\text{COO}^- \\text{ ও } \\text{Na}^+ \\text{ আয়ন বিদ্যমান।} \\\\
\\textbf{1. এসিড (H}^+\\textbf{) সংযোজন: } \\text{বাইরে থেকে সামান্য } \\text{H}^+ \\text{ যোগ করলে তা বাফারে উপস্থিত এসিটেট আয়নের সাথে যুক্ত হয়ে মৃদু বিয়োজিত এসিটিক এসিড তৈরি করে: } \\\\
\\text{CH}_3\\text{COO}^- + \\text{H}^+ \\rightleftharpoons \\text{CH}_3\\text{COOH} \\quad (pH \\text{ প্রায় অপরিবর্তিত}) \\\\
\\textbf{2. ক্ষার (OH}^-\\textbf{) সংযোজন: } \\text{বাইরে থেকে সামান্য } \\text{OH}^- \\text{ যোগ করলে তা এসিটিক এসিডের সাথে বিক্রিয়া করে পানি উৎপন্ন করে: } \\\\
\\text{CH}_3\\text{COOH} + \\text{OH}^- \\rightleftharpoons \\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O} \\quad (pH \\text{ অপরিবর্তিত থাকে})`
      }
    ],
    full_solution_latex: '\\text{সম্পূর্ণ অম্লীয় বাফার ক্রিয়া কৌশল বিশ্লেষণ ও pH সমাধান প্রস্তুত।}',
    is_verified: true,
    created_at: '2024-01-18T00:00:00Z'
  },

  // 5. Higher Math 1st Paper - MCQ
  {
    id: 'q_hmath_mcq_1',
    scope: 'global_official',
    subject_id: 'hmath',
    paper_id: 'hmath_1',
    chapter_id: 'hmath_1_ch9',
    concept_ids: ['hmath_1_ch9_c_maxima_minima'],
    scenario_archetype_id: 'arch_math_poly_extrema',
    board: 'Dhaka',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'MCQ',
    difficulty_tier: 'medium',
    stem_text: '$f(x) = x^3 - 3x + 5$ ফাংশনটির গুরুমান কত?',
    mcq_options: [
      { key: 'A', text: '3' },
      { key: 'B', text: '7' },
      { key: 'C', text: '5' },
      { key: 'D', text: '-1' }
    ],
    correct_option: 'B',
    full_solution_latex: `f'(x) = 3x^2 - 3 = 0 \\implies x^2 = 1 \\implies x = \\pm 1 \\\\
f''(x) = 6x \\\\
x = -1 \\text{ বিন্দুতে } f''(-1) = -6 < 0 \\implies \\text{গুরুমান বিদ্যমান।} \\\\
\\text{অতএব গুরুমান } = f(-1) = (-1)^3 - 3(-1) + 5 = -1 + 3 + 5 = 7`,
    is_verified: true,
    created_at: '2024-01-19T00:00:00Z'
  },

  // 6. Rajshahi Board 2024 Higher Math 2nd Paper - CQ (Conics: Parabola & Ellipse)
  {
    id: 'q_rb_2024_hmath2_cq1',
    scope: 'global_official',
    subject_id: 'hmath',
    paper_id: 'hmath_2',
    chapter_id: 'hmath_2_ch6',
    concept_ids: ['hmath_2_ch6_c_parabola_standard', 'hmath_2_ch6_c_ellipse_eccentricity'],
    board: 'Rajshahi',
    exam_year: 2024,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'medium',
    stem_text: 'দৃশ্যকল্প-১: একটি কণিক যার সমীকরণ $y^2 = 8x - 16$।\\nদৃশ্যকল্প-২: অপর একটি কণিকের ফোকাসদ্বয়ের মধ্যবর্তী দূরত্ব $8$ এবং উৎকেন্দ্রিকতা $e = \\frac{1}{\\sqrt{2}}$।',
    subparts: [
      {
        id: 'q_rb_2024_hmath2_cq1_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'কণিকের উৎকেন্দ্রিকতা বলতে কী বোঝায়?',
        concept_ids: ['hmath_2_ch6_c_parabola_standard'],
        solution_latex: '\\text{কোনো চলমান বিন্দু হতে একটি নির্দিষ্ট স্থির বিন্দু (উপকেন্দ্র) এবং একটি নির্দিষ্ট সরলরেখার (নিয়ামক) লম্ব দূরত্বের ধ্রুব অনুপাতকে কণিকের উৎকেন্দ্রিকতা (e) বলে।}'
      },
      {
        id: 'q_rb_2024_hmath2_cq1_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'দেখাও যে, $x^2 + 4y = 0$ পরাবৃত্তটির নিয়ামকের সমীকরণ $y - 1 = 0$।',
        concept_ids: ['hmath_2_ch6_c_parabola_standard'],
        solution_latex: `x^2 = -4(1)y \\implies x^2 = 4ay, \\quad a = -1 \\\\
\\text{শীর্ষবিন্দু } (0,0) \\text{। নিয়ামকের সমীকরণ } y = -a = -(-1) = 1 \\implies y - 1 = 0 \\quad \\text{(প্রমাণিত)}`
      },
      {
        id: 'q_rb_2024_hmath2_cq1_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'দৃশ্যকল্প-১ এর পরাবৃত্তটির শীর্ষবিন্দু, উপকেন্দ্র ও উপকেন্দ্রিক লম্বের দৈর্ঘ্য নির্ণয় করো।',
        concept_ids: ['hmath_2_ch6_c_parabola_standard'],
        solution_latex: `y^2 = 8(x - 2) \\implies Y^2 = 4aX, \\quad a = 2, \\quad X = x - 2, \\quad Y = y \\\\
\\text{১. শীর্ষবিন্দু: } X = 0, Y = 0 \\implies x - 2 = 0 \\implies (2, 0) \\\\
\\text{২. উপকেন্দ্র: } X = a = 2 \\implies x - 2 = 2 \\implies x = 4; \\quad Y = 0 \\implies y = 0 \\implies (4, 0) \\\\
\\text{৩. উপকেন্দ্রিক লম্বের দৈর্ঘ্য } = |4a| = |4 \\times 2| = 8`
      },
      {
        id: 'q_rb_2024_hmath2_cq1_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'দৃশ্যকল্প-২ এর আলোকে উপবৃত্তটির প্রমিত সমীকরণ এবং উপকেন্দ্রিক লম্বের দৈর্ঘ্য নির্ণয় করো।',
        concept_ids: ['hmath_2_ch6_c_ellipse_eccentricity'],
        solution_latex: `\\text{ফোকাসদ্বয়ের দূরত্ব } 2ae = 8 \\implies 2a \\left(\\frac{1}{\\sqrt{2}}\\right) = 8 \\implies a = 4\\sqrt{2} \\implies a^2 = 32 \\\\
e = \\sqrt{1 - \\frac{b^2}{a^2}} \\implies \\frac{1}{2} = 1 - \\frac{b^2}{32} \\implies \\frac{b^2}{32} = \\frac{1}{2} \\implies b^2 = 16 \\\\
\\text{উপবৃত্তের প্রমিত সমীকরণ: } \\frac{x^2}{32} + \\frac{y^2}{16} = 1 \\\\
\\text{উপকেন্দ্রিক লম্বের দৈর্ঘ্য } = \\frac{2b^2}{a} = \\frac{2 \\times 16}{4\\sqrt{2}} = \\frac{32}{4\\sqrt{2}} = 4\\sqrt{2}`
      }
    ],
    full_solution_latex: '\\text{উচ্চতর গণিত ২য় পত্র কণিক সংক্রান্ত পূর্ণ বিশ্লেষণ সম্পন্ন।}',
    is_verified: true,
    created_at: '2024-01-20T00:00:00Z'
  },

  // 7. Dinajpur Board 2023 Chemistry 2nd Paper - CQ (Electrochemistry & Nernst Equation)
  {
    id: 'q_din_2023_chem2_cq2',
    scope: 'global_official',
    subject_id: 'chem',
    paper_id: 'chem_2',
    chapter_id: 'chem_2_ch4',
    concept_ids: ['chem_2_ch4_c_nernst_equation'],
    board: 'Dinajpur',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'hard',
    stem_text: 'একটি ড্যানিয়েল কোষে অ্যানোড পাত্রে $0.05\\text{ M } \\text{ZnSO}_4$ এবং ক্যাথোড পাত্রে $0.5\\text{ M } \\text{CuSO}_4$ দ্রবণ নেওয়া হলো। প্রমাণ বিজারণ বিভব: $E^\\circ_{\\text{Zn}^{2+}/\\text{Zn}} = -0.76\\text{ V}$ এবং $E^\\circ_{\\text{Cu}^{2+}/\\text{Cu}} = +0.34\\text{ V}$ ($25^\\circ\\text{C}$ তাপমাত্রায়)।',
    subparts: [
      {
        id: 'q_din_2023_chem2_cq2_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'লবণ সেতু কী?',
        concept_ids: ['chem_2_ch4_c_nernst_equation'],
        solution_latex: '\\text{লবণ সেতু হলো U-আকৃতির একটি কাঁচের নল যার মধ্যে নিষ্ক্রিয় তড়িৎ বিশ্লেষ্য (যেমন KCl, KNO3) ও আগার-আগার জেল মিশ্রিত থাকে যা দুই অর্ধকোষের তড়িৎ নিরপেক্ষতা বজায় রাখে।}'
      },
      {
        id: 'q_din_2023_chem2_cq2_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'ড্যানিয়েল কোষে ইলেকট্রন প্রবাহের দিক ও বিদ্যুৎ প্রবাহের দিক বিপরীত হয় কেন?',
        concept_ids: ['chem_2_ch4_c_nernst_equation'],
        solution_latex: '\\text{অ্যানোডে জারণের ফলে মুক্ত ইলেকট্রন বহিঃবর্তনীর মাধ্যমে জিঙ্ক থেকে কপারে প্রবাহিত হয়। সনাতন নিয়ম অনুসারে বিদ্যুৎ প্রবাহের দিক ধনাত্মক আধানের গতির দিক, অর্থাৎ ইলেকট্রনের প্রবাহের বিপরীতমুখী (কপার থেকে জিঙ্কের দিকে) ধরা হয়।}'
      },
      {
        id: 'q_din_2023_chem2_cq2_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'উদ্দীপকের কোষটির প্রমাণ তড়িৎচালক বল ($E^\\circ_{\\text{cell}}$) গণনা করো।',
        concept_ids: ['chem_2_ch4_c_nernst_equation'],
        solution_latex: `E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} \\\\
= E^\\circ_{\\text{Cu}^{2+}/\\text{Cu}} - E^\\circ_{\\text{Zn}^{2+}/\\text{Zn}} = (+0.34\\text{ V}) - (-0.76\\text{ V}) = 0.34 + 0.76 = +1.10\\text{ V}`
      },
      {
        id: 'q_din_2023_chem2_cq2_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'উদ্দীপকের ঘনমাত্রায় কোষটির কার্যকর EMF নার্নস্ট সমীকরণের সাহায্যে হিসাব করো এবং কোষটি স্বতঃস্ফূর্ত হবে কি না মন্তব্য করো।',
        concept_ids: ['chem_2_ch4_c_nernst_equation'],
        solution_latex: `\\text{কোষ বিক্রিয়া: } \\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\rightarrow \\text{Zn}^{2+}(aq) + \\text{Cu}(s), \\quad n = 2 \\\\
\\text{নার্নস্ট সমীকরণ: } E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n}\\log \\frac{[\\text{Zn}^{2+}]}{[\\text{Cu}^{2+}]} \\\\
E_{\\text{cell}} = 1.10 - \\frac{0.0591}{2}\\log\\left(\\frac{0.05}{0.5}\\right) = 1.10 - 0.02955\\log(0.1) \\\\
\\log(0.1) = -1 \\implies E_{\\text{cell}} = 1.10 - 0.02955(-1) = 1.10 + 0.02955 = +1.1296\\text{ V} \\\\
\\text{যেহেতু } E_{\\text{cell}} > 0 \\text{ (ধনাত্মক), কোষ বিক্রিয়াটি সম্পূর্ণ স্বতঃস্ফূর্তভাবে সংঘটিত হবে।}`
      }
    ],
    full_solution_latex: '\\text{রসায়ন ২য় পত্র তড়িৎ রসায়ন সমাধান সম্পন্ন।}',
    is_verified: true,
    created_at: '2024-01-21T00:00:00Z'
  },

  // 8. Dhaka Board 2024 Biology 1st Paper (Botany) - CQ (Fluid Mosaic Model & DNA)
  {
    id: 'q_db_2024_bio1_cq3',
    scope: 'global_official',
    subject_id: 'bio',
    paper_id: 'bio_1',
    chapter_id: 'bio_1_ch1',
    concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
    board: 'Dhaka',
    exam_year: 2024,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'medium',
    stem_text: 'শিক্ষক ক্লাসে কোষীয় ঝিল্লির একটি সর্বজনগ্রাহ্য দ্বি-স্তরী মডেল সম্পর্কে বললেন যাতে লিপিড অণুর সমুদ্রে প্রোটিন অণুগুলো মোজাইকের মতো ভাসমান থাকে। অন্যদিকে তিনি বংশগতির প্রধান আণবিক ভিত্তি হিসেবে একটি দ্বি-সূত্রক সর্পিলাকার নিউক্লিক এসিড অণুর গঠন ব্যাখ্যা করলেন।',
    subparts: [
      {
        id: 'q_db_2024_bio1_cq3_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'ফসফোলিপিড অণুর হাইড্রোফিলিক প্রান্ত কোনটি?',
        concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
        solution_latex: '\\text{ফসফোলিপিড অণুর মেরুযুক্ত গ্লিসারল ও ফসফেট মাথা (Head) হলো পানিগ্রাহী বা হাইড্রোফিলিক প্রান্ত।}'
      },
      {
        id: 'q_db_2024_bio1_cq3_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'প্লাজমা মেমব্রেনকে বৈষম্যভেদ্য পর্দা বলা হয় কেন?',
        concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
        solution_latex: '\\text{যে পর্দা দিয়ে দ্রাবক অণু সহজেই চলাচল করতে পারে কিন্তু সব ধরনের দ্রাব অণু অবাধে চলাচল করতে পারে না (কেবল নির্দিষ্ট অণু নিয়ন্ত্রিতভাবে প্রবেশ করে), তাকে বৈষম্যভেদ্য পর্দা বলে। প্লাজমা মেমব্রেন কোষের ভেতরে পদার্থের প্রবেশ নিয়ন্ত্রণ করে।}'
      },
      {
        id: 'q_db_2024_bio1_cq3_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'উদ্দীপকে উল্লিখিত কোষীয় ঝিল্লির ফ্লুইড মোজাইক মডেলটির চিহ্নিত চিত্রসহ গাঠনিক উপাদানগুলো ব্যাখ্যা করো।',
        concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
        solution_latex: '\\text{ফ্লুইড মোজাইক মডেলের প্রধান ৪টি গাঠনিক উপাদান: ১. ফসফোলিপিড বাইলেয়ার (লিপিড দ্বিস্তর), ২. মেমব্রেন প্রোটিন (ইনটিগ্রাল, পেরিফেরাল ও লিপিড-সম্পৃক্ত প্রোটিন), ৩. গ্লাইকোক্যালিক্স (গ্লাইকোপ্রোটিন ও গ্লাইকোলিপিড) এবং ৪. কোলেস্টেরল।}'
      },
      {
        id: 'q_db_2024_bio1_cq3_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'উদ্দীপকে উল্লিখিত বংশগতির আণবিক উপাদানটির (DNA) রাসায়নিক গঠন ও জৈবিক গুরুত্ব বিশ্লেষণ করো।',
        concept_ids: ['bio_1_ch1_c_fluid_mosaic'],
        solution_latex: '\\text{DNA অণু ডিঅক্সিরাইবোজ শর্করা, অজৈব ফসফেট এবং ৪ ধরনের নাইট্রোজেনাস ক্ষারক (A, T, G, C) সমন্বয়ে গঠিত। ওয়াটসন ও ক্রিক মডেল অনুসারে দুটি পরিপূরক সূত্র বিপরীতমুখী (5\' to 3\' ও 3\' to 5\') সমান্তরালভাবে হাইড্রোজেন বন্ধন (A=T, G\\equiv C) দ্বারা যুক্ত থাকে। এটি সকল জীবের চারিত্রিক বৈশিষ্ট্য সংরক্ষণ ও ট্রান্সক্রিপশনের মাধ্যমে প্রোটিন সংশ্লেষণ নিয়ন্ত্রণ করে।}'
      }
    ],
    full_solution_latex: '\\text{উদ্ভিদবিজ্ঞান ১ম পত্র কোষ ও এর গঠন সৃজনশীল সমাধান সম্পন্ন।}',
    is_verified: true,
    created_at: '2024-01-22T00:00:00Z'
  },

  // 9. Chattogram Board 2024 Biology 2nd Paper (Zoology) - CQ (Genetics & Sex Linkage)
  {
    id: 'q_ctg_2024_bio2_cq4',
    scope: 'global_official',
    subject_id: 'bio',
    paper_id: 'bio_2',
    chapter_id: 'bio_2_ch11',
    concept_ids: ['bio_2_ch11_c_mendel_second_law'],
    board: 'Chattogram',
    exam_year: 2024,
    origin_type: 'board',
    question_format: 'CQ',
    difficulty_tier: 'hard',
    stem_text: 'একজন স্বাভাবিক দৃষ্টিসম্পন্ন কিন্তু বর্ণান্ধতার বাহক মহিলার সাথে একজন স্বাভাবিক পুরুষের বিবাহ হলো। চিকিৎসক তাদের অনাগত সন্তানদের মধ্যে বর্ণান্ধতা সঞ্চারণের সম্ভাবনা সম্পর্কে সতর্ক করলেন।',
    subparts: [
      {
        id: 'q_ctg_2024_bio2_cq4_a',
        part_label: 'a',
        cognitive_level: 'knowledge',
        marks: 1,
        prompt_text: 'হিমোফিলিয়া কী?',
        concept_ids: ['bio_2_ch11_c_mendel_second_law'],
        solution_latex: '\\text{হিমোফিলিয়া হলো মানুষের একটি এক্স-লিঙ্কড বংশগত রক্তক্ষরণজনিত রোগ যাতে রক্ত জমাট বাঁধার প্রয়োজনীয় ফ্যাক্টর (VIII বা IX) এর ঘাটতি থাকে।}'
      },
      {
        id: 'q_ctg_2024_bio2_cq4_b',
        part_label: 'b',
        cognitive_level: 'understanding',
        marks: 2,
        prompt_text: 'টেস্ট ক্রস ও ব্যাক ক্রসের মধ্যে পার্থক্য কী?',
        concept_ids: ['bio_2_ch11_c_mendel_second_law'],
        solution_latex: '\\text{F1 জনুর জীবের সাথে যেকোনো মাতৃজনু বা পিতৃজনুর ক্রসকে ব্যাক ক্রস বলে। কিন্তু F1 জনুর সাথে কেবলমাত্র বিশুদ্ধ প্রচ্ছন্ন জনকের ক্রসকে টেস্ট ক্রস বলে যার মাধ্যমে F1 জনু হোমোজাইগাস নাকি হেটেরোজাইগাস তা শনাক্ত করা যায়।}'
      },
      {
        id: 'q_ctg_2024_bio2_cq4_c',
        part_label: 'c',
        cognitive_level: 'application',
        marks: 3,
        prompt_text: 'চেকারবোর্ডের সাহায্যে উদ্দীপকের দম্পতির সন্তানদের ফিনোটাইপ ও জিনোটাইপ অনুপাত নির্ণয় করো।',
        concept_ids: ['bio_2_ch11_c_mendel_second_law'],
        solution_latex: `\\text{ধরি, স্বাভাবিক দৃষ্টির জিন } X^C \\text{ এবং বর্ণান্ধতার জিন } X^c \\\\
\\text{মাতার জিনোটাইপ (বাহক): } X^C X^c, \\quad \\text{পিতার জিনোটাইপ (স্বাভাবিক): } X^C Y \\\\
\\text{গ্যামেট: মাতা } (X^C, X^c), \\quad \\text{পিতা } (X^C, Y) \\\\
\\text{সন্তানদের জিনোটাইপ: } \\\\
1. X^C X^C : \\text{স্বাভাবিক দৃষ্টিসম্পন্ন কন্যা (২৫\\%)} \\\\
2. X^C X^c : \\text{বাহক কন্যা (স্বাভাবিক দৃষ্টি) (২৫\\%)} \\\\
3. X^C Y : \\text{স্বাভাবিক পুত্র (২৫\\%)} \\\\
4. X^c Y : \\text{বর্ণান্ধ পুত্র (২৫\\%)} \\\\
\\text{পুত্রদের মধ্যে ৫০\\% বর্ণান্ধ এবং কন্যারা সকলে দৃষ্টিসম্পন্ন (৫০\\% বাহক)।}`
      },
      {
        id: 'q_ctg_2024_bio2_cq4_d',
        part_label: 'd',
        cognitive_level: 'higher_ability',
        marks: 4,
        prompt_text: 'মহিলাদের তুলনায় পুরুষদের মধ্যে বর্ণান্ধতা ও হিমোফিলিয়ার প্রকোপ বেশি দেখা যায় কেন? জিনতাত্ত্বিক যুক্তিসহ বিশ্লেষণ করো।',
        concept_ids: ['bio_2_ch11_c_mendel_second_law'],
        solution_latex: '\\text{বর্ণান্ধতা ও হিমোফিলিয়া হলো এক্স-লিঙ্কড প্রচ্ছন্ন (X-linked recessive) রোগ। পুরুষদের সেক্স ক্রোমোজোম XY হওয়ায় তাদের একটি মাত্র X ক্রোমোজোমে প্রচ্ছন্ন অ্যালিল থাকলেই রোগটি পূর্ণ প্রকাশ পায় কারণ Y ক্রোমোজোমে এর কোনো সমজাতীয় অ্যালিল থাকে না (Hemizygous অবস্থা)। অন্যদিকে নারীদের XX ক্রোমোজোম থাকায় উভয় X ক্রোমোজোমে প্রচ্ছন্ন জিন উপস্থিত না থাকলে কেবল বাহক হিসেবে থাকে কিন্তু রোগী হয় না। তাই পুরুষদের আক্রান্ত হওয়ার হার অনেক বেশি।}'
      }
    ],
    full_solution_latex: '\\text{প্রাণিবিজ্ঞান ২য় পত্র জিনতত্ত্ব সৃজনশীল সমাধান সম্পন্ন।}',
    is_verified: true,
    created_at: '2024-01-23T00:00:00Z'
  },

  // 10. Biology 1st Paper - MCQ
  {
    id: 'q_bio_mcq_1',
    scope: 'global_official',
    subject_id: 'bio',
    paper_id: 'bio_1',
    chapter_id: 'bio_1_ch9',
    concept_ids: ['bio_1_ch9_c_photosynthesis_c3_c4'],
    board: 'Dhaka',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'MCQ',
    difficulty_tier: 'easy',
    stem_text: 'C4 উদ্ভিদে প্রথম স্থায়ী পদার্থ কোনটি?',
    mcq_options: [
      { key: 'A', text: '৩-ফসফোগ্লিসারিক এসিড (3-PGA)' },
      { key: 'B', text: 'অক্সালোঅ্যাসিটিক এসিড (OAA)' },
      { key: 'C', text: 'ফসফোএনল পাইরুভিক এসিড (PEP)' },
      { key: 'D', text: 'রাইবুলোজ ১,৫-বিসফসফেট (RuBP)' }
    ],
    correct_option: 'B',
    full_solution_latex: '\\text{C4 উদ্ভিদে (যেমন আখ, ভুট্টা) হ্যাচ ও স্ল্যাক চক্রে কার্বন ডাই অক্সাইড সংবন্ধনের পর প্রথম স্থায়ী যৌগ হলো ৪-কার্বনবিশিষ্ট ডাইকার্বক্সিলিক এসিড অক্সালোঅ্যাসিটিক এসিড (OAA)।}',
    is_verified: true,
    created_at: '2024-01-24T00:00:00Z'
  },

  // 11. Chemistry 2nd Paper - MCQ
  {
    id: 'q_chem2_mcq_1',
    scope: 'global_official',
    subject_id: 'chem',
    paper_id: 'chem_2',
    chapter_id: 'chem_2_ch2',
    concept_ids: ['chem_2_ch2_c_electrophilic_sub'],
    board: 'Chattogram',
    exam_year: 2023,
    origin_type: 'board',
    question_format: 'MCQ',
    difficulty_tier: 'medium',
    stem_text: 'নিচের কোনটি মেটা নির্দেশক মূলক?',
    mcq_options: [
      { key: 'A', text: '$-\\text{OH}$' },
      { key: 'B', text: '$-\\text{NH}_2$' },
      { key: 'C', text: '$-\\text{NO}_2$' },
      { key: 'D', text: '$-\\text{CH}_3$' }
    ],
    correct_option: 'C',
    full_solution_latex: '\\text{নাইট্রো মূলক (}-\\text{NO}_2\\text{) বেনজিন বলয় হতে পাই ইলেকট্রন নিজের দিকে টেনে নেয় (ইলেকট্রন আকর্ষণকারী মূলক) এবং অর্থো ও প্যারা অবস্থানে ইলেকট্রন ঘনত্ব কমিয়ে দেয়। ফলে আগত ইলেকট্রোফাইল অপেক্ষাকৃত বেশি ইলেকট্রন ঘনত্বযুক্ত মেটা অবস্থানে আক্রমণ করে।}',
    is_verified: true,
    created_at: '2024-01-25T00:00:00Z'
  }
];

export const PRESEEDED_DOCUMENT_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk_textbook_phy1_ch4_torque',
    document_title: 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ১ম পত্র (ড. শাহজাহান তপন ও অন্যান্য)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'phy',
    paper_id: 'phy_1',
    chapter_id: 'phy_1_ch4',
    concept_ids: ['phy_1_ch4_c_torque_angular_momentum', 'phy_1_ch4_c_moment_of_inertia'],
    page_number: 142,
    section_title: '৪.৫ টর্ক ও কৌণিক ভরবেগের সংরক্ষণ নীতি',
    content_text: 'ঘূর্ণন গতিতে বলের সমতুল্য রাশি হলো টর্ক (Torque) বা বলের ভ্রামক। কোনো নির্দিষ্ট ঘূর্ণন অক্ষের সাপেক্ষে অবস্থান ভেক্টর r এবং প্রযুক্ত বল F এর ভেক্টর গুণফলই টর্ক: tau = r x F। আবার নিউটনের দ্বিতীয় সূত্রের ঘূর্ণন রূপানুসারে tau = I*alpha। বাহ্যিক টর্কের অনুপস্থিতিতে কোনো ব্যবস্থার মোট কৌণিক ভরবেগ ধ্রুব থাকে (L = I*omega = constant)। যেমন: ঘূর্ণায়মান চেয়ারে বসে থাকা ব্যক্তি হাত গুটিয়ে নিলে জড়তার ভ্রামক (I) হ্রাস পায় এবং ফলস্বরূপ কৌণিক বেগ (omega) দ্রুত বৃদ্ধি পায়।',
    formula_latex: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I\\vec{\\alpha}, \\quad L = I\\omega = \\text{ধ্রুবক}'
  },
  {
    id: 'chunk_textbook_phy1_ch4_banking',
    document_title: 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ১ম পত্র (প্রফেসর মো. গিয়াসউদ্দিন ও অন্যান্য)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'phy',
    paper_id: 'phy_1',
    chapter_id: 'phy_1_ch4',
    concept_ids: ['phy_1_ch4_c_road_banking'],
    page_number: 156,
    section_title: '৪.৮ রাস্তার ব্যাংকিং ও নিরাপদ বাঁক',
    content_text: 'বৃত্তাকার বাঁকে চলার সময় গাড়ির কেন্দ্রের দিকে কেন্দ্রমুখী বল (mv^2/r) প্রয়োজন হয়। অনুভূমিক রাস্তায় এই বল সম্পূর্ণ আসে টায়ার ও রাস্তার মধ্যবর্তী ঘর্ষণ থেকে, যা বৃষ্টির দিনে হ্রাস পেয়ে দুর্ঘটনা ঘটায়। তাই বাঁকের ভেতরের প্রান্ত অপেক্ষা বাইরের প্রান্ত সামান্য উঁচু করে রাস্তা ঢালু (ব্যাংকিং) করা হয়। ব্যাংকিং কোণ theta হলে tan(theta) = v^2/(rg) এবং রাস্তার প্রস্থ w ও উচ্চতার ব্যবধান h হলে tan(theta) approx h/w।',
    formula_latex: '\\tan\\theta = \\frac{v^2}{rg} = \\frac{h}{w}'
  },
  {
    id: 'chunk_textbook_phy2_ch1_carnot',
    document_title: 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ২য় পত্র (ড. শাহজাহান তপন)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'phy',
    paper_id: 'phy_2',
    chapter_id: 'phy_2_ch1',
    concept_ids: ['phy_2_ch1_c_carnot_engine', 'phy_2_ch1_c_entropy_change'],
    page_number: 38,
    section_title: '১.৬ কার্নোর চক্র ও ইঞ্জিনের কর্মদক্ষতা',
    content_text: 'ফরাসি প্রকৌশলী সাদী কার্নো ১৮২৪ সালে একটি সম্পূর্ণ প্রত্যাবর্তী চক্রাকার ইঞ্জিনের ধারণা দেন যা দুটি সমোষ্ণ (Isothermal) ও দুটি রুদ্ধতাপীয় (Adiabatic) প্রক্রিয়ার সমন্বয়ে গঠিত। কার্নো ইঞ্জিনের কর্মদক্ষতা eta = 1 - T2/T1 = (T1 - T2)/T1 = (Q1 - Q2)/Q1। কোনো বাস্তব ইঞ্জিনের দক্ষতা কখনোই সমতাপমাত্রার সীমার মধ্যে কার্যরত কার্নো ইঞ্জিনের চেয়ে বেশি হতে পারে না।',
    formula_latex: '\\eta = 1 - \\frac{T_2}{T_1} = \\frac{W}{Q_1}'
  },
  {
    id: 'chunk_textbook_chem1_ch4_buffer',
    document_title: 'উচ্চ মাধ্যমিক রসায়ন ১ম পত্র (ড. গাজী মো. আহসানুল কবীর ও ড. মো. রবিউল ইসলাম)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'chem',
    paper_id: 'chem_1',
    chapter_id: 'chem_1_ch4',
    concept_ids: ['chem_1_ch4_c_buffer_henderson'],
    page_number: 218,
    section_title: '৪.৭ বাফার দ্রবণ ও হেন্ডারসন-হ্যাসেলবালখ সমীকরণ',
    content_text: 'মৃদু এসিড এবং উক্ত মৃদু এসিড ও তীব্র ক্ষারের লবণের মিশ্রণকে অম্লীয় বাফার দ্রবণ বলে (যেমন: CH3COOH + CH3COONa)। হেন্ডারসন সমীকরণানুসারে: pH = pKa + log([Salt]/[Acid])। মানব রক্তে প্রধান বাফার হলো কার্বনিক এসিড-বাইকার্বনেট বাফার (H2CO3 / NaHCO3) যা রক্তের pH মান ৭.৪ এ স্থির রাখে।',
    formula_latex: 'pH = pK_a + \\log\\frac{[\\text{লবণ}]}{[\\text{এসিড}]}'
  },
  {
    id: 'chunk_textbook_bangla1_ch1_oporichita',
    document_title: 'উচ্চ মাধ্যমিক সাহিত্যপাঠ (এনসিটিবি)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'bangla',
    paper_id: 'bangla_1',
    chapter_id: 'bangla_1_ch1',
    concept_ids: ['bangla_1_ch1_c_oporichita'],
    page_number: 8,
    section_title: 'অপরিচিতা - মূল গল্প ও চরিত্র বিশ্লেষণ',
    content_text: 'শম্ভুনাথ সেন কন্যার গহনা পরখ করার জন্য সেকরার উপস্থিতি দেখে বিয়ে ভেঙে দেন। কল্যাণী যৌতুকের অন্যায়ের বিরুদ্ধে প্রতিবাদী হয়ে আজীবন কুমারী থেকে দেশসেবা ও নারী শিক্ষায় ব্রতী হয়। অনুপম শেষপর্যন্ত তার অপরাধবোধ ও ব্যর্থতার গ্লানি নিয়ে কল্যাণীর আত্মত্যাগকে পূজা করে।'
  },
  {
    id: 'chunk_textbook_bangla1_ch3_raincoat',
    document_title: 'উচ্চ মাধ্যমিক সাহিত্যপাঠ (এনসিটিবি)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'bangla',
    paper_id: 'bangla_1',
    chapter_id: 'bangla_1_ch3',
    concept_ids: ['bangla_1_ch3_c_raincoat'],
    page_number: 44,
    section_title: 'রেইনকোট - প্রতীক ও মুক্তিযুদ্ধের বাস্তব চিত্র',
    content_text: 'মিন্টুর রেইনকোটটি গায়ে চাপানোর পর নুরুল হুদার ভীরু মনের পরিবর্তন ঘটে। পাকিস্তানি মিলিটারি ক্যাম্পে নির্মম নির্যাতনের শিকার হয়েও সে মুক্তিযোদ্ধাদের ঠিকানা প্রকাশ করে না। রেইনকোটটি বাঙালির প্রতিরোধ স্পৃহা এবং মুক্তিযোদ্ধার তেজস্বিতার প্রতীকরূপে প্রতিভাত হয়েছে।'
  },
  {
    id: 'chunk_textbook_bangla2_ch2_noto_shato',
    document_title: 'উচ্চ মাধ্যমিক বাংলা ভাষার ব্যাকরণ ও নির্মিতি (ড. হায়াৎ মামুদ)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'bangla',
    paper_id: 'bangla_2',
    chapter_id: 'bangla_2_ch2',
    concept_ids: ['bangla_2_ch2_c_noto_shato'],
    page_number: 34,
    section_title: 'ণ-ত্ব ও ষ-ত্ব বিধানের সূত্রাবলি',
    content_text: 'তৎসম শব্দে ঋ, র, ষ এর পরে মূর্ধন্য-ণ হয় (যেমন: ঋণ, বর্ণ, ভীষণ)। ট-বর্গীয় ধ্বনির পূর্বে তৎসম শব্দে যুক্তবর্ণে মূর্ধন্য-ণ হয় (যেমন: বণ্টন, লণ্ঠন, কাণ্ড)। খাঁটি বাংলা ও বিদেশি শব্দে ণ ও ষ হয় না (যেমন: কোরআন, গভর্নর, পোস্ট, স্টেশন)।'
  },
  {
    id: 'chunk_textbook_eng2_ch2_conditionals',
    document_title: 'Advanced Functional English Grammar for HSC',
    authority_level: 'official_nctb_textbook',
    subject_id: 'english',
    paper_id: 'english_2',
    chapter_id: 'english_2_ch2',
    concept_ids: ['english_2_ch2_c_conditionals_completion'],
    page_number: 48,
    section_title: 'Conditional Sentence Patterns & Completion',
    content_text: 'Third Conditional structure: If + subject + had + V3, subject + would/could/might + have + V3. Example: "If I had seen him, I would have given him the message." With "Lest": Lest + subject + should + bare infinitive (e.g., "Walk fast lest you should miss the train"). With "It is high time": Followed by past simple (e.g., "It is high time we changed our bad habits").'
  },
  {
    id: 'chunk_textbook_ict1_ch3_twos_comp',
    document_title: 'তথ্য ও যোগাযোগ প্রযুক্তি একাদশ-দ্বাদশ শ্রেণি (প্রকৌশলী মুজিবুর রহমান)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'ict',
    paper_id: 'ict_1',
    chapter_id: 'ict_1_ch3',
    concept_ids: ['ict_1_ch3_c_twos_complement'],
    page_number: 145,
    section_title: '৩.৪ ২-এর পরিপূরক গঠন ও যোগের মাধ্যমে বিয়োগ',
    content_text: 'যেকোনো ধনাত্মক বাইনারি সংখ্যার বিটগুলোকে উল্টে দিলে (০ এর স্থলে ১ এবং ১ এর স্থলে ০) ১-এর পরিপূরক পাওয়া যায়। এর সাথে ১ যোগ করলে ২-এর পরিপূরক গঠিত হয় যা সংখ্যাটির ঋণাত্মক মান নির্দেশ করে। ৮-বিট রেজিস্টারে (+২৫) এবং (-১২) এর যোগফলে ক্যারি বিট অগ্রাহ্য করলে সরাসরি ফলাফল (+১৩) পাওয়া যায়।',
    formula_latex: '\\text{2\'s Complement} = \\text{1\'s Complement} + 1'
  },
  {
    id: 'chunk_textbook_ict1_ch3_logic_gates',
    document_title: 'তথ্য ও যোগাযোগ প্রযুক্তি একাদশ-দ্বাদশ শ্রেণি (এনসিটিবি অনুমোদিত)',
    authority_level: 'official_nctb_textbook',
    subject_id: 'ict',
    paper_id: 'ict_1',
    chapter_id: 'ict_1_ch3',
    concept_ids: ['ict_1_ch3_c_logic_gates_de_morgan'],
    page_number: 168,
    section_title: '৩.৭ হাফ অ্যাডার ও ফুল অ্যাডার লজিক সার্কিট',
    content_text: 'হাফ অ্যাডার সার্কিটে দুটি ইনপুট A ও B এর জন্য Sum = A XOR B এবং Carry = A.B। ফুল অ্যাডার সার্কিটে তিনটি ইনপুট A, B এবং Cin এর জন্য Sum S = A XOR B XOR Cin এবং Cout = AB + Cin(A XOR B)। দুটি হাফ অ্যাডার এবং একটি OR গেটের সংযোগে একটি পূর্ণাঙ্গ ফুল অ্যাডার তৈরি করা সম্ভব।',
    formula_latex: 'S = A \\oplus B \\oplus C_{in}, \\quad C_{out} = AB + C_{in}(A \\oplus B)'
  }
];
