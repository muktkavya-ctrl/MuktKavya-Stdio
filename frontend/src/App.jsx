import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DailyFeaturedCard } from './components/DailyFeaturedCard';
import { KavitaCard } from './components/KavitaCard';
import { PoemReaderModal } from './components/PoemReaderModal';
import { PoetStudio } from './components/PoetStudio';
import { PoetDashboard } from './components/PoetDashboard';
import { AdminPortal } from './components/AdminPortal';
import { AuthPage } from './components/AuthPage';
import { Footer } from './components/Footer';
import { api } from './services/api';
import {
  BookOpen,
  Filter,
  SlidersHorizontal,
  PenTool,
  Sparkles,
  RefreshCw,
  SearchX,
  Users,
  ChevronDown,
  Check,
  Layers,
  ShieldAlert,
  MapPin,
  Heart,
  Globe,
  Compass,
  X,
  User,
} from 'lucide-react';

export const INDIAN_REGIONS = [
  { id: 'delhi', name: 'Delhi / NCR', defaultLang: 'Hindi', flag: '🏛️', sub: 'हिंदी, उर्दू, English' },
  { id: 'bihar', name: 'Bihar & Purvanchal', defaultLang: 'Hindi', flag: '🌾', sub: 'भोजपुरी, मैथिली, हिंदी' },
  { id: 'up', name: 'Uttar Pradesh (Awadh/Braj)', defaultLang: 'Hindi', flag: '🛕', sub: 'हिंदी, उर्दू, अवधी' },
  { id: 'rajasthan', name: 'Rajasthan (Marwar/Mewar)', defaultLang: 'Hindi', flag: '🏰', sub: 'राजस्थानी, हिंदी' },
  { id: 'mp', name: 'Madhya Pradesh', defaultLang: 'Hindi', flag: '🐅', sub: 'मालवी, बुंदेली, हिंदी' },
  { id: 'maharashtra', name: 'Maharashtra (Mumbai/Pune)', defaultLang: 'Marathi', flag: '🌊', sub: 'मराठी, हिंदी' },
  { id: 'gujarat', name: 'Gujarat (Saurashtra)', defaultLang: 'Gujarati', flag: '🦁', sub: 'ગુજરાતી, હિન્દી' },
  { id: 'bengal', name: 'West Bengal (Kolkata)', defaultLang: 'Bengali', flag: '🎨', sub: 'বাংলা, English' },
  { id: 'punjab', name: 'Punjab', defaultLang: 'Hindi', flag: '🌾', sub: 'ਪੰਜਾਬੀ, हिंदी, اردو' },
  { id: 'all_india', name: 'Pan-India & Global', defaultLang: 'All', flag: '🌍', sub: 'All Classical Traditions' },
];

