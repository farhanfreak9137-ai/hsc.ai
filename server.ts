import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy Google GenAI Client with Telemetry
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. INGESTION & EXTRACTION OCR API
// ----------------------------------------------------
app.post('/api/gemini/extract-question', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType, rawText, subjectHint, chapterHint } = req.body;
    const ai = getAI();

    const systemInstruction = `You are an expert HSC (Higher Secondary Certificate - Bangladesh) Examination Question Ingestion Engine.
Your task is to analyze Bengali / English question materials (from board exams, textbooks, model tests, or scans) and extract a strictly structured Creative Question (CQ) or Multiple Choice Question (MCQ).

Rules:
1. Preserve all scientific text in clear Bengali and English where applicable.
2. Convert all mathematical and physics formulas, units, and symbols to standard LaTeX notation surrounded by single $ for inline or double $$ for block (e.g., $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$, $0.5\\text{ kg}\\cdot\\text{m}^2$).
3. If Creative Question (CQ):
   - Extract the full Stem (উদ্দীপক).
   - Extract Part (a) [জ্ঞানমূলক - Knowledge, 1 mark]
   - Extract Part (b) [অনুধাবনমূলক - Understanding, 2 marks]
   - Extract Part (c) [প্রয়োগমূলক - Application, 3 marks]
   - Extract Part (d) [উচ্চতর দক্ষতামূলক - Higher Ability, 4 marks]
4. If Multiple Choice (MCQ):
   - Extract Question prompt, options A, B, C, D, and identify the correct option if visible.
5. Identify or estimate the Education Board (e.g., Dhaka, Chattogram, Rajshahi, All Boards), Exam Year (2018-2024), Subject ('phy', 'chem', 'hmath', 'bio'), Paper ('phy_1', 'phy_2', 'chem_1', etc.), and estimated Chapter/Concept name.
6. Provide a complete, step-by-step verified solution in LaTeX and Bengali.`;

    const promptText = `Analyze this HSC question material.
Subject hint: ${subjectHint || 'Not provided'}
Chapter hint: ${chapterHint || 'Not provided'}
Raw text snippet if any: ${rawText || 'None'}

Extract and return JSON according to the schema.`;

    const contents: any[] = [];
    if (imageBase64 && mimeType) {
      contents.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: mimeType,
        },
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question_format: { type: Type.STRING, description: "'CQ' or 'MCQ'" },
            subject_id: { type: Type.STRING, description: "'phy', 'chem', 'hmath', 'bio'" },
            paper_id: { type: Type.STRING, description: "'phy_1', 'phy_2', 'chem_1', 'chem_2', 'hmath_1', 'hmath_2', 'bio_1', 'bio_2'" },
            chapter_name: { type: Type.STRING },
            board: { type: Type.STRING, description: "e.g., 'Dhaka', 'Chattogram', 'Rajshahi', 'All Boards', or 'Custom'" },
            exam_year: { type: Type.INTEGER, description: "e.g., 2023, 2024" },
            difficulty_tier: { type: Type.STRING, description: "'easy', 'medium', 'hard'" },
            stem_text: { type: Type.STRING, description: "The full question stem in Bengali with LaTeX formulas" },
            subparts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part_label: { type: Type.STRING, description: "'a', 'b', 'c', 'd'" },
                  cognitive_level: { type: Type.STRING, description: "'knowledge', 'understanding', 'application', 'higher_ability'" },
                  marks: { type: Type.INTEGER },
                  prompt_text: { type: Type.STRING },
                  solution_latex: { type: Type.STRING },
                },
                required: ['part_label', 'cognitive_level', 'marks', 'prompt_text'],
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
              },
            },
            correct_option: { type: Type.STRING },
            full_solution_latex: { type: Type.STRING },
            core_concept_name: { type: Type.STRING },
          },
          required: ['question_format', 'subject_id', 'stem_text', 'full_solution_latex'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error extracting question with Gemini:', error);
    res.status(500).json({ success: false, error: error.message || 'Extraction failed' });
  }
});

