# PROMPT: Tối giản hóa và thiết kế lại web FORUS

> Cách dùng: mở repo `qwerty2008/FORUS` trong công cụ AI viết code (Claude Code, Cursor, v.v.), dán toàn bộ nội dung từ dòng "VAI TRÒ" trở xuống. Nên chạy từng GIAI ĐOẠN một, kiểm tra trên trình duyệt rồi mới sang giai đoạn tiếp theo.

---

## VAI TRÒ

Bạn là front-end developer kiêm designer, có gu tối giản kiểu editorial (tạp chí). Nhiệm vụ: thiết kế lại giao diện web FORUS (React 19 + TypeScript + Vite + Tailwind v4, thư viện hiệu ứng `motion/react` đã có sẵn) để web **gọn, sạch, có chất riêng, nhìn không giống web do AI sinh ra**.

## BỐI CẢNH (đã khảo sát code)

FORUS là web tiện ích cho sinh viên ĐH KHTN Cơ sở 1: Thuê & Bán học cụ (`gear`), Sự kiện săn điểm rèn luyện (`events`), In ấn A5–A1 (`print`), Gia sư (`tutor`), VIP & AI (`vip`), Giới thiệu (`about`). Chuyển mục bằng state `activeTab` trong `src/App.tsx` (4761 dòng, không có router).

Những điểm cụ thể cần xử lý:

| Vấn đề hiện tại | Vị trí |
|---|---|
| Chữ cực nhỏ khắp nơi: khoảng 280 chỗ dùng `text-[8px]` đến `text-[11px]` | toàn `src/` |
| Trộn nhiều phông: Plus Jakarta Sans + JetBrains Mono (khoảng 200 chỗ `font-mono` dùng cho nhãn) | `src/index.css`, `index.html` |
| Quá nhiều màu: navy `#0B2545`, cam `#D95326`, kem `#E5DEC9`, thêm amber, emerald, sky, rose dùng tràn lan (`text-amber` khoảng 159 chỗ, `text-emerald` khoảng 94 chỗ) | toàn `src/` |
| Thẻ sản phẩm nhiều chữ | `App.tsx` quanh dòng 2836–2870, 3688–3760, 3976 (`ProductVisual` + `setSelectedProduct`) |
| Trang giới thiệu hiện chỉ là FAQ + form liên hệ | `App.tsx` dòng ~4047 + `src/components/AboutAndContactView.tsx` |
| In ấn có 2 bảng giá lớn, rồi mới đến form Bước 1 / Bước 2 đặt cạnh nhau | `src/components/PrintConfigurator.tsx` dòng ~302–448 (bảng giá), ~455 (Bước 1), ~906 (Bước 2) |
| Trang chủ dài, nhiều khối | `App.tsx` dòng ~2464–3100 (3 `<section>`) |

## RÀNG BUỘC BẮT BUỘC (không được phá)

1. **Giữ nguyên logic nghiệp vụ**: tính giá in (`PrintConfigurator`), giỏ hàng, voucher, điểm VIP, đăng nhập, chatbot (`forusChatService.ts`, `server.ts`), dữ liệu trong `src/data/*`. Chỉ đổi giao diện và bố cục.
2. **Giữ nguyên nội dung giới thiệu hiện có** (sứ mệnh, địa điểm, FAQ, thông tin liên hệ). Được viết lại cho gọn, không được bỏ ý.
3. Giữ chế độ sáng/tối, giữ chạy được trên GitHub Pages (`base: './'` trong `vite.config.ts`).
4. Không thêm thư viện nặng. Nếu cần thêm (ví dụ `lenis` cho cuộn mượt), chỉ thêm 1 thư viện nhỏ và nói rõ lý do.
5. Sau mỗi giai đoạn phải chạy được `npm run build` không lỗi, và kiểm tra thử trên khung điện thoại 390px (sinh viên chủ yếu dùng điện thoại).
6. Làm trên nhánh `redesign-minimal`, mỗi giai đoạn một commit.

---

## GIAI ĐOẠN 0. Chuẩn bị (không đổi giao diện)

Tách `App.tsx` thành các file riêng để sửa an toàn: `src/pages/Home.tsx`, `src/pages/About.tsx`, `src/pages/Gear.tsx`, và component `ProductCard.tsx` dùng chung (hiện thẻ sản phẩm bị lặp ở ít nhất 3 chỗ). Chạy lại, đảm bảo web trông và hoạt động y hệt trước khi sang giai đoạn 1.

## GIAI ĐOẠN 1. Hệ thống thiết kế thống nhất (yêu cầu: "thống nhất phông, màu, cỡ chữ")

