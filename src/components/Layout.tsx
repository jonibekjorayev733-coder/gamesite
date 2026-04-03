import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Gamepad2, Trophy, Shield, LogOut, LogIn, User, Zap, Send, Instagram, Sun, Moon } from "lucide-react";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Bosh Sahifa", path: "/", icon: <Home className="w-5 h-5" /> },
    { label: "O'yinlar", path: "/games", icon: <Gamepad2 className="w-5 h-5" /> },
    { label: "Reytingi", path: "/leaderboard", icon: <Trophy className="w-5 h-5" /> },
    ...(user?.role === "admin" ? [{ label: "Admin", path: "/admin", icon: <Shield className="w-5 h-5" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <div className="mesh-bg" />
      {/* Premium Navigation — qora + oq shadow */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10" style={{ boxShadow: "0 0 40px -10px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300 opacity-60 group-hover:opacity-80" style={{ boxShadow: "0 0 30px rgba(255,255,255,0.2)" }} />
                <div className="relative bg-white/10 border border-white/20 rounded-lg p-2 group-hover:scale-110 transition-transform duration-300" style={{ boxShadow: "0 0 20px -5px rgba(255,255,255,0.2), inset 0 1px 0 0 rgba(255,255,255,0.1)" }}>
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-white font-display" style={{ textShadow: "0 0 30px rgba(255,255,255,0.2)" }}>
                  Interaktiv Ta'lim
                </h1>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Premium O'yinlar Platformasi</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-black text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>IT</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const getIcon = (path: string) => {
                  switch(path) {
                    case '/': return <Home className="w-4 h-4" />;
                    case '/games': return <Gamepad2 className="w-4 h-4" />;
                    case '/leaderboard': return <Trophy className="w-4 h-4" />;
                    case '/admin': return <Shield className="w-4 h-4" />;
                    default: return null;
                  }
                };
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive(item.path)
                        ? "bg-white/15 text-white border border-white/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                    style={isActive(item.path) ? { boxShadow: "0 0 25px -5px rgba(255,255,255,0.2), inset 0 1px 0 0 rgba(255,255,255,0.1)" } : undefined}
                  >
                    {getIcon(item.path)}
                    <span>{item.label}</span>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/60 rounded-full" style={{ boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {/* Theme Buttons - Light and Dark */}
              <div className="flex items-center gap-2">
                {/* Light Mode Button */}
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`p-2 rounded-lg transition-all duration-300 border ${
                    theme === 'light'
                      ? 'bg-yellow-400 text-yellow-900 border-yellow-500 scale-110'
                      : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/30 hover:border-slate-600/50'
                  }`}
                  title="Kungi rejim (Light Mode)"
                >
                  <Sun className="w-5 h-5" />
                </button>

                {/* Dark Mode Button */}
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`p-2 rounded-lg transition-all duration-300 border ${
                    theme === 'dark'
                      ? 'bg-purple-600 text-purple-100 border-purple-500 scale-110'
                      : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/30 hover:border-slate-600/50'
                  }`}
                  title="Tungi rejim (Dark Mode)"
                >
                  <Moon className="w-5 h-5" />
                </button>
              </div>

              {user ? (
                <>
                  <UserProfileDropdown userName={user.name} />
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <Button className="bg-white/15 hover:bg-white/25 text-white gap-2 rounded-lg font-semibold border border-white/20 transition-all duration-300 hover:scale-105" style={{ boxShadow: "0 0 25px -5px rgba(255,255,255,0.15)" }}>
                      <LogIn className="w-4 h-4" />
                      Kirish
                    </Button>
                  </Link>
                  <Link to="/register" className="hidden sm:block">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 rounded-lg font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                      Ro'yxatdan O'tish
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700/30 space-y-2 animate-in fade-in">
              {navItems.map((item) => {
                const getIcon = (path: string) => {
                  switch(path) {
                    case '/': return <Home className="w-4 h-4" />;
                    case '/games': return <Gamepad2 className="w-4 h-4" />;
                    case '/leaderboard': return <Trophy className="w-4 h-4" />;
                    case '/admin': return <Shield className="w-4 h-4" />;
                    default: return null;
                  }
                };
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white"
                        : "text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {getIcon(item.path)}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {!user && (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg font-semibold transition-all duration-300 bg-white/15 hover:bg-white/25 text-white border border-white/20">
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Kirish
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    Ro'yxatdan O'tish
                  </Link>
                </>
              )}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 flex items-center gap-2 justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Chiqish
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - padding uchun margin qo'shish */}
      <main className="pt-20">{children}</main>

      {/* Premium Footer — qora + oq shadow */}
      <footer className="relative bg-black/80 border-t border-white/10 mt-32 backdrop-blur-sm" style={{ boxShadow: "0 0 60px -20px rgba(255,255,255,0.05), inset 0 1px 0 0 rgba(255,255,255,0.03)" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Section */}
            <div className="col-span-1 lg:col-span-1 space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-lg blur-lg opacity-60" />
                  <div className="relative bg-white/10 border border-white/20 rounded-lg p-2" style={{ boxShadow: "0 0 20px -5px rgba(255,255,255,0.15)" }}>
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-lg text-white font-display" style={{ textShadow: "0 0 20px rgba(255,255,255,0.1)" }}>
                    Interaktiv Ta'lim
                  </h3>
                  <p className="text-xs text-slate-500">Premium Platform</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                O'quvchilar va o'qituvchilar uchun eng zamonaviy ta'lim platformasi.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Tez Havolalar</h4>
              <ul className="space-y-3">
                {[
                  { icon: <Home className="w-4 h-4" />, label: "Bosh Sahifa", href: "/" },
                  { icon: <Gamepad2 className="w-4 h-4" />, label: "O'yinlar", href: "/games" },
                  { icon: <Trophy className="w-4 h-4" />, label: "Reytingi", href: "/leaderboard" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                      {item.icon}
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Games */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Top O'yinlar</h4>
              <ul className="space-y-3">
                {[
                  "Baraban Metodi",
                  "So'z Qidiruv",
                  "Millioner O'yini",
                ].map((item) => (
                  <li key={item}>
                    <Link to="/games" className="text-slate-400 hover:text-white transition-colors duration-300 text-sm group">
                      <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Manbalar</h4>
              <ul className="space-y-3">
                {[
                  "Blog",
                  "FAQ",
                  "Qo'llanma",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 text-sm group">
                      <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Contact */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Ijtimoiy</h4>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <Send className="w-4 h-4" />, label: "Telegram", href: "https://t.me/intertalim_uz" },
                  { icon: <Instagram className="w-4 h-4" />, label: "Instagram", href: "https://instagram.com" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center gap-2 text-sm group"
                  >
                    {item.icon}
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="pt-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-500 mb-3">Yangiliklar uchun</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="flex-1 bg-slate-800/50 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                  <button className="bg-white/15 hover:bg-white/25 text-white border border-white/20 p-2 rounded-lg transition-all duration-300 hover:scale-105" style={{ boxShadow: "0 0 15px -5px rgba(255,255,255,0.15)" }}>
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/30 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <p className="text-slate-500 text-sm text-center md:text-left">
                © 2026 Interaktiv Ta'lim. Barcha huquqlar himoyalangan.
              </p>
              <div className="flex items-center justify-center md:justify-end gap-4 text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">
                  Shartlar
                </a>
                <span className="text-slate-700">•</span>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">
                  Maxfiylik
                </a>
                <span className="text-slate-700">•</span>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300">
                  Bog'lanish
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </footer>
    </div>
  );
}