// ----------------------------------------------------
// 2. GROUNDED SOCRATIC & EXPOSITORY TUTOR API (ANY QUESTION & MULTIMODAL)
// ----------------------------------------------------
app.post('/api/gemini/tutor', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      mode, // 'socratic' | 'expository' | 'exam' | 'revision'
      conceptName,
      formulaLatex,
      corePrinciple,
      questionContext,
      retrievedChunks,
      conversationHistory,
      userQuery,
      imageBase64,
      mimeType,
    } = req.body;

    const ai = getAI();

    const modeInstructions = {
      socratic: `You are an encouraging, sharp Socratic HSC Teacher in Bangladesh.
- You can answer ANY science question (Physics, Chemistry, Higher Math, Biology, general doubts, or homework problems).
- You are NOT restricted to standard book questions; answer random conceptual doubts, tricky calculations, and student queries freely.
- When in Socratic mode: DO NOT immediately give away the final numerical answer. Guide the student step-by-step with intuitive leading questions and hints.
- Break problem solving into: (1) What is given & target variable, (2) Core physical/mathematical law, (3) Calculation & units.
- If the student explicitly asks for full explanation or seems stuck, provide a comprehensive, clear solution.`,
      expository: `You are a master HSC teacher delivering an authoritative, crystal-clear conceptual lesson.
- You can explain ANY scientific topic, random doubt, or problem presented by the student.
- Explain thoroughly at HSC standard in fluent Bengali, using standard English scientific terms in parentheses where helpful.
- Present all mathematical formulas in LaTeX ($...$ or $$...$$).
- Ground explanations in standard NCTB textbook methodology (Dr. Shahjahan Tapan, Prof. Giasuddin, Dr. Ahsanul Kabir, etc.).
- Provide clear step-by-step worked examples.`,
      exam: `You are a strict HSC Exam Invigilator and Master Grader.
- Present questions and evaluate answers concisely with official Bangladesh Board marking rubrics (1 mark for formula, 1 mark for substitution, 1 mark for calculation/unit).
- Test the student under timed examination conditions.`,
      revision: `You are a high-yield HSC Revision Coach.
- Provide high-density, bulleted recall points: core formulas, boundary conditions, sign conventions, and classic traps/pitfalls that students fall into in board exams.`,
    };

    const activeModeInstruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.socratic;

    const chunksText = Array.isArray(retrievedChunks) && retrievedChunks.length > 0
      ? retrievedChunks
          .map(
            (c: any, i: number) =>
              `[Source ${i + 1}: ${c.document_title}, Page ${c.page_number}, Section: ${c.section_title}]\n${c.content_text}\nFormula: ${c.formula_latex || 'N/A'}`
          )
          .join('\n\n')
      : 'General HSC Science Syllabus (Physics, Chemistry, Higher Math, Biology). Answer any question clearly.';

    const systemInstruction = `${activeModeInstruction}

LANGUAGE & FORMATTING:
- Primary explanation in natural, clear Bengali (বাংলা).
- All mathematical equations, symbols, and variables MUST be formatted in LaTeX ($...$ for inline or $$...$$ for block).
- Be extremely helpful, clear, and friendly. Answer ANY question the student asks, whether from textbook, coaching sheets, test papers, or random conceptual curiosity!`;

    const formattedHistory: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const m of conversationHistory) {
        formattedHistory.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        });
      }
    }

    const currentParts: any[] = [];
    if (imageBase64 && mimeType) {
      currentParts.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: mimeType,
        },
      });
    }

    currentParts.push({
      text: `Context / Selected Concept: ${conceptName || 'Open Doubt / Any Science Question'}
Formula: ${formulaLatex || 'N/A'}
Core Principle: ${corePrinciple || 'N/A'}
Question Context: ${questionContext || 'N/A'}

Student query/question: ${userQuery || 'Please explain this problem.'}`,
    });

    formattedHistory.push({
      role: 'user',
      parts: currentParts,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: mode === 'socratic' ? 0.6 : 0.4,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in AI Tutor:', error);
    res.status(500).json({ success: false, error: error.message || 'Tutor session failed' });
  }
});

