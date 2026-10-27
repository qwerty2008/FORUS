# FORUS — Tiện ích trong tay, học hay mỗi ngày
**Hệ sinh thái tiện ích dành cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5)**

Dự án được xây dựng theo tiêu chí **Đồ án 1 — Học phần CSC00006 (Giới thiệu ngành Trí tuệ nhân tạo)**, Khoa Công nghệ Thông tin, Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM.

---

## 1. Tính năng nổi bật của FORUS

1. **Giao diện Sáng / Tối (Light & Dark Mode) & Tối ưu Điện thoại / Máy tính**:
   - Tự động chuyển đổi bộ nhận diện Logo FORUS nền sáng và nền tối.
   - Thiết kế Mobile-First giúp các bạn sinh viên và giảng viên quét mã QR tại buổi trình bày Poster thao tác mượt mà bằng một tay.
2. **Đăng nhập bằng Email Sinh viên (`@student.hcmus.edu.vn`)**:
   - Xác thực nhanh tài khoản sinh viên KHTN để miễn cọc CCCD khi thuê thiết bị và lưu trữ lịch sử tích điểm.
3. **Mục Thuê & Bán Thiết Bị Học Tập Đặc Thù (7 Sản phẩm & Dịch vụ)**:
   - **Combo "iPad Sinh Viên"** (Thuê `35.000đ/tuần` hoặc Mua `390.000đ`): Bảng vẽ điện tử mini kết nối thẳng laptop/điện thoại + găng tay 2 ngón chống tì cảm ứng + phần mềm viết toán Scrble cấu hình sẵn.
   - **Bàn phím mini MacroPad "OneTap LaTeX"** (`220.000đ`): Bấm 1 nút tự động chèn khung công thức tích phân, tổng sigma, ma trận hoặc template code C++/Python.
   - **Bộ Flashcard bỏ túi "Cứu Mạng Giữa Kỳ" chống nước** (`39.000đ`): Tổng hợp định lý, đạo hàm, chuỗi số và quy nạp/phản chứng treo móc khóa balo.
   - **Giá đỡ nghiêng 15 độ công thái học ORICO** cho laptop & bảng vẽ (`75.000đ`).
   - **Gói dịch vụ "Setup Trạm Ghi Chép Số & Template LaTeX Chuẩn Khoa CNTT"** (`29.000đ/lần`).
   - **Bộ Sticker bàn phím ký hiệu toán học** ($\forall, \exists, \in, \Rightarrow, \Leftrightarrow$) kèm lệnh LaTeX (`19.000đ`).
   - **Trạm cho thuê Máy tính cầm tay Casio fx-580VN X, Giáo trình đại cương & Áo blouse** phòng thí nghiệm.
4. **Đặt Đồ Ăn Sáng & Nước Uống Giao Tận Phòng Học CS1**:
   - Chọn trực tiếp tòa nhà (Tòa I, Dãy B, C, E, F, Dãy A, Thư viện) và số phòng học để nhận bánh mì ốp la, xôi mặn, cơm nắm Onigiri, cà phê muối, trà đào.
5. **Gửi File In Sẵn Lấy Liền (Đủ khổ A1, A2, A3, A4, A5)**:
   - Tải file lên, chọn khổ giấy từ **A5 đến A1** (hỗ trợ in cả Poster đồ án khổ A1), chọn in màu hoặc trắng đen, 1 mặt hoặc 2 mặt, đóng lò xo và tự động báo giá.
6. **Cò Gia Sư HCMUS**:
   - Kết nối sinh viên Tự Nhiên và phụ huynh/học sinh các cấp có nhu cầu tìm gia sư Toán, Lý, Hóa, C++/Python.
7. **Hệ thống Tích Điểm & Đặc Quyền Thành Viên VIP (100 Điểm)**:
   - Mỗi lần sử dụng dịch vụ cộng từ **5–10 điểm** (có sẵn nút **Demo VIP 100 điểm** để trải nghiệm nhanh khi chấm bài).
   - **Bảng Săn Điểm Rèn Luyện (ĐRL)**: Đồng hồ đếm ngược thời gian thực tới lúc hết hạn đăng ký và kết thúc sự kiện, kèm nút bật thông báo nhắc tham gia và ghi chú lưu ý.
   - **Chatbot AI Hỗ Trợ Sinh Viên**: Sử dụng `@google/genai` ở phía server (`server.ts`) để giải đáp công thức Toán/LaTeX, học vụ CS1 và tư vấn dịch vụ.

---

## 2. Cấu trúc Thư mục Dự án (Chuẩn GitHub)

```text
├── public/
│   └── assets/aistudio/         # Bộ Logo FORUS (Sáng/Tối/Gốc) & hình ảnh thực tế sản phẩm
├── src/
│   ├── components/
│   │   ├── AboutAndContactView.tsx
│   │   ├── CartDrawer.tsx       # Giỏ hàng & Thanh toán chế độ thử (Sandbox)
│   │   ├── PrintConfigurator.tsx# Công cụ đặt in A1-A5 tính giá tự động
│   │   ├── ProductDetailModal.tsx
│   │   ├── ProductVisual.tsx
│   │   ├── StudentAuthModal.tsx # Xác thực email @student.hcmus.edu.vn
│   │   ├── TutorHub.tsx         # Sàn kết nối Cò Gia Sư
│   │   └── VipHub.tsx           # Bảng săn ĐRL đếm ngược & Chatbot AI
│   ├── data/
│   │   └── forusData.ts         # Dữ liệu sản phẩm, thực đơn, sự kiện ĐRL & mã giảm giá
│   ├── App.tsx                  # Giao diện chính điều phối toàn bộ hệ sinh thái
│   ├── index.css                # Cấu hình Tailwind CSS & Typography
│   ├── main.tsx                 # Điểm khởi chạy React
│   └── types.ts                 # Định nghĩa kiểu dữ liệu TypeScript
├── docs/
│   └── do-an-1/                 # Tài liệu tách rời phục vụ nộp Moodle (Poster A1, Bảng phân công, Links)
│       ├── POSTER_A1_FORUS.md
│       ├── PHAN_CONG_NHOM.md
│       └── links.txt
├── server.ts                    # Backend Express + Vite & Route API Chatbot Gemini
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Hướng dẫn Cài đặt & Chạy trên máy cá nhân

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Tạo file .env từ .env.example và điền GEMINI_API_KEY
cp .env.example .env

# 3. Chạy server phát triển (Port 3000)
npm run dev

# 4. Build bản Production
npm run build
npm start
```
