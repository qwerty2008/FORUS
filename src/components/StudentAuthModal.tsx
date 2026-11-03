import React, { useState } from "react";
import { X, GraduationCap, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { StudentProfile } from "../types";

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onLoginSuccess: (updated: Partial<StudentProfile>) => void;
  onActivateDemoVip: () => void;
}

const HCMUS_FACULTIES = [
  "Khoa Công nghệ Thông tin (FIT)",
  "Khoa Toán - Tin học",
  "Khoa Vật lý - Vật lý Kỹ thuật",
  "Khoa Điện tử - Viễn thông",
  "Khoa Hóa học",
  "Khoa Sinh học - Công nghệ Sinh học",
  "Khoa Khoa học và Công nghệ Vật liệu",
  "Khoa Môi trường",
  "Khoa Địa chất",
];

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  student,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState(student.isLoggedIn ? student.email : "");
  const [studentId, setStudentId] = useState(
    student.isLoggedIn ? student.studentId : ""
  );
  const [fullName, setFullName] = useState(
    student.isLoggedIn ? student.fullName : ""
  );
  const [faculty, setFaculty] = useState(
    student.faculty || HCMUS_FACULTIES[0]
  );
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    const isValidHcmusDomain =
      cleanEmail.endsWith("@student.hcmus.edu.vn") ||
      cleanEmail.endsWith("@hcmus.edu.vn") ||
      cleanEmail.endsWith("@fit.hcmus.edu.vn") ||
      cleanEmail.endsWith("@clc.hcmus.edu.vn");

    if (!isValidHcmusDomain) {
      setErrorMsg(
        "Vui lòng sử dụng email sinh viên ĐH Khoa học Tự nhiên (ví dụ: MSSV@student.hcmus.edu.vn)."
      );
      return;
    }

    if (!fullName.trim() || !studentId.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ Họ tên và Mã số sinh viên (MSSV).");
      return;
    }

    setErrorMsg(null);
    onLoginSuccess({
      isLoggedIn: true,
      email: cleanEmail,
      studentId: studentId.trim() || cleanEmail.split("@")[0],
      fullName: fullName.trim(),
      faculty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Đăng Nhập Email Sinh Viên ĐH KHTN
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Sinh Viên HCMUS (@student.hcmus.edu.vn)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (!studentId && val.includes("@")) {
                  setStudentId(val.split("@")[0]);
                }
              }}
              placeholder="Nhập email SV (VD: MSSV@student.hcmus.edu.vn)"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mã số sinh viên (MSSV)
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Nhập MSSV"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Họ và tên sinh viên
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Khoa trực thuộc (Cơ sở 1 Nguyễn Văn Cừ)
            </label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {HCMUS_FACULTIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu tài khoản
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu đăng nhập"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Quyền lợi tài khoản Sinh viên Tự Nhiên:</span>
            </div>
            <p className="mt-1">
              • Không cần cọc CCCD khi thuê máy tính Casio, áo blouse và Combo iPad Sinh Viên tại Cơ sở 1.
              <br />• Tích lũy 5–10 điểm mỗi lần dùng dịch vụ, đủ 100 điểm mở khóa Bảng Săn ĐRL &amp; Trợ lý AI.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#0B2545] hover:bg-[#163A66] py-2.5 text-xs font-extrabold text-white transition cursor-pointer"
          >
            Đăng Nhập Tài Khoản Sinh Viên
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAuthModal;
