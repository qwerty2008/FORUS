# PROMPT: Nâng tầm nghệ thuật cho web FORUS (taste-skill + AI tạo ảnh)

> Dựa trên 2 repo của Leonxlnx: **taste-skill** (v2.5, xây và kiểm tra frontend thật) và **imagegen-skills** (tạo ảnh bản thiết kế cho từng section). Các skill tạo ảnh đã được tác giả chuyển từ taste-skill sang repo `imagegen-skills` từ tháng 10/2026, nên link `taste-skill.git` một mình không còn chứa chúng.

---

## 0. CÁCH DÙNG (đọc 1 phút)

**Quy trình 3 chặng. Làm tuần tự, mỗi chặng kiểm tra xong mới sang chặng sau.**

| Chặng | Việc | Công cụ | Dán phần nào |
|---|---|---|---|
| 1 | Tạo **ảnh bản thiết kế** (comp), mỗi section một ảnh ngang | ChatGPT Images, Gemini, hoặc agent có tạo ảnh | Phần B1 + B2 |
| 2 | Tạo **ảnh minh họa dùng thật** trên web (WebP) | Cùng công cụ ở chặng 1, cùng cuộc trò chuyện | Phần B1 + B3 |
| 3 | **Viết code** theo ảnh, rồi kiểm tra bằng trình duyệt thật | Claude Code, Codex hoặc Cursor, mở repo FORUS | Phần A |

**Cài skill (tùy chọn, prompt bên dưới đã tóm tắt đủ luật nên không cài vẫn chạy được):**

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/imagegen-skills --skill "imagegen-frontend-web"
```

Skill của taste-skill cần Node 22+ và Chrome/Edge/Chromium để chạy bộ kiểm tra.

**Hai quyết định tôi đã chọn sẵn cho bạn (sửa nếu không đồng ý):**

1. **Giữ bảng màu hiện có** (navy `#0B2545` + cam `#D95326`, nền lạnh `#F8FAFC`), vì nó đã phủ toàn code và đã được bạn chủ động bỏ ám vàng kem. Logo giữ nguyên bản xanh lam + xanh lá, không đưa xanh lá thành màu giao diện.
2. **Ảnh AI chỉ dùng cho minh họa và không khí. Ảnh sản phẩm và ảnh khuôn viên phải là ảnh thật.** Lý do: sinh viên thuê đúng cái máy Casio trong ảnh, AI vẽ sai kiểu máy hay logo là gây hiểu lầm. taste-skill cũng cấm đem ảnh dựng giả làm phòng, người, sản phẩm thật của khách.

---

# PHẦN A. PROMPT CHÍNH CHO AI VIẾT CODE (chặng 3)

Dán toàn bộ từ dòng "VAI TRÒ" đến hết Phần A vào Claude Code / Cursor.

## VAI TRÒ

Bạn là art director kiêm front-end developer. Hãy nâng giao diện web FORUS (React 19, TypeScript, Vite, Tailwind v4, `motion/react`) lên mức **có nghệ thuật, có chất riêng, không giống trang do AI sinh ra**, theo tinh thần taste-skill: chữ rõ, một hệ thiết kế, mỗi section một việc, ảnh thật và ảnh có chủ đích, hiệu ứng chỉ ở mức tinh tế, kiểm tra trong trình duyệt thật.

## BỐI CẢNH THẬT (đã khảo sát)

- FORUS là web tiện ích cho sinh viên ĐH KHTN, Cơ sở 1 (227 Nguyễn Văn Cừ, Q.5). Khẩu hiệu: **"Tiện ích trong tay, học hay mỗi ngày"**.
- Các mục (state `activeTab` trong `src/App.tsx`, không có router): `home`, `about`, `gear` (Thuê & Bán), `events` (săn điểm rèn luyện), `print` (in A5–A1), `tutor` (gia sư), `vip` (điểm VIP, trợ lý AI, sơ đồ tầng B1–L11).
- Đã có: `src/pages/About.tsx`, `src/pages/Gear.tsx`, `src/components/ProductCard.tsx`, thang chữ 6 mức và token màu trong `src/index.css`, phông Be Vietnam Pro, chế độ sáng/tối.
- Màu hiện có (giữ): ink `#0B2545`, nền `#F8FAFC`, bề mặt `#FFFFFF`, đường kẻ `#E2E8F0`, nhấn cam `#D95326`; tối: nền `#0E1624`, bề mặt `#152033`, đường kẻ `#233044`.
- Ảnh thật có sẵn trong `public/assets/aistudio/`: máy tính (`casio580vnx`, `casio880`, `vinacal680`, `vinacal680iii`, `flexio_799`), bìa giáo trình (`vldc`, `xstk`, `mangmaytinh`, `lsd`, `maclenin`, `tthcm`, `pldc`), logo (`logo_goc`, `Bi_u_tr_ng_FORUS...`).

