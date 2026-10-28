# Tài Liệu Giải Thích Luồng Hoạt Động Hệ Sinh Thái Web FORUS (Đồ Án 1 — CSC00006)

Xây dựng tài liệu giải thích toàn diện luồng vận hành của ứng dụng web **FORUS — “Tiện ích trong tay, học hay mỗi ngày”**, giúp nhóm sinh viên và giảng viên nắm rõ hành trình người dùng qua từng phân hệ dịch vụ, cơ chế tích/đổi điểm VIP, luồng xử lý Trợ lý AI học tập 24/7 và kiến trúc kỹ thuật phục vụ báo cáo & thuyết trình Đồ án 1.

### User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các lựa chọn đã được xác nhận từ phản hồi của bạn trước khi tiến hành tạo tài liệu trong dự án:

- **Hình thức lưu trữ đã xác nhận**: Chỉ tạo file tài liệu độc lập ngay trong thư mục dự án (không thay đổi hay thêm nút tải trên giao diện web hiện tại) để giữ nguyên bố cục hiển thị của sản phẩm.
- **Phạm vi nội dung đã xác nhận**: Bao quát đầy đủ 4 trụ cột:
  1. Luồng trải nghiệm người dùng (User Flow) xuyên suốt thanh điều hướng cố định, trang Giới thiệu chi tiết và 6 mục dịch vụ chính.
  2. Luồng vận hành Điểm thưởng & Hạng thành viên VIP (cộng điểm tức thì khi mua/thuê/in ấn, trừ điểm khi đổi ưu đãi hoặc giảm giá giỏ hàng).
  3. Luồng hoạt động của Trợ lý AI Học tập 24/7 (cơ chế đếm 5 câu hỏi miễn phí cho tài khoản thường, mở khóa không giới hạn `∞` khi đạt 100 điểm VIP, và luồng xử lý Gemini tốc độ cao kèm hiển thị công thức Toán/LaTeX).
  4. Sơ đồ kiến trúc dữ liệu & kịch bản thuyết trình thực tế trước giảng viên tại buổi chấm Poster Đồ án 1.

---

### 1. Overview & Core Concept

- **What It Does**: Cung cấp một bản đặc tả luồng hoạt động (Workflow Specification) mạch lạc bằng tiếng Việt, trình bày bằng sơ đồ khối trực quan và giải thích từng bước từ lúc sinh viên truy cập qua mã QR cho đến khi hoàn tất đơn hàng hoặc sử dụng đặc quyền VIP.
- **Target Audience / Persona**:
  - **Thành viên nhóm Đồ án 1 (CSC00006)**: Dùng làm tài liệu tham chiếu thống nhất khi viết báo cáo, chuẩn bị kịch bản demo trực tiếp và trả lời câu hỏi phản biện của giảng viên.
  - **Giảng viên hướng dẫn / Người chấm bài**: Đọc nhanh để hiểu logic nghiệp vụ, sự liên kết giữa các tính năng (Tích điểm $\leftrightarrow$ Mở khóa VIP $\leftrightarrow$ Trợ lý AI) và cách nhóm ứng dụng AI thực tế.
- **Key Value**: Chuyển hóa toàn bộ logic phức tạp của ứng dụng thành các sơ đồ luồng dễ theo dõi, giải thích rõ "Đầu vào (Input) $\rightarrow$ Xử lý (Process) $\rightarrow$ Đầu ra (Output)" của từng tính năng mà không cần đọc trực tiếp mã nguồn.

---

### 2. User Experience & Visual Design

- **Key User Flows Documented**:
  1. **Luồng Khởi tạo & Điều hướng Trung tâm**:
     - Sinh viên mở web hoặc quét mã QR $\rightarrow$ Thanh điều hướng cố định phía trên (`Fixed Top Bar`) luôn giữ nguyên vị trí khi cuộn trang $\rightarrow$ Chuyển đổi mượt mà giữa **Trang chủ**, **Giới thiệu chi tiết**, **Ăn uống**, **In ấn**, **Gia sư**, **Thuê & Bán**, **VIP**, **Giỏ hàng** và **Menu Tài khoản**.
  2. **Luồng Đặt Đồ Ăn Sáng & Thuê/Bán Thiết Bị Học Tập**:
     - Duyệt danh mục sản phẩm $\rightarrow$ Kiểm tra huy hiệu trạng thái (`Còn hàng` hoặc `Đang cho thuê` làm mờ thẻ kèm nút `Thông báo khi có hàng`) $\rightarrow$ Tùy chọn dòng máy tính cầm tay & độ mới (`Mới 100%`, `Độ mới 90%`, `Độ mới 80%`) $\rightarrow$ Thêm vào giỏ hàng $\rightarrow$ Cộng điểm VIP tức thì vào Hạng thành viên.
  3. **Luồng Đặt In Ấn Tài Liệu & Poster Khổ A1–A5**:
     - Tải tệp tài liệu từ máy tính/điện thoại (hoặc chọn file mẫu) $\rightarrow$ Tự động nhận diện số trang $\rightarrow$ Cấu hình khổ giấy (`A1`–`A5`), chế độ màu, số mặt, gia công đóng cuốn $\rightarrow$ Hệ thống tự động tính tổng chi phí và số điểm VIP thưởng $\rightarrow$ Đưa vào giỏ hàng thanh toán.
  4. **Luồng Kết Nối Cò Gia Sư HCMUS**:
     - Lọc hồ sơ gia sư theo môn đại cương/chuyên ngành hoặc đăng ký làm gia sư mới $\rightarrow$ Gửi yêu cầu học ghép/1-kèm-1 $\rightarrow$ Nhận điểm thưởng tương tác.
  5. **Luồng Vòng Đời Điểm VIP & Đặc Quyền Săn ĐRL + Chatbot AI**:
     - Tích lũy điểm qua giao dịch hoặc kích hoạt nhanh `Demo VIP 100đ` $\rightarrow$ Khi `< 100 điểm`: hỏi tối đa 5 câu với Trợ lý AI; khi `>= 100 điểm`: mở khóa hỏi AI không giới hạn (`∞`) và toàn bộ bảng đếm ngược Săn Điểm Rèn Luyện.