// ----------------------------------------------------
// 3. MULTIMODAL ANSWER EVALUATION & ERROR INTELLIGENCE
// ----------------------------------------------------
app.post('/api/gemini/evaluate-answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      questionStem,
      subpartPrompt,
      maxMarks,
      officialSolutionLatex,
      studentAnswerText,
      studentAnswerImageBase64,
      mimeType,
      conceptName,
    } = req.body;

    const ai = getAI();

    const systemInstruction = `You are an official Senior HSC Head Examiner (বাংলাদেশ উচ্চমাধ্যমিক শিক্ষা বোর্ড).
Your job is to strictly and accurately evaluate a student's answer (which may be typed text or a handwritten scratchpad photo).

Grading Rubric Rules:
1. Check mathematical reasoning step-by-step.
2. Differentiate between:
   - "calculation_slip" (Correct formula and method, arithmetic error or minor decimal round-off)
   - "formula_amnesia" (Incorrect formula applied)
   - "conceptual_misconception" (Misinterpreted the physics/chemistry principle, e.g. using linear momentum instead of angular momentum, or neglecting temperature in entropy)
   - "unit_error" (Forgotten unit or wrong conversion like rpm to rad/s or km/h to m/s)
   - "sign_error" (Wrong sign in work/energy or thermodynamic heat transfer)
   - "incomplete_reasoning" (Correct final answer without showing derivation steps)
3. Compute an evaluation confidence score (0.0 to 1.0). If handwriting is too blurry, set confidence < 0.70.
4. Award accurate partial marks according to Bangladesh board marking standards (0 to ${maxMarks || 4}).
5. Give clear, encouraging, and pedagogically precise feedback in Bengali.`;

    const promptText = `Evaluate the student's answer for this HSC Question:
Question Stem: ${questionStem}
Subpart / Question Prompt: ${subpartPrompt || 'Full Problem'}
Maximum Marks: ${maxMarks || 4}
Official Solution & Formula: ${officialSolutionLatex || 'Standard method'}
Concept: ${conceptName || 'HSC Concept'}
Student Answer Text: ${studentAnswerText || 'See image if uploaded'}

Return strict JSON matching the schema.`;

    const parts: any[] = [];
    if (studentAnswerImageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: studentAnswerImageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: mimeType,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_correct: { type: Type.BOOLEAN },
            score_obtained: { type: Type.NUMBER },
            max_score: { type: Type.NUMBER },
            evaluation_confidence: { type: Type.NUMBER, description: 'Confidence between 0.0 and 1.0' },
            reasoning_correct: { type: Type.BOOLEAN },
            error_category: {
              type: Type.STRING,
              description:
                "'calculation_slip', 'formula_amnesia', 'conceptual_misconception', 'wrong_method', 'incomplete_reasoning', 'unit_error', 'sign_error', 'misread_question' or 'none'",
            },
            evaluation_summary: { type: Type.STRING, description: 'Detailed feedback in Bengali' },
            step_evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  is_correct: { type: Type.BOOLEAN },
                  score_obtained: { type: Type.NUMBER },
                  max_score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                },
                required: ['step', 'description', 'is_correct', 'score_obtained', 'feedback'],
              },
            },
            corrective_advice_bn: { type: Type.STRING, description: 'Actionable tips to avoid repeating this mistake' },
          },
          required: [
            'is_correct',
            'score_obtained',
            'max_score',
            'evaluation_confidence',
            'reasoning_correct',
            'evaluation_summary',
            'corrective_advice_bn',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ success: false, error: error.message || 'Evaluation failed' });
  }
});

