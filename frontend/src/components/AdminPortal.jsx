import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Sparkles,
  Mail,
  Send,
  CheckCircle,
  Eye,
  EyeOff,
  Heart,
  Crown,
  Trash2,
  Check,
  RefreshCw,
  Search,
  Ban,
  UserX,
  UserCheck,
  Edit3,
  X,
  Save,
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  FileText,
  Plus,
  Feather,
  History,
  Globe,
  Activity,
  Download,
  Laptop,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPortal = () => {
  const { user, isSuperAdmin } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('heritage'); // 'heritage', 'users', 'poems', 'telemetry', 'brevo'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [poemsList, setPoemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 🛡️ Security Telemetry & Audit State
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [telemetryStats, setTelemetryStats] = useState(null);
  const [telemetrySearch, setTelemetrySearch] = useState('');
  const [telemetryActionFilter, setTelemetryActionFilter] = useState('all');
  const [telemetryRiskOnly, setTelemetryRiskOnly] = useState(false);
  const [telemetryDeviceFilter, setTelemetryDeviceFilter] = useState('all');

  // 🏛️ Heritage Classical Vault State
  const [managedPoets, setManagedPoets] = useState([]);
  const [heritagePresets, setHeritagePresets] = useState([]);
  const [isPoetModalOpen, setIsPoetModalOpen] = useState(false);
  const [editingPoet, setEditingPoet] = useState(null);
  const [poetForm, setPoetForm] = useState({
    name: '',
    penName: '',
    era: '',
    bio: '',
    languages: ['Hindi'],
    avatar: '',
  });

  const [isFeedPoemModalOpen, setIsFeedPoemModalOpen] = useState(false);
  const [targetPoetForFeed, setTargetPoetForFeed] = useState(null);
  const [feedPoemForm, setFeedPoemForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    language: 'Hindi',
    rasa: 'Veer (Heroic/Valor)',
    form: 'Mukt Kavya (Free Verse)',
    theme: 'royal-velvet',
    tags: '',
    isFeatured: false,
  });

  const [selectedHeritagePoetView, setSelectedHeritagePoetView] = useState('all');
  const [presetSearch, setPresetSearch] = useState('');

  // Filtering & Search
  const [searchUser, setSearchUser] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all', 'active', 'restricted', 'blocked', 'writer', 'reader'

  const [searchPoem, setSearchPoem] = useState('');
  const [poemStatusFilter, setPoemStatusFilter] = useState('all'); // 'all', 'published', 'featured', 'hidden'

  // Edit Poem Modal State
  const [editingPoemModal, setEditingPoemModal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    language: 'Hindi',
    rasa: 'Shant (Peace/Serenity)',
    form: 'Mukt Kavya (Free Verse)',
    status: 'published',
    isVisible: true,
  });

  // Brevo Mail Testing State
  const [testEmailRecipient, setTestEmailRecipient] = useState(user?.email || 'praveen.pr105@gmail.com');
  const [brevoSending, setBrevoSending] = useState(false);
  const [brevoResult, setBrevoResult] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, poemsRes, managedPoetsRes, presetsRes, telemetryStatsRes, telemetryLogsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers({ limit: 100 }),
        api.getKavitas({ limit: 100, sort: 'latest' }),
        api.getManagedPoets(),
        api.getHeritagePresets(),
        api.getSecurityTelemetryStats(),
        api.getSecurityTelemetry({ limit: 100 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsersList(usersRes.data || []);
      if (poemsRes.success) setPoemsList(poemsRes.data || []);
      if (managedPoetsRes.success) setManagedPoets(managedPoetsRes.data || []);
      if (presetsRes.success) setHeritagePresets(presetsRes.presets || []);
      if (telemetryStatsRes.success) setTelemetryStats(telemetryStatsRes.stats || null);
      if (telemetryLogsRes.success) setTelemetryLogs(telemetryLogsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error syncing with database.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTelemetryAudit = (format = 'json') => {
    if (!telemetryLogs || telemetryLogs.length === 0) {
      showToast('No telemetry records available to export.');
      return;
    }

    if (format === 'json') {
      const jsonBlob = new Blob([JSON.stringify(telemetryLogs, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mukt_Kavya_Security_Audit_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Security audit JSON log exported.');
    } else {
      const headers = ['Timestamp', 'IP_Address', 'Country', 'Region', 'Action', 'Target_Poem', 'Poet_Author', 'User_Account', 'Device', 'OS', 'Browser', 'Risk_Score', 'Flags'];
      const rows = telemetryLogs.map((l) => [
        `"${new Date(l.timestamp).toISOString()}"`,
        `"${l.ipAddress || ''}"`,
        `"${l.geo?.country || ''}"`,
        `"${l.geo?.region || ''}"`,
        `"${l.action || ''}"`,
        `"${(l.kavitaTitle || '').replace(/"/g, '""')}"`,
        `"${(l.kavitaAuthor || '').replace(/"/g, '""')}"`,
        `"${l.userEmail || 'Anonymous'}"`,
        `"${l.device || ''}"`,
        `"${l.os || ''}"`,
        `"${l.browser || ''}"`,
        l.riskScore || 0,
        `"${(l.riskFlags || []).join('; ')}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mukt_Kavya_Security_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Security audit CSV log exported.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================================
  // 🏛️ HERITAGE & MANAGED POETS ACTIONS (SUPER ADMIN EXCLUSIVE)
  // ============================================================================

  const handleOpenCreatePoet = (preset = null) => {
    if (preset) {
      setPoetForm({
        name: preset.name,
        penName: preset.penName || '',
        era: preset.era || '',
        bio: preset.bio || '',
        languages: preset.languages || ['Hindi'],
        avatar: preset.avatar || '',
      });
    } else {
      setPoetForm({
        name: '',
        penName: '',
        era: '',
        bio: '',
        languages: ['Hindi'],
        avatar: '',
      });
    }
    setEditingPoet(null);
    setIsPoetModalOpen(true);
  };

  const handleOpenEditPoet = (poet) => {
    setEditingPoet(poet);
    setPoetForm({
      name: poet.name || '',
      penName: poet.penName || '',
      era: poet.era || '',
      bio: poet.bio || '',
      languages: poet.languages || ['Hindi'],
      avatar: poet.avatar || '',
    });
    setIsPoetModalOpen(true);
  };

  const handleSavePoet = async (e) => {
    e.preventDefault();
    if (!poetForm.name.trim()) {
      alert('Poet name is required');
      return;
    }

    setActionLoading(true);
    try {
      if (editingPoet?._id) {
        const res = await api.updateManagedPoet(editingPoet._id, poetForm);
        if (res.success) {
          showToast(`Heritage poet "${poetForm.name}" updated successfully.`);
          setIsPoetModalOpen(false);
          loadData();
        } else {
          alert(res.message || 'Update failed');
        }
      } else {
        const res = await api.createManagedPoet(poetForm);
        if (res.success) {
          showToast(`Heritage poet "${poetForm.name}" added to the archive vault.`);
          setIsPoetModalOpen(false);
          loadData();
        } else {
          alert(res.message || 'Creation failed');
        }
      }
    } catch (err) {
      console.error('Save poet error:', err);
      alert('Failed to save poet.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteManagedPoet = async (poetId, name) => {
    if (!window.confirm(`Are you sure you want to permanently remove heritage poet "${name}" and all their archived verses?`)) return;
    setActionLoading(true);
    try {
      const res = await api.deleteManagedPoet(poetId);
      if (res.success) {
        showToast(`Poet "${name}" and verses removed from archive.`);
        loadData();
      } else {
        alert(res.message || 'Failed to remove poet');
      }
    } catch (err) {
      console.error('Delete managed poet error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFeedPoemModal = (poet) => {
    setTargetPoetForFeed(poet);
    setFeedPoemForm({
      title: '',
      subtitle: '',
      content: '',
      language: poet.languages?.[0] || 'Hindi',
      rasa: 'Veer (Heroic/Valor)',
      form: 'Mukt Kavya (Free Verse)',
      theme: 'royal-velvet',
      tags: poet.penName || poet.name,
      isFeatured: false,
    });
    setIsFeedPoemModalOpen(true);
  };

  const handleSaveFeedPoem = async (e) => {
    e.preventDefault();
    if (!targetPoetForFeed) return;
    if (!feedPoemForm.title.trim() || !feedPoemForm.content.trim()) {
      alert('Title and Content are required to feed a poem.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.feedPoemForPoet(targetPoetForFeed._id, feedPoemForm);
      if (res.success) {
        showToast(`Poem "${feedPoemForm.title}" successfully fed into archive under ${targetPoetForFeed.name}.`);
        setIsFeedPoemModalOpen(false);
        loadData();
      } else {
        alert(res.message || 'Failed to feed poem');
      }
    } catch (err) {
      console.error('Feed poem error:', err);
      alert('Error feeding poem.');
    } finally {
      setActionLoading(false);
    }
  };

  // 1. CREATOR MANAGEMENT ACTIONS
  const handleToggleRestrict = async (targetUser) => {
    if (targetUser.role === 'superadmin') {
      alert('Cannot restrict Super Administrator accounts.');
      return;
    }
    const actionName = targetUser.isRestricted ? 'lift restriction on' : 'restrict poem submissions for';
    if (!window.confirm(`Are you sure you want to ${actionName} "${targetUser.name}"?`)) return;

    setActionLoading(true);
    try {
      const res = await api.toggleRestrictUser(targetUser._id);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isRestricted: res.isRestricted } : u
          )
        );
        showToast(res.message);
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err) {
      console.error('Restrict error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (targetUser) => {
    if (targetUser.role === 'superadmin') {
      alert('Cannot block Super Administrator accounts.');
      return;
    }
    const actionName = targetUser.isBlocked ? 'unblock and restore' : 'block and suspend login access for';
    if (!window.confirm(`Are you sure you want to ${actionName} "${targetUser.name}"?`)) return;

    setActionLoading(true);
    try {
      const res = await api.toggleBlockUser(targetUser._id);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isBlocked: res.isBlocked } : u
          )
        );
        showToast(res.message);
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err) {
      console.error('Block error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.role === 'superadmin') {
      alert('Super Administrator accounts cannot be deleted.');
      return;
    }
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION WARNING: Are you sure you want to delete creator "${targetUser.name}" (${targetUser.email}) and ALL poems authored by them from the platform? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const res = await api.deleteUser(targetUser._id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== targetUser._id));
        setPoemsList((prev) =>
          prev.filter((p) => {
            const authorId = p.author?._id ? p.author._id.toString() : p.author?.toString();
            return authorId !== targetUser._id.toString();
          })
        );
        showToast(res.message || `Creator ${targetUser.name} deleted.`);
      } else {
        alert(res.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setActionLoading(true);
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        showToast(`Privilege updated to ${newRole}`);
      } else {
        alert(res.message || 'Failed to update role');
      }
    } catch (err) {
      console.error('Update role error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. POEM MODERATION & DIRECT EDITING ACTIONS
  const handleOpenEditModal = (poem) => {
    setEditingPoemModal(poem);
    setEditFormData({
      title: poem.title || '',
      subtitle: poem.subtitle || '',
      content: poem.content || '',
      language: poem.language || 'Hindi',
      rasa: poem.rasa || 'Shant (Peace/Serenity)',
      form: poem.form || 'Mukt Kavya (Free Verse)',
      status: poem.status || 'published',
      isVisible: poem.isVisible !== false,
    });
  };

  const handleSavePoemEdit = async (e) => {
    e.preventDefault();
    if (!editingPoemModal) return;

    setActionLoading(true);
    try {
      const res = await api.editKavitaAdmin(editingPoemModal._id, editFormData);
      if (res.success && res.data) {
        setPoemsList((prev) =>
          prev.map((p) => (p._id === editingPoemModal._id ? { ...p, ...res.data } : p))
        );
        showToast(`Poem "${editFormData.title}" updated by Super Administrator.`);
        setEditingPoemModal(null);
      } else {
        alert(res.message || 'Failed to update poem.');
      }
    } catch (err) {
      console.error('Edit poem error:', err);
      alert('Error updating poem content.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePoem = async (poemId, title) => {
    if (!window.confirm(`Permanently remove poem "${title}" from the platform archive?`)) return;
    setActionLoading(true);
    try {
      const res = await api.deleteKavitaAdmin(poemId);
      if (res.success) {
        setPoemsList((prev) => prev.filter((p) => p._id !== poemId));
        showToast(`Poem "${title}" removed.`);
      } else {
        alert(res.message || 'Failed to delete poem.');
      }
    } catch (err) {
      console.error('Delete poem error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVisibility = async (poemId, currentVis) => {
    try {
      const res = await api.toggleVisibility(poemId, !currentVis);
      if (res.success) {
        setPoemsList((prev) =>
          prev.map((p) => (p._id === poemId ? { ...p, isVisible: !currentVis } : p))
        );
        showToast(!currentVis ? 'Poem is now visible to the public.' : 'Poem hidden from public view.');
      }
    } catch (err) {
      console.error('Visibility toggle error:', err);
    }
  };

  const handleToggleFeature = async (poemId, currentFeatured) => {
    try {
      const res = await api.moderateKavita(poemId, {
        status: 'published',
        isFeatured: !currentFeatured,
      });
      if (res.success) {
        setPoemsList((prev) =>
          prev.map((p) =>
            p._id === poemId ? { ...p, isFeatured: !currentFeatured, status: 'published' } : p
          )
        );
        showToast(!currentFeatured ? 'Set as Featured Verse of the Day!' : 'Unfeatured.');
      }
    } catch (err) {
      console.error('Feature toggle error:', err);
    }
  };

  // 3. BREVO TEST EMAIL
  const handleSendBrevoTest = async (e) => {
    e.preventDefault();
    if (!testEmailRecipient) return;

    setBrevoSending(true);
    setBrevoResult(null);
    try {
      const res = await api.testBrevoEmail(testEmailRecipient);
      setBrevoResult(res);
      showToast('Brevo email test executed!');
    } catch (err) {
      console.error('Brevo test error:', err);
      setBrevoResult({ success: false, message: 'Brevo connection test failed.' });
    } finally {
      setBrevoSending(false);
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.penName?.toLowerCase().includes(searchUser.toLowerCase());

    if (!matchesSearch) return false;

    if (userStatusFilter === 'restricted') return u.isRestricted;
    if (userStatusFilter === 'blocked') return u.isBlocked;
    if (userStatusFilter === 'active') return !u.isBlocked && !u.isRestricted;
    if (userStatusFilter === 'writer') return u.role === 'writer';
    if (userStatusFilter === 'reader') return u.role === 'reader';
    return true;
  });

  // Filtered Poems
  const filteredPoems = poemsList.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchPoem.toLowerCase()) ||
      p.authorName?.toLowerCase().includes(searchPoem.toLowerCase()) ||
      p.language?.toLowerCase().includes(searchPoem.toLowerCase()) ||
      p.rasa?.toLowerCase().includes(searchPoem.toLowerCase());

    if (!matchesSearch) return false;

    if (poemStatusFilter === 'published') return p.status === 'published' && p.isVisible !== false;
    if (poemStatusFilter === 'featured') return p.isFeatured;
    if (poemStatusFilter === 'hidden') return p.isVisible === false;
    return true;
  });

  const countRestricted = usersList.filter((u) => u.isRestricted).length;
  const countBlocked = usersList.filter((u) => u.isBlocked).length;
  const countWriters = usersList.filter((u) => u.role === 'writer').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-['Outfit']">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0e1628] border border-[#d4af37] text-[#f5e7a9] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Super Admin Executive Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#170e24]/90 via-[#0e172a]/95 to-[#0b101f] border border-[#d4af37]/40 shadow-2xl mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#aa8620] flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Crown className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-['Rozha_One'] text-white">
                Super Admin Governance Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#fceda2] border border-[#d4af37]/50 uppercase tracking-widest">
                Platform Governor
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Super Admin operates in strict audit & governance mode. You have full executive control to
              <strong className="text-[#fceda2]"> restrict</strong> or <strong className="text-rose-400">block creators</strong>,
              <strong className="text-[#fceda2]"> edit poem contents</strong>, and <strong className="text-rose-400">delete violations</strong>.
              Super Administrators do not author personal poems.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading || actionLoading}
          className="btn-outline text-xs py-2 px-4 flex items-center gap-2 shrink-0 border-[#d4af37]/50 text-[#f5e7a9] hover:bg-[#d4af37] hover:text-slate-950"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Live Cluster</span>
        </button>
      </div>

      {/* Executive Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-[#d4af37]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 font-['Rozha_One']">
            {usersList.length}
          </p>
          <p className="text-[11px] text-amber-300 mt-1 font-medium">
            {countWriters} Active Writers & Poets
          </p>
        </div>

        <div className="glass-card p-4 border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Restricted Creators</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 font-['Rozha_One']">
            {countRestricted}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Poem submissions disabled
          </p>
        </div>

        <div className="glass-card p-4 border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Blocked / Suspended</span>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1 font-['Rozha_One']">
            {countBlocked}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Access completely revoked
          </p>
        </div>

        <div className="glass-card p-4 border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Poem Archive</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 font-['Rozha_One']">
            {poemsList.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero dummy likes & comments
          </p>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('heritage')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'heritage'
              ? 'bg-[#d4af37] text-slate-950 shadow-lg font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>🏛️ Classical & Heritage Vault ({managedPoets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-[#d4af37] text-slate-950 shadow-lg font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Creator Governance & Sanctions ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('poems')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'poems'
              ? 'bg-[#d4af37] text-slate-950 shadow-lg font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Poem Moderation & Direct Editor ({poemsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('brevo')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'brevo'
              ? 'bg-[#d4af37] text-slate-950 shadow-lg font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Brevo Mail Engine & OTP Tester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'telemetry'
              ? 'bg-[#d4af37] text-slate-950 shadow-lg font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>🛡️ Security Telemetry & Audit Logs ({telemetryLogs.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 0: 🏛️ HERITAGE & CLASSICAL POETS MASTER VAULT (SUPER ADMIN EXCLUSIVE)
          ========================================================================= */}
      {activeSubTab === 'heritage' && (
        <div className="space-y-8 animate-fade-in">
          {/* Vault Top Control Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#24131d]/90 via-[#180e22]/95 to-[#0b101f] border border-[#d4af37]/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ffd700] to-[#b8934a] flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <Crown className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-['Rozha_One'] text-white">
                    🏛️ कालजयी एवं विरासत कवि संग्रह (Classical Heritage Vault)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/20 text-[#fceda2] border border-[#d4af37]/50 uppercase tracking-widest">
                    No Login ID Required
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Super Admin maintains historical & public domain poets (Dinkar, Kabir, Ghalib, Nirala, Tagore, etc.) with <strong>NO fake email/passwords</strong>. You can create poets with just their <strong>Name</strong>, pick <strong>1-click presets</strong>, and feed authentic verses directly.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenCreatePoet()}
              className="btn-royal text-xs py-2 px-5 flex items-center gap-2 shadow-xl font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Classical Poet</span>
            </button>
          </div>

          {/* 1-Click Fast Track Presets Ribbon */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#ffd700]" />
                <h3 className="text-sm font-bold text-slate-200 font-['Rozha_One']">
                  ⚡ 1-Click Popular Historical Presets (लोकप्रिय कालजयी कवि - Public Domain)
                </h3>
              </div>
              <span className="text-[11px] text-[#d4af37]">Click to instantiate instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {heritagePresets.map((preset) => {
                const isAlreadyAdded = managedPoets.some(
                  (mp) => mp.name === preset.name || mp.penName === preset.penName
                );
                return (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#d4af37]/50 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-200 font-['Rozha_One']">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                          {preset.era?.split('(')[0] || 'Classical'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {preset.bio}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-[#d4af37] font-semibold">
                        {preset.sampleLanguage} • {preset.sampleForm?.split(' ')[0]}
                      </span>
                      <button
                        onClick={() => handleOpenCreatePoet(preset)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#fceda2] hover:text-slate-950 border border-[#d4af37]/40 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isAlreadyAdded ? 'Use Template' : 'Add Poet'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Managed Poets Master Cards Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#ffd700]" />
                <h3 className="text-sm font-bold text-white font-['Rozha_One']">
                  Heritage Master Catalog ({managedPoets.length} Poets Cataloged)
                </h3>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder="Search heritage poet by name..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managedPoets
                .filter((p) =>
                  presetSearch.trim()
                    ? (p.name + ' ' + (p.penName || '') + ' ' + (p.era || '')).toLowerCase().includes(presetSearch.toLowerCase())
                    : true
                )
                .map((poet) => (
                  <div
                    key={poet._id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#d4af37]/40 shadow-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#800020]/40 border border-[#d4af37]/40 flex items-center justify-center text-amber-200 text-lg font-bold font-['Rozha_One'] shrink-0 overflow-hidden">
                            {poet.avatar ? (
                              <img src={poet.avatar} alt={poet.name} className="w-full h-full object-cover" />
                            ) : (
                              poet.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white font-['Rozha_One']">
                              {poet.name}
                            </h4>
                            {poet.penName && (
                              <p className="text-xs text-[#d4af37] font-serif">"{poet.penName}"</p>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          {poet.poemCount || 0} Fed
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {poet.era || 'Classical Master'}
                        </span>
                        {poet.languages?.map((l) => (
                          <span key={l} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {l}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                        {poet.bio}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenFeedPoemModal(poet)}
                          className="btn-royal text-xs py-1.5 px-3 flex items-center gap-1 shadow-md font-bold"
                          title="Feed a new poem under this poet"
                        >
                          <Feather className="w-3.5 h-3.5" />
                          <span>Feed Poem</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedHeritagePoetView(
                              selectedHeritagePoetView === poet._id ? 'all' : poet._id
                            );
                          }}
                          className={`text-xs py-1.5 px-2.5 rounded-lg border transition-all flex items-center gap-1 ${
                            selectedHeritagePoetView === poet._id
                              ? 'bg-[#d4af37] text-slate-950 font-bold border-[#d4af37]'
                              : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700'
                          }`}
                          title="View verses by this poet"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Verses</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPoet(poet)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                          title="Edit Poet Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteManagedPoet(poet._id, poet.name)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                          title="Delete Poet and Verses"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Fed Poems Sub-Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Rozha_One'] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#d4af37]" />
                  <span>
                    Archived Heritage Verses{' '}
                    {selectedHeritagePoetView !== 'all' && (
                      <span className="text-[#d4af37] text-sm">
                        (Filtered for:{' '}
                        {managedPoets.find((p) => p._id === selectedHeritagePoetView)?.name})
                      </span>
                    )}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directly edit stanzas, toggle featured status, or manage publication for historical verses.
                </p>
              </div>

              {selectedHeritagePoetView !== 'all' && (
                <button
                  onClick={() => setSelectedHeritagePoetView('all')}
                  className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  Show All Heritage Verses
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poemsList
                .filter((p) => {
                  const isManagedPoem = managedPoets.some(
                    (mp) =>
                      mp._id === (p.author?._id || p.author) ||
                      p.isHeritage ||
                      p.authorName === mp.name
                  );
                  if (!isManagedPoem) return false;
                  if (selectedHeritagePoetView !== 'all') {
                    return (
                      (p.author?._id || p.author)?.toString() === selectedHeritagePoetView ||
                      p.authorName === managedPoets.find((mp) => mp._id === selectedHeritagePoetView)?.name
                    );
                  }
                  return true;
                })
                .map((poem) => (
                  <div
                    key={poem._id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-[#d4af37]/30 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                            ✍️ {poem.authorName} {poem.penName ? `"${poem.penName}"` : ''}
                          </span>
                          <h4 className="text-base font-bold text-white font-['Rozha_One'] mt-1">
                            {poem.title}
                          </h4>
                          {poem.subtitle && (
                            <p className="text-xs text-slate-400 italic">— {poem.subtitle} —</p>
                          )}
                        </div>

                        {poem.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-[#ffd700] border border-[#ffd700]/40 font-bold shrink-0">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span>🌐 {poem.language}</span>
                        <span>•</span>
                        <span>{poem.rasa?.split(' ')[0]}</span>
                        <span>•</span>
                        <span>{poem.form?.split(' ')[0]}</span>
                        <span>•</span>
                        <span>{poem.stanzas?.length || 1} Stanzas</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeature(poem._id, poem.isFeatured)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            poem.isFeatured
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700'
                          }`}
                        >
                          {poem.isFeatured ? '★ Featured Daily' : '☆ Feature'}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(poem)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-sky-400 hover:text-sky-300 border border-slate-700 flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Direct Edit</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeletePoem(poem._id, poem.title)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                        title="Delete poem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: CREATOR GOVERNANCE & SANCTIONS (BLOCK / RESTRICT / DELETE / ROLE)
          ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All Users (${usersList.length})` },
                { key: 'active', label: 'Active Verified' },
                { key: 'restricted', label: `Restricted (${countRestricted})` },
                { key: 'blocked', label: `Blocked (${countBlocked})` },
                { key: 'writer', label: `Poets & Writers (${countWriters})` },
                { key: 'reader', label: 'Readers' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setUserStatusFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    userStatusFilter === filter.key
                      ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#fceda2] font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by name, email, or pen name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Creators Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Creator / User</th>
                    <th className="py-3.5 px-4">Takhallus (Pen Name)</th>
                    <th className="py-3.5 px-4">Role Privileges</th>
                    <th className="py-3.5 px-4">Status & Sanctions</th>
                    <th className="py-3.5 px-4 text-right">Executive Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No users match the selected filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u._id === user?._id || u.role === 'superadmin';

                      return (
                        <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                          {/* User Avatar + Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#800020] to-[#d4af37] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                                {u.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-semibold text-white flex items-center gap-1.5 text-xs">
                                  <span>{u.name}</span>
                                  {u.role === 'superadmin' && (
                                    <span className="text-[10px] text-[#d4af37]">👑 (You)</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Pen Name */}
                          <td className="py-3.5 px-4 font-['Tiro_Devanagari_Hindi'] text-[#f5e7a9] text-xs">
                            {u.penName ? `"${u.penName}"` : <span className="text-slate-600">—</span>}
                          </td>

                          {/* Role Privileges */}
                          <td className="py-3.5 px-4">
                            {isSuperAdmin && !isSelf ? (
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#d4af37]"
                              >
                                <option value="reader">📖 Reader</option>
                                <option value="writer">✍️ Writer</option>
                                <option value="admin">🛡️ Admin</option>
                                <option value="superadmin">👑 Super Admin</option>
                              </select>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === 'superadmin'
                                    ? 'bg-[#d4af37]/20 text-[#f5e7a9] border border-[#d4af37]/40'
                                    : u.role === 'admin'
                                    ? 'bg-sky-500/20 text-sky-300'
                                    : u.role === 'writer'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {u.role === 'superadmin' && '👑 '}
                                {u.role}
                              </span>
                            )}
                          </td>

                          {/* Status & Sanctions Badge */}
                          <td className="py-3.5 px-4">
                            {u.isBlocked ? (
                              <span className="admin-badge-blocked">
                                <Ban className="w-3 h-3" />
                                <span>Blocked</span>
                              </span>
                            ) : u.isRestricted ? (
                              <span className="admin-badge-restricted">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Restricted</span>
                              </span>
                            ) : (
                              <span className="admin-badge-active">
                                <CheckCircle className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          {/* Executive Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-500 italic pr-2">Protected Account</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Restrict / Unrestrict Creator */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleRestrict(u)}
                                  className={`admin-action-btn ${
                                    u.isRestricted
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'admin-btn-restrict'
                                  }`}
                                  title={
                                    u.isRestricted
                                      ? 'Lift publishing restriction'
                                      : 'Disable publishing new poems for this creator'
                                  }
                                >
                                  {u.isRestricted ? (
                                    <>
                                      <Unlock className="w-3 h-3" />
                                      <span>Unrestrict</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      <span>Restrict</span>
                                    </>
                                  )}
                                </button>

                                {/* Block / Unblock Creator */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlock(u)}
                                  className={`admin-action-btn ${
                                    u.isBlocked
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                      : 'admin-btn-block'
                                  }`}
                                  title={
                                    u.isBlocked
                                      ? 'Restore user access'
                                      : 'Completely suspend and block account'
                                  }
                                >
                                  {u.isBlocked ? (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      <span>Unblock</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      <span>Block</span>
                                    </>
                                  )}
                                </button>

                                {/* Delete Creator Account & Works */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  className="admin-action-btn admin-btn-delete"
                                  title="Permanently delete user and all their poems"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: POEM MODERATION & DIRECT CONTENT EDITOR (EDIT / DELETE / VISIBILITY)
          ========================================================================= */}
      {activeSubTab === 'poems' && (
        <div className="space-y-4">
          {/* Poem Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All Verses (${poemsList.length})` },
                { key: 'published', label: 'Published & Visible' },
                { key: 'featured', label: '⭐ Featured (Daily)' },
                { key: 'hidden', label: 'Hidden from Public' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setPoemStatusFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    poemStatusFilter === filter.key
                      ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#fceda2] font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchPoem}
                onChange={(e) => setSearchPoem(e.target.value)}
                placeholder="Search poem title, poet, or language..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Poems Moderation Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Poem Masterpiece</th>
                    <th className="py-3.5 px-4">Poet / Author</th>
                    <th className="py-3.5 px-4">Language & Form</th>
                    <th className="py-3.5 px-4">Public Status</th>
                    <th className="py-3.5 px-4 text-right">Super Admin Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPoems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No poems match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPoems.map((p) => {
                      const isVis = p.isVisible !== false;

                      return (
                        <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Title & Subtitle */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white font-['Rozha_One'] text-sm">
                              {p.title}
                            </p>
                            {p.subtitle && (
                              <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                                {p.subtitle}
                              </p>
                            )}
                          </td>

                          {/* Author */}
                          <td className="py-3.5 px-4">
                            <p className="text-slate-200 font-medium">{p.authorName}</p>
                            {p.penName && (
                              <p className="text-[10px] text-[#d4af37] italic font-['Tiro_Devanagari_Hindi']">
                                "{p.penName}"
                              </p>
                            )}
                          </td>

                          {/* Language & Form */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="w-max px-2 py-0.5 rounded text-[10px] bg-[#800020]/40 text-[#f5e7a9] border border-[#d4af37]/25 font-medium">
                                {p.language}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {p.form?.split(' ')[0]} • {p.rasa?.split(' ')[0]}
                              </span>
                            </div>
                          </td>

                          {/* Status & Feature Badge */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  p.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {p.status}
                              </span>
                              {p.isFeatured && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⭐ Featured
                                </span>
                              )}
                              {!isVis && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Executive Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Poem Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="admin-action-btn admin-btn-edit"
                                title="Edit title, content, or metadata"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              {/* Toggle Visibility (Visible vs Hidden) */}
                              <button
                                type="button"
                                onClick={() => handleToggleVisibility(p._id, isVis)}
                                className={`admin-action-btn ${
                                  isVis
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-[#d4af37]'
                                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                }`}
                                title={isVis ? 'Hide poem from public catalog' : 'Make poem visible'}
                              >
                                {isVis ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                                <span>{isVis ? 'Public' : 'Hidden'}</span>
                              </button>

                              {/* Feature for Verse of the Day */}
                              <button
                                type="button"
                                onClick={() => handleToggleFeature(p._id, p.isFeatured)}
                                className={`admin-action-btn ${
                                  p.isFeatured
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300'
                                }`}
                                title="Feature in Aaj Ki Kavita hero slot"
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>{p.isFeatured ? 'Featured' : 'Feature'}</span>
                              </button>

                              {/* Delete Poem Permanently */}
                              <button
                                type="button"
                                onClick={() => handleDeletePoem(p._id, p.title)}
                                className="admin-action-btn admin-btn-delete"
                                title="Permanently delete poem"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BREVO TRANSACTIONAL EMAIL GATEWAY
          ========================================================================= */}
      {activeSubTab === 'brevo' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card p-6 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white font-['Rozha_One']">
                  Brevo Transactional Mail Gateway
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time email verification, OTP authentication, and welcome notifications.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-6 space-y-2 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Gateway Status: <strong className="text-emerald-400">Live & Connected</strong></span>
              </p>
              <p className="text-slate-400">
                Transactional OTP verification and welcome mailers are routed through Brevo API.
              </p>
            </div>

            <form onSubmit={handleSendBrevoTest} className="space-y-4">
              <div>
                <label className="form-label text-xs">Recipient Email for Test Dispatch</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Enter recipient email address..."
                  required
                  className="form-control text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={brevoSending}
                className="btn-royal text-xs py-2.5 px-6 w-full justify-center shadow-lg font-bold"
              >
                <Send className="w-4 h-4" />
                <span>{brevoSending ? 'Dispatching via Brevo...' : 'Dispatch Live Brevo Test Email'}</span>
              </button>
            </form>

            {/* Brevo Result Output */}
            {brevoResult && (
              <div
                className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                  brevoResult.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{brevoResult.message}</span>
                </div>
                {brevoResult.result && (
                  <pre className="mt-2 p-2 bg-slate-950/80 rounded border border-slate-800 text-[10px] text-slate-400 overflow-x-auto font-mono">
                    {JSON.stringify(brevoResult.result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 🛡️ VISITOR TELEMETRY & CYBER SECURITY AUDIT LOGS (ENTERPRISE GRADE)
          ========================================================================= */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#091522]/90 via-[#0a1120]/95 to-[#0b101f] border border-emerald-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <ShieldAlert className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-['Rozha_One'] text-white">
                    🛡️ Security Telemetry & Visitor Audit Console
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 uppercase tracking-widest">
                    Real-Time Forensics
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Enterprise-grade audit trail capturing real-time visitor IP addresses, devices, operating systems, geographic clusters, poem readership, and automated cybersecurity anomaly detection without requiring prior consent.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportTelemetryAudit('csv')}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950"
                title="Download CSV Audit Trail"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExportTelemetryAudit('json')}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 border-[#d4af37]/40 text-[#fceda2] hover:bg-[#d4af37] hover:text-slate-950"
                title="Download JSON Telemetry Dump"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={loadData}
                disabled={loading}
                className="btn-royal text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Logs</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 border border-emerald-500/30 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Readership Views</span>
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white font-['Rozha_One'] mt-2">
                {telemetryStats?.totalViews || telemetryLogs.filter((l) => l.action === 'view_kavita').length}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">Verified Poem Views Tracked</p>
            </div>

            <div className="glass-card p-4 border border-sky-500/30 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Unique Visitor IPs</span>
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white font-['Rozha_One'] mt-2">
                {telemetryStats?.uniqueIps || new Set(telemetryLogs.map((l) => l.ipAddress)).size}
              </p>
              <p className="text-[11px] text-sky-400 mt-1">Forensic IP Endpoints</p>
            </div>

            <div className="glass-card p-4 border border-amber-500/30 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Regional Clusters</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white font-['Rozha_One'] mt-2">
                {telemetryStats?.regionalDistribution?.length || 1} States
              </p>
              <p className="text-[11px] text-amber-300 mt-1">Geo-Location Nodes</p>
            </div>

            <div className="glass-card p-4 border border-rose-500/30 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cyber Risk Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-white font-['Rozha_One'] mt-2">
                {telemetryStats?.highRiskCount || telemetryLogs.filter((l) => (l.riskScore || 0) >= 40).length}
              </p>
              <p className="text-[11px] text-rose-400 mt-1">High-Risk / Scripted Probes</p>
            </div>
          </div>

          {/* Filtering and Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={telemetrySearch}
                  onChange={(e) => setTelemetrySearch(e.target.value)}
                  placeholder="Filter by IP, City, User, Poem..."
                  className="form-control text-xs pl-9"
                  style={{ paddingLeft: 38 }}
                />
              </div>

              <select
                value={telemetryActionFilter}
                onChange={(e) => setTelemetryActionFilter(e.target.value)}
                className="form-control text-xs w-40 bg-slate-950"
              >
                <option value="all">All Actions</option>
                <option value="view_kavita">👁️ View Kavita</option>
                <option value="read_full">📖 Read Full</option>
                <option value="export_pdf">📥 Export PDF</option>
                <option value="export_txt">📝 Export TXT</option>
                <option value="like_poem">❤️ Like Poem</option>
                <option value="login_success">🔐 Login Success</option>
                <option value="login_failed">🚫 Login Failed</option>
              </select>

              <select
                value={telemetryDeviceFilter}
                onChange={(e) => setTelemetryDeviceFilter(e.target.value)}
                className="form-control text-xs w-36 bg-slate-950"
              >
                <option value="all">All Devices</option>
                <option value="Desktop">💻 Desktop</option>
                <option value="Mobile">📱 Mobile</option>
                <option value="Tablet">📟 Tablet</option>
                <option value="Bot/Crawler">🤖 Bot/Scraper</option>
              </select>

              <button
                type="button"
                onClick={() => setTelemetryRiskOnly(!telemetryRiskOnly)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  telemetryRiskOnly
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>High Risk Only (Risk &gt; 40)</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Displaying {
                telemetryLogs.filter((l) => {
                  if (telemetryActionFilter !== 'all' && l.action !== telemetryActionFilter) return false;
                  if (telemetryDeviceFilter !== 'all' && l.device !== telemetryDeviceFilter) return false;
                  if (telemetryRiskOnly && (l.riskScore || 0) < 40) return false;
                  if (telemetrySearch.trim()) {
                    const q = telemetrySearch.toLowerCase();
                    const match =
                      (l.ipAddress || '').toLowerCase().includes(q) ||
                      (l.kavitaTitle || '').toLowerCase().includes(q) ||
                      (l.kavitaAuthor || '').toLowerCase().includes(q) ||
                      (l.userEmail || '').toLowerCase().includes(q) ||
                      (l.geo?.city || '').toLowerCase().includes(q) ||
                      (l.geo?.region || '').toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                }).length
              } of {telemetryLogs.length} Records
            </span>
          </div>

          {/* Telemetry Stream Log Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-xl bg-slate-950/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Time & Action</th>
                  <th className="p-3">Visitor IP & Location</th>
                  <th className="p-3">Device & Browser</th>
                  <th className="p-3">Target Poem / Work</th>
                  <th className="p-3">Account Identity</th>
                  <th className="p-3 text-right">Risk Score & Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {telemetryLogs
                  .filter((l) => {
                    if (telemetryActionFilter !== 'all' && l.action !== telemetryActionFilter) return false;
                    if (telemetryDeviceFilter !== 'all' && l.device !== telemetryDeviceFilter) return false;
                    if (telemetryRiskOnly && (l.riskScore || 0) < 40) return false;
                    if (telemetrySearch.trim()) {
                      const q = telemetrySearch.toLowerCase();
                      const match =
                        (l.ipAddress || '').toLowerCase().includes(q) ||
                        (l.kavitaTitle || '').toLowerCase().includes(q) ||
                        (l.kavitaAuthor || '').toLowerCase().includes(q) ||
                        (l.userEmail || '').toLowerCase().includes(q) ||
                        (l.geo?.city || '').toLowerCase().includes(q) ||
                        (l.geo?.region || '').toLowerCase().includes(q);
                      if (!match) return false;
                    }
                    return true;
                  })
                  .slice(0, 50)
                  .map((log) => {
                    const isHighRisk = (log.riskScore || 0) >= 50;
                    const isModerateRisk = (log.riskScore || 0) >= 25 && !isHighRisk;

                    return (
                      <tr key={log._id || Math.random()} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-mono text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              log.action === 'view_kavita'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : log.action.includes('export')
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : log.action.includes('like')
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="p-3">
                          <p className="font-mono font-bold text-white text-xs">{log.ipAddress}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>📍</span>
                            <span>{log.geo?.city ? `${log.geo.city}, ` : ''}{log.geo?.region || 'India'}</span>
                          </p>
                        </td>

                        <td className="p-3">
                          <p className="text-xs text-slate-200 flex items-center gap-1.5">
                            {log.device === 'Mobile' ? (
                              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                            ) : log.device === 'Bot/Crawler' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Laptop className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>{log.os || 'Windows'}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                            {log.browser || 'Chrome'} ({log.device})
                          </p>
                        </td>

                        <td className="p-3">
                          {log.kavitaTitle ? (
                            <div>
                              <p className="font-semibold text-amber-200 font-['Rozha_One'] text-xs">
                                {log.kavitaTitle}
                              </p>
                              <p className="text-[10px] text-slate-400 italic">
                                by {log.kavitaAuthor || 'Author'}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Platform Visit</span>
                          )}
                        </td>

                        <td className="p-3">
                          <p className="text-xs font-medium text-slate-200">{log.userName || 'Anonymous'}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px] font-mono">
                            {log.userEmail || 'Guest IP'}
                          </p>
                        </td>

                        <td className="p-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isHighRisk
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : isModerateRisk
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            Risk: {log.riskScore || 0}%
                          </span>
                          {log.riskFlags && log.riskFlags.length > 0 && (
                            <p className="text-[9px] text-rose-300 mt-1 font-mono truncate max-w-[140px] ml-auto">
                              {log.riskFlags.join(', ')}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {telemetryLogs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm">No security telemetry events logged yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUPER ADMIN EDIT POEM MODAL
          ========================================================================= */}
      {editingPoemModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0c1020] border border-[#d4af37]/50 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setEditingPoemModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fceda2]">
                <Edit3 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold font-['Rozha_One'] text-white">
                  Super Admin Poem Editor
                </h2>
                <p className="text-xs text-slate-400">
                  Directly modify title, verses, language, and public visibility.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePoemEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">शीर्षक (Poem Title) *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="form-control text-xs"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">उपशीर्षक (Subtitle / Epithet)</label>
                  <input
                    type="text"
                    value={editFormData.subtitle}
                    onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                    className="form-control text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xs">भाषा (Language) *</label>
                  <select
                    value={editFormData.language}
                    onChange={(e) => setEditFormData({ ...editFormData, language: e.target.value })}
                    className="form-control text-xs"
                  >
                    {[
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
                    ].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">रस (Aesthetic Mood)</label>
                  <select
                    value={editFormData.rasa}
                    onChange={(e) => setEditFormData({ ...editFormData, rasa: e.target.value })}
                    className="form-control text-xs"
                  >
                    {[
                      'Shringara (Love/Romance)',
                      'Veera (Courage/Heroism)',
                      'Karuna (Grief/Compassion)',
                      'Shant (Peace/Serenity)',
                      'Raudra (Fury/Anger)',
                      'Bhayanaka (Fear/Awe)',
                      'Bibhatsa (Disgust/Aversion)',
                      'Adbhuta (Wonder/Mystery)',
                      'Hasya (Humor/Laughter)',
                      'Bhakti (Devotion/Spiritual)',
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">विधा (Poetic Form)</label>
                  <select
                    value={editFormData.form}
                    onChange={(e) => setEditFormData({ ...editFormData, form: e.target.value })}
                    className="form-control text-xs"
                  >
                    {[
                      'Mukt Kavya (Free Verse)',
                      'Ghazal (Couplets/Sher)',
                      'Dohe (Couplets)',
                      'Geet (Lyrical Poem)',
                      'Kundaliya',
                      'Muktak (Quatrain)',
                      'Rubaiyat',
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xs">काव्य पंक्तियाँ (Poem Verses / Content) *</label>
                <textarea
                  rows={8}
                  required
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  className="form-control text-xs font-['Tiro_Devanagari_Hindi'] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={editFormData.isVisible}
                    onChange={(e) => setEditFormData({ ...editFormData, isVisible: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37]"
                  />
                  <span>सार्वजनिक दृश्यता (Visible on Public Website)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPoemModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-royal text-xs py-2 px-6 shadow-xl font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? 'Saving Changes...' : 'Save & Publish Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL A: ADD / EDIT HERITAGE POET PROFILE (SUPER ADMIN EXCLUSIVE)
          ========================================================================= */}
      {isPoetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-[#d4af37]/50 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Rozha_One'] text-white">
                    {editingPoet ? 'Edit Heritage Poet Profile' : '🏛️ Add Heritage Classical Poet'}
                  </h3>
                  <p className="text-[11px] text-[#fceda2] mt-0.5">
                    No login email or password required • Maintained securely by Super Admin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPoetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoet} className="space-y-4">
              <div>
                <label className="form-label text-xs">
                  <span>कवि का नाम / Poet Full Name *</span>
                  <span className="text-amber-400 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={poetForm.name}
                  onChange={(e) => setPoetForm({ ...poetForm, name: e.target.value })}
                  placeholder="e.g. रामधारी सिंह 'दिनकर', संत कबीर, मिर्ज़ा ग़ालिब..."
                  className="form-control text-sm font-['Rozha_One'] font-bold text-amber-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">उपनाम / Pen Name (तख़ल्लुस)</label>
                  <input
                    type="text"
                    value={poetForm.penName}
                    onChange={(e) => setPoetForm({ ...poetForm, penName: e.target.value })}
                    placeholder="e.g. दिनकर, ग़ालिब, कबीर..."
                    className="form-control text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">काल / Era & Lifespan</label>
                  <input
                    type="text"
                    value={poetForm.era}
                    onChange={(e) => setPoetForm({ ...poetForm, era: e.target.value })}
                    placeholder="e.g. 1908 – 1974 (राष्ट्रकवि / Public Domain)"
                    className="form-control text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">प्रमुख भाषाएँ / Primary Languages</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {['Hindi', 'Urdu', 'Bengali', 'Gujarati', 'Marathi', 'English', 'Sanskrit'].map((lang) => {
                    const isSelected = poetForm.languages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => {
                          setPoetForm({
                            ...poetForm,
                            languages: isSelected
                              ? poetForm.languages.filter((l) => l !== lang)
                              : [...poetForm.languages, lang],
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#d4af37] text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label text-xs">संक्षिप्त परिचय / Bio & Heritage Context</label>
                <textarea
                  rows={3}
                  value={poetForm.bio}
                  onChange={(e) => setPoetForm({ ...poetForm, bio: e.target.value })}
                  placeholder="Enter context, literary significance, and historical impact..."
                  className="form-control text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="form-label text-xs">चित्र URL / Portrait Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={poetForm.avatar}
                  onChange={(e) => setPoetForm({ ...poetForm, avatar: e.target.value })}
                  placeholder="https://... (historical portrait image)"
                  className="form-control text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPoetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-royal text-xs py-2 px-6 shadow-xl font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? 'Saving...' : editingPoet ? 'Update Poet' : 'Save Poet to Vault'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL B: FEED POEM FOR HERITAGE POET (SUPER ADMIN EXCLUSIVE)
          ========================================================================= */}
      {isFeedPoemModalOpen && targetPoetForFeed && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-[#d4af37]/50 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#800020]/40 border border-[#d4af37]/40 flex items-center justify-center text-amber-200 text-base font-bold font-['Rozha_One'] shrink-0">
                  {targetPoetForFeed.avatar ? (
                    <img src={targetPoetForFeed.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    targetPoetForFeed.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Rozha_One'] text-white">
                    ✍️ Feed Masterpiece Poem for {targetPoetForFeed.name}
                  </h3>
                  <p className="text-[11px] text-[#fceda2]">
                    Publishing directly under {targetPoetForFeed.name} {targetPoetForFeed.penName ? `("${targetPoetForFeed.penName}")` : ''} into platform archive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFeedPoemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedPoem} className="space-y-4">
              <div>
                <label className="form-label text-xs">
                  <span>कविता का शीर्षक / Heading of Kavita *</span>
                  <span className="text-amber-400 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={feedPoemForm.title}
                  onChange={(e) => setFeedPoemForm({ ...feedPoemForm, title: e.target.value })}
                  placeholder="e.g. रश्मिरथी: तृतीय सर्ग, कलम आज उनकी जय बोल, दिल-ए-नादाँ..."
                  className="form-control text-sm font-['Rozha_One'] font-bold text-amber-200"
                />
              </div>

              <div>
                <label className="form-label text-xs">उपकथन / Subtitle / Famous Stanza Dedication</label>
                <input
                  type="text"
                  value={feedPoemForm.subtitle}
                  onChange={(e) => setFeedPoemForm({ ...feedPoemForm, subtitle: e.target.value })}
                  placeholder="e.g. जब नाश मनुज पर छाता है, पहले विवेक मर जाता है..."
                  className="form-control text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="form-label text-xs">भाषा / Language</label>
                  <select
                    value={feedPoemForm.language}
                    onChange={(e) => setFeedPoemForm({ ...feedPoemForm, language: e.target.value })}
                    className="form-control text-xs bg-slate-950"
                  >
                    {['Hindi', 'Urdu', 'Bengali', 'Gujarati', 'Marathi', 'English', 'Sanskrit'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">रस / Rasa</label>
                  <select
                    value={feedPoemForm.rasa}
                    onChange={(e) => setFeedPoemForm({ ...feedPoemForm, rasa: e.target.value })}
                    className="form-control text-xs bg-slate-950"
                  >
                    {[
                      'Veer (Heroic/Valor)',
                      'Karun (Pathos/Compassion)',
                      'Shant (Peace/Serenity)',
                      'Bhakti (Devotion/Spiritual)',
                      'Shringar (Romance/Beauty)',
                      'Raudra (Fury/Wrath)',
                      'Adbhut (Wonder/Awe)',
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">शैली / Form</label>
                  <select
                    value={feedPoemForm.form}
                    onChange={(e) => setFeedPoemForm({ ...feedPoemForm, form: e.target.value })}
                    className="form-control text-xs bg-slate-950"
                  >
                    {[
                      'Chhand / Matrik',
                      'Ghazal (Couplets/Sher)',
                      'Dohe (Couplets)',
                      'Mukt Kavya (Free Verse)',
                      'Geet (Lyrical Poem)',
                      'Muktak (Quatrain)',
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label text-xs">काव्य पंक्तियाँ (Poem Verses / Content) *</label>
                <textarea
                  rows={9}
                  required
                  value={feedPoemForm.content}
                  onChange={(e) => setFeedPoemForm({ ...feedPoemForm, content: e.target.value })}
                  placeholder="Paste verses here. Double enter separates stanzas automatically..."
                  className="form-control text-xs font-['Tiro_Devanagari_Hindi'] leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tip: Separate stanzas with a blank line for authentic book presentation.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-200">
                  <input
                    type="checkbox"
                    checked={feedPoemForm.isFeatured}
                    onChange={(e) => setFeedPoemForm({ ...feedPoemForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-[#d4af37]"
                  />
                  <span>★ Feature as "Verse of the Day" on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFeedPoemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-royal text-xs py-2 px-6 shadow-xl font-bold flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{actionLoading ? 'Publishing...' : '🚀 Publish into Archive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
