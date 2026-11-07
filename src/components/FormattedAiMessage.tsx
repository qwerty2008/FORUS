import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import katex from "katex";

interface FormattedAiMessageProps {
  text: string;
  isUser?: boolean;
}

/**
 * Converts common raw LaTeX symbols to clean Unicode characters when outside math delimiters
 * or as a fallback if a fragment cannot be parsed by KaTeX.
 */
function replaceRawLatexSymbolsWithUnicode(input: string): string {
  return input
    .replace(/\\implies\b|\\Rightarrow\b/g, "⟹")
    .replace(/\\iff\b|\\Leftrightarrow\b/g, "⟺")
    .replace(/\\to\b|\\rightarrow\b/g, "→")
    .replace(/\\ge\b|\\geq\b/g, "≥")
    .replace(/\\le\b|\\leq\b/g, "≤")
    .replace(/\\ne\b|\\neq\b/g, "≠")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\pm\b/g, "±")
    .replace(/\\mp\b/g, "∓")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\times\b/g, "×")
    .replace(/\\div\b/g, "÷")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\forall\b/g, "∀")
    .replace(/\\exists\b/g, "∃")
    .replace(/\\in\b/g, "∈")
    .replace(/\\notin\b/g, "∉")
    .replace(/\\subset\b/g, "⊂")
    .replace(/\\subseteq\b/g, "⊆")
    .replace(/\\cup\b/g, "∪")
    .replace(/\\cap\b/g, "∩")
    .replace(/\\emptyset\b/g, "∅")
    .replace(/\\Delta\b/g, "Δ")
    .replace(/\\nabla\b/g, "∇")
    .replace(/\\partial\b/g, "∂")
    .replace(/\\alpha\b/g, "α")
    .replace(/\\beta\b/g, "β")
    .replace(/\\gamma\b/g, "γ")
    .replace(/\\delta\b/g, "δ")
    .replace(/\\epsilon\b|\\varepsilon\b/g, "ε")
    .replace(/\\theta\b/g, "θ")
    .replace(/\\lambda\b/g, "λ")
    .replace(/\\mu\b/g, "μ")
    .replace(/\\pi\b/g, "π")
    .replace(/\\sigma\b/g, "σ")
    .replace(/\\omega\b/g, "ω")
    .replace(/\\Omega\b/g, "Ω")
    .replace(/\\sum\b/g, "∑")
    .replace(/\\prod\b/g, "∏")
    .replace(/\\int\b/g, "∫");
}

/**
 * Preprocesses AI markdown text:
 * 1. Converts \[ ... \] -> $$ ... $$ and \( ... \) -> $ ... $
 * 2. Hides raw ```latex / ```tex code blocks by converting formula blocks into visual $$ ... $$ math,
 *    or stripping redundant "Mã LaTeX..." headers and raw LaTeX boxes so the user only sees rendered math.
 */
