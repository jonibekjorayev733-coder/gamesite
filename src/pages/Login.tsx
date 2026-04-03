import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[hsl(240,12%,3%)] relative overflow-hidden flex items-center justify-center px-4 py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,12%,3%)] via-cyan-950/10 to-[hsl(240,12%,3%)]" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-500/12 rounded-full blur-[120px]" />
      
      <div className="relative max-w-md w-full">
        {/* Card Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
          
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl mb-6 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Xush Kelibsiz</h1>
              <p className="text-slate-400 text-sm">
                EduArena platformasiga kirish uchun tafsilotlarini kiriting
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Email Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">Email Manzil</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-cyan-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-3">Parol</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-4 text-slate-500 w-5 h-5 group-hover/input:text-cyan-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-6 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Kirilyapti...
                  </>
                ) : (
                  <>
                    Kirish
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />
              <span className="text-xs text-slate-500">YOKI</span>
              <div className="flex-1 h-px bg-gradient-to-l from-slate-700/50 to-transparent" />
            </div>

            {/* Demo Button */}
            <button
              onClick={() => {
                setEmail("demo@email.com");
                setPassword("demo123");
              }}
              className="w-full py-3 bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-semibold rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Demo Hisob Bilan Sinab Ko'ring
            </button>

            {/* Demo Credentials */}
            <p className="text-xs text-slate-500 text-center mt-4 bg-white/5 py-3 px-4 rounded-xl border border-white/10">
              📧 <span className="text-slate-400">demo@email.com</span>
              <br />
              🔑 <span className="text-slate-400">demo123</span>
            </p>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Hisobingiz yo'q?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors underline-offset-4 hover:underline"
                >
                  Ro'yxatdan o'ting
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
