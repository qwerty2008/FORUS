import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Bell,
  BellRing,
  CheckCircle2,
  Search,
  Sparkles,
  ExternalLink,
  Building2,
  Download,
  LayoutGrid,
  Table as TableIcon,
  Award,
  Mail,
  Smartphone,
  CalendarPlus,
  Send,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { StudentProfile } from "../types";
import {
  HCMUS_DOCUMENT_EVENTS,
  HCMUS_OFFICIAL_CHANNELS,
  HcmusDocumentEvent,
  HcmusEventCategory,
  HcmusRegistrationStatus,
} from "../data/hcmusEventsData";

interface EventsHubProps {
  student: StudentProfile;
  onToggleReminder: (eventId: string, eventTitle: string) => void;
  onSaveEventNote: (eventId: string, note: string) => void;
  onEarnPoints: (points: number, reason: string) => void;
  onShowToast: (msg: string) => void;
}

type ReminderLeadTime = "30m" | "2h" | "1d" | "deadline-6h";

const REMINDER_LEAD_OPTIONS: { id: ReminderLeadTime; label: string }[] = [
  { id: "30m", label: "Trước 30 phút diễn ra" },
  { id: "2h", label: "Trước 2 giờ diễn ra" },
  { id: "1d", label: "Trước 1 ngày (24h)" },
  { id: "deadline-6h", label: "Trước hạn đăng ký 6 giờ" },
];

function getCountdownParts(targetIso: string, nowMs: number) {
  const targetMs = new Date(targetIso).getTime();
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
    };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
  };
}

function getStatusBadgeStyle(statusType: HcmusRegistrationStatus) {
  switch (statusType) {
    case "urgent-today":
      return "bg-rose-500/15 text-rose-700 border-rose-500/35 dark:bg-rose-500/20 dark:text-rose-300";
    case "open":
      return "bg-emerald-500/15 text-emerald-800 border-emerald-500/35 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "upcoming":
      return "bg-sky-500/15 text-sky-800 border-sky-500/35 dark:bg-sky-500/20 dark:text-sky-300";
    case "ongoing":
      return "bg-amber-500/15 text-amber-800 border-amber-500/35 dark:bg-amber-500/20 dark:text-amber-300";
    case "closed":
      return "bg-slate-500/15 text-slate-600 border-slate-400/30 dark:bg-slate-700/60 dark:text-slate-300";
  }
}

