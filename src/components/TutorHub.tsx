import React, { useState } from "react";
import {
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  Send,
  Search,
} from "lucide-react";
import { TutorListing } from "../types";
import { TUTOR_LISTINGS } from "../data/forusData";

interface TutorHubProps {
  onEarnPoints: (points: number, reason: string) => void;
}

export const TutorHub: React.FC<TutorHubProps> = ({ onEarnPoints }) => {
  const [listings, setListings] = useState<TutorListing[]>(TUTOR_LISTINGS);
  const [filterType, setFilterType] = useState<
    "all" | "parent-seeking" | "student-profile"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [postMode, setPostMode] = useState<
    "parent-seeking" | "student-profile"
  >("student-profile");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Toán · Tin học (C++/Python)");
  const [gradeLevel, setGradeLevel] = useState("Lớp 9 - Lớp 12");
  const [district, setDistrict] = useState("Quận 5 (Gần ĐH KHTN CS1)");
  const [schedule, setSchedule] = useState("2 buổi/tuần (Tối 18h30 - 20h30)");
  const [feePerSession, setFeePerSession] = useState("200.000đ / buổi");
  const [contactInfo, setContactInfo] = useState("");

  const filteredListings = listings.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleApplyOrConnect = (item: TutorListing) => {
    if (appliedIds.includes(item.id)) return;
    setAppliedIds((prev) => [...prev, item.id]);
    onEarnPoints(
      item.pointsReward,
      `Kết nối Cò Gia Sư: ${item.subject} (${item.district})`
    );
    setFeedbackBanner(
      `Đã gửi yêu cầu kết nối mã lớp "${item.subject}" thành công! Bạn nhận được +${item.pointsReward} điểm tích lũy FORUS.`
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newListing: TutorListing = {
      id: `tutor-${Date.now()}`,
      type: postMode,
      title: title.trim(),
      subject,
      gradeLevel,
      district,
      schedule,
      feePerSession,
      tutorOrStudentInfo:
        contactInfo.trim() || "Sinh viên ĐH KHTN CS1 · Đã xác thực email",
      facultyOrSchool:
        postMode === "student-profile"
          ? "Trường ĐH Khoa học Tự nhiên — ĐHQG-HCM"
          : "Phụ huynh / Học sinh khu vực TP.HCM",
      verified: true,
      requirements: [
        "Kết nối trực tiếp qua nền tảng Cò Gia Sư FORUS minh bạch chi phí",
        "Hỗ trợ bộ tài liệu giảng dạy chuẩn KHTN",
      ],
      pointsReward: 10,
    };

    setListings((prev) => [newListing, ...prev]);
    onEarnPoints(10, `Đăng tin Cò Gia Sư: ${subject}`);
    setShowPostForm(false);
    setTitle("");
    setContactInfo("");
    setFeedbackBanner(
      "Đã đăng tin lên sàn Cò Gia Sư FORUS thành công! Bạn được cộng +10 điểm thưởng."
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700/80 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
            Cò Gia Sư HCMUS · Kết nối Sinh viên KHTN & Học sinh các cấp
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Sàn Kết Nối Gia Sư Tự Nhiên Uy Tín
          </h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Cầu nối trực tiếp giữa sinh viên ĐH Khoa học Tự nhiên (giỏi Toán, Lý, Hóa, Sinh, Lập trình C++/Python, IELTS) và phụ huynh khu vực Quận 5, Quận 1, Quận 10, Quận 3. Mỗi lượt nhận lớp hoặc đăng hồ sơ được cộng ngay{" "}
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +10 điểm
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center gap-2 self-start rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>
            {showPostForm ? "Đóng Khung Đăng Tin" : "Đăng Hồ Sơ / Tìm Gia Sư (+10 điểm)"}
          </span>
        </button>
      </div>

      {feedbackBanner && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Optional Post Creation Form */}
      {showPostForm && (
        <form
          onSubmit={handleCreatePost}
          className="space-y-4 rounded-2xl border border-sky-500/30 bg-white p-5 sm:p-6 dark:bg-slate-800/90"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đăng Tin Mới Lên Cò Gia Sư FORUS
            </h3>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
              <button
                type="button"
                onClick={() => setPostMode("student-profile")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  postMode === "student-profile"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Mình là Sinh viên tìm lớp
              </button>
              <button
                type="button"
                onClick={() => setPostMode("parent-seeking")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  postMode === "parent-seeking"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Phụ huynh tìm Gia sư
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Tiêu đề tin đăng
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: SV Năm 2 CNTT nhận kèm Toán 9, Lập trình C++/Python tại Q.5..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Môn học
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Cấp lớp / Đối tượng
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Khu vực dạy
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Mức học phí đề xuất
              </label>
              <input
                type="text"
                value={feePerSession}
                onChange={(e) => setFeePerSession(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Lịch học & Thông tin liên hệ (MSSV / SĐT)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="VD: Rảnh tối 2-4-6 · Liên hệ MSSV 24120xxx..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Đăng Ngay & Nhận +10 Điểm</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Tất cả ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("parent-seeking")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 ${
              filterType === "parent-seeking"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Lớp đang tìm Gia sư SV
          </button>
          <button
            type="button"
            onClick={() => setFilterType("student-profile")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 ${
              filterType === "student-profile"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
            }`}
          >
            Hồ sơ Gia sư KHTN
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm môn Toán, Python, Quận 5..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {filteredListings.map((item) => {
          const isApplied = appliedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800/90 dark:hover:border-slate-600"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {item.type === "parent-seeking"
                      ? "Phụ huynh tìm Gia sư"
                      : "Hồ sơ Gia sư SV"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    +{item.pointsReward} pts
                  </span>
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span>{item.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span>{item.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span>{item.facultyOrSchool}</span>
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  {item.requirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                <div>
                  <span className="block text-[11px] text-slate-400 dark:text-slate-300">
                    Mức thu nhập / Học phí
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {item.feePerSession}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyOrConnect(item)}
                  disabled={isApplied}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    isApplied
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
                  }`}
                >
                  {isApplied
                    ? "Đã Đăng Ký Kết Nối (✓)"
                    : item.type === "parent-seeking"
                    ? "Nhận Lớp Ngay (+10đ)"
                    : "Liên Hệ Gia Sư (+10đ)"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TutorHub;
