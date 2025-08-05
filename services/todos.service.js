const Nutrition = require("../models/nutritions.model");
const Todos = require("../models/todos.model");  // ✅ Use Todos (not { Todos })
const mongoose = require("mongoose");


async function getTodo(params, callback = null) {
  try {
    if (callback && typeof callback !== "function") {
      throw new Error("callback must be a function");
    }

    const todoDB = await Todos.findOne({ userId: params.userId }).populate({
      path: "meals.nutritionId",
      model: "Nutrition",
      select: "DishName Calories Carbohydrates Protein Fats FreeSugar Fibre Sodium Calcium Iron "
    });

    if (!todoDB) {
      const emptyResult = {
        userId: params.userId,
        mealId: null,
        meals: [],
        message: "No todos found"
      };
      return callback ? callback(null, emptyResult) : emptyResult;
    }

    const result = {
      userId: todoDB.userId,
      mealId: todoDB._id,
      meals: todoDB.meals
        .filter(item => item.nutritionId) // filter out null/invalid entries
        .map(item => ({
          _id: item._id,
          nutrition: {
            nutritionId: item.nutritionId._id,
            id: item.nutritionId._id,
            _id: item.nutritionId._id,
            DishName: item.nutritionId.DishName,
            Calories: item.nutritionId.Calories,
            Carbohydrates: item.nutritionId.Carbohydrates,
            Protein: item.nutritionId.Protein,
            Fats: item.nutritionId.Fats,
            FreeSugar: item.nutritionId.FreeSugar,
            Fibre: item.nutritionId.Fibre,
            Sodium: item.nutritionId.Sodium,
            Calcium: item.nutritionId.Calcium,
            Iron: item.nutritionId.Iron,
            type: item.type || null,
            time: item.time || null,
            day: item.day || []
          }
        }))
    };

    return callback ? callback(null, result) : result;

  } catch (err) {
    if (callback) {
      return callback(err);
    } else {
      throw err;
    }
  }
}
async function addTodoItem(params, callback) {
  try {
    const { userId, meals } = params;

    if (!userId) return callback(new Error("Missing userId"));
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return callback(new Error("meals must be a non-empty array"));
    }

    console.log("Incoming meals:", meals);

    const validMeals = meals
      .filter(
        (m) =>
          m &&
          m.nutritionId &&
          mongoose.Types.ObjectId.isValid(m.nutritionId) &&
          m.time &&
          (Array.isArray(m.day) ? m.day.length > 0 : !!m.day) &&
          (Array.isArray(m.type) ? m.type.length > 0 : !!m.type)
      )
      .map((m) => ({
        nutritionId: m.nutritionId,
        type: Array.isArray(m.type) ? m.type[0] : m.type,
        time: Array.isArray(m.time) ? m.time[0] : m.time,
        day: Array.isArray(m.day) ? m.day : [m.day],
      }));

    console.log("✅ Valid meals after filter and cleanup:", validMeals);

    if (validMeals.length === 0) {
      return callback(new Error("No valid meals with nutritionId/time/day"));
    }

    let todoDoc = await Todos.findOne({ userId });

    if (!todoDoc) {
      const newTodo = new Todos({ userId, meals: validMeals });
      const saved = await newTodo.save();
      return callback(null, saved);
    }

    
    todoDoc.meals = todoDoc.meals.filter((m) => m && m.nutritionId);

    const existingIds = todoDoc.meals.map((m) => m.nutritionId.toString());

    validMeals.forEach((meal) => {
      const idStr = meal.nutritionId.toString();
      if (!existingIds.includes(idStr)) {
        todoDoc.meals.push(meal);
      }
    });

    const updated = await todoDoc.save();
    return callback(null, updated);
  } catch (error) {
    console.error("❌ Error in addTodoItem:", error);
    return callback(error);
  }
}

async function removeTodoItem(params, callback) {
  try {
    const { userId, mealId } = params;

    if (!userId || !mealId) {
      return callback(new Error("Invalid userId or mealId"));
    }

    const todoDoc = await Todos.findOne({ userId });

    if (!todoDoc || !Array.isArray(todoDoc.meals)) {
      return callback(null, { success: false, message: "Todo list is empty" });
    }

    const index = todoDoc.meals.findIndex(
      (item) => item.nutritionId?.toString() === mealId.toString()
    );

    if (index === -1) {
      return callback(null, { success: false, message: "Meal not found" });
    }

    todoDoc.meals.splice(index, 1);

    if (todoDoc.meals.length === 0) {
      await Todos.deleteOne({ userId });
      return callback(null, {
        success: true,
        message: "Last meal removed; todo deleted"
      });
    }

    await todoDoc.save();

    return callback(null, {
      success: true,
      message: "Meal removed",
      todo: todoDoc
    });
  } catch (err) {
    console.error("❌ Error in removeTodoItem:", err);
    return callback(err);
  }
}


module.exports = {
  addTodoItem,
  removeTodoItem,
  getTodo
};
