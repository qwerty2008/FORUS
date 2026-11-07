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

type SharedChatListener = (userText: string, modelReply: string) => void;
const sharedChatListeners = new Set<SharedChatListener>();

/**
 * Allows the main VIP Hub chat and the bottom-right Floating Chat Popup
 * to stay synchronized whenever a question is answered in either window.
 */
export function subscribeSharedChatExchange(
  listener: SharedChatListener
): () => void {
  sharedChatListeners.add(listener);
  return () => {
    sharedChatListeners.delete(listener);
  };
}

function notifySharedChatExchange(userText: string, modelReply: string) {
  sharedChatListeners.forEach((listener) => {
    try {
      listener(userText, modelReply);
    } catch {
      // ignore listener errors
    }
  });
}

const CACHE_STORAGE_KEY = "forus_ai_answer_cache_v3";
const memoryAnswerCache = new Map<string, string>();

function normalizeQuestionKey(q: string): string {
  return q
    .toLowerCase()
    .replace(/[?!.,;:"'“”‘’]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCachedAiAnswer(question: string): string | null {
  const key = normalizeQuestionKey(question);
  if (!key) return null;
  if (memoryAnswerCache.has(key)) {
    return memoryAnswerCache.get(key) || null;
  }
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (raw) {
        const parsed: Record<string, string> = JSON.parse(raw);
        if (parsed[key]) {
          memoryAnswerCache.set(key, parsed[key]);
          return parsed[key];
        }
      }
    } catch {
      // ignore storage errors
    }
  }
  return null;
}

function saveCachedAiAnswer(question: string, answer: string) {
  const key = normalizeQuestionKey(question);
  if (!key || !answer.trim()) return;
  memoryAnswerCache.set(key, answer);
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
      const parsed: Record<string, string> = raw ? JSON.parse(raw) : {};
      parsed[key] = answer;
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
      // ignore storage errors
    }
  }
}

const FORUS_SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI Học thuật FORUS (227 NVC) dành cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (HCMUS) tại Cơ sở 1 - 227 Nguyễn Văn Cừ, Quận 5, TP.HCM.

NGUYÊN TẮC PHẢN HỒI BẮT BUỘC:
1. TRẢ LỜI ĐÚNG TRỌNG TÂM & TỰ ĐỘNG ĐIỀU CHỈNH ĐỘ DÀI:
   - Đi thẳng vào câu trả lời ngay từ câu đầu tiên, không chào hỏi rườm rà, không liệt kê danh mục dịch vụ nếu người dùng không hỏi.
   - Câu hỏi ngắn / định nghĩa / tra cứu nhanh / kiến thức xã hội: Trả lời ngắn gọn trong 2–4 câu súc tích, chính xác.
   - Bài tập Toán / Vật lý / Hóa học / Lập trình phức tạp: Giải chi tiết từng bước rõ ràng đến đáp số cuối cùng.
