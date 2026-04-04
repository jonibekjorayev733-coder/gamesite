import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Calculator, User, Users, Volume2, Trophy, RotateCcw, Home, Star } from "lucide-react";
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
}

type Phase = "setup" | "dice" | "playing" | "results";

const DICE_DOTS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const GAME_STYLES = `
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes diceRoll {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.2); }
    50% { transform: rotate(180deg) scale(1); }
    75% { transform: rotate(270deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
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

const MOCK_QUESTIONS: Question[] = [
  { id: 1, q: "5 + 3 = ?", opts: ["7", "8", "9", "10"], correct: 1, difficulty: "Oson", explanation: "5 + 3 = 8", points: 5 },
  { id: 2, q: "12 × 5 = ?", opts: ["50", "55", "60", "65"], correct: 2, difficulty: "O'rta", explanation: "12 × 5 = 60", points: 10 },
  { id: 3, q: "100 ÷ 4 = ?", opts: ["20", "25", "30", "35"], correct: 1, difficulty: "O'rta", explanation: "100 ÷ 4 = 25", points: 10 },
  { id: 4, q: "2⁴ = ?", opts: ["8", "16", "24", "32"], correct: 1, difficulty: "O'rta", explanation: "2⁴ = 16", points: 10 },
  { id: 5, q: "√81 = ?", opts: ["8", "9", "10", "11"], correct: 1, difficulty: "O'rta", explanation: "√81 = 9", points: 10 },
  { id: 6, q: "25% ng 80 = ?", opts: ["15", "20", "25", "30"], correct: 1, difficulty: "O'rta", explanation: "0.25 × 80 = 20", points: 10 },
  { id: 7, q: "12 - (-8) = ?", opts: ["4", "14", "20", "24"], correct: 2, difficulty: "O'rta", explanation: "12 + 8 = 20", points: 10 },
  { id: 8, q: "3/4 + 1/4 = ?", opts: ["1/2", "1", "5/4", "2"], correct: 1, difficulty: "O'rta", explanation: "4/4 = 1", points: 10 },
  { id: 9, q: "0.5 × 0.2 = ?", opts: ["0.1", "0.05", "1", "0.7"], correct: 0, difficulty: "O'rta", explanation: "0.5 × 0.2 = 0.1", points: 10 },
  { id: 10, q: "Agar x + 5 = 12 bo'lsa, x = ?", opts: ["5", "7", "10", "12"], correct: 1, difficulty: "O'rta", explanation: "x = 12 - 5 = 7", points: 10 },
];

export default function ShumodOyiniGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [gameMode, setGameMode] = useState<"single" | "team">("single");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [teamScores, setTeamScores] = useState({ team1: 0, team2: 0 });
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/game-tests/shumod/questions?count=10"));
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
    setPhase("dice");
    setScore(0);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentTeam("team1");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setTimeLeft(30);
    setUsedQuestionIndices([]);
    if (questions.length === 0) loadQuestions();
  };

  const rollDice = () => {
    if (diceRolling || questions.length === 0) return;
    setDiceRolling(true);
    let available = questions.map((_, i) => i).filter((i) => !usedQuestionIndices.includes(i));
    if (available.length === 0) {
      available = questions.map((_, i) => i);
      setUsedQuestionIndices([]);
    }
    const targetIdx = available[Math.floor(Math.random() * available.length)];
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice1(d1);
    setDice2(d2);
    setUsedQuestionIndices((u) => [...u, targetIdx]);
    setTimeout(() => {
      setDiceRolling(false);
      setCurrentQuestion(targetIdx);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(30);
      setPhase("playing");
    }, 2500);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const q = questions[currentQuestion];
    const pts = q?.points || 10;
    const correct = index === q?.correct;
    if (gameMode === "single") {
      if (correct) setScore((s) => s + pts);
    } else {
      if (correct) {
        setTeamScores((t) => ({
          ...t,
          [currentTeam]: t[currentTeam] + pts,
        }));
      }
    }
  };

  const handleNext = () => {
    if (gameMode === "team") setCurrentTeam((t) => (t === "team1" ? "team2" : "team1"));
    setSelectedAnswer(null);
    setAnswered(false);
    setPhase("dice");
  };

  const finishGame = () => {
    setPhase("results");
  };

  const resetGame = () => {
    setPhase("setup");
    setScore(0);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setTimeLeft(30);
    localStorage.removeItem("shumodOyiniGameState");
  };

  useEffect(() => {
    if ((phase === "dice" || phase === "playing") && questions.length === 0 && !loading) loadQuestions();
  }, [phase, questions.length]);

  useEffect(() => {
    if (phase === "playing" && timeLeft > 0 && !answered) {
      const t = setInterval(() => setTimeLeft((l) => l - 1), 1000);
      return () => clearInterval(t);
    }
  }, [phase, timeLeft, answered]);

  useEffect(() => {
    if ((phase === "dice" || phase === "playing") && questions.length > 0) {
      const state = { questions, currentQuestion, score, teamScores, currentTeam, timeLeft, usedQuestionIndices };
      localStorage.setItem("shumodOyiniGameState", JSON.stringify(state));
    }
  }, [phase, questions, currentQuestion, score, teamScores, currentTeam, timeLeft, usedQuestionIndices]);

  // Loading
  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center">
        <style>{GAME_STYLES}</style>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" style={{ filter: "drop-shadow(0 0 20px rgba(6,182,212,0.6))" }} />
          <p className="text-cyan-300 font-bold text-lg">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-4">
        <style>{GAME_STYLES}</style>
        <div className="backdrop-blur-xl rounded-2xl border-2 border-red-500/50 bg-black/60 p-8 text-center max-w-md">
          <p className="text-xl text-red-300 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl">
            Qayta Urinish
          </button>
        </div>
      </div>
    );
  }

  // Setup Screen
  if (phase === "setup") {
    return (
      <div className="min-h-screen relative overflow-hidden game-bg p-6">
        <style>{GAME_STYLES}</style>
        <div className="absolute inset-0 game-grid opacity-50" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[100px]" />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 bg-black/50 p-10 max-w-2xl w-full shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(6, 182, 212, 0.2)" }}
          >
            <div className="text-center mb-10">
              <div className="text-8xl mb-6" style={{ filter: "drop-shadow(0 0 30px rgba(6, 182, 212, 0.5))" }}>🔢</div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
                SHUMOD O'YINI
              </h1>
              <p className="text-cyan-300/80 font-semibold">Matematika savollariga javob bering</p>
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
                style={{ background: "linear-gradient(135deg, #9333ea 0%, #c026d3 100%)", color: "#fff", boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)" }}
              >
                <Users className="w-8 h-8" />
                JAMOAVIY — Team Battle
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-white/5 p-6">
              <h3 className="text-cyan-300 font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Qoidalar
              </h3>
              <ul className="space-y-2 text-cyan-100/80 font-medium">
                {["Zar tashlang — savol chiqadi", "30 soniya vaqt", "To'g'ri javob = ball", "Eng ko'p ball = g'olib"].map((r, i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-cyan-400">✓</span> {r}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Need questions
  if ((phase === "dice" || phase === "playing") && questions.length === 0) {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Dice Screen - ZAR TASHLASH
  const DiceFace = ({ value }: { value: number }) => (
    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border-4 border-cyan-400 shadow-xl flex items-center justify-center ${diceRolling ? "animate-[diceRoll_0.5s_ease-in-out_infinite]" : ""}`} style={{ boxShadow: "0 0 30px rgba(6,182,212,0.5)" }}>
      <div className="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4 gap-0.5">
        {[1,2,3,4,5,6,7,8,9].map((pos) => (
          <div key={pos} className={`rounded-full ${DICE_DOTS[value as keyof typeof DICE_DOTS]?.includes(pos) ? "bg-cyan-600" : "bg-transparent"}`} />
        ))}
      </div>
    </div>
  );

  if (phase === "dice") {
    return (
      <div className="min-h-screen game-bg relative overflow-hidden p-4 flex flex-col items-center justify-center">
        <style>{GAME_STYLES}</style>
        <div className="absolute inset-0 game-grid opacity-40" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-2xl text-center">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-cyan-400 flex items-center gap-2" style={{ fontFamily: "Orbitron" }}>
              <Calculator className="w-8 h-8" /> SHUMOD
            </h1>
            <button onClick={finishGame} className="py-2 px-5 rounded-xl font-bold text-sm border-2 border-red-500/50 bg-red-500/10 text-red-300">O'yinni Tugatish</button>
          </div>

          {gameMode === "team" && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`rounded-2xl p-4 text-center border-2 ${currentTeam === "team1" ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 bg-white/5"}`}>
                <p className="text-cyan-400 font-bold text-sm">Jamoa 1</p>
                <p className="text-3xl font-black text-cyan-400">{teamScores.team1}</p>
              </div>
              <div className={`rounded-2xl p-4 text-center border-2 ${currentTeam === "team2" ? "border-purple-500 bg-purple-500/10" : "border-white/10 bg-white/5"}`}>
                <p className="text-purple-400 font-bold text-sm">Jamoa 2</p>
                <p className="text-3xl font-black text-purple-400">{teamScores.team2}</p>
              </div>
            </div>
          )}
          {gameMode === "single" && (
            <div className="flex justify-center mb-6">
              <div className="rounded-2xl px-10 py-4 border-2 border-cyan-500/50 bg-black/40">
                <p className="text-cyan-300 text-sm font-bold">Ball</p>
                <p className="text-4xl font-black text-cyan-400">{score}</p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-black text-cyan-400 mb-2" style={{ textShadow: "0 0 20px rgba(6,182,212,0.6)" }}>Zar Tashlang!</h2>
          <p className="text-slate-400 text-sm mb-8">Savol olish uchun zarlarni aylantiring</p>

          <motion.div className="flex justify-center gap-8 mb-10" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
            <motion.div animate={diceRolling ? { rotate: [0, 180, 360], y: [0, -30, 0] } : {}} transition={{ duration: 0.5, repeat: diceRolling ? Infinity : 0 }}>
              <DiceFace value={dice1} />
            </motion.div>
            <motion.div animate={diceRolling ? { rotate: [0, -180, -360], y: [0, -30, 0] } : {}} transition={{ duration: 0.5, delay: 0.1, repeat: diceRolling ? Infinity : 0 }}>
              <DiceFace value={dice2} />
            </motion.div>
          </motion.div>

          <p className="text-4xl font-black text-amber-400 mb-8">{dice1 + dice2} = Savol!</p>

          <button
            onClick={rollDice}
            disabled={diceRolling}
            className="py-4 px-12 rounded-xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)", color: "#000", boxShadow: "0 0 30px rgba(245, 158, 11, 0.6)" }}
          >
            {diceRolling ? "⏳ Zarlar aylanmoqda..." : "🎲 Zar Tashla"}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const isCorrect = answered && selectedAnswer === q?.correct;

  // Results Screen
  if (phase === "results") {
    return (
      <div className="min-h-screen game-bg flex items-center justify-center p-6 relative overflow-hidden">
        <style>{GAME_STYLES}</style>
        <div className="absolute inset-0 game-grid opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 bg-black/50 p-10 max-w-xl w-full"
          style={{ boxShadow: "0 0 60px rgba(6, 182, 212, 0.3)" }}
        >
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/50">
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
              <div className={`rounded-2xl p-6 text-center border-2 ${teamScores.team2 >= teamScores.team1 ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/30" : "border-white/20 bg-white/5"}`}>
                <p className="text-purple-400 font-bold mb-1">Jamoa 2</p>
                <p className="text-4xl font-black text-purple-400">{teamScores.team2}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={resetGame} className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" /> Qayta O'ynash
            </button>
            <Link to="/" className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold bg-white/10 border border-white/20 text-white hover:scale-105 transition-transform">
              <Home className="w-5 h-5" /> Bosh Sahifa
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen game-bg relative overflow-hidden p-4">
      <style>{GAME_STYLES}</style>
      <div className="absolute inset-0 game-grid opacity-40" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-3xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-cyan-400 flex items-center gap-2" style={{ fontFamily: "Orbitron" }}>
            <Calculator className="w-8 h-8" /> SHUMOD
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
            <div className={`rounded-2xl p-4 text-center border-2 ${currentTeam === "team2" ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" : "border-white/10 bg-white/5"}`}>
              <p className="text-sm font-bold text-purple-400 mb-1">Jamoa 2</p>
              <p className="text-3xl font-black text-purple-400">{teamScores.team2}</p>
            </div>
          </div>
        )}

        {gameMode === "single" && (
          <div className="flex justify-center gap-8 mb-6">
            <div className="rounded-2xl px-8 py-4 border-2 border-cyan-500/50 bg-black/40 text-center">
              <p className="text-sm text-cyan-300 font-bold">Ball</p>
              <p className="text-4xl font-black text-cyan-400">{score}</p>
            </div>
            <div className={`rounded-2xl px-8 py-4 border-2 ${timeLeft <= 10 ? "border-red-500 bg-red-500/10" : "border-cyan-500/50 bg-black/40"} text-center`}>
              <p className="text-sm font-bold text-slate-400">Vaqt</p>
              <p className={`text-4xl font-black ${timeLeft <= 10 ? "text-red-400" : "text-cyan-400"}`}>{timeLeft}s</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Savol #{currentQuestion + 1} (Javoblar: {usedQuestionIndices.length})</span>
            <span>{questions.length > 0 ? Math.round((usedQuestionIndices.length / questions.length) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${questions.length > 0 ? (usedQuestionIndices.length / questions.length) * 100 : 0}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div className="backdrop-blur-xl rounded-2xl border-2 border-cyan-500/40 bg-black/40 p-8 mb-6" style={{ boxShadow: "0 0 40px rgba(6, 182, 212, 0.15)" }}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{q?.q}</h2>
          <div className="grid grid-cols-2 gap-4">
            {q?.opts.map((opt, i) => {
              const sel = selectedAnswer === i;
              const cor = i === q.correct;
              let style = "border-white/20 bg-white/5 hover:border-cyan-500/40 text-white";
              if (answered) {
                if (cor) style = "border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/30";
                else if (sel) style = "border-red-500 bg-red-500/20 text-red-300";
              } else if (sel) style = "border-cyan-500 bg-cyan-500/20 text-cyan-300";
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered} className={`p-4 rounded-xl font-bold text-left border-2 transition-all ${style}`}>
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
            <button onClick={handleNext} className="py-4 px-12 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105">
              Keyingi Savol →
            </button>
            <button onClick={finishGame} className="py-4 px-12 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Natijani Ko'rish
            </button>
            <button onClick={finishGame} className="py-4 px-8 rounded-xl font-bold border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10">
              Tugatish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
