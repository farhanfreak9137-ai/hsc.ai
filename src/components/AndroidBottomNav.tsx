import React, { useState } from 'react';
import {
  Compass,
  FileQuestion,
  GraduationCap,
  UploadCloud,
  AlertOctagon,
  Clock,
  Layers,
  FileDown,
  Timer,
  User,
  Settings,
  Camera,
  Building2,
  Grid,
  X,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavTab } from './Navbar';
import { CANONICAL_SUBJECTS } from '../data/canonicalTaxonomy';
import { AppSettings } from '../types';

interface AndroidBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeMistakesCount: number;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  settings?: AppSettings;
  onOpenQuickAction?: (action: 'scan' | 'tutor' | 'exam') => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeMistakesCount,
  selectedSubjectId,
  setSelectedSubjectId,
  settings,
  onOpenQuickAction,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isBn = settings?.language !== 'en';

  // 4 Primary Bottom Destinations for single-thumb Android reachability
  const primaryTabs = [
    {
      id: 'dashboard' as NavTab,
      labelBn: 'আজকের লক্ষ্য',
      labelEn: 'Today',
      icon: Compass,
    },
    {
      id: 'questions' as NavTab,
      labelBn: 'অনুশীলন হাব',
      labelEn: 'Practice',
      icon: FileQuestion,
    },
    {
      id: 'scanner' as NavTab,
      labelBn: 'এআই স্ক্যানার',
      labelEn: 'AI Scan',
      icon: Camera,
      isCenterAction: true,
    },
    {
      id: 'mistakes' as NavTab,
      labelBn: 'ভুল শোধনাগার',
      labelEn: 'Mistakes',
      icon: AlertOctagon,
      badge: activeMistakesCount > 0 ? activeMistakesCount : undefined,
    },
  ];

  // All remaining features grouped clearly in the slide-up Android App Drawer
  const secondaryFeatures = [
    {
      id: 'colleges' as NavTab,
      titleBn: 'টপ কলেজ টেস্ট পেপার',
      titleEn: 'Top Colleges Test Papers',
      descBn: 'নটর ডেম, রাজউক, ভিকারুননিসা ও ক্যাডেট কলেজ',
      descEn: 'Notre Dame, Rajuk, Viqarunnisa & Cadet Colleges',
      icon: Building2,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      id: 'exam' as NavTab,
      titleBn: 'মক টেস্ট সিমুলেটর',
      titleEn: 'Exam Simulator',
      descBn: 'সময়াবদ্ধ পূর্ণাঙ্গ বোর্ড CQ ও MCQ পরীক্ষা',
      descEn: 'Timed board standard CQ & MCQ simulations',
      icon: Timer,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'tutor' as NavTab,
      titleBn: 'সক্রেটিক এআই টিউটর',
      titleEn: 'Grounded Socratic Tutor',
      descBn: 'স্টেপ-বাই-স্টেপ প্রশ্ন সমাধান ও সূত্র ব্যাখ্যা',
      descEn: 'Step-by-step problem solver & formula explanations',
      icon: GraduationCap,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    {
      id: 'worksheet' as NavTab,
      titleBn: 'ওয়ার্কশিট ও PDF তৈরি',
      titleEn: 'PDF Worksheet Generator',
      descBn: 'প্রিন্টযোগ্য মডেল প্রশ্নপত্র ও রিভিশন শিট',
      descEn: 'Printable model test papers and revision sheets',
      icon: FileDown,
      color: 'from-cyan-500/20 to-sky-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'sprint' as NavTab,
      titleBn: 'স্মার্ট স্টাডি স্প্রিন্ট',
      titleEn: 'Smart Study Sprint',
      descBn: '৪৫ বা ৯০ মিনিটের হাই-ফোকাস সেশন প্ল্যান',
      descEn: '45/90 minute high-focus timed study sessions',
      icon: Clock,
      color: 'from-purple-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
    {
      id: 'taxonomy' as NavTab,
      titleBn: 'সিলেবাস ও সূত্র ভান্ডার',
      titleEn: 'Syllabus & Formulas',
      descBn: 'অধ্যায়ভিত্তিক এনসিটিবি টপিক ও ম্যাথ ফর্মুলা',
      descEn: 'Chapter-wise NCTB syllabus & formula database',
      icon: Layers,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30',
    },
    {
      id: 'ingest' as NavTab,
      titleBn: 'প্রশ্ন ইনজেকশন ও OCR',
      titleEn: 'Question Ingestion Studio',
      descBn: 'নতুন বোর্ড বা টেস্ট পেপারের প্রশ্ন যুক্ত করুন',
      descEn: 'Add new board or test paper questions with OCR',
      icon: UploadCloud,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    },
    {
      id: 'profile' as NavTab,
      titleBn: 'শিক্ষার্থী প্রোফাইল',
      titleEn: 'Student Profile',
      descBn: 'টার্গেট কলেজ, প্রস্তুতি লক্ষ্য ও পারফরম্যান্স স্ট্যাটস',
      descEn: 'Target colleges, goals and personal stats',
      icon: User,
      color: 'from-slate-500/20 to-slate-600/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
    },
    {
      id: 'settings' as NavTab,
      titleBn: 'অ্যাপ সেটিংস',
      titleEn: 'App Settings',
      descBn: 'থিম, ভাষা, ফ্রন্ট সাইজ ও অফলাইন ক্যাশ',
      descEn: 'Theme, language, font size & cache',
      icon: Settings,
      color: 'from-zinc-500/20 to-zinc-600/20 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
    },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
    // Smooth scroll to top when changing tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = ![
    'dashboard',
    'questions',
    'scanner',
    'mistakes',
  ].includes(activeTab);

  return (
    <>
      {/* Slide-Up Android App Drawer / More Hub Modal */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden animate-in fade-in">
          <div
            className="flex-1"
            onClick={() => setIsMoreMenuOpen(false)}
            aria-label="Close modal backdrop"
          />
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-bengali flex items-center gap-2">
                  <Grid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {isBn ? 'সকল ফিচার ও মডিউল' : 'All Features & Tools'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                  {isBn ? 'যেকোনো টুলে দ্রুত প্রবেশ করুন' : 'Tap any tool to open instantly'}
                </p>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subject Quick Selector in Drawer */}
            <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali block mb-2">
                {isBn ? 'বিষয় নির্বাচন করুন:' : 'Active Subject:'}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {CANONICAL_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`py-2 px-1.5 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm ring-2 ring-emerald-400/40'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs'
                      }`}
                    >
                      <span className="text-xs font-bengali block leading-tight truncate">
                        {isBn ? sub.name_bn.split(' ')[0] : sub.name_en.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of Features */}
            <div className="p-4 overflow-y-auto space-y-2.5 max-h-[55vh]">
              {secondaryFeatures.map((feat) => {
                const Icon = feat.icon;
                const isActive = activeTab === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => handleSelectTab(feat.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3.5 transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center shrink-0 border`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-sm font-bengali truncate ${
                            isActive
                              ? 'text-emerald-950 dark:text-emerald-200'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {isBn ? feat.titleBn : feat.titleEn}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali truncate mt-0.5">
                        {isBn ? feat.descBn : feat.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar (Thumb Friendly for Mobile & Android) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-2xl md:hidden pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* Tab 1: Today */}
          {(() => {
            const tab = primaryTabs[0];
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bengali tracking-tight mt-0.5 truncate w-full text-center">
                  {isBn ? tab.labelBn : tab.labelEn}
                </span>
              </button>
            );
          })()}

          {/* Tab 2: Practice */}
          {(() => {
            const tab = primaryTabs[1];
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bengali tracking-tight mt-0.5 truncate w-full text-center">
                  {isBn ? tab.labelBn : tab.labelEn}
                </span>
              </button>
            );
          })()}

          {/* Tab 3: Center Elevated Action (AI Scanner Hero Button) */}
          <div className="flex justify-center items-center relative -top-3">
            <button
              onClick={() => handleSelectTab('scanner')}
              title={isBn ? 'খাতা ও চিত্র স্ক্যান করুন' : 'Scan Answer Script'}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center ring-4 ring-white dark:ring-slate-900 active:scale-90 transition-transform"
            >
              <Camera className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-extrabold tracking-tighter text-slate-950">
                {isBn ? 'স্ক্যান' : 'SCAN'}
              </span>
            </button>
          </div>

          {/* Tab 4: Mistakes Vault */}
          {(() => {
            const tab = primaryTabs[3];
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all active:scale-95 relative ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-xl relative transition-all ${
                    isActive ? 'bg-rose-50 dark:bg-rose-950/60' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {activeMistakesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold font-mono flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                      {activeMistakesCount > 9 ? '9+' : activeMistakesCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bengali tracking-tight mt-0.5 truncate w-full text-center">
                  {isBn ? tab.labelBn : tab.labelEn}
                </span>
              </button>
            );
          })()}

          {/* Tab 5: More Hub Drawer Trigger */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center h-full py-1 px-1 transition-all active:scale-95 ${
              isMoreActive || isMoreMenuOpen
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isMoreActive || isMoreMenuOpen
                  ? 'bg-emerald-50 dark:bg-emerald-950/60'
                  : ''
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bengali tracking-tight mt-0.5 truncate w-full text-center flex items-center justify-center gap-0.5">
              {isBn ? 'আরও মেনু' : 'More'}
              <ChevronUp className="w-2.5 h-2.5 opacity-60" />
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
