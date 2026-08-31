import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: { 'User-Agent': 'hsc-ai-batch-ingest' },
  },
});

const RAW_DIR = path.join(process.cwd(), 'raw_questions_bank');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'importedQuestions.json');

const FOLDER_TO_SUBJECT_MAP: Record<string, { subjectId: string; paperId: string }> = {
  physics_1st_paper: { subjectId: 'phy', paperId: 'phy_1' },
  physics_2nd_paper: { subjectId: 'phy', paperId: 'phy_2' },
  chemistry_1st_paper: { subjectId: 'chem', paperId: 'chem_1' },
  chemistry_2nd_paper: { subjectId: 'chem', paperId: 'chem_2' },
  higher_math_1st_paper: { subjectId: 'hmath', paperId: 'hmath_1' },
  higher_math_2nd_paper: { subjectId: 'hmath', paperId: 'hmath_2' },
  biology_1st_paper: { subjectId: 'bio', paperId: 'bio_1' },
  biology_2nd_paper: { subjectId: 'bio', paperId: 'bio_2' },
  bangla_1st_paper: { subjectId: 'bangla', paperId: 'bangla_1' },
  bangla_2nd_paper: { subjectId: 'bangla', paperId: 'bangla_2' },
  english_1st_paper: { subjectId: 'english', paperId: 'english_1' },
  english_2nd_paper: { subjectId: 'english', paperId: 'english_2' },
  ict: { subjectId: 'ict', paperId: 'ict_1' },
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function extractQuestionFromImage(filePath: string, subjectHint?: string, paperHint?: string): Promise<any> {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Data = imageBuffer.toString('base64');
  const mimeType = getMimeType(filePath);

  const systemInstruction = `You are an expert HSC (Bangladesh) Examination Question Digitization OCR Engine.
Extract the question from the image into structured JSON:
1. Preserve all scientific and Bengali literature text accurately.
2. Convert all mathematical and physics formulas and units to standard LaTeX notation ($...$ or $$...$$).
3. If Creative Question (CQ): extract stem (উদ্দীপক), part (a) [1 mark], part (b) [2 marks], part (c) [3 marks], part (d) [4 marks] with full step-by-step solutions in LaTeX.
4. If Multiple Choice (MCQ): extract stem, 4 options (A, B, C, D), correct option, and explanation.
5. Identify the Subject, Paper, Chapter name/ID, Education Board, and Exam Year.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        {
          text: `Extract this HSC exam question. Subject hint: ${subjectHint || 'Auto'}, Paper hint: ${paperHint || 'Auto'}. Return structured JSON.`,
        },
      ],
    },
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
}

async function runBatchIngestion() {
  console.log('=== HSC Question Image Batch Ingestion Pipeline ===');
  console.log(`Scanning directory: ${RAW_DIR}\n`);

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Directory ${RAW_DIR} does not exist.`);
    return;
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
  const subdirs = fs.readdirSync(RAW_DIR);
  let totalProcessed = 0;
  let totalSuccess = 0;

  for (const subdir of subdirs) {
    const subdirPath = path.join(RAW_DIR, subdir);
    if (!fs.statSync(subdirPath).isDirectory()) continue;

    const mapping = FOLDER_TO_SUBJECT_MAP[subdir] || { subjectId: 'phy', paperId: 'phy_1' };
    const files = fs.readdirSync(subdirPath).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    if (files.length === 0) continue;

    console.log(`📁 Folder: ${subdir} (${files.length} image files found)`);

    for (const file of files) {
      const filePath = path.join(subdirPath, file);
      const fileId = `img_${path.parse(file).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

      if (existingIds.has(fileId)) {
        console.log(`  ⏩ Skipping already digitized: ${file}`);
        continue;
      }

      console.log(`  🔍 Digitizing: ${file}...`);
      totalProcessed++;

      try {
        const extracted = await extractQuestionFromImage(filePath, mapping.subjectId, mapping.paperId);
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
          is_verified: true,
          created_at: new Date().toISOString(),
        };

        existingQuestions.push(standardizedQuestion);
        existingIds.add(fileId);
        totalSuccess++;
        console.log(`    ✅ Successfully extracted ${standardizedQuestion.question_format}: ${standardizedQuestion.chapter_name} (${standardizedQuestion.board} ${standardizedQuestion.exam_year})`);

        // Save progress after each question
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingQuestions, null, 2), 'utf-8');

        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err: any) {
        console.error(`    ❌ Failed to digitize ${file}:`, err?.message || err);
      }
    }
  }

  console.log(`\n🎉 Ingestion complete! Processed: ${totalProcessed}, Successfully Added: ${totalSuccess}`);
  console.log(`💾 Question bank saved to: ${OUTPUT_FILE} (Total questions: ${existingQuestions.length})`);
}

runBatchIngestion().catch((err) => {
  console.error('Fatal batch ingestion error:', err);
  process.exit(1);
});
