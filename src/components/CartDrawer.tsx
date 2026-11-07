import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  MapPin,
  CreditCard,
  Gift,
  Tag,
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

  // 2. Calculate Other Points / Promo Voucher Discount (DRL, GPA, Student Email, Poster AI, K26, Freeship)
  const activePromoObj = appliedCoupon ? DISCOUNT_CODES[appliedCoupon] : null;
  const promoDiscountAmount =
    activePromoObj && subtotal >= activePromoObj.minOrder
      ? activePromoObj.discountAmount
      : 0;

  const totalDiscountAmount = totalVipDiscountAmount + promoDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscountAmount);

  const handleApplyCouponCode = (codeToApply?: string) => {
    const clean = (codeToApply ?? couponInput).trim().toUpperCase();
    if (!clean) return;

    // Check if user typed a VIP voucher code into the input box
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
        "Mã không hợp lệ. Chọn nhanh các Voucher bên dưới hoặc nhập: FORUSKHTN, DRL80PLUS, GPA32PLUS, CSC00006"
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
        ? "Ví MoMo Sinh Viên (Chế độ Thử / Sandbox)"
        : paymentMethod === "vietqr-sandbox"
        ? "Quét mã VietQR Ngân hàng (Chế độ Thử / Sandbox)"
        : "Thanh toán tiền mặt khi nhận tại phòng học";

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
    setCompletedReceipt(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-md flex-col bg-[#FAF8F5] text-[#0B2545] shadow-2xl border-l border-[#E5DEC9] dark:border-slate-800 dark:bg-[#0D1525] dark:text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F2EFE9] border border-[#E5E0D5] dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-[#0B2545] dark:text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B2545] dark:text-white">
                {completedReceipt
                  ? "Biên lai thanh toán"
                  : `Giỏ hàng & Thanh toán (${items.length})`}
              </h2>
              {!completedReceipt && items.length > 0 && (
                <p className="text-[10px] font-medium text-[#64748B] dark:text-slate-400">
                  Xác nhận thanh toán để nhận +{totalPointsEarned} điểm VIP
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCompletedReceipt(null);
              onClose();
            }}
            aria-label="Đóng"
            className="w-8 h-8 rounded-xl bg-[#F2EFE9] hover:bg-[#E6E0D5] border border-[#E5E0D5] flex items-center justify-center text-[#0B2545] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt View if order completed */}
        {completedReceipt ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-1.5 text-base font-extrabold text-[#0B2545] dark:text-white">
                Thanh toán thành công #{completedReceipt.orderId}
              </h3>
              <p className="mt-0.5 text-xs text-[#4A5568] dark:text-slate-300">
                {completedReceipt.deliveryLocation}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  Đã cộng +{completedReceipt.earnedPoints}đ VIP
                </span>
                {completedReceipt.pointsRedeemed &&
                  completedReceipt.pointsRedeemed > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#D95326] px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                      Đổi -{completedReceipt.pointsRedeemed}đ VIP
                    </span>
                  )}
                {completedReceipt.appliedVoucherLabel && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#0B2545] px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300">
                    <Tag className="h-3 w-3" />
                    {completedReceipt.appliedVoucherLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-[#E6E0D5] bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
              {completedReceipt.items.map((it) => (
                <div
                  key={it.cartItemId}
                  className="flex justify-between gap-2 text-[#4A5568] dark:text-slate-300"
                >
                  <span className="truncate">
                    {it.quantity}× {it.name}
                  </span>
                  <span className="font-mono font-bold text-[#0B2545] dark:text-white shrink-0">
                    {(it.price * it.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
              {completedReceipt.discount && completedReceipt.discount > 0 ? (
                <div className="flex justify-between border-t border-[#EAE5DC] pt-2 text-xs font-bold text-emerald-600 dark:border-slate-800 dark:text-emerald-400">
                  <span>Giảm giá Voucher / Điểm VIP</span>
                  <span className="font-mono">
                    -{completedReceipt.discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[#EAE5DC] pt-2.5 text-sm font-extrabold text-[#0B2545] dark:border-slate-800 dark:text-white">
                <span>Tổng thanh toán</span>
                <span className="font-mono text-[#D95326] dark:text-amber-400">
                  {completedReceipt.totalAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompletedReceipt(null);
                onClose();
              }}
              className="w-full rounded-xl bg-[#0B2545] py-3 text-xs font-extrabold text-white transition hover:bg-[#163A66] cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F2EFE9] border border-[#E5E0D5] dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-[#64748B] dark:text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-extrabold text-[#0B2545] dark:text-white">
              Giỏ hàng trống
            </p>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              Hãy chọn học cụ, máy tính hoặc đặt in tài liệu để thanh toán và tích điểm VIP.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
              {/* 1. Cart Items List */}
              <div className="space-y-2.5">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex flex-col gap-2 rounded-2xl border border-[#E6E0D5] bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-[#0B2545] dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                          {item.variantLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer shrink-0"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          className="text-[#0B2545] dark:text-slate-200 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-extrabold text-[#0B2545] dark:text-white min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          className="text-[#0B2545] dark:text-slate-200 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          title="Cộng sau khi xác nhận thanh toán"
                          className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md"
                        >
                          +{item.pointsReward * item.quantity}đ VIP khi TT
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. VOUCHER & POINTS REDEMPTION HUB IN CHECKOUT */}
              <div className="rounded-2xl border border-[#E6E0D5] bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-[#D95326]" />
                    <span className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                      Kho Voucher &amp; Đổi Điểm Ưu Đãi
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-extrabold text-[#D95326] dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                    Khả dụng: {student.points}đ VIP
                  </span>
                </div>

                {/* Manual Code Input */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã (VD: VIP50, DRL80PLUS, FORUSKHTN)"
                    className="flex-1 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-3 py-1.5 font-mono text-xs uppercase text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCouponCode()}
                    className="rounded-xl bg-[#0B2545] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#163A66] shrink-0 cursor-pointer transition"
                  >
                    Áp dụng
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] font-medium text-rose-500">
                    {couponError}
                  </p>
                )}

                {/* Category Switcher: [Voucher Điểm VIP] vs [Điểm ĐRL / GPA & Khuyến Mãi] */}
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#F3EFE6] p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setVoucherTab("vip")}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-extrabold transition cursor-pointer ${
                      voucherTab === "vip"
                        ? "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950 shadow-2xs"
                        : "text-[#4A5568] dark:text-slate-300"
                    }`}
                  >
                    <Crown className="h-3 w-3" />
                    <span>Đổi Điểm VIP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherTab("other")}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-extrabold transition cursor-pointer ${
                      voucherTab === "other"
                        ? "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950 shadow-2xs"
                        : "text-[#4A5568] dark:text-slate-300"
                    }`}
                  >
                    <Award className="h-3 w-3" />
                    <span>Điểm ĐRL / GPA &amp; Khác</span>
                  </button>
                </div>

                {voucherTab === "vip" ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                    {VIP_VOUCHER_CATALOG.map((v) => {
                      const isSelected = selectedVipVoucherCode === v.code;
                      const isPreOwned = Boolean(
                        v.linkedHomeVoucherId &&
                          redeemedVoucherIds.includes(v.linkedHomeVoucherId)
                      );
                      const meetsMin = subtotal >= v.minOrder;
                      const enoughPoints =
                        isPreOwned || student.points >= (v.pointsCost || 0);
                      const canUse = meetsMin && enoughPoints;

                      return (
                        <div
                          key={v.code}
                          className={`rounded-xl border p-2.5 transition ${
                            isSelected
                              ? "border-[#D95326] bg-amber-500/10 dark:border-amber-400"
                              : "border-[#E6E0D5] bg-[#FAF8F5] dark:border-slate-700 dark:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#0B2545] text-amber-300">
                                  {v.code}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-[#D95326] dark:text-amber-400">
                                  {isPreOwned
                                    ? "✓ Đã đổi sẵn (0đ VIP)"
                                    : v.badgeLabel}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-[#0B2545] dark:text-white mt-1">
                                {v.title}
                              </p>
                              <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">
                                Đơn tối thiểu{" "}
                                {v.minOrder.toLocaleString("vi-VN")}đ
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
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                                isSelected
                                  ? "bg-[#D95326] text-white"
                                  : canUse
                                  ? "bg-[#0B2545] text-white hover:bg-[#163A66] dark:bg-amber-400 dark:text-slate-950"
                                  : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                              }`}
                            >
                              {isSelected
                                ? "Bỏ chọn"
                                : !meetsMin
                                ? `Đơn từ ${v.minOrder / 1000}k`
                                : !enoughPoints
                                ? `Thiếu ${(v.pointsCost || 0) - student.points}đ`
                                : isPreOwned
                                ? "Dùng ngay"
                                : `Đổi -${v.pointsCost}đ`}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Flexible 10-50 VIP points redemption */}
                    <div
                      className={`rounded-xl border p-2.5 transition flex items-center justify-between gap-2 ${
                        useFlexibleVipPoints && !selectedVipVoucherCode
                          ? "border-[#D95326] bg-amber-500/10"
                          : "border-[#E6E0D5] bg-[#FAF8F5] dark:border-slate-700 dark:bg-slate-800/70"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] font-bold text-[#D95326] dark:text-amber-400 block">
                          Đổi điểm VIP linh hoạt (1đ = 200đ)
                        </span>
                        <p className="text-xs font-extrabold text-[#0B2545] dark:text-white">
                          Dùng {flexibleRedeemablePoints} điểm VIP giảm{" "}
                          {(flexibleRedeemablePoints * 200).toLocaleString(
                            "vi-VN"
                          )}
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
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                          useFlexibleVipPoints && !selectedVipVoucherCode
                            ? "bg-[#D95326] text-white"
                            : "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950"
                        }`}
                      >
                        {useFlexibleVipPoints && !selectedVipVoucherCode
                          ? "Đã dùng ✓"
                          : flexibleRedeemablePoints >= 10
                          ? `Dùng -${flexibleRedeemablePoints}đ`
                          : "Tối thiểu 10đ"}
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
                          className={`rounded-xl border p-2.5 transition ${
                            isApplied
                              ? "border-emerald-600 bg-emerald-500/10 dark:border-emerald-400"
                              : "border-[#E6E0D5] bg-[#FAF8F5] dark:border-slate-700 dark:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-700 text-white">
                                  {vc.code}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                  {vc.badgeLabel} · -
                                  {vc.discountAmount.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-[#0B2545] dark:text-white mt-1">
                                {vc.title}
                              </p>
                              <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">
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
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                                isApplied
                                  ? "bg-emerald-600 text-white"
                                  : meetsMin
                                  ? "bg-[#0B2545] text-white hover:bg-[#163A66] dark:bg-amber-400 dark:text-slate-950"
                                  : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                              }`}
                            >
                              {isApplied
                                ? "Đã chọn ✓"
                                : meetsMin
                                ? "Áp dụng"
                                : `Đơn từ ${vc.minOrder / 1000}k`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Vouchers Summary */}
                {(totalVipDiscountAmount > 0 || promoDiscountAmount > 0) && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-2.5 text-[11px] space-y-1">
                    {totalVipDiscountAmount > 0 && (
                      <div className="flex justify-between font-bold text-[#D95326] dark:text-amber-300">
                        <span>
                          ✓ Ưu đãi Điểm VIP (
                          {activeVipVoucher
                            ? `${activeVipVoucher.code}${
                                isPreRedeemedVipVoucher
                                  ? " · Đã đổi sẵn"
                                  : ` · -${activePointsRedeemed}đ VIP`
                              }`
                            : `-${activePointsRedeemed}đ VIP`}
                          )
                        </span>
                        <span className="font-mono">
                          -{totalVipDiscountAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                    {promoDiscountAmount > 0 && activePromoObj && (
                      <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                        <span>
                          ✓ Voucher {activePromoObj.code} ({activePromoObj.badgeLabel})
                        </span>
                        <span className="font-mono">
                          -{promoDiscountAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Delivery Box */}
              <div className="space-y-2.5 rounded-2xl border border-[#E6E0D5] bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] dark:text-white">
                  <MapPin className="h-3.5 w-3.5 text-[#D95326]" />
                  <span>Nhận tại CS1 (227 NVC)</span>
                </div>

                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-3 py-2 text-xs font-semibold text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {CAMPUS_BUILDINGS_CS1.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Phòng & giờ nhận"
                    className="w-full rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Tên người nhận"
                    className="w-full rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#0B2545] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* 4. Payment Selector */}
              <div className="space-y-2 rounded-2xl border border-[#E6E0D5] bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] dark:text-white">
                  <CreditCard className="h-3.5 w-3.5 text-[#D95326]" />
                  <span>Phương thức thanh toán</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "momo-sandbox", label: "MoMo" },
                    { id: "vietqr-sandbox", label: "VietQR" },
                    { id: "cod-room", label: "Tiền mặt" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(opt.id as typeof paymentMethod)
                      }
                      className={`rounded-xl py-2 text-xs font-extrabold transition cursor-pointer ${
                        paymentMethod === opt.id
                          ? "bg-[#0B2545] text-white dark:bg-amber-400 dark:text-slate-950"
                          : "border border-[#E5E0D5] bg-[#FAF8F5] text-[#4A5568] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Price Breakdown & Points Earned Upon Payment Confirmation */}
            <div className="border-t border-[#E5DEC9] bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
              {totalDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] dark:text-slate-400">
                    Tạm tính: {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Giảm: -{totalDiscountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#0B2545] dark:text-white font-bold block">
                    Tổng thanh toán ({items.length} mục)
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{totalPointsEarned} điểm VIP cộng khi hoàn tất
                    {activePointsRedeemed > 0
                      ? ` (Đổi -${activePointsRedeemed}đ VIP)`
                      : ""}
                  </span>
                </div>
                <span className="font-mono text-lg font-extrabold text-[#D95326] dark:text-amber-400">
                  {finalTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#D95326] py-3 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#C0441B] cursor-pointer"
              >
                Xác nhận thanh toán (+{totalPointsEarned}đ VIP)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
