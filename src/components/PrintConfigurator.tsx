import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Printer,
  Check,
  ShoppingBag,
  Sparkles,
  Calculator,
  BookOpen,
  FileUp,
  X,
  FolderOpen,
  CheckCircle2,
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
  const [config, setConfig] = useState<PrintOrderConfig>({
    fileName: "Bao_Cao_Do_An_1_CSC00006.pdf",
    paperSize: "A4",
    colorMode: "bw",
    sides: "2-side",
    pageCount: 24,
    copies: 1,
    binding: "spiral-plastic",
    pickupLocation: CAMPUS_BUILDINGS_CS1[0],
    note: "09:15 – 09:35 (Giải lao giữa Ca sáng)",
  });

  const [presetKey, setPresetKey] = useState<string>("A4-bw");
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processSelectedFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const sizeLabel = formatFileSize(file.size);
    let detectedPages: number | undefined = undefined;

    // Attempt to detect actual page count if file is a PDF
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
    // Reset input value so selecting the same file again on desktop still triggers onChange
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

  const [paperMaterial, setPaperMaterial] = useState<"fort" | "couche">("fort");

  const sizeOrder: ("A5" | "A4" | "A3" | "A2" | "A1")[] = [
    "A5",
    "A4",
    "A3",
    "A2",
    "A1",
  ];

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

  const singleCopyCost =
    Math.round(basePagePrice * config.pageCount * sideMultiplier) + bindingFee;
  const totalPrice = Math.max(2000, singleCopyCost * config.copies);
  const pointsEarned =
    config.paperSize === "A1" || config.paperSize === "A2" || totalPrice >= 40000
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPrintToCart(config, totalPrice, pointsEarned);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Warm Beige Banner */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-7">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-4xl dark:text-white leading-[1.15]">
              Đặt In Tài Liệu, Giáo Trình &amp; Poster Đồ Án Khổ A5 – A1
            </h2>
            <p className="text-sm leading-relaxed text-[#4A5568] sm:text-base dark:text-slate-300">
              Chọn trực tiếp từng khổ giấy từ{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                A5, A4, A3, A2 đến A1
              </strong>
              , gửi file PDF/LaTeX trực tuyến và nhận bản in ngay tại{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Sảnh Tòa I
              </strong>{" "}
              hoặc{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Thư viện Cơ sở 1
              </strong>
              . Mỗi đơn in đều được cộng trực tiếp{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                +{pointsEarned} điểm FORUS
              </strong>
              .
            </p>
          </div>

          {/* Right White Policy Card */}
          <div className="rounded-2xl border border-[#E6E0D5] bg-white p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#64748B] dark:text-slate-400">
              CHÍNH SÁCH &amp; ĐỊNH LƯỢNG GIẤY TIÊU CHUẨN
            </p>
            <div className="mt-3.5 divide-y divide-[#EAE5DC] text-xs sm:text-sm dark:divide-slate-800">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Giấy tiêu chuẩn Trắng Đen / Màu thường:
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Fort 70gsm – 80gsm
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Giấy dày / Giấy ảnh Poster &amp; Kỷ yếu:
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Couche, ĐL &gt;180gsm
                </span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Ưu đãi in số lượng lớn (&ge;100 tờ):
                </span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  Tự động áp giá sỉ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL PRICING TABLES (MATCHING USER SCREENSHOTS 1 & 2) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Bảng giá in Trắng Đen (Đen Trắng) / Photocopy */}
        <div className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90">
          <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white">
            1. Bảng giá in Trắng Đen (Đen Trắng) / Photocopy
          </h3>
          <p className="mt-1 text-xs sm:text-sm italic text-[#4A5568] dark:text-slate-300">
            Áp dụng cho giấy định lượng tiêu chuẩn Fort 70gsm - 80gsm.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E5DEC9] dark:border-slate-700 text-[#0B2545] dark:text-slate-100">
                  <th className="py-2.5 pr-3 font-extrabold">Khổ giấy</th>
                  <th className="py-2.5 px-3 font-extrabold">
                    Giá in số lượng ít
                    <span className="block text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                      (Dưới 10 tờ)
                    </span>
                  </th>
                  <th className="py-2.5 pl-3 font-extrabold">
                    Giá in số lượng lớn
                    <span className="block text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                      (Trên 100 - 500 tờ)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] dark:divide-slate-700/70">
                {sizeOrder.map((sz) => {
                  const row = PRINT_PRICING_TABLE[sz];
                  const isActiveRow =
                    config.paperSize === sz && config.colorMode === "bw";
                  return (
                    <tr
                      key={`bw-${sz}`}
                      onClick={() => {
                        handleSelectPaperSize(sz);
                        setConfig((prev) => ({
                          ...prev,
                          paperSize: sz,
                          colorMode: "bw",
                        }));
                      }}
                      title={`Bấm để chọn in Trắng Đen Khổ ${sz}`}
                      className={`cursor-pointer transition-colors ${
                        isActiveRow
                          ? "bg-[#FFF8F3] dark:bg-slate-900/90"
                          : "hover:bg-[#FAF8F5] dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-3 pr-3 font-extrabold text-[#0B2545] dark:text-white whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span>Khổ {sz}</span>
                          {isActiveRow && (
                            <span className="h-2 w-2 rounded-full bg-[#D95326]" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#334155] dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {row.bwSmallRange}
                      </td>
                      <td className="py-3 pl-3 font-mono font-extrabold text-[#0B2545] dark:text-amber-300 tabular-nums whitespace-nowrap">
                        {row.bwBulkRange}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Bảng giá in Màu Toàn Diện (Full Color) */}
        <div className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90">
          <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white">
            2. Bảng giá in Màu Toàn Diện (Full Color)
          </h3>
          <p className="mt-1 text-xs sm:text-sm italic text-[#4A5568] dark:text-slate-300">
            Đơn giá thay đổi rõ rệt dựa trên chất liệu giấy chọn in (Giấy ảnh/giấy dày để làm poster, kỷ yếu).
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E5DEC9] dark:border-slate-700 text-[#0B2545] dark:text-slate-100">
                  <th className="py-2.5 pr-3 font-extrabold">Khổ giấy</th>
                  <th className="py-2.5 px-3 font-extrabold">
                    In màu giấy thường
                    <span className="block text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                      (Fort 70-80gsm)
                    </span>
                  </th>
                  <th className="py-2.5 pl-3 font-extrabold">
                    In màu giấy dày / Giấy ảnh
                    <span className="block text-[11px] font-bold text-[#64748B] dark:text-slate-400">
                      (Couche, ĐL &gt;180gsm)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] dark:divide-slate-700/70">
                {sizeOrder.map((sz) => {
                  const row = PRINT_PRICING_TABLE[sz];
                  const isActiveRow =
                    config.paperSize === sz && config.colorMode === "color";
                  return (
                    <tr
                      key={`color-${sz}`}
                      onClick={() => {
                        handleSelectPaperSize(sz);
                        setConfig((prev) => ({
                          ...prev,
                          paperSize: sz,
                          colorMode: "color",
                        }));
                      }}
                      title={`Bấm để chọn in Màu Khổ ${sz}`}
                      className={`cursor-pointer transition-colors ${
                        isActiveRow
                          ? "bg-[#FFF8F3] dark:bg-slate-900/90"
                          : "hover:bg-[#FAF8F5] dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="py-3 pr-3 font-extrabold text-[#0B2545] dark:text-white whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span>Khổ {sz}</span>
                          {isActiveRow && (
                            <span className="h-2 w-2 rounded-full bg-[#D95326]" />
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#334155] dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {row.colorRegularRange}
                      </td>
                      <td className="py-3 pl-3 font-mono font-semibold text-[#0B2545] dark:text-amber-300 tabular-nums whitespace-nowrap">
                        {row.colorCoucheRange}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2-Column Step-by-Step Configurator Cards */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch"
      >
        {/* Step 1 Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-6 sm:p-7 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-7 min-w-0">
          <div className="space-y-5 min-w-0">
            <div className="flex items-center gap-2.5">
              <Calculator className="h-5 w-5 text-[#D95326] shrink-0" />
              <h3 className="text-lg font-extrabold text-[#0B2545] sm:text-xl dark:text-white">
                Bước 1: Chọn Từng Khổ Giấy (A5 – A1) &amp; Tải File In
              </h3>
            </div>

            {/* Individual Paper Size Selector (A5 -> A4 -> A3 -> A2 -> A1) */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                  1. Chọn khổ giấy cần in (Từ A5 đến A1)
                </label>
                <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                  Đang chọn: Khổ {config.paperSize} ({sizeInfo.dimensions})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {sizeOrder.map((sz) => {
                  const info = PRINT_PRICING_TABLE[sz];
                  const isSelected = config.paperSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleSelectPaperSize(sz)}
                      className={`flex flex-col justify-between rounded-2xl p-3 text-left transition cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#0B2545] bg-[#0B2545] text-white shadow-sm dark:border-amber-400 dark:bg-slate-900"
                          : "border border-[#E5E0D5] bg-[#FAF8F5] text-[#0B2545] hover:border-[#0B2545]/40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-extrabold">
                            Khổ {sz}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-semibold ${
                              isSelected
                                ? "text-sky-200 dark:text-amber-300"
                                : "text-[#64748B] dark:text-slate-400"
                            }`}
                          >
                            {info.dimensions.split(" ")[0]}cm
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-[11px] leading-snug line-clamp-2 ${
                            isSelected
                              ? "text-slate-200 dark:text-slate-300"
                              : "text-[#64748B] dark:text-slate-400"
                          }`}
                        >
                          {info.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-current/10">
                        <span
                          className={`block font-mono text-[11px] font-extrabold tabular-nums ${
                            isSelected
                              ? "text-amber-300"
                              : "text-[#D95326] dark:text-amber-400"
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
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2.5 min-w-0">
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                2. Tải tệp tài liệu / Poster từ thiết bị
              </label>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drag & Drop + File Picker Card */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative rounded-2xl border-2 border-dashed p-3.5 sm:p-4 transition-all cursor-pointer ${
                  isDraggingOver
                    ? "border-[#D95326] bg-[#FFF8F5] dark:border-amber-400 dark:bg-slate-800"
                    : uploadedFileMeta
                    ? "border-emerald-600/50 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-950/20"
                    : "border-[#D5CEC0] bg-[#FAF8F5] hover:border-[#0B2545] hover:bg-[#F3EFE6]/70 dark:border-slate-600 dark:bg-slate-900/60 dark:hover:border-amber-400"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                        uploadedFileMeta
                          ? "bg-emerald-600 text-white"
                          : "bg-[#0B2545] text-white group-hover:bg-[#D95326] dark:bg-slate-700"
                      }`}
                    >
                      {uploadedFileMeta ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <FileUp className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white truncate max-w-full">
                          {uploadedFileMeta
                            ? uploadedFileMeta.name
                            : "Tải file tài liệu / Poster từ máy tính"}
                        </span>
                        {uploadedFileMeta ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-600/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                            {uploadedFileMeta.ext} · {uploadedFileMeta.sizeLabel}
                            {uploadedFileMeta.autoDetectedPages
                              ? ` · ${uploadedFileMeta.autoDetectedPages} trang`
                              : ""}
                          </span>
                        ) : (
                          <span className="hidden xl:inline-flex items-center rounded-md bg-[#E5DEC9]/70 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0B2545] dark:bg-slate-700 dark:text-slate-300 shrink-0">
                            PDF · DOCX · PNG · JPG
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                        {uploadedFileMeta ? (
                          <>
                            Đã nhận file — Bấm{" "}
                            <strong className="text-[#0B2545] dark:text-white">
                              Đổi tệp khác
                            </strong>{" "}
                            hoặc kéo thả file mới để thay thế
                          </>
                        ) : (
                          <>
                            Kéo &amp; thả file vào khung này hoặc bấm{" "}
                            <strong className="text-[#0B2545] dark:text-white">
                              Chọn tệp từ máy tính
                            </strong>{" "}
                            (Mẫu:{" "}
                            <span className="font-mono text-[#0B2545] dark:text-slate-200">
                              {config.fileName}
                            </span>
                            )
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons on the Right */}
                  <div
                    className="flex items-center gap-2 shrink-0 self-start sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B2545] hover:bg-[#163A66] px-3.5 py-2 text-xs font-extrabold text-white transition cursor-pointer shadow-2xs dark:bg-[#D95326] dark:hover:bg-[#C0441B]"
                    >
                      <FolderOpen className="h-3.5 w-3.5 text-amber-300 dark:text-white" />
                      <span>
                        {uploadedFileMeta ? "Đổi tệp khác" : "Chọn tệp từ máy tính"}
                      </span>
                    </button>

                    {uploadedFileMeta && (
                      <button
                        type="button"
                        onClick={handleClearUploadedFile}
                        title="Xóa tệp đã tải lên"
                        className="inline-flex items-center justify-center rounded-xl border border-[#DDD6C7] bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 p-2 text-[#64748B] transition cursor-pointer dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Print Mode, Paper Material, Quantity & Binding Row */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                3. Chọn chế độ in &amp; chất liệu giấy
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, colorMode: "bw" });
                    setPaperMaterial("fort");
                  }}
                  className={`rounded-xl p-3 text-left transition cursor-pointer ${
                    config.colorMode === "bw"
                      ? "border-2 border-[#0B2545] bg-[#F8FAFC] dark:border-amber-400 dark:bg-slate-900"
                      : "border border-[#E5E0D5] bg-white dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <span className="block text-xs font-extrabold text-[#0B2545] dark:text-white">
                    In Trắng Đen / Photocopy
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#64748B] dark:text-slate-400">
                    Giấy Fort 70gsm – 80gsm
                  </span>
                  <span className="mt-1.5 block font-mono text-xs font-extrabold text-[#D95326] dark:text-amber-400">
                    {isBulkOrder ? sizeInfo.bwBulkRange : sizeInfo.bwSmallRange}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, colorMode: "color" });
                    setPaperMaterial("fort");
                  }}
                  className={`rounded-xl p-3 text-left transition cursor-pointer ${
                    config.colorMode === "color" && paperMaterial === "fort"
                      ? "border-2 border-[#D95326] bg-[#FFF8F5] dark:border-amber-400 dark:bg-slate-900"
                      : "border border-[#E5E0D5] bg-white dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <span className="block text-xs font-extrabold text-[#0B2545] dark:text-white">
                    In Màu Giấy Thường
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#64748B] dark:text-slate-400">
                    Giấy Fort 70-80gsm
                  </span>
                  <span className="mt-1.5 block font-mono text-xs font-extrabold text-[#D95326] dark:text-amber-400">
                    {sizeInfo.colorRegularRange}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, colorMode: "color" });
                    setPaperMaterial("couche");
                  }}
                  className={`rounded-xl p-3 text-left transition cursor-pointer ${
                    config.colorMode === "color" && paperMaterial === "couche"
                      ? "border-2 border-[#D95326] bg-[#FFF8F5] dark:border-amber-400 dark:bg-slate-900"
                      : "border border-[#E5E0D5] bg-white dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <span className="block text-xs font-extrabold text-[#0B2545] dark:text-white">
                    In Màu Giấy Dày / Ảnh
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#64748B] dark:text-slate-400">
                    Couche, ĐL &gt;180gsm
                  </span>
                  <span className="mt-1.5 block font-mono text-xs font-extrabold text-[#D95326] dark:text-amber-400">
                    {sizeInfo.colorCoucheRange}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 pt-1">
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1.5">
                    Số {sizeInfo.unitName} × Số bản
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={config.pageCount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          pageCount: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      title={`Số ${sizeInfo.unitName}`}
                      className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2.5 font-mono text-sm font-bold text-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.copies}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          copies: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      title="Số bản"
                      className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2.5 font-mono text-sm font-bold text-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-7">
                  <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1.5">
                    Gia công đóng cuốn / Ống Poster
                  </label>
                  <select
                    value={config.binding}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        binding: e.target.value as PrintOrderConfig["binding"],
                      })
                    }
                    className="w-full rounded-xl border border-[#E5E0D5] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="spiral-plastic">
                      Đóng lò xo + Bìa kiếng (+12k)
                    </option>
                    <option value="staple">Bấm kim góc + Bìa (+2k)</option>
                    <option value="poster-tube">
                      Cán màng + Ống Poster (+15k)
                    </option>
                    <option value="none">Để rời không đóng gáy (0đ)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar inside Step 1 */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#F3EFE6] px-4 py-3.5 dark:bg-slate-900">
            <div>
              <span className="text-xs font-semibold text-[#4A5568] dark:text-slate-300">
                Tổng chi phí tạm tính (Khổ {config.paperSize} · {config.pageCount}{" "}
                {sizeInfo.unitName} × {config.copies} bản ·{" "}
                {config.colorMode === "bw"
                  ? isBulkOrder
                    ? "Trắng đen SL lớn"
                    : "Trắng đen"
                  : paperMaterial === "couche"
                  ? "Màu Couche >180gsm"
                  : "Màu Fort 70-80gsm"}
                ):
              </span>
              <span className="block font-mono text-xl font-extrabold text-[#0B2545] dark:text-white tabular-nums">
                {totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#D95326] dark:text-amber-400 shrink-0">
              +{pointsEarned} điểm FORUS
            </span>
          </div>
        </div>

        {/* Step 2 Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-6 sm:p-7 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-[#D95326] shrink-0" />
              <h3 className="text-lg font-extrabold text-[#0B2545] sm:text-xl dark:text-white leading-snug">
                Bước 2: Đặt Lịch Nhận Bản In Tại Cơ Sở 1
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1">
                  Họ và tên sinh viên
                </label>
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="VD: Nguyễn Minh Khoa"
                  className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1">
                  Mã số sinh viên (KHTN)
                </label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="VD: 26120001"
                  className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 font-mono text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1">
                Chọn điểm bàn giao bản in tại 227 Nguyễn Văn Cừ
              </label>
              <select
                value={config.pickupLocation}
                onChange={(e) =>
                  setConfig({ ...config, pickupLocation: e.target.value })
                }
                className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs font-semibold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {CAMPUS_BUILDINGS_CS1.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1">
                Khung giờ giải lao bạn tiện ghé nhận bản in
              </label>
              <select
                value={config.note}
                onChange={(e) => setConfig({ ...config, note: e.target.value })}
                className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs font-semibold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {PICKUP_TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Warm Tip Box */}
            <div className="rounded-2xl bg-[#F3EFE6] p-4 text-xs leading-relaxed dark:bg-slate-900">
              <p className="flex items-center gap-1.5 font-extrabold text-[#0B2545] dark:text-amber-300">
                <Sparkles className="h-4 w-4 text-[#D95326]" />
                <span>Mẹo tiết kiệm thêm 10.000đ cho nhóm Đồ án 1:</span>
              </p>
              <p className="mt-1 text-[#4A5568] dark:text-slate-300">
                Nếu nhóm bạn đặt in kèm Poster khổ A1 và báo cáo đóng lò xo A4 cùng lúc, FORUS sẽ miễn phí ống nhựa đựng Poster và cộng thưởng trực tiếp +{pointsEarned} điểm VIP!
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] px-5 py-3.5 text-xs sm:text-sm font-extrabold text-white transition cursor-pointer shadow-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                Đặt Lịch In Khổ {config.paperSize} &amp; Thêm Vào Giỏ ({totalPrice.toLocaleString("vi-VN")}đ)
              </span>
            </button>

            {addedToast && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0" />
                <span>
                  Đã thêm đơn in khổ {config.paperSize} vào giỏ hàng (+{pointsEarned} điểm FORUS)!
                </span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrintConfigurator;
