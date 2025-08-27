"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, FileText, Image, Tag, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function EmployeeProfilePage() {
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    bio: "",
    profileImageUrl: "",
    abilityTags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (response.status === 401) {
        router.push("/queueManagement/login");
        return;
      }

      const data = await response.json();
      setFormData({
        fullname: data.fullname || "",
        phone: data.phone || "",
        bio: data.bio || "",
        profileImageUrl: data.profileImageUrl || "",
        abilityTags: data.employeeTags?.map((et) => et.tag.name) || [],
      });

      // If first login, show welcome message
      if (data.firstLogin) {
        Swal.fire({
          title: "ยินดีต้อนรับ!",
          text: "นี่เป็นการเข้าสู่ระบบครั้งแรก กรุณาอัปเดตข้อมูลโปรไฟล์ของคุณ",
          icon: "success",
          confirmButtonText: "เริ่มใช้งาน",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/queueManagement/admin");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagChange = (tagName, checked) => {
    setFormData((prev) => ({
      ...prev,
      abilityTags: checked ? [...prev.abilityTags, tagName] : prev.abilityTags.filter((tag) => tag !== tagName),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            href="/queueManagement/admin"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Link>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">แก้ไขข้อมูลส่วนตัว</h1>
            <p className="text-slate-600 text-sm">อัปเดตข้อมูลและทักษะของคุณ</p>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อเต็ม</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullname: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อเต็ม"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เบอร์โทรศัพท์</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">รูปภาพโปรไฟล์ (URL)</label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, profileImageUrl: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">เกี่ยวกับตัวเอง</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="เกี่ยวกับตัวเอง"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ทักษะ</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label key={tag.name} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.abilityTags.includes(tag.name)}
                      onChange={(e) => handleTagChange(tag.name, e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              isSubmitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            } text-white flex items-center justify-center gap-2`}
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
