import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    kavita: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kavita',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      default: 'reader',
    },
    poet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isReadByPoet: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: [true, 'Please provide comment text'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Comment', CommentSchema);
