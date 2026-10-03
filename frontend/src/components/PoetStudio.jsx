import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  Palette,
  FileDown,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Send,
  Layers,
  Save,
  Volume2,
  ShieldAlert,
  Lock,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { exportKavitaToPdf } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const PoetStudio = ({ onPublishSuccess, editingPoem = null }) => {
  const { user, isSuperAdmin } = useAuth();
  const { isDark } = useTheme();

  // Unauthenticated Guard: Studio is strictly for logged-in users
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in font-['Outfit']">
        <div className="glass-panel p-8 sm:p-12 border border-[#d4af37]/40 max-w-xl mx-auto rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#800020]/25 text-[#ffd700] flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/40 animate-pulse-glow">
            <Lock className="w-8 h-8 text-[#ffd700]" />
          </div>
          <h2 className="text-2xl font-bold font-['Rozha_One'] text-white dark:text-white mb-2">
            प्रवेश आवश्यक (Sign In Required)
          </h2>
          <p className="text-sm text-slate-300 dark:text-slate-300 mb-6 leading-relaxed">
            रचना कक्ष (Poet's Studio) केवल पंजीकृत रचनाकारों के लिए उपलब्ध है। कृपया अपनी कविताएँ लिखने एवं प्रकाशित करने के लिए प्रवेश करें।
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-royal text-xs py-2.5 px-6 font-bold"
          >
            Sign In to Access Studio
          </button>
        </div>
      </div>
    );
  }

  // Restricted Creator Guard: Creator suspended from submitting
  if (user?.isRestricted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in font-['Outfit']">
        <div className="glass-panel p-8 sm:p-12 border border-amber-500/40 max-w-xl mx-auto rounded-3xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold font-['Rozha_One'] text-white mb-2">
            Publishing Privilege Suspended
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your creator publishing permissions have been restricted by the Super Administrator. You may continue reading verses and participating in community comments.
          </p>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState(editingPoem?.title || '');
  const [subtitle, setSubtitle] = useState(editingPoem?.subtitle || '');
  const [content, setContent] = useState(editingPoem?.content || '');
  const [language, setLanguage] = useState(editingPoem?.language || 'Hindi');
  const [rasa, setRasa] = useState(editingPoem?.rasa || 'Shant (Peace/Serenity)');
  const [form, setForm] = useState(editingPoem?.form || 'Mukt Kavya (Free Verse)');
  const [theme, setTheme] = useState(editingPoem?.theme || 'vintage-parchment');
  const [tagsInput, setTagsInput] = useState(editingPoem?.tags?.join(', ') || '');
  const [audioUrl, setAudioUrl] = useState(editingPoem?.audioUrl || '');
  const [status, setStatus] = useState(editingPoem?.status || 'published');
  
  // Super Admin author selector for feeding heritage poets
  const [managedPoetsList, setManagedPoetsList] = useState([]);
  const [selectedPoetId, setSelectedPoetId] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      api.getManagedPoets().then((res) => {
        if (res.success && res.data) {
          setManagedPoetsList(res.data);
        }
      }).catch(console.error);
    }
  }, [isSuperAdmin]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const regionalLanguages = [
    'Hindi',
    'English',
    'Urdu',
    'Marathi',
    'Gujarati',
    'Bengali',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Kannada',
    'Malayalam',
    'Odia',
    'Assamese',
    'Maithili',
    'Sanskrit',
    'Bhojpuri',
    'Marwari',
  ];

  const rasaList = [
    'Shringar (Romance/Beauty)',
    'Veer (Heroic/Valor)',
    'Karun (Pathos/Compassion)',
    'Hasya (Humor/Wit)',
    'Raudra (Fury/Wrath)',
    'Bhayanak (Terror/Mystery)',
    'Bibhatsa (Disgust/Aversion)',
    'Adbhut (Wonder/Awe)',
    'Shant (Peace/Serenity)',
    'Bhakti (Devotion/Spiritual)',
    'Vatsalya (Parental Love)',
  ];

  const formsList = [
    'Mukt Kavya (Free Verse)',
    'Ghazal (Couplets/Sher)',
    'Dohe (Couplets)',
    'Kundaliya',
    'Muktak (Quatrain)',
    'Geet (Lyrical Poem)',
    'Rubaiyat',
    'Chhand / Matrik',
    'Nazm',
    'Haiku',
    'Sonnet',
  ];

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

  // Helper: auto organize into formatted stanzas
  const handleAutoFormatStanzas = () => {
    if (!content.trim()) return;
    const cleanLines = content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Group every 2 or 4 lines into stanzas
    const chunkSize = form.includes('Dohe') || form.includes('Ghazal') ? 2 : 4;
    const grouped = [];
    for (let i = 0; i < cleanLines.length; i += chunkSize) {
      grouped.push(cleanLines.slice(i, i + chunkSize).join('\n'));
    }
    setContent(grouped.join('\n\n'));
  };

  const handleStudioExportPdf = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please enter at least the Heading and Verses to export a preview PDF.');
      return;
    }
    setIsExporting(true);
    await exportKavitaToPdf('studio-preview-canvas', title);
    setIsExporting(false);
  };

  const handleSubmit = async (publishStatus = 'published') => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter the Heading / Title of your Kavita.');
      return;
    }

    if (!content.trim()) {
      setErrorMsg('Please enter the verses or content of your Kavita.');
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      language,
      rasa,
      form,
      theme,
      tags,
      audioUrl: audioUrl.trim(),
      status: publishStatus,
      ...(selectedPoetId ? { poetId: selectedPoetId } : {}),
    };

    try {
      let res;
      if (editingPoem?._id) {
        res = await api.updateKavita(editingPoem._id, payload);
      } else {
        res = await api.createKavita(payload);
      }

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#800020', '#f5e7a9', '#ffffff'],
        });

        setSuccessMsg(
          publishStatus === 'published'
            ? '✨ बधाई हो! Your Kavita has been published & added to the archives!'
            : '💾 Saved as Draft in your private studio collection.'
        );

        if (!editingPoem) {
          setTitle('');
          setSubtitle('');
          setContent('');
          setTagsInput('');
        }

        if (onPublishSuccess) {
          setTimeout(() => onPublishSuccess(res.data), 1500);
        }
      } else {
        setErrorMsg(res.message || 'Failed to submit poem.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#d4af37]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#800020]/40 border border-[#d4af37]/40 text-[#f5e7a9]">
              <PenTool className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Rozha_One'] text-white">
              रचना कक्ष (Poet's Studio)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Craft your verses with royal heading arrangements, background canvases, and high-res PDF generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStudioExportPdf}
            disabled={isExporting}
            className="btn-outline text-xs"
            title="Download preview as Royal PDF"
          >
            <FileDown className="w-4 h-4 text-[#d4af37]" />
            <span>{isExporting ? 'Generating...' : 'Live PDF Preview'}</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Grid: Left Editor & Right Live Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: THE POET'S WORKBENCH (7 COLS) */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
          {/* Super Admin Author Attribution Selector */}
          {isSuperAdmin && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#d4af37]/15 to-[#800020]/15 border border-[#d4af37]/40 shadow-sm">
              <label className="form-label flex items-center justify-between text-[#fceda2] mb-1.5">
                <span className="flex items-center gap-1.5 font-bold">
                  <Crown className="w-4 h-4 text-[#ffd700]" />
                  रचयिता चयन / Publish Under Author:
                </span>
                <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                  Super Admin
                </span>
              </label>
              <select
                value={selectedPoetId}
                onChange={(e) => setSelectedPoetId(e.target.value)}
                className="form-control text-xs bg-slate-950 text-amber-200 border-[#d4af37]/50 focus:border-[#ffd700]"
              >
                <option value="">👑 Self / Super Admin ({user?.name})</option>
                {managedPoetsList.map((mp) => (
                  <option key={mp._id} value={mp._id}>
                    🏛️ Heritage Master: {mp.name} {mp.penName ? `"${mp.penName}"` : ''} ({mp.era || 'Classical'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                You can publish as Super Admin OR feed directly on behalf of any heritage classical poet (Dinkar, Kabir, Ghalib, Nirala, Tagore, etc.).
              </p>
            </div>
          )}

          {/* 1. Heading of Kavita */}
          <div>
            <label className="form-label flex items-center justify-between">
              <span>कविता का शीर्षक / Heading of Kavita *</span>
              <span className="text-[11px] text-slate-400 font-normal">Required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. रश्मिरथी, दिल-ए-नादाँ, The Bangle Sellers, સંધ્યા ટાણે..."
              className="form-control text-lg font-['Rozha_One'] tracking-wide"
            />
          </div>

          {/* 2. Subtitle / Dedication */}
          <div>
            <label className="form-label">
              उपशीर्षक / समर्पण (Subtitle / Dedication / Theme)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. जब नाश मनुज पर छाता है, पहले विवेक मर जाता है..."
              className="form-control text-sm italic font-['Tiro_Devanagari_Hindi']"
            />
          </div>

          {/* 3. Three Dropdowns: Language, Rasa, Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">भाषा (Language) *</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-control text-xs"
              >
                {regionalLanguages.map((l) => (
                  <option key={l} value={l} className="bg-slate-900">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">रस / भाव (Rasa) *</label>
              <select
                value={rasa}
                onChange={(e) => setRasa(e.target.value)}
                className="form-control text-xs"
              >
                {rasaList.map((r) => (
                  <option key={r} value={r} className="bg-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">काव्य विधा (Form) *</label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="form-control text-xs"
              >
                {formsList.map((f) => (
                  <option key={f} value={f} className="bg-slate-900">
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Canvas Theme Picker */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
              पृष्ठभूमि थीम (Background Canvas Theme) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                    theme === t.id
                      ? isDark
                        ? 'border-[#d4af37] bg-[#d4af37]/25 text-[#ffd700] font-bold shadow-md'
                        : 'border-[#b8860b] bg-amber-100/90 text-amber-950 font-bold shadow-md'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Kavita Verses & Stanzas Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label mb-0">काव्य पंक्तियाँ (Verses / Stanzas) *</label>
              <button
                type="button"
                onClick={handleAutoFormatStanzas}
                className="text-xs text-[#d4af37] hover:text-[#f5e7a9] flex items-center gap-1 underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3" /> Auto-arrange Stanzas
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="यहाँ अपनी कविता, ग़ज़ल या दोहे लिखें... (प्रत्येक छंद/अंतरे के बीच एक खाली पंक्ति छोड़ें)"
              className="form-control font-['Tiro_Devanagari_Hindi'] text-base leading-relaxed p-4"
            />
          </div>

          {/* 6. Tags and Audio Narration Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">टैग्स (Tags / Keywords)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Separate with commas: देशभक्ति, प्रेम, कृष्ण, प्रकृति"
                className="form-control text-xs"
              />
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                ऑडियो पाठ लिंक (Audio Recitation URL)
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="Optional audio stream / YouTube link"
                className="form-control text-xs"
              />
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5 sm:gap-3 flex-wrap">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="btn-outline text-xs py-2 px-4 flex-1 sm:flex-none justify-center"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('published')}
              className="btn-royal text-xs py-2.5 px-6 shadow-xl flex-1 sm:flex-none justify-center font-bold"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Mukt Kavya'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE CANVAS PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 w-full">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-[#f5e7a9] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Live Canvas Preview
            </span>
            <span className="text-[11px] opacity-75">Full live rendition</span>
          </div>

          {/* Live Rendered Canvas for PDF Export & Instant Feedback */}
          <div
            id="studio-preview-canvas"
            className={`kavita-canvas theme-${theme} max-h-[75vh] overflow-y-auto shadow-2xl rounded-xl transition-all duration-300`}
          >
            <div className="kavita-ornament-top">❦ ════ •⊰❂⊱• ════ ❦</div>

            <h2 className="kavita-title text-xl sm:text-2xl">
              {title || 'शीर्षक यहाँ दिखाई देगा (Heading Preview)'}
            </h2>

            {subtitle && <p className="kavita-subtitle text-xs sm:text-sm">— {subtitle} —</p>}

            <div className="my-6 text-center font-['Tiro_Devanagari_Hindi'] text-base leading-relaxed whitespace-pre-line kavita-stanza kavita-body">
              {content || 'यहाँ आपकी कविता का प्रवाह जीवंत रूप में प्रकट होगा...'}
            </div>

            <div className="kavita-footer-signature">
              <span className="poet-stamp">
                ✍️ {user?.name || 'रचयिता'} {user?.penName ? `"${user.penName}"` : ''}
              </span>
              <span className="text-[11px] opacity-75">
                {language} • {form.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleStudioExportPdf}
              disabled={isExporting}
              className="text-xs text-[#d4af37] hover:text-[#f5e7a9] inline-flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download High-Resolution PDF of this layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
