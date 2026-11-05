import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { requestForusAiReply } from "./utils/forusChatService";
import {
  Calendar,
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
} from "./data/forusData";
import { HCMUS_DOCUMENT_EVENTS } from "./data/hcmusEventsData";
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
import { EventsHub } from "./components/EventsHub";
import { AboutAndContactView } from "./components/AboutAndContactView";
import { FormattedAiMessage } from "./components/FormattedAiMessage";

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

const INITIAL_ORDER_HISTORY: OrderHistoryEntry[] = [];

const normalizeAcademicYear = (val?: string): string => {
  if (!val) return "Khóa K26 (Năm 1)";
  const map: Record<string, string> = {
    "Khóa K25 (Năm 1)": "Khóa K26 (Năm 1)",
    "Khóa K24 (Năm 2)": "Khóa K25 (Năm 2)",
    "Khóa K23 (Năm 3)": "Khóa K24 (Năm 3)",
    "Khóa K22 (Năm 4)": "Khóa K23 (Năm 4)",
  };
  return map[val] || val;
};

const INITIAL_STUDENT: StudentProfile = {
  isLoggedIn: false,
  email: "",
  studentId: "",
  fullName: "",
  faculty: "Khoa Công nghệ Thông tin (FIT)",
  avatarUrl: "",
  phone: "",
  academicYear: "Khóa K26 (Năm 1)",
  gpa: "",
  bio: "",
  tutorSubjects: "",
  personalAchievements: "",
  isTutorActive: false,
  points: 0,
  pointHistory: [],
  remindedEventIds: [],
  eventPersonalNotes: {},
};

const PRESET_AVATARS = [
  {
    id: "initials",
    label: "Chữ viết tắt",
    url: "",
  },
  {
    id: "forus-emblem",
    label: "Huy hiệu FORUS",
    url: "/assets/aistudio/c837a9a8-73eb-40b4-bbbe-701efae040ef_f48d9132.png",
  },
  {
    id: "sv-male",
    label: "SV Tự Nhiên 1",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=KhoaHCMUS&backgroundColor=b6e3f4",
  },
  {
    id: "sv-female",
    label: "SV Tự Nhiên 2",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=LinhHCMUS&backgroundColor=c0aede",
  },
  {
    id: "sv-mentor",
    label: "Gia Sư KHTN",
    url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ForusMentor&backgroundColor=d1d4f9",
  },
];

