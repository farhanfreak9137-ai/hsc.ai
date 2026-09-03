import {
  CliExecutionRequest,
  CliExecutionResult,
  CliCodeTemplate,
  TutorEnginePreference,
} from '../types';

/**
 * Execute arbitrary code or commands via the backend CLI Subprocess Engine.
 */
export async function executeCliCode(req: CliExecutionRequest): Promise<CliExecutionResult> {
  try {
    const res = await fetch('/api/tutor/cli-exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        stdout: '',
        stderr: `সার্ভার রেসপন্স ত্রুটি (${res.status}): অনুগ্রহ করে টার্মিনালে 'npm run dev' রিস্টার্ট করুন যাতে নতুন CLI সাবপ্রসেস এন্ডপয়েন্ট লোড হতে পারে।`,
        exitCode: res.status,
        executionTimeMs: 0,
        runtime: 'CLI Subprocess',
        error: `Endpoint returned non-JSON (${res.status})`,
      };
    }

    const data = await res.json();
    if (res.ok && data.success) {
      return {
        success: true,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        exitCode: data.exitCode ?? 0,
        executionTimeMs: data.executionTimeMs || 0,
        runtime: data.runtime || 'CLI Subprocess',
      };
    } else {
      return {
        success: false,
        stdout: data.stdout || '',
        stderr: data.stderr || data.error || 'Execution failed',
        exitCode: data.exitCode ?? 1,
        executionTimeMs: data.executionTimeMs || 0,
        runtime: data.runtime || 'CLI Subprocess',
        error: data.error || 'CLI execution returned non-zero status.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      stdout: '',
      stderr: `সার্ভার সংযোগ ত্রুটি: ${err.message || 'সংযোগ ব্যর্থ হয়েছে'}। নিশ্চিত করুন 'npm run dev' রানিং আছে।`,
      exitCode: -1,
      executionTimeMs: 0,
      runtime: 'CLI Subprocess',
      error: err.message || 'Network error',
    };
  }
}

/**
 * Send tutoring prompt to the Hybrid Tri-Engine AI Tutor (Gemini Cloud / Local Ollama / CLI Subprocess).
 */
