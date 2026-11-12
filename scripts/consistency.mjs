#!/usr/bin/env node
/**
 * FORUS Design & Service Consistency Checker (scripts/consistency.mjs)
 * Usage: node scripts/consistency.mjs [target] --page service
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const pageTypeIdx = args.indexOf("--page");
const pageType = pageTypeIdx !== -1 ? args[pageTypeIdx + 1] : "service";

const rootDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const indexCss = fs.readFileSync(path.join(rootDir, "src/index.css"), "utf8");
const aboutTsx = fs.readFileSync(path.join(rootDir, "src/pages/About.tsx"), "utf8");
const appTsx = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");

const checks = [
  {
    id: "PAGE_CLASSIFICATION",
    label: `Phân loại trang '--page ${pageType}' (calm, không dùng WebGL/Three.js)`,
    pass:
      pageType === "service" &&
      !aboutTsx.includes("WebGLRenderer") &&
      !aboutTsx.includes("three"),
  },
  {
    id: "VIETNAMESE_GOOGLE_FONTS",
    label: "Cặp Google Fonts hỗ trợ tiếng Việt đầy đủ (Space Grotesk + Be Vietnam Pro)",
    pass:
      indexHtml.includes("Space+Grotesk") &&
      indexHtml.includes("Be+Vietnam+Pro") &&
      indexCss.includes("'Space Grotesk'") &&
      indexCss.includes("'Be Vietnam Pro'"),
  },
  {
    id: "WARM_TEAL_PALETTE",
    label: "Hệ màu thống nhất: Nền sáng ấm (#FAF8F5) + Màu nhấn Xanh Teal KHTN (#0D9488)",
    pass:
      indexCss.includes("#FAF8F5") &&
      indexCss.includes("#0D9488") &&
      aboutTsx.includes("#0D9488"),
  },
  {
    id: "HERO_ONE_SCREEN_AND_CTAS",
    label: 'Hero 1 màn hình: khẩu hiệu "Tiện ích trong tay, học hay mỗi ngày" + CTA chính "Khám phá tiện ích" + CTA phụ',
    pass:
      aboutTsx.includes("Tiện ích trong tay, học hay mỗi ngày") &&
      aboutTsx.includes("Khám phá tiện ích") &&
      aboutTsx.includes("Liên hệ và FAQ") &&
      aboutTsx.includes("min-h-[calc(100vh-5rem)]"),
  },
  {
    id: "ASYMMETRIC_SERVICE_BLOCKS",
    label: "Các khối dịch vụ thay đổi nhịp & kích thước (lg:col-span-7 / lg:col-span-5), có icon SVG thật, mô tả 1 dòng và nút hành động",
    pass:
      aboutTsx.includes("lg:col-span-7") &&
      aboutTsx.includes("lg:col-span-5") &&
      aboutTsx.includes("<svg") &&
      aboutTsx.includes("Mở quầy học cụ") &&
      aboutTsx.includes("Đặt in ngay") &&
      aboutTsx.includes("Xem sự kiện") &&
      aboutTsx.includes("Tìm lớp &amp; gia sư"),
  },
  {
    id: "AI_LIGHT_INTERACTIVE_MOMENT",
    label: "Khu vực Trợ lý AI có khoảnh khắc tương tác nhẹ (chọn câu hỏi mẫu Toán KaTeX, Code C++, Sơ đồ phòng học)",
    pass:
      aboutTsx.includes("AI_DEMO_SAMPLES") &&
      aboutTsx.includes("setSelectedAiSampleId") &&
      aboutTsx.includes("setSelectedBuildingCode"),
  },
  {
    id: "ALIGNED_LEFT_RIGHT_MARGINS",
    label: "Mỗi section một màn hình ở desktop và thẳng lề trái/phải (max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16)",
    pass:
      (aboutTsx.match(/max-w-\[1440px\] mx-auto px-5 sm:px-10 lg:px-16/g) || [])
        .length >= 5 &&
      appTsx.includes("max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16"),
  },
  {
    id: "STICKY_HEADER_AND_COMPACT_FOOTER",
    label: "Thanh điều hướng cố định (fixed/sticky top-0) và Footer gọn có thông tin liên hệ + mạng xã hội",
    pass:
      (appTsx.includes("fixed top-0") || appTsx.includes("sticky top-0")) &&
      appTsx.includes("<footer") &&
      appTsx.includes("Facebook KHTN") &&
      appTsx.includes("GitHub FORUS"),
  },
  {
    id: "MOBILE_FIRST_AND_REDUCED_MOTION",
    label: "Mobile-first: cỡ chữ cơ sở >= 16px, nút chạm >= 44px, chống cuộn ngang (overflow-x-clip) và tôn trọng prefers-reduced-motion",
    pass:
      indexCss.includes("font-size: 16px") &&
      (indexCss.includes("overflow-x: clip") ||
        indexCss.includes("overflow-x: hidden")) &&
      indexCss.includes("prefers-reduced-motion: reduce") &&
      aboutTsx.includes("min-h-[48px]") &&
      aboutTsx.includes("min-h-[44px]") &&
      aboutTsx.includes("useReducedMotion"),
  },
];

console.log(`\n=== FORUS CONSISTENCY CHECKER (--page ${pageType}) ===`);
let failCount = 0;
for (const c of checks) {
  if (c.pass) {
    console.log(`[PASS] ${c.id}: ${c.label}`);
  } else {
    console.error(`[FAIL] ${c.id}: ${c.label}`);
    failCount++;
  }
}

console.log("------------------------------------------------------");
console.log(
  `Tổng kết: ${checks.length - failCount}/${checks.length} PASS · ${failCount} FAIL`
);

if (failCount > 0) {
  process.exit(1);
}
