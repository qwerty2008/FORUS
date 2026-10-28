import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý AI chính thức của FORUS ("Tiện ích trong tay, học hay mỗi ngày") — startup tiện ích dành riêng cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM).

Nhiệm vụ của bạn:
1. Giải đáp nhanh, chính xác và thân thiện mọi câu hỏi về học tập (Giải tích, Đại số tuyến tính, Toán rời rạc, Xác suất thống kê, Vật lý đại cương, Nhập môn lập trình C++/Python, Cấu trúc dữ liệu, Giới thiệu ngành Trí tuệ nhân tạo CSC00006).
2. Hỗ trợ viết code khung LaTeX (tích phân, ma trận, tổng sigma, quy nạp, phản chứng) hoặc giải thích công thức toán học ngắn gọn, dễ hiểu.
3. Tư vấn các sản phẩm & dịch vụ hiện có trên FORUS tại Cơ sở 1:
   - Combo "iPad Sinh Viên" (Thuê 35.000đ/tuần hoặc Mua 390.000đ): Bảng vẽ điện tử mini kết nối laptop/điện thoại + găng tay 2 ngón chống tì cảm ứng + phần mềm viết toán Scrble cấu hình sẵn.
   - Bàn phím mini MacroPad "OneTap LaTeX" (220.000đ): Bấm 1 nút chèn ngay khung tích phân, tổng sigma, ma trận, giới hạn hoặc template C++/Python.
   - Bộ Flashcard bỏ túi "Cứu Mạng Giữa Kỳ" chống nước (39.000đ): Treo móc khóa balo, tổng hợp định lý, đạo hàm, chuỗi số, chứng minh quy nạp/phản chứng.
   - Giá đỡ nghiêng 15 độ công thái học ORICO cho laptop & bảng vẽ (75.000đ).
   - Gói dịch vụ "Setup Trạm Ghi Chép Số & Template LaTeX Chuẩn Khoa CNTT" (29.000đ/lần).
   - Bộ sticker bàn phím gõ ký hiệu toán học (với mọi ∀, tồn tại ∃, thuộc ∈, suy ra ⇒, tương đương ⇔) (19.000đ).
   - Cho thuê máy tính cầm tay Casio fx-580VN X (15.000đ/ngày), giáo trình đại cương (20.000đ/tuần), áo blouse phòng thí nghiệm (15.000đ/buổi).
   - Giao đồ ăn sáng & nước uống tận phòng học (Tòa I, B, C, E, F, Dãy A, Thư viện...).
   - Dịch vụ in tài liệu & poster lấy liền từ khổ A5, A4, A3, A2 đến A1 (in màu hoặc trắng đen).
   - Cò Gia Sư kết nối sinh viên KHTN và phụ huynh/học sinh các cấp.
4. Hướng dẫn sinh viên cách săn Điểm Rèn Luyện (ĐRL) tại ĐH KHTN và cách tích đủ 100 điểm thưởng trên FORUS (mỗi dịch vụ cộng 5-10 điểm) để duy trì đặc quyền VIP.

