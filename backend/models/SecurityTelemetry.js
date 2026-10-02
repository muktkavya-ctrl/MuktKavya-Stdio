import mongoose from 'mongoose';

const securityTelemetrySchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userAgent: {
      type: String,
      default: 'Unknown User Agent',
      trim: true,
    },
    browser: {
      type: String,
      default: 'Unknown Browser',
    },
    os: {
      type: String,
      default: 'Unknown OS',
    },
    device: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Bot/Crawler', 'Unknown'],
      default: 'Desktop',
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        'view_kavita',
        'read_full',
        'export_pdf',
        'export_txt',
        'like_poem',
        'comment_poem',
        'login_success',
        'login_failed',
        'security_probe',
      ],
      default: 'view_kavita',
    },
    kavita: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kavita',
      index: true,
    },
    kavitaTitle: {
      type: String,
      default: '',
    },
    kavitaAuthor: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      default: 'Anonymous Visitor',
    },
    userEmail: {
      type: String,
      default: 'anonymous@visitor.net',
    },
    userRole: {
      type: String,
      default: 'guest',
    },
    geo: {
      country: { type: String, default: 'India' },
      countryCode: { type: String, default: 'IN' },
      region: { type: String, default: 'Delhi' },
      city: { type: String, default: 'New Delhi' },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },
    riskScore: {
      type: Number,
      default: 0, // 0 = Safe, > 50 = Suspicious, > 80 = High Threat
      min: 0,
      max: 100,
      index: true,
    },
    riskFlags: [
      {
        type: String,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid analytics queries
securityTelemetrySchema.index({ timestamp: -1, action: 1 });
securityTelemetrySchema.index({ ipAddress: 1, timestamp: -1 });
securityTelemetrySchema.index({ kavita: 1, timestamp: -1 });

export const SecurityTelemetry = mongoose.model('SecurityTelemetry', securityTelemetrySchema);
