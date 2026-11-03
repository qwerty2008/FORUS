# Hiệu Ứng Cuộn Mượt (Scroll-Triggered Animation) Cho Lịch Sử Mua Hàng

Bổ sung hiệu ứng chuyển động trượt nhẹ từ dưới lên kèm mờ dần (**Fade-up + Stagger**) khi người dùng cuộn đến danh sách các thẻ đơn hàng trong mục **Lịch Sử Mua Hàng**, giúp trải nghiệm tra cứu đơn hàng mượt mà, sinh động và có chiều sâu thị giác hơn.

## User Review & Critical Decisions

> [!IMPORTANT]
> Các tùy chọn thiết kế chuyển động dưới đây đã được xác nhận theo phản hồi của bạn:

- **Confirmed Decision 1 — Kiểu chuyển động (Motion Style)**: Sử dụng hiệu ứng **Fade-up + Stagger** (trượt nhẹ từ dưới lên khoảng `24px` kết hợp tăng độ mờ từ `0` lên `1`, có độ trễ nối tiếp nhẹ giữa các thẻ đơn hàng).
- **Confirmed Decision 2 — Cơ chế kích hoạt (Trigger Behavior)**: **Chỉ chạy hiệu ứng 1 lần đầu** (`once: true`) khi người dùng cuộn tới vùng hiển thị của từng thẻ đơn hàng, tránh gây rối mắt khi cuộn lên/xuống nhiều lần.
- **Confirmed Decision 3 — Tương thích Bộ lọc & Trợ năng**: Khi người dùng chuyển tab lọc trạng thái đơn (*Tất cả*, *Đang giao*, *Hoàn tất*) hoặc bật tùy chọn giảm chuyển động (`prefers-reduced-motion`), các thẻ vẫn hiển thị tức thì và mượt mà.

---

## 1. Overview & Core Concept

- **What It Does**: Mỗi thẻ đơn hàng trong khu vực **Lịch Sử Mua Hàng, Tra Cứu Đơn & Sơ Đồ Điểm Nhận Cơ Sở 1** sẽ tự động nhận diện khi lọt vào khung nhìn (viewport) lúc cuộn trang và kích hoạt chuyển động trượt nhẹ từ dưới lên kèm hiệu ứng rõ dần theo thứ tự nối tiếp.
- **Target Audience / Persona**: Sinh viên ĐH Khoa học Tự nhiên (HCMUS - Cơ sở 1) tra cứu lịch sử đơn thuê thiết bị, in ấn tài liệu A1–A5, kiểm tra tiến trình giao hàng hoặc bấm *Đặt lại (Reorder)* trên cả máy tính và điện thoại.
- **Key Value**: Tạo nhịp điệu thị giác tự nhiên khi cuộn qua trang chủ, làm nổi bật thông tin từng đơn hàng (mã đơn, điểm nhận tòa nhà, trạng thái giao, nút mua lẻ / đặt lại) mà không làm chậm tốc độ thao tác.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. Người dùng cuộn từ khu vực Hero & Cửa hàng xuống phần **Lịch Sử Mua Hàng**.
  2. Khi từng thẻ đơn hàng đi vào vùng nhìn thấy (~15% chiều cao thẻ trong viewport), thẻ bắt đầu trượt mượt từ `translateY(24px)` về `0px` đồng thời `opacity` tăng từ `0` lên `1`.
  3. Các thẻ kế tiếp xuất hiện lệch nhịp nhẹ (`80ms` mỗi thẻ) tạo hiệu ứng gợn sóng (staggered reveal) tự nhiên.
  4. Sau khi đã hiển thị lần đầu, thẻ giữ nguyên trạng thái tĩnh ổn định trong suốt phiên làm việc để sinh viên dễ dàng bấm **+ Mua lẻ**, **Xem tiến trình giao**, hoặc **Đặt lại đơn này**.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Giữ nguyên ngôn ngữ thiết kế Editorial Campus hiện đại của FORUS với bề mặt kem ấm (`#FAF8F5`) ở chế độ Sáng và xanh đen (`#0D1525` / `slate-900`) ở chế độ Tối.
  - *Typography & Hierarchy*: Mã đơn hàng và tổng tiền dùng font моно (`JetBrains Mono`, `tabular-nums`), tiêu đề và điểm nhận dùng `Plus Jakarta Sans`.
  - *Interactive Feedback & Motion*:
    - Chỉ sử dụng các thuộc tính thân thiện với GPU compositor (`transform`, `opacity`).
    - Đường cong gia tốc mượt (`cubic-bezier(0.16, 1, 0.3, 1)`), thời lượng chuyển động `450ms` cho mỗi thẻ.
    - Hiệu ứng mở ngăn **Lộ trình đơn hàng** (`trackingOrderId`) bên trong thẻ cũng được làm mượt khi đóng/mở.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sử dụng Viewport Intersection (`whileInView` với `once: true`) kết hợp Compositor Transform**
  - *Chosen Approach*: Áp dụng animation dựa trên `IntersectionObserver` / `motion` cho từng thẻ đơn hàng với ngưỡng kích hoạt `amount: 0.15` và `once: true`.
  - *Why*: Đảm bảo hiệu năng 60fps trên cả thiết bị di động, không gây hiện tượng giật cục (layout shift) và tuân thủ đúng yêu cầu chỉ chạy 1 lần khi cuộn tới.
  - *Alternatives Considered*: Lắng nghe sự kiện `window.onscroll` thủ công — bị loại bỏ vì tốn tài nguyên CPU trên điện thoại và dễ gây giật khung hình.
