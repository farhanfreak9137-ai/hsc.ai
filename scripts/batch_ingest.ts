import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: { 'User-Agent': 'hsc-ai-batch-ingest' },
  },
});

const RAW_DIR = path.join(process.cwd(), 'raw_questions_bank');
const SOLUTIONS_DIR = path.join(process.cwd(), 'raw_solutions_bank');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'importedQuestions.json');

const FOLDER_TO_SUBJECT_MAP: Record<string, { subjectId: string; paperId: string; nameBn: string }> = {
  physics_1st_paper: { subjectId: 'phy', paperId: 'phy_1', nameBn: 'পদার্থবিজ্ঞান ১ম পত্র' },
  physics_2nd_paper: { subjectId: 'phy', paperId: 'phy_2', nameBn: 'পদার্থবিজ্ঞান ২য় পত্র' },
  chemistry_1st_paper: { subjectId: 'chem', paperId: 'chem_1', nameBn: 'রসায়ন ১ম পত্র' },
  chemistry_2nd_paper: { subjectId: 'chem', paperId: 'chem_2', nameBn: 'রসায়ন ২য় পত্র' },
  higher_math_1st_paper: { subjectId: 'hmath', paperId: 'hmath_1', nameBn: 'উচ্চতর গণিত ১ম পত্র' },
  higher_math_2nd_paper: { subjectId: 'hmath', paperId: 'hmath_2', nameBn: 'উচ্চতর গণিত ২য় পত্র' },
  biology_1st_paper: { subjectId: 'bio', paperId: 'bio_1', nameBn: 'জীববিজ্ঞান ১ম পত্র' },
  biology_2nd_paper: { subjectId: 'bio', paperId: 'bio_2', nameBn: 'জীববিজ্ঞান ২য় পত্র' },
  bangla_1st_paper: { subjectId: 'bangla', paperId: 'bangla_1', nameBn: 'বাংলা ১ম পত্র' },
  bangla_2nd_paper: { subjectId: 'bangla', paperId: 'bangla_2', nameBn: 'বাংলা ২য় পত্র' },
  english_1st_paper: { subjectId: 'english', paperId: 'english_1', nameBn: 'English 1st Paper' },
  english_2nd_paper: { subjectId: 'english', paperId: 'english_2', nameBn: 'English 2nd Paper' },
  ict: { subjectId: 'ict', paperId: 'ict_1', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
  unclassified: { subjectId: 'phy', paperId: 'phy_1', nameBn: 'সাধারণ' },
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function findMatchingSolutionFile(subdir: string, questionFileName: string, qIndex: number): string | null {
  const baseName = path.parse(questionFileName).name;
  const solSubdir = path.join(SOLUTIONS_DIR, subdir);
  if (!fs.existsSync(solSubdir)) return null;

  // 1. Exact Name match
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of extensions) {
    const candidate = path.join(solSubdir, `${baseName}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }

  // 2. Sequential Index Match (if same count or index within bounds)
  const solFiles = fs.readdirSync(solSubdir).filter((f) => !f.startsWith('.')).sort();
  if (qIndex < solFiles.length) {
    return path.join(solSubdir, solFiles[qIndex]);
  }

  return null;
}

async function extractWithRetry(
  questionFilePath: string,
  solutionFilePath: string | null,
  subjectHint: string,
  paperHint: string,
  maxRetries = 5
): Promise<any> {
  const qBuffer = fs.readFileSync(questionFilePath);
  const qBase64 = qBuffer.toString('base64');
  const qMime = getMimeType(questionFilePath);

  const parts: any[] = [
    {
      inlineData: {
        data: qBase64,
        mimeType: qMime,
      },
    },
  ];

  if (solutionFilePath && fs.existsSync(solutionFilePath)) {
    const solBuffer = fs.readFileSync(solutionFilePath);
    const solBase64 = solBuffer.toString('base64');
    const solMime = getMimeType(solutionFilePath);
    parts.push({
      inlineData: {
        data: solBase64,
        mimeType: solMime,
      },
    });
  }

  const promptText = solutionFilePath
    ? `Image 1 is the QUESTION. Image 2 is the OFFICIAL TEACHER / TEXTBOOK SOLUTION.
Extract the question from Image 1, and extract the EXACT official solution, mathematical derivation, and explanation verbatim from Image 2 in standard Bengali & LaTeX.
Subject hint: ${subjectHint || 'Auto'}, Paper hint: ${paperHint || 'Auto'}. Return structured JSON.`
    : `Image 1 is an HSC exam question image. 
1. Extract the full question accurately with LaTeX equations.
2. Generate the PERFECT, board-examiner-standard step-by-step solution based on official NCTB textbooks (Dr. Shahjahan Tapan for Physics, Hazari & Nag for Chemistry, Akkharpatra for Math, Sahityapath for Bangla, NCTB ICT):
   - (a) [1 mark]: Exact canonical textbook definition.
   - (b) [2 marks]: Clear conceptual explanation with scientific reasoning.
   - (c) [3 marks]: Formula, given variables with units, full calculation steps, and boxed final answer with SI units.
   - (d) [4 marks]: Complete comparative mathematical analysis and concluding statement.
   - For MCQs: Correct option letter + clear explanation.
Subject hint: ${subjectHint || 'Auto'}, Paper hint: ${paperHint || 'Auto'}. Return structured JSON.`;

  parts.push({ text: promptText });

  const systemInstruction = `You are an expert Senior HSC Board Examiner and Head of Department in Bangladesh.
You digitize HSC Board Examination questions and craft flawless, 100% textbook-accurate model solutions in Bengali & LaTeX:
1. Preserve all scientific terms, Bengali literary quotes, and diagram descriptions.
2. Convert all mathematical and physics formulas and units to standard LaTeX notation ($...$ or $$...$$).
3. If Creative Question (CQ): extract stem (উদ্দীপক), and provide master teacher solutions for part (a) [1 mark], part (b) [2 marks], part (c) [3 marks], part (d) [4 marks] with full steps in LaTeX.
4. If Multiple Choice (MCQ): extract stem, 4 options (A, B, C, D), correct option, and comprehensive explanation.
5. Accurately identify Subject, Paper, Chapter name/ID, Education Board, and Exam Year.`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question_format: { type: Type.STRING, description: "'CQ' or 'MCQ'" },
              subject_id: { type: Type.STRING, description: "'phy', 'chem', 'hmath', 'bio', 'bangla', 'english', 'ict'" },
              paper_id: { type: Type.STRING, description: "'phy_1', 'phy_2', 'chem_1', 'chem_2', etc." },
              chapter_name: { type: Type.STRING },
              chapter_id: { type: Type.STRING },
              board: { type: Type.STRING },
              exam_year: { type: Type.NUMBER },
              stem_text: { type: Type.STRING },
              subparts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    part_label: { type: Type.STRING },
                    cognitive_level: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                    prompt_text: { type: Type.STRING },
                    solution_latex: { type: Type.STRING },
                  },
                  required: ['part_label', 'marks', 'prompt_text', 'solution_latex'],
                },
              },
              mcq_options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['key', 'text'],
                },
              },
              correct_option: { type: Type.STRING },
              full_solution_latex: { type: Type.STRING },
            },
            required: ['question_format', 'subject_id', 'stem_text', 'full_solution_latex'],
          },
        },
      });

      const text = response?.text;
      if (!text) throw new Error('Empty response from model');
      return JSON.parse(text);
    } catch (err: any) {
      const isRateLimit = err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && attempt < maxRetries) {
        const waitSec = attempt * 20;
        console.warn(`    ⚠️ Rate limit encountered. Waiting ${waitSec}s before retry (Attempt ${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
      } else if (attempt === maxRetries) {
        throw err;
      } else {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }
}

async function runBatchIngestion() {
  console.log('===============================================================');
  console.log('   🚀 HSC QUESTION BANK BULK DIGITIZATION & SOLVER PIPELINE    ');
  console.log('===============================================================\n');

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Directory ${RAW_DIR} does not exist.`);
    return;
  }

  // Parse optional CLI argument: --subject=physics_1st_paper or --limit=10
  const args = process.argv.slice(2);
  let targetSubject: string | null = null;
  let maxLimit: number | null = null;

  for (const arg of args) {
    if (arg.startsWith('--subject=')) {
      targetSubject = arg.split('=')[1];
    }
    if (arg.startsWith('--limit=')) {
      maxLimit = parseInt(arg.split('=')[1]);
    }
  }

  // Load existing imported questions
  let existingQuestions: any[] = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingQuestions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    } catch {
      existingQuestions = [];
    }
  }

  const existingIds = new Set(existingQuestions.map((q) => q.id));
  const subdirs = fs.readdirSync(RAW_DIR).filter((d) => {
    if (targetSubject) return d === targetSubject;
    return fs.statSync(path.join(RAW_DIR, d)).isDirectory();
  });

  // Calculate total files to process
  let allFilesToProcess: { subdir: string; file: string; fileId: string; index: number }[] = [];
  for (const subdir of subdirs) {
    const subdirPath = path.join(RAW_DIR, subdir);
    if (!fs.statSync(subdirPath).isDirectory()) continue;
    const files = fs.readdirSync(subdirPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    }).sort();

    files.forEach((file, index) => {
      const fileId = `img_${path.parse(file).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      if (!existingIds.has(fileId)) {
        allFilesToProcess.push({ subdir, file, fileId, index });
      }
    });
  }

  if (maxLimit && allFilesToProcess.length > maxLimit) {
    allFilesToProcess = allFilesToProcess.slice(0, maxLimit);
  }

  console.log(`📊 Found ${allFilesToProcess.length} new question images to digitize (Already completed: ${existingIds.size})\n`);

  if (allFilesToProcess.length === 0) {
    console.log('✅ All images have already been digitized! Your question bank is up-to-date.');
    console.log(`💾 Total stored questions: ${existingQuestions.length} in ${OUTPUT_FILE}`);
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < allFilesToProcess.length; i++) {
    const { subdir, file, fileId, index } = allFilesToProcess[i];
    const mapping = FOLDER_TO_SUBJECT_MAP[subdir] || { subjectId: 'phy', paperId: 'phy_1', nameBn: subdir };
    const filePath = path.join(RAW_DIR, subdir, file);
    const solutionFilePath = findMatchingSolutionFile(subdir, file, index);

    const progressPct = (((i + 1) / allFilesToProcess.length) * 100).toFixed(1);
    const timeElapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);

    console.log(`[${i + 1}/${allFilesToProcess.length}] (${progressPct}%) [${timeElapsedSec}s] 📁 ${mapping.nameBn} -> ${file}`);
    if (solutionFilePath) {
      console.log(`    🔗 Paired with Official Solution Image: ${path.basename(solutionFilePath)}`);
    } else {
      console.log(`    🧠 AI Solver Mode: Generating Senior Examiner Solution...`);
    }

    try {
      const extracted = await extractWithRetry(filePath, solutionFilePath, mapping.subjectId, mapping.paperId);
      const standardizedQuestion = {
        id: fileId,
        scope: 'global_official',
        subject_id: extracted.subject_id || mapping.subjectId,
        paper_id: extracted.paper_id || mapping.paperId,
        chapter_id: extracted.chapter_id || `${mapping.paperId}_ch1`,
        chapter_name: extracted.chapter_name || 'General',
        board: extracted.board || 'Dhaka',
        exam_year: extracted.exam_year || 2023,
        origin_type: 'board',
        question_format: extracted.question_format || 'CQ',
        difficulty_tier: 'medium',
        stem_text: extracted.stem_text,
        subparts: extracted.subparts || [],
        mcq_options: extracted.mcq_options || [],
        correct_option: extracted.correct_option || 'A',
        full_solution_latex: extracted.full_solution_latex || '',
        source_image: file,
        has_official_solution: !!solutionFilePath,
        is_verified: true,
        created_at: new Date().toISOString(),
      };

      existingQuestions.push(standardizedQuestion);
      existingIds.add(fileId);
      successCount++;

      console.log(`    ✅ Extracted ${standardizedQuestion.question_format}: ${standardizedQuestion.chapter_name} (${standardizedQuestion.board} ${standardizedQuestion.exam_year})`);

      // Save progress to disk immediately
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingQuestions, null, 2), 'utf-8');

      // Controlled pause between requests to preserve API quota
      await new Promise((r) => setTimeout(r, 2500));
    } catch (err: any) {
      errorCount++;
      console.error(`    ❌ Failed to process ${file}:`, err?.message || err);
    }
  }

  const totalTimeMin = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log('\n===============================================================');
  console.log(`🎉 Batch Digitization Finished in ${totalTimeMin} minutes!`);
  console.log(`   • Successfully Digitized: ${successCount}`);
  console.log(`   • Errors: ${errorCount}`);
  console.log(`   • Total Questions in Offline Database: ${existingQuestions.length}`);
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  console.log('===============================================================');
}

runBatchIngestion().catch((err) => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
