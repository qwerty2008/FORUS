import React, { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  QrCode,
  X,
} from "lucide-react";
import { ActiveTab, ProductItem } from "../types";
import { ProductCard } from "../components/ProductCard";
import { FormattedAiMessage } from "../components/FormattedAiMessage";

interface AboutProps {
  products: ProductItem[];
  isLoggedIn?: boolean;
  defaultName?: string;
  defaultEmail?: string;
  onSelectProduct: (product: ProductItem) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAuth?: () => void;
}

interface FaqItem {
  id: string;
  category: "rental" | "ai-points";
  categoryLabel: string;
  question: string;
  answer: string;
}

const FORUS_FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "rental",
    categoryLabel: "Thủ tục thuê & Cọc 0đ",
    question: "Thuê máy tính Casio hay áo Blouse có cần đặt cọc CCCD không?",
    answer:
      "Không cần cọc tiền mặt hay giữ CCCD gốc nếu bạn đăng nhập bằng email sinh viên @student.hcmus.edu.vn (hoặc xuất trình thẻ sinh viên ĐH KHTN tại Quầy Sảnh Tòa I).",
  },
  {
    id: "faq-2",
    category: "rental",
    categoryLabel: "Phân hạng 80% · 90% · 100%",
    question: "Độ mới 80%, 90% và 100% của học cụ khác nhau thế nào?",
    answer:
      "100% là hàng mới nguyên hộp. 90% là thiết bị ngoại hình đẹp trên 90%, nút bấm nhạy. 80% có xước nhẹ vỏ ngoài nhưng mạch tính toán và pin đã được kiểm định kỹ trước khi giao.",
  },
  {
    id: "faq-3",
    category: "rental",
    categoryLabel: "Giao nhận nội khu",
    question: "Đặt in tài liệu hoặc thuê đồ thì nhận ở đâu tại Cơ sở 1?",
    answer:
      "Bạn nhận trực tiếp tại Quầy FORUS ở Sảnh Tòa I hoặc chọn giao tận phòng học tại các tòa B, C, E, F, Thư viện vào đúng khung giờ giải lao giữa ca.",
  },
  {
    id: "faq-4",
    category: "ai-points",
    categoryLabel: "Cơ chế Điểm VIP",
    question: "Điểm VIP được cộng khi nào và dùng để làm gì?",
    answer:
      "Điểm VIP được cộng ngay sau khi bạn xác nhận hoàn tất thanh toán đơn hàng (+5 đến +15 điểm/đơn) hoặc đăng tin gia sư. Điểm dùng để đổi mã giảm giá trực tiếp trong giỏ hàng.",
  },
  {
    id: "faq-5",
    category: "ai-points",
    categoryLabel: "Trợ lý AI Học thuật",
    question: "Trợ lý AI FORUS hỗ trợ những môn nào?",
    answer:
      "Trợ lý AI hỗ trợ giải chi tiết Vi tích phân, Đại số tuyến tính, Xác suất thống kê (hiển thị công thức Toán trực quan), gỡ lỗi C++/Python và tra cứu phòng học tại Cơ sở 1.",
  },
];

// Line-by-line Reveal Heading (Motion 1 of 2: respects prefers-reduced-motion)
const RevealHeading: React.FC<{
  text: string;
  className?: string;
}> = ({
  text,
  className = "font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]",
}) => {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <h2 className={className}>{text}</h2>;
  }

  return (
    <motion.h2
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {text}
    </motion.h2>
  );
};

// Second-Read Paper Boat SVG (Folded from graph paper with atom mark on sail)
const PaperBoatAtomSvg: React.FC<{ className?: string }> = ({
  className = "w-20 h-16",
}) => (
  <svg
    viewBox="0 0 120 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Hull */}
    <path
      d="M10 56L28 78H92L110 56L60 62L10 56Z"
      fill="#F8FAFC"
      stroke="#0B2545"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Left Sail */}
    <path
      d="M60 10L26 57L60 62V10Z"
      fill="#FFFFFF"
      stroke="#0B2545"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right Sail */}
    <path
      d="M60 10L94 57L60 62V10Z"
      fill="#F1F5F9"
      stroke="#0B2545"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Graph lines on sail */}
    <line x1="42" y1="36" x2="60" y2="36" stroke="#CBD5E1" strokeWidth="1" />
    <line x1="34" y1="48" x2="60" y2="48" stroke="#CBD5E1" strokeWidth="1" />
    {/* Atom symbol on right sail */}
    <ellipse
      cx="73"
      cy="43"
      rx="8"
      ry="3.2"
      transform="rotate(-28 73 43)"
      stroke="#D95326"
      strokeWidth="1.4"
    />
    <ellipse
      cx="73"
      cy="43"
      rx="8"
      ry="3.2"
      transform="rotate(28 73 43)"
      stroke="#0B2545"
      strokeWidth="1.4"
    />
    <circle cx="73" cy="43" r="1.8" fill="#D95326" />
  </svg>
);

