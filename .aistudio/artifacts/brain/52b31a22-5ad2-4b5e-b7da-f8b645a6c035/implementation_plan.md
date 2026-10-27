# FORUS — Hệ Sinh Thái Tiện Ích Sinh Viên ĐH Khoa Học Tự Nhiên (Cơ Sở 1)

FORUS (*"Tiện ích trong tay, học hay mỗi ngày"*) là nền tảng thương mại điện tử và dịch vụ tiện ích toàn diện dành riêng cho sinh viên Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5). Hệ thống giải quyết trọn vẹn các nhu cầu thiết yếu từ thiết bị ghi chép toán/code, ăn sáng giao tận giảng đường, in ấn tài liệu lấy liền, kết nối gia sư cho đến tích điểm mở khóa đặc quyền Săn Điểm Rèn Luyện và Chatbot AI học vụ.

## User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các quyết định sản phẩm và kỹ thuật đã được thống nhất từ yêu cầu của bạn:

- **Xác thực Email Sinh viên & Chế độ Demo VIP 100 điểm**: Hỗ trợ đăng nhập nhanh bằng email đuôi `@student.hcmus.edu.vn` (hoặc `@hcmus.edu.vn`, `@fit.hcmus.edu.vn`). Mỗi lần sử dụng dịch vụ/mua sắm sẽ cộng từ **5–10 điểm** vào tài khoản. Đồng thời tích hợp nút **"Kích hoạt nhanh VIP (100 Điểm - Chế độ Thử/Demo)"** ngay trên thanh công cụ tài khoản để giảng viên và các bạn cùng lớp trải nghiệm tức thì đặc quyền VIP khi quét QR tại buổi trình bày.
- **Tách riêng Poster A1 & Hồ sơ Đồ án ra file ngoài**: Giao diện website giữ đúng chất một nền tảng startup thực thụ, **không** hiển thị mục Poster A1 trên web. Toàn bộ nội dung thiết kế Poster A1, bảng phân công nhóm và cấu trúc nộp bài sẽ được đóng gói thành các tài liệu độc lập ngoài luồng giao diện chính (kèm cấu trúc chuẩn sẵn sàng đẩy lên GitHub).
- **Trọng tâm Đặc quyền VIP (Khi đạt $\ge 100$ điểm)**:
  1. **Bảng Săn Điểm Rèn Luyện (ĐRL)**: Tổng hợp các sự kiện học thuật, hội thảo AI, tình nguyện tại Cơ sở 1 có cộng ĐRL (Mục 1, 2, 3, 4), tích hợp **đồng hồ đếm ngược thời gian thực** đến hạn đóng form đăng ký và thời điểm kết thúc sự kiện, kèm nút bật **nhắc hẹn thông báo & lưu ý quan trọng**.
  2. **Chatbot AI Hỗ trợ Sinh viên HCMUS**: Kết nối Gemini (`gemini-3.8-flash`) qua backend server-side để giải đáp thắc mắc học vụ Cơ sở 1, tra cứu nhanh công thức Giải tích/Đại số tuyến tính, sinh đoạn code khung LaTeX/C++/Python và gợi ý sản phẩm trong hệ sinh thái FORUS.

---

## 1. Overview & Core Concept