2. HIỂN THỊ CÔNG THỨC TOÁN HỌC TRỰC QUAN (KHÔNG LỖI FONT, ẨN CODE LATEX THÔ):
   - Đặt công thức nội dòng trong $...$ (ví dụ: $f'(x) = 3x^2 - 6x + 2$) và công thức khối riêng dòng trong $$...$$.
   - TUYỆT ĐỐI KHÔNG xuất khối code \`\`\`latex ... \`\`\` thô trong câu trả lời. Chỉ dùng ký hiệu toán học trực quan $...$ và $$...$$.
   - Với code lập trình (C++, Python, Java, JS, SQL), vẫn đặt trong khối \`\`\`cpp hoặc \`\`\`python chuẩn.
3. THÔNG TIN CẬP NHẬT & HỆ SINH THÁI FORUS:
   - Thông tin thời sự Việt Nam cập nhật: Chủ tịch nước CHXHCN Việt Nam hiện nay là ông **Lương Cường** (nhậm chức từ tháng 10/2024); Thủ tướng Chính phủ là ông **Phạm Minh Chính**; Tổng Bí thư là ông **Tô Lâm**; Chủ tịch Quốc hội là ông **Trần Thanh Mẫn**.
   - Tiện ích FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ):
     • Thuê & Mua Học cụ: Máy tính Casio fx-580VN X / fx-880BTG / Vinacal 680EX / Thiên Long Flexio Fx799VN (Thuê 15.000đ/ngày, 45.000đ/tuần; Mua 80%/90%/Mới 100%), Giá đỡ công thái học 15° Laptop/Bảng vẽ & Chân Standee Poster A1/A2 (Thuê 10.000đ/ngày, 25.000đ/tuần; Mua 45k–75k), Bộ cáp thuyết trình TechRescue (Thuê 20.000đ/buổi, 30.000đ/ngày), Áo Blouse phòng Lab (Thuê 15.000đ/buổi), 10 Giáo trình đại cương (Thuê 15.000đ/tuần, 35.000đ/học kỳ), Bàn phím MacroPad OneTap LaTeX, Combo bảng vẽ iPad Sinh Viên.
     • In ấn tài liệu khổ A5 đến A1: In trắng đen A5 (150–500đ), A4 (250–1.000đ), A3 (500–2.000đ), A2 (1.600–8.000đ), A1 (2.700–15.000đ); In màu giấy Fort hoặc Couche >180gsm; hỗ trợ thuê kèm Giá đỡ Poster (+10k/buổi, +15k/ngày, +30k/tuần).
     • Điểm VIP & Kho Voucher Thanh toán: Điểm VIP chỉ cộng KHI XÁC NHẬN THANH TOÁN ĐƠN HÀNG. Có Kho Voucher đổi bằng Điểm VIP (VIP50 giảm 10k, VIP60 giảm 15k, VIP100 giảm 15%) và Điểm ĐRL/GPA (DRL80PLUS giảm 15% cho ĐRL >= 80, GPA32PLUS giảm 12k cho GPA >= 3.2, FORUSKHTN giảm 10%, CSC00006 giảm 15k).`;

/**
 * Attempts to solve a quadratic equation ax^2 + bx + c = 0 if present in the user message.
 */
function trySolveQuadraticEquation(raw: string): string | null {
  const normalized = raw
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/\*\*/g, "^")
    .toLowerCase();

  const match = normalized.match(
    /([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d+\.?\d*)=0/
  );
  if (!match) return null;

  const parseCoeff = (s: string) => {
    if (s === "" || s === "+") return 1;
    if (s === "-") return -1;
    return Number(s);
  };

  const a = parseCoeff(match[1]);
  const b = parseCoeff(match[2]);
  const c = Number(match[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a === 0) {
    return null;
  }

  const delta = b * b - 4 * a * c;
  const eqDisplay = `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`
  }x ${c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`} = 0`;

  if (delta > 0) {
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(4));
    return `**Giải phương trình bậc hai $${eqDisplay}$:**

1. **Tính biệt thức $\\Delta$:**
   - Hệ số: $a = ${a},\\; b = ${b},\\; c = ${c}$
   - $\\Delta = b^2 - 4ac = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${delta} > 0$

2. **Phương trình có 2 nghiệm thực phân biệt:**
$$x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{${-b} + \\sqrt{${delta}}}{${2 * a}} = \\mathbf{${fmt(x1)}}$$
$$x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{${-b} - \\sqrt{${delta}}}{${2 * a}} = \\mathbf{${fmt(x2)}}$$`;
  }

  if (delta === 0) {
    const x0 = -b / (2 * a);
    return `**Giải phương trình $${eqDisplay}$:**
- Ta có $\\Delta = b^2 - 4ac = ${delta} = 0$, nên phương trình có **nghiệm kép**:
$$x_1 = x_2 = -\\frac{b}{2a} = \\mathbf{${x0}}$$`;
  }

  const realPart = (-b / (2 * a)).toFixed(3);
  const imagPart = (Math.sqrt(-delta) / Math.abs(2 * a)).toFixed(3);
  return `**Giải phương trình $${eqDisplay}$:**
- Ta có $\\Delta = ${delta} < 0$, nên phương trình vô nghiệm trên $\\mathbb{R}$ và có **2 nghiệm phức liên hợp** trên $\\mathbb{C}$:
$$x_{1,2} = ${realPart} \\pm ${imagPart}i$$`;
}

/**
 * Attempts to solve a linear equation ax + b = c if present in the user message.
 */
function trySolveLinearEquation(raw: string): string | null {
  const normalized = raw
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .toLowerCase();
  if (normalized.includes("x^")) return null;

  const match = normalized.match(
    /([+-]?\d*\.?\d*)x([+-]\d+\.?\d*)?=([+-]?\d+\.?\d*)/
  );
  if (!match) return null;

  const aStr = match[1];
  const a =
    aStr === "" || aStr === "+" ? 1 : aStr === "-" ? -1 : Number(aStr);
  const b = match[2] ? Number(match[2]) : 0;
  const rhs = Number(match[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(rhs) || a === 0) {
    return null;
  }

  const xVal = (rhs - b) / a;
  const fmt = Number.isInteger(xVal) ? String(xVal) : xVal.toFixed(4);
  return `**Giải phương trình bậc nhất:**
$$${a === 1 ? "" : a === -1 ? "-" : a}x ${
    b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`
  } = ${rhs} \\iff ${a === 1 ? "" : a === -1 ? "-" : a}x = ${
    rhs - b
  } \\iff x = \\mathbf{${fmt}}$$`;
}

/**
 * Computes the derivative of a single-variable polynomial in x if requested.
 */
function trySolvePolynomialDerivative(raw: string): string | null {
  const q = raw.toLowerCase();
  if (!q.includes("đạo hàm") && !q.includes("f'(x)") && !q.includes("y'")) {
    return null;
  }

  const eqParts = raw.split("=");
  const candidateRaw =
    eqParts.length > 1
      ? eqParts[eqParts.length - 1]
      : raw.replace(/.*?(?:của|hàm số|biểu thức)\s*/i, "");

  const clean = candidateRaw
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/\*\*/g, "^")
    .replace(/[?.!]/g, "");

  if (!clean.includes("x") || /[^0-9x^+\-.]/.test(clean)) {
    return null;
  }

  const termRegex = /([+-]?\d*\.?\d*)x(?:\^(\d+))?|([+-]?\d+\.?\d*)/g;
  const derivTerms: string[] = [];
  let match: RegExpExecArray | null;
  let matchedAny = false;

  while ((match = termRegex.exec(clean)) !== null) {
    if (!match[0]) continue;
    matchedAny = true;
    if (match[3] !== undefined) {
      continue;
    }
    const coeffStr = match[1];
    const coeff =
      coeffStr === "" || coeffStr === "+"
        ? 1
        : coeffStr === "-"
        ? -1
        : Number(coeffStr);
    const exp = match[2] !== undefined ? Number(match[2]) : 1;
    if (!Number.isFinite(coeff) || !Number.isFinite(exp) || exp === 0) continue;

    const newCoeff = coeff * exp;
    const newExp = exp - 1;
    if (newCoeff === 0) continue;

    const sign = newCoeff > 0 ? "+" : "-";
    const absC = Math.abs(newCoeff);
    let termStr = "";
    if (newExp === 0) {
      termStr = `${absC}`;
    } else if (newExp === 1) {
      termStr = absC === 1 ? "x" : `${absC}x`;
    } else {
      termStr = absC === 1 ? `x^${newExp}` : `${absC}x^${newExp}`;
    }
    derivTerms.push(
      derivTerms.length === 0
        ? newCoeff < 0
          ? `-${termStr}`
          : termStr
        : `${sign} ${termStr}`
    );
  }

  if (!matchedAny) return null;
  const finalDeriv = derivTerms.length > 0 ? derivTerms.join(" ") : "0";

  return `**Tính đạo hàm của hàm số $f(x) = ${clean}$:**

Áp dụng quy tắc đạo hàm lũy thừa $(x^n)' = n \\cdot x^{n-1}$, ta có:
$$f'(x) = ${finalDeriv}$$`;
}

/**
 * Checks if the user is asking a direct factual/math/FORUS question that we can answer
 * with 100% accuracy immediately (or as a high-precision local knowledge matcher).
 */
export function tryMatchDirectKnowledge(
  userMessage: string,
  studentInfo?: StudentContextInfo
): string | null {
  const raw = userMessage.trim();
  const q = raw.toLowerCase();

  // 1. Quadratic, linear, and derivative solvers
  const quadSolution = trySolveQuadraticEquation(raw);
  if (quadSolution) return quadSolution;

  const linearSolution = trySolveLinearEquation(raw);
  if (linearSolution) return linearSolution;

  const derivSolution = trySolvePolynomialDerivative(raw);
  if (derivSolution) return derivSolution;

  // 2. Direct arithmetic / math expression evaluation
  const mathCandidate = q
    .replace(/tính|bằng bao nhiêu|kết quả của|giá trị của|giải|[=?]/gi, "")
    .trim();
  if (
    mathCandidate.length >= 2 &&
    /[+\-*/^]/.test(mathCandidate) &&
    /^[0-9+\-*/().^\s]+$/.test(mathCandidate)
  ) {
    try {
      const jsExpr = mathCandidate.replace(/\^/g, "**");
      const result = Function(`"use strict"; return (${jsExpr});`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        return `**Kết quả tính biểu thức:**\n\n$$${mathCandidate.replace(
          /\*/g,
          " \\cdot "
        )} = \\mathbf{${result.toLocaleString("vi-VN")}}$$`;
      }
    } catch {
      // Continue
    }
  }

  // 3. Up-to-date Vietnam Civic & State Leadership Facts (often outdated in older LLMs)
  if (q.includes("chủ tịch nước")) {
    return `Chủ tịch nước Cộng hòa xã hội chủ nghĩa Việt Nam hiện nay là ông **Lương Cường** (được Quốc hội khóa XV bầu giữ chức Chủ tịch nước từ ngày 21/10/2024).`;
  }
  if (q.includes("thủ tướng") && (q.includes("việt nam") || !q.includes("nước nào"))) {
    return `Thủ tướng Chính phủ nước Cộng hòa xã hội chủ nghĩa Việt Nam hiện nay là ông **Phạm Minh Chính**.`;
  }
  if (q.includes("tổng bí thư")) {
    return `Tổng Bí thư Ban Chấp hành Trung ương Đảng Cộng sản Việt Nam hiện nay là ông **Tô Lâm**.`;
  }
  if (q.includes("chủ tịch quốc hội")) {
    return `Chủ tịch Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam hiện nay là ông **Trần Thanh Mẫn**.`;
  }

  // 4. Calculus: Squeeze Theorem & Limits
  if (
    q.includes("kẹp") ||
    q.includes("squeeze") ||
    q.includes("l'hopital") ||
    q.includes("l'hospital") ||
    (q.includes("giới hạn") && !q.includes("không giới hạn")) ||
    /\blim\b/.test(q)
  ) {
    return `**Định lý Kẹp (Squeeze Theorem) & Giới hạn trong Vi tích phân 1B:**

1. **Phát biểu Định lý Kẹp:**
Nếu $f(x) \\le g(x) \\le h(x)$ với mọi $x$ thuộc lân cận điểm $x_0$ và:
$$\\lim_{x \\to x_0} f(x) = \\lim_{x \\to x_0} h(x) = L$$
thì suy ra:
$$\\lim_{x \\to x_0} g(x) = L$$

2. **Ví dụ trọng tâm trong đề thi Giữa kỳ KHTN:**
Tính $I = \\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right)$:
- Do $-1 \\le \\sin\\left(\\frac{1}{x}\\right) \\le 1, \\forall x \\ne 0$, nhân hai vế với $x^2 \\ge 0$ ta được:
$$-x^2 \\le x^2 \\sin\\left(\\frac{1}{x}\\right) \\le x^2$$
- Vì $\\lim_{x \\to 0} (-x^2) = 0$ và $\\lim_{x \\to 0} x^2 = 0$, theo **Định lý Kẹp** suy ra $I = 0$.`;
  }

  // 5. Calculus: Taylor / Maclaurin / Series
  if (
    q.includes("maclaurin") ||
    q.includes("taylor") ||
    q.includes("sin(x)") ||
    q.includes("chuỗi") ||
    q.includes("hội tụ")
  ) {
    return `**Bảng Khai triển Maclaurin trọng tâm môn Vi tích phân 1B (quanh $x_0 = 0$):**

- **Hàm lượng giác:**
$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots + (-1)^n \\frac{x^{2n+1}}{(2n+1)!} + o(x^{2n+2})$$
$$\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots + (-1)^n \\frac{x^{2n}}{(2n)!} + o(x^{2n+1})$$
- **Hàm mũ & Logarit:**
$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + o(x^n)$$
$$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots + (-1)^{n-1}\\frac{x^n}{n} + o(x^n)$$`;
  }

  // 6. Calculus: Integrals & Derivatives
  if (
    q.includes("tích phân") ||
    q.includes("nguyên hàm") ||
    q.includes("đạo hàm") ||
    q.includes("vi phân")
  ) {
    return `**Phương pháp giải nhanh Đạo hàm & Tích phân (Vi tích phân 1B/2B):**

1. **Công thức Tích phân từng phần (Integration by Parts):**
$$\\int_{a}^{b} u\\,dv = \\left. u \\cdot v \\right|_{a}^{b} - \\int_{a}^{b} v\\,du$$
- **Thứ tự ưu tiên đặt $u$:** *Nhất Lô ($\\ln x$) — Nhì Đa ($P(x)$) — Tam Lượng ($\\sin, \\cos$) — Tứ Mũ ($e^x, a^x$)*.

2. **Đạo hàm riêng & Vector Gradient (Vi tích phân 2B):**
$$\\nabla f(x,y) = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y} \\right)$$

3. **Ví dụ áp dụng:**
$$I = \\int_{0}^{\\pi/2} x \\cos(x)\\,dx = \\left[ x \\sin(x) \\right]_{0}^{\\pi/2} - \\int_{0}^{\\pi/2} \\sin(x)\\,dx = \\frac{\\pi}{2} - 1$$`;
  }

  // 7. Linear Algebra: Matrix, Determinant, Eigenvalues
  if (
    q.includes("ma trận") ||
    q.includes("định thức") ||
    q.includes("trị riêng") ||
    q.includes("vector riêng") ||
    q.includes("chéo hóa") ||
    q.includes("đại số tuyến tính") ||
    q.includes("gauss")
  ) {
    return `**Phương pháp tìm Trị riêng, Vector riêng & Chéo hóa Ma trận:**

1. **Bước 1 (Đa thức đặc trưng):** Giải phương trình đặc trưng để tìm các trị riêng $\\lambda_i$:
$$\\det(A - \\lambda I_n) = \\begin{vmatrix} a_{11} - \\lambda & a_{12} & a_{13} \\\\ a_{21} & a_{22} - \\lambda & a_{23} \\\\ a_{31} & a_{32} & a_{33} - \\lambda \\end{vmatrix} = 0$$
2. **Bước 2 (Không gian con riêng):** Với mỗi $\\lambda_i$, giải hệ thuần nhất $(A - \\lambda_i I_n)X = 0$ để tìm cơ sở không gian riêng $E(\\lambda_i)$.
3. **Bước 3 (Chéo hóa):** Ma trận $A$ chéo hóa được khi và chỉ khi tổng số chiều các không gian con riêng bằng $n$, khi đó $P^{-1}AP = D$.`;
  }

  // 8. Discrete Math & Induction
  if (
    q.includes("quy nạp") ||
    q.includes("rời rạc") ||
    q.includes("phản chứng") ||
    q.includes("dirichlet") ||
    q.includes("đồ thị") ||
    q.includes("xác suất") ||
    q.includes("bayes")
  ) {
    return `**Phương pháp Chứng minh Quy nạp Toán học ($P(n), \\forall n \\ge n_0$):**

1. **Bước cơ sở ($n = n_0$):** Kiểm tra mệnh đề $P(n_0)$ đúng (thường với $n_0 = 1$).
2. **Giả thiết quy nạp:** Giả sử $P(k)$ đúng với một số nguyên dương $k \\ge n_0$ bất kỳ:
$$\\sum_{i=1}^{k} i = \\frac{k(k+1)}{2}$$
3. **Bước quy nạp ($n = k + 1$):** Chứng minh $P(k+1)$ cũng đúng:
$$\\sum_{i=1}^{k+1} i = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$$`;
  }

  // 9. Programming: C / C++ / Python / Algorithms
  if (
    q.includes("c++") ||
    q.includes("python") ||
    q.includes("nhị phân") ||
    q.includes("binary search") ||
    q.includes("con trỏ") ||
    q.includes("đệ quy") ||
    q.includes("danh sách liên kết") ||
    q.includes("quy hoạch động")
  ) {
    return `**Thuật toán Tìm kiếm nhị phân (C++) chuẩn môn Nhập môn Lập trình & CTDL:**

\`\`\`cpp
#include <iostream>
#include <vector>
using namespace std;

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
\`\`\`

- **Độ phức tạp thời gian:** $O(\\log n)$ | **Độ phức tạp không gian:** $O(1)$.`;
  }

  // 10. Printing service (A5 to A1 pricing table + stand rental)
  if (
    q.includes("in ấn") ||
    q.includes("in tài liệu") ||
    q.includes("poster") ||
    q.includes("khổ giấy") ||
    /\ba[1-5]\b/.test(q) ||
    q.includes("photocopy")
  ) {
    return `**Bảng giá In ấn từ khổ A5 đến A1 & Thuê Giá đỡ tại FORUS CS1 (227 NVC):**

1. **In Trắng Đen / Photocopy (Giấy Fort 70–80gsm):**
- **Khổ A5:** 300 – 500 đ/trang (SL ít) | **150 – 250 đ/trang** (SL lớn $\\ge 100$ tờ)
- **Khổ A4:** 500 – 1.000 đ/trang | **250 – 400 đ/trang** (SL lớn)
- **Khổ A3:** 1.000 – 2.000 đ/tờ | **500 – 800 đ/tờ** (SL lớn)
- **Khổ A2:** 5.000 – 8.000 đ/tờ | **1.600 – 3.000 đ/tờ** (SL lớn)
- **Khổ A1:** 10.000 – 15.000 đ/tờ | **2.700 – 6.000 đ/tờ** (SL lớn)

2. **In Màu Toàn Diện (Giấy Fort / Giấy ảnh Couche $>180\\text{gsm}$):**
- **Khổ A5:** 500 – 1.500 đ/trang | Couche: **2.000 – 5.000 đ/trang**
- **Khổ A4:** 700 – 2.500 đ/trang | Couche: **3.000 – 10.000 đ/trang**
- **Khổ A3:** 1.500 – 5.000 đ/tờ | Couche: **5.000 – 12.000 đ/tờ**
- **Khổ A2:** 8.000 – 12.000 đ/tờ | Couche: **15.000 – 35.000 đ/tờ**
- **Khổ A1 (Poster Đồ án):** 15.000 – 25.000 đ/tờ | Couche: **35.000 – 60.000 đ/tờ**
- **Tùy chọn Thuê Giá Đỡ kèm theo:** $+10.000\\text{đ/buổi}$, $+15.000\\text{đ/ngày}$ (Standee chữ X A1–A2) hoặc $+30.000\\text{đ/tuần}$.`;
  }

  // 11. Campus map / buildings / rooms
  if (
    q.includes("tòa") ||
    q.includes("sơ đồ") ||
    q.includes("cs1") ||
    q.includes("nguyễn văn cừ") ||
    q.includes("giảng đường")
  ) {
    return `**Sơ đồ các tòa nhà tại Cơ sở 1 (227 Nguyễn Văn Cừ, Quận 5):**

- **Tòa nhà I (11 tầng):** Trung tâm Khoa CNTT, sảnh giao nhận FORUS (tầng trệt), phòng máy thực hành E/I, phòng lý thuyết I.41, I.42, I.52 và Hội trường I.
- **Dãy B & Dãy C:** Khu giảng đường lý thuyết B11–B44, C11–C45 và phòng thí nghiệm Hóa – Sinh.
- **Dãy E & Dãy F:** Khu phòng máy thực hành CNTT (E301–E305), văn phòng Khoa Toán – Tin học và Khoa Vật lý.
- **Dãy A & Thư viện CS1:** Khu tự học máy lạnh yên tĩnh, tra cứu giáo trình và học nhóm.`;
  }

  // 12. Training Points (ĐRL), GPA Vouchers & VIP Points
  if (
    q.includes("điểm rèn luyện") ||
    q.includes("đrl") ||
    q.includes("vip") ||
    q.includes("voucher") ||
    q.includes("mã giảm") ||
    q.includes("đổi điểm")
  ) {
    return `**Cơ chế Điểm VIP FORUS & Kho Voucher Thanh Toán (Điểm hiện tại: ${studentInfo?.points ?? 0}/100đ):**

1. **Quy tắc Cộng Điểm VIP:** Điểm VIP **chỉ được cộng khi xác nhận thanh toán đơn hàng** (mỗi đơn cộng từ $+5$ đến $+15$ điểm VIP).
2. **Kho Voucher Đổi Bằng Điểm VIP:**
   - **VIP50** ($50\\text{đ}$ VIP): Giảm $10.000\\text{đ}$.
   - **VIP60** ($60\\text{đ}$ VIP): Giảm $15.000\\text{đ}$ (đơn từ $30.000\\text{đ}$).
   - **VIP100** ($100\\text{đ}$ VIP): Giảm $15\\%$ tổng hóa đơn.
3. **Kho Voucher Điểm ĐRL, GPA & Khác:**
   - \`DRL80PLUS\`: Giảm $15\\%$ cho SV có Điểm Rèn Luyện $\\ge 80$.
   - \`GPA32PLUS\`: Giảm $12.000\\text{đ}$ cho SV có GPA $\\ge 3.2/4.0$.
   - \`FORUSKHTN\`: Giảm $10\\%$ Email SV ĐH KHTN | \`CSC00006\`: Giảm $15.000\\text{đ}$ Đồ án 1.`;
  }

  // 13. Gear, Calculators, Textbooks, Blouse, Stand, TechRescue
  if (
    q.includes("giá đỡ") ||
    q.includes("standee") ||
    q.includes("ipad") ||
    q.includes("macropad") ||
    q.includes("thuê") ||
    q.includes("casio") ||
    q.includes("vinacal") ||
    q.includes("flexio") ||
    q.includes("thiên long") ||
    q.includes("máy tính cầm tay") ||
    q.includes("blouse") ||
    q.includes("giáo trình") ||
    q.includes("techrescue") ||
    q.includes("gia sư")
  ) {
    return `**Bảng giá Thuê & Mua Thiết Bị Học Tập tại FORUS CS1 (227 Nguyễn Văn Cừ):**

- **Máy tính cầm tay (Casio fx-580VN X, fx-880BTG, Vinacal 680EX Plus/III, Thiên Long Flexio Fx799VN):** Thuê **$15.000\\text{đ/ngày}$**, **$45.000\\text{đ/tuần}$** | Mua đứt (80% – 90% – Mới 100%): $315.000\\text{đ} - 675.000\\text{đ}$.
- **Giá đỡ Công Thái Học 15° (Laptop, Bảng vẽ & Chân Standee Poster A1–A2):** Thuê **$10.000\\text{đ/ngày}$**, **$25.000\\text{đ/tuần}$** | Mua đứt (80% – 90% – Mới 100%): $45.000\\text{đ} - 75.000\\text{đ}$.
- **Bộ Dụng Cụ "TechRescue" (Hub USB-C + HDMI + Chuột không dây Silent):** Thuê **$20.000\\text{đ/buổi}$**, **$30.000\\text{đ/ngày}$** | Mua từ $210.000\\text{đ}$.
- **10 Giáo trình Đại cương KHTN:** Thuê **$15.000\\text{đ/tuần}$**, **$35.000\\text{đ/học kỳ}$** | Mua từ $22.000\\text{đ}$.
- **Áo Blouse Trắng Phòng Lab (Size S, M, L, XL):** Thuê **$15.000\\text{đ/buổi}$** | Mua từ $55.000\\text{đ}$.`;
  }

  return null;
}

/**
 * Queries the official Vietnamese Wikipedia CORS API (`origin=*`) to answer any open-ended
 * general knowledge, science, history, geography, biography, or social question with zero rate limits!
 */
async function tryFetchVietnameseKnowledge(
  rawQuery: string,
  timeoutMs = 7000
): Promise<string | null> {
  const cleaned = rawQuery
    .replace(
      /^(?:cho tôi biết|cho mình biết|cho hỏi|hãy cho biết|bạn ơi|ai là|cho biết|giải thích|khái niệm|định nghĩa|tìm hiểu về|nói về|hãy giải thích|tên của|tên)\s+/i,
      ""
    )
    .replace(
      /\s+(?:là ai|là gì|như thế nào|ở đâu|hiện nay|hiện tại|bao nhiêu)\??$/i,
      ""
    )
    .replace(/[?!.]+$/g, "")
    .trim();

  if (cleaned.length < 2) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleaned
    )}&utf8=&format=json&origin=*&srlimit=2`;

    const searchRes = await fetch(searchUrl, { signal: controller.signal });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!Array.isArray(results) || results.length === 0) return null;

    const topTitle = results[0]?.title;
    if (!topTitle) return null;

    const summaryUrl = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      topTitle
    )}`;
    const sumRes = await fetch(summaryUrl, { signal: controller.signal });
    if (!sumRes.ok) return null;
    const sumData = await sumRes.json();

    const extract =
      typeof sumData?.extract === "string" ? sumData.extract.trim() : "";
    if (!extract) return null;

    // Keep the summary concise and focused (up to 4 sentences)
    const sentences = extract.match(/[^.!?]+[.!?]+/g) || [extract];
    const conciseExtract = sentences.slice(0, 4).join(" ").trim();

    return `**${sumData.title || topTitle}:**\n\n${conciseExtract}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
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
 * Calls the CORS-enabled OpenAI-compatible LLM endpoint (`https://text.pollinations.ai/openai`).
 * Handles the 45-second IP rate limit gracefully:
 * - Makes a single clean call (instead of firing multiple requests that trigger 402 FREE_LIMIT).
 * - If the endpoint returns 402/429 with a short `Retry after Xs` (<= 8s), waits and retries once.
 */
