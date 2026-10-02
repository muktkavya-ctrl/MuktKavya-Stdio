import React, { useState, useEffect } from 'react';
import {
  Layers,
  BookOpen,
  Eye,
  EyeOff,
  Heart,
  FileDown,
  Edit,
  Trash2,
  Plus,
  Sparkles,
  Download,
  CheckCircle,
  FileText,
  MessageSquare,
  Users,
  UserCheck,
  Globe,
  Lock,
  ArrowUpRight,
  Crown,
  ShieldAlert,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import {
  exportAnthologyBook,
  exportAnthologyTextArchive,
  exportKavitaToPdf,
  exportKavitaToText,
} from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const PoetDashboard = ({ onOpenStudio, onEditPoem, onReadPoem }) => {
  const { user, isSuperAdmin } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('poems'); // 'poems', 'comments'
  const [poems, setPoems] = useState([]);
  const [poetComments, setPoetComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filtering State within Poet's Kavitas
  const [poemSearchQuery, setPoemSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('all'); // 'all', 'visible', 'hidden', 'draft', 'published'
  const [filterLanguage, setFilterLanguage] = useState('All');
  const [filterRasa, setFilterRasa] = useState('All');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'views', 'likes', 'title', 'oldest'

  // Super Admin: Heritage Poet Switching
  const [heritagePoets, setHeritagePoets] = useState([]);
  const [selectedPoetId, setSelectedPoetId] = useState(user?._id || '');

  // Modal States
  const [deleteConfirmPoem, setDeleteConfirmPoem] = useState(null);
  const [quickEditPoem, setQuickEditPoem] = useState(null);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [notice, setNotice] = useState('');

  // Fetch poems & comments
  const fetchMyPoemsAndComments = async (poetId = null) => {
    setLoading(true);
    try {
      const targetPoet = isSuperAdmin && poetId ? poetId : null;
      const params = {};
      if (targetPoet) params.poetId = targetPoet;

      const [poemsRes, commentsRes] = await Promise.all([
        api.getMyKavitas(params),
        api.getPoetComments(),
      ]);

      if (poemsRes.success) {
        setPoems(poemsRes.data);
        setStats(poemsRes.stats);
      }
      if (commentsRes.success) {
        setPoetComments(commentsRes.data);
      }
    } catch (err) {
      console.error('Error fetching poet dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // If Super Admin, fetch all writers/heritage poets to allow managing them
  useEffect(() => {
    if (isSuperAdmin) {
      api.getAllUsers({ role: 'writer' }).then((res) => {
        if (res.success && res.data) {
          setHeritagePoets(res.data);
        }
      }).catch((e) => console.warn('Heritage poets fetch note:', e));
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchMyPoemsAndComments(selectedPoetId);
  }, [selectedPoetId]);

  // Show / Hide on Website Toggle
  const handleToggleVisibility = async (poemId, currentVis, poemTitle) => {
    const newVisibility = !currentVis;

    // Optimistic UI update
    setPoems((prev) =>
      prev.map((p) => (p._id === poemId ? { ...p, isVisible: newVisibility } : p))
    );

    try {
      const res = await api.toggleVisibility(poemId, newVisibility);
      if (res.success) {
        setNotice(
          newVisibility
            ? `🌐 "${poemTitle}" is now LIVE on the public website for all readers!`
            : `🔒 "${poemTitle}" is now HIDDEN from the public website (saved privately in your Diwan).`
        );
        setTimeout(() => setNotice(''), 3500);
      } else {
        // Rollback on error
        setPoems((prev) =>
          prev.map((p) => (p._id === poemId ? { ...p, isVisible: currentVis } : p))
        );
        alert(res.message || 'Failed to update visibility');
      }
    } catch (err) {
      console.error('Visibility toggle error:', err);
      // Rollback
      setPoems((prev) =>
        prev.map((p) => (p._id === poemId ? { ...p, isVisible: currentVis } : p))
      );
    }
  };

  // Delete Poem
  const handleConfirmDelete = async () => {
    if (!deleteConfirmPoem) return;
    try {
      const res = await api.deleteKavita(deleteConfirmPoem._id);
      if (res.success) {
        setPoems((prev) => prev.filter((p) => p._id !== deleteConfirmPoem._id));
        setNotice(`🗑️ "${deleteConfirmPoem.title}" was permanently removed from your Diwan.`);
        setTimeout(() => setNotice(''), 3500);
      } else {
        alert(res.message || 'Failed to delete poem');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteConfirmPoem(null);
    }
  };

  // Quick Edit Save
  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!quickEditPoem) return;
    setIsSavingQuickEdit(true);

    try {
      const payload = {
        title: quickEditPoem.title,
        subtitle: quickEditPoem.subtitle,
        language: quickEditPoem.language,
        rasa: quickEditPoem.rasa,
        form: quickEditPoem.form,
        isVisible: quickEditPoem.isVisible,
        status: quickEditPoem.status,
      };

      const res = await api.updateKavita(quickEditPoem._id, payload);
      if (res.success) {
        setPoems((prev) =>
          prev.map((p) => (p._id === quickEditPoem._id ? { ...p, ...payload } : p))
        );
        setNotice(`✨ "${quickEditPoem.title}" metadata updated successfully!`);
        setTimeout(() => setNotice(''), 3500);
        setQuickEditPoem(null);
      } else {
        alert(res.message || 'Failed to update poem metadata');
      }
    } catch (err) {
      console.error('Quick edit error:', err);
      alert('Error updating poem');
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  // Bulk Export All Poems as a complete Anthology / Diwan Book PDF
  const handleExportAllDiwanPdf = async () => {
    if (poems.length === 0) {
      alert('You have no poems to export in your Diwan yet.');
      return;
    }

    setIsExportingAll(true);
    setNotice('Compiling your Diwan Anthology PDF book with cover and stanzas...');
    try {
      const params = isSuperAdmin && selectedPoetId ? { poetId: selectedPoetId } : {};
      const res = await api.exportAllMyKavitas(params);
      if (res.success && res.anthology) {
        await exportAnthologyBook(res.anthology);
        setNotice('✨ Your Diwan Anthology book PDF has been successfully generated!');
        setTimeout(() => setNotice(''), 4500);
      }
    } catch (err) {
      console.error('Export all error:', err);
      alert('Failed to generate anthology book. Please try again.');
    } finally {
      setIsExportingAll(false);
    }
  };

  // Bulk Export All Poems as clean UTF-8 Text Edition
  const handleExportAllDiwanText = async () => {
    if (poems.length === 0) {
      alert('You have no poems to export in your Diwan yet.');
      return;
    }

    try {
      const params = isSuperAdmin && selectedPoetId ? { poetId: selectedPoetId } : {};
      const res = await api.exportAllMyKavitas(params);
      if (res.success && res.anthology) {
        exportAnthologyTextArchive(res.anthology);
        setNotice('✨ Diwan Text Edition (.txt) exported in clean UTF-8!');
        setTimeout(() => setNotice(''), 4500);
      }
    } catch (err) {
      console.error('Export text error:', err);
    }
  };

  // Bulk Export as JSON Archive with UTF-8 BOM
  const handleExportJsonArchive = async () => {
    try {
      const params = isSuperAdmin && selectedPoetId ? { poetId: selectedPoetId } : {};
      const res = await api.exportAllMyKavitas(params);
      if (res.success && res.anthology) {
        const blob = new Blob(['\uFEFF' + JSON.stringify(res.anthology, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = `Diwan_${(user?.name || 'Poet').replace(/\s+/g, '_')}_Archive.json`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('JSON export error:', err);
    }
  };

  // Filter & Search Logic for Poet's Own Kavitas
  const filteredPoems = poems
    .filter((p) => {
      // 1. Search Query Filter
      if (poemSearchQuery.trim()) {
        const q = poemSearchQuery.toLowerCase().trim();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const subMatch = (p.subtitle || '').toLowerCase().includes(q);
        const contentMatch = (p.content || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q));
        const rasaMatch = (p.rasa || '').toLowerCase().includes(q);
        const langMatch = (p.language || '').toLowerCase().includes(q);

        if (!titleMatch && !subMatch && !contentMatch && !tagMatch && !rasaMatch && !langMatch) {
          return false;
        }
      }

      // 2. Visibility / Status Filter
      if (filterVisibility === 'visible') {
        if (p.isVisible === false) return false;
      } else if (filterVisibility === 'hidden') {
        if (p.isVisible !== false) return false;
      } else if (filterVisibility === 'draft') {
        if (p.status !== 'draft') return false;
      } else if (filterVisibility === 'published') {
        if (p.status !== 'published' && p.status !== 'featured') return false;
      }

      // 3. Language Filter
      if (filterLanguage !== 'All' && p.language !== filterLanguage) {
        return false;
      }

      // 4. Rasa Filter
      if (filterRasa !== 'All' && p.rasa !== filterRasa) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
      if (sortBy === 'likes') return (b.likesCount || 0) - (a.likesCount || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      // Default: latest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Calculate distinct counts
  const liveCount = poems.filter((p) => p.isVisible !== false && p.status === 'published').length;
  const hiddenCount = poems.filter((p) => p.isVisible === false).length;
  const draftCount = poems.filter((p) => p.status === 'draft').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-['Poppins']">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#d4af37]/25 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-['Rozha_One'] text-white">
                मेरी कविताएँ (My Kavitas Hub)
              </h1>
              <p className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider mt-0.5">
                दीवान-ए-{user?.penName || user?.name} • Personal Collection & Verse Controls
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Search, manage, modify, and control public visibility of your verses. Download complete PDF books or clean UTF-8 archives.
          </p>
        </div>

        {/* Action Buttons: Write New & Export All */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleExportAllDiwanText}
            className="btn-outline text-xs py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
            title="Download clean UTF-8 Text Edition (Never corrupted on Windows Notepad)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Text Archive</span>
          </button>

          <button
            onClick={handleExportJsonArchive}
            className="btn-outline text-xs py-2 px-3 cursor-pointer flex items-center justify-center flex-1 sm:flex-none"
            title="Download full JSON collection backup with UTF-8 BOM"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON Backup</span>
          </button>

          <button
            onClick={handleExportAllDiwanPdf}
            disabled={isExportingAll}
            className="btn-royal text-xs py-2 px-3.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer w-full xs:w-auto flex-1 sm:flex-none"
            title="Export complete poet anthology book PDF"
          >
            <FileDown className="w-4 h-4" />
            <span className="font-bold">
              {isExportingAll ? 'Compiling...' : 'Export Diwan (PDF)'}
            </span>
          </button>

          <button
            onClick={onOpenStudio}
            className="btn-burgundy text-xs py-2 px-4 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer font-semibold w-full xs:w-auto flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            <span>+ Write New</span>
          </button>
        </div>
      </div>

      {/* Super Admin Heritage Poet Switcher */}
      {isSuperAdmin && heritagePoets.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-[#130d1d] border border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-[#ffd700] border border-amber-500/40">
              <Crown className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider font-['Rozha_One']">
                Super Admin Heritage Mode
              </p>
              <p className="text-[11px] text-slate-300">
                You have global master access. Switch to manage verses of any classical poet or your personal Diwan:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPoetId || ''}
              onChange={(e) => setSelectedPoetId(e.target.value)}
              className="bg-slate-950 text-[#ffd700] text-xs font-semibold px-3 py-2 rounded-xl border border-amber-500/50 shadow-inner focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              <option value={user?._id || ''}>👑 My Personal Diwan ({user?.name})</option>
              {heritagePoets
                .filter((p) => p._id !== user?._id)
                .map((poet) => (
                  <option key={poet._id} value={poet._id}>
                    🖋️ {poet.name} {poet.penName ? `"${poet.penName}"` : ''}
                  </option>
                ))}
            </select>

            <button
              onClick={() => fetchMyPoemsAndComments(selectedPoetId)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              title="Refresh Collection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/45 text-[#f5e7a9] text-sm flex items-center gap-2.5 animate-fade-in shadow-md">
          <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-8">
        <div className="glass-card p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Total Verses</p>
          <p className="text-2xl font-bold text-white mt-1 font-['Rozha_One']">
            {stats?.totalPoems || poems.length}
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">
            {liveCount} Public on Web
          </span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Total Views</p>
          <p className="text-2xl font-bold text-[#d4af37] mt-1 flex items-center gap-1.5 font-['Rozha_One']">
            <Eye className="w-5 h-5 opacity-80" />
            {stats?.totalViews || 0}
          </p>
          <span className="text-[10px] text-slate-400">Impressions</span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Appreciations</p>
          <p className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-1.5 font-['Rozha_One']">
            <Heart className="w-5 h-5 fill-rose-500/20" />
            {stats?.totalLikes || 0}
          </p>
          <span className="text-[10px] text-slate-400">Heartfelt likes</span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Hidden / Private</p>
          <p className="text-2xl font-bold text-amber-300 mt-1 flex items-center gap-1.5 font-['Rozha_One']">
            <Lock className="w-5 h-5 opacity-80" />
            {hiddenCount}
          </p>
          <span className="text-[10px] text-amber-400/80">Only you can view</span>
        </div>

        <div className="glass-card p-4 border border-slate-800 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400">Draft Works</p>
          <p className="text-2xl font-bold text-sky-400 mt-1 flex items-center gap-1.5 font-['Rozha_One']">
            <FileText className="w-5 h-5 opacity-80" />
            {draftCount}
          </p>
          <span className="text-[10px] text-sky-400/80">Unfinished pieces</span>
        </div>
      </div>

      {/* Main Tab Navigation: Poems vs Reader Reflections */}
      <div className="flex items-center gap-4 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('poems')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'poems'
              ? 'border-[#d4af37] text-[#f5e7a9]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#d4af37]" />
          <span>मेरी कविताएँ एवं नियंत्रण ({poems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'comments'
              ? 'border-[#d4af37] text-[#f5e7a9]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>पाठक प्रतिक्रियाएँ ({poetComments.length})</span>
        </button>
      </div>

      {/* VIEW 1: POET'S DEDICATED KAVITAS MANAGEMENT VIEW */}
      {activeTab === 'poems' && (
        <div className="space-y-5">
          {/* Dedicated Search & Filter Command Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
            {/* Search Input on Poet's Kavitas */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="🔍 Search in your kavitas by title, verses, lines, or tags..."
                value={poemSearchQuery}
                onChange={(e) => setPoemSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
              {poemSearchQuery && (
                <button
                  onClick={() => setPoemSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills, Language, Rasa and Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Status / Visibility Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilterVisibility('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterVisibility === 'all'
                      ? 'bg-[#d4af37] text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  All ({poems.length})
                </button>

                <button
                  onClick={() => setFilterVisibility('visible')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    filterVisibility === 'visible'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>🌐 Live on Web ({liveCount})</span>
                </button>

                <button
                  onClick={() => setFilterVisibility('hidden')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    filterVisibility === 'hidden'
                      ? 'bg-rose-500 text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>🔒 Hidden ({hiddenCount})</span>
                </button>

                <button
                  onClick={() => setFilterVisibility('draft')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    filterVisibility === 'draft'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  Drafts ({draftCount})
                </button>
              </div>

              {/* Dropdown Filters: Language, Rasa, Sort */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Language Filter */}
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                >
                  <option value="All">All Languages</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="English">English</option>
                </select>

                {/* Rasa Filter */}
                <select
                  value={filterRasa}
                  onChange={(e) => setFilterRasa(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                >
                  <option value="All">All Rasas</option>
                  <option value="Veer">Veer (वीर)</option>
                  <option value="Shringar">Shringar (शृंगार)</option>
                  <option value="Karun">Karun (करुण)</option>
                  <option value="Shant">Shant (शांत)</option>
                  <option value="Bhakti">Bhakti (भक्ति)</option>
                  <option value="Hasya">Hasya (हास्य)</option>
                  <option value="Adbhut">Adbhut (अद्भुत)</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 text-[#ffd700] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#d4af37]/40 focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer"
                >
                  <option value="latest">Sort: Newest First</option>
                  <option value="views">Sort: Most Viewed (👁️)</option>
                  <option value="likes">Sort: Most Appreciated (❤️)</option>
                  <option value="title">Sort: Title (A-Z)</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>
              </div>
            </div>

            {/* Filter Summary & Hit Counter */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <div>
                Showing <span className="font-bold text-[#ffd700]">{filteredPoems.length}</span> of{' '}
                <span className="font-bold text-white">{poems.length}</span> poems in your Diwan
                {poemSearchQuery && (
                  <span className="ml-1 text-slate-400">
                    matching "<span className="text-white font-medium">{poemSearchQuery}</span>"
                  </span>
                )}
              </div>

              {(poemSearchQuery || filterVisibility !== 'all' || filterLanguage !== 'All' || filterRasa !== 'All') && (
                <button
                  onClick={() => {
                    setPoemSearchQuery('');
                    setFilterVisibility('all');
                    setFilterLanguage('All');
                    setFilterRasa('All');
                  }}
                  className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Poems List */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
              <span>Loading your collection...</span>
            </div>
          ) : filteredPoems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-md">
              <BookOpen className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-3" />
              <h3 className="text-base font-medium text-slate-200 mb-1">
                {poemSearchQuery ? 'No kavitas matched your search' : 'No poems in this filter'}
              </h3>
              <p className="text-xs text-slate-400 mb-5 max-w-sm mx-auto">
                {poemSearchQuery
                  ? 'Try searching with different keywords or clearing filters.'
                  : 'Start composing new verses to expand your royal Diwan.'}
              </p>
              <div className="flex items-center justify-center gap-2">
                {poemSearchQuery && (
                  <button
                    onClick={() => setPoemSearchQuery('')}
                    className="btn-outline text-xs py-1.5 px-3"
                  >
                    Clear Search
                  </button>
                )}
                <button onClick={onOpenStudio} className="btn-royal text-xs py-2 px-4">
                  <Plus className="w-3.5 h-3.5" />
                  Write in Studio
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredPoems.map((p) => {
                const isVisible = p.isVisible !== false;

                // First lines snippet
                let snippet = '';
                if (p.stanzas && p.stanzas.length > 0 && p.stanzas[0].lines) {
                  snippet = p.stanzas[0].lines.slice(0, 2).join(' / ');
                } else if (p.content) {
                  snippet = p.content.slice(0, 140);
                }

                return (
                  <div
                    key={p._id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                      isVisible
                        ? 'bg-slate-900/90 border-slate-800 hover:border-[#d4af37]/45'
                        : 'bg-slate-950/95 border-amber-900/30 opacity-90'
                    }`}
                  >
                    {/* Left Details: Title, Subtitle, Badges, Excerpt */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => onReadPoem(p)}
                          className="font-['Rozha_One'] text-lg sm:text-xl text-white hover:text-[#ffd700] transition-colors cursor-pointer"
                        >
                          {p.title}
                        </span>

                        {/* Visibility Pill Badge */}
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                            isVisible
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                          }`}
                        >
                          {isVisible ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {isVisible ? 'Public on Web' : 'Hidden (Private)'}
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                            p.status === 'published' || p.status === 'featured'
                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#800020]/30 text-[#fceda2] border border-[#d4af37]/35 font-medium">
                          {p.language || 'Hindi'}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {p.rasa}
                        </span>

                        {p.form && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            • {p.form}
                          </span>
                        )}
                      </div>

                      {p.subtitle && (
                        <p className="text-xs text-[#d4af37]/90 italic font-['Tiro_Devanagari_Hindi'] line-clamp-1">
                          — {p.subtitle}
                        </p>
                      )}

                      {snippet && (
                        <p className="text-xs text-slate-300 font-['Tiro_Devanagari_Hindi'] italic line-clamp-1 bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                          "{snippet}..."
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span>Created: {new Date(p.createdAt).toLocaleDateString()}</span>
                        {p.tags && p.tags.length > 0 && (
                          <span className="hidden sm:inline">
                            • Tags: {p.tags.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Controls: Views & Likes Metrics + Action Buttons */}
                    <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800/80 w-full md:w-auto justify-between md:justify-end">
                      {/* Live Engagement Metrics */}
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
                        <span className="flex items-center gap-1 text-[#ffd700]" title="Total Readers Viewed">
                          <Eye className="w-3.5 h-3.5" />
                          <span className="font-bold">{p.viewsCount || 0}</span>
                        </span>
                        <span className="w-px h-3 bg-slate-800"></span>
                        <span className="flex items-center gap-1 text-rose-400" title="Appreciations">
                          <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                          <span className="font-bold">{p.likesCount || 0}</span>
                        </span>
                      </div>

                      {/* Interactive Visibility Toggle Button (Hide / Show) */}
                      <button
                        onClick={() => handleToggleVisibility(p._id, isVisible, p.title)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm shrink-0 ${
                          isVisible
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                        title={
                          isVisible
                            ? 'Poem is LIVE on website. Click to HIDE from public.'
                            : 'Poem is HIDDEN. Click to MAKE LIVE on public website.'
                        }
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Live: ON</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span>Live: OFF</span>
                          </>
                        )}
                      </button>

                      {/* Action Icon Cluster */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Quick Read / Preview */}
                        <button
                          onClick={() => onReadPoem(p)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Preview full poem in reader"
                        >
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                        </button>

                        {/* Quick Metadata Edit Modal */}
                        <button
                          onClick={() => setQuickEditPoem(p)}
                          className="p-2 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Quick edit metadata & title"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>

                        {/* Edit in Studio */}
                        <button
                          onClick={() => onEditPoem(p)}
                          className="p-2 rounded-xl bg-slate-800 text-sky-400 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Open in Studio to edit stanzas, verses & audio"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Export PDF */}
                        <button
                          onClick={() => exportKavitaToPdf(p, p.title)}
                          className="p-2 rounded-xl bg-slate-800 text-[#d4af37] hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Export single poem PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {/* Export Text (.txt) */}
                        <button
                          onClick={() => exportKavitaToText(p)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Download clean UTF-8 text"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmPoem(p)}
                          className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Delete poem from Diwan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: READER REFLECTIONS / COMMENTS INBOX */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Reader Reflections Received on Your Poetry ({poetComments.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Every reflection written by readers is archived here for your poetic journey.
            </p>
          </div>

          {poetComments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No reflections received yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                As readers explore your verses on the website, their heartfelt reflections will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {poetComments.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#d4af37]/35 transition-all space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold text-[10px]">
                        {c.userName?.charAt(0) || 'R'}
                      </div>
                      <span className="font-semibold text-[#f5e7a9]">{c.userName}</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        • {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {c.kavita && (
                      <span className="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        Poem: "{c.kavita.title}"
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 font-['Tiro_Devanagari_Hindi'] bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed italic">
                    "{c.content}"
                  </p>

                  {c.kavita && (
                    <div className="text-right">
                      <button
                        onClick={() => onReadPoem(c.kavita)}
                        className="text-[11px] text-[#d4af37] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open "{c.kavita.title}" & Read Verse</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: QUICK INLINE METADATA EDITOR */}
      {quickEditPoem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#d4af37]/45 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-[#ffd700]">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white font-['Rozha_One']">
                  Quick Edit: "{quickEditPoem.title}"
                </h3>
              </div>
              <button
                onClick={() => setQuickEditPoem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Poem Title (शीर्षक)</label>
                <input
                  type="text"
                  value={quickEditPoem.title || ''}
                  onChange={(e) => setQuickEditPoem({ ...quickEditPoem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / Line of Muse (उप-शीर्षक)</label>
                <input
                  type="text"
                  value={quickEditPoem.subtitle || ''}
                  onChange={(e) => setQuickEditPoem({ ...quickEditPoem, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Language (भाषा)</label>
                  <select
                    value={quickEditPoem.language || 'Hindi'}
                    onChange={(e) => setQuickEditPoem({ ...quickEditPoem, language: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  >
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Poetic Rasa (रस)</label>
                  <select
                    value={quickEditPoem.rasa || 'Shant'}
                    onChange={(e) => setQuickEditPoem({ ...quickEditPoem, rasa: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  >
                    <option value="Veer">Veer (वीर रस)</option>
                    <option value="Shringar">Shringar (शृंगार रस)</option>
                    <option value="Karun">Karun (करुण रस)</option>
                    <option value="Shant">Shant (शांत रस)</option>
                    <option value="Bhakti">Bhakti (भक्ति रस)</option>
                    <option value="Hasya">Hasya (हास्य रस)</option>
                    <option value="Adbhut">Adbhut (अद्भुत रस)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Poetic Form (शैली)</label>
                  <select
                    value={quickEditPoem.form || 'Mukt Kavya'}
                    onChange={(e) => setQuickEditPoem({ ...quickEditPoem, form: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  >
                    <option value="Mukt Kavya">Mukt Kavya (Free Verse)</option>
                    <option value="Ghazal">Ghazal (ग़ज़ल)</option>
                    <option value="Dohe">Dohe (दोहे)</option>
                    <option value="Geet">Geet (गीत)</option>
                    <option value="Kundaliya">Kundaliya (कुंडलिया)</option>
                    <option value="Muktak">Muktak (मुक्तक)</option>
                    <option value="Rubaiyat">Rubaiyat (रुबाई)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website Visibility</label>
                  <select
                    value={quickEditPoem.isVisible !== false ? 'true' : 'false'}
                    onChange={(e) =>
                      setQuickEditPoem({ ...quickEditPoem, isVisible: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                  >
                    <option value="true">🌐 Public (Visible on Website)</option>
                    <option value="false">🔒 Hidden (Private in Diwan)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickEditPoem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickEdit}
                  className="btn-royal text-xs py-2 px-5 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingQuickEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM PERMANENT DELETE MODAL */}
      {deleteConfirmPoem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-['Rozha_One']">
                Delete "{deleteConfirmPoem.title}"?
              </h3>
              <p className="text-xs text-slate-400 mt-1.5">
                Are you sure you want to permanently remove this kavita from your Diwan? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmPoem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Keep Kavita
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
