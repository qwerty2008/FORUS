import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface FormattedAiMessageProps {
  text: string;
  isUser?: boolean;
}

function renderInlineFormatting(line: string): React.ReactNode[] {
  // Handle **bold**, `inline code`, and $inline math$
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$\n]+\$)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong
          key={idx}
          className="font-extrabold text-[#0B2545] dark:text-amber-300"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#F3EFE6] dark:bg-slate-700 font-mono text-[11px] sm:text-xs font-bold text-[#D95326] dark:text-amber-300 border border-[#E5DEC9] dark:border-slate-600"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-50 dark:bg-slate-900 font-mono text-[11px] sm:text-xs font-semibold text-[#0B2545] dark:text-amber-200 border border-amber-200/70 dark:border-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
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

  // Split by fenced code blocks ```lang ... ``` or display math $$ ... $$
  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g;
  const segments = text.split(blockRegex);

  return (
    <div className="space-y-2.5 break-words [overflow-wrap:anywhere]">
      {segments.map((segment, segIdx) => {
        if (!segment || !segment.trim()) return null;

        // Fenced code block
        if (segment.startsWith("```") && segment.endsWith("```")) {
          const lines = segment.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim() || "";
          const hasLang = /^[a-zA-Z0-9_+-]+$/.test(firstLine);
          const lang = hasLang ? firstLine.toUpperCase() : "CODE / LATEX";
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

        // Display math block $$ ... $$
        if (segment.startsWith("$$") && segment.endsWith("$$")) {
          const mathContent = segment.slice(2, -2).trim();
          return (
            <div
              key={segIdx}
              className="my-2 rounded-xl border border-amber-300/60 dark:border-slate-700 bg-[#F3EFE6] dark:bg-slate-900 px-3.5 py-2.5 font-mono text-xs sm:text-sm font-bold text-[#0B2545] dark:text-amber-300 overflow-x-auto flex items-center justify-between gap-2"
            >
              <span className="whitespace-pre-wrap break-words">
                {mathContent}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(mathContent, segIdx)}
                title="Sao chép công thức"
                className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800 hover:bg-white text-[#0B2545] dark:text-slate-200 shrink-0 transition cursor-pointer"
              >
                {copiedBlockIdx === segIdx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
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

              // Headings ### or ##
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
