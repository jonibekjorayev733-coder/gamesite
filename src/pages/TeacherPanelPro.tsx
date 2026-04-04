import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Settings,
  BarChart3,
  Trophy,
  Trash2,
  Loader2,
  Edit2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type TabKey = "test-add" | "top-users" | "results" | "settings";

type Teacher = {
  id: string;
  email: string;
  fullName: string;
  role: "teacher";
};

type QuestionForm = {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation?: string;
};

type TestDoc = {
  _id: string;
  title: string;
  description?: string;
  questions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
  createdAt: string;
};

type ResultRow = {
  id: string;
  score: number;
  createdAt: string;
  test: { id: string; title: string } | null;
  user: { id: string; email: string; fullName: string } | null;
};

const emptyQuestion = (): QuestionForm => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function api<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.detail || data?.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export default function TeacherPanelPro() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("test-add");

  const token = localStorage.getItem("teacher_token");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [tests, setTests] = useState<TestDoc[]>([]);

  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);

  const [games, setGames] = useState<Array<{id: number; name: string; slug: string; test_count: number}>>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [selectedGameSlug, setSelectedGameSlug] = useState<string>("");
  
  const [form, setForm] = useState<{
    title: string;
    description: string;
    questions: QuestionForm[];
  }>({
    title: "",
    description: "",
    questions: [emptyQuestion()],
  });
  const [submittingTest, setSubmittingTest] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<TestDoc | null>(null);

  const [topUsers, setTopUsers] = useState<
    Array<{
      userId: string;
      totalScore: number;
      attempts: number;
      email: string;
      fullName: string;
    }>
  >([]);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);

  const [results, setResults] = useState<ResultRow[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [filters, setFilters] = useState<{ testId: string; userId: string }>({
    testId: "",
    userId: "",
  });

  const userOptions = useMemo(() => {
    const map = new Map<string, ResultRow["user"]>();
    for (const r of results) {
      if (r.user?.id && !map.has(r.user.id)) map.set(r.user.id, r.user);
    }
    return Array.from(map.entries()).map(([id, user]) => ({ id, user: user! }));
  }, [results]);

  const testOptions = useMemo(() => {
    return tests.map((t) => ({ id: t._id, title: t.title }));
  }, [tests]);

  useEffect(() => {
    if (!token) {
      navigate("/teacher/auth");
      return;
    }
    const run = async () => {
      try {
        setLoadingTeacher(true);
        const data = await api<{ teacher: Teacher }>("/auth/teacher/me", token);
        setTeacher(data.teacher);
      } catch (e) {
        // Silently fail - teacher panel is optional
        console.log("Teacher auth failed:", e instanceof Error ? e.message : "Unknown error");
        setTeacher(null);
        // Don't navigate away - let user see the main app
      } finally {
        setLoadingTeacher(false);
      }
    };
    run();
  }, [navigate, token]);

  const fetchTests = async () => {
    if (!token) return;
    try {
      setLoadingTests(true);
      
      // Fetch teacher's own tests
      const testsData = await api<{ tests: TestDoc[] }>("/tests", token);
      setTests(testsData.tests || []);
      
      // Also fetch all games for the dropdown selector
      const gamesData = await api<{ games: Array<{id: number; name: string; slug: string; test_count: number}> }>("/all-games-with-tests", token);
      
      if (gamesData.games) {
        setGames(gamesData.games.map(g => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          test_count: g.test_count
        })));
        
        // Auto-select first game
        if (gamesData.games.length > 0 && !selectedGameId) {
          setSelectedGameId(String(gamesData.games[0].id));
          setSelectedGameSlug(gamesData.games[0].slug);
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Testlar yuklanmadi");
      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    if (token) fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchTopUsers = async () => {
    if (!token) return;
    try {
      setLoadingTopUsers(true);
      const data = await api<{
        top_users?: Array<{
          user_id: string;
          username: string;
          total_score: number;
          games_played: number;
        }>;
        topUsers?: Array<{
          userId: string;
          totalScore: number;
          attempts: number;
          email: string;
          fullName: string;
        }>;
      }>("/results/top-users", token);
      
      // Handle both new and old response formats
      const users = data.top_users || data.topUsers || [];
      setTopUsers(
        users.map((u: any) => ({
          userId: String(u.user_id || u.userId || ""),
          totalScore: Number(u.total_score || u.totalScore || 0),
          attempts: Number(u.games_played || u.attempts || 0),
          email: u.email || "",
          fullName: u.fullName || u.username || "",
        }))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Top users yuklanmadi");
      setTopUsers([]);
    } finally {
      setLoadingTopUsers(false);
    }
  };

  const fetchResults = async () => {
    if (!token) return;
    try {
      setLoadingResults(true);
      const params = new URLSearchParams();
      if (filters.testId) params.set("testId", filters.testId);
      if (filters.userId) params.set("userId", filters.userId);
      const qs = params.toString();
      const data = await api<{ results: ResultRow[] }>(`/results${qs ? `?${qs}` : ""}`, token);
      setResults(data.results || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Results yuklanmadi");
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    if (activeTab === "top-users") fetchTopUsers();
    if (activeTab === "results") fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onLogout = () => {
    localStorage.removeItem("teacher_token");
    localStorage.removeItem("teacher_data");
    navigate("/teacher/auth");
  };

  const tabItems: Array<{ key: TabKey; label: string; icon: JSX.Element }> = [
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
    { key: "test-add", label: "Test Add", icon: <Plus className="w-4 h-4" /> },
    { key: "top-users", label: "Top Users", icon: <Trophy className="w-4 h-4" /> },
    { key: "results", label: "Results", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const validateForm = () => {
    if (!form.title.trim()) return "Test title required";
    if (form.questions.length < 1) return "At least one question required";

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.text.trim()) return `Q${i + 1}: question text required`;
      const opts = q.options;
      if (opts.some((x) => !x.trim())) return `Q${i + 1}: all options required`;
      if (q.correctIndex < 0 || q.correctIndex > 3) return `Q${i + 1}: correct answer required`;
    }
    return null;
  };

  const handleSubmitTest = async () => {
    if (!token) return;
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSubmittingTest(true);
      const payload = {
        title: form.title,
        description: form.description,
        questions: form.questions.map((q) => ({
          text: q.text,
          options: [...q.options],
          correctIndex: q.correctIndex,
          explanation: q.explanation?.trim() || "",
        })),
        game_slug: selectedGameSlug,
      };

      if (editingTestId) {
        // Update existing test
        await api(`/tests/${editingTestId}`, token, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Test o'zgartirildi!");
        setEditingTestId(null);
        setEditingTest(null);
      } else {
        // Create new test
        await api("/tests", token, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Test qo'shildi!");
      }
      
      setForm({ title: "", description: "", questions: [emptyQuestion()] });
      await fetchTests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test saqlanmadi");
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleEditTest = (test: TestDoc) => {
    setEditingTestId(test._id);
    setEditingTest(test);
    setForm({
      title: test.title,
      description: test.description || "",
      questions: test.questions || [emptyQuestion()],
    });
    setActiveTab("test-add");
  };

  const handleCancelEdit = () => {
    setEditingTestId(null);
    setEditingTest(null);
    setForm({ title: "", description: "", questions: [emptyQuestion()] });
  };

  const handleDeleteTest = async (testId: string) => {
    if (!token) return;
    if (!confirm("Testni o'chirmoqchimisiz?")) return;

    try {
      await api(`/tests/${testId}`, token, { method: "DELETE" });
      toast.success("Test o'chirildi");
      await fetchTests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test o'chirilmadi");
    }
  };

  const [changePw, setChangePw] = useState({ currentPassword: "", newPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!changePw.currentPassword || !changePw.newPassword) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setChangingPw(true);
      await api("/auth/teacher/change-password", token, {
        method: "POST",
        body: JSON.stringify({
          currentPassword: changePw.currentPassword,
          newPassword: changePw.newPassword,
        }),
      });
      toast.success("Parol yangilandi");
      setChangePw({ currentPassword: "", newPassword: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parol yangilanmadi");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="mesh-bg" />

      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          <aside className="w-72 shrink-0 sticky top-24 h-[calc(100vh-6rem)] self-start">
            <div className="glass-card p-4 border-white/10 h-full">
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center white-glow">
                    <span className="text-xl">👨‍🏫</span>
                  </div>
                  <div>
                    <div className="font-display font-black text-white">Teacher Dashboard</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {loadingTeacher ? "Loading..." : teacher?.fullName || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {tabItems.map((t) => {
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        active
                          ? "bg-white/10 border border-white/20 shadow-[0_0_30px_-10px_rgba(255,255,255,0.2)]"
                          : "bg-white/0 hover:bg-white/5 border border-white/5 hover:border-white/15"
                      }`}
                    >
                      <span className={active ? "text-cyan-300" : "text-slate-300"}>{t.icon}</span>
                      <span className="font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  onClick={onLogout}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-black font-display">
                    {activeTab === "test-add"
                      ? "Test Add"
                      : activeTab === "top-users"
                      ? "Top Users"
                      : activeTab === "results"
                      ? "Results"
                      : "Settings"}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {activeTab === "test-add"
                      ? "Savollarni dinamik qo'shing va saqlang"
                      : activeTab === "top-users"
                      ? "Eng yaxshi natijalar liderlari"
                      : activeTab === "results"
                      ? "Test va foydalanuvchi bo'yicha filtrlash"
                      : "Profil va parolni boshqarish"}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    JWT protected
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "test-add" && (
                <motion.div
                  key="test-add"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                      <Card className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="font-black text-xl">
                            {editingTestId ? "Edit Test" : "Create Test"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {submittingTest ? "Saving..." : "MongoDB"}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-200">O'yin tanlang</span>
                              <select
                                value={selectedGameId}
                                onChange={(e) => {
                                  const gameId = e.target.value;
                                  setSelectedGameId(gameId);
                                  const game = games.find(g => String(g.id) === gameId);
                                  if (game) {
                                    setSelectedGameSlug(game.slug);
                                  }
                                }}
                                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20"
                              >
                                <option value="">O'yinni tanlang...</option>
                                {games.map(game => (
                                  <option key={game.id} value={game.id}>
                                    {game.name} ({game.test_count} testlar)
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="block">
                              <span className="text-sm font-semibold text-slate-200">Test title</span>
                              <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20"
                                placeholder="Masalan: 20-savol — Umumiy test"
                              />
                            </label>
                          </div>

                          <div>
                            <Button
                              onClick={async () => {
                                if (!selectedGameSlug) {
                                  toast.error("Avval o'yinni tanlang");
                                  return;
                                }
                                
                                setGeneratingAI(true);
                                try {
                                  // Call AI generation endpoint
                                  const response = await api<{
                                    questions: Array<{
                                      text: string;
                                      options: [string, string, string, string];
                                      correctIndex: number;
                                      explanation: string;
                                    }>;
                                  }>(`/ai/generate-tests/${selectedGameSlug}?count=5`, token, {
                                    method: "POST",
                                  });
                                  
                                  if (response.questions && response.questions.length > 0) {
                                    setForm((p) => ({
                                      ...p,
                                      questions: response.questions.map(q => ({
                                        text: q.text,
                                        options: q.options,
                                        correctIndex: q.correctIndex,
                                        explanation: q.explanation,
                                      })),
                                    }));
                                    toast.success(`${response.questions.length} ta savol AI orqali yaratildi!`);
                                  }
                                } catch (e) {
                                  toast.error(e instanceof Error ? e.message : "AI test yaratishda xato");
                                } finally {
                                  setGeneratingAI(false);
                                }
                              }}
                              disabled={!selectedGameSlug || generatingAI}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 w-full"
                            >
                              {generatingAI ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  AI test yaratmoqda...
                                </>
                              ) : (
                                <>
                                  ✨ AI bilan 5 test yaratish
                                </>
                              )}
                            </Button>
                          </div>

                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">Description</span>
                            <input
                              value={form.description}
                              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20"
                              placeholder="Optional"
                            />
                          </label>

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-slate-200">Questions</div>
                            <Button
                              onClick={() =>
                                setForm((p) => ({
                                  ...p,
                                  questions: [...p.questions, emptyQuestion()],
                                }))
                              }
                              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl"
                              type="button"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {form.questions.map((q, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10"
                              >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div>
                                    <div className="text-sm text-slate-400">Question #{idx + 1}</div>
                                    <div className="text-lg font-black">🧠</div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                                    onClick={() =>
                                      setForm((p) => ({
                                        ...p,
                                        questions:
                                          p.questions.length <= 1
                                            ? p.questions
                                            : p.questions.filter((_, i) => i !== idx),
                                      }))
                                    }
                                    disabled={form.questions.length <= 1}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </Button>
                                </div>

                                <label className="block">
                                  <span className="text-sm font-semibold text-slate-200">Question text</span>
                                  <textarea
                                    value={q.text}
                                    onChange={(e) =>
                                      setForm((p) => {
                                        const next = [...p.questions];
                                        next[idx] = { ...next[idx], text: e.target.value };
                                        return { ...p, questions: next };
                                      })
                                    }
                                    className="mt-2 w-full min-h-[90px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20"
                                    placeholder="Savol matnini kiriting"
                                  />
                                </label>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} className="block">
                                      <span className="text-sm font-semibold text-slate-200">
                                        Option {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <input
                                        value={opt}
                                        onChange={(e) =>
                                          setForm((p) => {
                                            const next = [...p.questions];
                                            const options = [...next[idx].options] as [string, string, string, string];
                                            options[optIdx] = e.target.value;
                                            next[idx] = { ...next[idx], options };
                                            return { ...p, questions: next };
                                          })
                                        }
                                        className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/20"
                                        placeholder={`Variant ${String.fromCharCode(65 + optIdx)}`}
                                      />
                                    </label>
                                  ))}
                                </div>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <label className="block">
                                    <span className="text-sm font-semibold text-slate-200">Correct answer</span>
                                    <select
                                      value={q.correctIndex}
                                      onChange={(e) =>
                                        setForm((p) => {
                                          const next = [...p.questions];
                                          next[idx] = { ...next[idx], correctIndex: Number(e.target.value) };
                                          return { ...p, questions: next };
                                        })
                                      }
                                      className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400/40"
                                    >
                                      <option value={0}>A</option>
                                      <option value={1}>B</option>
                                      <option value={2}>C</option>
                                      <option value={3}>D</option>
                                    </select>
                                  </label>

                                  <label className="block">
                                    <span className="text-sm font-semibold text-slate-200">Explanation (optional)</span>
                                    <input
                                      value={q.explanation || ""}
                                      onChange={(e) =>
                                        setForm((p) => {
                                          const next = [...p.questions];
                                          next[idx] = { ...next[idx], explanation: e.target.value };
                                          return { ...p, questions: next };
                                        })
                                      }
                                      className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40"
                                      placeholder="Nega to'g'ri?"
                                    />
                                  </label>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          <div className="pt-2 space-y-2">
                            <Button
                              onClick={handleSubmitTest}
                              disabled={submittingTest}
                              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl font-black py-4 transition-all disabled:opacity-50"
                            >
                              {submittingTest ? (
                                <span className="inline-flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Saving...
                                </span>
                              ) : editingTestId ? (
                                "Update Test"
                              ) : (
                                "Save Test"
                              )}
                            </Button>
                            {editingTestId && (
                              <Button
                                onClick={handleCancelEdit}
                                disabled={submittingTest}
                                className="w-full bg-slate-500/20 hover:bg-slate-500/30 border border-slate-400/20 text-slate-300 rounded-xl font-black py-4 transition-all"
                              >
                                Cancel Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="lg:col-span-2">
                      <Card className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-black">Your Tests</div>
                          <div className="text-xs text-slate-400">{loadingTests ? "Loading..." : tests.length}</div>
                        </div>

                        {loadingTests ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
                          </div>
                        ) : tests.length === 0 ? (
                          <div className="text-sm text-slate-400 py-10 text-center">
                            Hali test qo'shilmagan.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tests.map((t) => (
                              <div key={t._id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-black truncate">{t.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      {(t.questions || []).length} questions
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditTest(t)}
                                      className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-all"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTest(t._id)}
                                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "top-users" && (
                <motion.div
                  key="top-users"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-black">Top Users</div>
                      <div className="text-xs text-slate-400">
                        {loadingTopUsers ? "Loading..." : "Total score"}
                      </div>
                    </div>

                    {loadingTopUsers ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
                      </div>
                    ) : topUsers.length === 0 ? (
                      <div className="text-sm text-slate-400 py-10 text-center">
                        Hali natijalar yo'q.
                      </div>
                    ) : (
                      <div className="overflow-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs text-slate-400">
                              <th className="py-3 px-2">#</th>
                              <th className="py-3 px-2">User</th>
                              <th className="py-3 px-2">Total score</th>
                              <th className="py-3 px-2">Attempts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topUsers.map((u, idx) => (
                              <tr
                                key={u.userId}
                                className="border-t border-white/10 hover:bg-white/5 transition-colors"
                              >
                                <td className="py-4 px-2 font-black text-cyan-300">{idx + 1}</td>
                                <td className="py-4 px-2">
                                  <div className="font-semibold">{u.fullName || u.email}</div>
                                  <div className="text-xs text-slate-400">{u.email}</div>
                                </td>
                                <td className="py-4 px-2 font-black">{u.totalScore}</td>
                                <td className="py-4 px-2 text-slate-300">{u.attempts}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {activeTab === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="glass-card p-6">
                        <div className="text-lg font-black mb-4">Filters</div>

                        <div className="space-y-4">
                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">Test</span>
                            <select
                              value={filters.testId}
                              onChange={(e) => setFilters((p) => ({ ...p, testId: e.target.value }))}
                              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400/40"
                            >
                              <option value="">All tests</option>
                              {testOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.title}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">User</span>
                            <select
                              value={filters.userId}
                              onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value }))}
                              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400/40"
                            >
                              <option value="">All users</option>
                              {userOptions.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.user.fullName || u.user.email}
                                </option>
                              ))}
                            </select>
                          </label>

                          <Button
                            onClick={() => fetchResults()}
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl font-black py-4 transition-all"
                            disabled={loadingResults}
                          >
                            {loadingResults ? (
                              <span className="inline-flex items-center justify-center">
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Filtering...
                              </span>
                            ) : (
                              "Apply"
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setFilters({ testId: "", userId: "" })}
                            className="w-full border-white/15 text-slate-200 hover:bg-white/5 rounded-xl py-4"
                          >
                            Reset
                          </Button>
                        </div>
                      </Card>
                    </div>

                    <div className="lg:col-span-3">
                      <Card className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-black">Results</div>
                          <div className="text-xs text-slate-400">{loadingResults ? "Loading..." : results.length}</div>
                        </div>

                        {loadingResults ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-cyan-300" />
                          </div>
                        ) : results.length === 0 ? (
                          <div className="text-sm text-slate-400 py-10 text-center">
                            Natijalar topilmadi. Filtersni o'zgartirib ko'ring.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {results.map((r) => (
                              <div
                                key={r.id}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-black text-cyan-200 truncate">
                                      {r.user?.fullName || r.user?.email || "Unknown user"}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                      {r.test?.title || "Unknown test"}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {new Date(r.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-300">{r.score}</div>
                                    <div className="text-xs text-slate-400">score</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2">
                      <Card className="glass-card p-6">
                        <div className="text-lg font-black mb-4">Teacher Profile</div>
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-sm text-slate-400">Full name</div>
                            <div className="font-black mt-1">{teacher?.fullName || "—"}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-sm text-slate-400">Email</div>
                            <div className="font-semibold mt-1">{teacher?.email || "—"}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-sm text-slate-400">Role</div>
                            <div className="font-semibold mt-1 text-cyan-200">{teacher?.role || "teacher"}</div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="lg:col-span-3">
                      <Card className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-lg font-black">Change Password</div>
                          <div className="text-xs text-slate-400">JWT protected</div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">Current password</span>
                            <input
                              type="password"
                              value={changePw.currentPassword}
                              onChange={(e) => setChangePw((p) => ({ ...p, currentPassword: e.target.value }))}
                              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40"
                              placeholder="••••••••"
                              required
                            />
                          </label>

                          <label className="block">
                            <span className="text-sm font-semibold text-slate-200">New password</span>
                            <input
                              type="password"
                              value={changePw.newPassword}
                              onChange={(e) => setChangePw((p) => ({ ...p, newPassword: e.target.value }))}
                              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40"
                              placeholder="At least 6 chars"
                              required
                            />
                          </label>

                          <Button
                            type="submit"
                            disabled={changingPw}
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-xl font-black py-4 transition-all disabled:opacity-50"
                          >
                            {changingPw ? (
                              <span className="inline-flex items-center justify-center">
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Updating...
                              </span>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </form>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