## BƯỚC 0. KHẢO SÁT TRƯỚC KHI SỬA (bắt buộc, không đổi code)

1. Đọc `src/App.tsx`, `src/index.css`, `src/pages/*`, `src/components/ProductCard.tsx`. Báo lại trạng thái thật (đừng giả định theo mô tả ở trên).
2. Chạy `npm run build` để biết mốc xuất phát. Chụp màn hình các mục ở 1440px và 390px làm ảnh "trước".
3. Phân loại loại trang theo taste-skill: **`service`** (dịch vụ/cửa hàng tại chỗ). Hệ quả: **không WebGL, không shader, không scroll scene 3D**; trang dựa vào ảnh, chữ sắc nét và màu phẳng. Mục `vip` có giao diện app thật (chat, sơ đồ), dùng **UI thật** chứ không vẽ dashboard giả.
4. Nếu đã cài skill: chạy `node scripts/start.mjs deal --page service` để lấy gợi ý phông/bảng màu và `assets/layout/deal.mjs` để lấy gợi ý bố cục hero. **Chỉ dùng gợi ý khi không mâu thuẫn với ràng buộc bên dưới** (ví dụ phông phải có bộ ký tự `vietnamese`).
5. Làm trên nhánh `redesign-art`, mỗi giai đoạn một commit.

## RÀNG BUỘC KHÔNG ĐƯỢC PHÁ

1. **Giữ nguyên logic nghiệp vụ**: tính giá in, giỏ hàng, voucher, điểm VIP, đăng nhập, chatbot (`forusChatService.ts`, `server.ts`), dữ liệu `src/data/*`. Chỉ đổi giao diện, bố cục, chữ hiển thị.
2. **Không bịa số liệu, giá, địa chỉ, tính năng.** Chỉ dùng số có trong code hoặc tài liệu dự án. Không chắc thì hỏi tôi.
3. Giữ chế độ sáng/tối, giữ chạy được trên GitHub Pages (`base: './'` trong `vite.config.ts`).
4. Không thêm thư viện nặng. Cần thêm gì thì chỉ 1 thư viện nhỏ và nói rõ lý do.
5. Mobile trước (sinh viên quét QR bằng điện thoại): mọi thứ phải đẹp ở **390px** trước, rồi mới nâng lên 768/1024/1440.
6. Sau mỗi giai đoạn: `npm run build` sạch lỗi, `npm run lint` sạch lỗi.

## ĐỊNH HƯỚNG NGHỆ THUẬT: "SỔ TAY PHÒNG THÍ NGHIỆM"

Mỗi sinh viên KHTN đều có một cuốn vở ô ly, mực xanh, lề đỏ. Hãy lấy chính nó làm ngôn ngữ thị giác. Đây là **concept spine** xuyên suốt, và nó khớp logo (cánh buồm + nguyên tử): **cánh buồm là chiếc thuyền giấy gấp từ trang vở ô ly**.

