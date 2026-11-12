import React, { useState, useRef } from "react";
import {
  motion,
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
  Sparkles,
  Building2,
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

// Concise, high-clarity FAQ answers (rewritten for 1-sentence scannability on mobile)
const FORUS_FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "rental",
    categoryLabel: "Thủ tục thuê & Cọc 0đ",
    question: "Thuê máy tính Casio hay áo Blouse có cần đặt cọc CCCD không?",
    answer:
      "Miễn cọc tiền mặt và không giữ CCCD gốc khi bạn đăng nhập bằng email @student.hcmus.edu.vn hoặc xuất trình thẻ sinh viên KHTN tại Sảnh Tòa I.",
  },
  {
    id: "faq-2",
    category: "rental",
    categoryLabel: "Phân hạng 80% · 90% · 100%",
    question: "Độ mới 80%, 90% và 100% của học cụ khác nhau thế nào?",
    answer:
      "100% là hàng mới nguyên hộp; 90% ngoại hình đẹp trên 90% nút bấm nhạy; 80% có xước nhẹ vỏ ngoài nhưng mạch tính toán và pin đã kiểm định kỹ.",
  },
  {
    id: "faq-3",
    category: "rental",
    categoryLabel: "Giao nhận nội khu",
    question: "Đặt in tài liệu hoặc thuê đồ thì nhận ở đâu tại Cơ sở 1?",
    answer:
      "Nhận trực tiếp tại Quầy FORUS Sảnh Tòa I hoặc chọn giao tận phòng học tại các tòa B, C, E, F, Thư viện vào đúng giờ giải lao giữa ca.",
  },
  {
    id: "faq-4",
    category: "ai-points",
    categoryLabel: "Cơ chế Điểm VIP",
    question: "Điểm VIP được cộng khi nào và dùng để làm gì?",
    answer:
      "Cộng ngay sau khi hoàn tất đơn hàng (+5 đến +15 điểm/đơn) hoặc đăng tin gia sư, dùng để đổi mã giảm giá trực tiếp trong giỏ hàng.",
  },
  {
    id: "faq-5",
    category: "ai-points",
    categoryLabel: "Trợ lý AI Học thuật",
    question: "Trợ lý AI FORUS hỗ trợ những môn nào?",
    answer:
      "Giải chi tiết Vi tích phân, Đại số tuyến tính, Xác suất thống kê (hiển thị công thức KaTeX), gỡ lỗi C++/Python và tra cứu phòng học Cơ sở 1.",
  },
];

interface AiDemoSample {
  id: "math" | "code" | "campus";
  badge: string;
  buttonLabel: string;
  question: string;
  answer: string;
  highlightBuilding: string;
}

const AI_DEMO_SAMPLES: AiDemoSample[] = [
  {
    id: "math",
    badge: "Toán Đại cương · KaTeX",
    buttonLabel: "Giải tích Maclaurin",
    question: "Khai triển Maclaurin của hàm số $f(x) = \\sin(x)$ đến bậc 5 và ước lượng sai số?",
    answer:
      "Ta có đạo hàm cấp cao tại $x = 0$: $f(0)=0, f'(0)=1, f''(0)=0, f^{(3)}(0)=-1, f^{(5)}(0)=1$.\nKhai triển Maclaurin của $\\sin(x)$ đến bậc 5:\n$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} + O(x^7)$$\nKhi $|x| \\le 0.5$, sai số tuyệt đối nhỏ hơn $\\frac{|x|^7}{7!} \\approx 1.55 \\times 10^{-6}$.",
    highlightBuilding: "Tòa B",
  },
  {
    id: "code",
    badge: "Lập trình C++ / Python",
    buttonLabel: "Gỡ lỗi C++ Vector",
    question: "Vì sao vòng lặp kiểm tra mảng `for (int i = 0; i <= a.size() - 1; i++)` bị lỗi Runtime Error khi vector rỗng?",
    answer:
      "Hàm `a.size()` trả về kiểu không dấu `size_t` (`unsigned`). Khi `a` rỗng (`a.size() == 0`), phép tính `0 - 1` bị tràn số thành `SIZE_MAX`, khiến vòng lặp truy cập vùng nhớ ngoài mảng.\nCách sửa an toàn với độ phức tạp $O(N)$:\n`for (size_t i = 0; i < a.size(); ++i)` hoặc ép kiểu `int(a.size())`.",
    highlightBuilding: "Tòa I",
  },
  {
    id: "campus",
    badge: "Sơ đồ Cơ sở 1 · B1 → L11",
    buttonLabel: "Tìm phòng F203 & Tòa I",
    question: "Mình vừa qua cổng 227 Nguyễn Văn Cừ, đi hướng nào tới phòng F203 và ghé nhận máy tính Casio tại Quầy FORUS?",
    answer:
      "Từ cổng chính **227 Nguyễn Văn Cừ**, bạn đi thẳng qua sân trung tâm sẽ thấy **Sảnh Tòa I (Tầng L1)** bên tay phải — ghé nhận máy tính Casio trong 30 giây, sau đó rẽ sang dãy **Tòa F** cầu thang bộ lên tầng 2 là tới **Phòng F203**.",
    highlightBuilding: "Tòa F",
  },
];

