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
  const pricePrefix = hasRent ? "Thuê từ" : "Giá từ";

  const minVariant = product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
  const priceUnit = minVariant?.unitLabel ? ` ${minVariant.unitLabel}` : "";

  const displayImage =
    product.imageUrl || product.modelOptions?.[0]?.imageUrl;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`group relative flex flex-col justify-between text-left w-full h-full border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] rounded-md overflow-hidden transition-all hover:border-[#0D9488] dark:hover:border-[#2DD4BF] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D9488] ${className}`}
    >
      <div className="w-full">
        {/* Layered Image Frame */}
        <div className="px-4 pt-4 pb-0 w-full">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519]">
            <ProductVisual
              imageUrl={displayImage}
              alt={product.name}
              fallbackIcon={product.fallbackIcon}
              code={product.code}
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Title (2 lines) & 1-line/2-line Subtitle (>=16px) */}
        <div className="px-4 pt-4 pb-3 space-y-1.5 w-full">
          <h3 className="font-serif-display text-[18px] font-bold text-[#0F2228] dark:text-[#F1F5F9] line-clamp-2 leading-snug group-hover:text-[#0D9488] dark:group-hover:text-[#2DD4BF] transition-colors">
            {product.name}
          </h3>
          <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Price & Action Bar (min-h 44px touch target) */}
      <div className="px-4 pb-4 pt-2 w-full mt-auto">
        <div className="pt-3 border-t border-[#E4E0D8] dark:border-[#1E353F] flex items-end justify-between gap-2 min-h-[44px]">
          <div>
            <span className="block text-[14px] font-medium text-[#334E58] dark:text-[#CBD5E1]">
              {pricePrefix}
            </span>
            <span className="font-serif-display text-[20px] font-bold text-[#0F2228] dark:text-[#F1F5F9] tabular-nums">
              {minPrice.toLocaleString("vi-VN")}đ
              {priceUnit && (
                <span className="text-[14px] font-normal text-[#334E58] dark:text-[#CBD5E1]">
                  {priceUnit}
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="text-[14px] font-bold text-[#0F766E] dark:text-[#2DD4BF] tabular-nums">
              +{product.pointsReward}đ VIP
            </span>
            <span className="inline-flex items-center gap-1 text-[15px] font-bold text-[#0F2228] dark:text-[#F1F5F9] group-hover:text-[#0D9488] dark:group-hover:text-[#2DD4BF] transition-colors">
              <span>Chi tiết</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
