

const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  selected: {
    type: String,
    default: "Not Selected"
  },
  DishName: {
    type: String,
    unique: true,
    required: true,
  },
  DishImage: {
    type: String,
    required: true,

  },
  isSaved: {
    type: Boolean,
    default: false
  },
  Calories: Number,
  Protein: Number,
  Fats: Number,
  Carbohydrates: Number,
  FreeSugar: Number,
  Fibre: Number,
  Sodium: Number,
  Calcium: Number,
  Iron: Number,
  VitaminC: Number,
  Folate: Number,
  QuantityRequired: {
    type: String,
    default: "NULL",
  },
  type:{
    type:String,
    default:"NULL",
  },
  time:{
    type:String,
    default:"NULL",
  },
  day:{
    type:[String],
    default:[],
  }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id.toString();  
      delete ret.__v;
    }
  }
});

const Nutrition = mongoose.model('Nutrition', nutritionSchema, 'nutritions');

module.exports = Nutrition;

