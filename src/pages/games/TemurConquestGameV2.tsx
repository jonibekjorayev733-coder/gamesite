import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Home, Flag, Zap, Award } from 'lucide-react';
import GameProLayout from '@/components/games/GameProLayout';
import { getApiUrl } from '@/api/client';

interface Question {
  id: string;
  country: string;
  capital: string;
  question: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    id: 'delhi',
    country: 'Delhi',
    capital: 'Delhi',
    question: 'Temur 1398-yilda qaysi shaharni bosib oldi?',
    options: ['Delhi', 'Baghdad', 'Istanbul', 'Cairo'],
    correct: 0
  },
  {
    id: 'baghdad',
    country: 'Baghdad',
    capital: 'Baghdad',
    question: 'Temur 1401-yilda qaysi shaharni bosib oldi?',
    options: ['Delhi', 'Baghdad', 'Damascus', 'Istanbul'],
    correct: 1
  },
  {
    id: 'damascus',
    country: 'Damascus',
    capital: 'Damascus',
    question: 'Temur 1400-yilda qaysi shaharni bosib oldi?',
    options: ['Baghdad', 'Damascus', 'Cairo', 'Istanbul'],
    correct: 1
  },
  {
    id: 'ankara',
    country: 'Ankara',
    capital: 'Ankara',
    question: 'Temur 1402-yilda qaysi xonligning poytaxti Ankаrani bosib oldi?',
    options: ['Osman', 'Safaviy', 'Mog\'ullar', 'Sharq'],
    correct: 0
  },
  {
    id: 'samarkand',
    country: 'Samarkand',
    capital: 'Samarkand',
    question: 'Temurning paytaxti qaysi shahar edi?',
    options: ['Buxoro', 'Samarkand', 'Xiva', 'Tashkent'],
    correct: 1
  }
];

// Xarita koordinatalari - har bir davlat
const COUNTRY_POSITIONS = {
  delhi: { x: 75, y: 55, flag: '🇮🇳', name: 'Delhi', emoji: '🕌' },
  baghdad: { x: 45, y: 40, flag: '🇮🇶', name: 'Baghdad', emoji: '🕌' },
  damascus: { x: 40, y: 35, flag: '🇸🇾', name: 'Damascus', emoji: '🕌' },
  ankara: { x: 35, y: 30, flag: '🇹🇷', name: 'Ankara', emoji: '⚔️' },
  samarkand: { x: 50, y: 20, flag: '🇺🇿', name: 'Samarkand', emoji: '✨' }
};

interface GameState {
  phase: 'map' | 'question' | 'answer' | 'gameover' | 'victory';
  currentQuestion: number;
  score: number;
  conquered: string[];
  selectedAnswer: number | null;
  isAnswered: boolean;
}

