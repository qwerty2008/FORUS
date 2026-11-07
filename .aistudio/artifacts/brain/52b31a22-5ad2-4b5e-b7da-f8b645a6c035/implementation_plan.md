# Nâng Cấp Trợ Lý AI FORUS & Bộ Hiển Thị Toán Học Trực Quan Trên GitHub Pages

Giải pháp toàn diện giúp **Trợ lý AI FORUS** hoạt động ổn định, trả lời thông minh và đúng trọng tâm mọi câu hỏi trên tên miền tĩnh **GitHub Pages (`github.io`)**, đồng thời thay thế hoàn toàn các đoạn mã LaTeX thô (`\frac`, `\lim`, `\int`, `\sqrt`) bằng **công thức Toán học hiển thị trực quan, sắc nét (KaTeX + Bộ chuyển đổi Toán học Unicode)**.

---

### Quyết Định Đã Xác Nhận Cùng Người Dùng

> [!IMPORTANT]
> Các lựa chọn thiết kế và hành vi dưới đây đã được xác nhận trực tiếp để đảm bảo trải nghiệm mượt mà nhất trên cả Web tĩnh GitHub và môi trường Cloud:

- **Định dạng hiển thị Toán học & LaTeX**: Chỉ hiển thị **công thức Toán học trực quan, chuẩn sách giáo khoa** ngay trong luồng tin nhắn; tự động **ẩn các khối code LaTeX thô (` ```latex ... ``` `)** khi giải bài tập chung (chỉ hiện code LaTeX khi người dùng chủ động yêu cầu *"xuất code LaTeX / mẫu Overleaf"*).
- **Phong cách & Độ dài câu trả lời**: **Tự động thích ứng thông minh** — trả lời ngắn gọn, đi thẳng vào đáp số với câu hỏi nhanh/tra cứu, và trình bày từng bước rõ ràng đối với bài tập giải tích, đại số hoặc viết code.
- **Phạm vi kiến thức hỗ trợ**: **Đa năng toàn diện** — giải đáp mọi câu hỏi học thuật (Toán đại cương, Vật lý, Hóa, Sinh, Triết, Kinh tế), lập trình (C/C++, Python, CTDL & GT), kỹ năng đời sống sinh viên và toàn bộ dịch vụ/bảng giá/voucher của hệ sinh thái FORUS 227 Nguyễn Văn Cừ.

---

### 1. Tổng Quan & Giá Trị Cốt Lõi

- **Giải quyết triệt để lỗi hiển thị công thức (Lỗi Font LaTeX)**:
  - Trước đây, các biểu thức dạng `$\lim_{x \to 0}$`, `$$\frac{-b \pm \sqrt{\Delta}}{2a}$$`, `\[ ... \]` hoặc `\( ... \)` chỉ được bọc trong thẻ `<code>` văn bản thuần nên hiển thị nguyên chuỗi lệnh gạch chéo ngược (`\frac`, `\le`, `\implies`) gây rối mắt.
  - Hệ thống mới tích hợp **bộ dựng công thức Toán học KaTeX** kết hợp **bộ chuẩn hóa ký hiệu Toán học thông minh**, biến mọi biểu thức `$ ... $`, `$$ ... $$`, `\(...\)`, `\[...\]` thành phân số, căn bậc hai, tích phân, giới hạn, ma trận và chỉ số trên/dưới chuẩn typography toán học.
- **Trả lời đúng trọng tâm trên GitHub Pages**:
  - Đa luồng kết nối AI hỗ trợ CORS trực tiếp từ trình duyệt trên `github.io` với cơ chế tự động chuyển đổi dự phòng (Multi-Endpoint AI Failover) và bộ giải Toán/Học thuật nội bộ thế hệ mới, đảm bảo AI không bao giờ trả lời chung chung hay lạc đề.

---

### 2. Trải Nghiệm Người Dùng & Thiết Kế Hiển Thị

- **Luồng Hiển Thị Tin Nhắn AI**:
  1. Khi sinh viên đặt câu hỏi (ví dụ: *"Giải phương trình $x^2 - 5x + 6 = 0$"* hoặc *"Định lý Kẹp là gì?"*), AI phản hồi ngay vào trọng tâm câu hỏi mà không kèm đoạn chào hỏi rườm rà hay liệt kê danh mục không liên quan.
  2. Mọi công thức Toán học nội dòng (`$...$`, `\(...\)`) và công thức khối (`$$...$$`, `\[...\]`) được dựng thành ký hiệu Toán học trực quan với phông chữ serif toán học sắc nét, căn chỉnh dòng mượt mà trên cả chế độ Sáng (Light Mode) và Tối (Dark Mode).
  3. Các khối lệnh ` ```latex ... ``` ` thừa thãi được lọc bỏ tự động trong câu trả lời thông thường để khung chat gọn gàng, dễ đọc như sách in.