Khai báo token trong `src/index.css` bằng `@theme` của Tailwind v4, rồi **thay toàn bộ** giá trị tự do trong code bằng token.

**Phông chữ: chỉ MỘT họ phông.**
- Dùng một phông hỗ trợ tiếng Việt tốt (giữ Plus Jakarta Sans, hoặc đổi sang Be Vietnam Pro nếu muốn khác đi), tối đa 2 độ đậm: 400 và 700.
- Bỏ JetBrains Mono khỏi giao diện (xóa khỏi `index.html`). Chỉ giữ cho khối code trong chatbot.
- Bỏ kiểu nhãn chữ HOA nhỏ giãn chữ (`uppercase tracking-widest text-[10px]`), đây là dấu hiệu "AI làm" rất dễ nhận ra.

**Cỡ chữ: một thang cố định 6 mức, không có `text-[..px]` tùy ý.**

| Token | Dùng cho | Gợi ý |
|---|---|---|
| `display` | Tiêu đề hero | clamp(2.5rem, 8vw, 6rem) |
| `h1` | Tiêu đề mục | clamp(1.75rem, 4vw, 3rem) |
| `h2` | Tiêu đề phụ, tên sản phẩm | 1.25rem |
| `body` | Nội dung | 1rem (16px) |
| `small` | Chú thích | 0.875rem (14px) |
| `tiny` | Hiếm khi dùng | 0.75rem (12px, **không nhỏ hơn**) |

**Màu: một bảng màu, 1 màu nhấn.**
- Nền: kem `#F6F2E8` (sáng), `#0E1624` (tối). Chữ: navy `#0B2545` (sáng), kem (tối). Màu nhấn duy nhất: cam `#D95326`. Đây là màu thương hiệu đã có sẵn trong code.
- Xóa mọi `amber / emerald / sky / rose / teal` mang tính trang trí. Chỉ giữ đỏ cho báo lỗi và xanh lá cho thành công.
- Bỏ gradient, bóng đổ nhiều lớp, kính mờ (backdrop-blur), thẻ bo tròn lớn `rounded-3xl` ở mọi nơi. Dùng đường kẻ mảnh 1px, bo góc nhỏ (4–8px) hoặc vuông.

**Quy tắc khoảng cách**: dùng bậc 4/8/16/24/48/96px. Mỗi mục cách nhau lớn (96px trở lên), để khoảng trống làm nên sự tối giản.

## GIAI ĐOẠN 2. Thẻ sản phẩm gọn, bấm mới hiện đủ thông tin

- Thẻ chỉ gồm: **ảnh lớn, tên (1 dòng), giá "từ xxx đ", một nhãn nhỏ Thuê/Mua**. Hết. Không mô tả, không danh sách đặc điểm, không huy hiệu điểm thưởng, không nút phụ.
- Cả thẻ là vùng bấm; bấm thì mở `ProductDetailModal` (đã có sẵn) chứa **toàn bộ** thông tin: mô tả, các gói thuê/mua, dòng máy, điểm thưởng, nút thêm giỏ.
- Rê chuột (desktop) chỉ đổi nhẹ ảnh hoặc hiện mũi tên "Xem", không hiện thêm chữ.
- Lưới: 2 cột trên điện thoại, 3–4 cột trên máy tính, ảnh cùng tỉ lệ khung. Dùng cùng một component `ProductCard` cho trang chủ và mục Thuê & Bán.
- Modal: trên điện thoại hiện dạng "ngăn kéo từ dưới lên" (bottom sheet), có thể vuốt đóng. Phím Esc đóng được.

## GIAI ĐOẠN 3. Làm lại hoàn toàn trang Giới thiệu (`about`)

Biến trang này thành **một câu chuyện cuộn dọc** kể vì sao FORUS có mặt và khác gì. Mỗi đoạn là một màn hình, có chữ lớn, ít chữ.

**Thứ tự (khớp thứ tự menu, bán hàng đứng đầu sau phần giới thiệu chung):**

