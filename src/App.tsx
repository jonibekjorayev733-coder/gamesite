import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Games from "@/pages/Games";
import Leaderboard from "@/pages/Leaderboard";
import PlayerProfile from "@/pages/PlayerProfile";
import NotFound from "@/pages/NotFound";
import TeacherAuth from "@/pages/TeacherAuth";
import TeacherPanelPro from "@/pages/TeacherPanelPro";
import TeacherDashboard from "@/pages/TeacherDashboard";
import BarabanGameV2 from "@/pages/games/BarabanGameV2";
import MillionaireGameV2 from "@/pages/games/MillionaireGameV2";
import WordSearchGameV2 from "@/pages/games/WordSearchGameV2";
import HiddenHourglassGameV2 from "@/pages/games/HiddenHourglassGameV2";
import DavlatniTopishGameV2 from "@/pages/games/DavlatniTopishGameV2";
import ShumodOyiniGameV2 from "@/pages/games/ShumodOyiniGameV2";
import KrosswordGame from "@/pages/games/KrosswordGame";
import ArqonTortishGame from "@/pages/games/ArqonTortishGame";
import BilimliOquvchi from "@/pages/games/BilimliOquvchi";
import TarixniQilishGame from "@/pages/games/TarixniQilishGame";
import TemurConquestGame from "@/pages/games/TemurConquestGame";
import TemurConquestGameV2 from "@/pages/games/TemurConquestGameV2";
import { Toaster } from "sonner";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/teacher/auth" element={<TeacherAuth />} />
            <Route path="/teacher/panel" element={<TeacherPanelPro />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/games" element={<Layout><Games /></Layout>} />
            <Route path="/games/baraban" element={<Layout><BarabanGameV2 /></Layout>} />
            <Route path="/games/millionaire" element={<Layout><MillionaireGameV2 /></Layout>} />
            <Route path="/games/word-search" element={<Layout><WordSearchGameV2 /></Layout>} />
            <Route path="/games/davlatni-topish" element={<Layout><DavlatniTopishGameV2 /></Layout>} />
            <Route path="/games/shumod" element={<Layout><ShumodOyiniGameV2 /></Layout>} />
            <Route path="/games/krossword" element={<Layout><KrosswordGame /></Layout>} />
            <Route path="/games/arqon-tortish" element={<Layout><ArqonTortishGame /></Layout>} />
            <Route path="/games/chempion" element={<Layout><BilimliOquvchi /></Layout>} />
            <Route path="/games/tarix" element={<Layout><TarixniQilishGame /></Layout>} />
            <Route path="/games/hidden-hourglass" element={<Layout><HiddenHourglassGameV2 /></Layout>} />
            <Route path="/games/temur-conquest" element={<Layout><TemurConquestGame /></Layout>} />
            <Route path="/games/temur-conquest-v2" element={<Layout><TemurConquestGameV2 /></Layout>} />
            <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
            <Route path="/profile" element={<Layout><PlayerProfile /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
