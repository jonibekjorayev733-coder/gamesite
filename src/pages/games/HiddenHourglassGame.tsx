import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/api/client';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "O'zbekiston mustaqillik kuniga qanday nom berilgan?",
    options: ["Mustaqillik kunida", "Azodlik kunida", "Ozodlik kunida", "Erkinlik kunida"],
    correct: 0
  },
  {
    id: 2,
    question: "Tashkent shahar qaysi davlatda joylashgan?",
    options: ["Tojikiston", "O'zbekiston", "Qirg'iziston", "Turkmaniston"],
    correct: 1
  },
  {
    id: 3,
    question: "Samarqand shahar nechta asrdan beri mavjud?",
    options: ["1 asrdan", "3 asrdan", "5 asrdan", "8 asrdan"],
    correct: 2
  },
  {
    id: 4,
    question: "Amir Temur qaysi davlatni tuzgan?",
    options: ["Misrni", "Forsini", "Timuridlar imperiyasini", "Xitoyni"],
    correct: 2
  },
  {
    id: 5,
    question: "Buxoro qaysi davlatning eng qadimiy shaharlaridan biri?",
    options: ["Tojikiston", "O'zbekiston", "Afg'oniston", "Qirg'iziston"],
    correct: 1
  },
  {
    id: 6,
    question: "O'zbekiston qanday shaharning poytaxti?",
    options: ["Samarqand", "Buxoro", "Tashkent", "Xiva"],
    correct: 2
  },
  {
    id: 7,
    question: "Qaysi davlat O'zbekistonning shimolida joylashgan?",
    options: ["Tojikiston", "Qozog'iston", "Turkmaniston", "Afg'oniston"],
    correct: 1
  },
  {
    id: 8,
    question: "Jizzax shahar qaysi viloyatda joylashgan?",
    options: ["Tashkent", "Samarqand", "Jizzax", "Surxondarya"],
    correct: 2
  },
  {
    id: 9,
    question: "Andijon qaysi viloyatning markazidir?",
    options: ["Fergona", "Andijon", "Namangan", "Tashkent"],
    correct: 1
  },
  {
    id: 10,
    question: "O'zbekiston qanday bilan boy?",
    options: ["Gas va neft", "Oltin va kumush", "Tog'oq", "Barcha javoblar to'g'ri"],
    correct: 3
  }
];

interface GameState {
  phase: 'menu' | 'searching' | 'question' | 'gameover';
  roundNumber: number;
  score: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  foundHourglassIndex: number | null;
  hourglassPositions: number[];
  attempts: number;
  wrongClicks: number[];
}

