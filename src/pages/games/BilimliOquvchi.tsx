import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Gem, DollarSign } from "lucide-react";
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

interface CollectedCard {
  id: number;
  image: string;
  person: string;
  earnings: number;
}

type GameStage = "card-selection" | "answering" | "card-results" | "puzzle" | "final";

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    q: "O'zbekistonning poytaxti?",
    opts: ["Toshkent", "Samarqand", "Buxoro", "Farg'ona"],
    correct: 0,
    difficulty: "Oson",
    explanation: "Toshkent",
    points: 10,
  },
  {
    id: 2,
    q: "2 + 2 = ?",
    opts: ["3", "4", "5", "6"],
    correct: 1,
    difficulty: "Oson",
    explanation: "4",
    points: 10,
  },
  {
    id: 3,
    q: "Quyosh sistemasiga nechta sayyora?",
    opts: ["7", "8", "9", "10"],
    correct: 1,
    difficulty: "O'rta",
    explanation: "8",
    points: 15,
  },
  {
    id: 4,
    q: "Eng katta okeyan?",
    opts: ["Atlantika", "Hind", "Tinch", "Arktika"],
    correct: 2,
    difficulty: "Oson",
    explanation: "Tinch",
    points: 10,
  },
  {
    id: 5,
    q: "Prezident Mirziyoyev qachondan?",
    opts: ["2014", "2016", "2018", "2020"],
    correct: 1,
    difficulty: "O'rta",
    explanation: "2016",
    points: 15,
  },
];

