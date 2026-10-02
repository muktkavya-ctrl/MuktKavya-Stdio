import { User, Kavita, Notification } from '../models/index.js';
import { sendWelcomeEmail, sendPasswordResetOtpEmail } from '../services/brevoEmailService.js';

// @desc    Register a new user (Writer or Reader)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, penName, bio, languages } = req.body;

    // Validate email
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Default assigned role can be writer or reader; prevent self-assigning superadmin/admin
    const assignedRole = role === 'reader' ? 'reader' : 'writer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      penName: penName || '',
      bio: bio || 'A lover of verse and poetic expressions.',
      languages: languages && languages.length > 0 ? languages : ['Hindi', 'English'],
    });

    const token = user.getSignedJwtToken();

    // Trigger Brevo Welcome Email in the background
    sendWelcomeEmail(user).catch((err) =>
      console.warn('Background welcome email error:', err.message)
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        penName: user.penName,
        bio: user.bio,
        languages: user.languages,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server registration error',
    });
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the Super Administrator.',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        penName: user.penName,
        bio: user.bio,
        languages: user.languages,
        avatar: user.avatar,
        socials: user.socials,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server login error',
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        penName: user.penName,
        bio: user.bio,
        languages: user.languages,
        avatar: user.avatar,
        socials: user.socials,
        followers: user.followers || [],
        following: user.following || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, penName, bio, languages, socials, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (penName !== undefined) user.penName = penName;
    if (bio !== undefined) user.bio = bio;
    if (languages) user.languages = languages;
    if (avatar !== undefined) user.avatar = avatar;
    if (socials) user.socials = { ...user.socials, ...socials };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        penName: user.penName,
        bio: user.bio,
        languages: user.languages,
        avatar: user.avatar,
        socials: user.socials,
        followers: user.followers || [],
        following: user.following || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public poet profile with their published poems & follower counts
// @route   GET /api/auth/poet/:id
// @access  Public
export const getPoetPublicProfile = async (req, res) => {
  try {
    const poet = await User.findById(req.params.id).select('-password');
    if (!poet) {
      return res.status(404).json({ success: false, message: 'Poet not found' });
    }

    const poems = await Kavita.find({
      author: poet._id,
      status: { $in: ['published', 'featured'] },
      isVisible: { $ne: false },
    }).sort({ createdAt: -1 });

    const totalViews = poems.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
    const totalLikes = poems.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);

    res.status(200).json({
      success: true,
      poet: {
        id: poet._id,
        name: poet.name,
        penName: poet.penName,
        bio: poet.bio,
        avatar: poet.avatar,
        languages: poet.languages,
        socials: poet.socials,
        followersCount: poet.followers?.length || 0,
        followingCount: poet.following?.length || 0,
        createdAt: poet.createdAt,
      },
      stats: {
        poemsCount: poems.length,
        totalViews,
        totalLikes,
        followers: poet.followers?.length || 0,
        following: poet.following?.length || 0,
      },
      poems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow or Unfollow a Poet / User
// @route   POST /api/auth/follow/:id
// @access  Private
export const toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetUserId),
    ]);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Poet not found' });
    }

    currentUser.following = currentUser.following || [];
    targetUser.followers = targetUser.followers || [];

    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      // Create in-app notification for the target poet
      try {
        await Notification.create({
          recipient: targetUser._id,
          sender: currentUser._id,
          senderName: currentUser.name,
          type: 'follow',
          message: `${currentUser.name} has started following your poetic works.`,
        });
      } catch (notifErr) {
        console.warn('Follow notification create note:', notifErr.message);
      }
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
      message: !isFollowing
        ? `You are now following ${targetUser.name}`
        : `Unfollowed ${targetUser.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user notifications (Comments on poems, new followers)
// @route   GET /api/auth/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar role')
      .populate('kavita', 'title language')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/auth/notifications/read
// @access  Private
export const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request Password Reset OTP via Email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save({ validateBeforeSave: false });

    // Send OTP via Brevo Email
    const emailResult = await sendPasswordResetOtpEmail(user, otp);

    res.status(200).json({
      success: true,
      message: `A 6-digit OTP verification code has been dispatched to ${user.email}.`,
      simulated: emailResult.simulated || false,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error processing OTP request' });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, 6-digit OTP, and your new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOtp: otp.toString().trim(),
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordOtp +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new verification code.',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Sign new token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      message: 'Password has been reset successfully! You are now logged in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        penName: user.penName,
        bio: user.bio,
        languages: user.languages,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error resetting password' });
  }
};


