import { User, Kavita, Comment, SecurityTelemetry } from '../models/index.js';
import { sendBrevoEmail } from '../services/brevoEmailService.js';

// @desc    Get complete platform governance statistics
// @route   GET /api/admin/stats
// @access  Private (Admin, Super Admin)
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalWriters,
      totalReaders,
      totalAdmins,
      totalKavitas,
      publishedKavitas,
      featuredKavitas,
      draftKavitas,
      totalComments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'writer' }),
      User.countDocuments({ role: 'reader' }),
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
      Kavita.countDocuments(),
      Kavita.countDocuments({ status: 'published' }),
      Kavita.countDocuments({ isFeatured: true }),
      Kavita.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
    ]);

    // Aggregate poems by language
    const languageStats = await Kavita.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Aggregate poems by rasa
    const rasaStats = await Kavita.aggregate([
      { $group: { _id: '$rasa', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Calculate total platform views & likes
    const engagement = await Kavita.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' },
          totalLikes: { $sum: '$likesCount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          writers: totalWriters,
          readers: totalReaders,
          admins: totalAdmins,
        },
        kavitas: {
          total: totalKavitas,
          published: publishedKavitas,
          featured: featuredKavitas,
          drafts: draftKavitas,
        },
        engagement: {
          totalViews: engagement[0]?.totalViews || 0,
          totalLikes: engagement[0]?.totalLikes || 0,
          totalComments,
        },
        languageBreakdown: languageStats,
        rasaBreakdown: rasaStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with role filtering & search
// @route   GET /api/admin/users
// @access  Private (Admin, Super Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { penName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user role (Assign Super Admin, Admin, Writer, Reader)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Super Admin Only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['reader', 'writer', 'admin', 'superadmin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role supplied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Guard: Prevent demoting yourself if you are the logged in superadmin
    if (user._id.toString() === req.user.id && role !== 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke your own Super Admin role',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate Kavita status (Publish, Feature, Under Review, Archive)
// @route   PUT /api/admin/kavitas/:id/status
// @access  Private (Admin, Super Admin)
export const moderateKavita = async (req, res) => {
  try {
    const { status, isFeatured } = req.body;
    const kavita = await Kavita.findById(req.params.id);

    if (!kavita) {
      return res.status(404).json({ success: false, message: 'Kavita not found' });
    }

    if (status) {
      kavita.status = status;
    }

    if (typeof isFeatured === 'boolean') {
      kavita.isFeatured = isFeatured;
      if (isFeatured) {
        kavita.featuredAt = new Date();
      }
    }

    if (typeof req.body.isVisible === 'boolean') {
      kavita.isVisible = req.body.isVisible;
    }

    await kavita.save();

    res.status(200).json({
      success: true,
      message: `Kavita moderation status updated successfully`,
      data: kavita,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Block/Suspension for a User/Creator
// @route   PUT /api/admin/users/:id/block
// @access  Private (Super Admin)
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot block Super Admin accounts' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({
      success: true,
      message: user.isBlocked ? `Creator ${user.name} has been suspended/blocked.` : `Creator ${user.name} has been unblocked.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Restriction for a Creator (blocks publishing poems)
// @route   PUT /api/admin/users/:id/restrict
// @access  Private (Super Admin)
export const toggleRestrictUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot restrict Super Admin accounts' });
    }
    user.isRestricted = !user.isRestricted;
    await user.save();
    res.status(200).json({
      success: true,
      message: user.isRestricted ? `Creator ${user.name} publishing restricted.` : `Creator ${user.name} restriction lifted.`,
      isRestricted: user.isRestricted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account and all their poems
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin)
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete Super Admin accounts' });
    }
    await Kavita.deleteMany({ author: user._id });
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: `User ${user.name} and their authored verses permanently removed`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete any poem from platform
// @route   DELETE /api/admin/kavitas/:id
// @access  Private (Admin, Super Admin)
export const deleteKavitaAdmin = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id);
    if (!kavita) return res.status(404).json({ success: false, message: 'Kavita not found' });
    await kavita.deleteOne();
    res.status(200).json({
      success: true,
      message: `Poem "${kavita.title}" permanently deleted from archive`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Super Admin edit poem content & attributes
// @route   PUT /api/admin/kavitas/:id
// @access  Private (Super Admin)
export const editKavitaAdmin = async (req, res) => {
  try {
    const kavita = await Kavita.findById(req.params.id);
    if (!kavita) return res.status(404).json({ success: false, message: 'Kavita not found' });

    const fields = ['title', 'subtitle', 'content', 'language', 'rasa', 'form', 'theme', 'fontFamily', 'status', 'isVisible', 'isFeatured'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) kavita[f] = req.body[f];
    });

    await kavita.save();
    res.status(200).json({
      success: true,
      message: `Poem "${kavita.title}" updated by Super Administrator`,
      data: kavita,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send test email via Brevo transactional service
// @route   POST /api/admin/brevo/test-email
// @access  Private (Admin, Super Admin)
export const sendBrevoTest = async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || req.user.email;

    const result = await sendBrevoEmail({
      toEmail: recipient,
      toName: req.user.name,
      subject: '🚀 Mukt Kavya Brevo Email Gateway Test',
      htmlContent: `
        <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
          <h2 style="color: #38bdf8;">Brevo Email Integration Active!</h2>
          <p>This is a verification email dispatched by Mukt Kavya Kavita Management System.</p>
          <p>Dispatched by Super Admin / Admin: <strong>${req.user.name} (${req.user.email})</strong></p>
          <p style="color: #94a3b8; font-size: 13px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
      textContent: `Brevo Email Integration Test successful. Dispatched by ${req.user.name}.`,
    });

    res.status(200).json({
      success: true,
      message: result.simulated
        ? 'Brevo email simulated (Check server console log or provide live Brevo API Key in .env)'
        : 'Live Brevo email dispatched successfully!',
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 🏛️ HERITAGE & CLASSICAL POETS VAULT (MAINTAINED BY SUPER ADMIN)
// ============================================================================

// Curated Heritage Presets of Popular Historical / Copyright-Free Poets
const HERITAGE_PRESETS = [
  {
    id: 'dinkar',
    name: 'रामधारी सिंह "दिनकर"',
    penName: 'दिनकर',
    era: '1908 – 1974 (राष्ट्रकवि / आधुनिक युग)',
    bio: 'राष्ट्रकवि, ओज और वीर रस के अद्वितीय अमर गायक। रश्मिरथी, उर्वशी, कुरुक्षेत्र और हुंकार के अमर रचयिता। (Public Domain Heritage)',
    languages: ['Hindi', 'Sanskrit'],
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'रश्मिरथी: तृतीय सर्ग - कृष्ण की चेतावनी',
    sampleContent: `वर्षों तक वन में घूम-घूम,
बाधा-विघ्नों को चूम-चूम,
सह धूप-घाम, पानी-पत्थर,
पांडव आये कुछ और निखर।
सौभाग्य न सब दिन सोता है,
देखें, आगे क्या होता है।

मैत्री की राह बताने को,
सबको सुमार्ग पर लाने को,
दुर्योधन को समझाने को,
भीषण विध्वंस बचाने को,
भगवान हस्तिनापुर आये,
पांडव का संदेशा लाये।

'दो न्याय अगर तो आधा दो,
पर, इसमें भी यदि बाधा हो,
तो दे दो केवल पाँच ग्राम,
रक्खो अपनी धरती तमाम।
हम वहीं खुशी से खायेंगे,
परिजन पर असि न उठायेंगे।'

दुर्योधन वह भी दे न सका,
आशीष समाज की ले न सका,
उलटे, हरि को बाँधने चला,
जो था असाध्य, साधने चला।
जब नाश मनुज पर छाता है,
पहले विवेक मर जाता है।

हरि ने भीषण हुंकार किया,
अपना स्वरूप-विस्तार किया,
डगमग-डगमग दिग्गज डोले,
भगवान कुपित होकर बोले-
'जंजीर बढ़ा कर साध मुझे,
हाँ, हाँ दुर्योधन! बाँध मुझे।`,
    sampleLanguage: 'Hindi',
    sampleRasa: 'Veer (Heroic/Valor)',
    sampleForm: 'Chhand / Matrik',
    sampleTheme: 'royal-velvet',
  },
  {
    id: 'kabir',
    name: 'संत कबीर दास',
    penName: 'कबीर',
    era: '1398 – 1518 (भक्तिकाल - निर्गुण धारा)',
    bio: 'भक्तिकाल की निर्गुण ज्ञानाश्रयी शाखा के शिरोमणि संत, समाज सुधारक एवं आध्यात्मिक युगदृष्टा। (Public Domain Ancient Heritage)',
    languages: ['Hindi'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'कबीर के अमर दोहे (साखी संग्रह)',
    sampleContent: `पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय।
ढाई आखर प्रेम का, पढ़े सो पंडित होय॥

बुरा जो देखन मैं चला, बुरा न मिलिया कोय।
जो दिल खोजा आपना, मुझसे बुरा न कोय॥

काल करे सो आज कर, आज करे सो अब।
पल में परलय होएगी, बहुरि करेगा कब॥

साधु ऐसा चाहिए, जैसा सूप सुभाय।
सार-सार को गहि रहै, थोथा देई उड़ाय॥

माटी कहे कुम्हार से, तू क्या रोंदे मोहे।
एक दिन ऐसा आएगा, मैं रोंदूंगी तोहे॥`,
    sampleLanguage: 'Hindi',
    sampleRasa: 'Bhakti (Devotion/Spiritual)',
    sampleForm: 'Dohe (Couplets)',
    sampleTheme: 'golden-sunset',
  },
  {
    id: 'ghalib',
    name: 'मिर्ज़ा असदुल्लाह ख़ाँ "ग़ालिब"',
    penName: 'ग़ालिब',
    era: '1797 – 1869 (दहलवी / मुग़ल काल)',
    bio: 'उर्दू और फ़ारसी शायरी के बेताज बादशाह। मिर्ज़ा नौशा, दहलवी तख़ल्लुस के अमर शायर। (Public Domain Classical)',
    languages: ['Urdu', 'Hindi'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'दिल-ए-नादाँ तुझे हुआ क्या है',
    sampleContent: `दिल-ए-नादाँ तुझे हुआ क्या है?
आख़िर इस दर्द की दवा क्या है?

हम हैं मुश्ताक़ और वो बेज़ार,
या इलाही ये माजरा क्या है?

मैं भी मुँह में ज़बान रखता हूँ,
काश पूछो कि मुद्दआ क्या है!

जब कि तुझ बिन नहीं कोई मौजूद,
फिर ये हंगामा, ऐ ख़ुदा क्या है?

हम को उन से वफ़ा की है उम्मीद,
जो नहीं जानते वफ़ा क्या है।

जान तुम पर निसार करता हूँ,
मैं नहीं जानता दुआ क्या है।`,
    sampleLanguage: 'Urdu',
    sampleRasa: 'Karun (Pathos/Compassion)',
    sampleForm: 'Ghazal (Couplets/Sher)',
    sampleTheme: 'midnight-cosmos',
  },
  {
    id: 'nirala',
    name: 'सूर्यकांत त्रिपाठी "निराला"',
    penName: 'निराला',
    era: '1896 – 1961 (छायावाद के चार स्तंभ)',
    bio: 'हिंदी में मुक्त छंद के प्रवर्तक, क्रांतिकारी कवि, छायावाद के महाप्राण स्तंभ। (Public Domain Heritage)',
    languages: ['Hindi', 'Sanskrit'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'वर दे, वीणावादिनि वर दे!',
    sampleContent: `वर दे, वीणावादिनि वर दे!
प्रिय स्वतंत्र-रव, अमृत-मंत्र नव
भारत में भर दे!

काट अंध-उर के बंधन-स्तर
बहा जननि, ज्योतिर्मय निर्झर;
कलुष-भेद-तम हर प्रकाश भर
जगमग जग कर दे!

नव गति, नव लय, ताल-छंद नव
नवल कंठ, नव जलद-मन्द्ररव;
नव नभ के नव विहग-वृंद को
नव पर, नव स्वर दे!`,
    sampleLanguage: 'Hindi',
    sampleRasa: 'Bhakti (Devotion/Spiritual)',
    sampleForm: 'Geet (Lyrical Poem)',
    sampleTheme: 'classic-ivory',
  },
  {
    id: 'tagore',
    name: 'रवींद्रनाथ ठाकुर (Rabindranath Tagore)',
    penName: 'भानुसिंह',
    era: '1861 – 1941 (विश्वकवि / नोबेल Laureate)',
    bio: 'नोबेल पुरस्कार से सम्मानित विश्वकवि, गीतांजलि के अमर रचयिता, चित्रकार एवं दार्शनिक। (Public Domain World Heritage)',
    languages: ['Bengali', 'English', 'Hindi'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'चित्त जेथा भयशून्य (Where the Mind Is Without Fear)',
    sampleContent: `Where the mind is without fear and the head is held high;
Where knowledge is free;
Where the world has not been broken up into fragments
By narrow domestic walls;
Where words come out from the depth of truth;
Where tireless striving stretches its arms towards perfection;
Where the clear stream of reason has not lost its way
Into the dreary desert sand of dead habit;
Where the mind is led forward by thee
Into ever-widening thought and action;
Into that heaven of freedom, my Father,
Let my country awake.`,
    sampleLanguage: 'English',
    sampleRasa: 'Shant (Peace/Serenity)',
    sampleForm: 'Mukt Kavya (Free Verse)',
    sampleTheme: 'emerald-forest',
  },
  {
    id: 'mahadevi',
    name: 'महादेवी वर्मा',
    penName: 'महादेवी',
    era: '1907 – 1987 (आधुनिक मीरा / ज्ञानपीठ)',
    bio: 'छायावाद की प्रमुख कवयित्री, आधुनिक मीरा, यामा की रचयिता एवं प्रखर विदुषी। (Public Domain Heritage)',
    languages: ['Hindi'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    sampleTitle: 'मैं नीर भरी दुख की बदली!',
    sampleContent: `मैं नीर भरी दुख की बदली!
स्पंदन में चिर निस्पंद बसा,
क्रंदन में आहत विश्व हंसा,
नयनों में दीपक से जलते,
पलकों में निर्झरिणी मचली!

मेरा पग पग संगीत भरा,
श्वासों में स्वप्न पराग झरा,
नभ के नव रंग बुनते दुकूल,
छाया में मलय बयार पली!

विस्तृत नभ का कोई कोना,
मेरा न कभी अपना होना,
परिचय इतना इतिहास यही-
उमड़ी कल थी मिट आज चली!`,
    sampleLanguage: 'Hindi',
    sampleRasa: 'Karun (Pathos/Compassion)',
    sampleForm: 'Geet (Lyrical Poem)',
    sampleTheme: 'vintage-parchment',
  },
];

// @desc    Get pre-configured historical poet presets for 1-click creation
// @route   GET /api/admin/managed-poets/presets
// @access  Private (Admin, Super Admin)
export const getHeritagePresets = async (req, res) => {
  res.status(200).json({
    success: true,
    presets: HERITAGE_PRESETS,
  });
};

// @desc    Get all managed & heritage poets
// @route   GET /api/admin/managed-poets
// @access  Private (Admin, Super Admin)
export const getManagedPoets = async (req, res) => {
  try {
    const poets = await User.find({
      $or: [{ isHeritage: true }, { isManaged: true }],
    }).sort({ name: 1 });

    const poetsWithStats = await Promise.all(
      poets.map(async (poet) => {
        const poemCount = await Kavita.countDocuments({ author: poet._id });
        return {
          _id: poet._id,
          name: poet.name,
          penName: poet.penName,
          era: poet.era || 'Classical Master',
          bio: poet.bio,
          languages: poet.languages,
          avatar: poet.avatar,
          isHeritage: poet.isHeritage,
          isManaged: poet.isManaged,
          poemCount,
          createdAt: poet.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: poetsWithStats.length,
      data: poetsWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new Heritage / Managed poet without requiring email or password
// @route   POST /api/admin/managed-poets
// @access  Private (Super Admin)
export const createManagedPoet = async (req, res) => {
  try {
    const { name, penName, era, bio, languages, avatar } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Poet name is required' });
    }

    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const internalEmail = `heritage_${uniqueId}@vault.muktkavya.internal`;
    const randomPassword = 'vault_' + Math.random().toString(36) + Math.random().toString(36);

    const poet = await User.create({
      name: name.trim(),
      penName: penName ? penName.trim() : '',
      era: era ? era.trim() : 'Classical Era (Public Domain)',
      bio: bio ? bio.trim() : 'Classical & Heritage master of literary verse.',
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['Hindi'],
      avatar: avatar || '',
      email: internalEmail,
      password: randomPassword,
      role: 'writer',
      isHeritage: true,
      isManaged: true,
      managedBy: req.user.id,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: `Heritage poet "${poet.name}" created and added to archive vault`,
      data: poet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a Heritage / Managed poet profile
// @route   PUT /api/admin/managed-poets/:id
// @access  Private (Super Admin)
export const updateManagedPoet = async (req, res) => {
  try {
    const poet = await User.findById(req.params.id);
    if (!poet || (!poet.isHeritage && !poet.isManaged)) {
      return res.status(404).json({ success: false, message: 'Heritage poet not found' });
    }

    const { name, penName, era, bio, languages, avatar } = req.body;
    if (name) poet.name = name.trim();
    if (penName !== undefined) poet.penName = penName.trim();
    if (era !== undefined) poet.era = era.trim();
    if (bio !== undefined) poet.bio = bio.trim();
    if (languages) poet.languages = languages;
    if (avatar !== undefined) poet.avatar = avatar;

    await poet.save();

    // Sync updated authorName and penName to existing poems of this poet
    if (name || penName !== undefined) {
      await Kavita.updateMany(
        { author: poet._id },
        { authorName: poet.name, penName: poet.penName }
      );
    }

    res.status(200).json({
      success: true,
      message: `Heritage poet "${poet.name}" profile updated`,
      data: poet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a Heritage / Managed poet and their archived verses
// @route   DELETE /api/admin/managed-poets/:id
// @access  Private (Super Admin)
export const deleteManagedPoet = async (req, res) => {
  try {
    const poet = await User.findById(req.params.id);
    if (!poet) return res.status(404).json({ success: false, message: 'Poet not found' });

    await Kavita.deleteMany({ author: poet._id });
    await poet.deleteOne();

    res.status(200).json({
      success: true,
      message: `Heritage poet "${poet.name}" and associated verses permanently removed from archive`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Super Admin feeds a new poem under a Heritage / Managed poet
// @route   POST /api/admin/managed-poets/:id/feed-poem
// @access  Private (Super Admin)
export const feedPoemForPoet = async (req, res) => {
  try {
    const poet = await User.findById(req.params.id);
    if (!poet) {
      return res.status(404).json({ success: false, message: 'Target poet not found' });
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
      tags,
      isFeatured,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Title and Verses Content for the poem',
      });
    }

    const parseStanzas = (rawContent) => {
      const blocks = rawContent.split(/\n\s*\n/);
      return blocks.map((block, index) => ({
        stanzaNumber: index + 1,
        lines: block.split('\n').map((l) => l.trim()).filter(Boolean),
        notes: '',
      }));
    };

    const structuredStanzas =
      stanzas && stanzas.length > 0 ? stanzas : parseStanzas(content);

    const poem = await Kavita.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      content,
      stanzas: structuredStanzas,
      language: language || (poet.languages?.[0] || 'Hindi'),
      rasa: rasa || 'Shant (Peace/Serenity)',
      form: form || 'Mukt Kavya (Free Verse)',
      theme: theme || 'royal-velvet',
      fontFamily: fontFamily || 'Rozha One, Tiro Devanagari Hindi, serif',
      author: poet._id,
      authorName: poet.name,
      penName: poet.penName || '',
      status: 'published',
      isFeatured: Boolean(isFeatured),
      featuredAt: isFeatured ? new Date() : null,
      isHeritage: true,
      maintainedBy: req.user.id,
      era: poet.era || '',
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(',').map((t) => t.trim())
        : ['Heritage', 'Classical', poet.penName || poet.name],
      viewsCount: 0,
      likesCount: 0,
    });

    res.status(201).json({
      success: true,
      message: `Poem "${poem.title}" successfully fed into archive under ${poet.name}`,
      data: poem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 🛡️ SECURITY AUDIT & VISITOR TELEMETRY CONTROLLERS (ENTERPRISE GRADE)
// ============================================================================

// @desc    Get paginated security audit & visitor telemetry logs
// @route   GET /api/admin/telemetry
// @access  Private (Admin, Super Admin)
export const getSecurityTelemetry = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      search,
      riskOnly,
      device,
    } = req.query;

    const query = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    if (riskOnly === 'true') {
      query.riskScore = { $gte: 40 };
    }

    if (device && device !== 'all') {
      query.device = device;
    }

    if (search) {
      query.$or = [
        { ipAddress: { $regex: search, $options: 'i' } },
        { userAgent: { $regex: search, $options: 'i' } },
        { kavitaTitle: { $regex: search, $options: 'i' } },
        { kavitaAuthor: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'geo.city': { $regex: search, $options: 'i' } },
        { 'geo.region': { $regex: search, $options: 'i' } },
        { 'geo.country': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      SecurityTelemetry.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SecurityTelemetry.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregate security metrics and visitor stats
// @route   GET /api/admin/telemetry/stats
// @access  Private (Admin, Super Admin)
export const getSecurityTelemetryStats = async (req, res) => {
  try {
    const [
      totalLogs,
      totalViews,
      totalExports,
      highRiskLogs,
      recentAlerts,
    ] = await Promise.all([
      SecurityTelemetry.countDocuments(),
      SecurityTelemetry.countDocuments({ action: 'view_kavita' }),
      SecurityTelemetry.countDocuments({ action: { $in: ['export_pdf', 'export_txt'] } }),
      SecurityTelemetry.countDocuments({ riskScore: { $gte: 40 } }),
      SecurityTelemetry.find({ riskScore: { $gte: 40 } })
        .sort({ timestamp: -1 })
        .limit(10),
    ]);

    // Unique visitor IPs count
    const uniqueIpsResult = await SecurityTelemetry.distinct('ipAddress');
    const uniqueIpsCount = uniqueIpsResult.length;

    // Device breakdown
    const deviceBreakdown = await SecurityTelemetry.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top regions
    const regionalDistribution = await SecurityTelemetry.aggregate([
      {
        $group: {
          _id: {
            country: '$geo.country',
            region: '$geo.region',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top viewed poems
    const topViewedPoems = await SecurityTelemetry.aggregate([
      { $match: { kavitaTitle: { $ne: '' } } },
      {
        $group: {
          _id: '$kavitaTitle',
          author: { $first: '$kavitaAuthor' },
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalLogs,
        totalViews,
        totalExports,
        uniqueIps: uniqueIpsCount,
        highRiskCount: highRiskLogs,
        deviceBreakdown,
        regionalDistribution,
        topViewedPoems,
        recentAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export security logs for enterprise compliance & audit
// @route   GET /api/admin/telemetry/export
// @access  Private (Admin, Super Admin)
export const exportSecurityTelemetry = async (req, res) => {
  try {
    const logs = await SecurityTelemetry.find()
      .sort({ timestamp: -1 })
      .limit(500);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

