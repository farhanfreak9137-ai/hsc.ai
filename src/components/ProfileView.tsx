import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Target,
  School,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit3,
  Save,
  Sparkles,
  TrendingUp,
  Brain,
  Calendar,
  Layers,
  Heart,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, StudentClassLevel, TargetTrack, UserConceptMastery, MistakePattern, Question } from '../types';
import { CANONICAL_SUBJECTS, CANONICAL_CONCEPTS } from '../data/canonicalTaxonomy';
import { loadExamHistory } from '../services/storage';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  masteryMap: Record<string, UserConceptMastery>;
  mistakes: MistakePattern[];
  questions: Question[];
  language: 'bn' | 'en';
  onNavigateToTab: (tab: any) => void;
}

const AVATAR_OPTIONS = [
  { id: 'scholar', emoji: '🎓', labelBn: 'স্কলার', labelEn: 'Scholar', bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' },
  { id: 'physicist', emoji: '⚛️', labelBn: 'পদার্থবিদ', labelEn: 'Physicist', bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-600 dark:text-indigo-400' },
  { id: 'mathematician', emoji: '📐', labelBn: 'গণিতবিদ', labelEn: 'Mathematician', bg: 'bg-sky-500/20 border-sky-500/40 text-sky-600 dark:text-sky-400' },
  { id: 'chemist', emoji: '🧪', labelBn: 'রসায়নবিদ', labelEn: 'Chemist', bg: 'bg-teal-500/20 border-teal-500/40 text-teal-600 dark:text-teal-400' },
  { id: 'doctor', emoji: '🩺', labelBn: 'ভবিষ্যত ডাক্তার', labelEn: 'Future Doctor', bg: 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400' },
  { id: 'engineer', emoji: '⚡', labelBn: 'বুয়েটিয়ান / ইঞ্জিনিয়ার', labelEn: 'Future Engineer', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400' },
];

const BOARDS = [
  { id: 'Dhaka', nameBn: 'ঢাকা বোর্ড', nameEn: 'Dhaka Board' },
  { id: 'Chattogram', nameBn: 'চট্টগ্রাম বোর্ড', nameEn: 'Chattogram Board' },
  { id: 'Rajshahi', nameBn: 'রাজশাহী বোর্ড', nameEn: 'Rajshahi Board' },
  { id: 'Dinajpur', nameBn: 'দিনাজপুর বোর্ড', nameEn: 'Dinajpur Board' },
  { id: 'Cumilla', nameBn: 'কুমিল্লা বোর্ড', nameEn: 'Cumilla Board' },
  { id: 'Jashore', nameBn: 'যশোর বোর্ড', nameEn: 'Jashore Board' },
  { id: 'Sylhet', nameBn: 'সিলেট বোর্ড', nameEn: 'Sylhet Board' },
  { id: 'Barishal', nameBn: 'বরিশাল বোর্ড', nameEn: 'Barishal Board' },
  { id: 'Mymensingh', nameBn: 'ময়মনসিংহ বোর্ড', nameEn: 'Mymensingh Board' },
  { id: 'Madrasah', nameBn: 'মাদ্রাসা বোর্ড', nameEn: 'Madrasah Board' },
  { id: 'Technical', nameBn: 'কারিগরি বোর্ড', nameEn: 'Technical Board' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  masteryMap,
  mistakes,
  questions,
  language,
  onNavigateToTab,
}) => {
  const isBn = language === 'bn';
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({ ...profile });
  const [saveToast, setSaveToast] = useState(false);

  const examHistory = loadExamHistory();

  // Derived statistics
  const masteredConceptsCount = Object.values(masteryMap).filter(
    (m) => m.mastery_state === 'mastered' || m.mastery_state === 'proficient'
  ).length;
  const inProgressCount = Object.values(masteryMap).filter(
    (m) => m.mastery_state === 'in_progress'
  ).length;
  const strugglingCount = Object.values(masteryMap).filter(
    (m) => m.mastery_state === 'weak_struggling'
  ).length;

  const rectifiedMistakesCount = mistakes.filter((m) => m.is_rectified).length;
  const activeMistakesCount = mistakes.filter((m) => !m.is_rectified).length;

  const totalAttempts = Object.values(masteryMap).reduce((acc, m) => acc + (m.total_attempts || 0), 0);
  const successfulAttempts = Object.values(masteryMap).reduce((acc, m) => acc + (m.successful_attempts || 0), 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0;

  // Selected avatar object
  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === profile.avatar_id) || AVATAR_OPTIONS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Badges list
  const badges = [
    {
      id: 'first_step',
      titleBn: 'যাত্রার সূচনা',
      titleEn: 'First Steps',
      descBn: 'প্রথম প্রশ্ন বা কনসেপ্ট অনুশীলন সম্পন্ন',
      descEn: 'Completed your first practice question',
      unlocked: totalAttempts > 0,
      icon: Sparkles,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'mastery_10',
      titleBn: '১০টি কনসেপ্ট মাস্টারি',
      titleEn: '10 Concepts Mastered',
      descBn: '১০টি বা তার বেশি পদার্থ/গণিত সূত্রে দক্ষতা অর্জন',
      descEn: 'Mastered 10+ core syllabus concepts',
      unlocked: masteredConceptsCount >= 10,
      icon: Brain,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'mistake_rectifier',
      titleBn: 'ভুল শোধক',
      titleEn: 'Error Rectifier',
      descBn: 'ভুল শোধনাগারে গিয়ে নিজের ভুল সংশোধন করেছেন',
      descEn: 'Rectified mistakes in Mistake Vault',
      unlocked: rectifiedMistakesCount > 0,
      icon: ShieldCheck,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/30',
    },
    {
      id: 'exam_warrior',
      titleBn: 'বোর্ড যোদ্ধা',
      titleEn: 'Board Warrior',
      descBn: 'মক টেস্ট সিমুলেটরে পূর্ণাঙ্গ পরীক্ষা দিয়েছেন',
      descEn: 'Completed a full mock board exam',
      unlocked: examHistory.length > 0,
      icon: Award,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{isBn ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!'}</span>
        </div>
      )}

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex items-center justify-center text-4xl sm:text-5xl shadow-lg transition-transform hover:scale-105 ${currentAvatar.bg}`}
            >
              <span>{currentAvatar.emoji}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-bengali">
                  {profile.name || (isBn ? 'এইচএসসি শিক্ষার্থী' : 'HSC Student')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {profile.target_exam_batch || 'HSC 2025'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {profile.age ? `${profile.age} ${isBn ? 'বছর' : 'Years'}` : `${17} ${isBn ? 'বছর' : 'Years'}`}
                </span>
              </div>
              <p className="text-sm text-slate-300 flex items-center gap-2 mb-2 font-bengali">
                <School className="w-4 h-4 text-emerald-400" />
                <span>{profile.institution_name || (isBn ? 'কলেজের নাম যোগ করুন' : 'Add College Name')}</span>
                <span className="text-slate-500">•</span>
                <span>{BOARDS.find((b) => b.id === profile.education_board)?.nameBn || profile.education_board}</span>
              </p>
              <p className="text-xs text-slate-400 italic font-bengali max-w-xl">
                &ldquo;{profile.bio_motto || (isBn ? 'লক্ষ্য স্থির, প্রস্তুতি নিখুঁত — ইনশাআল্লাহ সফল হব।' : 'Stay focused, practice daily.')}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                setEditForm({ ...profile });
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-md shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>{isEditing ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile')}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Ribbon */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'শ্রেণি / লেভেল' : 'Class / Level'}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white font-bengali">
              {profile.current_class === 'hsc_1st' && (isBn ? 'একাদশ শ্রেণি (১ম বর্ষ)' : 'HSC 1st Year (Class 11)')}
              {profile.current_class === 'hsc_2nd' && (isBn ? 'দ্বাদশ শ্রেণি (২য় বর্ষ)' : 'HSC 2nd Year (Class 12)')}
              {profile.current_class === 'hsc_examinee' && (isBn ? 'এইচএসসি পরীক্ষার্থী' : 'HSC Examinee')}
              {profile.current_class === 'admission_seeker' && (isBn ? 'এডমিশন পরীক্ষার্থী' : 'Admission Candidate')}
              {profile.current_class === 'alumni' && (isBn ? 'অ্যালামনাই' : 'Alumni')}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isBn ? 'টার্গেট ট্র্যাক' : 'Target Track'}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-indigo-300 font-bengali">
              {profile.target_track === 'engineering' && (isBn ? 'ইঞ্জিনিয়ারিং (BUET/RUET/CKET)' : 'Engineering (BUET/Tech)')}
              {profile.target_track === 'medical' && (isBn ? 'মেডিকেল (DMC/Govt. Medical)' : 'Medical (DMC/Govt.)')}
              {profile.target_track === 'varsity_science' && (isBn ? 'ভার্সিটি ‘ক’ ইউনিট (DU/GST)' : 'Varsity Science (DU/GST)')}
              {profile.target_track === 'architecture' && (isBn ? 'স্থাপত্যবিদ্যা (Architecture)' : 'Architecture')}
              {profile.target_track === 'board_gpa5' && (isBn ? 'বোর্ড গোল্ডেন A+' : 'Board Golden A+')}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>{isBn ? 'দৈনিক পড়াশোনার লক্ষ্য' : 'Daily Goal'}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-teal-300 font-bengali">
              {profile.daily_study_goal_hours || 4} {isBn ? 'ঘণ্টা' : 'Hours'} / {profile.daily_question_target || 20} {isBn ? 'প্রশ্ন' : 'Qs'}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>{isBn ? 'স্বপ্নের প্রতিষ্ঠান' : 'Dream Goal'}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-300 font-bengali truncate">
              {profile.dream_institution || 'BUET / ঢাকা বিশ্ববিদ্যালয়'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal/Drawer Area if editing */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-emerald-500/40 shadow-xl space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-bengali">
                {isBn ? 'প্রোফাইল ও একাডেমিক তথ্য আপডেট' : 'Update Profile & Academic Info'}
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isBn ? 'তথ্যগুলো ব্রাউজারে সংরক্ষিত থাকবে' : 'Stored locally in your browser'}
            </span>
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {isBn ? 'অ্যাভাটার পছন্দ করুন' : 'Select Avatar Persona'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setEditForm({ ...editForm, avatar_id: av.id })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    editForm.avatar_id === av.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 font-bengali">
                    {isBn ? av.labelBn : av.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'শিক্ষার্থীর নাম' : 'Full Name'}
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
                required
              />
            </div>

            {/* Current Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'বর্তমান শ্রেণি / শিক্ষাবর্ষ' : 'Current Class / Year'}
              </label>
              <select
                value={editForm.current_class}
                onChange={(e) => setEditForm({ ...editForm, current_class: e.target.value as StudentClassLevel })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bengali"
              >
                <option value="hsc_1st">{isBn ? 'একাদশ শ্রেণি (HSC ১ম বর্ষ)' : 'Class 11 (HSC 1st Year)'}</option>
                <option value="hsc_2nd">{isBn ? 'দ্বাদশ শ্রেণি (HSC ২য় বর্ষ)' : 'Class 12 (HSC 2nd Year)'}</option>
                <option value="hsc_examinee">{isBn ? 'এইচএসসি পরীক্ষার্থী' : 'HSC Candidate'}</option>
                <option value="admission_seeker">{isBn ? 'এডমিশন পরীক্ষার্থী (Engineering/Medical/Varsity)' : 'Admission Candidate'}</option>
                <option value="alumni">{isBn ? 'অ্যালামনাই / অন্যান্য' : 'Alumni / Others'}</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'বয়স (বছর)' : 'Age (Years)'}
              </label>
              <input
                type="number"
                min={14}
                max={25}
                value={editForm.age || ''}
                onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="17"
              />
            </div>

            {/* Target Exam Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'টার্গেট এইচএসসি ব্যাচ' : 'Target HSC Batch'}
              </label>
              <input
                type="text"
                value={editForm.target_exam_batch}
                onChange={(e) => setEditForm({ ...editForm, target_exam_batch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="HSC 2025"
              />
            </div>

            {/* Target Track */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'টার্গেট ক্যারিয়ার / এডমিশন ট্র্যাক' : 'Target Admission Track'}
              </label>
              <select
                value={editForm.target_track}
                onChange={(e) => setEditForm({ ...editForm, target_track: e.target.value as TargetTrack })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bengali"
              >
                <option value="engineering">{isBn ? 'ইঞ্জিনিয়ারিং (BUET, RUET, KUET, CUET, IUT)' : 'Engineering (BUET/Tech)'}</option>
                <option value="medical">{isBn ? 'মেডিকেল (DMC ও সরকারি মেডিকেল)' : 'Medical (DMC/Govt. Colleges)'}</option>
                <option value="varsity_science">{isBn ? 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট (DU, JU, RU, গুচ্ছ)' : 'Varsity Science (DU/GST)'}</option>
                <option value="architecture">{isBn ? 'আর্কিটেকচার / স্থাপত্যবিদ্যা' : 'Architecture'}</option>
                <option value="board_gpa5">{isBn ? 'বোর্ড পরীক্ষায় গোল্ডেন GPA 5.00' : 'Board Golden GPA 5.00'}</option>
              </select>
            </div>

            {/* Education Board */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'শিক্ষা বোর্ড' : 'Education Board'}
              </label>
              <select
                value={editForm.education_board}
                onChange={(e) => setEditForm({ ...editForm, education_board: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bengali"
              >
                {BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {isBn ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'কলেজের নাম' : 'College / Institution Name'}
              </label>
              <input
                type="text"
                value={editForm.institution_name}
                onChange={(e) => setEditForm({ ...editForm, institution_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder={isBn ? 'যেমন: ঢাকা কলেজ, নটর ডেম কলেজ...' : 'e.g. Dhaka College, NDC'}
              />
            </div>

            {/* Daily Goal Hours */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'দৈনিক স্টাডি লক্ষ্য (ঘণ্টা)' : 'Daily Study Target (Hours)'}
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={editForm.daily_study_goal_hours || ''}
                onChange={(e) => setEditForm({ ...editForm, daily_study_goal_hours: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="4"
              />
            </div>

            {/* Daily Questions Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'দৈনিক প্রশ্ন সমাধানের লক্ষ্য' : 'Daily Practice Questions Target'}
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={editForm.daily_question_target || ''}
                onChange={(e) => setEditForm({ ...editForm, daily_question_target: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="20"
              />
            </div>

            {/* Dream University / Subject */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'স্বপ্নের বিশ্ববিদ্যালয় বা সাবজেক্ট' : 'Dream University / Subject'}
              </label>
              <input
                type="text"
                value={editForm.dream_institution}
                onChange={(e) => setEditForm({ ...editForm, dream_institution: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder={isBn ? 'যেমন: BUET CSE, DMC, DU Physics...' : 'e.g. BUET CSE, DMC, DU Physics'}
              />
            </div>

            {/* Bio / Daily Mantra */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn ? 'অনুপ্রেরণামূলক বাক্য / স্টাডি মোটো' : 'Daily Study Mantra / Bio'}
              </label>
              <input
                type="text"
                value={editForm.bio_motto}
                onChange={(e) => setEditForm({ ...editForm, bio_motto: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder={isBn ? 'যেমন: লক্ষ্য স্থির, প্রস্তুতি নিখুঁত।' : 'e.g. Discipline equals freedom.'}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Content Grid: Analytics & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Academic Performance & Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Analytics Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali">
                  {isBn ? 'রিয়েল-টাইম স্টাডি অ্যানালিটিক্স' : 'Real-time Study Analytics'}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {isBn ? 'অটো-সিঙ্কড' : 'Auto-synced'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {masteredConceptsCount}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 font-bengali">
                  {isBn ? 'দক্ষতা অর্জন (Mastered)' : 'Mastered Concepts'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {totalAttempts}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 font-bengali">
                  {isBn ? 'মোট প্রশ্ন সমাধান' : 'Total Solved'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  {overallAccuracy}%
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 font-bengali">
                  {isBn ? 'সামগ্রিক নির্ভুলতা' : 'Accuracy Rate'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {activeMistakesCount}
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 font-bengali">
                  {isBn ? 'সংশোধন প্রয়োজন' : 'Active Mistakes'}
                </div>
              </div>
            </div>
          </div>

          {/* AI Tailored Suggestions based on Class, Age & Track */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-bengali">
                {isBn ? 'আপনার প্রোফাইলের ভিত্তিতে এআই পরামর্শ ও রুটিন' : 'Personalized AI Suggestions & Roadmap'}
              </h2>
            </div>

            <div className="space-y-3">
              {profile.current_class === 'hsc_1st' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 font-bengali">
                      {isBn ? 'একাদশ শ্রেণির শিক্ষার্থীদের জন্য সুনির্দিষ্ট কৌশল' : 'Strategy for 1st Year Students'}
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400/90 mt-1 leading-relaxed font-bengali">
                      {isBn
                        ? '১ম বর্ষে কেবল বোর্ড সূত্র মুখস্থ না করে গাণিতিক যুক্তি ও সূত্রের প্রমাণ শিখুন। ভেক্টর, নিউটনিয়ান বলবিদ্যা ও জৈব যৌগের মতো ফাউন্ডেশন অধ্যায়গুলো এখনই আয়ত্ত করুন।'
                        : 'Focus on deep conceptual clarity and formula derivations rather than plain memorization. Solidify Vectors, Newtonian Mechanics, and Organic Chemistry fundamentals early.'}
                    </p>
                  </div>
                </div>
              )}

              {profile.current_class === 'hsc_2nd' && (
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-start gap-3">
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 font-bengali">
                      {isBn ? 'দ্বাদশ শ্রেণি ও টেস্ট পরীক্ষার প্রস্তুতি' : 'Strategy for 2nd Year & Pre-Test'}
                    </h4>
                    <p className="text-xs text-indigo-800 dark:text-indigo-400/90 mt-1 leading-relaxed font-bengali">
                      {isBn
                        ? '২য় পত্রের সাথে সাথে নিয়মিত ১ম পত্র রিভিশন বজায় রাখুন। প্রতিদিন ভুল শোধনাগারে গিয়ে বিগত ভুলের পুনরাবৃত্তি রোধ করুন এবং সাপ্তাহিক ১টি পূর্ণাঙ্গ মক টেস্ট দিন।'
                        : 'Balance 2nd Paper syllabus while running weekly spaced retrieval of 1st Paper. Rectify error patterns in Mistake Vault and take regular timed mock exams.'}
                    </p>
                  </div>
                </div>
              )}

              {profile.target_track === 'engineering' && (
                <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 flex items-start gap-3">
                  <Target className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-sky-900 dark:text-sky-300 font-bengali">
                      {isBn ? 'ইঞ্জিনিয়ারিং ভর্তিচ্ছুদের জন্য অ্যাডভান্সড টিপস' : 'Engineering Track Advice (BUET/CKET)'}
                    </h4>
                    <p className="text-xs text-sky-800 dark:text-sky-400/90 mt-1 leading-relaxed font-bengali">
                      {isBn
                        ? 'উচ্চতর গণিত ও পদার্থবিজ্ঞানের মাল্টি-কনসেপ্ট সমস্যাগুলো নির্ভুলভাবে এবং কম সময়ে ক্যালকুলেটর ছাড়াই সমাধান করার দক্ষতা বাড়ান।'
                        : 'Practice multi-step algebraic manipulation and deep physics boundary cases to prepare for rigorous analytical engineering admission exams.'}
                    </p>
                  </div>
                </div>
              )}

              {profile.target_track === 'medical' && (
                <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3">
                  <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300 font-bengali">
                      {isBn ? 'মেডিকেল ভর্তিচ্ছুদের জন্য গতি ও নির্ভুলতা' : 'Medical Track Advice (DMC/Govt.)'}
                    </h4>
                    <p className="text-xs text-rose-800 dark:text-rose-400/90 mt-1 leading-relaxed font-bengali">
                      {isBn
                        ? 'জীববিজ্ঞান ও রসায়নের তথ্যগত প্রশ্নগুলোতে ১০০% নির্ভুলতা আনুন। মক টেস্ট মোডে দ্রুত গতিতে নেগেটিভ মার্কিং এড়িয়ে MCQ সলভ করার প্র্যাকটিস করুন।'
                        : 'Focus on speed-accuracy tradeoff in Biology and Chemistry factual MCQs to master negative marking avoidance.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Quick Launchers */}
        <div className="space-y-6">
          {/* Achievement Badges */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-bengali">
                  {isBn ? 'অর্জন ও ব্যাজ' : 'Achievements'}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {badges.filter((b) => b.unlocked).length} / {badges.length}
              </span>
            </div>

            <div className="space-y-3">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                      b.unlocked
                        ? 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                        : 'opacity-40 bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${b.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white font-bengali truncate">
                          {isBn ? b.titleBn : b.titleEn}
                        </h4>
                        {b.unlocked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-bengali">
                        {isBn ? b.descBn : b.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Launchers */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/40 dark:to-slate-900/60 rounded-2xl p-6 border border-emerald-500/30 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-bengali mb-3">
              {isBn ? 'আজকের অনুশীলনে সরাসরি যান' : 'Quick Study Actions'}
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateToTab('sprint')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold font-bengali transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{isBn ? 'স্মার্ট স্প্রিন্ট শুরু করুন' : 'Start Smart Sprint'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab('exam')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold font-bengali transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>{isBn ? 'মক টেস্ট সিমুলেটর' : 'Take Mock Exam'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateToTab('mistakes')}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold font-bengali transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>{isBn ? 'ভুল শোধনাগারে যান' : 'Review Mistake Vault'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
