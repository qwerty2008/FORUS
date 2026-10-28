# Nâng Cấp Giao Diện Aesthetic & Hệ Màu Phụ FORUS (Bento Grid Edition)

Bản kế hoạch này nâng cấp toàn diện diện mạo của **FORUS** theo phong cách **Bento Grid hiện đại**, bổ sung hệ màu phụ (**Cam Coral, Vàng Amber, Tím Pastel**) phối hợp cùng **Xanh KHTN & Xanh Lá** của bộ nhận diện, đồng thời **hoán đổi Logo nền sáng và nền tối** để chữ `FORUS` luôn nổi bật rõ nét trên cả hai chế độ giao diện.

## User Review & Critical Decisions

> [!IMPORTANT]
> Các quyết định thiết kế dưới đây đã được xác nhận theo lựa chọn của bạn và sẵn sàng để triển khai ngay khi bạn bấm **Proceed**:

- **Quyết định 1 — Hoán đổi Logo Sáng & Tối**:
  - **Chế độ Sáng (Light Mode)** sẽ hiển thị logo chữ xanh navy đậm (`logo_toi_xoa_nen`) để nổi bật sắc nét trên nền trắng sáng.
  - **Chế độ Tối (Dark Mode)** sẽ hiển thị logo chữ xanh cyan phát sáng (`logo_sang_xoa_nen`) để rực rỡ trên nền tối.
- **Quyết định 2 — Hệ màu phụ (Secondary Accent Palette)**: Phối hợp màu chủ đạo **Xanh KHTN (`#1D4ED8`) & Xanh Lá (`#10B981`)** cùng 3 tông màu phụ theo từng phân khu dịch vụ:
  - **Cam Coral (`#FF6B4A` / `orange-500` - `rose-500`)**: Dành cho khu vực *Ăn sáng & Nước uống giao tận phòng*.
  - **Vàng Amber (`#F59E0B` / `amber-400`)**: Dành cho khu vực *Đặc quyền VIP 100 điểm, Săn Điểm Rèn Luyện & Hạng thành viên*.
  - **Tím Pastel / Violet (`#8B5CF6` / `violet-500` - `fuchsia-500`)**: Dành cho khu vực *Thuê & Bán 7 gói thiết bị công nghệ & In ấn A1–A5*.
- **Quyết định 3 — Bố cục Bento Grid & Thẩm mỹ hiện đại**: Thiết kế lại trang chủ và các phân khu theo lưới **Bento Grid bất đối xứng (Asymmetric Bento)** với độ bo góc mềm mại (`rounded-3xl`), nền chuyển sắc nhẹ (soft mesh tint), kiểu chữ `Plus Jakarta Sans` kết hợp số liệu `JetBrains Mono` (`tabular-nums`), và hiệu ứng tương tác mượt mà.

---

## 1. Overview & Core Concept

- **Mục tiêu trải nghiệm**: Biến FORUS từ một trang danh mục thông thường thành một **Campus Super-App Aesthetic** mang đậm cá tính sinh viên Khoa học Tự nhiên Cơ sở 1 (227 Nguyễn Văn Cừ) — trẻ trung, trực quan, dễ nhận diện từng dịch vụ qua mã màu phụ riêng biệt.
- **Đối tượng sử dụng**: Sinh viên ĐH KHTN ĐHQG-HCM truy cập trên cả điện thoại và máy tính để đặt đồ ăn sáng giao lên phòng học, đặt in tài liệu A1–A5, kết nối gia sư, thuê thiết bị học tập và săn Điểm Rèn Luyện.
- **Giá trị cốt lõi**: Tăng tính thẩm mỹ thị giác, phân cấp thông tin rõ ràng bằng hệ màu phụ và bố cục Bento Grid, đồng thời khắc phục hoàn toàn độ tương phản của Logo giữa nền Sáng và nền Tối.

---

## 2. User Experience & Visual Design

