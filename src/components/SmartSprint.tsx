import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { SmartStudySprint, MistakePattern, UserConceptMastery, AppSettings } from '../types';
import { CANONICAL_CHAPTERS, CANONICAL_CONCEPTS, CANONICAL_SUBJECTS } from '../data/canonicalTaxonomy';
import { loadStudySprints, saveStudySprints } from '../services/storage';
import { Language } from '../services/i18n';

interface SmartSprintProps {
  selectedSubjectId: string;
  mistakes: MistakePattern[];
  masteryMap: Record<string, UserConceptMastery>;
  onStartSprintTask: (conceptId: string) => void;
  settings?: AppSettings;
}

export const SmartSprint: React.FC<SmartSprintProps> = ({
  selectedSubjectId,
  mistakes,
  masteryMap,
  onStartSprintTask,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';
  const [selectedChapterId, setSelectedChapterId] = useState('phy_1_ch4');
  const [allocatedMinutes, setAllocatedMinutes] = useState<number>(90);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSprint, setActiveSprint] = useState<SmartStudySprint | null>(null);

  // Available chapters
  const availableChapters = CANONICAL_CHAPTERS.filter((ch) => ch.paper_id.startsWith(selectedSubjectId));
  const currentChapter = CANONICAL_CHAPTERS.find((ch) => ch.id === selectedChapterId) || availableChapters[0];
  const currentSubject = CANONICAL_SUBJECTS.find((s) => s.id === selectedSubjectId);

  const handleGenerateSprint = async () => {
    setIsGenerating(true);

    const chapterConcepts = CANONICAL_CONCEPTS.filter((c) => c.chapter_id === selectedChapterId);
    const weakConcepts = chapterConcepts.filter(
      (c) =>
        masteryMap[c.id]?.mastery_state === 'weak_struggling' ||
        mistakes.some((m) => m.concept_id === c.id && !m.is_rectified)
    );

    try {
      const res = await fetch('/api/gemini/generate-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterName: currentChapter?.name_bn,
          subjectName: currentSubject?.name_bn,
          totalMinutes: allocatedMinutes,
          weakConcepts: weakConcepts.map((w) => w.name_bn),
          highPriorityConcepts: chapterConcepts.slice(0, 3).map((c) => c.name_bn),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const sprintData = data.data;
        const newSprint: SmartStudySprint = {
          id: `sprint_${Date.now()}`,
          chapter_id: selectedChapterId,
          chapter_name_bn: currentChapter?.name_bn || 'অধ্যায়',
          subject_id: selectedSubjectId,
          total_allocated_minutes: allocatedMinutes,
          archetype: sprintData.archetype || 'balanced_sprint',
          stages: sprintData.stages.map((st: any, i: number) => ({
            id: `st_${Date.now()}_${i}`,
            stage_name: st.stage_name,
            stage_name_bn: st.stage_name_bn,
            duration_minutes: st.duration_minutes,
            activity_type: st.activity_type || 'concept_refinement',
            concept_ids: chapterConcepts.map((c) => c.id),
            description: st.description,
            is_completed: false,
          })),
          created_at: new Date().toISOString(),
        };

        setActiveSprint(newSprint);
        const existing = loadStudySprints();
        saveStudySprints([newSprint, ...existing]);
      }
    } catch (err) {
      console.error('Sprint error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStageComplete = (stageId: string) => {
    if (!activeSprint) return;
    const updatedStages = activeSprint.stages.map((st) =>
      st.id === stageId ? { ...st, is_completed: !st.is_completed } : st
    );
    setActiveSprint({ ...activeSprint, stages: updatedStages });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
            Time-Boxed Focus
          </span>
          <span className="text-xs text-slate-500 font-bengali">
            কম সময়ে সর্বোচ্চ ফলাফলের জন্য বৈজ্ঞানিক স্প্রিন্ট রুটিন
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 font-bengali tracking-tight">
          এইচএসসি স্মার্ট স্টাডি স্প্রিন্ট প্ল্যানার
        </h1>
      </div>

      {/* Sprint Configurator Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chapter Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 font-bengali mb-1.5">
              টার্গেট অধ্যায় নির্বাচন:
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bengali text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              {availableChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.chapter_number}ম অধ্যায়: {ch.name_bn}
                </option>
              ))}
            </select>
          </div>

          {/* Time Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 font-bengali mb-1.5">
              হাতে থাকা মোট সময়:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[45, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setAllocatedMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                    allocatedMinutes === mins
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mins} মিনিট
                </button>
              ))}
            </div>
          </div>

          {/* Action Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateSprint}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 font-bengali"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>স্প্রিন্ট তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>স্প্রিন্ট প্ল্যান তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Sprint Schedule Card */}
      {activeSprint && (
        <div className="glass-panel rounded-2xl space-y-4 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 font-bengali">
                  সক্রিয় স্প্রিন্ট সেশন
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {activeSprint.total_allocated_minutes} মিনিট
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-bengali mt-1">
                {activeSprint.chapter_name_bn}
              </h2>
            </div>

            <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              সম্পন্ন ধাপ: {activeSprint.stages.filter((s) => s.is_completed).length} / {activeSprint.stages.length}
            </div>
          </div>

          {/* Timeline Stages */}
          <div className="space-y-3 pt-2">
            {activeSprint.stages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                  stage.is_completed
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200/80 text-slate-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleStageComplete(stage.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {stage.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 font-bengali text-sm">
                        ধাপ {idx + 1}: {stage.stage_name_bn}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] font-bold rounded-md border border-slate-200">
                        ⏱️ {stage.duration_minutes} মিনিট
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bengali mt-1 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onStartSprintTask(stage.concept_ids[0])}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold font-bengali transition-colors flex items-center gap-1 border border-emerald-200"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শুরু করুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
