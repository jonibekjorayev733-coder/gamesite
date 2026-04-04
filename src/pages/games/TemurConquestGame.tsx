import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import GameProLayout from '@/components/games/GameProLayout';
import { getApiUrl } from '@/api/client';

interface Question {
  id: number;
  title: string;
  question: string;
  options: string[];
  correct: number;
  context: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "TEST: CONQUER BAGHDAD",
    question: "QAYSI JANG AMIR TEMUR TOMONIDAN TURKIYA SULTONI BOYAZID I GA QARSHI G'ALABA QOZONILGAN?",
    options: ["Terek daryosi jangi", "Anqara jangi", "Kondurcha jangi", "Dehli jangi"],
    correct: 1,
    context: "Anqara jangi (Battle of Ankara) 1402-yilda Amir Temur Osmani Sultoni Boyazid I ni shikast berdi."
  },
  {
    id: 2,
    title: "TEST: SAMARKAND CONQUEST",
    question: "Amir Temur Samarqandni qachon o'z poytaxti qildi?",
    options: ["1369-yil", "1379-yil", "1389-yil", "1399-yil"],
    correct: 0,
    context: "Samarqand 1369-yilda Amir Temurning poytaxti bo'lgan va u shaharni yangiladi."
  },
  {
    id: 3,
    title: "TEST: DELHI CAMPAIGN",
    question: "Amir Temur Dehli qachon fath qildi?",
    options: ["1398-yil", "1400-yil", "1402-yil", "1405-yil"],
    correct: 0,
    context: "Dehli 1398-yilda Amir Temurning katta fuqarosini ko'ngli qutnib kettiradigan farqi-dangu kamolining ayolkishi bo'lgan."
  },
  {
    id: 4,
    title: "TEST: OTTOMAN EMPIRE",
    question: "Osmani imperiyasi Amir Temurdan oldin qachon tashkil topgan?",
    options: ["1299-yil", "1325-yil", "1350-yil", "1375-yil"],
    correct: 0,
    context: "Osmani imperiyasi 1299-yilda Othman Bay tomonidan tashkil topgan."
  },
  {
    id: 5,
    title: "TEST: TIMURID EMPIRE",
    question: "Timurid imperiyasi Amir Temurning o'limi keyin qachon tugadi?",
    options: ["1450-yil", "1505-yil", "1600-yil", "1700-yil"],
    correct: 1,
    context: "Timurid imperiyasi Amir Temurning o'limi keyin 1505-yilgacha davom etdi."
  }
];

interface Territory {
  id: string;
  name: string;
  empire: 'timurid' | 'ottoman' | 'goldenhorde';
  x: number;
  y: number;
}

const TERRITORIES: Territory[] = [
  { id: 'samarkand', name: 'Samarkand', empire: 'timurid', x: 60, y: 35 },
  { id: 'tabriz', name: 'Tabriz', empire: 'timurid', x: 45, y: 32 },
  { id: 'baghdad', name: 'Baghdad', empire: 'timurid', x: 50, y: 45 },
  { id: 'delhi', name: 'Delhi', empire: 'timurid', x: 65, y: 60 },
];

interface GameState {
  phase: 'menu' | 'map' | 'quiz' | 'result' | 'gameover';
  currentQuestion: number;
  score: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  totalQuestions: number;
}

