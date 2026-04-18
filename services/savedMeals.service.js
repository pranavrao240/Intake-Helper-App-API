const SavedMeal = require('../models/savedMeal.model');
const Nutrition = require('../models/nutritions.model');

const saveMeal = async (userId, nutritionId, customNotes = '', quantity = '1 serving') => {
  try {
    const nutritionItem = await Nutrition.findById(nutritionId);
    if (!nutritionItem) {
      return { success: false, message: 'Nutrition item not found' };
    }

    const existingSavedMeal = await SavedMeal.findOne({ userId, nutritionId });
    if (existingSavedMeal) {
      return { success: false, message: 'Meal already saved' };
    }

    const savedMeal = new SavedMeal({
      userId,
      nutritionId,
      customNotes,
      quantity
    });

    await savedMeal.save();

    await savedMeal.populate('nutritionId');

    return { 
      success: true, 
      data: savedMeal,
      message: 'Meal saved successfully'
    };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: 'Meal already saved' };
    }
    throw error;
  }
};

const getSavedMeals = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const savedMeals = await SavedMeal.find({ userId })
      .populate('nutritionId')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SavedMeal.countDocuments({ userId });

    return {
      success: true,
      data: savedMeals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    throw error;
  }
};

const getSavedMeal = async (userId, savedMealId) => {
  try {
    const savedMeal = await SavedMeal.findOne({ 
      _id: savedMealId, 
      userId 
    }).populate('nutritionId');

    if (!savedMeal) {
      return { success: false, message: 'Saved meal not found' };
    }

    return { success: true, data: savedMeal };
  } catch (error) {
    throw error;
  }
};

const updateSavedMeal = async (userId, savedMealId, customNotes, quantity) => {
  try {
    const savedMeal = await SavedMeal.findOne({ 
      _id: savedMealId, 
      userId 
    });

    if (!savedMeal) {
      return { success: false, message: 'Saved meal not found' };
    }

    if (customNotes !== undefined) savedMeal.customNotes = customNotes;
    if (quantity !== undefined) savedMeal.quantity = quantity;

    await savedMeal.save();
    await savedMeal.populate('nutritionId');

    return { success: true, data: savedMeal };
  } catch (error) {
    throw error;
  }
};

const unsaveMeal = async (userId, savedMealId) => {
  try {
    const savedMeal = await SavedMeal.findOneAndDelete({ 
      _id: savedMealId, 
      userId 
    });

    if (!savedMeal) {
      return { success: false, message: 'Saved meal not found' };
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};

const checkIfMealSaved = async (userId, nutritionId) => {
  try {
    const savedMeal = await SavedMeal.findOne({ userId, nutritionId });
    
    return {
      isSaved: !!savedMeal,
      savedMealId: savedMeal ? savedMeal._id : null
    };
  } catch (error) {
    throw error;
  }
};

const getSavedMealsCount = async (userId) => {
  try {
    const count = await SavedMeal.countDocuments({ userId });
    return count;
  } catch (error) {
    throw error;
  }
};

  const getSavedMealsByNutritionIds = async (userId, nutritionIds) => {
  try {
    const savedMeals = await SavedMeal.find({ 
      userId, 
      nutritionId: { $in: nutritionIds } 
    });

    return savedMeals;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveMeal,
  getSavedMeals,
  getSavedMeal,
  updateSavedMeal,
  unsaveMeal,
  checkIfMealSaved,
  getSavedMealsCount,
  getSavedMealsByNutritionIds
};
