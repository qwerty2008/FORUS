import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI chính thức của FORUS ("Tiện ích trong tay, học hay mỗi ngày") — hệ sinh thái tiện ích học tập và phát triển toàn diện dành riêng cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (HCMUS — Cơ sở 1: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM).

Nhiệm vụ trọng tâm của bạn:
1. Giải đáp chi tiết, chính xác, từng bước mọi câu hỏi học tập đại học và phổ thông:
   - Toán đại cương & chuyên ngành: Vi tích phân 1B/2B (giới hạn, đạo hàm, tích phân, chuỗi số, khai triển Taylor/Maclaurin, định lý kẹp), Đại số tuyến tính (ma trận, định thức, hệ phương trình, không gian vector, trị riêng/vector riêng, chéo hóa), Toán rời rạc (logic, quy nạp, tổ hợp, lý thuyết đồ thị), Xác suất thống kê (xác suất có điều kiện, công thức Bayes, biến ngẫu nhiên, ước lượng & kiểm định).
   - Lập trình & Khoa học máy tính: Nhập môn lập trình C/C++, Python, Cấu trúc dữ liệu & Giải thuật (Big-O, sắp xếp, tìm kiếm, danh sách liên kết, cây, đồ thị, quy hoạch động), Lập trình hướng đối tượng (OOP), Đồ án 1 / Giới thiệu ngành CNTT & Trí tuệ nhân tạo (CSC00006).
   - Vật lý đại cương, Hóa đại cương, Sinh học đại cương và phương pháp học đại học hiệu quả.