export default function TemurConquestGame() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'menu',
    currentQuestion: 0,
    score: 0,
    selectedAnswer: null,
    isAnswered: false,
    totalQuestions: QUESTIONS.length
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>(QUESTIONS);

  // Fetch custom tests from backend
  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const response = await fetch(getApiUrl('/custom-tests/game/temur-conquest'));
        if (!response.ok) {
          throw new Error("Server ishlamayapti");
        }
        const customTests = await response.json();
        // Transform custom tests to Question format
        const transformedTests: Question[] = customTests.map((test: any, idx: number) => ({
          id: QUESTIONS.length + idx + 1,
          title: `TEST ${QUESTIONS.length + idx + 1}`,
          question: test.question,
          options: test.options,
          correct: test.correct_index,
          context: test.explanation || "Custom test"
        }));
        setAllQuestions([...QUESTIONS, ...transformedTests]);
        setGameState(prev => ({...prev, totalQuestions: QUESTIONS.length + transformedTests.length}));
        console.log("Custom tests loaded:", transformedTests.length);
      } catch (error) {
        console.error("Custom tests fetch error:", error);
        // Use default questions if fetch fails
        setAllQuestions(QUESTIONS);
        setGameState(prev => ({...prev, totalQuestions: QUESTIONS.length}));
      }
    };
    fetchCustomTests();
  }, []);

  const handleStartGame = () => {
    setGameState({
      phase: 'map',
      currentQuestion: 0,
      score: 0,
      selectedAnswer: null,
      isAnswered: false,
      totalQuestions: QUESTIONS.length
    });
  };

  const handleStartQuiz = () => {
    setGameState(prev => ({
      ...prev,
      phase: 'quiz'
    }));
  };

  const handleAnswerClick = (index: number) => {
    if (gameState.isAnswered) return;
    setGameState(prev => ({
      ...prev,
      selectedAnswer: index
    }));
  };

  const handleSubmitAnswer = () => {
    if (gameState.selectedAnswer === null) return;

    const currentQ = allQuestions[gameState.currentQuestion];
    const isCorrect = gameState.selectedAnswer === currentQ.correct;

    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      score: isCorrect ? prev.score + 10 : prev.score
    }));

    toast({
      title: isCorrect ? "✅ To'g'ri!" : "❌ Xato!",
      description: isCorrect ? "+10 ball" : "Noto'g'ri javob"
    });

    setTimeout(() => {
      if (gameState.currentQuestion < QUESTIONS.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          selectedAnswer: null,
          isAnswered: false,
          phase: 'map'
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'gameover'
        }));
      }
    }, 2000);
  };

  const handleGoHome = () => {
    navigate('/games');
  };

  // MENU SCREEN
  if (gameState.phase === 'menu') {
    return (
      <GameProLayout accentColor="amber">
      <div className="min-h-screen overflow-hidden flex items-center justify-center p-4 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-black to-orange-900 opacity-70"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-700 rounded-full mix-blend-screen blur-3xl opacity-40"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-700 rounded-full mix-blend-screen blur-3xl opacity-40"></div>
        </div>

        <Card className="relative z-10 w-full max-w-3xl bg-gradient-to-br from-amber-950 via-orange-950 to-yellow-950 border-4 border-yellow-600 rounded-3xl p-16 shadow-2xl backdrop-blur-xl">
          <div className="relative z-20">
            <div className="text-center mb-8">
              <div className="text-8xl font-black mb-4 drop-shadow-2xl">🗺️</div>
              <h1 className="text-7xl font-black mb-4 drop-shadow-2xl text-yellow-300">
                TEMUR'S CONQUEST
              </h1>
              <p className="text-2xl font-black text-orange-300 mb-2">
                ذرين السلطق - SULTAN OF EARTH
              </p>
              <div className="h-1.5 w-64 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 mx-auto rounded-full shadow-2xl"></div>
            </div>

            <div className="bg-gradient-to-br from-orange-900 via-yellow-900 to-amber-900 bg-opacity-40 border-3 border-yellow-500 rounded-3xl p-10 mb-10 backdrop-blur-sm">
              <p className="text-yellow-100 text-xl mb-8 font-bold leading-relaxed text-center">
                🏛️ <span className="text-yellow-300 font-black text-2xl">AMIR TEMURNING</span>
                <br />
                <span className="text-orange-200">IMPERIYASINI KEYIN BERING</span>
                <br />
                VA TARIXIY SAVOLLARIGA JAVOB BERING!
              </p>
              
              <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 bg-opacity-60 border-2 border-yellow-500 rounded-2xl p-6">
                  <p className="text-4xl font-black mb-3">🗺️</p>
                  <p className="text-sm text-yellow-100 font-black tracking-widest">INTERACTIVE MAP</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 bg-opacity-60 border-2 border-orange-500 rounded-2xl p-6">
                  <p className="text-4xl font-black mb-3">❓</p>
                  <p className="text-sm text-orange-100 font-black tracking-widest">5 SAVOL</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 bg-opacity-60 border-2 border-amber-500 rounded-2xl p-6">
                  <p className="text-4xl font-black mb-3">💎</p>
                  <p className="text-sm text-amber-100 font-black tracking-widest">50 BALL</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 border-l-4 border-yellow-300 rounded-xl p-5">
                <p className="text-yellow-100 text-base font-bold">
                  🎯 <span className="text-white">XARITADA SHAXARLARNI BOSING</span> → <span className="text-yellow-300 font-black">SAVOLGA JAVOB!</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-500 hover:via-orange-600 hover:to-red-700 text-white font-black py-8 text-3xl rounded-3xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest border-4 border-yellow-300"
              >
                ⚔️ O'YINNI BOSHLASH ⚔️
              </Button>

              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-100 font-bold py-4 text-lg rounded-2xl transition-all"
              >
                ← ORQAGA
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </GameProLayout>
    );
  }

  // MAP SCREEN
  if (gameState.phase === 'map') {
    return (
      <GameProLayout accentColor="amber">
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-20 backdrop-blur-xl bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-opacity-95 shadow-2xl border-b-4 border-yellow-500 p-8">
          <div className="flex justify-between items-center gap-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-3xl px-8 py-6 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest">💎 Ball</p>
              <p className="text-5xl font-black">{gameState.score}</p>
            </div>

            <div className="text-center flex-1">
              <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                🗺️ XARITA
              </h2>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-3xl px-8 py-6 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest">🎮 Savol</p>
              <p className="text-5xl font-black">{gameState.currentQuestion + 1}/{QUESTIONS.length}</p>
            </div>

            <Button onClick={handleGoHome} className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-black px-8 py-6 rounded-3xl shadow-2xl hover:scale-105 transition-all">
              ❌ Chiqish
            </Button>
          </div>
        </div>

        <div className="flex-1 relative z-10 flex items-center justify-center p-8">
          <Card className="w-full max-w-4xl bg-gradient-to-br from-white via-orange-50 to-yellow-50 border-4 border-yellow-600 rounded-3xl p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black bg-gradient-to-r from-orange-700 to-yellow-700 bg-clip-text text-transparent mb-4">
                TEMUR'S CONQUEST
              </h1>
              <p className="text-xl font-bold text-gray-700 mb-6">
                Xarita ustida shaxarlarni bosing va savollarga javob bering!
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-blue-200 via-green-100 to-yellow-200 rounded-2xl border-4 border-blue-400 h-96 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Map background */}
                <rect width="100" height="100" fill="#e8d4b8" />
                
                {/* Empire territories - simple colored regions */}
                <rect x="20" y="15" width="30" height="35" fill="#00d9ff" opacity="0.3" />
                <text x="35" y="35" fontSize="2" fontWeight="bold" textAnchor="middle" fill="#0066ff">TIMURID</text>
                
                <rect x="10" y="40" width="25" height="25" fill="#90ee90" opacity="0.3" />
                <text x="22" y="53" fontSize="1.5" fontWeight="bold" textAnchor="middle" fill="#228b22">OTTOMAN</text>
                
                <rect x="50" y="10" width="20" height="25" fill="#87ceeb" opacity="0.3" />
                <text x="60" y="23" fontSize="1.5" fontWeight="bold" textAnchor="middle" fill="#1e90ff">HORDE</text>

                {/* Cities */}
                {TERRITORIES.map((territory) => (
                  <g key={territory.id}>
                    <circle
                      cx={territory.x}
                      cy={territory.y}
                      r="3"
                      fill="#ffd700"
                      stroke="#ff8c00"
                      strokeWidth="0.5"
                    />
                    <text
                      x={territory.x}
                      y={territory.y + 7}
                      fontSize="1.8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#333"
                      className="pointer-events-none"
                    >
                      {territory.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Interactive city buttons */}
              <div className="absolute inset-0">
                {TERRITORIES.map((territory) => (
                  <button
                    key={territory.id}
                    onClick={handleStartQuiz}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${territory.x}%`, top: `${territory.y}%` }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-orange-600 shadow-lg hover:scale-125 transition-transform cursor-pointer flex items-center justify-center font-black text-lg hover:bg-yellow-300">
                        📍
                      </div>
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2 font-bold">
                        {territory.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-gray-700 font-bold mt-6">
              ⬆️ Xarita ustidagi shaxarlardan birini tanlang
            </p>
          </Card>
        </div>
      </div>
      </GameProLayout>
    );
  }

  // QUIZ SCREEN
  if (gameState.phase === 'quiz') {
    const currentQuestion = allQuestions[gameState.currentQuestion];

    return (
      <GameProLayout accentColor="purple">
      <div className="min-h-screen p-6 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8 backdrop-blur-xl bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-900 bg-opacity-95 p-8 rounded-3xl shadow-2xl border-4 border-purple-500">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-3xl px-8 py-4 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest">💎 Ball</p>
              <p className="text-4xl font-black">{gameState.score}</p>
            </div>

            <div className="text-center flex-1 px-6">
              <p className="text-4xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {currentQuestion.title}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-3xl px-8 py-4 shadow-2xl">
              <p className="text-xs font-black uppercase tracking-widest">🎮 Savol</p>
              <p className="text-4xl font-black">{gameState.currentQuestion + 1}/{QUESTIONS.length}</p>
            </div>

            <Button onClick={handleGoHome} className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-black px-8 py-4 rounded-3xl shadow-2xl hover:scale-105 transition-all">
              ❌ Chiqish
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border-4 border-purple-500 rounded-3xl p-12 mb-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-center bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-12 drop-shadow-lg">
              ❓ {currentQuestion.question}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = gameState.selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct;
                const isAnswered = gameState.isAnswered;
                
                let btnClass = 'bg-gradient-to-r from-gray-700 to-gray-600 border-purple-500 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg';
                
                if (isAnswered) {
                  if (isCorrect) {
                    btnClass = 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-700 text-white font-black shadow-2xl scale-105';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'bg-gradient-to-r from-red-500 to-pink-600 border-red-700 text-white font-black shadow-2xl';
                  } else {
                    btnClass = 'bg-gray-700 border-gray-600 text-gray-400 opacity-50';
                  }
                } else if (isSelected) {
                  btnClass = 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-700 text-white font-black shadow-2xl scale-102';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={isAnswered}
                    className={`w-full p-6 rounded-2xl font-bold text-xl transition-all text-left border-4 flex items-center gap-6 cursor-pointer ${btnClass}`}
                  >
                    <span className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="flex-1 font-semibold">{option}</span>
                    {isAnswered && isCorrect && <span className="text-4xl">✅</span>}
                    {isAnswered && isSelected && !isCorrect && <span className="text-4xl">❌</span>}
                  </button>
                );
              })}
            </div>

            {!gameState.isAnswered && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={gameState.selectedAnswer === null}
                className={`w-full py-6 text-2xl font-black rounded-3xl shadow-2xl hover:scale-105 transition-all uppercase ${
                  gameState.selectedAnswer !== null
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                ✅ Tekshirish
              </Button>
            )}
          </Card>

          {gameState.isAnswered && (
            <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border-4 border-purple-500 rounded-3xl p-8 shadow-2xl">
              <p className="text-lg font-bold text-purple-300">
                📚 <span className="text-yellow-300">Kontekst:</span>
              </p>
              <p className="text-white mt-4 leading-relaxed">
                {currentQuestion.context}
              </p>
            </Card>
          )}
        </div>
      </div>
      </GameProLayout>
    );
  }

  // GAMEOVER SCREEN
  if (gameState.phase === 'gameover') {
    const isPerfect = gameState.score === 50;
    const isGreat = gameState.score >= 40;
    const isGood = gameState.score >= 30;

    return (
      <GameProLayout accentColor="amber">
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-600 rounded-full mix-blend-screen blur-3xl opacity-30"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-600 rounded-full mix-blend-screen blur-3xl opacity-30"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <Card className={`bg-gradient-to-br ${
            isPerfect 
              ? 'from-yellow-200 via-amber-200 to-orange-200 border-4 border-yellow-600' 
              : isGreat
              ? 'from-green-200 via-emerald-200 to-teal-200 border-4 border-green-600'
              : isGood
              ? 'from-blue-200 via-cyan-200 to-sky-200 border-4 border-blue-600'
              : 'from-gray-200 via-slate-200 to-stone-200 border-4 border-gray-600'
          } rounded-3xl p-16 text-center shadow-2xl backdrop-blur-sm`}>
            
            <div className="mb-12 relative">
              <div className="text-9xl mb-6 inline-block drop-shadow-2xl">
                {isPerfect ? '🏆' : '⚔️'}
              </div>
              <h1 className={`text-6xl font-black bg-clip-text text-transparent mb-2 ${
                isPerfect ? 'bg-gradient-to-r from-yellow-700 to-orange-700' :
                isGreat ? 'bg-gradient-to-r from-green-700 to-teal-700' :
                isGood ? 'bg-gradient-to-r from-blue-700 to-sky-700' :
                'bg-gradient-to-r from-gray-700 to-stone-700'
              }`}>
                O'yin Tugadi!
              </h1>
            </div>

            <div className={`bg-gradient-to-br ${
              isPerfect ? 'from-yellow-300 to-amber-400' :
              isGreat ? 'from-green-300 to-teal-400' :
              isGood ? 'from-blue-300 to-sky-400' :
              'from-gray-300 to-stone-400'
            } border-4 ${
              isPerfect ? 'border-yellow-700' :
              isGreat ? 'border-green-700' :
              isGood ? 'border-blue-700' :
              'border-gray-700'
            } rounded-3xl p-10 mb-10 shadow-2xl`}>
              <p className="text-lg font-black mb-3 uppercase tracking-widest text-white drop-shadow-lg">🎯 Jami Ball</p>
              <p className="text-8xl font-black text-white mb-3 drop-shadow-lg">{gameState.score}</p>
              <p className="text-xl font-bold text-white drop-shadow-lg">50 maksimum</p>
            </div>

            <div className={`bg-gradient-to-r ${
              isPerfect ? 'from-yellow-100 to-orange-100 border-yellow-600' :
              isGreat ? 'from-green-100 to-teal-100 border-green-600' :
              isGood ? 'from-blue-100 to-sky-100 border-blue-600' :
              'from-gray-100 to-stone-100 border-gray-600'
            } border-4 rounded-3xl p-10 mb-12 shadow-xl`}>
              <p className={`text-3xl font-black drop-shadow-lg ${
                isPerfect ? 'text-yellow-900' :
                isGreat ? 'text-green-900' :
                isGood ? 'text-blue-900' :
                'text-gray-900'
              }`}>
                {isPerfect
                  ? "🌟 SEMPURNA! 5/5 TO'G'RI! 🌟"
                  : isGreat
                  ? "😊 Ajoyib natijai! Siz usta!"
                  : isGood
                  ? "👍 Yaxshi o'yin o'tdingiz!"
                  : "📚 Yana tarixni o'qib ko'ring!"}
              </p>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                onClick={handleStartGame}
                className={`flex-1 bg-gradient-to-r ${
                  isPerfect 
                    ? 'from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                    : 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                } text-white font-black py-6 text-xl rounded-3xl shadow-2xl hover:scale-105 transition-all uppercase`}
              >
                🔄 Qaytadan O'yna
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black py-6 text-xl rounded-3xl shadow-2xl hover:scale-105 transition-all uppercase"
              >
                🏠 Orqaga
              </Button>
            </div>

            <p className="text-sm font-bold text-gray-700 mt-8 tracking-wider">
              ✨ Amir Temurning tarixini bilib qoldingiz! ✨
            </p>
          </Card>
        </div>
      </div>
      </GameProLayout>
    );
  }

  return null;
}
