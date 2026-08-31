import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Globe,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Type,
  Timer,
  FileDown,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Shield,
  Trash2,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import {
  loadQuestions,
  saveQuestions,
  loadStudentAttempts,
  loadMistakePatterns,
  loadUserMastery,
  loadExamHistory,
  loadSavedWorksheets,
  loadUserProfile,
  saveUserProfile,
} from '../services/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  language: 'bn' | 'en';
  onReloadData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  language,
  onReloadData,
}) => {
  const isBn = language === 'bn';
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    const updated = { ...settings, theme: newTheme };
    onUpdateSettings(updated);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast(isBn ? 'থিম সফলভাবে পরিবর্তন করা হয়েছে' : 'Theme updated successfully');
  };

  const handleLanguageChange = (newLang: 'bn' | 'en') => {
    const updated = { ...settings, language: newLang };
    onUpdateSettings(updated);
    showToast(newLang === 'bn' ? 'ভাষা বাংলায় সেট করা হয়েছে' : 'Language set to English');
  };

  const toggleSound = () => {
    const updated = { ...settings, sound_effects: !settings.sound_effects };
    onUpdateSettings(updated);
    showToast(
      updated.sound_effects
        ? isBn
          ? 'সাউন্ড এফেক্ট চালু করা হয়েছে'
          : 'Sound effects enabled'
        : isBn
        ? 'সাউন্ড এফেক্ট বন্ধ করা হয়েছে'
        : 'Sound effects disabled'
    );
  };

  const toggleTimerAlerts = () => {
    const updated = { ...settings, auto_timer_alerts: !settings.auto_timer_alerts };
    onUpdateSettings(updated);
    showToast(
      updated.auto_timer_alerts
        ? isBn
          ? 'টাইমার অ্যালার্ট সক্রিয়'
          : 'Timer alerts enabled'
        : isBn
        ? 'টাইমার অ্যালার্ট বন্ধ'
        : 'Timer alerts disabled'
    );
  };

  // Export full study backup as JSON
  const handleExportData = () => {
    try {
      const backupData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        profile: loadUserProfile(),
        settings: settings,
        mastery: loadUserMastery(),
        mistakes: loadMistakePatterns(),
        attempts: loadStudentAttempts(),
        exam_history: loadExamHistory(),
        saved_worksheets: loadSavedWorksheets(),
        questions: loadQuestions(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `hsc_study_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(isBn ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'Backup downloaded successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    }
  };

  // Import full study backup from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            if (parsed.profile) localStorage.setItem('hsc_study_user_profile_v1', JSON.stringify(parsed.profile));
            if (parsed.settings) {
              localStorage.setItem('hsc_study_app_settings_v1', JSON.stringify(parsed.settings));
              onUpdateSettings(parsed.settings);
            }
            if (parsed.mastery) localStorage.setItem('hsc_study_mastery_v1', JSON.stringify(parsed.mastery));
            if (parsed.mistakes) localStorage.setItem('hsc_study_mistakes_v1', JSON.stringify(parsed.mistakes));
            if (parsed.attempts) localStorage.setItem('hsc_study_attempts_v1', JSON.stringify(parsed.attempts));
            if (parsed.exam_history) localStorage.setItem('hsc_study_exam_history_v1', JSON.stringify(parsed.exam_history));
            if (parsed.saved_worksheets) localStorage.setItem('hsc_study_saved_worksheets_v1', JSON.stringify(parsed.saved_worksheets));
            if (parsed.questions) localStorage.setItem('hsc_study_questions_v1', JSON.stringify(parsed.questions));

            if (onReloadData) onReloadData();
            showToast(isBn ? 'ডেটা ব্যাকআপ সফলভাবে ইম্পোর্ট করা হয়েছে!' : 'Data restored successfully!');
          }
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    localStorage.removeItem('hsc_study_mastery_v1');
    localStorage.removeItem('hsc_study_mistakes_v1');
    localStorage.removeItem('hsc_study_attempts_v1');
    localStorage.removeItem('hsc_study_exam_history_v1');
    localStorage.removeItem('hsc_study_sprints_v1');
    setShowResetConfirm(false);
    if (onReloadData) onReloadData();
    showToast(isBn ? 'সমস্ত প্রগ্রেস ও ইতিহাস সফলভাবে রিসেট করা হয়েছে।' : 'Progress reset successfully.');
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-bengali">
              {isBn ? 'অ্যাপ সেটিংস ও কনফিগারেশন' : 'App Settings & Preferences'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-bengali">
            {isBn
              ? 'ডার্ক/লাইট থিম, ভাষা পরিবর্তন, অডিও ও অফলাইন ব্যাকআপ নিয়ন্ত্রণ করুন'
              : 'Customize appearance theme, interface language, audio alerts, and local data.'}
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance & Theme (Light / Dark) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{isBn ? 'অ্যাপ থিম (Light / Dark Mode)' : 'Appearance & Theme'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
                {isBn ? 'পড়ার সুবিধার জন্য লাইট অথবা চোখের আরামদায়ক ডার্ক থিম বেছে নিন' : 'Switch between crisp light mode and eye-safe dark mode.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Pill */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                settings.theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-bengali">
                    {isBn ? 'লাইট মোড' : 'Light Mode'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    {isBn ? 'উজ্জ্বল ও সুস্পষ্ট রিডিং লেআউট' : 'High contrast daytime reading'}
                  </div>
                </div>
              </div>
              {settings.theme === 'light' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </button>

            {/* Dark Mode Pill */}
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                settings.theme === 'dark'
                  ? 'border-emerald-500 bg-slate-800 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-bengali">
                    {isBn ? 'ডার্ক মোড' : 'Dark Mode'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    {isBn ? 'রাতের পড়াশোনায় চোখের সুরক্ষা' : 'Comfortable for night-time drills'}
                  </div>
                </div>
              </div>
              {settings.theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Language Selection (Bangla / English) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-500" />
                <span>{isBn ? 'ইন্টারফেস ভাষা (Bangla / English)' : 'Interface Language'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mt-0.5">
                {isBn ? 'অ্যাপের প্রধান নেভিগেশন ও নির্দেশিকার ভাষা নির্ধারণ করুন' : 'Select language for primary labels, buttons and guides.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bangla Option */}
            <button
              onClick={() => handleLanguageChange('bn')}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                settings.language === 'bn'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center">
                  বা
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-bengali">
                    বাংলা (Bangla)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    এনসিটিবি সিলেবাস ভিত্তিক বাংলা ইন্টারফেস
                  </div>
                </div>
              </div>
              {settings.language === 'bn' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </button>

            {/* English Option */}
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                settings.language === 'en'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center">
                  EN
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    English
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    English navigation and labels
                  </div>
                </div>
              </div>
              {settings.language === 'en' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            </button>
          </div>
        </div>

        {/* Audio & Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2 mb-4">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>{isBn ? 'অডিও ও পরীক্ষা নোটিফিকেশন' : 'Audio & Timer Notifications'}</span>
          </h2>

          <div className="space-y-3">
            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {settings.sound_effects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white font-bengali">
                    {isBn ? 'ইন্টারেক্টিভ সাউন্ড ও ফিডব্যাক' : 'Interactive Sound Effects'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    {isBn ? 'সঠিক উত্তর ও বাটনে মৃদু শব্দ প্রতিক্রিয়া' : 'Play subtle sound on correct submissions'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.sound_effects ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.sound_effects ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Timer Alerts Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {settings.auto_timer_alerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white font-bengali">
                    {isBn ? 'মক টেস্ট সময় সতর্কতা (Timer Alert)' : 'Exam Timer Alerts'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bengali">
                    {isBn ? 'পরীক্ষার শেষ ৫ মিনিটে সতর্কতামূলক বার্তা' : 'Notify when 5 minutes are remaining'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleTimerAlerts}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.auto_timer_alerts ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.auto_timer_alerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Backup & Cloud / Local Management */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>{isBn ? 'ডেটা ব্যাকআপ ও রিস্টোর (Offline Data Control)' : 'Data Management & Backup'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali mb-4">
            {isBn
              ? 'আপনার সমস্ত সমাধান, ভুল শোধনাগারের রেকর্ড ও মক টেস্ট স্কোর নিরাপদে JSON ফরম্যাটে ব্যাকআপ রাখুন।'
              : 'Download your entire study history and mistakes as a portable JSON file.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export JSON */}
            <button
              onClick={handleExportData}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs font-bengali flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? 'সমস্ত ডেটা ব্যাকআপ ডাউনলোড (JSON)' : 'Export Full Backup (JSON)'}</span>
            </button>

            {/* Import JSON */}
            <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs font-bengali flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{isBn ? 'পূর্বের ব্যাকআপ রিস্টোর করুন' : 'Restore from JSON Backup'}</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>
          </div>

          {/* Reset Progress Section */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-bengali">
                {isBn ? 'অনুশীলন প্রগ্রেস রিসেট' : 'Reset Study History'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bengali">
                {isBn ? 'মাস্টারি রেকর্ড ও ভুলের ইতিহাস মুছে ফেলবে' : 'Clears mistake vault and test attempts'}
              </div>
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBn ? 'না' : 'Cancel'}
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  {isBn ? 'হ্যাঁ, নিশ্চিত' : 'Yes, Reset'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold font-bengali flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রগ্রেস রিসেট করুন' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
