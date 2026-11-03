import React, { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface AboutAndContactViewProps {
  theme: "light" | "dark";
  defaultName?: string;
  defaultEmail?: string;
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
    id: "faq-rental-procedure",
    category: "rental",
    categoryLabel: "Thủ tục thuê thiết bị",
    question:
      "Thủ tục thuê thiết bị học cụ (TechRescue, Casio, Bảng vẽ, Áo Blouse) tại CS1 cần giấy tờ hay đặt cọc gì không?",
    answer:
      "Sinh viên đã đăng nhập bằng email trường (@student.hcmus.edu.vn / @fit.hcmus.edu.vn) KHÔNG cần thế chấp CCCD hay đặt cọc tiền mặt. Bạn chỉ cần chọn gói 'Thuê ngắn hạn' trên web, xuất trình Mã QR Sinh viên FORUS tại Trạm Sảnh Tòa I hoặc chọn giao tận phòng học (Tòa I, B, C, E, F) trước giờ thi/thuyết trình 10–15 phút.",
  },
  {
    id: "faq-rental-return",
    category: "rental",
    categoryLabel: "Nhận & Hoàn trả học cụ",
    question:
      "Khi thuê ngắn hạn theo buổi thuyết trình, theo ngày hoặc theo tuần thì trả thiết bị ở đâu và nếu trễ hạn thì sao?",
    answer:
      "Sau khi kết thúc ca thi, buổi thực hành Lab hoặc buổi thuyết trình đồ án, bạn hoàn trả thiết bị trực tiếp tại Trạm FORUS Sảnh Tòa I (hoặc hẹn runner thu nhận tại sảnh giảng đường). Bạn có thể gia hạn trực tuyến thêm ngày/tuần bất kỳ lúc nào trước khi hết hạn mà không mất phí phạt.",
  },
  {
    id: "faq-condition-tiers",
    category: "rental",
    categoryLabel: "Phân loại 80% · 90% · 100%",
    question:
      "Sự khác biệt giữa các mức tình trạng Thuê ngắn hạn, Độ mới 80%, Độ mới 90% và Mới hẳn 100% là gì?",
    answer:
      "• Thuê ngắn hạn: Thiết bị/sách độ mới ~90% đã kiểm định kỹ (thay pin mới cho Casio, giặt ủi khử khuẩn cho áo Blouse, kiểm tra đủ cổng HDMI/USB-C cho bộ TechRescue).\n• Độ mới 80%: Sản phẩm qua sử dụng tiết kiệm chi phí nhất, hoạt động hoàn hảo 100%.\n• Độ mới 90%: Máy lướt/sách bọc plastic đẹp như mới, bảo hành 6–12 tháng.\n• Mới 100%: Nguyên hộp Fullbox chính hãng hoặc sách mới nguyên bản NXB.",
  },
  {
    id: "faq-ai-limits",
    category: "ai-points",
    categoryLabel: "Giới hạn Trợ lý AI",
    question:
      "Quy định giới hạn lượt hỏi Trợ lý AI FORUS như thế nào và làm sao để mở khóa hỏi đáp không giới hạn (∞)?",
    answer:
      "• Hạng Tiêu Chuẩn / Hạng Bạc (< 100 điểm): Mỗi tài khoản sinh viên được miễn phí 5 câu hỏi đầu tiên với Trợ lý AI Học Tập (giải toán Vi tích phân, Đại số, C++/Python, tạo mẫu LaTeX).\n• Hạng Đặc Quyền VIP (≥ 100 điểm): Mở khóa hỏi đáp Trợ lý AI không giới hạn (∞) 24/7 suốt học kỳ.",
  },
  {
    id: "faq-earn-redeem-points",
    category: "ai-points",
    categoryLabel: "Tích điểm & Đổi Voucher",
    question:
      "Làm thế nào để tích đủ 100 điểm mở khóa AI và khi đổi Voucher thì điểm thay đổi ra sao?",
    answer:
      "Mỗi đơn thuê/mua học cụ, đặt in tài liệu A1–A5 hoặc kết nối gia sư sẽ cộng trực tiếp từ +5 đến +10 điểm vào tài khoản. Khi bạn dùng điểm để đổi lấy Voucher giảm giá (50đ giảm 10k, 60đ giảm 15k, 100đ giảm 15% tổng đơn), hệ thống sẽ trừ số điểm tương ứng. Bạn cũng có thể bấm nút 'Kích hoạt nhanh 100đ' trong mục Tính năng để trải nghiệm ngay quyền lợi AI không giới hạn.",
  },
];

