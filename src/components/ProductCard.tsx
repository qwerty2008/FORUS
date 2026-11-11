import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ProductItem } from "../types";
import { ProductVisual } from "./ProductVisual";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  className = "",
}) => {
  const minPrice = product.variants.reduce(
    (min, v) => (v.price < min ? v.price : min),
    product.variants[0]?.price || 0
  );

  const hasRent = product.variants.some((v) => v.type === "rent");
  const hasBuy = product.variants.some((v) => v.type === "buy");
  const stampLabel =
    hasRent && hasBuy ? "THUÊ & MUA" : hasRent ? "CHO THUÊ" : "MUA ĐỨT";
  const pricePrefix = hasRent ? "Thuê từ" : "Giá từ";

  const minVariant = product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
  const priceUnit = minVariant?.unitLabel ? ` ${minVariant.unitLabel}` : "";

  const displayImage =
    product.imageUrl || product.modelOptions?.[0]?.imageUrl;

  const optionCountLabel =
    product.modelOptions && product.modelOptions.length > 0
      ? `${product.modelOptions.length} mẫu tùy chọn`
      : `${product.variants.length} gói giá`;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`group relative flex flex-col justify-between text-left w-full h-full border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] rounded-[4px] overflow-hidden transition-all hover:border-[#0B2545] dark:hover:border-[#F8FAFC]/60 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D95326] ${className}`}
    >
      <div className="w-full">
        {/* Top Archival Spec Header: Code + Option Count & Stamp (never clips) */}
        <div className="px-4 pt-3.5 flex items-center justify-between gap-2">
          <span className="text-tiny font-bold text-[#0B2545]/60 dark:text-[#F8FAFC]/60 tabular-nums truncate">
            {product.code} · {optionCountLabel}
          </span>
          <span className="stamp shrink-0">{stampLabel}</span>
        </div>

        {/* Layered Image Frame */}
        <div className="px-4 pt-2.5 pb-0 w-full">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624]">
            <ProductVisual
              imageUrl={displayImage}
              alt={product.name}
              fallbackIcon={product.fallbackIcon}
              code={product.code}
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Title (2 lines) & Subtitle (2 lines) */}
        <div className="px-4 pt-3.5 pb-3 space-y-1.5 w-full">
          <h3 className="text-body font-bold text-[#0B2545] dark:text-[#F8FAFC] line-clamp-2 leading-snug group-hover:text-[#D95326] transition-colors">
            {product.name}
          </h3>
          <p className="text-tiny text-[#0B2545]/70 dark:text-[#F8FAFC]/70 line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Price & Action Bar */}
      <div className="px-4 pb-4 pt-2.5 w-full mt-auto">
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#233044] flex items-end justify-between gap-2">
          <div>
            <span className="block text-tiny text-[#0B2545]/65 dark:text-[#F8FAFC]/65">
              {pricePrefix}
            </span>
            <span className="text-h2 font-bold text-[#0B2545] dark:text-[#F8FAFC] tabular-nums">
              {minPrice.toLocaleString("vi-VN")}đ
              {priceUnit && (
                <span className="text-tiny font-normal text-[#0B2545]/65 dark:text-[#F8FAFC]/65">
                  {priceUnit}
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="text-tiny font-bold text-[#D95326] tabular-nums">
              +{product.pointsReward}đ VIP
            </span>
            <span className="inline-flex items-center gap-0.5 text-tiny font-bold text-[#0B2545] dark:text-[#F8FAFC] group-hover:text-[#D95326] transition-colors">
              <span>Chi tiết</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