// ----------------------------------------------------
// 3B. AI HANDWRITTEN PAPER & DIAGRAM SCANNER OCR & EVALUATION API
// ----------------------------------------------------
app.post('/api/gemini/evaluate-handwritten-paper', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      imageBase64,
      mimeType,
      subjectHint,
      chapterHint,
      knownQuestionPrompt,
      officialAnswerLatex,
      totalMaxMarks,
    } = req.body;

    const ai = getAI();

    const systemInstruction = `You are the Chief Examiner of the Bangladesh Higher Secondary Education Board (NCTB) equipped with advanced Vision OCR and Scientific Diagram Reasoning.
Your task is to analyze a student's handwritten exam script photo or scientific diagram (Physics, Chemistry, Higher Math, Biology).

Evaluation Guidelines:
1. **Transcribe Handwriting & Equations**: Convert all handwritten Bengali/English text and mathematical derivations into precise LaTeX equations ($...$ or $$...$$).
2. **Diagram & Circuit Analysis**: If the image contains a physics free-body diagram, circuit diagram, ray optics diagram, or chemical benzene/organic structure:
   - Identify whether labels, vector arrows, polarities, bond valencies, and angles are drawn correctly.
   - Note any diagrammatic errors or omissions in "diagram_evaluation".
3. **NCTB Step-by-Step Marking (Mark Rubric)**:
   - Formula / Principle Stated: 1 Mark
   - Given Data Substitution with Unit Conversions: 1 Mark
   - Intermediate Derivation / Calculation: 1 Mark
   - Final Value with Correct Physical Units & Significant Figures: 1 Mark
4. **Error Intelligence**:
   - Classify primary mistake type: 'calculation_slip', 'formula_amnesia', 'conceptual_misconception', 'wrong_method', 'incomplete_reasoning', 'unit_error', 'sign_error', 'diagram_error', or 'none'.
5. **Red-Pen Annotated Feedback (Bengali)**:
   - Highlight what the student did excellently.
   - Explicitly point out the line or step where they lost marks.
   - Provide the 100% full-mark benchmark model solution in LaTeX.`;

    const promptText = `Analyze and grade this handwritten HSC exam paper / scratchpad photo.
Subject Hint: ${subjectHint || 'Not specified (Auto-detect)'}
Chapter/Topic: ${chapterHint || 'Not specified'}
Given Question Prompt (if any): ${knownQuestionPrompt || 'Auto-detect from image'}
Official Expected Answer (if any): ${officialAnswerLatex || 'Auto-derive standard solution'}
Max Marks: ${totalMaxMarks || 4}

Provide full structured evaluation according to the JSON schema.`;

    const parts: any[] = [];
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: mimeType,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribed_handwriting_bn: { type: Type.STRING, description: 'Complete transcribed student answer with LaTeX equations' },
            detected_subject: { type: Type.STRING, description: "'Physics', 'Chemistry', 'Higher Mathematics', or 'Biology'" },
            detected_topic: { type: Type.STRING },
            identified_question: { type: Type.STRING, description: 'The question or mathematical problem identified from the paper' },
            is_fully_correct: { type: Type.BOOLEAN },
            marks_obtained: { type: Type.NUMBER },
            total_max_marks: { type: Type.NUMBER },
            confidence_score: { type: Type.NUMBER, description: 'OCR & grading confidence 0.0 - 1.0' },
            error_category: { type: Type.STRING },
            rubric_breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING, description: "e.g., 'সূত্র প্রয়োগ (Formula)', 'মান বসানো (Substitution)', 'হিসাব ও একক (Calculation & Unit)'" },
                  awarded: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  status: { type: Type.STRING, description: "'correct', 'partial', 'incorrect', 'omitted'" },
                  comment_bn: { type: Type.STRING },
                },
                required: ['criteria', 'awarded', 'max', 'status', 'comment_bn'],
              },
            },
            diagram_analysis: {
              type: Type.OBJECT,
              properties: {
                has_diagram: { type: Type.BOOLEAN },
                diagram_type: { type: Type.STRING, description: "e.g., 'Vector Resolution', 'Circuit', 'Benzene Ring', 'Ray Optics', 'None'" },
                accuracy_status: { type: Type.STRING, description: "'accurate', 'minor_error', 'incorrect', 'missing_labels', 'not_applicable'" },
                diagram_notes_bn: { type: Type.STRING },
              },
              required: ['has_diagram', 'accuracy_status', 'diagram_notes_bn'],
            },
            examiner_verdict_bn: { type: Type.STRING, description: 'Comprehensive teacher remark in Bengali with constructive feedback' },
            benchmark_model_solution_latex: { type: Type.STRING, description: 'Ideal full-mark answer with LaTeX equations' },
            remedial_advice_bn: { type: Type.STRING, description: 'Specific exam tip so the student avoids repeating this mistake in board exams' },
          },
          required: [
            'transcribed_handwriting_bn',
            'detected_subject',
            'is_fully_correct',
            'marks_obtained',
            'total_max_marks',
            'confidence_score',
            'error_category',
            'rubric_breakdown',
            'diagram_analysis',
            'examiner_verdict_bn',
            'benchmark_model_solution_latex',
            'remedial_advice_bn',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error evaluating handwritten paper:', error);
    res.status(500).json({ success: false, error: error.message || 'Handwritten evaluation failed' });
  }
});

