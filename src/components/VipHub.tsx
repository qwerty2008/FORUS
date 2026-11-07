import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  CheckCircle2,
  Zap,
  Trash2,
  Gift,
  Code2,
  Copy,
  Check,
  Layers,
  Map,
  Compass,
  Search,
  Navigation,
} from "lucide-react";
import { StudentProfile } from "../types";
import { FormattedAiMessage } from "./FormattedAiMessage";
import { requestForusAiReply } from "../utils/forusChatService";

interface VipHubProps {
  student: StudentProfile;
  onUnlockDemoVip: () => void;
  onRedeemPoints: (cost: number, title: string, voucherId: string) => boolean;
  redeemedVoucherIds: string[];
  aiQuestionsUsed: number;
  maxFreeAiQuestions: number;
  onIncrementAiUsage: () => void;
  onToggleReminder?: (eventId: string, eventTitle: string) => void;
  onSaveEventNote?: (eventId: string, note: string) => void;
  onNavigateToShop: () => void;
  initialSection?: "events" | "chatbot";
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

type FeatureModuleId =
  | "all"
  | "campus-map"
  | "ai-assistant"
  | "latex-snippets"
  | "voucher-hub";

type FloorId = "B1-L1" | "L2" | "L3" | "L4" | "L5-L11";

interface RoomDetail {
  code: string;
  title: string;
  building: string;
  floorLabel: string;
  desc: string;
}

const ROOM_DIRECTORY: Record<string, RoomDetail> = {
  // B1 - L1
  GD2: {
    code: "GĐ 2",
    title: "Giảng đường 2 (Góc Tây Bắc)",
    building: "Khối Giảng đường",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Giảng đường lớn ở góc Tây Bắc khuôn viên, ngay phía trên Tòa H.",
  },
  H: {
    code: "Tòa H",
    title: "Khu nhà H (Góc Tây Bắc)",
    building: "Tòa H",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Khu nhà nối giữa Giảng đường 2 và đầu phía Tây dãy ngang Tòa F.",
  },
  "F.02": {
    code: "F.02",
    title: "Phòng Thông tin – Truyền thông (P. TTTT)",
    building: "Tòa F",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ở đầu phía Tây dãy ngang Tòa F.",
  },
  "F.05": {
    code: "F.05",
    title: "Văn phòng Khoa Sinh học – CNSH",
    building: "Tòa F",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Văn phòng Khoa Sinh học – Công nghệ Sinh học tại dãy ngang Tòa F.",
  },
  "F.08-09": {
    code: "F.08–09",
    title: "Phòng học & Văn phòng Khoa dãy F",
    building: "Tòa F",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Cụm phòng học và phòng chức năng giữa dãy ngang Tòa F.",
  },
  "F.12": {
    code: "F.12",
    title: "Bộ môn Xác suất – Thống kê (Toán – Tin)",
    building: "Tòa F",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ở đầu phía Đông dãy ngang Tòa F.",
  },
  C01: {
    code: "C01",
    title: "Phòng thí nghiệm GIS & Viễn thám",
    building: "Tòa C",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Thuộc Khoa Địa chất, nằm ở đầu phía Bắc dãy dọc Tòa C.",
  },
  C11: {
    code: "C11",
    title: "VPK Môi trường & PTN Địa hóa",
    building: "Tòa C",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Văn phòng Khoa Môi trường ở giữa dãy dọc Tòa C.",
  },
  C12: {
    code: "C12",
    title: "PTN Địa chất biển và Dầu khí",
    building: "Tòa C",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ở cuối phía Nam tầng trệt dãy C.",
  },
  TU_HOC: {
    code: "Khu Tự học",
    title: "Nhà vòm Tự học Sinh viên (Giữa C & B)",
    building: "Khu Giữa C & B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Không gian tự học mái vòm thoáng mát, có trạm nước uống miễn phí và WC.",
  },
  "B.02": {
    code: "B.02",
    title: "Phòng Đào tạo (Giải quyết học vụ, ĐKHP)",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Đi thẳng qua sân Cột cờ, rẽ vào hành lang dãy B bên trái, ở đầu phía Bắc.",
  },
  "B.01": {
    code: "B.01",
    title: "Phòng Kế hoạch – Tài chính & Trạm Y tế",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Đóng học phí, bảo hiểm, khám y tế (đầu Nam Tòa B có cụm ATM).",
  },
  "B.04": {
    code: "B.04",
    title: "Phòng Khảo thí & Đảm bảo Chất lượng",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm tại dãy trung tâm trái Tòa B.",
  },
  "B.07": {
    code: "B.07",
    title: "Phòng Khoa học Công nghệ (KHCN)",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm tại tầng trệt dãy Tòa B.",
  },
  "B.08": {
    code: "B.08",
    title: "Phòng Đào tạo Sau đại học",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm tại tầng trệt dãy Tòa B (sát phòng B11).",
  },
  B11: {
    code: "B11",
    title: "Phòng học / Giảng đường nhỏ B11",
    building: "Tòa B",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ở đầu phía Nam tầng trệt dãy B.",
  },
  SAN_CO: {
    code: "Sân cờ",
    title: "Sân Cột Cờ Trung Tâm (Giữa Tòa B & A)",
    building: "Khu Trung tâm",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Trục sân chính từ Cổng 227 Nguyễn Văn Cừ đi thẳng vào.",
  },
  "A.02": {
    code: "A.02",
    title: "Phòng Công tác Sinh viên (CTSV)",
    building: "Tòa A",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Xin giấy xác nhận SV, học bổng, công tác SV (dãy A bên phải Sân cờ).",
  },
  "A.04": {
    code: "A.04",
    title: "Phòng Quản trị Thiết bị",
    building: "Tòa A",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ở nửa phía Nam tầng trệt dãy A.",
  },
  HOI_TRUONG_I: {
    code: "Hội trường I",
    title: "Hội trường I & Phòng Hội nghị I",
    building: "Tòa I",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Tầng trệt Tòa I góc Tây Nam (sát trục đường chính từ cổng vào).",
  },
  HAM_B1_I: {
    code: "Hầm B1 – I",
    title: "Hầm xe Cán bộ, Giảng viên & Nhân viên",
    building: "Tòa I (Hầm B1)",
    floorLabel: "Tầng Hầm B1",
    desc: "Đi lối cổng phụ bên trái vào hầm dưới Tòa I, kết nối thẳng thang máy.",
  },
  HAM_B1_E: {
    code: "Hầm B1 – E",
    title: "Hầm giữ xe máy Sinh viên (Dưới Tòa E)",
    building: "Tòa E (Hầm B1)",
    floorLabel: "Tầng Hầm B1",
    desc: "Đi cổng phụ bên phải cạnh TT Tin học, chạy thẳng xuống dốc hầm Tòa E.",
  },
  GD1: {
    code: "GĐ 1 & VPTT",
    title: "Giảng đường 1 & Văn phòng Thông tin",
    building: "Khối Giảng đường",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm bên phải trục Cổng chính (góc Đông Nam).",
  },
  TTTH: {
    code: "TT Tin học",
    title: "Trung tâm Tin học (Góc Đông Nam)",
    building: "Khối Đông Nam",
    floorLabel: "Tầng Trệt (L1)",
    desc: "Nằm ngay góc Đông Nam sát lối vào bãi giữ xe sinh viên.",
  },

  // L2
  "F202-206": {
    code: "F202–F206",
    title: "Cụm Giảng đường F202, F203, F205, F206",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Cụm phòng học và giảng đường chính tại nửa Tây tầng L2 dãy F.",
  },
  "F.101-105": {
    code: "F.101–105",
    title: "Phòng Quan hệ Đối ngoại (P. QHĐN)",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Nằm ở giữa dãy ngang Tòa F tầng L2.",
  },
  "F.102": {
    code: "F.102",
    title: "Phòng chuyên đề Khoa Vật lý – VLKT",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Phòng chuyên đề học thuật tại tầng L2 dãy F.",
  },
  "F.106A": {
    code: "F.106A",
    title: "Phòng Tham vấn Tâm lý Sinh viên (PSY.US)",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Hỗ trợ và tư vấn tâm lý sinh viên tại tầng L2 dãy F.",
  },
  "F.107": {
    code: "F.107",
    title: "Phòng Thanh tra – Pháp chế – Sở hữu Trí tuệ",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Nằm cạnh phòng F.106A trên tầng L2 dãy F.",
  },
  "F.113": {
    code: "F.113",
    title: "Văn phòng Khoa / Phòng chuyên môn F.113",
    building: "Tòa F",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Đầu phía Đông tầng L2 dãy ngang Tòa F.",
  },
  C21: {
    code: "C21",
    title: "Phòng thí nghiệm Ngọc học (Khoa Địa chất)",
    building: "Tòa C",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Đầu phía Bắc tầng L2 dãy dọc Tòa C.",
  },
  "C22-23": {
    code: "C22, C23",
    title: "Cụm phòng học lý thuyết C22, C23",
    building: "Tòa C",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Nằm ở giữa tầng L2 dãy Tòa C.",
  },
  C12A: {
    code: "C12A",
    title: "Văn phòng Khoa Địa chất",
    building: "Tòa C",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Đầu phía Nam tầng L2 dãy Tòa C.",
  },
  E204: {
    code: "E204",
    title: "Bộ môn Vật lý Chất rắn (Khoa Vật lý)",
    building: "Tòa E",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Tầng L2 dãy dọc Tòa E (các ô phòng còn lại dọc dãy E để trống).",
  },
  "I23-24": {
    code: "I23, I24",
    title: "Cụm phòng học I23, I24",
    building: "Tòa I",
    floorLabel: "Tầng L2 (Lầu 1)",
    desc: "Nằm về phía Đông của trục thang máy trung tâm Tòa I.",
  },

  // L3
  "F301-304": {
    code: "F301, F303, F304",
    title: "Cụm giảng đường lớn F301, F303, F304",
    building: "Tòa F",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Trải dọc tầng L3 dãy ngang Tòa F.",
  },
  F305: {
    code: "F305",
    title: "Phòng Seminar Khoa Toán – Tin học",
    building: "Tòa F",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Nằm ở phía Đông tầng L3 dãy Tòa F.",
  },
  "C31-33": {
    code: "C31, C32, C33",
    title: "Cụm phòng học lý thuyết C31, C32, C33",
    building: "Tòa C",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Bố trí ở nửa phía Bắc và giữa tầng L3 dãy C.",
  },
  "B37-43": {
    code: "B37, B43",
    title: "Cụm phòng học B37, B43",
    building: "Tòa B",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Nằm ở đầu phía Bắc và khu vực giữa tầng L3 dãy B.",
  },
  "E301-303B": {
    code: "E301, E302, E303B",
    title: "Phòng học E301–E302 & PTN Điện tử E303B",
    building: "Tòa E",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Nằm ở dải giữa tầng L3 dãy dọc Tòa E.",
  },
  E303: {
    code: "E303",
    title: "Bộ môn Vật lý Điện tử",
    building: "Tòa E",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Thuộc Khoa Vật lý – VLKT tại tầng L3 dãy E.",
  },
  "I32-34": {
    code: "I32, I33, I34",
    title: "Cụm phòng học I32, I33, I34 (Tòa I)",
    building: "Tòa I",
    floorLabel: "Tầng L3 (Lầu 2)",
    desc: "Bố trí quanh hành lang phía Đông và Nam cụm thang máy trung tâm Tòa I.",
  },

  // L4 & L5-11
  "C41-43": {
    code: "C41, C43",
    title: "Cụm phòng học C41, C43 (Tầng 4 dãy C)",
    building: "Tòa C",
    floorLabel: "Tầng L4 (Lầu 3)",
    desc: "Tầng cao nhất của dãy nhà C.",
  },
  "B42-44": {
    code: "B42, B44",
    title: "Cụm phòng học B42, B44 (Tầng 4 dãy B)",
    building: "Tòa B",
    floorLabel: "Tầng L4 (Lầu 3)",
    desc: "Tầng cao nhất của dãy nhà B.",
  },
  "E401-404": {
    code: "E401–E404",
    title: "Dãy 4 phòng học E401, E402, E403, E404",
    building: "Tòa E",
    floorLabel: "Tầng L4 (Lầu 3)",
    desc: "Xếp dọc hành lang phía Đông tầng 4 Tòa E.",
  },
  "I42-44": {
    code: "I42, I43, I44",
    title: "Cụm phòng học I42, I43, I44 (Tầng 4 Tòa I)",
    building: "Tòa I",
    floorLabel: "Tầng L4 (Lầu 3)",
    desc: "Bao quanh lõi thang máy trung tâm tầng 4 Tòa I.",
  },
  "L5-I": {
    code: "Tầng L5 (I.53, I59B, I52)",
    title: "VPK CNTT (I.53), VPK Hóa học (I59B) & P. Học I52",
    building: "Tháp Tòa I",
    floorLabel: "Tầng L5 (Tòa I)",
    desc: "Đi thang máy trung tâm Tòa I lên tầng 5: Văn phòng Khoa CNTT & Khoa Hóa học.",
  },
  "L6-I": {
    code: "Tầng L6 (I61, I62, BM THCS)",
    title: "Bộ môn Tin học Cơ sở & Phòng Lab I61, I62",
    building: "Tháp Tòa I",
    floorLabel: "Tầng L6 (Tòa I)",
    desc: "Đi thang máy trung tâm Tòa I lên tầng 6.",
  },
  "L7-I": {
    code: "Tầng L7 (I71, I72, BM MMT)",
    title: "Bộ môn Mạng Máy tính & Phòng Lab I71, I72",
    building: "Tháp Tòa I",
    floorLabel: "Tầng L7 (Tòa I)",
    desc: "Đi thang máy trung tâm Tòa I lên tầng 7.",
  },
  "L9-10-I": {
    code: "Thư viện (L9–L10)",
    title: "Thư viện Trung tâm (Tầng 9 Phòng Đọc · Tầng 10 Học nhóm)",
    building: "Tháp Tòa I",
    floorLabel: "Tầng L9 – L10 (Tòa I)",
    desc: "Đi thang máy trung tâm Tòa I lên tầng 9 và tầng 10.",
  },
  "L11-I": {
    code: "I11 (Tầng 11)",
    title: "Phòng học / Chuyên đề I11 (Tầng cao nhất Tòa I)",
    building: "Tháp Tòa I",
    floorLabel: "Tầng L11 (Tòa I)",
    desc: "Phòng chuyên đề trên tầng 11 của Tòa I.",
  },
};

type LatexCategoryId =
  | "all"
  | "calculus"
  | "linear-algebra"
  | "discrete-prob"
  | "cs-report";

interface LatexTemplateItem {
  id: string;
  category: Exclude<LatexCategoryId, "all">;
  subject: string;
  title: string;
  description: string;
  code: string;
}

const QUICK_LATEX_TEMPLATES: LatexTemplateItem[] = [
  // 1. ĐẠI SỐ TUYẾN TÍNH
  {
    id: "latex-matrix",
    category: "linear-algebra",
    subject: "Đại số tuyến tính (MTH00003)",
    title: "Ma trận 3×3 & Hệ phương trình tuyến tính AX = B",
    description: "Biểu diễn tích ma trận vuông 3×3 với vector ẩn và cột hệ số tự do.",
    code: `\\begin{bmatrix}
  a_{11} & a_{12} & a_{13} \\\\
  a_{21} & a_{22} & a_{23} \\\\
  a_{31} & a_{32} & a_{33}
\\end{bmatrix}
\\begin{bmatrix} x_1 \\\\ x_2 \\\\ x_3 \\end{bmatrix}
=
\\begin{bmatrix} b_1 \\\\ b_2 \\\\ b_3 \\end{bmatrix}`,
  },
  {
    id: "latex-augmented-gauss",
    category: "linear-algebra",
    subject: "Đại số tuyến tính (MTH00003)",
    title: "Ma trận bổ sung [A|B] & Phép biến đổi sơ cấp Gauss",
    description: "Trình bày ma trận mở rộng có vạch ngăn dọc để khử Gauss - Jordan.",
    code: `\\left[\\begin{array}{ccc|c}
  1 & 2 & -1 & 3 \\\\
  0 & 1 & 4 & -2 \\\\
  0 & 0 & 1 & 5
\\end{array}\\right]
\\xrightarrow{R_1 \\leftarrow R_1 - 2R_2}
\\left[\\begin{array}{ccc|c}
  1 & 0 & -9 & 7 \\\\
  0 & 1 & 4 & -2 \\\\
  0 & 0 & 1 & 5
\\end{array}\\right]`,
  },
  {
    id: "latex-eigen-svd",
    category: "linear-algebra",
    subject: "Đại số tuyến tính & Toán cho AI",
    title: "Đa thức đặc trưng, Trị riêng & Phân rã Chéo hóa / SVD",
    description: "Công thức tìm trị riêng λ, chéo hóa ma trận và phân rã giá trị kỳ dị SVD.",
    code: `P(\\lambda) = \\det(A - \\lambda I_n) = \\begin{vmatrix}
  a_{11}-\\lambda & a_{12} \\\\
  a_{21} & a_{22}-\\lambda
\\end{vmatrix} = 0
\\\\[6pt]
A = P D P^{-1}, \\quad A = U \\Sigma V^{T} = \\sum_{i=1}^{r} \\sigma_i u_i v_i^{T}`,
  },
  {
    id: "latex-gram-schmidt",
    category: "linear-algebra",
    subject: "Đại số tuyến tính (MTH00003)",
    title: "Trực giao hóa Gram–Schmidt & Tích vô hướng",
    description: "Công thức xây dựng hệ cơ sở trực chuẩn từ hệ vector độc lập tuyến tính.",
    code: `u_k = v_k - \\sum_{j=1}^{k-1} \\frac{\\langle v_k, u_j \\rangle}{\\|u_j\\|^2} u_j, \\quad e_k = \\frac{u_k}{\\|u_k\\|} \\quad (k = 1, 2, \\dots, n)`,
  },

  // 2. VI TÍCH PHÂN & GIẢI TÍCH
  {
    id: "latex-integral",
    category: "calculus",
    subject: "Vi tích phân 1B / 2B (MTH00001)",
    title: "Tích phân xác định & Khai triển chuỗi Taylor / Maclaurin",
    description: "Công thức Newton-Leibniz và khai triển chuỗi lũy thừa bậc n có phần dư Peano.",
    code: `\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)
\\\\[6pt]
f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}(x - x_0)^k + o\\big((x - x_0)^n\\big)`,
  },
  {
    id: "latex-limit-squeeze",
    category: "calculus",
    subject: "Vi tích phân 1B (MTH00001)",
    title: "Giới hạn, Quy tắc L'Hôpital & Định lý Kẹp",
    description: "Trình bày giới hạn dạng vô định 0/0 và bất đẳng thức Định lý Kẹp.",
    code: `\\lim_{x \\to x_0} \\frac{f(x)}{g(x)} \\xlongequal{\\text{L'H}} \\lim_{x \\to x_0} \\frac{f'(x)}{g'(x)}
\\\\[6pt]
\\begin{cases}
  f(x) \\le g(x) \\le h(x), \\forall x \\in U(x_0) \\\\
  \\lim_{x \\to x_0} f(x) = \\lim_{x \\to x_0} h(x) = L
\\end{cases}
\\Longrightarrow \\lim_{x \\to x_0} g(x) = L`,
  },
  {
    id: "latex-multivariable-jacobian",
    category: "calculus",
    subject: "Vi tích phân 2B (MTH00002)",
    title: "Đạo hàm riêng, Vector Gradient & Định thức Jacobian",
    description: "Toán tử Nabla, ma trận Hessian và đổi biến tích phân bội hai trong tọa độ cực.",
    code: `\\nabla f(x,y,z) = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z} \\right), \\quad
\\frac{D(x,y)}{D(r,\\varphi)} = \\begin{vmatrix}
  \\cos\\varphi & -r\\sin\\varphi \\\\
  \\sin\\varphi & r\\cos\\varphi
\\end{vmatrix} = r
\\\\[6pt]
\\iint_{D} f(x,y)\\,dx\\,dy = \\int_{\\alpha}^{\\beta} d\\varphi \\int_{r_1(\\varphi)}^{r_2(\\varphi)} f(r\\cos\\varphi, r\\sin\\varphi)\\,r\\,dr`,
  },
  {
    id: "latex-ode-green",
    category: "calculus",
    subject: "Vi tích phân 2B & Phương trình vi phân",
    title: "Công thức Green, Tích phân đường & Phương trình vi phân",
    description: "Liên hệ giữa tích phân đường loại 2 trên biên kín và tích phân kép trên miền phẳng.",
    code: `\\oint_{\\partial D^{+}} P(x,y)\\,dx + Q(x,y)\\,dy = \\iint_{D} \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dx\\,dy
\\\\[6pt]
y'' + p(x)y' + q(x)y = g(x), \\quad y(x) = y_{\\text{th}}(x) + y_{\\text{riêng}}(x)`,
  },

  // 3. TOÁN RỜI RẠC & XÁC SUẤT THỐNG KÊ
  {
    id: "latex-piecewise-recurrence",
    category: "discrete-prob",
    subject: "Toán rời rạc (MTH00041) & Giải thuật",
    title: "Hàm phân từng khúc (Cases) & Hệ thức truy hồi Master Theorem",
    description: "Biểu diễn hàm xác định trên từng miền và độ phức tạp thuật toán chia để trị.",
    code: `T(n) = \\begin{cases}
  \\Theta(1) & \\text{nếu } n = 1, \\\\
  a\\,T\\!\\left(\\dfrac{n}{b}\\right) + \\Theta(n^d) & \\text{nếu } n > 1.
\\end{cases}`,
  },
  {
    id: "latex-bayes-normal",
    category: "discrete-prob",
    subject: "Xác suất thống kê (MTH00040)",
    title: "Công thức Xác suất đầy đủ, Định lý Bayes & Phân phối Chuẩn",
    description: "Công thức Bayes, kỳ vọng, phương sai và hàm mật độ phân phối chuẩn Gauss.",
    code: `P(A_k \\mid B) = \\frac{P(A_k)\\,P(B \\mid A_k)}{\\sum_{i=1}^{n} P(A_i)\\,P(B \\mid A_i)}
\\\\[6pt]
f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\!\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right), \\quad X \\sim \\mathcal{N}(\\mu, \\sigma^2)`,
  },
  {
    id: "latex-truth-table",
    category: "discrete-prob",
    subject: "Toán rời rạc (MTH00041)",
    title: "Bảng chân trị Logic mệnh đề & Phép suy diễn",
    description: "Bảng chân trị chuẩn cho các phép toán hội, tuyển, kéo theo và tương đương logic.",
    code: `\\begin{tabular}{|c|c|c|c|c|}
\\hline
$p$ & $q$ & $p \\land q$ & $p \\lor q$ & $p \\to q$ \\\\ \\hline
T & T & T & T & T \\\\
T & F & F & T & F \\\\
F & T & F & T & T \\\\
F & F & F & F & T \\\\ \\hline
\\end{tabular}`,
  },
  {
    id: "latex-induction-proof",
    category: "discrete-prob",
    subject: "Toán rời rạc & Giải tích",
    title: "Khung trình bày Định lý & Chứng minh Quy nạp (amsthm)",
    description: "Cấu trúc chuẩn trình bày bài giải tự luận bằng quy nạp toán học có ký hiệu Q.E.D.",
    code: `\\begin{theorem}
Với mọi số nguyên dương $n \\ge 1$, ta có: $\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}$.
\\end{theorem}
\\begin{proof}
\\textbf{Bước 1 (Cơ sở):} Với $n=1$, $VT = 1^2 = 1 = \\frac{1\\cdot 2\\cdot 3}{6} = VP$ (đúng).\\\\
\\textbf{Bước 2 (Giả thiết quy nạp):} Giả sử mệnh đề đúng với $n = k \\ge 1$.\\\\
\\textbf{Bước 3 (Bước quy nạp):} Ta chứng minh mệnh đề đúng với $n = k+1$:
\\[ \\sum_{i=1}^{k+1} i^2 = \\frac{k(k+1)(2k+1)}{6} + (k+1)^2 = \\frac{(k+1)(k+2)(2k+3)}{6}. \\]
Vậy mệnh đề đúng với mọi $n \\ge 1$.
\\end{proof}`,
  },

  // 4. BÁO CÁO ĐỒ ÁN & THUẬT TOÁN CNTT
  {
    id: "latex-report",
    category: "cs-report",
    subject: "Nhập môn CNTT / Đồ án (CSC00006)",
    title: "Khung Trang Bìa Báo Cáo Đồ Án Khoa CNTT - HCMUS",
    description: "Mẫu trang bìa đóng khung chuẩn Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM.",
    code: `\\documentclass[12pt,a4paper]{report}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amsfonts,amssymb,graphicx,geometry}
\\geometry{a4paper, margin=2.5cm}

\\begin{document}
\\begin{titlepage}
  \\centering
  \\textbf{ĐẠI HỌC QUỐC GIA TP. HỒ CHÍ MINH}\\\\
  \\textbf{TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN}\\\\
  \\textbf{KHOA CÔNG NGHỆ THÔNG TIN}\\\\[2cm]
  {\\huge \\textbf{BÁO CÁO ĐỒ ÁN MÔN HỌC}}\\\\[0.8cm]
  {\\Large \\textbf{Đề tài: Ứng Dụng Thuật Toán & Cấu Trúc Dữ Liệu}}\\\\[1.5cm]
  \\begin{tabular}{ll}
    \\textbf{Giảng viên hướng dẫn:} & TS. Nguyễn Văn A \\\\
    \\textbf{Sinh viên thực hiện:} & Nguyễn Văn B - MSSV: 24120001 \\\\
    \\textbf{Lớp / Học kỳ:} & 24CTT1 - Học kỳ 1 (2026 - 2027)
  \\end{tabular}
  \\vfill
  {\\large TP. Hồ Chí Minh, Tháng 11/2026}
\\end{titlepage}
\\end{document}`,
  },
  {
    id: "latex-pseudocode",
    category: "cs-report",
    subject: "Cấu trúc dữ liệu & Giải thuật (CSC10004)",
    title: "Trình bày Mã giả Thuật toán Dijkstra / Binary Search (algorithm2e)",
    description: "Khung viết mã giả thuật toán có đánh số dòng, Input/Output chuẩn báo cáo CNTT.",
    code: `\\usepackage[ruled,vlined,linesnumbered]{algorithm2e}

\\begin{algorithm}[H]
\\DontPrintSemicolon
\\KwIn{Mảng đã sắp xếp $A[0..n-1]$ và giá trị cần tìm $x$}
\\KwOut{Chỉ số $i$ sao cho $A[i] = x$, hoặc $-1$ nếu không tìm thấy}
$left \\leftarrow 0$, $right \\leftarrow n - 1$\\;
\\While{$left \\le right$}{
  $mid \\leftarrow left + \\lfloor (right - left) / 2 \\rfloor$\\;
  \\If{$A[mid] == x$}{
    \\Return{$mid$}\\;
  }
  \\eIf{$A[mid] < x$}{
    $left \\leftarrow mid + 1$\\;
  }{
    $right \\leftarrow mid - 1$\\;
  }
}
\\Return{$-1$}\\;
\\caption{Thuật toán Tìm kiếm Nhị phân $O(\\log n)$}
\\end{algorithm}`,
  },
  {
    id: "latex-cpp-listings",
    category: "cs-report",
    subject: "Nhập môn lập trình & OOP (CSC10001)",
    title: "Chèn Code C++ / Python Tô Màu Cú Pháp (Gói listings)",
    description: "Định dạng chèn source code C++/Python có số dòng, viền khung và tô màu từ khóa.",
    code: `\\usepackage{listings,xcolor}
\\lstset{
  language=C++,
  basicstyle=\\ttfamily\\small,
  keywordstyle=\\color{blue}\\bfseries,
  commentstyle=\\color{gray}\\itshape,
  numbers=left,
  numberstyle=\\tiny\\color{gray},
  frame=single,
  breaklines=true
}

\\begin{lstlisting}[caption={Cài đặt thuật toán QuickSort trong C++}]
void quickSort(vector<int>& a, int l, int r) {
    if (l >= r) return;
    int pivot = a[l + (r - l) / 2];
    // Phan hoach mang quanh chot pivot
}
\\end{lstlisting}`,
  },
  {
    id: "latex-booktabs-table",
    category: "cs-report",
    subject: "Thực hành Vật lý / Hóa học / Thực nghiệm AI",
    title: "Bảng Số Liệu Thực Nghiệm Chuẩn Bài Báo Khoa Học (booktabs)",
    description: "Bảng so sánh kết quả thực nghiệm (Accuracy, F1-Score, Thời gian chạy) chuẩn IEEE/Springer.",
    code: `\\usepackage{booktabs}

\\begin{table}[htbp]
  \\centering
  \\caption{So sánh hiệu năng các mô hình trên tập dữ liệu kiểm thử}
  \\begin{tabular}{lccc}
    \\toprule
    \\textbf{Mô hình / Thuật toán} & \\textbf{Accuracy (\\%)} & \\textbf{F1-Score} & \\textbf{Thời gian (ms)} \\\\
    \\midrule
    Logistic Regression (Baseline) & 88.4 & 0.879 & 12.4 \\\\
    Random Forest (100 trees)      & 92.1 & 0.918 & 45.2 \\\\
    \\textbf{Phương pháp đề xuất (Ours)} & \\textbf{95.8} & \\textbf{0.956} & \\textbf{18.7} \\\\
    \\bottomrule
  \\end{tabular}
  \\label{tab:benchmark}
\\end{table}`,
  },
  {
    id: "latex-subfigure",
    category: "cs-report",
    subject: "Báo cáo Đồ án & Khóa luận Tốt nghiệp",
    title: "Chèn 2 Hình Ảnh Song Song Có Nhãn Phụ (subcaption)",
    description: "Đặt 2 biểu đồ hoặc ảnh kết quả cạnh nhau (a) và (b) trong báo cáo khoa học.",
    code: `\\usepackage{graphicx,subcaption}

\\begin{figure}[htbp]
  \\centering
  \\begin{subfigure}[b]{0.48\\textwidth}
    \\centering
    \\includegraphics[width=\\textwidth]{loss_curve.png}
    \\caption{Đường cong hàm mất mát (Loss)}
    \\label{fig:loss}
  \\end{subfigure}
  \\hfill
  \\begin{subfigure}[b]{0.48\\textwidth}
    \\centering
    \\includegraphics[width=\\textwidth]{accuracy_curve.png}
    \\caption{Độ chính xác theo Epoch (Accuracy)}
    \\label{fig:acc}
  \\end{subfigure}
  \\caption{Kết quả huấn luyện mô hình sau 50 epochs tại phòng Lab Tòa I.}
  \\label{fig:training_results}
\\end{figure}`,
  },
  {
    id: "latex-beamer-slide",
    category: "cs-report",
    subject: "Thuyết trình Seminar & Đồ án KHTN",
    title: "Khung Slide Thuyết Trình Học Thuật (Beamer Madrid Theme)",
    description: "Mẫu tạo slide thuyết trình chuyên nghiệp có chia 2 cột và khối định lý nổi bật.",
    code: `\\documentclass[aspectratio=169]{beamer}
\\usetheme{Madrid}
\\usecolortheme{whale}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath,amssymb}

\\title[Đồ án KHTN]{Báo Cáo Seminar Khoa Học Máy Tính}
\\author{Nhóm Sinh Viên KHTN - Cơ sở 1 (227 NVC)}
\\institute{Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM}
\\date{\\today}

\\begin{document}
\\begin{frame}
  \\titlepage
\\end{frame}

\\begin{frame}{Nội dung trọng tâm & Đóng góp}
  \\begin{block}{Mục tiêu bài toán}
    Tối ưu hóa độ phức tạp thời gian từ $O(n^2)$ xuống $O(n \\log n)$.
  \\end{block}
\\end{frame}
\\end{document}`,
  },
];

export const VipHub: React.FC<VipHubProps> = ({
  student,
  onUnlockDemoVip,
  onRedeemPoints,
  redeemedVoucherIds,
  aiQuestionsUsed,
  maxFreeAiQuestions,
  onIncrementAiUsage,
  onNavigateToShop,
}) => {
  const isVipUnlocked = student.points >= 100;
  const remainingFreeQuestions = Math.max(
    0,
    maxFreeAiQuestions - aiQuestionsUsed
  );
  const isAiLimitReached =
    !isVipUnlocked && aiQuestionsUsed >= maxFreeAiQuestions;

  const membershipTierLabel =
    student.points >= 100
      ? "Hạng Đặc Quyền 100đ (Đã mở khóa)"
      : student.points >= 50
      ? "Hạng Bạc FORUS"
      : "Hạng Tiêu Chuẩn";

  const [activeModule, setActiveModule] = useState<FeatureModuleId>("all");
  const [selectedFloor, setSelectedFloor] = useState<FloorId>("B1-L1");
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>("B.02");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [selectedLatexCategory, setSelectedLatexCategory] =
    useState<LatexCategoryId>("all");
  const [latexSearchQuery, setLatexSearchQuery] = useState("");

  const activeRoomDetail =
    ROOM_DIRECTORY[selectedRoomKey] || ROOM_DIRECTORY["B.02"];

  const switchFloor = (fl: FloorId, defaultKey?: string) => {
    setSelectedFloor(fl);
    if (defaultKey) {
      setSelectedRoomKey(defaultKey);
      return;
    }
    if (fl === "B1-L1") setSelectedRoomKey("B.02");
    if (fl === "L2") setSelectedRoomKey("F202-206");
    if (fl === "L3") setSelectedRoomKey("F301-304");
    if (fl === "L4") setSelectedRoomKey("C41-43");
    if (fl === "L5-L11") setSelectedRoomKey("L5-I");
  };

  const searchMatches = searchQuery.trim()
    ? Object.entries(ROOM_DIRECTORY).filter(
        ([, r]) =>
          r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.building.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-ai",
      role: "model",
      text: `Chào ${
        student.fullName || "bạn sinh viên KHTN"
      }! Mình là **Trợ lý AI FORUS** tại Cơ sở 1 (227 Nguyễn Văn Cừ).\n\nMình có thể hỗ trợ bạn ngay:\n• Giải chi tiết các bài toán **Vi tích phân 1B/2B, Đại số tuyến tính, Toán rời rạc, Xác suất thống kê** với công thức hiển thị trực quan\n• Viết & gỡ lỗi code **C/C++, Python, Cấu trúc dữ liệu & Giải thuật**\n• Tư vấn học tập, đời sống sinh viên, bảng giá thuê học cụ, in ấn A5–A1 & Kho Voucher FORUS.`,
      timestamp: "Vừa xong",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  const handleCopySnippet = (id: string, code: string, title: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedSnippetId(id);
      showToast(`Đã sao chép mẫu LaTeX: "${title}"`);
      setTimeout(() => setCopiedSnippetId(null), 2500);
    }
  };

  const handleSendChat = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? chatInput).trim();
    if (!textToSend || isSending) return;

