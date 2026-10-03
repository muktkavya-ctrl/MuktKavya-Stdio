import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Feather,
  Sparkles,
  BookOpen,
  PenTool,
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Crown,
  Bell,
  UserPlus,
  Globe,
  Check,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, selectedLang, setSelectedLang }) => {
  const {
    user,
    logout,
    isAdmin,
    isWriter,
    notifications,
    unreadCount,
    markAllNotificationsAsRead,
  } = useAuth();
  const { activeTheme, isDark, toggleTheme } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const regionalLanguages = [
    'All',
    'Hindi',
    'Urdu',
    'Bengali',
    'Gujarati',
    'Marathi',
    'English',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Sanskrit',
  ];

  return (
    <header className="head-nav-wrapper">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0 min-w-0"
        >
          <div className="navbar-brand-logo group-hover:scale-105 transition-transform shrink-0 w-8 h-8 sm:w-9 sm:h-9">
            <img
              src="/logo.png"
              alt="Mukt Kavya"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col shrink min-w-0">
            <span
              className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide font-['Rozha_One'] leading-none truncate ${
                isDark
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f5e7a9] to-[#d4af37]'
                  : 'text-stone-900'
              }`}
            >
              मुक्त काव्य
            </span>
          </div>
        </div>

        {/* Center Navigation Links in Sleek Pill Cluster (Desktop/Tablet >= 768px) */}
        <nav className="nav-pill-cluster hidden md:flex items-center shrink-0">
          <button
            onClick={() => setActiveTab('explore')}
            className={`nav-tab-link ${activeTab === 'explore' ? 'active' : ''}`}
            title="Explore Verses"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`nav-tab-link ${activeTab === 'daily' ? 'active' : ''}`}
            title="Verse of the Day"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily</span>
          </button>

          {/* Only shown after login */}
          {user && isWriter && (
            <button
              onClick={() => setActiveTab('studio')}
              className={`nav-tab-link ${activeTab === 'studio' ? 'active' : ''} animate-scale-pop`}
              title="Write & Compose Verses in Poet's Studio"
            >
              <PenTool className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Studio</span>
            </button>
          )}

          {/* Only shown after login */}
          {user && (
            <button
              onClick={() => setActiveTab('my-kavitas')}
              className={`nav-tab-link ${activeTab === 'my-kavitas' || activeTab === 'dashboard' ? 'active' : ''} animate-scale-pop`}
              title="My Kavitas (मेरी कविताएं) — Search, Edit, Hide/Show, Views & Diwan"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">My Kavitas</span>
            </button>
          )}

          {/* Only shown for admin */}
          {user && isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`nav-tab-link ${activeTab === 'admin' ? 'active' : ''} animate-scale-pop`}
              title="Super Admin Governance & Heritage Vault"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#ffd700]" />
              <span className="font-bold text-[#ffd700]">Admin</span>
            </button>
          )}
        </nav>

        {/* Right Section: Language, Theme & Profile Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
          {/* Custom Regional Language Selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border text-[11px] sm:text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                isDark
                  ? 'bg-slate-900/90 border-[#d4af37]/35 hover:border-[#ffd700] text-[#f5e7a9]'
                  : 'bg-white border-amber-900/25 hover:border-amber-600 text-stone-800'
              }`}
              title="Filter by Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <span className="font-medium whitespace-nowrap">
                <span className="hidden sm:inline">{selectedLang === 'All' ? 'Languages' : selectedLang}</span>
                <span className="sm:hidden">{selectedLang === 'All' ? 'Lang' : selectedLang.slice(0, 3)}</span>
              </span>
              <ChevronDown className="w-3 h-3 text-[#d4af37] opacity-70" />
            </button>

            {showLangMenu && (
              <div className="royal-dropdown-panel lang-menu animate-fade-in right-0 w-44">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                  Regional Languages
                </div>
                {regionalLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setShowLangMenu(false);
                    }}
                    className={`royal-dropdown-item ${selectedLang === lang ? 'active' : ''}`}
                  >
                    <span>{lang === 'All' ? '🌐 All Languages' : lang}</span>
                    {selectedLang === lang && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 1-Click Sleek Theme Toggle */}
          <div className="relative shrink-0">
            <button
              onClick={toggleTheme}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-slate-900/90 border-[#d4af37]/35 hover:border-[#ffd700] text-[#ffd700]'
                  : 'bg-white border-amber-900/25 hover:border-amber-600 text-amber-600'
              }`}
              title={`Switch Theme (Current: ${activeTheme === 'dark' ? 'Dark Mode' : 'Light Mode'})`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Notifications Bell */}
          {user && (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                  setShowLangMenu(false);
                  if (unreadCount > 0) markAllNotificationsAsRead();
                }}
                className={`relative p-1.5 sm:p-2 rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-[#d4af37]/35 hover:border-[#ffd700] text-[#d4af37]'
                    : 'bg-white border-amber-900/25 hover:border-amber-600 text-amber-700 shadow-sm'
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="royal-dropdown-panel notification-menu animate-fade-in right-0 w-72 sm:w-80">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-['Rozha_One']">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      सूचनाएँ (Notifications)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notifications.length} updates
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6 italic">
                      No notifications yet. Reader comments will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#d4af37] mb-1">
                            <span className="font-semibold">{n.type?.toUpperCase()}</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile Avatar or Guest Sign In */}
          {user ? (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                  setShowLangMenu(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 rounded-full border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border-[#d4af37]/35 hover:border-[#ffd700]'
                    : 'bg-white border-amber-900/25 hover:border-amber-600 shadow-sm'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#800020] to-[#d4af37] flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left pr-2">
                  <div className={`text-xs font-semibold flex items-center gap-1 leading-tight ${isDark ? 'text-slate-100' : 'text-stone-900'}`}>
                    <span>{user.name.split(' ')[0]}</span>
                    {user.role === 'superadmin' && <Crown className="w-3 h-3 text-[#d4af37]" />}
                  </div>
                  <div className="text-[9px] text-[#d4af37] uppercase tracking-wider font-semibold">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="royal-dropdown-panel user-menu animate-fade-in right-0 w-56">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-medium text-slate-200">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    {user.penName && (
                      <p className="text-[11px] text-[#d4af37] italic mt-0.5">
                        तख़ल्लुस: "{user.penName}"
                      </p>
                    )}
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#d4af37]/15 text-[#f5e7a9] border border-[#d4af37]/30">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    {isWriter && (
                      <button
                        onClick={() => {
                          setActiveTab('studio');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Studio (रचना)</span>
                      </button>
                    )}
                    {isWriter && (
                      <button
                        onClick={() => {
                          setActiveTab('my-kavitas');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>My Kavitas (मेरी कविताएं)</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-white/5 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setActiveTab('explore');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('login')}
                className={`whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5e7a9]'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-700/80 text-slate-200 hover:border-[#d4af37]'
                    : 'bg-white border-amber-900/25 text-stone-700 hover:border-amber-600 shadow-sm'
                }`}
                title="Sign In"
              >
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden xs:inline">Sign In</span>
                <span className="xs:hidden">Login</span>
              </button>

              <button
                onClick={() => setActiveTab('signup')}
                className={`btn-royal whitespace-nowrap shrink-0 text-xs py-1.5 px-2.5 sm:px-3.5 rounded-full flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-md font-semibold ${
                  activeTab === 'signup' ? 'ring-2 ring-[#ffd700]' : ''
                }`}
                title="Create a new account"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Sign Up</span>
                <span className="xs:hidden">Join</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
