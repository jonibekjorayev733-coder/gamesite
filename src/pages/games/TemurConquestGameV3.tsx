import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Home, Volume2, MapPin } from 'lucide-react';
import { getApiUrl } from '@/api/client';

interface Question {
  id: string;
  city: string;
  question: string;
  options: string[];
  correct: number;
  year: string;
  description: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'delhi',
    city: 'Delhi',
    year: '1398',
    question: 'Temur 1398-yilda qaysi shaharni bosib oldi?',
    options: ['Delhi', 'Baghdad', 'Istanbul', 'Cairo'],
    correct: 0,
    description: 'Delhi - Hindiston poytaxti. Temur bu shaharni 1398-yilda bosib oldi va buyuk mol-mulk oldi.'
  },
  {
    id: 'aleppo',
    city: 'Aleppo (Xalabi)',
    year: '1400',
    question: '1400-yilda Temur qaysi shaharni bosib oldi?',
    options: ['Baghdad', 'Aleppo', 'Damascus', 'Istanbul'],
    correct: 1,
    description: 'Aleppo - Suriya shaharlaridan biri. Temur bunda buyuk zabit yig\'ib, Misrga hujum qilishning tayyyorlash qildi.'
  },
  {
    id: 'damascus',
    city: 'Damascus',
    year: '1400',
    question: 'Temur 1400-yilda qaysi shaharni bosib oldi?',
    options: ['Aleppo', 'Damascus', 'Baghdad', 'Istanbul'],
    correct: 1,
    description: 'Damascus - Suriya poytaxti. Temur bu shaharni bosib olganidan keyin uning boyligini oldi.'
  },
  {
    id: 'baghdad',
    city: 'Baghdad',
    year: '1401',
    question: 'Temur 1401-yilda qaysi shaharni bosib oldi?',
    options: ['Damascus', 'Baghdad', 'Istanbul', 'Cairo'],
    correct: 1,
    description: 'Baghdad - Fors xilofati paytaxti. Temur bu shaharni bosib olib, tarixdagi eng buyuk qushun bilan g\'alaba qozoni.'
  },
  {
    id: 'ankara',
    city: 'Ankara (Osman Imperiyasi)',
    year: '1402',
    question: 'Temur 1402-yilda qaysi davlatning poytaxtini bosib oldi?',
    options: ['Baghdad', 'Safaviy', 'Ankara (Osman)', 'Cairo'],
    correct: 2,
    description: 'Ankara - Osman imperiyasi poytaxti. Temur O\'smanni tugatdi va uning sultani Bayazidni asirlikka oldi.'
  },
  {
    id: 'samarkand',
    city: 'Samarkand',
    year: '1370',
    question: 'Temurning paytaxti va qalandari qaysi shahar edi?',
    options: ['Buxoro', 'Samarkand', 'Xiva', 'Tashkent'],
    correct: 1,
    description: 'Samarkand - O\'zbekistonning eng buyuk va eng go\'zal shahri. Temur bu yerdan butun dunyani bosib oldi.'
  }
];

interface GameState {
  phase: 'map' | 'question' | 'gameover' | 'victory';
  conquered: string[];
  score: number;
  currentQuestion: number | null;
  selectedAnswer: number | null;
  isAnswered: boolean;
}

// Xarita koordinatalari - SVG da
const COUNTRY_COORDS = {
  delhi: { x: 680, y: 380, emoji: '🇮🇳', name: 'Delhi' },
  aleppo: { x: 420, y: 280, emoji: '🕌', name: 'Aleppo' },
  damascus: { x: 410, y: 310, emoji: '🕌', name: 'Damascus' },
  baghdad: { x: 460, y: 300, emoji: '🏰', name: 'Baghdad' },
  ankara: { x: 350, y: 240, emoji: '🇹🇷', name: 'Ankara' },
  samarkand: { x: 520, y: 180, emoji: '🇺🇿', name: 'Samarkand' }
};

