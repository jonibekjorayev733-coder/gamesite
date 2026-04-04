import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Plus,
  Trash2,
  ChevronRight,
  BookMarked,
  BarChart3,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface Game {
  id: number;
  name: string;
  slug: string;
}

interface CustomTest {
  id: number;
  game_slug: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: string;
  created_at: string;
}

interface Teacher {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

const GAMES: Game[] = [
  { id: 1, name: "Qumsoat Topish", slug: "hidden-hourglass" },
  { id: 2, name: "Temur's Conquest", slug: "temur-conquest" },
  { id: 3, name: "Tarixni Bilaman", slug: "tarix-qilish" },
  { id: 4, name: "Shumod O'yini", slug: "shumod-oyini" },
  { id: 5, name: "Krossword", slug: "krossword-game" },
];

export default function TeacherPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [tests, setTests] = useState<CustomTest[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("teacher_token");

  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_index: 0,
    explanation: "",
    difficulty: "medium",
  });

  // Load teacher data
  useEffect(() => {
    const teacherData = localStorage.getItem("teacher_data");
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
    }

    if (!token) {
      navigate("/teacher/auth");
    }
  }, [token, navigate]);

  // Load tests for selected game
  useEffect(() => {
    if (selectedGame && token) {
      fetchTests();
    }
  }, [selectedGame, token]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/custom-tests/my-tests/${selectedGame!.slug}?token=${token}`
      );
      
      if (!response.ok) {
        throw new Error("Server ishlamayapti yoki testlar yuklanmadi");
      }
      
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error("Testlar yuklanishida xato:", error);
      toast({
        title: "❌ Xato",
        description: "Server ishlamayapti! Testlar yuklanmadi.",
        variant: "destructive",
      });
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async () => {
    if (
      !formData.question ||
      !formData.option1 ||
      !formData.option2 ||
      !formData.option3 ||
      !formData.option4
    ) {
      toast({
        title: "❌ Xato",
        description: "Barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/custom-tests/create?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_slug: selectedGame!.slug,
          question: formData.question,
          options: [
            formData.option1,
            formData.option2,
            formData.option3,
            formData.option4,
          ],
          correct_index: parseInt(formData.correct_index.toString()),
          explanation: formData.explanation,
          difficulty: formData.difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server ishlamayapti");
      }

      const data = await response.json();
      
      toast({
        title: "✅ Muvaffaqiyat",
        description: "Test muvaffaqiyatli qo'shildi va database ga saqlandi",
      });

      setFormData({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_index: 0,
        explanation: "",
        difficulty: "medium",
      });

      setShowAddForm(false);
      fetchTests();
    } catch (error: any) {
      console.error("Test qo'shishda xato:", error);
      toast({
        title: "❌ Xato",
        description: error.message || "Server ishlamayapti! Test saqlanmadi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("Testni o'chirishni xohlaysizmi?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/custom-tests/${testId}?token=${token}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast({
          title: "✅ O'chirildi",
          description: "Test muvaffaqiyatli o'chirildi",
        });
        fetchTests();
      }
    } catch (error) {
      toast({
        title: "❌ Xato",
        description: "Testni o'chirishda xato yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacher_token");
    localStorage.removeItem("teacher_data");
    navigate("/teacher/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              👨‍🏫 O'QITUVCHI PANELI
            </h1>
            <p className="text-slate-400 font-semibold mt-1">
              Xush kelibsiz, <span className="text-purple-300">{teacher?.full_name}</span>
            </p>
          </div>

          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            Chiqish
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Games List */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-purple-500/30 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookMarked className="w-6 h-6" />
                O'YINLAR
              </h2>
            </div>

            <div className="p-4 space-y-2">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    setSelectedGame(game);
                    setShowAddForm(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between ${
                    selectedGame?.id === game.id
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {game.name}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </Card>

          {/* Right: Test Management */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-purple-500/30 rounded-2xl overflow-hidden">
            {selectedGame ? (
              <>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {selectedGame.name}
                    </h2>
                    <p className="text-purple-100 mt-1">
                      📊 Jami testlar: <span className="font-bold">{tests.length}</span>
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    {showAddForm ? "BEKOR" : "YANGI TEST"}
                  </Button>
                </div>

                <div className="p-6">
                  {/* Add Form */}
                  {showAddForm && (
                    <div className="mb-8 p-6 bg-slate-700/50 border-2 border-purple-500 rounded-xl">
                      <h3 className="text-xl font-black text-white mb-6">
                        ✏️ Yangi Test Qo'shish
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">
                            Savol
                          </label>
                          <textarea
                            value={formData.question}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                question: e.target.value,
                              })
                            }
                            placeholder="Savolingizni kiriting"
                            className="w-full px-4 py-3 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                            rows={3}
                          />
                        </div>

                        {[1, 2, 3, 4].map((num) => (
                          <div key={num}>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              Variant {String.fromCharCode(64 + num)}
                            </label>
                            <input
                              type="text"
                              value={
                                formData[`option${num}` as keyof typeof formData]
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  [`option${num}`]: e.target.value,
                                })
                              }
                              placeholder={`${num}-variant`}
                              className="w-full px-4 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              To'g'ri Javob
                            </label>
                            <select
                              value={formData.correct_index}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  correct_index: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            >
                              <option value="0">Variant A</option>
                              <option value="1">Variant B</option>
                              <option value="2">Variant C</option>
                              <option value="3">Variant D</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                              Qiyinchilik
                            </label>
                            <select
                              value={formData.difficulty}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  difficulty: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 bg-slate-600 border-2 border-slate-500 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                            >
                              <option value="easy">Oson</option>
                              <option value="medium">O'rta</option>
                              <option value="hard">Qiyin</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-300 mb-2">
                            Izoh (ixtiyoriy)
                          </label>
                          <textarea
                            value={formData.explanation}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                explanation: e.target.value,
                              })
                            }
                            placeholder="Izohni kiriting"
                            className="w-full px-4 py-3 bg-slate-600 border-2 border-slate-500 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                            rows={2}
                          />
                        </div>

                        <Button
                          onClick={handleAddTest}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-3 rounded-lg shadow-lg disabled:opacity-50"
                        >
                          {loading ? "⏳ Qo'shilmoqda..." : "✅ Testni Qo'shish"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tests List */}
                  {tests.length > 0 ? (
                    <div className="space-y-4">
                      {tests.map((test, idx) => (
                        <Card
                          key={test.id}
                          className="bg-slate-700/50 border-slate-600 p-4 hover:border-purple-500 transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-black bg-purple-600 text-white px-3 py-1 rounded-full">
                                  Test {idx + 1}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  test.difficulty === "easy"
                                    ? "bg-green-600 text-white"
                                    : test.difficulty === "medium"
                                    ? "bg-yellow-600 text-white"
                                    : "bg-red-600 text-white"
                                }`}>
                                  {test.difficulty === "easy"
                                    ? "Oson"
                                    : test.difficulty === "medium"
                                    ? "O'rta"
                                    : "Qiyin"}
                                </span>
                              </div>

                              <p className="text-white font-semibold mb-3">
                                {test.question}
                              </p>

                              <div className="space-y-1 mb-3">
                                {test.options.map((opt, optIdx) => (
                                  <p
                                    key={optIdx}
                                    className={`text-sm ${
                                      optIdx === test.correct_index
                                        ? "text-green-400 font-bold"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}) {opt}
                                  </p>
                                ))}
                              </div>

                              {test.explanation && (
                                <p className="text-xs text-slate-300 bg-slate-600/50 p-2 rounded">
                                  💡 {test.explanation}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteTest(test.id)}
                              className="bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 font-semibold text-lg">
                        {showAddForm
                          ? "Birinchi testni qo'shing"
                          : "Hali testlar qo'shilmagan"}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <BookMarked className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold text-lg">
                    O'yinni tanlang
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
