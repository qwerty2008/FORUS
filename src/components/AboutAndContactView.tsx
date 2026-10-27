import React, { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  Sparkles,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BRAND_ASSETS } from "../data/forusData";

interface AboutAndContactViewProps {
  theme: "light" | "dark";
}

export const AboutAndContactView: React.FC<AboutAndContactViewProps> = ({
  theme,
}) => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://forus-hcmus.app";

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmitted(true);
    setContactMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Startup Story & Value Proposition */}
      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-5 sm:gap-8 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
            <span>Về Startup Sinh Viên FORUS · Đồ Án 1 (CSC00006)</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            FORUS — “Tiện ích trong tay, học hay mỗi ngày”
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-200 sm:text-sm">
            Xuất phát từ chính trải nghiệm thực tế của sinh viên{" "}
            <strong className="text-slate-900 dark:text-white">
              Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5)
            </strong>
            : những buổi sáng vội vã vào ca 1 chưa kịp ăn sáng, những giờ Giải tích & Đại số tuyến tính phải chép hàng chục trang công thức mỏi nhừ tay, hay những lần quên mang máy tính Casio, áo blouse trước giờ thi và thực hành.
          </p>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-200 sm:text-sm">
            <strong>FORUS</strong> ra đời như một trạm tiện ích "Tất cả trong một" ngay tại khuôn viên Cơ sở 1: cung cấp thiết bị ghi chép số giá sinh viên (Combo Bảng vẽ iPad Sinh Viên, Bàn phím MacroPad OneTap LaTeX, Flashcard chống nước), giao đồ ăn sáng và bản in A1–A5 tận cửa phòng học, kết nối gia sư uy tín và thưởng điểm mở khóa công cụ Săn Điểm Rèn Luyện + Trợ lý AI.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-700/60">
              <span className="font-mono text-lg font-extrabold text-sky-600 sm:text-xl dark:text-sky-400">
                15 phút
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-300">
                Giao tận phòng học Tòa I, B, C, E, F
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-700/60">
              <span className="font-mono text-lg font-extrabold text-emerald-600 sm:text-xl dark:text-emerald-400">
                35.000đ
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-300">
                Thuê trọn bộ Bảng vẽ + Găng tay / tuần
              </span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-700/60">
              <span className="font-mono text-lg font-extrabold text-slate-900 sm:text-xl dark:text-white">
                100 điểm
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-300">
                Mở khóa Săn ĐRL & Trợ lý AI 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Right Logo & Mobile QR Access Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center sm:p-6 dark:border-slate-700 dark:bg-slate-700/60 lg:col-span-5">
          <img
            src={
              theme === "dark" ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight
            }
            alt="FORUS Logo"
            referrerPolicy="no-referrer"
            className="h-20 w-auto object-contain sm:h-24"
          />

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            <img
              src={qrImageUrl}
              alt="Mã QR truy cập FORUS trên điện thoại"
              referrerPolicy="no-referrer"
              className="h-32 w-32 object-contain sm:h-36 sm:w-36"
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <QrCode className="h-4 w-4 text-sky-500" />
            <span>Quét Mã QR Trải Nghiệm Trên Điện Thoại</span>
          </div>
          <p className="mt-1 max-w-xs text-[11px] text-slate-500 dark:text-slate-300">
            Tối ưu hóa hiển thị di động cho khách tham quan quét mã tại buổi trình bày Poster Đồ án 1.
          </p>
        </div>
      </div>

      {/* Team Members & Contact Form */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
        {/* 5-Member Startup Team & AI Application */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-7">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              Đội Ngũ Sáng Lập Nhóm FORUS (5 Thành Viên — Khoa CNTT)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                role: "Nhóm trưởng · Full-Stack & Kiến trúc hệ thống",
                desc: "Thiết kế giao diện Sáng/Tối, luồng Giỏ hàng, tích điểm VIP và kết nối Gemini AI Chatbot.",
              },
              {
                role: "Phụ trách Sản phẩm Thiết bị & LaTeX",
                desc: "Nghiên cứu Combo iPad Sinh Viên, cấu hình MacroPad OneTap LaTeX và bộ Template Khoa CNTT.",
              },
              {
                role: "Phụ trách Vận hành In ấn A1-A5 & Ăn sáng CS1",
                desc: "Xây dựng bảng giá in tự động, quy trình giao đồ ăn tận phòng Tòa I, B, C, E, F.",
              },
              {
                role: "Phụ trách Cò Gia Sư & Săn Điểm Rèn Luyện",
                desc: "Tổng hợp thông tin sự kiện ĐRL Mục 1-2-3, thiết kế bộ lọc Gia sư Tự Nhiên.",
              },
              {
                role: "Phụ trách Thiết kế Nhận diện & Poster Khổ A1",
                desc: "Thiết kế bộ Logo FORUS, chụp/chỉnh sửa ảnh sản phẩm và dàn trang Poster A1 chuẩn hội nghị.",
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-700/60"
              >
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                  Thành viên 0{idx + 1}
                </span>
                <h4 className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">
                  {member.role}
                </h4>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs dark:border-slate-700 dark:bg-slate-700/50">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Mô hình kinh doanh & Ứng dụng AI minh bạch:</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-200">
              • <strong>Cách FORUS tạo doanh thu:</strong> Chênh lệch bán lẻ/cho thuê thiết bị học tập theo tuần, phí dịch vụ gói Setup LaTeX (29.000đ/lần), hoa hồng hợp tác in ấn & căn tin, và phí kết nối lớp gia sư minh bạch.
              <br />• <strong>Cách nhóm ứng dụng AI:</strong> Tích hợp trực tiếp mô hình ngôn ngữ lớn Gemini ở phía server làm Chatbot hỗ trợ học vụ cho sinh viên VIP, đồng thời sử dụng AI hỗ trợ kiểm tra lỗi code TypeScript và tối ưu hóa nội dung mô tả sản phẩm.
            </p>
          </div>
        </div>

        {/* Contact & Support Form */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
              Liên Hệ Trạm Tiện Ích FORUS — Cơ Sở 1
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Hỗ trợ giao nhận trực tiếp giữa các ca học tại khuôn viên Nguyễn Văn Cừ.
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-200">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                <span>
                  Trạm trực: Sảnh Tòa nhà I & Cổng 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-sky-500" />
                <span>
                  Giờ hoạt động: 06:45 – 20:30 (Thứ 2 đến Thứ 7 hàng tuần)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-sky-500" />
                <span className="font-mono">support.forus@student.hcmus.edu.vn</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-sky-500" />
                <span className="font-mono">Hotline/Zalo trực ca: 0909.227.001</span>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="mt-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Họ tên / MSSV của bạn
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="VD: Trần Minh Quân - 24120088"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Email sinh viên liên hệ
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="24120088@student.hcmus.edu.vn"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Nội dung góp ý hoặc yêu cầu hỗ trợ
                </label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Nhập câu hỏi, góp ý cho nhóm tại buổi trình bày Poster hoặc yêu cầu đặt thuê số lượng lớn..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white transition hover:bg-sky-500"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi Tin Nhắn Tới Nhóm FORUS</span>
              </button>
            </form>

            {submitted && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Cảm ơn bạn! Nhóm FORUS đã nhận được lời nhắn và sẽ phản hồi qua email sinh viên sớm nhất.
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              Dự án thực hiện cho học phần CSC00006 — Giới thiệu ngành Trí tuệ nhân tạo, Khoa CNTT, ĐH KHTN ĐHQG-HCM.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAndContactView;