| Yếu tố | Quyết định |
|---|---|
| Concept spine | Tool / dụng cụ chính xác + hồ sơ: trang vở, nhãn mẫu vật, chú thích bên lề, con dấu |
| Theme | Quiet Premium Neutral, nền lạnh `#F8FAFC`; tối = "bản vẽ xanh" `#0E1624` |
| Lưới nền | **Ô ly vẽ bằng CSS** (`linear-gradient` đường 1px `#E2E8F0`, ô 24px), không dùng ảnh. Chỉ hiện ở vài khối, không phủ cả trang |
| Màu nhấn | Cam `#D95326` = **mực đỏ chấm bài / lề vở**. Chỉ dùng cho: đường lề dọc, nút chính, điểm nhấn số. Không dùng làm nền lớn |
| Phông | Một phông serif hiển thị cho tiêu đề lớn + giữ Be Vietnam Pro cho thân. Serif phải có bộ ký tự `vietnamese` trên Google Fonts (gợi ý kiểm tra: Newsreader hoặc Playfair Display). **Bắt buộc test render**: `Thuê máy tính, không cần cọc — ẮẶẲẴỀỂỄỒỔỖỤỮ` |
| Hero Scale | **Mid Editorial** (cân giữa chữ và ảnh, không chiếm hết màn hình) |
| 4 thành phần đặc trưng | (1) **Vertical Rhythm Lines**: đường lề đỏ dọc chạy suốt trang. (2) **Layered Image Crop Frames**: ảnh sản phẩm thật cắt khung chồng lớp. (3) **Off-Grid Editorial Layout**: lệch lưới có kiểm soát ở mục tình huống. (4) **Hover-Accordion Slice Layout**: 3 lối tắt In ấn / Sự kiện / Gia sư |
| 2 chuyển động | (1) Chữ tiêu đề hiện theo dòng khi cuộn. (2) Ảnh trôi chậm hơn nền (parallax nhẹ). Chỉ animate `transform` và `opacity`. Tôn trọng `prefers-reduced-motion` |
| Second-read moment (chỉ 1) | Chiếc **thuyền giấy ô ly** ở hero xuất hiện lại **một lần** nhỏ ở phần kết, làm dấu thương hiệu |
| Dials (từ imagegen-skills) | DESIGN_VARIANCE 7 · VISUAL_DENSITY 4 · ART_DIRECTION 7 · IMPLEMENTATION_CLARITY 9 · IMAGE_USAGE_PRIORITY 8 · SPACING_GENEROSITY 8 · LAYOUT_VARIATION 7 · CONVERSION_DISCIPLINE 9 |

### Quy tắc cứng (rút từ taste-skill 2.5 và imagegen-frontend-web)

- **Chữ đơn giản, ngắn**, mỗi câu dưới 15 chữ. Cấm: "toàn diện", "tối ưu", "thông minh", "đột phá", "giải pháp", "trải nghiệm vượt trội", emoji trang trí. Viết giọng sinh viên: "Thuê Casio, không cần cọc".
- **Một hệ thiết kế**: một họ sans + một serif hiển thị, một bảng màu, một kiểu bo góc (vuông hoặc 4–8px), một kiểu nút chính. Không gradient trang trí, không kính mờ chồng lớp, không thẻ nào cũng bo tròn + đổ bóng.
- **Mỗi section một việc, một màn hình ở desktop 1440×900**, lề trái/phải bằng nhau, khoảng cách giữa các section đều (≥ 96px).
- **Không lặp bố cục**: trong cả trang, ít nhất 3 kiểu neo bố cục khác nhau; không quá 2 section liên tiếp cùng kiểu; hero **không** mặc định chữ trái/ảnh phải.
- **Ảnh có vai trò cấu trúc**, không phải trang trí. Không chú thích dưới ảnh; nguồn/ghi công gom một dòng nhỏ ở chân trang (nếu có).
- **Không** ba cột icon + tiêu đề + 2 dòng chữ giống hệt nhau; **không** thẻ KPI giả; **không** marquee logo.
- Mỗi section có một việc: hook, bằng chứng, giải thích hoặc chốt hành động. Nút chính luôn rõ; nút phụ trông phụ.
- Tương phản chữ ≥ 4.5:1 ở cả sáng và tối. Chữ không nhỏ hơn 12px.

## GIAI ĐOẠN 1. Hệ thống "sổ tay"

- Cập nhật token trong `src/index.css` (`@theme`): thêm token cho lưới ô ly, đường lề đỏ, serif hiển thị. **Không** thêm màu mới ngoài bảng màu ở trên.
- Tạo tiện ích CSS dùng chung: `.paper-grid` (ô ly), `.margin-rule` (lề đỏ dọc), `.stamp` (con dấu chữ nhỏ viền 1px, thay cho huy hiệu pill nhiều màu).
- Dark mode = "bản vẽ xanh": nền `#0E1624`, lưới `#233044`, chữ sáng, cam vẫn là nhấn duy nhất.
- Chuyển nav: điện thoại dùng thanh tab dưới đáy; desktop dùng menu chữ trơn. Đồng bộ `activeTab` với `location.hash` để nút Back/F5 hoạt động.

## GIAI ĐOẠN 2. Trang chủ: 6 section, mỗi section một ảnh thiết kế

Dùng ảnh comp ở chặng 1 làm chuẩn bố cục (nếu có). Nếu chưa có, bám bảng này. Vì mỗi section là **một màn hình riêng**, hãy tạo component riêng cho từng section.

