import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/api/client";

interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
}

export default function AddTest() {
  const [testTitle, setTestTitle] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    } else {
      toast({
        title: "❌ Xato",
        description: "Kamida bir savol bo'lishi kerak",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = (
    id: string,
    field: "question" | "options" | "correctAnswer",
    value: any
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions as [string, string, string, string] };
        }
        return q;
      })
    );
  };

  const validateTest = () => {
    if (!testTitle.trim()) {
      toast({
        title: "❌ Xato",
        description: "Test sarlavhasini kiriting",
        variant: "destructive",
      });
      return false;
    }

    for (const q of questions) {
      if (!q.question.trim()) {
        toast({
          title: "❌ Xato",
          description: "Barcha savollarni kiriting",
          variant: "destructive",
        });
        return false;
      }

      if (q.options.some((opt) => !opt.trim())) {
        toast({
          title: "❌ Xato",
          description: "Barcha variantlarni kiriting",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveTest = async () => {
    if (!validateTest()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const teacherId = localStorage.getItem("teacherId");

      const testData = {
        title: testTitle,
        description: testDescription,
        teacher_id: teacherId,
        questions: questions.map((q) => ({
          question_text: q.question,
          options: q.options,
          correct_index: q.correctAnswer,
        })),
      };

      const response = await fetch(getApiUrl("/tests/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error("Test saqlashda xato");
      }

      toast({
        title: "✅ Muvaffaqiyat",
        description: "Test muvaffaqiyatli saqlandi!",
      });

      // Reset form
      setTestTitle("");
      setTestDescription("");
      setQuestions([
        {
          id: "1",
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ Xato",
        description: "Server bilan bog'lanishda xato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Info */}
      <Card className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 pb-6">
          <CardTitle className="text-2xl text-white">Test Ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Test Sarlavhasi *
            </label>
            <Input
              type="text"
              placeholder="Masalan: O'zbekiston Geografiyasi"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Tavsif (ixtiyoriy)
            </label>
            <textarea
              placeholder="Test haqida qisqacha ma'lumot..."
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/20 text-white placeholder:text-white/40 rounded-xl p-3 focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Savollar</h3>

        {questions.map((question, qIndex) => (
          <Card
            key={question.id}
            className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <CardHeader className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/80">
                  Savol {qIndex + 1}
                </CardTitle>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Savol Matni *
                </label>
                <Input
                  type="text"
                  placeholder="Savolingizni kiriting..."
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(question.id, "question", e.target.value)
                  }
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-white/80">
                  Javob Variantlari *
                </label>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-3">
                    <Input
                      type="text"
                      placeholder={`Variant ${String.fromCharCode(65 + oIndex)}`}
                      value={option}
                      onChange={(e) =>
                        updateOption(question.id, oIndex, e.target.value)
                      }
                      className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-cyan-500/50 focus:ring-cyan-500/30 shadow-lg"
                    />

                    {/* Radio Button for Correct Answer */}
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() =>
                          updateQuestion(question.id, "correctAnswer", oIndex)
                        }
                        className="w-4 h-4 accent-cyan-500"
                      />
                      <span className="text-xs text-white/60">
                        To'g'ri
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Button */}
      <Button
        onClick={addQuestion}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20"
      >
        <Plus className="w-5 h-5 mr-2" />
        Savol Qo'shish
      </Button>

      {/* Save Button */}
      <Button
        onClick={handleSaveTest}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/20 text-lg disabled:opacity-50"
      >
        <Save className="w-5 h-5 mr-2" />
        {loading ? "Saqlanyapti..." : "Testni Saqlash"}
      </Button>
    </div>
  );
}
