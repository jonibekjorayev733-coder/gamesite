import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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

export default function KrosswordGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  const MOCK_QUESTIONS: Question[] = [
    {
      id: 1,
      q: "O'zbekistonning poytaxti (8 harf)",
      opts: ["Toshkent", "Samarqand", "Buxoro", "Farg'ona"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Toshkent - O'zbekistonning poytaxti",
      points: 10,
    },
    {
      id: 2,
      q: "Eng katta sayyora (8 harf)",
      opts: ["Saturn", "Mars", "Yupiter", "Neptun"],
      correct: 2,
      difficulty: "O'rta",
      explanation: "Yupiter - quyosh sistemasining eng katta sayyorasi",
      points: 10,
    },
    {
      id: 3,
      q: "Sinf nutnasi so'zi (8 harf)",
      opts: ["Direkto", "Nazorat", "Ekzamen", "Dars"],
      correct: 2,
      difficulty: "O'rta",
      explanation: "Ekzamen - bilimni tekshirish jarayoni",
      points: 10,
    },
    {
      id: 4,
      q: "Eng katta okean (5 harf)",
      opts: ["Tinch", "Atlantik", "Hind", "Arktik"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Tinch okeyan eng katta va chuqurligi bilan birinchi",
      points: 10,
    },
    {
      id: 5,
      q: "Quyosh turli taraflardan o'pka _____ deyiladi",
      opts: ["Atmosfera", "Oksigen", "Gaz", "Aeroplan"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "Atmosfera - Yer atmosferasi",
      points: 10,
    },
    {
      id: 6,
      q: "Tibbiy mutaxassisning nomi (6 harf)",
      opts: ["Doktor", "Shifa", "Kasallik", "Vosita"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Doktor - tibbiy mutaxassisning nomi",
      points: 10,
    },
    {
      id: 7,
      q: "Shuʼlasi bo'lgan yog'in ____",
      opts: ["Yulduz", "Mash'ala", "Olov", "Chiroq"],
      correct: 1,
      difficulty: "O'rta",
      explanation: "Mash'ala - shuʼlasi bo'lgan yog'in yoqilg'i",
      points: 10,
    },
    {
      id: 8,
      q: "Kitoblarning to'plami (8 harf)",
      opts: ["Kutubxona", "Qutisi", "Polka", "Javon"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "Kutubxona - kitoblarning to'plamining joylashgan joy",
      points: 10,
    },
    {
      id: 9,
      q: "Bahor faslining oxiri (4 harf)",
      opts: ["Iyun", "May", "Aprel", "Mart"],
      correct: 1,
      difficulty: "Oson",
      explanation: "May - bahor faslining oxiri",
      points: 10,
    },
    {
      id: 10,
      q: "Olim kim ko'plab asboblar ixtiro qilgan (6 harf)",
      opts: ["Edisson", "Nyuton", "Gallilei", "Boyl"],
      correct: 0,
      difficulty: "Qiyin",
      explanation: "Edisson - ko'plab elektr asboblarini ixtiro qilgan",
      points: 10,
    },
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch(getApiUrl("/games/questions/krossword"));
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data.slice(0, 10));
      } else {
        setQuestions(MOCK_QUESTIONS);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setQuestions(MOCK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedAnswers(new Array(questions.length).fill(null));
  }, [questions]);

  const handleAnswer = (index: number) => {
    setSelectedAnswers(prev => {
      const updated = [...prev];
      updated[currentQuestion] = index;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
    } else {
      calculateScore();
      setAnswered(true);
    }
  };

  const calculateScore = () => {
    let total = 0;
    selectedAnswers.forEach((answer, idx) => {
      if (answer === questions[idx]?.correct) {
        total += questions[idx]?.points || 0;
      }
    });
    setScore(total);
  };

  const handleSubmit = () => {
    calculateScore();
    setAnswered(true);
  };

  if (loading) {
    return (
      <GameProLayout accentColor="cyan">
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
      </GameProLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <GameProLayout accentColor="white">
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-white">Savollar yuklanmadi</p>
      </div>
      </GameProLayout>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = selectedAnswers[currentQuestion];

  return (
    <GameProLayout accentColor="cyan">
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 game-pro-title">Krossword O'yini</h1>
          <p className="text-white/70">So'rov {currentQuestion + 1} / {questions.length}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div
              className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-white/60 text-center">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% % davomiylik
          </p>
        </div>

        {/* Question */}
        <div className="game-pro-card mb-6 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">{currentQ.q}</h2>
          <div className="space-y-3">
            {currentQ.opts.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 rounded-xl text-left font-semibold transition-all border-2 ${
                  currentAnswer === idx
                    ? "bg-cyan-500/30 text-white border-cyan-400"
                    : "bg-white/5 border-white/10 hover:border-cyan-500/50 text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-center mb-6">
          {!answered ? (
            <Button onClick={handleNext} className="game-pro-btn px-6 py-3 rounded-xl">
              {currentQuestion === questions.length - 1 ? "Natijani Ko'rish" : "Keyingi"}
            </Button>
          ) : (
            <Button onClick={() => { setCurrentQuestion(0); setSelectedAnswers(new Array(questions.length).fill(null)); setAnswered(false); setScore(0); }} className="game-pro-btn px-6 py-3 rounded-xl">
              Qayta Boshlash
            </Button>
          )}
        </div>

        {/* Results */}
        {answered && (
          <div className="game-pro-card p-6 rounded-2xl">
            <h3 className="text-center text-2xl font-bold text-white mb-6">✅ Natija</h3>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-cyan-400 mb-2" style={{ textShadow: "0 0 30px rgba(34,211,238,0.5)" }}>{score}</div>
                <p className="text-white/70">Jami balldan {score} ball to'plandiz</p>
              </div>

              {/* Detailed Results */}
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const answer = selectedAnswers[idx];
                  const isCorrect = answer === q.correct;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrect
                          ? "bg-emerald-500/20 border-emerald-400/50"
                          : "bg-red-500/20 border-red-400/50"
                      }`}
                    >
                      <p className="font-semibold text-white">{q.q}</p>
                      <p className="text-sm text-white/80 mt-1">
                        To'g'ri javob: {q.opts[q.correct]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-white/80">
                          Sizning javobingiz: {answer !== null ? q.opts[answer] : "Javob berilmadi"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        )}
      </div>
    </div>
    </GameProLayout>
  );
}
