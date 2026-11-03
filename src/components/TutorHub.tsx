import React, { useState } from "react";
import {
  GraduationCap,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  Send,
  Search,
  ArrowDownWideNarrow,
  BookOpen,
} from "lucide-react";
import { TutorListing, StudentProfile } from "../types";
import { TUTOR_LISTINGS } from "../data/forusData";

interface TutorHubProps {
  onEarnPoints: (points: number, reason: string) => void;
  student?: StudentProfile;
  onOpenEditProfile?: () => void;
}

type SubjectCategory =
  | "all"
  | "math"
  | "cs"
  | "physics"
  | "chem-bio"
  | "general-uni"
  | "english";

const SUBJECT_FILTERS: { id: SubjectCategory; label: string; keywords: string[] }[] = [
  { id: "all", label: "Tất cả môn", keywords: [] },
  {
    id: "math",
    label: "Toán học",
    keywords: ["toán", "vi tích phân", "đại số", "giải tích", "xác suất"],
  },
  {
    id: "cs",
    label: "Tin học / Lập trình",
    keywords: ["c++", "python", "lập trình", "thuật toán", "scratch", "cấu trúc dữ liệu", "tin"],
  },
  {
    id: "physics",
    label: "Vật lý",
    keywords: ["vật lý", "điện tử"],
  },
  {
    id: "chem-bio",
    label: "Hóa & Sinh",
    keywords: ["hóa", "sinh"],
  },
  {
    id: "general-uni",
    label: "Đại cương KHTN",
    keywords: [
      "đại cương",
      "vi tích phân",
      "đại số tuyến tính",
      "nhập môn lập trình",
      "xác suất thống kê",
      "toán rời rạc",
    ],
  },
  {
    id: "english",
    label: "Tiếng Anh / IELTS",
    keywords: ["ielts", "tiếng anh", "igcse", "sat"],
  },
];

const parseFeeAmount = (feeStr: string): number => {
  const matches = feeStr.match(/\d+(?:\.\d+)*/g);
  if (!matches || matches.length === 0) return 0;
  const numericValues = matches.map((m) => parseInt(m.replace(/\./g, ""), 10) || 0);
  return Math.max(...numericValues);
};

const matchesSubjectCategory = (item: TutorListing, category: SubjectCategory): boolean => {
  if (category === "all") return true;
  const filterDef = SUBJECT_FILTERS.find((f) => f.id === category);
  if (!filterDef) return true;
  const haystack = `${item.subject} ${item.title} ${item.gradeLevel}`.toLowerCase();
  return filterDef.keywords.some((kw) => haystack.includes(kw));
};

