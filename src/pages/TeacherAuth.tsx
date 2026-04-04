import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock, User, GraduationCap } from "lucide-react";
import { getApiUrl } from "@/api/client";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  fullName: string;
}

export default function TeacherAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    fullName: "",
  });

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error("Email va parolni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/auth/teacher/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("teacher_token", data.access_token);
      localStorage.setItem("teacher_data", JSON.stringify(data.teacher));

      toast.success(`Xush kelibsiz, ${data.teacher.full_name}!`);

      navigate("/teacher/panel");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !registerData.email ||
      !registerData.password ||
      !registerData.fullName
    ) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/auth/teacher/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          full_name: registerData.fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("teacher_token", data.access_token);
      localStorage.setItem("teacher_data", JSON.stringify(data.teacher));

      toast.success("Hisob yaratildi. Panel ochilmoqda...");

      navigate("/teacher/panel");
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error instanceof Error ? error.message : "Registratsiya muvaffaq bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
      </div>

      <Card className="relative z-10 w-full max-w-md bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-purple-500/50 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-10 h-10 text-yellow-300" />
            <h1 className="text-3xl font-black text-white">O'QITUVCHI</h1>
          </div>
          <p className="text-purple-100 font-semibold">Test qo'shish platformasi</p>
        </div>

        <div className="p-8">
          {/* Tab buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                isLogin
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                !isLogin
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white mb-6">Kirish</h2>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="text"
                  placeholder="teacher@email.com"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Parol
                </label>
                <input
                  type="password"
                  placeholder="Parolingiz"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "⏳ Kirish..." : "✅ Kirish"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white mb-6">Ro'yxatdan O'tish</h2>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  To'liq ismingiz
                </label>
                <input
                  type="text"
                  placeholder="Mr. Teacher"
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email pochtangiz"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Parol
                </label>
                <input
                  type="password"
                  placeholder="Kuchli parol"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>

              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "⏳ Ro'yxatdan o'tilmoqda..." : "✅ Ro'yxatdan o'tish"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
