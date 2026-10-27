import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  Sparkles,
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
} from "lucide-react";
import { StudentProfile, TrainingPointEvent } from "../types";
import { VIP_TRAINING_POINT_EVENTS } from "../data/forusData";

interface VipHubProps {
  student: StudentProfile;
  onUnlockDemoVip: () => void;
  onToggleReminder: (eventId: string, eventTitle: string) => void;
  onSaveEventNote: (eventId: string, note: string) => void;
  onNavigateToShop: () => void;
}

interface ChatMessage {
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
  onToggleReminder,
  onSaveEventNote,
  onNavigateToShop,
}) => {
  const isVipUnlocked = student.points >= 100;
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [activeVipSection, setActiveVipSection] = useState<"events" | "chatbot">(
    "events"
  );
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([
    "drl-01",
  ]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ai",
      role: "model",
      text: `Chào ${
        student.fullName || "bạn sinh viên KHTN"
      }! Mình là Trợ lý AI FORUS dành riêng cho Thành viên VIP tại Cơ sở 1 (227 Nguyễn Văn Cừ).\n\nMình có thể giúp bạn:\n• Tạo nhanh khung code LaTeX (ma trận, tích phân, quy nạp, báo cáo Khoa CNTT)\n• Giải thích định lý Vi tích phân, Đại số tuyến tính, Toán rời rạc, C++/Python\n• Tư vấn chọn sự kiện Điểm Rèn Luyện hoặc thiết bị học tập phù hợp.`,
      timestamp: "Vừa xong",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
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
          text: "Không thể kết nối tới máy chủ AI lúc này. Vui lòng kiểm tra kết nối mạng.",
          timestamp: "Bây giờ",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Locked View when points < 100
  if (!isVipUnlocked) {
    const missingPoints = Math.max(0, 100 - student.points);
    const progressPercent = Math.min(100, Math.round((student.points / 100) * 100));

    return (
      <div className="mx-auto max-w-4xl space-y-6 py-2 sm:py-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <Lock className="h-4 w-4 shrink-0" />
                <span>Đặc Quyền Thành Viên VIP FORUS · Yêu Cầu Đạt 100 Điểm</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Mở Khóa Trạm Săn Điểm Rèn Luyện & Trợ Lý AI Sinh Viên
              </h2>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                Khi sử dụng các dịch vụ tiện ích trên FORUS (mua/thuê thiết bị học tập, đặt đồ ăn sáng giao tận phòng, gửi in tài liệu A1–A5, kết nối gia sư), mỗi lần bạn sẽ tích lũy từ{" "}
                <strong className="text-slate-900 dark:text-white">5–10 điểm</strong>. Đạt đủ{" "}
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                  100 điểm
                </strong>{" "}
                sẽ mở khóa vĩnh viễn 2 đặc quyền VIP dưới đây.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-700/60 lg:w-64">
              <span className="text-xs text-slate-500 dark:text-slate-300">
                Điểm tích lũy hiện tại của bạn
              </span>
              <div className="mt-1 font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                {student.points}{" "}
                <span className="text-base font-normal text-slate-400">/ 100</span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                Còn thiếu{" "}
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {missingPoints} điểm
                </span>{" "}
                để lên VIP
              </p>
            </div>
          </div>

          {/* Preview of the 2 VIP features */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-700/50">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                  1. Tổng Hợp Sự Kiện Cộng Điểm Rèn Luyện (CS1)
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  • Đồng hồ đếm ngược thời gian thực đến lúc sự kiện{" "}
                  <strong>hết hạn đăng ký</strong> và <strong>kết thúc</strong>.
                </li>
                <li>
                  • Bật chuông thông báo nhắc tham gia trước giờ G để không bị trừ điểm vắng mặt.
                </li>
                <li>
                  • Tổng hợp đầy đủ lưu ý trang phục, điểm danh QR và số điểm cộng từng mục (Mục 1, 2, 3).
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-700/50">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                  2. Chatbot AI Hỗ Trợ Sinh Viên Tự Nhiên 24/7
                </h3>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  • Sinh nhanh đoạn lệnh LaTeX (tích phân, ma trận, quy nạp) để dán thẳng vào Overleaf.
                </li>
                <li>
                  • Giải đáp công thức Giải tích, Đại số tuyến tính, Toán rời rạc, debug code C++/Python.
                </li>
                <li>
                  • Tư vấn lộ trình học tập và tra cứu phòng học tại Cơ sở 1 Nguyễn Văn Cừ.
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-slate-200 pt-6 sm:mt-8 sm:flex-row sm:items-center dark:border-slate-700">
            <button
              type="button"
              onClick={onNavigateToShop}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              Sử Dụng Dịch Vụ Để Tích Điểm (+5 đến +10 điểm/lần)
            </button>

            <button
              type="button"
              onClick={onUnlockDemoVip}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
            >
              <Zap className="h-4 w-4 shrink-0" />
              <span>Kích Hoạt Nhanh VIP 100 Điểm (Chế Độ Thử / Chấm Poster)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Unlocked VIP Header & Sub-navigation */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700/80 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Thành Viên VIP Đã Mở Khóa ({student.points} điểm) · Đặc Quyền Sinh Viên ĐH KHTN CS1
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Trung Tâm Săn Điểm Rèn Luyện & Trợ Lý AI FORUS
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
            Theo dõi thời gian thực các sự kiện cộng ĐRL trước khi đóng form và trò chuyện trực tiếp với AI học vụ.
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveVipSection("events")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              activeVipSection === "events"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <CalendarCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Săn Điểm Rèn Luyện (Đếm Ngược)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVipSection("chatbot")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
              activeVipSection === "chatbot"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Chatbot AI Hỗ Trợ Sinh Viên</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeVipSection === "events" ? (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 dark:border-slate-700/80 dark:bg-slate-800/90">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-300">
                Sự kiện ĐRL đang mở đăng ký tại CS1
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {VIP_TRAINING_POINT_EVENTS.length} sự kiện
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-300">
                Tổng điểm rèn luyện tối đa có thể săn
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
                +28 điểm ĐRL
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-300">
                Sự kiện bạn đang bật chuông nhắc hẹn
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-sky-600 sm:text-2xl dark:text-sky-400">
                {student.remindedEventIds.length} lịch nhắc
              </p>
            </div>
          </div>

          {/* Event Cards with Dual Live Countdowns */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {VIP_TRAINING_POINT_EVENTS.map((ev) => {
              const regCountdown = formatCountdown(
                ev.registrationDeadline,
                nowMs
              );
              const endCountdown = formatCountdown(ev.eventEndTime, nowMs);
              const isReminded = student.remindedEventIds.includes(ev.id);
              const isRegistered = registeredEventIds.includes(ev.id);
              const personalNote = student.eventPersonalNotes[ev.id] || "";
              const slotsRemaining = Math.max(0, ev.maxSlots - ev.registeredCount);

              return (
                <div
                  key={ev.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/90"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-300">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {ev.drlSection}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ev.category}</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +{ev.drlPoints} ĐRL
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                      {ev.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                      Đơn vị tổ chức: {ev.organizer} · Địa điểm: {ev.location}
                    </p>

                    {/* Dual Live Countdown Timers: Registration Deadline & Event End */}
                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-700/60 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Đếm ngược hết hạn đăng ký:</span>
                        </div>
                        <div
                          className={`mt-1 font-mono text-base font-bold tabular-nums ${
                            regCountdown.urgent
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {regCountdown.label}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-sky-500" />
                          <span>Đếm ngược kết thúc sự kiện:</span>
                        </div>
                        <div className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
                          {endCountdown.label}
                        </div>
                      </div>
                    </div>

                    {/* Important Notes & Requirements */}
                    <div className="mt-4 space-y-2 rounded-xl bg-amber-500/10 p-3.5 text-xs dark:bg-amber-500/15">
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                          <span>Lưu ý bắt buộc để được công nhận ĐRL:</span>
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-300">
                          Còn {slotsRemaining}/{ev.maxSlots} chỗ
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-200">
                        {ev.registrationRequirements}
                      </p>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
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
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onSaveEventNote(ev.id, noteDraft);
                              setEditingNoteId(null);
                              showToast("Đã lưu ghi chú lưu ý cho sự kiện!");
                            }}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0"
                          >
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
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
                            className="ml-2 flex items-center gap-1 font-medium text-sky-600 hover:underline dark:text-sky-400 whitespace-nowrap shrink-0"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                            <span>{personalNote ? "Sửa lưu ý" : "Thêm lưu ý"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Toggle Reminder & Register */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-700">
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
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                        isReminded
                          ? "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <BellRing className="h-4 w-4 text-amber-500" />
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
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                        isRegistered
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-sky-600 text-white hover:bg-sky-500"
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
        /* VIP AI Chatbot Interface */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Trợ Lý AI FORUS (Gemini)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Chuyên gia Học vụ, LaTeX & Tiện ích CS1
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs text-slate-700 transition hover:border-sky-500 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:border-sky-400"
                  >
                    “{sample}”
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-100 p-3 text-[11px] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              Trợ lý AI được mở khóa miễn phí cho thành viên VIP FORUS ($\ge 100$ điểm).
            </div>
          </div>

          {/* Chat Conversation Window */}
          <div className="flex h-[500px] sm:h-[540px] flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-800/90 lg:col-span-8">
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "model" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-700/80 dark:text-slate-100"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <span
                      className={`mt-1.5 block text-[10px] ${
                        msg.role === "user"
                          ? "text-sky-100"
                          : "text-slate-400 dark:text-slate-300"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white dark:bg-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <Bot className="h-4 w-4 animate-bounce text-sky-500" />
                  <span>Trợ lý AI FORUS đang soạn câu trả lời...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2 border-t border-slate-200 p-3 sm:p-4 dark:border-slate-700"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Hỏi về công thức LaTeX, bài tập Giải tích, C++ hoặc dịch vụ FORUS..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
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
