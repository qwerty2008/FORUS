# TÀI LIỆU GIẢI THÍCH LUỒNG HOẠT ĐỘNG HỆ SINH THÁI WEB FORUS
**Dự án**: **FORUS — “Tiện ích trong tay, học hay mỗi ngày”**  
**Học phần**: Đồ án 1 (CSC00006 — Giới thiệu ngành Trí tuệ nhân tạo)  
**Đơn vị**: Khoa Công nghệ Thông tin — Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1: 227 Nguyễn Văn Cừ, Quận 5)

---

## MỤC LỤC
1. [Tổng Quan Hệ Sinh Thái & Triết Lý Vận Hành](#1-tổng-quan-hệ-sinh-thái--triết-lý-vận-hành)
2. [Sơ Đồ Kiến Trúc & Luồng Dữ Liệu Tổng Thể](#2-sơ-đồ-kiến-trúc--luồng-dữ-liệu-tổng-thể)
3. [Luồng Điều Hướng Trung Tâm (Header Cố Định, Giỏ Hàng Tối Giản & Menu Tiện Ích)](#3-luồng-điều-hướng-trung-tâm-header-cố-định-giỏ-hàng-tối-giản--menu-tiện-ích)
4. [Chi Tiết Luồng Hoạt Động Của Từng Phân Hệ Dịch Vụ](#4-chi-tiết-luồng-hoạt-động-của-từng-phân-hệ-dịch-vụ)
   - [4.1. Trang Chủ, Lịch Sử Mua Hàng & Trang Giới Thiệu (`home` & `about`)](#41-trang-chủ-lịch-sử-mua-hàng--trang-giới-thiệu-home--about)
   - [4.2. Thuê & Bán Thiết Bị Học Tập Đặc Thù (`gear` — 10 Sản Phẩm)](#42-thuê--bán-thiết-bị-học-tập-đặc-thù-gear--10-sản-phẩm)
   - [4.3. Săn Điểm Rèn Luyện & Sự Kiện Học Thuật (`events`)](#43-săn-điểm-rèn-luyện--sự-kiện-học-thuật-events)
   - [4.4. Đặt In Ấn Tài Liệu & Poster Khổ A5 – A1 (`print`)](#44-đặt-in-ấn-tài-liệu--poster-khổ-a5--a1-print)
   - [4.5. Sàn Kết Nối Cò Gia Sư KHTN (`tutor`)](#45-sàn-kết-nối-cò-gia-sư-khtn-tutor)
   - [4.6. Trung Tâm Tính Năng Số VIP & AI (`vip`)](#46-trung-tâm-tính-năng-số-vip--ai-vip)
5. [Luồng Quản Lý Hồ Sơ Sinh Viên (K26–K23), Điểm Thưởng VIP & Lịch Sử Đơn Hàng](#5-luồng-quản-lý-hồ-sơ-sinh-viên-k26k23-điểm-thưởng-vip--lịch-sử-đơn-hàng)
6. [Luồng Xử Lý Trợ Lý AI Đa Tầng (Hỗ Trợ Cả Cloud Run & GitHub Pages)](#6-luồng-xử-lý-trợ-lý-ai-đa-tầng-hỗ-trợ-cả-cloud-run--github-pages)
7. [Kịch Bản Demo Thuyết Trình Nhanh (Dành Cho Buổi Chấm Poster Đồ Án 1)](#7-kịch-bản-demo-thuyết-trình-nhanh-dành-cho-buổi-chấm-poster-đồ-án-1)

---

## 1. Tổng Quan Hệ Sinh Thái & Triết Lý Vận Hành

**FORUS** được xây dựng như một **Trạm tiện ích học tập và học vụ khép kín (All-in-One Campus Utility Hub)** giải quyết trực tiếp những khó khăn thường nhật của sinh viên Trường ĐH Khoa học Tự nhiên (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5):

1. **Hỗ trợ học cụ & thiết bị công nghệ đặc thù khối Tự Nhiên**:
   - Cho thuê ngắn hạn (theo buổi/ngày/tuần/học kỳ) hoặc mua đứt theo độ mới (`80%` / `90%` / `Mới 100%`) đối với: **5 dòng Máy tính cầm tay** (Casio fx-580VN X, fx-880BTG, Vinacal 680EX Plus, 680EX Plus III, Thiên Long Flexio Fx799VN), **10 đầu Giáo trình đại cương KHTN**, **Áo Blouse phòng thí nghiệm**, **Bộ dụng cụ thuyết trình khẩn cấp "TechRescue"** (Hub USB-C, HDMI, Chuột không dây Silent), **Combo "iPad Sinh Viên"**, **Bàn phím MacroPad "OneTap LaTeX"** và **Bộ Flashcard chống nước**.
2. **Dịch vụ học đường tức thời tại chỗ (Campus Express)**:
   - Đặt in giáo trình, đề cương và Poster đồ án từ khổ **A5, A4, A3, A2 đến A1** lấy liền sau 15 phút với bảng giá trắng đen (Fort 70–80gsm) và in màu (Fort / Couche >180gsm) niêm yết rõ ràng.
   - Kết nối gia sư sinh viên KHTN uy tín và theo dõi đồng hồ đếm ngược các sự kiện cộng **Điểm Rèn Luyện (ĐRL)**.
3. **Vòng lặp gắn kết bằng Điểm VIP & Công cụ Số (Gamified Loyalty + AI)**:
   - Mỗi giao dịch mua/thuê học cụ, đặt in hoặc kết nối gia sư đều **cộng điểm VIP trực tiếp (`+5` đến `+10 điểm`)**.
   - Điểm VIP dùng để **đổi Voucher giảm giá** và mở khóa đặc quyền **Hỏi Trợ lý AI Học tập 24/7 không giới hạn (`∞`)** khi đạt mốc **100 điểm VIP**.

---

## 2. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu Tổng Thể

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN NGƯỜI DÙNG (REACT 19 + TAILWIND v4)              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Thanh Điều Hướng Cố Định Trên Cùng (Fixed Top Header - z-40)           │  │
│  │ • Trái: Logo FORUS → Bấm về Trang chủ                                  │  │
│  │ • Giữa: [Trang chủ] [Thuê & Bán] [Sự kiện] [In ấn] [Gia sư] [VIP & AI] │  │
│  │ • Phải: [Huy hiệu VIP] [Nút Sáng/Tối] [Icon Giỏ hàng] [Nút Menu]       │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      │                                       │
│        ┌─────────────────────────────┼─────────────────────────────┐         │
│        ▼                             ▼                             ▼         │
│  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐   │
│  │ KHỐI HỌC CỤ & ĐƠN │     │ KHỐI HỌC VỤ & IN  │     │ KHỐI CÔNG CỤ VIP  │   │
│  │ • Hero 4 Trụ Cột  │     │ • Sự kiện Săn ĐRL │     │ • Sơ đồ tầng CS1  │   │
│  │ • Trang Giới thiệu│     │   (Đếm ngược giờ  │     │   (B1 đến L11)    │   │
│  │   & FAQ tương tác │     │    đóng form &    │     │ • Trợ lý AI 24/7  │   │
│  │ • 10 Học cụ Thuê  │     │    nhắc tham gia) │     │ • Kho 18 mẫu code │   │
│  │   & Bán (Chọn mẫu │     │ • Đặt In A5 – A1  │     │   LaTeX chuẩn FIT │   │
│  │   máy & độ mới %) │     │   (2 bảng giá)    │     │ • Đổi điểm VIP    │   │
│  │ • Lịch sử mua hàng│     │ • Cò Gia Sư KHTN  │     │   nhận Voucher    │   │
│  └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘   │
│            │                         │                         │             │
│            └─────────────────────────┼─────────────────────────┘             │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ BỘ ĐIỀU PHỐI TRẠNG THÁI TRUNG TÂM (App.tsx + LocalStorage Persistence) │  │
│  │ • Hồ sơ sinh viên K26–K23 (`forus_student_profile_v3`)                 │  │
│  │ • Giỏ hàng tối giản (`CartDrawer.tsx`) & Lịch sử đơn hàng (`motion`)   │  │
│  │ • Bộ đếm lượt hỏi AI (`forus_ai_questions_used_v2`)                    │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │ requestForusAiReply()
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│               HỆ THỐNG XỬ LÝ TRỢ LÝ AI ĐA TẦNG (forusChatService.ts)         │
│                                                                              │
│  1. Môi trường Full-stack : Gọi trực tiếp `/api/chat` (`server.ts`)          │
│  2. Môi trường GitHub Pages: Gọi qua CORS tới máy chủ Cloud Run `/api/chat`  │
│  3. Dự phòng Tĩnh Tức Thì : Bộ giải Toán, LaTeX, C++ & Học vụ tích hợp sẵn  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Luồng Điều Hướng Trung Tâm (Header Cố Định, Giỏ Hàng Tối Giản & Menu Tiện Ích)

1. **Thanh Điều Hướng Trên Cùng (`Fixed Top Header`)**:
   - **Góc trái**: Logo **FORUS** sắc nét, bấm vào luôn quay về **Trang chủ**.
   - **Chính giữa**: 6 tab chức năng được sắp xếp theo đúng tần suất sử dụng của sinh viên:
     `Trang chủ` (`home`) $\rightarrow$ `Thuê & Bán` (`gear`) $\rightarrow$ `Sự kiện` (`events`) $\rightarrow$ `In ấn` (`print`) $\rightarrow$ `Gia sư` (`tutor`) $\rightarrow$ `VIP & AI` (`vip`).
   - **Góc phải**:
     - **Huy hiệu Điểm VIP & Hạng thành viên**: Hiển thị số điểm hiện có (`student.points / 100đ`).
     - **Nút chuyển Giao diện Sáng / Tối (`Sun` / `Moon`)**.
     - **Nút Giỏ hàng Tối giản (Icon-only Cart Button)**: Thiết kế tinh gọn chỉ gồm biểu tượng giỏ hàng và huy hiệu số lượng món, tương thích hoàn hảo với cả nền sáng và nền tối.
     - **Nút Menu Tiện Ích**: Mở ngăn kéo quản lý Hồ sơ sinh viên (tự động duy trì trạng thái đăng nhập xuyên suốt phiên làm việc), chỉnh sửa khóa học (`Khóa K26 (Năm 1)` đến `Khóa K23 (Năm 4)`), xem Mã QR định danh và lịch sử cộng/trừ điểm VIP.

---

## 4. Chi Tiết Luồng Hoạt Động Của Từng Phân Hệ Dịch Vụ

### 4.1. Trang Chủ, Lịch Sử Mua Hàng & Trang Giới Thiệu (`home` & `about`)
- **Khối Hero Tương Tác Độc Bản**:
  - Tích hợp hiệu ứng ánh sáng Spotlight theo trỏ chuột, vòng quỹ đạo học thuật và 4 thẻ trụ cột tương tác dẫn thẳng tới từng phân hệ.
  - Nút CTA độc lập nổi bật **"Khám phá câu chuyện & Hệ sinh thái FORUS"** dẫn sang trang `about` (`AboutAndContactView.tsx`), nơi trình bày chi tiết sứ mệnh dự án, bộ **Câu hỏi thường gặp (FAQ)** đóng/mở mượt mà và biểu mẫu liên hệ.
- **Khối Lịch Sử Mua Hàng Trung Thực (kèm Hiệu ứng Cuộn `Fade-up + Stagger`)**:
  - Mặc định khi chưa đặt hàng, danh sách lịch sử đơn hàng **để trống hoàn toàn** (không tự tạo dữ liệu giả) kèm nút dẫn tới khu vực mua sắm.
  - Ngay khi sinh viên hoàn tất đặt mua trong `CartDrawer`, đơn hàng thực tế sẽ xuất hiện kèm hiệu ứng trượt nhẹ từ dưới lên (`Fade-up + Stagger`, chỉ kích hoạt 1 lần đầu khi cuộn tới bằng `motion/react` với `viewport={{ once: true }}`).

---

### 4.2. Thuê & Bán Thiết Bị Học Tập Đặc Thù (`gear` — 10 Sản Phẩm)
- **Tùy chọn linh hoạt theo Dòng máy/Đầu sách và Tình trạng (`Thuê ngắn hạn` / `80%` / `90%` / `Mới 100%`)**:
  1. **Máy tính cầm tay (`FORUS-07`)**: Chọn giữa 5 mẫu máy (*Casio fx-580VN X, Casio fx-880BTG, Vinacal 680EX Plus, Vinacal 680EX Plus III, Thiên Long Flexio Fx799VN*).
     - **Cơ chế tính giá chuẩn xác (`getVariantAdjustedPrice`)**: Các gói **Thuê ngắn hạn** luôn giữ nguyên mức giá thuê chuẩn (**15.000đ/ngày** và **45.000đ/tuần** cho mọi dòng máy); chỉ các gói **Mua đứt (80%, 90%, Mới 100%)** mới cộng/trừ chênh lệch giá (`priceDelta`) theo dòng máy.
  2. **Giáo trình Đại cương KHTN (`FORUS-08`)**: Chọn từng cuốn trong 10 giáo trình (*Vi tích phân 1 & 2, Đại số tuyến tính, Xác suất thống kê, Vật lý đại cương 2, Mạng máy tính, Triết học Mác-Lênin, Tư tưởng HCM, Lịch sử Đảng, Pháp luật đại cương*), hình ảnh bìa sách tự động cập nhật ngay khi chọn.
  3. **Áo Blouse Phòng Thí Nghiệm (`FORUS-09`)**: Chọn size S, M, L, XL; thuê nhanh **15.000đ/buổi** hoặc mua theo độ mới.
  4. **Bộ Dụng Cụ "TechRescue" (`FORUS-10`)**: Cứu nguy thuyết trình đồ án với Hub USB-C, cổng xuất máy chiếu HDMI 4K, cáp kết nối và chuột không dây Silent (Thuê **20.000đ/buổi**, **30.000đ/ngày** hoặc mua trọn bộ).
  5. **Nhóm Thiết bị Ghi chép Số & LaTeX (`FORUS-01` đến `FORUS-06`)**: Combo Bảng vẽ "iPad Sinh Viên", Bàn phím MacroPad "OneTap LaTeX", Flashcard công thức chống nước, Giá đỡ công thái học ORICO, Gói Setup LaTeX và Bộ Sticker phím toán.

---

### 4.3. Săn Điểm Rèn Luyện & Sự Kiện Học Thuật (`events`)
- Hiển thị danh sách các hội thảo học thuật, ngày hội tình nguyện Green Campus, Workshop LaTeX và cuộc thi lập trình tại Cơ sở 1.
- Mỗi thẻ sự kiện có **Đồng hồ đếm ngược trực tiếp** tới thời điểm đóng đơn đăng ký, thanh tiến trình số lượng chỗ còn trống, nút **"Nhắc Tôi Tham Gia"** và khu vực ghi chú lưu ý (trang phục, giờ điểm danh QR).

---

### 4.4. Đặt In Ấn Tài Liệu & Poster Khổ A5 – A1 (`print`)
- **Chọn từng khổ giấy độc lập từ A5 đến A1**:
  - Sinh viên chọn trực tiếp một trong 5 khổ giấy: **`Khổ A5`** (`14.8 × 21 cm`), **`Khổ A4`** (`21 × 29.7 cm`), **`Khổ A3`** (`29.7 × 42 cm`), **`Khổ A2`** (`42 × 59.4 cm`), hoặc **`Khổ A1`** (`59.4 × 84.1 cm` — chuyên in Poster Đồ án 1).
- **2 Bảng Giá In Ấn Niêm Yết Rõ Ràng**:
  1. **Bảng giá in Trắng Đen / Photocopy (Giấy tiêu chuẩn Fort 70gsm – 80gsm)**: Phân tách rõ cột *Giá in số lượng ít (Dưới 10 tờ)* và *Giá in số lượng lớn (Trên 100 – 500 tờ)*.
  2. **Bảng giá in Màu Toàn Diện (Full Color)**: Phân tách rõ cột *In màu giấy thường (Fort 70–80gsm)* và *In màu giấy dày / Giấy ảnh (Couche, ĐL >180gsm)*.
- **Tự động báo giá & Đặt in**: Khi tải file lên và chọn số trang, chất liệu giấy (`Fort` hoặc `Couche`), số bản và gia công (đóng lò xo, bấm kim, ống đựng poster), hệ thống tự động tính thành tiền và cộng điểm VIP khi thêm vào giỏ.

---

### 4.5. Sàn Kết Nối Cò Gia Sư KHTN (`tutor`)
- Hỗ trợ lọc theo đối tượng (*Phụ huynh tìm Gia sư* / *Hồ sơ Gia sư Sinh viên*), khu vực quận và tìm kiếm theo môn học.
- Thanh **Sắp xếp học phí** được thiết kế tối ưu đáp ứng (`responsive flex-wrap`) không bị tràn ngang trên màn hình điện thoại nhỏ.
- Cho phép sinh viên bấm nhận lớp/liên hệ gia sư (`+5 điểm VIP`) hoặc đăng hồ sơ gia sư mới lên hệ thống (`+10 điểm VIP`).

---

### 4.6. Trung Tâm Tính Năng Số VIP & AI (`vip`)
Tích hợp 4 mô-đun công cụ số thông minh với bộ chuyển đổi dạng lưới 2×2 gọn gàng trên di động:
1. **Sơ Đồ Chỉ Dẫn Các Tầng CS1 (B1 – L11)**: Chọn từng tầng từ Hầm B1, Trệt L1 đến Lầu 11 Tòa I để xem sơ đồ mặt bằng trực quan và tra cứu vị trí từng phòng học, phòng Lab, văn phòng khoa.
2. **Trợ Lý AI Học Tập FORUS 24/7**: Giải bài tập đại cương, viết code C++/Python, xuất mã LaTeX. Khi chưa đạt 100 điểm VIP được hỏi thử 5 câu miễn phí; khi đạt **100 điểm VIP** mở khóa hỏi không giới hạn (`∞`).
3. **Kho 18 Mẫu Code LaTeX Chuẩn Khoa CNTT**: Phân theo 4 nhóm (*Đại số & Ma trận*, *Giải tích & Chuỗi*, *Toán rời rạc & Thuật toán*, *Báo cáo Đồ án & Beamer*), hỗ trợ tìm kiếm và sao chép 1 chạm.
4. **Đổi Điểm VIP Nhận Voucher**: Đổi 50đ, 60đ hoặc 100đ VIP lấy mã giảm giá áp dụng trực tiếp trong giỏ hàng.

---

## 5. Luồng Quản Lý Hồ Sơ Sinh Viên (K26–K23), Điểm Thưởng VIP & Lịch Sử Đơn Hàng

1. **Đăng nhập 1 lần duy nhất & Định danh Khóa K26 – K23**:
   - Sinh viên chỉ cần đăng nhập một lần qua `StudentAuthModal`; thông tin được lưu bền vững trong `localStorage` và tự động điền sẵn khi mở phần chỉnh sửa hồ sơ hoặc thanh toán giỏ hàng.
   - Hệ thống niên khóa được chuẩn hóa chính xác: **`Khóa K26 (Năm 1)`**, **`Khóa K25 (Năm 2)`**, **`Khóa K24 (Năm 3)`**, **`Khóa K23 (Năm 4)`**.
2. **Cơ chế Cộng / Trừ Điểm VIP Minh Bạch**:
   - Mua/Thuê học cụ, đặt in tài liệu hoặc kết nối gia sư $\rightarrow$ Tự động cộng `+5` đến `+10 điểm VIP`.
   - Đổi Voucher ưu đãi hoặc dùng điểm giảm giá đơn hàng $\rightarrow$ Tự động trừ số điểm VIP tương ứng.
3. **Giỏ hàng Tối giản & Khởi tạo Đơn hàng Thực tế (`CartDrawer.tsx`)**:
   - Giao diện giỏ hàng tối giản tập trung vào danh sách sản phẩm, chọn địa điểm nhận tại CS1 (Tòa I, Dãy B, C, E, F, Thư viện), áp dụng Voucher và xác nhận đặt hàng.
   - Sau khi nhấn **Đặt mua**, đơn hàng được ghi vào Lịch sử mua hàng kèm mã đơn và thời gian thực.

---

## 6. Luồng Xử Lý Trợ Lý AI Đa Tầng (Hỗ Trợ Cả Cloud Run & GitHub Pages)

Để đảm bảo Chatbot AI hoạt động ổn định 100% trên cả môi trường máy chủ Node.js lẫn môi trường web tĩnh **GitHub Pages (`*.github.io`)**, FORUS sử dụng kiến trúc điều phối 3 tầng trong `src/utils/forusChatService.ts`:

1. **Tầng 1 — Máy chủ Nội bộ (`/api/chat` trên `server.ts`)**: Khi chạy trên môi trường Full-stack, gửi yêu cầu trực tiếp tới Express server để gọi SDK `@google/genai` (`gemini-3.1-flash-lite` / `gemini-3.8-flash`).
2. **Tầng 2 — Kết nối Máy chủ Cloud Run Từ Xa qua CORS**: Khi người dùng mở website trên tên miền tĩnh `https://qwerty2008.github.io/FORUS/`, ứng dụng tự động kiểm tra `Content-Type: application/json` (tránh tuyệt đối lỗi đọc nhầm trang HTML 404 của GitHub Pages) và gọi qua CORS tới máy chủ Cloud Run của FORUS.
3. **Tầng 3 — Bộ Xử Lý AI Học Thuật & Học Vụ Tích Hợp Sẵn (`generateSmartAcademicReply`)**: Nếu người dùng ngoại tuyến hoặc máy chủ từ xa đang nghỉ, bộ giải tích hợp sẵn ngay trên trình duyệt sẽ tính toán biểu thức toán học, giải thích Định lý Kẹp, Khai triển Maclaurin, Tích phân, Ma trận, Quy nạp toán học, xuất code C++/LaTeX và báo giá dịch vụ FORUS tức thì.

---

## 7. Kịch Bản Demo Thuyết Trình Nhanh (Dành Cho Buổi Chấm Poster Đồ Án 1)

1. **Bước 1 — Quét QR & Trải nghiệm Trang Chủ (20 giây)**:
   - Quét mã QR mở trang chủ trên điện thoại/máy tính, giới thiệu Hero 4 trụ cột, chuyển đổi chế độ **Sáng / Tối** và mở trang **Giới thiệu & FAQ**.
2. **Bước 2 — Thuê & Mua Học Cụ Thông Minh (40 giây)**:
   - Vào mục **Thuê & Bán**: chọn **Máy tính cầm tay**, đổi thử sang dòng *Thiên Long Flexio Fx799VN* hoặc *Casio fx-880BTG* để thấy giá thuê ngắn hạn giữ chuẩn **15.000đ/ngày** còn giá mua đứt 80%/90%/100% tự động điều chỉnh; giới thiệu thêm **Bộ dụng cụ thuyết trình TechRescue**.
3. **Bước 3 — Đặt In Khổ A5 – A1 & Xem 2 Bảng Giá Chuẩn (30 giây)**:
   - Vào mục **In ấn**: chọn thử các khổ giấy từ **A5 đến A1**, đối chiếu trực tiếp với 2 bảng giá Trắng Đen (Fort 70–80gsm) và In Màu (Fort / Couche >180gsm), tải thử 1 file và bấm thêm vào giỏ.
4. **Bước 4 — Đặt Hàng Trong Giỏ Hàng Tối Giản & Xem Hiệu Ứng Lịch Sử Đơn Hàng (30 giây)**:
   - Bấm biểu tượng **Giỏ hàng** góc trên phải, nhấn **Đặt mua**, sau đó cuộn xuống mục **Lịch sử mua hàng** để xem thẻ đơn hàng mới xuất hiện mượt mà với hiệu ứng **Fade-up + Stagger**.
5. **Bước 5 — Khám Phá Sơ Đồ Tầng CS1, 18 Mẫu LaTeX & Trợ Lý AI (40 giây)**:
   - Vào mục **VIP & AI**: bấm xem **Sơ đồ tầng B1 – L11**, sao chép 1 mẫu code trong **Kho 18 mẫu LaTeX**, và đặt câu hỏi Giải tích/LaTeX cho **Trợ lý AI FORUS**.