function preprocessAiMathText(rawText: string): string {
  let processed = rawText;

  // Remove section headers that introduce redundant raw LaTeX blocks
  processed = processed.replace(
    /(?:^\s*(?:\d+\.\s*)?\*{0,2}(?:Mã|Code|Khung(?:\s+code)?)\s+LaTeX[^:\n]*:\*{0,2}\s*\n?)/gim,
    "\n"
  );

  // Handle ```latex ... ``` or ```tex ... ``` blocks:
  // Convert mathematical expressions inside them to visual $$ ... $$ display math,
  // or hide pure preamble boilerplate unless it contains formulas.
  processed = processed.replace(
    /```(?:latex|tex)\s*\n([\s\S]*?)```/gi,
    (_match, inner: string) => {
      const trimmed = inner.trim();
      if (!trimmed) return "";

      // If it's a full Overleaf document template (\documentclass), extract any math or summarize cleanly
      if (trimmed.includes("\\documentclass")) {
        const cleanedLines = trimmed
          .split("\n")
          .filter(
            (l) =>
              !l.trim().startsWith("\\documentclass") &&
              !l.trim().startsWith("\\usepackage") &&
              !l.trim().startsWith("\\begin{document}") &&
              !l.trim().startsWith("\\end{document}") &&
              !l.trim().startsWith("\\maketitle") &&
              !l.trim().startsWith("\\tableofcontents") &&
              !l.trim().startsWith("\\newpage") &&
              !l.trim().startsWith("%")
          );
        if (cleanedLines.length === 0) return "";
        return "";
      }

      // Strip LaTeX comments and package imports inside formula blocks
      const formulaLines = trimmed
        .split("\n")
        .filter(
          (line) =>
            !line.trim().startsWith("%") &&
            !line.trim().startsWith("\\usepackage")
        )
        .join("\n")
        .trim();

      if (!formulaLines) return "";
      return `\n$$\n${formulaLines}\n$$\n`;
    }
  );

  // Convert display math \[ ... \] to $$ ... $$
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner: string) => {
    return `\n$$\n${inner.trim()}\n$$\n`;
  });

  // Convert inline math \( ... \) to $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner: string) => {
    return `$${inner.trim()}$`;
  });

  // Collapse 3+ consecutive newlines
  processed = processed.replace(/\n{3,}/g, "\n\n").trim();

  return processed;
}

/**
 * Safely renders a LaTeX math string to HTML via KaTeX.
 */
function renderMathToHtml(latexExpr: string, displayMode: boolean): string {
  const cleaned = latexExpr
    .trim()
    .replace(/\\begin\{proof\}\[(.*?)\]/g, "\\textbf{$1:} ")
    .replace(/\\begin\{proof\}/g, "\\textbf{Chứng minh:} ")
    .replace(/\\end\{proof\}/g, "");

  try {
    return katex.renderToString(cleaned, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
      output: "htmlAndMathml",
    });
  } catch {
    return replaceRawLatexSymbolsWithUnicode(cleaned);
  }
}

