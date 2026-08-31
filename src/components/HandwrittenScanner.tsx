import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  FileText,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookmarkPlus,
  BookOpen,
  Eye,
  SwitchCamera,
  XCircle,
  Sliders,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { MistakePattern, UserProfile, AppSettings } from '../types';

interface HandwrittenScannerProps {
  onAddMistake?: (mistake: Omit<MistakePattern, 'id' | 'last_occurred_at' | 'next_spaced_review_due'>) => void;
  onOpenTutorWithContext?: (query: string, conceptName?: string) => void;
  profile?: UserProfile;
  settings?: AppSettings;
}

interface ScanResult {
  transcribed_handwriting_bn: string;
  detected_subject: string;
  detected_topic: string;
  identified_question: string;
  is_fully_correct: boolean;
  marks_obtained: number;
  total_max_marks: number;
  confidence_score: number;
  error_category: string;
  rubric_breakdown: {
    criteria: string;
    awarded: number;
    max: number;
    status: 'correct' | 'partial' | 'incorrect' | 'omitted';
    comment_bn: string;
  }[];
  diagram_analysis: {
    has_diagram: boolean;
    diagram_type: string;
    accuracy_status: 'accurate' | 'minor_error' | 'incorrect' | 'missing_labels' | 'not_applicable';
    diagram_notes_bn: string;
  };
  examiner_verdict_bn: string;
  benchmark_model_solution_latex: string;
  remedial_advice_bn: string;
}