- **What It Does**: Cung cấp 4 nhóm dịch vụ cốt lõi cho sinh viên KHTN:
  1. **Thuê & Bán Phụ Kiện Học Tập Đặc Thù**: 7 nhóm sản phẩm/dịch vụ chuyên biệt (Combo "iPad Sinh Viên" bảng vẽ + găng tay + phần mềm Scrble cấu hình sẵn, Bàn phím MacroPad "OneTap LaTeX", Flashcard chống nước "Cứu Mạng Giữa Kỳ", Giá đỡ nghiêng 15° công thái học ORICO, Gói Setup Trạm Ghi Chép Số & Template LaTeX chuẩn Khoa CNTT, Bộ Sticker bàn phím ký hiệu toán học $\forall, \exists, \in, \Rightarrow, \Leftrightarrow$, và Dịch vụ cho thuê máy tính cầm tay Casio/Vinacal, giáo trình đại cương, áo blouse phòng thí nghiệm).
  2. **Đặt Đồ Ăn Sáng & Nước Uống Giao Tận Phòng**: Menu bánh mì, xôi mặn, cơm tấm, cà phê muối, trà đào... cho phép chọn chính xác **Tòa nhà tại Cơ sở 1 (Tòa I, B, C, E, F, Dãy A, Thư viện, Hội trường I)**, số phòng học và khung giờ giao giữa ca (ví dụ: 7h15 trước ca 1, 9h10 giải lao).
  3. **Gửi In Tài Liệu Lấy Liền**: Tải file lên (PDF/Word/Ảnh), tùy chọn khổ giấy (**A1, A2, A3, A4, A5** — bao gồm cả in Poster đồ án khổ A1), chế độ in (**Màu / Trắng đen**), in 1 mặt hoặc 2 mặt, đóng gáy lò xo/bìa kiếng, tự động tính thành tiền theo số trang và cộng điểm tích lũy.
  4. **Cò Gia Sư (Kết Nối Sinh Viên & Học Sinh)**: Sàn kết nối hai chiều giúp sinh viên KHTN nhận lớp gia sư (Toán, Lý, Hóa, Tin học, Lập trình C++/Python, IELTS) và phụ huynh/học sinh đăng nhu cầu tìm gia sư chất lượng cao, có bộ lọc theo môn, cấp học và khu vực (Quận 5, Quận 1, Quận 10, Quận 3...).
- **Target Audience / Persona**: Sinh viên Trường ĐH Khoa học Tự nhiên — ĐHQG-HCM (đặc biệt là sinh viên Khoa CNTT và các khoa cơ bản tại Cơ sở 1 Nguyễn Văn Cừ) cùng giảng viên và khách tham quan chấm điểm trong buổi trình bày Poster Đồ án 1 (CSC00006).
- **Key Value**: Tiết kiệm thời gian di chuyển giữa các ca học, tối ưu hóa tốc độ ghi chép Toán & LaTeX với chi phí sinh viên, đồng thời gamification hóa việc mua sắm bằng cơ chế tích điểm mở khóa công cụ săn Điểm Rèn Luyện và trợ lý AI.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Khám phá & Chuyển đổi Sáng/Tối**: Người dùng truy cập qua link hoặc quét mã QR trên điện thoại. Header tự động hiển thị phiên bản Logo FORUS nền sáng hoặc nền tối tương ứng với chế độ giao diện đang chọn.
  2. **Đăng nhập Sinh viên & Tích điểm**: Nhập MSSV và email `@student.hcmus.edu.vn` để định danh nhanh. Thanh tiến trình điểm (`0 / 100 pts`) hiển thị trực quan; người dùng có thể tích điểm tự nhiên qua mỗi đơn hàng (`+5` đến `+10 điểm`/lần) hoặc bấm nút **"Thử nghiệm VIP (100 điểm)"** để mở khóa ngay khu vực VIP.
  3. **Mua sắm, Thuê đồ, Đặt món & Đặt in**: Thêm sản phẩm (chọn Mua đứt hoặc Thuê theo tuần/ngày), cấu hình đơn in A1–A5 hoặc chọn phòng học giao đồ ăn sáng vào chung một **Giỏ hàng thông minh**.
  4. **Thanh toán Chế độ Thử (Sandbox Checkout)**: Đáp ứng tiêu chí an toàn của Đồ án 1 — hỗ trợ chọn phương thức thanh toán thử nghiệm (Ví MoMo Sinh Viên, VietQR Ngân hàng, hoặc Tiền mặt khi nhận tại phòng học), áp mã giảm giá sinh viên (`FORUSKHTN`, `CSC00006`), xuất biên lai xác nhận đơn hàng và cộng điểm thưởng ngay lập tức.
  5. **Trải nghiệm Đặc quyền VIP**: Khi đạt 100 điểm, mở khóa tab **Săn Điểm Rèn Luyện** (xem đồng hồ đếm ngược từng giây đến hạn đăng ký/kết thúc, bấm nhận thông báo nhắc lịch và ghi chú lưu ý) và **Chatbot AI FORUS** hỗ trợ giải đáp trực tiếp.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: **Modern Campus Tech & Utility** — Năng động, hiện đại, lấy cảm hứng từ màu xanh khoa học (Science Blue) và xanh mầm cây (Growth Emerald) trong bộ nhận diện thương hiệu FORUS bạn đã cung cấp, kết hợp bố cục rõ ràng, dễ thao tác bằng một tay trên điện thoại.
  - *Color Palette & Mood*:
    - **Light Mode**: Nền chính trắng ngà tinh khiết (`#F8FAFC`), bề mặt thẻ trắng (`#FFFFFF`) với viền mảnh (`#E2E8F0`), chữ chính xanh đen đậm (`#0F172A`).
    - **Dark Mode**: Nền chính xanh đen sâu (`#0B1120`), bề mặt thẻ (`#111827`) với viền tinh tế (`#1E293B`), chữ chính sáng rõ (`#F8FAFC`).
    - **Brand Accents**: Xanh dương KHTN chủ đạo (`#0284C7` / `#38BDF8`) kết hợp xanh lá năng lượng (`#10B981`) cho điểm thưởng và huy hiệu VIP.
  - *Typography & Hierarchy*:
    - **Display / Headings**: `Plus Jakarta Sans` (SemiBold/Bold) tạo cảm giác công nghệ, hiện đại và hiển thị tiếng Việt sắc nét.
    - **Body Prose**: `Plus Jakarta Sans` / `DM Sans` tối ưu độ dễ đọc trên cả màn hình di động và máy tính.
    - **Data, Giá tiền, Công thức & Đồng hồ đếm ngược**: `JetBrains Mono` với `tabular-nums` giúp các con số đếm ngược, bảng giá in A1–A5 và điểm tích lũy thẳng hàng tuyệt đối.
  - *Component Styling & Layout*:
    - Tuân thủ **Top Bar Contract** gọn gàng trên desktop và thanh điều hướng đáy (Bottom Navigation Bar) tiện lợi trên mobile để khách quét mã QR dễ dàng chuyển qua lại giữa các mục.
    - Hiển thị thông tin phụ (khoa, tòa nhà, điểm cộng, trạng thái) bằng văn bản tinh gọn phân tách bởi dấu `·` theo chuẩn Zero-Pill, giữ giao diện sạch sẽ và cao cấp.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Cơ chế Tích điểm Gamification & Nút Mở khóa VIP Tức thì**
  - *Chosen Approach*: Mỗi dịch vụ hoàn tất trong giỏ hàng hoặc đăng ký in ấn/gia sư sẽ cộng từ 5–10 điểm vào hồ sơ sinh viên (lưu bền vững trong `localStorage`). Kèm theo đó là nút chuyển đổi nhanh **"Demo VIP 100 Điểm"** trên thanh trạng thái điểm.
  - *Why*: Trong buổi trình bày poster kéo dài 45 phút mỗi ca, các bạn cùng lớp và giảng viên ghé thăm cần thấy được cả luồng tích điểm thực tế lẫn trải nghiệm ngay lập tức tính năng Săn Điểm Rèn Luyện và Chatbot AI mà không bị bắt buộc phải đặt 10–20 đơn hàng giả lập.
