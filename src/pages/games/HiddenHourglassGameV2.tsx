import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Sparkles, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Samarqandda qaysi davr bino yasalgan?",
    opts: ["14-asrda", "20-asrda", "10-asrda", "15-asrda"],
    correct: 0,
    difficulty: "O'rta",
    explanation: "Samarqand 14-asrda ulug' Temur davri bino yasandrdi",
    points: 100,
  },
];

export default function HiddenHourglassGameV2() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!answered && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (timeLeft === 0 && !answered && !gameOver) {
      setIsTimeUp(true);
      setAnswered(true);
    }
  }, [timeLeft, answered, gameOver]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(getApiUrl("/custom-tests/game/hidden-hourglass"));
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data.slice(0, 10));
      } else {
        setQuestions(MOCK_QUESTIONS);
      }
    } catch (error) {
      console.error("Error:", error);
      setQuestions(MOCK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);
    setIsTimeUp(false);

    if (index === questions[currentQuestion]?.correct) {
      setScore((prev) => prev + (questions[currentQuestion]?.points || 100));
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(30);
      setIsTimeUp(false);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setGameOver(false);
    setTimeLeft(30);
    setIsTimeUp(false);
  };

  if (loading) {
    return (
      <GameProLayout accentColor="purple">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin"><Sparkles className="w-12 h-12 text-purple-400" /></div>
        </div>
      </GameProLayout>
    );
  }

  if (!questions.length) {
    return (
      <GameProLayout accentColor="white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="game-pro-card p-8 max-w-md text-center">
            <p className="text-red-400 mb-6">❌ Savollarni yuklab bo'lmadi</p>
            <Button onClick={() => window.location.reload()} className="game-pro-btn w-full py-4 rounded-xl">Qayta urinish</Button>
          </div>
        </div>
      </GameProLayout>
    );
  }

  if (gameOver) {
    return (
      <GameProLayout accentColor="purple">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="game-pro-card p-12 max-w-md text-center">
            <div className="text-7xl mb-6" style={{ filter: "drop-shadow(0 0 30px rgba(168,85,247,0.4))" }}>⏳</div>
            <h2 className="game-pro-title text-4xl mb-2">O'YIN TUGADI!</h2>
            <p className="text-2xl font-bold text-white mb-8">Jami Ball: <span className="text-purple-400" style={{ textShadow: "0 0 20px rgba(168,85,247,0.5)" }}>{score}</span></p>
            <div className="space-y-3">
              <Button onClick={handleRestart} className="game-pro-btn w-full py-4 rounded-xl">Qayta O'ynash</Button>
              <Button onClick={() => navigate("/games")} variant="outline" className="w-full py-4 rounded-xl border-white/20 text-white hover:bg-white/10">O'yinlar Sahifasiga</Button>
            </div>
          </div>
        </div>
      </GameProLayout>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timePercentage = (timeLeft / 30) * 100;

  return (
    <GameProLayout accentColor="purple">
    <div className="min-h-screen">
      {/* Status Bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-slate-900 to-transparent border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-semibold text-white">Savol {currentQuestion + 1}/{questions.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold">
                <span className="text-purple-400">{score}</span>
                <span className="text-white/50"> ball</span>
              </div>
              <div className={`text-2xl font-bold ${
                timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
              }`}>
                {timeLeft}s
              </div>
            </div>
          </div>

          {/* Time Bar */}
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-300 ${
                timeLeft <= 5
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${timePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Question Card */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/30 backdrop-blur-xl rounded-3xl shadow-2xl hover:border-purple-500/60 transition-all duration-300">
          <CardContent className="p-8">
            {/* Question Text */}
            <div className="bg-purple-500/10 border-l-4 border-purple-500 p-6 rounded-2xl mb-8">
              <h2 className="text-2xl font-bold text-white leading-relaxed">
                {question.q}
              </h2>
            </div>

            {/* Time Warning */}
            {timeLeft <= 5 && !answered && (
              <div className="bg-red-500/20 border-l-4 border-red-400 p-4 rounded-xl mb-8 animate-pulse">
                <p className="text-red-300 font-bold">⚠️ VAQT TUGAYAPTI!</p>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {question.opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered || isTimeUp}
                  className={`w-full p-4 rounded-2xl font-semibold text-left transition-all duration-300 ${
                    idx === question.correct && answered
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-300 shadow-lg shadow-green-500/50 scale-105"
                      : idx === selectedAnswer && selectedAnswer !== question.correct && answered
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-red-300 shadow-lg shadow-red-500/50"
                      : !answered && idx === selectedAnswer
                      ? "bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white border-2 border-purple-400"
                      : !answered && !isTimeUp
                      ? "bg-slate-700/60 text-white border-2 border-slate-600 hover:border-purple-500/50 hover:bg-slate-700/80 cursor-pointer"
                      : "bg-slate-700/40 text-white/70 border-2 border-slate-600"
                  } ${answered || isTimeUp ? "cursor-not-allowed" : ""}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl font-bold">
                      {idx === question.correct && answered ? "✅" : idx === selectedAnswer && selectedAnswer !== question.correct && answered ? "❌" : `${idx + 1}`}
                    </span>
                    <span>{opt}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Time's Up Message */}
            {isTimeUp && (
              <div className="bg-red-500/20 border-l-4 border-red-400 p-4 rounded-xl mb-8">
                <p className="text-red-300 font-bold">⏰ VAQT TUGADI!</p>
              </div>
            )}

            {/* Explanation */}
            {answered && (
              <div className="bg-blue-500/20 border-l-4 border-blue-400 p-4 rounded-xl mb-8">
                <p className="text-sm text-blue-200">
                  <span className="font-bold">💡 Tushuntirish:</span> {question.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {answered || isTimeUp && (
              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-2xl shadow-lg"
              >
                {currentQuestion + 1 >= questions.length ? "TUGALLASH" : "KEYINGI"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Home Button */}
        <div className="flex justify-center pb-4">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-2xl"
          >
            <Home className="mr-2 w-4 h-4" />
            Bosh sahifa
          </Button>
        </div>
      </div>
    </div>
    </GameProLayout>
  );
}