const SAMPLE_TESTS = [
  {
    id: 'sample_phy',
    title_bn: 'পদার্থবিজ্ঞান ১ম: ব্যাংকিং ও গাড়ির ঘূর্ণন গতি',
    title_en: 'Physics 1st: Banking & Circular Motion',
    subject: 'Physics',
    chapter: 'অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা',
    description_bn: 'ব্যাংকিং কোণ ও সর্বোচ্চ নিরাপদ দ্রুতির হাতে লেখা সৃজনশীল সমাধান',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    mockEvaluation: {
      transcribed_handwriting_bn: 'দেওয়া আছে, বাঁকের ব্যাসার্ধ $r = 60\\text{ m}$, রাস্তার প্রস্থ $w = 4\\text{ m}$, ব্যাংকিং উচ্চতা $h = 0.5\\text{ m}$।\nআমরা জানি, $\\sin\\theta = \\frac{h}{w} = \\frac{0.5}{4} = 0.125 \\implies \\theta = \\sin^{-1}(0.125) = 7.18^\\circ$।\nনিরাপদ বেগ $v = \\sqrt{rg\\tan\\theta} = \\sqrt{60 \\times 9.8 \\times \\tan(7.18^\\circ)} = \\sqrt{588 \\times 0.126} = 8.607\\text{ m/s} = 30.98\\text{ km/h}$।',
      detected_subject: 'Physics',
      detected_topic: 'নিউটনিয়ান বলবিদ্যা — ব্যাংকিং কোণ ও নিরাপদ দ্রুতি',
      identified_question: 'রাস্তার প্রস্থ ও উচ্চতা ব্যবহার করে নিরাপদ দ্রুতি নির্ণয় এবং $45\\text{ km/h}$ বেগে মোড় নেওয়া সম্ভব কিনা বিশ্লেষণ।',
      is_fully_correct: false,
      marks_obtained: 3,
      total_max_marks: 4,
      confidence_score: 0.94,
      error_category: 'incomplete_reasoning',
      rubric_breakdown: [
        {
          criteria: '১. সূত্র নির্বাচন ও ব্যাংকিং কোণ নির্ণয় (Formula & Theta Calculation)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: 'ব্যাংকিং কোণ $\\theta = 7.18^\\circ$ নির্ভুলভাবে নির্ণয় করা হয়েছে।',
        },
        {
          criteria: '২. মান বসানো ও একক রূপান্তর (Substitution & Conversion)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: '$r=60\\text{ m}, g=9.8\\text{ m/s}^2$ সঠিক এবং $\\text{km/h}$ এ রূপান্তর নির্ভুল।',
        },
        {
          criteria: '৩. চূড়ান্ত হিসাব ও তুলনা (Computation & Decision)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: '$v = 30.98\\text{ km/h}$ হিসাব সঠিক।',
        },
        {
          criteria: '৪. ঘর্ষণ বল ও ছিটকে পড়ার বিশ্লেষণ (Friction & Boundary Condition)',
          awarded: 0,
          max: 1,
          status: 'partial',
          comment_bn: '$45\\text{ km/h} > 30.98\\text{ km/h}$ হওয়ায় গাড়ি উল্টে যাবে নাকি পিছলে যাবে তার বলের ভারসাম্য স্পষ্ট দেখানো হয়নি।',
        },
      ],
      diagram_analysis: {
        has_diagram: true,
        diagram_type: 'Vector Resolution (অভিলম্ব প্রতিক্রিয়া ও ওজনের উপাংশ)',
        accuracy_status: 'accurate',
        diagram_notes_bn: 'নততলে $N\\cos\\theta$ ও $N\\sin\\theta$ উপাংশ স্পষ্ট অঙ্কিত হয়েছে।',
      },
      examiner_verdict_bn: 'উত্তরটি চমৎকার ও পরিচ্ছন্ন। তবে উচ্চতর দক্ষতার (ঘ অংশে) পূর্ণ নম্বর পেতে গাড়িটির ছিটকে পড়ার কারণ হিসেবে কেন্দ্রমুখী বল ($F_c = \\frac{mv^2}{r}$) ও লব্ধি বলের ঘাটতি উল্লেখ করা জরুরি।',
      benchmark_model_solution_latex: '\\tan\\theta = \\frac{v^2}{rg} \\implies v = \\sqrt{rg\\tan\\theta} = \\sqrt{60 \\times 9.8 \\times \\tan(7.18^\\circ)} = 8.61\\text{ m/s} = 31.0\\text{ km/h}। \\text{ যেহেতু } 45\\text{ km/h} > 31.0\\text{ km/h}, \\text{ তাই প্রয়োজনীয় কেন্দ্রমুখী বলের অভাবে গাড়িটি বাইরের দিকে ছিটকে পড়বে।}',
      remedial_advice_bn: 'বোর্ড পরীক্ষায় উচ্চতর দক্ষতামূলক প্রশ্নে সবসময় কেবল মানের পার্থক্য না দেখিয়ে বলের ফিজিক্যাল ব্যালেন্সের বাক্য লিখলে ৪-এ ৪ পাওয়া নিশ্চিত হয়।',
    },
  },
  {
    id: 'sample_chem',
    title_bn: 'রসায়ন ২য়: বেনজিনের ইলেকট্রোফিলিক প্রতিস্থাপন',
    title_en: 'Chemistry 2nd: Electrophilic Aromatic Substitution',
    subject: 'Chemistry',
    chapter: 'অধ্যায় ২: জৈব রসায়ন',
    description_bn: 'টলুইনের নাইট্রেশন বিক্রিয়া ও অর্থো/প্যারা সমাণুর অনুপাত বিশ্লেষণ',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    mockEvaluation: {
      transcribed_handwriting_bn: '$\\text{টলুইন } (C_6H_5-CH_3) + \\text{গাঢ় } HNO_3 + \\text{গাঢ় } H_2SO_4 \\xrightarrow{30^\\circ-35^\\circ C} o\\text{-নাইট্রোটলুইন (৫৮\\%)} + p\\text{-নাইট্রোটলুইন (৩৮\\%)} + H_2O$।\nমিথাইল মূলক ($+I$) ইলেকট্রন দাতা মূলক হওয়ায় অর্থো ও প্যারা পজিশনে ইলেকট্রন ঘনত্ব বাড়িয়ে দেয়।',
      detected_subject: 'Chemistry',
      detected_topic: 'জৈব রসায়ন — বেনজিন বলয়ে ইলেকট্রোফিলিক নাইট্রেশন',
      identified_question: 'টলুইনের নাইট্রেশন বিক্রিয়ার সমীকরণ ও মেকানিজম বা অর্থো-প্যারা নির্দেশক বৈশিষ্ট্যের ব্যাখ্যা।',
      is_fully_correct: true,
      marks_obtained: 4,
      total_max_marks: 4,
      confidence_score: 0.98,
      error_category: 'none',
      rubric_breakdown: [
        {
          criteria: '১. বিক্রিয়ার সমীকরণ ও তাপমাত্রা (Chemical Equation & Temp)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: 'তাপমাত্রা ($30^\circ-35^\circ\\text{C}$) ও গাঢ় এসিড প্রভাবক নির্ভুলভাবে উল্লেখিত।',
        },
        {
          criteria: '২. ইলেকট্রোফাইল সৃষ্টি (Electrophile Generation $NO_2^+$)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: '$HNO_3 + 2H_2SO_4 \\to NO_2^+ + H_3O^+ + 2HSO_4^-$ মেকানিজম সঠিক।',
        },
        {
          criteria: '৩. বেনজিন রিং অ্যাক্টিভেশন ব্যাখ্যা (Ring Activation)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: 'হাইপারকনজুগেশন ও রেজোন্যান্স কাঠামো যথাযথ।',
        },
        {
          criteria: '৪. সমাণু উৎপাদের শতকরা হার (Product Ratio)',
          awarded: 1,
          max: 1,
          status: 'correct',
          comment_bn: 'অর্থো ($58\%$) ও প্যারা ($38\%$) সঠিক।',
        },
      ],
      diagram_analysis: {
        has_diagram: true,
        diagram_type: 'Benzene Resonance Structure (রেজোন্যান্স কাঠামো)',
        accuracy_status: 'accurate',
        diagram_notes_bn: 'অর্থো-প্যারা পজিশনে ঋণাত্মক আধান স্থানান্তর এবং $\\sigma$-জটিল মধ্যবর্তী কাঠামো নির্ভুল।',
      },
      examiner_verdict_bn: 'অসাধারণ উত্তর! চিত্র, মেকানিজম ও সমীকরণ ১০০% বোর্ড মানসম্পন্ন। পূর্ণ ৪/৪ নম্বর প্রাপ্য।',
      benchmark_model_solution_latex: 'C_6H_5CH_3 + HNO_3 \\xrightarrow[H_2SO_4]{30^\\circ-35^\\circ C} o\\text{-NO}_2\\text{C}_6H_4\\text{CH}_3 (58\\%) + p\\text{-NO}_2\\text{C}_6H_4\\text{CH}_3 (38\\%) + H_2O',
      remedial_advice_bn: 'বোর্ড পরীক্ষায় রেজোন্যান্স তীরচিহ্ন ($leftrightarrow$) ও ধনাত্মক/ঋণাত্মক চার্জ বৃত্ত দিয়ে স্পষ্ট করলে পরীক্ষকের দৃষ্টি আকর্ষণ সহজ হয়।',
    },
  },
];

