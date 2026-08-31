import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldAlert,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { MistakePattern, AnswerEvaluationResult, AppSettings } from '../types';
import { CANONICAL_CONCEPTS } from '../data/canonicalTaxonomy';
import { markMistakeRectified, recordStudentAttempt } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { Language } from '../services/i18n';

interface MistakeVaultProps {
  mistakes: MistakePattern[];
  selectedSubjectId: string;
  onRefreshMistakes: () => void;
  onSendToTutor: (conceptId: string) => void;
  settings?: AppSettings;
}

export const MistakeVault: React.FC<MistakeVaultProps> = ({
  mistakes,
  selectedSubjectId,
  onRefreshMistakes,
  onSendToTutor,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';
  const [filterState, setFilterState] = useState<'active' | 'rectified'>('active');
  const [selectedMistakeForRemedial, setSelectedMistakeForRemedial] = useState<MistakePattern | null>(null);
  const [remedialVariant, setRemedialVariant] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [studentTestAnswer, setStudentTestAnswer] = useState('');
  const [testResult, setTestResult] = useState<{
    isCorrect: boolean;
    isUncertain?: boolean;
    feedback: string;
    scoreObtained?: number;
    maxScore?: number;
    correctiveAdvice?: string;
    evaluation?: AnswerEvaluationResult;
  } | null>(null);

  // Subject filtered mistakes
  const subjectMistakes = mistakes.filter((m) => m.subject_id === selectedSubjectId);
  const displayedMistakes = subjectMistakes.filter((m) =>
    filterState === 'active' ? !m.is_rectified : m.is_rectified
  );

  const handleStartRemedial = async (mistake: MistakePattern) => {
    setSelectedMistakeForRemedial(mistake);
    setRemedialVariant(null);
    setTestResult(null);
    setStudentTestAnswer('');
    setIsGenerating(true);

    const conceptObj = CANONICAL_CONCEPTS.find((c) => c.id === mistake.concept_id);

    try {
      const res = await fetch('/api/gemini/generate-remedial-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptName: mistake.concept_name_bn,
          formulaLatex: conceptObj?.formula_latex,
          mistakeTitle: mistake.signature_title,
          rootCause: mistake.root_cause_explanation,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setRemedialVariant(data.data);
      }
    } catch (err) {
      console.error('Failed to generate remedial variant:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyRemedial = async () => {
    if (!studentTestAnswer.trim() || !selectedMistakeForRemedial || !remedialVariant) return;

    setIsEvaluating(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionStem: remedialVariant.stem_text,
          subpartPrompt: remedialVariant.prompt_question || 'গাণিতিক সমাধানপূর্বক মান ও একক নির্ণয় করো।',
          maxMarks: 3,
          officialSolutionLatex: remedialVariant.full_solution_latex,
          studentAnswerText: studentTestAnswer,
          conceptName: selectedMistakeForRemedial.concept_name_bn,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const evalData: AnswerEvaluationResult = data.data;
        const scoreRatio = evalData.max_score > 0 ? evalData.score_obtained / evalData.max_score : 0;
        const confidence = evalData.evaluation_confidence ?? 0.85;

        // Check if confidence is too low to make a conclusive rectification decision
        if (confidence < 0.60) {
          setTestResult({
            isCorrect: false,
            isUncertain: true,
            scoreObtained: evalData.score_obtained,
            maxScore: evalData.max_score,
            feedback: 'মূল্যায়ন অনিশ্চিত: আপনার লেখার সমীকরণ বা যুক্তি পুরোপুরি স্পষ্ট নয়। অনুগ্রহ করে ধাপগুলো আরও স্পষ্ট করে লিখে পুনরায় জমা দিন।',
            correctiveAdvice: evalData.corrective_advice_bn,
            evaluation: evalData,
          });
          return;
        }

        // Passed official evaluation
        if (evalData.is_correct && scoreRatio >= 0.70) {
          // Record attempt to mastery engine
          recordStudentAttempt({
            user_id: 'current_user',
            question_id: `remedial_${selectedMistakeForRemedial.id}`,
            concept_id: selectedMistakeForRemedial.concept_id,
            attempt_type: 'cq_practice',
            student_answer_text: studentTestAnswer,
            is_correct: true,
            score_obtained: evalData.score_obtained,
            max_score: evalData.max_score,
            time_spent_seconds: 120,
            evaluation: evalData,
          });

          // Mark mistake as rectified
          markMistakeRectified(selectedMistakeForRemedial.id);

          setTestResult({
            isCorrect: true,
            scoreObtained: evalData.score_obtained,
            maxScore: evalData.max_score,
            feedback: `অভিনন্দন! আপনার সমাধান শতভাগ নির্ভুল হয়েছে (${evalData.score_obtained}/${evalData.max_score})। ভ্রান্তিটি শোধিত তালিকায় যুক্ত হলো!`,
            correctiveAdvice: evalData.corrective_advice_bn,
            evaluation: evalData,
          });

          // Trigger state refresh for Parent App & Dashboard
          onRefreshMistakes();
        } else {
          // Failed remedial evaluation - mistake remains active
          recordStudentAttempt({
            user_id: 'current_user',
            question_id: `remedial_${selectedMistakeForRemedial.id}`,
            concept_id: selectedMistakeForRemedial.concept_id,
            attempt_type: 'cq_practice',
            student_answer_text: studentTestAnswer,
            is_correct: false,
            score_obtained: evalData.score_obtained,
            max_score: evalData.max_score,
            time_spent_seconds: 120,
            evaluation: evalData,
          });

          setTestResult({
            isCorrect: false,
            scoreObtained: evalData.score_obtained,
            maxScore: evalData.max_score,
            feedback: evalData.evaluation_summary || 'সমাধানে ত্রুটি পাওয়া গেছে। নিচের সংশোধন নির্দেশনা দেখে আবার চেষ্টা করুন।',
            correctiveAdvice: evalData.corrective_advice_bn,
            evaluation: evalData,
          });

          onRefreshMistakes();
        }
      } else {
        setTestResult({
          isCorrect: false,
          feedback: 'মূল্যায়নে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার উত্তর জমা দিন।',
        });
      }
    } catch (err) {
      console.error('Error verifying remedial variant:', err);
      setTestResult({
        isCorrect: false,
        feedback: 'সার্ভারের সাথে সংযোগে বিঘ্ন ঘটেছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Vault Banner */}
      <div className="glass-panel p-6 rounded-2xl text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg border border-rose-200 uppercase tracking-wider flex items-center gap-1.5 font-bengali">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              ভুল শোধনাগার (Rectification Vault)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-bengali text-slate-900 tracking-tight">
            ভ্রান্তি নিরসন ও আইসোমরফিক ভ্যারিয়েন্ট অনুশীলন
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bengali leading-relaxed">
            একটি ভুল বারবার করার চেয়ে একবার মূল কারণ বুঝে অনুরূপ নতুন ভ্যারিয়েন্টে সমাধান করা ১০ গুণ বেশি কার্যকর।
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setFilterState('active')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
              filterState === 'active'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>সক্রিয় ভুলসমূহ ({subjectMistakes.filter((m) => !m.is_rectified).length})</span>
          </button>
          <button
            onClick={() => setFilterState('rectified')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-bengali transition-all flex items-center gap-1.5 ${
              filterState === 'rectified'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>শোধিত ভ্রান্তি ({subjectMistakes.filter((m) => m.is_rectified).length})</span>
          </button>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {displayedMistakes.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-bengali">
              {filterState === 'active' ? 'কোনো সক্রিয় ভুল তালিকাভুক্ত নেই!' : 'এখনো কোনো ভুল শোধিত তালিকায় আসেনি।'}
            </h3>
            <p className="text-xs text-slate-500 font-bengali mt-1">
              যখনই আপনি টিউটরে কোনো ভুল করবেন, সিস্টেম তা স্বয়ংক্রিয়ভাবে এখানে চিহ্নিত করবে।
            </p>
          </div>
        ) : (
          displayedMistakes.map((m) => {
            return (
              <div
                key={m.id}
                className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        m.is_rectified
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {m.is_rectified ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 font-bengali text-sm sm:text-base">
                        {m.concept_name_bn}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">{m.signature_title}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-mono border border-slate-200">
                      পৌনঃপুনিকতা: <strong className="text-slate-900">{m.occurrence_count} বার</strong>
                    </span>
                    {!m.is_rectified && (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-bengali font-bold">
                        রিভিউ বাকি
                      </span>
                    )}
                  </div>
                </div>

                {/* Root Cause Diagnosis */}
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm font-bengali text-slate-700 leading-relaxed border border-slate-200/80">
                  <strong className="text-slate-900">ভুলের মূল কারণ ও প্রতিষেধক: </strong>
                  {m.root_cause_explanation}
                </div>

                {/* Remedial Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-bengali">
                    <Clock className="w-3.5 h-3.5" />
                    <span>সর্বশেষ ঘটেছে: {new Date(m.last_occurred_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSendToTutor(m.concept_id)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors font-bengali border border-slate-200"
                    >
                      কনসেপ্ট টিউটরে যান
                    </button>
                    {!m.is_rectified && (
                      <button
                        onClick={() => handleStartRemedial(m)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs font-bengali transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>সংশোধনী ভ্যারিয়েন্ট টেস্ট দিন</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Remedial Test Modal / Drawer */}
      {selectedMistakeForRemedial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700 font-bengali uppercase tracking-wider">
                  আইসোমরফিক সংশোধনী টেস্ট
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-bengali">
                  {selectedMistakeForRemedial.concept_name_bn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMistakeForRemedial(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {isGenerating ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-sm font-bengali text-slate-600">
                  আপনার দুর্বলতার ওপর ভিত্তি করে নতুন টেস্ট প্রবলেম তৈরি হচ্ছে...
                </p>
              </div>
            ) : remedialVariant ? (
              <div className="space-y-4">
                {/* Trap Warning */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bengali">
                  <strong>⚠️ সতর্কবার্তা: </strong>
                  {remedialVariant.trap_warning_bn}
                </div>

                {/* Problem Stem */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bengali text-sm space-y-2 text-slate-800">
                  <div className="font-bold text-slate-900">{remedialVariant.title}</div>
                  <MathRenderer content={remedialVariant.stem_text} />
                  {remedialVariant.prompt_question && (
                    <div className="font-semibold text-slate-900 pt-2 border-t border-slate-200">
                      <MathRenderer content={remedialVariant.prompt_question} />
                    </div>
                  )}
                </div>

                {/* Student Answer Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 font-bengali">
                    আপনার গাণিতিক ধাপ, সমীকরণ ও চূড়ান্ত উত্তর লিখুন:
                  </label>
                  <textarea
                    value={studentTestAnswer}
                    onChange={(e) => setStudentTestAnswer(e.target.value)}
                    rows={4}
                    placeholder="ধাপ ১: সূত্র... ধাপ ২: মান বসিয়ে... এককসহ উত্তর..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bengali text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>

                {/* Result Feedback with Diagnostic Details */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm font-bengali space-y-2.5 ${
                      testResult.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : testResult.isUncertain
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {testResult.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : testResult.isUncertain ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-bold">{testResult.feedback}</div>
                        {testResult.correctiveAdvice && (
                          <div className="text-xs opacity-90">
                            <strong>সংশোধন টিপস: </strong>
                            {testResult.correctiveAdvice}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Mark Breakdown if available */}
                    {testResult.evaluation?.step_evaluations && testResult.evaluation.step_evaluations.length > 0 && (
                      <div className="pt-2 border-t border-current/10 space-y-1.5">
                        <div className="font-bold text-xs uppercase tracking-wide">ধাপভিত্তিক মূল্যায়ন:</div>
                        <div className="space-y-1">
                          {testResult.evaluation.step_evaluations.map((st, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-lg border border-slate-200">
                              <span className="text-slate-800">{st.description}</span>
                              <span className="font-mono font-bold text-emerald-700">
                                {st.score_obtained} / {st.max_score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setSelectedMistakeForRemedial(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors font-bengali border border-slate-200"
                  >
                    {testResult?.isCorrect ? 'সম্পন্ন' : 'বন্ধ করুন'}
                  </button>
                  <button
                    onClick={handleVerifyRemedial}
                    disabled={isEvaluating || !studentTestAnswer.trim()}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition-all flex items-center gap-1.5 ${
                      isEvaluating || !studentTestAnswer.trim()
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold shadow-sm'
                    }`}
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>মূল্যায়ন যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>অফিসিয়াল উত্তর যাচাই ও শোধনাগার হালনাগাদ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
