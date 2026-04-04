import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Plus, Users, BarChart3, Settings, LogOut, BookOpen } from "lucide-react";
import { getApiUrl } from "@/api/client";

export default function TeacherDashboard() {
  const [activeMenu, setActiveMenu] = useState("add-test");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacher");
    navigate("/teacher/auth");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            📚 O'qituvchi Paneli
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Home className="mr-2 w-4 h-4" />
              Bosh sahifa
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              <LogOut className="mr-2 w-4 h-4" />
              Chiqish
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
            <CardContent className="p-4 space-y-2">
              {[
                { id: "add-test", label: "➕ Test Qo'shish", icon: Plus },
                { id: "my-tests", label: "📋 Mening Testlarim", icon: BookOpen },
                { id: "top-users", label: "⭐ Top Foydalanuvchilar", icon: Users },
                { id: "results", label: "📊 Natijalar", icon: BarChart3 },
                { id: "settings", label: "⚙️ Sozlamalar", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeMenu === item.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                      : "bg-slate-800/50 text-white/70 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {activeMenu === "add-test" && <AddTestContent />}
          {activeMenu === "my-tests" && <MyTestsContent />}
          {activeMenu === "top-users" && <TopUsersContent />}
          {activeMenu === "results" && <ResultsContent />}
          {activeMenu === "settings" && <SettingsContent />}
        </div>
      </div>
    </div>
  );
}

// ===============================================
// Add Test Component
// ===============================================
function AddTestContent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSaveTest = async () => {
    if (!title.trim()) {
      setMessage("Test nomi talab qilinadi!");
      return;
    }

    if (questions.some((q) => !q.text.trim() || q.options.some((o) => !o.trim()))) {
      setMessage("Barcha savollar va javoblar to'ldirilishi kerak!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/teacher-tests/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Test muvaffaqiyatli yaratildi!");
        setTitle("");
        setDescription("");
        setQuestions([
          { text: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" },
        ]);
      } else {
        setMessage(`❌ Xato: ${data.detail || "Test yaratishda xato"}`);
      }
    } catch (error) {
      setMessage(`❌ Server bilan bog'lanishda xato: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Yangi Test Yaratish</h2>

        {message && (
          <div className={`p-4 rounded-xl mb-6 font-semibold ${
            message.startsWith("✅")
              ? "bg-green-500/20 border border-green-500/50 text-green-300"
              : "bg-red-500/20 border border-red-500/50 text-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* Test Title */}
        <div className="mb-6">
          <label className="block text-white/80 font-semibold mb-2">Test Nomi *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Matematika 1-savollari"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 shadow-lg transition-all"
          />
        </div>

        {/* Test Description */}
        <div className="mb-8">
          <label className="block text-white/80 font-semibold mb-2">Tavsif (Ixtiyoriy)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Test haqida qisqacha ma'lumot..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 shadow-lg transition-all"
          />
        </div>

        {/* Questions */}
        <div className="space-y-8 mb-8">
          <h3 className="text-xl font-bold text-white">Savollar ({questions.length})</h3>

          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="p-6 bg-slate-800/30 border border-slate-700 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-cyan-400">Savol {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <Button
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="bg-red-600/50 hover:bg-red-600 text-white px-3 py-1 text-sm"
                  >
                    O'chirish
                  </Button>
                )}
              </div>

              {/* Question Text */}
              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                placeholder="Savol matnini kiriting..."
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 mb-4 shadow-md"
              />

              {/* Options */}
              <div className="space-y-3 mb-4">
                {["A", "B", "C", "D"].map((letter, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <span className="text-white/60 font-bold w-8">{letter})</span>
                    <input
                      type="text"
                      value={question.options[oIndex]}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`${letter}-javob...`}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-md"
                    />
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctIndex === oIndex}
                      onChange={() => handleQuestionChange(qIndex, "correctIndex", oIndex)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <textarea
                value={question.explanation}
                onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                placeholder="Tushuntirish (ixtiyoriy)..."
                rows={2}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-md"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleAddQuestion}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg"
          >
            + Savol Qo'shish
          </Button>
          <Button
            onClick={handleSaveTest}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50"
          >
            {loading ? "⏳ Saqlanmoqda..." : "💾 Testni Saqlash"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===============================================
// My Tests Component
// ===============================================
function MyTestsContent() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/teacher-tests/my-tests"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTests();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-white">Mening Testlarim</h2>

        {loading ? (
          <p className="text-white/60">Yuklanmoqda...</p>
        ) : tests.length === 0 ? (
          <p className="text-white/60">Hali test yaratilmagan</p>
        ) : (
          <div className="space-y-4">
            {tests.map((test: any) => (
              <div
                key={test.id}
                className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all shadow-lg"
              >
                <h3 className="text-lg font-bold text-cyan-400">{test.title}</h3>
                <p className="text-white/60 text-sm">{test.description}</p>
                <p className="text-white/40 text-xs mt-2">
                  📋 {test.question_count} savol | 📅 {new Date(test.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===============================================
// Top Users Component
// ===============================================
function TopUsersContent() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-white">⭐ Top Foydalanuvchilar</h2>
        <p className="text-white/60">Tez orada bo'ladi...</p>
      </CardContent>
    </Card>
  );
}

// ===============================================
// Results Component
// ===============================================
function ResultsContent() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-white">📊 Natijalar</h2>
        <p className="text-white/60">Tez orada bo'ladi...</p>
      </CardContent>
    </Card>
  );
}

// ===============================================
// Settings Component
// ===============================================
function SettingsContent() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-white">⚙️ Sozlamalar</h2>
        <p className="text-white/60">Tez orada bo'ladi...</p>
      </CardContent>
    </Card>
  );
}