| # | Section | Việc | Neo bố cục | Chế độ nền | Kiểu nút |
|---|---|---|---|---|---|
| 1 | **Hero** | Hook: nêu giá trị trong 3 giây | Chữ góc trái dưới, đè lên ảnh (image-as-canvas) | Ảnh minh họa full-bleed + lớp phủ tông navy | Nút chính đặc + liên kết gạch chân có mũi tên |
| 2 | **Học cụ cho tuần thi** | Bằng chứng + bán hàng: 4 `ProductCard` ảnh thật | Dẫn đầu góc trái trên, phụ chú phải dưới | Nền phẳng + lưới ô ly mờ | Liên kết gạch chân "Xem tất cả" |
| 3 | **Ba tình huống** | Giải thích: 3 cảnh ngắn (thi, nộp bài, hạn ĐRL) | Lệch lưới kiểu tạp chí | Hai khối màu cạnh nhau (giấy / navy) | Chữ lớn, gợi ý nút nhỏ |
| 4 | **Ba lối tắt** | Điều hướng: In ấn, Sự kiện, Gia sư | Ba lát cắt đứng, rê chuột thì giãn ra (điện thoại: xếp dọc) | Mỗi lát một ảnh minh họa cùng phong cách | Nút là chú thích dưới lát |
| 5 | **Trợ lý AI & sơ đồ CS1** | Bằng chứng sản phẩm: UI chat + sơ đồ tầng thật | Chữ ba-phần-một bên phải, UI hai-phần-ba bên trái | Nền "bản vẽ xanh" (tối) | Nút viền (ghost) |
| 6 | **Kết** | Chốt: đăng nhập, tích điểm VIP | Căn giữa xếp chồng, tối giản, nhiều khoảng trắng | Nền phẳng, thuyền giấy nhỏ (second-read) | Nút chính duy nhất |

**Chữ gợi ý (sửa theo giọng nhóm, giữ ngắn, không bịa số):**

- Hero H1: **"Tiện ích trong tay, học hay mỗi ngày"**. Phụ đề: "Thuê học cụ, in tài liệu, săn điểm rèn luyện. Ngay tại Cơ sở 1." Nút: "Xem học cụ" · "Câu chuyện FORUS".
- Mục 2 tiêu đề: "Học cụ cho tuần thi". Dùng giá thật từ `forusData.ts` (ví dụ máy tính thuê 15.000đ/ngày, áo blouse 15.000đ/buổi, TechRescue 20.000đ/buổi).
- Mục 3: "Mai thi, máy tính hết pin." / "Sáng nộp, poster A1 chưa in." / "Form đóng sau 2 giờ."
- Mục 5: "Hỏi AI giải Vi tích phân. Tìm phòng học từ B1 đến L11."
- Mục 6: "Đăng nhập, tích điểm VIP, đổi voucher."

`ProductCard`: chỉ **ảnh lớn, tên 1 dòng, giá "từ xxx đ", nhãn Thuê/Mua**. Cả thẻ là vùng bấm, mở `ProductDetailModal`.

## GIAI ĐOẠN 3. Giới thiệu và Thuê & Bán

- **About**: giữ đủ nội dung cũ (sứ mệnh, FAQ, liên hệ), kể thành các "trang vở" cuộn dọc. Mỗi chương một màn hình, chú thích bên lề như ghi chú tay, đường lề đỏ nối các chương. Cuộn ghim (sticky) cho phần giải thích dịch vụ.
- **Gear**: tiêu đề kiểu tạp chí, lưới 2 cột (điện thoại) / 3–4 cột (desktop), ảnh cùng tỉ lệ. Rê chuột chỉ đổi nhẹ ảnh. Bộ lọc dạng chữ gạch chân, không nút pill nhiều màu.

## GIAI ĐOẠN 4. Các mục chức năng (nghệ thuật vừa phải, không làm hại độ rõ)

- **Events**: số đếm ngược cỡ rất lớn (serif), hạn gần dùng `.stamp` cam. Dữ liệu từ `hcmusEventsData.ts`.
- **Tutor**: hồ sơ gia sư như **thẻ sinh viên** (khung vuông, ảnh, mã xác thực), không card bo tròn đổ bóng.
- **VIP**: sơ đồ tầng B1–L11 vẽ như **bản vẽ kiến trúc nét mảnh**; chat AI giữ UI thật.
- **Print**: chức năng là chính. Chỉ áp phông, màu, lưới; giữ nguyên logic. Thanh tạm tính cố định dưới màn hình; Bước 1 → Bước 2 trong cùng trang.