- **Decision 2: Giới hạn độ trễ Stagger tối đa**
  - *Chosen Approach*: Độ trễ giữa các thẻ được tính theo `Math.min(index * 0.08, 0.28)` giây.
  - *Why*: Khi danh sách lịch sử mua hàng có nhiều đơn, việc giới hạn trần độ trễ (`280ms`) giúp các đơn phía dưới không bị chờ quá lâu khi người dùng cuộn nhanh.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────┐
│                   Trang Chủ FORUS (Home View)                        │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ Cuộn trang (Scroll)
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│        Khu Vực Lịch Sử Mua Hàng & Tra Cứu Đơn (Order History)        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Bộ lọc trạng thái: [ Tất cả ]  [ Đang giao ]  [ Hoàn tất ]     │  │
│  └───────────────────────────────┬────────────────────────────────┘  │
│                                  │ Danh sách đã lọc                  │
│                                  ▼                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Vùng Quan Sát Cuộn (Viewport Observer: once = true, 15% view)  │  │
│  │                                                                │  │
│  │   ┌────────────────────────────────────────────────────────┐   │  │
│  │   │ Thẻ Đơn Hàng #1 (Fade-up: y: 24px -> 0, delay: 0ms)    │   │  │
│  │   │  • Danh sách món (+ Mua lẻ)                            │   │  │
│  │   │  • Ngăn lộ trình giao hàng (Ẩn/Hiện mượt)              │   │  │
│  │   │  • Nút [Xem tiến trình giao] & [Đặt lại đơn này]       │   │  │
│  │   └────────────────────────────────────────────────────────┘   │  │
│  │   ┌────────────────────────────────────────────────────────┐   │  │
│  │   │ Thẻ Đơn Hàng #2 (Fade-up: y: 24px -> 0, delay: 80ms)   │   │  │
│  │   └────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - Giữ nguyên cấu trúc dữ liệu `orderHistory` và bộ lọc `orderStatusFilter` (`"all" | "shipping" | "completed"`).
  - Bổ sung khóa định danh chuyển động theo `ord.orderId` để mỗi thẻ tự quản lý trạng thái đã hiển thị (`once: true`) một cách độc lập.
- **Interactive Component & State Mapping**:
  - **Cuộn tới thẻ đơn hàng**: Kích hoạt `opacity: 0 -> 1` và `translateY: 24px -> 0px` trong `0.45s` với easing `[0.16, 1, 0.3, 1]`.
  - **Chuyển bộ lọc trạng thái đơn (`orderStatusFilter`)**: Các thẻ thuộc bộ lọc mới xuất hiện mượt mà với hiệu ứng Fade-up mà không bị kẹt ở trạng thái ẩn.
  - **Bấm "Xem tiến trình giao" (`trackingOrderId`)**: Khung lộ trình giao hàng bên trong thẻ mở ra êm ái kèm hiệu ứng rõ dần.