- **Visual Identity & Theme Documented**:
  - *Aesthetic Direction*: Phong cách Editorial học thuật ấm áp kết hợp tính năng thương mại điện tử sinh viên hiện đại, hỗ trợ chuyển đổi tức thì giữa **Chế độ Sáng (Light Mode)** và **Chế độ Tối (Dark Mode)**.
  - *Color Palette & Mood*: Nền giấy kem ấm (`#FAF8F5` / `#F3EFE6`), chữ xanh Navy đậm (`#0B2545`), điểm nhấn cam đất năng động (`#D95326`) và vàng hổ phách (`#F59E0B`) cho hạng VIP.
  - *Typography & Hierarchy*: Kết hợp phông chữ tiêu đề học thuật rõ nét, phông chữ không chân hiện đại cho nội dung và phông Monospace (`tabular-nums`) cho đơn giá, thời gian đếm ngược và điểm số VIP.
  - *Component Styling & Layout*: Thiết kế đáp ứng toàn diện (Responsive Desktop & Mobile), chống tràn chiều ngang trên di động và giữ cố định thanh công cụ trên máy tính.
- **Interactive Feedback & Motion**:
  - Thông báo nổi (`Toast Notification`) phản hồi ngay lập tức mỗi khi cộng/trừ điểm VIP, thêm giỏ hàng, bật nhắc hẹn sự kiện ĐRL hoặc sao chép mã LaTeX.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Tổ chức tài liệu theo cả góc nhìn Nghiệp vụ (Product Flow) và Kỹ thuật (System Flow)**
  - *Chosen Approach*: Chia tài liệu thành các chương rõ ràng: Tổng quan hệ sinh thái $\rightarrow$ Sơ đồ luồng tổng thể $\rightarrow$ Chi tiết từng phân hệ dịch vụ $\rightarrow$ Cơ chế Điểm VIP & AI $\rightarrow$ Kiến trúc dữ liệu & Kịch bản thuyết trình.
  - *Why*: Giúp cả giảng viên chấm ý tưởng khởi nghiệp lẫn giảng viên đánh giá kỹ thuật/AI đều tra cứu được ngay thông tin cần thiết.
  - *Alternatives Considered*: Chỉ viết mô tả văn bản thuần túy (khó hình dung sự liên kết giữa các trạng thái) hoặc chỉ vẽ sơ đồ kỹ thuật (thiếu bối cảnh trải nghiệm sinh viên KHTN Cơ sở 1).
- **Decision 2: Cơ chế đồng bộ Điểm VIP & Giới hạn câu hỏi AI theo thời gian thực**
  - *Chosen Approach*: Giải thích rõ cơ chế lưu trữ trạng thái đồng bộ trên trình duyệt (`localStorage`) kết hợp kiểm tra điều kiện điểm số (`points >= 100`) trước mỗi lượt gọi AI và chỉ trừ lượt miễn phí khi máy chủ trả về câu trả lời thành công.
  - *Why*: Đảm bảo trải nghiệm công bằng, mượt mà cho người dùng thử nghiệm và dễ dàng kiểm chứng ngay trong buổi thuyết trình.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                   GIAO DIỆN NGƯỜI DÙNG (CLIENT-SIDE SPA)                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Thanh Điều Hướng Cố Định (Fixed Top Header / Mobile Bottom Nav)        │  │
