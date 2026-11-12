import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  requestForusAiReply,
  subscribeSharedChatExchange,
} from "./utils/forusChatService";
import {
  Home,
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
  CheckCircle2,
  X,
  Settings,
  Bot,
  Send,
  Loader2,
  Maximize2,
  Trash2,
  Award,
} from "lucide-react";
import {
  BRAND_ASSETS,
  GEAR_AND_RENTAL_PRODUCTS,
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
import { PrintConfigurator } from "./components/PrintConfigurator";
import { TutorHub } from "./components/TutorHub";
import { EventsHub } from "./components/EventsHub";
import { FormattedAiMessage } from "./components/FormattedAiMessage";
import { Gear } from "./pages/Gear";
import { About } from "./pages/About";

const VipHub = React.lazy(() => import("./components/VipHub"));

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

const VALID_TABS: ActiveTab[] = [
  "home",
  "gear",
  "events",
  "print",
  "tutor",
  "vip",
  "about",
];

const getInitialTabFromHash = (): ActiveTab => {
  if (typeof window === "undefined") return "home";
  const raw = window.location.hash.replace(/^#/, "").trim().toLowerCase();
  return (VALID_TABS.find((t) => t === raw) as ActiveTab) || "home";
};

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
    label: "Chữ tắt",
    url: "",
  },
  {
    id: "forus-emblem",
    label: "FORUS",
    url: "assets/aistudio/c837a9a8-73eb-40b4-bbbe-701efae040ef_f48d9132.png",
  },
  {
    id: "sv-male",
    label: "SV KHTN 1",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=KhoaHCMUS&backgroundColor=b6e3f4",
  },
  {
    id: "sv-female",
    label: "SV KHTN 2",
    url: "https://api.dicebear.com/9.x/adventurer/svg?seed=LinhHCMUS&backgroundColor=c0aede",
  },
  {
    id: "sv-mentor",
    label: "Gia Sư",
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
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTabFromHash);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("forus_theme");
    return saved === "dark" ? "dark" : "light";
  });

  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("forus_student_profile_v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalizedAvatar =
          typeof parsed.avatarUrl === "string"
            ? parsed.avatarUrl.replace(/^\/assets\//, "assets/")
            : "";
        return {
          ...INITIAL_STUDENT,
          ...parsed,
          avatarUrl: normalizedAvatar,
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

  // Persist cart in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("forus_cart_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("forus_cart_v1", JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Login form state inside Account Drawer when logged out
  const [loginEmail, setLoginEmail] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [loginFullName, setLoginFullName] = useState("");
  const [loginFaculty, setLoginFaculty] = useState(HCMUS_FACULTIES[0]);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Account & Tutor profile edit state
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

  const [redeemedHomeVouchers, setRedeemedHomeVouchers] = useState<string[]>(
    []
  );
  const [selectedVariantMap] = useState<Record<string, string>>({});
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
      `Vui lòng đăng nhập tài khoản Sinh viên ĐH KHTN để sử dụng ${
        featureName || "tính năng này"
      }.`
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
        `Đã đăng ký! FORUS sẽ gửi thông báo qua ${student.email} ngay khi "${item.name}" có hàng trở lại.`
      );
      return [...prev, item.id];
    });
  };

  // Sync activeTab with URL hash & browser Back/Forward buttons
  useEffect(() => {
    const onUrlChange = () => {
      const next = getInitialTabFromHash();
      setActiveTab(next === "about" ? "home" : next);
    };
    window.addEventListener("hashchange", onUrlChange);
    window.addEventListener("popstate", onUrlChange);
    return () => {
      window.removeEventListener("hashchange", onUrlChange);
      window.removeEventListener("popstate", onUrlChange);
    };
  }, []);

  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const targetHash = `#${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, "", targetHash);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      }! Mình là **Trợ lý AI FORUS** dành cho sinh viên ĐH Khoa học Tự nhiên (Cơ sở 1 - 227 Nguyễn Văn Cừ).\n\nBạn có thể hỏi mình mọi câu hỏi về:\n- Giải bài tập **Vi tích phân 1B/2B, Đại số tuyến tính, Xác suất thống kê, Vật lý, Hóa học**\n- Viết & gỡ lỗi code **C/C++, Python, Cấu trúc dữ liệu & Giải thuật**\n- Đời sống sinh viên, sơ đồ phòng học, thuê học cụ, in ấn A5–A1 & Kho Voucher FORUS!`,
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

  // Synchronize messages answered in the main VipHub chat into the floating popup
  useEffect(() => {
    return subscribeSharedChatExchange((userText, modelReply) => {
      setFloatingChatMessages((prev) => {
        const last = prev[prev.length - 1];
        const secondLast = prev[prev.length - 2];
        if (
          last?.role === "model" &&
          last?.text === modelReply &&
          secondLast?.role === "user" &&
          secondLast?.text === userText
        ) {
          return prev;
        }
        if (last?.role === "user" && last?.text === userText) {
          return [...prev, { role: "model", text: modelReply }];
        }
        return [
          ...prev,
          { role: "user", text: userText },
          { role: "model", text: modelReply },
        ];
      });
    });
  }, []);

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
          text: `**Bạn đã sử dụng hết ${FREE_AI_QUESTION_LIMIT}/${FREE_AI_QUESTION_LIMIT} câu hỏi miễn phí** khi chưa kích hoạt VIP 100đ.\n\nHãy **kích hoạt VIP 100 điểm** (tích điểm qua đơn mua hàng/thuê đồ hoặc bấm nút Kích hoạt VIP ngay bên dưới) để hỏi **Trợ lý AI FORUS không giới hạn (∞)** 24/7 nhé!`,
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
      setFloatingChatMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "model" && last?.text === replyText) {
          return prev;
        }
        return [...prev, { role: "model", text: replyText }];
      });
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
    try {
      localStorage.setItem("forus_student_profile_v3", JSON.stringify(student));
    } catch {
      // ignore storage quota errors
    }
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

    let restoredProfile: Partial<StudentProfile> = {};
    try {
      const rawMap = localStorage.getItem("forus_saved_accounts_map_v1");
      if (rawMap) {
        const map: Record<string, StudentProfile> = JSON.parse(rawMap);
        const match = map[cleanEmail] || map[derivedId.toLowerCase()];
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
    setIsAccountMenuOpen(false);
    showToast(
      `Đăng nhập thành công: ${loginFullName.trim()} (${derivedId}).`
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
          `Chúc mừng! Bạn được +${pointsToAdd}đ VIP (Tổng: ${nextPoints}/100đ) và thăng hạng ${tierLabel}!`
        );
      } else if (pointsToAdd > 0) {
        showToast(
          `+${pointsToAdd} điểm VIP (${tierLabel} · ${nextPoints}/100đ): ${reason}`
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
        `Không đủ điểm VIP! Bạn hiện có ${student.points} điểm VIP, cần đủ ${pointsCost} điểm để đổi "${voucherTitle}".`
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
      `Đã trừ -${pointsCost} điểm VIP để đổi "${voucherTitle}"! Điểm còn lại: ${nextPts}/100đ (${nextTier}).`
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
    switchTab("vip");
    showToast(
      "Đã kích hoạt 100/100 điểm VIP! Mở khóa Săn Điểm Rèn Luyện & Chatbot AI."
    );
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!");
      e.target.value = "";
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast("Ảnh đại diện quá lớn (tối đa 15MB). Vui lòng chọn ảnh nhẹ hơn!");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const targetSize = 256;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, targetSize, targetSize);
            const minSide = Math.min(img.width, img.height);
            const sx = Math.max(0, (img.width - minSide) / 2);
            const sy = Math.max(0, (img.height - minSide) / 2);
            ctx.drawImage(
              img,
              sx,
              sy,
              minSide,
              minSide,
              0,
              0,
              targetSize,
              targetSize
            );
            const compressedUrl = canvas.toDataURL("image/jpeg", 0.85);
            setEditAvatarUrl(compressedUrl);
            setStudent((prev) => ({
              ...prev,
              avatarUrl: compressedUrl,
            }));
            showToast("Đã tải lên & tối ưu ảnh đại diện sinh viên thành công!");
            return;
          }
        } catch {
          // fallback
        }
        setEditAvatarUrl(rawDataUrl);
        setStudent((prev) => ({
          ...prev,
          avatarUrl: rawDataUrl,
        }));
        showToast("Đã cập nhật ảnh đại diện sinh viên!");
      };
      img.onerror = () => {
        setEditAvatarUrl(rawDataUrl);
        setStudent((prev) => ({
          ...prev,
          avatarUrl: rawDataUrl,
        }));
        showToast("Đã cập nhật ảnh đại diện sinh viên!");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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
    const normalizedAvatar = editAvatarUrl
      .trim()
      .replace(/^\/assets\//, "assets/");

    setStudent((prev) => ({
      ...prev,
      isLoggedIn: true,
      fullName: editName.trim() || "Sinh viên KHTN",
      studentId: editStudentId.trim(),
      email: formattedEmail,
      faculty: editFaculty,
      avatarUrl: normalizedAvatar,
      phone: editPhone.trim(),
      academicYear: editAcademicYear.trim(),
      gpa: editGpa.trim(),
      bio: editBio.trim(),
      tutorSubjects: editTutorSubjects.trim(),
      personalAchievements: editPersonalAchievements.trim(),
      isTutorActive: editIsTutorActive,
    }));
    setIsEditingAccount(false);
    showToast("Đã lưu thông tin cá nhân & hồ sơ thành tích gia sư!");
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
        updated[idx].pointsAlreadyCredited = false;
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
          pointsAlreadyCredited: false,
        },
      ];
    });

    showToast(
      `Đã thêm "${product.name}" vào giỏ! (+${product.pointsReward} điểm VIP sẽ được cộng khi xác nhận thanh toán)`
    );
  };

  const handleAddPrintToCart = (
    config: PrintOrderConfig,
    calculatedPrice: number,
    pointsEarned: number
  ) => {
    if (!requireLogin("dịch vụ Đặt in ấn tài liệu A1–A5")) return;
    const cartItemId = `print-${config.paperSize}-${Date.now()}`;
    const standAddonLabel =
      config.standRental === "stand-session"
        ? " · Kèm thuê Giá đỡ 1 buổi"
        : config.standRental === "stand-day"
        ? " · Kèm thuê Giá đỡ Poster 1 ngày"
        : config.standRental === "stand-week"
        ? " · Kèm thuê Giá đỡ 1 tuần"
        : "";
    setCart((prev) => [
      ...prev,
      {
        cartItemId,
        productId: "forus-print-service",
        name: `In ấn tài liệu: ${config.fileName}`,
        variantLabel: `Khổ ${config.paperSize} · ${
          config.colorMode === "color" ? "In màu" : "Trắng đen"
        } · ${config.copies} bản${standAddonLabel}`,
        price: calculatedPrice,
        quantity: 1,
        pointsReward: pointsEarned,
        categoryLabel: "Dịch vụ In ấn A1–A5",
        customMeta: `Nhận tại: ${config.pickupLocation}`,
        pointsAlreadyCredited: false,
      },
    ]);
    setIsCartOpen(true);
    showToast(
      `Đã thêm lệnh in "${config.fileName}"${standAddonLabel} vào giỏ! (+${pointsEarned} điểm VIP sẽ được cộng khi xác nhận thanh toán)`
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
    if (!requireLogin("xác nhận đặt đơn hàng")) return;

    const pointsToRedeem = Math.max(0, receipt.pointsRedeemed || 0);
    const pointsToEarn = Math.max(
      0,
      receipt.earnedPoints ||
        receipt.items.reduce(
          (sum, it) => sum + it.pointsReward * it.quantity,
          0
        )
    );

    if (receipt.consumedVoucherId) {
      setRedeemedHomeVouchers((prev) =>
        prev.filter((id) => id !== receipt.consumedVoucherId)
      );
    }

    const nowTime = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setStudent((prev) => {
      const afterRedeem = Math.max(0, prev.points - pointsToRedeem);
      const finalPoints = afterRedeem + pointsToEarn;
      const newHistory = [...prev.pointHistory];

      if (pointsToRedeem > 0) {
        newHistory.unshift({
          id:
            "pt-redeem-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 6),
          action: `Đổi điểm VIP áp dụng đơn #${receipt.orderId}${
            receipt.appliedVoucherLabel ? ` (${receipt.appliedVoucherLabel})` : ""
          }`,
          points: -pointsToRedeem,
          timestamp: nowTime,
        });
      }

      if (pointsToEarn > 0) {
        newHistory.unshift({
          id:
            "pt-earn-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2, 6),
          action: `Xác nhận thanh toán đơn #${receipt.orderId} (${receipt.items.length} món)`,
          points: pointsToEarn,
          timestamp: nowTime,
        });
      }

      return {
        ...prev,
        points: finalPoints,
        pointHistory: newHistory,
      };
    });

    const projectedPoints =
      Math.max(0, student.points - pointsToRedeem) + pointsToEarn;
    const nextTier = getMembershipTierName(projectedPoints);

    if (pointsToRedeem > 0) {
      showToast(
        `Thanh toán đơn #${receipt.orderId} thành công! Đã trừ -${pointsToRedeem}đ đổi Voucher và cộng +${pointsToEarn}đ VIP mới (${nextTier} · ${projectedPoints}/100đ).`
      );
    } else {
      showToast(
        `Xác nhận thanh toán đơn #${receipt.orderId} thành công! Đã cộng +${pointsToEarn} điểm VIP (${nextTier} · ${projectedPoints}/100đ).`
      );
    }

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

  const isDark = theme === "dark";
  const currentPoints = student.points;
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Navigation items (Trang chủ is now the full 8-chapter FORUS showcase)
  const desktopNavItems: {
    id: ActiveTab;
    label: string;
  }[] = [
    { id: "home", label: "Trang chủ" },
    { id: "gear", label: "Thuê & Bán" },
    { id: "events", label: "Sự kiện" },
    { id: "print", label: "In ấn" },
    { id: "tutor", label: "Gia sư" },
    { id: "vip", label: "Tính năng" },
  ];

  const mobileBottomNavItems: {
    id: ActiveTab;
    shortLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "home",
      shortLabel: "Trang chủ",
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: "gear",
      shortLabel: "Học cụ",
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      id: "events",
      shortLabel: "Sự kiện",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "print",
      shortLabel: "In ấn",
      icon: <Printer className="w-6 h-6" />,
    },
    {
      id: "tutor",
      shortLabel: "Gia sư",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      id: "vip",
      shortLabel: "Tính năng",
      icon: <Crown className="w-6 h-6" />,
    },
  ];

  return (
    <div
      className={`min-h-screen w-full max-w-[100vw] overflow-x-clip pt-20 transition-colors duration-200 ${
        isDark
          ? "dark bg-[#0E1624] text-[#F8FAFC]"
          : "bg-[#F8FAFC] text-[#0B2545]"
      }`}
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-24 z-50 max-w-md bg-[#0B2545] text-[#F8FAFC] px-4 py-3 rounded-md shadow-lg border border-[#233044] flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#D95326] shrink-0" />
          <p className="text-small font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Fixed Top Header (Always visible at top: 0 when scrolling) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 dark:bg-[#0B1519]/95 backdrop-blur-md border-b border-[#E4E0D8] dark:border-[#1E353F] shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => switchTab("home")}
            className="min-h-[44px] flex items-center gap-2.5 text-left shrink-0 cursor-pointer py-1"
          >
            <img
              src={isDark ? BRAND_ASSETS.logoDark : BRAND_ASSETS.logoLight}
              alt="FORUS Logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </button>

          {/* Desktop Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Điều hướng chính">
            {desktopNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={`relative min-h-[44px] px-1 py-2 text-[16px] font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#0F766E] dark:text-[#2DD4BF]"
                      : "text-[#0F2228]/80 hover:text-[#0F2228] dark:text-[#F1F5F9]/80 dark:hover:text-[#F1F5F9]"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-0 right-0 h-0.5 bg-[#0D9488]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme, Cart, Account (min-h 44px touch targets) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              aria-label="Đổi chế độ Sáng / Tối"
              className="w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] flex items-center justify-center hover:border-[#0D9488] dark:hover:border-[#2DD4BF] transition cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#2DD4BF]" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F2228]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (requireLogin("Giỏ hàng FORUS")) {
                  setIsCartOpen(true);
                }
              }}
              aria-label="Giỏ hàng"
              className="relative w-11 h-11 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] flex items-center justify-center hover:border-[#0D9488] dark:hover:border-[#2DD4BF] transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded bg-[#0D9488] text-white font-bold text-[13px] flex items-center justify-center tabular-nums">
                  {totalCartItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              aria-label={
                student.isLoggedIn
                  ? "Hồ sơ cá nhân & Thành tích Gia sư"
                  : "Đăng nhập tài khoản Sinh viên"
              }
              className="min-h-[44px] px-3.5 rounded-md border border-[#E4E0D8] dark:border-[#1E353F] flex items-center gap-2 hover:border-[#0D9488] dark:hover:border-[#2DD4BF] transition cursor-pointer"
            >
              {student.isLoggedIn && student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  onError={() =>
                    setStudent((prev) => ({ ...prev, avatarUrl: "" }))
                  }
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <UserCheck className="w-4 h-4 text-[#0D9488]" />
              )}
              <span className="hidden sm:inline text-[15px] font-bold truncate max-w-[120px]">
                {student.isLoggedIn
                  ? student.fullName.split(" ").slice(-2).join(" ")
                  : "Đăng nhập"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileUpload}
        className="hidden"
      />

      {/* Account & Login Popover Modal */}
      {isAccountMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 px-4 sm:px-6">
          <div
            onClick={() => setIsAccountMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md bg-[#F6F2E8] dark:bg-[#0E1624] text-[#0B2545] dark:text-[#F6F2E8] shadow-2xl border border-[#DCD5C7] dark:border-[#233044] overflow-hidden">
            {!student.isLoggedIn ? (
              <>
                <div className="p-5 bg-[#0B2545] text-[#F6F2E8] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-tiny font-bold text-[#D95326]">
                      Tài khoản Sinh viên ĐH KHTN
                    </span>
                    <h2 className="text-h2 font-bold text-[#F6F2E8]">
                      Đăng nhập 1 lần bằng email trường
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="p-2 rounded border border-[#F6F2E8]/20 text-[#F6F2E8] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleProfileLoginSubmit}
                  className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-small"
                >
                  <p className="text-tiny text-[#0B2545]/75 dark:text-[#F6F2E8]/75">
                    Sử dụng email sinh viên (<strong>@student.hcmus.edu.vn</strong>) để thuê học cụ không cần cọc CCCD, đặt in A5–A1 và tích điểm VIP.
                  </p>

                  <div>
                    <label className="block text-tiny font-bold mb-1">
                      Email Sinh viên HCMUS *
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
                      placeholder="VD: 24120088@student.hcmus.edu.vn"
                      className="w-full px-3.5 py-2.5 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent text-small focus:border-[#0B2545] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-tiny font-bold mb-1">
                        Mã số sinh viên (MSSV) *
                      </label>
                      <input
                        type="text"
                        required
                        value={loginStudentId}
                        onChange={(e) => setLoginStudentId(e.target.value)}
                        placeholder="Nhập MSSV"
                        className="w-full px-3.5 py-2.5 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent text-small tabular-nums focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-tiny font-bold mb-1">
                        Họ và tên sinh viên *
                      </label>
                      <input
                        type="text"
                        required
                        value={loginFullName}
                        onChange={(e) => setLoginFullName(e.target.value)}
                        placeholder="Nhập họ tên đầy đủ"
                        className="w-full px-3.5 py-2.5 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent text-small focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-tiny font-bold mb-1">
                        Khoa đào tạo (Cơ sở 1)
                      </label>
                      <select
                        value={loginFaculty}
                        onChange={(e) => setLoginFaculty(e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-[#DCD5C7] dark:border-[#233044] bg-[#F6F2E8] dark:bg-[#0E1624] text-small focus:border-[#0B2545] focus:outline-none"
                      >
                        {HCMUS_FACULTIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-tiny font-bold mb-1">
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full px-3.5 py-2.5 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent text-small focus:border-[#0B2545] focus:outline-none"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded border border-red-600/30 bg-red-600/10 p-3 text-tiny font-bold text-red-700 dark:text-red-400">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded bg-[#D95326] hover:bg-[#C0441B] text-white font-bold text-small flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Đăng nhập vào Hồ sơ Sinh viên</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="p-5 bg-[#0B2545] text-[#F6F2E8] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#F6F2E8]/30 bg-[#0E1624] flex items-center justify-center font-bold">
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {student.fullName
                              .trim()
                              .split(/\s+/)
                              .slice(-2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase() || "SV"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-tiny font-bold text-[#D95326]">
                        MSSV {student.studentId} · {currentPoints} điểm VIP
                      </span>
                      <h2 className="text-body font-bold text-[#F6F2E8] truncate">
                        {student.fullName}
                      </h2>
                      <p className="text-tiny text-[#F6F2E8]/75 truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="p-2 rounded border border-[#F6F2E8]/20 text-[#F6F2E8] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-small">
                  <div className="flex items-center justify-between gap-3 border-b border-[#DCD5C7] dark:border-[#233044] pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#D95326]" />
                      <span className="font-bold">
                        {isEditingAccount
                          ? "Chỉnh sửa Hồ sơ & Gia sư"
                          : "Thông tin Sinh viên & Gia sư"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAccount((prev) => !prev)}
                        className="px-3 py-1 rounded border border-[#DCD5C7] dark:border-[#233044] text-tiny font-bold cursor-pointer"
                      >
                        {isEditingAccount ? "Đóng sửa" : "Chỉnh sửa"}
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3 py-1 rounded border border-red-600/30 text-red-700 dark:text-red-400 text-tiny font-bold cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>

                  {!isEditingAccount ? (
                    <div className="space-y-3 text-small">
                      <div className="grid grid-cols-2 gap-2 text-tiny">
                        <div>
                          <span className="text-[#0B2545]/60 dark:text-[#F6F2E8]/60 block">
                            Khoa đào tạo
                          </span>
                          <span className="font-bold">{student.faculty}</span>
                        </div>
                        <div>
                          <span className="text-[#0B2545]/60 dark:text-[#F6F2E8]/60 block">
                            Khóa / Năm học
                          </span>
                          <span className="font-bold">
                            {normalizeAcademicYear(student.academicYear)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded border border-[#DCD5C7] dark:border-[#233044] p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-tiny font-bold text-[#D95326] flex items-center gap-1.5">
                            <Award className="w-4 h-4" />
                            Hồ sơ Gia sư KHTN
                          </span>
                          {student.gpa && (
                            <span className="text-tiny font-bold tabular-nums">
                              GPA: {student.gpa}
                            </span>
                          )}
                        </div>
                        {student.personalAchievements ? (
                          <p className="text-tiny">
                            {student.personalAchievements}
                          </p>
                        ) : (
                          <p className="text-tiny text-[#0B2545]/60 dark:text-[#F6F2E8]/60">
                            Chưa cập nhật thành tích gia sư.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSaveInlineAccount}
                      className="space-y-3 text-tiny"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold">Đổi ảnh đại diện</span>
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded bg-[#0B2545] text-[#F6F2E8] font-bold cursor-pointer"
                        >
                          Tải ảnh lên
                        </button>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {PRESET_AVATARS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setEditAvatarUrl(preset.url)}
                            className={`p-1.5 rounded border text-center cursor-pointer ${
                              editAvatarUrl === preset.url
                                ? "border-[#D95326]"
                                : "border-[#DCD5C7] dark:border-[#233044]"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold mb-1">Họ tên</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">
                            Số ĐT / Zalo
                          </label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-2.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold mb-1">
                            GPA tích lũy
                          </label>
                          <input
                            type="text"
                            value={editGpa}
                            onChange={(e) => setEditGpa(e.target.value)}
                            placeholder="VD: 3.75/4.0"
                            className="w-full px-2.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">
                            Môn nhận kèm
                          </label>
                          <input
                            type="text"
                            value={editTutorSubjects}
                            onChange={(e) =>
                              setEditTutorSubjects(e.target.value)
                            }
                            placeholder="Vi tích phân, C++..."
                            className="w-full px-2.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">
                          Thành tích nổi bật
                        </label>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {QUICK_ACHIEVEMENT_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleAppendAchievementTag(tag)}
                              className="px-2 py-0.5 rounded border border-[#DCD5C7] dark:border-[#233044] cursor-pointer"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows={2}
                          value={editPersonalAchievements}
                          onChange={(e) =>
                            setEditPersonalAchievements(e.target.value)
                          }
                          className="w-full px-2.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded bg-[#D95326] text-white font-bold cursor-pointer"
                      >
                        Lưu thông tin
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area with Subtle Fade Transition */}
      <main
        className={
          activeTab === "home" || activeTab === "about"
            ? "w-full pb-28 lg:pb-0"
            : "max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 pt-8 sm:pt-12 pb-28 lg:pb-16"
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            {(activeTab === "home" || activeTab === "about") && (
              <About
                products={gearProducts}
                isLoggedIn={student.isLoggedIn}
                defaultName={
                  student.isLoggedIn && student.fullName
                    ? `${student.fullName} - ${student.studentId}`
                    : ""
                }
                defaultEmail={student.isLoggedIn ? student.email : ""}
                onSelectProduct={(product) => setSelectedProduct(product)}
                onNavigateTab={switchTab}
                onOpenAuth={() => setIsAccountMenuOpen(true)}
              />
            )}

            {activeTab === "gear" && (
              <Gear
                products={gearProducts}
                onSelectProduct={(product) => setSelectedProduct(product)}
              />
            )}

            {activeTab === "events" && (
              <EventsHub
                student={student}
                onToggleReminder={handleToggleEventReminder}
                onSaveEventNote={handleSaveEventNote}
                onEarnPoints={earnPoints}
                onShowToast={showToast}
              />
            )}

            {activeTab === "print" && (
              <PrintConfigurator onAddPrintToCart={handleAddPrintToCart} />
            )}

            {activeTab === "tutor" && (
              <TutorHub
                onEarnPoints={earnPoints}
                student={student}
                onOpenEditProfile={() => {
                  setIsAccountMenuOpen(true);
                  setIsEditingAccount(true);
                }}
              />
            )}

            {activeTab === "vip" && (
              <Suspense
                fallback={
                  <div className="py-20 text-center text-small text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
                    Đang tải Trung tâm Tính năng VIP &amp; Trợ lý AI...
                  </div>
                }
              >
                <VipHub
                  student={student}
                  onUnlockDemoVip={handleActivateDemoVip}
                  onRedeemPoints={redeemPoints}
                  redeemedVoucherIds={redeemedHomeVouchers}
                  onToggleReminder={handleToggleEventReminder}
                  onSaveEventNote={handleSaveEventNote}
                  onNavigateToShop={() => switchTab("gear")}
                  initialSection={vipInitialSection}
                  aiQuestionsUsed={aiQuestionsUsed}
                  maxFreeAiQuestions={FREE_AI_QUESTION_LIMIT}
                  onIncrementAiUsage={incrementAiUsage}
                />
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Compact Aligned Footer with Contact & Social Links */}
      <footer className="border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#F3EFEA] dark:bg-[#122128] py-12 pb-28 lg:pb-12">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-[16px]">
            <div className="space-y-2.5">
              <h4 className="font-serif-display text-[18px] font-bold text-[#0F2228] dark:text-[#F1F5F9]">
                FORUS — 227 Nguyễn Văn Cừ
              </h4>
              <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1] leading-relaxed">
                “Tiện ích trong tay, học hay mỗi ngày” — Hệ sinh thái học cụ, in ấn, sự kiện rèn luyện, gia sư và Trợ lý AI phục vụ sinh viên ĐH Khoa học Tự nhiên (ĐHQG-HCM).
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-serif-display text-[16px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
                Danh mục dịch vụ
              </h4>
              <ul className="space-y-1 text-[16px]">
                <li>
                  <button
                    type="button"
                    onClick={() => switchTab("gear")}
                    className="min-h-[38px] text-left hover:text-[#0D9488] cursor-pointer"
                  >
                    Thuê &amp; Bán học cụ (80% · 90% · 100%)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => switchTab("print")}
                    className="min-h-[38px] text-left hover:text-[#0D9488] cursor-pointer"
                  >
                    In ấn tài liệu &amp; Poster A5 – A1
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => switchTab("events")}
                    className="min-h-[38px] text-left hover:text-[#0D9488] cursor-pointer"
                  >
                    Sự kiện săn điểm rèn luyện HCMUS
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => switchTab("tutor")}
                    className="min-h-[38px] text-left hover:text-[#0D9488] cursor-pointer"
                  >
                    Kết nối Gia sư Tự Nhiên
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => switchTab("vip")}
                    className="min-h-[38px] text-left hover:text-[#0D9488] cursor-pointer"
                  >
                    Đặc quyền VIP &amp; Trợ lý AI
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-serif-display text-[16px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
                Điểm giao nhận Cơ sở 1
              </h4>
              <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1] leading-relaxed">
                Sảnh Tòa I (Khoa CNTT) · Tòa F · Giảng đường B · Dãy C–E · Thư viện Cơ sở 1 · Cổng 227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif-display text-[16px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
                Liên hệ &amp; Cộng đồng
              </h4>
              <p className="text-[16px] text-[#334E58] dark:text-[#CBD5E1]">
                Giờ trực: 06:45 – 20:30 (Thứ 2 – Thứ 7).
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://www.facebook.com/VNUHCM.US"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3.5 py-1.5 rounded border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#0B1519] text-[15px] font-bold hover:border-[#0D9488] inline-flex items-center gap-1.5"
                >
                  <span>Facebook KHTN</span>
                </a>
                <a
                  href="https://github.com/qwerty2008/FORUS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3.5 py-1.5 rounded border border-[#E4E0D8] dark:border-[#1E353F] bg-white dark:bg-[#0B1519] text-[15px] font-bold hover:border-[#0D9488] inline-flex items-center gap-1.5"
                >
                  <span>GitHub FORUS</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E4E0D8] dark:border-[#1E353F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[14px] text-[#334E58] dark:text-[#CBD5E1]">
            <span>© 2026 FORUS · Đồ án học phần CSC00006 — Khoa CNTT, Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM.</span>
            <span>Cơ sở 1: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Icon-only) */}
      <nav
        aria-label="Điều hướng di động"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0B1519]/95 backdrop-blur-md border-t border-[#E4E0D8] dark:border-[#1E353F] px-2 py-1"
      >
        <div className="grid grid-cols-6 items-center max-w-lg mx-auto">
          {mobileBottomNavItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.shortLabel}
                title={tab.shortLabel}
                onClick={() => switchTab(tab.id)}
                className={`min-h-[48px] flex items-center justify-center transition-colors cursor-pointer ${
                  isActive
                    ? "text-[#0D9488] dark:text-[#2DD4BF]"
                    : "text-[#0F2228]/65 dark:text-[#F1F5F9]/65 hover:text-[#0F2228] dark:hover:text-[#F1F5F9]"
                }`}
              >
                {tab.icon}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating AI Assistant Widget */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
        {isFloatingAiOpen && (
          <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[390px] h-[500px] max-h-[72vh] rounded-md bg-[#F6F2E8] dark:bg-[#0E1624] border border-[#DCD5C7] dark:border-[#233044] shadow-2xl flex flex-col overflow-hidden">
            {/* Popup Header */}
            <div className="px-4 py-3 bg-[#0B2545] text-[#F6F2E8] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#D95326] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <h4 className="font-bold text-small text-[#F6F2E8] truncate">
                    Trợ lý AI FORUS · 227 NVC
                  </h4>
                  <p className="text-tiny text-[#F6F2E8]/75 truncate">
                    Giải toán KaTeX, C++/Python &amp; Sổ tay CS1
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setVipInitialSection("chatbot");
                    switchTab("vip");
                    setIsFloatingAiOpen(false);
                  }}
                  title="Mở toàn màn hình"
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFloatingChatMessages([
                      {
                        role: "model",
                        text: "Đã làm mới cuộc trò chuyện! Bạn cần mình giải thích môn đại cương nào hay tra cứu thông tin gì tại Cơ sở 1 (227 Nguyễn Văn Cừ)?",
                      },
                    ])
                  }
                  title="Xóa lịch sử chat"
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFloatingAiOpen(false)}
                  title="Đóng cửa sổ chat"
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VIP Quota Banner */}
            <div className="px-3.5 py-2 border-b border-[#DCD5C7] dark:border-[#233044] bg-[#EFEAE0] dark:bg-[#152033] flex items-center justify-between gap-2 text-tiny font-bold">
              <span className="truncate">
                {student.points >= 100
                  ? "Đã mở khóa VIP: Hỏi AI Không giới hạn (∞)"
                  : `Miễn phí: Đã dùng ${Math.min(
                      aiQuestionsUsed,
                      FREE_AI_QUESTION_LIMIT
                    )}/${FREE_AI_QUESTION_LIMIT} câu`}
              </span>
              {student.points < 100 && (
                <button
                  type="button"
                  onClick={handleActivateDemoVip}
                  className="px-2 py-0.5 rounded bg-[#D95326] text-white text-tiny font-bold shrink-0 cursor-pointer"
                >
                  Kích hoạt VIP 100đ
                </button>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 border-b border-[#DCD5C7] dark:border-[#233044] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                "Giải x^2 - 5x + 6 = 0",
                "Khai triển Maclaurin hàm sin(x)",
                "Kho Voucher & Giá thuê học cụ",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendFloatingChat(chip)}
                  disabled={
                    isFloatingSending ||
                    (student.points < 100 &&
                      aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT)
                  }
                  className="px-2.5 py-1 rounded border border-[#DCD5C7] dark:border-[#233044] text-tiny font-bold hover:border-[#D95326] transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={floatingChatScrollRef}
              className="flex-1 overflow-y-auto p-3.5 space-y-3"
            >
              {floatingChatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] min-w-0 rounded-md px-3.5 py-2.5 text-small break-words [overflow-wrap:anywhere] ${
                      msg.role === "user"
                        ? "bg-[#0B2545] text-[#F6F2E8]"
                        : "bg-[#EFEAE0] dark:bg-[#152033] text-[#0B2545] dark:text-[#F6F2E8] border border-[#DCD5C7] dark:border-[#233044]"
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
                  <div className="bg-[#EFEAE0] dark:bg-[#152033] border border-[#DCD5C7] dark:border-[#233044] rounded-md px-3.5 py-2.5 flex items-center gap-2 text-tiny text-[#D95326] font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D95326]" />
                    Trợ lý AI FORUS đang trả lời...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            {student.points < 100 &&
            aiQuestionsUsed >= FREE_AI_QUESTION_LIMIT ? (
              <div className="p-3 border-t border-[#DCD5C7] dark:border-[#233044] flex flex-col gap-2">
                <p className="text-tiny font-bold text-red-700 dark:text-red-400">
                  Bạn đã hỏi hết {FREE_AI_QUESTION_LIMIT}/
                  {FREE_AI_QUESTION_LIMIT} câu miễn phí. Kích hoạt VIP 100đ để
                  mở khóa không giới hạn!
                </p>
                <button
                  type="button"
                  onClick={handleActivateDemoVip}
                  className="w-full py-2 rounded bg-[#D95326] text-white font-bold text-tiny cursor-pointer"
                >
                  Kích hoạt VIP 100đ ngay
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendFloatingChat();
                }}
                className="p-2.5 border-t border-[#DCD5C7] dark:border-[#233044] flex items-center gap-2"
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
                  className="flex-1 px-3.5 py-2 rounded border border-[#DCD5C7] dark:border-[#233044] bg-transparent text-small focus:border-[#0B2545] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!floatingChatInput.trim() || isFloatingSending}
                  className="w-10 h-10 rounded bg-[#D95326] hover:bg-[#C0441B] disabled:opacity-50 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => {
            if (requireLogin("Trợ lý AI FORUS")) {
              setIsFloatingAiOpen((prev) => !prev);
            }
          }}
          aria-label="Trợ lý AI FORUS"
          className="w-13 h-13 rounded-full bg-[#0B2545] hover:bg-[#163A66] text-[#F6F2E8] shadow-xl flex items-center justify-center cursor-pointer border-2 border-[#D95326]"
        >
          {isFloatingAiOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5 text-[#D95326]" />
          )}
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
        redeemedVoucherIds={redeemedHomeVouchers}
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