interface CampusBuildingInfo {
  code: string;
  name: string;
  desc: string;
  detail: string;
  highlight?: boolean;
}

const CAMPUS_BUILDINGS: CampusBuildingInfo[] = [
  {
    code: "Tòa I",
    name: "Tòa I — Khoa CNTT & Trạm FORUS",
    desc: "Trạm FORUS L1",
    detail: "Sảnh tầng 1 (L1): Quầy giao nhận học cụ, bản in A5–A1 và hỗ trợ trực tiếp từ 06:45 – 20:30.",
    highlight: true,
  },
  {
    code: "Tòa F",
    name: "Dãy F — Giảng đường & Phòng máy",
    desc: "P.F102 · F203",
    detail: "Tập trung các phòng học lý thuyết và thực hành máy tính tầng 1–3; nhận giao học cụ tận phòng giờ giải lao.",
  },
  {
    code: "Tòa B",
    name: "Tòa B — Giảng đường & Phòng Đào tạo",
    desc: "P.Đào tạo B.02",
    detail: "Khu giảng đường lớn các môn Toán Đại cương, Vật lý đại cương và Phòng Đào tạo (B.02).",
  },
  {
    code: "Tòa C",
    name: "Tòa C — Khu Phòng Thí nghiệm",
    desc: "Lab Hóa · Sinh",
    detail: "Khu thực hành Hóa học, Sinh học, Địa chất — điểm sinh viên thường thuê áo Blouse trắng trước ca lab.",
  },
  {
    code: "Tòa A",
    name: "Tòa A — Hành chính & P.CTSV",
    desc: "P.CTSV A.02",
    detail: "Phòng Công tác Sinh viên (A.02), nơi tiếp nhận hồ sơ học bổng và xác nhận điểm rèn luyện.",
  },
  {
    code: "Tòa E",
    name: "Tòa E & Hầm B1 — Khu Giảng đường",
    desc: "Hầm xe B1–E",
    detail: "Lối xuống hầm giữ xe sinh viên B1 và các phòng học chuyên đề dọc hành lang C–E.",
  },
];

// Subtle Reveal Heading (respects prefers-reduced-motion)
const RevealHeading: React.FC<{
  text: string;
  className?: string;
}> = ({
  text,
  className = "font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]",
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
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {text}
    </motion.h2>
  );
};

