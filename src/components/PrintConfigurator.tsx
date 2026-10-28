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

  const sizeInfo = PRINT_PRICING_TABLE[config.paperSize];
  const basePagePrice =
    config.colorMode === "color" ? sizeInfo.colorPrice : sizeInfo.bwPrice;

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
  const totalPrice = Math.max(5000, singleCopyCost * config.copies);
  const pointsEarned =
    config.paperSize === "A1" || config.paperSize === "A2" || totalPrice >= 40000
      ? 10
      : 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPrintToCart(config, totalPrice, pointsEarned);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Warm Beige Banner with Right Policy Table (Matches Screenshot 1) */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-7">
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
              FORUS PRINT EXPRESS · IN ẤN HỌC THUẬT TẠI 227 NGUYỄN VĂN CỪ
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-4xl dark:text-white leading-[1.15]">
              Đặt In Tài Liệu, Giáo Trình &amp; Poster Đồ Án Khổ A1–A5
            </h2>
            <p className="text-sm leading-relaxed text-[#4A5568] sm:text-base dark:text-slate-300">
              Gửi file PDF/LaTeX trực tuyến, tự động định giá trong 5 giây và nhận bản in sắc nét ngay tại{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Sảnh Tòa I
              </strong>{" "}
              hoặc{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Thư viện Cơ sở 1
              </strong>{" "}
              giờ giải lao. Mỗi đơn in đều được cộng trực tiếp{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                +{pointsEarned} điểm FORUS (+15% ưu đãi in 2 mặt)
              </strong>
              .
            </p>
          </div>

          {/* Right White Policy Card */}
          <div className="rounded-2xl border border-[#E6E0D5] bg-white p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#64748B] dark:text-slate-400">
              BẢNG GIÁ &amp; CHÍNH SÁCH IN MINH BẠCH
            </p>
            <div className="mt-3.5 divide-y divide-[#EAE5DC] text-xs sm:text-sm dark:divide-slate-800">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  In tài liệu A4 / A5 (2 mặt tiết kiệm):
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Giảm 15% đơn giá
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  In Poster Đồ án 1 khổ A1 / A2:
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Kèm ống đựng chống gãy
                </span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Tích điểm thành viên VIP FORUS:
                </span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  Thưởng +{pointsEarned} điểm/đơn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Step-by-Step Configurator Cards (Matches Screenshot 1) */}
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
                Bước 1: Chọn Khổ Giấy &amp; Ước Tính Chi Phí In
              </h3>
            </div>

            {/* Select Document Preset & Desktop File Upload Zone */}
            <div className="space-y-3 min-w-0">
              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1.5">
                  Chọn mẫu cấu hình in nhanh (hoặc tự tải file bên dưới)
                </label>
                <select
                  value={presetKey}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPresetKey(val);
                    if (val === "A1-color") {
                      setConfig((prev) => ({
                        ...prev,
                        fileName:
                          uploadedFileMeta?.name ||
                          "Poster_Do_An_1_A1_Doc_CSC00006.pdf",
                        paperSize: "A1",
                        colorMode: "color",
                        sides: "1-side",
                        pageCount: uploadedFileMeta?.autoDetectedPages || 1,
                        binding: "poster-tube",
                      }));
                    } else if (val === "A4-bw") {
                      setConfig((prev) => ({
                        ...prev,
                        fileName:
                          uploadedFileMeta?.name ||
                          "Giao_Trinh_Vi_Tich_Phan_1B_Chuong_1_4.pdf",
                        paperSize: "A4",
                        colorMode: "bw",
                        sides: "2-side",
                        pageCount: uploadedFileMeta?.autoDetectedPages || 40,
                        binding: "spiral-plastic",
                      }));
                    } else if (val === "A5-color") {
                      setConfig((prev) => ({
                        ...prev,
                        fileName:
                          uploadedFileMeta?.name ||
                          "So_Tay_Cong_Thuc_Dai_So_Tuyen_Tinh_A5.pdf",
                        paperSize: "A5",
                        colorMode: "color",
                        sides: "2-side",
                        pageCount: uploadedFileMeta?.autoDetectedPages || 16,
                        binding: "staple",
                      }));
                    }
                  }}
                  className="w-full min-w-0 truncate rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                >
                  <option value="A4-bw">
                    Giáo trình &amp; Slide bài giảng Khổ A4 (Đóng lò xo) — Đơn giá: 500đ/trang
                  </option>
                  <option value="A1-color">
                    Poster Đồ án 1 Khổ A1 dọc (In màu + Cán màng) — Đơn giá: 65.000đ/tấm
                  </option>
                  <option value="A5-color">
                    Sổ tay công thức Toán / LaTeX Khổ A5 nhỏ gọn — Đơn giá: 1.200đ/trang
                  </option>
                </select>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Desktop-Optimized Drag & Drop + File Picker Card */}
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
                            Đã nhận file từ máy tính — Bấm{" "}
                            <strong className="text-[#0B2545] dark:text-white">
                              Chọn tệp khác
                            </strong>{" "}
                            hoặc kéo thả file mới để thay thế
                          </>
                        ) : (
                          <>
                            Kéo &amp; thả file vào khung này hoặc bấm nút{" "}
                            <strong className="text-[#0B2545] dark:text-white">
                              Chọn tệp từ máy tính
                            </strong>{" "}
                            (Đang dùng mẫu:{" "}
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

            {/* 3 Selectable Option Cards (Matches Screenshot 1's 3-card selector) */}
            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-2">
                Chọn cấu hình khổ giấy &amp; chất lượng bản in
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    id: "A4",
                    title: "Khổ A4 Tiêu Chuẩn",
                    desc: "Giấy định lượng 80gsm chống lem mực, phù hợp in slide, đề cương & báo cáo.",
                    tag: "500đ – 2.000đ / trang",
                  },
                  {
                    id: "A1",
                    title: "Poster Khổ A1 / A2",
                    desc: "In phun màu độ phân giải cao trên giấy PP/Couche cho buổi chấm Poster Đồ án 1.",
                    tag: "35.000đ – 65.000đ / tấm",
                  },
                  {
                    id: "A5",
                    title: "Sổ Tay A5 / Bản Vẽ A3",
                    desc: "Nhỏ gọn bỏ vừa túi áo khoác hoặc balo để tra cứu nhanh công thức Giải tích.",
                    tag: "350đ – 4.000đ / trang",
                  },
                ].map((opt) => {
                  const isSelected =
                    (opt.id === "A4" && config.paperSize === "A4") ||
                    (opt.id === "A1" &&
                      (config.paperSize === "A1" || config.paperSize === "A2")) ||
                    (opt.id === "A5" &&
                      (config.paperSize === "A5" || config.paperSize === "A3"));
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPresetKey(
                          opt.id === "A1"
                            ? "A1-color"
                            : opt.id === "A5"
                            ? "A5-color"
                            : "A4-bw"
                        );
                        setConfig({
                          ...config,
                          paperSize: opt.id as PrintOrderConfig["paperSize"],
                          colorMode: opt.id === "A1" ? "color" : config.colorMode,
                          sides: opt.id === "A1" ? "1-side" : config.sides,
                          pageCount: opt.id === "A1" ? 1 : config.pageCount,
                          binding:
                            opt.id === "A1" ? "poster-tube" : config.binding,
                        });
                      }}
                      className={`flex flex-col justify-between rounded-2xl p-4 text-left transition cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#0B2545] bg-[#F8FAFC] dark:border-amber-400 dark:bg-slate-900"
                          : "border border-[#E5E0D5] bg-white hover:border-[#C8C0B0] dark:border-slate-700 dark:bg-slate-800/60"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-extrabold text-[#0B2545] dark:text-white">
                          {opt.title}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                          {opt.desc}
                        </p>
                      </div>
                      <span className="mt-3 block font-mono text-xs font-bold text-[#D95326] dark:text-amber-400">
                        {opt.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-grained Size (A1-A5), Quantity & Color Mode Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 pt-1">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1.5">
                  Số trang × Số bản
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={config.pageCount}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        pageCount: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    title="Số trang"
                    className="w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2.5 font-mono text-sm font-bold text-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <input
                    type="number"
                    min={1}
                    max={50}
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

              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-[#334155] dark:text-slate-200 mb-1.5">
                  Chế độ in &amp; Gia công đóng cuốn
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        colorMode: config.colorMode === "bw" ? "color" : "bw",
                      })
                    }
                    className={`rounded-xl p-2.5 text-left transition cursor-pointer ${
                      config.colorMode === "color"
                        ? "border-2 border-[#D95326] bg-[#FFF8F5] dark:bg-slate-900"
                        : "border border-[#E5E0D5] bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#0B2545] dark:text-white">
                      {config.colorMode === "color"
                        ? "In Màu Laser Sắc Nét"
                        : "In Trắng Đen Tiết Kiệm"}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[#D95326] dark:text-amber-400">
                      {basePagePrice.toLocaleString("vi-VN")}đ/trang
                    </span>
                  </button>

                  <select
                    value={config.binding}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        binding: e.target.value as PrintOrderConfig["binding"],
                      })
                    }
                    className="rounded-xl border border-[#E5E0D5] bg-white px-3 py-2.5 text-xs font-bold text-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                Tổng chi phí tạm tính ({config.paperSize} · {config.pageCount} trang × {config.copies} bản):
              </span>
              <span className="block font-mono text-xl font-extrabold text-[#0B2545] dark:text-white">
                {totalPrice.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-[#D95326] dark:text-amber-400">
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
                  placeholder="VD: 24120001"
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

            {/* Warm Tip Box (Matches Screenshot 1 bottom-right tip box) */}
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
                Đặt Lịch In &amp; Thêm Vào Giỏ Hàng ({totalPrice.toLocaleString("vi-VN")}đ)
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
