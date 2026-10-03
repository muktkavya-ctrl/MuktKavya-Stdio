import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Feather, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const HeroSection = ({
  searchQuery,
  setSearchQuery,
  selectedRasa,
  setSelectedRasa,
  stats,
}) => {
  const { isDark } = useTheme();
  const famousVerses = [
    {
      text: 'वर्षों तक वन में घूम-घूम, बाधा-विघ्नों को चूम-चूम...',
      poet: 'रामधारी सिंह "दिनकर"',
      lang: 'Hindi Veer Rasa',
    },
    {
      text: 'दिल-ए-नादाँ तुझे हुआ क्या है, आख़िर इस दर्द की दवा क्या है...',
      poet: 'मिर्ज़ा असदुल्लाह ख़ाँ "ग़ालिब"',
      lang: 'Urdu Ghazal',
    },
    {
      text: 'চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির, জ্ঞান যেথা মুক্ত...',
      poet: 'রবীন্দ্রনাথ ঠাকুর (Rabindranath Tagore)',
      lang: 'Bengali Shant Rasa',
    },
    {
      text: 'रे पंखीडां सुखेथी चणजो गीत गाजो कांई हर्षनां...',
      poet: 'कवि कलापी (Kavi Kalapi)',
      lang: 'Gujarati Shant Rasa',
    },
    {
      text: 'Who will buy these delicate, bright rainbow-tinted circles of light?',
      poet: 'Sarojini Naidu (The Nightingale of India)',
      lang: 'English Poetry',
    },
  ];

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVerseIndex((prev) => (prev + 1) % famousVerses.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [famousVerses.length]);

  const rasas = [
    { id: 'All', label: 'All Rasas (सभी रस)' },
    { id: 'Veer', label: '⚔️ Veer (वीर रस)' },
    { id: 'Shringar', label: '🌸 Shringar (शृंगार रस)' },
    { id: 'Karun', label: '💧 Karun (करुण रस)' },
    { id: 'Shant', label: '🕊️ Shant (शांत रस)' },
    { id: 'Bhakti', label: '🪔 Bhakti (भक्ति रस)' },
    { id: 'Hasya', label: '😄 Hasya (हास्य रस)' },
    { id: 'Adbhut', label: '✨ Adbhut (अद्भुत रस)' },
  ];

  return (
    <section className="relative pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      {/* Background Animated Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none -z-10 animate-float-gentle" />

      {/* Rotating Masterpiece Verse Ticker */}
      <div
        className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border text-xs mb-6 max-w-full sm:max-w-2xl mx-auto shadow-sm transition-all duration-300 animate-slide-up-smooth ${
          isDark
            ? 'bg-slate-900/80 border-[#d4af37]/35 text-slate-300 shadow-inner'
            : 'bg-white/95 border-amber-900/20 text-stone-800 shadow-md'
        }`}
      >
        <Feather className="w-3.5 h-3.5 text-[#d4af37] shrink-0 animate-pulse" />
        <span className="font-['Tiro_Devanagari_Hindi'] italic truncate max-w-[140px] xs:max-w-[220px] sm:max-w-xs md:max-w-md">
          "{famousVerses[currentVerseIndex].text}"
        </span>
        <span
          className={`font-semibold text-[10px] sm:text-[11px] shrink-0 ml-1 truncate max-w-[120px] sm:max-w-none ${
            isDark ? 'text-[#ffd700]' : 'text-amber-900'
          }`}
        >
          — {famousVerses[currentVerseIndex].poet}
        </span>
      </div>

      {/* Main Heading */}
      <h1
        className={`text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold font-['Rozha_One'] tracking-wide mb-3 sm:mb-4 leading-tight ${
          isDark
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f5e7a9] to-[#d4af37]'
            : 'text-stone-900'
        }`}
      >
        शब्द जहाँ रस बन जाते हैं, और भाव अमर काव्य!
      </h1>

      <p
        className={`max-w-2xl mx-auto text-xs sm:text-base font-light mb-6 sm:mb-8 font-['Outfit'] px-2 leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-stone-700'
        }`}
      >
        A dedicated Indian regional poetry platform. Read, compose, and preserve verses in
        Hindi, Urdu, Bengali, Marathi, Gujarati, English, and regional languages with
        refined reading canvases and publication-ready PDF export.
      </p>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto relative mb-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] absolute left-3.5 sm:left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kavita by title, verses, poet name, or tags..."
            className={`w-full pl-10 sm:pl-12 pr-20 sm:pr-28 py-2.5 sm:py-3.5 border-2 rounded-full text-xs sm:text-sm focus:outline-none shadow-xl backdrop-blur-md transition-all ${
              isDark
                ? 'bg-slate-900/90 border-[#d4af37]/40 text-slate-100 placeholder-slate-400 focus:border-[#ffd700]'
                : 'bg-white border-amber-900/25 text-stone-900 placeholder-stone-400 focus:border-amber-600'
            }`}
            style={{ paddingLeft: '2.85rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2.5 sm:right-4 text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full cursor-pointer transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Inspiration Tags */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs max-w-xl mx-auto px-1">
        <span
          className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${
            isDark ? 'text-[#d4af37]' : 'text-amber-900'
          }`}
        >
          लोकप्रिय खोज (Trending):
        </span>
        {['दिनकर', 'मिर्ज़ा ग़ालिब', 'कबीर', 'महादेवी वर्मा', 'निराला', 'वीर रस', 'शृंगार'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag)}
            className={`px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] transition-all cursor-pointer shadow-sm hover:scale-105 ${
              isDark
                ? 'bg-slate-900/80 hover:bg-[#d4af37]/20 border-slate-800 hover:border-[#d4af37]/50 text-slate-300 hover:text-[#ffd700]'
                : 'bg-white hover:bg-amber-50 border-stone-300 hover:border-amber-600 text-stone-800 hover:text-[#800020] font-medium'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
};