const QUICK_ACHIEVEMENT_TAGS = [
  "Điểm A+ Vi tích phân 1B",
  "Điểm A+ Đại số tuyến tính",
  "IELTS 7.0+",
  "Giải HSG Cấp Tỉnh/Quốc Gia",
  "Học bổng KKHT ĐH KHTN",
  "Kinh nghiệm 1+ năm Gia sư",
  "Vững C++ / Python / CTDL",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("forus_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("forus_student_profile_v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STUDENT,
          ...parsed,
          academicYear: normalizeAcademicYear(parsed.academicYear),
        };
      } catch {
        return INITIAL_STUDENT;
      }
    }
    return INITIAL_STUDENT;
  });

  const [gearProducts, setGearProducts] = useState<ProductItem[]>(
    GEAR_AND_RENTAL_PRODUCTS
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [heroGlowPos, setHeroGlowPos] = useState<{ x: number; y: number }>({
    x: 35,
    y: 45,
  });
  const [activeHeroPillar, setActiveHeroPillar] = useState<number>(0);
  const [aboutActiveTab, setAboutActiveTab] = useState<
    "ecosystem" | "events" | "smart-tools" | "mission"
  >("ecosystem");

  // Login form state inside Avatar Profile Popover when !student.isLoggedIn
  const [loginEmail, setLoginEmail] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [loginFullName, setLoginFullName] = useState("");
  const [loginFaculty, setLoginFaculty] = useState(HCMUS_FACULTIES[0]);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Quick account & tutor profile edit state inside Avatar Account Panel
  const [editName, setEditName] = useState(student.fullName);
  const [editStudentId, setEditStudentId] = useState(student.studentId);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editFaculty, setEditFaculty] = useState(student.faculty);
  const [editAvatarUrl, setEditAvatarUrl] = useState(student.avatarUrl || "");
  const [editPhone, setEditPhone] = useState(student.phone || "");
  const [editAcademicYear, setEditAcademicYear] = useState(
    normalizeAcademicYear(student.academicYear)
  );
  const [editGpa, setEditGpa] = useState(student.gpa || "");
  const [editBio, setEditBio] = useState(student.bio || "");
  const [editTutorSubjects, setEditTutorSubjects] = useState(
    student.tutorSubjects || ""
  );
  const [editPersonalAchievements, setEditPersonalAchievements] = useState(
    student.personalAchievements || ""
  );
  const [editIsTutorActive, setEditIsTutorActive] = useState(
    student.isTutorActive ?? false
  );
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Home Unified Catalog Filters, Search & Sort
  const [homeCatalogFilter, setHomeCatalogFilter] = useState<
    "all" | "tech-gear" | "study-aid" | "rental"
  >("all");
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [homeSortBy, setHomeSortBy] = useState<
    "featured" | "price-asc" | "points-desc"
  >("featured");

  // Order History & Reorder State
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>(
    INITIAL_ORDER_HISTORY
  );
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "shipping" | "completed"
  >("all");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Home Voucher & Group Lab Mode State
  const [redeemedHomeVouchers, setRedeemedHomeVouchers] = useState<string[]>(
    []
  );
  const [homeLabCode, setHomeLabCode] = useState("LAB-TOA-F-09");
  const [isHomeGroupOrderOn, setIsHomeGroupOrderOn] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const requireLogin = (featureName?: string): boolean => {
    if (student.isLoggedIn) return true;
    setIsAccountMenuOpen(true);
    showToast(
      `🔒 Vui lòng đăng nhập tài khoản Sinh viên ĐH KHTN để sử dụng ${
        featureName || "tính năng này"
      }!`
    );
    return false;
  };

  const handleNotifyWhenAvailable = (item: ProductItem) => {
    if (!requireLogin("tính năng Nhận thông báo có hàng")) return;
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
    if (!requireLogin("tính năng Cập nhật trạng thái kho")) return;
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

  const getVariantAdjustedPrice = (
    v: PricingVariant,
    model?: { priceDelta?: number } | null
  ) => {
    if (!model || !model.priceDelta || v.type === "rent") return v.price;
    return Math.max(10000, v.price + model.priceDelta);
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
    const finalPrice = getVariantAdjustedPrice(chosenVariant, chosenModel);
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

    const activeImageUrl = chosenModel?.imageUrl || item.imageUrl;

    return {
      chosenVariant,
      chosenModel,
      finalPrice,
      customMeta,
      variantForCart,
      activeImageUrl,
    };
  };

  // VIP initial section & Floating AI Assistant state
  const [vipInitialSection, setVipInitialSection] = useState<
    "events" | "chatbot"
  >("chatbot");
  const FREE_AI_QUESTION_LIMIT = 5;
  const [aiQuestionsUsed, setAiQuestionsUsed] = useState<number>(() => {
    const saved = localStorage.getItem("forus_ai_questions_used_v2");
    return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
  });

  useEffect(() => {
    localStorage.setItem("forus_ai_questions_used_v2", String(aiQuestionsUsed));
  }, [aiQuestionsUsed]);

  const incrementAiUsage = () => {
    setAiQuestionsUsed((prev) => prev + 1);
  };

  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);
  const [floatingChatMessages, setFloatingChatMessages] = useState<
    { role: "user" | "model"; text: string }[]
  >([
    {
      role: "model",
      text: `Chào ${
        student.isLoggedIn && student.fullName
          ? student.fullName.split(" ").slice(-1)[0]
          : "bạn"
      }! Mình là **Trợ lý AI FORUS** dành cho sinh viên ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ).\n\nBạn có thể hỏi mình ngay tại đây về:\n- Giải bài tập **Vi tích phân 1B, Đại số tuyến tính, Xác suất thống kê, Nhập môn lập trình C/C++**\n- Cú pháp **LaTeX** gõ báo cáo Đồ án 1 (CSC00006)\n- Tòa nhà, phòng học, căn tin & sự kiện săn Điểm Rèn Luyện tại Cơ sở 1!`,
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
    if (!requireLogin("Trợ lý AI FORUS")) return;
    const promptText = (customPrompt ?? floatingChatInput).trim();
    if (!promptText || isFloatingSending) return;

    const isVipMember = student.points >= 100;
    if (!isVipMember && aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT) {
      setFloatingChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `🔒 **Bạn đã sử dụng hết ${FREE_AI_QUESTION_LIMIT}/${FREE_AI_QUESTION_LIMIT} câu hỏi miễn phí** khi chưa kích hoạt VIP 100đ.\n\nHãy **kích hoạt VIP 100 điểm** (tích điểm qua đơn mua hàng/thuê đồ hoặc bấm nút Kích hoạt VIP ngay bên dưới) để hỏi **Trợ lý AI FORUS không giới hạn (∞)** 24/7 nhé!`,
        },
      ]);
      showToast(
        `Đã hết ${FREE_AI_QUESTION_LIMIT}/${FREE_AI_QUESTION_LIMIT} lượt hỏi miễn phí! Kích hoạt VIP 100đ để hỏi không giới hạn.`
      );
      return;
    }

    const currentHistory = [...floatingChatMessages];
    const updatedMessages: { role: "user" | "model"; text: string }[] = [
      ...floatingChatMessages,
      { role: "user", text: promptText },
    ];
    setFloatingChatMessages(updatedMessages);
    if (!customPrompt) setFloatingChatInput("");
    setIsFloatingSending(true);

    try {
      const replyText = await requestForusAiReply({
        message: promptText,
        history: currentHistory,
        studentInfo: {
          fullName: student.fullName,
          studentId: student.studentId,
          email: student.email,
          faculty: student.faculty,
          points: student.points,
        },
      });
      incrementAiUsage();
      setFloatingChatMessages((prev) => [
        ...prev,
        { role: "model", text: replyText },
      ]);
    } catch {
      setFloatingChatMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Hiện tại hệ thống đang xử lý, bạn vui lòng thử gửi lại câu hỏi nhé!",
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
    localStorage.setItem("forus_student_profile_v3", JSON.stringify(student));
    if (student.isLoggedIn && student.email) {
      try {
        const rawMap = localStorage.getItem("forus_saved_accounts_map_v1");
        const map: Record<string, StudentProfile> = rawMap
          ? JSON.parse(rawMap)
          : {};
        map[student.email.toLowerCase()] = student;
        if (student.studentId) {
          map[student.studentId.toLowerCase()] = student;
        }
        localStorage.setItem(
          "forus_saved_accounts_map_v1",
          JSON.stringify(map)
        );
      } catch {
        // ignore storage errors
      }
    }
    setEditName(student.fullName);
    setEditStudentId(student.studentId);
    setEditEmail(student.email);
    setEditFaculty(student.faculty);
    setEditAvatarUrl(student.avatarUrl || "");
    setEditPhone(student.phone || "");
    setEditAcademicYear(normalizeAcademicYear(student.academicYear));
    setEditGpa(student.gpa || "");
    setEditBio(student.bio || "");
    setEditTutorSubjects(student.tutorSubjects || "");
    setEditPersonalAchievements(student.personalAchievements || "");
    setEditIsTutorActive(student.isTutorActive ?? false);
  }, [student]);

  const handleProfileLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const isValidHcmusDomain =
      cleanEmail.endsWith("@student.hcmus.edu.vn") ||
      cleanEmail.endsWith("@hcmus.edu.vn") ||
      cleanEmail.endsWith("@fit.hcmus.edu.vn") ||
      cleanEmail.endsWith("@clc.hcmus.edu.vn");

    if (!isValidHcmusDomain) {
      setLoginError(
        "Vui lòng đăng nhập bằng Email Sinh viên ĐH KHTN (VD: MSSV@student.hcmus.edu.vn)."
      );
      return;
    }

    if (!loginFullName.trim() || !loginStudentId.trim()) {
      setLoginError("Vui lòng nhập đầy đủ Họ và tên và Mã số sinh viên (MSSV).");
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError("Vui lòng nhập mật khẩu tài khoản sinh viên.");
      return;
    }

    setLoginError(null);
    const derivedId = loginStudentId.trim() || cleanEmail.split("@")[0];

    // Restore any previously saved profile for this email/studentId if user logged in before
    let restoredProfile: Partial<StudentProfile> = {};
    try {
      const rawMap = localStorage.getItem("forus_saved_accounts_map_v1");
      if (rawMap) {
        const map: Record<string, StudentProfile> = JSON.parse(rawMap);
        const match =
          map[cleanEmail] || map[derivedId.toLowerCase()];
        if (match) {
          restoredProfile = match;
        }
      }
    } catch {
      // ignore
    }

    setStudent((prev) => ({
      ...prev,
      ...restoredProfile,
      isLoggedIn: true,
      email: cleanEmail,
      studentId: derivedId,
      fullName: loginFullName.trim(),
      faculty: loginFaculty,
    }));
    setLoginPassword("");
    showToast(
      `✅ Đăng nhập thành công: ${loginFullName.trim()} (${derivedId})! Đã lưu phiên đăng nhập tự động.`
    );
  };

  const handleLogout = () => {
    setStudent(INITIAL_STUDENT);
    setIsEditingAccount(false);
    setIsFloatingAiOpen(false);
    setIsCartOpen(false);
    setLoginEmail("");
    setLoginStudentId("");
    setLoginFullName("");
    setLoginPassword("");
    setLoginError(null);
    showToast("Đã đăng xuất khỏi tài khoản Sinh viên FORUS.");
  };

  // Always scroll to top when switching sections/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getMembershipTierName = (pts: number) => {
    if (pts >= 100) return "VIP FORUS (Đã mở khóa)";
    if (pts >= 50) return "Hạng Bạc FORUS";
    return "Hạng Tiêu Chuẩn";
  };

  const earnPoints = (pointsToAdd: number, reason: string) => {
    if (!student.isLoggedIn) return;
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
    if (!requireLogin("tính năng Đổi điểm Voucher VIP")) return false;
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
    if (!requireLogin("tính năng Kích hoạt VIP")) return;
    setStudent((prev) => {
      const targetPoints = Math.max(prev.points, 100);
      const added = Math.max(100 - prev.points, 10);
      return {
        ...prev,
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

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      showToast("⚠️ Ảnh đại diện quá lớn (tối đa 2.5MB). Vui lòng chọn ảnh nhẹ hơn!");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditAvatarUrl(reader.result);
        setStudent((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
        showToast("✅ Đã cập nhật ảnh đại diện sinh viên!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAppendAchievementTag = (tag: string) => {
    setEditPersonalAchievements((prev) => {
      const current = prev.trim();
      if (!current) return tag;
      if (current.toLowerCase().includes(tag.toLowerCase())) return current;
      return `${current} · ${tag}`;
    });
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
      studentId: editStudentId.trim(),
      email: formattedEmail,
      faculty: editFaculty,
      avatarUrl: editAvatarUrl.trim(),
      phone: editPhone.trim(),
      academicYear: editAcademicYear.trim(),
      gpa: editGpa.trim(),
      bio: editBio.trim(),
      tutorSubjects: editTutorSubjects.trim(),
      personalAchievements: editPersonalAchievements.trim(),
      isTutorActive: editIsTutorActive,
    }));
    setIsEditingAccount(false);
    showToast("✅ Đã lưu thông tin cá nhân, ảnh đại diện & hồ sơ thành tích gia sư!");
  };

  const handleAddProductToCart = (
    product: ProductItem,
    variant?: PricingVariant,
    customMeta?: string
  ) => {
    if (!requireLogin("tính năng Thuê & Mua học cụ")) return;
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
            chosenVariant.type === "rent"
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
    if (!requireLogin("tính năng Đặt lại đơn hàng")) return;
    const allProducts = [...gearProducts];
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
    if (!requireLogin("dịch vụ Đặt in ấn tài liệu A1–A5")) return;
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
    if (!requireLogin("xác nhận đặt đơn hàng")) return;
    const uncreditedPoints = receipt.items.reduce(
      (sum, it) =>
        it.pointsAlreadyCredited ? sum : sum + it.pointsReward * it.quantity,
      0
    );

    if (uncreditedPoints > 0) {
      earnPoints(
        uncreditedPoints,
        `Hoàn tất đơn #${receipt.orderId}`
      );
    }

    if (receipt.pointsRedeemed && receipt.pointsRedeemed > 0) {
      redeemPoints(
        receipt.pointsRedeemed,
        `Giảm giá trực tiếp đơn #${receipt.orderId}`
      );
    }

    if (
      uncreditedPoints === 0 &&
      (!receipt.pointsRedeemed || receipt.pointsRedeemed === 0)
    ) {
      showToast(
        `✅ Đã xác nhận đơn #${receipt.orderId}! Đã cộng +${receipt.earnedPoints} điểm vào Hạng thành viên (${getMembershipTierName(
          student.points
        )} · ${student.points}/100đ).`
      );
    }

    const newHistoryEntry: OrderHistoryEntry = {
      orderId: receipt.orderId,
      timeLabel: "Vừa xong",
      pickupSpot: receipt.deliveryLocation,
      pointsEarned: receipt.earnedPoints,
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
    if (!requireLogin("tính năng Đánh giá sản phẩm")) return;
    const updateList = (list: ProductItem[]) =>
      list.map((p) =>
        p.id === productId ? { ...p, reviews: [review, ...p.reviews] } : p
      );
    setGearProducts((prev) => updateList(prev));
    setSelectedProduct((prev) =>
      prev && prev.id === productId
        ? { ...prev, reviews: [review, ...prev.reviews] }
        : prev
    );
    earnPoints(5, "Đánh giá chất lượng sản phẩm FORUS");
  };

  const handleToggleEventReminder = (eventId: string, eventTitle: string) => {
    if (!requireLogin("tính năng Nhắc tham gia sự kiện")) return;
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
    if (!requireLogin("tính năng Lưu ghi chú sự kiện")) return;
    setStudent((prev) => ({
      ...prev,
      eventPersonalNotes: {
        ...prev.eventPersonalNotes,
        [eventId]: note,
      },
    }));
    showToast("Đã lưu ghi chú cá nhân cho sự kiện!");
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

  // Navigation items (6 Service Tabs — Events Hub replaces Food)
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
      id: "gear",
      label: "Thuê & Bán",
      shortLabel: "Thuê & Bán",
      icon: <ShoppingBag className="w-4 h-4" />,
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
      id: "events",
      label: "Sự kiện",
      shortLabel: "Sự kiện",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "vip",
      label: "Tính năng",
      shortLabel: "Tính năng",
      icon: <Crown className="w-4 h-4" />,
    },
  ];

  // Equipment & Study Gear catalog for Home Tab (No food items)
  const allCatalogProducts = [...gearProducts];
  const filteredHomeCatalog = allCatalogProducts
    .filter((item) => {
      const matchesCat =
        homeCatalogFilter === "all"
          ? true
          : item.category === homeCatalogFilter;
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
      className={`min-h-screen w-full max-w-[100vw] overflow-x-clip transition-colors duration-300 ${
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

      {/* Fixed Top Header: Stays pinned at the top of the viewport when scrolling on desktop & mobile */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#FAF8F5]/95 dark:bg-[#0D1525]/95 border-b border-[#E5DEC9] dark:border-slate-800 shadow-2xs transition-colors">
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6">
          <div className="h-20 sm:h-24 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: FORUS Brand Logo (Horizontal logo with FORUS text in both Light & Dark modes) */}
            <button
              onClick={() => switchTab("home")}
              className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer py-1"
            >
              <img
                src={isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight}
                alt="FORUS Logo"
                className="h-12 sm:h-15 lg:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105 dark:drop-shadow-[0_1px_8px_rgba(255,255,255,0.22)]"
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

            {/* Right Controls: [Student Avatar] -> [1. Icon-only Sun/Moon] -> [2. Cart] -> [3. Icon-only Menu Button] */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Student Avatar Button (Requires Login when !student.isLoggedIn, Opens Profile when Logged In) */}
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                aria-label={
                  student.isLoggedIn
                    ? "Hồ sơ cá nhân & Thành tích Gia sư"
                    : "Đăng nhập tài khoản Sinh viên"
                }
                title={
                  student.isLoggedIn
                    ? `${student.fullName} (${student.studentId}) — Hồ sơ & Gia sư`
                    : "Chưa đăng nhập — Bấm để đăng nhập tài khoản Sinh viên"
                }
                className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#0B2545] via-[#0284C7] to-[#10B981] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm group"
              >
                {student.isLoggedIn && student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900"
                  />
                ) : student.isLoggedIn && student.fullName ? (
                  <div className="w-full h-full rounded-full bg-[#FAF8F5] dark:bg-slate-900 flex items-center justify-center text-[#0B2545] dark:text-white font-extrabold text-xs tracking-tighter group-hover:bg-sky-50 dark:group-hover:bg-slate-800 transition-colors">
                    {student.fullName
                      .trim()
                      .split(/\s+/)
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-[#FAF8F5] dark:bg-slate-900 flex items-center justify-center text-[#0B2545] dark:text-white group-hover:bg-sky-50 dark:group-hover:bg-slate-800 transition-colors">
                    <UserCheck className="w-4 h-4 text-[#0B2545] dark:text-slate-200" />
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                    student.isLoggedIn ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                  title={
                    student.isLoggedIn
                      ? "Đã đăng nhập Email SV"
                      : "Chưa đăng nhập"
                  }
                />
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

              {/* 2. Minimalist Icon-only Cart Button matched to Header Surface */}
              <button
                onClick={() => {
                  if (requireLogin("Giỏ hàng FORUS")) {
                    setIsCartOpen(true);
                  }
                }}
                aria-label="Giỏ hàng"
                title={`Giỏ hàng (${totalCartItems})`}
                className="relative w-10 h-10 rounded-xl bg-[#F2EFE9] hover:bg-[#E6E0D5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2545] dark:text-slate-100 border border-[#E5E0D5] dark:border-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-[#0B2545] dark:text-slate-100" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D95326] text-white font-mono font-extrabold text-[10px] flex items-center justify-center tabular-nums border-2 border-[#FAF8F5] dark:border-[#0D1525]">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* 3. Icon-only Menu Button (Next to Cart: No text or logo) */}
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Mở Menu VIP, Mã QR & Liên hệ"
                title="Trạng thái VIP, Điểm tích lũy, Mã QR & Liên hệ"
                className="w-10 h-10 rounded-xl bg-[#F2EFE9] hover:bg-[#E6E0D5] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0B2545] dark:text-slate-100 border border-[#E5E0D5] dark:border-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <Menu className="w-5 h-5 text-[#D95326] dark:text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="h-20 sm:h-24 shrink-0" aria-hidden="true" />

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileUpload}
        className="hidden"
      />

      {/* ================= AVATAR ACCOUNT, LOGIN REQUIRED, EDIT PROFILE & TUTOR ACHIEVEMENTS MODAL ================= */}
      {isAccountMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 sm:pt-24 px-3 sm:px-6 lg:px-10">
          {/* Backdrop */}
          <div
            onClick={() => setIsAccountMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
          />

          {/* Popover Card */}
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-slate-900 text-[#0B2545] dark:text-slate-100 shadow-2xl border border-[#E5DEC9] dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {!student.isLoggedIn ? (
              /* ================= UNAUTHENTICATED VIEW: REQUIRE LOGIN FIRST ================= */
              <>
                <div className="p-5 bg-gradient-to-br from-[#0B2545] via-[#0F3156] to-[#134E5E] text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-7 h-7 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30">
                        Chưa đăng nhập
                      </span>
                      <h2 className="font-extrabold text-base text-white truncate mt-1">
                        Đăng nhập Tài khoản Sinh viên
                      </h2>
                      <p className="text-xs text-sky-200/90 truncate">
                        Vui lòng đăng nhập để xem &amp; chỉnh sửa Hồ sơ FORUS
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAccountMenuOpen(false)}
                    aria-label="Đóng khung đăng nhập"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleProfileLoginSubmit}
                  className="p-5 space-y-3.5 max-h-[76vh] overflow-y-auto text-xs"
                >
                  <div className="rounded-2xl bg-[#F3EFE6] dark:bg-slate-800/90 border border-[#E5DEC9] dark:border-slate-700 p-3.5 text-[#334155] dark:text-slate-300 leading-relaxed">
                    <p className="font-extrabold text-[#0B2545] dark:text-white mb-0.5">
                      Xác thực tài khoản Sinh viên ĐH Khoa học Tự nhiên
                    </p>
                    <p className="text-[11px]">
                      Sử dụng email sinh viên trường (<span className="font-mono font-bold text-[#D95326] dark:text-amber-300">@student.hcmus.edu.vn</span>) để truy cập hồ sơ cá nhân, đăng ký làm Gia sư KHTN, thuê học cụ không cần cọc CCCD và tích điểm VIP.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                      Email Sinh viên HCMUS <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLoginEmail(val);
                        if (!loginStudentId && val.includes("@")) {
                          setLoginStudentId(val.split("@")[0]);
                        }
                      }}
                      placeholder="Nhập email SV (VD: MSSV@student.hcmus.edu.vn)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-mono text-xs text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                        Mã số sinh viên (MSSV) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={loginStudentId}
                        onChange={(e) => setLoginStudentId(e.target.value)}
                        placeholder="Nhập MSSV của bạn"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-mono font-bold text-xs text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                        Họ và tên sinh viên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={loginFullName}
                        onChange={(e) => setLoginFullName(e.target.value)}
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-semibold text-xs text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                        Khoa đào tạo (Cơ sở 1)
                      </label>
                      <select
                        value={loginFaculty}
                        onChange={(e) => setLoginFaculty(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-semibold text-xs text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                      >
                        {HCMUS_FACULTIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                        Mật khẩu tài khoản <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 text-xs text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Đăng Nhập Vào Hồ Sơ Sinh Viên</span>
                  </button>
                </form>
              </>
            ) : (
              /* ================= AUTHENTICATED VIEW: PROFILE & TUTOR ACHIEVEMENTS ================= */
              <>
                {/* Header with Avatar, Quick Change Avatar Button & Login Status */}
                <div className="p-5 bg-gradient-to-br from-[#0B2545] via-[#0F3156] to-[#134E5E] text-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative group shrink-0">
                      <div className="w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-emerald-400 to-amber-300">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.fullName}
                            className="w-full h-full rounded-full object-cover bg-white"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#0B2545] flex items-center justify-center text-white font-extrabold text-lg">
                            {student.fullName
                              .trim()
                              .split(/\s+/)
                              .slice(-2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase() || "SV"}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        title="Đổi ảnh đại diện từ máy"
                        className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#D95326] hover:bg-[#C0441B] text-white text-[9px] font-extrabold border border-white/80 shadow-xs cursor-pointer transition"
                      >
                        Đổi ảnh
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          Đã đăng nhập Email SV
                        </span>
                        {student.isTutorActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                            <GraduationCap className="w-3 h-3 text-amber-300" />
                            Gia sư KHTN
                          </span>
                        )}
                      </div>
                      <h2 className="font-extrabold text-base text-white truncate mt-1">
                        {student.fullName}
                      </h2>
                      <p className="text-xs font-mono text-sky-200/90 truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAccountMenuOpen(false)}
                    aria-label="Đóng thông tin tài khoản"
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[76vh] overflow-y-auto">
                  {/* 1. LOGIN & AUTHENTICATION STATUS BOX */}
                  <div className="rounded-2xl bg-[#F3EFE6] dark:bg-slate-800/90 border border-[#E5DEC9] dark:border-slate-700 p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block">
                        Phiên đăng nhập hiện tại
                      </span>
                      <p className="text-xs font-bold text-[#0B2545] dark:text-white truncate mt-0.5">
                        MSSV:{" "}
                        <span className="font-mono text-[#D95326] dark:text-amber-300">
                          {student.studentId}
                        </span>{" "}
                        · {getMembershipTierName(currentPoints).split(" (")[0]} (
                        {currentPoints}đ)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/25 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      Đăng xuất
                    </button>
                  </div>

                  {/* 2. ACCOUNT DETAILS, PERSONAL INFO & TUTOR ACHIEVEMENTS SECTION */}
                  <div className="rounded-2xl bg-white dark:bg-slate-800 border border-[#E6E0D5] dark:border-slate-700 p-4 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#D95326]" />
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#0B2545] dark:text-slate-100">
                          {isEditingAccount
                            ? "Chỉnh sửa Hồ sơ Cá nhân & Thành tích Gia sư"
                            : "Thông tin Cá nhân & Hồ sơ Gia sư"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingAccount((prev) => !prev)}
                        className="px-3 py-1 rounded-xl bg-[#D95326]/10 hover:bg-[#D95326]/20 text-xs font-extrabold text-[#D95326] dark:text-amber-300 transition cursor-pointer"
                      >
                        {isEditingAccount ? "Đóng chỉnh sửa" : "Edit Profile"}
                      </button>
                    </div>

                    {!isEditingAccount ? (
                      <div className="space-y-3.5 text-xs">
                        {/* Personal Info List */}
                        <div className="space-y-1.5">
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
                              Mã số SV · Khóa
                            </span>
                            <span className="font-mono font-bold text-[#D95326] dark:text-amber-300 tabular-nums">
                              {student.studentId} ·{" "}
                              {normalizeAcademicYear(student.academicYear)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-[#EAE5DC] dark:border-slate-700">
                            <span className="text-[#64748B] dark:text-slate-300">
                              Email trường
                            </span>
                            <span className="font-mono text-[#0B2545] dark:text-slate-200 truncate max-w-[230px]">
                              {student.email}
                            </span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-[#EAE5DC] dark:border-slate-700">
                            <span className="text-[#64748B] dark:text-slate-300">
                              Số ĐT / Zalo liên hệ
                            </span>
                            <span className="font-mono font-semibold text-[#0B2545] dark:text-slate-200">
                              {student.phone || "Chưa cập nhật"}
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
                          {student.bio && (
                            <div className="pt-1.5 border-t border-[#EAE5DC] dark:border-slate-700">
                              <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 block mb-0.5">
                                Giới thiệu cá nhân:
                              </span>
                              <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                                {student.bio}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Personal Achievements for Tutor Service Box */}
                        <div className="rounded-2xl bg-[#F3EFE6]/80 dark:bg-slate-900/90 border border-[#E5DEC9] dark:border-slate-700 p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-[#D95326] dark:text-amber-400 shrink-0" />
                              <span className="font-extrabold text-xs text-[#0B2545] dark:text-white">
                                Hồ sơ &amp; Thành tích Gia sư KHTN
                              </span>
                            </div>
                            {student.gpa && (
                              <span className="px-2 py-0.5 rounded-md bg-[#0B2545] text-amber-300 font-mono text-[10px] font-extrabold">
                                GPA: {student.gpa}
                              </span>
                            )}
                          </div>

                          {student.tutorSubjects && (
                            <div className="text-[11px] text-[#4A5568] dark:text-slate-300">
                              <strong className="text-[#0B2545] dark:text-slate-100">
                                Môn nhận dạy:
                              </strong>{" "}
                              {student.tutorSubjects}
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-[#0B2545] dark:text-slate-200 block">
                              Thành tích cá nhân nổi bật:
                            </span>
                            {student.personalAchievements ? (
                              <div className="flex flex-wrap gap-1.5">
                                {student.personalAchievements
                                  .split(/[·•,;|\n]+/)
                                  .map((item) => item.trim())
                                  .filter(Boolean)
                                  .map((ach, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#E5DEC9] dark:border-slate-700 text-[11px] font-semibold text-[#0B2545] dark:text-slate-200"
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      {ach}
                                    </span>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-[11px] italic text-[#64748B] dark:text-slate-400">
                                Chưa có thành tích cá nhân. Bấm &ldquo;Edit Profile&rdquo; để thêm thành tích khi sử dụng dịch vụ Gia sư!
                              </p>
                            )}
                          </div>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingAccount(true)}
                              className="text-[11px] font-extrabold text-[#D95326] dark:text-amber-300 hover:underline cursor-pointer"
                            >
                              + Bổ sung thành tích / Đổi ảnh đại diện
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                switchTab("tutor");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            >
                              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                              Mở dịch vụ Gia sư
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSaveInlineAccount}
                        className="space-y-3.5 text-xs"
                      >
                        {/* Section A: Change Avatar */}
                        <div className="rounded-2xl bg-[#F3EFE6]/70 dark:bg-slate-900/70 border border-[#E5DEC9] dark:border-slate-700 p-3 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-extrabold text-[#0B2545] dark:text-white">
                              1. Đổi ảnh đại diện (Avatar)
                            </label>
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-[#0B2545] hover:bg-[#163A66] text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              Tải ảnh từ thiết bị
                            </button>
                          </div>

                          {/* Quick Preset Avatars */}
                          <div className="grid grid-cols-5 gap-1.5">
                            {PRESET_AVATARS.map((preset) => {
                              const isSelected = editAvatarUrl === preset.url;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setEditAvatarUrl(preset.url)}
                                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                                    isSelected
                                      ? "border-[#D95326] bg-amber-500/10 ring-1 ring-[#D95326]"
                                      : "border-[#E5DEC9] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0B2545]"
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0B2545] text-white flex items-center justify-center font-extrabold text-[10px]">
                                    {preset.url ? (
                                      <img
                                        src={preset.url}
                                        alt={preset.label}
                                        className="w-full h-full object-cover bg-white"
                                      />
                                    ) : (
                                      editName
                                        .trim()
                                        .split(/\s+/)
                                        .slice(-2)
                                        .map((p) => p[0])
                                        .join("")
                                        .toUpperCase() || "SV"
                                    )}
                                  </div>
                                  <span className="text-[9px] font-bold text-[#0B2545] dark:text-slate-200 truncate w-full text-center">
                                    {preset.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <input
                            type="text"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="Hoặc dán link URL ảnh đại diện tại đây..."
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 text-[11px] font-mono text-[#0B2545] dark:text-white"
                          />
                        </div>

                        {/* Section B: Personal Information */}
                        <div className="space-y-2.5">
                          <p className="text-[11px] font-extrabold text-[#0B2545] dark:text-white">
                            2. Thông tin cá nhân Sinh viên
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            <div>
                              <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                                Số điện thoại / Zalo
                              </label>
                              <input
                                type="text"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="VD: 0908 227 124"
                                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-mono font-semibold text-[#0B2545] dark:text-white"
                              />
                            </div>
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
                                Khóa / Năm học
                              </label>
                              <select
                                value={editAcademicYear}
                                onChange={(e) => setEditAcademicYear(e.target.value)}
                                className="w-full px-2.5 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-semibold text-[#0B2545] dark:text-white"
                              >
                                <option value="Khóa K26 (Năm 1)">Khóa K26 (Năm 1)</option>
                                <option value="Khóa K25 (Năm 2)">Khóa K25 (Năm 2)</option>
                                <option value="Khóa K24 (Năm 3)">Khóa K24 (Năm 3)</option>
                                <option value="Khóa K23 (Năm 4)">Khóa K23 (Năm 4)</option>
                                <option value="Cao học / Nghiên cứu sinh">Cao học / NCS</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                                Khoa đào tạo
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
                            <div>
                              <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                                Email SV (@student.hcmus.edu.vn)
                              </label>
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 font-mono text-[#0B2545] dark:text-white"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                              Giới thiệu bản thân ngắn gọn
                            </label>
                            <textarea
                              rows={2}
                              value={editBio}
                              onChange={(e) => setEditBio(e.target.value)}
                              placeholder="Giới thiệu ngắn về định hướng học tập, phong cách làm việc..."
                              className="w-full px-3 py-2 rounded-xl bg-[#F5F2EB] dark:bg-slate-700 border border-[#DDD6C7] dark:border-slate-600 text-[#0B2545] dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Section C: Personal Achievements for Tutor Service */}
                        <div className="rounded-2xl bg-[#F3EFE6]/75 dark:bg-slate-900/80 border border-[#E5DEC9] dark:border-slate-700 p-3 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-[#D95326]" />
                              <span className="text-[11px] font-extrabold text-[#0B2545] dark:text-white">
                                3. Thành tích cá nhân &amp; Hồ sơ Gia sư
                              </span>
                            </div>
                            <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B2545] dark:text-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editIsTutorActive}
                                onChange={(e) =>
                                  setEditIsTutorActive(e.target.checked)
                                }
                                className="rounded accent-[#D95326]"
                              />
                              Bật hồ sơ Gia sư
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                                GPA / Điểm TB
                              </label>
                              <input
                                type="text"
                                value={editGpa}
                                onChange={(e) => setEditGpa(e.target.value)}
                                placeholder="VD: 3.68 / 4.0"
                                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 font-mono font-bold text-[#0B2545] dark:text-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                                Môn nhận Gia sư / Mentor Đại cương
                              </label>
                              <input
                                type="text"
                                value={editTutorSubjects}
                                onChange={(e) =>
                                  setEditTutorSubjects(e.target.value)
                                }
                                placeholder="Vi tích phân, Đại số, C++/Python, Toán 12..."
                                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 font-semibold text-[#0B2545] dark:text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#4A5568] dark:text-slate-300 mb-1">
                              Thành tích cá nhân nổi bật (ngăn cách bằng dấu · hoặc phẩy)
                            </label>
                            <textarea
                              rows={2}
                              value={editPersonalAchievements}
                              onChange={(e) =>
                                setEditPersonalAchievements(e.target.value)
                              }
                              placeholder="VD: Giải Nhì HSG Toán Tỉnh · IELTS 7.5 · Điểm A+ Vi tích phân 1B..."
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-600 text-[#0B2545] dark:text-white"
                            />
                            <div className="pt-1.5 flex flex-wrap gap-1">
                              {QUICK_ACHIEVEMENT_TAGS.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleAppendAchievementTag(tag)}
                                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-[#0B2545] hover:text-white border border-[#DDD6C7] dark:border-slate-700 text-[10px] font-semibold text-[#4A5568] dark:text-slate-300 transition cursor-pointer"
                                >
                                  + {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingAccount(false)}
                            className="px-4 py-2.5 rounded-xl border border-[#DDD6C7] dark:border-slate-700 text-[#4A5568] dark:text-slate-300 font-bold text-xs hover:bg-[#F3EFE6] dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs transition cursor-pointer shadow-xs"
                          >
                            Lưu Hồ Sơ Cá Nhân &amp; Thành Tích Gia Sư
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Persistent Session Note & Full-Width Logout Option */}
                  <div className="pt-1 flex items-center justify-between gap-3 border-t border-[#EAE5DC] dark:border-slate-700 text-[11px] text-[#64748B] dark:text-slate-400">
                    <span>
                      ✓ Đã ghi nhớ phiên đăng nhập tự động trên thiết bị này
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/25 font-extrabold text-xs transition cursor-pointer shrink-0"
                    >
                      Đăng xuất tài khoản
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                    Menu Tiện Ích · Điểm VIP &amp; Liên Hệ FORUS
                  </h2>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-300">
                    Điểm VIP · Mã QR SV · Lịch sử điểm · Liên hệ Trạm CS1
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
                {/* 0. ACCOUNT SESSION & LOGOUT / LOGIN QUICK CARD */}
                <div className="rounded-2xl bg-[#F3EFE6] dark:bg-slate-800 border border-[#E5DEC9] dark:border-slate-700 p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block">
                      {student.isLoggedIn
                        ? "Đã đăng nhập (Tự động lưu phiên)"
                        : "Trạng thái tài khoản"}
                    </span>
                    <p className="text-xs font-extrabold text-[#0B2545] dark:text-white truncate mt-0.5">
                      {student.isLoggedIn
                        ? `${student.fullName} (${student.studentId})`
                        : "Chưa đăng nhập tài khoản Sinh viên"}
                    </p>
                  </div>
                  {student.isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/25 font-extrabold text-xs transition cursor-pointer shrink-0"
                    >
                      Đăng xuất
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAccountMenuOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs transition cursor-pointer shrink-0"
                    >
                      Đăng nhập SV
                    </button>
                  )}
                </div>

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
                        setIsMenuOpen(false);
                        switchTab("vip");
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      Mở mục Tính năng
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
                          "Voucher Giảm 10.000đ Đơn In Ấn & Giáo Trình",
                          "hv-50"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-extrabold text-[11px] transition cursor-pointer shrink-0"
                    >
                      Đổi 50 điểm (-50đ VIP)
                    </button>
                  </div>
                </div>

                {/* 2. STUDENT & WEBSITE QR CODE SECTION */}
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
                        Thẻ Định Danh Nhanh:{" "}
                        {student.isLoggedIn && student.studentId
                          ? student.studentId
                          : "Chưa đăng nhập"}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-300 leading-relaxed">
                        Đưa mã QR này tại trạm FORUS sảnh tòa I để nhận bản in A1–A5, giáo trình hoặc mượn/trả thiết bị tích điểm tức thì.
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
                  defaultName={
                    student.isLoggedIn && student.fullName
                      ? `${student.fullName} - ${student.studentId}`
                      : ""
                  }
                  defaultEmail={student.isLoggedIn ? student.email : ""}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-[1320px] mx-auto px-3 sm:px-6 py-6 sm:py-9 pb-24 lg:pb-16 overflow-x-clip">
        {/* ================= HOME TAB (REFERENCE EDITORIAL THEME & LAYOUT) ================= */}
        {activeTab === "home" && (
          <div className="space-y-10 sm:space-y-14">
            {/* Guest Mode Notice Banner when not logged in */}
            {!student.isLoggedIn && (
              <div className="rounded-2xl border border-[#E5DEC9] bg-[#F3EFE6] dark:border-slate-700 dark:bg-slate-800/90 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-amber-300 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                      Chưa đăng nhập tài khoản Sinh viên — Đăng nhập 1 lần để mở khóa mọi tính năng
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#4A5568] dark:text-slate-300">
                      Sau khi đăng nhập, phiên tài khoản sẽ được giữ tự động (không cần đăng nhập lại) cho đến khi bạn chọn <strong>Đăng xuất</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Đăng Nhập Ngay</span>
                </button>
              </div>
            )}

            {/* 1. INTERACTIVE & ANIMATED HOME INTRODUCTION HERO */}
            <section
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setHeroGlowPos({ x, y });
              }}
              className="group relative overflow-hidden rounded-3xl border border-[#1E3A5F]/40 bg-gradient-to-br from-[#061527] via-[#0B2545] to-[#0D3B4E] p-5 sm:p-8 lg:px-10 lg:py-9 text-white shadow-xl"
            >
              {/* Interactive Cursor-Following Spotlight + Animated Orbital Background */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                {/* Dynamic Cursor Spotlight */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(560px circle at ${heroGlowPos.x}% ${heroGlowPos.y}%, rgba(217, 83, 38, 0.28), rgba(56, 189, 248, 0.14) 45%, transparent 72%)`,
                  }}
                />

                {/* Architectural Grid Mesh */}
                <div
                  className="absolute inset-0 opacity-[0.16]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />

                {/* Animated Drifting Aurora Orbs */}
                <div className="animate-forus-float-slow absolute -top-24 -left-16 h-80 w-80 rounded-full bg-gradient-to-br from-[#D95326]/35 via-amber-400/20 to-transparent blur-3xl" />
                <div className="animate-forus-float-reverse absolute -right-20 -bottom-24 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-400/25 via-sky-400/20 to-transparent blur-3xl" />

                {/* Rotating Geometric Orbital Rings */}
                <div className="animate-forus-spin-slow absolute -top-28 right-1/4 h-72 w-72 rounded-full border border-white/10" />
                <div className="animate-forus-spin-slow absolute -bottom-36 left-1/3 h-80 w-80 rounded-full border border-dashed border-amber-300/20" />

                {/* Subtle Parallax Floating Campus Coordinates */}
                <div
                  className="hidden lg:block absolute top-5 right-[34%] font-mono text-[10px] tracking-widest uppercase text-sky-200/40 transition-transform duration-300"
                  style={{
                    transform: `translate3d(${(heroGlowPos.x - 50) * -0.18}px, ${(heroGlowPos.y - 50) * -0.18}px, 0)`,
                  }}
                >
                  227 NVC · 10.7626°N 106.6824°E
                </div>
                <div
                  className="hidden lg:block absolute bottom-4 right-[36%] font-mono text-[10px] tracking-widest uppercase text-amber-200/40 transition-transform duration-300"
                  style={{
                    transform: `translate3d(${(heroGlowPos.x - 50) * 0.22}px, ${(heroGlowPos.y - 50) * 0.22}px, 0)`,
                  }}
                >
                  ∫ f(x)dx · LaTeX · TechRescue · AI 24/7
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
                {/* Left Column: High-Impact Headline + Interactive 4-Pillar Dock */}
                <div className="space-y-4 lg:col-span-8">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold tracking-wider uppercase text-amber-300/90">
                    <span>ĐH KHOA HỌC TỰ NHIÊN · ĐHQG-HCM</span>
                    <span aria-hidden="true" className="text-white/30">·</span>
                    <span className="text-emerald-300">CS1 · 227 NGUYỄN VĂN CỪ</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.12]">
                    FORUS — “Tiện ích trong tay,{" "}
                    <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">
                      học hay mỗi ngày”
                    </span>
                  </h1>

                  <p className="max-w-xl text-xs sm:text-sm text-sky-100/85 leading-relaxed">
                    Trạm học cụ tuần hoàn, in ấn tốc hành tận phòng học, đồng hồ đếm ngược sự kiện &amp; Trợ lý AI học thuật dành riêng cho sinh viên KHTN.
                  </p>

                  {/* Interactive 4-Pillar Live Dock (Hover to preview, Click to launch) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {[
                      {
                        id: "gear" as ActiveTab,
                        stat: `${gearProducts.length} Danh Mục`,
                        title: "Thuê & Bán Học Cụ",
                        sub: "TechRescue, Casio, Giáo trình",
                        detail:
                          "Thuê ngắn hạn theo buổi thuyết trình (từ 15k) hoặc mua mới 80% · 90% · 100% nhận ngay tại Sảnh Tòa I.",
                        accent: "from-[#D95326] to-amber-500",
                      },
                      {
                        id: "events" as ActiveTab,
                        stat: "20 Sự Kiện",
                        title: "Đếm Ngược HCMUS",
                        sub: "Học bổng, Seminar & ĐRL",
                        detail:
                          "Theo dõi đồng hồ đếm ngược thời gian thực tới sự kiện gần nhất và bật thông báo nhắc tham gia.",
                        accent: "from-emerald-500 to-teal-400",
                      },
                      {
                        id: "print" as ActiveTab,
                        stat: "Khổ A1 – A5",
                        title: "In Ấn Tốc Hành",
                        sub: "Giao tận phòng 15 phút",
                        detail:
                          "Đặt in tài liệu đại cương, báo cáo đồ án & Poster A1 đóng ống nhựa giao tận Tòa I, B, C, E, F.",
                        accent: "from-sky-500 to-cyan-400",
                      },
                      {
                        id: "vip" as ActiveTab,
                        stat: "B1–L11 & AI",
                        title: "Sơ Đồ & LaTeX AI",
                        sub: "11 tầng CS1 · 18 mẫu LaTeX",
                        detail:
                          "Tra cứu sơ đồ phòng học các tầng CS1, copy 18 khung LaTeX chuẩn và hỏi đáp Trợ lý AI 24/7.",
                        accent: "from-amber-400 to-orange-500",
                      },
                    ].map((pillar, idx) => {
                      const isActivePillar = activeHeroPillar === idx;
                      return (
                        <button
                          key={pillar.id}
                          type="button"
                          onMouseEnter={() => setActiveHeroPillar(idx)}
                          onFocus={() => setActiveHeroPillar(idx)}
                          onClick={() => switchTab(pillar.id)}
                          className={`group/card relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                            isActivePillar
                              ? "border-amber-300/80 bg-white/15 shadow-lg -translate-y-0.5"
                              : "border-white/15 bg-white/[0.07] hover:border-white/35 hover:bg-white/10"
                          }`}
                        >
                          <div
                            className={`h-1 w-8 rounded-full bg-gradient-to-r ${pillar.accent} mb-2 transition-all duration-300 ${
                              isActivePillar ? "w-14" : "group-hover/card:w-12"
                            }`}
                          />
                          <span className="block font-mono text-xs sm:text-sm font-extrabold text-amber-300">
                            {pillar.stat}
                          </span>
                          <span className="mt-0.5 block text-xs font-extrabold text-white truncate">
                            {pillar.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-sky-100/75 truncate">
                            {pillar.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Standalone Prominent Introduction CTA Button (Non-orange Emerald-Cyan Glow) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => switchTab("about")}
                      className="group/btn inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 px-5 py-3 text-xs sm:text-sm font-extrabold text-[#05192D] ring-2 ring-emerald-200/50 shadow-[0_6px_24px_rgba(52,211,153,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_10px_30px_rgba(56,189,248,0.5)] cursor-pointer"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#05192D] text-emerald-300">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <span>Khám phá Giới thiệu chi tiết về FORUS</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Interactive Parallax Glassmorphic QR PassCard */}
                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  <div
                    className="w-full max-w-[236px] sm:max-w-[248px] flex flex-col items-center rounded-3xl border border-white/25 bg-white/95 p-4 text-center text-[#0B2545] shadow-2xl backdrop-blur-xl transition-transform duration-200 dark:border-slate-700 dark:bg-slate-900/95 dark:text-white"
                    style={{
                      transform: `perspective(900px) rotateY(${
                        (heroGlowPos.x - 50) * 0.08
                      }deg) rotateX(${(50 - heroGlowPos.y) * 0.08}deg)`,
                    }}
                  >
                    <img
                      src={
                        isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight
                      }
                      alt="FORUS Logo"
                      referrerPolicy="no-referrer"
                      className="h-8 sm:h-9 w-auto object-contain"
                    />

                    <div className="mt-2.5 rounded-2xl border border-[#E6E0D5] bg-white p-2 shadow-2xs dark:border-slate-700">
                      <img
                        src={qrDataUrl}
                        alt="Mã QR truy cập FORUS trên điện thoại"
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                      />
                    </div>

                    <div className="mt-2.5 flex items-center gap-1 text-xs font-extrabold text-[#0B2545] dark:text-white">
                      <QrCode className="h-3.5 w-3.5 text-[#D95326] shrink-0" />
                      <span>Quét QR Trải Nghiệm</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-[#64748B] dark:text-slate-400">
                      Trạm FORUS · Sảnh Tòa I (227 NVC)
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#EAE5DC] dark:border-slate-800 w-full flex items-center justify-between gap-1.5 text-[11px]">
                      {student.isLoggedIn ? (
                        <span className="font-mono font-bold text-[#0B2545] dark:text-slate-200 truncate">
                          {student.studentId} ·{" "}
                          <strong className="text-[#D95326] dark:text-amber-400">
                            {currentPoints}đ
                          </strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAccountMenuOpen(true)}
                          className="font-extrabold text-[#0B2545] dark:text-amber-300 hover:underline truncate cursor-pointer"
                        >
                          Đăng nhập SV
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        className="font-extrabold text-[#D95326] dark:text-amber-300 hover:underline inline-flex items-center gap-0.5 shrink-0 cursor-pointer"
                      >
                        <span>Thẻ SV</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. UNIFIED EQUIPMENT, CALCULATOR, TEXTBOOK & BLOUSE CATALOG */}
            <section className="space-y-6">
              {/* Top Title + Search + Sort Row */}
              <div className="flex flex-col justify-between gap-4 border-b border-[#E5DEC9] pb-5 dark:border-slate-800 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B2545] dark:text-white leading-[1.15]">
                    Tủ Thiết Bị Học Cụ, Máy Tính, Giáo Trình
                    <br className="hidden sm:inline" /> &amp; Áo Blouse Phòng Lab FORUS
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
                      placeholder="Tìm Casio 580, Vi tích phân, iPad, LaTeX..."
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
                <div className="grid grid-cols-2 sm:inline-flex sm:flex-wrap items-center gap-1.5 rounded-2xl border border-[#E5E0D5] bg-[#F2EFE9] p-1.5 dark:border-slate-700 dark:bg-slate-800 w-full sm:w-auto">
                  {[
                    {
                      id: "all",
                      label: `Tất cả (${allCatalogProducts.length})`,
                    },
                    { id: "tech-gear", label: "Bảng vẽ & LaTeX" },
                    { id: "study-aid", label: "Flashcard & Giá đỡ" },
                    { id: "rental", label: "Máy tính & Giáo trình" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setHomeCatalogFilter(
                          tab.id as typeof homeCatalogFilter
                        )
                      }
                      className={`w-full sm:w-auto rounded-xl px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-extrabold transition cursor-pointer text-center truncate ${
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

              {/* 3-Column Editorial Product Cards Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHomeCatalog.map((item, idx) => {
                  const {
                    chosenVariant,
                    chosenModel,
                    finalPrice,
                    customMeta,
                    variantForCart,
                    activeImageUrl,
                  } = getCardSelection(item);
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
                        <div className="relative h-56 overflow-hidden bg-[#F3EFE6] dark:bg-slate-900">
                          <ProductVisual
                            imageUrl={activeImageUrl}
                            alt={
                              chosenModel
                                ? `${item.name} - ${chosenModel.name}`
                                : item.name
                            }
                            fallbackIcon={item.fallbackIcon}
                            fallbackGradient={item.fallbackGradient}
                            code={
                              chosenModel
                                ? `${item.code} · ${chosenModel.name}`
                                : `${item.code} · FORUS CS1`
                            }
                            className="h-full w-full"
                          />
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 space-y-2.5">
                          {/* Clean Unboxed Metadata Kicker Line */}
                          <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                            {item.category === "rental"
                              ? "FIT PassBook · Thuê & Mua (80% / 90% / Mới 100%) · Sảnh Tòa I"
                              : "FORUS PassBook · Học cụ & LaTeX · Nhận tại Thư viện · Sảnh Tòa I"}
                          </p>

                          {/* Deep Navy Product Title */}
                          <h3
                            onClick={() => {
                              if (requireLogin("Xem chi tiết & Đánh giá học cụ")) {
                                setSelectedProduct(item);
                              }
                            }}
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
                            <div className="pt-2 space-y-2">
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
                                    {mod.priceDelta && mod.priceDelta > 0
                                      ? ` [+${mod.priceDelta.toLocaleString("vi-VN")}đ]`
                                      : mod.priceDelta && mod.priceDelta < 0
                                      ? ` [${mod.priceDelta.toLocaleString("vi-VN")}đ]`
                                      : ""}
                                  </option>
                                ))}
                              </select>

                              {/* Quick Image Thumbnail Selector when modelOptions have imageUrl */}
                              {item.modelOptions.some((m) => Boolean(m.imageUrl)) && (
                                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                                  {item.modelOptions.map((mod) => {
                                    const isSelectedMod =
                                      (chosenModel?.id || item.modelOptions?.[0]?.id) ===
                                      mod.id;
                                    return (
                                      <button
                                        key={mod.id}
                                        type="button"
                                        onClick={() =>
                                          setSelectedModelMap((prev) => ({
                                            ...prev,
                                            [item.id]: mod.id,
                                          }))
                                        }
                                        title={mod.name}
                                        className={`flex flex-col items-center rounded-xl border p-1 transition cursor-pointer ${
                                          isSelectedMod
                                            ? "border-2 border-[#D95326] bg-[#FFF8F3] shadow-2xs dark:border-amber-400 dark:bg-slate-900"
                                            : "border-[#E5E0D5] bg-[#FAF8F5] hover:border-[#0B2545]/50 dark:border-slate-700 dark:bg-slate-900/60"
                                        }`}
                                      >
                                        {mod.imageUrl && (
                                          <div className="h-9 w-full overflow-hidden rounded-md bg-white dark:bg-slate-950 flex items-center justify-center p-0.5">
                                            <img
                                              src={mod.imageUrl}
                                              alt={mod.name}
                                              className="h-full w-full object-contain"
                                            />
                                          </div>
                                        )}
                                        <span
                                          className={`mt-0.5 line-clamp-1 text-[9px] font-extrabold leading-tight ${
                                            isSelectedMod
                                              ? "text-[#D95326] dark:text-amber-300"
                                              : "text-[#0B2545] dark:text-slate-300"
                                          }`}
                                        >
                                          {mod.name
                                            .replace("Giáo trình ", "")
                                            .replace("Toán cao cấp: ", "")
                                            .replace("Tài liệu hướng dẫn học tập ", "")}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
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
                                  const vPrice = getVariantAdjustedPrice(
                                    v,
                                    chosenModel
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
                            onClick={() => {
                              if (requireLogin("Xem chi tiết & Đánh giá học cụ")) {
                                setSelectedProduct(item);
                              }
                            }}
                            className="px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white hover:bg-[#F5F2EB] text-xs font-bold text-[#0B2545] transition cursor-pointer dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddProductToCart(
                                { ...item, imageUrl: activeImageUrl },
                                variantForCart,
                                customMeta
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

            {/* 3. ORDER HISTORY, TRACKING & QUICK REORDER SECTION */}
            <section className="space-y-6">
              {/* Warm Sand Header Box */}
              <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B2545] dark:text-white">
                  Lịch Sử Mua Hàng, Tra Cứu Đơn &amp; Sơ Đồ Điểm Nhận Cơ Sở 1
                </h2>
                <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-[#4A5568] dark:text-slate-300">
                  Xem lại các đơn thuê học cụ, bản in A1–A5 và giáo trình bạn đã đặt, bấm{" "}
                  <strong className="font-bold text-[#0B2545] dark:text-white">
                    Đặt lại (Reorder)
                  </strong>{" "}
                  để thêm nhanh các mục quen thuộc vào giỏ hàng rồi chọn lại tòa nhà học hôm nay, hoặc theo dõi lộ trình giao hàng tại{" "}
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
                      , hệ thống thêm lại các thiết bị và tài liệu vào giỏ hàng để bạn chọn Tòa nhà mới theo lịch học hôm nay.
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
                {filteredOrderHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#DDD6C7] bg-[#FAF8F5]/70 py-10 px-4 text-center dark:border-slate-700 dark:bg-slate-900/50">
                    <ShoppingBag className="mx-auto h-7 w-7 text-[#94A3B8] dark:text-slate-500 mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-[#4A5568] dark:text-slate-300">
                      Chưa có đơn hàng nào
                    </p>
                    <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                      Lịch sử mua hàng sẽ hiển thị tại đây sau khi bạn ấn đặt mua trong giỏ hàng.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrderHistory.map((ord, orderIdx) => (
                      <motion.div
                        key={`${orderStatusFilter}-${ord.orderId}`}
                        initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(orderIdx * 0.08, 0.28),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5]/60 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900/60 space-y-4 transition-colors hover:border-[#D4CCBC] dark:hover:border-slate-600"
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
                                    referrerPolicy="no-referrer"
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
                                <p className="font-mono text-xs text-[#64748B] dark:text-slate-300 tabular-nums">
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
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="rounded-xl bg-[#F3EFE6] p-3.5 text-xs text-[#0B2545] dark:bg-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-2"
                        >
                          <span>
                            🚚 <strong>Lộ trình đơn #{ord.orderId}:</strong> Đã xác nhận tại Trạm FORUS Cổng 227 NVC → Shipper sinh viên đang di chuyển tới{" "}
                            <strong>{ord.pickupSpot}</strong>.
                          </span>
                          <span className="font-mono font-bold text-[#D95326]">
                            Dự kiến giao: 5 phút nữa
                          </span>
                        </motion.div>
                      )}

                      {/* Order Footer Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300">
                          Tổng cộng ({ord.items.length} món):{" "}
                          <strong className="font-mono text-base font-extrabold text-[#0B2545] dark:text-white tabular-nums">
                            {ord.totalAmount.toLocaleString("vi-VN")}đ
                          </strong>{" "}
                          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            ({ord.promoCode})
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (!requireLogin("Tra cứu tiến trình đơn hàng")) return;
                              setTrackingOrderId((prev) =>
                                prev === ord.orderId ? null : ord.orderId
                              );
                            }}
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
                    </motion.div>
                  ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. VOUCHER REDEMPTION & EXTENSIBLE FEATURES HUB SECTION (GOM ĐƠN LAB REMOVED) */}
            <section className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90 space-y-6">
              <div className="rounded-3xl border border-[#E6E0D5] bg-white p-5 sm:p-7 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                    <Gift className="h-3.5 w-3.5 text-amber-300" />
                    Kho Đổi Điểm &amp; Voucher FORUS ({currentPoints} điểm khả dụng ·{" "}
                    {getMembershipTierName(currentPoints)})
                  </span>
                  <button
                    type="button"
                    onClick={() => switchTab("vip")}
                    className="text-xs font-extrabold text-[#D95326] hover:underline cursor-pointer"
                  >
                    Mở mục Tính năng &amp; Trợ lý AI →
                  </button>
                </div>

                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A5568] dark:text-slate-300">
                  Khi{" "}
                  <strong className="text-[#0B2545] dark:text-white">
                    mua hàng / thuê học cụ
                  </strong>{" "}
                  (in tài liệu, thuê học cụ, kết nối gia sư), hệ thống sẽ{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    cộng điểm
                  </strong>{" "}
                  trực tiếp vào tài khoản sinh viên. Khi{" "}
                  <strong className="text-[#D95326] dark:text-amber-400">
                    đổi điểm
                  </strong>{" "}
                  nhận các gói Voucher bên dưới, hệ thống sẽ{" "}
                  <strong className="text-[#D95326] dark:text-amber-400">
                    trừ điểm
                  </strong>{" "}
                  tương ứng:
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      id: "hv-50",
                      cost: 50,
                      req: "Cần 50 điểm · Trị giá 10.000đ",
                      title: "Voucher Giảm 10.000đ Đơn In Ấn & Giáo Trình",
                      desc: "Áp dụng cho mọi đơn in tài liệu A1–A5, thuê máy tính Casio hoặc mua giáo trình đại cương tại Tòa I, F, B, C.",
                      btnLabel: "Đổi 50 điểm ngay (-50đ)",
                    },
                    {
                      id: "hv-60",
                      cost: 60,
                      req: "Cần 60 điểm · Trị giá 15.000đ",
                      title: "Voucher Giảm 15.000đ Thuê Thiết Bị & Sổ Tay AI",
                      desc: "Dùng khi thuê Combo iPad Sinh Viên, MacroPad LaTeX hoặc Sổ tay Toán cho AI CSC00006.",
                      btnLabel: "Đổi 60 điểm ngay (-60đ)",
                    },
                    {
                      id: "hv-100",
                      cost: 100,
                      req: "Cần 100 điểm · Giảm 15% tổng đơn",
                      title: "Đặc Quyền Giảm 15% Toàn Bộ Giỏ Hàng Tuần Này",
                      desc: "Ưu đãi cao nhất dành cho thành viên tích điểm năng nổ tại Cơ sở 1 (227 NVC).",
                      btnLabel: "Đổi 100 điểm ngay (-100đ)",
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
                              ? `Đổi thêm lần nữa (-${v.cost}đ)`
                              : canAfford
                              ? v.btnLabel
                              : `Thiếu ${v.cost - currentPoints} điểm`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= AUTHENTICATION GATE FOR FEATURE TABS WHEN LOGGED OUT ================= */}
        {!student.isLoggedIn &&
          (activeTab === "events" ||
            activeTab === "print" ||
            activeTab === "tutor" ||
            activeTab === "gear" ||
            activeTab === "vip") && (
            <div className="max-w-xl mx-auto my-4 sm:my-8 rounded-3xl border border-[#E5DEC9] bg-white dark:border-slate-700 dark:bg-slate-900 shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-[#0B2545] via-[#0F3156] to-[#134E5E] text-white space-y-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Yêu cầu đăng nhập tài khoản Sinh viên
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  Đăng nhập 1 lần để sử dụng tính năng{" "}
                  {navItems.find((n) => n.id === activeTab)?.label || "FORUS"}
                </h2>
                <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                  Chỉ sinh viên đã đăng nhập mới được sử dụng các tính năng của FORUS. Sau khi đăng nhập lần đầu, hệ thống tự động lưu phiên của bạn — không cần đăng nhập lại cho đến khi bạn bấm <strong>Đăng xuất</strong>.
                </p>
              </div>

              <form
                onSubmit={handleProfileLoginSubmit}
                className="p-6 space-y-4 text-xs sm:text-sm"
              >
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                    Email Sinh viên HCMUS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLoginEmail(val);
                      if (!loginStudentId && val.includes("@")) {
                        setLoginStudentId(val.split("@")[0]);
                      }
                    }}
                    placeholder="Nhập email SV (VD: MSSV@student.hcmus.edu.vn)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-mono text-xs sm:text-sm text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                      Mã số sinh viên (MSSV) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginStudentId}
                      onChange={(e) => setLoginStudentId(e.target.value)}
                      placeholder="Nhập MSSV của bạn"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-mono font-bold text-xs sm:text-sm text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                      Họ và tên sinh viên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={loginFullName}
                      onChange={(e) => setLoginFullName(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-semibold text-xs sm:text-sm text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                      Khoa đào tạo (Cơ sở 1)
                    </label>
                    <select
                      value={loginFaculty}
                      onChange={(e) => setLoginFaculty(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 font-semibold text-xs sm:text-sm text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                    >
                      {HCMUS_FACULTIES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] dark:text-slate-200 mb-1">
                      Mật khẩu tài khoản <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-slate-800 border border-[#DDD6C7] dark:border-slate-700 text-xs sm:text-sm text-[#0B2545] dark:text-white focus:border-[#0B2545] focus:outline-none"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {loginError}
                  </div>
                )}

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 rounded-2xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Đăng Nhập &amp; Mở Khóa Tính Năng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("home")}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-[#DDD6C7] dark:border-slate-700 text-[#4A5568] dark:text-slate-300 font-bold text-xs hover:bg-[#F3EFE6] dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Về Trang chủ
                  </button>
                </div>
              </form>
            </div>
          )}

        {/* ================= EVENTS HUB TAB (REPLACES FOOD TAB) ================= */}
        {student.isLoggedIn && activeTab === "events" && (
          <EventsHub
            student={student}
            onToggleReminder={handleToggleEventReminder}
            onSaveEventNote={handleSaveEventNote}
            onEarnPoints={earnPoints}
            onShowToast={showToast}
          />
        )}

        {/* ================= PRINT CONFIGURATOR TAB ================= */}
        {student.isLoggedIn && activeTab === "print" && (
          <PrintConfigurator onAddPrintToCart={handleAddPrintToCart} />
        )}

        {/* ================= TUTOR HUB TAB ================= */}
        {student.isLoggedIn && activeTab === "tutor" && (
          <TutorHub
            onEarnPoints={earnPoints}
            student={student}
            onOpenEditProfile={() => {
              setIsAccountMenuOpen(true);
              setIsEditingAccount(true);
            }}
          />
        )}

        {/* ================= RENT & BUY (9 ITEMS) TAB ================= */}
        {student.isLoggedIn && activeTab === "gear" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="rounded-3xl border border-[#E5DEC9] bg-[#F3EFE6] p-6 sm:p-8 dark:border-slate-700/80 dark:bg-slate-800/90">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
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

                <div className="grid grid-cols-2 sm:inline-flex sm:flex-wrap items-center gap-1.5 rounded-2xl border border-[#E5E0D5] bg-white/90 p-1.5 dark:border-slate-700 dark:bg-slate-900 w-full lg:w-auto">
                  {[
                    { id: "all", label: `Tất cả (${gearProducts.length} mục)` },
                    { id: "tech-gear", label: "Bảng vẽ & LaTeX" },
                    { id: "study-aid", label: "Flashcard & Giá đỡ" },
                    {
                      id: "rental",
                      label: "Máy tính & Giáo trình",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setGearFilter(tab.id as typeof gearFilter)}
                      className={`w-full sm:w-auto px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition text-center truncate cursor-pointer ${
                        gearFilter === tab.id
                          ? "bg-[#0B2545] text-white shadow-2xs dark:bg-amber-400 dark:text-slate-950"
                          : "bg-[#FAF8F5] sm:bg-transparent text-[#5A6578] hover:text-[#0B2545] dark:bg-slate-800/70 sm:dark:bg-transparent dark:text-slate-300"
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
                  activeImageUrl,
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
                      <div className="relative h-60 bg-[#F3EFE6] dark:bg-slate-900/75">
                        <ProductVisual
                          imageUrl={activeImageUrl}
                          alt={
                            chosenModel
                              ? `${item.name} - ${chosenModel.name}`
                              : item.name
                          }
                          fallbackIcon={item.fallbackIcon}
                          fallbackGradient={item.fallbackGradient}
                          code={
                            chosenModel
                              ? `${item.code} · ${chosenModel.name}`
                              : `${item.code} · FORUS CS1`
                          }
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
                          <div className="pt-2 border-t border-[#EAE5DC] dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="block text-[11px] font-extrabold text-[#0B2545] dark:text-slate-200">
                                1. {item.modelSelectorLabel || "Chọn phân loại:"}
                              </label>
                              {chosenModel && (
                                <span className="font-mono text-[10px] font-bold text-[#D95326] dark:text-amber-300 truncate max-w-[160px]">
                                  {chosenModel.name}
                                </span>
                              )}
                            </div>
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
                                  {mod.priceDelta && mod.priceDelta > 0
                                    ? ` (+${mod.priceDelta.toLocaleString("vi-VN")}đ)`
                                    : mod.priceDelta && mod.priceDelta < 0
                                    ? ` (${mod.priceDelta.toLocaleString("vi-VN")}đ)`
                                    : ""}
                                </option>
                              ))}
                            </select>

                            {/* Interactive Product Thumbnail Grid when modelOptions have imageUrl */}
                            {item.modelOptions.some((m) => Boolean(m.imageUrl)) && (
                              <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                                {item.modelOptions.map((mod) => {
                                  const isSelectedMod =
                                    (chosenModel?.id || item.modelOptions?.[0]?.id) ===
                                    mod.id;
                                  return (
                                    <button
                                      key={mod.id}
                                      type="button"
                                      disabled={isRented}
                                      onClick={() =>
                                        setSelectedModelMap((prev) => ({
                                          ...prev,
                                          [item.id]: mod.id,
                                        }))
                                      }
                                      title={`${mod.name} — ${mod.spec || ""}`}
                                      className={`flex flex-col items-center rounded-xl border p-1 transition cursor-pointer disabled:cursor-not-allowed ${
                                        isSelectedMod
                                          ? "border-2 border-[#D95326] bg-[#FFF8F3] shadow-2xs dark:border-amber-400 dark:bg-slate-900"
                                          : "border-[#E5E0D5] bg-[#FAF8F5] hover:border-[#0B2545]/50 dark:border-slate-700 dark:bg-slate-900/60"
                                      }`}
                                    >
                                      {mod.imageUrl && (
                                        <div className="h-10 w-full overflow-hidden rounded-md bg-white dark:bg-slate-950 flex items-center justify-center p-0.5">
                                          <img
                                            src={mod.imageUrl}
                                            alt={mod.name}
                                            className="h-full w-full object-contain"
                                          />
                                        </div>
                                      )}
                                      <span
                                        className={`mt-1 line-clamp-1 text-[9px] font-extrabold leading-tight ${
                                          isSelectedMod
                                            ? "text-[#D95326] dark:text-amber-300"
                                            : "text-[#0B2545] dark:text-slate-300"
                                        }`}
                                      >
                                        {mod.name
                                          .replace("Giáo trình ", "")
                                          .replace("Toán cao cấp: ", "")
                                          .replace("Tài liệu hướng dẫn học tập ", "")}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
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
                                const adjustedVPrice = getVariantAdjustedPrice(
                                  v,
                                  chosenModel
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
                              { ...item, imageUrl: activeImageUrl },
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
        {student.isLoggedIn && activeTab === "vip" && (
          <VipHub
            student={student}
            onUnlockDemoVip={handleActivateDemoVip}
            onRedeemPoints={redeemPoints}
            redeemedVoucherIds={redeemedHomeVouchers}
            onToggleReminder={handleToggleEventReminder}
            onSaveEventNote={handleSaveEventNote}
            onNavigateToShop={() => setActiveTab("gear")}
            initialSection={vipInitialSection}
            aiQuestionsUsed={aiQuestionsUsed}
            maxFreeAiQuestions={FREE_AI_QUESTION_LIMIT}
            onIncrementAiUsage={incrementAiUsage}
          />
        )}

        {/* ================= DEDICATED INTERACTIVE INTRODUCTION SHOWCASE ================= */}
        {activeTab === "about" && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Top Back Bar */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => switchTab("home")}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E5DEC9] bg-white hover:bg-[#F3EFE6] dark:border-slate-700 dark:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white transition cursor-pointer shadow-2xs"
              >
                <span>← Quay lại Trang chủ</span>
              </button>
              <span className="font-mono text-xs font-bold text-[#D95326] dark:text-amber-400">
                HCMUS · CS1 (227 Nguyễn Văn Cừ)
              </span>
            </div>

            {/* Interactive Animated Hero Card */}
            <div
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setHeroGlowPos({ x, y });
              }}
              className="relative overflow-hidden rounded-3xl border border-[#1E3A5F]/40 bg-gradient-to-br from-[#061527] via-[#0B2545] to-[#0D3B4E] p-6 sm:p-10 text-white shadow-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(500px circle at ${heroGlowPos.x}% ${heroGlowPos.y}%, rgba(217, 83, 38, 0.30), rgba(56, 189, 248, 0.14) 50%, transparent 75%)`,
                  }}
                />
                <div className="animate-forus-float-slow absolute -top-20 -right-16 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="animate-forus-float-reverse absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="animate-forus-spin-slow absolute -top-24 left-1/3 h-64 w-64 rounded-full border border-white/10" />
              </div>

              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
                  HỆ SINH THÁI TIỆN ÍCH SINH VIÊN ĐH KHOA HỌC TỰ NHIÊN
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  FORUS — “Tiện ích trong tay,{" "}
                  <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
                    học hay mỗi ngày”
                  </span>
                </h1>
                <p className="text-xs sm:text-base text-sky-100/90 leading-relaxed">
                  Kết hợp trạm thuê &amp; mua học cụ tuần hoàn, in ấn tốc hành giao tận phòng học, bản đồ 11 tầng CS1, tổng hợp sự kiện theo thời gian thực và Trợ lý AI học thuật trên một nền tảng duy nhất.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { num: "10 Danh Mục", label: "Thuê & mua học cụ 80%–100%" },
                    { num: "20 Sự Kiện", label: "Đếm ngược & nhắc lịch HCMUS" },
                    { num: "11 Tầng CS1", label: "Sơ đồ trực quan B1 – L11" },
                    { num: "18 Mẫu LaTeX", label: "Copy 1 chạm & Trợ lý AI" },
                  ].map((st, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5"
                    >
                      <span className="block font-mono text-base sm:text-lg font-extrabold text-amber-300">
                        {st.num}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-sky-100/85">
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive 4-Tab Pillar Explorer (No Long Text Walls) */}
            <div className="rounded-3xl border border-[#E5DEC9] bg-white p-5 sm:p-8 dark:border-slate-700 dark:bg-slate-900 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl bg-[#F2EFE9] p-1.5 dark:bg-slate-800">
                {[
                  { id: "ecosystem", label: "1. Học Cụ Tuần Hoàn" },
                  { id: "events", label: "2. Sự Kiện & ĐRL" },
                  { id: "smart-tools", label: "3. Sơ Đồ & LaTeX AI" },
                  { id: "mission", label: "4. Sứ Mệnh FORUS" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setAboutActiveTab(t.id as typeof aboutActiveTab)
                    }
                    className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                      aboutActiveTab === t.id
                        ? "bg-[#0B2545] text-white shadow-xs dark:bg-amber-400 dark:text-slate-950"
                        : "text-[#4A5568] hover:text-[#0B2545] dark:text-slate-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {aboutActiveTab === "ecosystem" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      tag: "Thuê theo buổi / tuần",
                      title: 'Bộ Thuyết Trình "TechRescue" & Máy Tính Casio',
                      desc: "Cứu nguy tức thì khi quên mang cổng chuyển HDMI, Hub USB-C, chuột không dây hoặc máy tính Casio fx-580VN X / 880BTG trước giờ thi và báo cáo đồ án.",
                    },
                    {
                      tag: "Độ mới 80% · 90% · 100%",
                      title: "Giáo Trình Đại Cương & Áo Blouse Phòng Lab",
                      desc: "Tự do chọn thuê ngắn hạn hoặc mua lại sách giáo trình Vi tích phân, Đại số, Xác suất và áo Blouse đã giặt ủi khử khuẩn với chi phí tiết kiệm tới 60%.",
                    },
                    {
                      tag: "Ghi chép số & LaTeX",
                      title: 'Combo "iPad Sinh Viên", MacroPad & Flashcard',
                      desc: "Bảng vẽ điện tử kèm găng tay 2 ngón, bàn phím gõ tắt công thức toán OneTap LaTeX, giá đỡ công thái học và bộ Flashcard chống nước.",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800/80"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                        {c.tag}
                      </span>
                      <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">
                        {c.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {aboutActiveTab === "events" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      tag: "Thời gian thực",
                      title: "Đồng Hồ Đếm Ngược Sự Kiện Gần Nhất",
                      desc: "Tự động làm nổi bật sự kiện sắp diễn ra tại HCMUS theo từng ngày, giờ, phút, giây để sinh viên không bỏ lỡ hạn đăng ký.",
                    },
                    {
                      tag: "Đa dạng lĩnh vực",
                      title: "Học Thuật, Học Bổng, Tình Nguyện & Kỹ Năng",
                      desc: "Tổng hợp 20 hoạt động tiêu biểu trong tháng 11–12/2026 từ seminar khoa, cuộc thi học thuật đến hiến máu và ngày hội việc làm.",
                    },
                    {
                      tag: "Cá nhân hóa",
                      title: "Bật Nhắc Hẹn & Lưu Ghi Chú Riêng",
                      desc: "Đặt lời nhắc tham gia và ghi chú lịch trình cá nhân cho từng sự kiện ngay trên tài khoản sinh viên của bạn.",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800/80"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                        {c.tag}
                      </span>
                      <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">
                        {c.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {aboutActiveTab === "smart-tools" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      tag: "Bản đồ B1 – L11",
                      title: "Sơ Đồ Chỉ Dẫn Các Tầng CS1 (227 NVC)",
                      desc: "Mô phỏng trực quan khung các tòa F, C, B, A, E, I và giảng đường theo từng tầng; chạm vào từng phòng để xem vị trí chi tiết.",
                    },
                    {
                      tag: "18 Mẫu chuẩn KHTN",
                      title: "Thư Viện Code LaTeX Copy 1 Chạm",
                      desc: "Đầy đủ mẫu ma trận Gauss, tích phân, quy nạp, bảng booktabs, mã giả thuật toán và trang bìa báo cáo Khoa CNTT.",
                    },
                    {
                      tag: "Hỗ trợ 24/7",
                      title: "Trợ Lý AI Giải Toán & Kết Nối Gia Sư",
                      desc: "Giải chi tiết từng bước Vi tích phân, Đại số, C++/Python và kết nối gia sư sinh viên KHTN uy tín theo từng môn học.",
                    },
                  ].map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E6E0D5] bg-[#FAF8F5] p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800/80"
                    >
                      <span className="font-mono text-[11px] font-bold text-[#D95326] dark:text-amber-400">
                        {c.tag}
                      </span>
                      <h3 className="text-base font-extrabold text-[#0B2545] dark:text-white">
                        {c.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {aboutActiveTab === "mission" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800/80">
                    <span className="font-mono text-xs font-bold text-[#D95326] dark:text-amber-400">
                      SỨ MỆNH CỐT LÕI
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0B2545] dark:text-white">
                      Giảm chi phí học tập · Tối ưu trải nghiệm đại học
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                      Giúp mỗi sinh viên ĐH KHTN tiếp cận đầy đủ thiết bị công nghệ, học cụ, dịch vụ in ấn và thông tin học thuật ngay tại khuôn viên 227 Nguyễn Văn Cừ với chi phí sinh viên nhất.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800/80">
                    <span className="font-mono text-xs font-bold text-[#0B2545] dark:text-sky-300">
                      TẦM NHÌN PHÁT TRIỂN
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0B2545] dark:text-white">
                      Nền tảng đồng hành toàn diện cùng cộng đồng HCMUS
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A5568] dark:text-slate-300 leading-relaxed">
                      Kết nối công cụ học tập thông minh, cơ hội phát triển kỹ năng và mạng lưới hỗ trợ sinh viên trên một hệ sinh thái số hiện đại, tiện lợi và bền vững.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="pt-4 border-t border-[#EAE5DC] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => switchTab("home")}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] hover:bg-[#F3EFE6] dark:border-slate-700 dark:bg-slate-800 text-[#0B2545] dark:text-white text-xs font-extrabold transition cursor-pointer"
                >
                  ← Về Trang chủ
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchTab("gear")}
                    className="px-4 py-2.5 rounded-xl bg-[#0B2545] hover:bg-[#163A66] text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    Mở Thuê &amp; Bán Thiết Bị →
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("vip")}
                    className="px-4 py-2.5 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white text-xs font-extrabold transition cursor-pointer"
                  >
                    Mở Tính năng &amp; Sơ đồ tầng →
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ & Contact Station Component */}
            <AboutAndContactView
              theme={theme}
              defaultName={
                student.isLoggedIn && student.fullName
                  ? `${student.fullName} - ${student.studentId}`
                  : ""
              }
              defaultEmail={student.isLoggedIn ? student.email : ""}
            />
          </div>
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
                    onClick={() => switchTab("events")}
                    className="hover:text-[#D95326] transition cursor-pointer"
                  >
                    Tổng hợp 20 Sự kiện, Hội nghị &amp; Học bổng HCMUS
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
                    Trung tâm Tính năng, LaTeX &amp; Trợ lý AI FORUS
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

            {/* VIP Quota Banner */}
            <div
              className={`px-3.5 py-2 border-b flex items-center justify-between gap-2 text-[11px] font-bold ${
                student.points >= 100
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300"
                  : aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
                  : "bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-[#B8431B] dark:text-amber-300"
              }`}
            >
              <span className="truncate">
                {student.points >= 100
                  ? "👑 Đã kích hoạt VIP: Hỏi AI Không giới hạn (∞)"
                  : `Chưa VIP: Đã dùng ${Math.min(
                      aiQuestionsUsed,
                      FREE_AI_QUESTION_LIMIT
                    )}/${FREE_AI_QUESTION_LIMIT} câu miễn phí`}
              </span>
              {student.points < 100 && (
                <button
                  type="button"
                  onClick={handleActivateDemoVip}
                  className="px-2 py-0.5 rounded-md bg-[#D95326] hover:bg-[#C0441B] text-white text-[10px] font-extrabold shrink-0 transition cursor-pointer"
                >
                  Kích hoạt VIP 100đ
                </button>
              )}
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
                  disabled={
                    isFloatingSending ||
                    (student.points < 100 &&
                      aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT)
                  }
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
                    className={`max-w-[85%] min-w-0 rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] ${
                      msg.role === "user"
                        ? "bg-[#0B2545] text-white font-medium rounded-br-xs shadow-xs"
                        : "bg-white dark:bg-slate-800 text-[#0B2545] dark:text-slate-100 border border-[#E6E0D5] dark:border-slate-700 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    <FormattedAiMessage
                      text={msg.text}
                      isUser={msg.role === "user"}
                    />
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

            {/* Input Form or VIP Lock Prompt */}
            {student.points < 100 &&
            aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT ? (
              <div className="p-3 bg-rose-50/90 dark:bg-slate-900 border-t border-rose-200 dark:border-slate-800 flex flex-col gap-2">
                <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                  🔒 Bạn đã hỏi hết {FREE_AI_QUESTION_LIMIT}/
                  {FREE_AI_QUESTION_LIMIT} câu miễn phí. Kích hoạt VIP 100đ để
                  mở khóa hỏi AI không giới hạn!
                </p>
                <button
                  type="button"
                  onClick={handleActivateDemoVip}
                  className="w-full py-2 rounded-xl bg-[#D95326] hover:bg-[#C0441B] text-white font-extrabold text-xs transition cursor-pointer shadow-xs"
                >
                  Kích Hoạt VIP 100đ Ngay (Không giới hạn ∞)
                </button>
              </div>
            ) : (
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
                  placeholder={
                    student.points >= 100
                      ? "Hỏi AI không giới hạn (VIP 100đ)..."
                      : `Còn ${
                          FREE_AI_QUESTION_LIMIT - aiQuestionsUsed
                        }/${FREE_AI_QUESTION_LIMIT} câu hỏi miễn phí...`
                  }
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
            )}
          </div>
        )}

        {/* Floating Circular AI Trigger Button */}
        <button
          onClick={() => {
            if (requireLogin("Trợ lý AI FORUS")) {
              setIsFloatingAiOpen((prev) => !prev);
            }
          }}
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
        initialModelId={
          selectedProduct ? selectedModelMap[selectedProduct.id] : undefined
        }
        initialVariantId={
          selectedProduct ? selectedVariantMap[selectedProduct.id] : undefined
        }
        onSelectModel={(modelId) => {
          if (selectedProduct) {
            setSelectedModelMap((prev) => ({
              ...prev,
              [selectedProduct.id]: modelId,
            }));
          }
        }}
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