export const TutorHub: React.FC<TutorHubProps> = ({
  onEarnPoints,
  student,
  onOpenEditProfile,
}) => {
  const [listings, setListings] = useState<TutorListing[]>(TUTOR_LISTINGS);
  const [filterType, setFilterType] = useState<
    "all" | "parent-seeking" | "student-profile"
  >("all");
  const [subjectFilter, setSubjectFilter] = useState<SubjectCategory>("all");
  const [feeSort, setFeeSort] = useState<"fee-desc" | "fee-asc" | "default">(
    "fee-desc"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const [postMode, setPostMode] = useState<
    "parent-seeking" | "student-profile"
  >("student-profile");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(
    student?.tutorSubjects || "Toán · Tin học (C++/Python)"
  );
  const [gradeLevel, setGradeLevel] = useState("Lớp 9 - Lớp 12 / Đại cương KHTN");
  const [district, setDistrict] = useState("Quận 5 (Gần ĐH KHTN CS1)");
  const [schedule, setSchedule] = useState("2 buổi/tuần (Tối 18h30 - 20h30)");
  const [feePerSession, setFeePerSession] = useState("200.000đ / buổi");
  const [contactInfo, setContactInfo] = useState("");

  const filteredListings = listings
    .filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSubject = matchesSubjectCategory(item, subjectFilter);
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facultyOrSchool.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSubject && matchesSearch;
    })
    .sort((a, b) => {
      if (feeSort === "fee-desc") {
        return parseFeeAmount(b.feePerSession) - parseFeeAmount(a.feePerSession);
      }
      if (feeSort === "fee-asc") {
        return parseFeeAmount(a.feePerSession) - parseFeeAmount(b.feePerSession);
      }
      return 0;
    });

  const handleApplyOrConnect = (item: TutorListing) => {
    if (appliedIds.includes(item.id)) return;
    setAppliedIds((prev) => [...prev, item.id]);
    onEarnPoints(
      item.pointsReward,
      `Kết nối Cò Gia Sư: ${item.subject} (${item.district})`
    );
    const achievementSummary = student?.personalAchievements
      ? ` (Kèm hồ sơ thành tích: ${student.personalAchievements})`
      : "";
    setFeedbackBanner(
      `Đã gửi yêu cầu kết nối mã lớp "${item.subject}" thành công${achievementSummary}! Bạn nhận được +${item.pointsReward} điểm tích lũy FORUS.`
    );
    setTimeout(() => setFeedbackBanner(null), 4500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const studentAchievementTags =
      postMode === "student-profile" && student?.personalAchievements
        ? student.personalAchievements
            .split(/[·•,;|\n]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

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
        contactInfo.trim() ||
        (student
          ? `${student.fullName} (${student.studentId}${
              student.gpa ? ` · GPA ${student.gpa}` : ""
            }${student.phone ? ` · SĐT: ${student.phone}` : ""})`
          : "Sinh viên ĐH KHTN CS1 · Đã xác thực email"),
      facultyOrSchool:
        postMode === "student-profile"
          ? `${student?.faculty || "Khoa CNTT"} — ĐH KHTN (HCMUS)`
          : "Phụ huynh / Học sinh khu vực TP.HCM",
      verified: true,
      requirements:
        studentAchievementTags.length > 0
          ? [
              ...studentAchievementTags,
              "Đã xác thực hồ sơ sinh viên & thành tích cá nhân trên FORUS",
            ]
          : [
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
      "Đã đăng tin kèm thành tích cá nhân lên sàn Cò Gia Sư FORUS thành công! Bạn được cộng +10 điểm thưởng."
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Warm Beige Banner with Policy Summary (Matches Reference Web) */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-7">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-4xl dark:text-white leading-[1.15]">
              Cò Gia Sư KHTN — Kết Nối Lớp Dạy Kèm &amp; Mentor Đại Cương
            </h2>
            <p className="text-sm leading-relaxed text-[#4A5568] sm:text-base dark:text-slate-300">
              Cầu nối minh bạch giữa sinh viên{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                ĐH Khoa học Tự nhiên (Cơ sở 1)
              </strong>{" "}
              và phụ huynh khu vực Quận 5, Quận 1, Quận 10, Quận 3, cũng như các nhóm học kèm Vi tích phân, Đại số tuyến tính, C++/Python tại{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Thư viện Cơ sở 1
              </strong>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6E0D5] bg-white p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#64748B] dark:text-slate-400">
              CHÍNH SÁCH KẾT NỐI MINH BẠCH
            </p>
            <div className="mt-3.5 divide-y divide-[#EAE5DC] text-xs sm:text-sm dark:divide-slate-800">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Xác thực thẻ SV (@student.hcmus.edu.vn):
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Miễn phí 100%
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Tặng kèm bộ đề &amp; giáo trình ôn tập:
                </span>
                <span className="font-mono font-bold text-[#0B2545] dark:text-white">
                  Nhận tại Sảnh Tòa I
                </span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Thưởng điểm tích lũy VIP FORUS:
                </span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  +10 điểm / kết nối
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Tutor Achievement Card (Synced with Avatar Edit Profile) */}
        {student && (
          <div className="mt-5 pt-5 border-t border-[#E5DEC9] dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#0B2545] via-[#0284C7] to-[#10B981] shrink-0">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0B2545] text-white flex items-center justify-center font-extrabold text-xs">
                    {student.fullName
                      .trim()
                      .split(/\s+/)
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase() || "SV"}
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                    Hồ sơ Gia sư của bạn: {student.fullName} ({student.studentId})
                  </span>
                  {student.gpa && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-[#D95326] dark:text-amber-300 font-mono text-[11px] font-bold">
                      GPA: {student.gpa}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5568] dark:text-slate-300 line-clamp-2">
                  <strong className="text-[#0B2545] dark:text-slate-100">
                    Thành tích &amp; Năng lực gia sư:
                  </strong>{" "}
                  {student.personalAchievements ||
                    "Chưa cập nhật thành tích cá nhân. Hãy bấm vào Avatar góc trên để bổ sung thành tích khi ứng tuyển gia sư!"}
                </p>
              </div>
            </div>

            {onOpenEditProfile && (
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="px-3.5 py-2 rounded-xl border border-[#0B2545]/20 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-[#0B2545] hover:text-white dark:hover:bg-slate-700 text-[#0B2545] dark:text-slate-100 text-xs font-extrabold transition shrink-0 cursor-pointer"
              >
                Cập nhật Hồ sơ &amp; Thành tích Gia sư
              </button>
            )}
          </div>
        )}
      </div>

      {feedbackBanner && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Search, Segmented Filter & Post Action Row */}
      <div className="space-y-3.5 border-b border-[#E5DEC9] pb-4 dark:border-slate-700/80">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[
              { id: "all", label: `Tất cả (${listings.length})` },
              {
                id: "parent-seeking",
                label: `Lớp tìm Gia sư (${
                  listings.filter((l) => l.type === "parent-seeking").length
                })`,
              },
              {
                id: "student-profile",
                label: `Hồ sơ Gia sư KHTN (${
                  listings.filter((l) => l.type === "student-profile").length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as typeof filterType)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterType === tab.id
                    ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm môn Toán, Python, Quận 5..."
                className="w-full rounded-2xl border border-[#E5E0D5] bg-white py-2.5 pr-3.5 pl-9 text-xs font-medium text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPostForm(!showPostForm)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] px-4 py-2.5 text-xs font-extrabold text-white transition whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>
                {showPostForm ? "Đóng Khung Đăng Tin" : "Đăng Hồ Sơ / Tìm Gia Sư (+10đ)"}
              </span>
            </button>
          </div>
        </div>

        {/* Subject Filter & Tuition Fee Sort Row */}
        <div className="flex flex-col justify-between gap-3 pt-1 lg:flex-row lg:items-center">
          {/* Filter by Subject */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-xs font-bold text-[#4A5568] dark:text-slate-300">
              <BookOpen className="h-3.5 w-3.5 text-[#0B2545] dark:text-sky-400" />
              Lọc theo môn:
            </span>
            {SUBJECT_FILTERS.map((subj) => {
              const count = listings.filter((item) => {
                const typeOk = filterType === "all" || item.type === filterType;
                return typeOk && matchesSubjectCategory(item, subj.id);
              }).length;
              const isSelected = subjectFilter === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSubjectFilter(subj.id)}
                  className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#0B2545] text-white shadow-2xs dark:bg-sky-500 dark:text-slate-950"
                      : "border border-[#E5E0D5] bg-white text-[#4A5568] hover:border-[#0B2545]/40 hover:text-[#0B2545] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {subj.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort by Tuition Fee */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4A5568] dark:text-slate-300 whitespace-nowrap">
              <ArrowDownWideNarrow className="h-3.5 w-3.5 text-[#D95326]" />
              Sắp xếp học phí:
            </span>
            <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto rounded-xl border border-[#E5E0D5] bg-[#F2EFE9] p-1 dark:border-slate-700 dark:bg-slate-800">
              {[
                { id: "fee-desc", label: "Cao đến thấp" },
                { id: "fee-asc", label: "Thấp đến cao" },
                { id: "default", label: "Mặc định" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFeeSort(opt.id as typeof feeSort)}
                  className={`rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-1 text-[11px] sm:text-xs font-bold transition text-center truncate cursor-pointer ${
                    feeSort === opt.id
                      ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-amber-300"
                      : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Post Creation Form */}
      {showPostForm && (
        <form
          onSubmit={handleCreatePost}
          className="space-y-4 rounded-3xl border border-[#E6E0D5] bg-white p-4 sm:p-6 shadow-xs dark:border-slate-700 dark:bg-slate-800/90"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">
              Đăng Tin Mới Lên Cò Gia Sư FORUS
            </h3>
            <div className="grid grid-cols-2 sm:flex rounded-xl bg-[#F2EFE9] p-1 border border-[#E5E0D5] dark:bg-slate-700 dark:border-slate-600 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPostMode("student-profile")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition text-center truncate cursor-pointer ${
                  postMode === "student-profile"
                    ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-[#5A6578] dark:text-slate-300"
                }`}
              >
                Mình là Sinh viên tìm lớp
              </button>
              <button
                type="button"
                onClick={() => setPostMode("parent-seeking")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition text-center truncate cursor-pointer ${
                  postMode === "parent-seeking"
                    ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-[#5A6578] dark:text-slate-300"
                }`}
              >
                Phụ huynh / SV tìm Gia sư
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Tiêu đề tin đăng
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: SV Năm 2 CNTT nhận kèm Toán 9, Lập trình C++/Python tại Q.5..."
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Môn học
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Cấp lớp / Đối tượng
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Khu vực dạy
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Mức học phí đề xuất
              </label>
              <input
                type="text"
                value={feePerSession}
                onChange={(e) => setFeePerSession(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 font-mono text-xs font-bold text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#334155] dark:text-slate-200">
                Lịch học &amp; Thông tin liên hệ (MSSV / SĐT)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="VD: Rảnh tối 2-4-6 · Liên hệ MSSV 24120xxx..."
                className="mt-1 w-full rounded-xl border border-[#DDD6C7] bg-[#F5F2EB] px-3.5 py-2.5 text-xs text-[#0B2545] focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2545] hover:bg-[#163A66] px-4 py-2.5 text-xs font-extrabold text-white transition whitespace-nowrap cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Đăng Ngay &amp; Nhận +10 Điểm</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map((item) => {
          const isApplied = appliedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-6 transition hover:border-[#C8C0B0] hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/90"
            >
              <div>
                {/* Clean Unboxed Metadata Line */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-300">
                  <span className="font-bold text-[#0B2545] dark:text-amber-300">
                    {item.type === "parent-seeking"
                      ? "Phụ huynh tìm Gia sư"
                      : "Hồ sơ Gia sư KHTN"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                    +{item.pointsReward} điểm FORUS
                  </span>
                </div>

                <h3 className="mt-2.5 text-lg font-extrabold text-[#0B2545] leading-snug dark:text-white">
                  {item.title}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-[#4A5568] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D95326]" />
                    <span>{item.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-sky-400" />
                    <span>{item.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[#0B2545] dark:text-sky-400" />
                    <span>{item.facultyOrSchool}</span>
                  </div>
                </div>

                <ul className="mt-3.5 space-y-1 border-t border-[#EAE5DC] pt-3 text-xs text-[#4A5568] dark:border-slate-700 dark:text-slate-300">
                  {item.requirements.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#EAE5DC] pt-4 dark:border-slate-700">
                <div>
                  <span className="block text-[11px] text-[#64748B] dark:text-slate-400">
                    Mức thu nhập / Học phí
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#0B2545] dark:text-white">
                    {item.feePerSession}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyOrConnect(item)}
                  disabled={isApplied}
                  className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition whitespace-nowrap shrink-0 cursor-pointer ${
                    isApplied
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-[#0B2545] text-white hover:bg-[#163A66] dark:bg-amber-500 dark:text-slate-950"
                  }`}
                >
                  {isApplied
                    ? "Đã Kết Nối (✓)"
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
