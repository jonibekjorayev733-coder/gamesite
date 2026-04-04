import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
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

const PRIZE_LEVELS = [
  { level: 1, amount: 100, difficulty: "Oson" },
  { level: 2, amount: 500, difficulty: "Oson" },
  { level: 3, amount: 1000, difficulty: "Oson" },
  { level: 4, amount: 5000, difficulty: "O'rta" },
  { level: 5, amount: 10000, difficulty: "O'rta" },
  { level: 6, amount: 25000, difficulty: "O'rta" },
  { level: 7, amount: 50000, difficulty: "Qiyin" },
  { level: 8, amount: 100000, difficulty: "Qiyin" },
  { level: 9, amount: 500000, difficulty: "Qiyin" },
  { level: 10, amount: 1000000, difficulty: "Qiyin" },
];

export default function MillionaireGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restartGame = () => {
    localStorage.removeItem("millionaireGameState");
    setCurrentLevel(0);
    setTotalWinnings(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setGameOver(false);
  };

  const finishGame = () => {
    localStorage.removeItem("millionaireGameState");
    const safeAmount = currentLevel > 0 ? PRIZE_LEVELS[currentLevel - 1].amount : 0;
    setTotalWinnings(safeAmount);
    setGameOver(true);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const MOCK_QUESTIONS: Question[] = [
    {
      id: 1,
      q: "Prezident Sh.M.Mirziyoyev necha yildan boshlab O'zbekistan prezidenti?",
      opts: ["2014 yildan", "2016 yildan", "2018 yildan", "2020 yildan"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "Shavkat Mirziyoyev 2016 yil 14 avgustdan O'zbekiston Respublikasining prezidenti.",
      points: 100,
    },
    {
      id: 2,
      q: "O'zbekiston qaysi era o'lkasi bilan chegarani bo'linadi?",
      opts: ["Qazoxistan va Turkmanistan", "Qazoxistan va Qirgiziston", "Afg'oniston va Pakiston", "Qozoqistan va Afg'oniston"],
      correct: 0,
      difficulty: "Oson",
      explanation: "O'zbekiston Qozog'iston va Turkmanistan bilan shamol tomondagi chegarani bo'linadi.",
      points: 500,
    },
    {
      id: 3,
      q: "Qaysi Xonlik O'zbekiston teritoriyasida eng yog'un shakl olgan?",
      opts: ["Buxoro Xonligi", "Xiva Xonligi", "Kokand Xonligi", "Samarqand Xonligi"],
      correct: 2,
      difficulty: "Qiyin",
      explanation: "Kokand Xonligi O'zbekiston teritoriyasida eng yog'un shakl olgan.",
      points: 1000,
    },
    {
      id: 4,
      q: "O'zbekiston davlatining birinchi hujjati nima?",
      opts: ["Konstitutsiya", "Qonun", "Nizom", "Farmoni prezident"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Konstitutsiya O'zbekiston davlatining asosiy hujjatidir.",
      points: 5000,
    },
    {
      id: 5,
      q: "O'zbekiston milliy valyutasi nima?",
      opts: ["So'm", "Tiyona", "Manat", "Tenge"],
      correct: 0,
      difficulty: "Oson",
      explanation: "O'zbekiston milliy valyutasi So'm.",
      points: 10000,
    },
    {
      id: 6,
      q: "Samarqand qaysi asrda qurilgan?",
      opts: ["VI asrda", "VII asrda", "VIII asrda", "IX asrda"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "Samarqand VI asrda qurilgan, bu juda qadimiy shahar.",
      points: 25000,
    },
    {
      id: 7,
      q: "Timur (Temur) kimning voqea bo'lgan?",
      opts: ["Baxshisroy", "Harbiy rahbar", "Sarapa faqir", "Shoir"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "Timur - 14-asrda yashagan buyuk harbiy rahbar va amir.",
      points: 50000,
    },
    {
      id: 8,
      q: "O'zbekiston qaysi va/yoki qaysi kontinentlarda joylashgan?",
      opts: ["Faqat Osiyada", "Asiya va Yevropada", "Faqat Yevropada", "Afrikada"],
      correct: 1,
      difficulty: "Qiyin",
      explanation: "O'zbekiston Markaziy Osiya (Asiya) va Yevropaning chegara sohalarida joylashgan.",
      points: 100000,
    },
    {
      id: 9,
      q: "Qoldan Darya O'zbekistonda qaysi viloyatdan o'tadi?",
      opts: ["Surxondarya", "Buxoro", "Xorazm", "Qashqadarya"],
      correct: 2,
      difficulty: "Qiyin",
      explanation: "Qoldan Darya Xorazm viloyatining asosiy vodiy.",
      points: 500000,
    },
    {
      id: 10,
      q: "O'zbekiston kimya sanoatining asosiy xom ashyosi nima?",
      opts: ["Miy", "Gaz", "Eritma", "Ko'mir"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "O'zbekiston tabiiy gaz va neft bo'yicha boy, bu kimya sanoatining asosiy xom ashlari.",
      points: 1000000,
    },
  ];

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl("/api/game-tests/millionaire/questions?count=10"));
      if (!response.ok) {
        throw new Error(`Backend xatosi: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <Card className="bg-red-900 border-red-700 max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-xl text-red-100 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Qayta Urinish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-slate-400">Savollar yuklanmadi</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <Card className="bg-gradient-to-r from-yellow-900 to-orange-900 border-yellow-600 max-w-md">
          <CardContent className="pt-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">O'yin Tugadi! 🎉</h2>
            <p className="text-2xl text-yellow-300 font-bold mb-6">Jami Yutuq: {totalWinnings}$</p>
            <Button onClick={restartGame} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              Qayta O'ynash
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentLevel];

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    if (index !== question.correct) {
      setGameOver(true);
      return;
    }

    if (currentLevel === questions.length - 1) {
      setTotalWinnings(PRIZE_LEVELS[currentLevel].amount);
      setGameOver(true);
      return;
    }

    setTimeout(() => {
      setTotalWinnings(PRIZE_LEVELS[currentLevel].amount);
      setCurrentLevel(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Millioner O'yini
            <Trophy className="w-8 h-8 text-yellow-400" />
          </h1>
          <div className="flex justify-center">
            <Button
              onClick={finishGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              O'yinni Tugatish
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Prize Ladder */}
          <Card className="bg-slate-800 border-slate-700 md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Prize Ladder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PRIZE_LEVELS.map((prize, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-center transition-all ${
                      index === currentLevel
                        ? "bg-yellow-600 text-white font-bold scale-110"
                        : index < currentLevel
                        ? "bg-green-900 text-green-200"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="font-bold">{prize.amount}$</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="bg-slate-800 border-slate-700 md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">Level {currentLevel + 1}</CardTitle>
                <span className="text-yellow-400 font-bold">{PRIZE_LEVELS[currentLevel].amount}$</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg text-white font-semibold mb-4">{question.q}</p>
                <p className="text-sm text-slate-400">Difficulty: {question.difficulty}</p>
              </div>

              <div className="space-y-3">
                {question.opts.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    variant="outline"
                    className={`h-auto py-4 px-4 text-left justify-start text-base transition-all ${
                      selectedAnswer === index
                        ? index === question.correct
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-red-600 border-red-600 text-white"
                        : answered && index === question.correct
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-slate-600 text-slate-300 hover:border-yellow-500"
                    }`}
                  >
                    <span className="font-bold mr-3 text-lg">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {answered && (
                <div className={`p-4 rounded-lg ${selectedAnswer === question.correct ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}>
                  <p className="font-semibold mb-2">
                    {selectedAnswer === question.correct ? "✓ To'g'ri!" : "✗ Noto'g'ri"}
                  </p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
