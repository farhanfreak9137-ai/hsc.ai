import React from 'react';
import {
  HelpCircle,
  Sparkles,
  GraduationCap,
  FileQuestion,
  AlertOctagon,
  X,
  Compass,
  ArrowRight,
  Layers,
  Clock,
  Timer,
  FileDown,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 overflow-hidden my-6 shadow-2xl">
        {/* Modal Header */}
        <div className="bg-slate-50 p-6 text-slate-900 flex items-start justify-between border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> সহজ ব্যবহার নির্দেশিকা
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-bengali text-slate-900">
              কীভাবে সহজে পড়বেন ও এআই টিউটর ব্যবহার করবেন?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bengali">
              এইচএসসি বিজ্ঞানের যেকোনো জটিল বিষয় সহজে বুঝতে ও বোর্ড পরীক্ষায় এ+ নিশ্চিত করতে ৩টি ধাপ অনুসরণ করুন।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: 3 Step Workflow */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm font-bengali uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ৩টি সহজ ধাপে পড়াশোনা করুন:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
                  ১
                </div>
                <h4 className="font-bold text-slate-900 font-bengali text-sm">
                  যেকোনো প্রশ্ন বা ডাউট জিজ্ঞেস করুন
                </h4>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  বইয়ের নির্দিষ্ট টপিক হোক কিংবা যেকোনো কঠিন অঙ্ক বা কনসেপ্ট — <strong>এআই টিউটর</strong>-এ যেকোনো প্রশ্ন লিখে বা ছবি তুলে দিন।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('tutor');
                  }}
                  className="text-xs text-emerald-700 font-bold font-bengali flex items-center gap-1 pt-1 hover:underline"
                >
                  টিউটরে যান <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-xs flex items-center justify-center">
                  ২
                </div>
                <h4 className="font-bold text-slate-900 font-bengali text-sm">
                  বোর্ড প্রশ্ন প্র্যাকটিস ও খাতা মূল্যায়ন
                </h4>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  <strong>প্রশ্ন ভান্ডার</strong> থেকে বিগত বোর্ড সৃজনশীল (ক, খ, গ, ঘ) সমাধান করুন। টাইপ করে বা খাতার ছবি আপলোড করে নম্বর দেখুন।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('questions');
                  }}
                  className="text-xs text-blue-700 font-bold font-bengali flex items-center gap-1 pt-1 hover:underline"
                >
                  প্রশ্ন ভান্ডারে যান <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono font-bold text-xs flex items-center justify-center">
                  ৩
                </div>
                <h4 className="font-bold text-slate-900 font-bengali text-sm">
                  ভুল শোধনাগারে দুর্বলতা দূর করুন
                </h4>
                <p className="text-xs text-slate-600 font-bengali leading-relaxed">
                  অঙ্ক বা সূত্রে ভুল হলে তা স্বয়ংক্রিয়ভাবে <strong>ভুল শোধনাগারে</strong> জমা হবে এবং অনুরূপ নতুন টেস্ট দিয়ে দুর্বলতা দূর হবে।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('mistakes');
                  }}
                  className="text-xs text-rose-700 font-bold font-bengali flex items-center gap-1 pt-1 hover:underline"
                >
                  ভুল শোধনাগারে যান <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: AI Tutor FAQ & Answers */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm font-bengali flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              এআই টিউটর সম্পর্কে আপনার সাধারণ প্রশ্নের উত্তর:
            </h3>

            <div className="space-y-3 text-xs sm:text-sm font-bengali text-slate-800">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-bold">
                  ১. এআই টিউটর কি শুধু বইয়ের প্রশ্নের উত্তর দেয়, নাকি যেকোনো র‍্যান্ডম প্রশ্ন করা যাবে?
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  👉 <strong>হ্যাঁ, যেকোনো প্রশ্ন করা যাবে!</strong> পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত বা জীববিজ্ঞানের যেকোনো অজানা প্রশ্ন, কলেজ টেস্টের অঙ্ক, গাইড বই বা ক্লাসের ডাউট লিখে বা সরাসরি খাতার ছবি তুলে পাঠালেই টিউটর সুন্দরভাবে ধাপে ধাপে বুঝিয়ে দেবে।
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-bold">
                  ২. এটি কীভাবে সাহায্য করে? (সক্রেটিক পদ্ধতি vs লেকচার নোট)
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  👉 আপনি চাইলে এটি সরাসরি উত্তর না দিয়ে আপনাকে ক্লু ও সূত্র মনে করিয়ে দিয়ে নিজে সলভ করতে শেখাবে (সক্রেটিক মোড), আবার চাইলে পূর্ণাঙ্গ বিশদ লেকচার ও লিখিত সমাধান একবারে দিয়ে দেবে (লেকচার মোড)।
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-bold">
                  ৩. খাতার ছবি দিলে কি মূল্যায়ন করতে পারে?
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  👉 <strong>হ্যাঁ!</strong> আপনি খাতায় অঙ্ক করে মোবাইল দিয়ে ছবি তুলে জমা দিলে এটি বোর্ড পরীক্ষকের মতো প্রতিটি ধাপ ও একক যাচাই করে নম্বর এবং কোথায় ভুল হয়েছে তার বিস্তারিত মন্তব্য দেখাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Navigation Menu Directory */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-700 text-xs font-bengali uppercase tracking-wider">
              কোথায় কী ফিচার রয়েছে? (মেনু নির্দেশিকা):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bengali">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Timer className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">মক টেস্ট সিমুলেটর:</strong> সময়াবদ্ধ বোর্ড এক্সাম, CQ সেলফ-ইভালুয়েশন ও স্কোরকার্ড
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <FileDown className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">ওয়ার্কশিট ও PDF:</strong> প্রিন্টযোগ্য প্রশ্নপত্র, ফর্মুলা শিট ও মডেল সমাধান
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">এআই টিউটর:</strong> যেকোনো প্রশ্ন বা ডাউট চ্যাট ও ছবি সমাধান
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">ড্যাশবোর্ড:</strong> কোন টপিক আগে পড়বেন ও প্রস্তুতি স্কোর
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <FileQuestion className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">প্রশ্ন ভান্ডার:</strong> বিগত বোর্ড CQ/MCQ প্র্যাকটিস ও খাতা মূল্যায়ন
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">ভুল শোধনাগার:</strong> আপনার ভুলগুলোর মূল কারণ ও বিকল্প টেস্ট
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">স্টাডি স্প্রিন্ট:</strong> ৪৫ বা ৯০ মিনিটের টাইম-বক্সড স্টাডি রুটিন
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">সিলেবাস ও সূত্র:</strong> অধ্যায় ও ফর্মুলা ম্যাপিং
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-bengali">
            যেকোনো সময় ওপরের <strong>"গাইড"</strong> বাটনে ক্লিক করে এটি দেখতে পারেন।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm font-bengali transition-all shadow-sm"
          >
            বুঝেছি, শুরু করি!
          </button>
        </div>
      </div>
    </div>
  );
};
