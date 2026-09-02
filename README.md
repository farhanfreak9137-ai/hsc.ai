# HSC AI Study Intelligence System
### Evidence-Based Study Prioritization, Multimodal Vision OCR, Exam Simulation, and Adaptive Tutoring for Bangladesh HSC Students

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-Flash--Lite-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

---

## 📖 Overview

The **HSC AI Study Intelligence System** is an AI-powered educational intelligence and exam preparation platform specifically built for the **Bangladesh Higher Secondary Certificate (HSC / NCTB)** curriculum. 

Grounded in official textbook methodologies (e.g., Dr. Shahjahan Tapan, Prof. Giasuddin, Dr. Ahsanul Kabir) and authentic Bangladesh Board examination patterns (2018–2024), the system transforms traditional study habits through real-time AI tutoring, handwritten script grading, structured mistake triage, and procedural worksheet generation.

---

## ✨ Key Features

- 🎯 **Evidence-Based Prioritization Matrix**: Dynamic curriculum taxonomy tracking concept mastery (`unseen`, `in_progress`, `weak_struggling`, `proficient`, `mastered`) with board recurrence weights.
- ⏱️ **Full HSC Exam Simulator**: Timed Creative Question (CQ / সৃজনশীল: জ্ঞান, অনুধাবন, প্রয়োগ, উচ্চতর দক্ষতা) and MCQ practice with official Bangladesh Board step-by-step marking rubrics.
- 📸 **Handwritten Paper & Diagram Scanner (Vision OCR)**: Analyzes student handwritten calculations, circuit diagrams, and ray optics, converting Bengali/math into standard $\LaTeX$ with red-pen marking.
- 🧑‍🏫 **Grounded Socratic & Expository AI Tutor**: 4 tutoring modes (Socratic, Expository, Exam Invigilator, High-Yield Revision) grounded in NCTB textbook citations and step-by-step mathematical reasoning.
- 🏛️ **Top College Test Papers Hub**: Curated test examinations from Notre Dame College, Dhaka College, Viqarunnisa Noon, and Rajuk Uttara Model College.
- 📑 **Dynamic Worksheet & Test Builder**: Procedural and AI-assisted generation of authentic board-standard question papers and printable PDF worksheets.
- 🔍 **Mistake Vault & Remedial Engine**: Classifies root causes (`calculation_slip`, `formula_amnesia`, `conceptual_misconception`, `unit_error`, `sign_error`) and synthesizes isomorphic variants to master weak areas.
- 📱 **Cross-Platform / Android Ready**: Optimized for mobile and desktop, with native Android deployment powered by Capacitor.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Mathematical Rendering**: KaTeX (`remark-math`, `rehype-katex`), custom LaTeX preprocessor
- **Backend API**: Node.js, Express, `tsx`, Google GenAI SDK (`@google/genai`)
- **AI Models**: Google Gemini (`gemini-flash-lite-latest`) for Vision OCR, Socratic dialogue, and schema-guided grading
- **Mobile**: Capacitor 8 (`@capacitor/android`, `@capacitor/core`)
- **Data & Taxonomy**: Canonical NCTB curriculum ontology (`canonicalTaxonomy.ts`), indexed college papers, and local persistence

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- A free [Google Gemini API Key](https://aistudio.google.com/)

---

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/hsc-ai-study-intelligence-system.git
   cd hsc-ai-study-intelligence-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the `.env.example` template to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🔒 Security Best Practices

- **Never Commit Secrets**: The `.env` file is excluded in `.gitignore`. Never hardcode or commit your Gemini API key, passwords, or cloud credentials to version control.
- **Server-Side API Proxying**: All AI requests are handled securely on the Node/Express backend (`server.ts`). Client-side code never has access to the API key.
- **Rate Limiting & Input Sanitization**: The backend includes in-memory rate limiting and payload validation on all `/api/gemini/*` endpoints to protect against abuse and quota exhaustion.
- **Reporting Security Issues**: If you identify a security vulnerability, please open a private security advisory on GitHub rather than public issues.

---

## 📱 Mobile Build (Android)

To build the native Android application:

1. **Build the web production bundle:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor Android project:**
   ```bash
   npm run cap:sync
   ```

3. **Open in Android Studio:**
   ```bash
   npm run cap:open
   ```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server with Vite middleware in development mode |
| `npm run build` | Builds the Vite frontend and bundles the Express server with `esbuild` |
| `npm run start` | Runs the production-bundled server (`dist/server.cjs`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run cap:sync` | Syncs web assets to the native Android platform |
| `npm run cap:open` | Opens the Android project in Android Studio |

---

## 📄 License & Academic Disclaimer

This project is built for educational and research purposes to support HSC students preparing for national board examinations in Bangladesh. Curriculum taxonomy and question patterns reflect public NCTB syllabus standards.
