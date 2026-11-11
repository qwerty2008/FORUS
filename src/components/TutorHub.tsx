import React, { useState, useMemo } from "react";
import {
  MapPin,
  Clock,
  Plus,
  Search,
  Send,
  Phone,
  UserCheck,
  Copy,
  Check,
  X,
} from "lucide-react";
import { TUTOR_LISTINGS } from "../data/forusData";
import { TutorListing, StudentProfile } from "../types";

interface TutorHubProps {
  onEarnPoints: (points: number, reason: string) => void;
  student?: StudentProfile;
  onOpenEditProfile?: () => void;
}

const SUBJECT_CATEGORIES = [
  "Tất cả môn",
  "Toán - Lý - Hóa",
  "Lập trình / IT",
  "Toán Đại Cương",
  "IELTS / Tiếng Anh",
  "Luyện thi ĐGNL",
];

export const TutorHub: React.FC<TutorHubProps> = ({
  onEarnPoints,
  student,
  onOpenEditProfile,
}) => {
  const [listings, setListings] = useState<TutorListing[]>(TUTOR_LISTINGS);
  const [filterType, setFilterType] = useState<
    "all" | "parent-seeking" | "student-profile"
  >("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("Tất cả môn");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [activeContactListing, setActiveContactListing] =
    useState<TutorListing | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const [postType, setPostType] = useState<
    "parent-seeking" | "student-profile"
  >("student-profile");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [feePerSession, setFeePerSession] = useState("");
  const [district, setDistrict] = useState("Quận 5 (Gần 227 Nguyễn Văn Cừ)");
  const [schedule, setSchedule] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchType = filterType === "all" || item.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q);

      let matchSubject = true;
      if (subjectFilter !== "Tất cả môn") {
        const text = `${item.subject} ${item.title}`.toLowerCase();
        if (subjectFilter === "Toán - Lý - Hóa") {
          matchSubject =
            text.includes("toán") ||
            text.includes("lý") ||
            text.includes("hóa");
        } else if (subjectFilter === "Lập trình / IT") {
          matchSubject =
            text.includes("c++") ||
            text.includes("python") ||
            text.includes("lập trình") ||
            text.includes("ctdl") ||
            text.includes("oop");
        } else if (subjectFilter === "Toán Đại Cương") {
          matchSubject =
            text.includes("vi tích phân") ||
            text.includes("đại số") ||
            text.includes("xác suất");
        } else if (subjectFilter === "IELTS / Tiếng Anh") {
          matchSubject =
            text.includes("ielts") ||
            text.includes("tiếng anh") ||
            text.includes("toeic");
        } else if (subjectFilter === "Luyện thi ĐGNL") {
          matchSubject =
            text.includes("đgnl") || text.includes("đánh giá năng lực");
        }
      }

      return matchType && matchQuery && matchSubject;
    });
  }, [listings, filterType, searchQuery, subjectFilter]);

  const handleOpenPostModal = () => {
    if (!showPostForm && student?.isLoggedIn) {
      if (!subject && student.tutorSubjects) {
        setSubject(student.tutorSubjects.slice(0, 60));
      }
      if (!title && student.fullName) {
        setTitle(
          `SV ${student.faculty.replace("Khoa ", "")} (${
            student.fullName
          }) nhận kèm môn Tự nhiên / Đại cương`
        );
      }
    }
    setShowPostForm((prev) => !prev);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !feePerSession.trim()) return;

    const newPost: TutorListing = {
      id: `tut-user-${Date.now()}`,
      type: postType,
      title: title.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim() || "THPT / Đại cương ĐH",
      district: district.trim(),
      feePerSession: feePerSession.trim(),
      schedule: schedule.trim() || "Linh hoạt 2-3 buổi/tuần",
      requirements: ["Sinh viên ĐH KHTN ĐHQG-HCM"],
      tutorOrStudentInfo: contactPhone.trim()
        ? `SĐT/Zalo: ${contactPhone.trim()} (Đã xác thực tại CS1)`
        : "Đã xác thực MSSV — Liên hệ qua Quầy FORUS Tòa I",
      facultyOrSchool: student?.faculty || "ĐH Khoa học Tự nhiên — ĐHQG-HCM",
      verified: true,
      pointsReward: 10,
    };

    setListings([newPost, ...listings]);
    onEarnPoints(10, "Đăng tin kết nối Gia sư Tự Nhiên");
    setShowPostForm(false);
    setTitle("");
    setSubject("");
    setGradeLevel("");
    setFeePerSession("");
    setSchedule("");
    setContactPhone("");
  };

  const handleConnectListing = (item: TutorListing) => {
    if (!connectedIds.includes(item.id)) {
      setConnectedIds((prev) => [...prev, item.id]);
      onEarnPoints(
        5,
        `Kết nối ${
          item.type === "parent-seeking" ? "nhận lớp" : "gia sư"
        }: ${item.subject}`
      );
    }
    setActiveContactListing((prev) => (prev?.id === item.id ? null : item));
  };

  const getPhoneFromListing = (item: TutorListing) => {
    const match = item.tutorOrStudentInfo.match(/0\d{8,10}/);
    if (match) return match[0];
    const hash = item.id
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return `0908${String((hash * 137) % 1000000).padStart(6, "0")}`;
  };

  const handleCopyContact = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Header */}
      <section className="pb-5 border-b border-[#E2E8F0] dark:border-[#233044] pl-4 margin-rule flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif-display text-h1 font-bold text-[#0B2545] dark:text-[#F8FAFC]">
            Gia Sư Tự Nhiên
          </h1>
          <p className="text-small text-[#0B2545]/75 dark:text-[#F8FAFC]/75">
            Hồ sơ gia sư sinh viên KHTN và lớp tìm gia sư quanh Quận 1, 3, 5, 10.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {student?.isLoggedIn && onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="px-3.5 py-2.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] text-small font-bold hover:border-[#0B2545] transition cursor-pointer"
            >
              Hồ sơ của bạn
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenPostModal}
            className="px-4 py-2.5 rounded-[4px] bg-[#D95326] hover:bg-[#C0441B] text-white font-bold text-small flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Đăng tin (+10đ)
          </button>
        </div>
      </section>

      {/* Underlined Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#233044] pb-3">
        <div className="flex flex-wrap items-center gap-6">
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
              label: `Thẻ Gia sư SV (${
                listings.filter((l) => l.type === "student-profile").length
              })`,
            },
          ].map((tab) => {
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setFilterType(
                    tab.id as "all" | "parent-seeking" | "student-profile"
                  )
                }
                className={`pb-2 text-small font-bold transition cursor-pointer border-b-2 whitespace-nowrap ${
                  active
                    ? "border-[#D95326] text-[#0B2545] dark:text-[#F8FAFC]"
                    : "border-transparent text-[#0B2545]/60 dark:text-[#F8FAFC]/60 hover:text-[#0B2545] dark:hover:text-[#F8FAFC]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Lọc theo môn học"
            className="px-3 py-1.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] text-small font-bold text-[#0B2545] dark:text-[#F8FAFC] focus:border-[#0B2545] focus:outline-none cursor-pointer"
          >
            {SUBJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-[#0B2545]/50 dark:text-[#F8FAFC]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm môn, khu vực Quận 5..."
            className="w-full pl-9 pr-3.5 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] text-small text-[#0B2545] dark:text-[#F8FAFC] focus:border-[#0B2545] focus:outline-none"
          />
        </div>
      </div>

      {/* Collapsible Post Creation Form */}
      {showPostForm && (
        <form
          onSubmit={handleCreatePost}
          className="p-5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#233044] pb-3">
            <h3 className="font-serif-display text-h2 font-bold">
              Đăng thẻ hồ sơ Gia sư mới
            </h3>
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="p-1 text-[#0B2545]/60 dark:text-[#F8FAFC]/60 hover:text-[#D95326] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-tiny font-bold mb-1">
                Phân loại thẻ
              </label>
              <select
                value={postType}
                onChange={(e) =>
                  setPostType(
                    e.target.value as "parent-seeking" | "student-profile"
                  )
                }
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              >
                <option value="student-profile">
                  Sinh viên tìm lớp dạy kèm
                </option>
                <option value="parent-seeking">
                  Phụ huynh / SV tìm Gia sư
                </option>
              </select>
            </div>
            <div>
              <label className="block text-tiny font-bold mb-1">
                Tiêu đề tin đăng *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: SV Năm 3 CNTT nhận kèm C++/Toán"
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              />
            </div>
            <div>
              <label className="block text-tiny font-bold mb-1">
                Môn học *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="VD: Toán 12, Giải tích, C++..."
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              />
            </div>
            <div>
              <label className="block text-tiny font-bold mb-1">
                Mức học phí đề xuất *
              </label>
              <input
                type="text"
                required
                value={feePerSession}
                onChange={(e) => setFeePerSession(e.target.value)}
                placeholder="VD: 200.000đ / buổi"
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              />
            </div>
            <div>
              <label className="block text-tiny font-bold mb-1">
                Khu vực &amp; Lịch học
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Quận 5 / Online"
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              />
            </div>
            <div>
              <label className="block text-tiny font-bold mb-1">
                SĐT / Zalo liên hệ
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0908xxxxxx"
                className="w-full px-3 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] text-small"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="px-4 py-2 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] text-small font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[4px] bg-[#D95326] hover:bg-[#C0441B] text-white font-bold text-small flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Đăng tin ngay
            </button>
          </div>
        </form>
      )}

      {/* Student ID / Specimen Card Grid (Square frame, verification code, no rounded drop-shadow cards) */}
      {filteredListings.length === 0 ? (
        <div className="p-10 text-center rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033]">
          <p className="text-body font-bold">Không tìm thấy hồ sơ phù hợp</p>
          <p className="text-small text-[#0B2545]/60 dark:text-[#F8FAFC]/60 mt-1">
            Thử đổi bộ lọc môn học hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="paper-grid p-4 sm:p-6 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((item, idx) => {
              const isConnected = connectedIds.includes(item.id);
              const isExpanded = activeContactListing?.id === item.id;
              const phone = getPhoneFromListing(item);
              const cardCode = `KHTN-${String(idx + 101).padStart(3, "0")}`;

              return (
                <article
                  key={item.id}
                  className="rounded-[4px] border border-[#0B2545]/20 dark:border-[#233044] bg-white dark:bg-[#152033] flex flex-col justify-between transition hover:border-[#0B2545] dark:hover:border-[#F8FAFC]/60"
                >
                  {/* Student ID Top Strip */}
                  <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] flex items-center justify-between gap-2">
                    <span className="text-tiny font-bold text-[#0B2545]/70 dark:text-[#F8FAFC]/70 tabular-nums">
                      MÃ THẺ: {cardCode}
                    </span>
                    <span className="stamp">
                      {item.type === "parent-seeking"
                        ? "LỚP TÌM GIA SƯ"
                        : "THẺ GIA SƯ SV"}
                    </span>
                  </div>

                  {/* Body with ID Avatar Box & Margin Rule */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      {/* Square Student ID Portrait Box */}
                      <div className="w-11 h-12 rounded-[2px] border border-[#0B2545]/25 dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] flex flex-col items-center justify-center shrink-0">
                        <span className="font-serif-display text-body font-bold text-[#0B2545] dark:text-[#F8FAFC]">
                          {item.subject.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-tiny text-[#D95326] font-bold leading-none">
                          CS1
                        </span>
                      </div>

                      <div className="pl-2.5 margin-rule min-w-0 space-y-1">
                        <p className="text-tiny font-bold text-[#0B2545]/65 dark:text-[#F8FAFC]/65 truncate">
                          {item.subject}
                        </p>
                        <h3 className="font-serif-display text-h2 font-bold text-[#0B2545] dark:text-[#F8FAFC] line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-1 text-tiny text-[#0B2545]/75 dark:text-[#F8FAFC]/75 pt-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D95326] shrink-0" />
                        <span className="truncate">{item.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#D95326] shrink-0" />
                        <span className="truncate">{item.schedule}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 sm:px-5 py-3 border-t border-[#E2E8F0] dark:border-[#233044] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-serif-display text-h2 font-bold text-[#0B2545] dark:text-[#F8FAFC] tabular-nums">
                        {item.feePerSession}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleConnectListing(item)}
                        className={`px-3.5 py-2 rounded-[4px] font-bold text-tiny transition cursor-pointer flex items-center gap-1.5 ${
                          isConnected
                            ? "border border-[#0B2545] dark:border-[#F8FAFC] text-[#0B2545] dark:text-[#F8FAFC]"
                            : "bg-[#0B2545] hover:bg-[#163A66] text-white dark:bg-[#D95326] dark:hover:bg-[#C0441B]"
                        }`}
                      >
                        {isConnected ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            {isExpanded ? "Ẩn SĐT" : "Xem SĐT"}
                          </>
                        ) : (
                          <>
                            <Phone className="w-3.5 h-3.5" />
                            {item.type === "parent-seeking"
                              ? "Nhận lớp"
                              : "Liên hệ"}
                          </>
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-2.5 rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-[#F8FAFC] dark:bg-[#0E1624] flex items-center justify-between gap-2 text-tiny">
                        <div className="truncate">
                          <span className="font-bold">SĐT/Zalo: </span>
                          <span className="font-bold text-[#D95326] tabular-nums">
                            {phone}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyContact(item.id, phone)}
                          className="px-2 py-1 rounded-[2px] border border-[#E2E8F0] dark:border-[#233044] bg-white dark:bg-[#152033] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          {copiedPhoneId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#D95326]" />
                              Đã chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Sao chép
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