// ----------------------------------------------------
// 4. REMEDIAL ISOMORPHIC VARIANT GENERATOR API
// ----------------------------------------------------
app.post('/api/gemini/generate-remedial-variant', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conceptName, formulaLatex, mistakeTitle, rootCause } = req.body;
    const ai = getAI();

    const systemInstruction = `You are an HSC Curriculum Specialist.
The student made a specific mistake: "${mistakeTitle}" (${rootCause}) on concept: "${conceptName}".
Generate an isomorphic (structurally equivalent with different numerical parameters or altered scenario) HSC Creative Question (CQ) or MCQ that specifically challenges this weak point so the student can prove they have rectified the misconception.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a remedial test problem for concept: ${conceptName}, Formula: ${formulaLatex || 'N/A'}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            question_format: { type: Type.STRING, description: "'CQ' or 'MCQ'" },
            stem_text: { type: Type.STRING },
            prompt_question: { type: Type.STRING },
            mcq_options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
              },
            },
            correct_option: { type: Type.STRING },
            full_solution_latex: { type: Type.STRING },
            trap_warning_bn: { type: Type.STRING, description: 'Advice highlighting where students usually slip' },
          },
          required: ['title', 'question_format', 'stem_text', 'full_solution_latex', 'trap_warning_bn'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating remedial variant:', error);
    res.status(500).json({ success: false, error: error.message || 'Generation failed' });
  }
});

// ----------------------------------------------------
// 5. SMART STUDY SPRINT GENERATOR API
// ----------------------------------------------------
app.post('/api/gemini/generate-sprint', async (req: Request, res: Response): Promise<void> => {
  try {
    const { chapterName, subjectName, totalMinutes, weakConcepts, highPriorityConcepts } = req.body;
    const ai = getAI();

    const systemInstruction = `You are an elite HSC Study Planner.
Generate a structured, time-boxed study sprint for a student who has ${totalMinutes || 90} minutes available for "${chapterName}" (${subjectName}).
Allocate realistic time blocks (e.g. Concept Refinement -> High-Yield Board CQ Drill -> Error Rectification -> Final Retention Check) based on their weak concepts and high-recurrence board patterns.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Plan a ${totalMinutes || 90} min sprint for Chapter: ${chapterName}.
Weak Concepts: ${JSON.stringify(weakConcepts || [])}
High Priority Board Concepts: ${JSON.stringify(highPriorityConcepts || [])}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sprint_title: { type: Type.STRING },
            archetype: { type: Type.STRING, description: "'weakness_triage', 'balanced_sprint', 'exam_drill'" },
            total_minutes: { type: Type.INTEGER },
            summary_advice_bn: { type: Type.STRING },
            stages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  stage_name: { type: Type.STRING },
                  stage_name_bn: { type: Type.STRING },
                  duration_minutes: { type: Type.INTEGER },
                  activity_type: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['stage_name', 'stage_name_bn', 'duration_minutes', 'activity_type', 'description'],
              },
            },
          },
          required: ['sprint_title', 'archetype', 'total_minutes', 'summary_advice_bn', 'stages'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating sprint:', error);
    res.status(500).json({ success: false, error: error.message || 'Sprint generation failed' });
  }
});

