import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Globe, User, Users, Trophy, RotateCcw, Home, Star } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/api/client";

interface Question {
  id: number;
  q: string;
  opts: string[];
  correct: number;
  difficulty: string;
  explanation: string;
  points: number;
  flag?: string;
}

type Phase = "setup" | "playing" | "results";

const GAME_STYLES = `
  @keyframes flagReveal {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .game-bg {
    background: linear-gradient(135deg, #0a0a0a 0%, #0d0d0d 50%, #0a0a0a 100%);
    background-size: 400% 400%;
    animation: gradientShift 10s ease infinite;
  }
  .game-grid {
    background-image: 
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
  }
`;

const COUNTRY_FLAGS: Record<string, string> = {
  "O'zbekiston": "🇺🇿", "Frantsiya": "🇫🇷", "Yaponiya": "🇯🇵", "Hindiston": "🇮🇳", "Braziliya": "🇧🇷",
  "Germaniya": "🇩🇪", "Avstraliya": "🇦🇺", "Janubiy Koreya": "🇰🇷", "Xitoy": "🇨🇳", "Rossiya": "🇷🇺",
  "Parij": "🇫🇷", "Berlin": "🇩🇪", "Tokyo": "🇯🇵", "Delhi": "🇮🇳", "Brasiliya": "🇧🇷",
  "Kanberra": "🇦🇺", "Seul": "🇰🇷", "Pekin": "🇨🇳", "Moskva": "🇷🇺",
};

const MOCK_QUESTIONS: Question[] = [
  { id: 1, q: "Bu qaysi davlat bayrog'i?", opts: ["O'zbekiston", "Qozog'iston", "Tojikiston", "Turkmaniston"], correct: 0, difficulty: "Oson", explanation: "O'zbekiston bayrog'i", points: 10, flag: "🇺🇿" },
  { id: 2, q: "Bu qaysi davlat bayrog'i?", opts: ["Ispaniya", "Italiya", "Frantsiya", "Portugaliya"], correct: 2, difficulty: "Oson", explanation: "Frantsiya — Parij poytaxti", points: 10, flag: "🇫🇷" },
  { id: 3, q: "Bu qaysi davlat bayrog'i?", opts: ["Xitoy", "Yaponiya", "Koreya", "Tailand"], correct: 1, difficulty: "Oson", explanation: "Yaponiya — Tokyo poytaxti", points: 10, flag: "🇯🇵" },
  { id: 4, q: "Bu qaysi davlat bayrog'i?", opts: ["Pokiston", "Hindiston", "Bangladesh", "Nepal"], correct: 1, difficulty: "O'rta", explanation: "Hindiston — Delhi poytaxti", points: 10, flag: "🇮🇳" },
  { id: 5, q: "Bu qaysi davlat bayrog'i?", opts: ["Argentina", "Braziliya", "Chili", "Kolumbiya"], correct: 1, difficulty: "O'rta", explanation: "Braziliya — Brasiliya poytaxti", points: 10, flag: "🇧🇷" },
  { id: 6, q: "Bu qaysi davlat bayrog'i?", opts: ["Avstriya", "Germaniya", "Shveytsariya", "Niderlandiya"], correct: 1, difficulty: "Oson", explanation: "Germaniya — Berlin poytaxti", points: 10, flag: "🇩🇪" },
  { id: 7, q: "Bu qaysi davlat bayrog'i?", opts: ["Yangi Zelandiya", "Avstraliya", "Indoneziya", "Filippin"], correct: 1, difficulty: "O'rta", explanation: "Avstraliya — Kanberra poytaxti", points: 10, flag: "🇦🇺" },
  { id: 8, q: "Bu qaysi davlat bayrog'i?", opts: ["Shimoliy Koreya", "Janubiy Koreya", "Yaponiya", "Xitoy"], correct: 1, difficulty: "O'rta", explanation: "Janubiy Koreya — Seul poytaxti", points: 10, flag: "🇰🇷" },
  { id: 9, q: "Bu qaysi davlat bayrog'i?", opts: ["Vyetnam", "Yaponiya", "Xitoy", "Mongoliya"], correct: 2, difficulty: "Oson", explanation: "Xitoy — Pekin poytaxti", points: 10, flag: "🇨🇳" },
  { id: 10, q: "Bu qaysi davlat bayrog'i?", opts: ["Ukraina", "Belarus", "Rossiya", "Polsha"], correct: 2, difficulty: "Oson", explanation: "Rossiya — Moskva poytaxti", points: 10, flag: "🇷🇺" },
];

