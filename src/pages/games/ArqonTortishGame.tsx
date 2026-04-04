import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Handshake, Loader2, Volume2 } from "lucide-react";
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

const RACE_STEP = 14;

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Marafonning rasmiy masofasi?",
    opts: ["21.1 km", "30 km", "42.195 km", "50 km"],
    correct: 2,
    difficulty: "Oson",
    explanation: "Rasmiy marafon 42.195 km.",
    points: 12,
  },
  {
    id: 2,
    q: "100 metrni 10 soniyada yugursa tezlik qancha?",
    opts: ["8 m/s", "10 m/s", "12 m/s", "15 m/s"],
    correct: 1,
    difficulty: "O'rta",
    explanation: "v = s/t = 100/10 = 10 m/s.",
    points: 12,
  },
  {
    id: 3,
    q: "Yugurishdan oldin eng to'g'ri tayyorgarlik qaysi?",
    opts: ["Dinamik qizish", "Sovuq dush", "Darhol sprint", "Faqat o'tirish"],
    correct: 0,
    difficulty: "Oson",
    explanation: "Dinamik qizish mushaklarni ishga tayyorlaydi.",
    points: 10,
  },
  {
    id: 4,
    q: "400 metr trekda 800 metr necha aylana?",
    opts: ["1", "2", "3", "4"],
    correct: 1,
    difficulty: "Oson",
    explanation: "800 / 400 = 2 aylana.",
    points: 10,
  },
  {
    id: 5,
    q: "Qaysi odat tiklanishga yordam beradi?",
    opts: ["Cooldown va cho'zilish", "Suv ichmaslik", "Darhol yotish", "Ovqatni tashlash"],
    correct: 0,
    difficulty: "O'rta",
    explanation: "Cooldown va cho'zilish tiklanishni tezlashtiradi.",
    points: 12,
  },
  {
    id: 6,
    q: "Team 1 uchta to'g'ri javob berdi. Har biri 14%. Masofa?",
    opts: ["28%", "42%", "56%", "70%"],
    correct: 1,
    difficulty: "O'rta",
    explanation: "14 × 3 = 42%.",
    points: 12,
  },
  {
    id: 7,
    q: "Yugurishdagi finish oldi tezlanish nima deyiladi?",
    opts: ["Recovery", "Sprint finish", "Cooldown", "Split"],
    correct: 1,
    difficulty: "Oson",
    explanation: "Finish oldi sprint finish deb ataladi.",
    points: 10,
  },
  {
    id: 8,
    q: "150 metrni 30 soniyada yugurdi. Tezlik qancha?",
    opts: ["3 m/s", "4 m/s", "5 m/s", "6 m/s"],
    correct: 2,
    difficulty: "O'rta",
    explanation: "v = 150/30 = 5 m/s.",
    points: 12,
  },
  {
    id: 9,
    q: "Jamoaviy natijani eng ko'p oshiradigan omil?",
    opts: ["Bir-birini qo'llash", "Sukut", "Tanqid", "Faqat individual o'yin"],
    correct: 0,
    difficulty: "Oson",
    explanation: "Jamoaviy qo'llab-quvvatlash motivatsiyani oshiradi.",
    points: 10,
  },
  {
    id: 10,
    q: "Yugurishda ritmik nafas olish nima beradi?",
    opts: ["Charchoqni tezlashtiradi", "Chidamlilikni oshiradi", "Qadamni buzadi", "Umuman ta'sir qilmaydi"],
    correct: 1,
    difficulty: "O'rta",
    explanation: "Ritmik nafas olish chidamlilikni oshiradi.",
    points: 12,
  },
];

