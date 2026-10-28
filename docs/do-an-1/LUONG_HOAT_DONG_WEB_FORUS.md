# TÀI LIỆU GIẢI THÍCH LUỒNG HOẠT ĐỘNG HỆ SINH THÁI WEB FORUS
**Dự án**: **FORUS — “Tiện ích trong tay, học hay mỗi ngày”**  
**Học phần**: Đồ án 1 (CSC00006 — Giới thiệu ngành Trí tuệ nhân tạo)  
**Đơn vị**: Khoa Công nghệ Thông tin — Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1: 227 Nguyễn Văn Cừ, Quận 5)

---

## MỤC LỤC
1. [Tổng Quan Hệ Sinh Thái & Triết Lý Vận Hành](#1-tổng-quan-hệ-sinh-thái--triết-lý-vận-hành)
2. [Sơ Đồ Kiến Trúc & Luồng Dữ Liệu Tổng Thể](#2-sơ-đồ-kiến-trúc--luồng-dữ-liệu-tổng-thể)
3. [Luồng Điều Hướng Trung Tâm (Header Cố Định, Mobile Bar & Menu Drawer)](#3-luồng-điều-hướng-trung-tâm-header-cố-định-mobile-bar--menu-drawer)
4. [Chi Tiết Luồng Hoạt Động Của Từng Phân Hệ Dịch Vụ](#4-chi-tiết-luồng-hoạt-động-của-từng-phân-hệ-dịch-vụ)
   - [4.1. Trang Chủ & Trang Bài Giới Thiệu Chi Tiết (`home` & `about`)](#41-trang-chủ--trang-bài-giới-thiệu-chi-tiết-home--about)
   - [4.2. Đặt Đồ Ăn Sáng & Nước Uống Giao Tận Phòng (`food`)](#42-đặt-đồ-ăn-sáng--nước-uống-giao-tận-phòng-food)
   - [4.3. Đặt In Ấn Tài Liệu & Poster Khổ A1–A5 (`print`)](#43-đặt-in-ấn-tài-liệu--poster-khổ-a1a5-print)
   - [4.4. Sàn Kết Nối Cò Gia Sư HCMUS (`tutor`)](#44-sàn-kết-nối-cò-gia-sư-hcmus-tutor)
   - [4.5. Thuê & Bán Thiết Bị Học Tập Đặc Thù (`gear`)](#45-thuê--bán-thiết-bị-học-tập-đặc-thù-gear)
   - [4.6. Đặc Quyền VIP: Săn Điểm Rèn Luyện & Trợ Lý AI 24/7 (`vip`)](#46-đặc-quyền-vip-săn-điểm-rèn-luyện--trợ-lý-ai-247-vip)
5. [Luồng Nghiệp Vụ Điểm Thưởng & Hạng Thành Viên VIP](#5-luồng-nghiệp-vụ-điểm-thưởng--hạng-thành-viên-vip)
6. [Luồng Xử Lý Trợ Lý AI Học Tập 24/7 (Frontend ↔ Backend Gemini API)](#6-luồng-xử-lý-trợ-lý-ai-học-tập-247-frontend--backend-gemini-api)
7. [Kịch Bản Demo Thuyết Trình Nhanh (Dành Cho Buổi Chấm Poster Đồ Án 1)](#7-kịch-bản-demo-thuyết-trình-nhanh-dành-cho-buổi-chấm-poster-đồ-án-1)

---

## 1. Tổng Quan Hệ Sinh Thái & Triết Lý Vận Hành

**FORUS** được thiết kế như một **Trạm tiện ích sinh viên khép kín (All-in-One Campus Utility Hub)** giải quyết trực tiếp các nhu cầu cấp thiết hàng ngày của sinh viên Trường ĐH Khoa học Tự nhiên (Cơ sở 1 — 227 Nguyễn Văn Cừ):

1. **Tiện ích tức thời tại chỗ (Campus Express)**: Giao đồ ăn sáng/cà phê tận phòng học (Tòa I, B, C, E, F) trong 15 phút; đặt in giáo trình, đề cương và Poster khổ A1–A5 lấy liền không cần xếp hàng.
2. **Hỗ trợ học tập đặc thù khối Tự Nhiên & CNTT**: Cho thuê và bán Combo Bảng vẽ điện tử ("iPad Sinh Viên" 35.000đ/tuần), Bàn phím MacroPad gõ nhanh công thức LaTeX, Flashcard công thức toán chống nước, Máy tính cầm tay Casio/Vinacal (tùy chọn dòng máy và độ mới 100%, 90%, 80%), Giáo trình đại cương và Áo blouse phòng thí nghiệm.
3. **Vòng lặp gắn kết bằng Điểm VIP & Trí tuệ nhân tạo (Gamified Loyalty + AI)**:
   - Mỗi giao dịch mua hàng, thuê đồ, đặt in hay đánh giá sản phẩm đều **cộng điểm VIP trực tiếp** vào Hạng thành viên.
   - Sinh viên có thể dùng điểm VIP để **đổi Voucher giảm giá** (trừ điểm VIP tương ứng).
   - Khi tích lũy đủ **100 điểm VIP**, sinh viên mở khóa toàn bộ **Bảng Săn Điểm Rèn Luyện (ĐRL) đếm ngược thời gian thực** và **hỏi Trợ lý AI Học tập 24/7 không giới hạn (`∞`)** (so với giới hạn **5 câu miễn phí** khi chưa kích hoạt VIP).

---

## 2. Sơ Đồ Kiến Trúc & Luồng Dữ Liệu Tổng Thể

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN NGƯỜI DÙNG (REACT + TAILWIND SPA)                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Thanh Điều Hướng Cố Định Trên Cùng (Fixed Top Header - z-40)           │  │
│  │ • Trái: Logo FORUS (tự động đổi Sáng/Tối) → Bấm về Trang chủ           │  │
│  │ • Giữa: [Trang chủ] [Ăn uống] [In ấn] [Gia sư] [Thuê & Bán] [VIP]      │  │
│  │ • Phải: [Huy hiệu Điểm VIP] [Nút Sáng/Tối] [Giỏ hàng (N)] [Nút Menu]   │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      │                                       │
│        ┌─────────────────────────────┼─────────────────────────────┐         │
│        ▼                             ▼                             ▼         │
│  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐   │
│  │ KHỐI THƯƠNG MẠI   │     │ KHỐI DỊCH VỤ CS1  │     │ KHỐI ĐẶC QUYỀN    │   │
│  │ • Trang chủ & QR  │     │ • Đặt In A1–A5    │     │ • Bảng Săn ĐRL    │   │
│  │ • Trang Bài Giới  │     │   (Tải file, tính │     │   (Đếm ngược giờ  │   │
│  │   Thiệu Chi Tiết  │     │    trang & báo    │     │    đăng ký & nhắc │   │
│  │   (activeTab=about│     │    giá tự động)   │     │    hẹn sự kiện)   │   │
│  │ • Ăn uống Express │     │ • Cò Gia Sư HCMUS │     │ • Trợ lý AI 24/7  │   │
│  │ • Thuê & Bán Gear │     │   (Tìm lớp, ứng   │     │   (Chưa VIP: 5 câu│   │
│  │   (Chọn dòng máy  │     │    tuyển & đăng   │     │    / Đạt VIP 100đ:│   │
│  │    & độ mới %)    │     │    ký hồ sơ mới)  │     │    Không giới hạn)│   │
│  └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘   │
│            │                         │                         │             │
│            └─────────────────────────┼─────────────────────────┘             │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ BỘ ĐIỀU PHỐI TRẠNG THÁI TRUNG TÂM (App.tsx + LocalStorage Persistence) │  │
│  │ • Hồ sơ sinh viên & Điểm VIP (`forus_student_profile`)                 │  │
│  │   - Mua/Thuê/In ấn → `earnPoints(+N)` → Cộng điểm & tăng hạng VIP      │  │
│  │   - Đổi Voucher / Giảm giá đơn → `redeemPoints(cost)` → Trừ điểm VIP   │  │
│  │ • Giỏ hàng & Hóa đơn (`CartDrawer.tsx`)                                │  │
│  │ • Bộ đếm lượt hỏi AI (`forus_ai_questions_used_v2`)                    │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │ HTTP POST /api/chat
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     MÁY CHỦ BACKEND (EXPRESS + VITE SERVER)                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Route `/api/chat` (`server.ts`)                                        │  │
│  │ 1. Nhận `message`, `history`, và `studentInfo` (Họ tên, MSSV, Điểm VIP)│  │
│  │ 2. Gọi SDK `@google/genai` (`gemini-3.5-flash-lite` + MINIMAL thinking)│  │
│  │ 3. Trả về lời giải Giải tích, Đại số, Vật lý, Hóa, C++, LaTeX          │  │
│  │ 4. Hiển thị đẹp mắt ở Client qua `FormattedAiMessage.tsx` (Toán/Code)  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Luồng Điều Hướng Trung Tâm (Header Cố Định, Mobile Bar & Menu Drawer)

### 3.1. Thanh Điều Hướng Trên Cùng (`Fixed Top Header`)
- **Luôn ghim cố định ở mép trên màn hình (`fixed top-0 left-0 right-0 z-40`)**: Khi người dùng cuộn trang trên máy tính hoặc điện thoại, thanh Header không bị trôi mất.
- **Cấu trúc 3 vùng**:
  1. **Góc trái**: Logo thương hiệu **FORUS** kích thước lớn, tự động đổi phiên bản Sáng/Tối theo giao diện. Bấm vào Logo sẽ đưa người dùng về **Trang chủ**.
  2. **Chính giữa (Trên máy tính)**: 6 nút chuyển phân hệ dạng Segmented Tabs:
     - `Trang chủ` (`home`)
     - `Ăn uống` (`food`)
     - `In ấn` (`print`)
     - `Gia sư` (`tutor`)
     - `Thuê & Bán` (`gear`)
     - `VIP` (`vip`)
  3. **Góc phải**:
     - **Huy hiệu Hạng thành viên & Điểm VIP** (VD: `Hạng Đồng: 65/100đ VIP` hoặc `Thành viên VIP: 120/100đ VIP`): Bấm vào mở nhanh Menu Tài khoản.
     - **Nút chuyển chế độ Sáng / Tối (`Sun` / `Moon`)**: Lưu trạng thái vào `localStorage` (`forus_theme`) và đồng bộ class `.dark` trên toàn trang.
     - **Nút Giỏ hàng (`Giỏ hàng [N]`)**: Hiển thị tổng số lượng sản phẩm hiện có và mở ngăn kéo thanh toán (`CartDrawer`).
     - **Nút Menu Tiện Ích (`Menu`)**: Mở ngăn kéo bên phải chứa:
       - Thẻ tiến trình Hạng thành viên & Điểm VIP (kèm nút **Demo VIP 100đ** và nút **Đổi nhanh Voucher 50 điểm**).
       - Thiết lập thông tin Sinh viên (Họ tên, MSSV, Khoa, xác thực Email `@student.hcmus.edu.vn` để miễn cọc CCCD).
       - Mã QR Định danh Sinh viên (quét trên điện thoại tại buổi trình bày Poster).
       - Lịch sử cộng & trừ điểm VIP chi tiết theo thời gian thực.
       - **Liên hệ Trạm Tiện Ích FORUS — Cơ sở 1** (`AboutAndContactView.tsx`): Gửi tin nhắn liên hệ/hỗ trợ trực tiếp ngay trong Menu.

### 3.2. Thanh Điều Hướng Dưới Đáy (`Mobile Bottom Navigation`) & Nút Trợ Lý AI Nổi
- Trên màn hình di động (`< 1024px`), 6 mục dịch vụ được bố trí cố định ở cạnh dưới màn hình giúp sinh viên thao tác bằng một ngón cái.
- Ở góc dưới bên phải màn hình luôn có **Nút Trợ lý AI FORUS nổi** (hiển thị số lượt hỏi miễn phí còn lại như `5/5 lượt` hoặc biểu tượng `VIP ∞`), cho phép mở cửa sổ hỏi bài ngay lập tức dù đang ở bất kỳ tab nào.

---

## 4. Chi Tiết Luồng Hoạt Động Của Từng Phân Hệ Dịch Vụ

### 4.1. Trang Chủ & Trang Bài Giới Thiệu Chi Tiết (`home` & `about`)
- **Luồng hoạt động tại Trang chủ (`activeTab === "home"`)**:
  1. **Khối Giới thiệu Startup & Mã QR Trải nghiệm**:
     - Hiển thị câu chuyện khởi nguồn của FORUS tại Cơ sở 1 (227 Nguyễn Văn Cừ) cùng thẻ Mã QR để khách tham quan quét trải nghiệm.
     - **Nút “Giới thiệu chi tiết về FORUS”** (nằm ngay dưới đoạn văn giới thiệu và phía trên dãy 3 ô thông số `15 phút` · `35.000đ` · `100 điểm`): Khi bấm vào sẽ chuyển sang trang nội dung **`activeTab === "about"`** (trang độc lập không nằm trên thanh dịch vụ) trình bày trọn vẹn 5 phần bài giới thiệu dự án, sứ mệnh, giá trị cốt lõi và tầm nhìn của FORUS, kèm các nút điều hướng quay lại Trang chủ hoặc khám phá dịch vụ.
  2. **Khối Siêu Thị Tiện Ích Tổng Hợp**:
     - Cho phép tìm kiếm theo từ khóa, lọc nhanh theo nhóm (`Tất cả`, `Đồ ăn & Thức uống`, `Thiết bị ghi chép & Học tập`, `Cho thuê Casio / Blouse`) và sắp xếp theo giá hoặc điểm thưởng.
  3. **Khối Đổi Điểm VIP Lấy Ưu Đãi & Lịch Sử Đơn Hàng**:
     - Cho phép sinh viên bấm đổi điểm VIP lấy mã giảm giá (trừ điểm VIP tức thì) và theo dõi trạng thái đơn hàng (`Đang giao`, `Hoàn tất`).

---

### 4.2. Đặt Đồ Ăn Sáng & Nước Uống Giao Tận Phòng (`food`)
- **Đầu vào (Input)**:
  - Sinh viên lọc món theo `Tất cả`, `Đồ ăn sáng` (Bánh mì ốp la, Xôi mặn, Cơm nắm Onigiri...) hoặc `Cà phê & Giải khát` (Cà phê muối, Trà đào cam sả...).
  - Có thể bật chế độ **“Gom Đơn Nhóm / Phòng Lab (Nhân đôi điểm thưởng x2)”**.
  - Chọn biến thể kích cỡ/combo trên từng thẻ món ăn.
- **Xử lý (Process)**:
  - Khi bấm **“Đặt món”**, hệ thống thêm món vào giỏ hàng, mở `CartDrawer` và **cộng ngay điểm thưởng VIP** (`+5đ` đến `+10đ` mỗi món) vào tài khoản sinh viên.
- **Đầu ra (Output)**:
  - Hiển thị thông báo nổi xác nhận số điểm VIP vừa được cộng và cập nhật tổng điểm trên thanh Header.

---

### 4.3. Đặt In Ấn Tài Liệu & Poster Khổ A1–A5 (`print`)
- **Đầu vào (Input)**:
  1. **Tải file in từ máy tính hoặc điện thoại**: Hỗ trợ kéo-thả (Drag & Drop) hoặc bấm chọn file thực tế (`.pdf`, `.docx`, `.pptx`, `.png`, `.jpg`), hoặc chọn nhanh 1 trong 3 mẫu tài liệu học tập có sẵn để thử nghiệm nhanh.
  2. **Cấu hình thông số in**:
     - Khổ giấy: **A5, A4, A3, A2, A1** (hỗ trợ cả in Poster Đồ án 1 khổ A1 dọc).
     - Chế độ in: Trắng đen hoặc In màu Laser/Phun khổ lớn.
     - Số mặt: In 1 mặt hoặc 2 mặt (tự động tính số tờ giấy tiêu thụ).
     - Gia công: Không đóng cuốn, Bấm kim góc + băng keo gáy, Đóng lò xo nhựa + bìa kiếng, hoặc Cán màng bóng + đóng khoen 4 góc (cho Poster A1/A2).
     - Số trang & số bản копи, điểm nhận tài liệu (Quầy FORUS Sảnh B hoặc giao tận phòng học).
- **Xử lý (Process)**:
  - Công thức tính giá thời gian thực:
    $$\text{Tổng tiền} = \left( \text{Đơn giá khổ giấy/mặt} \times \text{Số trang} + \text{Phí gia công} \right) \times \text{Số bản}$$
  - Tự động tính điểm thưởng VIP (`+5 điểm` cho đơn thường hoặc `+10 điểm` cho đơn từ 30.000đ / khổ A1, A2).
- **Đầu ra (Output)**:
  - Bấm **“Thêm đơn in vào Giỏ hàng”** sẽ đưa cấu hình in kèm tên file vào Giỏ hàng và cộng điểm VIP ngay lập tức.

---

### 4.4. Sàn Kết Nối Cò Gia Sư HCMUS (`tutor`)
- **Luồng 1 — Tìm Gia Sư & Lớp Học Ghép**:
  - Lọc theo môn học (Giải tích, Đại số tuyến tính, Lập trình C++/DSA, Toán/Lý/Hóa THPT...) hoặc hình thức học (Online / Trực tiếp tại Thư viện CS1).
  - Xem thông tin GPA, thành tích của gia sư sinh viên KHTN và bấm **“Đăng ký học thử / Nhận lớp”** $\rightarrow$ Hệ thống xác nhận yêu cầu và thưởng `+5 điểm VIP`.
- **Luồng 2 — Đăng Ký Làm Gia Sư Mới**:
  - Sinh viên điền biểu mẫu: Họ tên, Khoa/Ngành, GPA, Môn nhận dạy, Học phí đề xuất $\rightarrow$ Hồ sơ mới xuất hiện ngay lập tức trên danh sách Cò Gia Sư và cộng `+10 điểm VIP`.

---

### 4.5. Thuê & Bán Thiết Bị Học Tập Đặc Thù (`gear`)
Phân hệ này được thiết kế chuyên biệt với 3 cơ chế nổi bật:
1. **Tách riêng 3 nhóm sản phẩm cho thuê & bán**:
   - **Máy tính cầm tay**: Cho phép chọn **dòng máy cụ thể** (*Casio fx-580VN X*, *Casio fx-880BTG*, *Vinacal 680EX Plus*) kèm **tình trạng độ mới** (*Mới 100% nguyên seal*, *Độ mới 90%*, *Độ mới 80%*) hoặc *Thuê theo ngày/tuần*.
   - **Giáo trình đại cương**: Chọn mua hoặc thuê theo học kỳ với tùy chọn *Mới 100%*, *Độ mới 90%*, *Độ mới 80%*.
   - **Áo Blouse phòng thí nghiệm**: Chọn thuê theo buổi thực hành hoặc mua theo độ mới *100% / 90% / 80%*.
2. **Huy hiệu trạng thái tồn kho (`Badge`) & Làm mờ tự động**:
   - Mỗi thẻ sản phẩm có nút chuyển đổi trực quan giữa **`Còn hàng`** (chấm xanh lá) và **`Đang cho thuê`** (chấm cam).
   - Khi sản phẩm ở trạng thái **`Đang cho thuê`**:
     - Toàn bộ thẻ sản phẩm tự động được **làm mờ (`opacity-60 grayscale-[25%]`)**.
     - Nút **“Thêm vào giỏ”** tự động đổi thành nút **“Thông báo khi có hàng”** (khi bấm vào sẽ chuyển thành *“Đã bật thông báo có hàng”* và gửi thông báo xác nhận).
3. **Xem chi tiết & Đánh giá sản phẩm (`ProductDetailModal`)**:
   - Bấm vào ảnh hoặc tên sản phẩm để xem thông số kỹ thuật, chính sách bảo hành/miễn cọc CCCD khi đã xác thực email `@student.hcmus.edu.vn`, và gửi đánh giá 5 sao (nhận thêm `+5 điểm VIP`).

---

### 4.6. Đặc Quyền VIP: Săn Điểm Rèn Luyện & Trợ Lý AI 24/7 (`vip`)
- **Trạng thái 1 — Chưa kích hoạt VIP (`student.points < 100`)**:
  - Hiển thị thanh tiến trình điểm hiện tại (VD: `65/100 điểm`) và nút **“Demo VIP 100đ”** để giảng viên/người chấm thử nghiệm ngay.
  - **Bảng Săn Điểm Rèn Luyện**: Hiển thị bản xem trước các sự kiện nổi bật; các sự kiện chuyên sâu được khóa chờ đủ 100 điểm.
  - **Trợ lý AI Học tập 24/7**: Cho phép hỏi miễn phí tối đa **5 câu hỏi (`5/5 lượt`)**. Thanh trạng thái hiển thị rõ số câu đã dùng và số câu còn lại.
- **Trạng thái 2 — Đã kích hoạt VIP (`student.points >= 100`)**:
  - Mở khóa toàn bộ **Bảng Săn Điểm Rèn Luyện (ĐRL)** với đồng hồ đếm ngược thời gian thực (`Ngày : Giờ : Phút : Giây`) tới hạn đóng form đăng ký, bộ lọc theo Điều 1–5 quy chế ĐRL, nút bật nhắc hẹn và ô lưu ghi chú cá nhân cho từng sự kiện.
  - Mở khóa **Trợ lý AI Học tập 24/7 Không giới hạn (`∞ câu hỏi`)**.

---

## 5. Luồng Nghiệp Vụ Điểm Thưởng & Hạng Thành Viên VIP

Hệ thống điểm VIP của FORUS vận hành theo cơ chế **Tự động cộng khi mua — Tự động trừ khi đổi — Tự động cập nhật hạng thành viên**:

```text
   [Mua Đồ Ăn / Thuê Thiết Bị / Đặt In A1-A5 / Đánh Giá]
                             │
                             ▼
               Hàm `earnPoints(+points, reason)`
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
 Cộng vào `student.points`              Ghi vào `pointHistory`
 (VD: 65đ + 10đ = 75đ VIP)              ("+10đ · Mua Combo Bảng vẽ...")
         │
         ▼
 Tự động tính lại Hạng Thành Viên (`getMembershipTierName`):
 • 0 – 49 điểm  : Thành viên Mới (Newbie)
 • 50 – 79 điểm : Hạng Đồng (Bronze)
 • 80 – 99 điểm : Hạng Bạc (Silver)
 • >= 100 điểm  : Thành viên VIP (Mở khóa Săn ĐRL + AI Không giới hạn ∞)
         │
         ▼
   [Đổi Voucher Ưu Đãi hoặc Dùng Điểm Giảm Giá Trong Giỏ Hàng]
         │
         ▼
               Hàm `redeemPoints(cost, title)`
         │
         ├── Nếu `student.points < cost` → Báo thiếu điểm, giữ nguyên số dư
         └── Nếu `student.points >= cost` → Trừ trực tiếp `student.points - cost`,
                                            cập nhật lại Hạng thành viên & cấp mã!
```

- **Đồng bộ hai chiều với Giỏ hàng (`CartDrawer`)**:
  - Khi thêm món vào giỏ: Cộng ngay điểm VIP tương ứng (`pointsAlreadyCredited: true`) để sinh viên thấy ngay thanh VIP nhích lên.
  - Khi tăng số lượng (`+1`) trong giỏ: Cộng thêm điểm VIP của 1 đơn vị sản phẩm.
  - Khi giảm số lượng (`-1`) hoặc xóa món khỏi giỏ: Tự động hoàn trừ lại số điểm vừa cộng trước đó để đảm bảo tính minh bạch.
  - Khi thanh toán (`Checkout`): Sinh viên có thể bật tùy chọn **“Dùng điểm VIP giảm giá trực tiếp”** (trừ điểm VIP tương ứng với số tiền giảm) và nhận hóa đơn điện tử kèm mã đơn hàng.

---

## 6. Luồng Xử Lý Trợ Lý AI Học Tập 24/7 (Frontend ↔ Backend Gemini API)

Trợ lý AI xuất hiện ở **2 vị trí đồng bộ** (trong tab **VIP** và ở **Cửa sổ Chat AI nổi** góc phải dưới màn hình):

1. **Bước 1 — Kiểm tra hạn mức câu hỏi ở Client (`VipHub.tsx` & `App.tsx`)**:
   - Kiểm tra điều kiện `isVip = student.points >= 100`.
   - Nếu `!isVip` và `aiQuestionsUsed >= 5`:
     - Chặn gửi request, hiển thị thông báo hướng dẫn người dùng tích đủ 100 điểm hoặc bấm nút **Kích hoạt VIP 100đ** để mở khóa hỏi không giới hạn.
   - Nếu hợp lệ (`isVip` hoặc `aiQuestionsUsed < 5`):
     - Đưa tin nhắn của người dùng lên khung chat, bật hiệu ứng đang soạn phản hồi và gửi HTTP `POST /api/chat`.
2. **Bước 2 — Xử lý thông minh tại Backend (`server.ts`)**:
   - Máy chủ Express nhận câu hỏi cùng lịch sử hội thoại và thông tin sinh viên (`fullName`, `studentId`, `faculty`, `points`).
   - Gọi Google GenAI SDK (`@google/genai`) với mô hình ưu tiên tốc độ cao **`gemini-3.5-flash-lite`** (và dự phòng `gemini-flash-lite-latest`, `gemini-3.8-flash`) kết hợp cấu hình `ThinkingLevel.MINIMAL` để phản hồi nhanh trong vài giây.
   - Hệ thống Prompt (`SYSTEM_INSTRUCTION`) định hướng AI đóng vai **Trợ lý Học thuật FORUS tại ĐH Khoa học Tự nhiên (227 Nguyễn Văn Cừ)**, giải thích ngắn gọn từng bước kèm công thức LaTeX hoặc code C++/Python chuẩn.
   - Trong trường hợp mất kết nối mạng bên ngoài, máy chủ tự động kích hoạt **Bộ Tri Thức Học Thuật Dự Phòng** (chứa sẵn lời giải Định lý Rolle, Lagrange, Quy tắc L'Hôpital, tích phân từng phần, trị riêng/vector riêng, con trỏ C++, bảng lệnh LaTeX và thông tin dịch vụ FORUS).
3. **Bước 3 — Định dạng hiển thị Toán học & Code (`FormattedAiMessage.tsx`)**:
   - Chỉ khi nhận phản hồi thành công (`response.ok && data.reply`), Client mới tăng bộ đếm `aiQuestionsUsed + 1` (bảo vệ lượt hỏi miễn phí của sinh viên nếu mạng chập chờn).
   - Component `FormattedAiMessage` tự động phân tích và hiển thị:
     - Tiêu đề, chữ in đậm, danh sách các bước giải.
     - Công thức Toán học nội dòng (`$...$`) và khối công thức (`$$...$$`).
     - Khung mã nguồn (`latex`, `cpp`, `python`) có **nút “Sao chép” 1 chạm**.

---

## 7. Kịch Bản Demo Thuyết Trình Nhanh (Dành Cho Buổi Chấm Poster Đồ Án 1)

Khi giảng viên hoặc khách tham quan dừng lại tại Poster khổ A1 của nhóm trong khoảng **2–3 phút**, nhóm có thể dẫn dắt theo trình tự 5 bước mượt mà sau:

1. **Bước 1 — Quét QR & Giới thiệu tổng quan (20 giây)**:
   - Mời giảng viên quét mã QR hoặc xem trên laptop: giới thiệu thanh điều hướng cố định phía trên, bấm nút **Đổi Sáng/Tối** và bấm nút **“Giới thiệu chi tiết về FORUS”** (ngay trên ô `35.000đ`) để xem bài giới thiệu sứ mệnh dự án.
2. **Bước 2 — Trải nghiệm Thuê & Bán Thiết Bị Học Tập (40 giây)**:
   - Chuyển sang tab **Thuê & Bán**: chọn **Máy tính cầm tay**, đổi thử giữa *Casio fx-580VN X* và *Casio fx-880BTG*, chọn độ mới *90%* hoặc *80%* để thấy giá tự động giảm.
   - Bấm thử huy hiệu **`Đang cho thuê`** trên một thẻ sản phẩm để minh họa hiệu ứng làm mờ thẻ và nút **“Thông báo khi có hàng”**.
3. **Bước 3 — Đặt In Poster A1 / Giáo Trình Lấy Liền (30 giây)**:
   - Chuyển sang tab **In ấn**: tải thử 1 file PDF từ máy tính (hoặc bấm chọn mẫu Poster A1), chọn khổ giấy **A1**, chế độ **In màu** và xem bảng báo giá + điểm VIP tự động tính ở cột bên phải, sau đó bấm thêm vào giỏ.
4. **Bước 4 — Kiểm tra Cộng/Trừ Điểm VIP & Thanh Toán (30 giây)**:
   - Mở **Menu Tiện Ích** (góc phải trên): chỉ vào thanh điểm VIP vừa được cộng tự động khi thêm hàng vào giỏ, bấm thử nút **“Đổi 50 điểm (-50đ VIP)”** để thấy điểm VIP bị trừ trực tiếp và nhận Voucher giảm giá.
5. **Bước 5 — Trải nghiệm Trợ Lý AI Học Tập & Mở Khóa VIP 100đ (40 giây)**:
   - Mở **Cửa sổ Chat AI nổi** hoặc tab **VIP**: hỏi thử một câu Giải tích/LaTeX (VD: *"Chứng minh định lý Rolle kèm công thức LaTeX"*), chỉ ra bộ đếm giới hạn **5 câu miễn phí** khi chưa VIP, sau đó bấm **“Kích hoạt VIP 100đ”** để mở khóa hỏi AI không giới hạn (`∞`) và toàn bộ **Bảng Săn Điểm Rèn Luyện đếm ngược**.