export default function DavlatniTopishGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [gameMode, setGameMode] = useState<"single" | "team">("single");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [teamScores, setTeamScores] = useState({ team1: 0, team2: 0 });
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/game-tests/davlatni_topish/questions?count=10"));
      if (!res.ok) throw new Error("Server xatosi");
      const data = await res.json();
      if (data?.questions?.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions(MOCK_QUESTIONS);
      }
    } catch {
      setQuestions(MOCK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const startGame = (mode: "single" | "team") => {
    setGameMode(mode);
    setPhase("playing");
    setScore(0);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentTeam("team1");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    if (questions.length > 0) setQuestionOrder([...Array(questions.length)].map((_, i) => i).sort(() => Math.random() - 0.5));
    if (questions.length === 0) loadQuestions();
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const idx = questionOrder[currentQuestion] ?? currentQuestion;
    const q = questions[idx];
    const pts = q?.points || 10;
    const correct = index === q?.correct;
    if (gameMode === "single") {
      if (correct) setScore((s) => s + pts);
    } else {
      if (correct) {
        setTeamScores((t) => ({ ...t, [currentTeam]: t[currentTeam] + pts }));
      }
    }
  };

  const totalQ = questionOrder.length || questions.length;
  const handleNext = () => {
    if (currentQuestion < totalQ - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      if (gameMode === "team") setCurrentTeam((t) => (t === "team1" ? "team2" : "team1"));
    }
  };

  const finishGame = () => setPhase("results");

  const resetGame = () => {
    setPhase("setup");
    setScore(0);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    localStorage.removeItem("davlatniTopishGameState");
  };

  useEffect(() => {
    if (phase === "playing" && questions.length === 0 && !loading) loadQuestions();
  }, [phase, questions.length]);

  useEffect(() => {
    if (phase === "playing" && questions.length > 0 && questionOrder.length === 0) {
      setQuestionOrder([...Array(questions.length)].map((_, i) => i).sort(() => Math.random() - 0.5));
    }
  }, [phase, questions.length, questionOrder.length]);

  useEffect(() => {
    if (phase === "playing" && questions.length > 0) {
      const state = { questions, currentQuestion, score, teamScores, currentTeam, questionOrder };
      localStorage.setItem("davlatniTopishGameState", JSON.stringify(state));
    }
  }, [phase, questions, currentQuestion, score, teamScores, currentTeam, questionOrder]);

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center">
        <style>{GAME_STYLES}</style>
        <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" style={{ filter: "drop-shadow(0 0 20px rgba(6,182,212,0.6))" }} />
        <p className="ml-4 text-cyan-300 font-bold">Savollar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-4">
        <style>{GAME_STYLES}</style>
        <div className="backdrop-blur-xl rounded-2xl border-2 border-red-500/50 bg-black/60 p-8 text-center max-w-md">
          <p className="text-xl text-red-300 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl">Qayta Urinish</button>
        </div>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="min-h-screen relative overflow-hidden game-bg p-6">
        <style>{GAME_STYLES}</style>
        <div className="absolute inset-0 game-grid opacity-50" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]" />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 bg-black/50 p-10 max-w-2xl w-full shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(6, 182, 212, 0.2)" }}
          >
            <div className="text-center mb-10">
              <div className="text-8xl mb-6" style={{ filter: "drop-shadow(0 0 30px rgba(6, 182, 212, 0.5))" }}>🌍</div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2" style={{ fontFamily: "Orbitron" }}>
                DAVLATNI TOPISH
              </h1>
              <p className="text-cyan-300/80 font-semibold">Geografiya — davlatlar va poytaxtlar</p>
            </div>

            <div className="space-y-4 mb-10">
              <button
                onClick={() => startGame("single")}
                className="w-full p-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-4 transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0d9488 100%)", color: "#000", boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
              >
                <User className="w-8 h-8" />
                BIR KISHILIK — Solo Challenge
              </button>
              <button
                onClick={() => startGame("team")}
                className="w-full p-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-4 transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", color: "#fff", boxShadow: "0 0 30px rgba(5, 150, 105, 0.5)" }}
              >
                <Users className="w-8 h-8" />
                JAMOAVIY — Team Battle
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-white/5 p-6">
              <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Qoidalar</h3>
              <ul className="space-y-2 text-cyan-100/80 font-medium">
                {["Bayroqni ko'ring — davlatni toping", "To'g'ri javob = 10 ball", "Jamoaviy rejimda navbatma-navbat", "Eng ko'p ball = g'olib"].map((r, i) => (
                  <li key={i}><span className="text-cyan-400">✓</span> {r}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "playing" && questions.length === 0) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const orderedIdx = questionOrder[currentQuestion];
  const q = questions[orderedIdx ?? currentQuestion];
  const flagEmoji = q?.flag ?? (q?.opts?.[q?.correct] ? COUNTRY_FLAGS[q.opts[q.correct]] : null);
  const isCorrect = answered && selectedAnswer === q?.correct;

  if (phase === "results") {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-6 relative overflow-hidden">
        <style>{GAME_STYLES}</style>
        <div className="absolute inset-0 game-grid opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 bg-black/50 p-10 max-w-xl w-full"
          style={{ boxShadow: "0 0 60px rgba(6, 182, 212, 0.3)" }}
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/50">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-cyan-400 mb-2" style={{ fontFamily: "Orbitron" }}>O'YIN TUGADI!</h1>
            <p className="text-cyan-300/80">Natijangiz</p>
          </div>

          {gameMode === "single" ? (
            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm font-bold uppercase mb-2">Jami ball</p>
              <p className="text-7xl font-black text-cyan-400" style={{ textShadow: "0 0 40px rgba(6, 182, 212, 0.6)" }}>{score}</p>
              {score >= 80 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/50">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 font-bold">Ajoyib natija!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`rounded-2xl p-6 text-center border-2 ${teamScores.team1 >= teamScores.team2 ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/30" : "border-white/20 bg-white/5"}`}>
                <p className="text-cyan-400 font-bold mb-1">Jamoa 1</p>
                <p className="text-4xl font-black text-cyan-400">{teamScores.team1}</p>
              </div>
              <div className={`rounded-2xl p-6 text-center border-2 ${teamScores.team2 >= teamScores.team1 ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30" : "border-white/20 bg-white/5"}`}>
                <p className="text-emerald-400 font-bold mb-1">Jamoa 2</p>
                <p className="text-4xl font-black text-emerald-400">{teamScores.team2}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={resetGame} className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105">
              <RotateCcw className="w-5 h-5" /> Qayta O'ynash
            </button>
            <Link to="/" className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold bg-white/10 border border-white/20 text-white hover:scale-105">
              <Home className="w-5 h-5" /> Bosh Sahifa
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen game-bg relative overflow-hidden p-4">
      <style>{GAME_STYLES}</style>
      <div className="absolute inset-0 game-grid opacity-40" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-cyan-400 flex items-center gap-2" style={{ fontFamily: "Orbitron" }}>
            <Globe className="w-8 h-8" /> DAVLATNI TOPISH
          </h1>
          <button onClick={finishGame} className="py-2 px-5 rounded-xl font-bold text-sm border-2 border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20">
            O'yinni Tugatish
          </button>
        </div>

        {gameMode === "team" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`rounded-2xl p-4 text-center border-2 ${currentTeam === "team1" ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20" : "border-white/10 bg-white/5"}`}>
              <p className="text-sm font-bold text-cyan-400 mb-1">Jamoa 1</p>
              <p className="text-3xl font-black text-cyan-400">{teamScores.team1}</p>
            </div>
            <div className={`rounded-2xl p-4 text-center border-2 ${currentTeam === "team2" ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20" : "border-white/10 bg-white/5"}`}>
              <p className="text-sm font-bold text-emerald-400 mb-1">Jamoa 2</p>
              <p className="text-3xl font-black text-emerald-400">{teamScores.team2}</p>
            </div>
          </div>
        )}

        {gameMode === "single" && (
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl px-10 py-4 border-2 border-cyan-500/50 bg-black/40 text-center">
              <p className="text-sm text-cyan-300 font-bold">Ball</p>
              <p className="text-4xl font-black text-cyan-400">{score}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Savol {currentQuestion + 1} / {totalQ}</span>
            <span>{totalQ > 0 ? Math.round(((currentQuestion + 1) / totalQ) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${totalQ > 0 ? ((currentQuestion + 1) / totalQ) * 100 : 0}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div className="backdrop-blur-xl rounded-2xl border-2 border-cyan-500/40 bg-black/40 p-8 mb-6" style={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.15)" }}>
          {flagEmoji && (
            <motion.div className="flex justify-center mb-6" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }} style={{ animation: "flagReveal 0.6s ease-out" }}>
              <div className="text-[120px] md:text-[140px] p-6 rounded-2xl bg-white/5 border-2 border-cyan-500/30 shadow-2xl" style={{ filter: "drop-shadow(0 0 30px rgba(6, 182, 212, 0.4))" }}>
                {flagEmoji}
              </div>
            </motion.div>
          )}
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{q?.q}</h2>
          <div className="space-y-3">
            {q?.opts.map((opt, i) => {
              const sel = selectedAnswer === i;
              const cor = i === q.correct;
              let style = "border-white/20 bg-white/5 hover:border-cyan-500/40 text-white";
              if (answered) {
                if (cor) style = "border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/30";
                else if (sel) style = "border-red-500 bg-red-500/20 text-red-300";
              } else if (sel) style = "border-cyan-500 bg-cyan-500/20 text-cyan-300";
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={`w-full p-4 rounded-xl font-bold text-left border-2 transition-all ${style}`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {answered && (
          <div className={`backdrop-blur-xl rounded-2xl border-2 p-6 mb-6 ${isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}>
            <div className="flex items-start gap-4">
              <span className="text-5xl">{isCorrect ? "✓" : "✗"}</span>
              <div>
                <p className={`font-bold text-xl mb-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>{isCorrect ? "To'g'ri! 🎉" : "Noto'g'ri"}</p>
                <p className="text-slate-300">{q?.explanation}</p>
                {isCorrect && <p className="text-green-400 font-bold mt-2">+{q?.points} ball</p>}
              </div>
            </div>
          </div>
        )}

        {answered && (
          <div className="flex flex-wrap gap-4 justify-center">
            {currentQuestion < totalQ - 1 ? (
              <button onClick={handleNext} className="py-4 px-12 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105">
                Keyingi Savol →
              </button>
            ) : null}
            <button onClick={finishGame} className="py-4 px-12 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Natijani Ko'rish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