export async function queryCliTutor(payload: {
  mode: string;
  conceptName?: string;
  formulaLatex?: string;
  corePrinciple?: string;
  questionContext?: string;
  retrievedChunks?: any[];
  conversationHistory?: any[];
  userQuery: string;
  imageBase64?: string | null;
  mimeType?: string;
  enginePreference?: TutorEnginePreference;
}): Promise<{ success: boolean; text: string; engine?: string; error?: string }> {
  try {
    const res = await fetch('/api/gemini/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success && data.text) {
      return {
        success: true,
        text: data.text,
        engine: data.engine || 'cli-subprocess',
      };
    } else {
      return {
        success: false,
        text: data.error || 'Tutor session failed.',
        error: data.error,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      text: 'সার্ভারের সাথে সংযোগে বিঘ্ন ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      error: err.message,
    };
  }
}

/**
 * Curated HSC Problem Solver Templates for CLI Sandbox
 */
export const HSC_CLI_TEMPLATES: CliCodeTemplate[] = [
  {
    id: 'phy_carnot',
    title_bn: 'কার্নো ইঞ্জিনের কর্মদক্ষতা ও গ্রাহক তাপমাত্রা হিসাব',
    title_en: 'Carnot Engine Efficiency Calculator',
    language: 'python',
    subject_id: 'phy',
    description_bn: 'উৎস ও গ্রাহকের তাপমাত্রা (সেলসিয়াস বা কেলভিন) থেকে দক্ষতা ও কৃতকাজ হিসাব করে।',
    code: `# HSC পদার্থবিজ্ঞান ২য় পত্র: তাপগতিবিদ্যা
# কার্নো চক্রের দক্ষতা নির্ণয়

T1_celsius = 227  # উৎস তাপমাত্রা (°C)
T2_celsius = 27   # গ্রাহক তাপমাত্রা (°C)
Q1_joules = 1000  # গৃহীত তাপ (Joules)

# কেলভিন এককে রূপান্তর
T1 = T1_celsius + 273.15
T2 = T2_celsius + 273.15

# দক্ষতা সূত্র: eta = 1 - (T2 / T1)
eta = (1 - (T2 / T1))
eta_percent = eta * 100

# কৃতকাজ: W = eta * Q1
W = eta * Q1_joules
Q2 = Q1_joules - W

print(f"--- কার্নো ইঞ্জিন বিশ্লেষণ ফলাফল ---")
print(f"উৎস তাপমাত্রা (T1): {T1:.2f} K ({T1_celsius} °C)")
print(f"গ্রাহক তাপমাত্রা (T2): {T2:.2f} K ({T2_celsius} °C)")
print(f"কর্মদক্ষতা (η): {eta_percent:.2f}%")
print(f"গৃহীত তাপ (Q1): {Q1_joules:.2f} J")
print(f"কৃতকাজ (W): {W:.2f} J")
print(f"বর্জিত তাপ (Q2): {Q2:.2f} J")
`,
  },
  {
    id: 'phy_projectile',
    title_bn: 'প্রাসের গতিপথ, সর্বোচ্চ উচ্চতা ও পাল্লা',
    title_en: 'Projectile Trajectory & Range Solver',
    language: 'python',
    subject_id: 'phy',
    description_bn: 'আদিবেগ ও নিক্ষেপণ কোণ থেকে সর্বোচ্চ উচ্চতা, উড্ডয়নকাল এবং পাল্লা হিসাব করে।',
    code: `import math

# HSC পদার্থবিজ্ঞান ১ম পত্র: গতিবিদ্যা (প্রাসের গতি)
v0 = 40.0   # নিক্ষেপণ বেগ (m/s)
theta_deg = 30.0  # নিক্ষেপণ কোণ (ডিগ্রী)
g = 9.8     # অভিকর্ষজ ত্বরণ (m/s^2)

theta_rad = math.radians(theta_deg)

# ১. সর্বোচ্চ উচ্চতা: H = (v0^2 * sin^2(theta)) / (2g)
H = (v0**2 * (math.sin(theta_rad)**2)) / (2 * g)

# ২. বিচরণকাল / উড্ডয়নকাল: T = (2 * v0 * sin(theta)) / g
T = (2 * v0 * math.sin(theta_rad)) / g

# ৩. পাল্লা: R = (v0^2 * sin(2*theta)) / g
R = (v0**2 * math.sin(2 * theta_rad)) / g

print("--- প্রাসের গতিবিদ্যা সমাধান ---")
print(f"আদিবেগ (v0): {v0} m/s")
print(f"নিক্ষেপণ কোণ (θ): {theta_deg}°")
print(f"সর্বোচ্চ উচ্চতা (H): {H:.3f} m")
print(f"মোট উড্ডয়নকাল (T): {T:.3f} s")
print(f"আনুভূমিক পাল্লা (R): {R:.3f} m")
`,
  },
  {
    id: 'hmath_matrix',
    title_bn: '৩x৩ ম্যাট্রিক্সের নির্ণায়ক ও বিপরীত ম্যাট্রিক্স',
    title_en: '3x3 Matrix Determinant & Inversion',
    language: 'python',
    subject_id: 'hmath',
    description_bn: 'উচ্চতর গণিত ১ম পত্র অধ্যায় ১: ম্যাট্রিক্সের নির্ণায়ক ও ইনভার্স ম্যাট্রিক্স যাচাই।',
    code: `# HSC উচ্চতর গণিত ১ম পত্র: ম্যাট্রিক্স ও নির্ণায়ক
A = [
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0]
]

# নির্ণায়ক (Determinant) গণনা
det = (
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1])
    - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0])
    + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
)

print("ম্যাট্রিক্স A:")
for row in A:
    print(" ", row)

print(f"\\nনির্ণায়ক det(A) = {det}")
if det != 0:
    print("যেহেতু det(A) ≠ 0, তাই ম্যাট্রিক্সটি ব্যতিAddressable/অব্যতিক্রমী (Non-singular)।")
    print("অতএব এর বিপরীত ম্যাট্রিক্স (Inverse Matrix A^-1) বিদ্যমান।")
else:
    print("যেহেতু det(A) = 0, ম্যাট্রিক্সটি ব্যতিক্রমী (Singular)। এর বিপরীত ম্যাট্রিক্স নেই।")
`,
  },
  {
    id: 'chem_ph',
    title_bn: 'বাফার দ্রবণের pH (হেন্ডারসন-হ্যাসেলবালখ সমীকরণ)',
    title_en: 'Buffer Solution pH (Henderson-Hasselbalch)',
    language: 'python',
    subject_id: 'chem',
    description_bn: 'রসায়ন ১ম পত্র অধ্যায় ৪: এসিডিক বাফার দ্রবণের pH গণনা।',
    code: `import math

# HSC রসায়ন ১ম পত্র: রাসায়নিক পরিবর্তন (pH ও বাফার দ্রবণ)
# CH3COOH / CH3COONa এসিডিক বাফার দ্রবণ

Ka = 1.8e-5            # অ্যাসিটিক এসিডের বিয়োজন ধ্রুবক
acid_conc = 0.1        # [Acid] CH3COOH ঘনমাত্রা (M)
salt_conc = 0.15       # [Salt] CH3COONa ঘনমাত্রা (M)

pKa = -math.log10(Ka)

# হেন্ডারসন-হ্যাসেলবালখ সমীকরণ: pH = pKa + log([Salt] / [Acid])
pH = pKa + math.log10(salt_conc / acid_conc)

print("--- বাফার দ্রবণের pH সমাধান ---")
print(f"Ka = {Ka:.2e}")
print(f"pKa = {pKa:.3f}")
print(f"[লবণ] = {salt_conc} M, [এসিড] = {acid_conc} M")
print(f"লবণ/এসিড অনুপাত = {salt_conc / acid_conc:.3f}")
print(f"চূড়ান্ত pH = {pH:.3f}")
`,
  },
  {
    id: 'ict_c_prog',
    title_bn: 'সি প্রোগ্রাম: মৌলিক সংখ্যা ও ফ্যাক্টোরিয়াল যাচাই',
    title_en: 'C Programming: Prime & Factorial',
    language: 'c',
    subject_id: 'ict',
    description_bn: 'HSC ICT অধ্যায় ৫: সি প্রোগ্রামিং ভাষার লুপ ও কন্ডিশনাল লজিক টেস্ট।',
    code: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int num = 7;
    long long fact = 1;
    bool is_prime = true;

    printf("HSC ICT Chapter 5: C Programming Execution\\n");
    printf("Input Number: %d\\n", num);

    if (num <= 1) {
        is_prime = false;
    } else {
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) {
                is_prime = false;
                break;
            }
        }
    }

    for (int i = 1; i <= num; i++) {
        fact *= i;
    }

    printf("Factorial of %d = %lld\\n", num, fact);
    if (is_prime) {
        printf("%d is a PRIME number (মৌলিক সংখ্যা)\\n", num);
    } else {
        printf("%d is NOT a prime number\\n", num);
    }

    return 0;
}
`,
  },
];