- **Decision 2: Kiến trúc Full-Stack Express + Vite cho Chatbot AI & Sẵn sàng đưa lên GitHub**
  - *Chosen Approach*: Sử dụng `server.ts` chạy Express kết hợp Vite middleware để xử lý route `/api/chat` gọi модель `gemini-3.8-flash` qua `@google/genai` SDK ở phía server, đồng thời tổ chức mã nguồn theo chuẩn dự án thực tế (có `README.md` hướng dẫn cài đặt, `.env.example`, cấu trúc thư mục rõ ràng, và thư mục `docs/do-an-1/` chứa tài liệu Poster A1 & bảng phân công ngoài luồng web).
  - *Why*: Bảo mật tuyệt đối API key theo quy chuẩn, đảm bảo AI phản hồi thông minh đúng ngữ cảnh sinh viên ĐH KHTN Cơ sở 1, và giúp nhóm dễ dàng đẩy toàn bộ source code lên GitHub hoặc nộp bài trên Moodle.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        FORUS CLIENT APPLICATION (React 19)                 │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Top Navigation Bar (Logo Sáng/Tối · Điểm Thưởng 0-100 · Giỏ Hàng)   │  │
│  └───────────────┬──────────────────────────────────────┬───────────────┘  │
│                  │                                      │                  │
│                  ▼                                      ▼                  │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────┐  │
│  │  KHU VỰC DỊCH VỤ TIỆN ÍCH (4 TAB) │  │  ĐẶC QUYỀN VIP (100+ ĐIỂM)    │  │
│  ├───────────────────────────────────┤  ├───────────────────────────────┤  │
│  │ 1. Thuê & Bán Thiết Bị Học Tập    │  │ • Bảng Săn Điểm Rèn Luyện     │  │
│  │    (7 sản phẩm KHTN + Thuê đồ)    │  │   - Đồng hồ đếm ngược (Live)  │  │
│  │ 2. Đồ Ăn Sáng & Nước Uống         │  │   - Nhắc hẹn & Ghi chú lưu ý  │  │
│  │    (Chọn tòa I,B,C,E,F + Số phòng)│  │ • Trợ Lý AI Sinh Viên FORUS   │  │
│  │ 3. Gửi In Tài Liệu Lấy Liền       │  │   - Giải đáp học vụ & LaTeX   │  │
│  │    (Khổ A1-A5, Màu/Đen trắng)     │  │   - Gợi ý combo thiết bị học  │  │
│  │ 4. Cò Gia Sư HCMUS                │  └───────────────┬───────────────┘  │
│  │    (Lọc lớp & Đăng ký nhận lớp)   │                  │                  │
│  └───────────────┬───────────────────┘                  │                  │
│                  │                                      │                  │
│                  ▼                                      │                  │
│  ┌───────────────────────────────────┐                  │                  │
│  │ Giỏ Hàng & Thanh Toán Thử Nghiệm  │                  │                  │
│  │ (+5 đến +10 điểm / đơn hàng)      │                  │                  │
│  └───────────────────────────────────┘                  │                  │
└─────────────────────────────────────────────────────────┼──────────────────┘
                                                          │ POST /api/chat
                                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND SERVER (server.ts)                     │
