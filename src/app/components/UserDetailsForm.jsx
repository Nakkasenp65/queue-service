"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DPOConsent from "./DPOConsent";
import { useCustomer } from "../hooks/useCustomer";

export default function UserDetailsForm({ formData, setFormData, onSubmit, liffProfile }) {
  const [isValid, setIsValid] = useState(false);
  const [acceptDPO, setAcceptDPO] = useState(false);
  const [showDPOContent, setShowDPOContent] = useState(false);

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
    setIsValid(newFormData.customerName?.length > 0 && newFormData.customerPhone?.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid && acceptDPO) {
      // Just proceed to next step - let the appointment creation handle customer creation
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-[420px] space-y-6 p-4"
    >
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

        <div className="flex items-start space-x-2 p-4">
          <input
            type="checkbox"
            id="dpoConsent"
            checked={acceptDPO}
            onChange={(e) => setAcceptDPO(e.target.checked)}
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
          disabled={!isValid || !acceptDPO || isLoading || isCreating}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
            isValid && acceptDPO && !isLoading && !isCreating
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          }`}
        >
          {isLoading || isCreating ? "กำลังดำเนินการ..." : "ดำเนินการต่อ"}
        </button>
      </form>

      {showDPOContent && <DPOConsent onClose={() => setShowDPOContent(false)} />}
    </motion.div>
  );
}
