// // const mongoose = require('mongoose');

// // const nutritionSchema = new mongoose.Schema({
// //   nutritionId: {
// //     type: Number,
// //     unique: true,
// //     required: true,
// //   },
// //   DishName: {
// //     type: String,
// //     unique: true,
// //     required: true,
// //   },
// //   Calories: Number,
// //   Protein: Number,
// //   Fat: Number,
// //   Carbohydrates: Number,
// // }, {
// //   toJSON: {
// //     transform: function (doc, ret) {
// //       ret.nutritionId = ret.nutritionId; // keep this
// //       ret.id = ret._id.toString(); // optional if you want to expose _id as "id"
// //       delete ret._id;
// //       delete ret.__v;
// //     },
// //   },
// // });


// // const Nutrition = mongoose.model('Nutrition', nutritionSchema);

// // module.exports = Nutrition;

// const mongoose = require('mongoose');

// const nutritionSchema = new mongoose.Schema({
//   nutritionId: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   selected:{
//     type: String ,
//     default:"Not Select",
//     required :false

//   },
//   DishName: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   Calories: Number,
//   Protein: Number,
//   Fat: Number,
//   Carbohydrates: Number,
//   FreeSugar: Number,
//   Fibre: Number,
//   Sodium: Number,
//   Calcium: Number,
//   Iron: Number,
//   VitaminC: Number,
//   Folate: Number,
// }, {
//   toJSON: {
//     transform: function (doc, ret) {
//                 if (ret._id) {
//                     ret.nutritionId = ret._id; 
//                     delete ret._id;
//                 }
//                 delete ret.__v;
//             }
//   },
// });

// console.log(new mongoose.Types.ObjectId().toString());
// const Nutrition = mongoose.model('Nutrition', nutritionSchema);

// module.exports = Nutrition;


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

const Nutrition = mongoose.model('Nutrition', nutritionSchema);
module.exports = Nutrition;
