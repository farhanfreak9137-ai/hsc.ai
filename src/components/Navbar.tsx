import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookText,
  Languages,
  Cpu,
  CheckCircle2,
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

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  phy: Atom,
  chem: FlaskConical,
  hmath: Calculator,
  bio: Dna,
  bangla: BookText,
  english: Languages,
  ict: Cpu,
};

const SUBJECT_COLORS: Record<string, { badge: string; text: string; bg: string }> = {
  phy: { badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30', text: 'text-cyan-600 dark:text-cyan-400', bg: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/40' },
  chem: { badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/40' },
  hmath: { badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400', bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40' },
  bio: { badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40' },
  bangla: { badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30', text: 'text-rose-600 dark:text-rose-400', bg: 'hover:bg-rose-50 dark:hover:bg-rose-950/40' },
  english: { badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30', text: 'text-sky-600 dark:text-sky-400', bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/40' },
  ict: { badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30', text: 'text-teal-600 dark:text-teal-400', bg: 'hover:bg-teal-50 dark:hover:bg-teal-950/40' },
};

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

  // Dropdown States
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  };

  const activeSubject = CANONICAL_SUBJECTS.find((s) => s.id === selectedSubjectId) || CANONICAL_SUBJECTS[0];
  const ActiveSubjectIcon = SUBJECT_ICONS[selectedSubjectId] || Atom;
  const activeSubjectColor = SUBJECT_COLORS[selectedSubjectId] || SUBJECT_COLORS.phy;

  // 3 Smart Hub Definitions
  const examHubItems = [
    { id: 'worksheet' as NavTab, titleBn: 'ওয়ার্কশিট ও PDF প্রিন্টার', titleEn: 'Worksheet & PDF Studio', descBn: 'বোর্ড স্ট্যান্ডার্ড এ৪ প্রশ্নপত্র ও নিখুঁত সমাধান প্রিন্ট', descEn: 'Generate official A4 question sheets & answer keys', icon: FileDown, highlight: true },
    { id: 'exam' as NavTab, titleBn: 'মক টেস্ট সিমুলেটর', titleEn: 'Exam Simulator', descBn: 'টাইমার ও ওএমআর বৃত্ত ভরাট সহ বাস্তব পরীক্ষা', descEn: 'Timed mock exams with OMR bubble sheets', icon: Timer },
    { id: 'colleges' as NavTab, titleBn: 'টপ কলেজ টেস্ট পেপার', titleEn: 'Top Colleges Test Papers', descBn: 'নটর ডেম, ঢাকা কলেজ, রাজউক মডেল পরীক্ষার প্রশ্ন', descEn: 'Notre Dame, Dhaka College, Rajuk Model papers', icon: Building2 },
  ];

  const questionHubItems = [
    { id: 'questions' as NavTab, titleBn: '৬২৬+ প্রশ্ন ব্যাংক ও সলিউশন', titleEn: 'Question Bank & Archive', descBn: 'বিগত বছরের বোর্ড প্রশ্ন, ফিল্টার ও ল্যাটেক্স কোড', descEn: '626+ past board questions with LaTeX formulas', icon: FileQuestion, highlight: true },
    { id: 'ingest' as NavTab, titleBn: 'প্রশ্ন ইনজেকশন ও OCR স্টুডিও', titleEn: 'Ingestion & OCR Studio', descBn: 'কাঁচা ছবি, পিডিএফ ও গাইড বই থেকে স্বয়ংক্রিয় ডিজিটাইজ', descEn: 'Auto-digitize question JPGs & textbook scans', icon: UploadCloud },
    { id: 'taxonomy' as NavTab, titleBn: 'সিলেবাস ও সূত্র ব্যাংক', titleEn: 'Syllabus & Formulas', descBn: 'NCTB অধ্যায়ভিত্তিক পূর্ণাঙ্গ ট্যাক্সোনমি ও হাই-ইল্ড সূত্র', descEn: 'NCTB chapter breakdown & high-yield formulas', icon: Layers },
  ];

  const aiHubItems = [
    { id: 'tutor' as NavTab, titleBn: 'সক্রেটিক এআই টিউটর', titleEn: 'Grounded Socratic Tutor', descBn: 'বোর্ড পাঠ্যবই ভিত্তিক পার্সোনাল ডাউট সলভার', descEn: 'Interactive textbook-grounded 1-on-1 mentor', icon: GraduationCap, highlight: true },
    { id: 'scanner' as NavTab, titleBn: 'খাতা ও চিত্র স্ক্যানার', titleEn: 'Handwritten Script Scanner', descBn: 'হাতের লেখা খাতা স্ক্যান করে শিক্ষক মার্কিং ও ভুল নির্ণয়', descEn: 'Scan handwritten answers for instant grading', icon: Camera },
    { id: 'mistakes' as NavTab, titleBn: 'ভুল শোধনাগার (Mistake Vault)', titleEn: 'Mistake Vault', descBn: 'দুর্বলতা ট্র্যাকার ও রিভিশন ব্যাংক', descEn: 'Track weak concepts & recurring errors', icon: AlertOctagon, badge: activeMistakesCount },
    { id: 'sprint' as NavTab, titleBn: 'স্মার্ট স্টাডি স্প্রিন্ট', titleEn: 'Smart Sprint', descBn: 'টার্গেটেড দুর্বল টপিক রিভিশন ও প্র্যাকটিস', descEn: 'Targeted high-yield mastery practice', icon: Clock },
  ];

  const isExamActive = ['worksheet', 'exam', 'colleges'].includes(activeTab);
  const isQuestionActive = ['questions', 'ingest', 'taxonomy'].includes(activeTab);
  const isAiActive = ['tutor', 'scanner', 'mistakes', 'sprint'].includes(activeTab);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-xs transition-all duration-200 print:hidden" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: App Brand Logo & Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-bold group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 dark:from-white dark:via-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">
                    HSC.AI
                  </span>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-bengali block -mt-0.5">
                  স্টাডি ইন্টেলিজেন্স
                </span>
              </div>
            </button>
          </div>

          {/* CENTER: 3 Smart Hubs Navigation + Dashboard */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {/* Dashboard Button */}
            <button
              onClick={() => handleSelectTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
            </button>

            {/* Hub 1: Exams & Papers Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'exams' ? null : 'exams')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition-all flex items-center gap-1.5 ${
                  isExamActive
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isBn ? 'পরীক্ষা ও প্রশ্নপত্র' : 'Exams & Papers'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === 'exams' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {openMenu === 'exams' && (
                <div className="absolute top-full left-0 mt-2 w-80 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl z-50 animate-fadeIn space-y-1">
                  {examHubItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm font-bengali flex items-center gap-1.5">
                            <span>{isBn ? item.titleBn : item.titleEn}</span>
                            {item.highlight && <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono font-black">A4 PDF</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali line-clamp-1 mt-0.5">
                            {isBn ? item.descBn : item.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hub 2: Question Bank Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'questions' ? null : 'questions')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition-all flex items-center gap-1.5 ${
                  isQuestionActive
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isBn ? 'প্রশ্ন ব্যাংক' : 'Question Bank'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === 'questions' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {openMenu === 'questions' && (
                <div className="absolute top-full left-0 mt-2 w-80 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl z-50 animate-fadeIn space-y-1">
                  {questionHubItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm font-bengali flex items-center gap-1.5">
                            <span>{isBn ? item.titleBn : item.titleEn}</span>
                            {item.highlight && <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono font-black">626+</span>}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali line-clamp-1 mt-0.5">
                            {isBn ? item.descBn : item.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hub 3: AI Study Lab Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'ai' ? null : 'ai')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-bengali transition-all flex items-center gap-1.5 ${
                  isAiActive
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isBn ? 'এআই স্টাডি ল্যাব' : 'AI Study Lab'}</span>
                {activeMistakesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMenu === 'ai' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {openMenu === 'ai' && (
                <div className="absolute top-full left-0 mt-2 w-84 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl z-50 animate-fadeIn space-y-1">
                  {aiHubItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-xs sm:text-sm font-bengali flex items-center justify-between">
                            <span>{isBn ? item.titleBn : item.titleEn}</span>
                            {item.badge && item.badge > 0 ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                                {item.badge}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali line-clamp-1 mt-0.5">
                            {isBn ? item.descBn : item.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* RIGHT: Subject Pill Switcher, Language, Theme, Guide, Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Elegant Subject Switcher Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-bengali transition-all flex items-center gap-1.5 shadow-2xs ${activeSubjectColor.badge}`}
              >
                <ActiveSubjectIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isBn ? activeSubject.name_bn : activeSubject.name_en}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Subject Selector Dropdown List */}
              {isSubjectDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl z-50 animate-fadeIn space-y-0.5">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 font-bengali">
                    বিষয় পরিবর্তন করুন:
                  </div>
                  {CANONICAL_SUBJECTS.map((sub) => {
                    const SubIcon = SUBJECT_ICONS[sub.id] || Atom;
                    const isSelected = selectedSubjectId === sub.id;
                    const color = SUBJECT_COLORS[sub.id] || SUBJECT_COLORS.phy;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setIsSubjectDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold font-bengali transition-all flex items-center justify-between ${
                          isSelected
                            ? `${color.badge} font-black`
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SubIcon className={`w-4 h-4 ${color.text}`} />
                          <span>{isBn ? sub.name_bn : sub.name_en}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Switcher Button */}
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold font-mono flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isBn ? 'বা' : 'EN'}</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Profile Avatar Pill */}
            <button
              onClick={() => handleSelectTab('profile')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bengali hidden lg:inline max-w-[80px] truncate">{profile?.name || (isBn ? 'প্রোফাইল' : 'Profile')}</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold font-bengali transition-all flex items-center gap-1"
              title="ব্যবহার নির্দেশিকা"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden xl:inline">{isBn ? 'গাইড' : 'Guide'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
