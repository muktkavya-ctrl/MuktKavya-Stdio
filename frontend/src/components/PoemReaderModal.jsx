import React, { useState, useEffect } from 'react';
import {
  X,
  FileDown,
  Share2,
  Heart,
  Eye,
  Volume2,
  VolumeX,
  Sparkles,
  Palette,
  Type,
  Send,
  MessageSquare,
  Bookmark,
  Check,
  FileText,
} from 'lucide-react';
import { exportKavitaToPdf, exportKavitaToImageCard, exportKavitaToText } from '../utils/pdfExport';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const PoemReaderModal = ({ kavita, onClose, onOpenAuthModal }) => {
  const { user, toggleFollowPoet } = useAuth();
  const { isDark } = useTheme();
  const [activeTheme, setActiveTheme] = useState(kavita?.theme || 'vintage-parchment');
  const [fontSize, setFontSize] = useState(20);
  const [likes, setLikes] = useState(kavita?.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const themeOptions = [
    { id: 'vintage-parchment', name: '📜 Vintage Parchment' },
    { id: 'royal-velvet', name: '🍷 Royal Velvet' },
    { id: 'midnight-cosmos', name: '🌌 Midnight Cosmos' },
    { id: 'golden-sunset', name: '🌅 Golden Sunset' },
    { id: 'emerald-forest', name: '🌲 Emerald Forest' },
    { id: 'rose-saffron', name: '🌹 Rose Saffron' },
    { id: 'obsidian-minimal', name: '🖤 Obsidian Minimal' },
    { id: 'classic-ivory', name: '🏛️ Classic Ivory' },
  ];

  // Fetch full details and comments
  useEffect(() => {
    if (!kavita?._id) return;
    const fetchFullDetails = async () => {
      try {
        const res = await api.getKavitaById(kavita._id);
        if (res.success && res.comments) {
          setComments(res.comments);
        }
      } catch (err) {
        console.error('Fetch comments error:', err);
      }
    };
    fetchFullDetails();
  }, [kavita?._id]);

  if (!kavita) return null;

  const readerDomId = `reader-canvas-${kavita._id}`;

  const handleLike = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (hasLiked) return;
    try {
      const res = await api.toggleLike(kavita._id);
      if (res.success) {
        setLikes(res.likesCount);
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    await exportKavitaToPdf(readerDomId, kavita.title);
    setIsExporting(false);
  };

  const handleExportCard = async () => {
    await exportKavitaToImageCard(readerDomId, kavita.title);
  };

  const handleCopyVerses = () => {
    navigator.clipboard.writeText(`${kavita.title}\n\n${kavita.content}\n\n— ${kavita.authorName} (${kavita.penName || ''})\nPublished on Mukt Kavya`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.addComment(kavita._id, newComment.trim());
      if (res.success) {
        setComments([res.data, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Structured stanzas or fall back to splitting
  const displayStanzas =
    kavita.stanzas && kavita.stanzas.length > 0
      ? kavita.stanzas
      : kavita.content.split(/\n\s*\n/).map((block, i) => ({
          stanzaNumber: i + 1,
          lines: block.split('\n'),
        }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      <div
        className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors duration-300 ${
          isDark
            ? 'bg-slate-900 border-[#d4af37]/40 shadow-black/80'
            : 'bg-[#fffdfa] border-[#b8860b]/35 shadow-2xl text-stone-900'
        }`}
      >
        {/* Top Control Bar */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b ${
            isDark
              ? 'border-slate-800 bg-slate-950/70'
              : 'border-stone-200 bg-[#f7f1e6]'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${
                isDark
                  ? 'bg-[#800020]/40 text-[#f5e7a9] border-[#d4af37]/30'
                  : 'bg-rose-100 text-[#800020] border-rose-300'
              }`}
            >
              {kavita.language}
            </span>
            <span
              className={`text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${
                isDark
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {kavita.rasa}
            </span>
          </div>

          {/* Theme & Font Customizers */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme Picker Dropdown */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                  : 'bg-white border-stone-300 text-stone-800 shadow-sm'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value)}
                className={`bg-transparent text-xs focus:outline-none cursor-pointer ${
                  isDark ? 'text-slate-200' : 'text-stone-800'
                }`}
              >
                {themeOptions.map((t) => (
                  <option key={t.id} value={t.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-stone-900'}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size Adjuster */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                  : 'bg-white border-stone-300 text-stone-700 shadow-sm'
              }`}
            >
              <Type className="w-3.5 h-3.5 opacity-60" />
              <button
                onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                className="px-1.5 hover:text-amber-500 font-bold cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-[11px] opacity-75">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="px-1.5 hover:text-amber-500 font-bold cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Audio Recitation Sim */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-[#d4af37] border-[#d4af37]'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-stone-300 text-stone-700 hover:text-stone-900 shadow-sm'
              }`}
              title="Ambient Recitation"
            >
              {isPlayingAudio ? (
                <>
                  <span className="audio-equalizer">
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                  </span>
                  <span className="hidden sm:inline">Playing</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">Recital</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ml-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'bg-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reading Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
          {/* THE MASTERPIECE CANVASS */}
          <div
            id={readerDomId}
            className={`kavita-canvas theme-${activeTheme} max-w-2xl mx-auto shadow-2xl transition-all duration-300`}
          >
            {/* Top Ornamental Divider */}
            <div className="kavita-ornament-top">❦ ════ •⊰❂⊱• ════ ❦</div>

            {/* Heading of Kavita */}
            <h1 className="kavita-title text-2xl sm:text-4xl">{kavita.title}</h1>

            {/* Subtitle / Dedication */}
            {kavita.subtitle && (
              <p className="kavita-subtitle text-base sm:text-lg">— {kavita.subtitle} —</p>
            )}

            {/* Stanzas Display */}
            <div className="kavita-stanzas my-8">
              {displayStanzas.map((stanza, idx) => (
                <div key={idx} className="space-y-1">
                  <div
                    className="kavita-stanza"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {stanza.lines ? stanza.lines.join('\n') : stanza}
                  </div>
                  {idx < displayStanzas.length - 1 && (
                    <div className="kavita-stanza-divider">✦ ✦ ✦</div>
                  )}
                </div>
              ))}
            </div>

            {/* Poet Royal Stamp & Signature */}
            <div className="kavita-footer-signature">
              <div>
                <span className="poet-stamp">
                  ✍️ {kavita.authorName} {kavita.penName ? `"${kavita.penName}"` : ''}
                </span>
                <p className="text-[11px] opacity-75 mt-1 font-sans">
                  शैली: {kavita.form || 'मुक्त काव्य'} • भाषा: {kavita.language}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] tracking-widest uppercase opacity-75 font-sans">
                  Mukt Kavya Archive
                </span>
                <p className="text-[10px] opacity-60">
                  {new Date(kavita.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Reader Action Ribbon with Follow Poet */}
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 w-full">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likes} Appreciations</span>
              </button>

              {/* Follow / Following Poet Button */}
              {user && (kavita.author?._id || kavita.author) && (kavita.author?._id?.toString() || kavita.author?.toString()) !== user.id && (
                <button
                  onClick={async () => {
                    const authorId = kavita.author?._id ? kavita.author._id.toString() : kavita.author.toString();
                    await toggleFollowPoet(authorId);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    user.following?.some(
                      (id) =>
                        id.toString() ===
                        (kavita.author?._id ? kavita.author._id.toString() : kavita.author.toString())
                    )
                      ? 'bg-[#d4af37]/20 text-[#f5e7a9] border-[#d4af37]/50'
                      : 'bg-slate-800 text-sky-300 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <span>
                    {user.following?.some(
                      (id) =>
                        id.toString() ===
                        (kavita.author?._id ? kavita.author._id.toString() : kavita.author.toString())
                    )
                      ? '✓ Following'
                      : '+ Follow'}
                  </span>
                </button>
              )}

              <button
                onClick={handleCopyVerses}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => exportKavitaToText(kavita)}
                className="btn-outline text-xs py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 cursor-pointer"
                title="Download pristine UTF-8 text file (Never corrupted on Windows Notepad)"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Text (.txt)</span>
              </button>

              <button
                onClick={handleExportCard}
                className="btn-outline text-xs py-1.5 px-2.5 sm:px-3 cursor-pointer"
                title="Download PNG social media status card"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Image</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="btn-royal text-xs py-1.5 sm:py-2 px-3 sm:px-4 shadow-lg cursor-pointer"
                title="Export high-resolution PDF with chosen theme background"
              >
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>

          {/* Reader Reflections & Comments Section */}
          <div
            className={`max-w-2xl mx-auto mt-8 pt-6 border-t ${
              isDark ? 'border-slate-800' : 'border-stone-200'
            }`}
          >
            <h3
              className={`text-base font-bold mb-4 flex items-center gap-2 font-['Rozha_One'] ${
                isDark ? 'text-slate-200' : 'text-[#800020]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              पाठकों की प्रतिक्रियाएँ (Reader Reflections) ({comments.length})
            </h3>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    user
                      ? 'Write your poetic reflection or appreciation...'
                      : 'Please sign in to leave a reflection on this poem...'
                  }
                  rows={2}
                  disabled={!user}
                  className={`w-full rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-[#d4af37] border transition-colors ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 shadow-inner'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!user || isSubmittingComment || !newComment.trim()}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1 bg-[#d4af37] hover:bg-[#f5e7a9] text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isDark
                      ? 'bg-slate-950/40 border-slate-800'
                      : 'bg-stone-50 border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span
                      className={`font-semibold ${
                        isDark ? 'text-[#f5e7a9]' : 'text-[#800020]'
                      }`}
                    >
                      {c.userName}
                    </span>
                    <span className={isDark ? 'text-slate-500 text-[10px]' : 'text-stone-400 text-[10px]'}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-['Tiro_Devanagari_Hindi'] leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-stone-700'
                    }`}
                  >
                    {c.content}
                  </p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4 italic">
                  Be the first to share your thoughts on this poetic creation!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