Phong cách trả lời: Ngắn gọn, súc tích, gần gũi với sinh viên Tự Nhiên (HCMUS), trình bày rõ ràng bằng gạch đầu dòng hoặc khung công thức/code dễ copy.`;

// Normalize multi-turn history so it starts with "user" and strictly alternates "user" / "model"
function buildSanitizedContents(
  history: Array<{ role: string; text: string }>,
  currentMessage: string
) {
  const rawTurns: Array<{ role: "user" | "model"; text: string }> = [];

  for (const item of history.slice(-10)) {
    if (!item || typeof item.text !== "string" || !item.text.trim()) continue;
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

// High-reliability academic & campus response fallback if all upstream models hit 503 rate limits
function buildFallbackAcademicReply(userMessage: string, studentName?: string): string {
  const q = userMessage.toLowerCase();
  const greetingName = studentName ? studentName.split(" ").slice(-1)[0] : "bạn";

  if (q.includes("maclaurin") || q.includes("taylor") || q.includes("sin(x)") || q.includes("chuỗi")) {
    return `Chào ${greetingName}! Dưới đây là công thức **Khai triển Maclaurin** trọng tâm môn Vi tích phân 1B tại ĐH KHTN:\n\n1. **Khai triển hàm $\\sin(x)$ quanh $x_0 = 0$:**\n$$\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots + (-1)^n \\frac{x^{2n+1}}{(2n+1)!} + o(x^{2n+2})$$\n\n2. **Khai triển hàm $\\cos(x)$ và $e^x$:**\n• $\\cos(x) = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots + (-1)^n \\frac{x^{2n}}{(2n)!} + o(x^{2n+1})$\n• $e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + o(x^n)$\n\n3. **Code LaTeX để chèn nhanh vào báo cáo:**\n\`\`\`latex\n\\sin(x) = \\sum_{k=0}^{n} (-1)^k \\frac{x^{2k+1}}{(2k+1)!} + o(x^{2n+2})\n\`\`\`\n💡 *Mẹo ôn thi:* Bạn có thể dùng **Bộ Flashcard bỏ túi "Cứu Mạng Giữa Kỳ" (39.000đ)** tại mục Thuê & Bán của FORUS để tra nhanh toàn bộ bảng vô cùng bé tương đương nhé!`;
  }

  if (q.includes("latex") || q.includes("ma trận") || q.includes("tích phân") || q.includes("đồ án")) {
    return `Chào ${greetingName}! Dưới đây là khung **code LaTeX chuẩn báo cáo Khoa CNTT (HCMUS)** cho ma trận, tích phân và cấu trúc Đồ án 1 (CSC00006):\n\n1. **Ma trận $3 \\times 3$ (dùng gói \`amsmath\`):**\n\`\`\`latex\nA = \\begin{bmatrix}\n  a_{11} & a_{12} & a_{13} \\\\\n  a_{21} & a_{22} & a_{23} \\\\\n  a_{31} & a_{32} & a_{33}\n\\end{bmatrix}\n\`\`\`\n\n2. **Tích phân xác định & Tổng Sigma:**\n\`\`\`latex\nI = \\int_{a}^{b} f(x)\\,dx \\quad , \\quad S = \\sum_{i=1}^{n} x_i^2\n\`\`\`\n\n3. **Khung bìa & gói tiếng Việt chuẩn KHTN:**\n\`\`\`latex\n\\documentclass[12pt,a4paper]{report}\n\\usepackage[utf8]{vietnam}\n\\usepackage{amsmath, amssymb, graphicx}\n\`\`\`\n💡 *Gợi ý:* Nếu phải gõ LaTeX nhiều, bạn có thể tham khảo **Bàn phím MacroPad "OneTap LaTeX" (220.000đ)** hoặc **Gói Setup Template LaTeX (29.000đ)** tại FORUS!`;
  }

  if (q.includes("quy nạp") || q.includes("chứng minh")) {
    return `Chào ${greetingName}! Phương pháp **Chứng minh Quy nạp Toán học (Mathematical Induction)** gồm 3 bước chuẩn trong bài thi Toán rời rạc & Giải tích:\n\n• **Bước 1 (Cơ sở quy nạp):** Kiểm tra mệnh đề $P(n)$ đúng với giá trị nhỏ nhất $n = n_0$ (thường là $n_0 = 1$).\n• **Bước 2 (Giả thiết quy nạp):** Giả sử $P(k)$ đúng với một số nguyên dương $k \\ge n_0$ bất kỳ.\n• **Bước 3 (Bước quy nạp):** Chứng minh $P(k+1)$ cũng đúng dựa trên giả thiết $P(k)$. Kết luận $P(n)$ đúng với mọi $n \\ge n_0$.\n\n**Ví dụ nhanh:** Chứng minh $1 + 2 + \\dots + n = \\frac{n(n+1)}{2}$.\n- Với $n=1$: $VT = 1 = \\frac{1(2)}{2} = VP$ (đúng).\n- Giả sử đúng với $n=k$: $1 + \\dots + k = \\frac{k(k+1)}{2}$.\n- Với $n=k+1$: $VT = \\frac{k(k+1)}{2} + (k+1) = \\frac{(k+1)(k+2)}{2}$ (đpcm).`;
  }

  if (q.includes("tòa") || q.includes("phòng") || q.includes("sơ đồ") || q.includes("cs1") || q.includes("nguyễn văn cừ")) {
    return `Chào ${greetingName}! Dưới đây là **Sơ đồ nhanh các tòa nhà tại Cơ sở 1 (227 Nguyễn Văn Cừ, Q.5)**:\n\n• **Tòa I (11 tầng):** Trung tâm Khoa CNTT, phòng máy thực hành (tầng 3-6), các phòng học lý thuyết I.41, I.42, I.52, Hội trường I.\n• **Tòa B & Tòa C:** Khu giảng đường chính, phòng học đại cương và phòng thí nghiệm Vật lý / Hóa học.\n• **Tòa E & Tòa F:** Khu phòng học chuyên đề, văn phòng khoa và phòng seminar.\n• **Dãy A & Thư viện CS1:** Không gian tự học máy lạnh, mượn giáo trình và khu vực giao nhận nhanh của **FORUS**.\n\n📦 Khi đặt **Đồ ăn sáng**, **In ấn tài liệu** hoặc **Thuê thiết bị** trên FORUS, bạn chỉ cần chọn đúng Tòa nhà và nhập mã phòng (VD: *Phòng I.42*), runner FORUS sẽ giao tận cửa lớp trong 10-15 phút!`;
  }

  if (q.includes("điểm rèn luyện") || q.includes("đrl") || q.includes("vip")) {
    return `Chào ${greetingName}! Bí quyết đạt **90 - 100 Điểm Rèn Luyện (ĐRL)** tại ĐH KHTN và mở khóa **VIP 100 điểm FORUS**:\n\n1. **Săn Điểm Rèn Luyện tại trường:**\n   - **Mục 1 (Học tập & NCKH - tối đa 30đ):** Tham gia tối thiểu 2 hội thảo học thuật/seminar khoa hoặc cuộc thi học thuật (+5đ đến +10đ/sự kiện).\n   - **Mục 3 (Hoạt động chính trị - xã hội - tối đa 25đ):** Tham gia Chủ nhật xanh, Hiến máu tình nguyện hoặc Xuân tình nguyện.\n   - Bạn có thể bấm nút **"Nhắc Tôi Tham Gia"** ngay trong mục **VIP -> Săn Điểm Rèn Luyện** để FORUS đếm ngược và báo thức trước 30 phút!\n\n2. **Tích điểm VIP FORUS:**\n   - Mỗi đơn Đặt đồ ăn, In tài liệu hoặc Thuê thiết bị trên FORUS được cộng ngay **+10 điểm**.\n   - Đạt **100 điểm** để mở khóa huy hiệu VIP Vàng và ưu đãi giảm giá vận chuyển tại CS1!`;
  }

  if (q.includes("ipad") || q.includes("macropad") || q.includes("thuê") || q.includes("casio") || q.includes("blouse")) {
    return `Chào ${greetingName}! Gợi ý chọn thiết bị học tập tại **FORUS (Cơ sở 1 - 227 Nguyễn Văn Cừ)**:\n\n• **Combo "iPad Sinh Viên" (Thuê 35.000đ/tuần | Mua 390.000đ):** Phù hợp nhất khi bạn cần viết tay công thức Giải tích, vẽ đồ thị hoặc ghi chú trực tiếp lên slide PDF trên laptop mà không cần mua iPad đắt tiền.\n• **MacroPad "OneTap LaTeX" (220.000đ):** Phù hợp cho sinh viên Khoa CNTT & Toán-Tin thường xuyên gõ báo cáo LaTeX, bấm 1 phím chèn ngay khung ma trận, tích phân, tổng sigma.\n• **Thuê nhanh theo ngày/buổi:** Máy tính **Casio fx-580VN X** (15.000đ/ngày cho hôm thi), **Áo Blouse trắng** (15.000đ/buổi thực hành Hóa - Sinh), **Giáo trình đại cương** (20.000đ/tuần).\n\nBạn có thể bấm sang mục **Thuê & Bán** trên thanh điều hướng để đặt giao tận phòng học nhé!`;
  }

  return `Chào ${greetingName}! Mình là **Trợ lý AI FORUS** đồng hành cùng sinh viên ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ).\n\nVề nội dung bạn vừa hỏi (*"${userMessage}"*), mình gợi ý nhanh:\n• **Nếu bạn cần giải bài tập hoặc công thức LaTeX:** Hãy cho mình biết tên môn (VD: *Vi tích phân 1B, Đại số tuyến tính, Toán rời rạc, Nhập môn lập trình C++*) hoặc dán đề bài cụ thể để mình giải từng bước kèm code LaTeX.\n• **Nếu bạn cần tiện ích tại Cơ sở 1:**\n  - **Ăn uống:** Giao bánh mì, xôi, cà phê muối tận phòng học Tòa I, B, C, E, F.\n  - **In ấn:** In tài liệu A4/A5, slide bài giảng và poster A1/A2/A3 lấy liền.\n  - **Thuê & Bán:** Combo iPad Sinh Viên (35k/tuần), Casio fx-580VN X (15k/ngày), Áo Blouse (15k/buổi).\n  - **VIP & ĐRL:** Đếm ngược hạn đăng ký sự kiện Điểm Rèn Luyện.\n\nBạn muốn mình đi sâu vào bài toán hay dịch vụ nào trước?`;
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

      if (!userMessage && Array.isArray(body.messages) && body.messages.length > 0) {
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
        ? `[Thông tin sinh viên đang trò chuyện: Họ tên: ${
            studentInfo.fullName || "Sinh viên KHTN"
          }, MSSV: ${studentInfo.studentId || "Chưa cập nhật"}, Khoa: ${
            studentInfo.faculty || "ĐH KHTN"
          }, Điểm FORUS: ${studentInfo.points || 0} điểm]\n\n`
        : "";

      const formattedContents = buildSanitizedContents(
        rawHistory,
        `${contextPrefix}${userMessage}`
      );

      // Try models in order to gracefully handle transient 503 high-demand spikes
      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-latest",
      ];

      let replyText = "";

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          if (response && response.text) {
            replyText = response.text;
            break;
          }
        } catch (err) {
          console.warn(`Model ${modelName} transient error, trying next:`, err);
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