2. Viết code LaTeX chuẩn xác (đặt trong khối \`\`\`latex ... \`\`\`) cho ma trận, tích phân, hệ phương trình, bảng biểu và khung báo cáo Đồ án 1 Khoa CNTT.
3. Tư vấn đầy đủ, chính xác về Hệ sinh thái FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ):
   - **Thuê & Bán thiết bị học tập (chọn tình trạng Thuê ngắn hạn / Độ mới 80% / Độ mới 90% / Mới hẳn 100%):**
     • Máy tính cầm tay khoa học: Casio fx-580VN X, Casio fx-880BTG, Vinacal 680EX Plus (Thuê từ 15.000đ/ngày, mua 80%–90%–100%).
     • Giáo trình đại cương KHTN: Vi tích phân 1B & 2B, Đại số tuyến tính, Xác suất thống kê, Vật lý đại cương, Nhập môn lập trình C/C++ (Thuê 20.000đ/tuần hoặc mua 80%–90%–100%).
     • Áo Blouse trắng phòng thí nghiệm Hóa – Sinh – Vật lý đủ size S, M, L, XL (Thuê 15.000đ/buổi hoặc mua 80%–90%–100%).
     • Combo "iPad Sinh Viên" (Thuê 35.000đ/tuần | Mua 390.000đ): Bảng vẽ điện tử + găng tay 2 ngón chống tì cảm ứng + phần mềm viết toán.
     • Bàn phím mini MacroPad "OneTap LaTeX" (220.000đ), Bộ Flashcard "Cứu Mạng Giữa Kỳ" chống nước (39.000đ), Giá đỡ laptop công thái học ORICO (75.000đ), Sticker bàn phím ký hiệu toán học (19.000đ), Gói Setup Trạm Ghi Chép Số & LaTeX (29.000đ).
   - **Đặt đồ ăn sáng & cà phê giao tận phòng học (FORUS 227 Express):** Bánh mì ốp la 2 trứng, Xôi mặn lá chuối, Cơm nắm cá hồi, Cà phê muối 227, Trà đào cam sả, Matcha Latte giao tận Sảnh Tòa I, Tòa B, C, E, F, Thư viện CS1 trong 10–15 phút.
   - **In ấn tài liệu & Poster lấy liền:** In từ khổ A5, A4, A3, A2 đến Poster A1 (in trắng đen hoặc in màu, đóng gáy xoắn, ống đựng poster).
   - **Cò Gia Sư KHTN:** Kết nối sinh viên HCMUS dạy kèm và tìm nhóm học tập.
   - **Cơ chế Điểm VIP & Đặc quyền thành viên FORUS:**
     • Khi mua hàng / đặt dịch vụ: Cộng trực tiếp +5 đến +10 điểm VIP vào hạng thành viên.
     • Khi đổi Voucher ưu đãi (50đ giảm 10k, 60đ giảm 15k, 100đ giảm 15% tổng đơn): Trừ trực tiếp số điểm VIP tương ứng.
     • Khi chưa kích hoạt VIP (< 100 điểm): Được hỏi tối đa 5 câu miễn phí với Trợ lý AI. Khi đạt chuẩn VIP (≥ 100 điểm): Mở khóa hỏi Trợ lý AI không giới hạn (∞) 24/7 và theo dõi đồng hồ đếm ngược Săn Điểm Rèn Luyện (ĐRL).

Phong cách trả lời:
- Trả lời NGẮN GỌN, SÚC TÍCH (khoảng 100 – 220 từ), đi thẳng vào trọng tâm câu hỏi của người dùng, giải thích dễ hiểu kèm kết quả/lời giải rõ ràng.
- Trình bày đẹp mắt bằng Markdown: dùng **in đậm** cho ý chính, gạch đầu dòng rõ ràng, và đặt code/LaTeX trong khối \`\`\` ngôn ngữ tương ứng.`;

// Normalize multi-turn history so it starts with "user" and strictly alternates "user" / "model"
function buildSanitizedContents(
  history: Array<{ role: string; text: string }>,
  currentMessage: string
) {
  const rawTurns: Array<{ role: "user" | "model"; text: string }> = [];

  for (const item of history.slice(-12)) {
    if (!item || typeof item.text !== "string" || !item.text.trim()) continue;
    // Skip system lock notices from polluting model history
    if (item.text.includes("🔒")) continue;
    const role: "user" | "model" = item.role === "model" ? "model" : "user";
    if (rawTurns.length === 0 && role === "model") {
      continue;
    }
    const prev = rawTurns[rawTurns.length - 1];
    if (prev && prev.role === role) {
      prev.text += "\n" + item.text.trim();
    } else {
      rawTurns.push({ role, text: item.text.trim() });
    }
  }

  const prev = rawTurns[rawTurns.length - 1];
  if (prev && prev.role === "user") {
    prev.text += "\n" + currentMessage;
  } else {
    rawTurns.push({ role: "user", text: currentMessage });
  }

  return rawTurns.map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }));
}

