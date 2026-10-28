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
  ShieldCheck,
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

  // Special Editorial Textbook Illustration (Matches Screenshot 2 Card 3)
  if (fallbackIcon === "TextbookStack" || code.includes("FORUS-08")) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[#EEF4FB] dark:bg-slate-800 ${className}`}
      >
        <div className="pointer-events-none absolute -top-6 right-8 h-36 w-36 rounded-full bg-[#DCE8F7] dark:bg-slate-700/60" />
        <div className="relative z-10 flex items-center justify-center py-4">
          {/* Left Navy Book */}
          <div className="w-28 sm:w-32 h-36 sm:h-40 -rotate-6 rounded-lg bg-[#0B2545] border-l-4 border-[#D95326] p-2.5 text-white shadow-lg flex flex-col justify-between">
            <span className="font-mono text-[8px] tracking-wider text-slate-300">
              ĐHQG-HCM · KHTN
            </span>
            <div>
              <p className="font-extrabold text-[11px] leading-tight uppercase">
                ĐẠI SỐ TUYẾN TÍNH
              </p>
              <p className="mt-1 font-mono text-[8px] text-sky-300">
                [ A | I ] · SVD · Eigen
              </p>
            </div>
            <span className="font-mono text-[7px] text-amber-300">
              Mới 100% / 90% / 80%
            </span>
          </div>

          {/* Right White/Orange Book */}
          <div className="-ml-4 w-30 sm:w-34 h-38 sm:h-42 rotate-3 rounded-lg bg-white border-2 border-[#D95326] p-2.5 text-[#0B2545] shadow-xl flex flex-col justify-between">
            <span className="font-mono text-[8px] font-bold text-[#D95326]">
              FIT PASSBOOK · CS1
            </span>
            <div>
              <p className="font-extrabold text-xs leading-tight text-[#0B2545]">
                VI TÍCH PHÂN 1B
              </p>
              <p className="text-[8px] text-[#64748B] mt-0.5">
                Chuỗi số &amp; Tích phân suy rộng
              </p>
              {/* Sine wave curve */}
              <svg
                viewBox="0 0 100 28"
                className="w-full h-6 mt-1 stroke-[#D95326] fill-none"
                strokeWidth="2.5"
              >
                <path d="M 4 22 Q 28 2, 52 14 T 96 8" />
              </svg>
            </div>
            <span className="rounded bg-[#FFF3D6] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#B45309] text-center">
              + Tặng Note giải đề KHTN
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Special Lab Coat (Áo Blouse) Illustration for FORUS-09
  if (fallbackIcon === "LabCoat" || code.includes("FORUS-09")) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#EEF4FB] via-[#F8FAFC] to-[#E2E8F0] dark:from-slate-800 dark:to-slate-900 p-5 ${className}`}
      >
        <div className="flex items-center justify-between text-xs font-mono text-[#0B2545] dark:text-slate-200">
          <span className="font-bold text-[#D95326]">FORUS-09 · LAB CS1</span>
          <span>Size S · M · L · XL</span>
        </div>

        <div className="my-auto flex items-center justify-center gap-4">
          {/* Crisp White Lab Coat Graphic */}
          <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-[#0B2545]/15 bg-white shadow-md dark:bg-slate-800">
            <svg
              viewBox="0 0 64 64"
              className="h-20 w-20 stroke-[#0B2545] dark:stroke-sky-300 fill-none"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10 L12 18 L16 30 L20 26 L20 54 L44 54 L44 26 L48 30 L52 18 L42 10 Z" />
              <path d="M22 10 L32 24 L42 10" />
              <line x1="32" y1="24" x2="32" y2="54" />
              <rect
                x="35"
                y="34"
                width="6"
                height="7"
                rx="1"
                className="stroke-[#D95326]"
              />
              <circle cx="29" cy="30" r="1" fill="currentColor" />
              <circle cx="29" cy="38" r="1" fill="currentColor" />
              <circle cx="29" cy="46" r="1" fill="currentColor" />
            </svg>
          </div>

          <div className="space-y-1.5 text-left">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0B2545] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Đã giặt khử khuẩn
            </span>
            <p className="text-xs font-extrabold text-[#0B2545] dark:text-white leading-snug">
              Áo Blouse Trắng Chuẩn Phòng Lab
            </p>
            <p className="font-mono text-[11px] font-semibold text-[#D95326] dark:text-amber-400">
              Thuê 15k · Mua 80% / 90% / Mới 100%
            </p>
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#4A5568] dark:text-slate-300 truncate">
          Nhận liền trước ca thực hành Hóa – Sinh – Vật liệu tại 227 NVC
        </div>
      </div>
    );
  }

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
      <div
        className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/80 ${className}`}
      >
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 font-mono text-[11px] font-semibold text-white/95 drop-shadow">
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
        {fallbackIcon === "Sparkles" && code.includes("FORUS-06") && (
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
