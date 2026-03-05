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

      if (!supabase) {
        setError("خدمة المصادقة غير متاحة. يرجى الاتصال بالمسؤول.");
        setLoading(false);
        return;
      }

      const email = mobileToEmail(mobile);

      const { error: signInError } = await supabase.auth.signInWithPassword({
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
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</h1>
          <p className="text-slate-500">أدخل بيانات دخولك للمتابعة</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Mobile Number Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              رقم الموبايل
            </label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <input
                type="text"
                placeholder="01012345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={11}
                className="w-full outline-none px-4 py-3 bg-transparent text-right placeholder-slate-400"
                disabled={loading}
              />
              <Phone className="absolute left-4 text-slate-400" size={20} />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative flex items-center border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none px-4 py-3 bg-transparent text-right placeholder-slate-400"
                disabled={loading}
              />
              <Lock className="absolute left-4 text-slate-400" size={20} />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
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
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>هل تحتاج إلى حساب؟ <span className="text-slate-700">تواصل مع المسؤول</span></p>
        </div>
      </div>
    </div>
  );
}