│  • Route `/api/chat`: Kết nối @google/genai (`gemini-3.8-flash`)           │
│  • System Prompt chuyên biệt cho sinh viên ĐH KHTN Cơ sở 1 (Nguyễn Văn Cừ) │
└────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **UserProfile & Loyalty State**: Lưu trữ thông tin sinh viên (`email`, `studentId`, `fullName`, `faculty`, `points`, `isVip`, `pointHistory`, `savedEventReminders`) đồng bộ với `localStorage`.
- **Catalog Items (7+ Sản phẩm Thuê & Bán + Thực đơn Ăn sáng)**:
  - Sử dụng trực tiếp toàn bộ hình ảnh thực tế bạn đã tải lên (`logo_sang_xoa_nen`, `logo_toi_xoa_nen`, `logo_goc`, `giado`, `banphim`, ảnh bảng vẽ điện tử + găng tay, và ảnh bộ flashcard toán học chống nước) kết hợp hình ảnh minh họa chất lượng cao cho các mục ăn sáng, in ấn và thuê máy tính/áo blouse.
  - Hỗ trợ 2 chế độ giá trên cùng một sản phẩm (ví dụ: Combo "iPad Sinh Viên" cho phép chọn **Thuê 35.000đ/tuần** hoặc **Mua đứt 390.000đ**; Máy tính Casio/Giáo trình/Áo blouse cho thuê theo ngày hoặc tuần).
- **PrintOrder Configurator**: Tính giá tự động dựa trên khổ giấy (`A1` đến `A5`), loại in (`Màu` / `Trắng đen`), số mặt, số trang, số bản và tùy chọn gia công, đẩy trực tiếp thành một item chi tiết vào giỏ hàng.
- **TrainingPointEvents (Sự kiện Điểm Rèn Luyện)**: Danh sách sự kiện tại Cơ sở 1 có `registrationDeadline` (hạn đăng ký), `endTime` (thời gian kết thúc), `trainingPoints` (+3 đến +10 ĐRL), `category` (Học thuật, Tình nguyện, Kỹ năng), `importantNotes` (lưu ý trang phục, điểm danh QR) và trạng thái bật/tắt thông báo nhắc hẹn.
- **Standalone Project Deliverables (Tách rời khỏi giao diện web)**: Tạo bộ file tài liệu ngoài giao diện web (`POSTER_A1_FORUS.md`, `PHAN_CONG_NHOM.md`, `README.md`) để nhóm bạn có sẵn nội dung trình bày Poster A1 chuẩn mục 2.2 và nộp file nén `MSSV.zip` theo đúng yêu cầu của đề Đồ án 1.
