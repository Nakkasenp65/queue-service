"use client";

export default function AdminPage() {
  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard (Placeholder)</h1>
        <p className="text-slate-600 mb-4">
          หน้านี้เป็นที่สำหรับจัดการระบบ — จะมีฟังก์ชันจริงเมื่อเชื่อมระบบยืนยันตัวตน
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">รายการคิว (แก้ไขได้)</div>
          <div className="p-4 border rounded-lg">จัดการพนักงาน</div>
        </div>
      </div>
    </main>
  );
}
