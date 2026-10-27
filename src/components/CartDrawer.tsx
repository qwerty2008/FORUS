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

  const activeDiscountObj = appliedCoupon
    ? DISCOUNT_CODES[appliedCoupon]
    : null;
  const discountAmount =
    activeDiscountObj && subtotal >= activeDiscountObj.minOrder
      ? activeDiscountObj.discountAmount
      : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

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
        ? "Chuyển khoản VietQR (Chế độ Thử / Sandbox)"
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
      earnedPoints: totalPointsEarned,
    };

    onCompleteOrder(receipt);
    setCompletedReceipt(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {completedReceipt
                ? "Biên Lai Xác Nhận Đơn Hàng"
                : `Giỏ Hàng Tiện Ích FORUS (${items.length})`}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setCompletedReceipt(null);
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt View if order completed */}
        {completedReceipt ? (
          <div className="flex-1 space-y-5 overflow-y-auto p-6">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Đặt Hàng Thử Nghiệm Thành Công!
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Mã đơn:{" "}
                <strong className="font-mono">{completedReceipt.orderId}</strong>{" "}
                · Giao tới: {completedReceipt.deliveryLocation}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-mono text-xs font-bold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                <span>+{completedReceipt.earnedPoints} Điểm Tích Lũy FORUS</span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {completedReceipt.studentName} ({completedReceipt.studentEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức (Chế độ thử):</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {completedReceipt.paymentMethod}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Chi tiết sản phẩm / dịch vụ:
                </span>
                <ul className="mt-2 space-y-1.5">
                  {completedReceipt.items.map((it) => (
                    <li
                      key={it.cartItemId}
                      className="flex justify-between text-slate-600 dark:text-slate-300"
                    >
                      <span>
                        {it.quantity}x {it.name} ({it.variantLabel})
                      </span>
                      <span className="font-mono font-semibold">
                        {(it.price * it.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Tổng thanh toán (Chế độ thử):</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400">
                    {completedReceipt.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompletedReceipt(null);
                onClose();
              }}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              Tiếp Tục Khám Phá Hệ Sinh Thái FORUS
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
              Giỏ hàng của bạn đang trống
            </h3>
            <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
              Hãy chọn thuê/mua Combo iPad Sinh Viên, đặt bánh mì giao tận phòng hoặc gửi file in A1–A5 để tích lũy 5–10 điểm mỗi đơn nhé!
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Item List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                          {item.categoryLabel} · +{item.pointsReward * item.quantity} điểm
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Phân loại: {item.variantLabel}
                        </p>
                        {item.customMeta && (
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {item.customMeta}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-500"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Box */}
              <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mã giảm giá sinh viên (Thử: FORUSKHTN hoặc CSC00006)
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã ưu đãi..."
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs uppercase text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700 whitespace-nowrap shrink-0"
                  >
                    Áp Dụng
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1.5 text-[11px] text-rose-500">
                    {couponError}
                  </p>
                )}
                {activeDiscountObj && (
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Đã áp dụng {activeDiscountObj.code}:{" "}
                    {activeDiscountObj.desc}
                  </p>
                )}
              </div>

              {/* Campus Room Delivery Selection */}
              <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  <span>Giao Tận Phòng Học — Cơ Sở 1 (227 Nguyễn Văn Cừ)</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Chọn Tòa nhà / Dãy phòng học
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {CAMPUS_BUILDINGS_CS1.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Số phòng & Khung giờ nhận
                    </label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="VD: Phòng E302 - 9h10"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Tên người nhận (Biệt danh/Tên)
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sandbox Payment Options (per Đồ án 1 requirement) */}
              <div className="space-y-2.5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <CreditCard className="h-4 w-4 text-sky-500" />
                    <span>Phương Thức Thanh Toán (Chế Độ Thử)</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    An toàn 100%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    {
                      id: "momo-sandbox",
                      label: "Ví MoMo Sinh Viên (Chế độ Thử - Không trừ tiền thật)",
                    },
                    {
                      id: "vietqr-sandbox",
                      label: "Quét mã VietQR Ngân hàng (Chế độ Thử Nghiệm)",
                    },
                    {
                      id: "cod-room",
                      label: "Tiền mặt khi nhận đồ tại cửa phòng học CS1",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition ${
                        paymentMethod === opt.id
                          ? "border-sky-600 bg-sky-50/70 dark:border-sky-400 dark:bg-sky-950/40"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === opt.id}
                        onChange={() =>
                          setPaymentMethod(opt.id as typeof paymentMethod)
                        }
                        className="text-sky-600"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>

                <p className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Tuân thủ tiêu chí Đồ án 1 (CSC00006): Thanh toán ở chế độ thử nghiệm, không thu thông tin thẻ hay tài khoản cá nhân thật.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer Totals & Submit */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tạm tính ({items.length} mục):</span>
                  <span className="font-mono">
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Giảm giá ({appliedCoupon}):</span>
                    <span className="font-mono">
                      -{discountAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Điểm thưởng tích lũy sau đơn này:</span>
                  <span className="font-mono font-bold">
                    +{totalPointsEarned} điểm FORUS
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="font-mono text-xl font-extrabold text-sky-600 dark:text-sky-400">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-sky-500"
              >
                Xác Nhận Thanh Toán Thử & Nhận +{totalPointsEarned} Điểm
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
