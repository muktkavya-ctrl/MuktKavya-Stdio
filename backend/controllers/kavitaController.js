import { Kavita, Comment, User, Notification, SecurityTelemetry } from '../models/index.js';
import {
  sendKavitaPublishedEmail,
  sendCommentNotificationEmail,
} from '../services/brevoEmailService.js';
import {
  extractClientIp,
  parseUserAgent,
  inferGeoFromReq,
  calculateSecurityRisk,
} from '../utils/telemetryHelper.js';

export const REGION_LANGUAGE_MAP = {
  delhi: ['Hindi', 'Urdu', 'English'],
  delhi_ncr: ['Hindi', 'Urdu', 'English'],
  bihar: ['Hindi', 'Urdu'],
  up: ['Hindi', 'Urdu'],
  uttar_pradesh: ['Hindi', 'Urdu'],
  rajasthan: ['Hindi'],
  mp: ['Hindi'],
  madhya_pradesh: ['Hindi'],
  haryana: ['Hindi'],
  maharashtra: ['Marathi', 'Hindi'],
  gujarat: ['Gujarati', 'Hindi'],
  bengal: ['Bengali', 'Hindi', 'English'],
  west_bengal: ['Bengali', 'Hindi', 'English'],
  punjab: ['Punjabi', 'Hindi', 'Urdu'],
  telangana: ['Urdu', 'Hindi', 'English'],
  kashmir: ['Urdu', 'Hindi'],
  all_india: ['Hindi', 'Urdu', 'Bengali', 'Gujarati', 'Marathi', 'English', 'Sanskrit'],
};

// Helper to auto-parse raw content into structured stanzas if not manually broken down
const parseStanzasFromContent = (content) => {
  if (!content) return [];
  const blocks = content.split(/\n\s*\n/);
  return blocks.map((block, index) => ({
    stanzaNumber: index + 1,
    lines: block.split('\n').map((l) => l.trim()).filter(Boolean),
    notes: '',
  }));
};