### A. Hoán đổi Logo & Đồng bộ Thương hiệu
- Trên thanh điều hướng trên cùng (`Header`) và khu vực Giới thiệu cuối trang (`Footer / About`):
  - Khi ở **Light Mode**: Sử dụng bản logo chữ đậm để tạo độ tương phản cao trên nền sáng.
  - Khi ở **Dark Mode**: Sử dụng bản logo chữ sáng xanh cyan để nổi bật trên nền tối `slate-800/900`.

### B. Hệ thống Màu sắc Phân vùng (Color-Coded Service Zones)
- **60% Nền Trung Tính Sáng/Tối Dịu Mắt**:
  - Light Mode: Nền kem lạnh tinh khiết (`#F8FAFC`) kết hợp bề mặt thẻ trắng tinh (`#FFFFFF`) và ánh sắc pastel cực nhẹ theo từng phân mục.
  - Dark Mode: Nền xanh xám sáng dịu (`#0F172A` / `#1E293B`) kết hợp viền phát sáng nhẹ (`border-slate-700/80`).
- **30% Bề mặt Bento Phân Vùng**:
  - **Bento Ăn Sáng & Nước**: Ánh sắc **Cam Coral & Vàng Ấm** (`from-orange-500/10 via-amber-500/5`) tạo cảm giác năng lượng buổi sáng.
  - **Bento In Ấn A1–A5**: Ánh sắc **Xanh KHTN & Indigo** (`from-blue-600/10 via-indigo-500/5`) thể hiện sự chuẩn xác kỹ thuật.
  - **Bento Cò Gia Sư**: Ánh sắc **Xanh Lá Emerald & Mint** (`from-emerald-500/10 via-teal-500/5`) tạo sự tin cậy học thuật.
  - **Bento Thuê & Bán 7 Thiết Bị**: Ánh sắc **Tím Pastel & Violet** (`from-violet-500/10 via-fuchsia-500/5`) tôn vinh công nghệ & LaTeX.
- **10% Điểm Nhấn Hành Động (Accent Budget)**:
  - Nút hành động chính, huy hiệu điểm thưởng (`+5đ`, `+10đ`), trạng thái VIP (`100/100đ`) và thanh điều hướng dưới đáy điện thoại sử dụng màu nhấn sắc nét (**Cam Coral, Vàng Amber, Xanh KHTN**).

### C. Bố cục Bento Grid & Typography
- **Hero Bento Showcase**: Chia thành tổ hợp Bento đa ô gồm:
  1. Ô lớn bên trái: Thông điệp chủ đạo của FORUS với điểm nhấn gradient **Xanh KHTN – Cam Coral – Vàng Amber**, kèm cụm nút điều hướng nhanh.
  2. Ô Bento phải trên: Thẻ thành viên tích điểm sinh viên kèm thanh tiến độ sắc màu và nút mở nhanh **Mã QR / Demo VIP 100đ**.
  3. Hai ô Bento phải dưới: Thống kê nhanh Săn Điểm Rèn Luyện (tông Vàng Amber) và Trợ lý AI Học Tập (tông Tím Pastel).
- **Lưới 4 Trụ Cột Dịch Vụ kiểu Bento**: Mỗi trụ cột có màu viền hover, biểu tượng đổ bóng màu phụ, và dải màu trang trí riêng giúp phân biệt tức thì.
- **Thẻ Sản Phẩm (Ăn sáng & 7 gói Thuê/Bán)**: Hình ảnh chiếm 65–70% diện tích thẻ, thông tin giá và điểm thưởng dùng số `tabular-nums`, giảm các khung viền lồng nhau rườm rà, nâng nhẹ `translateY(-2px)` khi di chuột.

---

## 3. Key Product Decisions & Trade-Offs