    if (!isVipUnlocked && aiQuestionsUsed >= maxFreeAiQuestions) {
      showToast(
        `🔒 Bạn đã dùng hết ${maxFreeAiQuestions}/${maxFreeAiQuestions} câu hỏi miễn phí! Hãy tích đủ 100 điểm hoặc kích hoạt nhanh 100đ để hỏi Trợ lý AI không giới hạn.`
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: `limit-${Date.now()}`,
          role: "model",
          text: `🔒 **Đã hết lượt hỏi thử (${maxFreeAiQuestions}/${maxFreeAiQuestions} câu):** Tài khoản của bạn hiện đang ở **${membershipTierLabel} (${student.points}/100 điểm)**.\n\nKhi chưa đạt 100 điểm, bạn được hỏi tối đa ${maxFreeAiQuestions} câu. Hãy **mua/thuê học cụ tích đủ 100 điểm** hoặc bấm nút **Kích hoạt nhanh 100đ** để mở khóa hỏi đáp AI không giới hạn nhé!`,
          timestamp: "Hệ thống FORUS",
        },
      ]);
      return;
    }

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
      const replyContent = await requestForusAiReply({
        message: textToSend,
        history: currentHistory.map((m) => ({ role: m.role, text: m.text })),
        studentInfo: {
          fullName: student.fullName,
          studentId: student.studentId,
          email: student.email,
          faculty: student.faculty,
          points: student.points,
        },
      });

      onIncrementAiUsage();

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
          text: "Hiện tại hệ thống đang bận, bạn vui lòng thử lại sau giây lát nhé!",
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
        text: `Đã làm mới cuộc trò chuyện! Bạn muốn mình hỗ trợ giải bài tập đại cương, viết công thức LaTeX hay tư vấn học cụ tại ĐH KHTN?`,
        timestamp: "Vừa xong",
      },
    ]);
  };

  const ringIfSelected = (key: string) =>
    selectedRoomKey === key
      ? "ring-2 ring-slate-950 dark:ring-white scale-[1.02] z-10 shadow-md"
      : "hover:brightness-95";

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* 1. TOP HEADER BANNER & STUDENT POINTS STATUS CARD */}
      <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-5 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 lg:col-span-7 min-w-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2545] sm:text-4xl dark:text-white leading-[1.18] break-words">
              Trung Tâm Tính Năng &amp; Tiện Ích Số FORUS
            </h2>
            <p className="text-xs sm:text-base leading-relaxed text-[#4A5568] dark:text-slate-300 break-words">
              Tích hợp các công cụ thiết thực dành cho sinh viên{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 NVC)
              </strong>
              : tra cứu trực quan{" "}
              <strong className="font-bold text-[#D95326] dark:text-amber-400">
                Sơ đồ chỉ dẫn các tầng (B1 – L11)
              </strong>
              , hỏi đáp{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Trợ lý AI FORUS
              </strong>
              , sao chép{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Mẫu code LaTeX
              </strong>{" "}
              và đổi điểm nhận{" "}
              <strong className="font-bold text-[#0B2545] dark:text-white">
                Voucher ưu đãi
              </strong>
              .
            </p>
          </div>

          {/* Right White Status & Policy Card */}
          <div className="rounded-2xl border border-[#E6E0D5] bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <p className="font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#64748B] dark:text-slate-400">
                {membershipTierLabel}
              </p>
              <span className="font-mono text-xs sm:text-sm font-extrabold text-[#D95326] dark:text-amber-400">
                {student.points} / 100 điểm
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#EFECE6] dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#0B2545] dark:bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(100, student.points)}%` }}
              />
            </div>

            <div className="mt-3.5 divide-y divide-[#EAE5DC] text-xs dark:divide-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-1 py-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Khi in ấn, thuê học cụ, kết nối gia sư:
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Cộng +5 đến +10 điểm
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 py-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Khi đổi điểm lấy Voucher ưu đãi:
                </span>
                <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                  Trừ điểm tương ứng
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2">
                <span className="text-[#4A5568] dark:text-slate-300">
                  Quyền hỏi Trợ lý AI không giới hạn (100đ):
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
                    <Zap className="h-3 w-3 shrink-0" />
                    <span>Kích hoạt nhanh 100đ</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPACT MOBILE-FIRST FEATURE MODULE SELECTOR */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#D95326] shrink-0" />
            <h3 className="text-sm sm:text-lg font-extrabold text-[#0B2545] dark:text-white truncate">
              Chọn Nhanh Tính Năng
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setActiveModule("all")}
            className={`rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-extrabold transition cursor-pointer shrink-0 ${
              activeModule === "all"
                ? "bg-[#0B2545] text-white shadow-2xs dark:bg-amber-400 dark:text-slate-950"
                : "border border-[#E5DEC9] bg-white text-[#4A5568] hover:text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {activeModule === "all" ? "✓ Đang hiện tất cả" : "Hiện tất cả (4)"}
          </button>
        </div>

        {/* 2x2 Grid on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {[
            {
              id: "campus-map" as FeatureModuleId,
              icon: <Map className="w-4 h-4" />,
              iconBg: "bg-[#0B2545] text-emerald-300",
              badge: "B1–L11",
              title: "Sơ Đồ Tầng CS1",
              desc: "Mặt bằng các tòa F, C, B, A, E, I",
            },
            {
              id: "ai-assistant" as FeatureModuleId,
              icon: <Bot className="w-4 h-4" />,
              iconBg: "bg-[#0B2545] text-amber-300",
              badge: "AI 24/7",
              title: "Trợ Lý AI Học Tập",
              desc: "Giải toán đại cương, code & LaTeX",
            },
            {
              id: "latex-snippets" as FeatureModuleId,
              icon: <Code2 className="w-4 h-4" />,
              iconBg: "bg-[#0B2545] text-sky-300",
              badge: "18 mẫu",
              title: "Khung Code LaTeX",
              desc: "Copy 1 chạm ma trận, tích phân, đồ án",
            },
            {
              id: "voucher-hub" as FeatureModuleId,
              icon: <Gift className="w-4 h-4" />,
              iconBg: "bg-[#D95326] text-white",
              badge: `${student.points}đ`,
              title: "Đổi Điểm Voucher",
              desc: "Đổi mã giảm giá in ấn & thuê học cụ",
            },
          ].map((mod) => {
            const isSelected = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() =>
                  setActiveModule(isSelected ? "all" : mod.id)
                }
                className={`text-left rounded-2xl border p-3 sm:p-4 transition cursor-pointer flex flex-col justify-between min-w-0 ${
                  isSelected
                    ? "border-[#D95326] bg-white shadow-sm ring-1 ring-[#D95326] dark:bg-slate-800"
                    : "border-[#E6E0D5] bg-white/95 hover:border-[#0B2545]/40 dark:border-slate-700 dark:bg-slate-800/80"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${mod.iconBg} flex items-center justify-center shrink-0`}
                    >
                      {mod.icon}
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#64748B] dark:text-slate-400 truncate">
                      {mod.badge}
                    </span>
                  </div>
                  <h4 className="mt-2.5 text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white leading-snug truncate">
                    {mod.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#64748B] dark:text-slate-300 leading-snug line-clamp-1 sm:line-clamp-2">
                    {mod.desc}
                  </p>
                </div>
                <span className="mt-2 inline-block font-mono text-[10px] sm:text-[11px] font-bold text-[#D95326] dark:text-amber-400 truncate">
                  {isSelected ? "Đang mở · Chạm để thu gọn" : "Mở tính năng →"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 3. MODULE 1: SƠ ĐỒ CHỈ DẪN CÁC TẦNG (EXACT BUILDING FRAMES FROM PDF) ================= */}
      {(activeModule === "all" || activeModule === "campus-map") && (
        <section className="rounded-3xl border border-[#E5DEC9] bg-white p-4 sm:p-7 shadow-2xs dark:border-slate-700/80 dark:bg-slate-900 space-y-4">
          {/* Top Bar: Title + Search Input */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C81E32] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-extrabold text-[#0B2545] dark:text-white">
                  Sơ Đồ Chỉ Dẫn Các Tầng &amp; Danh Bạ Phòng Ban (CS1 · 227 Nguyễn Văn Cừ)
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Bấm chọn từng tầng hoặc bấm trực tiếp vào ô phòng trên mặt bằng để xem thông tin
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh: B.02, A.02, I.53, F202..."
                className="w-full rounded-xl border border-[#DDD6C7] bg-[#FAF8F5] py-2 pr-3 pl-8.5 text-xs font-semibold text-[#0B2545] focus:border-[#C81E32] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Search Results */}
          {searchQuery.trim() && (
            <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EFE6] p-3 dark:border-slate-700 dark:bg-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-[#0B2545] dark:text-white mr-1">
                Kết quả ({searchMatches.length}):
              </span>
              {searchMatches.map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (item.floorLabel.includes("Trệt") || item.floorLabel.includes("Hầm"))
                      setSelectedFloor("B1-L1");
                    else if (item.floorLabel.includes("L2")) setSelectedFloor("L2");
                    else if (item.floorLabel.includes("L3")) setSelectedFloor("L3");
                    else if (item.floorLabel.includes("L4")) setSelectedFloor("L4");
                    else setSelectedFloor("L5-L11");
                    setSelectedRoomKey(key);
                    setSearchQuery("");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-[#DDD6C7] dark:border-slate-700 text-xs font-bold text-[#0B2545] dark:text-white hover:border-[#C81E32] cursor-pointer"
                >
                  <span className="font-mono text-[#C81E32] dark:text-amber-400">
                    {item.code}
                  </span>{" "}
                  · {item.floorLabel}
                </button>
              ))}
            </div>
          )}

          {/* PDF-STYLE FLOOR TABS ROW (Centered Rectangular Tabs like in PDF) */}
          <div className="pt-1 flex flex-col items-center space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "B1-L1" as FloorId, label: "Tầng B1–L1" },
                { id: "L2" as FloorId, label: "Tầng L2" },
                { id: "L3" as FloorId, label: "Tầng L3" },
                { id: "L4" as FloorId, label: "Tầng L4" },
                { id: "L5-L11" as FloorId, label: "Tầng L5–L11" },
              ].map((tab) => {
                const active = selectedFloor === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => switchFloor(tab.id)}
                    className={`min-w-[104px] sm:min-w-[120px] py-2 px-4 rounded-md border text-xs sm:text-sm font-bold transition cursor-pointer ${
                      active
                        ? "bg-[#C81E32] border-[#A01425] text-white shadow-xs"
                        : "bg-white border-slate-300 text-slate-700 hover:border-[#C81E32] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* BOLD CENTERED FLOOR HEADER MATCHING PDF */}
            <h4 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase text-center">
              {selectedFloor === "B1-L1" && "TẦNG TRỆT (L1) & HẦM B1"}
              {selectedFloor === "L2" && "TẦNG L2 (LẦU 1)"}
              {selectedFloor === "L3" && "TẦNG L3 (LẦU 2)"}
              {selectedFloor === "L4" && "TẦNG L4 (LẦU 3)"}
              {selectedFloor === "L5-L11" && "TẦNG L4 & TẦNG L5–L11 (TÒA I)"}
            </h4>
          </div>

          {/* OUTER RED-BORDERED MAP CONTAINER (MATCHES FIGURES 1, 2, 3, 4 IN PDF) */}
          <div className="relative rounded-[26px] border-[2.5px] border-[#C81E32] bg-white dark:bg-slate-900 overflow-hidden shadow-md">
            {/* Top-Left Red Corner Ribbon Badge (e.g., "Tầng L2", "Tầng L3") */}
            <div className="bg-[#C81E32] text-white font-bold text-xs sm:text-sm px-5 py-1.5 inline-block rounded-br-2xl shadow-xs">
              {selectedFloor === "B1-L1" && "Tầng B1 – L1"}
              {selectedFloor === "L2" && "Tầng L2"}
              {selectedFloor === "L3" && "Tầng L3"}
              {selectedFloor === "L4" && "Tầng L4"}
              {selectedFloor === "L5-L11" && "Tầng L5 – L11"}
            </div>

            <div className="p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* ================= LEFT 8 COLS: EXACT 2D ARCHITECTURAL FOOTPRINT ================= */}
              <div className="lg:col-span-8 rounded-2xl bg-[#F2F1EC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 sm:p-4 flex flex-col justify-between overflow-x-auto">
                <div className="min-w-[540px] space-y-2.5">
                  {/* ROW 1: GĐ 2 (Top Left) + DÃY NGANG TÒA F (North Horizontal Bar) */}
                  <div className="grid grid-cols-12 gap-2 items-end">
                    {/* Left Column Top: GĐ 2 & H */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRoomKey("GD2")}
                        className={`h-9 rounded border flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                          selectedFloor === "B1-L1"
                            ? "bg-[#E99695] border-[#B85D5C] text-slate-900"
                            : "bg-[#D5D5D2] border-slate-400 text-slate-600"
                        } ${ringIfSelected("GD2")}`}
                      >
                        GĐ 2
                      </button>
                      {selectedFloor === "B1-L1" && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoomKey("H")}
                          className={`h-7 rounded border bg-[#E99695] border-[#B85D5C] text-slate-900 flex items-center justify-center font-bold text-xs transition cursor-pointer ${ringIfSelected(
                            "H"
                          )}`}
                        >
                          H
                        </button>
                      )}
                    </div>

                    {/* Right 10 Cols: DÃY NGANG TÒA F */}
                    <div className="col-span-10">
                      {selectedFloor === "B1-L1" && (
                        <div className="grid grid-cols-12 border border-[#B85D5C] bg-[#E99695] rounded overflow-hidden text-slate-900 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.02")}
                            className={`col-span-2 py-2 border-r border-[#B85D5C] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.02"
                            )}`}
                          >
                            <span>F.02</span>
                            <span className="text-[9px] font-semibold">P. TTTT</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.05")}
                            className={`col-span-3 py-2 border-r border-[#B85D5C] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.05"
                            )}`}
                          >
                            <span>F.05</span>
                            <span className="text-[9px] font-semibold">VPK Sinh học</span>
                          </button>
                          <div className="col-span-3 py-2 border-r border-[#B85D5C] flex items-center justify-center font-black text-sm">
                            TÒA F
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.08-09")}
                            className={`col-span-2 py-2 border-r border-[#B85D5C] flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.08-09"
                            )}`}
                          >
                            F.08-09
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.12")}
                            className={`col-span-2 py-2 flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.12"
                            )}`}
                          >
                            F.12
                          </button>
                        </div>
                      )}

                      {selectedFloor === "L2" && (
                        <div className="grid grid-cols-12 border border-slate-400 rounded overflow-hidden text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F202-206")}
                            className={`col-span-4 py-2.5 bg-[#D94362] text-white border-r border-white/40 flex items-center justify-around px-1 cursor-pointer ${ringIfSelected(
                              "F202-206"
                            )}`}
                          >
                            <span>F202</span>
                            <span>F203</span>
                            <span>F205</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.101-105")}
                            className={`col-span-2 py-2 bg-[#F4C430] text-slate-900 border-r border-slate-400 flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.101-105"
                            )}`}
                          >
                            <span>F.101-105</span>
                            <span className="text-[8px]">P. QHĐN</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.102")}
                            className={`col-span-1 py-2 bg-[#D94362] text-white border-r border-white/40 flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.102"
                            )}`}
                          >
                            F.102
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.106A")}
                            className={`col-span-2 py-2 bg-[#F4C430] text-slate-900 border-r border-slate-400 flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.106A"
                            )}`}
                          >
                            <span>F.106A</span>
                            <span className="text-[8px]">Tâm lý</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.107")}
                            className={`col-span-2 py-2 bg-[#F4C430] text-slate-900 border-r border-slate-400 flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.107"
                            )}`}
                          >
                            <span>F.107</span>
                            <span className="text-[8px]">Thanh tra</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F.113")}
                            className={`col-span-1 py-2 bg-[#D94362] text-white flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F.113"
                            )}`}
                          >
                            F.113
                          </button>
                        </div>
                      )}

                      {selectedFloor === "L3" && (
                        <div className="grid grid-cols-12 border border-slate-400 bg-[#C8C8C5] rounded overflow-hidden text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F301-304")}
                            className={`col-span-4 py-2 bg-[#C8234B] text-white border-r border-white/40 flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F301-304"
                            )}`}
                          >
                            F301
                          </button>
                          <div className="col-span-1 bg-[#C8C8C5]" />
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F301-304")}
                            className={`col-span-3 py-2 bg-[#C8234B] text-white border-x border-white/40 flex items-center justify-around cursor-pointer ${ringIfSelected(
                              "F301-304"
                            )}`}
                          >
                            <span>F303</span>
                            <span>F304</span>
                          </button>
                          <div className="col-span-1 bg-[#C8C8C5]" />
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("F305")}
                            className={`col-span-3 py-2 bg-[#C8234B] text-white flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "F305"
                            )}`}
                          >
                            F305
                          </button>
                        </div>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <div className="h-9 rounded bg-[#C8C8C5] border border-slate-400 flex items-center justify-center font-bold text-xs text-slate-600">
                          F (Dãy F chỉ có đến Tầng L3)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ROW 2: 4 CENTRAL PARALLEL WINGS (TÒA C — Tự học — TÒA B — Sân cờ — TÒA A — TÒA E) */}
                  <div className="grid grid-cols-12 gap-2 items-stretch min-h-[175px]">
                    {/* Leftmost Perimeter Strip (Gray blocks under GĐ 2) */}
                    <div className="col-span-2 flex flex-col gap-2">
                      <div className="flex-1 rounded bg-[#D5D5D2] border border-slate-400" />
                      <div className="flex-1 rounded bg-[#D5D5D2] border border-slate-400" />
                    </div>

                    {/* DÃY DỌC TÒA C (2 Cols) */}
                    <div className="col-span-2 flex flex-col border border-slate-400 rounded overflow-hidden bg-[#D5D5D2]">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C01")}
                            className={`flex-1 bg-[#E99695] border-b border-slate-400 font-bold text-xs text-slate-900 flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C01"
                            )}`}
                          >
                            C01
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C11")}
                            className={`flex-1 bg-[#F4C430] border-b border-slate-400 font-bold text-xs text-slate-900 flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C11"
                            )}`}
                          >
                            C11
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C12")}
                            className={`flex-1 bg-[#2A8B8B] font-bold text-xs text-white flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C12"
                            )}`}
                          >
                            C12
                          </button>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C21")}
                            className={`flex-1 bg-[#D94362] text-white border-b border-white/40 font-bold text-[10px] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "C21"
                            )}`}
                          >
                            <span>C21</span>
                            <span className="text-[8px]">PTN Ngọc học</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C22-23")}
                            className={`flex-1 bg-[#D94362] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C22-23"
                            )}`}
                          >
                            C22
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C22-23")}
                            className={`flex-1 bg-[#D94362] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C22-23"
                            )}`}
                          >
                            C23
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C12A")}
                            className={`flex-1 bg-[#F4C430] text-slate-900 font-bold text-[10px] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "C12A"
                            )}`}
                          >
                            <span>C12A</span>
                            <span className="text-[8px]">VPK Địa chất</span>
                          </button>
                        </>
                      )}

                      {selectedFloor === "L3" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C31-33")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C31-33"
                            )}`}
                          >
                            C31
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C31-33")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C31-33"
                            )}`}
                          >
                            C32
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C31-33")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C31-33"
                            )}`}
                          >
                            C33
                          </button>
                          <div className="h-6 bg-[#C8C8C5]" />
                        </>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          <div className="py-1 bg-[#C8234B] text-white text-center font-black text-xs border-b border-white/30">
                            C
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C41-43")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C41-43"
                            )}`}
                          >
                            C41
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("C41-43")}
                            className={`flex-1 bg-[#C8234B] text-white font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "C41-43"
                            )}`}
                          >
                            C43
                          </button>
                        </>
                      )}
                    </div>

                    {/* KHU GIỮA C & B (Nhà vòm Tự học) */}
                    <div className="col-span-2 flex flex-col items-center justify-center bg-[#E7E4DC] rounded border border-slate-300 p-1.5 text-center">
                      {selectedFloor === "B1-L1" ? (
                        <>
                          <span className="font-black text-xs text-slate-900 mb-1">
                            TÒA B
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("TU_HOC")}
                            className={`w-16 h-16 rounded-full bg-[#8CC6C6] border-2 border-[#3A7D7D] flex items-center justify-center font-extrabold text-xs text-slate-900 shadow-xs cursor-pointer ${ringIfSelected(
                              "TU_HOC"
                            )}`}
                          >
                            Tự học
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                          Vòm Tự học
                        </span>
                      )}
                    </div>

                    {/* DÃY DỌC TÒA B (2 Cols) */}
                    <div className="col-span-2 flex flex-col border border-slate-400 rounded overflow-hidden bg-[#D5D5D2]">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B.02")}
                            className={`py-1 bg-[#E99695] border-b border-slate-400 text-[9px] font-bold text-slate-900 cursor-pointer ${ringIfSelected(
                              "B.02"
                            )}`}
                          >
                            B.02 P.Đào tạo
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B.01")}
                            className={`py-1 bg-[#F4C430] border-b border-slate-400 text-[9px] font-bold text-slate-900 cursor-pointer ${ringIfSelected(
                              "B.01"
                            )}`}
                          >
                            B.01 P.KH-TC
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B.04")}
                            className={`py-1 bg-[#F4C430] border-b border-slate-400 text-[9px] font-bold text-slate-900 cursor-pointer ${ringIfSelected(
                              "B.04"
                            )}`}
                          >
                            B.04 P.Khảo thí
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B.07")}
                            className={`py-1 bg-[#2A8B8B] border-b border-slate-400 text-[9px] font-bold text-white cursor-pointer ${ringIfSelected(
                              "B.07"
                            )}`}
                          >
                            B.07 P.KHCN
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B.08")}
                            className={`py-1 bg-[#F4C430] border-b border-slate-400 text-[9px] font-bold text-slate-900 cursor-pointer ${ringIfSelected(
                              "B.08"
                            )}`}
                          >
                            B.08 Sau ĐH
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B11")}
                            className={`py-1.5 bg-[#E99695] text-[10px] font-black text-slate-900 cursor-pointer ${ringIfSelected(
                              "B11"
                            )}`}
                          >
                            B11
                          </button>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-500 p-2 text-center">
                          Tòa B (Để trống)
                        </div>
                      )}

                      {selectedFloor === "L3" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B37-43")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "B37-43"
                            )}`}
                          >
                            B37
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B37-43")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "B37-43"
                            )}`}
                          >
                            B43
                          </button>
                          <div className="h-7 bg-[#C8C8C5]" />
                        </>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          <div className="py-1 bg-[#C8234B] text-white text-center font-black text-xs border-b border-white/30">
                            B
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B42-44")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "B42-44"
                            )}`}
                          >
                            B42
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("B42-44")}
                            className={`flex-1 bg-[#C8234B] text-white font-bold text-xs flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "B42-44"
                            )}`}
                          >
                            B44
                          </button>
                        </>
                      )}
                    </div>

                    {/* SÂN CỘT CỜ (Giữa B & A - 1 Col) */}
                    <button
                      type="button"
                      onClick={() => setSelectedRoomKey("SAN_CO")}
                      className={`col-span-1 rounded border border-slate-400 bg-[#C8C8C5] flex flex-col items-center justify-center p-1 text-center cursor-pointer ${ringIfSelected(
                        "SAN_CO"
                      )}`}
                    >
                      <span className="text-[10px] font-black text-slate-900 leading-tight">
                        Sân cờ
                      </span>
                      <span className="text-sm my-1">🚩</span>
                    </button>

                    {/* DÃY DỌC TÒA A (1.5 Cols -> 1 Col) */}
                    <div className="col-span-1 flex flex-col border border-slate-400 rounded overflow-hidden bg-[#D5D5D2]">
                      {selectedFloor === "B1-L1" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("A.02")}
                            className={`flex-1 bg-[#E99695] border-b border-slate-400 font-bold text-[10px] text-slate-900 flex flex-col items-center justify-center p-0.5 cursor-pointer ${ringIfSelected(
                              "A.02"
                            )}`}
                          >
                            <span>A.02</span>
                            <span className="text-[8px]">CTSV</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("A.04")}
                            className={`flex-1 bg-[#2A8B8B] font-bold text-[10px] text-white flex flex-col items-center justify-center p-0.5 cursor-pointer ${ringIfSelected(
                              "A.04"
                            )}`}
                          >
                            <span>A.04</span>
                            <span className="text-[8px]">QTTB</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center font-black text-xs text-slate-500">
                          A
                        </div>
                      )}
                    </div>

                    {/* DÃY DỌC TÒA E (2 Cols) */}
                    <div className="col-span-2 flex flex-col border border-slate-400 rounded overflow-hidden bg-[#D5D5D2]">
                      {selectedFloor === "B1-L1" && (
                        <div className="flex-1 bg-[#B8D0EB] flex flex-col items-center justify-center p-1.5 text-center font-black text-xs text-slate-900">
                          <span>TÒA E</span>
                        </div>
                      )}

                      {selectedFloor === "L2" && (
                        <>
                          <div className="h-6 bg-[#D5D5D2] border-b border-slate-400" />
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E204")}
                            className={`py-3 bg-[#D94362] text-white border-b border-white/40 font-bold text-[10px] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "E204"
                            )}`}
                          >
                            <span>E204</span>
                            <span className="text-[8px]">VL Chất rắn</span>
                          </button>
                          <div className="flex-1 bg-[#D5D5D2]" />
                        </>
                      )}

                      {selectedFloor === "L3" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E301-303B")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-[11px] flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "E301-303B"
                            )}`}
                          >
                            E301
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E301-303B")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-[11px] flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "E301-303B"
                            )}`}
                          >
                            E302
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E301-303B")}
                            className={`flex-1 bg-[#C8234B] text-white border-b border-white/40 font-bold text-[10px] flex items-center justify-center cursor-pointer ${ringIfSelected(
                              "E301-303B"
                            )}`}
                          >
                            E303B
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E303")}
                            className={`flex-1 bg-[#F4C430] text-slate-900 font-bold text-[10px] flex flex-col items-center justify-center cursor-pointer ${ringIfSelected(
                              "E303"
                            )}`}
                          >
                            <span>E303</span>
                            <span className="text-[8px]">BM VL Điện tử</span>
                          </button>
                        </>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          {["E401", "E402", "E403", "E404"].map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setSelectedRoomKey("E401-404")}
                              className={`flex-1 bg-[#2E7D8B] text-white border-b border-white/30 font-bold text-[11px] flex items-center justify-center cursor-pointer ${ringIfSelected(
                                "E401-404"
                              )}`}
                            >
                              {code}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* ROW 3: PHÍA NAM (TÒA I — CỔNG CHÍNH — GĐ 1 & TT TIN HỌC / CHI TIẾT L5-11) */}
                  <div className="grid grid-cols-12 gap-2 items-stretch">
                    {/* Leftmost Perimeter Strip */}
                    <div className="col-span-2 flex flex-col justify-between">
                      <div className="h-20 rounded bg-[#D5D5D2] border border-slate-400" />
                    </div>

                    {/* TÒA I BLOCK (4 Cols - Góc Tây Nam) */}
                    <div className="col-span-4 flex flex-col gap-1">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("HOI_TRUONG_I")}
                            className={`flex-1 rounded border border-[#B85D5C] bg-[#D98282] p-2.5 text-slate-900 flex items-center justify-between cursor-pointer ${ringIfSelected(
                              "HOI_TRUONG_I"
                            )}`}
                          >
                            <div className="text-left">
                              <div className="font-black text-xs">TÒA I</div>
                              <div className="text-[10px] font-bold">
                                Hội trường I
                              </div>
                              <div className="text-[10px] font-bold mt-1">
                                Phòng Hội nghị I
                              </div>
                            </div>
                            <span className="px-1.5 py-1 rounded bg-slate-900 text-white text-xs">
                              🛗
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("HAM_B1_I")}
                            className={`py-1 px-2 rounded bg-[#2A8B8B] text-white font-bold text-[10px] text-center cursor-pointer ${ringIfSelected(
                              "HAM_B1_I"
                            )}`}
                          >
                            Hầm xe nhân viên B1
                          </button>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <div className="flex-1 rounded border border-slate-400 bg-[#D5D5D2] p-2 grid grid-cols-3 gap-1.5 items-center">
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="p-1.5 rounded bg-slate-900 text-white text-xs">
                              🛗
                            </span>
                          </div>
                          <div className="col-span-1 flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("I23-24")}
                              className={`py-2 rounded bg-[#D94362] text-white font-bold text-xs cursor-pointer ${ringIfSelected(
                                "I23-24"
                              )}`}
                            >
                              I23
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("I23-24")}
                              className={`py-2 rounded bg-[#D94362] text-white font-bold text-xs cursor-pointer ${ringIfSelected(
                                "I23-24"
                              )}`}
                            >
                              I24
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedFloor === "L3" && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoomKey("I32-34")}
                          className={`flex-1 rounded border border-teal-800 bg-[#2A8B8B] p-2.5 text-white grid grid-cols-3 gap-1 items-center cursor-pointer ${ringIfSelected(
                            "I32-34"
                          )}`}
                        >
                          <span className="font-bold text-xs">I32</span>
                          <span className="p-1 rounded bg-slate-900 text-white text-xs mx-auto">
                            🛗
                          </span>
                          <span className="font-bold text-xs">I33</span>
                          <span className="col-span-3 font-bold text-xs pt-1 border-t border-white/25 text-center">
                            I34
                          </span>
                        </button>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoomKey("I42-44")}
                          className={`flex-1 rounded border border-teal-800 bg-[#2A8B8B] p-2.5 text-white grid grid-cols-2 gap-1.5 items-center cursor-pointer ${ringIfSelected(
                            "I42-44"
                          )}`}
                        >
                          <div className="col-span-2 text-center font-black text-[11px] border-b border-white/25 pb-1">
                            TẦNG L4 (TÒA I)
                          </div>
                          <span className="font-bold text-xs">I42</span>
                          <span className="font-bold text-xs">I43 🛗</span>
                          <span className="col-span-2 font-bold text-xs pt-1 border-t border-white/25">
                            I44
                          </span>
                        </button>
                      )}
                    </div>

                    {/* RIGHT 6 COLS OF SOUTH ROW: Either GĐ 1 + Hầm E OR Inset CHI TIẾT TÒA I (L5-L11) */}
                    {selectedFloor !== "L5-L11" ? (
                      <>
                        {/* GĐ 1 & Văn phòng thông tin (4 Cols) */}
                        <div className="col-span-4 flex flex-col justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("GD1")}
                            className={`rounded border p-2 text-center transition cursor-pointer ${
                              selectedFloor === "B1-L1"
                                ? "bg-[#F4C430] border-amber-600 text-slate-900"
                                : "bg-[#C8C8C5] border-slate-400 text-slate-700"
                            } ${ringIfSelected("GD1")}`}
                          >
                            <div className="font-black text-xs">GĐ 1</div>
                            {selectedFloor === "B1-L1" && (
                              <div className="text-[10px] font-bold mt-0.5 border-t border-slate-900/20 pt-0.5">
                                Văn phòng thông tin
                              </div>
                            )}
                          </button>
                        </div>

                        {/* Tòa E Hầm xe SV & Trung tâm Tin học (2 Cols) */}
                        <div className="col-span-2 flex flex-col gap-1 justify-end">
                          {selectedFloor === "B1-L1" && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedRoomKey("HAM_B1_E")}
                                className={`rounded border border-sky-700 bg-[#9BC2E6] p-1.5 text-slate-900 text-center cursor-pointer ${ringIfSelected(
                                  "HAM_B1_E"
                                )}`}
                              >
                                <div className="font-black text-[10px]">
                                  TÒA E
                                </div>
                                <div className="text-[9px] font-bold leading-tight">
                                  Hầm xe SV B1 🏍️
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedRoomKey("TTTH")}
                                className={`rounded border border-amber-600 bg-[#F4C430] p-1.5 text-slate-900 font-bold text-[10px] text-center cursor-pointer ${ringIfSelected(
                                  "TTTH"
                                )}`}
                              >
                                Trung tâm Tin học
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      /* INSET BOX: CHI TIẾT TÒA I (TẦNG L5 - L11) EXACTLY LIKE FIGURE 4 IN PDF */
                      <div className="col-span-6 rounded-xl border-2 border-slate-700 bg-white dark:bg-slate-900 p-2 space-y-1">
                        <div className="grid grid-cols-12 gap-1 items-center text-[10px] font-bold">
                          <span className="col-span-3 text-slate-700 dark:text-slate-300">
                            Tầng L11
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("L11-I")}
                            className={`col-span-9 py-1 rounded bg-[#2A8B8B] text-white text-center cursor-pointer ${ringIfSelected(
                              "L11-I"
                            )}`}
                          >
                            I11
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-1 items-center text-[10px] font-bold">
                          <span className="col-span-3 text-slate-700 dark:text-slate-300">
                            Tầng L9-10
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("L9-10-I")}
                            className={`col-span-9 py-1.5 rounded bg-[#2A8B8B] text-white text-center cursor-pointer ${ringIfSelected(
                              "L9-10-I"
                            )}`}
                          >
                            Thư viện Trung tâm (L9 – L10)
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-1 items-center text-[10px] font-bold">
                          <span className="col-span-3 text-slate-700 dark:text-slate-300">
                            Tầng L7
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("L7-I")}
                            className={`col-span-9 py-1 rounded bg-[#2A8B8B] text-white text-center cursor-pointer ${ringIfSelected(
                              "L7-I"
                            )}`}
                          >
                            I71 · I72 · BM MMT
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-1 items-center text-[10px] font-bold">
                          <span className="col-span-3 text-slate-700 dark:text-slate-300">
                            Tầng L6
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("L6-I")}
                            className={`col-span-9 py-1 rounded bg-[#2A8B8B] text-white text-center cursor-pointer ${ringIfSelected(
                              "L6-I"
                            )}`}
                          >
                            I61 · I62 · BM THCS
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-1 items-center text-[10px] font-bold">
                          <span className="col-span-3 text-slate-700 dark:text-slate-300">
                            Tầng L5
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("L5-I")}
                            className={`col-span-9 py-1 rounded bg-[#2A8B8B] text-white text-center cursor-pointer ${ringIfSelected(
                              "L5-I"
                            )}`}
                          >
                            I52 · I.53 (VPK CNTT) · I59B (VPK Hóa)
                          </button>
                        </div>

                        <div className="text-center font-black text-[10px] text-slate-800 dark:text-slate-200 pt-0.5">
                          CHI TIẾT TÒA I (TẦNG L5 – L11)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ROAD BAR: CỔNG CHÍNH & ĐƯỜNG NGUYỄN VĂN CỪ */}
                  <div className="pt-1">
                    <div className="flex items-center justify-center mb-1">
                      <span className="px-3 py-0.5 rounded bg-white border border-slate-400 font-black text-[10px] text-slate-900 shadow-2xs">
                        CỔNG CHÍNH
                      </span>
                    </div>
                    <div className="h-6 rounded bg-[#6E6E6E] text-white text-[11px] font-bold flex items-center justify-center tracking-wide">
                      Đường Nguyễn Văn Cừ (Cơ sở 1: 227 Nguyễn Văn Cừ, Q.5)
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT 4 COLS: CATEGORIZED LEGEND & SELECTED ROOM DETAIL ================= */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                {/* 1. Categorized Mall-Style Directory Box (Matches Right Side of PDF Figures) */}
                <div className="space-y-3 text-xs">
                  {/* Category Pill 1: Red */}
                  <div>
                    <div className="rounded-full bg-[#C81E32] text-white font-black text-[11px] py-1 px-3 text-center uppercase tracking-wide shadow-2xs">
                      {selectedFloor === "B1-L1"
                        ? "PHÒNG BAN & KHOA"
                        : "PHÒNG HỌC & PTN"}
                    </div>
                    <ul className="mt-1.5 space-y-1 pl-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("F.05")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + F.05: VPK Sinh học · F.02: P. TTTT
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("B.01")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + B.01: P. Kế hoạch - Tài chính &amp; Y tế
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("B.02")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + B.02: P. Đào tạo · B.04: P. Khảo thí
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("B.07")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + B.07: P. KHCN · B.08: P. Sau đại học
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("A.02")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + A.02: P. Công tác SV · A.04: P. Quản trị TB
                            </button>
                          </li>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("F202-206")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + F202, F203, F205, F206, F.102, F.113 (Tòa F)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("C21")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + C21 PTN Ngọc học, C22, C23 (Tòa C)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("E204")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + E204 BM Vật lý Chất rắn (Tòa E)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("I23-24")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + I23, I24 (Tòa I)
                            </button>
                          </li>
                        </>
                      )}

                      {selectedFloor === "L3" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("F301-304")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + F301, F303, F304, F305 (Tòa F)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("C31-33")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + C31, C32, C33 (Tòa C) · B37, B43 (Tòa B)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("E301-303B")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + E301, E302, E303B (Tòa E)
                            </button>
                          </li>
                        </>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("C41-43")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + C41, C43 (Tòa C) · B42, B44 (Tòa B)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("E401-404")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + E401, E402, E403, E404 (Tòa E)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("I42-44")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + I42, I43, I44 (Tòa I - Tầng L4)
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Category Pill 2: Yellow/Gold */}
                  <div>
                    <div className="rounded-full bg-[#F4C430] text-slate-900 font-black text-[11px] py-1 px-3 text-center uppercase tracking-wide shadow-2xs">
                      {selectedFloor === "B1-L1"
                        ? "GIẢNG ĐƯỜNG & HỌC TẬP"
                        : selectedFloor === "L4" || selectedFloor === "L5-L11"
                        ? "TÒA I - TẦNG L5–L7"
                        : "VĂN PHÒNG & BỘ MÔN"}
                    </div>
                    <ul className="mt-1.5 space-y-1 pl-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("HOI_TRUONG_I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + I: Hội trường I &amp; Phòng Hội nghị I
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("GD1")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + GĐ 1 &amp; GĐ 2 · C01, C11, C12 · B11
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("TTTH")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + TT: Trung tâm Tin học &amp; VP Thông tin
                            </button>
                          </li>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("F.101-105")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + F.101–105 P. QHĐN (Tòa F)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("F.106A")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + F.106A Tham vấn tâm lý · F.107 Thanh tra
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("C12A")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + C12A VPK Địa chất (Tòa C)
                            </button>
                          </li>
                        </>
                      )}

                      {selectedFloor === "L3" && (
                        <li>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("E303")}
                            className="hover:text-[#C81E32] cursor-pointer text-left"
                          >
                            + E303 Bộ môn Vật lý Điện tử (Tòa E)
                          </button>
                        </li>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("L5-I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + Tầng L5: I52, I.53 VPK CNTT, I59B VPK Hóa
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("L6-I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + Tầng L6: I61, I62, BM THCS
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("L7-I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + Tầng L7: I71, I72, BM MMT
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Category Pill 3: Teal */}
                  <div>
                    <div className="rounded-full bg-[#2A8B8B] text-white font-black text-[11px] py-1 px-3 text-center uppercase tracking-wide shadow-2xs">
                      {selectedFloor === "B1-L1"
                        ? "HẦM GỬI XE B1 & DỊCH VỤ"
                        : selectedFloor === "L4" || selectedFloor === "L5-L11"
                        ? "TÒA I - TẦNG CAO L9–L11"
                        : "KHU CÔNG NGHỆ & DỊCH VỤ"}
                    </div>
                    <ul className="mt-1.5 space-y-1 pl-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {selectedFloor === "B1-L1" && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("HAM_B1_E")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + E: Hầm xe sinh viên B1 (Cổng phụ phải)
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("HAM_B1_I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + I: Hầm xe nhân viên B1 &amp; Thang máy Tòa I
                            </button>
                          </li>
                        </>
                      )}

                      {selectedFloor === "L2" && (
                        <li>+ Thang máy trung tâm &amp; Thang bộ (Tòa I)</li>
                      )}

                      {selectedFloor === "L3" && (
                        <li>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomKey("I32-34")}
                            className="hover:text-[#C81E32] cursor-pointer text-left"
                          >
                            + I32, I33, I34 · Cụm Thang máy Tòa I
                          </button>
                        </li>
                      )}

                      {(selectedFloor === "L4" || selectedFloor === "L5-L11") && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("L9-10-I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + Tầng L9–10: Thư viện Trung tâm
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => setSelectedRoomKey("L11-I")}
                              className="hover:text-[#C81E32] cursor-pointer text-left"
                            >
                              + Tầng L11: Phòng chuyên đề I11
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* 2. Active Selected Room Info Box */}
                <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EFE6] dark:border-slate-700 dark:bg-slate-800 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-extrabold text-[#C81E32] dark:text-amber-400">
                      <Navigation className="w-3 h-3" />
                      Đang chọn: {activeRoomDetail.code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] font-bold text-[#0B2545] dark:text-slate-200">
                      {activeRoomDetail.building}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-[#0B2545] dark:text-white leading-snug">
                    {activeRoomDetail.title}
                  </p>
                  <p className="text-[11px] text-[#4A5568] dark:text-slate-300 leading-relaxed">
                    {activeRoomDetail.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= 4. MODULE 2: AI ASSISTANT WORKSPACE ================= */}
      {(activeModule === "all" || activeModule === "ai-assistant") && (
        <section className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-4 sm:p-6 dark:border-slate-700/80 dark:bg-slate-800/95 lg:col-span-4 shadow-2xs min-w-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2545] text-white shadow-xs">
                    <Bot className="h-5 w-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#0B2545] dark:text-white truncate">
                      Trợ Lý AI FORUS (Gemini)
                    </h3>
                    <p className="text-xs text-[#D95326] dark:text-amber-400 font-bold truncate">
                      Học vụ · Công thức LaTeX · Tiện ích CS1
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Làm mới đoạn chat"
                  className="p-2 rounded-xl border border-[#E5E0D5] dark:border-slate-700 text-[#64748B] hover:text-[#D95326] dark:text-slate-300 transition shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#4A5568] dark:text-slate-300 leading-relaxed">
                Chọn nhanh một câu hỏi mẫu dưới đây hoặc nhập bất kỳ bài toán, câu hỏi lập trình, đời sống hay tiện ích nào tại ĐH KHTN:
              </p>

              <div className="space-y-2">
                {[
                  "Giải phương trình x^2 - 5x + 6 = 0 và tính đạo hàm f(x) = x^3 - 3x^2 + 2x",
                  "Giải thích ngắn gọn Định lý Kẹp (Squeeze Theorem) và ví dụ giới hạn",
                  "Viết hàm tìm kiếm nhị phân (Binary Search) bằng C++ và phân tích độ phức tạp",
                  "Bảng giá thuê máy tính Casio, giá đỡ công thái học và các mã Voucher giảm giá FORUS",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(sample)}
                    disabled={isSending || isAiLimitReached}
                    className="w-full rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-3 text-left text-xs font-semibold text-[#0B2545] transition hover:border-[#0B2545] hover:bg-[#F3EFE6] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700/70 dark:text-slate-200 cursor-pointer break-words"
                  >
                    “{sample}”
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-[#F3EFE6] dark:bg-slate-900 p-3.5 text-[11px] text-[#0B2545] dark:text-slate-200 font-medium">
              <div className="flex flex-wrap items-center justify-between gap-1 font-mono font-bold">
                <span>Lượt hỏi AI hiện tại:</span>
                {isVipUnlocked ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Không giới hạn (∞)
                  </span>
                ) : (
                  <span
                    className={
                      isAiLimitReached
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-[#D95326] dark:text-amber-400"
                    }
                  >
                    Đã dùng {aiQuestionsUsed}/{maxFreeAiQuestions} câu (Còn{" "}
                    {remainingFreeQuestions})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#4A5568] dark:text-slate-300 break-words">
                {isVipUnlocked
                  ? "👑 Tài khoản đã đạt mốc ≥ 100 điểm: Bạn được hỏi Trợ lý AI FORUS không giới hạn."
                  : `🔒 Khi chưa đạt 100 điểm, bạn được hỏi tối đa ${maxFreeAiQuestions} câu miễn phí. Kích hoạt nhanh 100đ để mở khóa không giới hạn.`}
              </p>
            </div>
          </div>

          {/* Chat Conversation Window */}
          <div className="flex h-[500px] sm:h-[560px] flex-col rounded-3xl border border-[#E6E0D5] bg-white dark:border-slate-700/80 dark:bg-slate-800/95 lg:col-span-8 shadow-2xs overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE5DC] bg-[#F3EFE6]/80 px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs dark:border-slate-700 dark:bg-slate-900">
              {isVipUnlocked ? (
                <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 break-words">
                  👑 Đã mở khóa ({student.points}/100đ): Trò chuyện AI không giới hạn (∞)
                </span>
              ) : (
                <span className="font-mono font-bold text-[#0B2545] dark:text-slate-200">
                  Lượt hỏi miễn phí:{" "}
                  <strong
                    className={
                      isAiLimitReached
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-[#D95326] dark:text-amber-400"
                    }
                  >
                    {aiQuestionsUsed}/{maxFreeAiQuestions} câu
                  </strong>{" "}
                  (Còn {remainingFreeQuestions} câu)
                </span>
              )}

              {!isVipUnlocked && (
                <button
                  type="button"
                  onClick={onUnlockDemoVip}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#D95326] hover:bg-[#C0441B] px-2.5 py-1 font-mono text-[11px] font-extrabold text-white transition cursor-pointer"
                >
                  <Zap className="h-3 w-3 shrink-0" />
                  <span>Kích hoạt 100đ (Không giới hạn)</span>
                </button>
              )}
            </div>

            <div
              ref={chatScrollContainerRef}
              className="flex-1 space-y-4 overflow-y-auto p-3.5 sm:p-6 bg-[#FAF8F5]/60 dark:bg-slate-900/40"
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-3 min-w-0 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "model" && (
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white shadow-xs">
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] min-w-0 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                      msg.role === "user"
                        ? "bg-[#0B2545] text-white shadow-xs"
                        : "border border-[#E6E0D5] bg-white text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <FormattedAiMessage
                      text={msg.text}
                      isUser={msg.role === "user"}
                    />
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
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#D95326] text-white">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#D95326] dark:text-amber-300">
                  <Bot className="h-4 w-4 animate-bounce shrink-0" />
                  <span>Trợ lý AI FORUS đang soạn câu trả lời...</span>
                </div>
              )}
            </div>

            {isAiLimitReached ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/30 p-3 sm:p-4">
                <div className="text-xs text-rose-800 dark:text-rose-200 break-words">
                  <strong className="font-extrabold">
                    🔒 Đã đạt giới hạn {maxFreeAiQuestions}/{maxFreeAiQuestions} câu hỏi:
                  </strong>{" "}
                  Tích đủ 100 điểm hoặc kích hoạt nhanh 100đ để hỏi AI không giới hạn!
                </div>
                <button
                  type="button"
                  onClick={onUnlockDemoVip}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] px-4 py-2.5 text-xs font-extrabold text-white transition shrink-0 cursor-pointer shadow-xs"
                >
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span>Kích Hoạt 100đ Ngay</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2 border-t border-[#E6E0D5] bg-[#F3EFE6]/70 dark:bg-slate-900/50 p-2.5 sm:p-4 dark:border-slate-700 min-w-0"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Hỏi LaTeX, Giải tích, C++... (${
                    isVipUnlocked
                      ? "Không giới hạn ∞"
                      : `Còn ${remainingFreeQuestions}/${maxFreeAiQuestions} câu`
                  })`}
                  className="flex-1 min-w-0 rounded-2xl border border-[#DDD6C7] bg-white px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="flex items-center gap-1.5 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white transition disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  <Send className="h-4 w-4 shrink-0" />
                  <span>Gửi</span>
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* ================= 5. MODULE 3: QUICK LATEX SNIPPET GENERATOR ================= */}
      {(activeModule === "all" || activeModule === "latex-snippets") && (
        <section className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-7 shadow-2xs dark:border-slate-700/80 dark:bg-slate-900 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4 dark:border-slate-800">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B2545] text-sky-300 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white">
                    Thư Viện Mẫu Code LaTeX Copy Nhanh (Đại Cương &amp; Đồ Án KHTN)
                  </h3>
                  <span className="rounded-full bg-[#0B2545]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#0B2545] dark:bg-sky-500/20 dark:text-sky-300">
                    {QUICK_LATEX_TEMPLATES.length} mẫu chuẩn
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-300">
                  Lọc theo học phần hoặc tìm nhanh công thức, sao chép 1 chạm vào Overleaf hoặc gửi trực tiếp vào Trợ lý AI để tùy biến
                </p>
              </div>
            </div>

            {/* Search bar for LaTeX templates */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={latexSearchQuery}
                onChange={(e) => setLatexSearchQuery(e.target.value)}
                placeholder="Tìm ma trận, tích phân, bìa đồ án, bảng..."
                className="w-full rounded-xl border border-[#DCD5C7] bg-[#FAF8F5] pl-9 pr-3 py-2 text-xs text-[#0B2545] placeholder:text-slate-400 focus:border-[#0B2545] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                {
                  id: "all",
                  label: `Tất cả (${QUICK_LATEX_TEMPLATES.length})`,
                },
                {
                  id: "linear-algebra",
                  label: "Đại số tuyến tính (4)",
                },
                {
                  id: "calculus",
                  label: "Vi tích phân 1B / 2B (4)",
                },
                {
                  id: "discrete-prob",
                  label: "Toán rời rạc & Xác suất (4)",
                },
                {
                  id: "cs-report",
                  label: "Báo cáo Đồ án & Thuật toán CNTT (6)",
                },
              ] as { id: LatexCategoryId; label: string }[]
            ).map((cat) => {
              const isActive = selectedLatexCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedLatexCategory(cat.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                    isActive
                      ? "bg-[#0B2545] text-white shadow-2xs dark:bg-amber-400 dark:text-slate-950"
                      : "border border-[#E5DEC9] bg-[#FAF8F5] text-[#4A5568] hover:border-[#0B2545]/40 hover:text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {(() => {
            const q = latexSearchQuery.trim().toLowerCase();
            const filteredTemplates = QUICK_LATEX_TEMPLATES.filter((tpl) => {
              const matchesCat =
                selectedLatexCategory === "all" ||
                tpl.category === selectedLatexCategory;
              const matchesSearch =
                !q ||
                tpl.title.toLowerCase().includes(q) ||
                tpl.subject.toLowerCase().includes(q) ||
                tpl.description.toLowerCase().includes(q) ||
                tpl.code.toLowerCase().includes(q);
              return matchesCat && matchesSearch;
            });

            if (filteredTemplates.length === 0) {
              return (
                <div className="rounded-2xl border border-dashed border-[#DCD5C7] bg-[#FAF8F5] p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-[#0B2545] dark:text-white">
                    Không tìm thấy mẫu LaTeX phù hợp với từ khóa "{latexSearchQuery}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLatexCategory("all");
                      setLatexSearchQuery("");
                    }}
                    className="mt-3 rounded-xl bg-[#0B2545] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#163A66] transition cursor-pointer"
                  >
                    Hiển thị lại toàn bộ 18 mẫu LaTeX
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((tpl) => {
                  const isCopied = copiedSnippetId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-4 flex flex-col justify-between dark:border-slate-700 dark:bg-slate-800/80 hover:border-[#0B2545]/40 transition"
                    >
                      <div>
                        <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                          {tpl.subject}
                        </span>
                        <h4 className="mt-1 text-sm font-extrabold text-[#0B2545] dark:text-white leading-snug">
                          {tpl.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-300 leading-relaxed">
                          {tpl.description}
                        </p>
                        <pre className="mt-2.5 max-h-48 p-3 rounded-xl bg-white dark:bg-slate-950 border border-[#E5DEC9] dark:border-slate-700 font-mono text-[11px] text-[#0B2545] dark:text-slate-200 overflow-auto whitespace-pre">
                          {tpl.code}
                        </pre>
                      </div>

                      <div className="mt-3.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopySnippet(tpl.id, tpl.code, tpl.title)
                          }
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy LaTeX</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModule("all");
                            handleSendChat(
                              `Giải thích và mở rộng giúp mình đoạn code LaTeX này cho bài tập:\n\`\`\`latex\n${tpl.code}\n\`\`\``
                            );
                          }}
                          className="py-2 px-3 rounded-xl border border-[#E5DEC9] bg-white hover:bg-[#F3EFE6] text-[#0B2545] dark:border-slate-600 dark:bg-slate-700 dark:text-white font-bold text-xs transition cursor-pointer"
                        >
                          Hỏi AI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* ================= 6. MODULE 4: FULL-WIDTH VOUCHER REDEMPTION HUB ================= */}
      {(activeModule === "all" || activeModule === "voucher-hub") && (
        <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-5 sm:p-7 dark:border-slate-700/80 dark:bg-slate-800/90">
          <div className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                <Gift className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>
                  Kho Đổi Điểm &amp; Voucher FORUS ({student.points} điểm khả dụng)
                </span>
              </span>
              <button
                type="button"
                onClick={onNavigateToShop}
                className="text-xs font-extrabold text-[#D95326] hover:underline cursor-pointer"
              >
                Thuê &amp; mua học cụ tích thêm điểm →
              </button>
            </div>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
              Khi{" "}
              <strong className="text-[#0B2545] dark:text-white">
                mua hoặc thuê học cụ, in tài liệu
              </strong>{" "}
              tại FORUS, bạn được cộng điểm trực tiếp vào tài khoản. Khi{" "}
              <strong className="text-[#D95326] dark:text-amber-400">
                đổi điểm
              </strong>{" "}
              lấy các gói ưu đãi bên dưới, hệ thống sẽ trừ số điểm tương ứng:
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  id: "hv-50",
                  cost: 50,
                  req: "Cần 50 điểm · Trị giá 10.000đ",
                  title: "Voucher Giảm 10.000đ Đơn In Ấn & Giáo Trình",
                  desc: "Áp dụng cho mọi đơn in tài liệu A1–A5, thuê máy tính Casio hoặc mua giáo trình đại cương tại Tòa I, F, B, C.",
                  btnLabel: "Đổi 50 điểm ngay (-50đ)",
                },
                {
                  id: "hv-60",
                  cost: 60,
                  req: "Cần 60 điểm · Trị giá 15.000đ",
                  title: "Voucher Giảm 15.000đ Thuê Thiết Bị & Sổ Tay AI",
                  desc: "Dùng khi thuê Combo iPad Sinh Viên, MacroPad LaTeX hoặc Sổ tay Toán cho AI CSC00006.",
                  btnLabel: "Đổi 60 điểm ngay (-60đ)",
                },
                {
                  id: "hv-100",
                  cost: 100,
                  req: "Cần 100 điểm · Giảm 15% tổng đơn",
                  title: "Đặc Quyền Giảm 15% Toàn Bộ Giỏ Hàng Tuần Này",
                  desc: "Ưu đãi cao nhất dành cho thành viên tích điểm năng nổ tại Cơ sở 1 (227 NVC).",
                  btnLabel: "Đổi 100 điểm ngay (-100đ)",
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
                              `Đã trừ ${v.cost} điểm để đổi "${v.title}"!`
                            );
                          } else {
                            showToast(
                              `Bạn đang có ${student.points} điểm, cần đủ ${v.cost} điểm để đổi ưu đãi này.`
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
                          ? `Đổi thêm lần nữa (-${v.cost}đ)`
                          : canAfford
                          ? v.btnLabel
                          : `Thiếu ${v.cost - student.points} điểm`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default VipHub;