1. **Mở đầu (hero)**: một câu lớn nêu vấn đề của sinh viên KHTN (ví dụ: thiếu thiết bị đúng lúc thi, in gấp trước giờ nộp, không biết sự kiện nào còn hạn). Cuộn xuống thì chữ thay đổi, ảnh phóng to dần.
2. **FORUS là gì và vì sao khác**: giữ nội dung giới thiệu cũ, viết lại thành 3–4 câu và 3 con số nổi bật (đếm số chạy khi cuộn tới). Chỉ dùng số liệu thật có trong code (ví dụ số sản phẩm, số khổ giấy in), **không bịa số**.
3. **Thuê & Bán học cụ** (đứng đầu các tính năng): kể bằng tình huống ("Mai thi, máy tính hỏng đêm nay"), kèm 3–4 `ProductCard` mẫu có thể bấm. Lợi ích: không cần đặt cọc, nhận ngay tại Tòa I.
4. **Sự kiện săn điểm rèn luyện**: tình huống + đồng hồ đếm ngược thật lấy từ `hcmusEventsData.ts`.
5. **In ấn A5–A1**: tình huống + minh họa 2 bước (chọn, rồi chọn lịch nhận).
6. **Gia sư**: tình huống ngắn.
7. **VIP & AI**: điểm thưởng, voucher, hỏi AI. Giải thích điểm cộng khi thanh toán xong (đúng như code, không nói +5 mỗi giao dịch).
8. **Kết**: câu kêu gọi hành động, rồi FAQ (thu gọn dạng accordion, giữ nguyên nội dung câu hỏi) và thông tin liên hệ (giữ form liên hệ cũ).

**Hiệu ứng ấn tượng (tham khảo youpass.vn và eiger-extreme.mammut.com):**
- Cuộn có "ghim" (sticky scroll): một khung ghim lại trong lúc nội dung phía sau thay đổi theo vị trí cuộn, dùng `useScroll` + `useTransform` của `motion/react`.
- Chữ tiêu đề hiện theo từng từ hoặc từng dòng (mask reveal), ảnh có parallax (ảnh trôi chậm hơn nền).
- Số đếm chạy khi vào khung nhìn; thanh tiến trình cuộn mảnh ở đầu trang; con trỏ tùy biến nhẹ ở desktop (tùy chọn).
- Chuyển cảnh giữa các mục bằng đổi nền màu (kem sang navy sang kem) khi cuộn qua từng chương.
- **Bắt buộc**: tôn trọng `prefers-reduced-motion` (tắt hiệu ứng nếu người dùng đặt vậy); chỉ animate `transform` và `opacity` để mượt trên điện thoại; không chặn cuộn tự nhiên.

## GIAI ĐOẠN 4. In ấn: bỏ bảng giá, chuyển bước ngay trong trang

- **Xóa hai khối bảng giá** (`PrintConfigurator.tsx` ~dòng 302–448). Dữ liệu `PRINT_PRICING_TABLE` vẫn giữ để tính tiền.
- Biến Bước 1 và Bước 2 thành **wizard một cột**: thêm state `step` (1 hoặc 2). Chỉ hiển thị một bước một lúc.
  - Đầu trang có thanh tiến trình đơn giản: "1 Cấu hình in", "2 Lịch nhận" (bước hiện tại tô đậm).
  - Cuối Bước 1 có nút **"Tiếp theo"**; bấm thì chuyển sang Bước 2 trong cùng trang (có hiệu ứng trượt ngang nhẹ), cuộn lên đầu khối. Bước 2 có nút **"Quay lại"** (giữ nguyên lựa chọn đã chọn) và nút xác nhận.
  - Nút "Tiếp theo" bị khóa cho tới khi Bước 1 hợp lệ (đã chọn khổ giấy, số trang, số bản…); hiện lý do ngắn nếu thiếu.
  - Chú ý: form đang dùng `onSubmit={handleSubmit}`, hãy chặn Enter ở Bước 1 làm gửi đơn sớm.
- Thay chỗ bảng giá bằng **thanh tạm tính cố định ở dưới màn hình** (cập nhật tức thì theo lựa chọn): "Tạm tính 34.000đ · +6 điểm". Người dùng thấy giá ngay khi chọn mà không cần tra bảng.
- Khi chọn A1/A2 vẫn tự chuyển một mặt + ống poster như logic cũ, nhưng hiển thị bằng một dòng chú thích nhỏ thay vì khối chữ dài.

## GIAI ĐOẠN 5. Trang chủ cô đọng, có câu chuyện

Rút trang chủ (hiện ~640 dòng JSX, 3 section) còn **4 khối**:

1. **Hero**: một câu lớn + một nút chính ("Xem học cụ") + một nút phụ ("Câu chuyện FORUS" dẫn tới trang giới thiệu). Có ảnh/video nền thật của trường hoặc sản phẩm.
2. **Dải sản phẩm nổi bật**: 4 `ProductCard`, cuộn ngang trên điện thoại.
3. **Ba lối tắt**: In ấn, Sự kiện, Gia sư, mỗi lối chỉ một dòng + một mũi tên, chữ lớn, nền đổi màu khi rê chuột.
4. **Kêu gọi đăng nhập** (nếu chưa đăng nhập) kèm lợi ích điểm VIP, một câu duy nhất.