export default function HiddenHourglassGame() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'menu',
    roundNumber: 1,
    score: 0,
    selectedAnswer: null,
    isAnswered: false,
    foundHourglassIndex: null,
    hourglassPositions: [],
    attempts: 2,
    wrongClicks: []
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>(QUESTIONS);

  // Fetch custom tests from backend
  useEffect(() => {
    const fetchCustomTests = async () => {
      try {
        const response = await fetch(getApiUrl('/custom-tests/game/hidden-hourglass'));
        if (!response.ok) {
          throw new Error("Server ishlamayapti");
        }
        const customTests = await response.json();
        // Transform custom tests to Question format
        const transformedTests: Question[] = customTests.map((test: any, idx: number) => ({
          id: QUESTIONS.length + idx + 1,
          question: test.question,
          options: test.options,
          correct: test.correct_index
        }));
        setAllQuestions([...QUESTIONS, ...transformedTests]);
        console.log("Custom tests loaded:", transformedTests.length);
      } catch (error) {
        console.error("Custom tests fetch error:", error);
        // Use default questions if fetch fails
        setAllQuestions(QUESTIONS);
      }
    };
    fetchCustomTests();
  }, []);

  // Qumsoatni tasodifiy joyda yashirish
  const generateHourglassPositions = () => {
    const positions = Array.from({ length: 5 }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions;
  };

  // Initialize Canvas for 2D buckets
  useEffect(() => {
    if (gameState.phase !== 'searching' || !canvasRef.current) return;

    // Clear previous canvas if exists
    if (canvasRef.current.firstChild) {
      canvasRef.current.removeChild(canvasRef.current.firstChild);
    }

    const canvas = document.createElement('canvas');
    const rect = canvasRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.display = 'block';
    canvasRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let hourglassAnimationTime = 0;
    const BUCKET_COUNT = 5;
    const BUCKET_WIDTH = 90;
    const BUCKET_HEIGHT = 130;
    const BUCKET_SPACING = 25;

    // Calculate bucket positions
    const totalWidth = BUCKET_COUNT * BUCKET_WIDTH + (BUCKET_COUNT - 1) * BUCKET_SPACING;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = canvas.height / 2 - 100;

    // Realistic bucket drawing with 3D effect
    const drawBucket = (x: number, y: number, isFound: boolean, isWrong: boolean) => {
      // Determine base color
      let baseColor = '#a0522d'; // brown
      if (isFound) baseColor = '#16a34a'; // green
      if (isWrong) baseColor = '#dc2626'; // red

      const bucketX = x + BUCKET_WIDTH / 2;
      const bucketY = y;
      const width = BUCKET_WIDTH - 20;
      const height = BUCKET_HEIGHT - 20;

      ctx.save();

      // Draw bucket body - trapezoid for 3D perspective
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(bucketX - width / 2, bucketY); // top left
      ctx.lineTo(bucketX + width / 2, bucketY); // top right
      ctx.lineTo(bucketX + width / 2 + 12, bucketY + height); // bottom right
      ctx.lineTo(bucketX - width / 2 - 12, bucketY + height); // bottom left
      ctx.closePath();
      ctx.fill();

      // Add shadow on right side for 3D effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.moveTo(bucketX + width / 2, bucketY);
      ctx.lineTo(bucketX + width / 2 + 12, bucketY + height);
      ctx.lineTo(bucketX + width / 2 + 8, bucketY + height - 10);
      ctx.lineTo(bucketX + width / 2 - 4, bucketY + 10);
      ctx.closePath();
      ctx.fill();

      // Add highlight on left side for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(bucketX - width / 2, bucketY);
      ctx.lineTo(bucketX - width / 2 - 12, bucketY + height);
      ctx.lineTo(bucketX - width / 2 - 8, bucketY + height - 10);
      ctx.lineTo(bucketX - width / 2 + 4, bucketY + 10);
      ctx.closePath();
      ctx.fill();

      // Draw bucket rim/handle area
      ctx.fillStyle = isWrong ? '#991b1b' : '#8b4513';
      ctx.beginPath();
      ctx.ellipse(bucketX, bucketY, width / 2 + 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bucketX, bucketY + 4, width / 2 + 2, Math.PI, 0);
      ctx.stroke();

      // Add sand inside bucket
      ctx.fillStyle = '#daa520';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(bucketX - width / 2 + 2, bucketY + height - 30);
      ctx.lineTo(bucketX + width / 2 + 8, bucketY + height - 30);
      ctx.lineTo(bucketX + width / 2 + 10, bucketY + height - 5);
      ctx.lineTo(bucketX - width / 2, bucketY + height - 5);
      ctx.closePath();
      ctx.fill();

      // Sand texture with wavy pattern
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const waveY = bucketY + height - 30 + (i * 6);
        ctx.beginPath();
        ctx.moveTo(bucketX - width / 2 + 5, waveY);
        ctx.quadraticCurveTo(bucketX, waveY + 2, bucketX + width / 2 + 5, waveY);
        ctx.stroke();
      }

      // Bucket outline for definition
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bucketX - width / 2, bucketY);
      ctx.lineTo(bucketX + width / 2, bucketY);
      ctx.lineTo(bucketX + width / 2 + 12, bucketY + height);
      ctx.lineTo(bucketX - width / 2 - 12, bucketY + height);
      ctx.closePath();
      ctx.stroke();

      // Add metallic bucket handle suggestion
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bucketX, bucketY - 5, width / 2 + 8, Math.PI * 0.3, Math.PI * 0.7);
      ctx.stroke();

      ctx.restore();
    };

    // Realistic hourglass animation
    const drawHourglassPopout = (x: number, y: number, popoutProgress: number) => {
      const size = 25;
      const popoutY = y - (popoutProgress * 60);
      const scale = 0.8 + popoutProgress * 0.2;
      const rotation = popoutProgress * 0.3;

      ctx.save();
      ctx.translate(x, popoutY);
      ctx.scale(scale, scale);
      ctx.rotate(rotation);

      // Glowing effect around hourglass
      ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Top chamber - glass effect
      ctx.fillStyle = '#f5deb3';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(-size / 2 - 3, -size / 2 - 5);
      ctx.lineTo(size / 2 + 3, -size / 2 - 5);
      ctx.lineTo(size / 2 + 1, -size / 3);
      ctx.lineTo(-size / 2 - 1, -size / 3);
      ctx.closePath();
      ctx.fill();

      // Top chamber outline
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Middle narrow section - sand flowing
      ctx.fillStyle = '#daa520';
      const sandFlow = Math.sin(popoutProgress * Math.PI) * 4 + 5;
      ctx.beginPath();
      ctx.moveTo(-3, -size / 3);
      ctx.lineTo(3, -size / 3);
      ctx.lineTo(size / 4, -size / 3 + sandFlow);
      ctx.lineTo(-size / 4, -size / 3 + sandFlow);
      ctx.closePath();
      ctx.fill();

      // Sand sparkles for effect
      ctx.fillStyle = '#ffd700';
      for (let i = 0; i < 3; i++) {
        const sparkleX = Math.sin(popoutProgress * Math.PI * 2 + i) * 3;
        const sparkleY = -size / 3 + sandFlow * 0.5 + i * 2;
        ctx.fillRect(sparkleX - 1, sparkleY, 2, 2);
      }

      // Bottom chamber - glass effect
      ctx.fillStyle = '#f5deb3';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(-size / 2 - 1, size / 3);
      ctx.lineTo(size / 2 + 1, size / 3);
      ctx.lineTo(size / 2 + 3, size / 2 + 5);
      ctx.lineTo(-size / 2 - 3, size / 2 + 5);
      ctx.closePath();
      ctx.fill();

      // Bottom chamber outline
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#8b6914';
      ctx.stroke();

      // Sand accumulating in bottom
      const accumulatedSand = popoutProgress * 10;
      ctx.fillStyle = '#daa520';
      ctx.beginPath();
      ctx.moveTo(-size / 2 + 2, size / 2 + 5);
      ctx.lineTo(size / 2 - 2, size / 2 + 5);
      ctx.lineTo(size / 2 - 2, size / 2 + 5 - accumulatedSand);
      ctx.lineTo(-size / 2 + 2, size / 2 + 5 - accumulatedSand);
      ctx.closePath();
      ctx.fill();

      // Hourglass shine/highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-size / 2 + 2, -size / 2 - 3);
      ctx.lineTo(-size / 2 - 1, size / 2 + 3);
      ctx.stroke();

      ctx.restore();
    };



    // Simple background - no gradient per frame
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw buckets once
    for (let i = 0; i < BUCKET_COUNT; i++) {
      const x = startX + i * (BUCKET_WIDTH + BUCKET_SPACING);
      const isFound = gameState.foundHourglassIndex === i;
      const isWrong = gameState.wrongClicks.includes(i);
      drawBucket(x, startY, isFound, isWrong);
    }

    // Only animate hourglass when found
    if (gameState.foundHourglassIndex !== null) {
      const animate = () => {
        if (hourglassAnimationTime >= 40) return; // Stop after animation

        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redraw all buckets
        for (let i = 0; i < BUCKET_COUNT; i++) {
          const x = startX + i * (BUCKET_WIDTH + BUCKET_SPACING);
          const isFound = gameState.foundHourglassIndex === i;
          const isWrong = gameState.wrongClicks.includes(i);
          drawBucket(x, startY, isFound, isWrong);
        }

        // Draw hourglass pop-out animation
        if (gameState.foundHourglassIndex !== null) {
          const i = gameState.foundHourglassIndex;
          const x = startX + i * (BUCKET_WIDTH + BUCKET_SPACING);
          const popoutProgress = Math.min(hourglassAnimationTime / 40, 1);
          drawHourglassPopout(x + BUCKET_WIDTH / 2, startY + BUCKET_HEIGHT - 30, popoutProgress);
        }

        hourglassAnimationTime++;
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }

    // Handle canvas click
    const handleCanvasClick = (event: MouseEvent) => {
      if (gameState.foundHourglassIndex !== null) return; // Already found
      if (gameState.attempts <= 0) return; // No more attempts

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for (let i = 0; i < BUCKET_COUNT; i++) {
        const x = startX + i * (BUCKET_WIDTH + BUCKET_SPACING);
        const y = startY;

        if (
          clickX >= x - 10 &&
          clickX <= x + BUCKET_WIDTH + 10 &&
          clickY >= y - 10 &&
          clickY <= y + BUCKET_HEIGHT + 20
        ) {
          handleClickBucket(i);
          break;
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Handle resize
    const handleResize = () => {
      const newRect = canvasRef.current?.getBoundingClientRect();
      if (newRect) {
        canvas.width = newRect.width;
        canvas.height = newRect.height;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      if (canvasRef.current && canvas.parentNode === canvasRef.current) {
        canvasRef.current.removeChild(canvas);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState.phase, gameState.foundHourglassIndex, gameState.wrongClicks]);

  const handleStartGame = () => {
    const positions = generateHourglassPositions();
    setGameState({
      phase: 'searching',
      roundNumber: 1,
      score: 0,
      selectedAnswer: null,
      isAnswered: false,
      foundHourglassIndex: null,
      hourglassPositions: positions,
      attempts: 2,
      wrongClicks: []
    });
  };

  const handleClickBucket = (index: number) => {
    if (gameState.foundHourglassIndex !== null) return;
    if (gameState.attempts <= 0) return;

    if (gameState.hourglassPositions[index] === 0) {
      // Qumsoat topildi!
      setGameState(prev => ({
        ...prev,
        foundHourglassIndex: index,
        phase: 'searching' // Stay in searching to show animation
      }));

      toast({
        title: "✅ TOPILDII!",
        description: "Qumsoatni topdingiz! Animatsiyani ko'ring...",
        duration: 3000
      });

      // After animation completes, go to question
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'question'
        }));
      }, 3000);
    } else {
      // Xato joy
      const newAttempts = gameState.attempts - 1;
      const newWrongClicks = [...gameState.wrongClicks, index];

      if (newAttempts <= 0) {
        // Game Over - no more attempts
        toast({
          title: "❌ Tugadi!",
          description: "Imkoniyatlar tugab ketdi. Qumsoatni topa olmadingiz.",
          variant: "destructive",
          duration: 3000
        });

        setTimeout(() => {
          if (gameState.roundNumber < QUESTIONS.length) {
            const newPositions = generateHourglassPositions();
            setGameState(prev => ({
              ...prev,
              roundNumber: prev.roundNumber + 1,
              selectedAnswer: null,
              isAnswered: false,
              foundHourglassIndex: null,
              phase: 'searching',
              hourglassPositions: newPositions,
              attempts: 2,
              wrongClicks: []
            }));
          } else {
            setGameState(prev => ({
              ...prev,
              phase: 'gameover'
            }));
          }
        }, 2000);
      } else {
        // Show wrong click feedback
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          wrongClicks: newWrongClicks
        }));

        toast({
          title: "❌ Bu yerda emas!",
          description: `Imkoniyat qoldi: ${newAttempts}`,
          variant: "destructive",
          duration: 2000
        });
      }
    }
  };

  const handleAnswerClick = (optionIndex: number) => {
    if (gameState.isAnswered) return;
    setGameState(prev => ({
      ...prev,
      selectedAnswer: optionIndex
    }));
  };

  const handleSubmitAnswer = () => {
    if (gameState.selectedAnswer === null) return;

    const currentQuestion = allQuestions[gameState.roundNumber - 1];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correct;

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
      if (gameState.roundNumber < QUESTIONS.length) {
        const newPositions = generateHourglassPositions();
        setGameState(prev => ({
          ...prev,
          roundNumber: prev.roundNumber + 1,
          selectedAnswer: null,
          isAnswered: false,
          foundHourglassIndex: null,
          phase: 'searching',
          hourglassPositions: newPositions
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'gameover'
        }));
      }
    }, 1500);
  };

  const handleGoHome = () => {
    navigate('/games');
  };

  // MENU SCREEN - EPIC INTRO
  if (gameState.phase === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-950 to-black overflow-hidden flex items-center justify-center p-4 relative">
        {/* MEGA Animated gradient background with multiple layers */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 opacity-70"></div>
          
          {/* Floating orbs - BIGGER and MORE GLOWING */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-yellow-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          
          {/* Extra shine/glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
          
          {/* Particle effects */}
          <div className="absolute w-full h-full pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.6 + 0.3,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Main card with EPIC styling */}
        <Card className="relative z-10 w-full max-w-3xl bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 border-4 border-pink-500 rounded-3xl p-16 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl opacity-20" style={{
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.5) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>

          <div className="relative z-20">
            {/* TITLE - MASSIVE AND ANIMATED */}
            <div className="text-center mb-8">
              <div className="inline-block relative mb-4">
                <h1 className="text-8xl font-black mb-4 drop-shadow-2xl" style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #8b5cf6 75%, #fbbf24 100%)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 8s ease infinite'
                }}>
                  🏺 QUMSOAT O'YINI 🏺
                </h1>
                
                {/* Animated underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-full shadow-2xl animate-pulse"></div>
              </div>
            </div>

            {/* Subtitle with multiple colors */}
            <p className="text-2xl text-center font-black tracking-widest mb-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              ✨ JO'NGJA OLAMIGA KIRISH ✨
            </p>
            <p className="text-center text-purple-200 font-bold mb-8 tracking-wider">
              QIZIQARLI VA CHIROYLI O'YIN DUNYOSIGA TAKLIF ETAMIZ
            </p>

            {/* Enhanced Description Box */}
            <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-pink-700 bg-opacity-30 border-3 border-pink-400 border-opacity-60 rounded-3xl p-10 mb-10 backdrop-blur-sm relative overflow-hidden">
              {/* Animated background shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-pulse" style={{ animationDuration: '3s' }}></div>
              
              <div className="relative z-10">
                <p className="text-purple-50 text-xl mb-8 font-bold leading-relaxed text-center">
                  🔮 <span className="text-yellow-300 font-black text-2xl">5 TA SU BO'CHKADA</span> YASHIRILGAN
                  <br />
                  <span className="text-yellow-200 font-black text-3xl">⏳ QUMSOAT ⏳</span>
                  <br />
                  NI TOPINGIZ!
                </p>
                
                {/* Stats Grid - ENHANCED */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 bg-opacity-40 border-2 border-blue-400 rounded-2xl p-6 transform hover:scale-110 transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] cursor-pointer">
                    <p className="text-5xl font-black mb-3">⏱️</p>
                    <p className="text-sm text-blue-100 font-black tracking-widest">2 IMKONIYAT</p>
                    <p className="text-xs text-blue-200 font-bold">har raund</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 bg-opacity-40 border-2 border-green-400 rounded-2xl p-6 transform hover:scale-110 transition-all hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] cursor-pointer">
                    <p className="text-5xl font-black mb-3">❓</p>
                    <p className="text-sm text-green-100 font-black tracking-widest">10 SAVOL</p>
                    <p className="text-xs text-green-200 font-bold">bilim sinovi</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-600 bg-opacity-40 border-2 border-yellow-400 rounded-2xl p-6 transform hover:scale-110 transition-all hover:shadow-[0_0_25px_rgba(234,179,8,0.7)] cursor-pointer">
                    <p className="text-5xl font-black mb-3">💎</p>
                    <p className="text-sm text-yellow-100 font-black tracking-widest">100 BALL</p>
                    <p className="text-xs text-yellow-200 font-bold">maksimum</p>
                  </div>
                </div>
                
                {/* Game Rules Box */}
                <div className="bg-gradient-to-r from-purple-900 to-pink-900 border-l-4 border-yellow-300 rounded-xl p-5 mb-2">
                  <p className="text-purple-50 text-base font-bold leading-relaxed">
                    🎯 <span className="text-white">TO'G'RI TOPGANIMIZDAN SO'NG</span>
                    <br />
                    <span className="text-green-300 font-black text-lg">→ SAVOLGA JAVOB BERING!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* START BUTTON - MASSIVE AND GLOWING */}
            <div className="space-y-4">
              <Button
                onClick={handleStartGame}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-700 text-white font-black py-8 px-6 text-4xl rounded-3xl shadow-2xl transform hover:scale-105 hover:shadow-[0_0_50px_rgba(251,191,36,0.9)] transition-all uppercase tracking-widest relative overflow-hidden border-4 border-yellow-300 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  🎮 O'YINNI BOSHLASH 🎮
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Button>

              <Button
                onClick={handleGoHome}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-100 font-bold py-4 px-6 text-lg rounded-2xl shadow-xl hover:shadow-[0_0_20px_rgba(100,100,100,0.5)] transition-all uppercase tracking-wider border-2 border-gray-600"
              >
                ← ORQAGA
              </Button>
            </div>

            {/* Bottom motivational message */}
            <div className="text-center mt-10">
              <p className="text-purple-300 text-sm font-black tracking-widest animate-bounce mb-2">
                ✨ HOZIR BOSHLANG VA O'Z IMKONIYATINGIZNI SINAB KO'RING ✨
              </p>
              <p className="text-pink-300 text-xs font-bold tracking-wider">
                💪 SIZ BUNI BAJARA OLASIZ! 💪
              </p>
              <p className="text-yellow-300 text-xs font-bold mt-2">
                🌟 BILIM DUNYOSIGA XUSH KELIBSIZ 🌟
              </p>
            </div>
          </div>
        </Card>

        {/* CSS Animations */}
        <style>{`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </div>
    );
  }

  // SEARCHING SCREEN - EPIC BUCKET HUNT
  if (gameState.phase === 'searching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-amber-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* TOP BAR - Epic Design */}
        <div className="relative z-20 backdrop-blur-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 shadow-2xl border-b-4 border-purple-500 p-8">
          <div className="flex justify-between items-center gap-6 max-w-7xl mx-auto">
            {/* Score - Glowing Card */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-green-300 to-emerald-500 text-white rounded-3xl px-8 py-6 shadow-2xl transform hover:scale-110 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all">
                <p className="text-xs font-black uppercase tracking-widest text-green-900">💎 Ball</p>
                <p className="text-5xl font-black drop-shadow-lg">{gameState.score}</p>
              </div>
            </div>

            {/* Attempts - Dynamic Color */}
            <div className={`rounded-3xl px-8 py-6 shadow-2xl transform hover:scale-110 transition-all font-black text-white transition-all ${
              gameState.attempts === 2 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]' 
                : gameState.attempts === 1
                ? 'bg-gradient-to-br from-orange-400 to-orange-600 animate-pulse hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                : 'bg-gradient-to-br from-red-400 to-red-600 animate-bounce hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
            }`}>
              <p className="text-xs font-black uppercase tracking-widest">🎯 Imkoniyat</p>
              <p className="text-5xl drop-shadow-lg">{gameState.attempts}</p>
            </div>

            {/* Title - Center Hero */}
            <div className="text-center flex-1 px-6">
              <h2 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2 animate-pulse drop-shadow-lg">
                🔍 QUMSOAT TOPSANG!
              </h2>
              <div className="h-1.5 w-48 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mx-auto rounded-full shadow-lg blur-sm"></div>
            </div>

            {/* Round - Glowing Card */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-3xl px-8 py-6 shadow-2xl transform hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all">
                <p className="text-xs font-black uppercase tracking-widest text-purple-900">🎮 Raund</p>
                <p className="text-5xl font-black drop-shadow-lg">{gameState.roundNumber}/10</p>
              </div>
            </div>

            {/* Exit Button */}
            <Button
              onClick={handleGoHome}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black px-8 py-6 rounded-3xl shadow-2xl transform hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all text-lg uppercase tracking-widest"
            >
              ❌ Chiqish
            </Button>
          </div>
        </div>

        {/* CANVAS - Bucket Game Area */}
        <div ref={canvasRef} className="flex-1 relative z-10" />

        {/* HOURGLASS FOUND - EPIC CELEBRATION */}
        {gameState.foundHourglassIndex !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Fireworks background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 opacity-30 animate-pulse"></div>
            
            <div className="text-center relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 -m-12 border-4 border-yellow-400 rounded-full animate-ping opacity-75"></div>
              
              {/* Main celebration box */}
              <div className="inline-block bg-gradient-to-br from-green-300 via-emerald-400 to-green-500 text-white px-20 py-12 rounded-4xl shadow-2xl border-4 border-green-200 animate-bounce transform scale-110 relative z-10">
                <p className="text-7xl font-black mb-4 drop-shadow-lg animate-pulse">✨ QUMSOAT TOPILDI! ✨</p>
                <div className="h-1.5 w-64 bg-white rounded-full mx-auto mb-4 shadow-lg"></div>
                <p className="text-3xl font-black text-green-900 drop-shadow-lg">🎉 Endi Savolga Javob Bering! 🎉</p>
              </div>

              {/* Floating emojis */}
              <div className="absolute top-10 left-20 text-5xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
              <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
              <div className="absolute bottom-10 left-10 text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</div>
              <div className="absolute bottom-20 right-10 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // QUESTION SCREEN - EPIC KNOWLEDGE BATTLE
  if (gameState.phase === 'question') {
    const currentQuestion = allQuestions[gameState.roundNumber - 1];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen blur-3xl opacity-15"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* TOP BAR - Epic Design */}
          <div className="flex justify-between items-center mb-8 backdrop-blur-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 p-8 rounded-3xl shadow-2xl border-4 border-purple-500">
            {/* Score */}
            <div className="bg-gradient-to-br from-green-300 to-emerald-500 text-white rounded-3xl px-8 py-4 shadow-2xl transform hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all">
              <p className="text-xs font-black uppercase tracking-widest">💎 Ball</p>
              <p className="text-4xl font-black drop-shadow-lg">{gameState.score}</p>
            </div>

            {/* Title - Center */}
            <div className="text-center flex-1 px-6">
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                🎯 Raund {gameState.roundNumber}/10
              </p>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
            </div>

            {/* Exit Button */}
            <Button
              onClick={handleGoHome}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black px-8 py-4 rounded-3xl shadow-2xl transform hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all uppercase tracking-widest"
            >
              ❌ Chiqish
            </Button>
          </div>

          {/* HOURGLASS ANIMATION - Glowing */}
          <div className="text-center mb-12 relative">
            <div className="inline-block text-9xl animate-bounce drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))' }}>⏳</div>
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mt-6 animate-pulse">
              ✨ Qumsoat Topildi! ✨
            </p>
          </div>

          {/* QUESTION CARD - EPIC Premium Design */}
          <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 border-4 border-purple-500 rounded-3xl p-12 mb-8 shadow-2xl backdrop-blur-sm">
            {/* Question with shadow */}
            <h2 className="text-4xl font-black text-center bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-12 drop-shadow-lg">
              ❓ {currentQuestion.question}
            </h2>

            {/* Answer Options - EPIC Styling */}
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
                    className={`
                      w-full p-6 rounded-2xl font-bold text-xl transition-all text-left
                      border-4 flex items-center gap-6 cursor-pointer
                      ${btnClass}
                    `}
                  >
                    <span className="text-4xl font-black min-w-fit bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <span className="flex-1 font-semibold">{option}</span>
                    {isAnswered && isCorrect && <span className="text-4xl animate-bounce">✅</span>}
                    {isAnswered && isSelected && !isCorrect && <span className="text-4xl animate-bounce">❌</span>}
                  </button>
                );
              })}
            </div>

            {/* Submit Button - EPIC */}
            {!gameState.isAnswered && (
              <Button
                onClick={handleSubmitAnswer}
                disabled={gameState.selectedAnswer === null}
                className={`w-full py-6 text-2xl font-black rounded-3xl shadow-2xl transform hover:scale-105 transition-all uppercase tracking-widest ${
                  gameState.selectedAnswer !== null
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.8)]'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-60'
                }`}
              >
                ✅ Tekshirish
              </Button>
            )}
          </Card>

          {/* FEEDBACK AFTER ANSWER - EPIC */}
          {gameState.isAnswered && (
            <div className="text-center relative">
              <div className="absolute -inset-4 blur-xl opacity-50 -z-10" style={{
                background: gameState.selectedAnswer === currentQuestion.correct 
                  ? 'linear-gradient(135deg, #22c55e, #10b981)' 
                  : 'linear-gradient(135deg, #ef4444, #ec4899)'
              }}></div>
              
              {gameState.selectedAnswer === currentQuestion.correct ? (
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-3xl p-10 shadow-2xl border-4 border-green-700 animate-bounce">
                  <p className="text-6xl font-black mb-3 drop-shadow-lg">✅ TO'G'RI!</p>
                  <p className="text-3xl font-black text-green-900 drop-shadow-lg">+10 Ball Olding! 🎉</p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-3xl p-10 shadow-2xl border-4 border-red-700">
                  <p className="text-6xl font-black mb-4 drop-shadow-lg">❌ XATO!</p>
                  <p className="text-xl font-bold text-red-900 drop-shadow-lg mb-2">To'g'ri javob:</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">{currentQuestion.options[currentQuestion.correct]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // GAMEOVER SCREEN
  if (gameState.phase === 'gameover') {
    const isPerfect = gameState.score === 100;
    const isGreat = gameState.score >= 80;
    const isGood = gameState.score >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-screen blur-3xl opacity-30"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-screen blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-amber-400 rounded-full mix-blend-screen blur-3xl opacity-25"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <Card className={`bg-gradient-to-br ${
            isPerfect 
              ? 'from-yellow-200 via-amber-200 to-orange-200 border-4 border-yellow-500' 
              : isGreat
              ? 'from-green-200 via-emerald-200 to-teal-200 border-4 border-green-500'
              : isGood
              ? 'from-blue-200 via-cyan-200 to-sky-200 border-4 border-blue-500'
              : 'from-gray-200 via-slate-200 to-stone-200 border-4 border-gray-500'
          } rounded-3xl p-16 text-center shadow-2xl backdrop-blur-sm`}>
            
            {/* Trophy Animation - EPIC */}
            <div className="mb-12 relative">
              <div className="text-9xl mb-6 animate-bounce inline-block drop-shadow-2xl" style={{ 
                filter: isPerfect ? 'drop-shadow(0 0 30px rgba(234, 179, 8, 0.8))' : 'drop-shadow(0 0 20px rgba(100,100,100,0.4))'
              }}>
                {isPerfect ? '🏆' : '🎮'}
              </div>
              <h1 className={`text-6xl font-black bg-clip-text text-transparent mb-2 ${
                isPerfect ? 'bg-gradient-to-r from-yellow-700 to-orange-700' :
                isGreat ? 'bg-gradient-to-r from-green-700 to-teal-700' :
                isGood ? 'bg-gradient-to-r from-blue-700 to-sky-700' :
                'bg-gradient-to-r from-gray-700 to-stone-700'
              }`}>
                O'yin Tugadi!
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full shadow-lg"></div>
            </div>

            {/* Score Card - MEGA GLOWING */}
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
              <p className="text-xl font-bold text-white drop-shadow-lg">100 maksimum</p>
            </div>

            <div className={`bg-gradient-to-r ${
              isPerfect ? 'from-yellow-100 to-orange-100 border-yellow-500' :
              isGreat ? 'from-green-100 to-teal-100 border-green-500' :
              isGood ? 'from-blue-100 to-sky-100 border-blue-500' :
              'from-gray-100 to-stone-100 border-gray-500'
            } border-4 rounded-3xl p-10 mb-12 shadow-xl`}>
              <p className={`text-3xl font-black drop-shadow-lg ${
                isPerfect ? 'text-yellow-900' :
                isGreat ? 'text-green-900' :
                isGood ? 'text-blue-900' :
                'text-gray-900'
              }`}>
                {isPerfect
                  ? "🌟 SEMPURNA! 10/10 TO'G'RI! 🌟"
                  : isGreat
                  ? "😊 Ajoyib natijai! Siz usta!"
                  : isGood
                  ? "👍 Yaxshi o'yin o'tdingiz!"
                  : "📚 Yana bilim qo'shing!"}
              </p>
            </div>

            {/* Buttons */}
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

            {/* Footer message */}
            <p className="text-sm font-bold text-gray-700 mt-8 tracking-wider">
              ✨ Shunosiz, siz o'zbekiston ta'limida istak! ✨
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