- **Bảng Màu & Typography**:
  - **Khung công thức khối (Display Math)**: Nền kem học thuật ấm (`#F3EFE6` ở chế độ Sáng / `#0F172A` ở chế độ Tối), chữ xanh Navy đậm (`#0B2545`) hoặc vàng Amber sáng (`#FCD34D`), viền mảnh tinh tế, hỗ trợ cuộn ngang mượt trên màn hình điện thoại.
  - **Công thức nội dòng (Inline Math)**: Hiển thị liền mạch cùng dòng văn bản với phông chữ Toán học chuyên dụng, độ tương phản cao đạt chuẩn WCAG AA.

---

### 3. Quyết Định Kỹ Thuật & Đánh Đổi

- **Quyết định 1: Kết hợp KaTeX cùng Bộ Chuyển Đổi Toán Học Dự Phòng (Hybrid Math Renderer)**
  - *Cách tiếp cận*: Sử dụng thư viện dựng công thức chuẩn **KaTeX** (`throwOnError: false`) để hiển thị phân số, tích phân, giới hạn, ma trận; đồng thời trang bị bộ chuyển đổi LaTeX-sang-Unicode cho mọi biểu thức viết tắt hoặc cú pháp không chuẩn từ AI.
  - *Lý do*: Đảm bảo 100% công thức toán học luôn hiển thị đẹp mắt, tuyệt đối không bao giờ hiện mã lỗi đỏ hay các từ khóa `\frac`, `\sqrt`, `\cdot`, `\le`, `\ge`, `\implies` thô trên màn hình.
- **Quyết định 2: Đa Luồng AI Cho Tên Miền GitHub Pages + Tinh Chỉnh System Prompt**
  - *Cách tiếp cận*: Thiết lập chuỗi gọi AI trực tuyến hỗ trợ CORS dành cho `github.io` (với tham số định tuyến mô hình ổn định, loại bỏ bộ đệm lỗi và cơ chế thử lại tự động), kết hợp System Prompt mới cấm tuyệt đối việc xuất khối ` ```latex ` khi người dùng không yêu cầu và ép AI đi thẳng vào câu trả lời.
  - *Lý do*: Khắc phục tình trạng AI trả lời lan man hoặc rơi vào câu trả lời mẫu cố định khi kết nối mạng chập chờn.

---

### 4. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu

```
┌──────────────────────────────────────────────────────────────────────────┐
│                 GIAO DIỆN CHATBOT FORUS (POPUP & TAB VIP)                │
│         (Nhập câu hỏi học thuật, lập trình, đời sống, tiện ích)          │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                BỘ ĐIỀU PHỐI TRÍ TUỆ NHÂN TẠO ĐA MÔI TRƯỜNG               │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────┐  │
│  │ 1. Máy chủ nội bộ       │  │ 2. Cổng AI Cloud CORS   │  │ 3. Bộ    │  │
│  │    (/api/chat Gemini)   ├─►│    cho GitHub Pages     ├─►│ Giải Toán│  │
│  │    (Khi chạy Fullstack) │  │    (Tự động thích ứng   │  │ & Tri    │  │
│  │                         │  │     độ dài & trọng tâm) │  │ Thức Nội │  │
│  └─────────────────────────┘  └─────────────────────────┘  │ Bộ       │  │
│                                                            └──────────┘  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│           BỘ TIỀN XỬ LÝ & LÀM SẠCH PHẢN HỒI (RESPONSE SANITIZER)         │
│  • Tự động ẩn khối ```latex thô nếu người dùng không yêu cầu code LaTeX  │
│  • Chuẩn hóa ký hiệu \[...\], \(...\), $$...$$, $...$ đồng nhất          │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│             BỘ DỰNG CÔNG THỨC TOÁN HỌC TRỰC QUAN (MATH ENGINE)           │
│  • Dựng công thức Toán học chuẩn sách giáo khoa (Phân số, Căn, Tích phân)│
│  • Bộ chuyển đổi ký hiệu Unicode dự phòng (không bao giờ lỗi font)       │
│  • Hiển thị khối code C++/Python với nút Sao chép 1 chạm                 │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Xử lý tương tác & Trạng thái**:
  - Khi người dùng gửi câu hỏi **không chứa** từ khóa yêu cầu mã nguồn LaTeX (*"code latex"*, *"mã latex"*, *"overleaf"*, *"template"*), bộ lọc phản hồi tự động chuyển các khối ` ```latex ... ``` ` thành công thức hiển thị trực quan `$$ ... $$` thay vì hiện hộp code thô.
  - Khi người dùng chủ động yêu cầu *"cho mình xin code LaTeX / mẫu Overleaf"*, hệ thống giữ nguyên hộp code kèm nút **Sao chép** để sinh viên dán vào báo cáo.