// ----------------------------------------------------
// 6. SCANNED BOOK & PDF INGESTION / CHAPTER INDEXING API
// ----------------------------------------------------
app.post('/api/gemini/ingest-book-pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fileBase64,
      mimeType,
      fileName,
      rawText,
      subjectId,
      paperId,
      bookTitle,
      authorName
    } = req.body;
    const ai = getAI();

    const systemInstruction = `You are a high-speed Document Ingestion and OCR Indexing Engine for Bangladesh HSC textbooks (Bangla, English, ICT, Physics, Chemistry, Higher Math, Biology).
Your goal is to parse the uploaded scanned book/PDF pages and generate:
1. Complete table of contents / chapter index with page ranges.
2. High-yield knowledge chunks with exact page numbers, section titles, summary text, and LaTeX formulas.
3. Identified board exam recurring topics and definitions.`;

    const contents: any[] = [];
    if (fileBase64 && mimeType) {
      contents.push({
        inlineData: {
          data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
          mimeType: mimeType,
        },
      });
    }
    contents.push({
      text: `Analyze this uploaded textbook/material:
Book Title: ${bookTitle || fileName || 'HSC Scanned Book'}
Author/Publisher: ${authorName || 'NCTB / Standard Author'}
Subject: ${subjectId || 'Auto-detect'}
Paper: ${paperId || 'Auto-detect'}
Extracted text snippet if any: ${rawText?.slice(0, 8000) || 'None provided'}

Extract structured chapters, key topics, formulas in LaTeX, and indexed document chunks for instant search and RAG answering.`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title_bn: { type: Type.STRING },
            title_en: { type: Type.STRING },
            subject_id: { type: Type.STRING },
            paper_id: { type: Type.STRING },
            author: { type: Type.STRING },
            edition: { type: Type.STRING },
            total_pages_estimated: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapter_number: { type: Type.INTEGER },
                  title_bn: { type: Type.STRING },
                  title_en: { type: Type.STRING },
                  start_page: { type: Type.INTEGER },
                  end_page: { type: Type.INTEGER },
                  key_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  summary_text: { type: Type.STRING },
                  high_yield_formulas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['chapter_number', 'title_bn', 'title_en', 'start_page', 'end_page', 'key_topics', 'summary_text']
              }
            },
            extracted_chunks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section_title: { type: Type.STRING },
                  page_number: { type: Type.INTEGER },
                  content_text: { type: Type.STRING },
                  formula_latex: { type: Type.STRING }
                },
                required: ['section_title', 'page_number', 'content_text']
              }
            }
          },
          required: ['title_bn', 'title_en', 'chapters', 'extracted_chunks']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error ingesting textbook PDF:', error);
    res.status(500).json({ success: false, error: error.message || 'Book ingestion failed' });
  }
});