function renderInlineFormatting(line: string): React.ReactNode[] {
  // Match **bold**, `inline code`, and $inline math$
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$\n]+\$)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      // If bold contains inline math $...$, recursively render it
      return (
        <strong
          key={idx}
          className="font-extrabold text-[#0B2545] dark:text-amber-300"
        >
          {inner.includes("$")
            ? renderInlineFormatting(inner)
            : replaceRawLatexSymbolsWithUnicode(inner)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const innerCode = part.slice(1, -1).trim();
      // If someone put a math formula inside backticks like `\frac{a}{b}` or `x^2 - 5x + 6 = 0`, render it nicely
      if (
        /\\(?:frac|sqrt|lim|int|sum|det|begin|ge|le|ne|cdot|pm|Delta|alpha|beta|lambda|pi)\b|\^[0-9a-zA-Z{]/.test(
          innerCode
        )
      ) {
        const html = renderMathToHtml(innerCode, false);
        return (
          <span
            key={idx}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-50/80 dark:bg-slate-800/90 text-[#0B2545] dark:text-amber-200 border border-amber-200/60 dark:border-slate-700 align-middle"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#F3EFE6] dark:bg-slate-700 font-mono text-[11px] sm:text-xs font-bold text-[#D95326] dark:text-amber-300 border border-[#E5DEC9] dark:border-slate-600"
        >
          {innerCode}
        </code>
      );
    }

    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const mathExpr = part.slice(1, -1).trim();
      const html = renderMathToHtml(mathExpr, false);
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 text-[#0B2545] dark:text-amber-200 align-middle"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <React.Fragment key={idx}>
        {replaceRawLatexSymbolsWithUnicode(part)}
      </React.Fragment>
    );
  });
}

export const FormattedAiMessage: React.FC<FormattedAiMessageProps> = ({
  text,
  isUser = false,
}) => {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState<number | null>(null);

  if (isUser) {
    return (
      <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {text}
      </div>
    );
  }

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockIdx(idx);
    setTimeout(() => setCopiedBlockIdx(null), 2000);
  };

  const normalizedText = preprocessAiMathText(text);

  // Split by fenced code blocks ```lang ... ``` or display math $$ ... $$
  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g;
  const segments = normalizedText.split(blockRegex);

  return (
    <div className="space-y-2.5 break-words [overflow-wrap:anywhere]">
      {segments.map((segment, segIdx) => {
        if (!segment || !segment.trim()) return null;

        // Fenced code block (for C++, Python, JS, SQL, etc.)
        if (segment.startsWith("```") && segment.endsWith("```")) {
          const lines = segment.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim() || "";
          const hasLang = /^[a-zA-Z0-9_+-]+$/.test(firstLine);
          const lang = hasLang ? firstLine.toUpperCase() : "CODE";
          const codeContent = hasLang
            ? lines.slice(1).join("\n")
            : lines.join("\n");

          return (
            <div
              key={segIdx}
              className="my-2 rounded-xl overflow-hidden border border-[#E5DEC9] dark:border-slate-700 bg-[#0B2545] text-slate-100 shadow-2xs"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#071930] border-b border-white/10 text-[10px] font-mono">
                <span className="font-bold text-amber-300 uppercase tracking-wider">
                  {lang}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, segIdx)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition cursor-pointer"
                >
                  {copiedBlockIdx === segIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] sm:text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Visual Display Math Block $$ ... $$ rendered via KaTeX
        if (segment.startsWith("$$") && segment.endsWith("$$")) {
          const mathContent = segment.slice(2, -2).trim();
          if (!mathContent) return null;
          const html = renderMathToHtml(mathContent, true);
          return (
            <div
              key={segIdx}
              className="my-2 rounded-2xl border border-[#E5DEC9] dark:border-slate-700 bg-[#F3EFE6]/85 dark:bg-slate-900/90 px-4 py-3 text-[#0B2545] dark:text-amber-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        // Regular markdown lines
        const lines = segment.split("\n");
        return (
          <div key={segIdx} className="space-y-1.5">
            {lines.map((rawLine, lineIdx) => {
              const line = rawLine.trim();
              if (!line) return <div key={lineIdx} className="h-1" />;

              if (line === "---" || line === "***") {
                return (
                  <hr
                    key={lineIdx}
                    className="my-2 border-[#E5DEC9] dark:border-slate-700"
                  />
                );
              }

              // Headings ####, ###, or ##
              if (line.startsWith("#### ")) {
                return (
                  <h5
                    key={lineIdx}
                    className="pt-1 text-xs font-extrabold text-[#0B2545] dark:text-amber-300"
                  >
                    {renderInlineFormatting(line.slice(5))}
                  </h5>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h4
                    key={lineIdx}
                    className="pt-1 text-xs sm:text-sm font-extrabold text-[#D95326] dark:text-amber-400"
                  >
                    {renderInlineFormatting(line.slice(4))}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3
                    key={lineIdx}
                    className="pt-1 text-sm sm:text-base font-extrabold text-[#0B2545] dark:text-white"
                  >
                    {renderInlineFormatting(line.slice(3))}
                  </h3>
                );
              }

              // Bullet points
              if (
                line.startsWith("• ") ||
                line.startsWith("- ") ||
                line.startsWith("* ")
              ) {
                return (
                  <div
                    key={lineIdx}
                    className="flex items-start gap-2 pl-1 leading-relaxed"
                  >
                    <span className="text-[#D95326] dark:text-amber-400 font-extrabold mt-0.5 shrink-0">
                      •
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineFormatting(line.slice(2))}
                    </div>
                  </div>
                );
              }

              // Numbered list (1. , 2. , etc.)
              const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div
                    key={lineIdx}
                    className="flex items-start gap-2 pl-0.5 leading-relaxed"
                  >
                    <span className="font-mono font-extrabold text-[#0B2545] dark:text-amber-300 shrink-0">
                      {numMatch[1]}
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineFormatting(numMatch[2])}
                    </div>
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="leading-relaxed">
                  {renderInlineFormatting(rawLine)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
