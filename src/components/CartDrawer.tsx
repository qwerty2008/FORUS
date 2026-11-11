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

  // 2. Calculate Other Points / Promo Voucher Discount
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-[#F6F2E8] text-[#0B2545] shadow-2xl border-l border-[#DCD5C7] dark:border-[#233044] dark:bg-[#0E1624] dark:text-[#F6F2E8]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#DCD5C7] px-5 py-4 dark:border-[#233044]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-[#DCD5C7] dark:border-[#233044] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-[#D95326]" />
            </div>
            <div>
              <h2 className="text-small font-bold">
                {completedReceipt
                  ? "Biên lai thanh toán"
                  : `Giỏ hàng & Thanh toán (${items.length})`}
              </h2>
              {!completedReceipt && items.length > 0 && (
                <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70">
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
            className="w-8 h-8 rounded border border-[#DCD5C7] dark:border-[#233044] flex items-center justify-center cursor-pointer transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt View if order completed */}
        {completedReceipt ? (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="rounded-md border border-green-700/30 bg-green-950/10 p-4 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-700 dark:text-green-400" />
              <h3 className="mt-1.5 text-body font-bold">
                Thanh toán thành công #{completedReceipt.orderId}
              </h3>
              <p className="mt-0.5 text-tiny text-[#0B2545]/75 dark:text-[#F6F2E8]/75">
                {completedReceipt.deliveryLocation}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-green-700 px-2.5 py-1 text-tiny font-bold text-white tabular-nums">
                  <Sparkles className="h-3 w-3" />
                  Đã cộng +{completedReceipt.earnedPoints}đ VIP
                </span>
                {completedReceipt.pointsRedeemed &&
                  completedReceipt.pointsRedeemed > 0 && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#D95326] px-2.5 py-1 text-tiny font-bold text-white tabular-nums">
                      Đổi -{completedReceipt.pointsRedeemed}đ VIP
                    </span>
                  )}
                {completedReceipt.appliedVoucherLabel && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#0B2545] px-2.5 py-1 text-tiny font-bold text-[#F6F2E8]">
                    <Tag className="h-3 w-3" />
                    {completedReceipt.appliedVoucherLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 rounded-md border border-[#DCD5C7] bg-[#EFEAE0]/50 p-4 text-small dark:border-[#233044] dark:bg-[#152033]/50">
              {completedReceipt.items.map((it) => (
                <div
                  key={it.cartItemId}
                  className="flex justify-between gap-2"
                >
                  <span className="truncate">
                    {it.quantity}× {it.name}
                  </span>
                  <span className="font-bold tabular-nums shrink-0">
                    {(it.price * it.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ))}
              {completedReceipt.discount && completedReceipt.discount > 0 ? (
                <div className="flex justify-between border-t border-[#DCD5C7] pt-2 text-tiny font-bold text-green-700 dark:border-[#233044] dark:text-green-400">
                  <span>Giảm giá Voucher / Điểm VIP</span>
                  <span className="tabular-nums">
                    -{completedReceipt.discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[#DCD5C7] pt-2.5 text-small font-bold dark:border-[#233044]">
                <span>Tổng thanh toán</span>
                <span className="tabular-nums text-[#D95326]">
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
              className="w-full rounded bg-[#0B2545] py-3 text-small font-bold text-[#F6F2E8] transition cursor-pointer"
            >
              Hoàn tất
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <img
              src="./assets/art/empty-cart.webp"
              alt="Sổ tay giỏ hàng trống"
              width={144}
              height={144}
              loading="lazy"
              className="w-36 h-36 object-contain rounded-[4px] border border-[#E2E8F0] dark:border-[#233044] bg-white"
            />
            <p className="mt-4 font-serif-display text-h2 font-bold">
              Sổ tay đơn hàng đang trống
            </p>
            <p className="mt-1 text-tiny text-[#0B2545]/70 dark:text-[#F8FAFC]/70 max-w-xs">
              Chọn máy tính Casio, áo blouse hoặc đặt in tài liệu để nhận tại Sảnh Tòa I.
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
                    className="flex flex-col gap-2 rounded-md border border-[#DCD5C7] bg-[#EFEAE0]/40 p-3 dark:border-[#233044] dark:bg-[#152033]/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-small font-bold truncate">
                          {item.name}
                        </h4>
                        <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 truncate">
                          {item.variantLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#0B2545]/60 dark:text-[#F6F2E8]/60 hover:text-red-600 p-1 cursor-pointer shrink-0"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded border border-[#DCD5C7] dark:border-[#233044] px-2 py-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          className="cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-tiny font-bold tabular-nums min-w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          className="cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          title="Cộng sau khi xác nhận thanh toán"
                          className="text-tiny font-bold text-green-700 dark:text-green-400 tabular-nums"
                        >
                          +{item.pointsReward * item.quantity}đ VIP khi TT
                        </span>
                        <span className="text-small font-bold tabular-nums">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. VOUCHER & POINTS REDEMPTION HUB IN CHECKOUT */}
              <div className="rounded-md border border-[#DCD5C7] p-3.5 dark:border-[#233044] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-[#D95326]" />
                    <span className="text-tiny font-bold">
                      Kho Voucher &amp; Đổi Điểm Ưu Đãi
                    </span>
                  </div>
                  <span className="text-tiny font-bold text-[#D95326] tabular-nums">
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
                    className="flex-1 rounded border border-[#DCD5C7] bg-transparent px-3 py-1.5 text-tiny uppercase focus:border-[#0B2545] focus:outline-none dark:border-[#233044]"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCouponCode()}
                    className="rounded bg-[#0B2545] px-3 py-1.5 text-tiny font-bold text-[#F6F2E8] shrink-0 cursor-pointer transition"
                  >
                    Áp dụng
                  </button>
                </div>

                {couponError && (
                  <p className="text-tiny font-bold text-red-700 dark:text-red-400">
                    {couponError}
                  </p>
                )}

                {/* Category Switcher */}
                <div className="grid grid-cols-2 gap-1.5 rounded bg-[#EFEAE0] p-1 dark:bg-[#152033]">
                  <button
                    type="button"
                    onClick={() => setVoucherTab("vip")}
                    className={`flex items-center justify-center gap-1 rounded py-1.5 text-tiny font-bold transition cursor-pointer ${
                      voucherTab === "vip"
                        ? "bg-[#0B2545] text-[#F6F2E8]"
                        : ""
                    }`}
                  >
                    <Crown className="h-3 w-3" />
                    <span>Đổi Điểm VIP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherTab("other")}
                    className={`flex items-center justify-center gap-1 rounded py-1.5 text-tiny font-bold transition cursor-pointer ${
                      voucherTab === "other"
                        ? "bg-[#0B2545] text-[#F6F2E8]"
                        : ""
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
                          className={`rounded border p-2.5 transition ${
                            isSelected
                              ? "border-[#D95326] bg-[#EFEAE0] dark:bg-[#152033]"
                              : "border-[#DCD5C7] dark:border-[#233044]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-tiny font-bold px-1.5 py-0.5 rounded bg-[#0B2545] text-[#F6F2E8]">
                                  {v.code}
                                </span>
                                <span className="text-tiny font-bold text-[#D95326]">
                                  {isPreOwned
                                    ? "✓ Đã đổi sẵn (0đ VIP)"
                                    : v.badgeLabel}
                                </span>
                              </div>
                              <p className="text-tiny font-bold mt-1">
                                {v.title}
                              </p>
                              <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 mt-0.5 tabular-nums">
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
                              className={`px-2.5 py-1.5 rounded text-tiny font-bold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                                isSelected
                                  ? "bg-[#D95326] text-white"
                                  : canUse
                                  ? "bg-[#0B2545] text-[#F6F2E8]"
                                  : "border border-[#DCD5C7] dark:border-[#233044]"
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
                      className={`rounded border p-2.5 transition flex items-center justify-between gap-2 ${
                        useFlexibleVipPoints && !selectedVipVoucherCode
                          ? "border-[#D95326] bg-[#EFEAE0] dark:bg-[#152033]"
                          : "border-[#DCD5C7] dark:border-[#233044]"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-tiny font-bold text-[#D95326] block">
                          Đổi điểm VIP linh hoạt (1đ = 200đ)
                        </span>
                        <p className="text-tiny font-bold tabular-nums">
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
                        className={`px-2.5 py-1.5 rounded text-tiny font-bold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                          useFlexibleVipPoints && !selectedVipVoucherCode
                            ? "bg-[#D95326] text-white"
                            : "bg-[#0B2545] text-[#F6F2E8]"
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
                          className={`rounded border p-2.5 transition ${
                            isApplied
                              ? "border-green-700 bg-green-950/10"
                              : "border-[#DCD5C7] dark:border-[#233044]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-tiny font-bold px-1.5 py-0.5 rounded bg-green-700 text-white">
                                  {vc.code}
                                </span>
                                <span className="text-tiny font-bold text-green-700 dark:text-green-400 tabular-nums">
                                  {vc.badgeLabel} · -
                                  {vc.discountAmount.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                              <p className="text-tiny font-bold mt-1">
                                {vc.title}
                              </p>
                              <p className="text-tiny text-[#0B2545]/70 dark:text-[#F6F2E8]/70 mt-0.5">
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
                              className={`px-2.5 py-1.5 rounded text-tiny font-bold shrink-0 transition cursor-pointer disabled:opacity-40 ${
                                isApplied
                                  ? "bg-green-700 text-white"
                                  : meetsMin
                                  ? "bg-[#0B2545] text-[#F6F2E8]"
                                  : "border border-[#DCD5C7] dark:border-[#233044]"
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
                  <div className="rounded bg-green-950/10 border border-green-700/30 p-2.5 text-tiny space-y-1">
                    {totalVipDiscountAmount > 0 && (
                      <div className="flex justify-between font-bold text-[#D95326]">
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
                        <span className="tabular-nums">
                          -{totalVipDiscountAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                    {promoDiscountAmount > 0 && activePromoObj && (
                      <div className="flex justify-between font-bold text-green-700 dark:text-green-400">
                        <span>
                          ✓ Voucher {activePromoObj.code} ({activePromoObj.badgeLabel})
                        </span>
                        <span className="tabular-nums">
                          -{promoDiscountAmount.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Delivery Box */}
              <div className="space-y-2.5 rounded-md border border-[#DCD5C7] p-3.5 dark:border-[#233044]">
                <div className="flex items-center gap-1.5 text-tiny font-bold">
                  <MapPin className="h-3.5 w-3.5 text-[#D95326]" />
                  <span>Nhận tại CS1 (227 NVC)</span>
                </div>

                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full rounded border border-[#DCD5C7] bg-[#F6F2E8] px-3 py-2 text-tiny font-bold dark:border-[#233044] dark:bg-[#0E1624]"
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
                    className="w-full rounded border border-[#DCD5C7] bg-transparent px-3 py-1.5 text-tiny dark:border-[#233044]"
                  />
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Tên người nhận"
                    className="w-full rounded border border-[#DCD5C7] bg-transparent px-3 py-1.5 text-tiny dark:border-[#233044]"
                  />
                </div>
              </div>

              {/* 4. Payment Selector */}
              <div className="space-y-2 rounded-md border border-[#DCD5C7] p-3.5 dark:border-[#233044]">
                <div className="flex items-center gap-1.5 text-tiny font-bold">
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
                      className={`rounded py-2 text-tiny font-bold transition cursor-pointer ${
                        paymentMethod === opt.id
                          ? "bg-[#0B2545] text-[#F6F2E8]"
                          : "border border-[#DCD5C7] dark:border-[#233044]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Price Breakdown & Points Earned Upon Payment Confirmation */}
            <div className="border-t border-[#DCD5C7] bg-[#EFEAE0]/60 px-5 py-4 dark:border-[#233044] dark:bg-[#152033]/60 space-y-2">
              {totalDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-tiny tabular-nums">
                  <span>
                    Tạm tính: {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    Giảm: -{totalDiscountAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-tiny">
                <div>
                  <span className="font-bold block">
                    Tổng thanh toán ({items.length} mục)
                  </span>
                  <span className="font-bold text-green-700 dark:text-green-400 tabular-nums">
                    +{totalPointsEarned} điểm VIP cộng khi hoàn tất
                    {activePointsRedeemed > 0
                      ? ` (Đổi -${activePointsRedeemed}đ VIP)`
                      : ""}
                  </span>
                </div>
                <span className="text-h2 font-bold text-[#D95326] tabular-nums">
                  {finalTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded bg-[#D95326] py-3 text-small font-bold text-white transition hover:bg-[#C0441B] cursor-pointer"
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