export const About: React.FC<AboutProps> = ({
  products,
  isLoggedIn = false,
  defaultName = "",
  defaultEmail = "",
  onSelectProduct,
  onNavigateTab,
  onOpenAuth,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const faqSectionRef = useRef<HTMLDivElement | null>(null);

  // Motion 2 of 2: Subtle image parallax on Hero
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroBgY = useTransform(
    heroScroll,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["0%", "8%"]
  );

  // Hover-Accordion state for Section 4 (3 Shortcuts)
  const [activeSlice, setActiveSlice] = useState<"print" | "events" | "tutor">(
    "print"
  );

  // FAQ & Contact Form state
  const [openFaqId, setOpenFaqId] = useState<string>(FORUS_FAQ_ITEMS[0].id);
  const [faqFilter, setFaqFilter] = useState<"all" | "rental" | "ai-points">(
    "all"
  );
  const [contactName, setContactName] = useState(defaultName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmitted(true);
    setContactMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filteredFaqs = FORUS_FAQ_ITEMS.filter(
    (item) => faqFilter === "all" || item.category === faqFilter
  );

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Select 4 core exam-week items: Casio, Textbook, Lab Coat, TechRescue
  const examPriorityIds = [
    "thue-mua-may-tinh-cam-tay",
    "thue-mua-giao-trinh-dai-cuong",
    "thue-mua-ao-blouse-lab",
    "bo-dung-cu-techrescue",
  ];
  const prioritizedProducts = examPriorityIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductItem => Boolean(p));
  const featuredGearProducts =
    prioritizedProducts.length === 4
      ? prioritizedProducts
      : products.slice(0, 4);

  const scrollToFaq = () => {
    faqSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const qrCodeImageUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&color=0B2545&bgcolor=FFFFFF&data=https%3A%2F%2Fqwerty2008.github.io%2FFORUS%2F";

  return (
    <div className="w-full space-y-20 sm:space-y-24 pb-20">
      {/* =================================================================
          SECTION 1 OF 6: HERO (FULL-SCREEN WIDTH & VIEWPORT HEIGHT)
          Anchor: Bottom-left text over full-bleed desk & paper sailboat art
          ================================================================= */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[calc(100vh-4rem)] overflow-hidden border-b border-[#E2E8F0] dark:border-[#233044] flex items-end"
      >
        {/* Full-bleed Lab Notebook Desk Illustration with subtle parallax */}
        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 w-full h-[108%] -top-[4%]"
        >
          <img
            src="./assets/art/hero-desk.webp"
            alt="Bàn học sinh viên Tự Nhiên trên giấy ô ly và thuyền giấy FORUS"
            width={1440}
            height={810}
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Tonal Navy Gradient Overlay at Bottom-Left for crisp text contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-[#0B2545]/95 via-[#0B2545]/75 to-[#0B2545]/10"
        />

        {/* Vertical Red Margin Line running down the left */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-5 sm:left-10 lg:left-16 w-[1.5px] bg-[#D95326]/85 z-10"
        />

        {/* Bottom Safe Area Content + Aesthetic Lab-Notebook QR Stamp Card */}
        <div className="relative z-20 w-full px-6 pl-9 sm:px-12 sm:pl-16 lg:px-20 lg:pl-24 py-10 sm:py-14 lg:py-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-5">
            <span className="stamp bg-[#0B2545]/80 text-[#F8FAFC] border-[#D95326]">
              Sổ tay tiện ích · 227 Nguyễn Văn Cừ
            </span>

            <h1 className="font-serif-display text-display font-bold text-[#F8FAFC] text-balance">
              Tiện ích trong tay, học hay mỗi ngày
            </h1>

            <p className="text-body text-[#F8FAFC]/90 max-w-xl">
              Thuê học cụ, in tài liệu, săn điểm rèn luyện. Ngay tại Cơ sở 1.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => onNavigateTab("gear")}
                className="rounded-[4px] bg-[#D95326] hover:bg-[#C0441B] text-white px-6 py-3 text-small font-bold transition cursor-pointer"
              >
                Xem học cụ
              </button>

              <button
                type="button"
                onClick={scrollToFaq}
                className="inline-flex items-center gap-1.5 text-small font-bold text-[#F8FAFC] border-b border-[#F8FAFC]/60 hover:border-[#D95326] hover:text-[#D95326] pb-0.5 transition cursor-pointer"
              >
                <span>Liên hệ và FAQ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Archival Lab-Notebook QR Specimen Card */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            title="Nhấn để phóng to mã QR trải nghiệm trên điện thoại"
            className="group relative self-start lg:self-end flex sm:flex-row lg:flex-col items-center gap-3.5 sm:gap-4 lg:gap-2.5 rounded-[4px] border border-[#E2E8F0]/90 dark:border-[#233044] bg-[#F8FAFC]/95 dark:bg-[#0E1624]/95 p-3.5 sm:p-4 text-left lg:text-center text-[#0B2545] dark:text-[#F8FAFC] transition hover:border-[#D95326] cursor-pointer shrink-0 lg:w-[216px]"
          >
            {/* Technical drafting corner marks */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#D95326]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t-[1.5px] border-r-[1.5px] border-[#D95326]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b-[1.5px] border-l-[1.5px] border-[#D95326]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#D95326]"
            />

            {/* Top Tiny Stamp Label (Desktop) */}
            <div className="hidden lg:flex items-center justify-between w-full pb-1 border-b border-[#E2E8F0] dark:border-[#233044] text-tiny font-bold">
              <span className="text-[#0B2545]/70 dark:text-[#F8FAFC]/70">
                FORUS MOBILE
              </span>
              <span className="text-[#D95326]">CS1 · NVC</span>
            </div>

            {/* Scannable QR Frame */}
            <div className="relative w-20 h-20 lg:w-36 lg:h-36 rounded-[2px] border border-[#E2E8F0] bg-white p-2 shrink-0 flex items-center justify-center">
              <img
                src={qrCodeImageUrl}
                alt="Mã QR truy cập nhanh hệ sinh thái FORUS trên điện thoại"
                width={144}
                height={144}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption */}
            <div className="space-y-0.5 min-w-0">
              <div className="inline-flex items-center gap-1 text-tiny font-bold text-[#D95326] lg:hidden">
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>FORUS MOBILE · CS1</span>
              </div>
              <p className="text-small font-bold text-[#0B2545] dark:text-[#F8FAFC] leading-snug">
                Quét QR Trải Nghiệm
              </p>
              <p className="text-tiny text-[#0B2545]/65 dark:text-[#F8FAFC]/65">
                Poster Đồ án 1 · Chạm phóng to
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* =================================================================
          SECTION 2 OF 6: HỌC CỤ CHO TUẦN THI (4 SPACIOUS PRODUCT CARDS)
          Anchor: Top-left headline, balanced spec cards, bottom-right link
          ================================================================= */}
      <section className="w-full paper-grid border-y border-[#E2E8F0] dark:border-[#233044] px-6 sm:px-12 lg:px-20 py-14 sm:py-16 lg:py-20 space-y-10">
        <div className="pl-4 margin-rule flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <RevealHeading text="Học cụ cho tuần thi" />
            <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
              Thuê Casio 15.000đ/ngày, áo blouse 15.000đ/buổi, TechRescue 20.000đ/buổi.
            </p>
          </div>
          <span className="stamp">Cọc 0đ với thẻ sinh viên KHTN</span>
        </div>

        {/* 4 Spacious Product Frames across full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {featuredGearProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onNavigateTab("gear")}
            className="inline-flex items-center gap-1.5 text-small font-bold text-[#0B2545] dark:text-[#F8FAFC] border-b-2 border-[#D95326] pb-0.5 hover:text-[#D95326] transition cursor-pointer"
          >
            <span>Xem tất cả ({products.length} học cụ)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =================================================================
          SECTION 3 OF 6: BA TÌNH HUỐNG (FULL-WIDTH EDITORIAL DIPTYCH)
          Anchor: Color-blocked diptych (left paper / right navy)
          ================================================================= */}
      <section className="w-full min-h-[560px] lg:min-h-[78vh] overflow-hidden border-y border-[#E2E8F0] dark:border-[#233044] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Field: Paper White (Scenes 1 & 2 staggered off-grid) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#152033] paper-grid px-6 sm:px-12 lg:px-20 py-12 sm:py-16 lg:py-20 flex flex-col justify-between gap-12 relative">
          <div
            aria-hidden="true"
            className="hidden sm:block absolute top-0 bottom-0 left-8 lg:left-14 w-[1.5px] bg-[#D95326]/70"
          />

          {/* Scene 01 */}
          <div className="sm:pl-8 lg:pl-6 max-w-xl space-y-3.5">
            <div className="flex items-center gap-3">
              {/* Small Ink-Line Calculator Icon */}
              <svg
                viewBox="0 0 40 40"
                className="w-9 h-9 stroke-[#0B2545] dark:stroke-[#F8FAFC] fill-none shrink-0"
                strokeWidth="1.6"
              >
                <rect x="8" y="4" width="24" height="32" rx="2" />
                <rect x="12" y="8" width="16" height="7" />
                <line x1="15" y1="11.5" x2="25" y2="11.5" stroke="#D95326" />
                <circle cx="14" cy="21" r="1.2" fill="currentColor" />
                <circle cx="20" cy="21" r="1.2" fill="currentColor" />
                <circle cx="26" cy="21" r="1.2" fill="currentColor" />
                <circle cx="14" cy="27" r="1.2" fill="currentColor" />
                <circle cx="20" cy="27" r="1.2" fill="currentColor" />
                <circle cx="26" cy="27" r="1.2" fill="currentColor" />
              </svg>
              <span className="stamp">Tình huống 01 · Ca thi sáng</span>
            </div>
            <h3 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              Mai thi, máy tính hết pin.
            </h3>
            <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
              Đặt trước 30 giây, ghé Sảnh Tòa I nhận Casio fx-580VN X đã thay pin mới.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab("gear")}
              className="inline-flex items-center gap-1 text-tiny font-bold text-[#D95326] border-b border-[#D95326] pb-0.5 cursor-pointer"
            >
              <span>Thuê máy tính ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scene 02 — Shifted right off-grid on desktop */}
          <div className="sm:pl-8 lg:pl-6 lg:ml-28 max-w-xl space-y-3.5 border-t border-[#E2E8F0] dark:border-[#233044] pt-10">
            <div className="flex items-center gap-3">
              {/* Small Ink-Line Poster Tube Icon */}
              <svg
                viewBox="0 0 40 40"
                className="w-9 h-9 stroke-[#0B2545] dark:stroke-[#F8FAFC] fill-none shrink-0"
                strokeWidth="1.6"
              >
                <ellipse cx="14" cy="12" rx="6" ry="3" />
                <path d="M8 12V28C8 29.6 10.7 31 14 31C17.3 31 20 29.6 20 28V12" />
                <path
                  d="M20 15H32V31H20"
                  stroke="#D95326"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="stamp">Tình huống 02 · Bảo vệ đồ án</span>
            </div>
            <h3 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              Sáng nộp, poster A1 chưa in.
            </h3>
            <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
              Tải file PDF từ điện thoại, nhận bản in kèm ống đựng tại Sảnh Tòa I.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab("print")}
              className="inline-flex items-center gap-1 text-tiny font-bold text-[#D95326] border-b border-[#D95326] pb-0.5 cursor-pointer"
            >
              <span>Đặt in A5 – A1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Field: Deep Navy #0B2545 (Scene 3) */}
        <div className="lg:col-span-5 bg-[#0B2545] text-[#F8FAFC] px-6 sm:px-12 lg:px-16 py-12 sm:py-16 lg:py-20 flex flex-col justify-center space-y-6 border-t lg:border-t-0 lg:border-l border-[#233044]">
          <div className="flex items-center gap-3">
            {/* Small Ink-Line Countdown Clock Icon */}
            <svg
              viewBox="0 0 40 40"
              className="w-9 h-9 stroke-[#F8FAFC] fill-none shrink-0"
              strokeWidth="1.6"
            >
              <circle cx="20" cy="21" r="13" />
              <polyline points="20,13 20,21 26,24" stroke="#D95326" />
              <line x1="16" y1="4" x2="24" y2="4" />
            </svg>
            <span className="stamp border-[#D95326] text-[#F8FAFC]">
              Tình huống 03 · Điểm rèn luyện
            </span>
          </div>

          <h3 className="font-serif-display text-h1 font-bold text-[#F8FAFC]">
            Form đóng sau 2 giờ.
          </h3>

          <p className="text-small text-[#F8FAFC]/80 max-w-md">
            Theo dõi đồng hồ đếm ngược các buổi seminar, học bổng và hoạt động tình nguyện tại Cơ sở 1.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab("events")}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[#D95326] hover:bg-[#C0441B] text-white px-5 py-2.5 text-small font-bold transition cursor-pointer"
            >
              <span>Xem lịch sự kiện</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================
          SECTION 4 OF 6: BA LỐI TẮT (HOVER-ACCORDION SLICES)
          Anchor: 3 tall vertical slices that expand on hover across full width
          ================================================================= */}
      <section className="w-full px-6 sm:px-12 lg:px-20 space-y-8">
        <div className="pl-4 margin-rule flex items-baseline justify-between gap-4">
          <RevealHeading text="Ba lối tắt dịch vụ tại Sảnh Tòa I" />
          <span className="text-tiny text-[#0B2545]/60 dark:text-[#F8FAFC]/60 hidden sm:inline">
            Chạm hoặc rê chuột để mở rộng
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:h-[520px]">
          {[
            {
              id: "print" as const,
              tab: "print" as ActiveTab,
              code: "01",
              title: "In ấn",
              subtitle: "Tài liệu A4, sổ tay A5 và poster A1 lấy liền giữa ca.",
              image: "./assets/art/slice-print.webp",
            },
            {
              id: "events" as const,
              tab: "events" as ActiveTab,
              code: "02",
              title: "Sự kiện",
              subtitle: "Đếm ngược hạn đăng ký hội thảo và học bổng HCMUS.",
              image: "./assets/art/slice-events.webp",
            },
            {
              id: "tutor" as const,
              tab: "tutor" as ActiveTab,
              code: "03",
              title: "Gia sư",
              subtitle: "Kết nối lớp dạy kèm Quận 5 và gia sư sinh viên Tự Nhiên.",
              image: "./assets/art/slice-tutor.webp",
            },
          ].map((slice) => {
            const isExpanded = activeSlice === slice.id;
            return (
              <button
                key={slice.id}
                type="button"
                onMouseEnter={() => setActiveSlice(slice.id)}
                onFocus={() => setActiveSlice(slice.id)}
                onClick={() => onNavigateTab(slice.tab)}
                className={`group relative overflow-hidden rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] text-left transition-all duration-300 cursor-pointer min-h-[260px] lg:min-h-0 flex flex-col justify-end p-6 sm:p-8 ${
                  isExpanded ? "lg:flex-[1.85]" : "lg:flex-1"
                }`}
              >
                <img
                  src={slice.image}
                  alt={slice.title}
                  loading="lazy"
                  width={600}
                  height={800}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/95 via-[#0B2545]/45 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 left-5 w-[1px] bg-[#D95326]/75"
                />

                <div className="relative z-10 pl-3 space-y-1.5">
                  <span className="text-tiny font-bold text-[#D95326] tabular-nums">
                    MỤC {slice.code}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif-display text-h1 font-bold text-[#F8FAFC]">
                      {slice.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-[#F8FAFC] transition-transform group-hover:translate-x-1 shrink-0" />
                  </div>
                  <p className="text-small text-[#F8FAFC]/85 max-w-md">
                    {slice.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =================================================================
          SECTION 5 OF 6: TRỢ LÝ AI & SƠ ĐỒ CS1 (FULL-WIDTH BLUEPRINT DARK)
          Anchor: Right 1/3 serif caption + ghost button; Left 2/3 real UI
          ================================================================= */}
      <section className="w-full min-h-[540px] lg:min-h-[76vh] dark blueprint-grid border-y border-[#233044] px-6 sm:px-12 lg:px-20 py-14 sm:py-18 lg:py-24 text-[#F8FAFC] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Right 1/3 Caption (lg:order-2) */}
          <div className="lg:col-span-4 lg:order-2 space-y-5 pl-4 margin-rule">
            <span className="stamp border-[#D95326] text-[#F8FAFC]">
              Bản vẽ kỹ thuật · B1 – L11
            </span>
            <h2 className="font-serif-display text-h1 font-bold text-[#F8FAFC]">
              Hỏi AI giải Vi tích phân. Tìm phòng học từ B1 đến L11.
            </h2>
            <p className="text-small text-[#F8FAFC]/80">
              Hiển thị công thức Toán trực quan bằng KaTeX, kèm sơ đồ mặt bằng các tòa A, B, C, E, F, I tại 227 Nguyễn Văn Cừ.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab("vip")}
                className="inline-flex items-center gap-2 rounded-[4px] border border-[#F8FAFC] hover:border-[#D95326] hover:bg-[#D95326] px-5 py-2.5 text-small font-bold text-[#F8FAFC] transition cursor-pointer"
              >
                <span>Mở trợ lý &amp; sơ đồ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Left 2/3 Real Believable UI Panel (lg:order-1) */}
          <div className="lg:col-span-8 lg:order-1 space-y-5">
            {/* Thin-line Architectural Floor Plan Preview */}
            <div className="rounded-[4px] border border-[#233044] bg-[#152033]/90 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#233044] pb-3 text-tiny">
                <span className="font-bold text-[#F8FAFC]">
                  MẶT BẰNG CƠ SỞ 1 — 227 NGUYỄN VĂN CỪ (TẦNG B1 → L11)
                </span>
                <span className="text-[#D95326] font-bold">
                  ● Quầy FORUS: Sảnh Tòa I
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-tiny">
                {[
                  { code: "Tòa F", desc: "P.F102 · F203", highlight: false },
                  { code: "Tòa C", desc: "Lab Địa chất", highlight: false },
                  { code: "Tòa B", desc: "P.Đào tạo B.02", highlight: false },
                  { code: "Tòa A", desc: "P.CTSV A.02", highlight: false },
                  { code: "Tòa E", desc: "Hầm xe B1–E", highlight: false },
                  { code: "Tòa I", desc: "Trạm FORUS L1", highlight: true },
                ].map((b) => (
                  <div
                    key={b.code}
                    className={`p-3 rounded-[2px] border ${
                      b.highlight
                        ? "border-[#D95326] bg-[#D95326]/15 text-[#F8FAFC]"
                        : "border-[#233044] bg-[#0E1624]/70 text-[#F8FAFC]/80"
                    }`}
                  >
                    <p className="font-bold">{b.code}</p>
                    <p className="text-[#F8FAFC]/65 truncate mt-0.5">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real KaTeX Math Chat Preview Card */}
            <div className="rounded-[4px] border border-[#233044] bg-[#0E1624] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between text-tiny text-[#F8FAFC]/60">
                <span>TRỢ LÝ AI HỌC THUẬT FORUS</span>
                <span>KaTeX Math</span>
              </div>
              <div className="text-small text-[#F8FAFC] bg-[#152033] border border-[#233044] rounded-[4px] p-4">
                <FormattedAiMessage
                  text={
                    "Khai triển Maclaurin của hàm số $f(x) = \\sin(x)$ đến bậc 5:\n$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} + O(x^7)$$"
                  }
                  isUser={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          SECTION 6 OF 6: KẾT (PAPER SAILBOAT SECOND-READ + SỔ TAY FAQ)
          Anchor: Centered minimalist closing + Notebook FAQ & Contact
          ================================================================= */}
      <section className="w-full px-6 sm:px-12 lg:px-20 space-y-16">
        {/* Centered Minimalist Closing with Second-Read Paper Boat (hidden when logged in) */}
        {!isLoggedIn && (
          <div className="py-12 sm:py-16 px-4 text-center max-w-xl mx-auto space-y-5 border-b border-[#E2E8F0] dark:border-[#233044]">
            <div className="flex justify-center">
              <PaperBoatAtomSvg className="w-24 h-20" />
            </div>

            <h2 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              Đăng nhập, tích điểm VIP, đổi voucher.
            </h2>

            <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
              Dùng email @student.hcmus.edu.vn để thuê học cụ không cần cọc CCCD và tích điểm sau mỗi đơn hàng.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) {
                    onOpenAuth();
                  } else {
                    onNavigateTab("vip");
                  }
                }}
                className="rounded-[4px] bg-[#D95326] hover:bg-[#C0441B] text-white px-7 py-3 text-small font-bold transition cursor-pointer"
              >
                Đăng nhập sinh viên
              </button>
            </div>

            <p className="text-tiny text-[#0B2545]/60 dark:text-[#F8FAFC]/60 pt-2">
              227 Nguyễn Văn Cừ, Quận 5 · Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM)
            </p>
          </div>
        )}

        {/* Integrated Lab Notebook FAQ & Contact Station */}
        <div
          ref={faqSectionRef}
          id="faq-notebook-section"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pt-4"
        >
          {/* Left 7 Cols: Lab Notebook FAQ */}
          <div className="lg:col-span-7 space-y-5">
            <div className="pl-4 margin-rule flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif-display text-h1 font-bold">
                Sổ tay giải đáp nhanh (FAQ)
              </h3>
              <div className="flex items-center gap-4 text-small">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "rental", label: "Thuê & In" },
                  { id: "ai-points", label: "VIP & AI" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFaqFilter(tab.id as typeof faqFilter)}
                    className={`pb-1 font-bold border-b-2 transition cursor-pointer ${
                      faqFilter === tab.id
                        ? "border-[#D95326] text-[#0B2545] dark:text-[#F8FAFC]"
                        : "border-transparent text-[#0B2545]/60 dark:text-[#F8FAFC]/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#233044] border-y border-[#E2E8F0] dark:border-[#233044]">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className="py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaqId((prev) => (prev === faq.id ? "" : faq.id))
                      }
                      className="w-full flex items-start justify-between gap-4 text-left cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="stamp">{faq.categoryLabel}</span>
                        <span className="block text-body font-bold text-[#0B2545] dark:text-[#F8FAFC] pt-1">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 mt-1 transition-transform duration-150 ${
                          isOpen ? "rotate-180 text-[#D95326]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-small text-[#0B2545]/80 dark:text-[#F8FAFC]/80">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Contact Station Sảnh Tòa I */}
          <div className="lg:col-span-5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] p-6 sm:p-8 space-y-5">
            <div className="pl-3 margin-rule space-y-1">
              <h3 className="font-serif-display text-h2 font-bold">
                Trạm trực Sảnh Tòa I — CS1
              </h3>
              <p className="text-tiny text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
                Hỗ trợ giao nhận học cụ và bản in giữa các ca học.
              </p>
            </div>

            <div className="space-y-2 text-small">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#D95326] mt-1" />
                <span>Sảnh Tòa I, 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-[#D95326] mt-1" />
                <span>06:45 – 20:30 (Thứ 2 – Thứ 7)</span>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3 pt-1">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Họ tên & MSSV"
                className="w-full rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] px-3 py-2 text-small focus:border-[#0B2545] focus:outline-none"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email @student.hcmus.edu.vn"
                className="w-full rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] px-3 py-2 text-small focus:border-[#0B2545] focus:outline-none"
              />
              <textarea
                rows={2}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Nội dung cần hỗ trợ tại Cơ sở 1..."
                className="w-full rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] px-3 py-2 text-small focus:border-[#0B2545] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#0B2545] hover:bg-[#163A66] text-white px-4 py-2.5 text-small font-bold transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Gửi tin nhắn tới Trạm FORUS</span>
              </button>
              {submitted && (
                <p className="flex items-center gap-1.5 text-tiny font-bold text-[#D95326]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Đã ghi nhận vào sổ trực Sảnh Tòa I!</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Enlarged QR Modal for Poster Presentation Scanning */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2545]/75 p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              aria-label="Đóng mã QR"
              className="absolute top-3.5 right-3.5 p-1.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] text-[#0B2545] dark:text-[#F8FAFC] hover:border-[#D95326] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="stamp">Trạm FORUS · 227 Nguyễn Văn Cừ</span>

            <h3 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
              Quét QR Trải Nghiệm Mobile
            </h3>

            <div className="mx-auto w-56 h-56 rounded-[4px] border border-[#E2E8F0] bg-white p-3 flex items-center justify-center">
              <img
                src={qrCodeImageUrl}
                alt="Mã QR phóng to FORUS"
                width={220}
                height={220}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
              Mở trực tiếp giao diện di động tại buổi chấm Poster Đồ án 1 (Khoa CNTT — ĐH KHTN).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