│  │ [Logo FORUS]  [Trang chủ | Ăn uống | In ấn | Gia sư | Thuê&Bán | VIP]  │  │
│  │ [Huy hiệu Điểm VIP]   [Đổi Sáng/Tối]   [Giỏ hàng (N)]   [Menu Drawer]  │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
│                                      │                                       │
│        ┌─────────────────────────────┼─────────────────────────────┐         │
│        ▼                             ▼                             ▼         │
│  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐   │
│  │ Khối Thương Mại   │     │ Khối Dịch Vụ CS1  │     │ Khối Đặc Quyền    │   │
│  │ • Trang chủ & QR  │     │ • Đặt In A1–A5    │     │ • Bảng Săn ĐRL    │   │
│  │ • Bài Giới Thiệu  │     │   (Tính giá tự    │     │   (Đếm ngược)     │   │
│  │ • Ăn uống Express │     │    động & tải tệp)│     │ • Trợ lý AI 24/7  │   │
│  │ • Thuê & Bán Gear │     │ • Cò Gia Sư HCMUS │     │   (Mặc định 5 câu │   │
│  │   (Chọn dòng máy  │     │   (Kết nối & Đăng │     │    / Mở khóa ∞    │   │
│  │    & độ mới %)    │     │    ký hồ sơ mới)  │     │    khi >= 100đ)   │   │
│  └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘   │
│            │                         │                         │             │
│            └─────────────────────────┼─────────────────────────┘             │
│                                      ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Bộ Điều Phối Trạng Thái Trung Tâm (Central State & Persistence)        │  │
│  │ • Giỏ hàng & Thanh toán (Cart & Checkout Sandbox)                      │  │
│  │ • Ví Điểm VIP & Hạng Thành Viên (Tự động Cộng khi mua / Trừ khi đổi)   │  │
│  │ • Bộ đếm lượt hỏi AI miễn phí (Chỉ tính khi phản hồi thành công)       │  │
│  └───────────────────────────────────┬────────────────────────────────────┘  │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │ HTTP POST (/api/chat)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     MÁY CHỦ PHỤ TRỢ (BACKEND API SERVER)                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Bộ Xử Lý Trợ Lý AI Học Tập FORUS                                       │  │
│  │ 1. Nhận câu hỏi + Lịch sử hội thoại + Hồ sơ & Điểm VIP của sinh viên   │  │
│  │ 2. Gọi mô hình Gemini tốc độ cao (ThinkingLevel.MINIMAL)               │  │
│  │ 3. Trả về lời giải Toán/Lý/Hóa/C++/LaTeX định dạng Markdown chuẩn      │  │
│  │ 4. Tự động chuyển sang Bộ Tri Thức Học Thuật Dự Phòng nếu nghẽn mạng   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **Hồ sơ Sinh viên & Điểm VIP (`StudentProfile`)**: Lưu trữ họ tên, MSSV, email `@student.hcmus.edu.vn`, khoa, tổng điểm tích lũy hiện tại (`points`), danh sách voucher đã đổi (`redeemedVouchers`), lịch sử biến động điểm (`pointHistory`), và danh sách sự kiện ĐRL đã bật nhắc hẹn.
  - **Giỏ hàng & Đơn hàng (`CartItem` / `OrderReceipt`)**: Lưu trữ sản phẩm ăn uống, thiết bị thuê/bán (kèm biến thể dòng máy tính và tình trạng mới `100%`/`90%`/`80%`) hoặc cấu hình đặt in `A1`–`A5`, theo dõi trạng thái đã cộng điểm thưởng (`pointsAlreadyCredited`) để đồng bộ chính xác khi tăng/giảm/xóa món.
  - **Trạng thái Trợ lý AI (`aiQuestionsUsed` & `chatMessages`)**: Theo dõi số câu hỏi đã sử dụng đối với tài khoản chưa đạt 100 điểm VIP và lưu lịch sử hội thoại được định dạng qua bộ hiển thị công thức Toán & mã nguồn.
- **Interactive Component & State Mapping**:
  - **Cộng điểm VIP khi mua/thuê/in**: Khi người dùng bấm thêm sản phẩm hoặc đơn in vào giỏ $\rightarrow$ Hàm `earnPoints(+N)` cộng điểm ngay lập tức vào hồ sơ, cập nhật thanh tiến trình VIP trên Header/Menu và ghi vào lịch sử giao dịch; nếu giảm số lượng hoặc xóa khỏi giỏ thì tự động hoàn trả lại số điểm tương ứng.
  - **Trừ điểm VIP khi đổi ưu đãi**: Khi người dùng bấm đổi Voucher giảm giá hoặc áp dụng điểm trong bước thanh toán $\rightarrow$ Hàm `redeemPoints(cost)` kiểm tra số dư khả dụng, trừ trực tiếp điểm VIP, hạ/cập nhật hạng thành viên tương ứng và cấp mã ưu đãi.
  - **Kiểm soát giới hạn 5 câu hỏi AI**: Khi gửi câu hỏi tại mục VIP hoặc cửa sổ Chat nổi $\rightarrow$ Kiểm tra `student.points >= 100`; nếu chưa đạt và `aiQuestionsUsed >= 5` thì chặn gửi kèm thông báo hướng dẫn kích hoạt VIP; nếu hợp lệ thì gửi yêu cầu tới `/api/chat` và chỉ tăng `aiQuestionsUsed` sau khi nhận phản hồi thành công.