const FAMOUS_FACES = [
  { id: 1, person: "Albert Einsteyn", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGQzgwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HrfCfh7A9C+GlEdhJMjAxYScgeSc4MCUnIGZvbnQtc2l6ZT0nMjAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9J3doaXRlJz5FaW5zdGVpbjwvdGV4dD48L3N2Zz4=" },
  { id: 2, person: "Mona Liza", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzY0OTZGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HqfCfh6Y9C+GlEdhJMjAxYScgeSc4MCUnIGZvbnQtc2l6ZT0nMjAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9J3doaXRlJz5Nb25hIExpc2E8L3RleHQ+PC9zdmc+"},
  { id: 3, person: "Steven Hawking", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGOTY2NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HqCovdGV4dD48dGV4dCB4PSc1MCUnIHk9JzgwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nd2hpdGUnPkhhd2tpbmc8L3RleHQ+PC9zdmc+" },
  { id: 4, person: "Marie Curie", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzY0RkY5NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+4pyWPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iODAlIiBmb250LXNpemU9IjIwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPSd3aGl0ZSc+TWFyaWU8L3RleHQ+PC9zdmc+" },
  { id: 5, person: "Leonardo da Vinci", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGRDBGNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HpjwvdGV4dD48dGV4dCB4PSc1MCUnIHk9JzgwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nd2hpdGUnPkRhIFZpbmNpPC90ZXh0Pjwvc3ZnPg==" },
  { id: 6, person: "Isaac Newton", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzk2NjRGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HsswvdGV4dD48dGV4dCB4PSc1MCUnIHk9JzgwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nd2hpdGUnPk5ld3RvbjwvdGV4dD48L3N2Zz4=" },
  { id: 7, person: "Charles Darwin", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzY0QzgrMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTAwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIj7wn4+OPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iODAlIiBmb250LXNpemU9IjIwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBmaWxsPSd3aGl0ZSc+RGFyd2luPC90ZXh0Pjwvc3ZnPg==" },
  { id: 8, person: "Nikola Tesla", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGRkY2NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjMzMzIj7inKs8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI4MCUiIGZvbnQtc2l6ZT0iMjAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9IiMzMzMnPlRlc2xhPC90ZXh0Pjwvc3ZnPg==" },
  { id: 9, person: "Galileo Galilei", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0Q4NjRGRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HnzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjgwJSIgZm9udC1zaXplPSIyMCcgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkdhbGlsZW88L3RleHQ+PC9zdmc+" },
  { id: 10, person: "Platon", image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGOTZDOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEwMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+8J+HmzwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjgwJSIgZm9udC1zaXplPSIyMCcgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPlBsYXRvbjwvdGV4dD48L3N2Zz4=" },
];

export default function BilimliOquvchi() {
  const [gameStage, setGameStage] = useState<GameStage>("card-selection");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Card Selection Stage
  const [availableCards, setAvailableCards] = useState<number[]>([...Array(20).keys()].map(i => i + 1));
  const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([]);
  
  // Answering Stage
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  
  // Puzzle Stage
  const [puzzleCards, setPuzzleCards] = useState<{ id: number; flipped: boolean; matched: boolean; image?: string; currentPosition?: number; correctPosition?: number }[]>([]);
  const [firstCard, setFirstCard] = useState<number | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("bilimliOquvchiGameState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setGameStage(state.gameStage || "card-selection");
        setQuestions(state.questions || []);
        setAvailableCards(state.availableCards || [...Array(20).keys()].map(i => i + 1));
        setCollectedCards(state.collectedCards || []);
        setCurrentQuestion(state.currentQuestion || 0);
        setSelectedCardId(state.selectedCardId || null);
        setIsFinished(state.isFinished || false);
        setLoading(false);
      } catch (error) {
        console.error("Saqlangan o'yin holatini yuklashda xato:", error);
        loadQuestions();
        initializePuzzle();
      }
    } else {
      loadQuestions();
      initializePuzzle();
    }
  }, []);

  useEffect(() => {
    const gameState = {
      gameStage,
      questions,
      availableCards,
      collectedCards,
      currentQuestion,
      selectedCardId,
      isFinished,
    };
    localStorage.setItem("bilimliOquvchiGameState", JSON.stringify(gameState));
  }, [gameStage, questions, availableCards, collectedCards, currentQuestion, selectedCardId, isFinished]);

  const [error, setError] = useState<string | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl("/api/game-tests/bilimli_oquvchi/questions?count=20"));
      if (!response.ok) {
        throw new Error(`Backend xatosi: HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data?.questions?.length) {
        setQuestions(data.questions);
        localStorage.setItem("bilimliOquvchiQuestions", JSON.stringify(data.questions));
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

  const initializePuzzle = () => {
    // Random rasm tanlash
    const randomFace = FAMOUS_FACES[Math.floor(Math.random() * FAMOUS_FACES.length)];
    
    // 10 ta puzzle piece (2 x 5 grid)
    const puzzlePieces = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      correctPosition: i,
      image: randomFace.image,
      row: Math.floor(i / 5),
      col: i % 5,
    }));
    
    // Pieces aralashib qo'yish
    const shuffledPieces = puzzlePieces.sort(() => Math.random() - 0.5);
    
    // Pieces state-ga o'rnatish
    setPuzzleCards(shuffledPieces.map((piece, index) => ({
      id: piece.id,
      flipped: false,
      matched: false,
      image: piece.image,
      currentPosition: index,
      correctPosition: piece.correctPosition,
    })));
  };

  const handleCardSelection = (cardId: number) => {
    // Immediately remove the card from available cards
    setAvailableCards(availableCards.filter(c => c !== cardId));
    setSelectedCardId(cardId);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setGameStage("answering");
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
  };

  const handleNextAfterAnswer = () => {
    if (!selectedCardId) return;
    
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct;
    
    // Har bir kartochka uchun faqat 1 ta test - javob berilgandan keyin darhol natijaga o'tish
    if (isCorrect) {
      // Kartochka qo'lga kirdi
      const newCard: CollectedCard = {
        id: selectedCardId,
        image: FAMOUS_FACES[selectedCardId % FAMOUS_FACES.length].image,
        person: FAMOUS_FACES[selectedCardId % FAMOUS_FACES.length].person,
        earnings: 0,
      };
      setCollectedCards([...collectedCards, newCard]);
      setGameStage("card-results");
    } else {
      // Xato - kartochka yo'q
      setGameStage("card-results");
    }
  };

  const handleContinueAfterCards = () => {
    if (availableCards.length > 0) {
      // Go back to card selection if there are more cards available
      setGameStage("card-selection");
      setSelectedCardId(null);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // All cards selected, go to puzzle stage
      setGameStage("puzzle");
      initializePuzzle();
    }
  };

  const finishGame = () => {
    localStorage.removeItem("bilimliOquvchiGameState");
    localStorage.removeItem("bilimliOquvchiQuestions");
    setIsFinished(true);
  };

  const restartGame = () => {
    localStorage.removeItem("bilimliOquvchiGameState");
    localStorage.removeItem("bilimliOquvchiQuestions");
    setGameStage("card-selection");
    setAvailableCards([...Array(20).keys()].map(i => i + 1));
    setCollectedCards([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setSelectedCardId(null);
    setIsFinished(false);
    setEarnings(0);
    loadQuestions();
  };

  const handlePuzzleCardClick = (index: number) => {
    // Jigsaw puzzle - piece ni o'rniga qo'yish
    if (puzzleCards[index].currentPosition === puzzleCards[index].correctPosition) {
      // Piece allaqachon to'g'ri o'rinda
      return;
    }
    
    if (firstCard === null) {
      // Birinchi piece tanlash
      setFirstCard(index);
    } else if (firstCard === index) {
      // Xuddi shunga qayta boysiz - cancel
      setFirstCard(null);
    } else {
      // Ikkinchi piece tanlash - ularni almashish
      const newCards = [...puzzleCards];
      const temp = newCards[firstCard].currentPosition;
      newCards[firstCard].currentPosition = newCards[index].currentPosition;
      newCards[index].currentPosition = temp;
      
      // Pieces o'rin almashadi
      const piece1 = newCards[firstCard];
      const piece2 = newCards[index];
      
      // Array-da o'rin almashish
      newCards[firstCard] = piece2;
      newCards[index] = piece1;
      
      // To'g'ri o'rinda bo'lsa, matched qilish
      const updated = newCards.map(card => ({
        ...card,
        matched: card.currentPosition === card.correctPosition
      }));
      
      setPuzzleCards(updated);
      
      // To'g'ri o'rindagi pieces uchun pul qo'shish
      if (newCards[firstCard].currentPosition === newCards[firstCard].correctPosition) {
        setEarnings(earnings + 1);
      }
      if (newCards[index].currentPosition === newCards[index].correctPosition) {
        setEarnings(earnings + 1);
      }
      
      setFirstCard(null);
    }
  };

  const handleFinish = () => {
    const updatedCards = collectedCards.map(card => ({
      ...card,
      earnings: earnings / (collectedCards.length || 1),
    }));
    setCollectedCards(updatedCards);
    setGameStage("final");
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

  if (error) {
    return (
      <GameProLayout accentColor="white">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="game-pro-card p-8 max-w-md text-center">
          <CardContent className="pt-8 text-center">
            <p className="text-xl text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="game-pro-btn w-full py-4 rounded-xl">
              Qayta Urinish
            </Button>
            </CardContent>
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Card Selection Stage
  if (gameStage === "card-selection") {
    return (
      <GameProLayout accentColor="cyan">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Gem className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-bold text-cyan-400">Bilimli O'quvchi</h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={restartGame}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Qayta Boshlash
              </Button>
              <Button
                onClick={finishGame}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                O'yinni Tugatish
              </Button>
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="text-lg text-cyan-300 mb-2">20ta kartochkadan birini tanlang va testni yeching!</p>
            <div className="inline-block bg-slate-900/60 border border-cyan-500/30 rounded-lg px-6 py-3">
              <p className="text-2xl font-bold text-cyan-400">
                🎁 Qo'lga kirtirilgan: {collectedCards.length}/20
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[...Array(20)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handleCardSelection(i + 1)}
                disabled={!availableCards.includes(i + 1)}
                className={`h-24 rounded-lg font-bold text-2xl transition-all transform hover:scale-105 ${
                  !availableCards.includes(i + 1)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-br from-purple-400 to-pink-500 hover:shadow-lg text-white cursor-pointer"
                }`}
              >
                {availableCards.includes(i + 1) ? i + 1 : "✓"}
              </button>
            ))}
          </div>

          <div className="text-center bg-white p-6 rounded-lg shadow-lg">
            <p className="text-2xl font-bold text-purple-600 mb-2">
              🎁 Qo'lga kirtirilgan: {collectedCards.length}/20
            </p>
            <p className="text-gray-600">
              {collectedCards.length > 0 
                ? `Yana ${Math.max(0, 20 - collectedCards.length)} kartochka boshlang...` 
                : "Boshlanish uchun kartochka tanlang!"}
            </p>
          </div>
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Answering Stage
  if (gameStage === "answering" && questions.length > 0) {
    const currentQ = questions[currentQuestion % questions.length];
    return (
      <GameProLayout accentColor="cyan">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Gem className="w-6 h-6 text-cyan-400" />
                <h1 className="text-3xl font-bold text-cyan-400">Kartochka #{selectedCardId}</h1>
              </div>
              <div className="text-xl font-bold text-cyan-300">
                Test {currentQuestion + 1}/3
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={finishGame}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
              >
                O'yinni Tugatish
              </Button>
            </div>
          </div>

          <Card className="mb-6 border border-cyan-500/30 bg-slate-900/70">
            <CardHeader className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-500/20">
              <CardTitle className="text-xl text-cyan-300">{currentQ.q}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {currentQ.opts.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    className={`w-full p-4 rounded-lg font-semibold text-left transition-all ${
                      selectedAnswer === index
                        ? index === currentQ.correct
                          ? "bg-emerald-600 text-white border border-emerald-400"
                          : "bg-red-600 text-white border border-red-400"
                        : answered && index === currentQ.correct
                        ? "bg-emerald-600 text-white border border-emerald-400"
                        : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {answered && (
            <div className="text-center">
              <Button
                onClick={handleNextAfterAnswer}
                className={`px-8 py-3 text-lg font-bold ${
                  selectedAnswer === currentQ.correct
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
              >
                {selectedAnswer === currentQ.correct ? "To'g'ri! ✓ Davom Et" : "Xato! ✗ Davom Et"}
              </Button>
            </div>
          )}
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Card Results Stage
  if (gameStage === "card-results") {
    const cardCollected = collectedCards.some(c => c.id === selectedCardId);
    const remainingCards = availableCards.length;
    
    return (
      <GameProLayout accentColor="emerald">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen">
          {cardCollected ? (
            <div className="text-center">
              <p className="text-6xl mb-4">🎉</p>
              <h1 className="text-4xl font-bold text-emerald-400 mb-4">To'g'ri Javob!</h1>
              <p className="text-2xl text-white/90 mb-2">Kartochka qo'lga kirdi!</p>
              <div className="mb-8">
                <img 
                  src={FAMOUS_FACES[selectedCardId ? selectedCardId % FAMOUS_FACES.length : 0].image}
                  alt={FAMOUS_FACES[selectedCardId ? selectedCardId % FAMOUS_FACES.length : 0].person}
                  className="w-48 h-48 object-cover rounded-lg shadow-xl mx-auto border-4 border-emerald-400/80"
                />
                <p className="text-xl font-bold text-white mt-4">{FAMOUS_FACES[selectedCardId ? selectedCardId % FAMOUS_FACES.length : 0].person}</p>
              </div>
              
              <div className="game-pro-card mb-8 w-full">
                <div className="pt-6 px-6 pb-6">
                  <p className="text-xl font-bold text-white">
                    Qo'lga kirtirilgan: <span className="text-emerald-400">{collectedCards.length}</span>
                  </p>
                  <p className="text-lg text-white/80 mt-2">
                    Qolgan: <span className="text-cyan-400">{remainingCards}</span> ta kartochka
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                {remainingCards > 0 ? (
                  <Button
                    onClick={handleContinueAfterCards}
                    className="game-pro-btn"
                  >
                    Keyingi Kartochka
                  </Button>
                ) : (
                  <Button
                    onClick={() => { setGameStage("puzzle"); initializePuzzle(); }}
                    className="game-pro-btn"
                  >
                    Puzzle O'yiniga O'tish
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-6xl mb-4 text-red-400">✗</p>
              <h1 className="text-4xl font-bold text-red-400 mb-4">Xato Javob!</h1>
              <p className="text-2xl text-white/90 mb-8">Kartochka yo'q...</p>
              
              <div className="game-pro-card mb-8 w-full">
                <div className="pt-6 px-6 pb-6">
                  <p className="text-xl font-bold text-white">
                    Qo'lga kirtirilgan: <span className="text-emerald-400">{collectedCards.length}</span>
                  </p>
                  <p className="text-lg text-white/80 mt-2">
                    Qolgan: <span className="text-cyan-400">{remainingCards}</span> ta kartochka
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                {remainingCards > 0 ? (
                  <Button
                    onClick={handleContinueAfterCards}
                    className="game-pro-btn"
                  >
                    Keyingi Kartochka
                  </Button>
                ) : (
                  <Button
                    onClick={() => { setGameStage("puzzle"); initializePuzzle(); }}
                    className="game-pro-btn"
                  >
                    Puzzle O'yiniga O'tish
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Puzzle Stage
  if (gameStage === "puzzle") {
    const allMatched = puzzleCards.every(c => c.matched);
    const matchedCount = puzzleCards.filter(c => c.matched).length;
    
    return (
      <GameProLayout accentColor="purple">
      <div className="min-h-screen p-4">
        <style>{`
          .puzzle-piece {
            transition: all 0.3s ease;
            background-size: 500% 500%;
            position: relative;
            overflow: hidden;
          }
          
          /* Jigsaw Puzzle Shape - Knobs and Slots */
          .puzzle-piece::before {
            content: '';
            position: absolute;
            inset: 0;
            background: 
              /* Top edge knobs/slots */
              radial-gradient(circle at 25% -10px, transparent 12px, white 13px),
              radial-gradient(circle at 75% -10px, transparent 12px, white 13px),
              /* Bottom edge knobs/slots */
              radial-gradient(circle at 25% calc(100% + 10px), transparent 12px, white 13px),
              radial-gradient(circle at 75% calc(100% + 10px), transparent 12px, white 13px),
              /* Left edge knobs/slots */
              radial-gradient(circle at -10px 25%, transparent 12px, white 13px),
              radial-gradient(circle at -10px 75%, transparent 12px, white 13px),
              /* Right edge knobs/slots */
              radial-gradient(circle at calc(100% + 10px) 25%, transparent 12px, white 13px),
              radial-gradient(circle at calc(100% + 10px) 75%, transparent 12px, white 13px);
            pointer-events: none;
            mix-blend-mode: multiply;
          }
          
          .puzzle-piece {
            border-radius: 2px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .puzzle-piece:hover:not(.matched) {
            transform: scale(1.08) translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.5);
            cursor: pointer;
          }
          
          .puzzle-piece.matched {
            opacity: 0.6;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          }
          
          .puzzle-piece.selected {
            transform: scale(1.12) translateY(-6px);
            box-shadow: 0 0 25px rgba(251, 146, 60, 1), 0 8px 25px rgba(251, 146, 60, 0.6);
            z-index: 10;
          }
        `}</style>
        
        <div className="max-w-6xl mx-auto">
          <h1 className="game-pro-title text-center mb-2">🧩 Puzzle O'yini</h1>
          <p className="text-center text-white/90 font-semibold mb-1">Rasmning barcha bo'laklarini o'rniga qo'ying!</p>
          <p className="text-center text-white/70 mb-6">Bo'laklarni tanlang va o'rniga qo'ying</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Target Preview - Complete Image */}
            <div className="flex justify-center items-start">
              <div className="game-pro-card p-4">
                <p className="text-center text-sm font-semibold text-white/80 mb-3">✨ TO'LDIRILGAN RASM</p>
                {puzzleCards.length > 0 && puzzleCards[0].image && (
                  <div className="relative" style={{ width: "300px", height: "300px" }}>
                    {/* Background - Complete Image */}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${puzzleCards[0].image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "8px",
                        border: "4px solid #3b82f6",
                      }}
                    />
                    
                    {/* Overlay - Pieces Grid */}
                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-2 gap-0 rounded-lg overflow-hidden border-4 border-blue-400">
                      {Array.from({ length: 10 }).map((_, index) => {
                        const card = puzzleCards.find(c => c.correctPosition === index);
                        return (
                          <div
                            key={index}
                            className={`border border-blue-300 transition-opacity ${
                              card?.matched ? "opacity-0" : "opacity-100 bg-gray-400 bg-opacity-30"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="game-pro-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-8 h-8 text-purple-400" />
                <p className="text-3xl font-bold text-purple-400">Pul</p>
              </div>
              <p className="text-5xl font-bold text-purple-400 mb-6">${earnings}</p>
              
              <p className="text-lg font-semibold text-white/90 mb-3">✓ Taraqqiyot</p>
              <div className="w-full bg-white/10 rounded-full h-6 mb-4 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${(matchedCount / 10) * 100}%` }}
                />
              </div>
              <p className="text-center text-lg font-bold text-white">
                {matchedCount} / 10 bo'lak
              </p>
            </div>
          </div>
          
          {/* Puzzle Pieces - Scattered */}
          <div className="game-pro-card mb-8">
            <p className="text-center font-bold text-white mb-4 text-lg">🔀 Bo'laklarni Tanlang va O'rniga Qo'ying</p>
            <div className="grid grid-cols-5 gap-4">
              {puzzleCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handlePuzzleCardClick(index)}
                  disabled={card.matched}
                  className={`h-32 cursor-pointer puzzle-piece transition-all relative ${
                    card.matched ? "matched" : ""
                  } ${firstCard === index ? "selected" : ""}`}
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "500% 500%",
                    // Show the specific part of the image for this piece position
                    backgroundPosition: `${card.correctPosition ? (card.correctPosition % 5) * 20 : 0}% ${card.correctPosition !== undefined ? Math.floor(card.correctPosition / 5) * 50 : 0}%`,
                    pointerEvents: card.matched ? "none" : "auto",
                  }}
                  title={`Bo'lak ${card.id + 1}${card.matched ? " ✓" : ""}`}
                >
                  {card.matched && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-40 rounded-sm">
                      <span className="text-4xl font-bold text-green-500">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {allMatched && (
            <div className="text-center">
              <Button
                onClick={handleFinish}
                className="game-pro-btn"
              >
                Natijani Ko'rish
              </Button>
            </div>
          )}
        </div>
      </div>
      </GameProLayout>
    );
  }

  // Final Results Stage
  if (gameStage === "final") {
    return (
      <GameProLayout accentColor="amber">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-6xl mb-4">★</p>
            <h1 className="game-pro-title mb-4">Yakuniy Natija</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="game-pro-card">
              <div className="pt-6 pb-6 px-6 text-center">
                <p className="text-white/70 text-sm font-semibold mb-2">QOLGA KIRTIRILGAN</p>
                <p className="text-5xl font-bold text-purple-400">{collectedCards.length}</p>
                <p className="text-white/70 text-sm mt-2">kartochka</p>
              </div>
            </div>

            <div className="game-pro-card">
              <div className="pt-6 pb-6 px-6 text-center">
                <p className="text-white/70 text-sm font-semibold mb-2">TOPILGAN JUFTLIKLAR</p>
                <p className="text-5xl font-bold text-amber-400">{puzzleCards.filter(c => c.matched).length / 2}</p>
                <p className="text-white/70 text-sm mt-2">juftlik</p>
              </div>
            </div>

            <div className="game-pro-card">
              <div className="pt-6 pb-6 px-6 text-center">
                <p className="text-white/70 text-sm font-semibold mb-2">JAMI PUL</p>
                <p className="text-5xl font-bold text-emerald-400">${earnings}</p>
                <p className="text-white/70 text-sm mt-2">qazanildi</p>
              </div>
            </div>
          </div>

          <div className="game-pro-card mb-8">
            <div className="pt-8 pb-8 px-8 text-center">
              {earnings > 15 ? (
                <div>
                  <p className="text-5xl mb-4">🌟</p>
                  <p className="text-3xl font-bold text-white mb-2">Ajoyib Natija!</p>
                  <p className="text-xl text-white/90">${earnings} qazanildi!</p>
                </div>
              ) : earnings > 5 ? (
                <div>
                  <p className="text-5xl mb-4">👍</p>
                  <p className="text-3xl font-bold text-white mb-2">Yaxshi Natija!</p>
                  <p className="text-xl text-white/90">${earnings} qazanildi!</p>
                </div>
              ) : (
                <div>
                  <p className="text-5xl mb-4">💪</p>
                  <p className="text-3xl font-bold text-white mb-2">Qayta Urinib Ko'ring!</p>
                  <p className="text-xl text-white/90">${earnings} qazanildi!</p>
                </div>
              )}
            </div>
          </div>

          {collectedCards.length > 0 && (
            <div className="mb-8">
              <h2 className="game-pro-title text-center mb-6">Qo'lga Kirtirilgan Kartochkalar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {collectedCards.map((card, index) => (
                  <div key={index} className="game-pro-card overflow-hidden hover:scale-[1.02] transition-transform">
                    <div className="p-3">
                      <img 
                        src={card.image}
                        alt={card.person}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <p className="text-sm font-bold text-center text-white">{card.person}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={() => window.location.href = "/games"}
              className="game-pro-btn"
            >
              O'yinlarga Qaytish
            </Button>
          </div>
        </div>
      </div>
      </GameProLayout>
    );
  }

  return null;
}
