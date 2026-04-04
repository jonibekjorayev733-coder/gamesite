import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, Loader2, User, Users, Trophy, RotateCcw, Home, Star, Award } from "lucide-react";
import { motion } from "framer-motion";
import GameProLayout from "@/components/games/GameProLayout";
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

interface TeamScore {
  team1: number;
  team2: number;
}

type GameMode = "setup" | "wheel" | "question" | "results";

type PersistedBarabanState = {
  gameMode: "single" | "team";
  phase: "setup" | "wheel" | "question" | "results";
  questions: Question[];
  currentQuestion: number;
  selectedAnswer: number | null;
  answered: boolean;
  wheelRotation: number;
  selectedSlice: number;
  singleScore: number;
  teamScores: TeamScore;
  currentTeam: "team1" | "team2";
  usedQuestionIndices: number[];
};

const BARABAN_STATE_KEY = "baraban_game_state_v1";

export default function BarabanGameV2() {
  const [gameMode, setGameMode] = useState<"single" | "team">("single");
  const [phase, setPhase] = useState<GameMode>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedSlice, setSelectedSlice] = useState(0);
  const [singleScore, setSingleScore] = useState(0);
  const [teamScores, setTeamScores] = useState<TeamScore>({ team1: 0, team2: 0 });
  const [currentTeam, setCurrentTeam] = useState<"team1" | "team2">("team1");
  const [loading, setLoading] = useState(false);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawState = localStorage.getItem(BARABAN_STATE_KEY);
      if (!rawState) {
        return;
      }

      const savedState: PersistedBarabanState = JSON.parse(rawState);

      setGameMode(savedState.gameMode ?? "single");
      setPhase(savedState.phase ?? "setup");
      setQuestions(Array.isArray(savedState.questions) ? savedState.questions : []);
      setCurrentQuestion(savedState.currentQuestion ?? 0);
      setSelectedAnswer(savedState.selectedAnswer ?? null);
      setAnswered(Boolean(savedState.answered));
      setWheelRotation(savedState.wheelRotation ?? 0);
      setSelectedSlice(savedState.selectedSlice ?? 0);
      setSingleScore(savedState.singleScore ?? 0);
      setTeamScores(savedState.teamScores ?? { team1: 0, team2: 0 });
      setCurrentTeam(savedState.currentTeam ?? "team1");
      setUsedQuestionIndices(Array.isArray(savedState.usedQuestionIndices) ? savedState.usedQuestionIndices : []);
    } catch (error) {
      console.error("Saved game restore xatosi:", error);
      localStorage.removeItem(BARABAN_STATE_KEY);
    }
  }, []);

  useEffect(() => {
    const stateToSave: PersistedBarabanState = {
      gameMode,
      phase,
      questions,
      currentQuestion,
      selectedAnswer,
      answered,
      wheelRotation,
      selectedSlice,
      singleScore,
      teamScores,
      currentTeam,
      usedQuestionIndices,
    };

    try {
      localStorage.setItem(BARABAN_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Saved game write xatosi:", error);
    }
  }, [
    gameMode,
    phase,
    questions,
    currentQuestion,
    selectedAnswer,
    answered,
    wheelRotation,
    selectedSlice,
    singleScore,
    teamScores,
    currentTeam,
    usedQuestionIndices,
  ]);

  const MOCK_QUESTIONS: Question[] = [
    {
      id: 1,
      q: "O'zbekistonning poytaxti?",
      opts: ["Toshkent", "Samarqand", "Buxoro", "Farg'ona"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Toshkent - O'zbekistonning poytaxti",
      points: 10,
    },
    {
      id: 2,
      q: "2 + 2 = ?",
      opts: ["3", "4", "5", "6"],
      correct: 1,
      difficulty: "Oson",
      explanation: "2 + 2 = 4",
      points: 10,
    },
    {
      id: 3,
      q: "Quyosh sistemasiga nechta sayyora?",
      opts: ["7", "8", "9", "10"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "8 ta sayyora mavjud",
      points: 15,
    },
    {
      id: 4,
      q: "Eng katta okeyan?",
      opts: ["Atlantika", "Hind", "Tinch", "Arktika"],
      correct: 2,
      difficulty: "Oson",
      explanation: "Tinch okeyan eng katta",
      points: 10,
    },
    {
      id: 5,
      q: "Prezident Mirziyoyev qachondan?",
      opts: ["2014", "2016", "2018", "2020"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "2016 yildan",
      points: 15,
    },
    {
      id: 6,
      q: "DNK qayerda joylashgan?",
      opts: ["Yadro", "Mitoxondriya", "Ribosom", "Xloroplast"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "DNK asosan yadrosida saqlanadi",
      points: 15,
    },
    {
      id: 7,
      q: "Matematikada 'Pi' ning qiymati?",
      opts: ["2.14", "3.14", "4.14", "5.14"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "Pi (π) ≈ 3.14159...",
      points: 15,
    },
    {
      id: 8,
      q: "Qaysi sayyora Quyoshga eng yaqin?",
      opts: ["Venera", "Merkuriy", "Zemlya", "Mars"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "Merkuriy Quyoshga eng yaqin sayyora",
      points: 15,
    },
    {
      id: 9,
      q: "Tarixda eng qadimgi shahar?",
      opts: ["Rim", "Atina", "Damashq", "Ariq"],
      correct: 2,
      difficulty: "Qiyin",
      explanation: "Damashq eng qadimgi bosh shaharlardan biri",
      points: 20,
    },
    {
      id: 10,
      q: "Eng uzun daryo qaysi?",
      opts: ["Nil", "Amazonka", "Yantszi", "Missipi"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Nil daryo Afrikadagi eng uzun daryo",
      points: 10,
    },
    {
      id: 11,
      q: "Oxirgi Olampik O'ylari qaysi yilda bo'ldi?",
      opts: ["2020", "2021", "2022", "2023"],
      correct: 1,
      difficulty: "Oson",
      explanation: "2020 yilning olimpiadasi 2021 yilda bo'ldi",
      points: 10,
    },
    {
      id: 12,
      q: "O'zbekistonda nechta viloyat bor?",
      opts: ["10", "12", "13", "15"],
      correct: 2,
      difficulty: "Oson",
      explanation: "O'zbekistonda 12 ta viloyat va Toshkent sh. bor",
      points: 10,
    },
  ];

  useEffect(() => {
    if (phase === "wheel" && questions.length === 0) {
      loadQuestions();
    }
  }, [phase, questions.length]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl("/api/game-tests/wheel/questions?count=8"));
      if (!response.ok) throw new Error(`Backend xatosi: HTTP ${response.status}`);
      const data = await response.json();
      
      if (data && data.questions && data.questions.length > 0) {
        // Transform backend format to component format
        const transformedQuestions = data.questions.map((q: any) => ({
          id: q.id,
          q: q.prompt,
          opts: q.options.map((opt: any) => opt.text || opt),
          correct: q.correct_index,
          difficulty: q.difficulty || "O'rta",
          explanation: q.explanation || "To'g'ri javob",
          points: 10,
        }));
        setQuestions(transformedQuestions);
      } else {
        // Fallback to mock data if backend returns empty
        setQuestions(MOCK_QUESTIONS.slice(0, 8));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Noma'lum xato";
      console.error("Savollari yuklashda xato:", errorMsg);
      // Use mock data as fallback
      setQuestions(MOCK_QUESTIONS.slice(0, 8));
      setError(null); // Don't show error if fallback works
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = () => {
    if (wheelSpinning || questions.length === 0) return;

    setWheelSpinning(true);
    
    // Har safar boshqa random test tanlash
    let availableIndices = questions
      .map((_, idx) => idx)
      .filter(idx => !usedQuestionIndices.includes(idx));
    
    // Agar barcha testlar ishlatilsa, qayta boshlash
    if (availableIndices.length === 0) {
      availableIndices = questions.map((_, idx) => idx);
      setUsedQuestionIndices([]);
    }
    
    const randomSlice = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const spins = Math.floor(Math.random() * 5) + 10;
    const sliceAngle = 360 / questions.length;
    const targetRotation = spins * 360 + randomSlice * sliceAngle;

    setWheelRotation(targetRotation);
    setSelectedSlice(randomSlice);
    setUsedQuestionIndices([...usedQuestionIndices, randomSlice]);

    setTimeout(() => {
      setWheelSpinning(false);
      setCurrentQuestion(randomSlice);
      setSelectedAnswer(null);
      setAnswered(false);
      setPhase("question");
    }, 3000);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === questions[currentQuestion]?.correct;
    const points = questions[currentQuestion]?.points || 10;

    if (gameMode === "single") {
      if (isCorrect) {
        setSingleScore(singleScore + points);
      }
    } else {
      if (isCorrect) {
        if (currentTeam === "team1") {
          setTeamScores({ ...teamScores, team1: teamScores.team1 + points });
        } else {
          setTeamScores({ ...teamScores, team2: teamScores.team2 + points });
        }
      }
    }
  };

  const handleNextQuestion = () => {
    if (gameMode === "team") {
      setCurrentTeam(currentTeam === "team1" ? "team2" : "team1");
    }
    setPhase("wheel");
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const speakQuestion = () => {
    const question = questions[currentQuestion];
    const utterance = new SpeechSynthesisUtterance(question.q);
    utterance.lang = "uz-UZ";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const finishGame = () => {
    setPhase("results");
  };

  const resetGame = () => {
    setSingleScore(0);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentTeam("team1");
    setPhase("setup");
    setGameMode("single");
    setUsedQuestionIndices([]);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setWheelRotation(0);
    setSelectedSlice(0);
    localStorage.removeItem(BARABAN_STATE_KEY);
  };

  if (error) {
    return (
      <GameProLayout accentColor="white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="game-pro-card p-8 max-w-md text-center border-red-500/30">
          <p className="text-xl text-red-100 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="game-pro-btn w-full py-3 px-6 rounded-xl">Qayta Urinish</button>
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Setup Screen with Ultra-Modern Futuristic Design
  if (phase === "setup") {
    return (
      <GameProLayout accentColor="purple">
      <div className="min-h-screen relative overflow-hidden p-6">
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes neonGlow {
            0%, 100% { text-shadow: 0 0 10px rgba(0, 150, 255, 0.5), 0 0 20px rgba(147, 51, 234, 0.3); }
            50% { text-shadow: 0 0 20px rgba(0, 150, 255, 0.8), 0 0 40px rgba(147, 51, 234, 0.6); }
          }
          @keyframes floatParticle {
            0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
            50% { transform: translateY(-30px) translateX(10px) scale(1.1); opacity: 1; }
            100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
          }
          @keyframes cardGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 150, 255, 0.3), 0 0 40px rgba(147, 51, 234, 0.2), inset 0 0 20px rgba(0, 150, 255, 0.1); }
            50% { box-shadow: 0 0 40px rgba(0, 150, 255, 0.6), 0 0 80px rgba(147, 51, 234, 0.4), inset 0 0 30px rgba(0, 150, 255, 0.2); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes buttonHover {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
          .bg-animated {
            background: linear-gradient(
              45deg,
              #0a0e27,
              #1a0a3e,
              #2d0a5e,
              #1a0a3e,
              #0a0e27
            );
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }
          .neon-title {
            animation: neonGlow 3s ease-in-out infinite;
            font-family: 'Arial Black', sans-serif;
            letter-spacing: 3px;
          }
          .card-glow {
            animation: cardGlow 2s ease-in-out infinite;
          }
          .slide-up {
            animation: slideUp 0.8s ease-out;
          }
          .particle {
            position: absolute;
            pointer-events: none;
          }
          .neon-button {
            position: relative;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .neon-button:hover {
            animation: buttonHover 0.6s ease-in-out;
          }
          .grid-bg {
            background-image: 
              linear-gradient(rgba(0, 150, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 150, 255, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}
        </style>

        {/* Animated gradient background with grid */}
        <div className="absolute inset-0 bg-animated grid-bg" />

        {/* Floating neon particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle rounded-full"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                background: ["rgba(0, 150, 255, 0.8)", "rgba(147, 51, 234, 0.8)"][Math.floor(Math.random() * 2)],
                boxShadow: "0 0 10px currentColor",
                animationDelay: Math.random() * 4 + "s",
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            {/* Futuristic Main Card */}
            <div className="slide-up card-glow backdrop-blur-xl rounded-3xl border border-cyan-500/50 bg-black/60 p-10 shadow-2xl">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500 rounded-tr-3xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-purple-500 rounded-tl-3xl" />

              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="text-8xl animate-bounce drop-shadow-2xl" style={{ filter: "drop-shadow(0 0 20px rgba(0, 150, 255, 0.5))" }}>
                    🥁
                  </div>
                </div>
                <h1 className="neon-title text-6xl font-black mb-3" style={{ color: "#00d4ff" }}>
                  BARABAN O'YINI
                </h1>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full mb-4" />
                <p className="text-cyan-300/80 text-lg font-bold tracking-widest">FUTURISTIC GAMING EXPERIENCE</p>
              </div>

              {/* Mode Selection Buttons */}
              <div className="space-y-4 mb-10">
                {/* Single Player Button */}
                <button
                  onClick={() => {
                    setGameMode("single");
                    setPhase("wheel");
                  }}
                  className="neon-button w-full group relative overflow-hidden rounded-2xl p-6 text-white font-bold text-lg transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #0096ff 0%, #0066cc 100%)",
                    boxShadow: "0 0 30px rgba(0, 150, 255, 0.5), inset 0 0 20px rgba(0, 150, 255, 0.1)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <div className="relative flex items-center justify-center gap-4">
                    <User className="w-8 h-8" />
                    <div className="text-left">
                      <div className="font-black tracking-wider">BIR KISHILIk</div>
                      <div className="text-xs text-cyan-200/70">Solo Challenge</div>
                    </div>
                  </div>
                </button>

                {/* Team Mode Button */}
                <button
                  onClick={() => {
                    setGameMode("team");
                    setPhase("wheel");
                  }}
                  className="neon-button w-full group relative overflow-hidden rounded-2xl p-6 text-white font-bold text-lg transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #9333ea 0%, #c026d3 100%)",
                    boxShadow: "0 0 30px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(147, 51, 234, 0.1)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <div className="relative flex items-center justify-center gap-4">
                    <Users className="w-8 h-8" />
                    <div className="text-left">
                      <div className="font-black tracking-wider">JAMOAVIY O'YIN</div>
                      <div className="text-xs text-purple-200/70">Team Battle</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Game Rules Glass Card */}
              <div className="backdrop-blur-md rounded-2xl border border-cyan-400/30 bg-white/5 p-8 slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">📋</span>
                  <h3 className="text-cyan-300 font-black text-xl tracking-wide">O'YIN QOIDALARI</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Barabni aylantiring",
                    "Savol chiqadi, javobini bering",
                    "To'g'ri javob bersa - ball to'plang",
                    "Eng ko'p ball to'plagan yutadi"
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-cyan-100/80 font-semibold">
                      <span className="text-cyan-400 font-black">✓</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Loading Screen
  if (loading || questions.length === 0) {
    return (
      <GameProLayout accentColor="purple">
      <div 
        className="min-h-screen flex items-center justify-center overflow-hidden relative"
        style={{
          background: "linear-gradient(45deg, #0a0e27, #1a0a3e, #2d0a5e, #1a0a3e, #0a0e27)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 8s ease infinite",
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px",
        }}></div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? "#00d4ff" : "#c026d3",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `floatParticle 4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: i % 2 === 0 ? "0 0 10px #00d4ff" : "0 0 10px #c026d3",
            }}
          ></div>
        ))}

        <div className="relative z-10 text-center">
          <div className="relative inline-block mb-6">
            <Loader2 
              className="w-20 h-20 text-cyan-400 mx-auto animate-spin" 
              style={{
                filter: "drop-shadow(0 0 20px #00d4ff)",
                strokeWidth: 1.5,
              }}
            />
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 40px #00d4ff, 0 0 80px #00d4ff",
                animation: "cardGlow 2s ease-in-out infinite",
              }}
            ></div>
          </div>
          <p 
            className="text-2xl font-black text-cyan-400 tracking-wider"
            style={{
              textShadow: "0 0 20px #00d4ff, 0 0 40px #9333ea",
              animation: "neonGlow 3s ease-in-out infinite",
            }}
          >
            Savollar yuklanmoqda...
          </p>
        </div>

        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(30px, -30px); }
            50% { transform: translate(-20px, -50px); }
            75% { transform: translate(20px, -30px); }
          }
          @keyframes neonGlow {
            0%, 100% { text-shadow: 0 0 20px #00d4ff, 0 0 40px #9333ea; }
            50% { text-shadow: 0 0 30px #00d4ff, 0 0 60px #9333ea; }
          }
          @keyframes cardGlow {
            0%, 100% { box-shadow: 0 0 40px #00d4ff, 0 0 80px #00d4ff; }
            50% { box-shadow: 0 0 60px #00d4ff, 0 0 100px #00d4ff; }
          }
        `}</style>
      </div>
      </GameProLayout>
    );
  }

  // Wheel Screen
  if (phase === "wheel") {
    return (
      <GameProLayout accentColor="purple">
      <div 
        className="min-h-screen p-4 flex flex-col items-center justify-center overflow-hidden relative"
        style={{
          background: "linear-gradient(45deg, #0a0e27, #1a0a3e, #2d0a5e, #1a0a3e, #0a0e27)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 8s ease infinite",
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px",
        }}></div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              background: i % 2 === 0 ? "#00d4ff" : "#c026d3",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `floatParticle 4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: i % 2 === 0 ? "0 0 10px #00d4ff" : "0 0 10px #c026d3",
            }}
          ></div>
        ))}

        <div className="relative z-10 w-full max-w-4xl">
          <div className="mb-4 flex justify-end">
            <button
              onClick={finishGame}
              className="font-black py-2 px-5 text-sm rounded-xl uppercase tracking-wider border-2"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                borderColor: "#ef4444",
                color: "#fecaca",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)",
              }}
            >
              O'yinni Tugatish
            </button>
          </div>

          {/* Team Scores */}
          {gameMode === "team" && (
            <div className="w-full mb-8 grid grid-cols-2 gap-4">
              <div 
                className="relative backdrop-blur-xl border-2 rounded-2xl p-6 text-center overflow-hidden"
                style={{
                  borderColor: currentTeam === "team1" ? "#00d4ff" : "rgba(0, 212, 255, 0.3)",
                  backgroundColor: "rgba(10, 14, 39, 0.6)",
                  boxShadow: currentTeam === "team1" 
                    ? "0 0 20px #00d4ff, 0 0 40px rgba(0, 212, 255, 0.3)" 
                    : "0 0 10px rgba(0, 212, 255, 0.1)",
                  transition: "all 0.3s ease",
                }}
              >
                <p className="text-sm font-black uppercase tracking-wider text-cyan-400 mb-2">Team 1</p>
                <p className="text-5xl font-black text-cyan-400" style={{ textShadow: "0 0 20px #00d4ff" }}>
                  {teamScores.team1}
                </p>
              </div>
              <div 
                className="relative backdrop-blur-xl border-2 rounded-2xl p-6 text-center overflow-hidden"
                style={{
                  borderColor: currentTeam === "team2" ? "#c026d3" : "rgba(192, 38, 211, 0.3)",
                  backgroundColor: "rgba(10, 14, 39, 0.6)",
                  boxShadow: currentTeam === "team2" 
                    ? "0 0 20px #c026d3, 0 0 40px rgba(192, 38, 211, 0.3)" 
                    : "0 0 10px rgba(192, 38, 211, 0.1)",
                  transition: "all 0.3s ease",
                }}
              >
                <p className="text-sm font-black uppercase tracking-wider text-pink-400 mb-2">Team 2</p>
                <p className="text-5xl font-black text-pink-400" style={{ textShadow: "0 0 20px #c026d3" }}>
                  {teamScores.team2}
                </p>
              </div>
            </div>
          )}

          {gameMode === "single" && (
            <div className="mb-8 flex justify-center">
              <div 
                className="backdrop-blur-xl border-2 border-cyan-400 rounded-2xl px-12 py-6 text-center"
                style={{
                  backgroundColor: "rgba(10, 14, 39, 0.6)",
                  boxShadow: "0 0 20px #00d4ff, 0 0 40px rgba(0, 212, 255, 0.3)",
                }}
              >
                <p className="text-sm font-black uppercase tracking-wider text-cyan-400 mb-2">Sizning Ball</p>
                <p className="text-6xl font-black text-cyan-400" style={{ textShadow: "0 0 30px #00d4ff" }}>
                  {singleScore}
                </p>
              </div>
            </div>
          )}

          {/* Wheel Title */}
          <h2 
            className="text-center text-3xl font-black uppercase tracking-wider text-cyan-400 mb-8"
            style={{
              textShadow: "0 0 20px #00d4ff, 0 0 40px #9333ea, 0 0 60px rgba(0, 212, 255, 0.3)",
              animation: "neonGlow 3s ease-in-out infinite",
            }}
          >
            Barabni Aylantir
          </h2>

          {/* Wheel */}
          <div className="flex justify-center mb-8 relative">
            <div 
              className="relative w-80 h-80 rounded-full"
              style={{
                perspective: "1000px",
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    #ef4444 0deg 60deg,
                    #3b82f6 60deg 120deg,
                    #22c55e 120deg 180deg,
                    #eab308 180deg 240deg,
                    #a855f7 240deg 300deg,
                    #ec4899 300deg 360deg
                  )`,
                  boxShadow: "0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)",
                  animation: "cardGlow 2s ease-in-out infinite",
                }}
              ></div>

              {/* Actual wheel */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    #ef4444 0deg 60deg,
                    #3b82f6 60deg 120deg,
                    #22c55e 120deg 180deg,
                    #eab308 180deg 240deg,
                    #a855f7 240deg 300deg,
                    #ec4899 300deg 360deg
                  )`,
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: wheelSpinning ? "transform 3s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
                  boxShadow: "inset -5px -5px 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.3)",
                }}
              >
                {/* Numbers on Wheel */}
                {questions.map((_, idx) => {
                  const angle = (idx * 360) / questions.length + 30;
                  const radians = (angle * Math.PI) / 180;
                  const x = Math.cos(radians) * 120;
                  const y = Math.sin(radians) * 120;

                  return (
                    <div
                      key={idx}
                      className="absolute w-12 h-12 flex items-center justify-center font-black text-white text-lg rounded-full"
                      style={{
                        background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 212, 255, 0.3))",
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        border: "2px solid #00d4ff",
                        boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
                      }}
                    >
                      {idx + 1}
                    </div>
                  );
                })}

                {/* Center Circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl border-4"
                    style={{
                      background: "linear-gradient(135deg, #00d4ff, #9333ea)",
                      borderColor: "#00d4ff",
                      boxShadow: "0 0 30px #00d4ff, 0 0 60px rgba(147, 51, 234, 0.5)",
                    }}
                  >
                    🎯
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div 
                  className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent"
                  style={{
                    borderTopColor: "#00d4ff",
                    filter: "drop-shadow(0 0 10px #00d4ff)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <div className="flex justify-center">
            <button
              onClick={spinWheel}
              disabled={wheelSpinning}
              className="relative font-black py-4 px-12 text-xl rounded-xl uppercase tracking-wider overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: "linear-gradient(135deg, #ffb800, #ff9500)",
                color: "#000",
                boxShadow: "0 0 30px rgba(255, 184, 0, 0.6), 0 0 60px rgba(255, 149, 0, 0.3)",
                border: "2px solid #ffd700",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {wheelSpinning ? "🔄 Aylanmoqda..." : "🎯 Barabni Aylantir"}
              </span>
              {!wheelSpinning && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #fff700, #ffff00)",
                    animation: "shine 0.6s ease-in-out",
                  }}
                ></div>
              )}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(30px, -30px); }
            50% { transform: translate(-20px, -50px); }
            75% { transform: translate(20px, -30px); }
          }
          @keyframes neonGlow {
            0%, 100% { text-shadow: 0 0 20px #00d4ff, 0 0 40px #9333ea; }
            50% { text-shadow: 0 0 30px #00d4ff, 0 0 60px #9333ea; }
          }
          @keyframes cardGlow {
            0%, 100% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(147, 51, 234, 0.3); }
            50% { box-shadow: 0 0 60px rgba(0, 212, 255, 0.7), 0 0 120px rgba(147, 51, 234, 0.5); }
          }
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
      </GameProLayout>
    );
  }

  // Question Screen
  if (phase === "question") {
    if (!questions || questions.length === 0 || currentQuestion >= questions.length) {
      return (
        <GameProLayout accentColor="purple">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
              <p className="text-xl text-cyan-300">Savollari yuklanyapti...</p>
            </div>
          </div>
        </GameProLayout>
      );
    }
    
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    return (
      <GameProLayout accentColor="purple">
      <div 
        className="min-h-screen p-4 overflow-hidden relative"
        style={{
          background: "linear-gradient(45deg, #0a0e27, #1a0a3e, #2d0a5e, #1a0a3e, #0a0e27)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 8s ease infinite",
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 212, 255, .15) 25%, rgba(0, 212, 255, .15) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .15) 75%, rgba(0, 212, 255, .15) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px",
        }}></div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              background: i % 2 === 0 ? "#00d4ff" : "#c026d3",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `floatParticle 4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: i % 2 === 0 ? "0 0 10px #00d4ff" : "0 0 10px #c026d3",
            }}
          ></div>
        ))}

        <div className="max-w-3xl mx-auto pt-8 relative z-10">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 
              className="text-3xl font-black uppercase tracking-wider text-cyan-400"
              style={{
                textShadow: "0 0 20px #00d4ff, 0 0 40px #9333ea",
              }}
            >
              Savol #{selectedSlice + 1}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={speakQuestion}
                className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                style={{
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.5)",
                }}
              >
                <Volume2 className="w-5 h-5" />
                Ovoz
              </button>
              <button
                onClick={finishGame}
                className="font-black py-2 px-4 text-sm rounded-lg uppercase tracking-wider border-2"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  borderColor: "#ef4444",
                  color: "#fecaca",
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)",
                }}
              >
                O'yinni Tugatish
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div 
            className="mb-8 backdrop-blur-xl border-2 border-cyan-400 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(10, 14, 39, 0.6)",
              boxShadow: "0 0 30px #00d4ff, 0 0 60px rgba(0, 212, 255, 0.2)",
            }}
          >
            {/* Header Background */}
            <div 
              className="px-8 py-6 border-b-2 border-cyan-400"
              style={{
                background: "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(147, 51, 234, 0.1))",
              }}
            >
              <h2 className="text-2xl font-black text-cyan-300">
                {question && question.q ? question.q : "Savol yuklanyapti..."}
              </h2>
            </div>

            {/* Options */}
            <div className="p-8 space-y-3">
              {question && question.opts && question.opts.length > 0 ? (
                question.opts.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isAnswered = answered;
                  const isCorrectOption = idx === question.correct;
                  let buttonStyle = {};

                  if (isAnswered) {
                    if (isCorrectOption) {
                      buttonStyle = {
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        borderColor: "#00d4ff",
                        boxShadow: "0 0 20px #22c55e, 0 0 40px rgba(34, 197, 94, 0.3)",
                        color: "#fff",
                      };
                    } else if (isSelected) {
                      buttonStyle = {
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        borderColor: "#ef4444",
                        boxShadow: "0 0 20px #ef4444, 0 0 40px rgba(239, 68, 68, 0.3)",
                        color: "#fff",
                      };
                    }
                  } else if (isSelected) {
                    buttonStyle = {
                      background: "linear-gradient(135deg, #9333ea, #7e22ce)",
                      borderColor: "#c026d3",
                      boxShadow: "0 0 20px #c026d3, 0 0 40px rgba(192, 38, 211, 0.3)",
                      color: "#fff",
                    };
                  } else {
                    buttonStyle = {
                      background: "rgba(0, 212, 255, 0.05)",
                      borderColor: "rgba(0, 212, 255, 0.3)",
                      boxShadow: "0 0 10px rgba(0, 212, 255, 0.1)",
                      color: "#e0f7ff",
                    };
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isAnswered && handleAnswer(idx)}
                      disabled={isAnswered && !isCorrectOption && !isSelected}
                      className="w-full p-4 rounded-xl font-black text-left transition-all border-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={buttonStyle}
                    >
                      {option}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-cyan-300">
                  Savollari topib bolmadi
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {answered && (
            <div 
              className="mb-8 backdrop-blur-xl border-2 rounded-2xl overflow-hidden"
              style={{
                borderColor: isCorrect ? "#22c55e" : "#ef4444",
                backgroundColor: "rgba(10, 14, 39, 0.6)",
                boxShadow: isCorrect 
                  ? "0 0 30px #22c55e, 0 0 60px rgba(34, 197, 94, 0.2)"
                  : "0 0 30px #ef4444, 0 0 60px rgba(239, 68, 68, 0.2)",
                animation: "slideUp 0.6s ease-out",
              }}
            >
              <div className="p-8">
                <div className="flex items-start gap-4">
                  <div className={`text-5xl font-black ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1">
                    <p className={`font-black mb-3 text-2xl ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "To'g'ri! 🎉" : "Noto'g'ri ❌"}
                    </p>
                    <p className="text-cyan-200 mb-3 text-base leading-relaxed">
                      {question.explanation}
                    </p>
                    {isCorrect && (
                      <p className="text-green-400 font-black text-lg">
                        +{question.points} ball
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {answered && (
            <div className="flex flex-wrap gap-4 justify-center">
              {usedQuestionIndices.length >= questions.length ? (
                <button
                  onClick={finishGame}
                  className="font-black py-4 px-12 text-lg rounded-xl uppercase tracking-wider flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #0d9488)",
                    color: "#fff",
                    boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)",
                    border: "2px solid #22d3ee",
                  }}
                >
                  <Trophy className="w-6 h-6" />
                  Natijani Ko'rish
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="font-black py-4 px-12 text-lg rounded-xl uppercase tracking-wider overflow-hidden group relative"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4, #0d9488)",
                    color: "#fff",
                    boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)",
                    border: "2px solid #22d3ee",
                  }}
                >
                  <span className="relative z-10">Keyingi Savol →</span>
                </button>
              )}
              <button
                onClick={finishGame}
                className="font-black py-4 px-8 text-lg rounded-xl uppercase tracking-wider border-2"
                style={{
                  background: "rgba(6, 182, 212, 0.1)",
                  borderColor: "#06b6d4",
                  color: "#67e8f9",
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.2)",
                }}
              >
                Tugatish
              </button>
              <button
                onClick={resetGame}
                className="font-black py-4 px-8 text-lg rounded-xl uppercase tracking-wider border-2"
                style={{
                  background: "rgba(192, 38, 211, 0.1)",
                  borderColor: "#c026d3",
                  color: "#e0d4ff",
                  boxShadow: "0 0 20px rgba(192, 38, 211, 0.3)",
                }}
              >
                Qayta Boshlash ↻
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes floatParticle {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(30px, -30px); }
            50% { transform: translate(-20px, -50px); }
            75% { transform: translate(20px, -30px); }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
      </GameProLayout>
    );
  }

  // Results Screen - Premium Design
  if (phase === "results") {
    const totalSingle = singleScore;
    const winner = gameMode === "team" 
      ? (teamScores.team1 > teamScores.team2 ? "team1" : teamScores.team2 > teamScores.team1 ? "team2" : "tie")
      : null;
    const maxScore = gameMode === "team" ? Math.max(teamScores.team1, teamScores.team2) : totalSingle;
    const isHighScore = maxScore >= 50;

    return (
      <GameProLayout accentColor="purple">
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #0a0e27 0%, #0f172a 30%, #1e1b4b 60%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 10s ease infinite",
        }}
      >
        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes floatUp {
            0%, 100% { transform: translateY(0); opacity: 0.9; }
            50% { transform: translateY(-15px); opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.5)); }
            50% { filter: drop-shadow(0 0 50px rgba(6, 182, 212, 0.8)); }
          }
          @keyframes confetti {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Confetti / particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                background: ["#06b6d4", "#22d3ee", "#a855f7", "#f59e0b", "#22c55e"][i % 5],
                boxShadow: "0 0 10px currentColor",
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 0], rotate: 360 * (i % 2 ? 1 : -1) }}
              transition={{ duration: 3 + Math.random() * 2, delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="backdrop-blur-xl rounded-3xl border-2 border-cyan-500/40 bg-black/50 p-10 shadow-2xl"
            style={{
              boxShadow: "0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 60px rgba(6, 182, 212, 0.05)",
            }}
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 mb-6 shadow-lg shadow-cyan-500/50" style={{ animation: "pulse-glow 2s ease-in-out infinite" }}>
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
                O'YIN TUGADI!
              </h1>
              <p className="text-cyan-300/80 text-lg font-semibold">Natijangizni ko'ring</p>
            </motion.div>

            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              {gameMode === "single" ? (
                <div className="text-center">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Jami ball</p>
                  <p 
                    className="text-7xl sm:text-8xl font-black text-cyan-400"
                    style={{ textShadow: "0 0 40px rgba(6, 182, 212, 0.6)" }}
                  >
                    {totalSingle}
                  </p>
                  {isHighScore && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/50"
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-amber-400 font-bold">Ajoyib natija!</span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div 
                    className={`rounded-2xl p-6 text-center border-2 transition-all ${
                      winner === "team1" 
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/30" 
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    <p className="text-cyan-400 font-bold mb-1">Jamoa 1</p>
                    <p className="text-4xl font-black text-cyan-400">{teamScores.team1}</p>
                    {winner === "team1" && (
                      <Award className="w-8 h-8 text-amber-400 mx-auto mt-2" />
                    )}
                  </div>
                  <div 
                    className={`rounded-2xl p-6 text-center border-2 transition-all ${
                      winner === "team2" 
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/30" 
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    <p className="text-purple-400 font-bold mb-1">Jamoa 2</p>
                    <p className="text-4xl font-black text-purple-400">{teamScores.team2}</p>
                    {winner === "team2" && (
                      <Award className="w-8 h-8 text-amber-400 mx-auto mt-2" />
                    )}
                  </div>
                  {winner === "tie" && (
                    <div className="col-span-2 text-center py-2">
                      <p className="text-amber-400 font-bold">Durrang! 🎉</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-10 py-4 px-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Javob berilgan savollar</span>
                <span className="text-cyan-400 font-bold">{usedQuestionIndices.length}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-400 hover:to-teal-500 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
                Qayta O'ynash
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-bold text-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Bosh Sahifa
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </GameProLayout>
    );
  }

  return null;
}
