const mongoose = require('mongoose');

const savedMealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nutritionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Nutrition',
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  },
  customNotes: {
    type: String,
    default: ''
  },
  quantity: {
    type: String,
    default: '1 serving'
  }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret.__v;
    }
  },
  indexes: [
    { userId: 1, nutritionId: 1 },
    { userId: 1 },
    { savedAt: -1 }
  ]
});

savedMealSchema.index({ userId: 1, nutritionId: 1 }, { unique: true });

const SavedMeal = mongoose.model('SavedMeal', savedMealSchema, 'savedMeals');

module.exports = SavedMeal;
