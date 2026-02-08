import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeSelector from "./ThemeSelector";
import SmartSearch from "./SmartSearch";
import NotificationBell from "./NotificationBell";

function TopBar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left Section - Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo for mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-lg font-semibold text-blue-700">
              NeuroTrace
            </span>
          </div>

          {/* Desktop: Collapse/Expand Sidebar Button */}
          <button
            onClick={onMenuClick}
            className="hidden md:block text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Smart Search */}
          <SmartSearch />

          {/* Theme Selector Button */}
          <button
            onClick={() => setShowThemeSelector(true)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Change theme"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* My Profile Button */}
          <button
            onClick={() => navigate(`/profile/${user?.id || user?._id}`)}
            className="hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-600 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Theme Selector Modal */}
        <ThemeSelector isOpen={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
      </div>
    </header>
  );
}

export default TopBar;
