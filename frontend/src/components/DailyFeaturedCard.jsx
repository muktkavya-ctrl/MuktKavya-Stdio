import React, { useState } from 'react';
import { Sparkles, FileDown, Share2, Volume2, VolumeX, Eye, Heart, BookOpen } from 'lucide-react';
import { exportKavitaToPdf, exportKavitaToImageCard } from '../utils/pdfExport';
import { useTheme } from '../context/ThemeContext';

export const DailyFeaturedCard = ({ kavita, onReadMore }) => {
  const { isDark } = useTheme();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!kavita) return null;

  const cardDomId = `daily-kavita-${kavita._id}`;

  const handleExportPdf = async (e) => {
    e.stopPropagation();
    setIsExporting(true);
    await exportKavitaToPdf(cardDomId, kavita.title);
    setIsExporting(false);
  };

  const handleExportCard = async (e) => {
    e.stopPropagation();
    await exportKavitaToImageCard(cardDomId, kavita.title);
  };

  // Simulated gentle ambient audio recitation note
  const toggleAmbientAudio = (e) => {
    e.stopPropagation();
    setIsPlayingAudio(!isPlayingAudio);
  };

  // Preview first 2-3 stanzas
  const previewLines = kavita.stanzas?.[0]?.lines?.slice(0, 4) || kavita.content.split('\n').slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
      <div className="relative group card-hover-lift">
        {/* Decorative Golden Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] via-[#800020] to-[#d4af37] rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none"></div>

        <div
          className={`relative rounded-2xl overflow-hidden border p-4 sm:p-8 transition-colors duration-300 ${
            isDark
              ? 'bg-slate-900 border-[#d4af37]/40 shadow-2xl'
              : 'bg-[#fffdfa] border-[#b8860b]/35 shadow-xl'
          }`}
        >
          {/* Header Banner */}
          <div
            className={`flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b ${
              isDark ? 'border-[#d4af37]/20' : 'border-[#b8860b]/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-500">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#d4af37] font-bold">
                  Featured Masterpiece
                </span>
                <h3
                  className={`text-lg sm:text-xl font-bold font-['Rozha_One'] ${
                    isDark ? 'text-white' : 'text-[#800020]'
                  }`}
                >
                  आज की कविता (Verse of the Day)
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  isDark
                    ? 'bg-[#800020]/40 text-[#f5e7a9] border-[#d4af37]/30'
                    : 'bg-rose-50 text-[#800020] border-rose-200'
                }`}
              >
                🌐 {kavita.language}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isDark
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {kavita.rasa}
              </span>
            </div>
          </div>

          {/* Styled Canvas Area for Rendering & High-Res PDF Export */}
          <div
            id={cardDomId}
            className={`kavita-canvas theme-${kavita.theme || 'royal-velvet'} cursor-pointer rounded-xl`}
            onClick={() => onReadMore(kavita)}
          >
            <div className="kavita-ornament-top">❦ ════ •⊰❂⊱• ════ ❦</div>

            {/* Heading of Kavita */}
            <h2 className="kavita-title text-2xl sm:text-4xl">{kavita.title}</h2>

            {/* Subtitle / Dedication */}
            {kavita.subtitle && (
              <p className="kavita-subtitle text-sm sm:text-base">— {kavita.subtitle} —</p>
            )}

            {/* Verses Preview */}
            <div className="my-6 text-center font-['Tiro_Devanagari_Hindi'] text-lg sm:text-xl leading-relaxed space-y-2">
              {previewLines.map((line, idx) => (
                <p key={idx} className="tracking-wide">
                  {line}
                </p>
              ))}
              <p className="text-sm opacity-60 pt-2 italic">. . . (पूरी रचना पढ़ने के लिए क्लिक करें) . . .</p>
            </div>

            {/* Poet Signature */}
            <div className="kavita-footer-signature">
              <div className="flex items-center gap-2">
                <span className="poet-stamp">
                  ✍️ {kavita.authorName} {kavita.penName ? `"${kavita.penName}"` : ''}
                </span>
              </div>
              <div className="text-xs opacity-75 font-sans">
                विधा: {kavita.form || 'मुक्त काव्य'}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div
            className={`mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-stone-200'
            }`}
          >
            <div
              className={`flex items-center gap-4 text-xs ${
                isDark ? 'text-slate-400' : 'text-stone-600'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-4 h-4 opacity-75" />
                {kavita.viewsCount || 0} Readers
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                {kavita.likesCount || 0} Appreciations
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={toggleAmbientAudio}
                className={`btn-outline text-xs flex items-center gap-1.5 ${
                  isPlayingAudio ? 'bg-amber-500/20 text-[#d4af37] border-[#d4af37]' : ''
                }`}
                title="Listen to ambient recitation"
              >
                {isPlayingAudio ? (
                  <>
                    <span className="audio-equalizer">
                      <span className="audio-bar" />
                      <span className="audio-bar" />
                      <span className="audio-bar" />
                    </span>
                    <span>Recital Playing</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Audio Recital</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExportCard}
                className="btn-outline text-xs"
                title="Download shareable status image card"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Image Card</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="btn-royal text-xs py-2 px-3.5"
                title="Export high-resolution collector's PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export PDF Edition'}</span>
              </button>

              <button
                onClick={() => onReadMore(kavita)}
                className="btn-burgundy text-xs py-2 px-4 shadow-md"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

