export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export interface StudentContextInfo {
  fullName?: string;
  studentId?: string;
  email?: string;
  faculty?: string;
  points?: number;
}

/**
 * Generates an accurate, richly formatted Markdown + LaTeX response for HCMUS students
 * when running on a static host (such as GitHub Pages *.github.io) where no local Node backend exists.
 */
export function generateSmartAcademicReply(
  userMessage: string,
  studentInfo?: StudentContextInfo,
  history: ChatTurn[] = []
): string {
  const raw = userMessage.trim();
  const q = raw.toLowerCase();
  const greetingName = studentInfo?.fullName
    ? studentInfo.fullName.trim().split(/\s+/).slice(-1)[0]
    : "bạn";

  // 1. Direct arithmetic / math expression evaluation (e.g., "125 * 8 + 50", "(2^10 - 24) / 5")
  const mathCandidate = q
    .replace(/tính|bằng bao nhiêu|kết quả của|giá trị của|[=?]/gi, "")
    .trim();
  if (
    mathCandidate.length >= 3 &&
    /[+\-*/^]/.test(mathCandidate) &&
    /^[0-9+\-*/().^\s]+$/.test(mathCandidate)
  ) {
    try {
      const jsExpr = mathCandidate.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${jsExpr});`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        return `Chào ${greetingName}! Kết quả tính biểu thức của bạn là:\n\n**Kết quả:** \`${mathCandidate} = ${result.toLocaleString("vi-VN")}\`\n\n**Mã LaTeX tương ứng:**\n\`\`\`latex\n${mathCandidate.replace(/\*/g, " \\cdot ")} = ${result}\n\`\`\`\n\nNếu bạn cần giải phương trình giải tích, tính định thức ma trận hay khai triển chuỗi số, hãy nhập tiếp câu hỏi nhé!`;
      }
    } catch {
      // Continue to topic matching
    }
  }

  // 2. Calculus: Squeeze Theorem & Limits
  if (
    q.includes("kẹp") ||
    q.includes("squeeze") ||
    q.includes("giới hạn") ||
    q.includes("l'hopital") ||
    q.includes("l'hospital") ||
    /\blim\b/.test(q)
  ) {
    return `Chào ${greetingName}! Dưới đây là kiến thức trọng tâm về **Định lý Kẹp (Squeeze Theorem)** và **Giới hạn** trong Vi tích phân 1B tại ĐH KHTN:

1. **Phát biểu Định lý Kẹp:**
Nếu $f(x) \\le g(x) \\le h(x)$ với mọi $x$ thuộc lân cận điểm $x_0$ và:
$$\\lim_{x \\to x_0} f(x) = \\lim_{x \\to x_0} h(x) = L$$
thì suy ra:
$$\\lim_{x \\to x_0} g(x) = L$$

2. **Ví dụ kinh điển thường gặp trong đề thi Giữa kỳ KHTN:**
Tính $I = \\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right)$:
- Do $-1 \\le \\sin\\left(\\frac{1}{x}\\right) \\le 1, \\forall x \\ne 0$, nhân hai vế với $x^2 \\ge 0$ ta được:
  $$-x^2 \\le x^2 \\sin\\left(\\frac{1}{x}\\right) \\le x^2$$
- Vì $\\lim_{x \\to 0} (-x^2) = 0$ và $\\lim_{x \\to 0} x^2 = 0$, theo **Định lý Kẹp** suy ra $I = 0$.

3. **Code LaTeX chuẩn để chép vào báo cáo:**
\`\`\`latex
\\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right) = 0 \\quad (\\text{theo Định lý Kẹp})
\`\`\``;
  }

  // 3. Calculus: Taylor / Maclaurin / Series
  if (
    q.includes("maclaurin") ||
    q.includes("taylor") ||
    q.includes("sin(x)") ||
    q.includes("chuỗi") ||
    q.includes("hội tụ")
  ) {
    return `Chào ${greetingName}! Dưới đây là bảng **Khai triển Maclaurin** trọng tâm môn Vi tích phân 1B tại ĐH KHTN (quanh $x_0 = 0$):

1. **Các khai triển cơ bản cần nhớ:**
- **Hàm lượng giác:**
  $$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots + (-1)^n \\frac{x^{2n+1}}{(2n+1)!} + o(x^{2n+2})$$
  $$\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots + (-1)^n \\frac{x^{2n}}{(2n)!} + o(x^{2n+1})$$
- **Hàm mũ & Logarit:**
  $$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + o(x^n)$$
  $$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots + (-1)^{n-1}\\frac{x^n}{n} + o(x^n)$$

2. **Code LaTeX chèn nhanh vào Overleaf:**
\`\`\`latex
\\sin(x) = \\sum_{k=0}^{n} (-1)^k \\frac{x^{2k+1}}{(2k+1)!} + o\\left(x^{2n+2}\\right)
\`\`\`

💡 **Mẹo ôn thi:** Bạn có thể đặt **Bộ Flashcard bỏ túi "Cứu Mạng Giữa Kỳ" chống nước (39.000đ)** tại mục **Thuê & Bán** để tra nhanh toàn bộ bảng khai triển và tiêu chuẩn hội tụ chuỗi số nhé!`;
  }

  // 4. Calculus: Integrals & Derivatives
  if (
    q.includes("tích phân") ||
    q.includes("nguyên hàm") ||
    q.includes("đạo hàm") ||
    q.includes("vi phân")
  ) {
    return `Chào ${greetingName}! Dưới đây là phương pháp giải nhanh **Đạo hàm & Tích phân** cùng mã LaTeX chuẩn Khoa Toán - Tin & CNTT:

1. **Công thức Tích phân từng phần (Integration by Parts):**
$$\\int_{a}^{b} u\\,dv = \\left. u \\cdot v \\right|_{a}^{b} - \\int_{a}^{b} v\\,du$$
- **Thứ tự ưu tiên đặt $u$:** *Nhất Lô ($\ln x$) — Nhì Đa ($P(x)$) — Tam Lượng ($\sin, \cos$) — Tứ Mũ ($e^x, a^x$)*.

2. **Đạo hàm riêng & Vector Gradient (Vi tích phân 2B):**
$$\\nabla f(x,y) = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right)$$

3. **Khung code LaTeX cho bài tập Giải tích:**
\`\`\`latex
I = \\int_{0}^{\\pi/2} x \\cos(x)\\,dx = \\left[ x \\sin(x) \\right]_{0}^{\\pi/2} - \\int_{0}^{\\pi/2} \\sin(x)\\,dx = \\frac{\\pi}{2} - 1
\`\`\``;
  }

  // 5. Linear Algebra: Matrix, Determinant, Eigenvalues
  if (
    q.includes("ma trận") ||
    q.includes("định thức") ||
    q.includes("trị riêng") ||
    q.includes("vector riêng") ||
    q.includes("chéo hóa") ||
    q.includes("đại số tuyến tính") ||
    q.includes("gauss")
  ) {
    return `Chào ${greetingName}! Dưới đây là tóm tắt phương pháp giải **Đại số tuyến tính** (Ma trận, Trị riêng & Chéo hóa) và mẫu code LaTeX:

1. **Quy trình tìm Trị riêng & Vector riêng của ma trận vuông $A$ cấp $n$:**
- **Bước 1:** Giải phương trình đặc trưng $\\det(A - \\lambda I_n) = 0$ để tìm các trị riêng $\\lambda_i$.
- **Bước 2:** Với mỗi $\\lambda_i$, giải hệ phương trình tuyến tính thuần nhất $(A - \\lambda_i I_n)X = 0$ để tìm cơ sở không gian con riêng $E(\\lambda_i)$.
- **Bước 3:** Ma trận $A$ chéo hóa được khi và chỉ khi tổng số chiều các không gian con riêng bằng $n$ ($P^{-1}AP = D$).

2. **Mẫu code LaTeX biểu diễn Ma trận & Hệ phương trình:**
\`\`\`latex
\\usepackage{amsmath}
% Ma trận vuông 3x3 và phương trình đặc trưng
\\det(A - \\lambda I) = \\begin{vmatrix}
  a_{11} - \\lambda & a_{12} & a_{13} \\\\
  a_{21} & a_{22} - \\lambda & a_{23} \\\\
  a_{31} & a_{32} & a_{33} - \\lambda
\\end{vmatrix} = 0
\`\`\``;
  }

  // 6. Discrete Math & Induction
  if (
    q.includes("quy nạp") ||
    q.includes("rời rạc") ||
    q.includes("phản chứng") ||
    q.includes("dirichlet") ||
    q.includes("đồ thị") ||
    q.includes("xác suất") ||
    q.includes("bayes")
  ) {
    return `Chào ${greetingName}! Dưới đây là cấu trúc trình bày **Chứng minh Quy nạp Toán học** & **Toán rời rạc** đạt điểm tối đa:

1. **Ba bước chuẩn Chứng minh Quy nạp mệnh đề $P(n), \\forall n \\ge n_0$:**
- **Bước 1 (Cơ sở quy nạp):** Kiểm tra $P(n_0)$ đúng (thường với $n_0 = 1$).
- **Bước 2 (Giả thiết quy nạp):** Giả sử $P(k)$ đúng với một số nguyên dương $k \\ge n_0$ bất kỳ.
- **Bước 3 (Bước quy nạp):** Dùng giả thiết $P(k)$ để chứng minh $P(k+1)$ cũng đúng. Kết luận theo nguyên lý quy nạp toán học, $P(n)$ đúng với mọi $n \\ge n_0$.

2. **Khung LaTeX trình bày bài chứng minh (dùng gói \`amsthm\`):**
\`\`\`latex
\\begin{proof}[Chứng minh bằng quy nạp theo $n$]
  \\textbf{Bước cơ sở ($n=1$):} Mệnh đề đúng vì $VT = VP = 1$.\\\\
  \\textbf{Giả thiết quy nạp:} Giả sử mệnh đề đúng với $n = k \\ge 1$, tức là:
  \\[ \\sum_{i=1}^{k} i = \\frac{k(k+1)}{2} \\]
  \\textbf{Bước quy nạp ($n=k+1$):} Ta có $\\sum_{i=1}^{k+1} i = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$ (đpcm).
\\end{proof}
\`\`\``;
  }

  // 7. LaTeX Templates & Overleaf
  if (
    q.includes("latex") ||
    q.includes("overleaf") ||
    q.includes("đồ án") ||
    q.includes("báo cáo") ||
    q.includes("beamer") ||
    q.includes("csc00006")
  ) {
    return `Chào ${greetingName}! Dưới đây là khung **Template LaTeX Báo cáo Đồ án Khoa CNTT (HCMUS)** chuẩn tiếng Việt trên Overleaf:

\`\`\`latex
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{vietnam}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{graphicx, booktabs, hyperref}
\\usepackage[margin=2.5cm]{geometry}

\\title{\\textbf{TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN - ĐHQG-HCM}\\\\
\\large KHOA CÔNG NGHỆ THÔNG TIN\\\\[0.5cm]
\\textbf{BÁO CÁO ĐỒ ÁN MÔN HỌC (CSC00006)}}
\\author{Họ và tên: ${studentInfo?.fullName || "Nguyễn Văn A"} --- MSSV: ${studentInfo?.studentId || "25120xxx"}}
\\date{\\today}

\\begin{document}
\\maketitle
\\tableofcontents
\\newpage

\\section{Giới thiệu đề tài}
Nội dung báo cáo và công thức toán học: $E = mc^2$.

\\end{document}
\`\`\`

💡 Bạn có thể mở mục **VIP & AI -> Kho 18 Mẫu Code LaTeX** ngay trên thanh công cụ để sao chép chỉ với 1 chạm, hoặc thuê/mua **Bàn phím MacroPad "OneTap LaTeX"** tại mục **Thuê & Bán** nhé!`;
  }

  // 8. Programming: C / C++ / Python / Algorithms
  if (
    q.includes("c++") ||
    q.includes("python") ||
    q.includes("code") ||
    q.includes("lập trình") ||
    q.includes("con trỏ") ||
    q.includes("đệ quy") ||
    q.includes("thuật toán") ||
    q.includes("danh sách liên kết") ||
    q.includes("quy hoạch động")
  ) {
    return `Chào ${greetingName}! Dưới đây là mẫu code chuẩn môn **Nhập môn Lập trình & Cấu trúc dữ liệu (C++)** tại Khoa CNTT ĐH KHTN:

\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Tìm kiếm nhị phân O(log n) & Quy hoạch động cơ bản
int binarySearch(const vector<int>& a, int target) {
    int left = 0, right = (int)a.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56};
    cout << "Vi tri phan tu 23: " << binarySearch(arr, 23) << "\\n";
    return 0;
}
\`\`\`

- **Độ phức tạp thời gian:** $O(\\log n)$ | **Không gian:** $O(1)$.
- Khi quản lý bộ nhớ động với **con trỏ (\`Node*\`)**, luôn nhớ khởi tạo \`nullptr\` và giải phóng bằng \`delete\` để tránh rò rỉ bộ nhớ (memory leak) khi chấm tự động!`;
  }

  // 9. Printing service (A5 to A1 pricing table)
  if (
    q.includes("in ấn") ||
    q.includes("in tài liệu") ||
    q.includes("poster") ||
    q.includes("khổ giấy") ||
    /\ba[1-5]\b/.test(q) ||
    q.includes("photocopy")
  ) {
    return `Chào ${greetingName}! Dưới đây là **Bảng giá In ấn từ khổ A5 đến A1** tại trạm **FORUS CS1 (227 Nguyễn Văn Cừ)**:

1. **In Trắng Đen / Photocopy (Giấy tiêu chuẩn Fort 70gsm – 80gsm):**
- **Khổ A5:** 300 – 500 đ/trang (SL ít) | **150 – 250 đ/trang** (SL lớn >100 tờ)
- **Khổ A4:** 500 – 1.000 đ/trang (Dưới 10 tờ) | **250 – 400 đ/trang** (Trên 100 – 500 tờ)
- **Khổ A3:** 1.000 – 2.000 đ/tờ | **500 – 800 đ/tờ** (SL lớn)
- **Khổ A2:** 5.000 – 8.000 đ/tờ | **1.600 – 3.000 đ/tờ** (SL lớn)
- **Khổ A1:** 10.000 – 15.000 đ/tờ | **2.700 – 6.000 đ/tờ** (SL lớn)

2. **In Màu Toàn Diện (Full Color):**
- **Khổ A5:** 500 – 1.500 đ/trang (Fort) | **2.000 – 5.000 đ/trang** (Couche >180gsm)
- **Khổ A4:** 700 – 2.500 đ/trang (Fort) | **3.000 – 10.000 đ/trang** (Couche >180gsm)
- **Khổ A3:** 1.500 – 5.000 đ/tờ (Fort) | **5.000 – 12.000 đ/tờ** (Couche >180gsm)
- **Khổ A2:** 8.000 – 12.000 đ/tờ (Fort) | **15.000 – 35.000 đ/tờ** (Couche >180gsm)
- **Khổ A1 (Poster Đồ án):** 15.000 – 25.000 đ/tờ (Fort) | **35.000 – 60.000 đ/tờ** (Couche >180gsm)

📦 Bạn có thể tải file PDF/Word/Ảnh trực tiếp tại tab **In Ấn**, chọn khổ A5–A1 và nhận tài liệu sau **15 phút** tại sảnh Tòa I!`;
  }

  // 10. Campus map / buildings / rooms
  if (
    q.includes("tòa") ||
    q.includes("phòng") ||
    q.includes("sơ đồ") ||
    q.includes("cs1") ||
    q.includes("nguyễn văn cừ") ||
    q.includes("thư viện") ||
    q.includes("giảng đường")
  ) {
    return `Chào ${greetingName}! Dưới đây là hướng dẫn **Sơ đồ các tòa nhà tại Cơ sở 1 (227 Nguyễn Văn Cừ, Q.5)**:

- **Tòa nhà I (11 tầng):** Trung tâm Khoa CNTT, সảnh giao nhận FORUS (tầng trệt), phòng máy thực hành E/I, các phòng học lý thuyết I.41, I.42, I.52... và Hội trường I.
- **Dãy B & Dãy C:** Khu giảng đường lý thuyết B11–B44, C11–C45 và phòng thí nghiệm Hóa – Sinh.
- **Dãy E & Dãy F:** Khu phòng máy thực hành CNTT (E301–E305), văn phòng Khoa Toán – Tin học và Khoa Vật lý (Tòa F).
- **Dãy A & Thư viện CS1:** Khu tự học máy lạnh yên tĩnh, tra cứu giáo trình và học nhóm.

🗺️ Bạn có thể mở tab **VIP & AI -> Sơ Đồ Tầng (B1 – L11)** để xem chi tiết từng phòng học theo từng tầng!`;
  }

  // 11. Training Points (ĐRL) & VIP Points
  if (
    q.includes("điểm rèn luyện") ||
    q.includes("đrl") ||
    q.includes("vip") ||
    q.includes("voucher") ||
    q.includes("đổi điểm") ||
    q.includes("sự kiện")
  ) {
    return `Chào ${greetingName}! Dưới đây là bí quyết tối ưu **Điểm Rèn Luyện (ĐRL)** tại ĐH KHTN và đặc quyền **Điểm VIP FORUS**:

1. **Cách đạt 90 – 100 Điểm Rèn Luyện mỗi học kỳ:**
- **Mục 1 (Học thuật & NCKH - tối đa 30đ):** Tham gia hội thảo AI, Workshop LaTeX hoặc cuộc thi học thuật (+5 đến +10 ĐRL/sự kiện).
- **Mục 3 (Tình nguyện & Xã hội - tối đa 25đ):** Tham gia ngày hội Đổi rác lấy cây xanh Green Campus, Hiến máu tình nguyện (+8 ĐRL).
- Bấm nút **"Nhắc Tôi Tham Gia"** trong tab **Sự Kiện** để nhận thông báo trước khi hết hạn đăng ký!

2. **Đặc quyền Điểm VIP FORUS (Hiện tại bạn có ${studentInfo?.points ?? 65}/100 điểm):**
- Mỗi đơn Thuê/Mua học cụ, Đặt đồ ăn sáng hoặc In ấn cộng ngay **+5 đến +10 điểm VIP**.
- Đủ **100 điểm VIP**: Mở khóa hỏi **Trợ lý AI không giới hạn (∞)** 24/7 và đổi Voucher giảm **15% tổng đơn hàng**!`;
  }

  // 12. Gear, Calculators, Textbooks, Blouse, TechRescue, Food
  if (
    q.includes("ipad") ||
    q.includes("macropad") ||
    q.includes("thuê") ||
    q.includes("casio") ||
    q.includes("vinacal") ||
    q.includes("flexio") ||
    q.includes("thiên long") ||
    q.includes("máy tính") ||
    q.includes("blouse") ||
    q.includes("giáo trình") ||
    q.includes("techrescue") ||
    q.includes("hdmi") ||
    q.includes("ăn") ||
    q.includes("bánh mì") ||
    q.includes("cà phê") ||
    q.includes("gia sư")
  ) {
    return `Chào ${greetingName}! Dưới đây là bảng giá các tiện ích nổi bật của **FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ)**:

1. **Thuê & Mua Thiết Bị Học Tập (Tùy chọn Thuê ngắn hạn / Độ mới 80% / 90% / Mới 100%):**
- **Máy tính cầm tay (Casio fx-580VN X, fx-880BTG, Vinacal 680EX Plus/III, Thiên Long Flexio Fx799VN):**
  • Thuê ngắn hạn: **15.000đ / ngày** hoặc **45.000đ / tuần** (đã thay pin mới, không cọc CCCD với email \`@student.hcmus.edu.vn\`).
  • Mua đứt (80% – 90% – Mới 100%): Từ **315.000đ – 675.000đ** tùy dòng máy, bảo hành 6–12 tháng.
- **Bộ Dụng Cụ "TechRescue" (Hub USB-C + HDMI máy chiếu + Chuột không dây Silent):** Thuê **20.000đ/buổi** thuyết trình | **30.000đ/ngày** | Mua từ **210.000đ**.
- **10 Giáo trình Đại cương KHTN (Vi tích phân 1&2, Đại số, Xác suất, Vật lý, Mạng MT, Chính trị):** Thuê **15.000đ/tuần**, **35.000đ/học kỳ** | Mua từ **22.000đ**.
- **Áo Blouse Trắng Phòng Lab (Size S, M, L, XL):** Thuê **15.000đ/buổi** | Mua từ **55.000đ**.
- **Combo Bảng vẽ "iPad Sinh Viên":** Thuê **35.000đ/tuần** | Mua mới **390.000đ**.

2. **Đồ Ăn Sáng & Cà Phê Giao Tận Phòng (10–15 phút):**
- Bánh mì thịt nướng ốp la (25k), Cơm tấm sườn nướng (35k), Xôi lá chuối (18k), Cà phê kem muối (22k), Hồng trà đào (20k).`;
  }

  // 13. Contextual general response
  const recentTopicHint =
    history.length > 1
      ? `\n\n💡 Bạn có thể hỏi tiếp chi tiết hơn hoặc chọn một chủ đề bên dưới để mình giải từng bước kèm code **LaTeX / C++ / Python** nhé!`
      : `\n\n💡 Bạn có thể gửi trực tiếp **biểu thức toán học** (VD: \`(2^10 - 24) / 5\`), yêu cầu giải **Định lý Kẹp, Khai triển Maclaurin, Ma trận, Quy nạp**, xuất **code LaTeX / C++**, hoặc tra cứu **bảng giá In ấn A5–A1 & Thuê máy tính Casio** ngay tại đây!`;

  return `Chào ${greetingName}! Mình là **Trợ lý AI FORUS** đồng hành cùng sinh viên **ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ)**.

Về nội dung bạn vừa nhắn (*"${raw}"*), mình sẵn sàng hỗ trợ ngay theo 3 nhóm chuyên sâu:

1. **Giải Toán Đại Cương & Xuất Code LaTeX:**
   - Giải chi tiết từng bước **Vi tích phân 1B/2B** (Giới hạn, Định lý Kẹp, Đạo hàm, Tích phân, Chuỗi Maclaurin/Taylor), **Đại số tuyến tính** (Định thức, Trị riêng, Chéo hóa ma trận), **Toán rời rạc** (Quy nạp, Đồ thị) & **Xác suất thống kê**.
2. **Lập Trình & Đồ Án Khoa CNTT:**
   - Gỡ lỗi code **C/C++, Python**, cấu trúc dữ liệu (Con trỏ, Danh sách liên kết, Quy hoạch động, Tìm kiếm nhị phân) và khung báo cáo **LaTeX Đồ án 1 (CSC00006)**.
3. **Tiện Ích Học Đường FORUS 227 NVC:**
   - Tư vấn thuê/mua **Máy tính Casio/Vinacal/Flexio** (15k/ngày), **Bộ cáp thuyết trình TechRescue** (20k/buổi), **Áo Blouse**, **Giáo trình**, **In ấn khổ A5–A1** và **Giao đồ ăn sáng** tận phòng học.${recentTopicHint}`;
}

