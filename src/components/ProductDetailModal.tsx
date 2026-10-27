import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Check,
  Star,
  MapPin,
  Sparkles,
  MessageSquarePlus,
} from "lucide-react";
import { ProductItem, PricingVariant, ProductReview } from "../types";
import { ProductVisual } from "./ProductVisual";

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, variant: PricingVariant) => void;
  onAddReview: (productId: string, review: ProductReview) => void;
  studentName: string;
  studentFaculty: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddReview,
  studentName,
  studentFaculty,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) return null;

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0];

  const handleAdd = () => {
    onAddToCart(product, currentVariant);
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
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {product.code}
            </span>
            <span aria-hidden="true">·</span>
            <span>Chi tiết sản phẩm / dịch vụ FORUS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              className="h-72 w-full rounded-2xl"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Điểm khác biệt dành riêng cho Sinh viên ĐH KHTN:
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {product.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Còn {product.inStock} suất sẵn sàng tại CS1</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  +{product.pointsReward} điểm thưởng FORUS
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h2>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {product.description}
              </p>

              {/* Variant Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chọn hình thức (Thuê / Mua):
                </label>
                <div className="space-y-2">
                  {product.variants.map((v) => {
                    const isSelected = currentVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-sky-600 bg-sky-50/80 dark:border-sky-400 dark:bg-sky-950/40"
                            : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {v.label}
                        </span>
                        <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
                          {v.price.toLocaleString("vi-VN")}đ{" "}
                          <span className="text-[11px] font-normal text-slate-500">
                            {v.unitLabel}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                <span>{product.deliveryInfo}</span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white transition hover:bg-sky-500"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {addedFeedback
                    ? "Đã Thêm Vào Giỏ Hàng (✓)"
                    : `Thêm Vào Giỏ — ${currentVariant.price.toLocaleString("vi-VN")}đ (+${product.pointsReward} điểm)`}
                </span>
              </button>
            </div>

            {/* Student Reviews Section */}
            <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Đánh giá từ Sinh viên KHTN ({product.reviews.length})
                </h4>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-mono text-xs font-bold">5.0</span>
                </div>
              </div>

              <div className="max-h-36 space-y-2.5 overflow-y-auto pr-1">
                {product.reviews.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Hãy là sinh viên đầu tiên để lại nhận xét cho sản phẩm này!
                  </p>
                ) : (
                  product.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {rev.studentName} ({rev.studentIdMasked}) · {rev.faculty}
                        </span>
                        <span>{rev.date}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleSubmitReview} className="flex gap-2 pt-1">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={5}>5 ★</option>
                  <option value={4}>4 ★</option>
                </select>
                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Viết nhận xét của bạn..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-slate-700 whitespace-nowrap shrink-0"
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
