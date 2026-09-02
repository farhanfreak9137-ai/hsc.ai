/**
 * Normalizes LaTeX markup, Bengali text wrappers, document tags,
 * and raw unwrapped math formulas into clean Markdown + KaTeX.
 */
export function preprocessMathText(raw?: string | null): string {
  if (!raw) return '';
  let text = String(raw).trim();

  // 1. Normalize literal escaped newlines
  text = text.replace(/\\n/g, '\n');

  // 2. Normalize LaTeX document structures & styling
  text = text.replace(/\\par\b/g, '\n\n');
  text = text.replace(/\\textbf\{([^{}]+)\}/g, '**$1**');
  text = text.replace(/\\textit\{([^{}]+)\}/g, '*$1*');
  text = text.replace(/\\underline\{([^{}]+)\}/g, '<u>$1</u>');
  
  // Enumerate & itemize environments
  text = text.replace(/\\begin\{enumerate\}/g, '\n');
  text = text.replace(/\\end\{enumerate\}/g, '\n');
  text = text.replace(/\\begin\{itemize\}/g, '\n');
  text = text.replace(/\\end\{itemize\}/g, '\n');
  text = text.replace(/\\item\s*/g, '\n- ');

  // 3. If text contains \begin{aligned}, \begin{cases}, etc. not wrapped in $, wrap it
  text = text.replace(/(?<!\$)(?:\\begin\{(?:aligned|matrix|bmatrix|pmatrix|vmatrix|cases|gather|equation)\}[\s\S]*?\\end\{(?:aligned|matrix|bmatrix|pmatrix|vmatrix|cases|gather|equation)\})(?!\$)/g, (match) => {
    return `\n$$\n${match}\n$$\n`;
  });

  // 4. Temporarily protect existing block ($$...$$) and inline ($...$) math
  const preservedMath: string[] = [];
  const placeholder = (idx: number) => `___PRESERVED_MATH_${idx}___`;

  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    preservedMath.push(`$$\n${math.trim()}\n$$`);
    return `\n\n${placeholder(preservedMath.length - 1)}\n\n`;
  });

  text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    preservedMath.push(`$${math.trim()}$`);
    return ` ${placeholder(preservedMath.length - 1)} `;
  });

  // 5. Unwrap Bengali text from \text{...} so it renders with native Bengali font
  // Bengali Unicode range: \u0980-\u09FF
  let prev = '';
  while (prev !== text) {
    prev = text;
    text = text.replace(/\\text\{([^{}]*[\u0980-\u09FF][^{}]*)\}/g, ' $1 ');
  }

  // 6. Handle LaTeX line breaks (\\ or trailing \) outside preserved math
  text = text.replace(/\\+(\s*\n|$)/g, '\n\n');
  text = text.replace(/\\\\+/g, '\n\n');

  // 7. Process lines to wrap unwrapped math formulas
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    let trimmed = line.trim();
    if (!trimmed) return '';
    // Skip already protected blocks or markdown lists
    if (trimmed.startsWith('___PRESERVED_MATH_') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return line;
    }

    // If line has no LaTeX commands or math operators, return as is
    if (!/[\\=\^_{}<>]/.test(trimmed)) {
      return line;
    }

    // Tokenize into Bengali text segments vs potential Math formula segments
    const tokens: { text: string; isBengali: boolean }[] = [];
    let cur = '';
    let isCurBn = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      // Treat Bengali chars, danda, and punctuation attached to text as Bengali text
      const isBn = /[\u0980-\u09FF।]/.test(char) || (isCurBn && /[:;,–—"'\s]/.test(char) && !/[\\=\^_{}<>+\-*/]/.test(char));

      if (i === 0) {
        isCurBn = isBn;
        cur = char;
      } else {
        if (isBn === isCurBn) {
          cur += char;
        } else {
          tokens.push({ text: cur, isBengali: isCurBn });
          cur = char;
          isCurBn = isBn;
        }
      }
    }
    if (cur) tokens.push({ text: cur, isBengali: isCurBn });

    const lineOutput = tokens.map(token => {
      if (token.isBengali || token.text.includes('___PRESERVED_MATH_')) {
        return token.text;
      }

      let str = token.text;
      let strTrim = str.trim();
      if (!strTrim) return str;

      // Extract leading/trailing colon or punctuation from math candidate
      let prefix = '';
      let suffix = '';
      if (/^[:;,-]/.test(strTrim)) {
        prefix = strTrim.slice(0, 1) + ' ';
        strTrim = strTrim.slice(1).trim();
      }
      if (/[.,;:?!]$/.test(strTrim) && !strTrim.endsWith('...')) {
        suffix = strTrim.slice(-1);
        strTrim = strTrim.slice(0, -1).trim();
      }

      if (!strTrim) return prefix + suffix;

      // Check if this segment is a math formula
      const hasMathCmd = /\\(?:vec|frac|times|sum|int|sqrt|alpha|beta|gamma|delta|theta|pi|omega|tau|mu|eta|rho|lambda|partial|nabla|infty|approx|neq|leq|geq|implies|therefore|pm|cdot|circ|hat|sin|cos|tan|cot|sec|csc|ln|log|lim|to|quad|qquad|left|right|text|over|bar|tilde|partial)\b|[=\^_{}]/.test(strTrim);

      if (hasMathCmd) {
        return `${prefix} $${strTrim}$ ${suffix}`;
      }

      return str;
    }).join('');

    return lineOutput;
  });

  text = processedLines.join('\n\n');

  // 8. Restore preserved math blocks
  text = text.replace(/___PRESERVED_MATH_(\d+)___/g, (_, idx) => preservedMath[Number(idx)]);

  // 9. Trim spaces strictly INSIDE math delimiters $ ... $
  text = text.replace(/\$\s+([^$\n]+?)\$/g, '$$$1$$');
  text = text.replace(/\$([^$\n]+?)\s+\$/g, '$$$1$$');
  text = text.replace(/\$\s*\$/g, '');

  // Ensure healthy spacing between Bengali characters and math formulas
  text = text.replace(/([\u0980-\u09FF])\$/g, '$1 $');
  text = text.replace(/\$([\u0980-\u09FF])/g, '$ $1');
  text = text.replace(/([।!?])\$/g, '$1 $');

  // Normalize duplicate whitespace
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