// High-reliability academic, math, coding & campus fallback if all upstream models experience a network outage
function buildFallbackAcademicReply(
  userMessage: string,
  studentName?: string
): string {
  const q = userMessage.toLowerCase().trim();
  const greetingName = studentName
    ? studentName.split(" ").slice(-1)[0]
    : "bạn";

  // 1. Direct arithmetic evaluation if user enters a math expression like "125 * 8 + 50"
  const cleanMath = q.replace(/[^0-9+\-*/().^\s]/g, "").trim();
  if (
    cleanMath.length >= 3 &&
    /[+\-*/^]/.test(cleanMath) &&
    /^[0-9+\-*/().^\s]+$/.test(q.replace(/[=?]/g, "").trim())
  ) {
    try {
      const jsExpr = cleanMath.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${jsExpr});`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        return `Chào ${greetingName}! Kết quả tính toán biểu thức của bạn là:\n\n$$${cleanMath} = ${result.toLocaleString("vi-VN")}$$\n\nNếu bạn cần giải phương trình giải tích, ma trận hay viết công thức này sang **LaTeX**, hãy nhắn mình nhé!`;
      }
    } catch {
      // Fall through
    }
  }

  if (
    q.includes("kẹp") ||
    q.includes("squeeze") ||
    q.includes("giới hạn") ||
    q.includes("lim")
  ) {
    return `Chào ${greetingName}! Dưới đây là kiến thức trọng tâm về **Định lý Kẹp (Squeeze Theorem)** và **Giới hạn** trong Vi tích phân 1B:\n\n1. **Phát biểu Định lý Kẹp:**\nNếu $f(x) \\le g(x) \\le h(x)$ với mọi $x$ lân cận $x_0$ và:\n$$\\lim_{x \\to x_0} f(x) = \\lim_{x \\to x_0} h(x) = L$$\nthì suy ra:\n$$\\lim_{x \\to x_0} g(x) = L$$\n\n2. **Ví dụ kinh điển thường gặp trong đề thi KHTN:**\nTính $I = \\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right)$.\n• Do $-1 \\le \\sin(1/x) \\le 1, \\forall x \\ne 0$ nên:\n$$-x^2 \\le x^2 \\sin\\left(\\frac{1}{x}\\right) \\le x^2$$\n• Vì $\\lim_{x \\to 0} (-x^2) = \\lim_{x \\to 0} x^2 = 0$, theo **Định lý Kẹp** ta có $I = 0$.\n\n3. **Code LaTeX để chép vào báo cáo:**\n\`\`\`latex\n\\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right) = 0 \\quad (\\text{theo Định lý Kẹp})\n\`\`\``;
  }

  if (
    q.includes("maclaurin") ||
    q.includes("taylor") ||
    q.includes("sin(x)") ||
    q.includes("chuỗi")
  ) {
    return `Chào ${greetingName}! Dưới đây là công thức **Khai triển Maclaurin** trọng tâm môn Vi tích phân 1B tại ĐH KHTN:\n\n1. **Khai triển hàm $\\sin(x)$ quanh $x_0 = 0$:**\n$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots + (-1)^n \\frac{x^{2n+1}}{(2n+1)!} + o(x^{2n+2})$$\n\n2. **Khai triển các hàm cơ bản khác:**\n• $\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots + (-1)^n \\frac{x^{2n}}{(2n)!} + o(x^{2n+1})$\n• $e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + o(x^n)$\n• $\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots + (-1)^{n-1}\\frac{x^n}{n} + o(x^n)$\n\n3. **Code LaTeX để chèn nhanh vào báo cáo:**\n\`\`\`latex\n\\sin(x) = \\sum_{k=0}^{n} (-1)^k \\frac{x^{2k+1}}{(2k+1)!} + o(x^{2n+2})\n\`\`\`\n💡 *Mẹo ôn thi:* Bạn có thể dùng **Bộ Flashcard bỏ túi "Cứu Mạng Giữa Kỳ" (39.000đ)** tại mục Thuê & Bán của FORUS để tra nhanh toàn bộ bảng khai triển Maclaurin nhé!`;
  }

  if (
    q.includes("latex") ||
    q.includes("ma trận") ||
    q.includes("tích phân") ||
    q.includes("đạo hàm") ||
    q.includes("đồ án")
  ) {
    return `Chào ${greetingName}! Dưới đây là khung **code LaTeX chuẩn báo cáo Khoa CNTT (HCMUS)** cho ma trận, tích phân và cấu trúc Đồ án 1 (CSC00006):\n\n1. **Ma trận $3 \\times 3$ (dùng gói \`amsmath\`):**\n\`\`\`latex\nA = \\begin{bmatrix}\n  a_{11} & a_{12} & a_{13} \\\\\n  a_{21} & a_{22} & a_{23} \\\\\n  a_{31} & a_{32} & a_{33}\n\\end{bmatrix}\n\`\`\`\n\n2. **Tích phân xác định, Đạo hàm & Tổng Sigma:**\n\`\`\`latex\nI = \\int_{a}^{b} f(x)\\,dx \\quad , \\quad f'(x) = \\frac{df}{dx} \\quad , \\quad S = \\sum_{i=1}^{n} x_i^2\n\`\`\`\n\n3. **Khung bìa & gói tiếng Việt chuẩn KHTN:**\n\`\`\`latex\n\\documentclass[12pt,a4paper]{report}\n\\usepackage[utf8]{vietnam}\n\\usepackage{amsmath, amssymb, graphicx}\n\`\`\`\n💡 *Gợi ý:* Nếu phải gõ LaTeX nhiều, bạn có thể tham khảo **Bàn phím MacroPad "OneTap LaTeX" (220.000đ)** hoặc **Gói Setup Template LaTeX (29.000đ)** tại FORUS!`;
  }

  if (q.includes("quy nạp") || q.includes("chứng minh") || q.includes("rời rạc")) {
    return `Chào ${greetingName}! Phương pháp **Chứng minh Quy nạp Toán học (Mathematical Induction)** gồm 3 bước chuẩn trong bài thi Toán rời rạc & Giải tích:\n\n• **Bước 1 (Cơ sở quy nạp):** Kiểm tra mệnh đề $P(n)$ đúng với giá trị nhỏ nhất $n = n_0$ (thường là $n_0 = 1$).\n• **Bước 2 (Giả thiết quy nạp):** Giả sử $P(k)$ đúng với một số nguyên dương $k \\ge n_0$ bất kỳ.\n• **Bước 3 (Bước quy nạp):** Chứng minh $P(k+1)$ cũng đúng dựa trên giả thiết $P(k)$. Kết luận $P(n)$ đúng với mọi $n \\ge n_0$.\n\n**Ví dụ nhanh:** Chứng minh $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.\n- Với $n=1$: $VT = 1 = \\frac{1(2)}{2} = VP$ (đúng).\n- Giả sử đúng với $n=k$: $1 + \\dots + k = \\frac{k(k+1)}{2}$.\n- Với $n=k+1$: $VT = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$ (đpcm).`;
  }

  if (
    q.includes("c++") ||
    q.includes("python") ||
    q.includes("code") ||
    q.includes("lập trình") ||
    q.includes("con trỏ") ||
    q.includes("đệ quy") ||
    q.includes("thuật toán")
  ) {
    return `Chào ${greetingName}! Dưới đây là khung code chuẩn môn **Nhập môn lập trình C/C++ & Cấu trúc dữ liệu** tại Khoa CNTT (HCMUS):\n\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// Ví dụ: Tìm kiếm nhị phân O(log n)\nint binarySearch(const vector<int>& a, int target) {\n    int left = 0, right = (int)a.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    vector<int> a = {1, 3, 5, 7, 9, 11};\n    cout << "Vi tri cua 7: " << binarySearch(a, 7) << "\\n";\n    return 0;\n}\n\`\`\`\n\n• **Độ phức tạp thời gian:** $O(\\log n)$ — nhanh hơn rất nhiều so với duyệt tuyến tính $O(n)$.\n• Nếu bạn đang gặp lỗi biên dịch hoặc cần giải bài tập C++/Python cụ thể, hãy dán đề bài vào đây nhé!`;
  }

  if (
    q.includes("tòa") ||
    q.includes("phòng") ||
    q.includes("sơ đồ") ||
    q.includes("cs1") ||
    q.includes("nguyễn văn cừ")
  ) {
    return `Chào ${greetingName}! Dưới đây là **Sơ đồ nhanh các tòa nhà tại Cơ sở 1 (227 Nguyễn Văn Cừ, Q.5)**:\n\n• **Tòa I (11 tầng):** Trung tâm Khoa CNTT, phòng máy thực hành (tầng 3-6), các phòng học lý thuyết I.41, I.42, I.52, Hội trường I.\n• **Tòa B & Tòa C:** Khu giảng đường chính, phòng học đại cương và phòng thí nghiệm Vật lý / Hóa học.\n• **Tòa E & Tòa F:** Khu phòng học chuyên đề, văn phòng khoa và phòng seminar.\n• **Dãy A & Thư viện CS1:** Không gian tự học máy lạnh, mượn giáo trình và khu vực giao nhận nhanh của **FORUS**.\n\n📦 Khi đặt **Đồ ăn sáng**, **In ấn tài liệu** hoặc **Thuê thiết bị** trên FORUS, bạn chỉ cần chọn đúng Tòa nhà và nhập mã phòng (VD: *Phòng I.42*), runner FORUS sẽ giao tận cửa lớp trong 10-15 phút!`;
  }

  if (
    q.includes("điểm rèn luyện") ||
    q.includes("đrl") ||
    q.includes("vip") ||
    q.includes("voucher") ||
    q.includes("đổi điểm")
  ) {
    return `Chào ${greetingName}! Bí quyết đạt **90 - 100 Điểm Rèn Luyện (ĐRL)** tại ĐH KHTN và cơ chế **Điểm VIP FORUS**:\n\n1. **Săn Điểm Rèn Luyện tại trường:**\n   - **Mục 1 (Học tập & NCKH - tối đa 30đ):** Tham gia tối thiểu 2 hội thảo học thuật/seminar khoa hoặc cuộc thi học thuật (+5đ đến +10đ/sự kiện).\n   - **Mục 3 (Hoạt động chính trị - xã hội - tối đa 25đ):** Tham gia Chủ nhật xanh, Hiến máu tình nguyện hoặc Xuân tình nguyện.\n   - Bạn có thể bấm nút **"Nhắc Tôi Tham Gia"** ngay trong mục **VIP -> Săn Điểm Rèn Luyện** để FORUS đếm ngược và báo thức trước 30 phút!\n\n2. **Cơ chế Điểm VIP FORUS:**\n   - **Khi mua hàng:** Cộng trực tiếp **+5 đến +10 điểm VIP** vào hạng thành viên.\n   - **Khi đổi ưu đãi:** Trừ điểm VIP tương ứng (50đ đổi Voucher 10k, 60đ đổi Voucher 15k, 100đ giảm 15% toàn bộ giỏ hàng).\n   - **Đặc quyền AI:** Đạt 100 điểm VIP sẽ mở khóa hỏi Trợ lý AI **không giới hạn (∞)**!`;
  }

  if (
    q.includes("ipad") ||
    q.includes("macropad") ||
    q.includes("thuê") ||
    q.includes("casio") ||
    q.includes("máy tính") ||
    q.includes("blouse") ||
    q.includes("giáo trình") ||
    q.includes("in") ||
    q.includes("ăn") ||
    q.includes("bánh mì") ||
    q.includes("cà phê")
  ) {
    return `Chào ${greetingName}! Dưới đây là bảng giá các dịch vụ nổi bật tại **FORUS (Cơ sở 1 - 227 Nguyễn Văn Cừ)**:\n\n• **Thuê & Mua Học Cụ (tùy chọn Thuê ngắn hạn / Mới 80% / 90% / 100%):**\n  - **Máy tính cầm tay (Casio fx-580VN X, fx-880BTG, Vinacal 680EX):** Thuê 15.000đ/ngày | Mua từ 360.000đ.\n  - **Giáo trình đại cương (Vi tích phân, Đại số, Xác suất, C++):** Thuê 20.000đ/tuần | Mua từ 45.000đ.\n  - **Áo Blouse phòng Lab (Size S/M/L/XL):** Thuê 15.000đ/buổi | Mua từ 85.000đ.\n  - **Combo Bảng vẽ "iPad Sinh Viên":** Thuê 35.000đ/tuần | Mua 390.000đ.\n• **Ăn sáng & Cà phê giao tận phòng (15 phút):** Bánh mì ốp la (25k), Xôi mặn lá chuối (25k), Cà phê muối 227 (22k).\n• **In ấn tài liệu & Poster:** Nhận in từ khổ A5, A4 đến Poster A1 giao tận sảnh Tòa I, B, C, E, F!`;
  }

  return `Chào ${greetingName}! Mình là **Trợ lý AI FORUS** tại ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ).\n\nVề câu hỏi của bạn (*"${userMessage}"*):\n• **Hỗ trợ học tập & giải bài:** Mình có thể giải chi tiết từng bước các bài toán **Vi tích phân 1B/2B, Đại số tuyến tính, Toán rời rạc, Xác suất thống kê**, viết code **C/C++, Python** và xuất công thức **LaTeX** chuẩn Khoa CNTT.\n• **Tiện ích tại Cơ sở 1 (227 NVC):** Giao đồ ăn sáng tận phòng học, in tài liệu & Poster A1–A5 lấy liền, cho thuê & bán máy tính Casio / giáo trình / áo blouse (80% – 90% – Mới 100%).\n\nBạn có thể nhập trực tiếp đề bài toán, yêu cầu đoạn code hoặc tên môn học để mình giải chi tiết ngay nhé!`;
}

