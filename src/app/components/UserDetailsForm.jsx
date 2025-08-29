"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DPOConsent from "./DPOConsent";
import { useCustomer } from "../hooks/useCustomer";

export default function UserDetailsForm({ formData, setFormData, onSubmit, liffProfile, isSubmitting = false }) {
  const isValid = formData.customerName?.length > 0 && formData.customerPhone?.length > 0;
  const [acceptDPO, setAcceptDPO] = useState(false);
  const [showDPOContent, setShowDPOContent] = useState(false);
  const [pressed, setPressed] = useState(false); // local immediate press feedback

  const { customer, isLoading, createCustomer, isCreating, error } = useCustomer(liffProfile?.userId);

  // Check for existing customer data in localStorage or from query
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerName: customer.fullname || "",
        customerPhone: customer.phone || "",
        lineUserId: customer.line_user_id,
      }));
    }

    // Always attach LINE profile data to formData
    if (liffProfile) {
      setFormData((prev) => ({
        ...prev,
        lineUserId: liffProfile.userId,
        lineDisplayName: liffProfile.displayName,
        lineProfilePicUrl: liffProfile.pictureUrl,
      }));
    }
  }, [customer, liffProfile, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate both fields are filled
    const newFormData = { ...formData, [name]: value };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid && acceptDPO) {
      // Provide immediate tactile feedback and prevent double-clicks
      try {
        setPressed(true);
        const res = onSubmit && onSubmit();
        // If parent returns a promise (mutateAsync), wait for it so we can reset pressed accordingly.
        if (res && typeof res.then === "function") {
          await res;
        }
      } catch (err) {
        // swallow - parent handles errors and shows alerts
      } finally {
        // We'll also rely on the parent `isSubmitting` prop to clear the pressed state when the action completes.
        if (!isSubmitting) setPressed(false);
      }
    }
  };

  // When parent submission state changes to false, clear local pressed state
  useEffect(() => {
    if (!isSubmitting) setPressed(false);
  }, [isSubmitting]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("go-back-to-datetime"))}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← กลับ
        </button>
        <h2 className="text-xl font-semibold">กรุณากรอกข้อมูลการจอง</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="กรอกเบอร์โทรศัพท์"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>
        </div>

        {/* Add Note Textarea */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            ข้อมูลเพิ่มเติม (ไม่บังคับ)
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            value={formData.note || ""}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="กรุณาระบุรายละเอียดเพิ่มเติมเกี่ยวกับบริการที่ต้องการ (เช่น สภาพเครื่อง, อาการ, ความต้องการพิเศษ)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">ช่วยให้พนักงานเข้าใจความต้องการของคุณได้ดียิ่งขึ้น</p>
        </div>

        <div className="flex items-start space-x-2 p-4">
          <input
            type="checkbox"
            id="dpoConsent"
            checked={acceptDPO}
            onChange={(e) => {
              const checked = e.target.checked;
              if (checked) {
                // Show full DPO modal for explicit acceptance
                setShowDPOContent(true);
              } else {
                // Allow unchecking to withdraw consent locally
                setAcceptDPO(false);
              }
            }}
            className="mt-1"
          />
          <label htmlFor="dpoConsent" className="text-sm text-slate-700">
            ฉันยอมรับ{" "}
            <button
              type="button"
              onClick={() => setShowDPOContent(true)}
              className="text-blue-500 underline hover:text-blue-600"
            >
              เงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล
            </button>
          </label>
        </div>

        {error && <div className="text-red-500 text-sm text-center mt-2">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>}
        <button
          type="submit"
          disabled={!isValid || !acceptDPO || isLoading || isCreating || isSubmitting || pressed}
          aria-busy={isCreating || isSubmitting || pressed}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition transform active:scale-95 flex items-center justify-center gap-2 ${
            isValid && acceptDPO && !isLoading && !isCreating && !isSubmitting
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          {isCreating || isSubmitting || pressed ? (
            <>
              <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin inline-block" />
              <span>{isCreating || isSubmitting ? "กำลังดำเนินการ..." : "กำลังส่ง..."}</span>
            </>
          ) : (
            "ดำเนินการต่อ"
          )}
        </button>
      </form>

      {showDPOContent && (
        <DPOConsent
          onAccept={() => {
            setAcceptDPO(true);
            setShowDPOContent(false);
          }}
        />
      )}
    </div>
  );
}
