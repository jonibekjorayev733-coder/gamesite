import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";

interface UserProfileDropdownProps {
  userName: string;
}

export default function UserProfileDropdown({ userName }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  // Get initials from user name
  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <span className="hidden sm:inline">{userName}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/5">
            <p className="text-sm text-slate-300">Logged in as</p>
            <p className="text-white font-semibold truncate">{userName}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span>Profil</span>
            </button>

            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Sozlamalar</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Logout */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
