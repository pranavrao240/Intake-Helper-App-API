// const mongoose = require("mongoose");

// const todoSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String, // ideally this should be ObjectId too
//       required: true,
//     },
//     meals: [
//       {
//         nutritionId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Nutrition",
//           required: true,
//         },
        
//         type:{
//           type: [String],
//           enum: ["Breakfast", "Lunch", "Dinner"],
//           required: false,
//         },
//         time:{
//           type: [String],
//           required: false,
          
//         },
//         day:{
//           type: [String],
//           default: null,
//           required: false,
  
//         }
//       },
//     ],
//   },
//   {
//     toJSON: {
//       transform: function (doc, ret) {
//         if (ret._id) {
//           ret.todoId = ret._id;
//           delete ret._id;
//         }
//         delete ret.__v;
//       },
//     },
//   }
// );

// module.exports = mongoose.model("Todos", todoSchema);


const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    meals: [
      {
        _id: {  // Add _id field to each meal
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
          required: true
        },
        nutritionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Nutrition",
          required: true,
        },
        type: {
          type: [String],
          enum: ["Breakfast", "Lunch", "Dinner"],
          required: false,
        },
        time: {
          type: [String],
          required: false,
        },
        day: {
          type: [String],
          default: null,
          required: false,
        }
      }
    ],
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        if (ret._id) {
          ret.todoId = ret._id;
          delete ret._id;
        }
        // Ensure meal _id is included in the output
        if (ret.meals) {
          ret.meals = ret.meals.map(meal => {
            if (meal._id) {
              meal.mealId = meal._id;
              delete meal._id;
            }
            return meal;
          });
        }
        delete ret.__v;
      },
    },
  }
);

// Remove any existing index on meals.nutritionId
todoSchema.index({ "meals.nutritionId": 1 }, { unique: false });


module.exports = mongoose.model("Todos", todoSchema);