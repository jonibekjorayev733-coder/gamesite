import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Check } from "lucide-react";
import { getApiUrl } from "@/api/client";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "❌ Xato",
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "❌ Xato",
        description: "Yangi parollar mos kelmadi",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Xato",
        description: "Parol kamida 6 ta belgiboʻlishi kerak",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const teacherId = localStorage.getItem("teacherId");

      const response = await fetch(
        `${getApiUrl("/teacher/change-password")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teacher_id: teacherId,
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Parolni o'zgartirishda xato");
      }

      toast({
        title: "✅ Muvaffaqiyat",
        description: "Parol muvaffaqiyatli o'zgartirildi",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ Xato",
        description: "Parolni o'zgartirishda xato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <Card className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 pb-6">
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-cyan-400" />
            Parol O'zgartirish
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Joriy Parol
            </label>
            <Input
              type="password"
              placeholder="Joriy parolingizni kiriting"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Yangi Parol
            </label>
            <Input
              type="password"
              placeholder="Yangi parolingizni kiriting"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Parolni Tasdiqlash
            </label>
            <Input
              type="password"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Check className="w-5 h-5 mr-2" />
            {loading ? "O'zgartirilmoqda..." : "Parolni O'zgartirish"}
          </Button>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl mt-6">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="text-lg text-white">Boshqa Sozlamalar</CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-semibold">Bildirishnomalar</h4>
              <p className="text-xs text-white/50">O'quvchi natijasi kelganda ogohlanish</p>
            </div>
            <div className="w-12 h-6 bg-cyan-500/30 rounded-full cursor-pointer border border-cyan-500/50 flex items-center justify-end pr-1">
              <div className="w-5 h-5 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h4 className="text-white font-semibold">Xavfsizlik</h4>
              <p className="text-xs text-white/50">Login tarixini ko'rish</p>
            </div>
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-lg"
            >
              Ko'rish
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
