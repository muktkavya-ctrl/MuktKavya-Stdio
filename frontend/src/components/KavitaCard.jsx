import React, { useState } from 'react';
import { Heart, Eye, FileDown, BookOpen, Sparkles } from 'lucide-react';
import { exportKavitaToPdf } from '../utils/pdfExport';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Helper to provide vivid royal badge colors per language
const getLanguageBadgeStyle = (lang = 'Hindi', isDark = true) => {
  if (!isDark) {
    switch (lang?.toLowerCase()) {
      case 'urdu':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold';
      case 'marathi':
        return 'bg-orange-100 text-orange-950 border-orange-300 font-bold';
      case 'gujarati':
        return 'bg-teal-100 text-teal-950 border-teal-300 font-bold';
      case 'bengali':
        return 'bg-rose-100 text-rose-950 border-rose-300 font-bold';
      case 'english':
        return 'bg-sky-100 text-sky-950 border-sky-300 font-bold';
      case 'sanskrit':
        return 'bg-amber-100 text-amber-950 border-amber-400 font-bold';
      case 'hindi':
      default:
        return 'bg-red-50 text-[#800020] border-[#800020]/30 font-bold';
    }
  }
  switch (lang?.toLowerCase()) {
    case 'urdu':
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 font-semibold';
    case 'marathi':
      return 'bg-orange-950/70 text-orange-300 border-orange-500/40 font-semibold';
    case 'gujarati':
      return 'bg-teal-950/70 text-teal-300 border-teal-500/40 font-semibold';
    case 'bengali':
      return 'bg-rose-950/70 text-rose-300 border-rose-500/40 font-semibold';
    case 'english':
      return 'bg-sky-950/70 text-sky-300 border-sky-500/40 font-semibold';
    case 'sanskrit':
      return 'bg-amber-950/70 text-[#ffd700] border-[#ffd700]/50 font-semibold';
    case 'hindi':
    default:
      return 'bg-[#800020]/70 text-amber-200 border-[#d4af37]/45 font-semibold';
  }
};

