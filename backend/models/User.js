import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email',
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['reader', 'writer', 'admin', 'superadmin'],
      default: 'writer',
    },
    penName: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: 'A seeker of verse and poetic expressions.',
    },
    avatar: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['Hindi', 'English'],
    },
    socials: {
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isVerified: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    isHeritage: {
      type: Boolean,
      default: false,
    },
    isManaged: {
      type: Boolean,
      default: false,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    era: {
      type: String,
      default: '',
    },
    deathYear: {
      type: String,
      default: '',
    },
    isPublicDomain: {
      type: Boolean,
      default: true,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email, name: this.name },
    process.env.JWT_SECRET || 'fallback_secret_for_mukt_kavya',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