export default function ArqonTortishGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [team1Distance, setTeam1Distance] = useState(0);
  const [team2Distance, setTeam2Distance] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Try to load saved game state
    const savedState = localStorage.getItem("arqonTortishGameState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setQuestions(state.questions || []);
        setCurrentQuestion(state.currentQuestion || 0);
        setTeam1Distance(state.team1Distance || 0);
        setTeam2Distance(state.team2Distance || 0);
        setCurrentTeam(state.currentTeam || 1);
        setIsFinished(state.isFinished || false);
        setLoading(false);
      } catch (error) {
        console.error("Saqlangan o'yin holatini yuklashda xato:", error);
        loadQuestions();
      }
    } else {
      loadQuestions();
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    const gameState = {
      questions,
      currentQuestion,
      team1Distance,
      team2Distance,
      currentTeam,
      isFinished,
    };
    localStorage.setItem("arqonTortishGameState", JSON.stringify(gameState));
  }, [questions, currentQuestion, team1Distance, team2Distance, currentTeam, isFinished]);

  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await fetch(getApiUrl("/api/game-tests/yugurish_poyezdi/questions?count=10"));
      if (!response.ok) {
        throw new Error(`Backend xatosi: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.questions?.length) {
        setQuestions(data.questions);
        localStorage.setItem("arqonTortishQuestions", JSON.stringify(data.questions));
      } else {
        throw new Error("Backend savollari bo'sh");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Noma'lum xato";
      console.error("Savollari yuklashda xato:", errorMsg);
      setError(`❌ Server ishlamayapti`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = () => {
    if (!("speechSynthesis" in window) || !questions[currentQuestion]) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestion].q);
    utterance.lang = "uz-UZ";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (index: number) => {
    if (answered || isFinished) {
      return;
    }

    setSelectedAnswer(index);
    setAnswered(true);
    window.speechSynthesis.cancel();

    const question = questions[currentQuestion];
    if (!question) {
      return;
    }

    if (index === question.correct) {
      if (currentTeam === 1) {
        setTeam1Distance((prev) => Math.min(prev + RACE_STEP, 100));
      } else {
        setTeam2Distance((prev) => Math.min(prev + RACE_STEP, 100));
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setCurrentTeam((prev) => (prev === 1 ? 2 : 1));
      window.speechSynthesis.cancel();
      return;
    }
    setIsFinished(true);
  };

  const finishGame = () => {
    window.speechSynthesis.cancel();
    setIsFinished(true);
  };

  const restartGame = () => {
    localStorage.removeItem("arqonTortishGameState");
    setCurrentQuestion(0);
    setTeam1Distance(0);
    setTeam2Distance(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCurrentTeam(1);
    setIsFinished(false);
  };

  const winnerText = useMemo(() => {
    if (team1Distance > team2Distance) {
      return "Team 1 g'olib bo'ldi";
    }
    if (team2Distance > team1Distance) {
      return "Team 2 g'olib bo'ldi";
    }
    return "Durrang";
  }, [team1Distance, team2Distance]);

  if (loading) {
    return (
      <GameProLayout accentColor="cyan">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        </div>
      </GameProLayout>
    );
  }

  if (error) {
    return (
      <GameProLayout accentColor="white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="game-pro-card p-8 max-w-md text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="game-pro-btn w-full py-4 rounded-xl">Qayta Urinish</Button>
          </div>
        </div>
      </GameProLayout>
    );
  }

  if (!questions.length) {
    return (
      <GameProLayout accentColor="white">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg font-semibold text-white">Savollar yuklanmadi</p>
        </div>
      </GameProLayout>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <GameProLayout accentColor="cyan">
    <div className="min-h-screen text-white p-4">
      <div className="mx-auto max-w-5xl pt-6">
        <Card className="mb-6 border border-cyan-500/30 bg-gradient-to-r from-slate-900 to-slate-800">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-cyan-300">Yugurish Poyezdi</h1>
              <p className="text-slate-300 text-sm mt-1">Savol {Math.min(currentQuestion + 1, questions.length)} / {questions.length}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={speakQuestion} disabled={isSpeaking || isFinished} className="bg-cyan-600 hover:bg-cyan-700">
                <Volume2 className="h-4 w-4 mr-2" /> Ovoz
              </Button>
              <Button onClick={finishGame} className="bg-red-600 hover:bg-red-700">
                O'yinni Tugatish
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border border-emerald-500/30 bg-slate-900/70">
            <CardContent className="pt-6 text-center">
              <p className="text-xs uppercase text-emerald-300 tracking-widest">Team 1</p>
              <p className="text-4xl font-black text-emerald-400 mt-2">{team1Distance}%</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-500/30 bg-slate-900/70">
            <CardContent className="pt-6 text-center">
              <p className="text-xs uppercase text-blue-300 tracking-widest">Team 2</p>
              <p className="text-4xl font-black text-blue-400 mt-2">{team2Distance}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border border-violet-500/30 bg-slate-900/70 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs mb-2 text-slate-300">
                <span>Team 1</span>
                <span>Finish <Flag className="inline h-4 w-4" /></span>
              </div>
              <div className="h-10 bg-slate-800 rounded-full relative border border-slate-700 overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-500" style={{ width: `${team1Distance}%` }} />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs px-2">🏁</div>
                <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-500" style={{ left: `calc(${team1Distance}% - 20px)` }}>
                  <svg width="40" height="32" viewBox="0 0 60 40" className="drop-shadow-lg">
                    <rect x="8" y="15" width="44" height="14" fill="#10B981" stroke="#065F46" strokeWidth="1" rx="2"/>
                    <rect x="18" y="8" width="24" height="8" fill="#10B981" stroke="#065F46" strokeWidth="1" rx="1"/>
                    <rect x="20" y="10" width="8" height="5" fill="#6EE7B7" stroke="#047857" strokeWidth="0.5"/>
                    <rect x="32" y="10" width="8" height="5" fill="#6EE7B7" stroke="#047857" strokeWidth="0.5"/>
                    <circle cx="16" cy="30" r="4" fill="#1F2937" stroke="#000" strokeWidth="0.5"/>
                    <circle cx="44" cy="30" r="4" fill="#1F2937" stroke="#000" strokeWidth="0.5"/>
                    <circle cx="10" cy="18" r="1.5" fill="#FCD34D"/>
                    <circle cx="10" cy="24" r="1.5" fill="#FCD34D"/>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-2 text-slate-300">
                <span>Team 2</span>
                <span>Finish <Flag className="inline h-4 w-4" /></span>
              </div>
              <div className="h-10 bg-slate-800 rounded-full relative border border-slate-700 overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${team2Distance}%` }} />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs px-2">🏁</div>
                <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-500" style={{ left: `calc(${team2Distance}% - 20px)` }}>
                  <svg width="40" height="32" viewBox="0 0 60 40" className="drop-shadow-lg">
                    <rect x="8" y="15" width="44" height="14" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" rx="2"/>
                    <rect x="18" y="8" width="24" height="8" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1" rx="1"/>
                    <rect x="20" y="10" width="8" height="5" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5"/>
                    <rect x="32" y="10" width="8" height="5" fill="#93C5FD" stroke="#1E40AF" strokeWidth="0.5"/>
                    <circle cx="16" cy="30" r="4" fill="#1F2937" stroke="#000" strokeWidth="0.5"/>
                    <circle cx="44" cy="30" r="4" fill="#1F2937" stroke="#000" strokeWidth="0.5"/>
                    <circle cx="10" cy="18" r="1.5" fill="#FCD34D"/>
                    <circle cx="10" cy="24" r="1.5" fill="#FCD34D"/>
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isFinished && (
          <Card className="mb-6 border border-cyan-500/30 bg-slate-900/80">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${currentTeam === 1 ? "bg-emerald-600" : "bg-blue-600"}`}>
                  {currentTeam === 1 ? "Team 1 javob beradi" : "Team 2 javob beradi"}
                </div>
                <span className="text-xs text-slate-300">Qiyinlik: {currentQ.difficulty}</span>
              </div>
              <CardTitle className="text-2xl mt-3 text-white">{currentQ.q}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {currentQ.opts.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQ.correct;

                  let cls = "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white";
                  if (answered && isCorrect) {
                    cls = "border-emerald-400 bg-emerald-600 text-white";
                  } else if (answered && isSelected && !isCorrect) {
                    cls = "border-red-400 bg-red-600 text-white";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={answered}
                      className={`w-full rounded-xl border px-4 py-3 text-left font-semibold transition-all ${cls}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {answered && !isFinished && (
          <Card className="mb-6 border border-slate-700 bg-slate-900">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-300 mb-3">{currentQ.explanation}</p>
              <div className="flex justify-center">
                <Button onClick={handleNext} className="bg-violet-600 hover:bg-violet-700 px-8">
                  {currentQuestion === questions.length - 1 ? "Natija" : "Keyingi savol"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isFinished && (
          <Card className="border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/40">
            <CardHeader>
              <CardTitle className="text-center text-3xl text-amber-300">Yakuniy Natija</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-500/30 bg-slate-900 p-5">
                  <p className="text-xs uppercase text-emerald-300 tracking-widest">Team 1</p>
                  <p className="text-5xl font-black text-emerald-400 mt-2">{team1Distance}%</p>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-slate-900 p-5">
                  <p className="text-xs uppercase text-blue-300 tracking-widest">Team 2</p>
                  <p className="text-5xl font-black text-blue-400 mt-2">{team2Distance}%</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-900/20 p-5">
                {team1Distance === team2Distance ? (
                  <div className="flex items-center justify-center gap-2 text-xl font-black text-amber-200">
                    <Handshake className="h-6 w-6" /> Durrang
                  </div>
                ) : (
                  <p className="text-2xl font-black text-amber-200">{winnerText}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button onClick={restartGame} className="bg-cyan-600 hover:bg-cyan-700">
                  Qayta Boshlash
                </Button>
                <Button onClick={loadQuestions} className="bg-slate-700 hover:bg-slate-600">
                  Yangi Savollar Yuklash
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </GameProLayout>
  );
}
