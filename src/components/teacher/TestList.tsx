import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/api/client";

interface TestItem {
  id: number;
  title: string;
  description: string;
  questions_count: number;
  created_at: string;
}

export default function TestList() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token");
      const teacherId = localStorage.getItem("teacherId");

      const response = await fetch(
        `${getApiUrl("/tests/list")}?teacher_id=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Testlarni yuklab bo'lmadi");

      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ Xato",
        description: "Testlarni yuklab bo'lmadi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: number) => {
    if (!window.confirm("Testni o'chirishni xohlaysizmi?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${getApiUrl("/tests/delete")}/${testId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("O'chirishda xato");

      setTests(tests.filter((t) => t.id !== testId));
      toast({
        title: "✅ Muvaffaqiyat",
        description: "Test o'chirildi",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ Xato",
        description: "O'chirishda xato",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <Card className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl text-center py-12">
        <CardContent>
          <p className="text-white/60 text-lg">Hozircha testlar yo'q</p>
          <p className="text-white/40 text-sm mt-2">Birinchi testni qo'shish uchun "Test Qo'shish" sahifasiga o'ting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => (
        <Card
          key={test.id}
          className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-300"
        >
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-lg text-white line-clamp-2">
              {test.title}
            </CardTitle>
            <p className="text-xs text-white/50 mt-2">
              {new Date(test.created_at).toLocaleDateString("uz-UZ")}
            </p>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-white/70 line-clamp-2">
              {test.description || "Tavsif yo'q"}
            </p>

            <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
              <span className="text-xs text-white/60">Savollar:</span>
              <span className="text-lg font-bold text-cyan-400">
                {test.questions_count}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-lg"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ko'rish
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-lg"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Tahrir
              </Button>
              <Button
                onClick={() => handleDelete(test.id)}
                variant="destructive"
                className="flex-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
