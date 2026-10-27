import React, { useState } from "react";
import {
  PenTool,
  Keyboard,
  BookOpen,
  Laptop,
  Terminal,
  Sparkles,
  Calculator,
  Utensils,
  Flame,
  Coffee,
  CupSoda,
  Package,
} from "lucide-react";

interface ProductVisualProps {
  imageUrl?: string;
  alt: string;
  fallbackIcon: string;
  fallbackGradient: string;
  code: string;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  imageUrl,
  alt,
  fallbackIcon,
  fallbackGradient,
  code,
  className = "h-56 w-full",
}) => {
  const [imgError, setImgError] = useState(false);

  const renderIcon = () => {
    const props = { className: "w-10 h-10 text-sky-300/90 stroke-[1.5]" };
    switch (fallbackIcon) {
      case "PenTool":
        return <PenTool {...props} />;
      case "Keyboard":
        return <Keyboard {...props} />;
      case "BookOpen":
        return <BookOpen {...props} />;
      case "Laptop":
        return <Laptop {...props} />;
      case "Terminal":
        return <Terminal {...props} />;
      case "Sparkles":
        return <Sparkles {...props} />;
      case "Calculator":
        return <Calculator {...props} />;
      case "Utensils":
        return <Utensils {...props} />;
      case "Flame":
        return <Flame {...props} />;
      case "Coffee":
        return <Coffee {...props} />;
      case "CupSoda":
        return <CupSoda {...props} />;
      default:
        return <Package {...props} />;
    }
  };

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/80 ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 font-mono text-[11px] font-medium text-white/90 drop-shadow">
          {code}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${fallbackGradient} p-5 text-white ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-300/80">
        <span className="font-mono">{code}</span>
        <span>FORUS CS1 · HCMUS</span>
      </div>

      <div className="my-auto flex flex-col items-start gap-2.5">
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
          {renderIcon()}
        </div>
        {fallbackIcon === "Sparkles" && code === "FORUS-06" && (
          <div className="font-mono text-xs tracking-wider text-sky-200/90">
            ∀x ∈ ℝ · ∃y : P(x) ⇒ Q(y) ⇔ ∫f(x)dx
          </div>
        )}
        {fallbackIcon === "Terminal" && (
          <div className="font-mono text-[11px] text-emerald-300/90">
            \documentclass[a4paper]&#123;article&#125; · \usepackage&#123;amsmath&#125;
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-300/80 line-clamp-1">{alt}</div>
    </div>
  );
};

export default ProductVisual;
