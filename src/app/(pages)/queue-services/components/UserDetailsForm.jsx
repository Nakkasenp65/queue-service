'use client';

import { useState, useEffect } from 'react';
import DPOConsent from './DPOConsent';
import { Asterisk, Circle, CircleCheckBig } from 'lucide-react';

export default function UserDetailsForm({
  formData,
  setFormData,
  onSubmit,
  liffProfile,
  isSubmitting = false,
  customer,
  isLoading,
  isCreating,
  acceptDPO,
  setAcceptDPO,
  showDPOContent,
  setShowDPOContent,
  pressed,
  setPressed,
}) {
  const isValid = formData.customerName?.length > 0 && formData.customerPhone?.length > 0;

  // Check for existing customer data in localStorage or from query
  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerName: customer.fullname || '',
        customerPhone: customer.phone || '',
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
      onSubmit && onSubmit();
    }
  };

  // When parent submission state changes to false, clear local pressed state
  useEffect(() => {
    if (!isSubmitting) setPressed(false);
  }, [isSubmitting]);

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            typeof window !== 'undefined' &&
            window.dispatchEvent(new CustomEvent('go-back-to-datetime'))
          }
          className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← กลับ
        </button>
        <h2 className="text-xl font-semibold">กรุณากรอกข้อมูลการจอง</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex grow flex-col gap-8">
        {/* FORM FIELDS */}
        <div className="flex flex-2 flex-col gap-4">
          {/* FULLNAME */}
          <div className="flex flex-col gap-2">
            <label className="flex w-full items-center justify-between text-sm font-medium text-slate-700">
              ชื่อ-นามสกุล <Asterisk size={12} className="text-red-500" />
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>

          {/* PHONE */}
          <div className="flex flex-col gap-2">
            <label className="flex w-full items-center justify-between text-sm font-medium text-slate-700">
              เบอร์โทรศัพท์ <Asterisk size={12} className="text-red-500" />
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="กรอกเบอร์โทรศัพท์"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            {/* TEXT AREA FOR NOTE */}
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              ข้อมูลเพิ่มเติม
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="กรุณาระบุรายละเอียดเพิ่มเติมเกี่ยวกับบริการที่ต้องการ (เช่น สภาพเครื่อง, อาการ, ความต้องการพิเศษ)"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* DPO CHECKBOX */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              role="checkbox"
              aria-checked={acceptDPO}
              aria-label="ยอมรับเงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล"
              onClick={() => {
                if (acceptDPO) {
                  // Withdraw consent
                  setAcceptDPO(false);
                } else {
                  // Require explicit acceptance via modal
                  setShowDPOContent(true);
                }
              }}
              className={`inline-flex h-6 w-6 items-center justify-center ${acceptDPO ? 'text-green-500' : 'text-slate-400'}`}
            >
              {acceptDPO ? <CircleCheckBig /> : <Circle />}
            </button>

            <div className="text-sm text-slate-700">
              ฉันยอมรับ{' '}
              <button
                type="button"
                onClick={() => setShowDPOContent(true)}
                className="text-blue-500 underline hover:text-blue-600"
              >
                เงื่อนไขการคุ้มครองข้อมูลส่วนบุคคล
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!isValid || !acceptDPO || isLoading || isCreating || isSubmitting || pressed}
            aria-busy={isCreating || isSubmitting || pressed}
            className={`flex w-full transform items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition active:scale-95 ${
              isValid && acceptDPO && !isLoading && !isCreating && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            {isCreating || isSubmitting || pressed ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                <span>{isCreating || isSubmitting ? 'กำลังดำเนินการ...' : 'กำลังส่ง...'}</span>
              </>
            ) : (
              'ดำเนินการต่อ'
            )}
          </button>
        </div>
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