export const EventsHub: React.FC<EventsHubProps> = ({
  student,
  onToggleReminder,
  onSaveEventNote,
  onEarnPoints,
  onShowToast,
}) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | HcmusEventCategory
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | HcmusRegistrationStatus
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(
    "hcmus-evt-04"
  );

  // Notification preferences state
  const [notifyChannels, setNotifyChannels] = useState<{
    email: boolean;
    webPush: boolean;
    calendar: boolean;
  }>(() => {
    const saved = localStorage.getItem("forus_notify_channels");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { email: true, webPush: true, calendar: false };
  });

  const [defaultLeadTime, setDefaultLeadTime] =
    useState<ReminderLeadTime>("2h");
  const [perEventLeadTime, setPerEventLeadTime] = useState<
    Record<string, ReminderLeadTime>
  >({
    "hcmus-evt-03": "30m",
    "hcmus-evt-04": "2h",
    "hcmus-evt-06": "1d",
  });
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    student.eventPersonalNotes || {}
  );

  // Tick every 1 second for real-time countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "forus_notify_channels",
      JSON.stringify(notifyChannels)
    );
  }, [notifyChannels]);

  // Sort events by upcoming targetTimestamp > nowMs to find the nearest event and next events in real time
  const upcomingChronologicalEvents = useMemo(() => {
    const future = HCMUS_DOCUMENT_EVENTS.filter(
      (evt) => new Date(evt.targetTimestamp).getTime() > nowMs
    ).sort(
      (a, b) =>
        new Date(a.targetTimestamp).getTime() -
        new Date(b.targetTimestamp).getTime()
    );
    return future.length > 0 ? future : HCMUS_DOCUMENT_EVENTS.slice(0, 6);
  }, [nowMs]);

  const nearestEvent =
    upcomingChronologicalEvents[0] || HCMUS_DOCUMENT_EVENTS[2];

  const activeHeroEvent = useMemo(() => {
    if (focusedEventId) {
      const found = HCMUS_DOCUMENT_EVENTS.find((e) => e.id === focusedEventId);
      if (found) return found;
    }
    return nearestEvent;
  }, [focusedEventId, nearestEvent]);

  const nextFollowingEvents = useMemo(() => {
    return upcomingChronologicalEvents
      .filter((e) => e.id !== nearestEvent.id)
      .slice(0, 4);
  }, [upcomingChronologicalEvents, nearestEvent]);

  const heroCountdown = getCountdownParts(activeHeroEvent.targetTimestamp, nowMs);

  const remindedEventsList = useMemo(() => {
    return HCMUS_DOCUMENT_EVENTS.filter((e) =>
      student.remindedEventIds.includes(e.id)
    );
  }, [student.remindedEventIds]);

  const filteredEvents = useMemo(() => {
    return HCMUS_DOCUMENT_EVENTS.filter((evt) => {
      const matchesCat =
        categoryFilter === "all" || evt.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || evt.statusType === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        evt.summary.toLowerCase().includes(q) ||
        evt.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [categoryFilter, statusFilter, searchQuery]);

  const handleToggleChannel = (key: keyof typeof notifyChannels) => {
    setNotifyChannels((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const activeNames: string[] = [];
      if (updated.email) activeNames.push(`Email SV (${student.email})`);
      if (updated.webPush) activeNames.push("Thông báo trình duyệt");
      if (updated.calendar) activeNames.push("Lịch cá nhân (.ics)");
      onShowToast(
        activeNames.length > 0
          ? `🔔 Kênh thông báo đang bật: ${activeNames.join(" · ")}`
          : "⚠️ Bạn đã tắt tất cả kênh thông báo nhắc sự kiện."
      );
      return updated;
    });
  };

  const handleToggleEventRemindWithLead = (evt: HcmusDocumentEvent) => {
    const alreadyReminded = student.remindedEventIds.includes(evt.id);
    if (!alreadyReminded && !perEventLeadTime[evt.id]) {
      setPerEventLeadTime((prev) => ({
        ...prev,
        [evt.id]: defaultLeadTime,
      }));
    }
    onToggleReminder(evt.id, evt.title);
  };

  const handleDownloadIcs = (evt: HcmusDocumentEvent) => {
    const startDate = new Date(evt.eventStartTimestamp);
    const endDate = evt.eventEndTimestamp
      ? new Date(evt.eventEndTimestamp)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FORUS HCMUS//Events Hub//VI",
      "BEGIN:VEVENT",
      `UID:${evt.id}@forus-hcmus.edu.vn`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:[HCMUS] ${evt.title}`,
      `LOCATION:${evt.location}`,
      `DESCRIPTION:${evt.summary} - Đơn vị tổ chức: ${evt.organizer}. Hạn đăng ký: ${evt.deadlineText}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT120M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Nhắc tham gia sự kiện HCMUS từ FORUS",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HCMUS-Event-${evt.stt}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`📅 Đã tải file lịch (.ics) cho sự kiện: ${evt.title}`);
  };

  const handleSendTestReminder = (evt: HcmusDocumentEvent) => {
    const leadLabel =
      REMINDER_LEAD_OPTIONS.find(
        (o) => o.id === (perEventLeadTime[evt.id] || defaultLeadTime)
      )?.label || "Trước 2 giờ";
    const channels: string[] = [];
    if (notifyChannels.email) channels.push(student.email);
    if (notifyChannels.webPush) channels.push("Web Push");
    if (notifyChannels.calendar) channels.push("Lịch cá nhân");

    onShowToast(
      `🔔 [Nhắc tham gia - ${leadLabel}] "${evt.title}" tại ${evt.location} (Đã gửi qua: ${
        channels.join(", ") || student.email
      })`
    );
  };

  const formattedNow = new Date(nowMs).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const formattedDateNow = new Date(nowMs).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const isHeroReminded = student.remindedEventIds.includes(activeHeroEvent.id);
  const activeHeroLead =
    perEventLeadTime[activeHeroEvent.id] || defaultLeadTime;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ================= 1. HERO COUNTDOWN TO NEAREST EVENT & REAL-TIME NEXT UP QUEUE ================= */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E5DEC9] bg-gradient-to-br from-[#F6F2E9] via-[#F1ECE1] to-[#EAE3D2] p-5 sm:p-7 lg:p-8 text-[#0B2545] shadow-sm dark:border-slate-700/80 dark:from-[#0F1B2E] dark:via-[#111F36] dark:to-[#0C1628] dark:text-white">
        {/* Ambient Background Layers (Harmonized with Light Warm Sand & Dark Navy) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.32] dark:opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(11, 37, 69, 0.14) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="animate-forus-float-slow absolute -top-24 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#D95326]/20 via-amber-300/15 to-transparent blur-3xl dark:from-[#D95326]/25 dark:via-amber-500/10" />
          <div className="animate-forus-float-reverse absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-400/20 via-emerald-400/15 to-transparent blur-3xl dark:from-sky-500/20 dark:via-emerald-400/15" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Real-Time Clock & Overview Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DED6C3] pb-4 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/15 border border-emerald-600/30 px-3.5 py-1 text-xs font-mono font-extrabold text-emerald-800 dark:bg-emerald-400/20 dark:border-emerald-400/40 dark:text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                LIVE · ĐỒNG HỒ SỰ KIỆN HCMUS (11/2026 – 01/2027)
              </span>
              <span className="text-xs text-[#4A5568] dark:text-sky-200/90 font-medium">
                {formattedDateNow} ·{" "}
                <strong className="font-mono font-extrabold text-[#D95326] dark:text-amber-300">
                  {formattedNow}
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-xl border border-[#E2DAC8] bg-white/80 px-3 py-1.5 font-mono font-bold text-[#0B2545] dark:border-slate-700 dark:bg-white/10 dark:text-slate-200">
                Tổng cộng:{" "}
                <strong className="text-[#D95326] dark:text-amber-300">
                  {HCMUS_DOCUMENT_EVENTS.length} sự kiện
                </strong>
              </span>
              <span className="rounded-xl bg-[#D95326] px-3 py-1.5 font-mono font-extrabold text-white flex items-center gap-1.5 shadow-2xs">
                <BellRing className="h-3.5 w-3.5" />
                Đang nhắc tham gia: {remindedEventsList.length}
              </span>
            </div>
          </div>

          {/* Main 12-Col Grid: Left (7 cols) Nearest Event Live Countdown | Right (5 cols) Next Events in Real Time */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* LEFT 7 COLS: PROMINENT COUNTDOWN TO NEAREST EVENT */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-[#E2DAC8] bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-xs space-y-5 dark:border-slate-700/80 dark:bg-slate-900/75">
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#D95326] px-3 py-1 font-mono text-xs font-extrabold uppercase tracking-wider text-white shadow-2xs">
                      <Clock className="h-3.5 w-3.5" />
                      {focusedEventId && focusedEventId !== nearestEvent.id
                        ? `Đang xem Sự kiện #${activeHeroEvent.stt}`
                        : "Sự kiện gần nhất tiếp theo"}
                    </span>
                    <span className="rounded-xl border border-[#E5DEC9] bg-[#F5F1E6] px-2.5 py-1 text-xs font-bold text-[#0B2545] dark:border-slate-700 dark:bg-white/15 dark:text-amber-300">
                      {activeHeroEvent.categoryLabel}
                    </span>
                    <span className="rounded-xl bg-emerald-600/12 border border-emerald-600/25 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-400/30 dark:text-emerald-200">
                      {activeHeroEvent.drlOrBenefitTag}
                    </span>
                  </div>

                  {focusedEventId && focusedEventId !== nearestEvent.id && (
                    <button
                      type="button"
                      onClick={() => setFocusedEventId(null)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#E2DAC8] bg-[#F5F1E6] hover:bg-[#EAE3D2] px-2.5 py-1 text-[11px] font-bold text-[#0B2545] transition cursor-pointer dark:border-slate-700 dark:bg-white/15 dark:hover:bg-white/25 dark:text-amber-200"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Về sự kiện gần nhất
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold leading-snug text-[#0B2545] dark:text-white">
                  {activeHeroEvent.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#4A5568] dark:text-sky-100/90 leading-relaxed">
                  {activeHeroEvent.summary}
                </p>

                {/* DIGITAL COUNTDOWN BLOCKS */}
                <div className="rounded-2xl border border-[#E5DEC9] bg-[#F6F2E8] p-4 sm:p-5 space-y-3 dark:border-slate-700 dark:bg-slate-950/55">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-extrabold uppercase tracking-wider text-[#D95326] dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Đếm ngược thời gian thực đến mốc sự kiện / hạn chót:
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#0B2545] dark:text-sky-200">
                      {activeHeroEvent.statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 text-center">
                    {[
                      {
                        value: String(heroCountdown.days).padStart(2, "0"),
                        label: "NGÀY",
                      },
                      {
                        value: String(heroCountdown.hours).padStart(2, "0"),
                        label: "GIỜ",
                      },
                      {
                        value: String(heroCountdown.minutes).padStart(2, "0"),
                        label: "PHÚT",
                      },
                      {
                        value: String(heroCountdown.seconds).padStart(2, "0"),
                        label: "GIÂY",
                        highlight: true,
                      },
                    ].map((unit, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-3 sm:p-4 flex flex-col items-center justify-center transition ${
                          unit.highlight
                            ? "border-[#D95326] bg-[#FFF3EC] text-[#D95326] shadow-2xs dark:bg-[#D95326]/25 dark:text-amber-300"
                            : "border-[#E2DAC8] bg-white text-[#0B2545] shadow-2xs dark:border-white/15 dark:bg-white/10 dark:text-white"
                        }`}
                      >
                        <span className="font-mono text-2xl sm:text-4xl lg:text-5xl font-extrabold tabular-nums tracking-tight">
                          {unit.value}
                        </span>
                        <span
                          className={`mt-1 font-mono text-[10px] sm:text-xs font-bold tracking-widest ${
                            unit.highlight
                              ? "text-[#D95326] dark:text-amber-200"
                              : "text-[#64748B] dark:text-sky-200/90"
                          }`}
                        >
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="flex items-start gap-2 bg-[#FAF8F5] rounded-xl p-2.5 border border-[#EAE5DC] dark:bg-white/5 dark:border-white/10">
                    <Building2 className="h-4 w-4 text-[#0B2545] dark:text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] dark:text-sky-300 block">
                        Đơn vị tổ chức
                      </span>
                      <strong className="font-bold text-[#0B2545] dark:text-white">
                        {activeHeroEvent.organizer}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-[#FAF8F5] rounded-xl p-2.5 border border-[#EAE5DC] dark:bg-white/5 dark:border-white/10">
                    <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] dark:text-sky-300 block">
                        Địa điểm tổ chức
                      </span>
                      <strong className="font-bold text-[#0B2545] dark:text-white">
                        {activeHeroEvent.location}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-[#FAF8F5] rounded-xl p-2.5 border border-[#EAE5DC] dark:bg-white/5 dark:border-white/10">
                    <Calendar className="h-4 w-4 text-[#D95326] dark:text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] dark:text-sky-300 block">
                        Thời gian diễn ra
                      </span>
                      <strong className="font-bold text-[#0B2545] dark:text-white">
                        {activeHeroEvent.eventTimeText}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-[#FAF8F5] rounded-xl p-2.5 border border-[#EAE5DC] dark:bg-white/5 dark:border-white/10">
                    <Clock className="h-4 w-4 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-[#64748B] dark:text-sky-300 block">
                        Hạn đăng ký / Nộp hồ sơ
                      </span>
                      <strong className="font-bold text-[#D95326] dark:text-amber-200">
                        {activeHeroEvent.deadlineText}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Action & Notification Selector Bar */}
              <div className="pt-3 border-t border-[#EAE5DC] dark:border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4A5568] dark:text-sky-200 whitespace-nowrap">
                    Nhắc trước:
                  </span>
                  <select
                    value={activeHeroLead}
                    onChange={(e) => {
                      const val = e.target.value as ReminderLeadTime;
                      setPerEventLeadTime((prev) => ({
                        ...prev,
                        [activeHeroEvent.id]: val,
                      }));
                      onShowToast(
                        `⏰ Đã đặt thời gian nhắc "${
                          REMINDER_LEAD_OPTIONS.find((o) => o.id === val)?.label
                        }" cho sự kiện #${activeHeroEvent.stt}`
                      );
                    }}
                    className="rounded-xl bg-[#F5F1E6] border border-[#DDD6C7] px-3 py-2 text-xs font-bold text-[#0B2545] focus:outline-none cursor-pointer dark:bg-slate-900/90 dark:border-white/20 dark:text-amber-300"
                  >
                    {REMINDER_LEAD_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(activeHeroEvent)}
                    className="px-3.5 py-2.5 rounded-xl border border-[#DDD6C7] bg-[#FAF8F5] hover:bg-[#EFECE4] text-[#0B2545] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer dark:border-white/15 dark:bg-white/15 dark:hover:bg-white/25 dark:text-white"
                  >
                    <CalendarPlus className="h-4 w-4 text-[#D95326] dark:text-amber-300" />
                    <span>Lưu Lịch (.ics)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleEventRemindWithLead(activeHeroEvent)
                    }
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                      isHeroReminded
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-slate-950"
                        : "bg-[#0B2545] hover:bg-[#163A66] text-white dark:bg-[#D95326] dark:hover:bg-[#C0441B]"
                    }`}
                  >
                    {isHeroReminded ? (
                      <>
                        <BellRing className="h-4 w-4" />
                        <span>Đã Bật Nhắc Tham Gia (✓)</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Bật Thông Báo Nhắc Tham Gia</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLS: REAL-TIME NEXT UPCOMING EVENTS QUEUE */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#E2DAC8] bg-[#FAF8F5]/95 backdrop-blur-md p-5 sm:p-6 space-y-4 shadow-xs dark:border-slate-700/80 dark:bg-slate-900/75">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#D95326] dark:text-amber-300" />
                      Các Sự Kiện Kế Tiếp Theo Thời Gian Thực
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-sky-200/80">
                      Bấm vào sự kiện bất kỳ để đưa lên đồng hồ đếm ngược chính
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {nextFollowingEvents.map((evt, index) => {
                    const cd = getCountdownParts(evt.targetTimestamp, nowMs);
                    const isReminded = student.remindedEventIds.includes(evt.id);
                    const isSelectedOnHero = activeHeroEvent.id === evt.id;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setFocusedEventId(evt.id)}
                        className={`group rounded-2xl border p-3.5 transition cursor-pointer ${
                          isSelectedOnHero
                            ? "border-[#D95326] bg-[#FFF6F0] shadow-xs dark:border-amber-400 dark:bg-white/15"
                            : "border-[#E6E0D5] bg-white hover:border-[#0B2545]/40 hover:bg-[#FFFDF9] dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="font-mono font-extrabold text-[#D95326] dark:text-amber-300">
                                Kế tiếp #{index + 2}
                              </span>
                              <span className="text-[#64748B]">·</span>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                                Còn {cd.days}d {String(cd.hours).padStart(2, "0")}h{" "}
                                {String(cd.minutes).padStart(2, "0")}m{" "}
                                {String(cd.seconds).padStart(2, "0")}s
                              </span>
                            </div>

                            <h4 className="mt-1 text-xs sm:text-sm font-extrabold text-[#0B2545] leading-snug line-clamp-2 group-hover:text-[#D95326] transition dark:text-white dark:group-hover:text-amber-200">
                              {evt.title}
                            </h4>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748B] dark:text-sky-200/90">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[#D95326] dark:text-amber-300 shrink-0" />
                                {evt.eventTimeText.split(" (")[0]}
                              </span>
                              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                                <MapPin className="h-3 w-3 text-emerald-700 dark:text-emerald-300 shrink-0" />
                                {evt.location.split(" (")[0]}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEventRemindWithLead(evt);
                            }}
                            title={
                              isReminded
                                ? "Đang bật nhắc tham gia"
                                : "Bật nhắc tham gia sự kiện này"
                            }
                            className={`shrink-0 rounded-xl px-2.5 py-2 text-[11px] font-extrabold inline-flex items-center gap-1 transition cursor-pointer ${
                              isReminded
                                ? "bg-emerald-600/15 text-emerald-800 border border-emerald-600/30 dark:bg-emerald-400 dark:text-slate-950"
                                : "bg-[#F3EFE6] hover:bg-[#D95326] text-[#0B2545] hover:text-white border border-[#E2DAC8] dark:bg-white/10 dark:text-white dark:border-white/15"
                            }`}
                          >
                            {isReminded ? (
                              <>
                                <BellRing className="h-3.5 w-3.5" />
                                <span>Đã nhắc</span>
                              </>
                            ) : (
                              <>
                                <Bell className="h-3.5 w-3.5" />
                                <span>Nhắc hẹn</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE5DC] dark:border-white/10 flex items-center justify-between text-xs text-[#64748B] dark:text-sky-200">
                <span>Tự động cập nhật mỗi giây theo lịch HCMUS</span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-300">
                  02/11/2026 → 05/01/2027
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. NOTIFICATION & REMINDER PREFERENCES CENTER ================= */}
      <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-5 sm:p-7 dark:border-slate-700/80 dark:bg-slate-800/90 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4 dark:border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-[#D95326]" />
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0B2545] dark:text-white">
                Cài Đặt Thông Báo &amp; Danh Sách Nhắc Tham Gia Sự Kiện ({remindedEventsList.length})
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300">
              Chọn phương thức nhận thông báo và thời điểm nhắc hẹn để không bỏ lỡ hạn nộp học bổng, seminar học thuật hoặc kỳ thi lập trình.
            </p>
          </div>

          {/* Channel Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleChannel("email")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                notifyChannels.email
                  ? "bg-[#0B2545] text-white border-[#0B2545] dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400"
                  : "bg-white text-[#5A6578] border-[#E5E0D5] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email SV ({student.studentId})</span>
              {notifyChannels.email && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleToggleChannel("webPush")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                notifyChannels.webPush
                  ? "bg-[#0B2545] text-white border-[#0B2545] dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400"
                  : "bg-white text-[#5A6578] border-[#E5E0D5] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Thông báo Trình duyệt</span>
              {notifyChannels.webPush && (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleToggleChannel("calendar")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                notifyChannels.calendar
                  ? "bg-[#0B2545] text-white border-[#0B2545] dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400"
                  : "bg-white text-[#5A6578] border-[#E5E0D5] dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
              }`}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Đồng bộ Google Calendar</span>
              {notifyChannels.calendar && (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Default Reminder Timing Selector Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#E6E0D5] dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-[#0B2545] dark:text-white">
              Thời điểm gửi thông báo mặc định:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {REMINDER_LEAD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setDefaultLeadTime(opt.id);
                    onShowToast(
                      `⏰ Đã chọn mức nhắc mặc định: ${opt.label}`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    defaultLeadTime === opt.id
                      ? "bg-[#D95326] text-white shadow-2xs"
                      : "bg-[#F3EFE6] text-[#4A5568] hover:text-[#0B2545] dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400">
            Nhận tại:{" "}
            <strong className="text-[#0B2545] dark:text-amber-300">
              {student.email}
            </strong>
          </span>
        </div>

        {/* Active Reminded Events List */}
        {remindedEventsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CFC8B8] bg-white/70 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-xs sm:text-sm font-bold text-[#4A5568] dark:text-slate-300">
              Bạn chưa chọn sự kiện nào trong danh sách nhắc tham gia. Hãy bấm nút{" "}
              <strong className="text-[#D95326]">&ldquo;Nhắc tham gia&rdquo;</strong> ở bất kỳ sự kiện nào bên dưới!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {remindedEventsList.map((evt) => {
              const cd = getCountdownParts(evt.targetTimestamp, nowMs);
              const chosenLead = perEventLeadTime[evt.id] || defaultLeadTime;
              return (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-[#E6E0D5] bg-white p-4 dark:border-slate-700 dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                        <BellRing className="h-3 w-3" />
                        Đang bật nhắc · STT #{evt.stt}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                        {cd.expired
                          ? "Đang diễn ra"
                          : `Còn ${cd.days}d ${cd.hours}h ${cd.minutes}m`}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white line-clamp-2">
                      {evt.title}
                    </h4>

                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {evt.eventTimeText} · {evt.location.split(" (")[0]}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EAE5DC] dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={chosenLead}
                        onChange={(e) =>
                          setPerEventLeadTime((prev) => ({
                            ...prev,
                            [evt.id]: e.target.value as ReminderLeadTime,
                          }))
                        }
                        className="flex-1 rounded-lg bg-[#F5F2EB] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-[#0B2545] dark:text-slate-200"
                      >
                        {REMINDER_LEAD_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleSendTestReminder(evt)}
                        title="Gửi thông báo nhắc thử ngay"
                        className="px-2.5 py-1.5 rounded-lg bg-[#0B2545] hover:bg-[#163A66] text-white text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer shrink-0"
                      >
                        <Send className="h-3 w-3 text-amber-300" />
                        <span>Nhắc thử</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleReminder(evt.id, evt.title)}
                        className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold transition cursor-pointer shrink-0"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 3. FULL DIRECTORY & FILTERABLE 20 HCMUS EVENTS (11/2026 - 01/2027) ================= */}
      <section className="space-y-5">
        {/* Filter & Search Bar */}
        <div className="space-y-4 border-b border-[#E5DEC9] pb-5 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] dark:text-white leading-tight">
                Tổng Hợp 20 Hoạt Động, Hội Nghị, Kỳ Thi &amp; Học Bổng HCMUS (02/11/2026 – 02/01/2027)
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#4A5568] dark:text-slate-300">
                Dữ liệu chính thức từ hệ thống truyền thông Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM, Phòng CTSV và các Khoa/Đoàn – Hội.
              </p>
            </div>

            {/* Search & View Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm seminar, ICPC, học bổng, FBB..."
                  className="w-full rounded-2xl border border-[#E5E0D5] bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="inline-flex rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Thẻ Chi Tiết</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span>Bảng Tổng Hợp (20 STT)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category & Registration Status Filter Pills */}
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800">
              {[
                {
                  id: "all",
                  label: `Tất cả (${HCMUS_DOCUMENT_EVENTS.length})`,
                },
                {
                  id: "seminar-conference",
                  label: `Hội nghị & Seminar (${
                    HCMUS_DOCUMENT_EVENTS.filter(
                      (e) => e.category === "seminar-conference"
                    ).length
                  })`,
                },
                {
                  id: "academic-contest",
                  label: `Kỳ thi Lập trình & Học thuật (${
                    HCMUS_DOCUMENT_EVENTS.filter(
                      (e) => e.category === "academic-contest"
                    ).length
                  })`,
                },
                {
                  id: "student-affairs-scholarship",
                  label: `Học bổng, Khám SK & CTSV (${
                    HCMUS_DOCUMENT_EVENTS.filter(
                      (e) => e.category === "student-affairs-scholarship"
                    ).length
                  })`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(tab.id as typeof categoryFilter)
                  }
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                    categoryFilter === tab.id
                      ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                      : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "Mọi trạng thái" },
                { id: "urgent-today", label: "Hạn cuối hôm nay" },
                { id: "open", label: "Đang mở đăng ký" },
                { id: "upcoming", label: "Sắp diễn ra" },
                { id: "ongoing", label: "Đang diễn ra" },
                { id: "closed", label: "Đã đóng form" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as typeof statusFilter)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950"
                      : "border border-[#E5E0D5] bg-white text-[#4A5568] hover:border-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: DETAILED CARDS GRID */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredEvents.map((evt) => {
              const cd = getCountdownParts(evt.targetTimestamp, nowMs);
              const isReminded = student.remindedEventIds.includes(evt.id);
              const isExpanded = expandedEventId === evt.id;
              const eventLead = perEventLeadTime[evt.id] || defaultLeadTime;

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 transition hover:border-[#C8C0B0] hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/95"
                >
                  <div className="space-y-3">
                    {/* Top Metadata & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0B2545] font-mono text-xs font-extrabold text-amber-300">
                          #{evt.stt}
                        </span>
                        <span className="text-xs font-bold text-[#0B2545] dark:text-sky-300">
                          {evt.categoryLabel}
                        </span>
                        <span className="text-xs text-[#64748B]">·</span>
                        <span className="font-mono text-xs font-bold text-[#D95326] dark:text-amber-400">
                          {evt.drlOrBenefitTag}
                        </span>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-0.5 text-[11px] font-extrabold ${getStatusBadgeStyle(
                          evt.statusType
                        )}`}
                      >
                        {evt.statusText}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => {
                        setFocusedEventId(evt.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      title="Bấm để ghim lên Đồng hồ đếm ngược chính"
                      className="text-base sm:text-lg font-extrabold text-[#0B2545] leading-snug hover:text-[#D95326] transition cursor-pointer dark:text-white"
                    >
                      {evt.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed dark:text-slate-300">
                      {evt.summary}
                    </p>

                    {/* Live Real-Time Countdown Strip inside Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#F3EFE6] px-3.5 py-2.5 text-xs dark:bg-slate-900">
                      <span className="font-bold text-[#0B2545] dark:text-slate-200 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#D95326]" />
                        Đếm ngược thời gian thực:
                      </span>
                      {cd.expired ? (
                        <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                          Đang diễn ra / Đã tới mốc thời gian
                        </span>
                      ) : (
                        <span className="font-mono font-extrabold text-[#D95326] dark:text-amber-300 tabular-nums">
                          Còn {cd.days} ngày :{" "}
                          {String(cd.hours).padStart(2, "0")} giờ :{" "}
                          {String(cd.minutes).padStart(2, "0")} phút :{" "}
                          {String(cd.seconds).padStart(2, "0")} giây
                        </span>
                      )}
                    </div>

                    {/* Key Details List */}
                    <div className="space-y-1.5 text-xs text-[#4A5568] dark:text-slate-300 pt-1">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-sky-400 mt-0.5" />
                        <span>
                          <strong className="text-[#0B2545] dark:text-white">
                            Đơn vị tổ chức:
                          </strong>{" "}
                          {evt.organizer}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#D95326] mt-0.5" />
                        <span>
                          <strong className="text-[#0B2545] dark:text-white">
                            Thời gian:
                          </strong>{" "}
                          {evt.eventTimeText}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span>
                          <strong className="text-[#0B2545] dark:text-white">
                            Địa điểm:
                          </strong>{" "}
                          {evt.location}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                        <span>
                          <strong className="text-[#0B2545] dark:text-white">
                            Hạn đăng ký / Nộp hồ sơ:
                          </strong>{" "}
                          {evt.deadlineText}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Full Details & Personal Note */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-4 text-xs dark:border-slate-700 dark:bg-slate-900/90">
                        <p className="font-extrabold text-[#0B2545] dark:text-amber-300">
                          Chi tiết nội dung từ thông báo của Trường / Khoa:
                        </p>
                        <ul className="space-y-1.5 text-[#334155] dark:text-slate-300">
                          {evt.details.map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="font-bold text-[#D95326]">•</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        {evt.contactOrLinkNote && (
                          <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-[#E5E0D5] dark:border-slate-700 font-semibold text-[#0B2545] dark:text-sky-200">
                            📌 Hướng dẫn / Liên hệ: {evt.contactOrLinkNote}
                          </div>
                        )}

                        {/* Personal Note Input */}
                        <div className="pt-2 border-t border-[#EAE5DC] dark:border-slate-700 space-y-1.5">
                          <label className="block font-bold text-[#0B2545] dark:text-white">
                            Ghi chú chuẩn bị cá nhân của bạn:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={noteDrafts[evt.id] || ""}
                              onChange={(e) =>
                                setNoteDrafts((prev) => ({
                                  ...prev,
                                  [evt.id]: e.target.value,
                                }))
                              }
                              placeholder="VD: Chuẩn bị CV, rủ nhóm bạn cùng đi, mang thẻ SV..."
                              className="flex-1 rounded-xl border border-[#DDD6C7] bg-white px-3 py-1.5 text-xs text-[#0B2545] dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onSaveEventNote(evt.id, noteDrafts[evt.id] || "")
                              }
                              className="rounded-xl bg-[#0B2545] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#163A66] cursor-pointer"
                            >
                              Lưu ghi chú
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Reminder Timing Picker & Action Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-[#EAE5DC] dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : evt.id)
                        }
                        className="rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] hover:bg-[#F3EFE6] px-3 py-2 text-xs font-bold text-[#0B2545] transition cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadIcs(evt)}
                        title="Tải lịch sự kiện (.ics)"
                        className="rounded-xl border border-[#E5E0D5] bg-white hover:bg-[#F3EFE6] p-2 text-[#0B2545] transition cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={eventLead}
                        onChange={(e) => {
                          const val = e.target.value as ReminderLeadTime;
                          setPerEventLeadTime((prev) => ({
                            ...prev,
                            [evt.id]: val,
                          }));
                          if (!isReminded) {
                            handleToggleEventRemindWithLead(evt);
                          } else {
                            onShowToast(
                              `⏰ Đã đổi lịch nhắc cho "${evt.title}"`
                            );
                          }
                        }}
                        className="rounded-xl border border-[#E5E0D5] bg-[#F5F2EB] px-2.5 py-2 text-[11px] font-bold text-[#0B2545] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                      >
                        {REMINDER_LEAD_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleToggleEventRemindWithLead(evt)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-extrabold inline-flex items-center gap-1.5 transition cursor-pointer ${
                          isReminded
                            ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300"
                            : "bg-[#D95326] hover:bg-[#C0441B] text-white shadow-2xs"
                        }`}
                      >
                        {isReminded ? (
                          <>
                            <BellRing className="h-3.5 w-3.5" />
                            <span>Đã bật nhắc (✓)</span>
                          </>
                        ) : (
                          <>
                            <Bell className="h-3.5 w-3.5" />
                            <span>Nhắc tham gia</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW MODE 2: SUMMARY TABLE MATCHING SECTION II OF THE DOCUMENT */
          <div className="overflow-x-auto rounded-3xl border border-[#E5DEC9] bg-white shadow-2xs dark:border-slate-700 dark:bg-slate-800/95">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5DEC9] bg-[#F3EFE6] text-[#0B2545] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                  <th className="p-3.5 font-extrabold">STT</th>
                  <th className="p-3.5 font-extrabold min-w-[240px]">
                    Tên hoạt động / Sự kiện
                  </th>
                  <th className="p-3.5 font-extrabold min-w-[150px]">
                    Đơn vị tổ chức
                  </th>
                  <th className="p-3.5 font-extrabold min-w-[160px]">
                    Thời gian diễn ra
                  </th>
                  <th className="p-3.5 font-extrabold min-w-[180px]">
                    Hạn đăng ký / Nộp hồ sơ
                  </th>
                  <th className="p-3.5 font-extrabold min-w-[140px]">
                    Trạng thái
                  </th>
                  <th className="p-3.5 font-extrabold text-right">
                    Nhắc tham gia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] dark:divide-slate-700/70">
                {filteredEvents.map((evt) => {
                  const isReminded = student.remindedEventIds.includes(evt.id);
                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-[#FAF8F5] dark:hover:bg-slate-800/60 transition"
                    >
                      <td className="p-3.5 font-mono font-extrabold text-[#D95326] dark:text-amber-400">
                        #{evt.stt}
                      </td>
                      <td className="p-3.5 font-bold text-[#0B2545] dark:text-white">
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedEventId(evt.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-left hover:text-[#D95326] transition cursor-pointer"
                        >
                          {evt.title}
                        </button>
                      </td>
                      <td className="p-3.5 text-[#4A5568] dark:text-slate-300">
                        {evt.organizer}
                      </td>
                      <td className="p-3.5 font-medium text-[#0B2545] dark:text-slate-200">
                        {evt.eventTimeText}
                      </td>
                      <td className="p-3.5 text-[#4A5568] dark:text-slate-300">
                        {evt.deadlineText}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeStyle(
                            evt.statusType
                          )}`}
                        >
                          {evt.statusText}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleEventRemindWithLead(evt)}
                          className={`rounded-xl px-3 py-1.5 text-[11px] font-extrabold inline-flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
                            isReminded
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-[#0B2545] text-white hover:bg-[#163A66] dark:bg-amber-400 dark:text-slate-950"
                          }`}
                        >
                          {isReminded ? "Đã nhắc (✓)" : "+ Nhắc hẹn"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================= 4. OFFICIAL HCMUS SOCIAL & PORTAL CHANNELS (SECTION I OF DOC) ================= */}
      <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-5 sm:p-7 dark:border-slate-700/80 dark:bg-slate-800/90 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-extrabold text-[#0B2545] dark:text-white">
            Hệ Thống Kênh Mạng Xã Hội &amp; Cổng Thông Tin Chính Thức của HCMUS
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300">
            Theo dõi cập nhật thời gian thực và dẫn nguồn trực tiếp về biểu mẫu đăng ký của từng đơn vị trực thuộc Trường:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {HCMUS_OFFICIAL_CHANNELS.map((ch) => (
            <a
              key={ch.id}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-[#E6E0D5] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#0B2545] hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#D95326] dark:text-amber-400 block">
                  {ch.platform}
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#0B2545] group-hover:text-[#D95326] transition dark:text-white">
                  {ch.name}
                </h4>
                <p className="font-mono text-[11px] font-semibold text-[#64748B] dark:text-sky-300">
                  {ch.handleOrSub}
                </p>
                <p className="text-[11px] text-[#4A5568] dark:text-slate-300 leading-relaxed pt-1">
                  {ch.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#EAE5DC] dark:border-slate-800 flex items-center justify-between text-[11px] font-extrabold text-[#0B2545] dark:text-amber-300">
                <span>Truy cập kênh</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EventsHub;
