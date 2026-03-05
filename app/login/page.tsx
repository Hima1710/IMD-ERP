"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Phone, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mobileToEmail = (m: string): string => {
    const cleaned = m.trim();
    return `${cleaned}@paintmaster.com`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!mobile || !password) {
        setError("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      const email = mobileToEmail(mobile);

      const { error: signInError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Image (hidden on mobile, visible on lg+) */}
      <div 
        className="hidden lg:block lg:w-1/2 h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/WhatsApp Image 2026-03-05 at 1.04.54 AM.jpeg')`
        }}
      >
        {/* Overlay for better image visibility */}
        <div className="w-full h-full bg-black/20 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold text-white mb-4">IMD ERP</h2>
            <p className="text-white/80 text-lg">نظام إدارة مستودعات الدهانات</p>
          </div>
        </div>
      </div>

{/* Right Side - Form */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
        <div className="w-full max-w-md">
          {/* Header - Branding */}
          <div className="text-center mb-8">
            {/* Mobile Logo - only show on small screens */}
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold text-white mb-1">IMD ERP</h1>
              <p className="text-blue-300 text-sm">نظام إدارة مستودعات الدهانات</p>
            </div>
            {/* Desktop branding - shown below form on large screens */}
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide hidden lg:block">IMD ERP</h1>
            <p className="text-blue-300 text-sm font-light italic hidden lg:block">By Eng. Ibrahim Mabrouk El-Deeb</p>
          </div>

          {/* Login Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
            <p className="text-slate-400 text-sm mt-1">أدخل بيانات دخولك للمتابعة</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                رقم الموبايل
              </label>
              <div className="relative flex items-center border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-slate-800/50">
                <input
                  type="text"
                  placeholder="01012345678"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={11}
                  className="w-full outline-none px-4 py-3 bg-transparent text-white placeholder-slate-500"
                  disabled={loading}
                />
                <Phone className="absolute left-4 text-slate-400" size={20} />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative flex items-center border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-slate-800/50">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none px-4 py-3 bg-transparent text-white placeholder-slate-500"
                  disabled={loading}
                />
                <Lock className="absolute left-4 text-slate-400" size={20} />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-500 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "دخول"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>هل تحتاج إلى حساب؟ <a href="https://wa.me/201558905021" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:text-blue-300 hover:underline">تواصل مع المسؤول</a></p>
          </div>

          {/* Mobile Branding - Bottom */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-slate-500 text-xs italic">By Eng. Ibrahim Mabrouk El-Deeb</p>
          </div>
        </div>
      </div>
    </div>
  );
}

