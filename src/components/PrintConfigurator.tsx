import React, { useState } from "react";
import {
  FileText,
  Upload,
  Printer,
  Check,
  Info,
  ShoppingBag,
  Layers,
  MapPin,
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

export const PrintConfigurator: React.FC<PrintConfiguratorProps> = ({
  onAddPrintToCart,
}) => {
  const [config, setConfig] = useState<PrintOrderConfig>({
    fileName: "Bao_Cao_Do_An_1_CSC00006.pdf",
    paperSize: "A4",
    colorMode: "bw",
    sides: "2-side",
    pageCount: 20,
    copies: 1,
    binding: "staple",
    pickupLocation: CAMPUS_BUILDINGS_CS1[0],
    note: "",
  });

  const [addedToast, setAddedToast] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfig((prev) => ({
        ...prev,
        fileName: file.name,
      }));
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

  const handleQuickPreset = (
    preset: "poster-a1" | "slide-a4" | "cheat-a5"
  ) => {
    if (preset === "poster-a1") {
      setConfig({
        fileName: "Poster_Do_An_1_A1_Doc_CSC00006.pdf",
        paperSize: "A1",
        colorMode: "color",
        sides: "1-side",
        pageCount: 1,
        copies: 1,
        binding: "poster-tube",
        pickupLocation: CAMPUS_BUILDINGS_CS1[0],
        note: "In khổ A1 dọc cán màng bóng + tặng kèm ống đựng mang lên trường",
      });
    } else if (preset === "slide-a4") {
      setConfig({
        fileName: "Slide_Vi_Tich_Phan_1B_Full.pdf",
        paperSize: "A4",
        colorMode: "bw",
        sides: "2-side",
        pageCount: 45,
        copies: 1,
        binding: "spiral-plastic",
        pickupLocation: CAMPUS_BUILDINGS_CS1[1],
        note: "In 4 slide trên 1 mặt giấy, đóng lò xo nhựa + bìa kiếng",
      });
    } else {
      setConfig({
        fileName: "So_Tay_Cong_Thuc_Dai_So_Tuyen_Tinh.pdf",
        paperSize: "A5",
        colorMode: "color",
        sides: "2-side",
        pageCount: 16,
        copies: 2,
        binding: "staple",
        pickupLocation: CAMPUS_BUILDINGS_CS1[6],
        note: "In màu rõ nét các sơ đồ ma trận",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPrintToCart(config, totalPrice, pointsEarned);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Quick Presets */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700/80 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
            Dịch vụ In Ấn Học Thuật · Giao tận phòng Cơ sở 1 Nguyễn Văn Cừ
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Gửi File In Sẵn — Đủ Khổ A1, A2, A3, A4, A5
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Hỗ trợ in từ tài liệu ôn thi, giáo trình đóng gáy lò xo cho đến{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              Poster khổ A1 dọc
            </strong>{" "}
            phục vụ buổi trình bày Đồ án 1. Tự động báo giá theo số trang và tích{" "}
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +6 đến +10 điểm
            </span>{" "}
            FORUS mỗi đơn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-300">
            Mẫu chọn nhanh:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPreset("poster-a1")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:bg-slate-700/80 dark:text-slate-100 dark:hover:border-sky-400 whitespace-nowrap shrink-0"
          >
            Poster Đồ Án Khổ A1 (Màu)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset("slide-a4")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:bg-slate-700/80 dark:text-slate-100 dark:hover:border-sky-400 whitespace-nowrap shrink-0"
          >
            Giáo Trình A4 Đóng Lò Xo
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset("cheat-a5")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-600 dark:bg-slate-700/80 dark:text-slate-100 dark:hover:border-sky-400 whitespace-nowrap shrink-0"
          >
            Sổ Tay Công Thức A5
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start"
      >
        {/* Left Configuration Column */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-8">
          {/* Step 1: Upload / File Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              1. Tải file tài liệu lên (PDF, DOCX, PNG, LaTeX PDF)
            </label>
            <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400 bg-sky-50/70 px-4 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100/70 dark:border-sky-400/60 dark:bg-sky-900/40 dark:text-sky-200">
                <Upload className="h-4 w-4" />
                <span>Chọn file từ máy / điện thoại</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-600 dark:bg-slate-700/70">
                <FileText className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                <input
                  type="text"
                  value={config.fileName}
                  onChange={(e) =>
                    setConfig({ ...config, fileName: e.target.value })
                  }
                  placeholder="Nhập tên file hoặc link Google Drive..."
                  className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none dark:text-slate-100"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Paper Size Selector (A1 - A5) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              2. Chọn khổ giấy in (A1 · A2 · A3 · A4 · A5)
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(["A1", "A2", "A3", "A4", "A5"] as const).map((size) => {
                const active = config.paperSize === size;
                const priceInfo = PRINT_PRICING_TABLE[size];
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        paperSize: size,
                        sides:
                          size === "A1" || size === "A2"
                            ? "1-side"
                            : config.sides,
                      })
                    }
                    className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition ${
                      active
                        ? "border-sky-600 bg-sky-50/90 text-slate-900 dark:border-sky-400 dark:bg-sky-900/50 dark:text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-sm font-bold sm:text-base">
                        Khổ {size}
                      </span>
                      {active && (
                        <Check className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>
                    <span className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-300">
                      TĐ: {priceInfo.bwPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="font-mono text-[11px] text-sky-600 dark:text-sky-300">
                      Màu: {priceInfo.colorPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300">
              <Info className="h-3.5 w-3.5 shrink-0 text-sky-500" />
              <span>{sizeInfo.desc}</span>
            </p>
          </div>

          {/* Step 3: Color Mode & Sides */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                3. Chế độ màu sắc
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/80">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, colorMode: "bw" })}
                  className={`rounded-lg py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    config.colorMode === "bw"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  }`}
                >
                  In Trắng Đen
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, colorMode: "color" })}
                  className={`rounded-lg py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    config.colorMode === "color"
                      ? "bg-sky-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  }`}
                >
                  In Màu Sắc Nét
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                4. Số mặt in
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/80">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, sides: "1-side" })}
                  className={`rounded-lg py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    config.sides === "1-side"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  }`}
                >
                  In 1 Mặt
                </button>
                <button
                  type="button"
                  disabled={
                    config.paperSize === "A1" || config.paperSize === "A2"
                  }
                  onClick={() => setConfig({ ...config, sides: "2-side" })}
                  className={`rounded-lg py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 disabled:opacity-40 ${
                    config.sides === "2-side"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  }`}
                >
                  In 2 Mặt (-15%)
                </button>
              </div>
            </div>
          </div>

          {/* Step 5: Page count, Copies & Binding */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Số trang tài liệu
              </label>
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Số bản in (Copies)
              </label>
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm font-semibold text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Gia công sau in
              </label>
              <select
                value={config.binding}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    binding: e.target.value as PrintOrderConfig["binding"],
                  })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="none">Để rời (0đ)</option>
                <option value="staple">Bấm kim góc + Bìa màu (+2.000đ)</option>
                <option value="spiral-plastic">
                  Đóng gáy lò xo + Bìa kiếng (+12.000đ)
                </option>
                <option value="poster-tube">
                  Cán màng Poster + Ống nhựa (+15.000đ)
                </option>
              </select>
            </div>
          </div>

          {/* Step 6: Delivery location & notes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                <span>Điểm nhận tài liệu tại Cơ sở 1</span>
              </label>
              <select
                value={config.pickupLocation}
                onChange={(e) =>
                  setConfig({ ...config, pickupLocation: e.target.value })
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {CAMPUS_BUILDINGS_CS1.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Ghi chú in ấn (Số phòng học / Giờ nhận)
              </label>
              <input
                type="text"
                value={config.note}
                onChange={(e) => setConfig({ ...config, note: e.target.value })}
                placeholder="VD: Giao phòng I.42 lúc 9h10 giải lao..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Module */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/90 lg:sticky lg:top-24 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Phiếu Tạm Tính In Ấn
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +{pointsEarned} điểm FORUS
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Tệp tin:</span>
              <span className="max-w-[180px] truncate font-medium text-slate-900 dark:text-white">
                {config.fileName}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Cấu hình giấy:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                Khổ {config.paperSize} ·{" "}
                {config.colorMode === "color" ? "In Màu" : "Trắng Đen"} ·{" "}
                {config.sides === "2-side" ? "2 mặt" : "1 mặt"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Số lượng:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {config.pageCount} trang × {config.copies} bản
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Phí gia công:</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {bindingFee.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Giao tại:</span>
              <span className="max-w-[180px] truncate text-right text-slate-900 dark:text-white">
                {config.pickupLocation}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Tổng chi phí in:
                </span>
                <span className="font-mono text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-300">
                Cam kết bản in rõ nét công thức Toán/LaTeX, hoàn tiền nếu lem mực.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 active:scale-[0.99] whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Thêm Đơn In Vào Giỏ Hàng</span>
          </button>

          {addedToast && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Check className="h-4 w-4 shrink-0" />
              <span>
                Đã thêm đơn in ({config.paperSize}) vào giỏ hàng! Hoàn tất thanh toán để nhận +{pointsEarned} điểm.
              </span>
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
            <div>
              <strong>Mẹo cho nhóm Đồ án 1:</strong> Đặt in nháp khổ A3/A2 trước Buổi 2 để cả lớp góp ý, sau đó chọn{" "}
              <span className="underline">Khổ A1 In Màu</span> cho Buổi 3 trình bày Poster.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrintConfigurator;
