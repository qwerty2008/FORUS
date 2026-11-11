import React, { useState, useEffect } from "react";
import {
  PenTool,
  Keyboard,
  BookOpen,
  Laptop,
  Terminal,
  Sparkles,
  Calculator,
  Package,
  ShieldCheck,
} from "lucide-react";

interface ProductVisualProps {
  imageUrl?: string;
  alt: string;
  fallbackIcon: string;
  fallbackGradient?: string;
  code: string;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  imageUrl,
  alt,
  fallbackIcon,
  code,
  className = "aspect-[4/3] w-full",
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [imageUrl]);

  const isPortraitProduct =
    code.includes("FORUS-07") ||
    code.includes("FORUS-08") ||
    code.includes("FORUS-09") ||
    fallbackIcon === "Calculator" ||
    fallbackIcon === "TextbookStack" ||
    fallbackIcon === "LabCoat";

  if (imageUrl && !imgError) {
    return (
      <div
        className={`relative overflow-hidden bg-[#EFEAE0] dark:bg-[#152033] ${
          isPortraitProduct ? "flex items-center justify-center p-4" : ""
        } ${className}`}
      >
        {!imgLoaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse bg-[#E5DEC9]/60 dark:bg-[#1E2B42]"
          />
        )}
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`relative z-10 h-full w-full transition-transform duration-300 group-hover:scale-[1.03] ${
            isPortraitProduct ? "object-contain" : "object-cover"
          } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
    );
  }

  // Editorial Textbook Fallback
  if (fallbackIcon === "TextbookStack" || code.includes("FORUS-08")) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[#EFEAE0] dark:bg-[#152033] p-6 ${className}`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          <div className="w-28 h-36 -rotate-3 rounded bg-[#0B2545] border border-[#DCD5C7]/30 p-3 text-[#F6F2E8] flex flex-col justify-between">
            <span className="text-tiny text-[#F6F2E8]/70">ĐHQG-HCM · KHTN</span>
            <div>
              <p className="font-bold text-tiny leading-tight">
                ĐẠI SỐ TUYẾN TÍNH
              </p>
              <p className="mt-1 text-tiny text-[#F6F2E8]/80">SVD · Eigen</p>
            </div>
            <span className="text-tiny text-[#D95326] font-bold">FORUS</span>
          </div>

          <div className="-ml-4 w-28 h-36 rotate-3 rounded bg-[#F6F2E8] dark:bg-[#0E1624] border border-[#0B2545] dark:border-[#F6F2E8]/30 p-3 text-[#0B2545] dark:text-[#F6F2E8] flex flex-col justify-between">
            <span className="text-tiny font-bold text-[#D95326]">CS1 · 227 NVC</span>
            <div>
              <p className="font-bold text-tiny leading-tight">
                VI TÍCH PHÂN 1B
              </p>
              <svg
                viewBox="0 0 100 28"
                className="w-full h-5 mt-2 stroke-[#D95326] fill-none"
                strokeWidth="2"
              >
                <path d="M 4 22 Q 28 2, 52 14 T 96 8" />
              </svg>
            </div>
            <span className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
              Thuê / Mua
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Lab Coat (Áo Blouse) Fallback
  if (fallbackIcon === "LabCoat" || code.includes("FORUS-09")) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden bg-[#EFEAE0] dark:bg-[#152033] p-5 ${className}`}
      >
        <div className="flex items-center justify-between text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
          <span className="font-bold text-[#D95326]">FORUS-09</span>
          <span>Size S · M · L · XL</span>
        </div>

        <div className="my-auto flex items-center justify-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded border border-[#DCD5C7] bg-[#F6F2E8] dark:border-[#233044] dark:bg-[#0E1624]">
            <svg
              viewBox="0 0 64 64"
              className="h-16 w-16 stroke-[#0B2545] dark:stroke-[#F6F2E8] fill-none"
              strokeWidth="2"
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
            </svg>
          </div>
          <div className="space-y-1 text-left">
            <span className="inline-flex items-center gap-1 text-tiny font-bold text-[#0B2545] dark:text-[#F6F2E8]">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              Đã giặt khử khuẩn
            </span>
            <p className="text-small font-bold text-[#0B2545] dark:text-[#F6F2E8]">
              Áo Blouse Phòng Lab
            </p>
          </div>
        </div>

        <div className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 truncate">
          Nhận tại Sảnh Tòa I · 227 Nguyễn Văn Cừ
        </div>
      </div>
    );
  }

  const renderIcon = () => {
    const props = {
      className:
        "w-8 h-8 text-[#0B2545] dark:text-[#F6F2E8] stroke-[1.5]",
    };
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
      default:
        return <Package {...props} />;
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-[#EFEAE0] dark:bg-[#152033] p-5 text-[#0B2545] dark:text-[#F6F2E8] ${className}`}
    >
      <div className="flex items-center justify-between text-tiny text-[#0B2545]/60 dark:text-[#F6F2E8]/60">
        <span>{code}</span>
        <span>227 NVC</span>
      </div>

      <div className="my-auto flex flex-col items-start gap-2">
        <div className="rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#F6F2E8] dark:bg-[#0E1624] p-3">
          {renderIcon()}
        </div>
      </div>

      <div className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 truncate">
        {alt}
      </div>
    </div>
  );
};

export default ProductVisual;
