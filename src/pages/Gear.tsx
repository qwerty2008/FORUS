import React, { useState } from "react";
import { Search } from "lucide-react";
import { ProductItem } from "../types";
import { ProductCard } from "../components/ProductCard";

interface GearProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
}

export const Gear: React.FC<GearProps> = ({ products, onSelectProduct }) => {
  const [filter, setFilter] = useState<
    "all" | "tech-gear" | "study-aid" | "rental"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured"
  );

  const categories: {
    id: "all" | "tech-gear" | "study-aid" | "rental";
    label: string;
  }[] = [
    { id: "all", label: "Tất cả" },
    { id: "tech-gear", label: "Thiết bị công nghệ" },
    { id: "study-aid", label: "Học cụ & Giáo trình" },
    { id: "rental", label: "Gói thuê ngắn hạn" },
  ];

  const filteredProducts = products
    .filter((item) => {
      const matchesCat =
        filter === "all"
          ? true
          : filter === "rental"
          ? item.variants.some((v) => v.type === "rent")
          : item.category === filter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const minA = Math.min(...a.variants.map((v) => v.price));
      const minB = Math.min(...b.variants.map((v) => v.price));
      if (sortBy === "price-asc") return minA - minB;
      if (sortBy === "price-desc") return minB - minA;
      return 0;
    });

  return (
    <div className="space-y-10 pb-16">
      {/* Magazine-Style Editorial Header */}
      <div className="border-b border-[#E2E8F0] dark:border-[#233044] pb-6 pl-4 margin-rule space-y-2">
        <h1 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
          Thuê &amp; Bán học cụ Cơ sở 1
        </h1>
        <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75 max-w-xl">
          Thuê Casio, áo blouse theo buổi hoặc mua lại giáo trình 80% – 100%. Nhận tại Sảnh Tòa I.
        </p>
      </div>

      {/* Underlined Text Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#233044] pb-3">
        <div className="flex flex-wrap items-center gap-6">
          {categories.map((cat) => {
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={`relative pb-2 text-small font-bold transition cursor-pointer whitespace-nowrap border-b-2 ${
                  active
                    ? "border-[#D95326] text-[#0B2545] dark:text-[#F8FAFC]"
                    : "border-transparent text-[#0B2545]/60 dark:text-[#F8FAFC]/60 hover:text-[#0B2545] dark:hover:text-[#F8FAFC]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0B2545]/50 dark:text-[#F8FAFC]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Casio, áo blouse, giáo trình..."
              className="w-full rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] pl-9 pr-3 py-2 text-small focus:border-[#0B2545] focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sắp xếp học cụ"
            className="rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] px-3 py-2 text-small font-bold focus:outline-none cursor-pointer"
          >
            <option value="featured">Mặc định</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Product Grid: 2 columns on mobile, 3–4 columns on desktop */}
      {filteredProducts.length === 0 ? (
        <div className="border border-[#E2E8F0] dark:border-[#233044] rounded-[4px] p-12 text-center space-y-4">
          <p className="text-body text-[#0B2545]/80 dark:text-[#F8FAFC]/80">
            Không tìm thấy học cụ khớp với từ khóa của bạn.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setSearchQuery("");
            }}
            className="rounded-[4px] bg-[#0B2545] dark:bg-[#F8FAFC] text-[#F8FAFC] dark:text-[#0B2545] px-4 py-2 text-small font-bold cursor-pointer"
          >
            Xem tất cả học cụ
          </button>
        </div>
      ) : (
        <div className="paper-grid p-4 sm:p-6 lg:p-8 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gear;
