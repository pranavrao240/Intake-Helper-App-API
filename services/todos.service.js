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

async function resetTodos() {
  try {
    await Todos.deleteMany({});
    return { success: true, message: "Todos reset successfully" };
  } catch (error) {
    console.error("Error resetting todos:", error);
    throw error;
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
        type: Array.isArray(m.type) ? m.type : [m.type],
        time: Array.isArray(m.time) ? m.time : [m.time],
        day: Array.isArray(m.day) ? m.day : [m.day],
      }));

    console.log("✅ Valid meals after filter and cleanup:", validMeals);

    if (validMeals.length === 0) {
      return callback(new Error("No valid meals with nutritionId/time/day/type"));
    }

    let todoDoc = await Todos.findOne({ userId });

    // If no todo exists → create new one
    if (!todoDoc) {
      const newTodo = new Todos({ userId, meals: validMeals });
      const saved = await newTodo.save();
      return callback(null, saved);
    }

    // Process each new meal
    for (const newMeal of validMeals) {
      // Check if a meal with the same nutritionId, type, time, and day exists
      const existingMealIndex = todoDoc.meals.findIndex(m => 
        m.nutritionId.toString() === newMeal.nutritionId.toString() &&
        JSON.stringify(m.type.sort()) === JSON.stringify(newMeal.type.sort()) &&
        JSON.stringify(m.time.sort()) === JSON.stringify(newMeal.time.sort()) &&
        JSON.stringify(m.day.sort()) === JSON.stringify(newMeal.day.sort())
      );

      if (existingMealIndex === -1) {
        // If no exact match found, add the new meal
        todoDoc.meals.push(newMeal);
      } else {
        console.log(`⚠️ Exact duplicate meal found, skipping:`, newMeal);
      }
    }

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

// Add this after the existing functions in todos.service.js

async function updateMeal(params, callback) {
  try {
    const { userId, mealId, updates } = params;

    if (!userId || !mealId || !updates) {
      return callback(new Error("Missing required parameters: userId, mealId, or updates"));
    }

    const updateObj = {};
    if (updates.type) updateObj["meals.$.type"] = Array.isArray(updates.type) ? updates.type : [updates.type];
    if (updates.time) updateObj["meals.$.time"] = Array.isArray(updates.time) ? updates.time : [updates.time];
    if (updates.day) updateObj["meals.$.day"] = Array.isArray(updates.day) ? updates.day : [updates.day];

    const result = await Todos.updateOne(
      { userId, "meals._id": mealId },
      { $set: updateObj }
    );

    if (result.matchedCount === 0) {
      return callback(new Error("Meal not found"));
    }

    return callback(null, { success: true, message: "Meal updated successfully" });
  } catch (error) {
    console.error("❌ Error in updateMeal:", error);
    return callback(error);
  }
}

async function deleteMeal(params, callback) {
  try {
    const { userId, mealId } = params;

    if (!userId || !mealId) {
      return callback(new Error("Missing userId or mealId"));
    }

    const result = await Todos.updateOne(
      { userId },
      { $pull: { meals: { _id: mealId } } }
    );

    if (result.matchedCount === 0) {
      return callback(new Error("User not found"));
    }

    if (result.modifiedCount === 0) {
      return callback(new Error("Meal not found or already deleted"));
    }

    return callback(null, { success: true, message: "Meal deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteMeal:", error);
    return callback(error);
  }
}


module.exports = {
  addTodoItem,
  removeTodoItem,
  getTodo,
  updateMeal,
  deleteMeal,
  resetTodos
};