- **Quyết định 1: Phân vùng màu phụ (Cam Coral, Vàng Amber, Tím Pastel) thay vì dùng một màu xanh duy nhất**
  - *Cách tiếp cận*: Gán mỗi nhóm dịch vụ một tông màu phụ đặc trưng nhưng cùng độ bão hòa hài hòa với Xanh KHTN.
  - *Lý do*: Giúp sinh viên nhận diện ngay mình đang ở mục Ăn sáng (Cam Coral), Thuê thiết bị (Tím Pastel) hay VIP Điểm Rèn Luyện (Vàng Amber) mà không bị nhàm chán.
- **Quyết định 2: Giữ nguyên toàn bộ tính năng và luồng điều hướng đã tối ưu**
  - *Cách tiếp cận*: Giữ nguyên nút Mặt trời/Mặt trăng chỉ có icon bên trái Giỏ hàng, nút Menu bên phải Giỏ hàng (chứa Tài khoản, VIP, Điểm, Mã QR), thanh dịch vụ ở trên cùng khi xem máy tính và cố định ở đáy màn hình (6 mục) khi xem trên điện thoại, phần Liên hệ đặt cố định ở cuối trang.
  - *Lý do*: Đảm bảo không mất bất kỳ tính năng hay bố cục điều hướng nào bạn đã ưng ý ở các bước trước.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   FORUS AESTHETIC BENTO ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────────┤
│  HEADER BAR (Sticky Glassmorphism)                                         │
│  ├── Brand Logo (Swapped: Dark-Text Logo on Light / Bright-Cyan on Dark)   │
│  ├── Desktop 6-Item Service Nav (Color-coded active indicator)             │
│  └── Action Cluster: [Sun/Moon Icon] ──> [Cart Drawer] ──> [Menu Drawer]   │
├────────────────────────────────────────────────────────────────────────────┤
│  BENTO WORKSPACE CANVAS (60-30-10 Palette + Secondary Accents)             │
│  ├── Home Bento Grid:                                                      │
│  │   ├── Asymmetric Hero Card (HCMUS Blue + Coral/Amber/Violet Mesh)       │
│  │   ├── 4 Color-Zoned Service Bento Cards (Coral, Blue, Emerald, Violet)  │
│  │   └── Featured 7-Gear Bento Showcase (Violet Pastel & Amber Accents)    │
│  ├── Food & Drink Zone (Warm Coral & Amber Accent Theme)                   │
│  ├── Print A1-A5 Studio (Cobalt & Indigo Technical Theme)                  │
│  ├── Tutor Hub (Emerald & Mint Academic Theme)                             │
│  ├── Gear & Rental Hub (Violet Pastel & Fuchsia Tech Theme)                │
│  └── VIP 100pt Hub (Amber Gold DRL Countdown + Violet AI Assistant)        │
├────────────────────────────────────────────────────────────────────────────┤
│  PERMANENT BOTTOM SECTION & MOBILE BAR                                     │
│  ├── About & Contact Bento Section (Swapped Logo + Campus 1 Info & Form)   │
│  └── Mobile Fixed Bottom 6-Tab Bar (Coral/Orange Active Highlight)         │
└────────────────────────────────────────────────────────────────────────────┘
```

### Ánh xạ Trạng thái & Tương tác
- **Hoán đổi nguồn ảnh Logo**: Cập nhật `BRAND_ASSETS` để `logoLight` trỏ tới `/assets/aistudio/logo_toi_xoa_nen_6ce4afed.png` (chữ xanh đậm cho nền sáng) và `logoDark` trỏ tới `/assets/aistudio/logo_sang_xoa_nen_7eeca75f.png` (chữ sáng cho nền tối), áp dụng tự động trên cả Header và phần Giới thiệu cuối trang.
- **Đồng bộ Hệ màu phụ trên các Component**: Cập nhật bảng màu và hiệu ứng Bento trên Trang chủ, Thực đơn Ăn sáng, Cấu hình In ấn, Cò Gia Sư, Thuê & Bán 7 thiết bị, Đặc quyền VIP và Giỏ hàng/Menu.
