import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, User, ArrowRight } from "lucide-react";
import { getApiUrl } from "@/api/client";

export default function Register() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Validate inputs
    if (!email || !fullName || !password || !confirmPassword) {
      setError("Barcha maydonlarni to'ldiring");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/auth/teacher/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          username: email.split("@")[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Ro'yhatdan o'tishda xatolik");
      }

      navigate("/teacher/auth");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ro'yhatdan o'tishda xatolik");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[hsl(240,12%,3%)] relative overflow-hidden flex items-center justify-center px-4 py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,12%,3%)] via-purple-950/10 to-[hsl(240,12%,3%)]" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-500/12 rounded-full blur-[120px]" />
      
      <div className="relative max-w-md w-full">
        {/* Card Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
          
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Ro'yhatdan O'ting</h1>
              <p className="text-slate-400 text-sm">
                EduArena platformasiga yangi akkaunt yaratish
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Email Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">Email Manzil</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">To'liq Ismi</label>
                <div className="relative group/input">
                  <User className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-purple-400 transition-colors" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">Parol</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">Parolni Tasdiqlang</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:from-purple-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    Ro'yhatdan O'tish
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                Allaqachon akkauntingiz bormi?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