## GIAI ĐOẠN 5. Ảnh và hiệu năng

- Đặt ảnh AI vào `public/assets/art/` (tên theo Phần B3). WebP, `loading="lazy"`, có `width`/`height`. **Ảnh hero ≤ 300KB**, ảnh khác ≤ 150KB.
- Ảnh thật của sản phẩm: chỉ cắt, căn tỉ lệ, đồng nhất nền. **Không để AI vẽ lại sản phẩm.**
- Thêm trạng thái tải (skeleton) cho ảnh sản phẩm.

## GIAI ĐOẠN 6. Kiểm tra trong trình duyệt thật (bắt buộc)

- Chạy dev server, chụp ở **1440, 1024, 768, 390px**, cả sáng và tối.
- Nếu đã cài taste-skill: `node scripts/consistency.mjs <url> --page service` và `node scripts/shoot.mjs`. Bộ kiểm tra viết cho trang HTML thuần, với SPA có thể báo nhầm; hãy xử lý các lỗi thật (tràn ngang, tương phản, lệch lề, ảnh rỗng, chữ giữ chỗ) và giải thích mục nào bỏ qua và vì sao.
- Kiểm tra Lighthouse trên điện thoại; bật `prefers-reduced-motion` để xác nhận hiệu ứng tắt.

## TIÊU CHÍ NGHIỆM THU

- [ ] Chỉ 1 họ sans + 1 serif hiển thị; chữ không nhỏ hơn 12px; serif hiển thị đúng đủ dấu tiếng Việt.
- [ ] Bảng màu không thêm màu mới; cam chỉ ở lề, nút chính, điểm nhấn.
- [ ] Trang chủ đủ 6 section, mỗi section một màn hình, ít nhất 3 kiểu neo bố cục, hero không phải chữ-trái/ảnh-phải theo thói quen.
- [ ] Ảnh sản phẩm và khuôn viên là ảnh thật; ảnh AI chỉ là minh họa, không có chữ nhúng, không logo giả.
- [ ] Không số liệu bịa; giá khớp `forusData.ts`.
- [ ] Giỏ hàng, voucher, điểm VIP, đăng nhập, chatbot, tính giá in hoạt động y như cũ (so 3 ca in: 50 trang A4 đen trắng 2 bản bấm kim; A1 một bản; A3 hai mặt màu).
- [ ] `npm run build` và `npm run lint` sạch; không tràn ngang ở 390px; tương phản ≥ 4.5:1.

## CÁCH BÁO CÁO

Sau mỗi giai đoạn: liệt kê file đã đổi, ảnh trước/sau, và những chỗ **không chắc** cần tôi quyết (chọn phông, chọn ảnh hero, số liệu). Không tự ý đổi logic tính giá hay dữ liệu.

---

# PHẦN B. PROMPT TẠO ẢNH (chặng 1 và 2)

**Lưu ý quan trọng khi dùng AI tạo ảnh:**

- Dán **B1 (khối phong cách)** ở đầu mỗi lần tạo để các ảnh cùng một "thế giới". Trong ChatGPT Images/Gemini, làm trong **cùng một cuộc trò chuyện** và nói "dùng ảnh đầu tiên làm tham chiếu phong cách".
- AI hay viết sai dấu tiếng Việt. **Ảnh comp chỉ dùng để chốt bố cục, màu, nhịp.** Chữ thật do code render. Đừng đưa ảnh có chữ AI vẽ lên web.
- Prompt viết tiếng Anh để máy hiểu tốt hơn; chuỗi chữ hiển thị trong comp giữ tiếng Việt.

## B1. KHỐI PHONG CÁCH CHUNG (dán trước mọi prompt)

