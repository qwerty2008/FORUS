import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI chính thức của FORUS ("Tiện ích trong tay, học hay mỗi ngày") — hệ sinh thái tiện ích học tập và phát triển toàn diện dành riêng cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (HCMUS — Cơ sở 1: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM).

NGUYÊN TẮC PHẢN HỒI QUAN TRỌNG:
1. ĐI THẲNG VÀO TRỌNG TÂM & TỰ ĐỘNG ĐIỀU CHỈNH ĐỘ DÀI:
   - Với câu hỏi ngắn, định nghĩa nhanh, phép tính hoặc tra cứu giá: Trả lời ngắn gọn, súc tích (2–5 câu), đưa đáp án ngay dòng đầu tiên.
   - Với bài tập lớn, giải phương trình, chứng minh toán học hoặc viết code: Giải chi tiết từng bước rõ ràng, mạch lạc đến kết quả cuối cùng.
   - Không chào hỏi dài dòng, không liệt kê danh sách menu dịch vụ nếu người dùng đang hỏi bài tập hoặc kiến thức chung.
2. QUY TẮC HIỂN THỊ TOÁN HỌC (KHÔNG LỖI FONT LATEX):
   - Đặt mọi công thức toán học nội dòng trong cặp dấu $...$ (ví dụ: $x^2 - 5x + 6 = 0$) và công thức khối riêng dòng trong cặp dấu $$...$$.
   - TUYỆT ĐỐI KHÔNG xuất các khối code \`\`\`latex ... \`\`\` thô trong câu trả lời, chỉ hiển thị công thức toán học trực quan bằng $...$ và $$...$$.
   - Khi người dùng hỏi lập trình (C/C++, Python, Java, JS, SQL), vẫn đặt code trong khối \`\`\`cpp hoặc \`\`\`python như bình thường.
3. PHẠM VI HỖ TRỢ TOÀN DIỆN:
   - Giải đáp mọi câu hỏi Học thuật (Vi tích phân 1B/2B, Đại số tuyến tính, Toán rời rạc, Xác suất thống kê, Vật lý, Hóa học, Sinh học, Triết học, Kinh tế, Tiếng Anh), Lập trình & CNTT (C/C++, Python, CTDL & GT, OOP, AI, Đồ án 1 CSC00006), kỹ năng đời sống sinh viên.
   - Tư vấn chính xác Hệ sinh thái FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ):
     • Thuê & Mua Thiết bị học tập (chọn Thuê ngắn hạn / Độ mới 80% / 90% / Mới 100%):
       - Máy tính cầm tay (Casio fx-580VN X, fx-880BTG, Vinacal 680EX Plus/III, Thiên Long Flexio Fx799VN): Thuê 15.000đ/ngày, 45.000đ/tuần | Mua từ 315.000đ – 675.000đ.
       - Giá đỡ công thái học 15° (Laptop, Bảng vẽ & Chân Standee Poster A1/A2): Thuê 10.000đ/ngày, 25.000đ/tuần | Mua từ 45.000đ – 75.000đ.
       - Bộ dụng cụ thuyết trình TechRescue (Hub USB-C, HDMI, Chuột không dây): Thuê 20.000đ/buổi, 30.000đ/ngày | Mua từ 210.000đ.
       - 10 Giáo trình đại cương KHTN: Thuê 15.000đ/tuần, 35.000đ/học kỳ | Mua từ 22.000đ.
       - Áo Blouse trắng phòng Lab (Size S, M, L, XL): Thuê 15.000đ/buổi | Mua từ 55.000đ.
       - Combo Bảng vẽ "iPad Sinh Viên" (Thuê 35.000đ/tuần | Mua 390.000đ), Bàn phím MacroPad OneTap LaTeX (Thuê 30k/tuần | Mua 220k), Bộ Flashcard chống nước (39k).
     • In ấn tài liệu & Poster lấy liền (Khổ A5 đến A1): Có tùy chọn thuê kèm Giá đỡ / Standee Poster (+10k/buổi, +15k/ngày, +30k/tuần).
     • Điểm VIP & Kho Voucher Thanh toán: Điểm VIP chỉ cộng KHI XÁC NHẬN THANH TOÁN ĐƠN HÀNG. Hỗ trợ đổi Voucher bằng Điểm VIP (VIP50 giảm 10k, VIP60 giảm 15k, VIP100 giảm 15%) và Điểm ĐRL/GPA (DRL80PLUS giảm 15%, GPA32PLUS giảm 12k, FORUSKHTN giảm 10%, CSC00006 giảm 15k).`;

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
        return `**Kết quả tính toán:**\n\n$$${cleanMath.replace(/\*/g, " \\cdot ")} = ${result.toLocaleString("vi-VN")}$$`;
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
    return `**Định lý Kẹp (Squeeze Theorem) & Giới hạn trong Vi tích phân 1B:**\n\n1. **Phát biểu Định lý Kẹp:**\nNếu $f(x) \\le g(x) \\le h(x)$ với mọi $x$ lân cận $x_0$ và:\n$$\\lim_{x \\to x_0} f(x) = \\lim_{x \\to x_0} h(x) = L$$\nthì suy ra:\n$$\\lim_{x \\to x_0} g(x) = L$$\n\n2. **Ví dụ áp dụng điển hình:**\nTính $I = \\lim_{x \\to 0} x^2 \\sin\\left(\\frac{1}{x}\\right)$:\n• Do $-1 \\le \\sin\\left(\\frac{1}{x}\\right) \\le 1, \\forall x \\ne 0$ nên:\n$$-x^2 \\le x^2 \\sin\\left(\\frac{1}{x}\\right) \\le x^2$$\n• Vì $\\lim_{x \\to 0} (-x^2) = \\lim_{x \\to 0} x^2 = 0$, theo **Định lý Kẹp** suy ra $I = 0$.`;
  }

  if (
    q.includes("maclaurin") ||
    q.includes("taylor") ||
    q.includes("sin(x)") ||
    q.includes("chuỗi")
  ) {
    return `**Bảng Khai triển Maclaurin trọng tâm (quanh $x_0 = 0$):**\n\n$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots + (-1)^n \\frac{x^{2n+1}}{(2n+1)!} + o(x^{2n+2})$$\n$$\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots + (-1)^n \\frac{x^{2n}}{(2n)!} + o(x^{2n+1})$$\n$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + o(x^n)$$\n$$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots + (-1)^{n-1}\\frac{x^n}{n} + o(x^n)$$`;
  }

  if (
    q.includes("ma trận") ||
    q.includes("tích phân") ||
    q.includes("đạo hàm") ||
    q.includes("trị riêng")
  ) {
    return `**Công thức Giải tích & Đại số tuyến tính trọng tâm:**\n\n1. **Tích phân từng phần:**\n$$\\int_{a}^{b} u\\,dv = \\left. u \\cdot v \\right|_{a}^{b} - \\int_{a}^{b} v\\,du$$\n\n2. **Phương trình đặc trưng tìm Trị riêng ma trận vuông $A$:**\n$$\\det(A - \\lambda I_n) = 0$$`;
  }

  if (q.includes("quy nạp") || q.includes("chứng minh") || q.includes("rời rạc")) {
    return `**3 Bước Chứng minh Quy nạp Toán học ($P(n), \\forall n \\ge n_0$):**\n\n• **Bước 1 (Cơ sở quy nạp):** Kiểm tra mệnh đề $P(n_0)$ đúng (thường $n_0 = 1$).\n• **Bước 2 (Giả thiết quy nạp):** Giả sử $P(k)$ đúng với $k \\ge n_0$ bất kỳ.\n• **Bước 3 (Bước quy nạp):** Chứng minh $P(k+1)$ đúng dựa trên $P(k)$:\n$$\\sum_{i=1}^{k+1} i = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$$`;
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
    return `**Mẫu thuật toán Tìm kiếm nhị phân (C++) với độ phức tạp $O(\\log n)$:**\n\n\`\`\`cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& a, int target) {\n    int left = 0, right = (int)a.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\`\`\``;
  }

  return `Chào ${greetingName}! Bạn hãy nhập trực tiếp **phương trình/bài toán**, **yêu cầu code C++/Python**, hoặc **câu hỏi dịch vụ FORUS** để mình giải đáp chi tiết ngay nhé!`;
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

  const thinkingConfig =
    modelName === "gemini-3.1-flash-lite"
      ? { thinkingLevel: ThinkingLevel.MINIMAL }
      : { thinkingLevel: ThinkingLevel.LOW };

  const apiPromise = ai.models
    .generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig,
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

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

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
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-latest",
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

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.npm_lifecycle_event === "start";

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FORUS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
