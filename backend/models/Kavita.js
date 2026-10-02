import mongoose from 'mongoose';

const KavitaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide the Heading / Title of your Kavita'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Subtitle/Dedication cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide the verses/content of the Kavita'],
    },
    stanzas: [
      {
        stanzaNumber: { type: Number },
        lines: [{ type: String }],
        notes: { type: String, default: '' },
      },
    ],
    language: {
      type: String,
      required: true,
      enum: [
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
        'Other',
      ],
      default: 'Hindi',
    },
    rasa: {
      type: String,
      enum: [
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
        'Universal',
      ],
      default: 'Shant (Peace/Serenity)',
    },
    form: {
      type: String,
      enum: [
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
        'Kavitt / Savaiya',
        'Other',
      ],
      default: 'Mukt Kavya (Free Verse)',
    },
    theme: {
      type: String,
      enum: [
        'vintage-parchment',
        'royal-velvet',
        'midnight-cosmos',
        'golden-sunset',
        'emerald-forest',
        'rose-saffron',
        'obsidian-minimal',
        'classic-ivory',
      ],
      default: 'vintage-parchment',
    },
    fontFamily: {
      type: String,
      default: 'Rozha One, Tiro Devanagari Hindi, serif',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    penName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'under_review', 'published', 'featured', 'archived'],
      default: 'published',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    audioUrl: {
      type: String,
      default: '',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    bookmarksCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredAt: {
      type: Date,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isHeritage: {
      type: Boolean,
      default: false,
    },
    maintainedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    era: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for rapid multilingual text search and filtering
KavitaSchema.index(
  { title: 'text', content: 'text', authorName: 'text', penName: 'text' },
  { language_override: 'dummy_language_override', default_language: 'none' }
);
KavitaSchema.index({ language: 1, rasa: 1, status: 1, createdAt: -1 });

export default mongoose.model('Kavita', KavitaSchema);