```text
You are an elite frontend image art director. Generate a premium website design reference, not generic AI art.

BRAND WORLD: "Lab notebook". FORUS is a student utility service at a science university in Ho Chi Minh City. Visual language: pale blue graph-paper grid, blue ink, a vertical red margin line like a Vietnamese school notebook, small stamp-like labels, hand margin notes. Calm, intelligent, warm, slightly playful. Never corporate-stock.

PALETTE (use only these): ink navy #0B2545, paper #F8FAFC, white #FFFFFF, grid line #E2E8F0, single accent vermilion #D95326 (red-pen ink, used sparingly), dark mode blueprint #0E1624 with surface #152033. No other hues except natural photo/illustration tones that stay inside this palette.

TYPE: one high-contrast editorial serif for big headlines + one clean humanist sans for body. Tight tracking, strong scale contrast, short headlines (3-10 words). Vietnamese text must be exact where given.

RULES: horizontal 16:9 frame. ONE section per image. Generous whitespace, even section padding, equal left and right margins. Image-led, with a clear implementable layout (a developer must be able to code it from the image). Subtle professional tonal gradients only.

BAN LIST: purple/blue AI gradients, glowing orbs, floating blobs, glassmorphism stacks, robots or glowing brains, neon, fake logos or brand names, stock photos of smiling students, three identical icon-title-text columns, fake KPI cards, logo marquees, gradient text, emoji, tiny unreadable text, cluttered dashboards.
```

## B2. ẢNH COMP BỐ CỤC: 6 ảnh, mỗi section một ảnh ngang (chặng 1)

Gửi lần lượt từng prompt, sau khối B1. Đặt tên file: `comp-01-hero.png` ... `comp-06-closing.png`.

**Section 1 of 6: Hero (Mid Editorial, image-as-canvas)**

```text
Section 1 of 6: HERO of a student-utility website. 16:9.
Full-bleed editorial illustration of an overhead student desk on pale blue graph paper, with a sailboat folded from graph paper at the center-right, a small atom symbol drawn in blue ink on its sail. Around it: a hand-drawn integral and a few margin notes, a scientific calculator silhouette (generic, no brand), a rolled poster tube, a folded lab-coat sleeve. A thin vertical red margin line runs down the left third. Soft navy tonal overlay at the bottom-left for text legibility.
Layout: headline in the bottom-left safe area, large serif, exact text: "Tiện ích trong tay, học hay mỗi ngày". Under it one short line, exact: "Thuê học cụ, in tài liệu, săn điểm rèn luyện. Ngay tại Cơ sở 1." Primary solid vermilion button "Xem học cụ" and a quiet underlined link "Câu chuyện FORUS →". Slim top navigation with a small logo placeholder and 6 plain text links. NOT a left-text/right-image split. Mid-scale hero, lots of negative space.
```

**Section 2 of 6: Học cụ cho tuần thi (4 product cards)**

```text
Section 2 of 6: FEATURED GEAR. 16:9. Paper background with a faint graph-paper grid.
Top-left: serif headline, exact: "Học cụ cho tuần thi". Bottom-right: small underlined link "Xem tất cả →".
Four product cards in layered, slightly offset image-crop frames: a scientific calculator, a white lab coat, a USB-C hub with a wireless mouse, a thick calculus textbook. Each card is ONLY a large photo, a one-line name and a price line like "Thuê từ 15.000đ". Small square stamp label "THUÊ" or "MUA" in vermilion outline. Square or 4-8px corners, hairline borders, no shadows, no badges.
```

**Section 3 of 6: Ba tình huống (off-grid editorial, diptych)**

```text
Section 3 of 6: THREE SITUATIONS. 16:9. Color-blocked diptych: left field paper white, right field navy #0B2545, meeting with a hard vertical edge.
Three short scenes set off-grid, magazine style, each with one big serif line and one tiny support line, exact texts: "Mai thi, máy tính hết pin." / "Sáng nộp, poster A1 chưa in." / "Form đóng sau 2 giờ."
Each has a small ink-line illustration (a dead calculator, an A1 sheet on a tube, a countdown clock). Vermilion margin line and tiny handwritten margin notes. Asymmetric, confident, plenty of whitespace.
```

**Section 4 of 6: Ba lối tắt (hover-accordion slices)**

```text
Section 4 of 6: THREE SHORTCUTS as three tall vertical slices that imply a hover-accordion: the middle slice expanded wide, the other two narrow. Each slice is a full-height ink-and-flat-color illustration in the same style: (1) printing: large sheet and poster tube, (2) events: a bulletin board with a countdown, (3) tutoring: two chairs and a blackboard with a formula.
Labels at the slice bottom as plain serif words, exact: "In ấn", "Sự kiện", "Gia sư", each with a thin arrow. Thin vertical rhythm lines. No cards, no icons grid.
```

**Section 5 of 6: Trợ lý AI & sơ đồ CS1 (blueprint dark)**