export const AboutAndContactView: React.FC<AboutAndContactViewProps> = ({
  defaultName = "",
  defaultEmail = "",
}) => {
  const [contactName, setContactName] = useState(defaultName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string>(FORUS_FAQ_ITEMS[0].id);
  const [faqFilter, setFaqFilter] = useState<"all" | "rental" | "ai-points">(
    "all"
  );

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

  return (
    <div className="rounded-3xl border border-[#E6E0D5] bg-white p-4 sm:p-6 shadow-2xs dark:border-slate-700 dark:bg-slate-800 space-y-5">
      {/* 1. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0B2545] text-amber-300 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                Câu Hỏi Thường Gặp (Frequently Asked Questions)
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-300">
                Quy trình thuê thiết bị học cụ &amp; định mức sử dụng Trợ lý AI FORUS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:inline-flex items-center gap-1 rounded-xl bg-[#F2EFE9] p-1 dark:bg-slate-900">
            {[
              { id: "all", label: "Tất cả (5)" },
              { id: "rental", label: "Thuê học cụ" },
              { id: "ai-points", label: "Giới hạn AI" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFaqFilter(tab.id as typeof faqFilter)}
                className={`rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold transition cursor-pointer text-center ${
                  faqFilter === tab.id
                    ? "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950"
                    : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition ${
                  isOpen
                    ? "border-[#0B2545]/30 bg-[#FAF8F5] dark:border-amber-400/40 dark:bg-slate-900/90"
                    : "border-[#EAE5DC] bg-white hover:border-[#DCD5C7] dark:border-slate-700 dark:bg-slate-800/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaqId((prev) => (prev === faq.id ? "" : faq.id))
                  }
                  className="w-full flex items-start justify-between gap-3 p-3 sm:p-3.5 text-left cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-mono text-[10px] font-bold text-[#D95326] dark:text-amber-400">
                      {faq.categoryLabel}
                    </span>
                    <span className="block text-xs font-extrabold text-[#0B2545] dark:text-white leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[#64748B] dark:text-slate-400 mt-1 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#D95326] dark:text-amber-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-0.5 border-t border-[#EAE5DC]/70 dark:border-slate-800">
                    <p className="text-[11px] sm:text-xs text-[#4A5568] dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CONTACT STATION FORUS — CS1 */}
      <div className="border-t border-[#EAE5DC] pt-4 dark:border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
            Liên Hệ Trạm Tiện Ích FORUS — Cơ Sở 1
          </h3>
          <span className="font-mono text-[10px] font-bold text-[#D95326] dark:text-amber-300">
            227 NVC
          </span>
        </div>
        <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-300">
          Hỗ trợ giao nhận trực tiếp giữa các ca học tại khuôn viên 227 Nguyễn Văn Cừ.
        </p>

        <div className="mt-3 space-y-2 text-xs text-[#4A5568] dark:text-slate-200">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D95326] mt-0.5" />
            <span>
              Trạm trực: Sảnh Tòa nhà I &amp; Cổng 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-sky-400" />
            <span>
              Giờ hoạt động: 06:45 – 20:30 (Thứ 2 đến Thứ 7 hàng tuần)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#D95326]" />
            <span className="font-mono text-[11px]">
              support.forus@student.hcmus.edu.vn
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-sky-400" />
            <span className="font-mono text-[11px]">
              Hotline/Zalo trực ca: 0909.227.001
            </span>
          </div>
        </div>

        <form onSubmit={handleContactSubmit} className="mt-4 space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold text-[#334155] dark:text-slate-200">
              Họ tên / MSSV của bạn
            </label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="VD: Trần Minh Quân - 24120088"
              className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#334155] dark:text-slate-200">
              Email sinh viên liên hệ
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="24120088@student.hcmus.edu.vn"
              className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2 font-mono text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#334155] dark:text-slate-200">
              Nội dung góp ý hoặc yêu cầu hỗ trợ
            </label>
            <textarea
              rows={3}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Nhập câu hỏi, góp ý hoặc yêu cầu đặt thuê thiết bị..."
              className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-2 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D95326] hover:bg-[#C0441B] py-2.5 text-xs font-extrabold text-white transition cursor-pointer shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Gửi Tin Nhắn Tới Nhóm FORUS</span>
          </button>
        </form>

        {submitted && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-emerald-500/15 p-2.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Đã nhận lời nhắn! Nhóm FORUS sẽ phản hồi qua email sinh viên sớm nhất.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-[#EAE5DC] pt-2.5 text-[10px] text-[#64748B] dark:border-slate-700 dark:text-slate-300">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span>
          Học phần CSC00006 — Giới thiệu ngành Trí tuệ nhân tạo, Khoa CNTT, ĐH KHTN ĐHQG-HCM.
        </span>
      </div>
    </div>
  );
};

export default AboutAndContactView;
