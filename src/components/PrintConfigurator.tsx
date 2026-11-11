import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Check,
  ShoppingBag,
  FileUp,
  X,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { PrintOrderConfig } from "../types";
import { PRINT_PRICING_TABLE, CAMPUS_BUILDINGS_CS1 } from "../data/forusData";

interface PrintConfiguratorProps {
  onAddPrintToCart: (
    config: PrintOrderConfig,
    calculatedPrice: number,
    pointsEarned: number
  ) => void;
}

const PICKUP_TIME_SLOTS = [
  "07:10 – 07:30 (Trước giờ vào tiết 1)",
  "09:15 – 09:35 (Giải lao giữa Ca sáng)",
  "11:30 – 12:15 (Nghỉ trưa tại Sảnh Tòa I / Thư viện)",
  "14:45 – 15:05 (Giải lao giữa Ca chiều)",
];

export const PrintConfigurator: React.FC<PrintConfiguratorProps> = ({
  onAddPrintToCart,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const [config, setConfig] = useState<PrintOrderConfig>({
    fileName: "Bao_Cao_Do_An_1_CSC00006.pdf",
    paperSize: "A4",
    colorMode: "bw",
    sides: "2-side",
    pageCount: 24,
    copies: 1,
    binding: "spiral-plastic",
    standRental: "none",
    pickupLocation: CAMPUS_BUILDINGS_CS1[0],
    note: PICKUP_TIME_SLOTS[1],
  });

  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    name: string;
    sizeLabel: string;
    ext: string;
    autoDetectedPages?: number;
  } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [studentNameInput, setStudentNameInput] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [addedToast, setAddedToast] = useState(false);
  const [paperMaterial, setPaperMaterial] = useState<"fort" | "couche">("fort");

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processSelectedFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const sizeLabel = formatFileSize(file.size);
    let detectedPages: number | undefined = undefined;

    if (ext === "PDF" && file.size < 25 * 1024 * 1024) {
      try {
        const buffer = await file.arrayBuffer();
        const text = new TextDecoder("latin1").decode(buffer);
        const matches = text.match(/\/Type\s*\/Page\b/g);
        if (matches && matches.length > 0 && matches.length <= 2000) {
          detectedPages = matches.length;
        }
      } catch {
        // Fallback if binary read fails
      }
    } else if (["PNG", "JPG", "JPEG", "WEBP"].includes(ext)) {
      detectedPages = 1;
    }

    setUploadedFileMeta({
      name: file.name,
      sizeLabel,
      ext,
      autoDetectedPages: detectedPages,
    });

    setConfig((prev) => ({
      ...prev,
      fileName: file.name,
      pageCount: detectedPages ?? prev.pageCount,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFileMeta(null);
    setConfig((prev) => ({
      ...prev,
      fileName: "Bao_Cao_Do_An_1_CSC00006.pdf",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sizeOrder: ("A5" | "A4" | "A3" | "A2" | "A1")[] = [
    "A5",
    "A4",
    "A3",
    "A2",
    "A1",
  ];

  // Exact pricing math preserved
  const sizeInfo = PRINT_PRICING_TABLE[config.paperSize];
  const totalSheets = config.pageCount * config.copies;
  const isBulkOrder = totalSheets >= 100;

  const basePagePrice =
    config.colorMode === "bw"
      ? isBulkOrder
        ? sizeInfo.bwBulkPrice
        : sizeInfo.bwPrice
      : paperMaterial === "couche"
      ? sizeInfo.colorCouchePrice
      : sizeInfo.colorPrice;

  const sideMultiplier =
    config.sides === "2-side" &&
    (config.paperSize === "A4" ||
      config.paperSize === "A5" ||
      config.paperSize === "A3")
      ? 0.85
      : 1;

  const bindingFee =
    config.binding === "spiral-plastic"
      ? 12000
      : config.binding === "poster-tube"
      ? 15000
      : config.binding === "staple"
      ? 2000
      : 0;

  const standRentalFee =
    config.standRental === "stand-session"
      ? 10000
      : config.standRental === "stand-day"
      ? 15000
      : config.standRental === "stand-week"
      ? 30000
      : 0;

  const singleCopyCost =
    Math.round(basePagePrice * config.pageCount * sideMultiplier) + bindingFee;
  const totalPrice = Math.max(
    2000,
    singleCopyCost * config.copies + standRentalFee
  );
  const pointsEarned =
    config.paperSize === "A1" ||
    config.paperSize === "A2" ||
    standRentalFee > 0 ||
    totalPrice >= 40000
      ? 10
      : 6;

  const handleSelectPaperSize = (size: PrintOrderConfig["paperSize"]) => {
    const isLargePoster = size === "A1" || size === "A2";
    setConfig((prev) => ({
      ...prev,
      paperSize: size,
      sides: isLargePoster ? "1-side" : prev.sides,
      binding: isLargePoster ? "poster-tube" : prev.binding,
    }));
  };

  // Step 1 validation
  const step1Error: string | null = !config.paperSize
    ? "Vui lòng chọn khổ giấy in."
    : !Number.isFinite(config.pageCount) || config.pageCount < 1
    ? "Số trang phải từ 1 trở lên."
    : !Number.isFinite(config.copies) || config.copies < 1
    ? "Số bản in phải từ 1 trở lên."
    : !config.fileName.trim()
    ? "Vui lòng tải tệp hoặc nhập tên tài liệu."
    : null;

  const isStep1Valid = step1Error === null;

  const goToStep = (nextStep: 1 | 2) => {
    if (nextStep === 2 && !isStep1Valid) return;
    setStep(nextStep);
    if (wizardTopRef.current) {
      wizardTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && step === 1) {
      const target = e.target as HTMLElement;
      if (target.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (isStep1Valid) {
          goToStep(2);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (isStep1Valid) {
        goToStep(2);
      }
      return;
    }
    onAddPrintToCart(config, totalPrice, pointsEarned);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const isLargePosterSelected =
    config.paperSize === "A1" || config.paperSize === "A2";

  return (
    <div ref={wizardTopRef} className="max-w-3xl mx-auto pb-28 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#E2E8F0] dark:border-[#233044] pb-5 pl-4 margin-rule space-y-1.5">
        <h1 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
          In tài liệu, giáo trình &amp; poster A5 – A1
        </h1>
        <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75 max-w-2xl">
          Gửi file trực tuyến, tự động áp giá sỉ từ 100 tờ và nhận bản in ngay tại Sảnh Tòa I hoặc Thư viện Cơ sở 1.
        </p>

        {/* Simple Step Progress Indicator */}
        <div className="pt-4 flex items-center gap-6 text-small">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className={`flex items-center gap-2 pb-2 border-b-2 transition cursor-pointer ${
              step === 1
                ? "border-[#D95326] font-bold text-[#0B2545] dark:text-[#F6F2E8]"
                : "border-transparent text-[#0B2545]/60 dark:text-[#F6F2E8]/60 hover:text-[#0B2545]"
            }`}
          >
            <span>1 Cấu hình in</span>
          </button>
          <span aria-hidden="true" className="text-[#0B2545]/40 dark:text-[#F6F2E8]/40 pb-2">
            /
          </span>
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={!isStep1Valid}
            className={`flex items-center gap-2 pb-2 border-b-2 transition ${
              step === 2
                ? "border-[#D95326] font-bold text-[#0B2545] dark:text-[#F6F2E8] cursor-pointer"
                : isStep1Valid
                ? "border-transparent text-[#0B2545]/60 dark:text-[#F6F2E8]/60 hover:text-[#0B2545] cursor-pointer"
                : "border-transparent text-[#0B2545]/30 dark:text-[#F6F2E8]/30 cursor-not-allowed"
            }`}
          >
            <span>2 Lịch nhận</span>
          </button>
        </div>
      </div>

      {/* Single-Column Wizard Form */}
      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="print-step-1"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="space-y-8"
            >
              {/* 1. Paper Size Selector */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <label className="text-body font-bold">
                    1. Chọn khổ giấy (A5 – A1)
                  </label>
                  <span className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                    Đang chọn: Khổ {config.paperSize} ({sizeInfo.dimensions})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {sizeOrder.map((sz) => {
                    const info = PRINT_PRICING_TABLE[sz];
                    const isSelected = config.paperSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSelectPaperSize(sz)}
                        className={`flex flex-col justify-between rounded border p-3.5 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-[#0B2545] bg-[#0B2545] text-[#F6F2E8] dark:border-[#F6F2E8] dark:bg-[#F6F2E8] dark:text-[#0B2545]"
                            : "border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0]/60 dark:bg-[#152033]/60 hover:border-[#0B2545]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-body font-bold">Khổ {sz}</span>
                            <span className="text-tiny opacity-75">
                              {info.dimensions.split(" ")[0]}cm
                            </span>
                          </div>
                          <p className="mt-1 text-tiny opacity-80 line-clamp-2">
                            {info.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-current/15">
                          <span
                            className={`text-tiny font-bold tabular-nums ${
                              isSelected ? "text-[#F6F2E8] dark:text-[#0B2545]" : "text-[#D95326]"
                            }`}
                          >
                            {config.colorMode === "bw"
                              ? info.bwSmallRange
                              : paperMaterial === "couche"
                              ? info.colorCoucheRange
                              : info.colorRegularRange}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isLargePosterSelected && (
                  <p className="text-tiny text-[#D95326]">
                    Khổ {config.paperSize} đã tự động chuyển sang in 1 mặt kèm ống đựng poster chống gãy.
                  </p>
                )}
              </div>

              {/* 2. File Upload Zone */}
              <div className="space-y-3 border-t border-[#DCD5C7] dark:border-[#233044] pt-6">
                <label className="block text-body font-bold">
                  2. Tải tệp tài liệu hoặc poster
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded border border-dashed p-5 transition cursor-pointer ${
                    isDraggingOver
                      ? "border-[#D95326] bg-[#EFEAE0] dark:bg-[#152033]"
                      : uploadedFileMeta
                      ? "border-green-700 bg-green-950/5 dark:border-green-500/50"
                      : "border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0]/50 dark:bg-[#152033]/50 hover:border-[#0B2545]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#F6F2E8] dark:bg-[#0E1624]">
                        {uploadedFileMeta ? (
                          <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-400" />
                        ) : (
                          <FileUp className="h-5 w-5 text-[#D95326]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-small font-bold truncate">
                          {uploadedFileMeta
                            ? uploadedFileMeta.name
                            : config.fileName}
                        </p>
                        <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                          {uploadedFileMeta
                            ? `${uploadedFileMeta.ext} · ${uploadedFileMeta.sizeLabel}${
                                uploadedFileMeta.autoDetectedPages
                                  ? ` · Tự nhận diện ${uploadedFileMeta.autoDetectedPages} trang`
                                  : ""
                              }`
                            : "Kéo thả file PDF, DOCX, PNG, JPG hoặc bấm để chọn tệp từ thiết bị"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded bg-[#0B2545] dark:bg-[#F6F2E8] px-3.5 py-2 text-tiny font-bold text-[#F6F2E8] dark:text-[#0B2545] cursor-pointer"
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                        <span>
                          {uploadedFileMeta ? "Đổi tệp" : "Chọn tệp"}
                        </span>
                      </button>

                      {uploadedFileMeta && (
                        <button
                          type="button"
                          onClick={handleClearUploadedFile}
                          title="Xóa tệp đã tải lên"
                          className="rounded border border-[#DCD5C7] dark:border-[#233044] p-2 hover:text-red-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Print Mode, Paper Material, Sides, Quantity & Binding */}
              <div className="space-y-6 border-t border-[#DCD5C7] dark:border-[#233044] pt-6">
                <div className="space-y-3">
                  <label className="block text-body font-bold">
                    3. Chế độ in &amp; chất liệu giấy
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, colorMode: "bw" });
                        setPaperMaterial("fort");
                      }}
                      className={`rounded border p-3.5 text-left transition cursor-pointer ${
                        config.colorMode === "bw"
                          ? "border-[#0B2545] dark:border-[#F6F2E8] bg-[#EFEAE0] dark:bg-[#152033]"
                          : "border-[#DCD5C7] dark:border-[#233044]"
                      }`}
                    >
                      <span className="block text-small font-bold">
                        In trắng đen
                      </span>
                      <span className="block text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                        Giấy Fort 70–80gsm
                      </span>
                      <span className="mt-1.5 block text-small font-bold text-[#D95326] tabular-nums">
                        {isBulkOrder ? sizeInfo.bwBulkRange : sizeInfo.bwSmallRange}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, colorMode: "color" });
                        setPaperMaterial("fort");
                      }}
                      className={`rounded border p-3.5 text-left transition cursor-pointer ${
                        config.colorMode === "color" && paperMaterial === "fort"
                          ? "border-[#0B2545] dark:border-[#F6F2E8] bg-[#EFEAE0] dark:bg-[#152033]"
                          : "border-[#DCD5C7] dark:border-[#233044]"
                      }`}
                    >
                      <span className="block text-small font-bold">
                        In màu giấy thường
                      </span>
                      <span className="block text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                        Giấy Fort 70–80gsm
                      </span>
                      <span className="mt-1.5 block text-small font-bold text-[#D95326] tabular-nums">
                        {sizeInfo.colorRegularRange}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, colorMode: "color" });
                        setPaperMaterial("couche");
                      }}
                      className={`rounded border p-3.5 text-left transition cursor-pointer ${
                        config.colorMode === "color" && paperMaterial === "couche"
                          ? "border-[#0B2545] dark:border-[#F6F2E8] bg-[#EFEAE0] dark:bg-[#152033]"
                          : "border-[#DCD5C7] dark:border-[#233044]"
                      }`}
                    >
                      <span className="block text-small font-bold">
                        In màu giấy ảnh dày
                      </span>
                      <span className="block text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                        Couche &gt;180gsm
                      </span>
                      <span className="mt-1.5 block text-small font-bold text-[#D95326] tabular-nums">
                        {sizeInfo.colorCoucheRange}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sides, Pages, Copies, Binding */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-small font-bold mb-1.5">
                      Số mặt in
                    </label>
                    <select
                      value={config.sides}
                      disabled={isLargePosterSelected}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sides: e.target.value as PrintOrderConfig["sides"],
                        })
                      }
                      className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3 py-2.5 text-small font-bold focus:outline-none disabled:opacity-50"
                    >
                      <option value="2-side">In 2 mặt (-15%)</option>
                      <option value="1-side">In 1 mặt</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-small font-bold mb-1.5">
                      Số {sizeInfo.unitName}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={config.pageCount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          pageCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3 py-2.5 text-small font-bold tabular-nums focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-small font-bold mb-1.5">
                      Số bản
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.copies}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          copies: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3 py-2.5 text-small font-bold tabular-nums focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-small font-bold mb-1.5">
                      Đóng gáy / Ống poster
                    </label>
                    <select
                      value={config.binding}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          binding: e.target.value as PrintOrderConfig["binding"],
                        })
                      }
                      className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3 py-2.5 text-small font-bold focus:outline-none"
                    >
                      <option value="spiral-plastic">
                        Đóng lò xo + Bìa kiếng (+12.000đ)
                      </option>
                      <option value="staple">Bấm kim góc + Bìa (+2.000đ)</option>
                      <option value="poster-tube">
                        Cán màng + Ống Poster (+15.000đ)
                      </option>
                      <option value="none">Để rời không đóng gáy (0đ)</option>
                    </select>
                  </div>
                </div>

                {/* Stand Rental Option */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-small font-bold">
                      4. Thuê kèm giá đỡ / chân standee poster (tùy chọn)
                    </label>
                    {standRentalFee > 0 && (
                      <span className="text-tiny font-bold text-[#D95326] tabular-nums">
                        +{standRentalFee.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: "none",
                        title: "Không thuê",
                        priceText: "0đ",
                      },
                      {
                        id: "stand-session",
                        title: "Thuê 1 buổi",
                        priceText: "+10.000đ",
                      },
                      {
                        id: "stand-day",
                        title: "Standee 1 ngày",
                        priceText: "+15.000đ",
                      },
                      {
                        id: "stand-week",
                        title: "Thuê 1 tuần",
                        priceText: "+30.000đ",
                      },
                    ].map((opt) => {
                      const active = (config.standRental || "none") === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              standRental:
                                opt.id as PrintOrderConfig["standRental"],
                            })
                          }
                          className={`p-3 rounded border text-left transition cursor-pointer ${
                            active
                              ? "border-[#D95326] bg-[#EFEAE0] dark:bg-[#152033]"
                              : "border-[#DCD5C7] dark:border-[#233044]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-small font-bold truncate">
                              {opt.title}
                            </span>
                            {active && (
                              <Check className="w-4 h-4 text-[#D95326] shrink-0" />
                            )}
                          </div>
                          <p className="text-tiny text-[#D95326] font-bold tabular-nums mt-0.5">
                            {opt.priceText}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Validation Error & Next Button */}
              <div className="border-t border-[#DCD5C7] dark:border-[#233044] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {step1Error ? (
                    <p className="text-small font-bold text-red-600 dark:text-red-400">
                      {step1Error}
                    </p>
                  ) : (
                    <p className="text-small text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                      Cấu hình hợp lệ: Khổ {config.paperSize} · {config.pageCount}{" "}
                      {sizeInfo.unitName} × {config.copies} bản
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => goToStep(2)}
                  className="inline-flex items-center justify-center gap-2 rounded bg-[#D95326] hover:bg-[#C0441B] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3.5 text-small font-bold text-white transition cursor-pointer"
                >
                  <span>Tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="print-step-2"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 16 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0]/60 dark:bg-[#152033]/60 p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="text-small">
                  <span className="font-bold">{config.fileName}</span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span>
                    Khổ {config.paperSize} ({config.pageCount} {sizeInfo.unitName} ×{" "}
                    {config.copies} bản)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-tiny font-bold text-[#D95326] underline cursor-pointer"
                >
                  Sửa cấu hình
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-bold mb-1.5">
                    Họ và tên sinh viên
                  </label>
                  <input
                    type="text"
                    value={studentNameInput}
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    placeholder="VD: Nguyễn Minh Khoa"
                    className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3.5 py-2.5 text-small focus:border-[#0B2545] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-small font-bold mb-1.5">
                    Mã số sinh viên (KHTN)
                  </label>
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    placeholder="VD: 26120001"
                    className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3.5 py-2.5 text-small tabular-nums focus:border-[#0B2545] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-small font-bold mb-1.5">
                  Điểm nhận bản in tại 227 Nguyễn Văn Cừ
                </label>
                <select
                  value={config.pickupLocation}
                  onChange={(e) =>
                    setConfig({ ...config, pickupLocation: e.target.value })
                  }
                  className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3.5 py-2.5 text-small font-bold focus:outline-none"
                >
                  {CAMPUS_BUILDINGS_CS1.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-small font-bold mb-1.5">
                  Khung giờ giải lao nhận bản in
                </label>
                <select
                  value={config.note}
                  onChange={(e) =>
                    setConfig({ ...config, note: e.target.value })
                  }
                  className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3.5 py-2.5 text-small font-bold focus:outline-none"
                >
                  {PICKUP_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-[#DCD5C7] dark:border-[#233044] pt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#DCD5C7] dark:border-[#233044] px-5 py-3.5 text-small font-bold hover:border-[#0B2545] transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded bg-[#D95326] hover:bg-[#C0441B] px-6 py-3.5 text-small font-bold text-white transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {addedToast
                      ? "Đã thêm lệnh in vào giỏ hàng"
                      : `Xác nhận đặt in — ${totalPrice.toLocaleString("vi-VN")}đ`}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Fixed Bottom Live Price Bar (Replaces Pricing Tables) */}
      <div className="fixed bottom-14 lg:bottom-0 left-0 right-0 z-30 border-t border-[#DCD5C7] dark:border-[#233044] bg-[#F6F2E8]/95 dark:bg-[#0E1624]/95 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-small font-bold text-[#0B2545] dark:text-[#F6F2E8] tabular-nums truncate">
              Tạm tính {totalPrice.toLocaleString("vi-VN")}đ · +{pointsEarned} điểm
            </p>
            <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 truncate">
              Khổ {config.paperSize} · {config.pageCount} {sizeInfo.unitName} ×{" "}
              {config.copies} bản ·{" "}
              {config.colorMode === "bw" ? "Trắng đen" : "In màu"}
              {isBulkOrder ? " (Giá sỉ ≥100 tờ)" : ""}
            </p>
          </div>

          {step === 1 ? (
            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => goToStep(2)}
              className="rounded bg-[#0B2545] dark:bg-[#F6F2E8] text-[#F6F2E8] dark:text-[#0B2545] px-4 py-2 text-small font-bold whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAddPrintToCart(config, totalPrice, pointsEarned);
                setAddedToast(true);
                setTimeout(() => setAddedToast(false), 3000);
              }}
              className="rounded bg-[#D95326] hover:bg-[#C0441B] text-white px-4 py-2 text-small font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Đặt in ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintConfigurator;
