import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Volume2, RotateCw } from "lucide-react";
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

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"];

export default function BarabanGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(getApiUrl("/games/questions/baraban?difficulty=Oson"));
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data.slice(0, 10));
      } else {
        // Fallback mock data
        setQuestions(MOCK_QUESTIONS);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Fallback to mock data
      setQuestions(MOCK_QUESTIONS);
      setLoading(false);
    }
  };

  const MOCK_QUESTIONS: Question[] = [
    {
      id: 1,
      q: "O'simlik respiratsiyasi nima?",
      opts: ["Nafas olish", "Ovoz chiqarish", "Eng", "Harakat"],
      correct: 0,
      difficulty: "Oson",
      explanation: "O'simliklar ham nafas oladi, ular kislorod bilan CO2 almashshadi",
      points: 10,
    },
    {
      id: 2,
      q: "Quyosh sistemasiga nechta sayyora?",
      opts: ["7", "8", "9", "10"],
      correct: 1,
      difficulty: "Oson",
      explanation: "8 ta sayyora mavjud: Merkurii, Venera, Yer, Mars, Yupiter, Saturn, Uran, Neptun",
      points: 10,
    },
    {
      id: 3,
      q: "DNK qayerda joylashgan?",
      opts: ["Yadro", "Mitoxondriya", "Qo'lda", "Qon"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "DNK asosan yadrosida saqlanadi va biznin genetik ma'lumotni o'z ichiga oladi",
      points: 10,
    },
    {
      id: 4,
      q: "Eng katta okeyan?",
      opts: ["Tinch", "Atlantika", "Hind", "Arktika"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Tinch okeyan eng katta va chuqurligi bilan ham birinchi okeyan",
      points: 10,
    },
    {
      id: 5,
      q: "Agar A > B va B > C bo'lsa, A > C?",
      opts: ["Ha", "Yo'q", "Bilmayapman", "Hozir"],
      correct: 0,
      difficulty: "Oson",
      explanation: "Buni transitiv sifat deyiladi - agar A > B va B > C bo'lsa, A > C",
      points: 10,
    },
    {
      id: 6,
      q: "3² = ?",
      opts: ["6", "9", "12", "15"],
      correct: 1,
      difficulty: "Oson",
      explanation: "3 × 3 = 9 (3 ning kvadrati)",
      points: 10,
    },
    {
      id: 7,
      q: "Agar yilning 365 kun bo'lsa, haftasida nechta kun?",
      opts: ["5", "6", "7", "8"],
      correct: 2,
      difficulty: "Oson",
      explanation: "Haftasida 7 kun bor: Dushanba, Seshanba, Chorshanba, Payshanba, Juma, Shanba, Yakshanba",
      points: 10,
    },
    {
      id: 8,
      q: "Romb nechta burchagi bor?",
      opts: ["2", "3", "4", "5"],
      correct: 2,
      difficulty: "O'rta",
      explanation: "Romb - 4 ta burchagi bo'lgan paralelogramm",
      points: 10,
    },
    {
      id: 9,
      q: "Qaysi saharni hech tuzga almashtirish mumkin emas?",
      opts: ["Paskal", "Nyuton", "Joule", "Kelvin"],
      correct: 3,
      difficulty: "Qiyin",
      explanation: "Kelvin - harorat birligi, boshqalari kuch birliklari",
      points: 10,
    },
    {
      id: 10,
      q: "English so'zlaridan qaysi o'zbekchaga o'xshaydi?",
      opts: ["Water", "Book", "School", "Mother"],
      correct: 2,
      difficulty: "Oson",
      explanation: "School - Maktab kabi, aniqrog'i 'Maktab' eng yaqin ma'no",
      points: 10,
    },
  ];

  const spinWheel = () => {
    if (isSpinning || !questions.length) return;

    setIsSpinning(true);
    const randomRotation = Math.random() * 360 + 360 * 3;
    setRotation(prev => prev + randomRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedAnswer(null);
      setAnswered(false);
    }, 2000);
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    if (index === questions[currentQuestion].correct) {
      setScore(prev => prev + questions[currentQuestion].points);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  const question = questions[currentQuestion];
  const segmentAngle = 360 / 4;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RotateCw className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">Baraban Metodi</h1>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Savol: {currentQuestion + 1}/{questions.length}</span>
            <span className="text-yellow-400 font-bold">Ballari: {score}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Wheel */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-8">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <style>{`
                    .wheel { transition: transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                    .wheel.spinning { animation: spin 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
                    @keyframes spin { to { transform: rotate(1440deg); } }
                  `}</style>
                </defs>
                <g className={`wheel ${isSpinning ? "spinning" : ""}`} style={{ transform: `rotate(${rotation}deg)` }}>
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <path
                        d={`M 100,100 L ${100 + 80 * Math.cos((i * segmentAngle - 90) * Math.PI / 180)},${100 + 80 * Math.sin((i * segmentAngle - 90) * Math.PI / 180)} A 80,80 0 0,1 ${100 + 80 * Math.cos(((i + 1) * segmentAngle - 90) * Math.PI / 180)},${100 + 80 * Math.sin(((i + 1) * segmentAngle - 90) * Math.PI / 180)} Z`}
                        fill={COLORS[i]}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={100 + 50 * Math.cos((i * segmentAngle + segmentAngle / 2 - 90) * Math.PI / 180)}
                        y={100 + 50 * Math.sin((i * segmentAngle + segmentAngle / 2 - 90) * Math.PI / 180)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {String.fromCharCode(65 + i)}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-yellow-400"></div>
              </div>
            </div>
            <Button
              onClick={spinWheel}
              disabled={isSpinning || answered}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
            >
              {isSpinning ? "Aylanmoqda..." : "Barabanni Aylantir"}
            </Button>
          </div>

          {/* Question */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Savol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Volume2 className="w-5 h-5 text-blue-400 mt-1" />
                <p className="text-lg text-white">{question.q}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {question.opts.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    variant="outline"
                    className={`h-auto py-3 text-left transition-all ${
                      selectedAnswer === index
                        ? index === question.correct
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-red-600 border-red-600 text-white"
                        : answered && index === question.correct
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-slate-600 text-slate-300 hover:border-blue-500"
                    }`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}:</span>
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

              {answered && currentQuestion < questions.length - 1 && (
                <Button onClick={nextQuestion} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Keyingi Savol
                </Button>
              )}

              {answered && currentQuestion === questions.length - 1 && (
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <p className="text-xl text-white font-bold">O'yin Tugadi! 🎉</p>
                  <p className="text-yellow-400">Jami Ball: {score}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
