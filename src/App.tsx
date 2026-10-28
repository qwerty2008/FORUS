import React, { useState, useEffect, useRef } from "react";
import {
  Utensils,
  Printer,
  GraduationCap,
  ShoppingBag,
  Crown,
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
  Building2,
  Zap,
  Menu,
  X,
  QrCode,
  Copy,
  Check,
  History,
  Settings,
  Bot,
  Send,
  Loader2,
  Maximize2,
  Trash2,
  Search,
  RotateCcw,
  Star,
  Gift,
  Users,
  Award,
  Bell,
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

interface OrderHistoryEntry {
  orderId: string;
  timeLabel: string;
  pickupSpot: string;
  pointsEarned: number;
  status: "shipping" | "completed";
  totalAmount: number;
  promoCode: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    badgeText: string;
  }[];
}

const INITIAL_ORDER_HISTORY: OrderHistoryEntry[] = [
  {
    orderId: "FORUS-2096",
    timeLabel: "07:15 sáng nay",
    pickupSpot: "Sảnh Tòa I (Khoa Công nghệ Thông tin)",
    pointsEarned: 20,
    status: "shipping",
    totalAmount: 70000,
    promoCode: "KHTN227",
    items: [
      {
        productId: "food-banh-mi-op-la",
        name: "Bánh Mì Ốp La Lòng Đào & Cà Phê Muối 227",
        quantity: 1,
        price: 35000,
        imageUrl: BREAKFAST_AND_DRINK_MENU[0]?.imageUrl,
        badgeText: "227 Express",
      },
      {
        productId: "forus-01-ipad-sv",
        name: 'Combo "iPad Sinh Viên" (Bảng vẽ + Găng tay + Scrble)',
        quantity: 1,
        price: 35000,
        imageUrl: GEAR_AND_RENTAL_PRODUCTS[0]?.imageUrl,
        badgeText: "Thuê 1 tuần",
      },
    ],
  },
  {
    orderId: "FORUS-2041",
    timeLabel: "Hôm qua, 09:20",
    pickupSpot: "Thư viện Cơ sở 1 (Khu tự học máy lạnh)",
    pointsEarned: 15,
    status: "completed",
    totalAmount: 54000,
    promoCode: "FITPASS",
    items: [
      {
        productId: "forus-03-flashcard",
        name: 'Bộ Flashcard Bỏ Túi "Cứu Mạng Giữa Kỳ" Chống Nước',
        quantity: 1,
        price: 39000,
        imageUrl: GEAR_AND_RENTAL_PRODUCTS[2]?.imageUrl,
        badgeText: "Sổ tay Toán",
      },
      {
        productId: "thue-mua-may-tinh-cam-tay",
        name: "Thuê & Mua Máy Tính Cầm Tay Khoa Học (Casio fx-580VN X)",
        quantity: 1,
        price: 15000,
        imageUrl: GEAR_AND_RENTAL_PRODUCTS[6]?.imageUrl,
        badgeText: "Casio 580VN X",
      },
    ],
  },
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

  // Home Unified Catalog Filters, Search & Sort (Matches Screenshot 2)
  const [homeCatalogFilter, setHomeCatalogFilter] = useState<
    "all" | "food" | "tech-gear" | "rental"
  >("all");
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [homeSortBy, setHomeSortBy] = useState<
    "featured" | "price-asc" | "points-desc"
  >("featured");

  // Order History & Reorder State (Matches Screenshot 4)
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>(
    INITIAL_ORDER_HISTORY
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "shipping" | "completed"
  >("all");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Home Voucher & Group Lab Mode State (Matches Screenshot 3)
  const [redeemedHomeVouchers, setRedeemedHomeVouchers] = useState<string[]>(
    []
  );
  const [homeLabCode, setHomeLabCode] = useState("LAB-TOA-F-09");
  const [isHomeGroupOrderOn, setIsHomeGroupOrderOn] = useState(false);

  // Dedicated Tab Filters & Selections
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
  const [selectedModelMap, setSelectedModelMap] = useState<
    Record<string, string>
  >({});
  const [notifiedProductIds, setNotifiedProductIds] = useState<string[]>([]);

  const handleNotifyWhenAvailable = (item: ProductItem) => {
    setNotifiedProductIds((prev) => {
      const already = prev.includes(item.id);
      if (already) {
        showToast(`Đã hủy đăng ký nhận thông báo cho: ${item.name}`);
        return prev.filter((id) => id !== item.id);
      }
      showToast(
        `🔔 Đã đăng ký! FORUS sẽ gửi thông báo qua ${student.email} ngay khi "${item.name}" có hàng trở lại.`
      );
      return [...prev, item.id];
    });
  };

  const handleToggleGearAvailability = (productId: string) => {
    setGearProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const currentlyRented =
          p.availabilityStatus === "rented" || p.inStock <= 0;
        const nextStatus = currentlyRented ? "available" : "rented";
        const nextStock = currentlyRented ? 15 : 0;
        showToast(
          nextStatus === "rented"
            ? `Đã chuyển "${p.name}" sang trạng thái: Đang cho thuê`
            : `Đã chuyển "${p.name}" sang trạng thái: Còn hàng (${nextStock})`
        );
        return {
          ...p,
          availabilityStatus: nextStatus,
          inStock: nextStock,
        };
      })
    );
  };

  const getCardSelection = (item: ProductItem) => {
    const chosenVariant =
      item.variants.find((v) => v.id === selectedVariantMap[item.id]) ||
      item.variants[0];
    const chosenModel =
      item.modelOptions && item.modelOptions.length > 0
        ? item.modelOptions.find((m) => m.id === selectedModelMap[item.id]) ||
          item.modelOptions[0]
        : null;
    const finalPrice = Math.max(
      0,
      chosenVariant.price + (chosenModel?.priceDelta || 0)
    );
    const metaParts: string[] = [];
    if (chosenModel) {
      metaParts.push(`${chosenModel.name} (${chosenModel.spec})`);
    }
    if (chosenVariant.conditionBadge) {
      metaParts.push(`Tình trạng: ${chosenVariant.conditionBadge}`);
    }
    const customMeta = metaParts.length > 0 ? metaParts.join(" • ") : undefined;
    const variantForCart: PricingVariant = chosenModel
      ? {
          ...chosenVariant,
          price: finalPrice,
          label: `${chosenVariant.label} — ${chosenModel.name}`,
        }
      : chosenVariant;

    return {
      chosenVariant,
      chosenModel,
      finalPrice,
      customMeta,
      variantForCart,
    };
  };

  // VIP initial section & Floating AI Assistant state
  const [vipInitialSection, setVipInitialSection] = useState<
    "events" | "chatbot"
  >("chatbot");
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);
  const [floatingChatMessages, setFloatingChatMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([
    {
      role: "model",
      text: `Chào ${student.fullName.split(" ").slice(-1)[0] || "bạn"}! Mình là **Trợ lý AI FORUS** dành cho sinh viên ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ).\n\nBạn có thể hỏi mình ngay tại đây về:\n- Giải bài tập **Vi tích phân 1B, Đại số tuyến tính, Xác suất thống kê, Nhập môn lập trình C/C++**\n- Cú pháp **LaTeX** gõ báo cáo Đồ án 1 (CSC00006)\n- Tòa nhà, phòng học, căn tin & sự kiện săn Điểm Rèn Luyện tại Cơ sở 1!`,
    },
  ]);
  const [floatingChatInput, setFloatingChatInput] = useState("");
  const [isFloatingSending, setIsFloatingSending] = useState(false);
  const floatingChatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (floatingChatScrollRef.current) {
      floatingChatScrollRef.current.scrollTo({
        top: floatingChatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [floatingChatMessages, isFloatingSending, isFloatingAiOpen]);

  const handleSendFloatingChat = async (customPrompt?: string) => {
    const promptText = (customPrompt ?? floatingChatInput).trim();
    if (!promptText || isFloatingSending) return;

    const currentHistory = [...floatingChatMessages];
    const updatedMessages: { role: "user" | "model"; text: string }[] = [
      ...floatingChatMessages,
      { role: "user", text: promptText },
    ];
    setFloatingChatMessages(updatedMessages);
    if (!customPrompt) setFloatingChatInput("");
    setIsFloatingSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          history: currentHistory,
          messages: updatedMessages,
          studentInfo: {
            fullName: student.fullName,
            studentId: student.studentId,
            email: student.email,
            faculty: student.faculty,
            points: student.points,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Lỗi kết nối với máy chủ AI.");
      }
      setFloatingChatMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply },
      ]);
    } catch (err: any) {
      setFloatingChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ Không thể phản hồi lúc này: ${
            err.message || "Vui lòng thử lại sau."
          }`,
        },
      ]);
    } finally {
      setIsFloatingSending(false);
    }
  };

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

  // Always scroll to top when switching sections/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const getMembershipTierName = (pts: number) => {
    if (pts >= 100) return "VIP FORUS (Đã mở khóa)";
    if (pts >= 50) return "Hạng Bạc FORUS";
    return "Hạng Tiêu Chuẩn";
  };

  const earnPoints = (pointsToAdd: number, reason: string) => {
    setStudent((prev) => {
      const nextPoints = Math.max(0, prev.points + pointsToAdd);
      const unlockedVipNow = prev.points < 100 && nextPoints >= 100;
      const tierLabel = getMembershipTierName(nextPoints);
      if (unlockedVipNow) {
        showToast(
          `🎉 Chúc mừng! Bạn được +${pointsToAdd}đ VIP (Tổng: ${nextPoints}/100đ) và thăng hạng ${tierLabel}!`
        );
      } else if (pointsToAdd > 0) {
        showToast(
          `+${pointsToAdd} điểm VIP (${tierLabel} · ${nextPoints}/100đ): ${reason}`
        );
      } else if (pointsToAdd < 0) {
        showToast(
          `${pointsToAdd} điểm VIP (${tierLabel} · ${nextPoints}/100đ): ${reason}`
        );
      }
      return {
        ...prev,
        points: nextPoints,
        pointHistory: [
          {
            id: "pt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
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

  const redeemPoints = (
    pointsCost: number,
    voucherTitle: string,
    voucherId?: string
  ): boolean => {
    if (student.points < pointsCost) {
      showToast(
        `⚠️ Không đủ điểm VIP! Bạn hiện có ${student.points} điểm VIP, cần đủ ${pointsCost} điểm để đổi "${voucherTitle}".`
      );
      return false;
    }

    const nextPts = Math.max(0, student.points - pointsCost);
    const nextTier = getMembershipTierName(nextPts);

    setStudent((prev) => {
      const updatedPts = Math.max(0, prev.points - pointsCost);
      return {
        ...prev,
        points: updatedPts,
        pointHistory: [
          {
            id:
              "pt-redeem-" +
              Date.now() +
              "-" +
              Math.random().toString(36).slice(2, 6),
            action: `Đổi điểm VIP: ${voucherTitle}`,
            points: -pointsCost,
            timestamp: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...prev.pointHistory,
        ],
      };
    });

    if (voucherId) {
      setRedeemedHomeVouchers((prev) =>
        prev.includes(voucherId) ? prev : [...prev, voucherId]
      );
    }

    showToast(
      `🎁 Đã trừ -${pointsCost} điểm VIP để đổi "${voucherTitle}"! Điểm còn lại: ${nextPts}/100đ (${nextTier}).`
    );
    return true;
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
      "Đã kích hoạt 100/100 điểm VIP! Mở khóa Săn Điểm Rèn Luyện & Chatbot AI."
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
    showToast("Đã lưu thiết lập tài khoản sinh viên!");
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
        updated[idx].pointsAlreadyCredited = true;
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
              ? "FORUS 227 Express · Ăn sáng"
              : chosenVariant.type === "rent"
              ? "FORUS PassBook · Thuê học cụ"
              : "FORUS Tech · Thiết bị học tập",
          customMeta,
          imageUrl: product.imageUrl,
          pointsAlreadyCredited: true,
        },
      ];
    });

    earnPoints(
      product.pointsReward,
      `Mua hàng: ${product.name} (${chosenVariant.label})`
    );
  };

  const handleReorderPastOrder = (order: OrderHistoryEntry) => {
    const allProducts = [...foodProducts, ...gearProducts];
    order.items.forEach((orderItem) => {
      const matched = allProducts.find((p) => p.id === orderItem.productId);
      if (matched) {
        handleAddProductToCart(matched, matched.variants[0], order.pickupSpot);
      }
    });
    setIsCartOpen(true);
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
        variantLabel: `Khổ ${config.paperSize} · ${
          config.colorMode === "color" ? "In màu" : "Trắng đen"
        } · ${config.copies} bản`,
        price: calculatedPrice,
        quantity: 1,
        pointsReward: pointsEarned,
        categoryLabel: "Dịch vụ In ấn A1–A5",
        customMeta: `Nhận tại: ${config.pickupLocation}`,
        pointsAlreadyCredited: true,
      },
    ]);
    setIsCartOpen(true);
    earnPoints(
      pointsEarned,
      `Đặt in tài liệu khổ ${config.paperSize} (${config.fileName})`
    );
  };

  const handleUpdateCartQty = (cartItemId: string, delta: number) => {
    const targetItem = cart.find((item) => item.cartItemId === cartItemId);
    if (targetItem && targetItem.pointsAlreadyCredited) {
      if (delta > 0) {
        earnPoints(
          targetItem.pointsReward * delta,
          `Tăng số lượng mua: ${targetItem.name}`
        );
      } else if (delta < 0) {
        earnPoints(
          targetItem.pointsReward * delta,
          `Giảm số lượng trong giỏ: ${targetItem.name}`
        );
      }
    }
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
    const targetItem = cart.find((item) => item.cartItemId === cartItemId);
    if (targetItem && targetItem.pointsAlreadyCredited) {
      earnPoints(
        -(targetItem.pointsReward * targetItem.quantity),
        `Hủy món khỏi giỏ hàng: ${targetItem.name}`
      );
    }
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleCompleteOrder = (receipt: OrderReceipt) => {
    // Calculate any uncredited points + group lab order bonus (x2)
    const uncreditedPoints = receipt.items.reduce(
      (sum, it) =>
        it.pointsAlreadyCredited ? sum : sum + it.pointsReward * it.quantity,
      0
    );
    const groupBonusPoints = isHomeGroupOrderOn ? receipt.earnedPoints : 0;
    const totalAdditionalEarned = uncreditedPoints + groupBonusPoints;

    if (totalAdditionalEarned > 0) {
      earnPoints(
        totalAdditionalEarned,
        `Hoàn tất đơn #${receipt.orderId}${
          isHomeGroupOrderOn ? " (Nhân đôi điểm Gom Đơn Lab)" : ""
        }`
      );
    }

    if (receipt.pointsRedeemed && receipt.pointsRedeemed > 0) {
      redeemPoints(
        receipt.pointsRedeemed,
        `Giảm giá trực tiếp đơn #${receipt.orderId}`
      );
    }

    if (
      totalAdditionalEarned === 0 &&
      (!receipt.pointsRedeemed || receipt.pointsRedeemed === 0)
    ) {
      showToast(
        `✅ Đã xác nhận đơn #${receipt.orderId}! Đã cộng +${receipt.earnedPoints} điểm VIP vào Hạng thành viên (${getMembershipTierName(
          student.points
        )} · ${student.points}/100đ).`
      );
    }

    const newHistoryEntry: OrderHistoryEntry = {
      orderId: receipt.orderId,
      timeLabel: "Vừa xong",
      pickupSpot: receipt.deliveryLocation,
      pointsEarned:
        receipt.earnedPoints + (isHomeGroupOrderOn ? receipt.earnedPoints : 0),
      status: "shipping",
      totalAmount: receipt.totalAmount ?? receipt.total ?? 0,
      promoCode: receipt.pointsRedeemed
        ? `VIP-${receipt.pointsRedeemed}D`
        : "KHTN227",
      items: receipt.items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.quantity,
        price: it.price,
        imageUrl: it.imageUrl,
        badgeText: "227 Express",
      })),
    };
    setOrderHistory((prev) => [newHistoryEntry, ...prev]);
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
          ? `Đã tắt nhắc hẹn sự kiện: ${eventTitle}`
          : `Đã bật nhắc hẹn trước hạn đăng ký: ${eventTitle}`
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
    showToast("Đã lưu ghi chú cá nhân cho sự kiện Điểm Rèn Luyện!");
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
      showToast("Đã sao chép đường dẫn QR Sinh Viên FORUS!");
      setTimeout(() => setCopiedQrLink(false), 2500);
    }
  };

  const isDark = theme === "dark";
  const currentPoints = student.points;
  const isVip = currentPoints >= 100;
  const progressPercent = Math.min(100, Math.round((currentPoints / 100) * 100));
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Navigation items (Concise labels as requested)
  const navItems: {
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "home",
      label: "Trang chủ",
      shortLabel: "Trang chủ",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "food",
      label: "Ăn uống",
      shortLabel: "Ăn uống",
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      id: "print",
      label: "In ấn",
      shortLabel: "In ấn",
      icon: <Printer className="w-4 h-4" />,
    },
    {
      id: "tutor",
      label: "Gia sư",
      shortLabel: "Gia sư",
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: "gear",
      label: "Thuê & Bán",
      shortLabel: "Thuê & Bán",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: "vip",
      label: "VIP",
      shortLabel: "VIP",
      icon: <Crown className="w-4 h-4" />,
    },
  ];

  // Combined catalog for Home Tab (Matches Screenshot 2)
  const allCatalogProducts = [...foodProducts, ...gearProducts];
  const filteredHomeCatalog = allCatalogProducts
    .filter((item) => {
      const matchesCat =
        homeCatalogFilter === "all"
          ? true
          : homeCatalogFilter === "food"
          ? item.category === "food" || item.category === "drink"
          : homeCatalogFilter === "tech-gear"
          ? item.category === "tech-gear" || item.category === "study-aid"
          : item.category === "rental";
      const matchesSearch =
        !homeSearchQuery.trim() ||
        item.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(homeSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (homeSortBy === "price-asc") {
        return (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0);
      }
      if (homeSortBy === "points-desc") {
        return b.pointsReward - a.pointsReward;
      }
      return 0;
    });

  const filteredFoodList = foodProducts.filter((item) =>
    foodFilter === "all" ? true : item.category === foodFilter
  );

  const filteredGearList = gearProducts.filter((item) =>
    gearFilter === "all" ? true : item.category === gearFilter
  );

  const filteredOrderHistory = orderHistory.filter((ord) =>
    orderStatusFilter === "all" ? true : ord.status === orderStatusFilter
  );

  const getProductRatingStats = (item: ProductItem, idx: number) => {
    const avg =
      item.reviews.length > 0
        ? (
            item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length
          ).toFixed(1)
        : idx % 2 === 0
        ? "4.9"
        : "5.0";
    const count = 36 + ((idx * 13) % 35);
    return { avg, count };
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "dark bg-[#0B1320] text-slate-100"
          : "bg-[#FAF8F5] text-[#0B2545]"
      }`}
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-24 z-50 max-w-md bg-[#0B2545] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/15 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold leading-snug">
            {toastMessage}
          </p>
        </div>
      )}

      {/* Sticky Top Header: Swapped Logo + Segmented Service Tabs on Top Bar + [Sun/Moon Icon | Cart | Menu] */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FAF8F5]/95 dark:bg-[#0D1525]/95 border-b border-[#E5DEC9] dark:border-slate-800 transition-colors">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6">
          <div className="h-20 sm:h-24 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: FORUS Brand Logo (Enlarged as requested) */}
            <button
              onClick={() => switchTab("home")}
              className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer py-1"
            >
              <img
                src={isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight}
                alt="FORUS Logo"
                className="h-14 sm:h-18 lg:h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            {/* Center: 6 Service Navigation Items on Top Bar (Desktop — Segmented Editorial Style) */}
            <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800/90">
              {navItems.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-white text-[#0B2545] shadow-2xs dark:bg-[#0B2545] dark:text-white"
                        : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={
                        isActive ? "text-[#D95326]" : "text-current opacity-80"
                      }
                    >
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: [VIP Badge] -> [1. Icon-only Sun/Moon] -> [2. Cart] -> [3. Icon-only Menu Button] */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live VIP Membership Tier & Points Pill */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                title="Xem Hạng thành viên & Điểm VIP của bạn"
                className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl border border-[#E5DEC9] bg-[#F3EFE6] hover:bg-[#E8E2D5] dark:border-slate-700 dark:bg-slate-800 text-[#0B2545] dark:text-white text-xs font-extrabold transition cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-[#D95326] dark:text-amber-400 shrink-0" />
                <span className="hidden xl:inline">
                  {getMembershipTierName(currentPoints).split(" (")[0]}:
                </span>
                <span className="font-mono text-[#D95326] dark:text-amber-300 tabular-nums">
                  {currentPoints}/100đ VIP
                </span>
              </button>

              {/* 1. Icon-only Light/Dark Mode Toggle (Left of Cart) */}
              <button
                onClick={() =>
                  setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                }
                aria-label="Đổi chế độ Sáng / Tối"
                title={
                  isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"
                }
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                    : "bg-[#F2EFE9] hover:bg-[#E6E0D5] text-[#0B2545] border-[#E5E0D5]"
                }`}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : (
                  <Moon className="w-5 h-5 text-[#0B2545]" />
                )}
              </button>

              {/* 2. Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3.5 sm:px-4 h-10 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white font-extrabold text-xs transition cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <ShoppingCart className="w-4 h-4 shrink-0 text-amber-300" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#D95326] text-white font-mono font-extrabold text-[11px] tabular-nums">
                  {totalCartItems}
                </span>
              </button>

              {/* 3. Icon-only Menu Button (Next to Cart: No text or logo) */}
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Mở Menu Tài khoản, VIP & Mã QR"
                title="Tài khoản Sinh viên, Trạng thái VIP, Điểm tích lũy & Mã QR"
                className="w-10 h-10 rounded-xl bg-[#F2EFE9] hover:bg-[#E6E0D5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2545] dark:text-slate-100 border border-[#E5E0D5] dark:border-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <Menu className="w-5 h-5 text-[#D95326] dark:text-amber-300" />
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
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] dark:bg-slate-900 text-[#0B2545] dark:text-slate-100 h-full shadow-2xl border-l border-[#E5DEC9] dark:border-slate-700 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="sticky top-0 z-20 bg-[#FAF8F5]/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-[#E5DEC9] dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-[#0B2545] dark:text-white">
                    Menu Tiện Ích · Tài Khoản &amp; Liên Hệ FORUS
                  </h2>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-300">
                    Tài khoản SV · Điểm VIP · Mã QR · Liên hệ Trạm CS1
                  </p>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-[#F2EFE9] dark:bg-slate-800 text-[#0B2545] dark:text-slate-200 hover:bg-[#E5DEC9] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* 1. VIP STATUS & POINTS PROGRESS CARD */}
                <div className="rounded-3xl p-5 bg-[#0B2545] text-white space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#D95326] text-white flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                          Hạng thành viên FORUS
                        </span>
                        <h3 className="font-extrabold text-sm sm:text-base">
                          {getMembershipTierName(currentPoints)}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right tabular-nums">
                      <span className="text-2xl font-mono font-extrabold text-amber-300">
                        {currentPoints}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        /100đ
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D95326] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-200">
                      <span>Mua hàng: +5~10đ · Đổi ưu đãi: Trừ điểm VIP</span>
                      <span className="font-semibold text-amber-300">
                        {isVip
                          ? "Đủ điều kiện VIP 100%"
                          : `Còn thiếu ${100 - currentPoints} điểm`}
                      </span>
                    </div>
                  </div>

                  {/* Quick Redeem & Action Buttons for VIP */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {!isVip ? (
                      <button
                        onClick={handleActivateDemoVip}
                        className="py-2.5 px-3 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Demo VIP 100đ
                      </button>
                    ) : (
                      <div className="py-2.5 px-3 rounded-xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã kích hoạt VIP
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab("vip");
                        setIsMenuOpen(false);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      Vào Đặc quyền VIP
                    </button>
                  </div>

                  {/* Quick Point Redemption Row right inside Membership Card */}
                  <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-200 text-[11px]">
                      Đổi nhanh Voucher 10.000đ:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        redeemPoints(
                          50,
                          "Voucher Giảm 10.000đ Đơn Ăn Sáng Express",
                          "hv-50"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-extrabold text-[11px] transition cursor-pointer shrink-0"
                    >
                      Đổi 50 điểm (-50đ VIP)
                    </button>
                  </div>
                </div>

                {/* 2. ACCOUNT SETTINGS SECTION */}
                <div className="rounded-3xl bg-white dark:bg-slate-800 border border-[#E6E0D5] dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#D95326]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#0B2545] dark:text-slate-100">
                        Thiết lập Tài khoản Sinh viên
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsEditingAccount((prev) => !prev)}
                      className="text-xs font-bold text-[#D95326] hover:underline cursor-pointer"
                    >
                      {isEditingAccount ? "Đóng" : "Chỉnh sửa"}
                    </button>
                  </div>

                  {!isEditingAccount ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[#EAE5DC] dark:border-slate-700">
                        <span className="text-[#64748B] dark:text-slate-300">
                          Họ và tên
                        </span>
                        <span className="font-bold text-[#0B2545] dark:text-white">
                          {student.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#EAE5DC] dark:border-slate-700">
                        <span className="text-[#64748B] dark:text-slate-300">
                          Mã số SV (MSSV)
                        </span>
                        <span className="font-mono font-bold text-[#D95326] dark:text-amber-300 tabular-nums">
                          {student.studentId}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#EAE5DC] dark:border-slate-700">
                        <span className="text-[#64748B] dark:text-slate-300">
                          Email trường
                        </span>
                        <span className="font-mono text-[#0B2545] dark:text-slate-200 truncate max-w-[200px]">
                          {student.email}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#64748B] dark:text-slate-300">
                          Khoa
                        </span>
                        <span className="font-semibold text-[#0B2545] dark:text-slate-200 text-right">
                          {student.faculty}
                        </span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsAuthOpen(true);
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
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
                        <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                          Họ và tên sinh viên
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-semibold text-[#0B2545] dark:text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
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
                            className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-mono font-bold text-[#0B2545] dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                            Khoa
                          </label>
                          <select
                            value={editFaculty}
                            onChange={(e) => setEditFaculty(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-semibold text-[#0B2545] dark:text-white"
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
                        <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                          Email Sinh viên (@student.hcmus.edu.vn)
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-mono text-[#0B2545] dark:text-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-bold text-xs transition cursor-pointer"
                      >
                        Lưu thông tin tài khoản
                      </button>
                    </form>
                  )}
                </div>

                {/* 3. STUDENT & WEBSITE QR CODE SECTION */}
                <div className="rounded-3xl bg-[#F3EFE6] dark:bg-slate-800 border border-[#E5DEC9] dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#D95326]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#0B2545] dark:text-slate-100">
                        Mã QR Sinh Viên &amp; Truy Cập FORUS
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#D95326] dark:text-amber-300">
                      CS1 · 227 NVC
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-[#E6E0D5] dark:border-slate-700">
                    <div className="p-2 bg-white rounded-xl border border-[#E6E0D5] shrink-0">
                      <img
                        src={qrDataUrl}
                        alt="FORUS Student QR Code"
                        referrerPolicy="no-referrer"
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B2545] dark:text-white">
                        Thẻ Định Danh Nhanh: {student.studentId}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-300 leading-relaxed">
                        Đưa mã QR này tại trạm FORUS sảnh tòa I để nhận đồ ăn
                        sáng, bản in A1–A4 hoặc mượn/trả thiết bị tích điểm tức
                        thì.
                      </p>
                      <button
                        onClick={handleCopyQrLink}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-[#F2EFE9] hover:bg-[#E5DEC9] dark:bg-slate-700 text-[#0B2545] dark:text-slate-100 font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedQrLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                <div className="rounded-3xl bg-white dark:bg-slate-800 border border-[#E6E0D5] dark:border-slate-700 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#D95326]" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#0B2545] dark:text-slate-100">
                        Lịch sử cộng &amp; đổi điểm VIP
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-300 tabular-nums">
                      {student.pointHistory.length} hoạt động
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {student.pointHistory.slice(0, 8).map((entry) => {
                      const isPositive = entry.points >= 0;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-2 bg-[#FAF8F5] dark:bg-slate-900 px-3 py-2 rounded-xl border border-[#EAE5DC] dark:border-slate-700 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0B2545] dark:text-slate-100 truncate">
                              {entry.action}
                            </p>
                            <p className="text-[10px] text-[#64748B] dark:text-slate-400">
                              {entry.timestamp}
                            </p>
                          </div>
                          <span
                            className={`font-mono font-extrabold text-xs shrink-0 tabular-nums px-2 py-0.5 rounded-md ${
                              isPositive
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isPositive ? `+${entry.points}đ` : `${entry.points}đ`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. CONTACT STATION FORUS — CS1 (Moved inside Menu as requested) */}
                <AboutAndContactView
                  theme={theme}
                  defaultName={`${student.fullName} - ${student.studentId}`}
                  defaultEmail={student.email}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="relative z-10 max-w-[1320px] mx-auto px-3 sm:px-6 py-6 sm:py-9 pb-24 lg:pb-16">
        {/* ================= HOME TAB (REFERENCE EDITORIAL THEME & LAYOUT) ================= */}
        {activeTab === "home" && (
          <div className="space-y-10 sm:space-y-14">
            {/* 1. INTEGRATED HOME INTRODUCTION: FORUS — "TIỆN ÍCH TRONG TAY, HỌC HAY MỖI NGÀY" & MOBILE QR CARD (Matches Attached Screenshot) */}
            <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 lg:p-10 dark:border-slate-700/80 dark:bg-slate-800/90">
              <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center">
                {/* Left Column: Startup Story, 3 Key Highlights & Quick Service Actions */}
                <div className="space-y-4 lg:col-span-7">
                  <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
                    VỀ STARTUP SINH VIÊN FORUS · ĐỒ ÁN 1 (CSC00006) · 227 NGUYỄN VĂN CỪ
                  </p>
                  <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#0B2545] dark:text-white leading-[1.15]">
                    FORUS — “Tiện ích trong tay, học hay mỗi ngày”
                  </h1>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                    Xuất phát từ chính trải nghiệm thực tế của sinh viên{" "}
                    <strong className="font-bold text-[#0B2545] dark:text-white">
                      Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (Cơ sở 1 — 227 Nguyễn Văn Cừ, Quận 5)
                    </strong>
                    : những buổi sáng vội vã vào ca 1 chưa kịp ăn sáng, những giờ Giải tích &amp; Đại số tuyến tính phải chép hàng chục trang công thức mỏi nhừ tay, hay những lần quên mang máy tính Casio, áo blouse trước giờ thi và thực hành.
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                    <strong className="font-bold text-[#0B2545] dark:text-white">
                      FORUS
                    </strong>{" "}
                    ra đời như một trạm tiện ích khép kín ngay tại khuôn viên Cơ sở 1: cung cấp thiết bị ghi chép số giá sinh viên (Combo Bảng vẽ iPad Sinh Viên, Bàn phím MacroPad OneTap LaTeX, Flashcard chống nước), cho thuê &amp; bán máy tính cầm tay / giáo trình / áo blouse (mới 100%, 90%, 80%), giao đồ ăn sáng và bản in A1–A5 tận cửa phòng học, kết nối gia sư uy tín và thưởng điểm mở khóa công cụ Săn Điểm Rèn Luyện + Trợ lý AI.
                  </p>

                  {/* 3 Highlight Metric Cards (Matches Screenshot) */}
                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-2xl border border-[#E6E0D5] bg-white p-4 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
                      <span className="font-mono text-lg sm:text-xl font-extrabold text-[#D95326] dark:text-amber-400">
                        15 phút
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[#4A5568] dark:text-slate-300">
                        Giao tận phòng học Tòa I, B, C, E, F
                      </span>
                    </div>
                    <div className="rounded-2xl border border-[#E6E0D5] bg-white p-4 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
                      <span className="font-mono text-lg sm:text-xl font-extrabold text-[#0B2545] dark:text-white">
                        35.000đ
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[#4A5568] dark:text-slate-300">
                        Thuê trọn bộ Bảng vẽ + Găng tay / tuần
                      </span>
                    </div>
                    <div className="rounded-2xl border border-[#E6E0D5] bg-white p-4 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
                      <span className="font-mono text-lg sm:text-xl font-extrabold text-[#D95326] dark:text-amber-400">
                        100 điểm
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-[#4A5568] dark:text-slate-300">
                        Mở khóa Săn ĐRL &amp; Trợ lý AI 24/7
                      </span>
                    </div>
                  </div>

                  {/* Quick Navigation CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => switchTab("food")}
                      className="px-5 py-3 rounded-2xl bg-[#0B2545] hover:bg-[#163A66] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <Utensils className="w-4 h-4 text-amber-300" />
                      <span>Đặt Ăn Sáng Express</span>
                    </button>
                    <button
                      onClick={() => switchTab("gear")}
                      className="px-5 py-3 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thuê &amp; Bán ({gearProducts.length} Mục)</span>
                    </button>
                    <button
                      onClick={() => switchTab("print")}
                      className="px-4 py-3 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#0B2545] border border-[#E6E0D5] font-extrabold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer dark:bg-slate-900 dark:text-white dark:border-slate-700"
                    >
                      <Printer className="w-4 h-4 text-[#D95326]" />
                      <span>In Tài Liệu &amp; Poster A1–A5</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: FORUS Logo & Mobile QR Access Card (Matches Attached Screenshot) */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E6E0D5] bg-white p-6 text-center shadow-2xs dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
                  <img
                    src={
                      isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight
                    }
                    alt="FORUS Logo"
                    referrerPolicy="no-referrer"
                    className="h-16 w-auto object-contain sm:h-20"
                  />

                  <div className="mt-4 rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-3.5 dark:border-slate-700 dark:bg-slate-800">
                    <img
                      src={qrDataUrl}
                      alt="Mã QR truy cập FORUS trên điện thoại"
                      referrerPolicy="no-referrer"
                      className="h-36 w-36 object-contain sm:h-40 sm:w-40"
                    />
                  </div>

                  <div className="mt-3.5 flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                    <QrCode className="h-4 w-4 text-[#D95326]" />
                    <span>Quét Mã QR Trải Nghiệm Trên Điện Thoại</span>
                  </div>
                  <p className="mt-1 max-w-xs text-[11px] sm:text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
                    Tối ưu hóa hiển thị di động cho khách tham quan quét mã tại buổi trình bày Poster Đồ án 1.
                  </p>

                  {/* Student Points & Quick Menu Contact Trigger */}
                  <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] dark:border-slate-800 w-full flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-[#0B2545] dark:text-slate-200">
                      SV: {student.studentId} ·{" "}
                      <strong className="text-[#D95326] dark:text-amber-400">
                        {currentPoints}/100đ VIP
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(true)}
                      className="font-extrabold text-[#D95326] dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Liên hệ Trạm CS1</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. UNIFIED PRODUCT & BREAKFAST CATALOG (Matches Screenshot 2 Layout 100%) */}
            <section className="space-y-6">
              {/* Top Title + Search + Sort Row */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-5 dark:border-slate-800 lg:flex-row lg:items-end">
                <div>
                  <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
                    DANH MỤC SẢN PHẨM &amp; DỊCH VỤ LẺ · MỖI ĐƠN ĐỀU ĐƯỢC TÍCH ĐIỂM FORUS POINT
                  </p>
                  <h2 className="mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B2545] dark:text-white leading-[1.15]">
                    Thực Đơn Sáng Giảng Đường
                    <br className="hidden sm:inline" /> &amp; Tủ Thiết Bị Học Cụ FORUS
                  </h2>
                </div>

                {/* Search Input & Sort Select */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative sm:w-72">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="text"
                      value={homeSearchQuery}
                      onChange={(e) => setHomeSearchQuery(e.target.value)}
                      placeholder="Tìm bánh mì, cà phê, iPad, LaTeX..."
                      className="w-full rounded-2xl border border-[#E5E0D5] bg-white py-2.5 pr-4 pl-10 text-xs sm:text-sm text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <select
                    value={homeSortBy}
                    onChange={(e) =>
                      setHomeSortBy(e.target.value as typeof homeSortBy)
                    }
                    className="rounded-2xl border border-[#E5E0D5] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="featured">Sắp xếp: Nổi bật tại CS1</option>
                    <option value="price-asc">Sắp xếp: Giá thấp đến cao</option>
                    <option value="points-desc">
                      Sắp xếp: Điểm thưởng cao nhất
                    </option>
                  </select>
                </div>
              </div>

              {/* Segmented Filter Pill Bar + Count Summary Row */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800">
                  {[
                    {
                      id: "all",
                      label: `Tất cả (${allCatalogProducts.length})`,
                    },
                    { id: "food", label: "Ăn sáng & Cà phê" },
                    { id: "tech-gear", label: "Thiết bị & LaTeX" },
                    { id: "rental", label: "Máy tính, Giáo trình & Blouse" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setHomeCatalogFilter(
                          tab.id as typeof homeCatalogFilter
                        )
                      }
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                        homeCatalogFilter === tab.id
                          ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-900 dark:text-white"
                          : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-[#64748B] dark:text-slate-300">
                  Hiển thị{" "}
                  <strong className="font-bold text-[#0B2545] dark:text-white">
                    {filteredHomeCatalog.length}
                  </strong>{" "}
                  sản phẩm · Tích lũy{" "}
                  <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                    +5 đến +10 điểm
                  </span>
                </p>
              </div>

              {/* 3-Column Editorial Product Cards Grid (Matches Screenshot 2 Card Design) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHomeCatalog.map((item, idx) => {
                  const {
                    chosenVariant,
                    chosenModel,
                    finalPrice,
                    customMeta,
                    variantForCart,
                  } = getCardSelection(item);
                  const isFood =
                    item.category === "food" || item.category === "drink";
                  const ratingStats = getProductRatingStats(item, idx);
                  const hasConditionBadges = item.variants.some(
                    (v) => v.conditionBadge
                  );

                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E6E0D5] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C8C0B0] hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/90"
                    >
                      <div>
                        {/* Card Top Photo */}
                        <div className="relative h-52 overflow-hidden bg-[#F3EFE6] dark:bg-slate-900">
                          <ProductVisual
                            imageUrl={item.imageUrl}
                            alt={item.name}
                            fallbackIcon={item.fallbackIcon}
                            fallbackGradient={item.fallbackGradient}
                            code={
                              isFood
                                ? `${item.name.split(" (")[0]} · 227 Express`
                                : `${item.code} · FORUS CS1`
                            }
                            className="h-full w-full"
                          />
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 space-y-2.5">
                          {/* Clean Unboxed Metadata Kicker Line */}
                          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                            {isFood
                              ? "FORUS 227 Express · Ăn sáng · Giao sảnh Tòa I · Giảng đường B"
                              : item.category === "rental"
                              ? "FIT PassBook · Thuê & Mua (80% / 90% / Mới 100%) · Sảnh Tòa I"
                              : "FORUS PassBook · Học cụ & LaTeX · Nhận tại Thư viện · Sảnh Tòa I"}
                          </p>

                          {/* Deep Navy Product Title */}
                          <h3
                            onClick={() => setSelectedProduct(item)}
                            className="text-lg font-extrabold text-[#0B2545] leading-snug group-hover:text-[#D95326] transition cursor-pointer dark:text-white line-clamp-2"
                          >
                            {item.name}
                          </h3>

                          {/* 2-Line Description */}
                          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed line-clamp-2 dark:text-slate-300">
                            {item.subtitle}
                          </p>

                          {/* Rating & Points Row (Matches Screenshot 2: ★ 4.9 (48 đánh giá) · +10 điểm FORUS) */}
                          <div className="pt-1 flex items-center gap-1.5 text-xs">
                            <Star className="h-3.5 w-3.5 fill-[#D95326] text-[#D95326]" />
                            <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                              {ratingStats.avg}
                            </span>
                            <span className="text-[#64748B] dark:text-slate-400">
                              ({ratingStats.count} đánh giá)
                            </span>
                            <span className="text-[#64748B]">·</span>
                            <span className="font-mono font-bold text-[#D95326] dark:text-amber-400">
                              +{item.pointsReward} điểm FORUS
                            </span>
                          </div>

                          {/* Interactive Model Selector (Calculator type / Textbook subject / Blouse size) */}
                          {item.modelOptions && item.modelOptions.length > 0 && (
                            <div className="pt-2 space-y-1">
                              <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200">
                                {item.modelSelectorLabel || "Chọn phân loại:"}
                              </label>
                              <select
                                value={chosenModel?.id || item.modelOptions[0].id}
                                onChange={(e) =>
                                  setSelectedModelMap((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-900 border border-[#DDD6C7] dark:border-slate-700 text-xs font-bold text-[#0B2545] dark:text-slate-100"
                              >
                                {item.modelOptions.map((mod) => (
                                  <option key={mod.id} value={mod.id}>
                                    {mod.name} ({mod.spec})
                                    {mod.priceDelta > 0
                                      ? ` [+${mod.priceDelta.toLocaleString("vi-VN")}đ]`
                                      : mod.priceDelta < 0
                                      ? ` [${mod.priceDelta.toLocaleString("vi-VN")}đ]`
                                      : ""}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Interactive Condition Tier Selector (Thuê / 80% / 90% / Mới 100%) */}
                          {hasConditionBadges && (
                            <div className="pt-1.5 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#64748B] dark:text-slate-300">
                                  Chọn tình trạng (Thuê / 80% / 90% / Mới):
                                </span>
                                {chosenVariant.conditionBadge && (
                                  <span className="font-mono font-extrabold text-[#D95326] dark:text-amber-400">
                                    {chosenVariant.conditionBadge}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {item.variants.map((v) => {
                                  const active = chosenVariant.id === v.id;
                                  const vPrice = Math.max(
                                    0,
                                    v.price + (chosenModel?.priceDelta || 0)
                                  );
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() =>
                                        setSelectedVariantMap((prev) => ({
                                          ...prev,
                                          [item.id]: v.id,
                                        }))
                                      }
                                      className={`px-2.5 py-1.5 rounded-xl border text-left transition cursor-pointer ${
                                        active
                                          ? "border-[#0B2545] bg-[#0B2545] text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950"
                                          : "border-[#E5E0D5] bg-[#FAF8F5] text-[#0B2545] hover:border-[#0B2545]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                      }`}
                                    >
                                      <div className="text-[11px] font-extrabold truncate">
                                        {v.conditionBadge || v.label}
                                      </div>
                                      <div
                                        className={`font-mono text-[10px] font-bold ${
                                          active
                                            ? "text-amber-300 dark:text-slate-900"
                                            : "text-[#D95326] dark:text-amber-400"
                                        }`}
                                      >
                                        {vPrice.toLocaleString("vi-VN")}đ{" "}
                                        {v.unitLabel}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Price & Action Footer */}
                      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#EAE5DC] dark:border-slate-700/80 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white tabular-nums">
                            {finalPrice.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="block text-[11px] text-[#64748B] dark:text-slate-400">
                            {chosenVariant.conditionBadge
                              ? `${chosenVariant.conditionBadge} · ${chosenVariant.unitLabel}`
                              : chosenVariant.unitLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(item)}
                            className="px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white hover:bg-[#F5F2EB] text-xs font-bold text-[#0B2545] transition cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddProductToCart(
                                item,
                                variantForCart,
                                isFood
                                  ? `Giao: ${selectedRoomCode} (${
                                      selectedBuilding.split(" (")[0]
                                    })`
                                  : customMeta
                              )
                            }
                            className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer dark:bg-[#D95326] dark:hover:bg-[#C0441B]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Thêm vào giỏ</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. ORDER HISTORY, TRACKING & QUICK REORDER SECTION (Matches Screenshot 4 Layout 100%) */}
            <section className="space-y-6">
              {/* Warm Sand Header Box */}
              <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
                <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
                  LỊCH SỬ MUA HÀNG (ĐẶT LẠI NHANH) · TRA CỨU ĐƠN &amp; SƠ ĐỒ ĐIỂM NHẬN 227 NVC
                </p>
                <h2 className="mt-1.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B2545] dark:text-white">
                  Lịch Sử Mua Hàng, Tra Cứu Đơn &amp; Sơ Đồ Điểm Nhận Cơ Sở 1
                </h2>
                <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-[#4A5568] dark:text-slate-300">
                  Xem lại các đơn đồ ăn sáng, bản in và thiết bị bạn đã đặt, bấm{" "}
                  <strong className="font-bold text-[#0B2545] dark:text-white">
                    Đặt lại (Reorder)
                  </strong>{" "}
                  để thêm nhanh các món quen thuộc vào giỏ hàng rồi chọn lại tòa nhà học hôm nay, hoặc theo dõi lộ trình giao hàng tại{" "}
                  <strong className="font-bold text-[#0B2545] dark:text-white">
                    227 Nguyễn Văn Cừ, Q.5
                  </strong>
                  .
                </p>
              </div>

              {/* White Order History Container */}
              <div className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-7 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 space-y-5">
                <div className="flex flex-col justify-between gap-3 border-b border-[#EAE5DC] pb-4 dark:border-slate-700 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-[#D95326]" />
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#0B2545] dark:text-white">
                        Lịch Sử Mua Hàng ({orderHistory.length} đơn)
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-300">
                      Khi bấm{" "}
                      <strong className="text-[#0B2545] dark:text-white">
                        “Đặt lại đơn này”
                      </strong>
                      , hệ thống chỉ thêm lại các món ăn và thiết bị vào giỏ hàng để bạn chọn Tòa nhà mới theo lịch học hôm nay.
                    </p>
                  </div>

                  {/* Segmented Order Status Filter */}
                  <div className="inline-flex items-center gap-1 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1 dark:border-slate-700 dark:bg-slate-900 self-start sm:self-auto">
                    {[
                      { id: "all", label: `Tất cả (${orderHistory.length})` },
                      { id: "shipping", label: "Đang giao" },
                      { id: "completed", label: "Hoàn tất" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setOrderStatusFilter(
                            st.id as typeof orderStatusFilter
                          )
                        }
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                          orderStatusFilter === st.id
                            ? "bg-white text-[#0B2545] shadow-2xs dark:bg-slate-800 dark:text-white"
                            : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Cards List */}
                <div className="space-y-4">
                  {filteredOrderHistory.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5]/60 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900/60 space-y-4"
                    >
                      {/* Order Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-[#0B2545] dark:text-white">
                            Đơn #{ord.orderId}
                          </span>
                          <span className="text-[#64748B]">·</span>
                          <span className="text-xs text-[#64748B] dark:text-slate-400">
                            {ord.timeLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="text-[#4A5568] dark:text-slate-300">
                            Điểm nhận:{" "}
                            <strong className="font-bold text-[#0B2545] dark:text-white">
                              {ord.pickupSpot}
                            </strong>
                          </span>
                          <span className="font-mono font-bold text-[#D95326] dark:text-amber-400 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />+{ord.pointsEarned}đ
                          </span>
                          <span
                            className={`font-bold ${
                              ord.status === "shipping"
                                ? "text-[#0B2545] dark:text-sky-300"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            •{" "}
                            {ord.status === "shipping"
                              ? "Đang vận chuyển"
                              : "Đã bàn giao"}
                          </span>
                        </div>
                      </div>

                      {/* Order Items 2-Column Mini Cards */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {ord.items.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[#E6E0D5] bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0B2545] text-white flex items-center justify-center font-mono text-[10px] font-bold text-center p-1">
                                {it.imageUrl ? (
                                  <img
                                    src={it.imageUrl}
                                    alt={it.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span>{it.badgeText}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                                  {it.name}
                                </p>
                                <p className="font-mono text-xs text-[#64748B] dark:text-slate-300">
                                  SL: x{it.quantity} ·{" "}
                                  {it.price.toLocaleString("vi-VN")}đ
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const found = allCatalogProducts.find(
                                  (p) => p.id === it.productId
                                );
                                if (found) {
                                  handleAddProductToCart(found);
                                }
                              }}
                              className="rounded-lg border border-[#E5E0D5] bg-white hover:bg-[#F5F2EB] px-3 py-1.5 text-xs font-extrabold text-[#0B2545] transition shrink-0 cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              + Mua lẻ
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Tracking Progress Drawer (if toggled) */}
                      {trackingOrderId === ord.orderId && (
                        <div className="rounded-xl bg-[#F3EFE6] p-3.5 text-xs text-[#0B2545] dark:bg-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            🚚 <strong>Lộ trình đơn #{ord.orderId}:</strong> Đã xác nhận tại Trạm FORUS Cổng 227 NVC → Shipper sinh viên đang di chuyển tới{" "}
                            <strong>{ord.pickupSpot}</strong>.
                          </span>
                          <span className="font-mono font-bold text-[#D95326]">
                            Dự kiến giao: 5 phút nữa
                          </span>
                        </div>
                      )}

                      {/* Order Footer Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300">
                          Tổng cộng ({ord.items.length} món):{" "}
                          <strong className="font-mono text-base font-extrabold text-[#0B2545] dark:text-white">
                            {ord.totalAmount.toLocaleString("vi-VN")}đ
                          </strong>{" "}
                          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ({ord.promoCode})
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setTrackingOrderId((prev) =>
                                prev === ord.orderId ? null : ord.orderId
                              )
                            }
                            className="rounded-xl border border-[#E5E0D5] bg-white hover:bg-[#F5F2EB] px-4 py-2.5 text-xs font-extrabold text-[#0B2545] transition cursor-pointer dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                          >
                            {trackingOrderId === ord.orderId
                              ? "Ẩn tiến trình"
                              : "Xem tiến trình giao"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorderPastOrder(ord)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] px-4 py-2.5 text-xs font-extrabold text-white transition cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Đặt lại đơn này (Chọn tòa nhà mới)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. VOUCHER REDEMPTION & LAB GROUP ORDER SECTION (Matches Screenshot 3 Layout 100%) */}
            <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
                {/* Left 7 Cols: 3 Voucher Cards */}
                <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                        <Gift className="h-3.5 w-3.5 text-amber-300" />
                        Đổi Điểm VIP FORUS ({currentPoints} điểm khả dụng ·{" "}
                        {getMembershipTierName(currentPoints)})
                      </span>
                      <button
                        type="button"
                        onClick={() => switchTab("vip")}
                        className="text-xs font-extrabold text-[#D95326] hover:underline cursor-pointer"
                      >
                        Mở Trung tâm VIP →
                      </button>
                    </div>

                    <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                      Khi{" "}
                      <strong className="text-[#0B2545] dark:text-white">
                        mua hàng
                      </strong>{" "}
                      (đồ ăn sáng, in tài liệu, thuê học cụ), hệ thống sẽ{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        cộng điểm VIP
                      </strong>{" "}
                      trực tiếp vào hạng thành viên. Khi{" "}
                      <strong className="text-[#D95326] dark:text-amber-400">
                        đổi điểm
                      </strong>{" "}
                      nhận các gói Voucher bên dưới, hệ thống sẽ{" "}
                      <strong className="text-[#D95326] dark:text-amber-400">
                        trừ điểm VIP
                      </strong>{" "}
                      tương ứng:
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      {[
                        {
                          id: "hv-50",
                          cost: 50,
                          req: "Cần 50 điểm VIP · Trị giá 10.000đ",
                          title: "Voucher Giảm 10.000đ Đơn Ăn Sáng Express",
                          desc: "Áp dụng cho mọi món bánh mì, xôi lá chuối, cà phê muối giao tại Tòa I, F, B, C.",
                          btnLabel: "Đổi 50 điểm ngay (-50đ VIP)",
                        },
                        {
                          id: "hv-60",
                          cost: 60,
                          req: "Cần 60 điểm VIP · Trị giá 15.000đ",
                          title: "Voucher Giảm 15.000đ Thuê Thiết Bị & Sổ Tay AI",
                          desc: "Dùng khi thuê Combo iPad Sinh Viên, MacroPad LaTeX hoặc Sổ tay Toán cho AI CSC00006.",
                          btnLabel: "Đổi 60 điểm ngay (-60đ VIP)",
                        },
                        {
                          id: "hv-100",
                          cost: 100,
                          req: "Cần 100 điểm VIP · Giảm 15% tổng đơn",
                          title: "Đặc Quyền Giảm 15% Toàn Bộ Giỏ Hàng Tuần Này",
                          desc: "Ưu đãi cao nhất dành cho thành viên tích điểm năng nổ tại Cơ sở 1 (227 NVC).",
                          btnLabel: "Đổi 100 điểm ngay (-100đ VIP)",
                        },
                      ].map((v) => {
                        const isRedeemed = redeemedHomeVouchers.includes(v.id);
                        const canAfford = currentPoints >= v.cost;
                        return (
                          <div
                            key={v.id}
                            className="flex flex-col justify-between rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-4 dark:border-slate-700 dark:bg-slate-800/80"
                          >
                            <div>
                              <span className="block font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                                {v.req}
                              </span>
                              <h4 className="mt-1.5 text-sm font-extrabold text-[#0B2545] leading-snug dark:text-white">
                                {v.title}
                              </h4>
                              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                                {v.desc}
                              </p>
                            </div>

                            <div className="mt-4 space-y-1.5">
                              {isRedeemed && (
                                <span className="block text-center font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ Đã đổi ưu đãi này
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  redeemPoints(v.cost, v.title, v.id)
                                }
                                className={`w-full rounded-xl py-2.5 px-2 text-xs font-extrabold transition cursor-pointer ${
                                  isRedeemed
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : canAfford
                                    ? "bg-[#0B2545] hover:bg-[#163A66] text-white dark:bg-amber-400 dark:text-slate-950"
                                    : "bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {isRedeemed
                                  ? `Đổi thêm lần nữa (-${v.cost}đ VIP)`
                                  : canAfford
                                  ? v.btnLabel
                                  : `Thiếu ${v.cost - currentPoints} điểm VIP`}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Gom Đơn Nhóm Phòng Lab */}
                <div className="flex flex-col justify-between rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-900 lg:col-span-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#D95326]" />
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0B2545] dark:text-white">
                        Chế Độ Gom Đơn Nhóm Phòng Lab (CS1)
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                      Đang làm đồ án nhóm tại phòng máy hoặc{" "}
                      <strong className="text-[#0B2545] dark:text-white">
                        Thư viện Cơ sở 1
                      </strong>
                      ? Bật chế độ Gom Đơn Nhóm để được{" "}
                      <strong className="text-[#0B2545] dark:text-white">
                        miễn phí giao nội khu 100%
                      </strong>{" "}
                      và{" "}
                      <strong className="text-[#0B2545] dark:text-white">
                        nhân đôi (x2) số điểm tích lũy
                      </strong>{" "}
                      cho toàn bộ đơn hàng!
                    </p>

                    <div className="rounded-2xl border border-[#E5DEC9] bg-[#F5F2EB] p-4 dark:border-slate-700 dark:bg-slate-800">
                      <label className="block text-xs font-bold text-[#0B2545] dark:text-white mb-2">
                        Mã phòng học / Nhóm đồ án của bạn:
                      </label>
                      <input
                        type="text"
                        value={homeLabCode}
                        onChange={(e) =>
                          setHomeLabCode(e.target.value.toUpperCase())
                        }
                        className="w-full rounded-xl border border-[#DDD6C7] bg-white px-3.5 py-2.5 font-mono text-xs sm:text-sm font-bold text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                      />
                      <p className="mt-2 text-[11px] leading-relaxed text-[#64748B] dark:text-slate-300">
                        Khi bật gom đơn, đơn hàng của bạn sẽ gắn nhãn nhóm{" "}
                        <strong className="font-mono text-[#0B2545] dark:text-amber-300">
                          {homeLabCode || "LAB-TOA-F-09"}
                        </strong>{" "}
                        để shipper giao cùng lúc.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeGroupOrderOn((prev) => !prev);
                      showToast(
                        !isHomeGroupOrderOn
                          ? `Đã bật Gom Đơn Nhóm (${homeLabCode}) — Nhân đôi điểm & Freeship nội khu!`
                          : "Đã tắt chế độ Gom Đơn Nhóm."
                      );
                    }}
                    className={`mt-4 w-full rounded-2xl py-3.5 px-4 text-xs sm:text-sm font-extrabold text-white transition cursor-pointer shadow-xs ${
                      isHomeGroupOrderOn
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-[#D95326] hover:bg-[#C0441B]"
                    }`}
                  >
                    {isHomeGroupOrderOn
                      ? `Đang Bật Gom Đơn Nhóm ${homeLabCode} (x2 Điểm + Freeship ✓)`
                      : "Bật Chế Độ Gom Đơn Nhóm Phòng Lab (x2 Điểm + Freeship)"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= BREAKFAST & DRINKS TAB ================= */}
        {activeTab === "food" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
                    FORUS 227 EXPRESS · GIAO TẬN PHÒNG HỌC CƠ SỞ 1 NGUYỄN VĂN CỪ
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white leading-[1.15]">
                    Thực Đơn Ăn Sáng &amp; Cà Phê Tỉnh Táo Giảng Đường
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                    Chọn tòa nhà, số phòng và khung giờ bên dưới — Shipper sinh
                    viên FORUS giao tận bàn trước khi giảng viên vào lớp.
                  </p>
                </div>

                {/* Room & Time Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#E6E0D5] dark:border-slate-700 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#D95326]" /> Tòa
                      nhà CS1:
                    </label>
                    <select
                      value={selectedBuilding}
                      onChange={(e) => setSelectedBuilding(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 text-xs font-bold text-[#0B2545] dark:text-slate-100"
                    >
                      {CAMPUS_BUILDINGS_CS1.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] dark:text-slate-300 mb-1">
                      Số phòng cụ thể:
                    </label>
                    <input
                      type="text"
                      value={selectedRoomCode}
                      onChange={(e) => setSelectedRoomCode(e.target.value)}
                      placeholder="VD: Phòng I.42, E.302..."
                      className="w-full px-2.5 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 text-xs font-bold text-[#0B2545] dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] dark:text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0B2545] dark:text-amber-400" />{" "}
                      Khung giờ giao:
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 text-xs font-bold text-[#0B2545] dark:text-slate-100"
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

              {/* Interactive Segmented Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E5DEC9] dark:border-slate-700/80">
                <div className="inline-flex items-center gap-1 rounded-2xl border border-[#E5E0D5] bg-white/70 p-1.5 dark:border-slate-700 dark:bg-slate-900">
                  {[
                    {
                      id: "all",
                      label: `Tất cả thực đơn (${foodProducts.length})`,
                    },
                    { id: "food", label: "Đồ ăn sáng nóng" },
                    { id: "drink", label: "Cà phê & Trà trái cây" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFoodFilter(cat.id as typeof foodFilter)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                        foodFilter === cat.id
                          ? "bg-[#0B2545] text-white shadow-2xs dark:bg-amber-400 dark:text-slate-950"
                          : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <span className="font-mono text-xs text-[#64748B] dark:text-slate-300">
                  Điểm giao đang chọn:{" "}
                  <strong className="text-[#D95326] dark:text-amber-400">
                    {selectedRoomCode} · {selectedBuilding.split(" (")[0]}
                  </strong>
                </span>
              </div>
            </div>

            {/* 3-Column Editorial Food Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodList.map((food, idx) => {
                const chosenVariant =
                  food.variants.find(
                    (v) => v.id === selectedVariantMap[food.id]
                  ) || food.variants[0];
                const ratingStats = getProductRatingStats(food, idx);

                return (
                  <div
                    key={food.id}
                    className="bg-white dark:bg-slate-800/95 rounded-3xl border border-[#E6E0D5] dark:border-slate-700/80 hover:border-[#C8C0B0] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden bg-[#F3EFE6] dark:bg-slate-900">
                        <ProductVisual
                          imageUrl={food.imageUrl}
                          alt={food.name}
                          fallbackIcon={food.fallbackIcon}
                          fallbackGradient={food.fallbackGradient}
                          code={`${food.name.split(" (")[0]} · 227 Express`}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="p-5 sm:p-6 space-y-2.5">
                        <p className="text-xs text-[#64748B] dark:text-slate-400">
                          FORUS 227 Express · Ăn sáng · Giao{" "}
                          {selectedBuilding.split(" (")[0]}
                        </p>

                        <h3 className="font-extrabold text-lg text-[#0B2545] dark:text-white leading-snug">
                          {food.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed line-clamp-2">
                          {food.subtitle}
                        </p>

                        <div className="pt-1 flex items-center gap-1.5 text-xs">
                          <Star className="h-3.5 w-3.5 fill-[#D95326] text-[#D95326]" />
                          <span className="font-mono font-bold text-[#D95326]">
                            {ratingStats.avg}
                          </span>
                          <span className="text-[#64748B] dark:text-slate-400">
                            ({ratingStats.count} đánh giá)
                          </span>
                          <span className="text-[#64748B]">·</span>
                          <span className="font-mono font-bold text-[#D95326]">
                            +{food.pointsReward} điểm FORUS
                          </span>
                        </div>

                        {food.variants.length > 1 && (
                          <div className="pt-2">
                            <select
                              value={chosenVariant.id}
                              onChange={(e) =>
                                setSelectedVariantMap((prev) => ({
                                  ...prev,
                                  [food.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-900 border border-[#DDD6C7] dark:border-slate-700 text-xs font-bold text-[#0B2545] dark:text-slate-200"
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

                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#EAE5DC] dark:border-slate-700 flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-[#0B2545] dark:text-white text-base sm:text-lg tabular-nums">
                        {chosenVariant.price.toLocaleString("vi-VN")}đ
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(food)}
                          className="px-3 py-2 rounded-xl border border-[#E5E0D5] dark:border-slate-600 text-[#0B2545] dark:text-slate-200 hover:bg-[#F5F2EB] font-bold text-xs transition cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            handleAddProductToCart(
                              food,
                              chosenVariant,
                              `Giao: ${selectedRoomCode} (${
                                selectedBuilding.split(" (")[0]
                              }) • ${selectedSlot.split(" (")[0]}`
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Giao {selectedRoomCode}</span>
                        </button>
                      </div>
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

        {/* ================= RENT & BUY (9 ITEMS) TAB ================= */}
        {activeTab === "gear" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <p className="font-mono text-xs font-semibold tracking-wider uppercase text-[#D95326] dark:text-amber-400">
                    FORUS PASSBOOK &amp; TECH GEAR · GIẢI PHÁP GHI CHÉP &amp; HỌC CỤ TẠI 227 NVC
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white leading-[1.15]">
                    Trạm Thuê &amp; Bán Thiết Bị, Máy Tính, Giáo Trình &amp; Áo Blouse ({gearProducts.length} Danh Mục)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                    Tách riêng từng mục{" "}
                    <strong className="text-[#0B2545] dark:text-white">
                      Máy tính cầm tay (Casio 580VN X, 880BTG, Vinacal 680EX)
                    </strong>
                    ,{" "}
                    <strong className="text-[#0B2545] dark:text-white">
                      Giáo trình đại cương
                    </strong>{" "}
                    và{" "}
                    <strong className="text-[#0B2545] dark:text-white">
                      Áo Blouse phòng Lab
                    </strong>
                    . Tự do chọn thuê ngắn hạn hoặc mua luôn theo tình trạng{" "}
                    <strong className="text-[#D95326] dark:text-amber-400">
                      Độ mới 80% · Độ mới 90% · Mới hẳn 100%
                    </strong>
                    .
                  </p>
                </div>

                <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-[#E5E0D5] bg-white/80 p-1.5 dark:border-slate-700 dark:bg-slate-900">
                  {[
                    { id: "all", label: `Tất cả (${gearProducts.length} mục)` },
                    { id: "tech-gear", label: "Bảng vẽ & LaTeX" },
                    { id: "study-aid", label: "Flashcard & Giá đỡ" },
                    {
                      id: "rental",
                      label: "Máy tính, Giáo trình & Áo Blouse",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setGearFilter(tab.id as typeof gearFilter)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap cursor-pointer ${
                        gearFilter === tab.id
                          ? "bg-[#0B2545] text-white shadow-2xs dark:bg-amber-400 dark:text-slate-950"
                          : "text-[#5A6578] hover:text-[#0B2545] dark:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGearList.map((item, idx) => {
                const {
                  chosenVariant,
                  chosenModel,
                  finalPrice,
                  customMeta,
                  variantForCart,
                } = getCardSelection(item);
                const ratingStats = getProductRatingStats(item, idx);
                const hasConditionBadges = item.variants.some(
                  (v) => v.conditionBadge
                );
                const isRented =
                  item.availabilityStatus === "rented" || item.inStock <= 0;
                const isNotified = notifiedProductIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                      isRented
                        ? "bg-[#F3EFE6]/75 dark:bg-slate-900/65 border-dashed border-[#CFC8B8] dark:border-slate-700 opacity-70 grayscale-[25%]"
                        : "bg-white dark:bg-slate-800/95 border-[#E6E0D5] dark:border-slate-700/80 hover:border-[#C8C0B0] hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="relative h-56 bg-[#F3EFE6] dark:bg-slate-900/75">
                        <ProductVisual
                          imageUrl={item.imageUrl}
                          alt={item.name}
                          fallbackIcon={item.fallbackIcon}
                          fallbackGradient={item.fallbackGradient}
                          code={`${item.code} · FORUS CS1`}
                          className="w-full h-full"
                        />

                        {/* Status Badge ('Còn hàng' or 'Đang cho thuê') */}
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleGearAvailability(item.id)
                            }
                            title="Bấm để chuyển thử trạng thái Còn hàng / Đang cho thuê"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-extrabold shadow-md backdrop-blur-md border transition cursor-pointer ${
                              isRented
                                ? "bg-amber-950/90 text-amber-200 border-amber-400/50 hover:bg-amber-900"
                                : "bg-emerald-950/90 text-emerald-200 border-emerald-400/50 hover:bg-emerald-900"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isRented
                                  ? "bg-amber-400"
                                  : "bg-emerald-400 animate-pulse"
                              }`}
                            />
                            <span>
                              {isRented ? "Đang cho thuê" : "Còn hàng"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                            FORUS PassBook ·{" "}
                            {isRented
                              ? "Tạm hết suất thuê/mua"
                              : `Sẵn kho: ${item.inStock}`}{" "}
                            · Sảnh Tòa I
                          </p>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold border ${
                              isRented
                                ? "bg-amber-500/15 text-[#D95326] dark:text-amber-300 border-[#D95326]/30"
                                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {isRented ? "Đang cho thuê" : "Còn hàng"}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProduct(item)}
                          className="font-extrabold text-lg text-[#0B2545] dark:text-white leading-snug hover:text-[#D95326] transition cursor-pointer"
                        >
                          {item.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                          {item.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs">
                          <Star className="h-3.5 w-3.5 fill-[#D95326] text-[#D95326]" />
                          <span className="font-mono font-bold text-[#D95326]">
                            {ratingStats.avg}
                          </span>
                          <span className="text-[#64748B] dark:text-slate-400">
                            ({ratingStats.count} đánh giá)
                          </span>
                          <span className="text-[#64748B]">·</span>
                          <span className="font-mono font-bold text-[#D95326]">
                            +{item.pointsReward} điểm FORUS
                          </span>
                        </div>

                        <ul className="space-y-1.5 pt-1 border-t border-[#EAE5DC] dark:border-slate-700">
                          {item.highlights.slice(0, 3).map((hl, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-[#4A5568] dark:text-slate-200"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D95326] shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Step 1: Select Calculator Model / Textbook Combo / Lab Coat Size */}
                        {item.modelOptions && item.modelOptions.length > 0 && (
                          <div className="pt-2 border-t border-[#EAE5DC] dark:border-slate-700 space-y-1.5">
                            <label className="block text-[11px] font-extrabold text-[#0B2545] dark:text-slate-200">
                              1. {item.modelSelectorLabel || "Chọn phân loại:"}
                            </label>
                            <select
                              value={chosenModel?.id || item.modelOptions[0].id}
                              disabled={isRented}
                              onChange={(e) =>
                                setSelectedModelMap((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-900 border border-[#DDD6C7] dark:border-slate-700 text-xs font-bold text-[#0B2545] dark:text-slate-100 disabled:opacity-60"
                            >
                              {item.modelOptions.map((mod) => (
                                <option key={mod.id} value={mod.id}>
                                  {mod.name} — {mod.spec}
                                  {mod.priceDelta > 0
                                    ? ` (+${mod.priceDelta.toLocaleString("vi-VN")}đ)`
                                    : mod.priceDelta < 0
                                    ? ` (${mod.priceDelta.toLocaleString("vi-VN")}đ)`
                                    : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Step 2: Select Condition Tier (Mới 100% / Độ mới 90% / Độ mới 80% / Thuê ngắn hạn) */}
                        {hasConditionBadges ? (
                          <div className="pt-1.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-[#0B2545] dark:text-slate-200">
                                2. Chọn tình trạng (Thuê / 80% / 90% / Mới 100%):
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              {item.variants.map((v) => {
                                const active = chosenVariant.id === v.id;
                                const adjustedVPrice = Math.max(
                                  0,
                                  v.price + (chosenModel?.priceDelta || 0)
                                );
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    disabled={isRented}
                                    onClick={() =>
                                      setSelectedVariantMap((prev) => ({
                                        ...prev,
                                        [item.id]: v.id,
                                      }))
                                    }
                                    className={`p-2 rounded-xl border text-left transition cursor-pointer disabled:cursor-not-allowed ${
                                      active
                                        ? "border-[#0B2545] bg-[#0B2545] text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950"
                                        : "border-[#E5E0D5] bg-[#FAF8F5] text-[#0B2545] hover:border-[#0B2545]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[11px] font-extrabold truncate">
                                        {v.label}
                                      </span>
                                    </div>
                                    <div
                                      className={`mt-0.5 font-mono text-xs font-extrabold ${
                                        active
                                          ? "text-amber-300 dark:text-slate-950"
                                          : "text-[#D95326] dark:text-amber-400"
                                      }`}
                                    >
                                      {adjustedVPrice.toLocaleString("vi-VN")}đ{" "}
                                      <span className="text-[10px] font-normal opacity-80">
                                        {v.unitLabel}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {chosenVariant.conditionDesc && (
                              <p className="rounded-xl bg-[#F3EFE6] dark:bg-slate-900/90 px-3 py-2 text-[11px] text-[#4A5568] dark:text-slate-300 leading-relaxed">
                                <strong className="text-[#0B2545] dark:text-amber-300">
                                  {chosenVariant.conditionBadge}:
                                </strong>{" "}
                                {chosenVariant.conditionDesc}
                              </p>
                            )}
                          </div>
                        ) : (
                          item.variants.length > 1 && (
                            <div className="pt-2">
                              <label className="block text-[11px] font-bold text-[#64748B] dark:text-slate-300 mb-1">
                                Chọn gói Thuê / Mua:
                              </label>
                              <select
                                value={chosenVariant.id}
                                disabled={isRented}
                                onChange={(e) =>
                                  setSelectedVariantMap((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-900 border border-[#DDD6C7] dark:border-slate-700 text-xs font-bold text-[#0B2545] dark:text-slate-100 disabled:opacity-60"
                              >
                                {item.variants.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.label} — {v.price.toLocaleString("vi-VN")}
                                    đ {v.unitLabel}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 pt-3 border-t border-[#EAE5DC] dark:border-slate-700 flex items-center justify-between gap-2.5">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] dark:border-slate-600 text-[#0B2545] dark:text-slate-200 hover:bg-[#F5F2EB] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>

                      {isRented ? (
                        <button
                          type="button"
                          onClick={() => handleNotifyWhenAvailable(item)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isNotified
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-[#0B2545] hover:bg-[#163A66] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950"
                          }`}
                        >
                          {isNotified ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Đã đăng ký báo</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-4 h-4" />
                              <span>Thông báo khi có hàng</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddProductToCart(
                              item,
                              variantForCart,
                              customMeta
                            )
                          }
                          className="flex-1 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#163A66] dark:bg-[#D95326] dark:hover:bg-[#C0441B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm vào giỏ ({finalPrice.toLocaleString("vi-VN")}đ)
                        </button>
                      )}
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
            onRedeemPoints={redeemPoints}
            redeemedVoucherIds={redeemedHomeVouchers}
            onToggleReminder={handleToggleEventReminder}
            onSaveEventNote={handleSaveEventNote}
            onNavigateToShop={() => setActiveTab("gear")}
            initialSection={vipInitialSection}
          />
        )}
      </main>

      {/* 4-Column Editorial Footer on Warm Sand Surface (Matches Screenshot 3 Bottom 100%) */}
      <footer className="relative z-10 bg-[#F3EFE6] dark:bg-[#0D1525] border-t border-[#E5DEC9] dark:border-slate-800 py-12 pb-28 lg:pb-12 transition-colors">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
            {/* Col 1: FORUS Hub */}
            <div className="space-y-2.5">
              <h4 className="text-base font-extrabold text-[#0B2545] dark:text-white">
                FORUS Hub
              </h4>
              <p className="text-xs leading-relaxed text-[#4A5568] dark:text-slate-300">
                Tiện ích trong tay – Học hay mỗi ngày tại 227 Nguyễn Văn Cừ. Kết
                hợp{" "}
                <strong className="text-[#0B2545] dark:text-white">
                  FORUS 227 Express
                </strong>{" "}
                &amp;{" "}
                <strong className="text-[#0B2545] dark:text-white">
                  FIT PassBook
                </strong>{" "}
                phục vụ sinh viên ĐH Khoa học Tự nhiên (HCMUS).
              </p>
            </div>

            {/* Col 2: Chuyên mục chính */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                Chuyên mục chính
              </h4>
              <ul className="space-y-1.5 text-xs text-[#4A5568] dark:text-slate-300">
                <li>
                  <button
                    onClick={() => switchTab("home")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Cửa hàng, Combo tuần &amp; Đổi điểm
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("food")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Đặt đồ ăn sáng &amp; Cà phê muối 227
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("gear")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Thuê iPad SV, MTCT, Áo Blouse &amp; Học cụ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("print")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    In ấn tài liệu &amp; Poster Đồ án A1–A5
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("tutor")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Cò Gia Sư KHTN &amp; Tìm nhóm học kèm
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchTab("vip")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Săn Điểm Rèn Luyện &amp; Trợ lý AI FORUS
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Điểm giao nhận Cơ sở 1 */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                Điểm giao nhận Cơ sở 1
              </h4>
              <p className="text-xs leading-relaxed text-[#4A5568] dark:text-slate-300">
                Sảnh Tòa I (Khoa CNTT) · Tòa F (Phòng Lab) · Giảng đường B · Dãy
                C–E · Thư viện Cơ sở 1 · Cổng chính 227 Nguyễn Văn Cừ, P.4, Q.5,
                TP.HCM.
              </p>
            </div>

            {/* Col 4: Thông tin vận hành */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                Thông tin vận hành
              </h4>
              <p className="text-xs leading-relaxed text-[#4A5568] dark:text-slate-300">
                Giờ hoạt động: 06:45 – 17:30 (Thứ 2 – Thứ 7).
                <br />
                Chế độ thanh toán thử nghiệm an toàn — Đồ án 1 (CSC00006) Khoa
                CNTT, Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Service Navigation Bar — Fixed at Bottom (6 Service Items) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0D1525]/95 backdrop-blur-xl border-t border-[#E5DEC9] dark:border-slate-800 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-6 items-center max-w-lg mx-auto">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? "text-[#D95326] dark:text-amber-400 font-extrabold"
                    : "text-[#5A6578] dark:text-slate-400 hover:text-[#0B2545] font-medium"
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

      {/* ================= FLOATING CIRCULAR AI BUTTON & POPUP WIDGET (BOTTOM RIGHT) ================= */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
        {/* Floating AI Chat Popup Window */}
        {isFloatingAiOpen && (
          <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[390px] h-[500px] max-h-[72vh] rounded-3xl bg-[#FAF8F5] dark:bg-slate-900 border border-[#E5DEC9] dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Popup Header */}
            <div className="px-4 py-3.5 bg-[#0B2545] text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#D95326] flex items-center justify-center shrink-0 relative">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B2545] absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-white truncate">
                      Trợ lý AI FORUS
                    </h4>
                    <span className="font-mono text-[10px] text-amber-300 font-bold">
                      · 227 NVC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    Giải bài tập, LaTeX &amp; Sổ tay CS1 KHTN
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setVipInitialSection("chatbot");
                    setActiveTab("vip");
                    setIsFloatingAiOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  title="Mở toàn màn hình tại mục VIP"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    setFloatingChatMessages([
                      {
                        role: "model",
                        text: "Đã làm mới cuộc trò chuyện! Bạn cần mình giải thích môn đại cương nào hay tra cứu thông tin gì tại Cơ sở 1 (227 Nguyễn Văn Cừ)?",
                      },
                    ])
                  }
                  title="Xóa lịch sử chat"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFloatingAiOpen(false)}
                  title="Đóng cửa sổ chat"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-[#F3EFE6] dark:bg-slate-800 border-b border-[#E5DEC9] dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                "Khai triển Maclaurin hàm sin(x)",
                "Template LaTeX Đồ án 1",
                "Sơ đồ tòa nhà CS1",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendFloatingChat(chip)}
                  disabled={isFloatingSending}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-[#E5E0D5] dark:border-slate-700 text-[11px] font-bold text-[#0B2545] dark:text-slate-200 hover:bg-[#0B2545] hover:text-white transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={floatingChatScrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FAF8F5] dark:bg-slate-950/60"
            >
              {floatingChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#0B2545] text-white font-medium rounded-br-xs shadow-xs"
                        : "bg-white dark:bg-slate-800 text-[#0B2545] dark:text-slate-100 border border-[#E6E0D5] dark:border-slate-700 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isFloatingSending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-[#E6E0D5] dark:border-slate-700 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#D95326] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D95326]" />
                    Trợ lý AI FORUS đang suy nghĩ...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFloatingChat();
              }}
              className="p-2.5 bg-white dark:bg-slate-900 border-t border-[#E6E0D5] dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={floatingChatInput}
                onChange={(e) => setFloatingChatInput(e.target.value)}
                placeholder="Hỏi bài tập, LaTeX, phòng học CS1..."
                disabled={isFloatingSending}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F5F2EB] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 focus:border-[#0B2545] focus:bg-white text-xs sm:text-sm text-[#0B2545] dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!floatingChatInput.trim() || isFloatingSending}
                className="w-10 h-10 rounded-xl bg-[#D95326] hover:bg-[#C0441B] disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Circular AI Trigger Button */}
        <button
          onClick={() => setIsFloatingAiOpen((prev) => !prev)}
          aria-label="Trợ lý AI FORUS"
          title="Trợ lý AI FORUS"
          className="group relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#0B2545] hover:bg-[#163A66] text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-[#D95326]"
        >
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 z-10" />

          <div className="relative z-10 flex flex-col items-center justify-center">
            {isFloatingAiOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <>
                <Bot className="w-6 h-6 text-amber-300 group-hover:rotate-6 transition-transform" />
                <span className="font-mono text-[9px] font-extrabold tracking-tighter leading-none mt-0.5 text-white">
                  AI
                </span>
              </>
            )}
          </div>
        </button>
      </div>

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
            `Xin chào ${updated.fullName || student.fullName} (${
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
        onAddToCart={(product, variant, customMeta) => {
          handleAddProductToCart(product, variant, customMeta);
          setSelectedProduct(null);
        }}
        onAddReview={handleAddReview}
        onNotifyWhenAvailable={(product) => handleNotifyWhenAvailable(product)}
        isNotified={
          selectedProduct
            ? notifiedProductIds.includes(selectedProduct.id)
            : false
        }
        studentName={student.fullName}
        studentFaculty={student.faculty}
      />
    </div>
  );
}
