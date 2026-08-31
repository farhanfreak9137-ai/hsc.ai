import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExamSimulator } from './components/ExamSimulator';
import { HandwrittenScanner } from './components/HandwrittenScanner';
import { CollegeTestPapers } from './components/CollegeTestPapers';
import { WorksheetGenerator } from './components/WorksheetGenerator';
import { QuestionExplorer } from './components/QuestionExplorer';
import { GroundedTutor } from './components/GroundedTutor';
import { IngestionStudio } from './components/IngestionStudio';
import { MistakeVault } from './components/MistakeVault';
import { SmartSprint } from './components/SmartSprint';
import { TaxonomyBrowser } from './components/TaxonomyBrowser';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { UserGuideModal } from './components/UserGuideModal';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import {
  loadQuestions,
  saveQuestions,
  loadUserMastery,
  loadMistakePatterns,
  loadUserProfile,
  saveUserProfile,
  loadAppSettings,
  saveAppSettings,
  recordManualMistake,
} from './services/storage';
import {
  Question,
  CQSubpart,
  UserConceptMastery,
  MistakePattern,
  TutoringMode,
  UserProfile,
  AppSettings,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('phy');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // User Profile & App Settings
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [settings, setSettings] = useState<AppSettings>(() => loadAppSettings());

  // Core Storage States
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [masteryMap, setMasteryMap] = useState<Record<string, UserConceptMastery>>(() => loadUserMastery());
  const [mistakes, setMistakes] = useState<MistakePattern[]>(() => loadMistakePatterns());

  // Grounded Tutor Transfer States
  const [tutorConceptId, setTutorConceptId] = useState<string | undefined>(undefined);
  const [tutorQuestion, setTutorQuestion] = useState<Question | null>(null);
  const [tutorSubpart, setTutorSubpart] = useState<CQSubpart | null>(null);
  const [tutorMode, setTutorMode] = useState<TutoringMode>('socratic');

  // Synchronize Dark Mode with Document Root Element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Reload states helper
  const reloadMasteryAndMistakes = () => {
    setMasteryMap(loadUserMastery());
    setMistakes(loadMistakePatterns());
    setQuestions(loadQuestions());
    setProfile(loadUserProfile());
    setSettings(loadAppSettings());
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'bn' ? 'en' : 'bn';
    handleUpdateSettings({ ...settings, language: nextLang });
  };

  const handleQuestionAdded = (newQuestion: Question) => {
    const updated = [newQuestion, ...questions];
    setQuestions(updated);
    saveQuestions(updated);
  };

  const handleAddManualMistake = (
    mistakeData: Omit<MistakePattern, 'id' | 'last_occurred_at' | 'next_spaced_review_due'>
  ) => {
    recordManualMistake(mistakeData);
    reloadMasteryAndMistakes();
  };

  const handleSelectConceptToStudy = (conceptId: string, mode: TutoringMode = 'socratic') => {
    setTutorConceptId(conceptId);
    setTutorQuestion(null);
    setTutorSubpart(null);
    setTutorMode(mode);
    setActiveTab('tutor');
  };

  const handleSendQuestionToTutor = (question: Question, subpart?: CQSubpart) => {
    setTutorQuestion(question);
    setTutorSubpart(subpart || null);
    if (question.concept_ids && question.concept_ids[0]) {
      setTutorConceptId(question.concept_ids[0]);
    }
    setTutorMode('socratic');
    setActiveTab('tutor');
  };

  const handleSendQuestionToEvaluator = (question: Question, subpart?: CQSubpart) => {
    setTutorQuestion(question);
    setTutorSubpart(subpart || null);
    if (question.concept_ids && question.concept_ids[0]) {
      setTutorConceptId(question.concept_ids[0]);
    }
    setTutorMode('exam');
    setActiveTab('tutor');
  };

  const handleStartExamWithQuestions = (questionIds: string[], title: string, durationMinutes: number) => {
    setActiveTab('exam');
  };

  const handleOpenScannerWithQuestion = (question: Question) => {
    setActiveTab('scanner');
  };

  const handleOpenTutorWithQuery = (query: string, conceptName?: string) => {
    setActiveTab('tutor');
  };

  const activeMistakesCount = mistakes.filter(
    (m) => m.subject_id === selectedSubjectId && !m.is_rectified
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      {/* App Container */}
      <div className="relative z-10 min-h-screen flex flex-col print:min-h-0 print:block">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedSubjectId={selectedSubjectId}
          setSelectedSubjectId={setSelectedSubjectId}
          activeMistakesCount={activeMistakesCount}
          onOpenGuide={() => setIsGuideOpen(true)}
          profile={profile}
          settings={settings}
          onToggleTheme={handleToggleTheme}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Main View Container (with bottom margin padding on mobile for Android nav bar) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12 print:p-0 print:m-0 print:max-w-none print:w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              selectedSubjectId={selectedSubjectId}
              questions={questions}
              masteryMap={masteryMap}
              mistakes={mistakes}
              onSelectConceptToStudy={handleSelectConceptToStudy}
              onStartAdaptivePractice={handleSendQuestionToEvaluator}
              onNavigateToTab={setActiveTab}
              onOpenGuide={() => setIsGuideOpen(true)}
              settings={settings}
            />
          )}

          {activeTab === 'scanner' && (
            <HandwrittenScanner
              onAddMistake={handleAddManualMistake}
              onOpenTutorWithContext={handleOpenTutorWithQuery}
              profile={profile}
              settings={settings}
            />
          )}

          {activeTab === 'colleges' && (
            <CollegeTestPapers
              onStartExamWithQuestions={handleStartExamWithQuestions}
              onExportWorksheet={(subId, paperId, title) => {
                setSelectedSubjectId(subId);
                setActiveTab('worksheet');
              }}
              onOpenScannerWithQuestion={handleOpenScannerWithQuestion}
              onOpenTutorWithContext={handleOpenTutorWithQuery}
              profile={profile}
              settings={settings}
            />
          )}

          {activeTab === 'exam' && (
            <ExamSimulator
              questions={questions}
              selectedSubjectId={selectedSubjectId}
              onAttemptRecorded={reloadMasteryAndMistakes}
              onSendToTutor={handleSendQuestionToTutor}
              settings={settings}
            />
          )}

          {activeTab === 'worksheet' && (
            <WorksheetGenerator
              questions={questions}
              selectedSubjectId={selectedSubjectId}
              settings={settings}
            />
          )}

          {activeTab === 'tutor' && (
            <GroundedTutor
              selectedSubjectId={selectedSubjectId}
              initialConceptId={tutorConceptId}
              initialQuestion={tutorQuestion}
              initialSubpart={tutorSubpart}
              initialMode={tutorMode}
              onAttemptRecorded={reloadMasteryAndMistakes}
              settings={settings}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionExplorer
              questions={questions}
              selectedSubjectId={selectedSubjectId}
              masteryMap={masteryMap}
              mistakes={mistakes}
              onSendToTutor={handleSendQuestionToTutor}
              onSendToEvaluator={handleSendQuestionToEvaluator}
              settings={settings}
            />
          )}

          {activeTab === 'mistakes' && (
            <MistakeVault
              mistakes={mistakes}
              selectedSubjectId={selectedSubjectId}
              onRefreshMistakes={reloadMasteryAndMistakes}
              onSendToTutor={(cid) => handleSelectConceptToStudy(cid, 'socratic')}
              settings={settings}
            />
          )}

          {activeTab === 'sprint' && (
            <SmartSprint
              selectedSubjectId={selectedSubjectId}
              mistakes={mistakes}
              masteryMap={masteryMap}
              onStartSprintTask={(cid) => handleSelectConceptToStudy(cid, 'socratic')}
              settings={settings}
            />
          )}

          {activeTab === 'ingest' && (
            <IngestionStudio
              selectedSubjectId={selectedSubjectId}
              onQuestionAdded={handleQuestionAdded}
              onNavigateToTab={setActiveTab}
              settings={settings}
            />
          )}

          {activeTab === 'taxonomy' && (
            <TaxonomyBrowser
              selectedSubjectId={selectedSubjectId}
              onSelectConceptToStudy={handleSelectConceptToStudy}
              settings={settings}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              masteryMap={masteryMap}
              mistakes={mistakes}
              questions={questions}
              language={settings.language}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              language={settings.language}
              onReloadData={reloadMasteryAndMistakes}
            />
          )}
        </main>

        {/* Interactive Quick Guide & Tutorial Modal */}
        <UserGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setIsGuideOpen(false);
          }}
        />

        {/* Android Native Thumb Bottom Navigation Bar (Visible on Mobile/Tablet) */}
        <AndroidBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeMistakesCount={activeMistakesCount}
          selectedSubjectId={selectedSubjectId}
          setSelectedSubjectId={setSelectedSubjectId}
          settings={settings}
        />
      </div>
    </div>
  );
}
