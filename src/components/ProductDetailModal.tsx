import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Check,
  Star,
  MapPin,
  MessageSquarePlus,
  Bell,
} from "lucide-react";
import { ProductItem, PricingVariant, ProductReview } from "../types";
import { ProductVisual } from "./ProductVisual";

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (
    product: ProductItem,
    variant: PricingVariant,
    customMeta?: string
  ) => void;
  onAddReview: (productId: string, review: ProductReview) => void;
  onNotifyWhenAvailable?: (product: ProductItem) => void;
  isNotified?: boolean;
  studentName: string;
  studentFaculty: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddReview,
  onNotifyWhenAvailable,
  isNotified = false,
  studentName,
  studentFaculty,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id || "");
      setSelectedModelId(product.modelOptions?.[0]?.id || "");
    }
  }, [product]);

  if (!product) return null;

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const currentModel =
    product.modelOptions?.find((m) => m.id === selectedModelId) ||
    product.modelOptions?.[0];

  const getAdjustedPrice = (variant: PricingVariant) => {
    if (!currentModel || !currentModel.priceDelta) return variant.price;
    if (variant.type === "rent") return variant.price;
    return Math.max(10000, variant.price + currentModel.priceDelta);
  };

  const finalPrice = getAdjustedPrice(currentVariant);

  const handleAdd = () => {
    const adjustedVariant: PricingVariant = {
      ...currentVariant,
      price: finalPrice,
      label: currentVariant.conditionBadge
        ? `${currentVariant.conditionBadge} — ${currentVariant.label}`
        : currentVariant.label,
    };
    const metaLabel = currentModel
      ? `Phân loại: ${currentModel.name}${
          currentVariant.conditionBadge
            ? ` • Tình trạng: ${currentVariant.conditionBadge}`
            : ""
        }`
      : currentVariant.conditionBadge
      ? `Tình trạng: ${currentVariant.conditionBadge}`
      : undefined;

    onAddToCart(product, adjustedVariant, metaLabel);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      studentName: studentName || "Sinh viên KHTN",
      studentIdMasked: "24120***",
      faculty: studentFaculty || "Khoa Công nghệ Thông tin",
      rating,
      comment: reviewText.trim(),
      date: "Vừa xong",
    };
    onAddReview(product.id, newRev);
    setReviewText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#FAF8F5] shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
              {product.code}
            </span>
            <span aria-hidden="true">·</span>
            <span>Chi tiết sản phẩm / dịch vụ FORUS Cơ sở 1</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#0B2545] hover:bg-[#F3EFE6] dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="grid flex-1 grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-12">
          {/* Left Image & Highlights */}
          <div className="space-y-4 lg:col-span-6">
            <ProductVisual
              imageUrl={product.imageUrl}
              alt={product.name}
              fallbackIcon={product.fallbackIcon}
              fallbackGradient={product.fallbackGradient}
              code={product.code}
              className="h-64 sm:h-72 w-full rounded-2xl border border-[#E6E0D5] dark:border-slate-700"
            />

            <div className="rounded-2xl border border-[#E6E0D5] bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/70">
              <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                Điểm khác biệt dành riêng cho Sinh viên ĐH KHTN:
              </h4>
              <ul className="mt-2.5 space-y-2 text-xs text-[#4A5568] dark:text-slate-300">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D95326]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-5 lg:col-span-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                {product.availabilityStatus === "rented" ||
                product.inStock <= 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-[#D95326] dark:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D95326] dark:bg-amber-400" />
                    Đang cho thuê
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Còn hàng ({product.inStock})
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  +{product.pointsReward} điểm thưởng FORUS
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-[#0B2545] dark:text-white leading-snug">
                {product.name}
              </h2>

              <p className="text-xs leading-relaxed text-[#4A5568] dark:text-slate-300">
                {product.description}
              </p>

              {/* Step 1: Model / Type Selector (if product has modelOptions) */}
              {product.modelOptions && product.modelOptions.length > 0 && (
                <div className="space-y-1.5 rounded-2xl border border-[#E5DEC9] bg-[#F3EFE6] p-3.5 dark:border-slate-700 dark:bg-slate-800">
                  <label className="block text-xs font-extrabold text-[#0B2545] dark:text-white">
                    1. {product.modelSelectorLabel || "Chọn phân loại:"}
                  </label>
                  <select
                    value={currentModel?.id || ""}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full rounded-xl border border-[#DDD6C7] bg-white px-3 py-2 text-xs font-bold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  >
                    {product.modelOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {currentModel?.spec && (
                    <p className="text-[11px] text-[#4A5568] dark:text-slate-300">
                      • {currentModel.spec}
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Condition / Variant Selector (Thuê | Độ mới 80% | Độ mới 90% | Mới 100%) */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0B2545] dark:text-white">
                  {product.modelOptions
                    ? "2. Chọn tình trạng (Thuê / Độ mới 80% / 90% / Mới 100%):"
                    : "Chọn hình thức (Thuê / Mua):"}
                </label>
                <div className="space-y-2">
                  {product.variants.map((v) => {
                    const isSelected = currentVariant.id === v.id;
                    const vPrice = getAdjustedPrice(v);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-2xl border p-3 text-left transition cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#0B2545] bg-white shadow-2xs dark:border-amber-400 dark:bg-slate-800"
                            : "border-[#E6E0D5] bg-white/70 hover:border-[#C8C0B0] dark:border-slate-800 dark:bg-slate-800/40"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {v.conditionBadge && (
                              <span
                                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  v.conditionBadge === "Mới 100%"
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                    : v.conditionBadge === "Độ mới 90%"
                                    ? "bg-[#0B2545]/10 text-[#0B2545] dark:bg-sky-500/20 dark:text-sky-300"
                                    : v.conditionBadge === "Độ mới 80%"
                                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                                    : "bg-[#D95326]/15 text-[#D95326] dark:text-orange-300"
                                }`}
                              >
                                {v.conditionBadge}
                              </span>
                            )}
                            <span className="text-xs font-extrabold text-[#0B2545] dark:text-white truncate">
                              {v.label}
                            </span>
                          </div>
                          {v.conditionDesc && (
                            <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-400">
                              {v.conditionDesc}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-sm font-extrabold text-[#D95326] dark:text-amber-400 shrink-0 tabular-nums">
                          {vPrice.toLocaleString("vi-VN")}đ{" "}
                          <span className="text-[11px] font-normal text-[#64748B]">
                            {v.unitLabel}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-[#D95326]" />
                <span>{product.deliveryInfo}</span>
              </div>

              {product.availabilityStatus === "rented" ||
              product.inStock <= 0 ? (
                <button
                  type="button"
                  onClick={() => onNotifyWhenAvailable?.(product)}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-extrabold transition cursor-pointer shadow-xs ${
                    isNotified
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-[#0B2545] text-white hover:bg-[#163A66] dark:bg-amber-500 dark:text-slate-950"
                  }`}
                >
                  {isNotified ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Đã Đăng Ký Nhận Thông Báo Khi Có Hàng</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Thông báo khi có hàng</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] py-3.5 text-xs sm:text-sm font-extrabold text-white transition cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {addedFeedback
                      ? "Đã Thêm Vào Giỏ Hàng (✓)"
                      : `Thêm Vào Giỏ — ${finalPrice.toLocaleString("vi-VN")}đ (+${product.pointsReward} điểm)`}
                  </span>
                </button>
              )}
            </div>

            {/* Student Reviews Section */}
            <div className="space-y-3 border-t border-[#E5DEC9] pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                  Đánh giá từ Sinh viên KHTN ({product.reviews.length})
                </h4>
                <div className="flex items-center gap-1 text-[#D95326]">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-mono text-xs font-bold">5.0</span>
                </div>
              </div>

              <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl bg-white border border-[#E6E0D5] p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400">
                      <span className="font-bold text-[#0B2545] dark:text-slate-200">
                        {rev.studentName} ({rev.studentIdMasked}) · {rev.faculty}
                      </span>
                      <span>{rev.date}</span>
                    </div>
                    <p className="mt-1 text-[#4A5568] dark:text-slate-300">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleSubmitReview} className="flex gap-2 pt-1">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="rounded-xl border border-[#DDD6C7] bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={5}>5 ★</option>
                  <option value={4}>4 ★</option>
                </select>
                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Viết nhận xét của bạn..."
                  className="flex-1 rounded-xl border border-[#DDD6C7] bg-white px-3 py-1.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-[#0B2545] px-3.5 py-1.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
