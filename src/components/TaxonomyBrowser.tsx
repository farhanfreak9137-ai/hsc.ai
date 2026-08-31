import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {
  CANONICAL_SUBJECTS,
  CANONICAL_PAPERS,
  CANONICAL_CHAPTERS,
  CANONICAL_CONCEPTS,
  CANONICAL_VARIANTS,
  CANONICAL_ARCHETYPES,
} from '../data/canonicalTaxonomy';
import { loadUserMastery } from '../services/storage';
import { MathRenderer } from './MathRenderer';
import { AppSettings } from '../types';
import { Language } from '../services/i18n';

interface TaxonomyBrowserProps {
  selectedSubjectId: string;
  onSelectConceptToStudy: (conceptId: string) => void;
  settings?: AppSettings;
}

export const TaxonomyBrowser: React.FC<TaxonomyBrowserProps> = ({
  selectedSubjectId,
  onSelectConceptToStudy,
  settings,
}) => {
  const lang: Language = settings?.language === 'en' ? 'en' : 'bn';
  const isBn = lang === 'bn';
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    phy_1_ch4: true,
  });

  const masteryMap = loadUserMastery();

  const currentSubject =
    CANONICAL_SUBJECTS.find((s) => s.id === selectedSubjectId) || CANONICAL_SUBJECTS[0];

  const subjectPapers = CANONICAL_PAPERS.filter((p) => p.subject_id === selectedSubjectId);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl space-y-1 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
            NCTB Science Taxonomy & Scenario Archetypes Matrix
          </span>
          <span className="text-xs text-slate-500 font-bengali">
            শাখা, পত্র, অধ্যায়, বাস্তব সিনারিও আর্কেটাইপ ও কগনিটিভ ডাইভার্সিটি ম্যাপিং
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 font-bengali">
          {currentSubject.name_bn}: সম্পূর্ণ পাঠ্যক্রম ও সিনারিও আর্কেটাইপ আর্কিটেকচার
        </h1>
      </div>

      {/* Chapters Accordion List */}
      <div className="space-y-4">
        {subjectPapers.map((paper) => {
          const paperChapters = CANONICAL_CHAPTERS.filter((c) => c.paper_id === paper.id);

          return (
            <div key={paper.id} className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-slate-900 font-bengali text-sm">{paper.name_bn}</h3>
                <span className="text-xs text-slate-500 font-mono">({paper.name_en})</span>
              </div>

              <div className="space-y-3">
                {paperChapters.map((chapter) => {
                  const isExpanded = !!expandedChapters[chapter.id];
                  const concepts = CANONICAL_CONCEPTS.filter((c) => c.chapter_id === chapter.id);

                  return (
                    <div
                      key={chapter.id}
                      className="glass-panel rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                            {chapter.chapter_number}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 font-bengali text-sm sm:text-base">
                              {chapter.chapter_number}ম অধ্যায়: {chapter.name_bn}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">{chapter.name_en}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="hidden sm:inline px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-mono">
                            গুরুত্ব সূচক: {chapter.syllabus_weight}x
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-mono font-semibold border border-emerald-200">
                            {chapter.total_board_questions_analyzed} টি বোর্ড প্রশ্ন
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Topics & Concepts Body */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 bg-slate-50/60 border-t border-slate-200/80 space-y-4">
                          {concepts.map((concept) => {
                            const variants = CANONICAL_VARIANTS.filter((v) => v.concept_id === concept.id);
                            const archetypes = CANONICAL_ARCHETYPES.filter((a) => a.concept_id === concept.id);
                            const userMastery = masteryMap[concept.id];
                            const solvedArchetypes = userMastery?.solved_archetype_ids || [];

                            return (
                              <div
                                key={concept.id}
                                className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 shadow-xs"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-slate-900 font-bengali text-sm">
                                        {concept.name_bn}
                                      </h4>
                                      {userMastery && (
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                                          {userMastery.mastery_state}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono">{concept.name_en}</p>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono border border-slate-200">
                                      বোর্ডে এসেছে {concept.board_appearance_count} বার
                                    </span>
                                    <button
                                      onClick={() => onSelectConceptToStudy(concept.id)}
                                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold font-bengali transition-colors flex items-center gap-1 border border-emerald-200"
                                    >
                                      <span>পড়ুন</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Core Principle */}
                                <div className="text-xs text-slate-600 font-bengali leading-relaxed">
                                  <strong className="text-slate-900">মূল তত্ত্ব: </strong>
                                  {concept.core_principle_bn}
                                </div>

                                {/* LaTeX Formula */}
                                {concept.formula_latex && (
                                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-math text-slate-900 text-xs">
                                    <MathRenderer content={`$${concept.formula_latex}$`} />
                                  </div>
                                )}

                                {/* Scenario Archetype Matrix (Milestone 2) */}
                                {archetypes.length > 0 && (
                                  <div className="space-y-1.5 pt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-bengali flex items-center gap-1">
                                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                                        বাস্তব সিনারিও আর্কেটাইপ ম্যাট্রিক্স ({solvedArchetypes.length}/{archetypes.length} অর্জিত):
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {archetypes.map((arch) => {
                                        const isSolved = solvedArchetypes.includes(arch.id);
                                        return (
                                          <div
                                            key={arch.id}
                                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                                              isSolved
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                : 'bg-slate-50 border-slate-200 text-slate-800'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between font-bold text-[11px]">
                                              <span className="text-slate-900">{arch.title_bn}</span>
                                              {isSolved ? (
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
                                                  <CheckCircle2 className="w-3 h-3" /> Solved
                                                </span>
                                              ) : (
                                                <span className="text-[10px] text-slate-500 font-mono uppercase">
                                                  {arch.cognitive_dimension}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-slate-600 text-[11px] font-bengali leading-tight">
                                              {arch.description_bn}
                                            </div>
                                            {arch.key_variables && arch.key_variables.length > 0 && (
                                              <div className="text-[10px] text-emerald-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 mt-1">
                                                <strong>চলক: </strong>
                                                {arch.key_variables.join(', ')}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Fallback Question Variants */}
                                {variants.length > 0 && archetypes.length === 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-bengali">
                                      পরীক্ষায় আসা প্রশ্ন ভ্যারিয়েন্ট:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {variants.map((v) => (
                                        <div
                                          key={v.id}
                                          className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                                        >
                                          <div className="font-bold text-slate-800 font-mono text-[11px]">
                                            {v.name}
                                          </div>
                                          <div className="text-slate-500 text-[11px] font-bengali leading-tight">
                                            {v.description}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
