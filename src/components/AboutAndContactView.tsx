import React, { useState } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Send,
  ShieldCheck,
} from "lucide-react";

interface AboutAndContactViewProps {
  theme: "light" | "dark";
  defaultName?: string;
  defaultEmail?: string;
}

export const AboutAndContactView: React.FC<AboutAndContactViewProps> = ({
  defaultName = "",
  defaultEmail = "",
}) => {
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

  return (
    <div className="rounded-3xl border border-[#E6E0D5] bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-800 space-y-3.5">
      <div>
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
