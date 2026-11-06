# BẢNG PHÂN CÔNG NHIỆM VỤ & TỈ LỆ HOÀN THÀNH — NHÓM FORUS
**Học phần**: CSC00006 — Giới thiệu ngành Trí tuệ nhân tạo (Đồ án 1)  
**Đơn vị**: Khoa Công nghệ Thông tin — Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1: 227 Nguyễn Văn Cừ, Q.5)  
**Tên Startup**: **FORUS** (*"Tiện ích trong tay, học hay mỗi ngày"*)

---

## 1. Bảng Phân Công Nhiệm Vụ Chi Tiết (5 Thành Viên)

| STT | Họ và Tên Thành Viên | MSSV | Vai Trò | Khối Lượng Công Việc & Phân Hệ Phụ Trách | Tỉ Lệ Hoàn Thành |
| :-: | :--- | :---: | :---: | :--- | :---: |
| 1 | **[Điền Tên Thành Viên 1]** | `[MSSV 1]` | **Nhóm trưởng & Kiến trúc Hệ thống / AI** | • Thiết kế kiến trúc tổng thể (`App.tsx`, `server.ts`, `forusChatService.ts`) & triển khai CI/CD lên **GitHub Pages** (`deploy.yml`).<br>• Xây dựng **Trợ lý AI Học tập FORUS 24/7** đa tầng (Server Gemini API + Bộ xử lý học thuật trình duyệt) & bộ hiển thị Toán/Code `FormattedAiMessage.tsx`.<br>• Quản lý hồ sơ sinh viên (`Khóa K26 – K23`), đăng nhập `@student.hcmus.edu.vn` và luồng tích/đổi điểm VIP. | **100%** |
| 2 | **[Điền Tên Thành Viên 2]** | `[MSSV 2]` | **Phụ trách Phân hệ Thuê & Bán Học Cụ & Giỏ Hàng** | • Xây dựng danh mục **10 sản phẩm & gói dịch vụ Thuê/Bán** (`forusData.ts`, `ProductDetailModal.tsx`, `ProductVisual.tsx`): 5 dòng máy tính cầm tay (Casio fx-580VN X, fx-880BTG, Vinacal 680EX Plus/III, Thiên Long Flexio Fx799VN), 10 giáo trình đại cương KHTN, Áo Blouse Lab, Bộ dụng cụ thuyết trình **TechRescue**, Combo iPad SV, MacroPad LaTeX, Flashcard chống nước.<br>• Thiết kế **Giỏ hàng tối giản** (`CartDrawer.tsx`) và **Lịch sử mua hàng** trung thực kèm hiệu ứng cuộn mượt `Fade-up + Stagger` (`motion/react`). | **100%** |
| 3 | **[Điền Tên Thành Viên 3]** | `[MSSV 3]` | **Phụ trách Phân hệ In Ấn A5–A1 & Trung tâm VIP** | • Xây dựng **Trạm In Ấn lấy liền (`PrintConfigurator.tsx`)**: Hỗ trợ chọn từng khổ giấy từ **A5, A4, A3, A2 đến A1**, niêm yết 2 bảng giá chuẩn (In Trắng Đen Fort 70–80gsm & In Màu Toàn Diện Fort / Couche >180gsm) và tự động tính giá theo số trang.<br>• Xây dựng **Sơ đồ chỉ dẫn các tầng CS1 (B1 – L11)** và **Kho 18 Mẫu Code LaTeX chuẩn Khoa CNTT** trong `VipHub.tsx`. | **100%** |
| 4 | **[Điền Tên Thành Viên 4]** | `[MSSV 4]` | **Phụ trách Sàn Gia Sư & Sự Kiện Săn ĐRL** | • Phát triển **Sàn kết nối Cò Gia Sư KHTN (`TutorHub.tsx`)**: Bộ lọc theo đối tượng, khu vực quận, thanh sắp xếp học phí tối ưu di động và biểu mẫu đăng ký hồ sơ gia sư mới.<br>• Phát triển **Bảng Săn Điểm Rèn Luyện (`EventsHub.tsx`)**: Đồng hồ đếm ngược thời gian thực tới hạn đóng đơn đăng ký, bật nhắc hẹn tham gia và lưu ghi chú sự kiện. | **100%** |
| 5 | **[Điền Tên Thành Viên 5]** | `[MSSV 5]` | **Phụ trách UI/UX, Trang Giới Thiệu & Poster A1** | • Thiết kế **Khối Hero tương tác 4 trụ cột** tại Trang chủ, chế độ Sáng/Tối (`Light/Dark Mode`) và tối ưu hiển thị Mobile-First trên điện thoại.<br>• Xây dựng **Trang Giới thiệu dự án, bộ Câu hỏi thường gặp (FAQ) tương tác & Liên hệ CS1 (`AboutAndContactView.tsx`)**.<br>• Chụp/xử lý hình ảnh học cụ, bìa giáo trình thực tế và thiết kế **Poster khổ A1 dọc** phục vụ buổi triển lãm Đồ án 1. | **100%** |

---

## 2. Nhóm Đã Ứng Dụng Trí Tuệ Nhân Tạo (AI) Như Thế Nào?

1. **Tích hợp AI trực tiếp làm tính năng cốt lõi của sản phẩm (`Trợ lý AI FORUS 24/7`)**:
   - Kết nối SDK `@google/genai` (`gemini-3.1-flash-lite` / `gemini-3.8-flash`) trên máy chủ Express (`server.ts`) kết hợp bộ điều phối thông minh `forusChatService.ts` giúp Chatbot hoạt động mượt mà trên cả Cloud Run lẫn tên miền tĩnh **GitHub Pages (`https://qwerty2008.github.io/FORUS/`)**.
   - Hỗ trợ sinh viên giải toán đại cương từng bước (Vi tích phân 1B/2B, Định lý Kẹp, Khai triển Maclaurin, Đại số tuyến tính, Toán rời rạc), gỡ lỗi code C++/Python, xuất mã LaTeX và tư vấn bảng giá học cụ/in ấn tại Cơ sở 1.
2. **Ứng dụng AI trong quá trình phát triển phần mềm & thiết kế học cụ**:
   - Hỗ trợ kiểm tra cấu trúc TypeScript, tối ưu hiệu ứng chuyển động cuộn trang (`motion/react`) và thiết kế đáp ứng (Responsive UI) trên thiết bị di động.
   - Hỗ trợ chuẩn hóa bộ 18 mẫu code LaTeX học thuật (ma trận, tích phân, quy nạp, khung báo cáo Đồ án 1 Khoa CNTT) và biên tập nội dung FAQ rõ ràng, súc tích.
