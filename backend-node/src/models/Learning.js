const mongoose = require('mongoose');

/**
 * Learning Hub Content Schema
 *
 * Supports: YouTube videos, uploaded PDFs, external articles.
 * Content is authored by admin and optionally published to public view.
 */
const learningSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Primary category for filtering in the public hub
    category: {
      type: String,
      enum: ['Gemology', 'Market Trends', 'Tutorials', 'Mining & Origin', 'Certification'],
      required: true,
    },

    // Resource type — determines how the frontend renders it
    content_type: {
      type: String,
      enum: ['video', 'pdf', 'article'],
      default: 'video',
    },

    // YouTube URL, hosted video URL, PDF path, or external article URL
    content_url: {
      type: String,
      required: true,
      trim: true,
    },

    // Card thumbnail — YouTube thumb, PDF cover, or custom image
    thumbnail_url: {
      type: String,
      default: '',
      trim: true,
    },

    // Admin who created this content
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Only published content appears in the public Learning Hub
    is_published: {
      type: Boolean,
      default: false,
    },

    // Soft tag list for future search enhancement
    tags: {
      type: [String],
      default: [],
    },

    // Approximate read / watch duration
    duration: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Index for fast public reads (published only, sorted by category)
learningSchema.index({ is_published: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Learning', learningSchema);
