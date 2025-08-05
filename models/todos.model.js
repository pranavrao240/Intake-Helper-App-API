const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // ideally this should be ObjectId too
      required: true,
    },
    meals: [
      {
        nutritionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Nutrition",
          required: true,
        },
        
        type:{
          type: [String],
          enum: ["Breakfast", "Lunch", "Dinner"],
          required: false,
        },
        time:{
          type: [String],
          required: false,
          
        },
        day:{
          type: [String],
          default: null,
          required: false,
  
        }
      },
    ],
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        if (ret._id) {
          ret.todoId = ret._id;
          delete ret._id;
        }
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("Todos", todoSchema);
