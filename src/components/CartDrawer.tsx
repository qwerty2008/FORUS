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
  ShieldCheck,
} from "lucide-react";
import { CartItem, OrderReceipt, StudentProfile } from "../types";
import { CAMPUS_BUILDINGS_CS1, DISCOUNT_CODES } from "../data/forusData";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  student: StudentProfile;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCompleteOrder: (receipt: OrderReceipt) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  student,
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
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [useVipPointsDiscount, setUseVipPointsDiscount] = useState(false);
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

  // Redeemable points in cart: up to 50 points (or max available points >= 10), 1 point = 200đ
  const redeemablePoints = Math.min(student.points, 50);
  const pointsDiscountAmount =
    useVipPointsDiscount && redeemablePoints >= 10 ? redeemablePoints * 200 : 0;
  const activePointsRedeemed =
    useVipPointsDiscount && redeemablePoints >= 10 ? redeemablePoints : 0;

  const activeDiscountObj = appliedCoupon
    ? DISCOUNT_CODES[appliedCoupon]
    : null;
  const couponDiscountAmount =
    activeDiscountObj && subtotal >= activeDiscountObj.minOrder
      ? activeDiscountObj.discountAmount
      : 0;

  const discountAmount = couponDiscountAmount + pointsDiscountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const getMembershipTierLabel = (pts: number) => {
    if (pts >= 100) return "Hạng VIP FORUS (Đã mở khóa 100%)";
    if (pts >= 50) return "Hạng Bạc FORUS (Thành viên Tích cực)";
    return "Hạng Tiêu Chuẩn FORUS";
  };

  const handleApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    const found = DISCOUNT_CODES[clean];
    if (!found) {
      setCouponError("Mã giảm giá không tồn tại. Thử: FORUSKHTN hoặc CSC00006");
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

    const receipt: OrderReceipt = {
      orderId: `FORUS-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString("vi-VN"),
      studentName: recipientName || student.fullName || "Sinh viên KHTN",
      studentEmail: student.email || "24120001@student.hcmus.edu.vn",
      deliveryLocation: `${building} — ${roomNumber}`,
      paymentMethod: paymentLabel,
      items: [...items],
      subtotal,
      discount: discountAmount,
      total: finalTotal,
      totalAmount: finalTotal,
      earnedPoints: totalPointsEarned,
      pointsRedeemed: activePointsRedeemed,
    };

    onCompleteOrder(receipt);
    setUseVipPointsDiscount(false);
    setCompletedReceipt(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-md flex-col bg-[#FAF8F5] text-[#0B2545] shadow-2xl border-l border-[#E5DEC9] dark:border-slate-800 dark:bg-[#0D1525] dark:text-slate-100">
        {/* Minimal Top Header */}
        <div className="flex items-center justify-between border-b border-[#E5DEC9] px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F2EFE9] border border-[#E5E0D5] dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-[#0B2545] dark:text-amber-300" />
            </div>
            <h2 className="text-sm font-extrabold text-[#0B2545] dark:text-white">
              {completedReceipt ? "Biên lai đơn hàng" : `Giỏ hàng (${items.length})`}
            </h2>
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
                Đặt thành công #{completedReceipt.orderId}
              </h3>
              <p className="mt-0.5 text-xs text-[#4A5568] dark:text-slate-300">
                {completedReceipt.deliveryLocation}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  +{completedReceipt.earnedPoints}đ
                </span>
                {completedReceipt.pointsRedeemed &&
                  completedReceipt.pointsRedeemed > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#D95326] px-2.5 py-1 font-mono text-[11px] font-bold text-white">
                      -{completedReceipt.pointsRedeemed}đ
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
              Đóng
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
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
              {/* Minimal Item Cards */}
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
                        <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          +{item.pointsReward * item.quantity}đ
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-[#0B2545] dark:text-white">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compact Points + Coupon Row */}
              <div className="rounded-2xl border border-[#E6E0D5] bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0B2545] dark:text-white">
                    Điểm khả dụng:{" "}
                    <strong className="font-mono text-[#D95326] dark:text-amber-400">
                      {student.points}đ
                    </strong>
                  </span>
                  <button
                    type="button"
                    disabled={redeemablePoints < 10}
                    onClick={() => setUseVipPointsDiscount((prev) => !prev)}
                    className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition cursor-pointer disabled:opacity-40 ${
                      useVipPointsDiscount
                        ? "bg-[#D95326] text-white"
                        : "bg-[#F2EFE9] text-[#0B2545] hover:bg-[#E6E0D5] dark:bg-slate-800 dark:text-amber-300"
                    }`}
                  >
                    {useVipPointsDiscount
                      ? `Đã dùng -${activePointsRedeemed}đ ✓`
                      : redeemablePoints >= 10
                      ? `Dùng ${redeemablePoints}đ (-${(
                          redeemablePoints * 200
                        ).toLocaleString("vi-VN")}đ)`
                      : "Tối thiểu 10đ"}
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Mã giảm giá (VD: FORUSKHTN)"
                    className="flex-1 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5] px-3 py-1.5 font-mono text-xs uppercase text-[#0B2545] focus:border-[#0B2545] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-[#0B2545] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#163A66] shrink-0 cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-500">{couponError}</p>
                )}
                {activeDiscountObj && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ {activeDiscountObj.code} (-
                    {activeDiscountObj.discountAmount.toLocaleString("vi-VN")}đ)
                  </p>
                )}
              </div>

              {/* Compact Delivery Box */}
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

              {/* Minimal Segmented Payment Selector */}
              <div className="space-y-2 rounded-2xl border border-[#E6E0D5] bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0B2545] dark:text-white">
                  <CreditCard className="h-3.5 w-3.5 text-[#D95326]" />
                  <span>Thanh toán</span>
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

            {/* Minimalist Footer */}
            <div className="border-t border-[#E5DEC9] bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#64748B] dark:text-slate-400">
                  Tổng ({items.length} mục · +{totalPointsEarned}đ)
                </span>
                <span className="font-mono text-lg font-extrabold text-[#0B2545] dark:text-amber-400">
                  {finalTotal.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#D95326] py-3 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#C0441B] cursor-pointer"
              >
                Xác nhận đặt đơn
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