// @desc    Get all poems with multi-faceted search & filters
// @route   GET /api/kavitas
// @access  Public
export const getKavitas = async (req, res) => {
  try {
    const {
      search,
      language,
      languages,
      region,
      rasa,
      form,
      theme,
      author,
      featured,
      sort = 'latest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      status: { $in: ['published', 'featured'] },
      isVisible: { $ne: false },
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { penName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (language && language !== 'All') {
      if (language.includes(',')) {
        query.language = { $in: language.split(',').map((l) => l.trim()) };
      } else {
        query.language = language;
      }
    } else if (languages && languages !== 'All') {
      query.language = { $in: languages.split(',').map((l) => l.trim()) };
    } else if (region && region !== 'all') {
      const regKey = region.toLowerCase().replace(/[\s\/-]+/g, '_');
      const mappedLangs = REGION_LANGUAGE_MAP[regKey] || REGION_LANGUAGE_MAP[region.toLowerCase()];
      if (mappedLangs && mappedLangs.length > 0) {
        query.language = { $in: mappedLangs };
      }
    }

    if (rasa && rasa !== 'All') {
      query.rasa = { $regex: rasa, $options: 'i' };
    }

    if (form && form !== 'All') {
      query.form = { $regex: form, $options: 'i' };
    }

    if (theme && theme !== 'All') {
      query.theme = theme;
    }

    if (author) {
      query.author = author;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'views') sortOptions = { viewsCount: -1 };
    if (sort === 'likes') sortOptions = { likesCount: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'featured') sortOptions = { isFeatured: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [kavitas, total] = await Promise.all([
      Kavita.find(query)
        .populate('author', 'name penName avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Kavita.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: kavitas.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: kavitas,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single poem by ID and increment view count
// @route   GET /api/kavitas/:id
// @access  Public
export const getKavitaById = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id).populate(
      'author',
      'name penName avatar bio languages socials'
    );

    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    // Increment views atomically
    kavita.viewsCount = (kavita.viewsCount || 0) + 1;
    await kavita.save({ validateBeforeSave: false });

    // Asynchronously log audit telemetry
    try {
      const ip = extractClientIp(req);
      const ua = req.headers['user-agent'] || '';
      const { device, os, browser } = parseUserAgent(ua);
      const geo = inferGeoFromReq(req, ip);
      const { riskScore, riskFlags } = calculateSecurityRisk(req, ip, ua);

      await SecurityTelemetry.create({
        ipAddress: ip,
        userAgent: ua,
        browser,
        os,
        device,
        action: 'view_kavita',
        kavita: kavita._id,
        kavitaTitle: kavita.title,
        kavitaAuthor: kavita.authorName,
        language: kavita.language,
        user: req.user?._id || null,
        userName: req.user?.name || 'Anonymous Visitor',
        userEmail: req.user?.email || 'anonymous@visitor.net',
        userRole: req.user?.role || 'guest',
        geo,
        riskScore,
        riskFlags,
      });
    } catch (telemetryErr) {
      console.warn('Telemetry log warning:', telemetryErr.message);
    }

    // Fetch comments
    const comments = await Comment.find({ kavita: kavita._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: kavita,
      comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explicitly track poem view with client telemetry and return live count
// @route   POST /api/kavitas/:id/track-view
// @access  Public
export const trackKavitaView = async (req, res) => {
  try {
    const { action = 'view_kavita' } = req.body;
    const kavita = await Kavita.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true, select: 'title authorName language rasa viewsCount' }
    );

    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    const ip = extractClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const { device, os, browser } = parseUserAgent(ua);
    const geo = inferGeoFromReq(req, ip);
    const { riskScore, riskFlags } = calculateSecurityRisk(req, ip, ua);

    await SecurityTelemetry.create({
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device,
      action: action || 'view_kavita',
      kavita: kavita._id,
      kavitaTitle: kavita.title,
      kavitaAuthor: kavita.authorName,
      language: kavita.language,
      user: req.user?._id || null,
      userName: req.user?.name || 'Anonymous Visitor',
      userEmail: req.user?.email || 'anonymous@visitor.net',
      userRole: req.user?.role || 'guest',
      geo,
      riskScore,
      riskFlags,
    });

    res.status(200).json({
      success: true,
      viewsCount: kavita.viewsCount,
      kavitaId: kavita._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Featured 'Aaj Ki Kavita' (Verse of the Day)
// @route   GET /api/kavitas/daily/featured
// @access  Public
export const getDailyKavita = async (req, res) => {
  try {
    let daily = await Kavita.findOne({
      isFeatured: true,
      status: 'published',
      isVisible: { $ne: false },
    })
      .populate('author', 'name penName avatar bio')
      .sort({ featuredAt: -1, updatedAt: -1 });

    if (!daily) {
      daily = await Kavita.findOne({
        status: 'published',
        isVisible: { $ne: false },
      })
        .populate('author', 'name penName avatar bio')
        .sort({ viewsCount: -1, likesCount: -1 });
    }

    res.status(200).json({
      success: true,
      data: daily,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Kavita (Poet Studio)
// @route   POST /api/kavitas
// @access  Private (Writer, Admin, Super Admin)
export const createKavita = async (req, res) => {
  try {
    if (req.user.isRestricted || req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your creator account is currently restricted from publishing new poems.',
      });
    }

    const {
      title,
      subtitle,
      content,
      stanzas,
      language,
      rasa,
      form,
      theme,
      fontFamily,
      status,
      tags,
      audioUrl,
      poetId, // Optional: if Super Admin is feeding for a managed poet
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the Heading (Title) and content of your Kavita',
      });
    }

    let authorId = req.user._id;
    let authorName = req.user.name;
    let penName = req.user.penName || '';
    let isHeritage = false;
    let maintainedBy = null;

    if (poetId && ['superadmin', 'admin'].includes(req.user.role)) {
      const targetPoet = await User.findById(poetId);
      if (targetPoet) {
        authorId = targetPoet._id;
        authorName = targetPoet.name;
        penName = targetPoet.penName || '';
        isHeritage = targetPoet.isHeritage || false;
        maintainedBy = req.user._id;
      }
    }

    const structuredStanzas =
      stanzas && stanzas.length > 0 ? stanzas : parseStanzasFromContent(content);

    const kavita = await Kavita.create({
      title,
      subtitle: subtitle || '',
      content,
      stanzas: structuredStanzas,
      language: language || 'Hindi',
      rasa: rasa || 'Shant (Peace/Serenity)',
      form: form || 'Mukt Kavya (Free Verse)',
      theme: theme || 'vintage-parchment',
      fontFamily: fontFamily || 'Rozha One, Tiro Devanagari Hindi, serif',
      author: authorId,
      authorName,
      penName,
      isHeritage,
      maintainedBy,
      status: status || 'published',
      tags: tags || [],
      audioUrl: audioUrl || '',
    });

    // Send publication email notification in background
    if (kavita.status === 'published') {
      sendKavitaPublishedEmail(req.user, kavita).catch((e) =>
        console.warn('Background publish email warning:', e.message)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Kavita created successfully',
      data: kavita,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing Kavita
// @route   PUT /api/kavitas/:id
// @access  Private (Owner or Admin/Superadmin)
export const updateKavita = async (req, res) => {
  try {
    let kavita = await Kavita.findById(req.params.id);

    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    // Verify ownership or admin privileges
    const isOwner = kavita.author.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this poem',
      });
    }

    const {
      title,
      subtitle,
      content,
      stanzas,
      language,
      rasa,
      form,
      theme,
      fontFamily,
      status,
      tags,
      audioUrl,
    } = req.body;

    if (title) kavita.title = title;
    if (subtitle !== undefined) kavita.subtitle = subtitle;
    if (content) {
      kavita.content = content;
      kavita.stanzas =
        stanzas && stanzas.length > 0 ? stanzas : parseStanzasFromContent(content);
    }
    if (language) kavita.language = language;
    if (rasa) kavita.rasa = rasa;
    if (form) kavita.form = form;
    if (theme) kavita.theme = theme;
    if (fontFamily) kavita.fontFamily = fontFamily;
    if (status) kavita.status = status;
    if (tags) kavita.tags = tags;
    if (audioUrl !== undefined) kavita.audioUrl = audioUrl;

    await kavita.save();

    res.status(200).json({
      success: true,
      message: 'Kavita updated successfully',
      data: kavita,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Kavita
// @route   DELETE /api/kavitas/:id
// @access  Private (Owner or Admin/Superadmin)
export const deleteKavita = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id);

    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    const isOwner = kavita.author.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this poem',
      });
    }

    await Kavita.deleteOne({ _id: kavita._id });
    await Comment.deleteMany({ kavita: kavita._id });

    res.status(200).json({
      success: true,
      message: 'Kavita deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all poems created by current logged-in Poet (or specified poet for Super Admin)
// @route   GET /api/kavitas/my/all
// @access  Private (Writer, Admin, Super Admin)
export const getMyKavitas = async (req, res) => {
  try {
    let authorId = req.user.id;
    if (req.user.role === 'superadmin' && req.query.poetId) {
      authorId = req.query.poetId;
    }

    const filter = { author: authorId };
    if (req.query.search && req.query.search.trim()) {
      const q = req.query.search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subtitle: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const poems = await Kavita.find(filter).sort({ createdAt: -1 });

    const totalViews = poems.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalLikes = poems.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    const totalBookmarks = poems.reduce((acc, p) => acc + (p.bookmarksCount || 0), 0);

    res.status(200).json({
      success: true,
      count: poems.length,
      stats: {
        totalPoems: poems.length,
        published: poems.filter((p) => p.status === 'published' || p.status === 'featured').length,
        drafts: poems.filter((p) => p.status === 'draft').length,
        totalViews,
        totalLikes,
        totalBookmarks,
      },
      data: poems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export All Kavitas of the current poet (Diwan / Anthology Bulk Export)
// @route   GET /api/kavitas/my/export-all
// @access  Private
export const exportAllMyKavitas = async (req, res) => {
  try {
    let authorId = req.user.id;
    let authorUser = req.user;
    if (req.user.role === 'superadmin' && req.query.poetId) {
      authorId = req.query.poetId;
      const targetUser = await User.findById(authorId);
      if (targetUser) authorUser = targetUser;
    }

    const poems = await Kavita.find({ author: authorId }).sort({ createdAt: -1 });

    const anthology = {
      poetName: authorUser.name,
      penName: authorUser.penName,
      bio: authorUser.bio,
      exportTimestamp: new Date().toISOString(),
      collectionTitle: `दीवान-ए-${authorUser.penName || authorUser.name} (Anthology of Verses)`,
      totalPoems: poems.length,
      poems: poems.map((p) => ({
        id: p._id,
        heading: p.title,
        subtitle: p.subtitle,
        language: p.language,
        rasa: p.rasa,
        form: p.form,
        theme: p.theme,
        content: p.content,
        stanzas: p.stanzas,
        createdDate: p.createdAt,
        stats: {
          views: p.viewsCount,
          likes: p.likesCount,
        },
      })),
    };

    res.status(200).json({
      success: true,
      anthology,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Like on a Kavita
// @route   POST /api/kavitas/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id);
    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    kavita.likesCount = (kavita.likesCount || 0) + 1;
    await kavita.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      likesCount: kavita.likesCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a Kavita & notify the poet
// @route   POST /api/kavitas/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide comment text' });
    }

    const kavita = await Kavita.findById(req.params.id);
    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    const comment = await Comment.create({
      kavita: kavita._id,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      poet: kavita.author,
      content: content.trim(),
    });

    // Notify the poet in platform notification center (if comment is by someone else)
    const poetId = kavita.author?._id ? kavita.author._id.toString() : kavita.author?.toString();
    if (poetId && poetId !== req.user.id) {
      try {
        await Notification.create({
          recipient: poetId,
          sender: req.user._id,
          senderName: req.user.name,
          type: 'comment',
          kavita: kavita._id,
          kavitaTitle: kavita.title,
          message: `${req.user.name} reacted: "${content.trim().substring(0, 75)}${content.trim().length > 75 ? '...' : ''}"`,
        });

        // Send Brevo email notification to the poet
        const poetUser = await User.findById(poetId);
        if (poetUser && poetUser.email) {
          sendCommentNotificationEmail(poetUser, req.user.name, kavita, content.trim()).catch((e) =>
            console.warn('Poet comment email dispatch note:', e.message)
          );
        }
      } catch (notifErr) {
        console.warn('Notification create note:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added and delivered to the poet successfully',
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle poem visibility on website (Show / Hide on Website)
// @route   PUT /api/kavitas/:id/visibility
// @access  Private (Poet or Admin/Super Admin)
export const toggleVisibility = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id);
    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    const isOwner = kavita.author?.toString() === req.user.id || kavita.author?._id?.toString() === req.user.id;
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to change the visibility of this poem',
      });
    }

    const currentVis = kavita.isVisible !== false;
    const newVisibility = typeof req.body.isVisible === 'boolean' ? req.body.isVisible : !currentVis;

    kavita.isVisible = newVisibility;
    await kavita.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Poem visibility set to ${newVisibility ? 'Visible (Public on website)' : 'Hidden (Private in your Diwan)'}`,
      isVisible: kavita.isVisible,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reader comments received by the logged in poet
// @route   GET /api/kavitas/my/comments
// @access  Private (Writer, Admin, Super Admin)
export const getPoetComments = async (req, res) => {
  try {
    const poetPoems = await Kavita.find({ author: req.user.id }).select('_id title');
    const poemIds = poetPoems.map((p) => p._id);

    const comments = await Comment.find({
      $or: [{ poet: req.user.id }, { kavita: { $in: poemIds } }],
    })
      .populate('kavita', 'title subtitle language theme')
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