export default function TemurConquestGameV2() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<GameState>({
    phase: 'map',
    currentQuestion: 0,
    score: 0,
    conquered: [],
    selectedAnswer: null,
    isAnswered: false
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>(QUESTIONS);

  // Fetch custom tests
  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const response = await fetch(getApiUrl('/custom-tests/game/temur-conquest'));
        if (!response.ok) {
          throw new Error("Server ishlamayapti");
        }
        const customTests = await response.json();
        const transformedTests: Question[] = customTests.map((test: any, idx: number) => ({
          id: `custom_${idx}`,
          country: test.question.split(' ')[0] || 'Custom',
          capital: test.question.split(' ')[0] || 'Custom',
          question: test.question,
          options: test.options,
          correct: test.correct_index
        }));
        setAllQuestions([...QUESTIONS, ...transformedTests]);
        console.log("Custom tests loaded:", transformedTests.length);
      } catch (error) {
        console.error("Custom tests fetch error:", error);
        setAllQuestions(QUESTIONS);
      }
    };
    fetchCustomTests();
  }, []);

  const currentQuestion = allQuestions[gameState.currentQuestion];

  const handleCountryClick = (countryId: string) => {
    if (gameState.conquered.includes(countryId)) {
      toast({
        title: "ℹ️ Allaqachon bosib olingan",
        description: "Bu davlat allaqachon bosib olingan!",
      });
      return;
    }

    // To'g'ri savol topshirish uchun davlatni bosib olish
    const matchingQuestion = allQuestions.find(
      q => q.id.toLowerCase() === countryId.toLowerCase()
    );

    if (matchingQuestion) {
      setGameState(prev => ({
        ...prev,
        phase: 'question',
        currentQuestion: allQuestions.indexOf(matchingQuestion),
        selectedAnswer: null,
        isAnswered: false
      }));
    } else {
      // Agar savol bo'lmasa, shunchaki bosib olingan deb belgilash
      setGameState(prev => ({
        ...prev,
        conquered: [...prev.conquered, countryId],
        score: prev.score + 100
      }));
      toast({
        title: "✅ Bosib olingan",
        description: "Davlat muvaffaqiyatli bosib olingan!",
      });
    }
  };

  const handleAnswer = (index: number) => {
    if (gameState.isAnswered) return;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: index,
      isAnswered: true
    }));

    if (index === currentQuestion.correct) {
      toast({
        title: "✅ To'g'ri!",
        description: "Javob to'g'ri! Davlatni bosib oldingiz!",
      });

      setTimeout(() => {
        const newConquered = [...gameState.conquered, currentQuestion.id];
        const newScore = gameState.score + 100;
        const isVictory = newConquered.length === allQuestions.length;

        setGameState(prev => ({
          ...prev,
          phase: isVictory ? 'victory' : 'map',
          conquered: newConquered,
          score: newScore,
          selectedAnswer: null,
          isAnswered: false
        }));
      }, 1500);
    } else {
      toast({
        title: "❌ Noto'g'ri",
        description: `To'g'ri javob: ${currentQuestion.options[currentQuestion.correct]}`,
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
      currentQuestion: 0,
      score: 0,
      conquered: [],
      selectedAnswer: null,
      isAnswered: false
    });
  };

  const handleHome = () => {
    navigate('/');
  };

  const playSound = (type: 'correct' | 'wrong' | 'click') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'wrong') {
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  return (
    <GameProLayout accentColor="cyan">
    <div className="min-h-screen flex flex-col">
      {/* Status Bar - iPhone style */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-slate-900 to-transparent border-b border-blue-500/20 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 drop-shadow-2xl">
                ⚔️ TEMUR'S EMPIRE
              </h1>
              <p className="text-cyan-200 font-bold text-sm mt-1 tracking-wider">
                Tarixni yaratib berish vaqti keldi
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-yellow-300">
                {gameState.score}
              </div>
              <div className="text-xs text-yellow-200 font-bold">BALL</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-blue-500/30">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${(gameState.conquered.length / allQuestions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-cyan-300 font-bold mt-2 text-center">
            {gameState.conquered.length} / {allQuestions.length} DAVLAT BOSIB OLINGAN
          </p>
        </div>
      </div>

      {/* Main Content */}
      {gameState.phase === 'map' && (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6">
          {/* LEFT: Info Panel */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-xl font-black text-blue-200 mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6" />
                BOSIB OLINGAN DAVLATLAR
              </h2>
              <div className="space-y-2">
                {allQuestions.map(q => {
                  const isConquered = gameState.conquered.includes(q.id);
                  const pos = COUNTRY_POSITIONS[q.id as keyof typeof COUNTRY_POSITIONS];
                  return (
                    <div 
                      key={q.id}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                        isConquered 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 border border-green-400/50 scale-105' 
                          : 'bg-slate-800/50 border border-slate-600/30 opacity-50'
                      }`}
                    >
                      <span className="text-2xl">{pos?.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{pos?.name}</p>
                      </div>
                      {isConquered && <span className="text-xl">✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl">
              <p className="text-sm text-purple-200 leading-relaxed">
                <span className="font-black text-lg block mb-2">📖 TARIH</span>
                Amir Temur 1370-1405 yillari o'zining kuchli imperiyasini yig'ib, Osiyaning ko'p qismi bo'ylab hukm surgan. Endi siz uning o'rnida davlatlarni bosib oling!
              </p>
            </div>
          </div>

          {/* RIGHT: Interactive Map */}
          <div className="w-full lg:w-2/3 flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl border-4 border-blue-400 shadow-2xl overflow-hidden group cursor-pointer">
              {/* SVG Xarita foni */}
              <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Asiya kontinenti */}
                <path d="M 0 20 Q 50 15 100 25 L 100 100 L 0 100 Z" fill="url(#oceanGradient)" opacity="0.5"/>
                <defs>
                  <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Davlatlar va bayroqlar */}
              {QUESTIONS.map((question) => {
                const isConquered = gameState.conquered.includes(question.id);
                const pos = COUNTRY_POSITIONS[question.id as keyof typeof COUNTRY_POSITIONS];

                return (
                  <button
                    key={question.id}
                    onClick={() => handleCountryClick(question.id)}
                    className="absolute group/btn transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    disabled={isConquered}
                  >
                    {/* Animated glow */}
                    {!isConquered && (
                      <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-2xl animate-pulse -translate-x-1/2 -translate-y-1/2 left-12 top-12"></div>
                    )}

                    {/* Country circle */}
                    <div
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 transition-all duration-300 shadow-2xl transform ${
                        isConquered
                          ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-700 border-green-300 scale-110 ring-4 ring-green-300/50'
                          : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border-blue-300 hover:scale-125 ring-2 ring-blue-400/50 hover:ring-4'
                      }`}
                    >
                      {pos.emoji}
                    </div>

                    {/* Bayroq animasiyasi */}
                    {isConquered && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 animate-bounce text-4xl drop-shadow-lg">
                        🚩
                      </div>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl opacity-0 group-hover/btn:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-blue-400/50 shadow-lg backdrop-blur-xl z-50">
                      <span>{pos.name}</span>
                      {isConquered && <span className="ml-2">✅ BOSIB OLINGAN</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Question Phase */}
      {gameState.phase === 'question' && currentQuestion && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Question Card */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-blue-400/50 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              {/* Country Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">
                  {COUNTRY_POSITIONS[currentQuestion.id as keyof typeof COUNTRY_POSITIONS]?.emoji}
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mb-2">
                  {COUNTRY_POSITIONS[currentQuestion.id as keyof typeof COUNTRY_POSITIONS]?.name}
                </h2>
                <p className="text-lg text-slate-300 font-bold border-b border-blue-400/30 pb-4">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={gameState.isAnswered}
                    className={`p-4 rounded-2xl font-bold text-base transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 ${
                      gameState.selectedAnswer === idx
                        ? idx === currentQuestion.correct
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-300 text-white scale-105 ring-4 ring-green-300/50'
                          : 'bg-gradient-to-r from-red-600 to-pink-600 border-red-300 text-white scale-105 ring-4 ring-red-300/50'
                        : gameState.isAnswered && idx === currentQuestion.correct
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-300 text-white'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-500 text-slate-100 hover:border-blue-400 hover:from-blue-600/20 hover:to-cyan-600/20'
                    } ${gameState.isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {gameState.isAnswered && (
                <div className="text-center">
                  {gameState.selectedAnswer === currentQuestion.correct ? (
                    <div className="text-center">
                      <p className="text-2xl font-black text-green-400 mb-2 animate-bounce">✅ TO'G'RI JAVOB!</p>
                      <p className="text-sm text-green-300">Davlat imperiyagе қҳилмоқда...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl font-black text-red-400 mb-2">❌ NOTO'G'RI</p>
                      <p className="text-sm text-red-300">To'g'ri javob: <span className="font-bold">{currentQuestion.options[currentQuestion.correct]}</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState.phase === 'gameover' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 border-2 border-red-500/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl text-center">
              <div className="text-7xl mb-6">💀</div>
              <h2 className="text-4xl font-black text-red-300 mb-4">GAME OVER</h2>
              <p className="text-xl font-bold text-red-100 mb-2">
                {gameState.conquered.length} davlatni bosib oldingiz
              </p>
              <p className="text-4xl font-black text-yellow-300 mb-8">
                {gameState.score} BALL
              </p>
              <Button
                onClick={handlePlayAgain}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black py-3 rounded-xl text-lg mb-3"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                QAYTA O'YNASH
              </Button>
              <Button
                onClick={handleHome}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-3 rounded-xl text-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                BOSH SAHIFA
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Victory */}
      {gameState.phase === 'victory' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-green-900/50 via-emerald-900/50 to-green-900/50 border-2 border-green-400/50 rounded-3xl p-12 backdrop-blur-xl shadow-2xl text-center">
              <div className="text-7xl mb-6 animate-bounce">🏆</div>
              <h2 className="text-4xl font-black text-green-300 mb-2">VICTORY!</h2>
              <p className="text-lg text-green-100 mb-2 font-bold">
                Temur imperiyasi to'liq qurildi!
              </p>
              <p className="text-lg text-green-100 mb-6 font-bold">
                Barcha {allQuestions.length} davlatni bosib oldingiz
              </p>
              <p className="text-5xl font-black text-yellow-300 mb-8">
                {gameState.score} BALL
              </p>
              <Button
                onClick={handlePlayAgain}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-3 rounded-xl text-lg mb-3"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                QAYTA O'YNASH
              </Button>
              <Button
                onClick={handleHome}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-black py-3 rounded-xl text-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                BOSH SAHIFA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </GameProLayout>
  );
}
