# HSC Raw Question Images Directory (কাঁচা প্রশ্নপত্রের ছবি সংরক্ষণের ফোল্ডার)

Drop your JPG / PNG question images into their respective subject folders below:

```text
raw_questions_bank/
├── physics_1st_paper/        # পদার্থবিজ্ঞান ১ম পত্র (ভেক্টর, গতিবিদ্যা, বলবিদ্যা ইত্যাদি)
├── physics_2nd_paper/        # পদার্থবিজ্ঞান ২য় পত্র (তাপগতিবিদ্যা, স্থির তড়িৎ, চলতড়িৎ ইত্যাদি)
├── chemistry_1st_paper/      # রসায়ন ১ম পত্র (গুণগত রসায়ন, রাসায়নিক পরিবর্তন ইত্যাদি)
├── chemistry_2nd_paper/      # রসায়ন ২য় পত্র (জৈব রসায়ন, পরিমাণগত রসায়ন, তড়িৎ রসায়ন)
├── higher_math_1st_paper/    # উচ্চতর গণিত ১ম পত্র (ম্যাট্রিক্স, সরলরেখা, অন্তরীকরণ, যোগজীকরণ)
├── higher_math_2nd_paper/    # উচ্চতর গণিত ২য় পত্র (কণিক, জটিল সংখ্যা, বহুপদী)
├── biology_1st_paper/        # জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান - কোষ, শারীরতত্ত্ব)
├── biology_2nd_paper/        # জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান - পরিপাক, রক্ত, জিনতত্ত্ব)
├── bangla_1st_paper/         # বাংলা ১ম পত্র (অপরিচিতা, বিলাসী, বিদ্রোহী, লালসালু, সিরাজউদ্দৌলা)
├── bangla_2nd_paper/         # বাংলা ২য় পত্র (উচ্চারণ, বানান, সমাস, বাক্য রূপান্তর)
├── english_1st_paper/        # English 1st Paper (Comprehension, Theme writing)
├── english_2nd_paper/        # English 2nd Paper (Grammar, Right form of verbs, Modifiers)
├── ict/                      # তথ্য ও যোগাযোগ প্রযুক্তি (সংখ্যা পদ্ধতি, লজিক গেট, HTML, C প্রোগ্রামিং)
└── unclassified/             # যেকোনো মিশ্র বা অনির্ধারিত প্রশ্নপত্র
```

---

### How to Process & Digitize:
1. Copy/Paste your question images into any of the folders above.
2. Run the batch digitization command in terminal:
   ```bash
   npm run ingest:jpgs
   ```
3. All questions will be automatically converted with full Bengali text, $\LaTeX$ equations, and (ক, খ, গ, ঘ) subparts into `src/data/importedQuestions.json` and loaded into the app permanently for offline generation.
