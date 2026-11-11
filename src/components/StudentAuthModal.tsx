import React, { useState } from "react";
import { X, GraduationCap, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-[#DCD5C7] bg-[#F6F2E8] p-6 text-[#0B2545] shadow-2xl dark:border-[#233044] dark:bg-[#0E1624] dark:text-[#F6F2E8]">
        <div className="flex items-center justify-between border-b border-[#DCD5C7] pb-4 dark:border-[#233044]">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#D95326]" />
            <h2 className="text-body font-bold">
              Đăng Nhập Email Sinh Viên ĐH KHTN
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-[#EFEAE0] dark:hover:bg-[#152033] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-tiny font-bold">
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
              className="mt-1 w-full rounded border border-[#DCD5C7] bg-transparent px-3.5 py-2.5 text-small focus:border-[#0B2545] focus:outline-none dark:border-[#233044]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-tiny font-bold">
                Mã số sinh viên (MSSV)
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Nhập MSSV"
                className="mt-1 w-full rounded border border-[#DCD5C7] bg-transparent px-3.5 py-2 text-small tabular-nums focus:border-[#0B2545] focus:outline-none dark:border-[#233044]"
              />
            </div>

            <div>
              <label className="block text-tiny font-bold">
                Họ và tên sinh viên
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="mt-1 w-full rounded border border-[#DCD5C7] bg-transparent px-3.5 py-2 text-small focus:border-[#0B2545] focus:outline-none dark:border-[#233044]"
              />
            </div>
          </div>

          <div>
            <label className="block text-tiny font-bold">
              Khoa trực thuộc (Cơ sở 1 Nguyễn Văn Cừ)
            </label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="mt-1 w-full rounded border border-[#DCD5C7] bg-[#F6F2E8] px-3 py-2 text-small focus:border-[#0B2545] focus:outline-none dark:border-[#233044] dark:bg-[#0E1624]"
            >
              {HCMUS_FACULTIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-tiny font-bold">
              Mật khẩu tài khoản
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu đăng nhập"
              className="mt-1 w-full rounded border border-[#DCD5C7] bg-transparent px-3.5 py-2 text-small focus:border-[#0B2545] focus:outline-none dark:border-[#233044]"
            />
          </div>

          {errorMsg && (
            <div className="rounded border border-red-600/30 bg-red-600/10 p-3 text-tiny font-bold text-red-700 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="rounded border border-[#DCD5C7] bg-[#EFEAE0]/60 p-3 text-tiny dark:border-[#233044] dark:bg-[#152033]/60">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
              <span>Quyền lợi tài khoản Sinh viên Tự Nhiên:</span>
            </div>
            <p className="mt-1 text-[#0B2545]/80 dark:text-[#F6F2E8]/80">
              • Không cần cọc CCCD khi thuê máy tính Casio, áo blouse và Combo iPad Sinh Viên tại Cơ sở 1.
              <br />• Tích lũy 5–10 điểm mỗi lần dùng dịch vụ, đủ 100 điểm mở khóa Bảng Săn ĐRL &amp; Trợ lý AI.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-[#0B2545] hover:bg-[#163A66] py-2.5 text-small font-bold text-[#F6F2E8] transition cursor-pointer"
          >
            Đăng Nhập Tài Khoản Sinh Viên
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAuthModal;
