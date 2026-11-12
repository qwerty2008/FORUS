#!/usr/bin/env node
/**
 * FORUS Real SVG Icon Registry & Validator (scripts/icons.mjs)
 * Provides clean stroke SVG paths for FORUS campus service categories.
 */

export const FORUS_SERVICE_ICONS = {
  gear: {
    name: "scientific-calculator",
    label: "Thuê & Bán Thiết Bị Học Tập",
    viewBox: "0 0 24 24",
    paths: [
      'rect x="4" y="2" width="16" height="20" rx="2"',
      'line x1="8" y1="6" x2="16" y2="6"',
      'line x1="16" y1="14" x2="16" y2="18"',
    ],
  },
  print: {
    name: "instant-print-station",
    label: "In Tài Liệu Lấy Liền & Poster Đồ Án",
    viewBox: "0 0 24 24",
    paths: [
      'polyline points="6 9 6 2 18 2 18 9"',
      'path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"',
      'rect x="6" y="14" width="12" height="8"',
    ],
  },
  events: {
    name: "live-countdown-clock",
    label: "Săn Điểm Rèn Luyện HCMUS",
    viewBox: "0 0 24 24",
    paths: [
      'circle cx="12" cy="13" r="8"',
      'path d="M12 9v4l2 2"',
    ],
  },
  tutor: {
    name: "academic-graduation-cap",
    label: "Kết Nối Gia Sư Tự Nhiên",
    viewBox: "0 0 24 24",
    paths: [
      'path d="M22 10v6M2 10l10-5 10 5-10 5z"',
      'path d="M6 12v5c3 3 9 3 12 0v-5"',
    ],
  },
  vipAi: {
    name: "vip-star-ai",
    label: "Kho Điểm VIP, Đổi Voucher & Trợ Lý Học Thuật",
    viewBox: "0 0 24 24",
    paths: [
      'path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"',
    ],
  },
};

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("=== FORUS Real SVG Icon Registry ===");
  for (const [key, icon] of Object.entries(FORUS_SERVICE_ICONS)) {
    console.log(`[OK] ${key.padEnd(8)} -> ${icon.name} (${icon.label})`);
  }
}
