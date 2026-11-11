import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
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
  initialModelId?: string;
  initialVariantId?: string;
  onSelectModel?: (modelId: string) => void;
  onSelectVariant?: (variantId: string) => void;
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
  initialModelId,
  initialVariantId,
  onSelectModel,
  onSelectVariant,
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (product) {
      setSelectedVariantId(initialVariantId || product.variants[0]?.id || "");
      setSelectedModelId(initialModelId || product.modelOptions?.[0]?.id || "");
    }
  }, [product, initialModelId, initialVariantId]);

  // Close on Escape key
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const currentModel =
    product.modelOptions?.find((m) => m.id === selectedModelId) ||
    product.modelOptions?.[0];

  const activeImageUrl = currentModel?.imageUrl || product.imageUrl;

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    onSelectModel?.(modelId);
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    onSelectVariant?.(variantId);
  };

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
            ? ` · Tình trạng: ${currentVariant.conditionBadge}`
            : ""
        }`
      : currentVariant.conditionBadge
      ? `Tình trạng: ${currentVariant.conditionBadge}`
      : undefined;

    onAddToCart(
      { ...product, imageUrl: activeImageUrl },
      adjustedVariant,
      metaLabel
    );
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

  const hasModelImages = Boolean(
    product.modelOptions?.some((m) => Boolean(m.imageUrl))
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B2545]/60 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          onClick={(e) => e.stopPropagation()}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 48 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 48 }}
          transition={{ duration: 0.18 }}
          drag={shouldReduceMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.35 }}
          onDragEnd={(_e, info) => {
            if (info.offset.y > 90 || info.velocity.y > 500) {
              onClose();
            }
          }}
          className="relative flex max-h-[92vh] sm:max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-lg sm:rounded-lg border border-[#DCD5C7] dark:border-[#233044] bg-[#F6F2E8] dark:bg-[#0E1624] text-[#0B2545] dark:text-[#F6F2E8]"
        >
          {/* Mobile Bottom-Sheet Swipe Handle */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-10 rounded-full bg-[#0B2545]/25 dark:bg-[#F6F2E8]/25" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#DCD5C7] dark:border-[#233044] px-6 py-4">
            <div className="flex items-center gap-2 text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 truncate">
              <span className="font-bold text-[#D95326]">{product.code}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">
                {currentModel ? currentModel.name : product.subtitle}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ"
              className="rounded p-1.5 text-[#0B2545] hover:bg-[#EFEAE0] dark:text-[#F6F2E8] dark:hover:bg-[#152033] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="grid flex-1 grid-cols-1 gap-8 overflow-y-auto p-6 lg:grid-cols-12">
            {/* Left Image, Model Thumbnail Strip & Highlights */}
            <div className="space-y-6 lg:col-span-6">
              <div className="space-y-3">
                <ProductVisual
                  imageUrl={activeImageUrl}
                  alt={
                    currentModel
                      ? `${product.name} — ${currentModel.name}`
                      : product.name
                  }
                  fallbackIcon={product.fallbackIcon}
                  code={product.code}
                  className="aspect-[4/3] w-full rounded border border-[#DCD5C7] dark:border-[#233044]"
                />

                {hasModelImages && product.modelOptions && (
                  <div className="space-y-2">
                    <p className="text-tiny font-bold text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                      Chọn mẫu thực tế ({product.modelOptions.length} lựa chọn):
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {product.modelOptions.map((mod) => {
                        const isActive = currentModel?.id === mod.id;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => handleModelChange(mod.id)}
                            title={mod.name}
                            className={`flex flex-col items-center rounded border p-1.5 text-center transition cursor-pointer ${
                              isActive
                                ? "border-[#D95326] bg-[#EFEAE0] dark:bg-[#152033]"
                                : "border-[#DCD5C7] dark:border-[#233044] hover:border-[#0B2545]"
                            }`}
                          >
                            {mod.imageUrl && (
                              <div className="h-11 w-full overflow-hidden rounded bg-white dark:bg-[#0E1624] flex items-center justify-center p-0.5">
                                <img
                                  src={mod.imageUrl}
                                  alt={mod.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                            <span
                              className={`mt-1 line-clamp-1 text-tiny leading-tight ${
                                isActive
                                  ? "font-bold text-[#D95326]"
                                  : "text-[#0B2545] dark:text-[#F6F2E8]"
                              }`}
                            >
                              {mod.name
                                .replace("Giáo trình ", "")
                                .replace("Toán cao cấp: ", "")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#DCD5C7] dark:border-[#233044] pt-4">
                <h4 className="text-small font-bold text-[#0B2545] dark:text-[#F6F2E8]">
                  Đặc điểm học cụ tại Cơ sở 1:
                </h4>
                <ul className="mt-2.5 space-y-2 text-small text-[#0B2545]/80 dark:text-[#F6F2E8]/80">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#D95326]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Contiguous Purchase Module */}
            <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                  {product.availabilityStatus === "rented" ||
                  product.inStock <= 0 ? (
                    <span className="font-bold text-[#D95326]">
                      Đang cho thuê hết
                    </span>
                  ) : (
                    <span className="font-bold text-green-700 dark:text-green-400">
                      Còn sẵn {product.inStock} sản phẩm
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    +{product.pointsReward} điểm VIP khi xác nhận thanh toán
                  </span>
                </div>

                <h2 className="text-h2 font-bold text-[#0B2545] dark:text-[#F6F2E8]">
                  {product.name}
                </h2>

                <p className="text-small text-[#0B2545]/80 dark:text-[#F6F2E8]/80">
                  {product.description}
                </p>

                {/* Step 1: Model / Type Selector */}
                {product.modelOptions && product.modelOptions.length > 0 && (
                  <div className="space-y-1.5 border-t border-[#DCD5C7] dark:border-[#233044] pt-4">
                    <label className="block text-small font-bold">
                      1. {product.modelSelectorLabel || "Chọn phân loại:"}
                    </label>
                    <select
                      value={currentModel?.id || ""}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-3 py-2.5 text-small font-bold text-[#0B2545] dark:text-[#F6F2E8] focus:border-[#0B2545] focus:outline-none"
                    >
                      {product.modelOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    {currentModel?.spec && (
                      <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                        {currentModel.spec}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Condition / Variant Selector */}
                <div className="space-y-2 border-t border-[#DCD5C7] dark:border-[#233044] pt-4">
                  <label className="block text-small font-bold">
                    {product.modelOptions
                      ? "2. Chọn gói thuê hoặc mua:"
                      : "Chọn gói thuê hoặc mua:"}
                  </label>
                  <div className="space-y-2">
                    {product.variants.map((v) => {
                      const isSelected = currentVariant.id === v.id;
                      const vPrice = getAdjustedPrice(v);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleVariantChange(v.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded border p-3 text-left transition cursor-pointer ${
                            isSelected
                              ? "border-[#0B2545] dark:border-[#F6F2E8] bg-[#EFEAE0] dark:bg-[#152033]"
                              : "border-[#DCD5C7] dark:border-[#233044] hover:border-[#0B2545]/50"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {v.conditionBadge && (
                                <span className="text-tiny font-bold text-[#D95326]">
                                  {v.conditionBadge}
                                </span>
                              )}
                              {v.conditionBadge && (
                                <span aria-hidden="true">·</span>
                              )}
                              <span className="text-small font-bold truncate">
                                {v.label}
                              </span>
                            </div>
                            {v.conditionDesc && (
                              <p className="mt-0.5 text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                                {v.conditionDesc}
                              </p>
                            )}
                          </div>
                          <span className="text-small font-bold text-[#D95326] shrink-0 tabular-nums">
                            {vPrice.toLocaleString("vi-VN")}đ{" "}
                            <span className="text-tiny font-normal text-[#0B2545]/60 dark:text-[#F6F2E8]/60">
                              {v.unitLabel}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                  <MapPin className="h-4 w-4 shrink-0 text-[#D95326]" />
                  <span>{product.deliveryInfo}</span>
                </div>

                {product.availabilityStatus === "rented" ||
                product.inStock <= 0 ? (
                  <button
                    type="button"
                    onClick={() => onNotifyWhenAvailable?.(product)}
                    className={`flex w-full items-center justify-center gap-2 rounded py-3.5 px-4 text-small font-bold transition cursor-pointer ${
                      isNotified
                        ? "bg-green-700 text-white"
                        : "bg-[#0B2545] text-[#F6F2E8] dark:bg-[#F6F2E8] dark:text-[#0B2545]"
                    }`}
                  >
                    {isNotified ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Đã đăng ký nhận thông báo có hàng</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Nhận thông báo khi có hàng</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex w-full items-center justify-center gap-2 rounded bg-[#D95326] hover:bg-[#C0441B] py-3.5 px-4 text-small font-bold text-white transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      {addedFeedback
                        ? "Đã thêm vào giỏ hàng"
                        : `Thêm vào giỏ — ${finalPrice.toLocaleString("vi-VN")}đ`}
                    </span>
                  </button>
                )}
              </div>

              {/* Student Reviews Section */}
              <div className="space-y-3 border-t border-[#DCD5C7] dark:border-[#233044] pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-small font-bold">
                    Đánh giá sinh viên ({product.reviews.length})
                  </h4>
                  <div className="flex items-center gap-1 text-[#D95326]">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-tiny font-bold tabular-nums">5.0</span>
                  </div>
                </div>

                <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
                  {product.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded border border-[#DCD5C7] dark:border-[#233044] p-3 text-tiny"
                    >
                      <div className="flex items-center justify-between text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                        <span className="font-bold text-[#0B2545] dark:text-[#F6F2E8]">
                          {rev.studentName} ({rev.studentIdMasked}) · {rev.faculty}
                        </span>
                        <span>{rev.date}</span>
                      </div>
                      <p className="mt-1 text-[#0B2545]/80 dark:text-[#F6F2E8]/80">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitReview} className="flex gap-2 pt-1">
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] px-2.5 py-2 text-tiny font-bold"
                  >
                    <option value={5}>5 sao</option>
                    <option value={4}>4 sao</option>
                  </select>
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Viết nhận xét của bạn..."
                    className="flex-1 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent px-3 py-2 text-tiny focus:border-[#0B2545] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded bg-[#0B2545] dark:bg-[#F6F2E8] px-3.5 py-2 text-tiny font-bold text-[#F6F2E8] dark:text-[#0B2545] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
