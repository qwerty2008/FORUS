import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  MapPin,
  CreditCard,
  Gift,
  ChevronDown,
  ArrowRight,
  Crown,
  Award,
} from "lucide-react";
import { CartItem, OrderReceipt, StudentProfile } from "../types";
import {
  CAMPUS_BUILDINGS_CS1,
  DISCOUNT_CODES,
  VIP_VOUCHER_CATALOG,
  DiscountVoucherItem,
} from "../data/forusData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  student: StudentProfile;
  redeemedVoucherIds?: string[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCompleteOrder: (receipt: OrderReceipt) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  student,
  redeemedVoucherIds = [],
  onUpdateQty,
  onRemoveItem,
  onCompleteOrder,
}) => {
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS_CS1[0]);
  const [roomNumber, setRoomNumber] = useState("Phòng I.42 (Ca 1 - 7h30)");
  const [recipientName, setRecipientName] = useState(
    student.fullName || "Sinh viên KHTN"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "momo-sandbox" | "vietqr-sandbox" | "cod-room"
  >("momo-sandbox");

  const [isVoucherPanelOpen, setIsVoucherPanelOpen] = useState(false);
  const [voucherTab, setVoucherTab] = useState<"vip" | "other">("vip");
  const [selectedVipVoucherCode, setSelectedVipVoucherCode] = useState<
    string | null
  >(null);
  const [useFlexibleVipPoints, setUseFlexibleVipPoints] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [completedReceipt, setCompletedReceipt] =
    useState<OrderReceipt | null>(null);

  const handleClose = () => {
    setCompletedReceipt(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCompletedReceipt(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalPointsEarned = items.reduce(
    (sum, item) => sum + item.pointsReward * item.quantity,
    0
  );

  // 1. Calculate VIP Voucher or Flexible Points Discount
  const activeVipVoucher: DiscountVoucherItem | undefined =
    VIP_VOUCHER_CATALOG.find((v) => v.code === selectedVipVoucherCode);

  const isPreRedeemedVipVoucher = Boolean(
    activeVipVoucher?.linkedHomeVoucherId &&
      redeemedVoucherIds.includes(activeVipVoucher.linkedHomeVoucherId)
  );

  const vipVoucherMeetsMin =
    activeVipVoucher && subtotal >= activeVipVoucher.minOrder;

  const vipVoucherPointsCost =
    activeVipVoucher && vipVoucherMeetsMin
      ? isPreRedeemedVipVoucher
        ? 0
        : activeVipVoucher.pointsCost || 0
      : 0;

  const canAffordSelectedVipVoucher =
    isPreRedeemedVipVoucher || student.points >= vipVoucherPointsCost;

  const vipVoucherDiscountAmount =
    activeVipVoucher && vipVoucherMeetsMin && canAffordSelectedVipVoucher
      ? activeVipVoucher.discountPercent
        ? Math.min(
            activeVipVoucher.maxDiscount || 60000,
            Math.round((subtotal * activeVipVoucher.discountPercent) / 100)
          )
        : activeVipVoucher.discountAmount
      : 0;

  // Flexible points option (10 - 50 pts -> 2,000đ - 10,000đ) when no fixed VIP voucher is selected
  const flexibleRedeemablePoints = Math.min(student.points, 50);
  const flexiblePointsDiscount =
    !activeVipVoucher && useFlexibleVipPoints && flexibleRedeemablePoints >= 10
      ? flexibleRedeemablePoints * 200
      : 0;

  const activePointsRedeemed = activeVipVoucher
    ? canAffordSelectedVipVoucher && vipVoucherMeetsMin
      ? vipVoucherPointsCost
      : 0
    : useFlexibleVipPoints && flexibleRedeemablePoints >= 10
    ? flexibleRedeemablePoints
    : 0;

  const totalVipDiscountAmount =
    vipVoucherDiscountAmount + flexiblePointsDiscount;

  // 2. Calculate Other Points / Promo Voucher Discount
  const activePromoObj = appliedCoupon ? DISCOUNT_CODES[appliedCoupon] : null;
  const promoDiscountAmount =
    activePromoObj && subtotal >= activePromoObj.minOrder
      ? activePromoObj.discountAmount
      : 0;

  const totalDiscountAmount = totalVipDiscountAmount + promoDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscountAmount);

  const appliedSummaryNames: string[] = [];
  if (activeVipVoucher && vipVoucherDiscountAmount > 0) {
    appliedSummaryNames.push(activeVipVoucher.code);
  } else if (flexiblePointsDiscount > 0) {
    appliedSummaryNames.push(`-${activePointsRedeemed}đ VIP`);
  }
  if (activePromoObj && promoDiscountAmount > 0) {
    appliedSummaryNames.push(activePromoObj.code);
  }

  const handleApplyCouponCode = (codeToApply?: string) => {
    const clean = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!clean) return;

    const matchedVip = VIP_VOUCHER_CATALOG.find((v) => v.code === clean);
    if (matchedVip) {
      const preOwned =
        matchedVip.linkedHomeVoucherId &&
        redeemedVoucherIds.includes(matchedVip.linkedHomeVoucherId);
      if (!preOwned && student.points < (matchedVip.pointsCost || 0)) {
        setCouponError(
          `Cần ${matchedVip.pointsCost} điểm VIP để dùng mã ${clean} (Hiện có ${student.points}đ).`
        );
        return;
      }
      if (subtotal < matchedVip.minOrder) {
        setCouponError(
          `Đơn tối thiểu ${matchedVip.minOrder.toLocaleString("vi-VN")}đ để dùng mã ${clean}.`
        );
        return;
      }
      setSelectedVipVoucherCode(clean);
      setUseFlexibleVipPoints(false);
      setCouponError(null);
      setCouponInput("");
      return;
    }

    const found = DISCOUNT_CODES[clean];
    if (!found) {
      setCouponError(
        "Mã không hợp lệ. Chọn nhanh ưu đãi bên dưới hoặc nhập: FORUSKHTN, DRL80PLUS, GPA32PLUS, CSC00006."
      );
      return;
    }
    if (subtotal < found.minOrder) {
      setCouponError(
        `Đơn hàng tối thiểu ${found.minOrder.toLocaleString("vi-VN")}đ để áp dụng mã ${clean}.`
      );
      return;
    }
    setAppliedCoupon(clean);
    setCouponError(null);
    if (!codeToApply) setCouponInput("");
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const paymentLabel =
      paymentMethod === "momo-sandbox"
        ? "Ví MoMo Sinh Viên"
        : paymentMethod === "vietqr-sandbox"
        ? "Chuyển khoản VietQR"
        : "Tiền mặt khi nhận hàng";

    const appliedLabels: string[] = [];
    if (activeVipVoucher && vipVoucherDiscountAmount > 0) {
      appliedLabels.push(activeVipVoucher.code);
    } else if (flexiblePointsDiscount > 0) {
      appliedLabels.push(`VIP-${activePointsRedeemed}D`);
    }
    if (activePromoObj && promoDiscountAmount > 0) {
      appliedLabels.push(activePromoObj.code);
    }

    const receipt: OrderReceipt = {
      orderId: `FORUS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString("vi-VN"),
      studentName: recipientName || student.fullName || "Sinh viên KHTN",
      studentEmail: student.email || "25120001@student.hcmus.edu.vn",
      deliveryLocation: `${building} — ${roomNumber}`,
      paymentMethod: paymentLabel,
      items: [...items],
      subtotal,
      discount: totalDiscountAmount,
      total: finalTotal,
      totalAmount: finalTotal,
      earnedPoints: totalPointsEarned,
      pointsRedeemed: activePointsRedeemed,
      appliedVoucherLabel:
        appliedLabels.length > 0 ? appliedLabels.join(" + ") : undefined,
      consumedVoucherId:
        isPreRedeemedVipVoucher && activeVipVoucher?.linkedHomeVoucherId
          ? activeVipVoucher.linkedHomeVoucherId
          : undefined,
    };

    onCompleteOrder(receipt);
    setSelectedVipVoucherCode(null);
    setUseFlexibleVipPoints(false);
    setAppliedCoupon(null);
    setIsVoucherPanelOpen(false);
    setCompletedReceipt(receipt);
  };

  const isCompactView = Boolean(completedReceipt) || items.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        completedReceipt ? "Biên lai đơn hàng" : "Giỏ hàng và Thanh toán"
      }
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#091519]/65 backdrop-blur-sm p-0 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex w-full flex-col overflow-hidden bg-[#FAF8F5] dark:bg-[#0B1519] text-[#0F2228] dark:text-[#F8FAFC] border border-[#E4E0D8] dark:border-[#1E353F] shadow-2xl rounded-t-2xl sm:rounded-xl transition-all ${
          isCompactView
            ? "max-w-lg max-h-[90vh]"
            : "max-w-4xl max-h-[94vh] sm:max-h-[86vh]"
        }`}
      >
        {/* Editorial Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E4E0D8] dark:border-[#1E353F] px-5 sm:px-7 py-4 sm:py-5 shrink-0">
          <div className="min-w-0">
            <h2 className="font-serif-display text-[20px] sm:text-[22px] font-bold tracking-tight text-[#0F2228] dark:text-white leading-tight">
              {completedReceipt
                ? "Biên lai thanh toán"
                : items.length === 0
                ? "Giỏ hàng"
                : `Giỏ hàng & Thanh toán (${items.length})`}
            </h2>
            {!completedReceipt && items.length > 0 && (
              <p className="mt-0.5 text-[14px] text-[#4A626A] dark:text-[#A8C1C9] tabular-nums">
                Cơ sở 1 · 227 Nguyễn Văn Cừ · Nhận +{totalPointsEarned} điểm VIP
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng khung thanh toán"
            className="w-10 h-10 rounded-lg border border-[#E4E0D8] dark:border-[#1E353F] hover:border-[#0D9488] bg-white/70 dark:bg-[#122128] flex items-center justify-center text-[#334E58] dark:text-[#CBD5E1] hover:text-[#0F2228] dark:hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* 1. Minimalist Receipt View */}
        {completedReceipt ? (
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 sm:py-7 space-y-6">
            <div className="text-center space-y-2 pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#0D9488]/12 dark:bg-[#14B8A6]/18 text-[#0D9488] dark:text-[#5EEAD4] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-serif-display text-[22px] font-bold text-[#0F2228] dark:text-white">
                Thanh toán thành công
              </h3>
              <p className="text-[14px] text-[#4A626A] dark:text-[#A8C1C9] tabular-nums">
                Mã đơn #{completedReceipt.orderId} · {completedReceipt.createdAt}
              </p>
            </div>

            {/* Clean Delivery & Payment Metadata */}
            <div className="border-y border-[#E4E0D8] dark:border-[#1E353F] py-4 space-y-2.5 text-[14.5px]">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[#4A626A] dark:text-[#A8C1C9] shrink-0">
                  Nhận tại
                </span>
                <span className="font-semibold text-right text-[#0F2228] dark:text-white">
                  {completedReceipt.deliveryLocation}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[#4A626A] dark:text-[#A8C1C9] shrink-0">
                  Người nhận
                </span>
                <span className="font-semibold text-right text-[#0F2228] dark:text-white">
                  {completedReceipt.studentName}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-[#4A626A] dark:text-[#A8C1C9] shrink-0">
                  Thanh toán
                </span>
                <span className="font-semibold text-right text-[#0F2228] dark:text-white">
                  {completedReceipt.paymentMethod}
                </span>
              </div>
            </div>

            {/* Itemized List & Total */}
            <div className="space-y-3 text-[15px]">
              <div className="space-y-2.5">
                {completedReceipt.items.map((it) => (
                  <div
                    key={it.cartItemId}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[#0F2228] dark:text-white">
                        {it.quantity}× {it.name}
                      </span>
                      {it.variantLabel && (
                        <span className="block text-[13px] text-[#4A626A] dark:text-[#A8C1C9] truncate">
                          {it.variantLabel}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold tabular-nums shrink-0 text-[#0F2228] dark:text-white">
                      {(it.price * it.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>

              {completedReceipt.discount && completedReceipt.discount > 0 ? (
                <div className="flex items-center justify-between pt-3 border-t border-[#E4E0D8] dark:border-[#1E353F] text-[14.5px] text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
                  <span>
                    Ưu đãi
                    {completedReceipt.appliedVoucherLabel
                      ? ` (${completedReceipt.appliedVoucherLabel})`
                      : ""}
                  </span>
                  <span className="tabular-nums">
                    -{completedReceipt.discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ) : null}

              <div className="flex items-baseline justify-between pt-3 border-t border-[#E4E0D8] dark:border-[#1E353F]">
                <span className="text-[15px] font-bold text-[#0F2228] dark:text-white">
                  Tổng thanh toán
                </span>
                <span className="font-serif-display text-[22px] font-bold tabular-nums text-[#0D9488] dark:text-[#5EEAD4]">
                  {completedReceipt.totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <p className="text-[13.5px] text-[#4A626A] dark:text-[#A8C1C9] tabular-nums">
                Đã cộng +{completedReceipt.earnedPoints} điểm VIP vào tài khoản
                {completedReceipt.pointsRedeemed &&
                completedReceipt.pointsRedeemed > 0
                  ? ` · Đã dùng -${completedReceipt.pointsRedeemed} điểm đổi ưu đãi`
                  : ""}
                .
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full min-h-[48px] rounded-lg bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F8FAFC] dark:hover:bg-[#5EEAD4] dark:text-[#0B1519] text-white text-[16px] font-bold transition cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        ) : items.length === 0 ? (
          /* 2. Minimalist Empty Cart View */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <img
              src="./assets/art/empty-cart.webp"
              alt="Sổ tay giỏ hàng trống"
              width={144}
              height={144}
              loading="lazy"
              className="w-36 h-36 object-contain rounded-lg border border-[#E4E0D8] dark:border-[#1E353F] bg-white p-2"
            />
            <p className="mt-5 font-serif-display text-[20px] font-bold text-[#0F2228] dark:text-white">
              Sổ tay đơn hàng đang trống
            </p>
            <p className="mt-1.5 text-[15px] text-[#4A626A] dark:text-[#A8C1C9] max-w-xs leading-relaxed">
              Chọn máy tính Casio, áo blouse hoặc đặt in tài liệu để nhận nhanh tại Sảnh Tòa I.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F8FAFC] dark:hover:bg-[#5EEAD4] dark:text-[#0B1519] text-white text-[15px] font-bold transition cursor-pointer"
            >
              Tiếp tục khám phá
            </button>
          </div>
        ) : (
          /* 3. Centered 2-Column Desktop / 1-Column Mobile Checkout Form */
          <form
            onSubmit={handleCheckout}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
              {/* LEFT COLUMN (58%): Cart Items + Delivery Info */}
              <div className="lg:col-span-7 px-5 sm:px-7 py-5 sm:py-6 space-y-7 lg:overflow-y-auto">
                {/* Itemized Cart List */}
                <section aria-label="Danh sách món">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E0D8] dark:border-[#1E353F]">
                    <span className="text-[13px] font-bold uppercase tracking-wider text-[#4A626A] dark:text-[#A8C1C9]">
                      Danh sách món ({items.length})
                    </span>
                    <span className="text-[13px] font-semibold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                      +{totalPointsEarned}đ VIP
                    </span>
                  </div>

                  <div className="divide-y divide-[#E4E0D8] dark:divide-[#1E353F]">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="py-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-[16px] font-bold text-[#0F2228] dark:text-white leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-[14px] text-[#4A626A] dark:text-[#A8C1C9] truncate">
                              {item.variantLabel}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.cartItemId)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-[#64748B] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/8 transition cursor-pointer shrink-0"
                            title="Xóa khỏi giỏ"
                            aria-label={`Xóa ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          {/* Tactile Stepper */}
                          <div className="inline-flex items-center rounded-md border border-[#DDD7CC] dark:border-[#243B46] bg-white dark:bg-[#112128]">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartItemId, -1)}
                              aria-label="Giảm số lượng"
                              className="w-9 h-9 flex items-center justify-center text-[#334E58] dark:text-[#CBD5E1] hover:text-[#0F2228] dark:hover:text-white transition cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-[15px] font-bold tabular-nums text-[#0F2228] dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartItemId, 1)}
                              aria-label="Tăng số lượng"
                              className="w-9 h-9 flex items-center justify-center text-[#334E58] dark:text-[#CBD5E1] hover:text-[#0F2228] dark:hover:text-white transition cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="block text-[16px] font-bold tabular-nums text-[#0F2228] dark:text-white">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN"
                              )}
                              đ
                            </span>
                            <span
                              title="Cộng sau khi xác nhận thanh toán"
                              className="text-[12.5px] font-medium text-[#0F766E] dark:text-[#5EEAD4] tabular-nums"
                            >
                              +{item.pointsReward * item.quantity}đ VIP
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Delivery Details at CS1 */}
                <section
                  aria-label="Thông tin nhận hàng"
                  className="pt-6 border-t border-[#E4E0D8] dark:border-[#1E353F] space-y-4"
                >
                  <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#4A626A] dark:text-[#A8C1C9]">
                    <MapPin className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" />
                    <span>Nhận tại Cơ sở 1 · 227 Nguyễn Văn Cừ</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[13.5px] font-semibold text-[#334E58] dark:text-[#CBD5E1] mb-1.5">
                        Tòa nhà / Điểm nhận
                      </label>
                      <select
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-[#DDD7CC] dark:border-[#243B46] bg-white dark:bg-[#112128] px-3.5 py-2 text-[15px] font-medium text-[#0F2228] dark:text-white focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 focus:outline-none transition cursor-pointer"
                      >
                        {CAMPUS_BUILDINGS_CS1.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-[#334E58] dark:text-[#CBD5E1] mb-1.5">
                          Phòng &amp; giờ nhận
                        </label>
                        <input
                          type="text"
                          required
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="VD: Phòng I.42 (Ca 1)"
                          className="w-full min-h-[44px] rounded-lg border border-[#DDD7CC] dark:border-[#243B46] bg-white dark:bg-[#112128] px-3.5 py-2 text-[15px] text-[#0F2228] dark:text-white placeholder:text-[#7D9198] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-[#334E58] dark:text-[#CBD5E1] mb-1.5">
                          Người nhận
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Họ tên sinh viên"
                          className="w-full min-h-[44px] rounded-lg border border-[#DDD7CC] dark:border-[#243B46] bg-white dark:bg-[#112128] px-3.5 py-2 text-[15px] text-[#0F2228] dark:text-white placeholder:text-[#7D9198] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN (42%): Payment Method + Collapsible Voucher Bar + Price Breakdown */}
              <div className="lg:col-span-5 bg-[#F3EFEA] dark:bg-[#112128] border-t lg:border-t-0 lg:border-l border-[#E4E0D8] dark:border-[#1E353F] flex flex-col justify-between lg:overflow-y-auto">
                <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-5">
                  {/* Minimalist Payment Method Selector */}
                  <section aria-label="Phương thức thanh toán" className="space-y-3">
                    <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#4A626A] dark:text-[#A8C1C9]">
                      <CreditCard className="h-4 w-4 text-[#0D9488] dark:text-[#5EEAD4]" />
                      <span>Phương thức thanh toán</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "momo-sandbox", label: "MoMo" },
                        { id: "vietqr-sandbox", label: "VietQR" },
                        { id: "cod-room", label: "Tiền mặt" },
                      ].map((opt) => {
                        const isActive = paymentMethod === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setPaymentMethod(opt.id as typeof paymentMethod)
                            }
                            className={`min-h-[44px] px-2.5 py-2 rounded-lg text-[14.5px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                              isActive
                                ? "bg-white dark:bg-[#162C35] border-[#0D9488] dark:border-[#5EEAD4] text-[#0F2228] dark:text-white shadow-2xs"
                                : "bg-transparent border-[#DDD7CC] dark:border-[#243B46] text-[#4A626A] dark:text-[#A8C1C9] hover:border-[#0D9488]/60 hover:text-[#0F2228] dark:hover:text-white"
                            }`}
                          >
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#5EEAD4] shrink-0" />
                            )}
                            <span className="whitespace-nowrap">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Collapsible Voucher & VIP Points Bar */}
                  <section
                    aria-label="Ưu đãi và điểm VIP"
                    className="rounded-lg border border-[#DDD7CC] dark:border-[#243B46] bg-[#FAF8F5] dark:bg-[#0C191F] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setIsVoucherPanelOpen((prev) => !prev)}
                      aria-expanded={isVoucherPanelOpen}
                      className="w-full min-h-[52px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/70 dark:hover:bg-[#12242D] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Gift className="h-4.5 w-4.5 text-[#0D9488] dark:text-[#5EEAD4] shrink-0" />
                        <div className="min-w-0">
                          <span className="block text-[14.5px] font-bold text-[#0F2228] dark:text-white leading-tight">
                            Ưu đãi &amp; Điểm VIP
                          </span>
                          <span className="block text-[12.5px] text-[#4A626A] dark:text-[#A8C1C9] truncate tabular-nums mt-0.5">
                            {totalDiscountAmount > 0
                              ? `Đang áp dụng: ${appliedSummaryNames.join(" + ")}`
                              : `Khả dụng ${student.points}đ VIP · Bấm để chọn mã`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {totalDiscountAmount > 0 && (
                          <span className="text-[13.5px] font-bold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                            -{totalDiscountAmount.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-[#4A626A] dark:text-[#A8C1C9] transition-transform duration-200 ${
                            isVoucherPanelOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isVoucherPanelOpen && (
                      <div className="px-4 pb-4 pt-3 border-t border-[#E4E0D8] dark:border-[#1E353F] space-y-3">
                        {/* Manual Code Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Nhập mã (VIP50, FORUSKHTN...)"
                            className="flex-1 min-w-0 min-h-[40px] rounded-md border border-[#DDD7CC] dark:border-[#243B46] bg-white dark:bg-[#112128] px-3 py-1.5 text-[14px] uppercase text-[#0F2228] dark:text-white placeholder:normal-case placeholder:text-[#7D9198] focus:border-[#0D9488] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCouponCode()}
                            className="min-h-[40px] px-3.5 rounded-md bg-[#0F2228] hover:bg-[#0D9488] dark:bg-[#F8FAFC] dark:hover:bg-[#5EEAD4] dark:text-[#0B1519] text-white text-[13.5px] font-bold shrink-0 cursor-pointer transition"
                          >
                            Áp dụng
                          </button>
                        </div>

                        {couponError && (
                          <p className="text-[13px] font-semibold text-red-600 dark:text-red-400">
                            {couponError}
                          </p>
                        )}

                        {/* Clean Tab Switcher */}
                        <div className="grid grid-cols-2 gap-1 rounded-md bg-[#EFEAE2] dark:bg-[#14252E] p-1">
                          <button
                            type="button"
                            onClick={() => setVoucherTab("vip")}
                            className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-[13px] font-bold transition cursor-pointer ${
                              voucherTab === "vip"
                                ? "bg-white dark:bg-[#0C191F] text-[#0F2228] dark:text-white shadow-2xs"
                                : "text-[#4A626A] dark:text-[#A8C1C9]"
                            }`}
                          >
                            <Crown className="h-3.5 w-3.5" />
                            <span>Đổi Điểm VIP</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVoucherTab("other")}
                            className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-[13px] font-bold transition cursor-pointer ${
                              voucherTab === "other"
                                ? "bg-white dark:bg-[#0C191F] text-[#0F2228] dark:text-white shadow-2xs"
                                : "text-[#4A626A] dark:text-[#A8C1C9]"
                            }`}
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>ĐRL / GPA</span>
                          </button>
                        </div>

                        {/* Voucher List */}
                        {voucherTab === "vip" ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                            {VIP_VOUCHER_CATALOG.map((v) => {
                              const isSelected =
                                selectedVipVoucherCode === v.code;
                              const isPreOwned = Boolean(
                                v.linkedHomeVoucherId &&
                                  redeemedVoucherIds.includes(
                                    v.linkedHomeVoucherId
                                  )
                              );
                              const meetsMin = subtotal >= v.minOrder;
                              const enoughPoints =
                                isPreOwned ||
                                student.points >= (v.pointsCost || 0);
                              const canUse = meetsMin && enoughPoints;

                              return (
                                <div
                                  key={v.code}
                                  className={`rounded-md border p-3 transition flex items-center justify-between gap-2.5 ${
                                    isSelected
                                      ? "border-[#0D9488] bg-[#E9F4F2]/70 dark:bg-[#0F2A31]"
                                      : "border-[#E4E0D8] dark:border-[#1E353F] bg-white/70 dark:bg-[#112128]"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-[12.5px] font-bold">
                                      <span className="font-mono text-[#0F2228] dark:text-white">
                                        {v.code}
                                      </span>
                                      <span className="text-[#8CA0A7]">·</span>
                                      <span className="text-[#0F766E] dark:text-[#5EEAD4]">
                                        {isPreOwned
                                          ? "Đã đổi sẵn"
                                          : v.badgeLabel}
                                      </span>
                                    </div>
                                    <p className="text-[13.5px] font-semibold text-[#0F2228] dark:text-white truncate mt-0.5">
                                      {v.title}
                                    </p>
                                    <p className="text-[12px] text-[#4A626A] dark:text-[#A8C1C9] tabular-nums">
                                      Đơn từ {v.minOrder.toLocaleString("vi-VN")}đ
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!canUse && !isSelected}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedVipVoucherCode(null);
                                      } else {
                                        setSelectedVipVoucherCode(v.code);
                                        setUseFlexibleVipPoints(false);
                                        setCouponError(null);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-[12.5px] font-bold shrink-0 transition cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                                      isSelected
                                        ? "bg-[#0D9488] text-white"
                                        : canUse
                                        ? "bg-[#0F2228] dark:bg-[#F8FAFC] text-white dark:text-[#0B1519]"
                                        : "border border-[#DDD7CC] dark:border-[#243B46] text-[#4A626A] dark:text-[#A8C1C9]"
                                    }`}
                                  >
                                    {isSelected
                                      ? "Bỏ chọn"
                                      : !meetsMin
                                      ? `Từ ${v.minOrder / 1000}k`
                                      : !enoughPoints
                                      ? `Thiếu ${(v.pointsCost || 0) - student.points}đ`
                                      : isPreOwned
                                      ? "Dùng ngay"
                                      : `Đổi -${v.pointsCost}đ`}
                                  </button>
                                </div>
                              );
                            })}

                            {/* Flexible 10-50 VIP points redemption */}
                            <div
                              className={`rounded-md border p-3 transition flex items-center justify-between gap-2.5 ${
                                useFlexibleVipPoints && !selectedVipVoucherCode
                                  ? "border-[#0D9488] bg-[#E9F4F2]/70 dark:bg-[#0F2A31]"
                                  : "border-[#E4E0D8] dark:border-[#1E353F] bg-white/70 dark:bg-[#112128]"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="text-[12.5px] font-bold text-[#0F766E] dark:text-[#5EEAD4] block">
                                  Đổi điểm linh hoạt (1đ = 200đ)
                                </span>
                                <p className="text-[13.5px] font-semibold text-[#0F2228] dark:text-white tabular-nums mt-0.5">
                                  Dùng {flexibleRedeemablePoints}đ giảm{" "}
                                  {(
                                    flexibleRedeemablePoints * 200
                                  ).toLocaleString("vi-VN")}
                                  đ
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={flexibleRedeemablePoints < 10}
                                onClick={() => {
                                  setSelectedVipVoucherCode(null);
                                  setUseFlexibleVipPoints((prev) => !prev);
                                }}
                                className={`px-3 py-1.5 rounded-md text-[12.5px] font-bold shrink-0 transition cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                                  useFlexibleVipPoints &&
                                  !selectedVipVoucherCode
                                    ? "bg-[#0D9488] text-white"
                                    : "bg-[#0F2228] dark:bg-[#F8FAFC] text-white dark:text-[#0B1519]"
                                }`}
                              >
                                {useFlexibleVipPoints && !selectedVipVoucherCode
                                  ? "Đã dùng"
                                  : flexibleRedeemablePoints >= 10
                                  ? `Dùng -${flexibleRedeemablePoints}đ`
                                  : "Từ 10đ"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                            {Object.values(DISCOUNT_CODES).map((vc) => {
                              const isApplied = appliedCoupon === vc.code;
                              const meetsMin = subtotal >= vc.minOrder;
                              return (
                                <div
                                  key={vc.code}
                                  className={`rounded-md border p-3 transition flex items-center justify-between gap-2.5 ${
                                    isApplied
                                      ? "border-[#0D9488] bg-[#E9F4F2]/70 dark:bg-[#0F2A31]"
                                      : "border-[#E4E0D8] dark:border-[#1E353F] bg-white/70 dark:bg-[#112128]"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-[12.5px] font-bold">
                                      <span className="font-mono text-[#0F2228] dark:text-white">
                                        {vc.code}
                                      </span>
                                      <span className="text-[#8CA0A7]">·</span>
                                      <span className="text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                                        -{vc.discountAmount.toLocaleString("vi-VN")}đ
                                      </span>
                                    </div>
                                    <p className="text-[13.5px] font-semibold text-[#0F2228] dark:text-white truncate mt-0.5">
                                      {vc.title}
                                    </p>
                                    <p className="text-[12px] text-[#4A626A] dark:text-[#A8C1C9] truncate">
                                      {vc.desc}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={!meetsMin && !isApplied}
                                    onClick={() => {
                                      if (isApplied) {
                                        setAppliedCoupon(null);
                                      } else {
                                        handleApplyCouponCode(vc.code);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-[12.5px] font-bold shrink-0 transition cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                                      isApplied
                                        ? "bg-[#0D9488] text-white"
                                        : meetsMin
                                        ? "bg-[#0F2228] dark:bg-[#F8FAFC] text-white dark:text-[#0B1519]"
                                        : "border border-[#DDD7CC] dark:border-[#243B46] text-[#4A626A] dark:text-[#A8C1C9]"
                                    }`}
                                  >
                                    {isApplied
                                      ? "Đã chọn"
                                      : meetsMin
                                      ? "Áp dụng"
                                      : `Từ ${vc.minOrder / 1000}k`}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>

                {/* Price Breakdown & Confirm CTA (Sticky at bottom of right column / mobile sheet) */}
                <div className="px-5 sm:px-6 py-5 border-t border-[#E4E0D8] dark:border-[#1E353F] bg-[#ECE6DC]/80 dark:bg-[#0D1A20] space-y-4 shrink-0">
                  <div className="space-y-2 text-[14.5px]">
                    <div className="flex items-center justify-between text-[#4A626A] dark:text-[#A8C1C9]">
                      <span>Tạm tính</span>
                      <span className="font-semibold tabular-nums text-[#0F2228] dark:text-white">
                        {subtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    {totalDiscountAmount > 0 && (
                      <div className="flex items-center justify-between text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
                        <span>Ưu đãi ({appliedSummaryNames.join(" + ")})</span>
                        <span className="tabular-nums">
                          -{totalDiscountAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-[#DCD4C8] dark:border-[#1E353F] flex items-baseline justify-between gap-2">
                      <div>
                        <span className="block text-[15px] font-bold text-[#0F2228] dark:text-white">
                          Tổng thanh toán
                        </span>
                        <span className="block text-[12.5px] font-medium text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                          +{totalPointsEarned} điểm VIP khi hoàn tất
                          {activePointsRedeemed > 0
                            ? ` · Đổi -${activePointsRedeemed}đ`
                            : ""}
                        </span>
                      </div>
                      <span className="font-serif-display text-[24px] font-bold tabular-nums text-[#0F2228] dark:text-white">
                        {finalTotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[50px] rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[16px] font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <span>Xác nhận thanh toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