async function tryFetchPollinationsAi(params: {
  message: string;
  history: ChatTurn[];
  studentInfo: StudentContextInfo;
}): Promise<string | null> {
  const { message, history, studentInfo } = params;

  const studentContextLine = studentInfo?.fullName
    ? `\nThông tin sinh viên: ${studentInfo.fullName} (${studentInfo.studentId || "KHTN"}), Điểm VIP: ${studentInfo.points ?? 0}/100.`
    : "";

  // Ensure history strictly starts with a user turn so OpenAI-compatible routers never reject leading assistant greetings
  const cleanedHistory: Array<{ role: "user" | "assistant"; content: string }> =
    [];
  for (const turn of history.slice(-6)) {
    if (!turn || !turn.text || turn.text.includes("🔒")) continue;
    const role = turn.role === "model" ? "assistant" : "user";
    if (cleanedHistory.length === 0 && role === "assistant") continue;
    cleanedHistory.push({ role, content: turn.text });
  }

  const openAiMessages = [
    {
      role: "system",
      content: FORUS_SYSTEM_INSTRUCTION + studentContextLine,
    },
    ...cleanedHistory,
    {
      role: "user",
      content: message,
    },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai-fast",
          messages: openAiMessages,
          temperature: 0.35,
          seed: Math.floor(Math.random() * 900000) + 100000,
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (typeof content === "string" && content.trim()) {
            return content.trim();
          }
        } else {
          const text = await response.text();
          if (
            text &&
            text.trim() &&
            !text.trim().startsWith("<!DOCTYPE") &&
            !text.trim().startsWith("<html")
          ) {
            return text.trim();
          }
        }
        return null;
      }

      // Check if it's a rate-limit response with a short wait time
      if ((response.status === 402 || response.status === 429) && attempt === 0) {
        const errText = await response.text();
        const retryMatch = errText.match(/Retry after (\d+)s/i);
        const waitSec = retryMatch ? Number(retryMatch[1]) : 99;
        if (waitSec > 0 && waitSec <= 8) {
          clearTimeout(timer);
          await new Promise((r) => setTimeout(r, (waitSec + 1) * 1000));
          continue;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

/**
 * Generates an accurate fallback response when both LLM and Wikipedia are unreachable.
 */
export function generateSmartAcademicReply(
  userMessage: string,
  studentInfo?: StudentContextInfo
): string {
  const direct = tryMatchDirectKnowledge(userMessage, studentInfo);
  if (direct) return direct;

  return `Về nội dung **"${userMessage.trim()}"**: Bạn có thể đặt câu hỏi cụ thể hơn (ví dụ nhập phương trình toán học, bài tập Giải tích / Đại số / C++ / Python, khái niệm khoa học hoặc dịch vụ FORUS) để mình giải chi tiết từng bước nhé!`;
}

/**
 * Unified chat client for FORUS AI Assistant (used by both VIP Hub and Floating Chat Popup).
 * 1. Checks Instant Answer Cache so repeated questions across chat windows respond in 0ms.
 * 2. Checks high-precision Direct Knowledge & Math Solver (equations, derivatives, civic facts, FORUS pricing).
 * 3. On full-stack origins (Cloud Run / local Express), calls `/api/chat` (Gemini API).
 * 4. On static hosts (GitHub Pages `*.github.io`), calls `tryFetchPollinationsAi`.
 * 5. If Pollinations is in its 45s IP cooldown, seamlessly resolves via `tryFetchVietnameseKnowledge`
 *    (Vietnamese Wikipedia CORS API with 0 rate limits) so every question in the popup chat is answered!
 */
export async function requestForusAiReply(params: {
  message: string;
  history: ChatTurn[];
  studentInfo: StudentContextInfo;
}): Promise<string> {
  const { message, history, studentInfo } = params;

  const finalizeReply = (reply: string): string => {
    saveCachedAiAnswer(message, reply);
    notifySharedChatExchange(message, reply);
    return reply;
  };

  // 1. Check session cache first (0ms response if already asked in either chat window)
  const cached = getCachedAiAnswer(message);
  if (cached) {
    notifySharedChatExchange(message, cached);
    return cached;
  }

  // 2. Check exact math solver, civic facts, or FORUS service lookup
  const directMatch = tryMatchDirectKnowledge(message, studentInfo);
  if (directMatch) {
    return finalizeReply(directMatch);
  }

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

  // 3. Local / Cloud Run backend
  if (!isStaticHost) {
    const localReply = await tryFetchJsonChat("/api/chat", payload, 15000);
    if (localReply) return finalizeReply(localReply);
  }

  // 4. Live CORS LLM endpoint
  const cloudAiReply = await tryFetchPollinationsAi({
    message,
    history,
    studentInfo,
  });
  if (cloudAiReply) return finalizeReply(cloudAiReply);

  // 5. Unlimited-rate Vietnamese Wikipedia & Encyclopedia Knowledge Engine (CORS *)
  const wikiReply = await tryFetchVietnameseKnowledge(message, 7000);
  if (wikiReply) return finalizeReply(wikiReply);

  if (!isStaticHost) {
    const remoteReply = await tryFetchJsonChat(
      REMOTE_BACKEND_API_URL,
      payload,
      8000
    );
    if (remoteReply) return finalizeReply(remoteReply);
  }

  return finalizeReply(generateSmartAcademicReply(message, studentInfo));
}