const REMOTE_BACKEND_API_URL =
  "https://ais-pre-m3uzfjjxhiiaafj3oeiozr-312905538557.asia-northeast1.run.app/api/chat";

async function tryFetchJsonChat(
  endpointUrl: string,
  payload: Record<string, unknown>,
  timeoutMs = 12000
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    if (response.ok && contentType.includes("application/json")) {
      const data = await response.json();
      if (data && typeof data.reply === "string" && data.reply.trim()) {
        return data.reply.trim();
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Unified chat client for FORUS AI Assistant.
 * 1. On full-stack origins, calls `/api/chat`.
 * 2. On static hosts (such as GitHub Pages `*.github.io`), calls the CORS-enabled Cloud Run `/api/chat` backend.
 * 3. Safely validates `Content-Type: application/json` so HTML 404 pages never throw `Unexpected token '<'`.
 * 4. Automatically falls back to the built-in Smart Academic & Campus AI Engine if offline or unreachable.
 */
export async function requestForusAiReply(params: {
  message: string;
  history: ChatTurn[];
  studentInfo: StudentContextInfo;
}): Promise<string> {
  const { message, history, studentInfo } = params;
  const payload = {
    message,
    history,
    messages: [...history, { role: "user", text: message }],
    studentInfo,
  };

  const isStaticHost =
    typeof window !== "undefined" &&
    (window.location.hostname.endsWith("github.io") ||
      window.location.protocol === "file:");

  if (!isStaticHost) {
    const localReply = await tryFetchJsonChat("/api/chat", payload, 15000);
    if (localReply) return localReply;
  }

  const remoteReply = await tryFetchJsonChat(
    REMOTE_BACKEND_API_URL,
    payload,
    10000
  );
  if (remoteReply) return remoteReply;

  // Simulate natural AI thinking delay (350ms) when serving from the client-side engine on static hosts
  await new Promise((resolve) => setTimeout(resolve, 350));
  return generateSmartAcademicReply(message, studentInfo, history);
}
