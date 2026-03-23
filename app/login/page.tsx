"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/hooks/use-store";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signOut } = useStore()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ لما بتيجي على صفحة اللوجين، امسح كل حاجة قديمة
  useEffect(() => {
    const clearOldSession = async () => {
      // امسح الـ localStorage القديم
      if (typeof window !== "undefined") {
        localStorage.removeItem("pos-store")
      }
      // سجل خروج صامت بدون redirect
      await supabase.auth.signOut()
    }
    clearOldSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setError("يرجى ملء جميع الحقول");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(getErrorMessage(authError.message));
        setLoading(false);
        return;
      }

      if (!data.session || !data.user) {
        setError("فشل في إنشاء الجلسة، حاول مرة أخرى");
        setLoading(false);
        return;
      }

      console.log(`✅ [LOGIN] Success: ${data.user.email}`)

      // ✅ full reload عشان يبدأ من الأول ويجيب بيانات المحل الصح
      window.location.href = "/dashboard"

    } catch (err: any) {
      console.error("💥 [LOGIN] Error:", err);
      setError("حدث خطأ غير متوقع");
      setLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login") || lower.includes("invalid credentials")) return "بيانات الدخول غير صحيحة";
    if (lower.includes("user not found")) return "المستخدم غير موجود";
    if (lower.includes("email not confirmed")) return "يرجى تأكيد بريدك الإلكتروني";
    if (lower.includes("too many requests")) return "عدد كبير من المحاولات، حاول لاحقاً";
    return "بيانات الدخول غير صحيحة";
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Background Image */}
      <div
        className="hidden lg:block lg:w-1/2 h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/WhatsApp Image 2026-03-05 at 1.04.54 AM.jpeg')` }}
      >
        <div className="w-full h-full bg-black/20 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold text-white mb-4">IMD ERP</h2>
            <p className="text-white/80 text-lg">نظام إدارة محلاتك</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-bold text-white mb-1">IMD ERP</h1>
              <p className="text-blue-300 text-sm">نظام إدارة محلاتك</p>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wide hidden lg:block">IMD ERP</h1>
            <p className="text-blue-300 text-sm font-light italic hidden lg:block">By Eng. Ibrahim Mabrouk El-Deeb</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
            <p className="text-slate-400 text-sm mt-1">أدخل بيانات دخولك للمتابعة</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
              <div className="relative flex items-center border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-slate-800/50">
                <Mail className="absolute left-4 text-slate-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none px-12 py-3 bg-transparent text-white placeholder-slate-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative flex items-center border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-slate-800/50">
                <Lock className="absolute left-4 text-slate-400 h-5 w-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none px-12 py-3 bg-transparent text-white placeholder-slate-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> جاري التحميل...</>
              ) : "دخول"}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>هل تحتاج إلى حساب؟{" "}
              <a href="https://wa.me/201558905021" target="_blank" rel="noopener noreferrer"
                className="text-blue-400 font-medium hover:text-blue-300 hover:underline">
                تواصل مع المسؤول
              </a>
            </p>
          </div>

          <div className="lg:hidden mt-8 text-center">
            <p className="text-slate-500 text-xs italic">By Eng. Ibrahim Mabrouk El-Deeb</p>
          </div>
        </div>
      </div>
    </div>
  );
}