async function callGeminiWithTimeout(
  ai: GoogleGenAI,
  modelName: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  timeoutMs = 20000
): Promise<string> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
  );

  const apiPromise = ai.models
    .generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    })
    .then((res) => {
      const txt = res?.text?.trim();
      if (!txt) throw new Error(`Empty response from ${modelName}`);
      return txt;
    });

  return Promise.race([apiPromise, timeoutPromise]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "FORUS HCMUS CS1 Backend" });
  });

  // Server-side Gemini API proxy route for FORUS Student Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const body = req.body || {};

      // Support both { message, history, studentInfo } AND { messages, studentName, faculty }
      let userMessage =
        typeof body.message === "string" ? body.message.trim() : "";
      let rawHistory: Array<{ role: string; text: string }> = Array.isArray(
        body.history
      )
        ? body.history
        : [];

      if (
        !userMessage &&
        Array.isArray(body.messages) &&
        body.messages.length > 0
      ) {
        const lastMsg = body.messages[body.messages.length - 1];
        if (lastMsg && typeof lastMsg.text === "string") {
          userMessage = lastMsg.text.trim();
          rawHistory = body.messages.slice(0, -1);
        }
      }

      if (!userMessage) {
        res.status(400).json({ error: "Vui lòng nhập nội dung câu hỏi." });
        return;
      }

      const studentInfo = body.studentInfo || {
        fullName: body.studentName || "Sinh viên KHTN",
        faculty: body.faculty || "",
      };

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        res.json({
          reply: buildFallbackAcademicReply(userMessage, studentInfo?.fullName),
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const contextPrefix = studentInfo
        ? `[Sinh viên đang trò chuyện: ${
            studentInfo.fullName || "Sinh viên KHTN"
          }, MSSV: ${studentInfo.studentId || "Chưa cập nhật"}, Khoa: ${
            studentInfo.faculty || "ĐH KHTN"
          }, Điểm VIP FORUS: ${studentInfo.points ?? 65}/100 điểm]\nCâu hỏi: `
        : "";

      const formattedContents = buildSanitizedContents(
        rawHistory,
        `${contextPrefix}${userMessage}`
      );

      // Prioritize fast, stable models in sequential order
      const candidateModels = [
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
      ];

      let replyText = "";

      for (const modelName of candidateModels) {
        try {
          replyText = await callGeminiWithTimeout(
            ai,
            modelName,
            formattedContents,
            20000
          );
          if (replyText) break;
        } catch (err) {
          console.warn(`Model ${modelName} error, trying next:`, err);
        }
      }

      if (!replyText) {
        replyText = buildFallbackAcademicReply(
          userMessage,
          studentInfo?.fullName
        );
      }

      res.json({ reply: replyText });
    } catch (error: unknown) {
      console.error("FORUS Chatbot API Error:", error);
      const fallbackMsg = buildFallbackAcademicReply(
        req.body?.message || "",
        req.body?.studentInfo?.fullName || req.body?.studentName
      );
      res.json({ reply: fallbackMsg });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FORUS Server running at http://localhost:${PORT}`);
  });
}

startServer();
