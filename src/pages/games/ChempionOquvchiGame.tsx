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

interface Player {
  id: number;
  name: string;
  score: number;
  isActive: boolean;
}

type GamePhase = "setup" | "playing" | "results";

export default function ChempionOquvchiGame() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "O'quvchi 1", score: 0, isActive: true },
    { id: 2, name: "O'quvchi 2", score: 0, isActive: true },
  ]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

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
      q: "2 × 5 = ?",
      opts: ["8", "10", "12", "15"],
      correct: 1,
      difficulty: "Oson",
      explanation: "10",
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
    {
      id: 6,
      q: "DNK qayerda joylashgan?",
      opts: ["Yadro", "Mitoxondriya", "Ribosom", "Xloroplast"],
      correct: 0,
      difficulty: "O'rta",
      explanation: "Yadro",
      points: 15,
    },
    {
      id: 7,
      q: "Samarqand qaysi asrda qurilgan?",
      opts: ["IV", "V", "VI", "VII"],
      correct: 2,
      difficulty: "O'rta",
      explanation: "VI asrda",
      points: 15,
    },
    {
      id: 8,
      q: "Eng tez hayvon?",
      opts: ["Jaguar", "Chita", "Dorian", "Eshak"],
      correct: 1,
      difficulty: "Oson",
      explanation: "Chita",
      points: 10,
    },
  ];

  useEffect(() => {
    if (gamePhase === "playing") {
      loadQuestions();
    }
  }, [gamePhase]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl("/games/questions/chempion"));
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data.slice(0, 8));
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

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        { id: players.length + 1, name: newPlayerName, score: 0, isActive: true },
      ]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (id: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const startTournament = () => {
    if (players.length >= 2) {
      setGamePhase("playing");
    }
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === questions[currentQuestion]?.correct;
    const points = questions[currentQuestion]?.points || 10;

    if (isCorrect) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIdx].score += points;
      setPlayers(updatedPlayers);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setGamePhase("results");
    }
  };

  const resetGame = () => {
    setGamePhase("setup");
    setCurrentQuestion(0);
    setCurrentPlayerIdx(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setPlayers(players.map(p => ({ ...p, score: 0 })));
  };

  // Setup Phase
  if (gamePhase === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card className="border-4 border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-3xl flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                Chempion O'quvchi Turniri
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <p className="text-gray-700 mb-6 font-semibold">
                O'yinchilikovni qo'shing (minimum 2 ta):
              </p>

              {/* Add Player */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="O'yinchi nomini kiriting..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                />
                <Button
                  onClick={addPlayer}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Qo'shish
                </Button>
              </div>

              {/* Players List */}
              <div className="space-y-2 mb-8">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300"
                  >
                    <span className="font-semibold">{player.name}</span>
                    <Button
                      onClick={() => removePlayer(player.id)}
                      size="sm"
                      variant="destructive"
                      disabled={players.length <= 2}
                      className="text-xs"
                    >
                      O'chirish
                    </Button>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Jami o'yinchilar: <span className="font-bold">{players.length}</span>
              </p>

              <Button
                onClick={startTournament}
                disabled={players.length < 2}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-lg font-bold"
              >
                ⚡ Turniringni Boshlash
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading Phase
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Turni yuklanganda...</p>
        </div>
      </div>
    );
  }

  // Playing Phase
  if (gamePhase === "playing") {
    const currentQuestion_obj = questions[currentQuestion];
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Leaderboard */}
          <Card className="mb-8 border-2 border-green-500">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-center">★ Reytingi</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                      player.id === players[currentPlayerIdx].id
                        ? "bg-blue-300 border-blue-600"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">#{idx + 1}</span>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <span className="font-bold text-lg">{player.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Player */}
          <Card className="mb-6 border-4 border-blue-500 bg-blue-50">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-gray-600 mb-2">Hozirgi O'yinchi:</p>
              <p className="text-3xl font-bold text-blue-700">
                {players[currentPlayerIdx].name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Savol {currentQuestion + 1} / {questions.length}
              </p>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="mb-6 border-2 border-green-400">
            <CardHeader className="bg-green-100">
              <CardTitle>{currentQuestion_obj?.q}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {currentQuestion_obj?.opts.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full p-4 rounded-lg font-semibold text-left transition-all border-2 ${
                      selectedAnswer === idx
                        ? idx === currentQuestion_obj?.correct
                          ? "bg-green-500 text-white border-green-600"
                          : "bg-red-500 text-white border-red-600"
                        : answered && idx === currentQuestion_obj?.correct
                        ? "bg-green-500 text-white border-green-600"
                        : "bg-white border-gray-300 hover:border-blue-500 text-gray-700 cursor-pointer"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          {answered && (
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-semibold"
              >
                {currentQuestion === questions.length - 1
                  ? "Natijani Ko'rish"
                  : "Keyingi Savol"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  if (gamePhase === "results") {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-red-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          {/* Winner Card */}
          <Card className="mb-8 border-4 border-yellow-500 bg-yellow-50">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-red-500 text-white">
              <CardTitle className="text-3xl text-center">★ CHEMPION!</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-2xl font-bold text-yellow-700 mb-4">{winner.name}</p>
              <div className="text-6xl font-bold text-red-600 mb-4">{winner.score}</div>
              <p className="text-gray-600">Jami ball</p>
            </CardContent>
          </Card>

          {/* Final Standings */}
          <Card className="mb-8 border-2 border-green-500">
            <CardHeader className="bg-green-100">
              <CardTitle className="text-center">📊 Yakuniy Reytingi</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                      idx === 0
                        ? "bg-yellow-100 border-yellow-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-2xl">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                      </span>
                      <span className="font-semibold text-lg">{player.name}</span>
                    </div>
                    <span className="font-bold text-xl">{player.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Button
            onClick={resetGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg rounded-lg font-bold"
          >
            ⚡ Yangi Turnir
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
