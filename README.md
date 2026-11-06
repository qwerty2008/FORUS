# FORUS — Tiện ích trong tay, học hay mỗi ngày
**Hệ sinh thái tiện ích học tập & học vụ toàn diện dành cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5)**

Dự án được xây dựng phục vụ **Đồ án 1 — Học phần CSC00006 (Giới thiệu ngành Trí tuệ nhân tạo)**, Khoa Công nghệ Thông tin, Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM.

- **Tên miền GitHub Pages:** [https://qwerty2008.github.io/FORUS/](https://qwerty2008.github.io/FORUS/)
- **Tên miền Cloud Run (Full-stack):** [https://ais-pre-m3uzfjjxhiiaafj3oeiozr-312905538557.asia-northeast1.run.app](https://ais-pre-m3uzfjjxhiiaafj3oeiozr-312905538557.asia-northeast1.run.app)

---

## 1. Tổng Quan Hệ Sinh Thái FORUS (6 Phân Hệ Chính)

1. **Trang Chủ Trực Quan & Giới Thiệu Hệ Sinh Thái (`home` & `about`)**:
   - **Hero Tương Tác 4 Trụ Cột**: Trình bày trực quan sứ mệnh giải quyết 4 bài toán sát sườn của sinh viên Tự Nhiên: *Học cụ & Thiết bị*, *In ấn A5–A1 lấy liền*, *Gia sư & Sự kiện ĐRL*, và *Trợ lý AI & Sơ đồ CS1*.
   - **Giao diện Sáng / Tối (Light & Dark Mode)** & **Minimalist Cart UI**: Tối ưu hóa trải nghiệm Mobile-First (quét QR một chạm tại buổi chấm Poster), giỏ hàng thiết kế tối giản chỉ dùng biểu tượng trực quan và hiệu ứng cuộn mượt (`Fade-up + Stagger`) cho lịch sử đơn hàng.
   - **Trang Giới Thiệu & Câu Hỏi Thường Gặp (`AboutAndContactView.tsx`)**: Giải thích tầm nhìn dự án, hệ thống FAQ tương tác và biểu mẫu liên hệ trực tiếp Trạm FORUS CS1.

2. **Trạm Thuê & Bán Thiết Bị Học Tập Đặc Thù (`gear` — 10 Sản Phẩm & Gói Dịch Vụ)**:
   - **Thuê & Mua Máy Tính Cầm Tay Khoa Học (`FORUS-07`)**: Chọn trực tiếp 5 dòng máy thông dụng nhất phòng thi (*Casio fx-580VN X*, *Casio fx-880BTG*, *Vinacal 680EX Plus*, *Vinacal 680EX Plus III*, *Thiên Long Flexio Fx799VN*) với giá thuê cố định **15.000đ/ngày** hoặc **45.000đ/tuần**, hoặc mua đứt theo tình trạng *Độ mới 80% / 90% / Mới 100%*.
   - **Tủ Sách Tuần Hoàn Giáo Trình Đại Cương KHTN (`FORUS-08`)**: Chọn từng đầu sách trong 10 giáo trình bắt buộc (*Vi tích phân 1 & 2, Đại số tuyến tính, Xác suất thống kê, Vật lý đại cương 2, Mạng máy tính, Triết học Mác-Lênin, Tư tưởng HCM, Lịch sử Đảng, Pháp luật đại cương*) kèm hình ảnh bìa sách thực tế.
   - **Thuê & Mua Áo Blouse Trắng Phòng Thí Nghiệm (`FORUS-09`)**: Đủ size S, M, L, XL đã giặt sấy khử khuẩn, thuê nhanh **15.000đ/buổi** hoặc mua mới 80%–100%.
   - **Bộ Dụng Cụ Thuyết Trình Khẩn Cấp "TechRescue" (`FORUS-10`)**: Trọn bộ 5 món gồm *Bộ chuyển đổi USB-C đa năng, cổng xuất máy chiếu HDMI 4K, Hub USB 3.0, dây cáp kết nối và Chuột không dây Silent* (Thuê **20.000đ/buổi** thuyết trình, **30.000đ/ngày** hoặc mua trọn bộ).
   - **Combo "iPad Sinh Viên" (`FORUS-01`)**: Bảng vẽ điện tử mini + găng tay 2 ngón chống tì cảm ứng + phần mềm viết toán Scrble (Thuê `35.000đ/tuần` | Mua `390.000đ`).
   - **Bàn Phím Cơ Mini MacroPad "OneTap LaTeX" (`FORUS-02` — `220.000đ`)**, **Bộ Flashcard Bỏ Túi "Cứu Mạng Giữa Kỳ" Chống Nước (`FORUS-03` — `39.000đ`)**, **Giá Đỡ Nghiêng 15° Công Thái Học ORICO (`FORUS-04` — `75.000đ`)**, **Gói Setup Trạm Ghi Chép Số & Template LaTeX (`FORUS-05` — `29.000đ`)**, và **Bộ Sticker Bàn Phím Ký Hiệu Toán Học (`FORUS-06` — `19.000đ`)**.

3. **Săn Điểm Rèn Luyện & Sự Kiện Học Thuật (`events` — `EventsHub.tsx`)**:
   - Đồng hồ đếm ngược thời gian thực (`Giờ : Phút : Giây`) tới hạn đóng form đăng ký các hội thảo AI, Workshop LaTeX, ngày hội Green Campus và cuộc thi lập trình tại Cơ sở 1.
   - Hỗ trợ lọc theo mục Điểm Rèn Luyện, bật thông báo **Nhắc Tôi Tham Gia** và lưu ghi chú cá nhân cho từng sự kiện.

4. **Trạm In Ấn Tài Liệu & Poster Khổ A5 – A1 Lấy Liền (`print` — `PrintConfigurator.tsx`)**:
   - Cho phép chọn từng khổ giấy từ **A5, A4, A3, A2 đến A1** (phục vụ cả in sổ tay A5, giáo trình A4, sơ đồ A3/A2 và Poster Đồ án 1 khổ A1).
   - Niêm yết minh bạch **2 Bảng Giá Chuẩn**:
     1. *Bảng giá in Trắng Đen / Photocopy* (Giấy tiêu chuẩn Fort 70gsm – 80gsm, tự động áp dụng đơn giá sỉ khi in số lượng lớn từ 100 trang).
     2. *Bảng giá in Màu Toàn Diện (Full Color)* (Tùy chọn giấy thường Fort 70–80gsm hoặc giấy dày/giấy ảnh Couche >180gsm chuyên làm Poster, kỷ yếu).
   - Hỗ trợ tải file thực tế (`.pdf`, `.docx`, `.pptx`, `.png`, `.jpg`), chọn gia công đóng gáy xoắn/bấm kim/ống đựng poster và tự động tính tổng tiền + điểm thưởng VIP.

5. **Sàn Kết Nối Cò Gia Sư KHTN (`tutor` — `TutorHub.tsx`)**:
   - Kết nối hai chiều giữa phụ huynh/học sinh và đội ngũ gia sư sinh viên ĐH KHTN đã xác thực thẻ sinh viên.
   - Tích hợp bộ lọc theo đối tượng, khu vực (Quận 5, 1, 3, 10, 7...), từ khóa môn học, thanh sắp xếp học phí tối ưu cho cả màn hình di động và biểu mẫu đăng hồ sơ gia sư mới.

6. **Trung Tâm Tiện Ích Số VIP & AI (`vip` — `VipHub.tsx`)**:
   - **Sơ Đồ Chỉ Dẫn Các Tầng CS1 (B1 – L11)**: Bản đồ tương tác tra cứu vị trí, chức năng và lối đi của toàn bộ các phòng học, phòng Lab, giảng đường tại 227 Nguyễn Văn Cừ.
   - **Trợ Lý AI Học Tập FORUS 24/7**: Hỗ trợ giải toán đại cương (Vi tích phân, Định lý Kẹp, Khai triển Maclaurin, Đại số tuyến tính, Toán rời rạc), viết code C++/Python và sinh mã LaTeX. Hoạt động mượt mà trên cả môi trường Server (`server.ts`) lẫn môi trường tĩnh GitHub Pages (`forusChatService.ts`).
   - **Kho 18 Mẫu Code LaTeX Chuẩn Khoa CNTT**: Sao chép 1 chạm các mẫu ma trận, tích phân, quy nạp, khung báo cáo Đồ án 1 và slide Beamer.
   - **Đổi Điểm VIP Nhận Voucher Ưu Đãi**: Đổi điểm tích lũy lấy mã giảm giá trực tiếp trong giỏ hàng.

---

## 2. Cấu Trúc Thư Mục Dự Án

```text
├── .github/
│   └── workflows/
│       └── deploy.yml                # Tự động Build & Deploy lên GitHub Pages (*.github.io)
├── public/
│   ├── .nojekyll                     # Đảm bảo GitHub Pages phục vụ đầy đủ tài nguyên tĩnh
│   └── assets/aistudio/              # Bộ nhận diện thương hiệu FORUS & ảnh thực tế học cụ, giáo trình
├── src/
│   ├── components/
│   │   ├── AboutAndContactView.tsx   # Trang giới thiệu chi tiết, FAQ tương tác & Liên hệ CS1
│   │   ├── CartDrawer.tsx            # Giỏ hàng tối giản, áp mã Voucher & Thanh toán tạo đơn hàng
│   │   ├── EventsHub.tsx             # Bảng săn Điểm Rèn Luyện đếm ngược thời gian thực
│   │   ├── FormattedAiMessage.tsx    # Bộ hiển thị công thức Toán LaTeX & khối code có nút Copy
│   │   ├── PrintConfigurator.tsx     # Công cụ đặt in khổ A5–A1 kèm 2 bảng giá Trắng Đen & In Màu
│   │   ├── ProductDetailModal.tsx    # Cửa sổ chi tiết học cụ, chọn dòng máy/độ mới & đánh giá
│   │   ├── ProductVisual.tsx         # Hiển thị hình ảnh sản phẩm & huy hiệu trạng thái tồn kho
│   │   ├── StudentAuthModal.tsx      # Đăng ký / Đăng nhập tài khoản sinh viên (@student.hcmus.edu.vn)
│   │   ├── TutorHub.tsx              # Sàn kết nối Cò Gia Sư KHTN & bộ lọc học phí
│   │   └── VipHub.tsx                # Sơ đồ tầng B1–L11, Chatbot AI, 18 mẫu LaTeX & Đổi Voucher
│   ├── data/
│   │   └── forusData.ts              # Dữ liệu 10 sản phẩm Thuê & Bán, bảng giá in A5–A1, Gia sư & ĐRL
│   ├── utils/
│   │   └── forusChatService.ts       # Dịch vụ kết nối AI đa tầng (Local API -> Cloud Run -> Smart Engine)
│   ├── App.tsx                       # Điều phối trạng thái trung tâm, hồ sơ SV (K26–K23) & Lịch sử đơn hàng
│   ├── index.css                     # Cấu hình Tailwind CSS v4 & hiệu ứng giao diện
│   ├── main.tsx                      # Điểm khởi chạy ứng dụng React 19
│   └── types.ts                      # Định nghĩa kiểu dữ liệu TypeScript toàn hệ thống
├── docs/
│   └── do-an-1/                      # Bộ tài liệu phục vụ nộp báo cáo & chấm Poster Đồ án 1
│       ├── LUONG_HOAT_DONG_WEB_FORUS.md
│       ├── PHAN_CONG_NHOM.md
│       ├── POSTER_A1_FORUS.md
│       └── links.txt
├── LUONG_HOAT_DONG_WEB_FORUS.md      # Tài liệu giải thích chi tiết luồng hoạt động hệ thống
├── PHAN_CONG_NHOM.md                 # Bảng phân công nhiệm vụ 5 thành viên & ứng dụng AI
├── server.ts                         # Máy chủ Express + Vite & Route API Chatbot Gemini (@google/genai)
├── package.json
├── tsconfig.json
└── vite.config.ts                    # Cấu hình Vite với đường dẫn tương đối (base: './') cho GitHub Pages
```

---

## 3. Hướng Dẫn Cài Đặt & Triển Khai

### 3.1. Chạy trên máy cá nhân (Local Development)
```bash
# 1. Cài đặt các gói thư viện
npm install --legacy-peer-deps

# 2. Tạo file .env (tùy chọn để kết nối Gemini API phía server)
cp .env.example .env

# 3. Khởi chạy máy chủ phát triển tại http://localhost:3000
npm run dev

# 4. Kiểm tra kiểu dữ liệu TypeScript & đóng gói Production
npm run lint
npm run build
```

### 3.2. Triển khai tự động lên GitHub Pages (`*.github.io`)
Dự án đã tích hợp sẵn workflow `.github/workflows/deploy.yml`:
1. Đẩy mã nguồn lên nhánh `main` của kho chứa GitHub.
2. GitHub Actions tự động biên dịch Vite và xuất bản ra nhánh `gh-pages` cũng như GitHub Pages Artifact.
3. Tại mục **Settings $\rightarrow$ Pages** trên GitHub, chọn nhánh **`gh-pages`** (hoặc **GitHub Actions**) để truy cập ngay tại `https://<username>.github.io/<repo-name>/`.
