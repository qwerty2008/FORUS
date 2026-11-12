import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Bell,
  BellRing,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import {
  HCMUS_DOCUMENT_EVENTS,
  HcmusDocumentEvent,
  HcmusEventCategory,
} from "../data/hcmusEventsData";
import { StudentProfile } from "../types";

interface EventsHubProps {
  student: StudentProfile;
  onToggleReminder: (eventId: string, eventTitle: string) => void;
  onSaveEventNote: (eventId: string, note: string) => void;
  onEarnPoints?: (points: number, reason: string) => void;
  onShowToast?: (msg: string) => void;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(
  targetIso: string,
  nowMs: number
): TimeRemaining {
  const targetMs = new Date(targetIso).getTime();
  const diff = targetMs - nowMs;

  if (diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

export const EventsHub: React.FC<EventsHubProps> = ({
  student,
  onToggleReminder,
  onSaveEventNote,
}) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | HcmusEventCategory | "reminded"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    student.eventPersonalNotes || {}
  );
  const [savedToastId, setSavedToastId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const upcomingSortedEvents = useMemo(() => {
    return [...HCMUS_DOCUMENT_EVENTS]
      .filter((ev) => {
        const rem = calculateTimeRemaining(ev.targetTimestamp, nowMs);
        return !rem.isExpired && ev.statusType !== "closed";
      })
      .sort(
        (a, b) =>
          new Date(a.targetTimestamp).getTime() -
          new Date(b.targetTimestamp).getTime()
      );
  }, [nowMs]);

  const nearestEvent: HcmusDocumentEvent =
    upcomingSortedEvents[0] || HCMUS_DOCUMENT_EVENTS[0];
  const nearestCountdown = calculateTimeRemaining(
    nearestEvent.targetTimestamp,
    nowMs
  );

  const filteredEvents = useMemo(() => {
    return HCMUS_DOCUMENT_EVENTS.filter((ev) => {
      const matchCat =
        selectedCategory === "all"
          ? true
          : selectedCategory === "reminded"
          ? student.remindedEventIds.includes(ev.id)
          : ev.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q);
      return matchCat && matchSearch;
    }).sort((a, b) => {
      const remA = calculateTimeRemaining(a.targetTimestamp, nowMs);
      const remB = calculateTimeRemaining(b.targetTimestamp, nowMs);
      const closedA = a.statusType === "closed" || remA.isExpired;
      const closedB = b.statusType === "closed" || remB.isExpired;
      if (closedA !== closedB) return closedA ? 1 : -1;
      return (
        new Date(a.targetTimestamp).getTime() -
        new Date(b.targetTimestamp).getTime()
      );
    });
  }, [selectedCategory, searchQuery, student.remindedEventIds, nowMs]);

  const handleSaveNote = (eventId: string) => {
    onSaveEventNote(eventId, noteDrafts[eventId] || "");
    setSavedToastId(eventId);
    setTimeout(() => setSavedToastId(null), 2000);
  };

  const handleDownloadIcs = (ev: HcmusDocumentEvent) => {
    const startDate = new Date(ev.targetTimestamp);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FORUS HCMUS//Event Reminder//VI",
      "BEGIN:VEVENT",
      `UID:${ev.id}@forus.hcmus.edu.vn`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:[FORUS - HCMUS] ${ev.title}`,
      `LOCATION:${ev.location}`,
      `DESCRIPTION:${ev.summary} | Quyền lợi: ${ev.drlOrBenefitTag}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FORUS-${ev.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* =================================================================
          1. COMPACT FEATURED EVENT COUNTDOWN BANNER (BALANCED RATIO)
          ================================================================= */}
      <section className="dark blueprint-grid rounded-[4px] text-[#F8FAFC] p-5 sm:p-6 lg:px-8 lg:py-6 border border-[#233044]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5 pl-4 margin-rule">
            <div className="flex flex-wrap items-center gap-2">
              <span className="stamp border-[#D95326] text-[#F8FAFC]">
                Hạn đăng ký gần nhất
              </span>
              <span className="text-tiny font-bold text-[#D95326]">
                {nearestEvent.drlOrBenefitTag}
              </span>
            </div>

            <h1 className="font-serif-display text-h2 sm:text-h1 font-bold text-[#F8FAFC] leading-snug">
              {nearestEvent.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-tiny sm:text-small text-[#F8FAFC]/80">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D95326] shrink-0" />
                {nearestEvent.eventTimeText}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D95326] shrink-0" />
                {nearestEvent.location}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  onToggleReminder(nearestEvent.id, nearestEvent.title)
                }
                className={`px-4 py-2 rounded-[4px] font-bold text-tiny sm:text-small flex items-center gap-2 transition cursor-pointer ${
                  student.remindedEventIds.includes(nearestEvent.id)
                    ? "bg-white text-[#0B2545]"
                    : "bg-[#D95326] hover:bg-[#C0441B] text-white"
                }`}
              >
                {student.remindedEventIds.includes(nearestEvent.id) ? (
                  <>
                    <BellRing className="w-4 h-4 text-[#D95326]" />
                    Đã bật nhắc hẹn
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Nhắc tham gia
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDownloadIcs(nearestEvent)}
                className="px-3.5 py-2 rounded-[4px] bg-white/10 hover:bg-white/20 text-[#F8FAFC] border border-white/15 font-bold text-tiny sm:text-small flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D95326]" />
                Lưu lịch (.ics)
              </button>
            </div>
          </div>

          {/* 4 Balanced Square Countdown Boxes */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 shrink-0 self-start lg:self-center">
            {[
              { label: "Ngày", value: nearestCountdown.days },
              { label: "Giờ", value: nearestCountdown.hours },
              { label: "Phút", value: nearestCountdown.minutes },
              { label: "Giây", value: nearestCountdown.seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#152033] border border-[#233044] rounded-[4px] flex flex-col items-center justify-center text-center"
              >
                <div className="font-serif-display text-h1 font-bold text-[#F8FAFC] tabular-nums leading-none">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="text-tiny font-bold uppercase text-[#F8FAFC]/65 mt-1.5">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          2. CLEAN EVENTS DIRECTORY & UNDERLINED FILTER BAR
          ================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#233044]">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { id: "all", label: `Tất cả (${HCMUS_DOCUMENT_EVENTS.length})` },
              { id: "seminar-conference", label: "Hội thảo & Khoa học" },
              { id: "academic-contest", label: "Cuộc thi Học thuật" },
              {
                id: "student-affairs-scholarship",
                label: "Học bổng & Tình nguyện",
              },
              {
                id: "reminded",
                label: `Đã nhắc hẹn (${student.remindedEventIds.length})`,
              },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      cat.id as "all" | HcmusEventCategory | "reminded"
                    )
                  }
                  className={`pb-2 font-bold text-small transition cursor-pointer border-b-2 whitespace-nowrap ${
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

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#0B2545]/50 dark:text-[#F8FAFC]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sự kiện, CLB..."
                className="w-full pl-9 pr-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] text-small focus:border-[#0B2545] focus:outline-none"
              />
            </div>

            <div className="flex rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Chế độ Thẻ"
                className={`p-2 transition cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-[#0B2545] text-white dark:bg-[#F8FAFC] dark:text-[#0B2545]"
                    : "bg-white dark:bg-[#152033] text-[#0B2545] dark:text-[#F8FAFC]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Chế độ Bảng"
                className={`p-2 transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#0B2545] text-white dark:bg-[#F8FAFC] dark:text-[#0B2545]"
                    : "bg-white dark:bg-[#152033] text-[#0B2545] dark:text-[#F8FAFC]"
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((ev) => {
              const isReminded = student.remindedEventIds.includes(ev.id);
              const isExpanded = expandedEventId === ev.id;
              const rem = calculateTimeRemaining(ev.targetTimestamp, nowMs);
              const isClosed = ev.statusType === "closed" || rem.isExpired;

              return (
                <article
                  key={ev.id}
                  className="rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] p-5 flex flex-col justify-between gap-4 hover:border-[#0B2545] dark:hover:border-[#F8FAFC]/50 transition"
                >
                  <div className="space-y-3">
                    {/* Full Untruncated Event Title */}
                    <h3 className="font-serif-display text-h2 font-bold text-[#0B2545] dark:text-[#F8FAFC] leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-tiny font-bold text-[#D95326]">
                      {ev.drlOrBenefitTag}
                    </p>

                    <div className="space-y-1.5 text-tiny text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#D95326] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ev.eventTimeText}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D95326] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ev.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#233044] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-serif-display text-tiny sm:text-small font-bold tabular-nums ${
                          isClosed
                            ? "text-[#0B2545]/50 dark:text-[#F8FAFC]/50"
                            : "text-[#0B2545] dark:text-[#F8FAFC]"
                        }`}
                      >
                        {isClosed
                          ? "Đã khép lại"
                          : `Còn ${rem.days}n ${String(rem.hours).padStart(
                              2,
                              "0"
                            )}g ${String(rem.minutes).padStart(
                              2,
                              "0"
                            )}p ${String(rem.seconds).padStart(2, "0")}s`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEventId(isExpanded ? null : ev.id)
                          }
                          className="px-2.5 py-1.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] font-bold text-tiny flex items-center gap-1 hover:border-[#0B2545] transition cursor-pointer"
                        >
                          Chi tiết
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleReminder(ev.id, ev.title)}
                          className={`px-3 py-1.5 rounded-[4px] font-bold text-tiny flex items-center gap-1.5 transition cursor-pointer ${
                            isReminded
                              ? "border border-[#0B2545] dark:border-[#F8FAFC] text-[#0B2545] dark:text-[#F8FAFC]"
                              : "bg-[#0B2545] hover:bg-[#163A66] text-white dark:bg-[#D95326] dark:hover:bg-[#C0441B]"
                          }`}
                        >
                          {isReminded ? (
                            <>
                              <BellRing className="w-3.5 h-3.5 text-[#D95326]" />
                              Đã nhắc
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5" />
                              Nhắc hẹn
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#233044] space-y-2.5 text-tiny">
                        <p className="text-[#0B2545]/80 dark:text-[#F8FAFC]/80">
                          {ev.summary}
                        </p>
                        <p className="text-[#0B2545]/65 dark:text-[#F8FAFC]/65">
                          <strong>Đơn vị:</strong> {ev.organizer} ·{" "}
                          <strong>Hạn ĐK:</strong> {ev.deadlineText}
                        </p>

                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={noteDrafts[ev.id] || ""}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({
                                ...prev,
                                [ev.id]: e.target.value,
                              }))
                            }
                            placeholder="Ghi chú cá nhân..."
                            className="flex-1 px-2.5 py-1.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-tiny focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(ev.id)}
                            className="px-3 py-1.5 rounded-[4px] bg-[#0B2545] text-white font-bold text-tiny shrink-0 cursor-pointer"
                          >
                            {savedToastId === ev.id ? "Đã lưu" : "Lưu"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B2545] text-white text-tiny uppercase">
                    <th className="py-3 px-4 font-bold">Sự kiện</th>
                    <th className="py-3 px-4 font-bold">Thời gian</th>
                    <th className="py-3 px-4 font-bold">Địa điểm</th>
                    <th className="py-3 px-4 font-bold">Quyền lợi</th>
                    <th className="py-3 px-4 font-bold text-center">Nhắc hẹn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#233044] text-small">
                  {filteredEvents.map((ev) => {
                    const isReminded = student.remindedEventIds.includes(ev.id);
                    return (
                      <tr
                        key={ev.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#0E1624]/40 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold">{ev.title}</div>
                          <div className="text-tiny text-[#0B2545]/60 dark:text-[#F8FAFC]/60">
                            {ev.categoryLabel}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-tiny whitespace-nowrap">
                          {ev.eventTimeText}
                        </td>
                        <td className="py-3 px-4 text-tiny">{ev.location}</td>
                        <td className="py-3 px-4 text-tiny font-bold text-[#D95326] whitespace-nowrap">
                          {ev.drlOrBenefitTag}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleReminder(ev.id, ev.title)}
                            className={`px-3 py-1 rounded-[4px] font-bold text-tiny transition cursor-pointer ${
                              isReminded
                                ? "border border-[#0B2545] dark:border-[#F8FAFC]"
                                : "bg-[#D95326] text-white"
                            }`}
                          >
                            {isReminded ? "Đã nhắc" : "Nhắc hẹn"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