export default function TemurConquestGameV3() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>({
    phase: 'map',
    conquered: [],
    score: 0,
    currentQuestion: null,
    selectedAnswer: null,
    isAnswered: false
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>(QUESTIONS);

  // Fetch custom tests
  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const response = await fetch(getApiUrl('/custom-tests/game/temur-conquest'));
        if (!response.ok) throw new Error("Server ishlamayapti");
        const customTests = await response.json();
        const transformedTests: Question[] = customTests.map((test: any, idx: number) => ({
          id: `custom_${idx}`,
          city: test.question.split(' ')[0] || 'Custom',
          year: '1400',
          question: test.question,
          options: test.options,
          correct: test.correct_index,
          description: test.explanation || 'Custom test'
        }));
        setAllQuestions([...QUESTIONS, ...transformedTests]);
      } catch (error) {
        console.error("Custom tests error:", error);
        setAllQuestions(QUESTIONS);
      }
    };
    fetchCustomTests();
  }, []);

  const handleCityClick = (cityId: string) => {
    if (gameState.conquered.includes(cityId)) {
      toast({
        title: "ℹ️ Allaqachon bosib olingan",
        description: "Bu shahar allaqachon bosib olingan!",
      });
      return;
    }

    const matchingQuestion = allQuestions.find(q => q.id === cityId);
    if (matchingQuestion) {
      setGameState(prev => ({
        ...prev,
        phase: 'question',
        currentQuestion: allQuestions.indexOf(matchingQuestion),
        selectedAnswer: null,
        isAnswered: false
      }));
    }
  };

  const handleAnswer = (index: number) => {
    if (gameState.isAnswered) return;

    const currentQ = allQuestions[gameState.currentQuestion!];
    setGameState(prev => ({
      ...prev,
      selectedAnswer: index,
      isAnswered: true
    }));

    if (index === currentQ.correct) {
      toast({
        title: "✅ To'g'ri!",
        description: currentQ.description,
      });

      setTimeout(() => {
        const newConquered = [...gameState.conquered, currentQ.id];
        const isVictory = newConquered.length === allQuestions.length;

        setGameState(prev => ({
          ...prev,
          phase: isVictory ? 'victory' : 'map',
          conquered: newConquered,
          score: prev.score + 100,
          selectedAnswer: null,
          isAnswered: false,
          currentQuestion: null
        }));
      }, 2000);
    } else {
      toast({
        title: "❌ Noto'g'ri",
        description: `To'g'ri javob: ${currentQ.options[currentQ.correct]}`,
        variant: "destructive",
      });

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'gameover'
        }));
      }, 2000);
    }
  };

  const handlePlayAgain = () => {
    setGameState({
      phase: 'map',
      conquered: [],
      score: 0,
      currentQuestion: null,
      selectedAnswer: null,
      isAnswered: false
    });
  };

  const currentQuestion = gameState.currentQuestion !== null ? allQuestions[gameState.currentQuestion] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950 to-slate-950">
      {/* iPhone X Style Status Bar + Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-amber-600/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 drop-shadow-lg">
              ⚔️ TEMUR'S CONQUEST
            </h1>
            <p className="text-xs text-amber-200/70">Temur imperiyasini qur - {gameState.conquered.length}/{allQuestions.length} shahar bosib olingan</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-yellow-300">{gameState.score}</div>
            <div className="text-xs text-amber-200/70">Ball</div>
          </div>
        </div>
      </div>

      {gameState.phase === 'map' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          {/* SVG Xarita */}
          <div className="w-full max-w-2xl">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-auto"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%)',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                border: '3px solid rgba(217, 119, 6, 0.5)'
              }}
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Shaharlar */}
              {QUESTIONS.map((question) => {
                const coords = COUNTRY_COORDS[question.id as keyof typeof COUNTRY_COORDS];
                const isConquered = gameState.conquered.includes(question.id);

                return (
                  <g key={question.id}>
                    {/* Shahar doirasi */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isConquered ? 35 : 28}
                      fill={isConquered ? '#dc2626' : '#3b82f6'}
                      stroke={isConquered ? '#fbbf24' : '#1e40af'}
                      strokeWidth="3"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        filter: isConquered ? 'drop-shadow(0 0 12px #fbbf24)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      }}
                      onClick={() => handleCityClick(question.id)}
                      className="hover:opacity-80"
                    />

                    {/* Emoji */}
                    <text
                      x={coords.x}
                      y={coords.y + 8}
                      textAnchor="middle"
                      fontSize="24"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCityClick(question.id)}
                    >
                      {coords.emoji}
                    </text>

                    {/* Bayroq - bosib olinganlar uchun */}
                    {isConquered && (
                      <text
                        x={coords.x}
                        y={coords.y - 40}
                        fontSize="28"
                        style={{
                          animation: 'bounce 1s infinite',
                          textAnchor: 'middle'
                        }}
                      >
                        🚩
                      </text>
                    )}

                    {/* Shahar nomi */}
                    <text
                      x={coords.x}
                      y={coords.y + 55}
                      textAnchor="middle"
                      fontSize="12"
                      fill={isConquered ? '#fbbf24' : '#fff'}
                      fontWeight="bold"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                      {question.city} ({question.year})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Instructions Card */}
          <div className="mt-8 w-full max-w-2xl">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-6">
              <div className="space-y-3 text-sm">
                <p className="text-amber-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Xaritadagi shaharni bosing
                </p>
                <p className="text-amber-200 flex items-center gap-2">
                  <span>❓</span>
                  Savolga javob bering
                </p>
                <p className="text-amber-200 flex items-center gap-2">
                  <span>🚩</span>
                  To'g'ri javob bersan - bayroq chiqadi!
                </p>
              </div>
            </Card>
          </div>

          {/* Control Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handlePlayAgain}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Qayta
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Home className="w-4 h-4" />
              Bosh
            </Button>
          </div>
        </div>
      )}

      {gameState.phase === 'question' && currentQuestion && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-3xl p-8 shadow-2xl">
            {/* Shahar Sarlavhasi */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{COUNTRY_COORDS[currentQuestion.id as keyof typeof COUNTRY_COORDS]?.emoji}</div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 mb-2">
                {currentQuestion.city}
              </h2>
              <p className="text-amber-200/70 text-sm">{currentQuestion.year}-yil</p>
              <p className="text-slate-300 font-semibold mt-4 text-lg">{currentQuestion.question}</p>
            </div>

            {/* Javob Variantlari */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={gameState.isAnswered}
                  className={`w-full p-4 rounded-xl font-bold text-left transition-all duration-300 border-2 ${
                    gameState.selectedAnswer === idx
                      ? idx === currentQuestion.correct
                        ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-400 text-white scale-105'
                        : 'bg-gradient-to-r from-red-600 to-red-700 border-red-400 text-white scale-105'
                      : gameState.isAnswered && idx === currentQuestion.correct
                      ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-400 text-white'
                      : 'bg-slate-700/50 border-slate-600 text-slate-100 hover:bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="inline-flex items-center gap-3 w-full">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>

            {gameState.isAnswered && (
              <div className="text-center">
                {gameState.selectedAnswer === currentQuestion.correct ? (
                  <div>
                    <p className="text-green-400 font-bold text-lg mb-2">✅ To'g'ri!</p>
                    <p className="text-slate-300 text-sm">{currentQuestion.description}</p>
                  </div>
                ) : (
                  <p className="text-red-400 font-bold text-lg">❌ Noto'g'ri! Game Over</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {gameState.phase === 'gameover' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-gradient-to-br from-red-900 to-red-950 border-2 border-red-500/50 rounded-3xl p-12 shadow-2xl text-center">
            <div className="text-6xl mb-6">💀</div>
            <h2 className="text-4xl font-black text-red-300 mb-4">GAME OVER</h2>
            <p className="text-2xl font-bold text-red-100 mb-2">
              {gameState.conquered.length} shahar bosib oldingiz
            </p>
            <p className="text-3xl font-black text-yellow-300 mb-8">
              Ball: {gameState.score}
            </p>
            <Button
              onClick={handlePlayAgain}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 text-lg rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Qayta O'ynash
            </Button>
          </Card>
        </div>
      )}

      {gameState.phase === 'victory' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-gradient-to-br from-green-900 to-emerald-950 border-2 border-green-400/50 rounded-3xl p-12 shadow-2xl text-center">
            <div className="text-6xl mb-6 animate-bounce">🏆</div>
            <h2 className="text-4xl font-black text-green-300 mb-4">VICTORY!</h2>
            <p className="text-2xl font-bold text-green-100 mb-2">
              Temur imperiyasi to'liq qurildi!
            </p>
            <p className="text-lg text-green-100 mb-2">
              Barcha {allQuestions.length} shahar bosib oldingiz
            </p>
            <p className="text-3xl font-black text-yellow-300 mb-8">
              Jami Ball: {gameState.score}
            </p>
            <Button
              onClick={handlePlayAgain}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 text-lg rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Qayta O'ynash
            </Button>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
