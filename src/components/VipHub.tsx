import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Bell,
  BellRing,
  Send,
  Bot,
  User,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Zap,
  Trash2,
  Gift,
  Users,
} from "lucide-react";
import { StudentProfile, TrainingPointEvent } from "../types";
import { VIP_TRAINING_POINT_EVENTS } from "../data/forusData";

interface VipHubProps {
  student: StudentProfile;
  onUnlockDemoVip: () => void;
  onRedeemPoints: (cost: number, title: string, voucherId: string) => boolean;
  redeemedVoucherIds: string[];
  onToggleReminder: (eventId: string, eventTitle: string) => void;
  onSaveEventNote: (eventId: string, note: string) => void;
  onNavigateToShop: () => void;
  initialSection?: "events" | "chatbot";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

const formatCountdown = (targetIso: string, nowMs: number) => {
  const diff = new Date(targetIso).getTime() - nowMs;
  if (diff <= 0) {
    return { expired: true, label: "00g : 00p : 00s", urgent: false };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    expired: false,
    label: `${pad(hours)}g : ${pad(minutes)}p : ${pad(seconds)}s`,
    urgent: hours < 6,
  };
};

export const VipHub: React.FC<VipHubProps> = ({
  student,
  onUnlockDemoVip,
  onRedeemPoints,
  redeemedVoucherIds,
  onToggleReminder,
  onSaveEventNote,
  onNavigateToShop,
  initialSection = "chatbot",
}) => {
  const isVipUnlocked = student.points >= 100;
  const membershipTierLabel =
    student.points >= 100
      ? "Hạng VIP FORUS (Đã mở khóa)"
      : student.points >= 50
      ? "Hạng Bạc FORUS"
      : "Hạng Tiêu Chuẩn";
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [activeVipSection, setActiveVipSection] = useState<"events" | "chatbot">(
    initialSection
  );
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([
    "drl-01",
  ]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [labGroupCode, setLabGroupCode] = useState("LAB-TOA-F-09");
  const [isGroupOrderActive, setIsGroupOrderActive] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ai",
      role: "model",
      text: `Chào ${
        student.fullName || "bạn sinh viên KHTN"
      }! Mình là Trợ lý AI FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ).\n\nMình có thể giúp bạn:\n• Tạo nhanh khung code LaTeX (ma trận, tích phân, quy nạp, báo cáo Khoa CNTT)\n• Giải thích định lý Vi tích phân, Đại số tuyến tính, Toán rời rạc, C++/Python\n• Tư vấn chọn sự kiện Điểm Rèn Luyện hoặc thiết bị học tập phù hợp.`,
      timestamp: "Vừa xong",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveVipSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop =
        chatScrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isSending]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegisterEvent = (ev: TrainingPointEvent) => {
    if (registeredEventIds.includes(ev.id)) return;
    setRegisteredEventIds((prev) => [...prev, ev.id]);
    if (!student.remindedEventIds.includes(ev.id)) {
      onToggleReminder(ev.id, ev.title);
    }
    showToast(
      `Đã đăng ký tham gia "${ev.title}" (+${ev.drlPoints} ĐRL) và tự động bật đồng hồ nhắc hẹn trước 30 phút!`
    );
  };

  const handleSendChat = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? chatInput).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentHistory = [...chatMessages];
    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: currentHistory.map((m) => ({ role: m.role, text: m.text })),
          studentInfo: {
            fullName: student.fullName,
            studentId: student.studentId,
            email: student.email,
            points: student.points,
          },
        }),
      });

      const data = await response.json();
      const replyContent =
        response.ok && data.reply
          ? data.reply
          : data.error ||
            "Hiện tại hệ thống đang bận, bạn vui lòng thử lại sau giây lát nhé.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: replyContent,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: "Không thể kết nối đến máy chủ AI lúc này. Bạn vui lòng kiểm tra lại kết nối và thử lại nhé!",
          timestamp: "Vừa xong",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetChat = () => {
    setChatMessages([
      {
        id: "welcome-ai-reset",
        role: "model",
        text: `Đã làm mới cuộc trò chuyện! Bạn muốn mình hỗ trợ giải bài tập, viết công thức LaTeX hay tra cứu lịch sự kiện Điểm Rèn Luyện tại ĐH KHTN?`,
        timestamp: "Vừa xong",
      },
    ]);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Warm Sand Banner + Policy Table (Matches Reference Web) */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-7">
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
              ĐẶC QUYỀN SINH VIÊN VIP · TÍCH ĐIỂM FORUS POINT TẠI 227 NGUYỄN VĂN CỪ
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-4xl dark:text-white leading-[1.15]">
              Trợ Lý AI Học Tập, Săn Điểm Rèn Luyện &amp; Đổi Điểm Voucher
            </h2>
            <p className="text-sm leading-relaxed text-[#4A5568] sm:text-base dark:text-slate-300">
              Sử dụng trực tiếp{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Trợ lý AI FORUS
              </strong>{" "}
              để giải bài tập đại cương &amp; viết code LaTeX, theo dõi đồng hồ đếm ngược các sự kiện{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Điểm Rèn Luyện (ĐRL)
              </strong>{" "}
              và dùng điểm tích lũy để đổi Voucher giảm giá ăn sáng hoặc bật chế độ{" "}
              <strong className="font-bold text-[#D95326] dark:text-amber-400">
                Gom Đơn Nhóm Phòng Lab (x2 Điểm + Freeship)
              </strong>
              .
            </p>
          </div>

          {/* Right White Status & Policy Card */}
          <div className="rounded-2xl border border-[#E6E0D5] bg-white p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#64748B] dark:text-slate-400">
                HẠNG THÀNH VIÊN: {membershipTierLabel}
              </p>
              <span className="font-mono text-sm font-extrabold text-[#D95326] dark:text-amber-400">
                {student.points} / 100 điểm VIP
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#EFECE6] dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#0B2545] dark:bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(100, student.points)}%` }}
              />
            </div>

            <div className="mt-3.5 divide-y divide-[#EAE5DC] text-xs dark:divide-slate-800">
              <div className="flex items-center justify-between py-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Khi mua hàng (Ăn sáng / In ấn / Thuê đồ):
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Cộng +5 đến +10 điểm VIP
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Khi đổi điểm lấy Voucher ưu đãi:
                </span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  Trừ trực tiếp điểm VIP
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Trạng thái VIP 100 điểm:
                </span>
                {isVipUnlocked ? (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Đã mở khóa 100%
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onUnlockDemoVip}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#D95326] px-2.5 py-1 font-mono text-[11px] font-bold text-white hover:bg-[#C0441B] transition cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    Kích hoạt nhanh 100đ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Redemption & Group Lab Order Box (Matches Screenshot 3) */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-7 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Left 7 Cols: 3 Voucher Cards */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900 lg:col-span-7">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-3 py-1 font-mono text-xs font-bold text-white">
                  <Gift className="h-3.5 w-3.5 text-amber-300" />
                  Đổi Điểm VIP FORUS ({student.points} điểm khả dụng)
                </span>
                <button
                  type="button"
                  onClick={onNavigateToShop}
                  className="text-xs font-bold text-[#D95326] hover:underline cursor-pointer"
                >
                  Mua hàng tích thêm điểm VIP →
                </button>
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                Khi <strong className="text-[#0B2545] dark:text-white">mua hàng</strong> tại FORUS, bạn được cộng điểm VIP trực tiếp vào hạng thành viên. Khi <strong className="text-[#D95326] dark:text-amber-400">đổi điểm</strong> lấy các gói ưu đãi bên dưới, hệ thống sẽ trừ số điểm VIP tương ứng:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                {[
                  {
                    id: "hv-50",
                    cost: 50,
                    req: "Cần 50 điểm VIP · Trị giá 10.000đ",
                    title: "Voucher Giảm 10.000đ Đơn Ăn Sáng Express",
                    desc: "Áp dụng cho mọi món bánh mì, xôi lá chuối, cà phê muối giao tại Tòa I, F, B, C.",
                    btnLabel: "Đổi 50 điểm ngay (-50đ VIP)",
                  },
                  {
                    id: "hv-60",
                    cost: 60,
                    req: "Cần 60 điểm VIP · Trị giá 15.000đ",
                    title: "Voucher Giảm 15.000đ Thuê Thiết Bị & In Ấn",
                    desc: "Dùng khi thuê Combo iPad Sinh Viên, Casio fx-580VN X hoặc in Poster khổ A1.",
                    btnLabel: "Đổi 60 điểm ngay (-60đ VIP)",
                  },
                  {
                    id: "hv-100",
                    cost: 100,
                    req: "Cần 100 điểm VIP · Giảm 15% tổng đơn",
                    title: "Đặc Quyền Giảm 15% Toàn Bộ Giỏ Hàng Tuần Này",
                    desc: "Ưu đãi cao nhất dành cho thành viên tích điểm năng nổ tại Cơ sở 1 (227 NVC).",
                    btnLabel: "Đổi 100 điểm ngay (-100đ VIP)",
                  },
                ].map((v) => {
                  const isRedeemed = redeemedVoucherIds.includes(v.id);
                  const canAfford = student.points >= v.cost;
                  return (
                    <div
                      key={v.id}
                      className="flex flex-col justify-between rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-4 dark:border-slate-700 dark:bg-slate-800/80"
                    >
                      <div>
                        <span className="block font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                          {v.req}
                        </span>
                        <h4 className="mt-1.5 text-sm font-extrabold text-[#0B2545] leading-snug dark:text-white">
                          {v.title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                          {v.desc}
                        </p>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        {isRedeemed && (
                          <span className="block text-center font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ Đã đổi ưu đãi này
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const ok = onRedeemPoints(v.cost, v.title, v.id);
                            if (ok) {
                              showToast(
                                `Đã trừ ${v.cost} điểm VIP để đổi "${v.title}"!`
                              );
                            } else {
                              showToast(
                                `Bạn đang có ${student.points} điểm VIP, cần đủ ${v.cost} điểm để đổi ưu đãi này.`
                              );
                            }
                          }}
                          className={`w-full rounded-xl py-2.5 px-2 text-xs font-extrabold transition cursor-pointer ${
                            isRedeemed
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : canAfford
                              ? "bg-[#0B2545] hover:bg-[#163A66] text-white dark:bg-amber-400 dark:text-slate-950"
                              : "bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {isRedeemed
                            ? `Đổi thêm lần nữa (-${v.cost}đ VIP)`
                            : canAfford
                            ? v.btnLabel
                            : `Thiếu ${v.cost - student.points} điểm VIP`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Gom Đơn Nhóm Phòng Lab (Matches Screenshot 3 Right Box) */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D95326]" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white">
                  Gom Đơn Nhóm Phòng Lab &amp; Đồ Án
                </h3>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                Đang học nhóm tại phòng thực hành hoặc{" "}
                <strong className="text-[#0B2545] dark:text-white">
                  Thư viện Cơ sở 1
                </strong>
                ? Bật chế độ Gom Đơn Nhóm để được{" "}
                <strong className="text-[#0B2545] dark:text-white">
                  miễn phí giao nội khu 100%
                </strong>{" "}
                và{" "}
                <strong className="text-[#0B2545] dark:text-white">
                  nhân đôi (x2) số điểm tích lũy
                </strong>{" "}
                cho toàn bộ đơn hàng!
              </p>

              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F5F2EB] p-4 dark:border-slate-700 dark:bg-slate-800">
                <label className="block text-xs font-bold text-[#0B2545] dark:text-white mb-2">
                  Mã phòng học / Nhóm đồ án của bạn:
                </label>
                <input
                  type="text"
                  value={labGroupCode}
                  onChange={(e) => setLabGroupCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-[#DDD6C7] bg-white px-3.5 py-2.5 font-mono text-xs sm:text-sm font-bold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-[#64748B] dark:text-slate-300">
                  Khi bật gom đơn, đơn hàng của bạn sẽ gắn nhãn nhóm{" "}
                  <strong className="font-mono text-[#0B2545] dark:text-amber-300">
                    {labGroupCode || "LAB-TOA-F-09"}
                  </strong>{" "}
                  để shipper FORUS giao cùng lúc.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsGroupOrderActive((prev) => !prev);
                showToast(
                  !isGroupOrderActive
                    ? `Đã bật chế độ Gom Đơn Nhóm (${labGroupCode}) — Nhân đôi điểm & Freeship nội khu CS1!`
                    : "Đã tắt chế độ Gom Đơn Nhóm."
                );
              }}
              className={`mt-4 w-full rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white transition cursor-pointer shadow-xs ${
                isGroupOrderActive
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-[#D95326] hover:bg-[#C0441B]"
              }`}
            >
              {isGroupOrderActive
                ? `Đang Bật Gom Đơn Nhóm ${labGroupCode} (x2 Điểm + Freeship ✓)`
                : "Bật Chế Độ Gom Đơn Nhóm Phòng Lab (x2 Điểm + Freeship)"}
            </button>
          </div>
        </div>
      </div>

      {/* Section Switcher: Chatbot vs DRL Events */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-4 dark:border-slate-700/80 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveVipSection("chatbot")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
              activeVipSection === "chatbot"
                ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
            }`}
          >
            <Bot className="h-4 w-4 text-[#D95326]" />
            <span>Trợ Lý AI FORUS (Gemini)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveVipSection("events")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
              activeVipSection === "events"
                ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
            }`}
          >
            <CalendarCheck className="h-4 w-4 text-[#D95326]" />
            <span>Săn Điểm Rèn Luyện ({VIP_TRAINING_POINT_EVENTS.length})</span>
          </button>
        </div>

        <span className="font-mono text-xs text-[#64748B] dark:text-slate-300">
          Hỗ trợ trực tuyến 24/7 cho sinh viên Cơ sở 1 ·{" "}
          <strong className="text-[#D95326] dark:text-amber-400">
            Miễn phí trải nghiệm
          </strong>
        </span>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION 1: TRAINING POINT EVENTS */}
      {activeVipSection === "events" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {VIP_TRAINING_POINT_EVENTS.map((ev) => {
              const regCountdown = formatCountdown(
                ev.registrationDeadlineIso,
                nowMs
              );
              const endCountdown = formatCountdown(ev.eventEndIso, nowMs);
              const isReminded = student.remindedEventIds.includes(ev.id);
              const isRegistered = registeredEventIds.includes(ev.id);
              const personalNote = student.eventPersonalNotes[ev.id] || "";
              const slotsRemaining = ev.maxSlots - ev.registeredCount;

              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-6 transition hover:border-[#C8C0B0] dark:border-slate-700/80 dark:bg-slate-800/90"
                >
                  <div>
                    {/* Clean Metadata Line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#0B2545] dark:text-amber-300">
                        {ev.category}
                      </span>
                      <span className="font-mono font-extrabold text-[#D95326] dark:text-amber-400">
                        +{ev.drlPoints} Điểm Rèn Luyện
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-extrabold text-[#0B2545] dark:text-white leading-snug">
                      {ev.title}
                    </h3>

                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-300">
                      Đơn vị tổ chức:{" "}
                      <strong className="text-[#0B2545] dark:text-slate-100">
                        {ev.organizer}
                      </strong>{" "}
                      · Địa điểm: {ev.location}
                    </p>

                    {/* Dual Live Countdown Clocks */}
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EFE6] p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4A5568] dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-[#D95326]" />
                          <span>Đếm ngược đóng đăng ký:</span>
                        </div>
                        <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#0B2545] dark:text-white">
                          {regCountdown.label}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4A5568] dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-[#0B2545] dark:text-sky-400" />
                          <span>Đếm ngược kết thúc sự kiện:</span>
                        </div>
                        <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-[#0B2545] dark:text-white">
                          {endCountdown.label}
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="mt-4 space-y-2 rounded-2xl bg-[#F3EFE6] p-4 text-xs dark:bg-slate-900">
                      <div className="flex items-center justify-between font-extrabold text-[#0B2545] dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 shrink-0 text-[#D95326]" />
                          <span>Lưu ý bắt buộc để được công nhận ĐRL:</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#D95326] dark:text-amber-400 tabular-nums">
                          Còn {slotsRemaining}/{ev.maxSlots} chỗ
                        </span>
                      </div>
                      <p className="text-[#4A5568] dark:text-slate-200">
                        {ev.registrationRequirements}
                      </p>
                      <ul className="space-y-1 text-[#4A5568] dark:text-slate-300">
                        {ev.importantNotes.map((note, idx) => (
                          <li key={idx}>• {note}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Personal Note Box */}
                    <div className="mt-3">
                      {editingNoteId === ev.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Nhập ghi chú cá nhân (VD: Rủ bạn Khôi đi cùng lúc 7h45)..."
                            className="flex-1 rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3 py-1.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onSaveEventNote(ev.id, noteDraft);
                              setEditingNoteId(null);
                              showToast("Đã lưu ghi chú lưu ý cho sự kiện!");
                            }}
                            className="rounded-xl bg-[#0B2545] px-3 py-1.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-300">
                          <span className="truncate">
                            {personalNote
                              ? `Ghi chú của bạn: "${personalNote}"`
                              : "Chưa có ghi chú cá nhân cho sự kiện này."}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(ev.id);
                              setNoteDraft(personalNote);
                            }}
                            className="ml-2 flex items-center gap-1 font-bold text-[#D95326] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                            <span>
                              {personalNote ? "Sửa lưu ý" : "Thêm lưu ý"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#EAE5DC] pt-4 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleReminder(ev.id, ev.title);
                        showToast(
                          isReminded
                            ? `Đã tắt nhắc hẹn sự kiện "${ev.title}".`
                            : `Đã bật thông báo nhắc tham gia "${ev.title}" trước 30 phút!`
                        );
                      }}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                        isReminded
                          ? "border-[#D95326]/40 bg-[#FFF5F0] text-[#D95326] dark:bg-amber-500/15 dark:text-amber-300"
                          : "border-[#E5E0D5] bg-white text-[#0B2545] hover:bg-[#F5F2EB] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <BellRing className="h-4 w-4 text-[#D95326]" />
                          <span>Đã Bật Nhắc Hẹn (Trước 30p)</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" />
                          <span>Nhắc Tôi Tham Gia</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRegisterEvent(ev)}
                      disabled={isRegistered}
                      className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition whitespace-nowrap shrink-0 cursor-pointer ${
                        isRegistered
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-[#D95326] text-white hover:bg-[#C0441B]"
                      }`}
                    >
                      {isRegistered
                        ? "Đã Đăng Ký Tham Gia (✓)"
                        : "Đăng Ký Giữ Chỗ Ngay"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SECTION 2: VIP AI CHATBOT INTERFACE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-6 dark:border-slate-700/80 dark:bg-slate-800/95 lg:col-span-4 shadow-2xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B2545] text-white shadow-xs">
                    <Bot className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B2545] dark:text-white">
                      Trợ Lý AI FORUS (Gemini)
                    </h3>
                    <p className="text-xs text-[#D95326] dark:text-amber-400 font-bold">
                      Học vụ · Công thức LaTeX · Tiện ích CS1
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Làm mới đoạn chat"
                  className="p-2 rounded-xl border border-[#E5E0D5] dark:border-slate-700 text-[#64748B] hover:text-[#D95326] dark:text-slate-300 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#4A5568] dark:text-slate-300 leading-relaxed">
                Chọn nhanh một câu hỏi mẫu dưới đây hoặc nhập bất kỳ bài toán, yêu cầu LaTeX hay thắc mắc học vụ nào tại ĐH KHTN:
              </p>

              <div className="space-y-2">
                {[
                  "Viết giúp mình khung code LaTeX cho ma trận 3x3 và tích phân xác định",
                  "Giải thích ngắn gọn phương pháp chứng minh quy nạp toán học và ví dụ",
                  "Gợi ý giúp mình cách chọn giữa thuê Combo iPad Sinh Viên và mua MacroPad LaTeX",
                  "Làm sao để đạt tối đa Điểm Rèn Luyện Mục 1 và Mục 3 tại ĐH KHTN?",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(sample)}
                    disabled={isSending}
                    className="w-full rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-3.5 text-left text-xs font-semibold text-[#0B2545] transition hover:border-[#0B2545] hover:bg-[#F3EFE6] dark:border-slate-700 dark:bg-slate-700/70 dark:text-slate-200 cursor-pointer"
                  >
                    “{sample}”
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#F3EFE6] dark:bg-slate-900 p-3.5 text-[11px] text-[#0B2545] dark:text-slate-200 font-medium">
              💡 Hỗ trợ hội thoại nhiều lượt (Multi-turn Gemini Chat) — AI ghi nhớ mạch câu hỏi trước đó của bạn.
            </div>
          </div>

          {/* Chat Conversation Window */}
          <div className="flex h-[520px] sm:h-[560px] flex-col rounded-3xl border border-[#E6E0D5] bg-white dark:border-slate-700/80 dark:bg-slate-800/95 lg:col-span-8 shadow-2xs overflow-hidden">
            <div
              ref={chatScrollContainerRef}
              className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F5]/60 dark:bg-slate-900/40"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "model" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white shadow-xs">
                      <Bot className="h-4 w-4 text-amber-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#0B2545] text-white shadow-xs"
                        : "border border-[#E6E0D5] bg-white text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <span
                      className={`mt-1.5 block text-[10px] ${
                        msg.role === "user"
                          ? "text-slate-300"
                          : "text-[#64748B] dark:text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#D95326] text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#D95326] dark:text-amber-300">
                  <Bot className="h-4 w-4 animate-bounce" />
                  <span>Trợ lý AI FORUS đang soạn câu trả lời...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2 border-t border-[#E6E0D5] bg-[#F3EFE6]/70 dark:bg-slate-900/50 p-3 sm:p-4 dark:border-slate-700"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về công thức LaTeX, bài tập Giải tích, C++ hoặc dịch vụ FORUS..."
                className="flex-1 rounded-2xl border border-[#DDD6C7] bg-white px-4 py-2.5 text-xs sm:text-sm text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="flex items-center gap-1.5 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white transition disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <Send className="h-4 w-4" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipHub;
