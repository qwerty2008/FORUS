import React, { useState, useEffect } from "react";
import {
  Utensils,
  Printer,
  GraduationCap,
  ShoppingBag,
  Crown,
  Info,
  ShoppingCart,
  Sun,
  Moon,
  Sparkles,
  UserCheck,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  Flame,
  Building2,
  Zap,
  ShieldCheck,
  Menu,
  X,
  QrCode,
  Copy,
  Check,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import {
  BRAND_ASSETS,
  CAMPUS_BUILDINGS_CS1,
  GEAR_AND_RENTAL_PRODUCTS,
  BREAKFAST_AND_DRINK_MENU,
} from "./data/forusData";
import {
  ActiveTab,
  CartItem,
  OrderReceipt,
  PricingVariant,
  PrintOrderConfig,
  ProductItem,
  ProductReview,
  StudentProfile,
  ThemeMode,
} from "./types";
import { StudentAuthModal } from "./components/StudentAuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { ProductVisual } from "./components/ProductVisual";
import { PrintConfigurator } from "./components/PrintConfigurator";
import { TutorHub } from "./components/TutorHub";
import { VipHub } from "./components/VipHub";
import { AboutAndContactView } from "./components/AboutAndContactView";

const DELIVERY_TIME_SLOTS = [
  "07:00 - 07:25 (Trước tiết 1)",
  "09:15 - 09:35 (Giải lao ca sáng)",
  "11:30 - 12:15 (Nghỉ trưa tại lớp/thư viện)",
  "14:45 - 15:05 (Giải lao ca chiều)",
];

const HCMUS_FACULTIES = [
  "Khoa Công nghệ Thông tin (FIT)",
  "Khoa Toán - Tin học",
  "Khoa Vật lý - Vật lý Kỹ thuật",
  "Khoa Điện tử - Viễn thông",
  "Khoa Hóa học",
  "Khoa Sinh học - Công nghệ Sinh học",
  "Khoa Khoa học và Công nghệ Vật liệu",
  "Khoa Môi trường",
  "Khoa Địa chất",
];

const INITIAL_STUDENT: StudentProfile = {
  isLoggedIn: true,
  email: "24120001@student.hcmus.edu.vn",
  studentId: "24120001",
  fullName: "Nguyễn Minh Khoa",
  faculty: "Khoa Công nghệ Thông tin (FIT)",
  points: 65,
  pointHistory: [
    {
      id: "pt-init-1",
      action: 'Thuê Combo "iPad Sinh Viên" (1 tuần)',
      points: 10,
      timestamp: "Hôm qua, 08:30",
    },
    {
      id: "pt-init-2",
      action: "Đặt Bánh mì ốp la + Cà phê muối giao phòng I.42",
      points: 10,
      timestamp: "Hôm nay, 07:10",
    },
  ],
  remindedEventIds: ["evt-ai-hackathon-2026"],
  eventPersonalNotes: {},
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("forus_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("forus_student_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STUDENT;
      }
    }
    return INITIAL_STUDENT;
  });

  const [gearProducts, setGearProducts] = useState<ProductItem[]>(
    GEAR_AND_RENTAL_PRODUCTS
  );
  const [foodProducts, setFoodProducts] = useState<ProductItem[]>(
    BREAKFAST_AND_DRINK_MENU
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // Quick account edit state inside Menu Drawer
  const [editName, setEditName] = useState(student.fullName);
  const [editStudentId, setEditStudentId] = useState(student.studentId);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editFaculty, setEditFaculty] = useState(student.faculty);
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Filters & Selections
  const [foodFilter, setFoodFilter] = useState<"all" | "food" | "drink">("all");
  const [selectedBuilding, setSelectedBuilding] = useState(
    CAMPUS_BUILDINGS_CS1[0]
  );
  const [selectedRoomCode, setSelectedRoomCode] = useState("Phòng I.42");
  const [selectedSlot, setSelectedSlot] = useState(DELIVERY_TIME_SLOTS[0]);

  const [gearFilter, setGearFilter] = useState<
    "all" | "tech-gear" | "study-aid" | "rental"
  >("all");
  const [selectedVariantMap, setSelectedVariantMap] = useState<
    Record<string, string>
  >({});

  // Sync dark mode class on <html> and <body>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("forus_theme", "dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("forus_theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("forus_student_profile", JSON.stringify(student));
    setEditName(student.fullName);
    setEditStudentId(student.studentId);
    setEditEmail(student.email);
    setEditFaculty(student.faculty);
  }, [student]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const earnPoints = (pointsToAdd: number, reason: string) => {
    setStudent((prev) => {
      const nextPoints = prev.points + pointsToAdd;
      const unlockedVipNow = prev.points < 100 && nextPoints >= 100;
      if (unlockedVipNow) {
        showToast(
          `🎉 Chúc mừng! Bạn đạt ${nextPoints} điểm và mở khóa Đặc quyền VIP FORUS!`
        );
      } else {
        showToast(`✨ +${pointsToAdd} điểm tích lũy: ${reason}`);
      }
      return {
        ...prev,
        points: nextPoints,
        pointHistory: [
          {
            id: "pt-" + Date.now(),
            action: reason,
            points: pointsToAdd,
            timestamp: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev.pointHistory,
        ],
      };
    });
  };

  const handleActivateDemoVip = () => {
    setStudent((prev) => {
      const targetPoints = Math.max(prev.points, 100);
      const added = Math.max(100 - prev.points, 10);
      return {
        ...prev,
        isLoggedIn: true,
        points: targetPoints,
        pointHistory: [
          {
            id: "pt-vip-" + Date.now(),
            action: "Kích hoạt Demo VIP 100 điểm (Trình bày Đồ án 1)",
            points: added,
            timestamp: "Vừa xong",
          },
          ...prev.pointHistory,
        ],
      };
    });
    setActiveTab("vip");
    setIsMenuOpen(false);
    showToast(
      "👑 Đã kích hoạt 100/100 điểm VIP! Mở khóa Săn Điểm Rèn Luyện & Chatbot AI."
    );
  };

  const handleSaveInlineAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedEmail = editEmail.includes("@")
      ? editEmail.trim()
      : `${editStudentId.trim()}@student.hcmus.edu.vn`;

    setStudent((prev) => ({
      ...prev,
      isLoggedIn: true,
      fullName: editName.trim() || "Sinh viên KHTN",
      studentId: editStudentId.trim() || "24120001",
      email: formattedEmail,
      faculty: editFaculty,
    }));
    setIsEditingAccount(false);
    showToast("✅ Đã lưu thiết lập tài khoản sinh viên!");
  };

  const handleAddProductToCart = (
    product: ProductItem,
    variant?: PricingVariant,
    customMeta?: string
  ) => {
    const chosenVariant =
      variant ||
      product.variants.find((v) => v.id === selectedVariantMap[product.id]) ||
      product.variants[0];

    const cartItemId = `${product.id}-${chosenVariant.id}-${customMeta || "std"}`;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          variantLabel: `${chosenVariant.label} (${chosenVariant.unitLabel})`,
          price: chosenVariant.price,
          quantity: 1,
          pointsReward: product.pointsReward,
          categoryLabel:
            product.category === "food" || product.category === "drink"
              ? "Đồ ăn sáng & Nước"
              : chosenVariant.type === "rent"
              ? "Thuê thiết bị / Học cụ"
              : "Mua thiết bị / Phụ kiện",
          customMeta,
          imageUrl: product.imageUrl,
        },
      ];
    });

    showToast(
      `🛒 Đã thêm "${product.name}" vào giỏ (+${product.pointsReward}đ khi hoàn tất)`
    );
  };

  const handleAddPrintToCart = (
    config: PrintOrderConfig,
    calculatedPrice: number,
    pointsEarned: number
  ) => {
    const cartItemId = `print-${config.paperSize}-${Date.now()}`;
    setCart((prev) => [
      ...prev,
      {
        cartItemId,
        productId: "forus-print-service",
        name: `In ấn tài liệu: ${config.fileName}`,
        variantLabel: `Khổ ${config.paperSize} • ${
          config.colorMode === "color" ? "In màu" : "Trắng đen"
        } • ${config.copies} bản`,
        price: calculatedPrice,
        quantity: 1,
        pointsReward: pointsEarned,
        categoryLabel: "Dịch vụ In ấn A1–A5",
        customMeta: `Nhận tại: ${config.pickupLocation}`,
      },
    ]);
    setIsCartOpen(true);
    showToast(
      `🖨️ Đã thêm đơn in khổ ${config.paperSize} vào giỏ (+${pointsEarned}đ)`
    );
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleCompleteOrder = (receipt: OrderReceipt) => {
    earnPoints(
      receipt.earnedPoints,
      `Thanh toán đơn #${receipt.orderId} (${receipt.deliveryLocation})`
    );
    setCart([]);
  };

  const handleAddReview = (productId: string, review: ProductReview) => {
    const updateList = (list: ProductItem[]) =>
      list.map((p) =>
        p.id === productId ? { ...p, reviews: [review, ...p.reviews] } : p
      );
    setGearProducts((prev) => updateList(prev));
    setFoodProducts((prev) => updateList(prev));
    setSelectedProduct((prev) =>
      prev && prev.id === productId
        ? { ...prev, reviews: [review, ...prev.reviews] }
        : prev
    );
    earnPoints(5, "Đánh giá chất lượng sản phẩm FORUS");
  };

  const handleToggleEventReminder = (eventId: string, eventTitle: string) => {
    setStudent((prev) => {
      const exists = prev.remindedEventIds.includes(eventId);
      const nextIds = exists
        ? prev.remindedEventIds.filter((id) => id !== eventId)
        : [...prev.remindedEventIds, eventId];
      showToast(
        exists
          ? `🔕 Đã tắt nhắc hẹn sự kiện: ${eventTitle}`
          : `🔔 Đã bật nhắc hẹn trước hạn đăng ký: ${eventTitle}`
      );
      return {
        ...prev,
        remindedEventIds: nextIds,
      };
    });
  };

  const handleSaveEventNote = (eventId: string, note: string) => {
    setStudent((prev) => ({
      ...prev,
      eventPersonalNotes: {
        ...prev.eventPersonalNotes,
        [eventId]: note,
      },
    }));
    showToast("📝 Đã lưu ghi chú cá nhân cho sự kiện Điểm Rèn Luyện!");
  };

  const appOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://forus-hcmus.edu.vn";
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    `${appOrigin}/?sv=${student.studentId}`
  )}`;

  const handleCopyQrLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${appOrigin}/?sv=${student.studentId}`);
      setCopiedQrLink(true);
      showToast("📋 Đã sao chép đường dẫn QR Sinh Viên FORUS!");
      setTimeout(() => setCopiedQrLink(false), 2500);
    }
  };

  const isDark = theme === "dark";
  const currentPoints = student.points;
  const isVip = currentPoints >= 100;
  const progressPercent = Math.min(100, Math.round((currentPoints / 100) * 100));
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: "home",
      label: "Trang chủ",
      shortLabel: "Trang chủ",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "food",
      label: "Ăn sáng & Nước",
      shortLabel: "Ăn sáng",
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: "print",
      label: "In ấn A1–A5",
      shortLabel: "In ấn",
      icon: <Printer className="w-4 h-4" />,
    },
    {
      id: "tutor",
      label: "Cò Gia Sư",
      shortLabel: "Gia sư",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "gear",
      label: "Thuê & Bán",
      shortLabel: "Thuê/Bán",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: "vip",
      label: "Đặc quyền VIP",
      shortLabel: "VIP 100đ",
      icon: <Crown className="w-4 h-4" />,
      badge: isVip ? "VIP" : `${currentPoints}/100`,
    },
    {
      id: "about",
      label: "Liên hệ",
      shortLabel: "Liên hệ",
      icon: <Info className="w-4 h-4" />,
    },
  ];

  const filteredFoodList = foodProducts.filter((item) =>
    foodFilter === "all" ? true : item.category === foodFilter
  );

  const filteredGearList = gearProducts.filter((item) =>
    gearFilter === "all" ? true : item.category === gearFilter
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "dark bg-slate-900 text-slate-100"
          : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-3 left-3 sm:left-auto sm:right-6 z-50 max-w-md bg-slate-800 dark:bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-emerald-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            {toastMessage}
          </p>
        </div>
      )}

      {/* Sticky Top Header: Logo + Service Tabs on Top Bar + [Sun/Moon Icon | Cart | Menu] */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-b border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-2xs">
        <div className="max-w-[1420px] mx-auto px-3 sm:px-6">
          {/* Primary Top Row */}
          <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: FORUS Brand Logo */}
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2 text-left group shrink-0 cursor-pointer"
            >
              <img
                src={isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight}
                alt="FORUS Logo"
                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>

            {/* Center: Service Navigation Items directly on the top bar (Desktop/Large Tablet) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center overflow-x-auto px-2">
              {navItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 xl:px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-blue-700 dark:bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : isVip
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-300"
                            : "bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-sky-300"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: [Icon-only Sun/Moon] -> [Cart] -> [Menu Button] */}
            <div className="flex items-center gap-2 shrink-0">
              {/* 1. Icon-only Light/Dark Mode Toggle (Left of Cart) */}
              <button
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                aria-label="Đổi chế độ Sáng / Tối"
                title={
                  isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"
                }
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer shadow-2xs ${
                  isDark
                    ? "bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border-amber-400/40"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-700" />
                )}
              </button>

              {/* 2. Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 sm:px-4 h-10 rounded-xl bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-700/20 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-800 font-mono font-extrabold text-[11px]">
                  {totalCartItems}
                </span>
              </button>

              {/* 3. Menu Button (Next to Cart: Account Settings, VIP Status, Points, QR Code) */}
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Mở Menu Tài khoản, VIP & Mã QR"
                title="Tài khoản Sinh viên, Trạng thái VIP, Điểm tích lũy & Mã QR"
                className="relative flex items-center gap-2 px-3 sm:px-3.5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-600 font-bold text-xs transition cursor-pointer"
              >
                <Menu className="w-4 h-4 text-blue-700 dark:text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Menu</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md font-mono font-extrabold text-[10px] ${
                    isVip
                      ? "bg-amber-400 text-slate-950"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {currentPoints}đ
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= SLIDE-OVER MENU DRAWER (Next to Cart) ================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={BRAND_ASSETS.logoSquare}
                    alt="FORUS"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                       Trung Tâm Tài Khoản & VIP FORUS
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">
                      Thiết lập Sinh viên • Điểm tích lũy • Mã QR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* 1. VIP STATUS & POINTS PROGRESS CARD */}
                <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 dark:from-slate-900 dark:via-blue-950 dark:to-emerald-950 text-white border border-blue-700/40 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isVip
                            ? "bg-amber-400 text-slate-950"
                            : "bg-white/15 text-amber-300"
                        }`}
                      >
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                          Trạng thái thành viên
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base">
                          {isVip
                            ? "VIP FORUS (Đã mở khóa)"
                            : "Thành viên Tiêu chuẩn"}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono font-extrabold text-amber-300">
                        {currentPoints}
                      </span>
                      <span className="text-xs text-blue-200 font-mono">
                        /100đ
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-slate-950/50 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-300 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-blue-100">
                      <span>Mỗi dịch vụ: +5 đến +10 điểm</span>
                      <span className="font-semibold text-amber-300">
                        {isVip
                          ? "Đủ điều kiện VIP 100%"
                          : `Còn thiếu ${100 - currentPoints} điểm`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons for VIP */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isVip ? (
                      <button
                        onClick={handleActivateDemoVip}
                        className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Demo VIP 100đ
                      </button>
                    ) : (
                      <div className="py-2 px-3 rounded-xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã kích hoạt VIP
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab("vip");
                        setIsMenuOpen(false);
                      }}
                      className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      Vào Đặc quyền VIP
                    </button>
                  </div>
                </div>

                {/* 2. ACCOUNT SETTINGS SECTION */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-700 dark:text-sky-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Thiết lập Tài khoản Sinh viên
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditingAccount((prev) => !prev)}
                      className="text-xs font-bold text-blue-700 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {isEditingAccount ? "Đóng chỉnh sửa" : "Chỉnh sửa"}
                    </button>
                  </div>

                  {!isEditingAccount ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-slate-500 dark:text-slate-300">
                          Họ và tên:
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {student.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-slate-500 dark:text-slate-300">
                          Mã số SV (MSSV):
                        </span>
                        <span className="font-mono font-bold text-blue-700 dark:text-amber-300">
                          {student.studentId}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-slate-500 dark:text-slate-300">
                          Email trường:
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {student.email}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500 dark:text-slate-300">
                          Khoa:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                          {student.faculty}
                        </span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsAuthOpen(true);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Đổi tài khoản Email SV
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSaveInlineAccount}
                      className="space-y-2.5 text-xs"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Họ và tên sinh viên
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-semibold text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            MSSV
                          </label>
                          <input
                            type="text"
                            value={editStudentId}
                            onChange={(e) => {
                              setEditStudentId(e.target.value);
                              setEditEmail(
                                `${e.target.value}@student.hcmus.edu.vn`
                              );
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-mono font-bold text-slate-900 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                            Khoa
                          </label>
                          <select
                            value={editFaculty}
                            onChange={(e) => setEditFaculty(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-semibold text-slate-900 dark:text-white"
                          >
                            {HCMUS_FACULTIES.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Email Sinh viên (@student.hcmus.edu.vn)
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-mono text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Lưu thông tin tài khoản
                      </button>
                    </form>
                  )}
                </div>

                {/* 3. STUDENT & WEBSITE QR CODE SECTION */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Mã QR Sinh Viên & Truy Cập FORUS
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px]">
                      CS1 - 227 NVC
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0 shadow-xs">
                      <img
                        src={qrDataUrl}
                        alt="FORUS Student QR Code"
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Thẻ Định Danh Nhanh: {student.studentId}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
                        Đưa mã QR này tại trạm FORUS sảnh tòa I để nhận đồ ăn
                        sáng, bản in A1–A4 hoặc mượn/trả thiết bị tích điểm tức
                        thì.
                      </p>
                      <button
                        onClick={handleCopyQrLink}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedQrLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Đã sao chép link QR
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Sao chép link QR
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. RECENT POINT HISTORY */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-500" />
                      <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        Lịch sử tích điểm gần đây
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300">
                      {student.pointHistory.length} hoạt động
                    </span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {student.pointHistory.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {entry.action}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400">
                            {entry.timestamp}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold text-xs shrink-0">
                          +{entry.points}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-300">
                Giao diện hiện tại:{" "}
                <strong className="text-slate-800 dark:text-white">
                  {isDark ? "Tối (Dark)" : "Sáng (Light)"}
                </strong>
              </span>
              <button
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Bật Sáng
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-700" /> Bật Tối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 lg:pb-16">
        {/* ================= HOME TAB ================= */}
        {activeTab === "home" && (
          <div className="space-y-8 sm:space-y-12">
            {/* Hero Banner */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 dark:from-slate-800 dark:via-blue-900/90 dark:to-emerald-900/80 text-white p-5 sm:p-8 lg:p-12 shadow-xl border border-blue-700/30 dark:border-slate-700">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                  <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>
                      Trạm tiện ích Sinh viên ĐH Khoa học Tự nhiên - Cơ sở 1
                      (227 NVC)
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                    FORUS — Tiện ích trong tay,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-300">
                      học hay mỗi ngày!
                    </span>
                  </h1>
                  <p className="text-blue-100 dark:text-slate-200 text-xs sm:text-base leading-relaxed max-w-2xl">
                    Từ bữa sáng nóng hổi giao tận phòng học tòa I, dịch vụ in
                    bản vẽ A1–A4 lấy liền giữa ca, kết nối Cò Gia Sư uy tín, đến
                    trạm thuê Combo iPad Sinh Viên & MacroPad gõ LaTeX thần tốc.
                    Mỗi lần sử dụng tích ngay{" "}
                    <strong className="text-amber-300">5–10 điểm</strong> để mở
                    khóa kho sự kiện Điểm Rèn Luyện & Trợ lý AI!
                  </p>

                  {/* Responsive CTA Buttons */}
                  <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5 sm:gap-3 pt-1">
                    <button
                      onClick={() => setActiveTab("food")}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                    >
                      <Utensils className="w-4 h-4 shrink-0" />
                      Đặt ăn sáng giao tận phòng
                    </button>
                    <button
                      onClick={() => setActiveTab("gear")}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      Khám phá 7 gói Thuê & Bán
                    </button>
                    <button
                      onClick={() => setIsMenuOpen(true)}
                      className="px-4 sm:px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 shrink-0" />
                      Tài khoản, Điểm VIP & Mã QR
                    </button>
                  </div>
                </div>

                {/* Right Loyalty Card */}
                <div className="lg:col-span-5">
                  <div className="bg-white/10 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-slate-600/80 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={BRAND_ASSETS.logoSquare}
                          alt="FORUS Emblem"
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-white p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                            Thẻ Tích Điểm Sinh Viên KHTN
                          </span>
                          <h3 className="font-bold text-base sm:text-lg truncate">
                            {student.fullName}
                          </h3>
                          <p className="text-xs text-blue-200 dark:text-slate-300 font-mono truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMenuOpen(true)}
                        className="px-2.5 sm:px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-extrabold text-xs sm:text-sm shrink-0 cursor-pointer"
                      >
                        {currentPoints} / 100đ
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-3 bg-slate-950/40 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-300 via-emerald-400 to-cyan-300 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-blue-100 dark:text-slate-300">
                        <span>Mỗi dịch vụ: +5 đến +10 điểm</span>
                        <span className="font-bold text-amber-300">
                          {isVip
                            ? "Đã mở khóa VIP!"
                            : `Cần thêm ${100 - currentPoints} điểm`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="bg-slate-900/45 dark:bg-slate-900/70 rounded-xl p-3 border border-white/10">
                        <span className="text-amber-300 font-bold block mb-0.5">
                          Săn Điểm Rèn Luyện
                        </span>
                        <span className="text-blue-100 dark:text-slate-300 text-[11px]">
                          Đồng hồ đếm ngược hạn đăng ký & nhắc lịch tự động
                        </span>
                      </div>
                      <div className="bg-slate-900/45 dark:bg-slate-900/70 rounded-xl p-3 border border-white/10">
                        <span className="text-emerald-300 font-bold block mb-0.5">
                          Trợ lý AI Học Tập
                        </span>
                        <span className="text-blue-100 dark:text-slate-300 text-[11px]">
                          Giải đáp công thức Vi tích phân, LaTeX & học vụ CS1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Pillars Grid — 2x2 on Mobile, 4 Columns on Desktop */}
            <section className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-sky-400">
                  Hệ sinh thái khép kín tại Cơ sở 1
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  4 Dịch vụ Trọng tâm & Đặc quyền VIP 100 Điểm
                </h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    id: "food" as ActiveTab,
                    title: "Ăn Sáng & Nước Uống",
                    subtitle: "Giao tận phòng học (Tòa I, B, C, E, F)",
                    points: "+5 đến +10 điểm/đơn",
                    desc: "Bánh mì ốp la, cơm tấm sườn nướng, xôi mặn, cà phê muối giao trước giờ điểm danh 07:30.",
                    color: "from-orange-500 to-amber-500",
                    icon: (
                      <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ),
                  },
                  {
                    id: "print" as ActiveTab,
                    title: "In Ấn File Sẵn A1–A5",
                    subtitle: "Chọn khổ giấy, in màu/trắng đen, đóng gáy",
                    points: "+5 đến +10 điểm/lần in",
                    desc: "Hỗ trợ in Poster Đồ án 1 khổ A1 cán màng bóng, slide bài giảng, báo cáo thí nghiệm.",
                    color: "from-blue-600 to-indigo-600",
                    icon: (
                      <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ),
                  },
                  {
                    id: "tutor" as ActiveTab,
                    title: "Cò Gia Sư KHTN",
                    subtitle: "Kết nối SV KHTN & học sinh các cấp",
                    points: "+10 điểm/lần kết nối",
                    desc: "Gia sư Toán, Lý, Hóa, Tin học, IELTS và kèm môn đại cương Giải tích, Đại số tuyến tính.",
                    color: "from-emerald-600 to-teal-600",
                    icon: (
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ),
                  },
                  {
                    id: "gear" as ActiveTab,
                    title: "Thuê & Bán (7 Gói)",
                    subtitle: "iPad SV, MacroPad LaTeX, Áo Blouse...",
                    points: "+5 đến +10 điểm/gói",
                    desc: "Giải pháp công nghệ & học cụ giá sinh viên giúp ghi chép số hóa mượt mà không cần mua mới đắt đỏ.",
                    color: "from-purple-600 to-pink-600",
                    icon: (
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ),
                  },
                ].map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setActiveTab(card.id)}
                    className="group bg-white dark:bg-slate-800/95 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-sky-400 transition-all shadow-xs hover:shadow-xl cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-3">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md shrink-0`}
                        >
                          {card.icon}
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[10px] sm:text-[11px] truncate">
                          {card.points}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition">
                        {card.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-sky-300 mt-0.5">
                        {card.subtitle}
                      </p>
                      <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-300 mt-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-[11px] sm:text-xs font-bold text-blue-700 dark:text-sky-400">
                      <span>Trải nghiệm</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Preview of Featured Gear & Rental Products */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                    Độc quyền tại FORUS KHTN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    7 Sản phẩm & Dịch vụ Thuê – Bán Nổi Bật
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("gear")}
                  className="text-xs sm:text-sm font-bold text-blue-700 dark:text-sky-400 flex items-center gap-1.5 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Xem tất cả 7 gói chi tiết <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {gearProducts.slice(0, 4).map((item) => {
                  const firstVariant = item.variants[0];
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
                    >
                      <div>
                        <div className="relative h-44 bg-slate-100 dark:bg-slate-900/70">
                          <ProductVisual
                            imageUrl={item.imageUrl}
                            alt={item.name}
                            fallbackIcon={item.fallbackIcon}
                            fallbackGradient={item.fallbackGradient}
                            code={item.code}
                            className="w-full h-full"
                          />
                          <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-extrabold text-[11px] shadow-xs">
                            +{item.pointsReward}đ
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-xs font-mono font-extrabold text-blue-700 dark:text-amber-300 mt-1.5">
                            {firstVariant.price.toLocaleString("vi-VN")}đ{" "}
                            {firstVariant.unitLabel}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1.5 line-clamp-2">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 pt-0 flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(item)}
                          className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleAddProductToCart(item)}
                          className="flex-1 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer"
                        >
                          + Giỏ hàng
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ================= BREAKFAST & DRINKS TAB ================= */}
        {activeTab === "food" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/95 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-amber-400">
                    <Flame className="w-4 h-4" /> Giao tận cửa lớp Cơ sở 1 (227
                    Nguyễn Văn Cừ)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Đồ Ăn Sáng & Nước Uống Tỉnh Táo
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-0.5">
                    Chọn tòa nhà, số phòng và khung giờ bên dưới — Shipper sinh
                    viên FORUS giao tận bàn trước khi giảng viên vào lớp.
                  </p>
                </div>

                {/* Room & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />{" "}
                      Tòa nhà CS1:
                    </label>
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      {CAMPUS_BUILDINGS_CS1.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-300 mb-1">
                      Số phòng cụ thể:
                    </label>
                    <input
                      type="text"
                      value={selectedRoomCode}
                      onChange={(e) => setSelectedRoomCode(e.target.value)}
                      placeholder="VD: Phòng I.42, E.302..."
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                      Khung giờ giao:
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      {DELIVERY_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/80 overflow-x-auto pb-1">
                {[
                  { id: "all", label: "Tất cả thực đơn" },
                  { id: "food", label: "Đồ ăn sáng nóng" },
                  { id: "drink", label: "Cà phê & Trà trái cây" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFoodFilter(cat.id as typeof foodFilter)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      foodFilter === cat.id
                        ? "bg-blue-700 dark:bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredFoodList.map((food) => {
                const chosenVariant =
                  food.variants.find(
                    (v) => v.id === selectedVariantMap[food.id]
                  ) || food.variants[0];

                return (
                  <div
                    key={food.id}
                    className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between hover:shadow-xl transition group"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <ProductVisual
                          imageUrl={food.imageUrl}
                          alt={food.name}
                          fallbackIcon={food.fallbackIcon}
                          fallbackGradient={food.fallbackGradient}
                          code={food.code}
                          className="w-full h-full"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-extrabold text-xs shadow-sm">
                          +{food.pointsReward} điểm
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                            {food.name}
                          </h3>
                          <span className="font-mono font-extrabold text-blue-700 dark:text-amber-300 text-sm shrink-0">
                            {chosenVariant.price.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {food.subtitle}
                        </p>

                        {food.variants.length > 1 && (
                          <div className="pt-1">
                            <select
                              value={chosenVariant.id}
                              onChange={(e) =>
                                setSelectedVariantMap((prev) => ({
                                  ...prev,
                                  [food.id]: e.target.value,
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                            >
                              {food.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.label} — {v.price.toLocaleString("vi-VN")}đ
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(food)}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleAddProductToCart(
                            food,
                            chosenVariant,
                            `Giao: ${selectedRoomCode} (${selectedBuilding.split(" (")[0]}) • ${selectedSlot.split(" (")[0]}`
                          )
                        }
                        className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        Giao {selectedRoomCode} (+{food.pointsReward}đ)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PRINT CONFIGURATOR TAB ================= */}
        {activeTab === "print" && (
          <PrintConfigurator onAddPrintToCart={handleAddPrintToCart} />
        )}

        {/* ================= TUTOR HUB TAB ================= */}
        {activeTab === "tutor" && <TutorHub onEarnPoints={earnPoints} />}

        {/* ================= RENT & BUY (7 ITEMS) TAB ================= */}
        {activeTab === "gear" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/95 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                    <Zap className="w-4 h-4" /> Giải pháp Học tập & Ghi chép Số
                    Hóa KHTN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Trạm Thuê & Bán Thiết Bị – Học Cụ Sinh Viên (Đủ 7 Danh Mục)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-0.5">
                    Nhận và trả thiết bị trực tiếp tại sảnh Tòa nhà I hoặc thư
                    viện Cơ sở 1. Tích ngay 5–10 điểm/lần thuê hoặc mua.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "Tất cả (7 mục)" },
                    { id: "tech-gear", label: "Thiết bị Ghi chép & LaTeX" },
                    {
                      id: "study-aid",
                      label: "Flashcard, Giá đỡ, Setup, Sticker",
                    },
                    { id: "rental", label: "Thuê MTCT, Giáo trình, Áo Blouse" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setGearFilter(tab.id as typeof gearFilter)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        gearFilter === tab.id
                          ? "bg-blue-700 dark:bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGearList.map((item) => {
                const chosenVariant =
                  item.variants.find(
                    (v) => v.id === selectedVariantMap[item.id]
                  ) || item.variants[0];

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800/95 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl transition"
                  >
                    <div>
                      <div className="relative h-52 bg-slate-100 dark:bg-slate-900/75">
                        <ProductVisual
                          imageUrl={item.imageUrl}
                          alt={item.name}
                          fallbackIcon={item.fallbackIcon}
                          fallbackGradient={item.fallbackGradient}
                          code={item.code}
                          className="w-full h-full"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-extrabold text-xs shadow-sm">
                          +{item.pointsReward} điểm
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-sky-300">
                            {chosenVariant.price.toLocaleString("vi-VN")}đ{" "}
                            {chosenVariant.unitLabel}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                            Sẵn kho: <strong>{item.inStock}</strong>
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                          {item.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.subtitle}
                        </p>

                        <ul className="space-y-1.5 pt-1">
                          {item.highlights.slice(0, 3).map((hl, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-200"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>

                        {item.variants.length > 1 && (
                          <div className="pt-2">
                            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-300 mb-1">
                              Chọn gói Thuê / Mua:
                            </label>
                            <select
                              value={chosenVariant.id}
                              onChange={(e) =>
                                setSelectedVariantMap((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
                            >
                              {item.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.label} — {v.price.toLocaleString("vi-VN")}đ{" "}
                                  {v.unitLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2.5">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                      <button
                        onClick={() =>
                          handleAddProductToCart(item, chosenVariant)
                        }
                        className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm vào giỏ (
                        {chosenVariant.price.toLocaleString("vi-VN")}đ)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= VIP 100 POINTS HUB TAB ================= */}
        {activeTab === "vip" && (
          <VipHub
            student={student}
            onUnlockDemoVip={handleActivateDemoVip}
            onToggleReminder={handleToggleEventReminder}
            onSaveEventNote={handleSaveEventNote}
            onNavigateToShop={() => setActiveTab("gear")}
          />
        )}

        {/* ================= ABOUT & CONTACT TAB ================= */}
        {activeTab === "about" && <AboutAndContactView theme={theme} />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800/95 border-t border-slate-200/80 dark:border-slate-700/80 py-8 pb-24 lg:pb-8 transition-colors">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_ASSETS.logoSquare}
              alt="FORUS"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">
                FORUS — Tiện ích trong tay, học hay mỗi ngày
              </p>
              <p>
                Đồ án 1 (CSC00006) • Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM
                (Cơ sở 1)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />{" "}
              227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Email SV:
              @student.hcmus.edu.vn
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Service Navigation Bar — Fixed at Bottom (Matching Reference Style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131B2E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/80 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-7 items-center max-w-lg mx-auto">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? "text-orange-500 dark:text-orange-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                  {tab.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] mt-1 leading-tight tracking-tight truncate max-w-full">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals & Drawers */}
      <StudentAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        student={student}
        onLoginSuccess={(updated) => {
          setStudent((prev) => ({
            ...prev,
            ...updated,
            isLoggedIn: true,
          }));
          setIsAuthOpen(false);
          showToast(
            `👋 Xin chào ${updated.fullName || student.fullName} (${
              updated.studentId || student.studentId
            })!`
          );
        }}
        onActivateDemoVip={handleActivateDemoVip}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        student={student}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCompleteOrder={handleCompleteOrder}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, variant) => {
          handleAddProductToCart(product, variant);
          setSelectedProduct(null);
        }}
        onAddReview={handleAddReview}
        studentName={student.fullName}
        studentFaculty={student.faculty}
      />
    </div>
  );
}