// ----------------------------------------------------
// 7. DIRECT BOOK-ANALYZING ANSWER ENGINE (RAG FROM UPLOADED BOOKS)
// ----------------------------------------------------
app.post('/api/gemini/analyze-book-answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionQuery, uploadedBookContext, matchedChunks, subjectHint } = req.body;
    const ai = getAI();

    const systemInstruction = `You are the HSC Book Analysis & Citation Engine.
Instead of giving generic web answers, your primary job is to find the exact answers directly by analyzing the uploaded textbook pages and pre-indexed book chunks.
Rules:
1. Provide the exact answer grounded in the uploaded book's definitions, theorems, and explanations.
2. Cite the exact Book Title, Chapter, and Page Number (e.g. "[ড. শাহজাহান তপন, পৃষ্ঠা ১৪২]" or "[English For Today, Unit 1, Page 12]").
3. Quote relevant key sentences from the book directly.
4. Format all formulas in LaTeX ($...$).
5. Provide a step-by-step breakdown:
   - Book Citation & Source
   - Core Definition / Principle as stated in the textbook
   - Step-by-step solution / analytical breakdown
   - Key exam note (where students usually make mistakes in Board exams).`;

    const chunksDescription = Array.isArray(matchedChunks) && matchedChunks.length > 0
      ? matchedChunks.map((c: any, i: number) => `[Book Excerpt ${i+1}: ${c.document_title || c.book_title}, Page ${c.page_number}, Section: ${c.section_title || c.chapter_title}]\n${c.content_text || c.snippet_text}\nFormula: ${c.formula_latex || 'N/A'}`).join('\n\n')
      : 'Using standard indexed NCTB textbooks for HSC (Bangla, English, ICT, Physics, Chemistry, Higher Math, Biology).';

    const promptText = `Student Question / Query: ${questionQuery}
Subject Hint: ${subjectHint || 'All HSC Subjects'}
Uploaded Book Context: ${JSON.stringify(uploadedBookContext || {})}

Available Book Excerpts & Chunks:
${chunksDescription}

Analyze the uploaded book material and provide the authoritative, cited answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book_citation: { type: Type.STRING, description: "e.g., 'উচ্চ মাধ্যমিক পদার্থবিজ্ঞান ১ম পত্র (ড. শাহজাহান তপন), অধ্যায় ৪, পৃষ্ঠা ১৪২'" },
            exact_book_quote: { type: Type.STRING, description: "Direct quotation from the book" },
            answer_markdown: { type: Type.STRING, description: "Complete explanation in Bengali with LaTeX formulas" },
            page_numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            confidence_score: { type: Type.NUMBER },
            related_board_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            key_takeaway_bn: { type: Type.STRING }
          },
          required: ['book_citation', 'answer_markdown', 'page_numbers', 'key_takeaway_bn']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing book for answer:', error);
    res.status(500).json({ success: false, error: error.message || 'Book analysis failed' });
  }
});

// ----------------------------------------------------
// WORKSHEET QUESTION GENERATOR (Gemini-powered)
// Generates real, authentic board-standard CQs and MCQs
// in a SINGLE batched request to stay within rate limits.
// ----------------------------------------------------
app.post('/api/gemini/generate-worksheet-questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      subjectId,
      paperId,
      subjectNameBn,
      paperNameBn,
      chapters,  // Array of { id, nameBn, nameEn }
      cqCount,
      mcqCount,
      seed,
    } = req.body;

    const ai = getAI();

    const chapterList = (chapters || []).map((ch: any) => ch.nameBn || ch.nameEn || ch.id).join(', ');
    const chapterDetails = (chapters || []).map((ch: any, i: number) => `${i + 1}. ${ch.nameBn || ch.nameEn} (${ch.id})`).join('\n');

    const allCqs: any[] = [];
    const allMcqs: any[] = [];

    // --- Generate CQs (single API call) ---
    if (cqCount > 0) {
      const cqSystemInstruction = `You are an expert HSC (Higher Secondary Certificate - Bangladesh) Board Examination Question Generator.
You generate REAL, authentic, board-standard Creative Questions (সৃজনশীল প্রশ্ন / CQ) in Bengali for:
Subject: "${subjectNameBn || subjectId}"
Paper: "${paperNameBn || paperId}"
Chapters: ${chapterList}

CRITICAL RULES:
1. Generate REAL questions with ACTUAL content — real scenarios, real data, real calculations. NEVER placeholder or generic text.
2. For science subjects (পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, গণিত): use real numerical problems with specific values and LaTeX formulas.
3. For Bangla literature (বাংলা): use actual পদ্যাংশ/গদ্যাংশ quotes from the chapter. For গল্প like বিলাসী, use actual quotes from the story text. For কবিতা like বিদ্রোহী, use actual lines from the poem.
4. For English: use real passages, grammar, comprehension.
5. ALL question text in Bengali (বাংলা) medium. Use $LaTeX$ for math/science.
6. Each CQ must have: উদ্দীপক (stimulus with real data/quotes), then 4 parts:
   (ক) জ্ঞানমূলক (1 mark) — definition/recall
   (খ) অনুধাবনমূলক (2 marks) — explain/interpret
   (গ) প্রয়োগমূলক (3 marks) — apply/calculate
   (ঘ) উচ্চতর দক্ষতামূলক (4 marks) — analyze/evaluate
7. Each question MUST be completely DIFFERENT — different scenarios, different values, different concepts.
8. Distribute questions across the chapters: specify which chapter each question is from.
9. Match the exact difficulty and style of real HSC board exams.
10. Provide FULL step-by-step solutions for each part.

Generate exactly ${cqCount} CQs. Distribute them across the chapters: ${chapterDetails}
Use seed=${seed} for variation.`;

      try {
        const cqResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts: [{ text: `Generate ${cqCount} unique, real, board-standard Creative Questions (CQ/সৃজনশীল) distributed across these chapters:\n${chapterDetails}\n\nReturn as JSON array.` }] },
          config: {
            systemInstruction: cqSystemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapter_id: { type: Type.STRING, description: 'The chapter_id this CQ belongs to' },
                  stem_text: { type: Type.STRING, description: 'The CQ stimulus/scenario (উদ্দীপক) with real content' },
                  part_a_prompt: { type: Type.STRING, description: '(ক) জ্ঞানমূলক question (1 mark)' },
                  part_a_solution: { type: Type.STRING, description: '(ক) solution with LaTeX' },
                  part_b_prompt: { type: Type.STRING, description: '(খ) অনুধাবনমূলক question (2 marks)' },
                  part_b_solution: { type: Type.STRING, description: '(খ) solution with LaTeX' },
                  part_c_prompt: { type: Type.STRING, description: '(গ) প্রয়োগমূলক question (3 marks)' },
                  part_c_solution: { type: Type.STRING, description: '(গ) solution with LaTeX' },
                  part_d_prompt: { type: Type.STRING, description: '(ঘ) উচ্চতর দক্ষতামূলক question (4 marks)' },
                  part_d_solution: { type: Type.STRING, description: '(ঘ) solution with LaTeX' },
                  board: { type: Type.STRING, description: 'Suggested board name' },
                  year: { type: Type.NUMBER, description: 'Exam year 2020-2024' },
                },
                required: ['chapter_id', 'stem_text', 'part_a_prompt', 'part_a_solution', 'part_b_prompt', 'part_b_solution', 'part_c_prompt', 'part_c_solution', 'part_d_prompt', 'part_d_solution'],
              },
            },
          },
        });
        const cqText = cqResponse?.text;
        if (cqText) {
          const parsed = JSON.parse(cqText);
          allCqs.push(...(Array.isArray(parsed) ? parsed : []));
        }
      } catch (cqErr: any) {
        console.error('CQ generation error:', cqErr?.message || cqErr);
      }
    }

    // Small delay between CQ and MCQ calls to avoid rate limiting
    if (cqCount > 0 && mcqCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // --- Generate MCQs (single API call) ---
    if (mcqCount > 0) {
      const mcqSystemInstruction = `You are an expert HSC (Higher Secondary Certificate - Bangladesh) Board Examination Question Generator.
You generate REAL, authentic, board-standard Multiple Choice Questions (MCQ / বহুনির্বাচনি) in Bengali for:
Subject: "${subjectNameBn || subjectId}"
Paper: "${paperNameBn || paperId}"
Chapters: ${chapterList}

CRITICAL RULES:
1. Generate REAL MCQs with ACTUAL content — real formulas, real values, real scenarios. NEVER generic text.
2. For science: real numerical/conceptual MCQs with LaTeX formulas.
3. For Bangla/English: real content-based MCQs from the chapter.
4. ALL text in Bengali medium. Use $LaTeX$ for math/science.
5. Each MCQ: stem + 4 options (ক, খ, গ, ঘ), exactly one correct, plausible distractors.
6. Every MCQ MUST be completely DIFFERENT — different concepts, values, scenarios.
7. Distribute across chapters: ${chapterDetails}
8. Match real HSC board exam difficulty and style.
9. Provide a brief solution/explanation for each MCQ.

Generate exactly ${mcqCount} MCQs. Use seed=${seed} for variation.`;

      try {
        const mcqResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts: [{ text: `Generate ${mcqCount} unique, real, board-standard MCQs distributed across these chapters:\n${chapterDetails}\n\nReturn as JSON array.` }] },
          config: {
            systemInstruction: mcqSystemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chapter_id: { type: Type.STRING, description: 'The chapter_id this MCQ belongs to' },
                  stem_text: { type: Type.STRING, description: 'MCQ question stem in Bengali with LaTeX' },
                  option_a: { type: Type.STRING, description: 'Option ক text' },
                  option_b: { type: Type.STRING, description: 'Option খ text' },
                  option_c: { type: Type.STRING, description: 'Option গ text' },
                  option_d: { type: Type.STRING, description: 'Option ঘ text' },
                  correct_option: { type: Type.STRING, description: 'Correct option: A, B, C, or D' },
                  solution: { type: Type.STRING, description: 'Solution explanation with LaTeX' },
                  board: { type: Type.STRING, description: 'Suggested board' },
                  year: { type: Type.NUMBER, description: 'Exam year 2020-2024' },
                },
                required: ['chapter_id', 'stem_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'solution'],
              },
            },
          },
        });
        const mcqText = mcqResponse?.text;
        if (mcqText) {
          const parsed = JSON.parse(mcqText);
          allMcqs.push(...(Array.isArray(parsed) ? parsed : []));
        }
      } catch (mcqErr: any) {
        console.error('MCQ generation error:', mcqErr?.message || mcqErr);
      }
    }

    if (allCqs.length === 0 && allMcqs.length === 0) {
      res.status(500).json({ error: 'Failed to generate questions. The API may be rate-limited. Please wait a minute and try again.' });
      return;
    }

    res.json({ cqs: allCqs, mcqs: allMcqs });
  } catch (err: any) {
    console.error('Worksheet generation error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HSC Study Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