export const KavitaCard = ({ kavita, onSelect, onLikeSuccess, onOpenAuthModal }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [likes, setLikes] = useState(kavita.likesCount || 0);
  const [views, setViews] = useState(kavita.viewsCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const previewSnippet =
    kavita.stanzas?.[0]?.lines?.slice(0, 3)?.join('\n') ||
    kavita.content?.split('\n')?.slice(0, 3)?.join('\n');

  const handleCardClick = () => {
    // Atomically log real-time view telemetry & increment view count
    api.trackView(kavita._id, 'view_kavita').then((res) => {
      if (res && res.viewsCount) {
        setViews(res.viewsCount);
      } else {
        setViews((prev) => prev + 1);
      }
    });

    if (onSelect) onSelect(kavita);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (hasLiked) return;
    try {
      const res = await api.toggleLike(kavita._id);
      if (res.success) {
        setLikes(res.likesCount);
        setHasLiked(true);
        if (onLikeSuccess) onLikeSuccess(kavita._id, res.likesCount);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleExportPdf = async (e) => {
    e.stopPropagation();
    setIsExporting(true);
    await exportKavitaToPdf(kavita, kavita.title);
    setIsExporting(false);
    // Track export action in telemetry
    api.trackView(kavita._id, 'export_pdf');
  };

  const langBadgeClass = getLanguageBadgeStyle(kavita.language, isDark);

  return (
    <div
      onClick={handleCardClick}
      className={`glass-card card-hover-lift cursor-pointer flex flex-col justify-between p-4 sm:p-6 border group relative overflow-hidden shadow-xl transition-all duration-300 ${
        isDark
          ? 'border-[#d4af37]/35 hover:border-[#ffd700]'
          : 'border-stone-200/90 hover:border-amber-500 shadow-md'
      }`}
    >
      {/* Decorative Golden Corner Filigree Accent */}
      <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-bl from-[#d4af37]/25 to-transparent pointer-events-none rounded-bl-3xl"></div>

      {/* Top Meta Header: Language, Rasa & Featured Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs px-2 sm:px-2.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${langBadgeClass}`}
            >
              <span>🌐</span> {kavita.language}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 rounded-full border ${
                isDark
                  ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                  : 'text-amber-950 bg-amber-100 border-amber-300 font-semibold'
              }`}
            >
              {kavita.rasa?.split(' ')[0]}
            </span>
          </div>

          {kavita.isFeatured && (
            <span
              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${
                isDark
                  ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                  : 'text-amber-900 bg-amber-100 border-amber-400'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#ffd700]" /> Featured
            </span>
          )}
        </div>

        {/* Heading of Kavita — 2 Lines Max with Proper Hierarchy */}
        <h3
          className={`font-['Rozha_One'] text-lg sm:text-2xl transition-colors line-clamp-2 min-h-[2.8rem] sm:min-h-[3.2rem] leading-snug mb-1 ${
            isDark
              ? 'text-white group-hover:text-[#ffd700]'
              : 'text-stone-900 group-hover:text-[#800020]'
          }`}
        >
          {kavita.title}
        </h3>

        {/* Subtitle / Dedication */}
        {kavita.subtitle ? (
          <p
            className={`text-xs italic line-clamp-1 mb-2.5 sm:mb-3 font-medium ${
              isDark ? 'text-[#d4af37]' : 'text-amber-800'
            }`}
          >
            — {kavita.subtitle} —
          </p>
        ) : (
          <div className="h-3 sm:h-4 mb-2" />
        )}

        {/* Verses Preview Excerpt Box */}
        <div
          className={`kavita-snippet-box rounded-xl p-3 sm:p-4 my-2 border font-['Tiro_Devanagari_Hindi'] text-xs sm:text-sm leading-relaxed whitespace-pre-line line-clamp-4 shadow-inner ${
            isDark ? 'text-slate-200' : 'text-stone-800 font-medium'
          }`}
        >
          {previewSnippet || kavita.content}
        </div>

        {/* Author / Pen Name Row with Clean Separation */}
        <div
          className={`mt-4 flex items-center justify-between text-xs pt-2 border-t ${
            isDark ? 'border-[#d4af37]/20' : 'border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#800020] via-[#aa8620] to-[#ffd700] text-slate-950 flex items-center justify-center font-bold text-xs shadow-md shrink-0 border border-[#ffd700]/50 font-['Rozha_One']">
              {kavita.authorName?.charAt(0) || 'क'}
            </div>
            <div className="min-w-0">
              <p
                className={`font-semibold truncate text-xs sm:text-sm ${
                  isDark ? 'text-slate-100' : 'text-stone-900'
                }`}
              >
                {kavita.authorName}
              </p>
              {kavita.penName && (
                <p
                  className={`text-[11px] italic truncate font-medium ${
                    isDark ? 'text-[#d4af37]' : 'text-amber-800'
                  }`}
                >
                  "{kavita.penName}"
                </p>
              )}
            </div>
          </div>

          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 font-sans ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                : 'border-stone-300 bg-stone-100 text-stone-700'
            }`}
          >
            {kavita.form?.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Card Footer Actions — Likes, Views, Theme-Aware PDF Export, and Read Button */}
      <div className="mt-4 pt-3 border-t border-[#d4af37]/20 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              hasLiked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
            }`}
            title="Appreciate verse"
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likes}</span>
          </button>

          <span
            className="flex items-center gap-1 text-slate-400"
            title={`${views} verified reader views`}
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="font-medium">{views}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme-Adaptive Gold PDF Button — ZERO BLACKOUT */}
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="p-1.5 rounded-xl bg-[#d4af37]/15 hover:bg-[#d4af37] text-amber-300 hover:text-slate-950 border border-[#d4af37]/45 shadow-sm transition-all duration-200 cursor-pointer"
            title="Download PDF Folio Edition"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>

          {/* Luxury Royal Gold Read Button */}
          <button
            onClick={handleCardClick}
            style={{
              background: 'linear-gradient(135deg, #fceda2 0%, #d4af37 60%, #aa8620 100%)',
              color: '#070913',
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-slate-950" />
            <span>Read</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KavitaCard;
