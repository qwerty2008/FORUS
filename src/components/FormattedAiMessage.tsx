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

  processed = processed.replace(
    /(?:^\s*(?:\d+\.\s*)?\*{0,2}(?:Mã|Code|Khung(?:\s+code)?)\s+LaTeX[^:\n]*:\*{0,2}\s*\n?)/gim,
    "\n"
  );

  processed = processed.replace(
    /```(?:latex|tex)\s*\n([\s\S]*?)```/gi,
    (_match, inner: string) => {
      const trimmed = inner.trim();
      if (!trimmed) return "";

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

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner: string) => {
    return `\n$$\n${inner.trim()}\n$$\n`;
  });

  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner: string) => {
    return `$${inner.trim()}$`;
  });

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
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$\n]+\$)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={idx}
          className="font-bold text-current"
        >
          {inner.includes("$")
            ? renderInlineFormatting(inner)
            : replaceRawLatexSymbolsWithUnicode(inner)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const innerCode = part.slice(1, -1).trim();
      if (
        /\\(?:frac|sqrt|lim|int|sum|det|begin|ge|le|ne|cdot|pm|Delta|alpha|beta|lambda|pi)\b|\^[0-9a-zA-Z{]/.test(
          innerCode
        )
      ) {
        const html = renderMathToHtml(innerCode, false);
        return (
          <span
            key={idx}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-[#F1F5F9] dark:bg-[#0E1624] text-[#0B2545] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#233044] align-middle"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#F1F5F9] dark:bg-[#0E1624] text-tiny font-bold text-[#D95326] border border-[#E2E8F0] dark:border-[#233044]"
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
          className="inline-block mx-1 px-1.5 py-0.5 rounded-[3px] bg-[#F1F5F9] dark:bg-[#0E1624]/90 text-[#0B2545] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#233044] align-middle"
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

  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g;
  const segments = normalizedText.split(blockRegex);

  return (
    <div className="space-y-2.5 break-words [overflow-wrap:anywhere]">
      {segments.map((segment, segIdx) => {
        if (!segment || !segment.trim()) return null;

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
              className="my-2 rounded-md overflow-hidden border border-[#DCD5C7] dark:border-[#233044] bg-[#0B2545] text-[#F6F2E8]"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0E1624] border-b border-white/10 text-tiny">
                <span className="font-bold text-[#D95326] uppercase tracking-wider">
                  {lang}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, segIdx)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
                >
                  {copiedBlockIdx === segIdx ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-tiny leading-relaxed overflow-x-auto whitespace-pre">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        if (segment.startsWith("$$") && segment.endsWith("$$")) {
          const mathContent = segment.slice(2, -2).trim();
          if (!mathContent) return null;
          const html = renderMathToHtml(mathContent, true);
          return (
            <div
              key={segIdx}
              className="my-2.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] px-4 py-3 text-[#0B2545] dark:text-[#F8FAFC] overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

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
                    className="my-2 border-[#DCD5C7] dark:border-[#233044]"
                  />
                );
              }

              if (line.startsWith("#### ")) {
                return (
                  <h5
                    key={lineIdx}
                    className="pt-1 text-tiny font-bold text-[#0B2545] dark:text-[#F6F2E8]"
                  >
                    {renderInlineFormatting(line.slice(5))}
                  </h5>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h4
                    key={lineIdx}
                    className="pt-1 text-small font-bold text-[#D95326]"
                  >
                    {renderInlineFormatting(line.slice(4))}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3
                    key={lineIdx}
                    className="pt-1 text-body font-bold text-[#0B2545] dark:text-[#F6F2E8]"
                  >
                    {renderInlineFormatting(line.slice(3))}
                  </h3>
                );
              }

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
                    <span className="text-[#D95326] font-bold mt-0.5 shrink-0">
                      •
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineFormatting(line.slice(2))}
                    </div>
                  </div>
                );
              }

              const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div
                    key={lineIdx}
                    className="flex items-start gap-2 pl-0.5 leading-relaxed"
                  >
                    <span className="font-bold tabular-nums text-[#D95326] shrink-0">
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
