const mongoose = require('mongoose');

const mealSuggestionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      ret.created_at = ret.createdAt; // Expose created_at
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      ret.created_at = ret.createdAt; // Expose created_at
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient sorting by creation time
mealSuggestionHistorySchema.index({ userId: 1, createdAt: -1 });

const MealSuggestionHistory = mongoose.models.MealSuggestionHistory || mongoose.model('MealSuggestionHistory', mealSuggestionHistorySchema, 'mealSuggestionHistories');

module.exports = MealSuggestionHistory;