// Paper Boat SVG with HCMUS Science Teal & Atom Emblem
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
    <path
      d="M10 56L28 78H92L110 56L60 62L10 56Z"
      fill="#FAF8F5"
      stroke="#0F2228"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M60 10L26 57L60 62V10Z"
      fill="#FFFFFF"
      stroke="#0F2228"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M60 10L94 57L60 62V10Z"
      fill="#CCFBF1"
      stroke="#0F2228"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <line x1="42" y1="36" x2="60" y2="36" stroke="#99F6E4" strokeWidth="1.2" />
    <line x1="34" y1="48" x2="60" y2="48" stroke="#99F6E4" strokeWidth="1.2" />
    <ellipse
      cx="73"
      cy="43"
      rx="8"
      ry="3.2"
      transform="rotate(-28 73 43)"
      stroke="#0D9488"
      strokeWidth="1.5"
    />
    <ellipse
      cx="73"
      cy="43"
      rx="8"
      ry="3.2"
      transform="rotate(28 73 43)"
      stroke="#0F2228"
      strokeWidth="1.5"
    />
    <circle cx="73" cy="43" r="2" fill="#0D9488" />
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
  const servicesSectionRef = useRef<HTMLElement | null>(null);
  const faqSectionRef = useRef<HTMLElement | null>(null);

  // Interactive AI Demo State (Section 4 Light Interactive Moment)
  const [selectedAiSampleId, setSelectedAiSampleId] = useState<
    "math" | "code" | "campus"
  >("math");
  const [selectedBuildingCode, setSelectedBuildingCode] =
    useState<string>("Tòa I");

  const activeAiSample =
    AI_DEMO_SAMPLES.find((s) => s.id === selectedAiSampleId) ||
    AI_DEMO_SAMPLES[0];
  const activeBuildingInfo =
    CAMPUS_BUILDINGS.find((b) => b.code === selectedBuildingCode) ||
    CAMPUS_BUILDINGS[0];

  // FAQ & Contact Form state
  const [openFaqId, setOpenFaqId] = useState<string>(FORUS_FAQ_ITEMS[0].id);
  const [faqFilter, setFaqFilter] = useState<"all" | "rental" | "ai-points">(
    "all"
  );
  const [contactName, setContactName] = useState(defaultName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = contactMessage.trim();
    const trimmedEmail = contactEmail.trim();
    if (!trimmedMessage) {
      setContactError("Vui lòng nhập nội dung cần hỗ trợ tại Cơ sở 1.");
      return;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setContactError("Email chưa đúng định dạng (ví dụ: mssv@student.hcmus.edu.vn).");
      return;
    }
    setContactError("");
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

  const scrollToServices = () => {
    servicesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFaq = () => {
    faqSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const qrCodeImageUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=0&color=0F2228&bgcolor=FFFFFF&data=https%3A%2F%2Fqwerty2008.github.io%2FFORUS%2F";

  return (
    <div className="w-full">
      {/* =================================================================
          SECTION 1: HERO MỘT MÀN HÌNH (FULL-VIEWPORT, WARM LIGHT & TEAL)
          Aligned left/right container: max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16
          ================================================================= */}
      <section className="relative w-full min-h-[calc(100vh-5rem)] overflow-hidden border-b border-[#E4E0D8] dark:border-[#1E353F] flex items-center bg-[#0F2228]">
        {/* Full-bleed Lab Notebook Desk Illustration */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="./assets/art/hero-desk.webp"
            alt="Bàn học sinh viên Tự Nhiên trên giấy ô ly và thuyền giấy FORUS"
            width={1440}
            height={810}
            fetchPriority="high"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* High-contrast Deep Slate-Teal Gradient Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-[#09181D]/95 via-[#0F2228]/80 to-[#0D9488]/20"
        />

        {/* Aligned Content Container */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 py-10 sm:py-14 lg:pt-12 lg:pb-24 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-3xl space-y-5 pl-4 sm:pl-6 border-l-3 border-[#14B8A6]">
            <h1 className="font-serif-display text-display font-bold text-white text-balance">
              Tiện ích trong tay, học hay mỗi ngày
            </h1>

            <p className="text-[17px] sm:text-[18px] text-[#F1F5F9] max-w-2xl leading-relaxed">
              Thuê học cụ cọc 0đ, in tài liệu lấy liền, săn điểm rèn luyện, kết nối gia sư và hỏi Trợ lý AI ngay giữa các tiết học.
            </p>

            {/* Primary CTA ("Khám phá tiện ích") + Secondary CTA */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={scrollToServices}
                className="min-h-[48px] px-7 py-3 rounded-md bg-[#0D9488] hover:bg-[#0F766E] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>Khám phá tiện ích</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToFaq}
                className="min-h-[48px] px-5 py-3 rounded-md border border-white/40 hover:border-[#2DD4BF] bg-white/10 hover:bg-white/15 text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <span>Liên hệ và FAQ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Aesthetic Lab-Notebook QR Specimen Card */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            title="Nhấn để phóng to mã QR trải nghiệm trên điện thoại"
            className="group relative self-start lg:self-center flex sm:flex-row lg:flex-col items-center gap-4 lg:gap-2.5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5]/95 dark:bg-[#122128]/95 p-4 text-left lg:text-center text-[#0F2228] dark:text-[#F1F5F9] transition hover:border-[#0D9488] cursor-pointer shrink-0 lg:w-[224px]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#0D9488]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#0D9488]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#0D9488]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#0D9488]"
            />

            <div className="hidden lg:flex items-center justify-between w-full pb-1.5 border-b border-[#E4E0D8] dark:border-[#1E353F] text-[13px] font-bold">
              <span className="text-[#334E58] dark:text-[#CBD5E1]">
                FORUS MOBILE
              </span>
              <span className="text-[#0F766E] dark:text-[#2DD4BF]">CS1 · NVC</span>
            </div>

            <div className="relative w-20 h-20 lg:w-36 lg:h-36 rounded border border-[#E4E0D8] bg-white p-2 shrink-0 flex items-center justify-center">
              <img
                src={qrCodeImageUrl}
                alt="Mã QR truy cập nhanh hệ sinh thái FORUS trên điện thoại"
                width={144}
                height={144}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#0F766E] dark:text-[#2DD4BF] lg:hidden">
                <QrCode className="w-4 h-4 shrink-0" />
                <span>FORUS MOBILE · CS1</span>
              </div>
              <p className="text-[16px] font-bold text-[#0F2228] dark:text-[#F1F5F9] leading-snug">
                Quét QR Trải Nghiệm
              </p>
              <p className="text-[14px] text-[#334E58] dark:text-[#CBD5E1]">
                Poster Đồ án 1 · Chạm phóng to
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* =================================================================
          SECTION 2: CÁC KHỐI DỊCH VỤ CỐT LÕI (BẤT ĐỐI XỨNG, KHÔNG LƯỚI ĐỒNG ĐỀU)
          Mỗi dịch vụ: Icon thật + Mô tả 1 dòng (>=16px) + Nút hành động rõ ràng
          ================================================================= */}
      <section
        ref={servicesSectionRef}
        id="services-hub"
        className="w-full min-h-[calc(100vh-5rem)] paper-grid border-b border-[#E4E0D8] dark:border-[#1E353F] py-16 sm:py-20 lg:py-24 flex items-center"
      >
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-12">
          {/* Section Header */}
          <div className="pl-4 margin-rule flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <RevealHeading text="Dịch vụ nhanh giữa các tiết học" />
              <p className="text-[16px] sm:text-[17px] text-[#334E58] dark:text-[#CBD5E1]">
                Mỗi dịch vụ được thiết kế để sinh viên thao tác xong trong 30 giây trên điện thoại và nhận ngay tại Sảnh Tòa I.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("gear")}
              className="min-h-[44px] self-start md:self-auto px-5 py-2.5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] text-[#0F2228] dark:text-[#F1F5F9] hover:border-[#0D9488] text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
            >
              <span>Xem toàn bộ ({products.length} học cụ)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* SERVICE BLOCK 01 (FULL-WIDTH ANCHOR): THUÊ & MUA THIẾT BỊ HỌC TẬP */}
          <div className="rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] p-6 sm:p-8 lg:p-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E4E0D8] dark:border-[#1E353F] pb-6">
              <div className="flex items-start gap-4">
                {/* Real SVG Icon: Scientific Calculator & Lab Gear */}
                <div className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] flex items-center justify-center shrink-0 text-[#0F2228] dark:text-[#F1F5F9]">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 stroke-current fill-none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M16 10h.01" />
                    <path d="M12 10h.01" />
                    <path d="M8 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M8 14h.01" />
                    <path d="M12 18h.01" />
                    <path d="M8 18h.01" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <span className="text-[14px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                    01 · Học cụ tuần thi · Cọc 0đ thẻ SV KHTN
                  </span>
                  <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                    Thuê &amp; Bán Thiết Bị Học Tập
                  </h3>
                  <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                    Thuê Casio 15.000đ/ngày, áo blouse 15.000đ/buổi, giáo trình và bộ cáp cứu hộ TechRescue 20.000đ/buổi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab("gear")}
                className="min-h-[44px] shrink-0 px-5 py-2.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <span>Mở quầy học cụ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Featured Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {featuredGearProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </div>

          {/* ASYMMETRIC ROW 2 (7 COLS / 5 COLS): IN ẤN LẤY LIỀN & SĂN ĐIỂM RÈN LUYỆN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Block 02 (7 cols): In Tài Liệu Lấy Liền */}
            <div className="lg:col-span-7 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] flex items-center justify-center shrink-0 text-[#0F2228] dark:text-[#F1F5F9]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current fill-none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                    02 · Xưởng in Sảnh Tòa I · Khổ A5 – A1
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                    In Tài Liệu Lấy Liền &amp; Poster Đồ Án
                  </h3>
                  <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                    Tải file PDF từ điện thoại, tự động tính số trang và nhận bản in đóng gáy hoặc ống poster A1 giữa ca học.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5]/60 dark:bg-[#0B1519]/40">
                <div className="flex items-center gap-3">
                  <img
                    src="./assets/art/slice-print.webp"
                    alt="Minh họa dịch vụ in ấn tài liệu và poster A1 tại Sảnh Tòa I"
                    loading="lazy"
                    width={64}
                    height={64}
                    className="w-14 h-14 rounded object-cover border border-[#E4E0D8] dark:border-[#1E353F] shrink-0"
                  />
                  <span className="text-[15px] font-semibold text-[#334E58] dark:text-[#CBD5E1]">
                    Từ 350đ/trang A4 · Có sẵn ống đựng Poster
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab("print")}
                  className="min-h-[44px] shrink-0 px-5 py-2.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Đặt in ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Block 03 (5 cols): Săn Điểm Rèn Luyện */}
            <div className="lg:col-span-5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] flex items-center justify-center shrink-0 text-[#0F2228] dark:text-[#F1F5F9]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current fill-none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="13" r="8" />
                      <path d="M12 9v4l2 2" />
                      <path d="M5 3 2 6" />
                      <path d="m22 6-3-3" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                    03 · Hoạt động &amp; Học bổng
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                    Săn Điểm Rèn Luyện HCMUS
                  </h3>
                  <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                    Theo dõi hạn đăng ký hội thảo, học bổng và hoạt động tình nguyện theo từng giây.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5]/60 dark:bg-[#0B1519]/40">
                <div className="flex items-center gap-3">
                  <img
                    src="./assets/art/slice-events.webp"
                    alt="Minh họa bảng đếm ngược sự kiện săn điểm rèn luyện"
                    loading="lazy"
                    width={64}
                    height={64}
                    className="w-14 h-14 rounded object-cover border border-[#E4E0D8] dark:border-[#1E353F] shrink-0"
                  />
                  <span className="text-[15px] font-semibold text-[#334E58] dark:text-[#CBD5E1]">
                    Đủ 5 mục điểm rèn luyện
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab("events")}
                  className="min-h-[44px] shrink-0 px-5 py-2.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Xem sự kiện</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ASYMMETRIC ROW 3 (5 COLS / 7 COLS): KẾT NỐI GIA SƯ & ĐẶC QUYỀN VIP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Block 04 (5 cols): Kết Nối Gia Sư */}
            <div className="lg:col-span-5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] flex items-center justify-center shrink-0 text-[#0F2228] dark:text-[#F1F5F9]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current fill-none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                    04 · Cộng đồng Học thuật
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                    Kết Nối Gia Sư Tự Nhiên
                  </h3>
                  <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                    Nhận lớp dạy kèm Toán, Lý, Hóa, Tin quanh Quận 5 và đăng hồ sơ gia sư sinh viên KHTN.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5]/60 dark:bg-[#0B1519]/40">
                <div className="flex items-center gap-3">
                  <img
                    src="./assets/art/slice-tutor.webp"
                    alt="Minh họa kết nối gia sư sinh viên Khoa học Tự nhiên"
                    loading="lazy"
                    width={64}
                    height={64}
                    className="w-14 h-14 rounded object-cover border border-[#E4E0D8] dark:border-[#1E353F] shrink-0"
                  />
                  <span className="text-[15px] font-semibold text-[#334E58] dark:text-[#CBD5E1]">
                    Lớp mới cập nhật mỗi tuần
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab("tutor")}
                  className="min-h-[44px] shrink-0 px-5 py-2.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Tìm lớp &amp; gia sư</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Block 05 (7 cols): Tích Điểm VIP & Trợ Lý AI */}
            <div className="lg:col-span-7 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] flex items-center justify-center shrink-0 text-[#0F2228] dark:text-[#F1F5F9]">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 stroke-current fill-none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                    05 · Tích điểm &amp; Đặc quyền Sinh viên
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                    Kho Điểm VIP, Đổi Voucher &amp; Trợ Lý Học Thuật
                  </h3>
                  <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                    Tích điểm sau mỗi đơn thuê đồ hoặc in ấn để đổi voucher giảm giá trực tiếp trong giỏ hàng và hỏi AI không giới hạn.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5]/60 dark:bg-[#0B1519]/40">
                <span className="text-[15px] font-semibold text-[#334E58] dark:text-[#CBD5E1]">
                  Đổi voucher giảm 10.000đ · Miễn phí giao Tòa B–F
                </span>

                <button
                  type="button"
                  onClick={() => onNavigateTab("vip")}
                  className="min-h-[44px] shrink-0 px-5 py-2.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white text-[16px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Khám phá VIP &amp; AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          SECTION 3: BA TÌNH HUỐNG THỰC TẾ GIỮA CA HỌC (FULL-VIEWPORT DIPTYCH)
          KEEP THE 3 SITUATION STAMPS HERE AS EXPLICITLY REQUESTED
          ================================================================= */}
      <section className="w-full min-h-[calc(100vh-5rem)] border-b border-[#E4E0D8] dark:border-[#1E353F] bg-[#F3EFEA] dark:bg-[#0E1A20] flex items-center py-16 lg:py-20">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16">
          <div className="rounded-md overflow-hidden border border-[#E4E0D8] dark:border-[#1E353F] grid grid-cols-1 lg:grid-cols-12 shadow-xs">
            {/* Left 7 Cols: Warm Paper White (Scenes 1 & 2) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#122128] paper-grid p-7 sm:p-12 lg:p-14 flex flex-col justify-between gap-12 relative">
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-0 bottom-0 left-7 lg:left-10 w-[3px] bg-[#0D9488]"
              />

              {/* Scene 01 */}
              <div className="sm:pl-6 max-w-xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 40 40"
                    className="w-10 h-10 stroke-[#0F2228] dark:stroke-[#F1F5F9] fill-none shrink-0"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="8" y="4" width="24" height="32" rx="2" />
                    <rect x="12" y="8" width="16" height="7" />
                    <line x1="15" y1="11.5" x2="25" y2="11.5" stroke="#0D9488" />
                    <circle cx="14" cy="21" r="1.3" fill="currentColor" />
                    <circle cx="20" cy="21" r="1.3" fill="currentColor" />
                    <circle cx="26" cy="21" r="1.3" fill="currentColor" />
                    <circle cx="14" cy="27" r="1.3" fill="currentColor" />
                    <circle cx="20" cy="27" r="1.3" fill="currentColor" />
                    <circle cx="26" cy="27" r="1.3" fill="currentColor" />
                  </svg>
                  <span className="stamp">Tình huống 01 · Ca thi sáng</span>
                </div>
                <h3 className="font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                  Mai thi, máy tính hết pin.
                </h3>
                <p className="text-[16px] sm:text-[17px] text-[#334E58] dark:text-[#CBD5E1]">
                  Đặt trước 30 giây, ghé Sảnh Tòa I nhận Casio fx-580VN X đã thay pin mới.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateTab("gear")}
                    className="min-h-[44px] px-4 py-2 rounded border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] text-[16px] font-bold text-[#0F2228] dark:text-[#F1F5F9] hover:border-[#0D9488] inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Thuê máy tính ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scene 02 */}
              <div className="sm:pl-6 lg:ml-16 max-w-xl space-y-3.5 border-t border-[#E4E0D8] dark:border-[#1E353F] pt-10">
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 40 40"
                    className="w-10 h-10 stroke-[#0F2228] dark:stroke-[#F1F5F9] fill-none shrink-0"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <ellipse cx="14" cy="12" rx="6" ry="3" />
                    <path d="M8 12V28C8 29.6 10.7 31 14 31C17.3 31 20 29.6 20 28V12" />
                    <path
                      d="M20 15H32V31H20"
                      stroke="#0D9488"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="stamp">Tình huống 02 · Bảo vệ đồ án</span>
                </div>
                <h3 className="font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                  Sáng nộp, poster A1 chưa in.
                </h3>
                <p className="text-[16px] sm:text-[17px] text-[#334E58] dark:text-[#CBD5E1]">
                  Tải file PDF từ điện thoại, nhận bản in kèm ống đựng tại Sảnh Tòa I.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateTab("print")}
                    className="min-h-[44px] px-4 py-2 rounded border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] text-[16px] font-bold text-[#0F2228] dark:text-[#F1F5F9] hover:border-[#0D9488] inline-flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Đặt in A5 – A1</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Deep Slate #0F2228 (Scene 03) */}
            <div className="lg:col-span-5 bg-[#0F2228] text-white p-7 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6 border-t lg:border-t-0 lg:border-l border-[#1E353F]">
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 40 40"
                  className="w-10 h-10 stroke-white fill-none shrink-0"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="20" cy="21" r="13" />
                  <polyline points="20,13 20,21 26,24" stroke="#2DD4BF" />
                  <line x1="16" y1="4" x2="24" y2="4" />
                </svg>
                <span className="inline-flex items-center px-3 py-1 rounded text-[14px] font-bold uppercase tracking-wider border border-[#2DD4BF] text-[#5EEAD4]">
                  Tình huống 03 · Điểm rèn luyện
                </span>
              </div>

              <h3 className="font-serif-display text-h1 font-bold text-white">
                Form đóng sau 2 giờ.
              </h3>

              <p className="text-[16px] sm:text-[17px] text-[#E2E8F0] max-w-md leading-relaxed">
                Theo dõi đồng hồ đếm ngược các buổi seminar, học bổng và hoạt động tình nguyện tại Cơ sở 1.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab("events")}
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-md bg-white text-[#0F2228] hover:bg-[#F1F5F9] px-6 py-3 text-[16px] font-bold transition cursor-pointer"
                >
                  <span>Xem lịch sự kiện</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          SECTION 4: TRỢ LÝ AI HỌC THUẬT & SƠ ĐỒ CƠ SỞ 1 (INTERACTIVE LIGHT MOMENT)
          Allows tapping sample prompts & buildings right on the Homepage
          ================================================================= */}
      <section className="w-full min-h-[calc(100vh-5rem)] dark blueprint-grid border-b border-[#1E353F] py-16 sm:py-20 lg:py-24 text-[#F1F5F9] flex items-center">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Right 4 Cols Caption & CTA (lg:order-2) */}
            <div className="lg:col-span-4 lg:order-2 space-y-5 pl-4 border-l-3 border-[#14B8A6]">
              <h2 className="font-serif-display text-h1 font-bold text-white">
                Hỏi AI giải Vi tích phân. Tìm phòng học từ B1 đến L11.
              </h2>

              <p className="text-[16px] text-[#E2E8F0] leading-relaxed">
                Bấm chọn thử một chủ đề bên trái để xem cách Trợ lý AI FORUS trình bày công thức Toán KaTeX, gỡ lỗi code C++ hoặc chỉ đường tới các tòa nhà tại 227 Nguyễn Văn Cừ.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab("vip")}
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-md border border-white/50 hover:border-white bg-white/10 hover:bg-white/20 px-6 py-3 text-[16px] font-bold text-white transition cursor-pointer"
                >
                  <span>Mở Trợ lý AI &amp; Sơ đồ đầy đủ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Left 8 Cols Interactive AI Prompt Switcher + Interactive Floor Plan (lg:order-1) */}
            <div className="lg:col-span-8 lg:order-1 space-y-6">
              {/* Interactive AI Prompt Switcher Card */}
              <div className="rounded-md border border-[#1E353F] bg-[#0B1519]/95 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E353F] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#CBD5E1]" />
                    <span className="text-[14px] font-bold uppercase tracking-wider text-white">
                      TRỢ LÝ AI HỌC THUẬT FORUS (CHỌN CÂU HỎI MẪU)
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#CBD5E1]">
                    {activeAiSample.badge}
                  </span>
                </div>

                {/* 3 Interactive Sample Buttons (min-h 44px) */}
                <div className="flex flex-wrap gap-2.5">
                  {AI_DEMO_SAMPLES.map((sample) => {
                    const isSelected = sample.id === selectedAiSampleId;
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          setSelectedAiSampleId(sample.id);
                          setSelectedBuildingCode(sample.highlightBuilding);
                        }}
                        className={`min-h-[44px] px-4 py-2 rounded-md text-[15px] font-bold transition cursor-pointer border ${
                          isSelected
                            ? "bg-white text-[#0F2228] border-white"
                            : "bg-[#122128] text-[#E2E8F0] border-[#1E353F] hover:border-white/60"
                        }`}
                      >
                        {sample.buttonLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Question & Live Rendered Answer */}
                <div className="space-y-3 pt-1">
                  <div className="rounded-md bg-[#122128] border border-[#1E353F] px-4 py-3 text-[16px] text-[#F1F5F9]">
                    <span className="font-bold text-white mr-2">SV hỏi:</span>
                    <FormattedAiMessage
                      text={activeAiSample.question}
                      isUser={false}
                    />
                  </div>

                  <div className="rounded-md bg-[#152831] border border-[#1E353F] p-4 text-[16px] text-white">
                    <FormattedAiMessage
                      text={activeAiSample.answer}
                      isUser={false}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive CS1 Floor Plan Preview */}
              <div className="rounded-md border border-[#1E353F] bg-[#122128]/95 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E353F] pb-3 text-[14px]">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#CBD5E1]" />
                    <span>SƠ ĐỒ CƠ SỞ 1 — 227 NGUYỄN VĂN CỪ (CHẠM TÒA NHÀ ĐỂ XEM)</span>
                  </span>
                  <span className="text-[#CBD5E1] font-bold">
                    ● Quầy FORUS: Sảnh Tòa I
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {CAMPUS_BUILDINGS.map((b) => {
                    const isSelected = b.code === selectedBuildingCode;
                    return (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => setSelectedBuildingCode(b.code)}
                        className={`min-h-[64px] p-3 rounded text-left border transition cursor-pointer ${
                          isSelected
                            ? "border-white bg-white/15 text-white"
                            : "border-[#1E353F] bg-[#0B1519]/80 text-[#E2E8F0] hover:border-white/50"
                        }`}
                      >
                        <p className="text-[15px] font-bold">{b.code}</p>
                        <p className="text-[13px] text-[#CBD5E1] truncate mt-0.5">
                          {b.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Building Detail Bar */}
                <div className="rounded bg-[#0B1519] border border-[#1E353F] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[15px]">
                  <div>
                    <span className="font-bold text-white mr-2">
                      {activeBuildingInfo.name}:
                    </span>
                    <span className="text-[#E2E8F0]">
                      {activeBuildingInfo.detail}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          SECTION 5: KẾT NỐI SINH VIÊN, SỔ TAY FAQ & TRẠM TRỰC SẢNH TÒA I
          Aligned left/right container, >=16px readable text & validated form
          ================================================================= */}
      <section
        ref={faqSectionRef}
        id="faq-notebook-section"
        className="w-full min-h-[calc(100vh-5rem)] py-16 sm:py-20 lg:py-24 flex items-center"
      >
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-16">
          {/* Centered Minimalist Closing with Paper Boat (hidden when logged in) */}
          {!isLoggedIn && (
            <div className="py-10 sm:py-14 px-6 text-center max-w-2xl mx-auto space-y-5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128]">
              <div className="flex justify-center">
                <PaperBoatAtomSvg className="w-24 h-20" />
              </div>

              <h2 className="font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                Đăng nhập, tích điểm VIP, đổi voucher.
              </h2>

              <p className="text-[16px] sm:text-[17px] text-[#334E58] dark:text-[#CBD5E1]">
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
                  className="min-h-[48px] rounded-md bg-[#0F2228] hover:bg-[#1E353F] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white px-7 py-3 text-[16px] font-bold transition cursor-pointer"
                >
                  Đăng nhập sinh viên
                </button>
              </div>

              <p className="text-[14px] font-medium text-[#334E58] dark:text-[#CBD5E1] pt-1">
                227 Nguyễn Văn Cừ, Quận 5 · Trường ĐH Khoa học Tự nhiên (ĐHQG-HCM)
              </p>
            </div>
          )}

          {/* Integrated FAQ & Contact Station */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left 7 Cols: Lab Notebook FAQ */}
            <div className="lg:col-span-7 space-y-6">
              <div className="pl-4 margin-rule flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                  Sổ tay giải đáp nhanh (FAQ)
                </h2>
                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "rental", label: "Thuê & In" },
                    { id: "ai-points", label: "VIP & AI" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFaqFilter(tab.id as typeof faqFilter)}
                      className={`min-h-[44px] px-3.5 py-2 rounded text-[15px] font-bold transition cursor-pointer ${
                        faqFilter === tab.id
                          ? "bg-[#0F2228] text-white dark:bg-[#F1F5F9] dark:text-[#0F2228]"
                          : "bg-white dark:bg-[#122128] text-[#334E58] dark:text-[#CBD5E1] border border-[#E4E0D8] dark:border-[#1E353F]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#E4E0D8] dark:divide-[#1E353F] border-y border-[#E4E0D8] dark:border-[#1E353F]">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqId((prev) =>
                            prev === faq.id ? "" : faq.id
                          )
                        }
                        className="w-full min-h-[48px] flex items-start justify-between gap-4 text-left cursor-pointer py-1"
                      >
                        <div className="space-y-1">
                          <span className="text-[13px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
                            {faq.categoryLabel}
                          </span>
                          <span className="block font-serif-display text-[18px] font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 shrink-0 mt-2 transition-transform duration-150 ${
                            isOpen ? "rotate-180 text-[#0F2228] dark:text-white" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="mt-2.5 text-[16px] text-[#334E58] dark:text-[#CBD5E1] leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Contact Station Sảnh Tòa I */}
            <div className="lg:col-span-5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] p-6 sm:p-8 space-y-5">
              <div className="pl-3 margin-rule space-y-1">
                <h3 className="font-serif-display text-h2 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                  Trạm trực Sảnh Tòa I — CS1
                </h3>
                <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                  Hỗ trợ giao nhận học cụ và bản in giữa các ca học.
                </p>
              </div>

              <div className="space-y-2.5 text-[16px] text-[#0F2228] dark:text-[#F1F5F9]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-5 w-5 shrink-0 text-[#0F2228] dark:text-[#CBD5E1] mt-0.5" />
                  <span>Sảnh Tòa I, 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="h-5 w-5 shrink-0 text-[#0F2228] dark:text-[#CBD5E1] mt-0.5" />
                  <span>06:45 – 20:30 (Thứ 2 – Thứ 7)</span>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} noValidate className="space-y-3.5 pt-1">
                <div>
                  <label htmlFor="contact-name" className="block text-[14px] font-bold mb-1 text-[#334E58] dark:text-[#CBD5E1]">
                    Họ tên &amp; MSSV
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A - 24120001"
                    className="w-full min-h-[44px] rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] px-3.5 py-2.5 text-[16px] focus:border-[#0F2228] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-[14px] font-bold mb-1 text-[#334E58] dark:text-[#CBD5E1]">
                    Email sinh viên
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="mssv@student.hcmus.edu.vn"
                    className="w-full min-h-[44px] rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] px-3.5 py-2.5 text-[16px] focus:border-[#0F2228] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[14px] font-bold mb-1 text-[#334E58] dark:text-[#CBD5E1]">
                    Nội dung cần hỗ trợ *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Nội dung cần hỗ trợ tại Cơ sở 1..."
                    className="w-full rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-[#FAF8F5] dark:bg-[#0B1519] px-3.5 py-2.5 text-[16px] focus:border-[#0F2228] focus:outline-none"
                  />
                </div>

                {contactError && (
                  <p className="text-[14px] font-bold text-red-600 dark:text-red-400">
                    {contactError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-md bg-[#0F2228] hover:bg-[#1E353F] dark:bg-[#F1F5F9] dark:text-[#0F2228] text-white px-5 py-3 text-[16px] font-bold transition cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Gửi tin nhắn tới Trạm FORUS</span>
                </button>

                {submitted && (
                  <p className="flex items-center gap-2 text-[15px] font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>Đã ghi nhận vào sổ trực Sảnh Tòa I!</span>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Enlarged QR Modal for Poster Presentation Scanning */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#09181D]/80 p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-md border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#122128] p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              aria-label="Đóng mã QR"
              className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-md border border-[#E4E0D8] dark:border-[#1E353F] text-[#0F2228] dark:text-[#F1F5F9] hover:border-[#0D9488] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[13px] font-bold uppercase tracking-wider text-[#334E58] dark:text-[#CBD5E1]">
              Trạm FORUS · 227 Nguyễn Văn Cừ
            </p>

            <h3 className="font-serif-display text-h1 font-bold text-[#0F2228] dark:text-[#F1F5F9]">
              Quét QR Trải Nghiệm Mobile
            </h3>

            <div className="mx-auto w-56 h-56 rounded-md border border-[#E4E0D8] bg-white p-3 flex items-center justify-center">
              <img
                src={qrCodeImageUrl}
                alt="Mã QR phóng to FORUS"
                width={220}
                height={220}
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
              Mở trực tiếp giao diện di động tại buổi chấm Poster Đồ án 1 (Khoa CNTT — ĐH KHTN).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
