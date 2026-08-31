import React from 'react';
import {
  Compass,
  FileQuestion,
  GraduationCap,
  UploadCloud,
  AlertOctagon,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Timer,
  FileDown,
  User,
  Settings,
  Sun,
  Moon,
  Camera,
  Building2,
  Globe,
} from 'lucide-react';
import { CANONICAL_SUBJECTS } from '../data/canonicalTaxonomy';
import { UserProfile, AppSettings } from '../types';

export type NavTab =
  | 'dashboard'
  | 'exam'
  | 'scanner'
  | 'colleges'
  | 'worksheet'
  | 'tutor'
  | 'questions'
  | 'mistakes'
  | 'sprint'
  | 'ingest'
  | 'taxonomy'
  | 'profile'
  | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  activeMistakesCount: number;
  onOpenGuide: () => void;
  profile?: UserProfile;
  settings?: AppSettings;
  onToggleTheme?: () => void;
  onToggleLanguage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedSubjectId,
  setSelectedSubjectId,
  activeMistakesCount,
  onOpenGuide,
  profile,
  settings,
  onToggleTheme,
  onToggleLanguage,
}) => {
  const isBn = settings?.language !== 'en';
  const isDark = settings?.theme === 'dark';

  const tabs = [
    { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: Compass },
    { id: 'scanner' as NavTab, label: 'খাতা ও চিত্র স্ক্যানার', labelEn: 'Paper Scanner', icon: Camera, highlight: true },
    { id: 'colleges' as NavTab, label: 'টপ কলেজ টেস্ট পেপার', labelEn: 'Top Colleges', icon: Building2 },
    { id: 'exam' as NavTab, label: 'মক টেস্ট সিমুলেটর', labelEn: 'Exam Simulator', icon: Timer },
    { id: 'worksheet' as NavTab, label: 'ওয়ার্কশিট ও PDF', labelEn: 'Worksheet PDF', icon: FileDown },
    { id: 'tutor' as NavTab, label: 'এআই টিউটর', labelEn: 'AI Tutor', icon: GraduationCap },
    { id: 'questions' as NavTab, label: 'প্রশ্ন ভান্ডার', labelEn: 'Questions', icon: FileQuestion },
    {
      id: 'mistakes' as NavTab,
      label: 'ভুল শোধনাগার',
      labelEn: 'Mistake Vault',
      icon: AlertOctagon,
      badge: activeMistakesCount > 0 ? activeMistakesCount : undefined,
    },
    { id: 'sprint' as NavTab, label: 'স্টাডি স্প্রিন্ট', labelEn: 'Smart Sprint', icon: Clock },
    { id: 'ingest' as NavTab, label: 'প্রশ্ন ইনজেকশন', labelEn: 'Ingest & OCR', icon: UploadCloud },
    { id: 'taxonomy' as NavTab, label: 'সিলেবাস ও সূত্র', labelEn: 'Taxonomy', icon: Layers },
    { id: 'profile' as NavTab, label: 'প্রোফাইল', labelEn: 'Profile', icon: User },
    { id: 'settings' as NavTab, label: 'সেটিংস', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200 print:hidden">
      {/* Top Banner & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-100 dark:border-slate-800/60">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold ring-1 ring-white/50">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 dark:from-white dark:via-slate-200 dark:to-emerald-300 bg-clip-text text-transparent">
                  HSC Study Intelligence
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-bold">
                  NCTB Science
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                {isBn ? 'তথ্যভিত্তিক অ্যানালাইসিস, ডাউট সলভ ও খাতা মূল্যায়ন' : 'Evidence-grounded learning, exam simulation & analysis'}
              </p>
            </div>
          </div>

          {/* Right Action: Language Switcher, Subject Switcher, Guide, Theme & Profile */}
          <div className="flex items-center space-x-2">
            {/* Subject Switcher Pill Tabs */}
            <div className="hidden xl:flex items-center bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-x-1 shadow-inner">
              {CANONICAL_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-emerald-300 shadow-sm border border-slate-200/80 dark:border-slate-700 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="font-bengali">{isBn ? sub.name_bn : sub.name_en}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct Language Switcher Button */}
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold font-bengali"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isBn ? 'বা / EN' : 'EN / বা'}</span>
              </button>
            )}

            {/* Quick Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Quick Profile Pill */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                activeTab === 'profile'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bengali max-w-[100px] truncate">{profile?.name || (isBn ? 'প্রোফাইল' : 'Profile')}</span>
            </button>

            {/* Guide & Help Button */}
            <button
              onClick={onOpenGuide}
              className="px-3 py-1.5 bg-emerald-50/90 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-xl text-xs font-bold font-bengali transition-all duration-200 flex items-center gap-1.5 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{isBn ? 'সহজ নির্দেশিকা' : 'Guide'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Cleanly scrollable with active indicator) */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-2 space-x-1.5 sm:space-x-2 scroll-smooth">
          {/* Quick Subject Badge on Mobile */}
          <div className="xl:hidden flex items-center shrink-0 pr-1 mr-1 border-r border-slate-200 dark:border-slate-800">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bengali font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {CANONICAL_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {isBn ? s.name_bn : s.name_en}
                </option>
              ))}
            </select>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-slate-950 dark:bg-emerald-600 text-white shadow-md font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="font-bengali text-xs sm:text-sm">{isBn ? tab.label : tab.labelEn}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white font-mono text-[10px] font-bold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

