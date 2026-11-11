# Nâng tầm nghệ thuật FORUS — Chủ đề "Sổ tay phòng thí nghiệm" (Lab Notebook)

Kế hoạch này nâng cấp toàn diện ngôn ngữ thị giác của FORUS từ giao diện thẻ thông thường sang phong cách **"Sổ tay phòng thí nghiệm" (Lab Notebook)** dành riêng cho sinh viên Trường ĐH Khoa học Tự nhiên (Cơ sở 1 — 227 Nguyễn Văn Cừ), kết hợp bộ ảnh minh họa bàn học ô ly – thuyền giấy, hệ chữ `Newsreader` + `Be Vietnam Pro` và giữ trọn vẹn toàn bộ nghiệp vụ hiện có.

---

## Các Quyết Định Đã Chốt Từ Phản Hồi Của Bạn

> [!IMPORTANT]
> Ba quyết định cốt lõi dưới đây đã được chốt theo lựa chọn của bạn và sẽ được áp dụng xuyên suốt toàn bộ quá trình triển khai:

- **Hệ chữ (Typography)**: Kết hợp phông chữ Serif hiển thị **`Newsreader`** (hỗ trợ đầy đủ dấu tiếng Việt phức hợp như `ẮẶẲẴỀỂỄỒỔỖỤỮ`) cho các tiêu đề lớn và số đếm ngược, đi cùng phông chữ Sans-serif **`Be Vietnam Pro`** cho văn bản thân, nhãn điều khiển và biểu mẫu.
- **Hệ thống hình ảnh (Visual Assets)**: Tạo mới bộ **ảnh minh họa AI không chữ** theo cùng phong cách nét mực xanh và giấy ô ly (ảnh bàn học có thuyền giấy ở Hero, 3 lát cắt dịch vụ In ấn / Sự kiện / Gia sư, minh họa giỏ hàng trống), đồng thời **giữ nguyên 100% ảnh chụp thật** cho toàn bộ máy tính Casio/Vinacal, áo blouse, giáo trình và thiết bị công nghệ.
- **Cấu trúc điều hướng & Trang chủ**: Dựng **Trang chủ 6 section nghệ thuật** (mỗi section một bố cục độc lập) và **tích hợp gọn phần Giải đáp FAQ + Liên hệ Trạm Sảnh Tòa I vào cuối Trang chủ**, giữ thanh điều hướng 6 mục tinh gọn (`Trang chủ`, `Thuê & Bán`, `Sự kiện`, `In ấn`, `Gia sư`, `Tính năng`) đồng bộ với `location.hash` để nút Back/Reload trình duyệt hoạt động tự nhiên.

---

## 1. Tổng Quan & Ý Tưởng Chủ Đạo (Core Concept)

- **Ý tưởng xuyên suốt ("Sổ tay phòng thí nghiệm")**: Mỗi sinh viên Tự Nhiên đều gắn liền với cuốn vở ô ly, nét mực xanh và đường lề đỏ. Hình ảnh chiếc thuyền giấy gấp từ trang vở ô ly có vẽ ký hiệu nguyên tử trên cánh buồm kết nối trực tiếp với biểu tượng thương hiệu FORUS, xuất hiện ở Hero đầu trang và lặp lại một lần duy nhất dưới dạng dấu triện nhỏ ở phần kết (Second-read moment).
- **Đối tượng phục vụ**: Sinh viên ĐH Khoa học Tự nhiên (ĐHQG-HCM) tại Cơ sở 1 (227 Nguyễn Văn Cừ, Quận 5) truy cập nhanh bằng điện thoại (390px) giữa các ca học hoặc tra cứu trên máy tính (1440px).
- **Giá trị mang lại**: Giao diện mang cá tính học thuật rõ rệt, câu chữ ngắn gọn dưới 15 chữ mỗi câu theo đúng giọng sinh viên (*"Thuê Casio, không cần cọc"*), loại bỏ hoàn toàn các câu khẩu hiệu sáo rỗng, thẻ bo tròn đổ bóng đại trà hay huy hiệu nhiều màu.

---

## 2. Trải Nghiệm Người Dùng & Hệ Thống Thị Giác

### Ngôn Ngữ Thiết Kế & Bảng Màu
- **Chế độ Sáng (Quiet Premium Neutral)**: Nền giấy lạnh `#F8FAFC`, bề mặt `#FFFFFF`, lưới ô ly vẽ bằng CSS (`linear-gradient` 1px màu `#E2E8F0`, kích thước ô `24px` thông qua lớp tiện ích `.paper-grid`), mực chữ chính `#0B2545`.
- **Chế độ Tối ("Bản vẽ kỹ thuật — Blueprint Dark")**: Nền `#0E1624`, bề mặt `#152033`, lưới `#233044`, chữ sáng `#F8FAFC`.
- **Màu nhấn duy nhất (`#D95326` — Mực đỏ chấm bài / Lề vở)**: Chỉ dùng cho đường kẻ lề dọc (`.margin-rule`), con dấu viền mảnh 1px (`.stamp`), nút hành động chính và điểm nhấn số học. Không dùng làm màu nền mảng lớn và không thêm bất kỳ màu phụ nào khác.

