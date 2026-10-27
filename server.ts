import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "FORUS HCMUS CS1 Backend" });
  });

  // Server-side Gemini API proxy route for VIP Student Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], studentInfo } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Vui lòng nhập nội dung câu hỏi." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        res.status(503).json({
          error: "Hệ thống AI đang chờ cấu hình GEMINI_API_KEY trên server.",
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
        ? `[Thông tin sinh viên đang trò chuyện: Họ tên: ${studentInfo.fullName || "Sinh viên KHTN"}, MSSV: ${studentInfo.studentId || "Chưa cập nhật"}, Email: ${studentInfo.email || ""}, Điểm FORUS: ${studentInfo.points || 0} điểm]\n\n`
        : "";

      const formattedContents = [
        ...history.slice(-8).map((msg: { role: string; text: string }) => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }],
        })),
        {
          role: "user",
          parts: [{ text: `${contextPrefix}${message}` }],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        "Mình đã ghi nhận câu hỏi của bạn. Bạn cần hỗ trợ thêm về công thức LaTeX hay dịch vụ nào tại Cơ sở 1 Nguyễn Văn Cừ không?";

      res.json({ reply: replyText });
    } catch (error: unknown) {
      console.error("FORUS Chatbot API Error:", error);
      const errMsg =
        error instanceof Error
          ? error.message
          : "Không thể kết nối tới Trợ lý AI FORUS lúc này.";
      res.status(500).json({
        error: `Lỗi kết nối AI: ${errMsg}`,
      });
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