const MainApp = () => {
  const { user, isWriter, isAdmin, isSuperAdmin } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'daily', 'studio', 'dashboard', 'admin', 'login', 'signup'
  const [kavitas, setKavitas] = useState([]);
  const [dailyFeatured, setDailyFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  // Regional Geolocation & Feed Personalization State
  const [userRegion, setUserRegion] = useState(() => {
    return localStorage.getItem('mukt_user_region') || 'delhi';
  });
  const [feedCategory, setFeedCategory] = useState(() => {
    return localStorage.getItem('mukt_feed_category') || 'region'; // 'region', 'recommended', 'all', 'language'
  });
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Comprehensive protection against blank screen & smooth auth redirects:
  useEffect(() => {
    if (!user) {
      if (
        activeTab === 'admin' ||
        activeTab === 'dashboard' ||
        activeTab === 'studio' ||
        activeTab === 'my-kavitas'
      ) {
        setActiveTab('explore');
      }
    } else {
      if (activeTab === 'login' || activeTab === 'signup') {
        setActiveTab(isSuperAdmin ? 'admin' : 'explore');
      }
    }
  }, [user, isSuperAdmin, activeTab]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState(() => {
    const savedReg = localStorage.getItem('mukt_user_region') || 'delhi';
    const found = INDIAN_REGIONS.find((r) => r.id === savedReg);
    return found?.defaultLang || 'Hindi';
  });
  const [selectedRasa, setSelectedRasa] = useState('All');
  const [selectedForm, setSelectedForm] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterFollowingOnly, setFilterFollowingOnly] = useState(false);
  
  // Modals & Navigation
  const [readerPoem, setReaderPoem] = useState(null);
  const [editingPoem, setEditingPoem] = useState(null);

  // Fetch poems list with debounce or direct
  const fetchPoems = async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortBy,
        limit: 30,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      // Regional & Language intelligence
      if (feedCategory === 'region') {
        const currentReg = INDIAN_REGIONS.find((r) => r.id === userRegion) || INDIAN_REGIONS[0];
        if (currentReg.defaultLang !== 'All') {
          params.language = currentReg.defaultLang;
        }
      } else if (feedCategory === 'recommended') {
        params.sort = 'likes';
      } else if (selectedLang !== 'All') {
        params.language = selectedLang;
      }

      if (selectedRasa !== 'All') params.rasa = selectedRasa;
      if (selectedForm !== 'All') params.form = selectedForm;

      const [listRes, dailyRes] = await Promise.all([
        api.getKavitas(params),
        api.getDailyFeatured(),
      ]);

      if (listRes.success) {
        setKavitas(listRes.data);
      }
      if (dailyRes.success && dailyRes.data) {
        setDailyFeatured(dailyRes.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, [searchQuery, selectedLang, selectedRasa, selectedForm, sortBy, userRegion, feedCategory]);

  const handleSelectRegion = (regionId) => {
    setUserRegion(regionId);
    localStorage.setItem('mukt_user_region', regionId);
    setFeedCategory('region');
    localStorage.setItem('mukt_feed_category', 'region');
    const matched = INDIAN_REGIONS.find((r) => r.id === regionId);
    if (matched) {
      setSelectedLang(matched.defaultLang);
    }
    setShowRegionModal(false);
  };

  const handleSelectCategory = (cat, lang = null) => {
    setFeedCategory(cat);
    localStorage.setItem('mukt_feed_category', cat);
    if (cat === 'region') {
      const matched = INDIAN_REGIONS.find((r) => r.id === userRegion);
      setSelectedLang(matched?.defaultLang || 'Hindi');
    } else if (cat === 'all') {
      setSelectedLang('All');
    } else if (cat === 'recommended') {
      setSortBy('likes');
    } else if (cat === 'language' && lang) {
      setSelectedLang(lang);
    }
  };

  const handleEditPoem = (poem) => {
    setEditingPoem(poem);
    setActiveTab('studio');
  };

  const handlePublishSuccess = (newPoem) => {
    setEditingPoem(null);
    fetchPoems();
    setActiveTab('dashboard');
  };

  const formsList = [
    'All',
    'Mukt Kavya (Free Verse)',
    'Ghazal (Couplets/Sher)',
    'Dohe (Couplets)',
    'Geet (Lyrical Poem)',
    'Kundaliya',
    'Muktak (Quatrain)',
    'Rubaiyat',
  ];

  const displayedKavitas = kavitas.filter((k) => {
    if (!filterFollowingOnly) return true;
    if (!user || !user.following || user.following.length === 0) return false;
    const authorId = k.author?._id ? k.author._id.toString() : k.author?.toString();
    return user.following.some((id) => id.toString() === authorId);
  });

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#070913] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'} selection:bg-[#d4af37] selection:text-slate-950 font-['Poppins']`}>
      {/* Navbar with Demo Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setActiveTab('login')}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
      />

      <main className="flex-1 w-full" style={{ minHeight: '65vh' }}>
        {/* TAB 1: EXPLORE VERSES */}
        {activeTab === 'explore' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRasa={selectedRasa}
              setSelectedRasa={setSelectedRasa}
            />

            {/* Sleek Daily Highlight Ribbon (Keeps Multiple Poems Grid Prominently Visible) */}
            {dailyFeatured && !searchQuery && selectedLang === 'All' && selectedRasa === 'All' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div
                  onClick={() => setReaderPoem(dailyFeatured)}
                  className="daily-featured-ribbon cursor-pointer p-3.5 sm:p-4 rounded-2xl border shadow-xl flex flex-wrap items-center justify-between gap-3 group transition-all backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </span>
                    <div>
                      <span className="daily-ribbon-tag text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                        ⭐ आज की विशिष्ट रचना (Featured Masterpiece)
                      </span>
                      <p className="daily-ribbon-title text-sm sm:text-base font-bold font-['Rozha_One'] transition-colors">
                        "{dailyFeatured.title}" — {dailyFeatured.authorName} ({dailyFeatured.language} • {dailyFeatured.rasa})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="daily-ribbon-cta text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1">
                      <span>सम्पूर्ण पाठ व PDF</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Master Exploration Hub (Compact, balanced, and single-line on desktop) */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 animate-slide-up-smooth">
              <div
                className={`exploration-hub-container p-2.5 sm:p-3 lg:py-2.5 lg:px-4 rounded-2xl lg:rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
                  isDark
                    ? 'border-[#d4af37]/35 bg-gradient-to-r from-slate-900/95 via-[#130d1e]/90 to-slate-950/95 text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
                    : 'border-amber-900/20 bg-gradient-to-r from-white via-[#fcf8f0] to-[#f9f2e4] text-stone-900 shadow-[0_4px_20px_rgba(184,134,11,0.08)]'
                }`}
              >
                {/* Left Section: Primary Stream Pills (Horizontal scroll on mobile, inline on desktop) */}
                <div className="exploration-stream-track">
                  {/* Stream 1: Curated Recommendations */}
                  <button
                    onClick={() => handleSelectCategory('recommended')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer text-xs btn-hover-shimmer shrink-0 whitespace-nowrap ${
                      feedCategory === 'recommended' || feedCategory === 'region'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-slate-950 border-[#ffd700] font-bold shadow-md'
                        : isDark
                        ? 'bg-slate-800/70 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                        : 'bg-white text-stone-700 hover:text-stone-950 border-stone-300 hover:bg-amber-50/80 shadow-sm'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-950 fill-amber-950/20" />
                    <span>
                      ✨ अनुशंसित <span className="hidden xl:inline">(Recommended)</span>
                    </span>
                  </button>

                  {/* Stream 2: Trending / Most Appreciated */}
                  <button
                    onClick={() => handleSelectCategory('likes')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer text-xs btn-hover-shimmer shrink-0 whitespace-nowrap ${
                      feedCategory === 'likes'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-slate-950 border-[#ffd700] font-bold shadow-md'
                        : isDark
                        ? 'bg-slate-800/70 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                        : 'bg-white text-stone-700 hover:text-stone-950 border-stone-300 hover:bg-amber-50/80 shadow-sm'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    <span>
                      सर्वाधिक प्रशंसित <span className="hidden xl:inline">(Popular)</span>
                    </span>
                  </button>

                  {/* Stream 3: All Classical Traditions */}
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer text-xs btn-hover-shimmer shrink-0 whitespace-nowrap ${
                      feedCategory === 'all'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-slate-950 border-[#ffd700] font-bold shadow-md'
                        : isDark
                        ? 'bg-slate-800/70 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
                        : 'bg-white text-stone-700 hover:text-stone-950 border-stone-300 hover:bg-amber-50/80 shadow-sm'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>
                      समस्त काव्य <span className="hidden xl:inline">परंपरा</span>
                    </span>
                  </button>

                  {/* Following Stream (if user is logged in) */}
                  {user && (
                    <button
                      onClick={() => setFilterFollowingOnly(!filterFollowingOnly)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border text-xs cursor-pointer shrink-0 whitespace-nowrap ${
                        filterFollowingOnly
                          ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-md'
                          : isDark
                          ? 'bg-slate-800/70 text-slate-300 hover:text-white border-slate-700/80'
                          : 'bg-white text-stone-700 hover:text-stone-900 border-stone-300 shadow-sm'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-sky-500" />
                      <span>Following ({user.following?.length || 0})</span>
                    </button>
                  )}
                </div>

                {/* Subtle Divider (Desktop only) */}
                <div className="exploration-divider" />

                {/* Right Section: Sort, Mood, Form & Counter (One line on desktop, full-width responsive on mobile) */}
                <div className="exploration-filter-track">
                  {/* Sort Dropdown */}
                  <div className="relative flex items-center text-xs flex-1 sm:flex-initial">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="sort-trigger-btn text-xs py-1.5 px-2.5 sm:px-3 w-full sm:w-auto justify-between sm:justify-start whitespace-nowrap"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="sort-label-text hidden md:inline">Sort:</span>
                      <span className="sort-value-text font-medium text-[11px] sm:text-xs">
                        {sortBy === 'latest' && 'Latest (नवीनतम)'}
                        {sortBy === 'views' && 'Most Read (पठित)'}
                        {sortBy === 'likes' && 'Most Appreciated'}
                        {sortBy === 'featured' && 'Featured'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-[#d4af37]" />
                    </button>

                    {showSortMenu && (
                      <div className="royal-dropdown-panel sort-menu animate-fade-in right-0 z-30">
                        {[
                          { id: 'latest', label: 'Latest Verses (नवीनतम)' },
                          { id: 'views', label: 'Most Read (सर्वाधिक पठित)' },
                          { id: 'likes', label: 'Most Appreciated (लोकप्रिय)' },
                          { id: 'featured', label: 'Featured First (विशिष्ट)' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortBy(opt.id);
                              setShowSortMenu(false);
                            }}
                            className={`royal-dropdown-item ${sortBy === opt.id ? 'active' : ''}`}
                          >
                            <span>{opt.label}</span>
                            {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-slate-950" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rasa / Mood Selector */}
                  <div className="flex items-center text-xs flex-1 sm:flex-initial">
                    <select
                      value={selectedRasa}
                      onChange={(e) => setSelectedRasa(e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer transition-colors w-full sm:w-auto shrink-0 ${
                        isDark
                          ? 'bg-slate-950 text-slate-200 border-slate-700/80'
                          : 'bg-white text-stone-800 border-stone-300 shadow-sm'
                      }`}
                      title="रस / Mood Filter"
                    >
                      <option value="All">🎭 All Rasas (सभी रस)</option>
                      <option value="Veer">⚔️ Veer (वीर रस)</option>
                      <option value="Shringar">🌸 Shringar (शृंगार रस)</option>
                      <option value="Karun">💧 Karun (करुण रस)</option>
                      <option value="Shant">🕊️ Shant (शांत रस)</option>
                      <option value="Bhakti">🪔 Bhakti (भक्ति रस)</option>
                      <option value="Hasya">😄 Hasya (हास्य रस)</option>
                      <option value="Adbhut">✨ Adbhut (अद्भुत रस)</option>
                    </select>
                  </div>

                  {/* Form / Poetic Genre Selector */}
                  <div className="flex items-center text-xs flex-1 sm:flex-initial">
                    <select
                      value={selectedForm}
                      onChange={(e) => setSelectedForm(e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer transition-colors w-full sm:w-auto shrink-0 ${
                        isDark
                          ? 'bg-slate-950 text-slate-200 border-slate-700/80'
                          : 'bg-white text-stone-800 border-stone-300 shadow-sm'
                      }`}
                      title="विधा / Form Filter"
                    >
                      {formsList.map((f) => (
                        <option key={f} value={f}>
                          📜 {f === 'All' ? 'All Forms (विधाएँ)' : f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filter Clear indicator */}
                  {(selectedRasa !== 'All' || selectedForm !== 'All' || filterFollowingOnly || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedRasa('All');
                        setSelectedForm('All');
                        setFilterFollowingOnly(false);
                        setSearchQuery('');
                      }}
                      className="text-[11px] text-amber-500 hover:text-amber-400 underline font-medium cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap px-1 py-1"
                      title="Clear all active filters"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}

                  {/* Live Verse Count Pill */}
                  <div
                    className={`text-[11px] flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full border ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-white/90 border-stone-200 text-stone-700 shadow-xs'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-amber-500 dark:text-amber-300">{displayedKavitas.length}</span>
                    <span className="text-[10px] opacity-80">verses</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Poem Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 poem-feed-container">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl sm:text-2xl font-bold font-['Rozha_One'] flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-[#d4af37]" />
                  काव्य धारा (Explore Verses)
                </h2>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Showing {displayedKavitas.length} poetic works
                </span>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#d4af37]" />
                  <p className="text-xs font-mono">Retrieving verses from MongoDB Atlas...</p>
                </div>
              ) : displayedKavitas.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 max-w-xl mx-auto">
                  <SearchX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-1">
                    {filterFollowingOnly ? 'No verses from poets you follow yet' : 'No matching verses found'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {filterFollowingOnly
                      ? 'Follow poets by clicking "+ Follow Poet" on their poem reading pages.'
                      : 'Try clearing filters or search keywords.'}
                  </p>
                  <button
                    onClick={() => {
                      setFilterFollowingOnly(false);
                      setSearchQuery('');
                      setSelectedLang('All');
                      setSelectedRasa('All');
                      setSelectedForm('All');
                    }}
                    className="btn-outline text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedKavitas.map((k) => (
                    <KavitaCard
                      key={k._id}
                      kavita={k}
                      onSelect={(poem) => setReaderPoem(poem)}
                      onOpenAuthModal={() => setActiveTab('login')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AAJ KI KAVITA (VERSE OF THE DAY HIGHLIGHT) */}
        {activeTab === 'daily' && (
          <div className="pt-8 animate-fade-in">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> आज का विशिष्ट काव्य (Daily Masterpiece)
              </span>
              <h1
                className={`text-3xl font-bold font-['Rozha_One'] ${
                  isDark ? 'text-white' : 'text-[#800020]'
                }`}
              >
                आज की कविता (Verse of the Day)
              </h1>
            </div>
            {dailyFeatured ? (
              <DailyFeaturedCard
                kavita={dailyFeatured}
                onReadMore={(k) => setReaderPoem(k)}
              />
            ) : (
              <div className="text-center py-16 text-slate-400">Loading daily featured kavita...</div>
            )}
          </div>
        )}

        {/* TAB 3: POET'S STUDIO (रचना कक्ष) */}
        {activeTab === 'studio' && (
          <PoetStudio
            onPublishSuccess={handlePublishSuccess}
            editingPoem={editingPoem}
          />
        )}

        {/* TAB 4: POET'S DEDICATED KAVITAS & DIWAN HUB */}
        {(activeTab === 'dashboard' || activeTab === 'my-kavitas') && (
          <PoetDashboard
            onOpenStudio={() => {
              setEditingPoem(null);
              setActiveTab('studio');
            }}
            onEditPoem={handleEditPoem}
            onReadPoem={(p) => setReaderPoem(p)}
          />
        )}

        {/* TAB 5: ADMIN & SUPER ADMIN COMMAND CENTER (Protected) */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminPortal />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in font-['Outfit']">
              <div className="glass-panel p-8 rounded-3xl border border-[#d4af37]/30">
                <p className="text-sm text-slate-300 mb-4">Please sign in as an administrator to access the governance console.</p>
                <button onClick={() => setActiveTab('explore')} className="btn-royal text-xs py-2 px-6">
                  Back to Explore
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 6 & 7: DEDICATED AUTHENTICATION PAGES (LOGIN & SIGN UP) */}
        {(activeTab === 'login' || activeTab === 'signup') && (
          <AuthPage
            initialMode={activeTab === 'signup' ? 'register' : 'login'}
            onNavigate={(tab) => setActiveTab(tab)}
            onSuccess={() => {
              if (isSuperAdmin) {
                setActiveTab('admin');
              } else {
                setActiveTab('explore');
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        setSelectedLang={setSelectedLang}
        setSelectedRasa={setSelectedRasa}
      />

      {/* Mobile Sticky Bottom Navigation Bar (Phone & Small Tablet) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          onClick={() => setActiveTab('explore')}
          className={`mobile-nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
        >
          <BookOpen className="w-4 h-4 text-[#d4af37]" />
          <span>काव्य धारा</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`mobile-nav-btn ${activeTab === 'daily' ? 'active' : ''}`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>आज की कविता</span>
        </button>

        {/* If NOT logged in, show Sign In option */}
        {!user && (
          <button
            onClick={() => setActiveTab('login')}
            className={`mobile-nav-btn ${activeTab === 'login' || activeTab === 'signup' ? 'active' : ''}`}
          >
            <User className="w-4 h-4 text-[#d4af37]" />
            <span>प्रवेश (Sign In)</span>
          </button>
        )}

        {/* If logged in, show Studio */}
        {user && isWriter && (
          <button
            onClick={() => setActiveTab('studio')}
            className={`mobile-nav-btn ${activeTab === 'studio' ? 'active' : ''} animate-scale-pop`}
          >
            <PenTool className="w-4 h-4 text-[#d4af37]" />
            <span>रचना कक्ष</span>
          </button>
        )}

        {/* If logged in, show My Kavitas */}
        {user && (
          <button
            onClick={() => setActiveTab('my-kavitas')}
            className={`mobile-nav-btn ${activeTab === 'my-kavitas' || activeTab === 'dashboard' ? 'active' : ''} animate-scale-pop`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>मेरी कविताएँ</span>
          </button>
        )}

        {/* If admin, show Admin Portal */}
        {user && isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`mobile-nav-btn ${activeTab === 'admin' ? 'active' : ''} animate-scale-pop`}
          >
            <ShieldAlert className="w-4 h-4 text-[#ffd700]" />
            <span>एडमिन</span>
          </button>
        )}
      </nav>

      {/* Full Immersion Reader Modal */}
      {readerPoem && (
        <PoemReaderModal
          kavita={readerPoem}
          onClose={() => setReaderPoem(null)}
          onOpenAuthModal={() => {
            setReaderPoem(null);
            setActiveTab('login');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