### Hành Trình 6 Section Trên Trang Chủ Mới
1. **Section 1 — Hero (Image-as-Canvas, Mid Editorial)**:
   - Ảnh minh họa toàn khung bàn học sinh viên trên giấy ô ly với thuyền giấy gấp ở góc phải-giữa, phủ lớp chuyển sắc navy đậm ở góc trái-dưới để đặt tiêu đề Serif lớn *"Tiện ích trong tay, học hay mỗi ngày"*, phụ đề ngắn *"Thuê học cụ, in tài liệu, săn điểm rèn luyện. Ngay tại Cơ sở 1."* cùng nút chính *"Xem học cụ"* và liên kết gạch chân *"Câu chuyện & FAQ →"*.
2. **Section 2 — Học cụ cho tuần thi (Layered Image Crop Frames)**:
   - Nền phẳng điểm lưới ô ly mờ, tiêu đề góc trái trên, liên kết *"Xem tất cả →"* góc phải dưới. Hiển thị 4 thẻ học cụ ảnh thật (Casio fx-580VN X, Áo Blouse, Bộ TechRescue, Giáo trình) trong khung cắt vuông vức, chỉ gồm ảnh lớn, tên 1 dòng, giá thật từ dữ liệu (`Thuê từ 15.000đ`) và con dấu `.stamp` vuông (`THUÊ` / `MUA`). Bấm vào bất kỳ đâu trên thẻ đều mở cửa sổ chi tiết sản phẩm.
3. **Section 3 — Ba tình huống giảng đường (Off-Grid Editorial Diptych)**:
   - Bố cục hai mảng màu đối lập cạnh nhau (bên trái nền giấy sáng `#F8FAFC`, bên phải nền navy `#0B2545`) có đường lề đỏ dọc xuyên qua. Trình bày lệch lưới 3 cảnh thực tế với chữ Serif lớn: *"Mai thi, máy tính hết pin."* · *"Sáng nộp, poster A1 chưa in."* · *"Form đóng sau 2 giờ."* kèm ghi chú lề ngắn gọn.
4. **Section 4 — Ba lối tắt dịch vụ (Hover-Accordion Slices)**:
   - Ba lát cắt đứng toàn chiều cao cho **In ấn**, **Sự kiện**, **Gia sư** sử dụng 3 ảnh minh họa nét mực đồng bộ. Trên máy tính, rê chuột vào lát nào thì lát đó mở rộng mượt mà; trên điện thoại, xếp dọc rõ ràng.
5. **Section 5 — Trợ lý AI & Sơ đồ tầng Cơ sở 1 (Blueprint Dark)**:
   - Đặt trên nền bản vẽ tối `#0E1624` với lưới `#233044`. Một phần ba bên phải là tiêu đề Serif sáng *"Hỏi AI giải Vi tích phân. Tìm phòng học từ B1 đến L11."* và nút viền *"Mở trợ lý"*; hai phần ba bên trái là giao diện hỏi đáp công thức Toán KaTeX thật xếp chồng nhẹ lên bản vẽ kiến trúc nét mảnh các tầng B1 – L11.
6. **Section 6 — Phần kết, Giải đáp FAQ & Liên hệ Trạm Sảnh Tòa I**:
   - Mở đầu bằng khoảng trắng thoáng đãng ở trung tâm với dấu triện **chiếc thuyền giấy ô ly nhỏ** (Second-read moment), câu chốt *"Đăng nhập, tích điểm VIP, đổi voucher."* và nút chính *"Đăng nhập sinh viên"*. Ngay phía dưới là sổ tay giải đáp FAQ (giữ đủ 5 câu hỏi cốt lõi) và biểu mẫu liên hệ Trạm trực Sảnh Tòa I.

### Tinh Chỉnh Các Phân Hệ Chức Năng
- **Thuê & Bán**: Tiêu đề kiểu tạp chí, bộ lọc danh mục dạng chữ gạch chân thay vì nút viên thuốc, lưới sản phẩm 2 cột trên điện thoại và 4 cột trên máy tính với khung ảnh đồng nhất tỉ lệ và hiệu ứng khung xương (skeleton) khi tải ảnh.
- **Sự kiện**: Đồng hồ đếm ngược hiển thị bằng phông chữ Serif cỡ lớn, các sự kiện sắp đóng đơn gắn nhãn `.stamp` viền đỏ cam.
- **Gia sư**: Mỗi hồ sơ gia sư hoặc lớp tìm gia sư được trình bày như một **Thẻ sinh viên / Hồ sơ mẫu vật** vuông vức có mã xác thực và đường kẻ mảnh.
- **In ấn & Tính năng VIP**: Giữ nguyên quy trình in 2 bước kèm thanh tạm tính cố định và giao diện Sơ đồ tầng B1–L11 nét mảnh cùng Trợ lý AI học thuật.

