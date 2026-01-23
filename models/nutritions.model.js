

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
      ret.id = ret._id.toString();  // Expose _id as id
      
      // delete ret._id;
      delete ret.__v;
    }
  }
});

const Nutrition = mongoose.model('Nutrition', nutritionSchema, 'nutritions');

module.exports = Nutrition;

