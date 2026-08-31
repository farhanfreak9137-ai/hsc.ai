import { TextbookRecord, DocumentChunk } from '../types';

export const PRESEEDED_TEXTBOOKS: TextbookRecord[] = [
  // 1. Bangla 1st & 2nd Paper
  {
    id: 'tb_bangla_1',
    title: 'HSC Bangla Sahityapath & Sahapath (NCTB)',
    title_bn: 'উচ্চ মাধ্যমিক সাহিত্যপাঠ ও সহপাঠ (জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড)',
    subject_id: 'bangla',
    paper_id: 'bangla_1',
    author: 'এনসিটিবি বিশেষজ্ঞ প্যানেল',
    edition: '২০২৪-২০২৫ শিক্ষাবর্ষ (সর্বশেষ পরিমার্জিত)',
    total_pages: 312,
    is_official_nctb: true,
    cover_color: 'from-rose-600 to-pink-700',
    file_name: 'NCTB_HSC_Bangla_1st_Paper.pdf',
    file_size_mb: 18.4,
    uploaded_at: '2024-01-10T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: 'অপরিচিতা (গল্প) - রবীন্দ্রনাথ ঠাকুর',
        title_en: 'Oporichita - Rabindranath Tagore',
        start_page: 1,
        end_page: 18,
        key_topics: ['যৌতুক প্রথা বিরোধী চেতনা', 'কল্যাণীর আত্মমর্যাদাবোধ', 'অনুপমের আত্মজাগরণ', 'শম্ভুনাথ সেনের বলিষ্ঠ ব্যক্তিত্ব'],
        summary_text: 'যৌতুক প্রথার বিরুদ্ধে বলিষ্ঠ প্রতিবাদ এবং নারী ব্যক্তিত্বের স্বাধীন আত্মবিকাশের অনন্য আলেখ্য।',
        high_yield_formulas: ['জ্ঞানমূলক: অনুপমের বয়স কত? (২৭ বছর)', 'অনুধাবন: "মেয়ের বয়স যে বিষম ফাঁক" - ব্যাখ্যা', 'প্রয়োগ: আত্মমর্যাদার প্রতীক কল্যাণী']
      },
      {
        chapter_number: 2,
        title_bn: 'বিলাসী (গল্প) - শরৎচন্দ্র চট্টোপাধ্যায়',
        title_en: 'Bilashi - Sarat Chandra Chattopadhyay',
        start_page: 19,
        end_page: 36,
        key_topics: ['জাতিভেদের বিরুদ্ধে মানবতাবোধ', 'বিলাসীর আত্মত্যাগ ও প্রেম', 'মৃত্যুঞ্জয়ের সেবা ও পরিবর্তন', 'গ্রাম্য সমাজের সংকীর্ণতা'],
        summary_text: 'মানবিক ভালোবাসার কাছে সামাজিক কুসংস্কার ও জাতপাতের সংকীর্ণতার চরম পরাজয়।'
      },
      {
        chapter_number: 3,
        title_bn: 'রেইনকোট (গল্প) - আখতারুজ্জামান ইলিয়াস',
        title_en: 'Raincoat - Akhtaruzzaman Elias',
        start_page: 37,
        end_page: 52,
        key_topics: ['১৯৭১ সালের মুক্তিযুদ্ধ', 'নুরুল হুদার রূপান্তর', 'মুক্তিযোদ্ধা মিন্টুর রেইনকোটের প্রতীকী তাৎপর্য', 'পাকিস্তানি বাহিনীর বর্বরতা'],
        summary_text: 'মিন্টুর রেইনকোট সাধারণ ভীরু কলেজ শিক্ষক নুরুল হুদাকে এক সাহসী দেশপ্রেমিক মুক্তিযোদ্ধার আত্মবিশ্বাসে উজ্জীবিত করে।'
      },
      {
        chapter_number: 4,
        title_bn: 'বিদ্রোহী (কবিতা) - কাজী নজরুল ইসলাম',
        title_en: 'Bidrohi - Kazi Nazrul Islam',
        start_page: 53,
        end_page: 68,
        key_topics: ['ঔপনিবেশিক শাসনের বিরুদ্ধে বিদ্রোহ', 'ঐশ্বরিক শক্তি ও রুদ্র রূপ', 'অন্যায়ের বিরুদ্ধে চির-উন্নত শির', 'সাম্য ও মানবতার জয়গান'],
        summary_text: 'পরাধীনতার শৃঙ্খল ভাঙার অনন্ত প্রেরণা এবং মানবাত্মার অপরাজেয় স্বাধীনতার মহাকাব্যিক উচ্চারণ।'
      },
      {
        chapter_number: 5,
        title_bn: 'রক্তে ভেসে যায় (কবিতা) / লালসালু (উপন্যাস) - সৈয়দ ওয়ালীউল্লাহ',
        title_en: 'Lalsalu - Syed Waliullah',
        start_page: 120,
        end_page: 180,
        key_topics: ['মজিদের ভণ্ড ধর্মীয় রাজনীতি', 'মহব্বতনগর গ্রামের অন্ধবিশ্বাস', 'রহিমা ও জমিলার মনস্তত্ত্ব', 'ধর্মব্যবসায়ের স্বরূপ উন্মোচন'],
        summary_text: 'মাজার কেন্দ্রিক কুসংস্কার, অন্ধবিশ্বাস ও ধর্মীয় প্রতারণার মাধ্যমে নিরীহ গ্রামীণ মানুষকে শোষণের বাস্তব দলিল।'
      },
      {
        chapter_number: 6,
        title_bn: 'সিরাজউদ্দৌলা (নাটক) - সিকান্দার আবু জাফর',
        title_en: 'Sirajuddaula - Sikandar Abu Zafar',
        start_page: 181,
        end_page: 250,
        key_topics: ['পলাশীর যুদ্ধ ও নবাবের দেশপ্রেম', 'মীরজাফর, ঘসেটি বেগম ও জগৎশেঠের বিশ্বাসঘাতকতা', 'লর্ড ক্লাইভের কূটকৌশল', 'বাংলার স্বাধীনতার সূর্য অস্তমিত হওয়া'],
        summary_text: 'দেশপ্রেমিক তরুণ নবাব সিরাজউদ্দৌলার ট্র্যাজেডি এবং প্রাসাদ ষড়যন্ত্রের এক প্রামাণ্য ঐতিহাসিক নাট্যরূপ।'
      }
    ]
  },

  // 2. Bangla 2nd Paper (ব্যাকরণ ও নির্মিতি)
  {
    id: 'tb_bangla_2',
    title: 'HSC Bangla Byakaran O Nirmiti (NCTB / Dr. Hayat Mamud)',
    title_bn: 'উচ্চ মাধ্যমিক বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
    subject_id: 'bangla',
    paper_id: 'bangla_2',
    author: 'ড. হায়াৎ মামুদ ও অধ্যাপক ড. সফিউদ্দিন আহমদ',
    edition: '২০২৪ সংস্করণ',
    total_pages: 280,
    is_official_nctb: true,
    cover_color: 'from-amber-600 to-orange-700',
    file_name: 'NCTB_HSC_Bangla_2nd_Paper_Grammar.pdf',
    file_size_mb: 14.2,
    uploaded_at: '2024-01-12T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: 'বাংলা উচ্চারণের নিয়ম (অ-ধ্বনি ও এ-ধ্বনি)',
        title_en: 'Bangla Pronunciation Rules',
        start_page: 1,
        end_page: 24,
        key_topics: ['আদ্য অ-ধ্বনির সংবৃত ও বিবৃত উচ্চারণ', 'অন্ত্য অ-এর নিয়ম', 'য-ফলা ও ব-ফলা যুক্ত বর্ণের উচ্চারণ'],
        summary_text: 'প্রমিত বাংলা উচ্চারণের সুনির্দিষ্ট পাঁচটি নিয়ম ও উদাহরণ সংবলিত অধ্যায়।'
      },
      {
        chapter_number: 2,
        title_bn: 'বাংলা বানানের নিয়ম ও ণ-ত্ব / ষ-ত্ব বিধান',
        title_en: 'Bangla Spelling & Noto-Shato Bidhan',
        start_page: 25,
        end_page: 55,
        key_topics: ['বাংলা একাডেমি প্রমিত বাংলা বানানের নিয়ম', 'তৎসম শব্দে ণ-ত্ব বিধানের সূত্র', 'ষ-ত্ব বিধানের শর্তাবলি ও ব্যতিক্রম'],
        summary_text: 'শুদ্ধ বানান লেখার কলাকৌশল ও নিয়মাবলি।'
      },
      {
        chapter_number: 3,
        title_bn: 'বাংলা ব্যাকরণিক শব্দশ্রেণি (বিশেষ্য, বিশেষণ, ক্রিয়া, আবেগ)',
        title_en: 'Bangla Parts of Speech',
        start_page: 56,
        end_page: 88,
        key_topics: ['আট প্রকার ব্যাকরণিক শব্দশ্রেণির সংজ্ঞা ও শ্রেণিবিভাগ', 'অনুসর্গ ও যোজকের ব্যবহার', 'শব্দশ্রেণি রূপান্তর'],
        summary_text: 'ঐতিহ্যবাহী পদপ্রকরণের আধুনিক ব্যাকরণিক শব্দশ্রেণির সুবিন্যস্ত আলোচনা।'
      },
      {
        chapter_number: 4,
        title_bn: 'শব্দ গঠন: সমাস ও প্রত্যয়',
        title_en: 'Word Formation: Samas & Pratyay',
        start_page: 89,
        end_page: 135,
        key_topics: ['দ্বন্দ্ব, দ্বিগু, কর্মধারয়, তৎপুরুষ, বহুব্রীহি ও অব্যয়ীভাব সমাস', 'কৃতপ্রত্যয় ও তদ্ধিত প্রত্যয়ের সাধিত রূপ'],
        summary_text: 'ব্যাসবাক্যসহ সমাস নির্ণয় এবং প্রত্যয়যোগে শব্দ গঠনের কৌশল।'
      },
      {
        chapter_number: 5,
        title_bn: 'বাক্যতত্ত্ব ও বাক্য রূপান্তর',
        title_en: 'Syntax and Sentence Transformation',
        start_page: 136,
        end_page: 175,
        key_topics: ['একটি সার্থক বাক্যের ৩টি গুণ (আকাঙ্ক্ষা, আসত্তি, যোগ্যতা)', 'সরল, জটিল ও যৌগিক বাক্যের পারস্পরিক রূপান্তর', 'অস্থিবাচক ও নেতিবাচক বাক্য'],
        summary_text: 'বাক্যের গঠনরীতি এবং অর্থ অপরিবর্তিত রেখে বিভিন্ন বাক্য কাঠামোর রূপান্তর।'
      }
    ]
  },

  // 3. English 1st & 2nd Paper
  {
    id: 'tb_english_1',
    title: 'English for Today for Classes XI-XII (NCTB Official)',
    title_bn: 'ইংলিশ ফর টুডে (একাদশ-দ্বাদশ শ্রেণি - এনসিটিবি)',
    subject_id: 'english',
    paper_id: 'english_1',
    author: 'National Curriculum and Textbook Board (NCTB) Bangladesh',
    edition: '2024 Revised Edition',
    total_pages: 248,
    is_official_nctb: true,
    cover_color: 'from-indigo-600 to-blue-800',
    file_name: 'NCTB_English_For_Today_HSC.pdf',
    file_size_mb: 22.1,
    uploaded_at: '2024-01-14T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: 'Unit 1: People or Personalities Making History (Nelson Mandela & Bangabandhu)',
        title_en: 'Unit 1: Personalities Making History',
        start_page: 1,
        end_page: 25,
        key_topics: ['Nelson Mandela - Fighter for Apartheid', '7th March Historic Speech by Bangabandhu', 'Reading Comprehension MCQ & Short Questions', 'Flow Chart Formatting'],
        summary_text: 'Iconic leadership texts focusing on racial reconciliation, self-determination, and historical speech analysis.'
      },
      {
        chapter_number: 2,
        title_bn: 'Unit 2: Dreams and Aspirations (Poetry & Analysis)',
        title_en: 'Unit 2: Dreams',
        start_page: 26,
        end_page: 45,
        key_topics: ['Langston Hughes - "Hold fast to dreams"', 'D.H. Lawrence - "All people dream, but not equally"', 'Poem Summary & Theme Writing (10 Marks)'],
        summary_text: 'Analysis of metaphorical language in dream poetry and guiding thematic writing rubrics.'
      },
      {
        chapter_number: 3,
        title_bn: 'Unit 3: Traffic Education & Etiquette',
        title_en: 'Unit 3: Traffic Education & Lifestyle',
        start_page: 46,
        end_page: 70,
        key_topics: ['The Traffic Policeman monologue', 'Civic rights and responsibilities', 'Cloze test with and without clues', 'Rearranging sentences logically'],
        summary_text: 'Vocabulary enrichment, situational cloze tests, and paragraph writing guidelines.'
      },
      {
        chapter_number: 4,
        title_bn: 'Unit 4: Human Rights & Amerigo (Street Child)',
        title_en: 'Unit 4: Human Rights',
        start_page: 71,
        end_page: 95,
        key_topics: ['Amerigo, A Street Child story', 'Universal Declaration of Human Rights', 'Information Transfer & Short Answer Questions'],
        summary_text: 'Exposition of marginalized street children realities and global human rights standards.'
      }
    ]
  },

  // 4. English 2nd Paper (Grammar & Composition)
  {
    id: 'tb_english_2',
    title: 'Advanced Learner\'s Functional English Grammar for HSC',
    title_bn: 'অ্যাডভান্সড ফাংশনাল ইংলিশ গ্রামার ও কম্পোজিশন',
    subject_id: 'english',
    paper_id: 'english_2',
    author: 'Chowdhury & Hossain / NCTB Grammar Guidelines',
    edition: '2024 Updated Syllabus',
    total_pages: 360,
    is_official_nctb: true,
    cover_color: 'from-blue-700 to-indigo-900',
    file_name: 'HSC_English_2nd_Paper_Grammar_Master.pdf',
    file_size_mb: 26.5,
    uploaded_at: '2024-01-15T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: 'Prepositions and Special Idiomatic Uses',
        title_en: 'Prepositions & Special Phrases',
        start_page: 1,
        end_page: 35,
        key_topics: ['Appropriate Prepositions table', 'Special phrases (was born, have to, would rather, had better, let alone, as soon as, what does look like)'],
        summary_text: 'Complete rule sets and board question practices for prepositions and fill in the blanks with special words.'
      },
      {
        chapter_number: 2,
        title_bn: 'Completing Sentences with Conditionals & Phrases',
        title_en: 'Completing Sentences Rules',
        start_page: 36,
        end_page: 75,
        key_topics: ['Zero, First, Second, Third Conditionals', 'Lest, As if/As though, It is high time, No sooner had... than, So that'],
        summary_text: 'Grammar rules and sentence completion patterns tested in Board Question 3.'
      },
      {
        chapter_number: 3,
        title_bn: 'Right Form of Verbs & Subject-Verb Agreement',
        title_en: 'Right Form of Verbs',
        start_page: 76,
        end_page: 120,
        key_topics: ['Causative verbs (make, get, have, let)', 'Passive constructions', 'Modal auxiliaries with perfect infinitive', 'Gerund vs Participle'],
        summary_text: 'Core rules governing verb conjugations and subject-verb proximity traps.'
      },
      {
        chapter_number: 4,
        title_bn: 'Modifiers (Pre-modifiers & Post-modifiers)',
        title_en: 'Modifiers in English Grammar',
        start_page: 121,
        end_page: 160,
        key_topics: ['Noun adjuncts, Participles, Infinitives, Appositives, Intensifiers, Adverbs as pre/post modifiers'],
        summary_text: 'Systematic approach to identifying and applying grammatical modifiers accurately in HSC context.'
      },
      {
        chapter_number: 5,
        title_bn: 'Sentence Connectors and Cohesion',
        title_en: 'Sentence Connectors',
        start_page: 161,
        end_page: 195,
        key_topics: ['Concession (However, Nonetheless)', 'Cause & Effect (Therefore, Consequently)', 'Sequence (Furthermore, Moreover, On the contrary)'],
        summary_text: 'Logical sentence linking devices for seamless paragraph flow and board exam drills.'
      },
      {
        chapter_number: 6,
        title_bn: 'Synonyms & Antonyms and Punctuation',
        title_en: 'Synonyms, Antonyms & Punctuation',
        start_page: 196,
        end_page: 240,
        key_topics: ['Contextual vocabulary transformation', 'Direct speech punctuation & capitalization rules'],
        summary_text: 'High-frequency Board exam vocabulary bank and correct punctuation mechanics.'
      }
    ]
  },

  // 5. ICT (তথ্য ও যোগাযোগ প্রযুক্তি)
  {
    id: 'tb_ict_1',
    title: 'Information and Communication Technology (NCTB Official)',
    title_bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (একাদশ ও দ্বাদশ শ্রেণি - এনসিটিবি অনুমোদিত)',
    subject_id: 'ict',
    paper_id: 'ict_1',
    author: 'প্রকৌশলী মুজিবুর রহমান ও এনসিটিবি বিশেষজ্ঞ প্যানেল',
    edition: '২০২৪-২০২৫ শিক্ষাবর্ষ (পরিমার্জিত সংস্করণ)',
    total_pages: 340,
    is_official_nctb: true,
    cover_color: 'from-teal-600 to-emerald-800',
    file_name: 'NCTB_HSC_ICT_Textbook.pdf',
    file_size_mb: 28.0,
    uploaded_at: '2024-01-16T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: '১ম অধ্যায়: তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        title_en: 'Chapter 1: Global and Bangladesh Perspective',
        start_page: 1,
        end_page: 50,
        key_topics: ['ভার্চুয়াল রিয়েলিটি (VR)', 'আর্টিফিশিয়াল ইন্টেলিজেন্স ও রোবোটিক্স', 'ক্রায়োসার্জারি', 'বায়োমেট্রিক্স ও বায়োইনফরমেটিক্স', 'জেনেটিক ইঞ্জিনিয়ারিং ও ন্যানোটেকনোলজি'],
        summary_text: 'আধুনিক প্রযুক্তির মৌলিক ধারণা, চিকিৎসায় ক্রায়োসার্জারি, নিরাপত্তায় বায়োমেট্রিক্স এবং ন্যানোপ্রযুক্তির বাস্তব প্রয়োগ।'
      },
      {
        chapter_number: 2,
        title_bn: '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        title_en: 'Chapter 2: Communication Systems & Networking',
        start_page: 51,
        end_page: 110,
        key_topics: ['ডেটা ট্রান্সমিশন মোড (Simplex, Half/Full Duplex)', 'তারবিহীন মাধ্যম (Bluetooth, Wi-Fi, WiMAX)', 'মোবাইল যোগাযোগ প্রজন্ম (1G থেকে 5G)', 'নেটওয়ার্ক টপোলজি (Star, Mesh, Ring, Bus, Tree, Hybrid)', 'ক্লাউড কম্পিউটিং'],
        summary_text: 'ডেটা আদান-প্রদানের মাধ্যম, রাউটার ও সুইচের ভূমিকা, নেটওয়ার্ক টপোলজি গঠন এবং ক্লাউড স্টোরেজের সুবিধা।'
      },
      {
        chapter_number: 3,
        title_bn: '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস (অত্যন্ত গুরুত্বপূর্ণ)',
        title_en: 'Chapter 3: Number Systems & Digital Logic Devices',
        start_page: 111,
        end_page: 190,
        key_topics: ['বাইনারি, অক্টাল, ডেসিমেল ও হেক্সাডেসিমেল রূপান্তর', '২-এর পরিপূরক (2\'s Complement) যোগ ও বিয়োগ', 'বুলিয়ান অ্যালজেব্রা ও ডিমরগ্যানের উপপাদ্য', 'মৌলিক ও সর্বজনীন গেট (NAND, NOR)', 'এনকোডার, ডিকোডার, হাফ অ্যাডার ও ফুল অ্যাডার লজিক সার্কিট'],
        summary_text: 'বোর্ড পরীক্ষায় বাধ্যতামূলক ২ সেট সৃজনশীল প্রশ্ন আসে এই অধ্যায় থেকে। সংখ্যা পদ্ধতির রূপান্তর, ঋণাত্মক সংখ্যার ২-এর পরিপূরক এবং লজিক গেট সরলীকরণ।',
        high_yield_formulas: ['2\'s Complement = 1\'s Complement + 1', '(A + B)\' = A\' . B\' (De Morgan)', 'Full Adder Sum S = A XOR B XOR Cin, Cout = AB + Cin(A XOR B)']
      },
      {
        chapter_number: 4,
        title_bn: '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি এবং HTML',
        title_en: 'Chapter 4: Web Design & HTML',
        start_page: 191,
        end_page: 240,
        key_topics: ['ওয়েবসাইট কাঠামো (Tree, Webbed, Linear, Hybrid)', 'HTML ট্যাগ, অ্যাট্রিবিউট ও সিনট্যাক্স', 'টেবিল তৈরি (table, tr, th, td, rowspan, colspan)', 'হাইপারলিংক ও ছবি যুক্তকরণ (a href, img src)'],
        summary_text: 'ওয়েব পেজ তৈরির এইচটিএমএল কোডিং, টেবিল ডিজাইন এবং ইমেজ/লিংক যুক্ত করার সম্পূর্ণ প্রাকটিক্যাল গাইড।'
      },
      {
        chapter_number: 5,
        title_bn: '৫ম অধ্যায়: প্রোগ্রামিং ভাষা (সি প্রোগ্রামিং - C Language)',
        title_en: 'Chapter 5: Programming in C Language',
        start_page: 241,
        end_page: 300,
        key_topics: ['অ্যালগরিদম ও ফ্লোচার্ট প্রতীকসমূহ', 'সি চলক, ডেটা টাইপ ও ইনপুট/আউটপুট (scanf, printf)', 'কন্ডিশনাল স্টেটমেন্ট (if-else, switch)', 'লুপ কন্ট্রোল (for, while, do-while)', '১D অ্যারে এবং ইউজার ডিফাইন্ড ফাংশন'],
        summary_text: 'লজিক্যাল প্রোগ্রামিং, লিপ ইয়ার নির্ণয়, মৌলিক সংখ্যা যাচাই, ফিবোনাচ্চি সিরিজ, এবং ধারার যোগফল নির্ণয়ের সি কোড।'
      },
      {
        chapter_number: 6,
        title_bn: '৬ষ্ঠ অধ্যায়: ডাটাবেজ ম্যানেজমেন্ট সিস্টেম (DBMS)',
        title_en: 'Chapter 6: Database Management System & SQL',
        start_page: 301,
        end_page: 340,
        key_topics: ['প্রাইমারি কি, কম্পোজিট কি ও ফরেন কি', 'রিলেশনশিপ প্রকারভেদ (1:1, 1:N, N:M)', 'SQL কুয়েরি (SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY)', 'ডাটা সিকিউরিটি ও এনক্রিপশন'],
        summary_text: 'রিলেশনাল ডাটাবেজ টেবিল রিলেশনশিপ এবং এসকিউএল কুয়েরির মাধ্যমে তথ্য অনুসন্ধানের নিয়মাবলি।'
      }
    ]
  },

  // 6. Physics 1st & 2nd Paper (ড. শাহজাহান তপন)
  {
    id: 'tb_phy_1',
    title: 'HSC Physics 1st Paper (Dr. Shahjahan Tapan)',
    title_bn: 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ১ম পত্র (ড. শাহজাহান তপন)',
    subject_id: 'phy',
    paper_id: 'phy_1',
    author: 'ড. শাহজাহান তপন, মুহম্মদ আজিজ হাসান ও ড. রানা চৌধুরী',
    edition: '২০২৪ সংস্করণ',
    total_pages: 420,
    is_official_nctb: true,
    cover_color: 'from-emerald-600 to-teal-800',
    file_name: 'HSC_Physics_1st_Paper_Tapan.pdf',
    file_size_mb: 32.4,
    uploaded_at: '2024-01-05T00:00:00Z',
    chapters: [
      {
        chapter_number: 2,
        title_bn: '২য় অধ্যায়: ভেক্টর',
        title_en: 'Chapter 2: Vectors',
        start_page: 35,
        end_page: 90,
        key_topics: ['ডট ও ক্রস গুণন', 'নৌকা ও নদীর স্রোত পারাপার', 'বৃষ্টি ও ছাতা ধরা', 'ভেক্টর ক্যালকুলাস (গ্রেডিয়েন্ট, ডাইভারজেন্স, কার্ল)'],
        summary_text: 'ভেক্টরের সামান্তরিক সূত্র, ডট ও ক্রস গুণনের সাহায্যে কোণ ও লম্ব/সমান্তরাল যাচাই, এবং বৃষ্টির আপেক্ষিক বেগ।'
      },
      {
        chapter_number: 4,
        title_bn: '৪র্থ অধ্যায়: নিউটনীয় বলবিদ্যা',
        title_en: 'Chapter 4: Newtonian Mechanics',
        start_page: 130,
        end_page: 185,
        key_topics: ['রৈখিক ও কৌণিক ভরবেগের সংরক্ষণ', 'টর্ক ও জড়তার ভ্রামক', 'রাস্তার ব্যাংকিং ও কেন্দ্রমুখী বল', 'ঘূর্ণন গতিশক্তি'],
        summary_text: 'নিউটনের গতিসূত্র, ঘর্ষণহীন ও ঘর্ষণযুক্ত রাস্তায় গাড়ির নিরাপদ ব্যাংকিং কোণ নির্ণয়, এবং জড়তার ভ্রামক।'
      },
      {
        chapter_number: 5,
        title_bn: '৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা',
        title_en: 'Chapter 5: Work, Energy & Power',
        start_page: 186,
        end_page: 235,
        key_topics: ['পরিবর্তনশীল বল দ্বারা কাজ', 'স্প্রিং শক্তি ও যান্ত্রিক শক্তির নিত্যতা', 'কুয়া বা চৌবাচ্চা খালি করায় কৃতকাজ ও পাম্পের কর্মদক্ষতা'],
        summary_text: 'ভারকেন্দ্রের সরণের মাধ্যমে কুয়া খালি করার কাজের হিসাব এবং পাম্পের ক্ষমতা ও অপচয়কৃত শক্তি।'
      }
    ]
  },

  // 7. Chemistry 1st & 2nd Paper (হাজারী ও নাগ)
  {
    id: 'tb_chem_1',
    title: 'HSC Chemistry 1st Paper (Hazari & Nag)',
    title_bn: 'উচ্চ মাধ্যমিক রসায়ন ১ম পত্র (ড. সরোজ কান্তি সিংহ হাজারী ও হারাধন নাগ)',
    subject_id: 'chem',
    paper_id: 'chem_1',
    author: 'ড. সরোজ কান্তি সিংহ হাজারী ও হারাধন নাগ',
    edition: '২০২৪ পরিমার্জিত সংস্করণ',
    total_pages: 450,
    is_official_nctb: true,
    cover_color: 'from-sky-600 to-blue-800',
    file_name: 'HSC_Chemistry_1st_Paper_Hazari_Nag.pdf',
    file_size_mb: 35.0,
    uploaded_at: '2024-01-08T00:00:00Z',
    chapters: [
      {
        chapter_number: 2,
        title_bn: '২য় অধ্যায়: গুণগত রসায়ন',
        title_en: 'Chapter 2: Qualitative Chemistry',
        start_page: 45,
        end_page: 120,
        key_topics: ['বোর পরমাণু মডেল ও কোয়ান্টাম সংখ্যা', 'আউফবাউ ও হুন্ডের নীতি', 'দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp vs Kip অধঃক্ষেপণ)', 'শিখা পরীক্ষা ও ক্যাটায়ন শনাক্তকরণ'],
        summary_text: 'চারটি কোয়ান্টাম সংখ্যার সাহায্যে অরবিটালের ইলেকট্রন ধারণ ক্ষমতা ও দ্রাব্যতার গাণিতিক সমস্যা।'
      },
      {
        chapter_number: 4,
        title_bn: '৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন',
        title_en: 'Chapter 4: Chemical Changes',
        start_page: 210,
        end_page: 290,
        key_topics: ['লা-শাতেলিয়ার নীতি', 'Kp ও Kc রাশিমালা ও তাপমাত্রা প্রভাব', 'অম্ল-ক্ষারীয় বাফার দ্রবণ ও হেন্ডারসন সমীকরণ', 'pH ও pOH গণনা'],
        summary_text: 'উভমুখী বিক্রিয়ার সাম্যাবস্থা এবং বাফার দ্রবণের ক্রিয়া-কৌশল।'
      }
    ]
  },

  // 8. Higher Mathematics 1st & 2nd Paper (অক্ষরপত্র / এস ইউ আহাম্মেদ)
  {
    id: 'tb_hmath_1',
    title: 'HSC Higher Mathematics 1st Paper (SU Ahmed & Akkharpatra)',
    title_bn: 'উচ্চতর গণিত ১ম পত্র (এস ইউ আহাম্মেদ ও এম এ জব্বার)',
    subject_id: 'hmath',
    paper_id: 'hmath_1',
    author: 'এস ইউ আহাম্মেদ ও অক্ষরপত্র প্রকাশনী বিশেষজ্ঞ প্যানেল',
    edition: '২০২৪ সংস্করণ',
    total_pages: 480,
    is_official_nctb: true,
    cover_color: 'from-amber-600 to-yellow-800',
    file_name: 'HSC_Higher_Math_1st_Paper.pdf',
    file_size_mb: 38.2,
    uploaded_at: '2024-01-09T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: '১ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক',
        title_en: 'Chapter 1: Matrices & Determinants',
        start_page: 1,
        end_page: 55,
        key_topics: ['ম্যাট্রিক্সের গুণন ও ইনভার্স ম্যাট্রিক্স', 'ক্রেমারের নিয়মে সমীকরণ সমাধান', 'নির্ণায়কের অনুরাশি ও সহগুণক'],
        summary_text: 'ইনভার্স ম্যাট্রিক্স $A^{-1} = \\frac{1}{|A|}\\text{adj}(A)$ এবং ক্রেমারের নিয়মে ৩ চলকের সমীকরণ সমাধান।'
      },
      {
        chapter_number: 9,
        title_bn: '৯ম অধ্যায়: অন্তরীকরণ (Differentiation)',
        title_en: 'Chapter 9: Differentiation',
        start_page: 260,
        end_page: 340,
        key_topics: ['মূল নিয়মে অন্তরজ নির্ণয়', 'পর্যায়ক্রমিক অন্তরীকরণ ($y_n$)', 'ফাংশনের গুরুমান ও লঘুমান নির্ণয়', 'স্পর্শক ও অভিলম্বের সমীকরণ'],
        summary_text: 'ক্যালকুলাসের মূল ধারণা, লিভনিজ উপপাদ্য এবং চরম মান (Maximum/Minimum) নির্ণয়।'
      },
      {
        chapter_number: 10,
        title_bn: '১০ম অধ্যায়: যোগজীকরণ (Integration)',
        title_en: 'Chapter 10: Integration',
        start_page: 341,
        end_page: 420,
        key_topics: ['আংশিক ভগ্নাংশ ও প্রতিস্থাপন পদ্ধতি', 'অংশায়ন সূত্র $\\int u v \\, dx$', 'নির্দিষ্ট যোগজের সাহায্যে আবদ্ধ ক্ষেত্রের ক্ষেত্রফল'],
        summary_text: 'নির্দিষ্ট যোগজ ও বক্ররেখা দ্বারা সীমাবদ্ধ এলাকার ক্ষেত্রফল পরিমাপ।'
      }
    ]
  },

  // 9. Biology 1st & 2nd Paper (ড. আবুল হাসান / গাজী আজমল)
  {
    id: 'tb_bio_1',
    title: 'HSC Biology 1st & 2nd Paper (Dr. Abul Hasan & Gazi Ajmal)',
    title_bn: 'উচ্চ মাধ্যমিক জীববিজ্ঞান (উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান)',
    subject_id: 'bio',
    paper_id: 'bio_1',
    author: 'ড. আবুল হাসান, প্রফেসর গাজী আজমল ও গাজী আসমত',
    edition: '২০২৪ সংস্করণ',
    total_pages: 510,
    is_official_nctb: true,
    cover_color: 'from-rose-600 to-red-800',
    file_name: 'HSC_Biology_Master_Textbook.pdf',
    file_size_mb: 42.0,
    uploaded_at: '2024-01-09T00:00:00Z',
    chapters: [
      {
        chapter_number: 1,
        title_bn: '১ম অধ্যায়: কোষ ও এর গঠন (উদ্ভিদবিজ্ঞান)',
        title_en: 'Chapter 1: Cell & Its Structure',
        start_page: 1,
        end_page: 60,
        key_topics: ['প্লাজমামেমব্রেনের ফ্লুইড মোজাইক মডেল', 'ডিএনএ-এর দ্বি-সূত্রক মডেল ও রেপ্লিকেশন', 'ট্রান্সক্রিপশন ও ট্রান্সলেশন (প্রোটিন সংশ্লেষণ)'],
        summary_text: 'কোষ অঙ্গাণুর কার্যপ্রণালি এবং সেন্ট্রাল ডগমা (DNA -> RNA -> Protein)।'
      },
      {
        chapter_number: 4,
        title_bn: '৪র্থ অধ্যায়: মানব শারীরতত্ত্ব: রক্ত ও সংবহন (প্রাণিবিজ্ঞান)',
        title_en: 'Chapter 4: Blood and Circulation',
        start_page: 180,
        end_page: 240,
        key_topics: ['হৃদপিণ্ডের গঠন ও কার্ডিয়াক চক্র', 'মায়োজেনিক নিয়ন্ত্রণ (SA Node, AV Node, Purkinje Fiber)', 'রক্ত তঞ্চন প্রক্রিয়া', 'করোনারি হার্ট ডিজিজ ও এনজিওপ্লাস্টি'],
        summary_text: 'মানুষের সংবহনতন্ত্র, পেসমেকারের ভূমিকা এবং ওপেন হার্ট সার্জারির চিকিৎসাগত দিক।'
      }
    ]
  }
];