---

## 3. Quyết Định Sản Phẩm & Đánh Đổi Kỹ Thuật

- **Quyết định 1: Tách biệt rõ Ảnh minh họa AI và Ảnh chụp sản phẩm thật**
  - *Phương án chọn*: Chỉ dùng công cụ tạo ảnh cho 5 bức tranh minh họa không khí học tập (không chứa chữ hay nhãn hiệu), còn toàn bộ sản phẩm trong giỏ hàng và danh mục giữ nguyên ảnh chụp thực tế.
  - *Lý do*: Sinh viên cần nhìn đúng mẫu máy tính Casio fx-580VN X, Casio fx-880BTG hay Vinacal 680EX sẽ nhận tại quầy Sảnh Tòa I; đồng thời tránh triệt để lỗi sai dấu tiếng Việt thường gặp khi AI vẽ chữ lên ảnh.
- **Quyết định 2: Đồng bộ điều hướng với `window.location.hash`**
  - *Phương án chọn*: Liên kết trạng thái tab hiện tại (`#home`, `#gear`, `#events`, `#print`, `#tutor`, `#vip`) với URL hash thông qua sự kiện `hashchange`.
  - *Lý do*: Cho phép sinh viên bấm nút Back/Forward trên điện thoại, tải lại trang (F5) hoặc chia sẻ đường dẫn trực tiếp tới từng mục mà vẫn tương thích hoàn toàn với môi trường triển khai tĩnh (GitHub Pages).

---

## 4. Kiến Trúc Kỹ Thuật & Luồng Tương Tác

### Sơ Đồ Kiến Trúc Giao Diện & Trạng Thái

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                   Ứng Dụng FORUS (Trạng Thái Trung Tâm)                    │
│  • Đồng bộ điều hướng URL Hash (#home, #gear, #events, #print, #tutor, #vip)│
│  • Quản lý Giỏ hàng, Điểm thưởng VIP, Hồ sơ Sinh viên & Chế độ Sáng/Tối    │
└───────┬──────────────────────────┬───────────────────────────┬─────────────┘
        │                          │                           │
        ▼                          ▼                           ▼
┌───────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐
│   Trang Chủ Sổ Tay    │  │  Các Phân Hệ Dịch Vụ   │  │ Hệ Thống Cửa Sổ Nổi │
│  (6 Section Nghệ Thuật│  │ • Kho Học Cụ (Lưới 4)  │  │ • Chi Tiết Học Cụ   │
│   + Sổ Tay FAQ/LiênHệ)│  │ • Đặt In 2 Bước A5–A1  │  │ • Giỏ Hàng & Voucher│
│  ┌─────────────────┐  │  │ • Sự Kiện ĐRL (Serif)  │  │ • Đăng Nhập MSSV    │
│  │ 1. Hero Ô Ly    │  │  │ • Thẻ Sinh Viên Gia Sư │  │ • Trợ Lý AI Nổi     │
│  │ 2. 4 Học Cụ Thi │  │  │ • Bản Vẽ Tầng B1–L11   │  └─────────────────────┘
│  │ 3. Ba Tình Huống│  │  │   & Trợ Lý AI KaTeX    │
│  │ 4. Ba Lối Tắt   │  │  └────────────────────────┘
│  │ 5. Bản Vẽ AI/CS1│  │
│  │ 6. Kết + FAQ    │  │
│  └─────────────────┘  │
└───────────────────────┘
```

### Ánh Xạ Tương Tác & Nghiệp Vụ Bảo Toàn
- **Thẻ Học Cụ (`ProductCard`)**: Bấm vào toàn bộ thẻ sẽ mở ngay cửa sổ chọn dòng máy và gói Thuê/Mua; ảnh có lớp khung xương (skeleton) mượt mà trước khi hiển thị hoàn tất.
- **Ba Lối Tắt Dịch Vụ (Hover-Accordion Slices)**: Rê chuột (hoặc chạm trên di động) làm giãn tỷ lệ chiều rộng lát cắt bằng CSS/Motion (`transform`/`flex`) và bấm vào sẽ chuyển trực tiếp sang phân hệ `In ấn`, `Sự kiện` hoặc `Gia sư` tương ứng.
- **Kiểm chứng nghiệp vụ**: Toàn bộ công thức tính giá in (bao gồm 3 ca kiểm thử: 50 trang A4 đen trắng 2 bản bấm kim; Poster A1 một bản; A3 hai mặt màu), quy tắc cộng điểm sau khi thanh toán, đổi mã giảm giá (`VIP50`, `VIP60`, `VIP100`) và kết nối Trợ lý AI được giữ nguyên tuyệt đối.