```text
Section 5 of 6: AI ASSISTANT + CAMPUS MAP on dark blueprint background #0E1624 with a faint grid #233044. 16:9.
Right third: caption in a light serif, exact: "Hỏi AI giải Vi tích phân. Tìm phòng học từ B1 đến L11." plus a ghost (outlined) button "Mở trợ lý".
Left two-thirds: a believable chat UI panel showing a math question and a worked answer with a rendered formula, stacked slightly over a thin-line architectural floor-plan drawing of a university building with floor labels B1 to L11. Real-looking UI, not a fake analytics dashboard. Vermilion used only for one highlight.
```

**Section 6 of 6: Kết (mini minimalist closing)**

```text
Section 6 of 6: CLOSING, mini minimalist. 16:9. Mostly negative space on flat paper #F8FAFC.
Stacked center: a tiny folded graph-paper sailboat with an atom on its sail, then one serif line, exact: "Đăng nhập, tích điểm VIP, đổi voucher.", then ONE solid vermilion button "Đăng nhập sinh viên". Footer line in small sans: "227 Nguyễn Văn Cừ, Quận 5". Nothing else.
```

## B3. ẢNH MINH HỌA DÙNG THẬT TRÊN WEB (chặng 2)

Dán B1 trước, bỏ câu "ONE section per image" và thêm **"No text, no letters, no logos in the image"**. Xuất ảnh, nén sang WebP (hero ≤ 300KB, còn lại ≤ 150KB).

| File | Dùng ở | Tỉ lệ | Prompt (sau B1) |
|---|---|---|---|
| `hero-desk.webp` | Hero trang chủ | 21:9, vùng chữ góc trái dưới phải thoáng | `Overhead editorial illustration of a student desk on pale blue graph paper: a sailboat folded from graph paper with an atom drawn in blue ink on its sail, hand-drawn integral and margin notes, a generic scientific calculator silhouette, a rolled poster tube. Flat colors with fine ink linework, vermilion used only as a thin margin line and one small accent. Calm, large empty area at bottom-left. No text, no letters, no logos.` |
| `slice-print.webp` | Lối tắt "In ấn" | 3:5 dọc | `Tall vertical ink-and-flat-color illustration: a large A1 sheet unrolling from a poster tube beside a small printer, on graph paper. Same palette and line style as the hero. No text.` |
| `slice-events.webp` | Lối tắt "Sự kiện" | 3:5 dọc | `Tall vertical ink-and-flat-color illustration: a campus bulletin board with pinned event sheets and a large analog countdown clock. Same style. No text.` |
| `slice-tutor.webp` | Lối tắt "Gia sư" | 3:5 dọc | `Tall vertical ink-and-flat-color illustration: two chairs facing a small blackboard with an abstract curve and axes, no readable symbols. Same style. No text.` |
| `about-sail.webp` | Hero trang Giới thiệu | 16:9 | `Macro close-up of a paper sailboat folded from graph paper with a tiny hand-drawn atom on its sail, resting on a blue-ink notebook page with a red margin line. Shallow depth, tonal navy grade. No text.` |
| `empty-cart.webp` | Giỏ hàng trống | 1:1 | `Small ink-line illustration of an empty open notebook with a red margin line and a tiny paper boat. Mostly white. No text.` |

**Nếu muốn ảnh khuôn viên thật:** đừng nhờ AI vẽ. Nhóm tự chụp tại 227 Nguyễn Văn Cừ (giờ vàng, không có người rõ mặt), chỉnh tông navy nhẹ. Nếu chưa có ảnh thật, dùng minh họa và **không** gọi nó là ảnh khuôn viên.

## B4. ĐƯA ẢNH COMP CHO AI VIẾT CODE

Sau khi có đủ 6 ảnh comp, quay lại Claude Code / Cursor và nói:

```text
Đây là 6 ảnh comp cho trang chủ FORUS (comp-01..06). Hãy phân tích từng ảnh: lưới, khoảng cách, thang chữ, cách xử lý ảnh, nút. Sau đó dựng lại từng section bằng React + Tailwind v4 theo Phần A, bám bố cục trong ảnh nhưng dùng chữ thật, ảnh thật cho sản phẩm và giữ nguyên logic. Không copy lỗi chính tả hay dấu tiếng Việt sai trong ảnh. Làm từng section một, build và chụp ở 390px và 1440px sau mỗi section.
```