Bỏ mọi khối còn lại khỏi trang chủ (nội dung đó đã chuyển sang trang Giới thiệu).

---

## GỢI Ý THÊM ĐỂ KHÔNG CÒN CẢM GIÁC "AI LÀM"

- **Bỏ dấu hiệu quen thuộc của giao diện AI**: emoji trang trí, gradient tím/xanh, huy hiệu pill nhiều màu, thẻ nào cũng bo tròn + đổ bóng, tiêu đề kiểu "Toàn diện / Tối ưu / Thông minh", ba cột icon + tiêu đề + 2 dòng chữ giống hệt nhau. Thay bằng bố cục **bất đối xứng**, chữ rất lớn, nhiều khoảng trắng, đường kẻ mảnh.
- **Dùng ảnh thật** (ảnh sản phẩm chụp thật, ảnh khuôn viên 227 Nguyễn Văn Cừ) thay cho minh họa/icon. Ảnh nên chuyển sang WebP và lazy-load.
- **Viết lại chữ theo giọng sinh viên**, ngắn, cụ thể, mỗi câu dưới 15 chữ. Ví dụ "Thuê máy tính Casio, không cần cọc" tốt hơn "Giải pháp cho thuê thiết bị học tập toàn diện".
- **Đổi cách đặt thanh menu**: trên điện thoại dùng thanh tab dưới đáy (5 mục + giỏ hàng) thay cho menu hamburger; trên desktop dùng menu chữ trơn, không có nền hộp.
- **Chuyển trang mượt**: khi đổi `activeTab`, cuộn lên đầu và dùng hiệu ứng mờ dần ngắn (≤200ms). Cân nhắc đồng bộ `activeTab` với `location.hash` để nút Back của trình duyệt và F5 hoạt động (hiện F5 luôn về trang chủ).
- **Lưu giỏ hàng vào localStorage** (hiện mất khi F5), vì giao diện mới đẹp mà mất giỏ hàng thì vẫn gây khó chịu.
- **Trạng thái rỗng và đang tải** đẹp: skeleton cho ảnh sản phẩm, trạng thái giỏ trống có một câu và một nút.
- **Dark mode theo token**: nền navy đậm, chữ kem, vẫn một màu nhấn cam; kiểm tra độ tương phản chữ ≥ 4.5:1.
- **Hiệu năng**: kiểm tra Lighthouse trên điện thoại; hero không quá 300KB; font chỉ nạp các độ đậm đã dùng; tách `VipHub` (3110 dòng) bằng `React.lazy` để trang chủ nhẹ hơn.

## TIÊU CHÍ NGHIỆM THU (tự kiểm tra trước khi báo xong)

- [ ] `grep -rE "text-\[[0-9]+px\]" src` không còn kết quả; không còn `font-mono` ngoài khối code.
- [ ] Chỉ còn đúng 1 họ phông trong `index.html` và `index.css`; không còn `amber|emerald|sky|rose|teal` dùng làm trang trí.
- [ ] Thẻ sản phẩm chỉ có ảnh, tên, giá, nhãn; bấm mở modal đầy đủ thông tin; dùng chung một component.
- [ ] Trang Giới thiệu có đủ 8 chương theo thứ tự trên, bán hàng đứng đầu các tính năng, vẫn còn đủ nội dung giới thiệu, FAQ và form liên hệ cũ.
- [ ] In ấn không còn bảng giá; Bước 1 sang Bước 2 bằng nút "Tiếp theo" trong cùng trang, quay lại không mất dữ liệu; giá tạm tính khớp với giá trước khi sửa (so sánh 3 ca: 50 trang A4 đen trắng 2 bản bấm kim; A1 một bản; A3 hai mặt màu).
- [ ] Giỏ hàng, voucher, điểm VIP, đăng nhập, chatbot hoạt động y như cũ.
- [ ] `npm run build` sạch lỗi; xem thử ở 390px, 768px, 1440px, cả sáng và tối; hiệu ứng tắt khi bật reduced motion.

## CÁCH BÁO CÁO

Sau mỗi giai đoạn: nêu ngắn gọn đã đổi những file nào, ảnh chụp màn hình trước/sau nếu có thể, và những chỗ bạn **không chắc** hoặc cần tôi quyết định (ví dụ chọn phông, chọn ảnh hero). Không tự ý đổi logic tính giá hay dữ liệu.