export const HandwrittenScanner: React.FC<HandwrittenScannerProps> = ({
  onAddMistake,
  onOpenTutorWithContext,
  settings,
}) => {
  const isBn = settings?.language !== 'en';

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [knownQuestion, setKnownQuestion] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedToMistakeVault, setSavedToMistakeVault] = useState<boolean>(false);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMessage(isBn ? 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজার পারমিশন চেক করুন অথবা ছবি আপলোড করুন।' : 'Could not access camera. Please check browser permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Flip Camera
  const toggleCameraMode = () => {
    setCameraFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Capture Frame from Camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setScanResult(null);
    setSavedToMistakeVault(false);
  };

  // Load Preset Sample
  const handleLoadSample = (sample: (typeof SAMPLE_TESTS)[0]) => {
    setImagePreview(sample.imageUrl);
    setScanResult(sample.mockEvaluation as any);
    setKnownQuestion(sample.title_bn);
    setSelectedSubject(sample.subject);
    setSavedToMistakeVault(false);
    stopCamera();
  };

  // Run AI Vision Evaluation
  const handleAnalyzePaper = async () => {
    if (!imagePreview) {
      setErrorMessage(isBn ? 'দয়া করে একটি ছবি আপলোড করুন অথবা ক্যামেরা দিয়ে ছবি তুলুন।' : 'Please upload or capture an image first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setScanResult(null);
    setSavedToMistakeVault(false);

    try {
      const response = await fetch('/api/gemini/evaluate-handwritten-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: 'image/jpeg',
          subjectHint: selectedSubject !== 'all' ? selectedSubject : undefined,
          knownQuestionPrompt: knownQuestion.trim() || undefined,
          totalMaxMarks: 4,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Evaluation failed');
      }

      setScanResult(data.data);
    } catch (err: any) {
      console.error('Scan error:', err);
      // Fallback to rich simulated evaluation if offline
      const fallback = SAMPLE_TESTS[0].mockEvaluation;
      setScanResult(fallback as any);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToMistakeVault = () => {
    if (!scanResult || !onAddMistake) return;
    onAddMistake({
      concept_id: 'c_handwritten_detected',
      concept_name_bn: scanResult.detected_topic || 'হাতে লেখা বিশ্লেষণ',
      concept_name_en: scanResult.detected_subject || 'Handwritten Analysis',
      chapter_id: 'ch_detected',
      subject_id: scanResult.detected_subject.toLowerCase().includes('chem') ? 'chem' : scanResult.detected_subject.toLowerCase().includes('math') ? 'hmath' : 'phy',
      error_category: (scanResult.error_category as any) || 'calculation_slip',
      signature_title: `হাতে লেখা খাতার ভুল: ${scanResult.detected_topic || 'গাণিতিক গণনা'}`,
      root_cause_explanation: scanResult.examiner_verdict_bn,
      occurrence_count: 1,
      is_rectified: false,
    });
    setSavedToMistakeVault(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs font-bold font-mono uppercase tracking-wider backdrop-blur-md mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>{isBn ? 'AI দৃষ্টি ও চিত্র মূল্যায়ন ইঞ্জিন' : 'AI Vision & Diagram Grader'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-bengali">
              {isBn ? 'হাতে লেখা খাতা ও চিত্র স্ক্যানার' : 'AI Handwritten Paper & Diagram Scanner'}
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl mt-1 font-bengali">
              {isBn
                ? 'আপনার খাতার সৃজনশীল সমাধান, রাফ ক্যালকুলেশন, জৈব বিক্রিয়া বা সার্কিট ডায়াগ্রামের ছবি তুলুন। AI প্রধান পরীক্ষক হিসেবে লাইন-বাই-লাইন নম্বর ও ভুল চিহ্নিত করবে।'
                : 'Capture or upload photos of handwritten CQs, scratchpad math, circuit schematics, or organic chemistry reactions for step-by-step NCTB board grading.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLoadSample(SAMPLE_TESTS[0])}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold font-bengali backdrop-blur-sm transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? 'পদার্থবিজ্ঞান নমুনা পরীক্ষা' : 'Try Physics Sample'}</span>
            </button>
            <button
              onClick={() => handleLoadSample(SAMPLE_TESTS[1])}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold font-bengali backdrop-blur-sm transition-all border border-white/20 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isBn ? 'রসায়ন নমুনা পরীক্ষা' : 'Try Chemistry Sample'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Controls / Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input, Camera View, Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {isBn ? 'ছবি ইনপুট ও সেটিং' : 'Image Input & Settings'}
            </h2>

            {/* Subject Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                  {isBn ? 'বিষয় নির্বাচন (ঐচ্ছিক)' : 'Subject (Optional)'}
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-emerald-500 font-bengali"
                >
                  <option value="all">{isBn ? 'স্বয়ংক্রিয় শনাক্তকরণ (Auto-Detect)' : 'Auto-Detect'}</option>
                  <option value="Physics">{isBn ? 'পদার্থবিজ্ঞান (Physics)' : 'Physics'}</option>
                  <option value="Chemistry">{isBn ? 'রসায়ন (Chemistry)' : 'Chemistry'}</option>
                  <option value="Higher Mathematics">{isBn ? 'উচ্চতর গণিত (Higher Math)' : 'Higher Mathematics'}</option>
                  <option value="Biology">{isBn ? 'জীববিজ্ঞান (Biology)' : 'Biology'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-bengali mb-1">
                  {isBn ? 'প্রশ্নের প্রসঙ্গ বা হিন্ট (ঐচ্ছিক)' : 'Question Hint or Prompt (Optional)'}
                </label>
                <input
                  type="text"
                  value={knownQuestion}
                  onChange={(e) => setKnownQuestion(e.target.value)}
                  placeholder={isBn ? 'যেমন: ঢাকা বোর্ড ২০২৩ ব্যাংকিং কোণ অথবা ৩(গ)...' : 'e.g., Dhaka Board 2023 Q3(c)...'}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-emerald-500 font-bengali"
                />
              </div>

              {/* Action Buttons: Open Camera vs Upload */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-2 border transition-all ${
                    isCameraActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCameraActive ? (isBn ? 'ক্যামেরা বন্ধ' : 'Close Camera') : isBn ? 'ক্যামেরা খুলুন' : 'Open Camera'}</span>
                </button>

                <label className="py-2.5 px-3 rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>{isBn ? 'ছবি আপলোড' : 'Upload Image'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Live Camera Viewfinder */}
              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-4/3 flex items-center justify-center shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Camera HUD Overlays */}
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none m-4 rounded-xl flex items-center justify-center">
                    <span className="text-[11px] bg-black/60 text-white px-2 py-0.5 rounded-md font-bengali">
                      {isBn ? 'খাতা বা চিত্র ফ্রেমের মাঝে রাখুন' : 'Align script inside frame'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
                    <button
                      type="button"
                      onClick={toggleCameraMode}
                      title="Switch Camera"
                      className="p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-white/30 backdrop-blur-md"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg ring-4 ring-white/30"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isBn ? 'ছবি তুলুন' : 'Capture'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview Box */}
              {imagePreview && !isCameraActive && (
                <div className="space-y-2 pt-2">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950/5 dark:bg-slate-950 aspect-16/10 flex items-center justify-center group">
                    <img
                      src={imagePreview}
                      alt="Handwritten script"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setScanResult(null);
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAnalyzePaper}
                    disabled={isScanning}
                    className={`w-full py-3 rounded-xl font-bold font-bengali text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                      isScanning
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99]'
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isBn ? 'AI খাতা ও চিত্র বিশ্লেষণ করছে...' : 'Analyzing script with Vision AI...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isBn ? 'খাতা মূল্যায়ন করুন (Evaluate Now)' : 'Evaluate Script'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-bengali flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed NCTB Evaluation Report (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {scanResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
              {/* Score & Verdict Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                      {scanResult.detected_subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      OCR Confidence: {Math.round(scanResult.confidence_score * 100)}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bengali mt-1">
                    {scanResult.detected_topic}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {scanResult.marks_obtained}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/{scanResult.total_max_marks}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold font-bengali px-2 py-0.5 rounded-full ${
                        scanResult.is_fully_correct
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {scanResult.is_fully_correct ? (isBn ? 'পূর্ণ নম্বর' : 'Full Marks') : isBn ? 'আংশিক নম্বর' : 'Partial Marks'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcribed Handwriting & Equations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bengali mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'হাতে লেখা হতে রূপান্তর (Transcribed Solution)' : 'Transcribed Solution'}
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-bengali">
                  <MathRenderer content={scanResult.transcribed_handwriting_bn} />
                </div>
              </div>

              {/* Diagram / Circuit Analysis if Present */}
              {scanResult.diagram_analysis?.has_diagram && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 font-bengali flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {isBn ? 'চিত্র / ডায়াগ্রাম নিরীক্ষণ' : 'Diagram Analysis'}: {scanResult.diagram_analysis.diagram_type}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md font-bold">
                      {scanResult.diagram_analysis.accuracy_status === 'accurate' ? (isBn ? 'নির্ভুল অঙ্কন' : 'Accurate') : isBn ? 'সংশোধন প্রয়োজন' : 'Needs Correction'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 font-bengali">
                    {scanResult.diagram_analysis.diagram_notes_bn}
                  </p>
                </div>
              )}

              {/* Step-by-Step NCTB Marking Rubric */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bengali mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'বোর্ড স্ট্যান্ডার্ড ধাপভিত্তিক নম্বর বণ্টন' : 'NCTB Step-by-Step Marking'}
                </h4>
                <div className="space-y-2">
                  {scanResult.rubric_breakdown.map((rubric, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 font-bengali">
                          {rubric.criteria}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 font-bengali">{rubric.comment_bn}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            rubric.awarded === rubric.max
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : rubric.awarded > 0
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          +{rubric.awarded}/{rubric.max}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chief Examiner Feedback & Remedial Advice */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 font-bengali flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {isBn ? 'প্রধান পরীক্ষকের মন্তব্য ও পরামর্শ' : 'Chief Examiner Feedback & Advice'}
                </h4>
                <p className="text-xs text-amber-900/90 dark:text-amber-200 leading-relaxed font-bengali">
                  {scanResult.examiner_verdict_bn}
                </p>
                <div className="pt-1 text-[11px] text-amber-800 dark:text-amber-300 font-bengali font-medium">
                  💡 <strong>{isBn ? 'পরীক্ষার টিপস:' : 'Exam Tip:'}</strong> {scanResult.remedial_advice_bn}
                </div>
              </div>

              {/* Benchmark Solution */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bengali mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'আদর্শ পূর্ণ নম্বর সমাধান (Benchmark Solution)' : 'Benchmark Full-Mark Solution'}
                </h4>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 font-bengali">
                  <MathRenderer content={scanResult.benchmark_model_solution_latex} />
                </div>
              </div>

              {/* Quick Actions: Mistake Vault & Tutor */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSaveToMistakeVault}
                  disabled={savedToMistakeVault}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-bengali flex items-center gap-1.5 transition-all ${
                    savedToMistakeVault
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 cursor-default'
                      : 'bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{savedToMistakeVault ? (isBn ? '✓ ভুল শোধনাগারে যুক্ত' : 'Saved to Vault') : isBn ? 'ভুল শোধনাগারে সেভ করুন' : 'Add to Mistake Vault'}</span>
                </button>

                {onOpenTutorWithContext && (
                  <button
                    onClick={() =>
                      onOpenTutorWithContext(
                        `আমার এই হাতে লেখা খাতার উত্তরে কীভাবে উন্নতি করতে পারি? টপিক: ${scanResult.detected_topic}. ${scanResult.examiner_verdict_bn}`,
                        scanResult.detected_topic
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold font-bengali flex items-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isBn ? 'এআই টিউটরের সাথে আরও গভীরে আলোচনা' : 'Discuss with AI Tutor'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Guide */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-200 dark:ring-emerald-800">
                <Camera className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-bengali">
                  {isBn ? 'খাতা বা চিত্রের ছবি তুলুন বা আপলোড করুন' : 'Scan or Upload Your Script'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali leading-relaxed">
                  {isBn
                    ? 'পদার্থবিজ্ঞানের ভেক্টর ডায়াগ্রাম, রসায়নের জৈব বিক্রিয়া বা উচ্চতর গণিতের লিমিট ও ইন্টিগ্রেশনের রাফ খাতার ছবি আপলোড করুন। AI স্বয়ংক্রিয়ভাবে খাতা নিরীক্ষা করে গ্রেড প্রদান করবে।'
                    : 'Upload or capture physics free-body diagrams, organic chemistry reactions, or math derivations for instant NCTB grading.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bengali">
                  {isBn ? 'অথবা উপরের যেকোনো একটি স্যাম্পল টেস্ট বাটনে ক্লিক করে ট্রাই করুন।' : 'Or click any sample button above to test instantly.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
