import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['comment', 'like', 'follow'],
      required: true,
    },
    kavita: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kavita',
    },
    kavitaTitle: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
