





const mongoose = require('mongoose');

const fs = require('fs');
const csv = require('csv-parser');
const Nutrition = require('../models/nutritions.model.js');

async function importNutritionData(csvFilePath) {
  const nutritionData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        nutritionData.push({
          selected: "Not Selected",
          DishName: row['Dish Name'],
          Calories: parseFloat(row['Calories (kcal)']),
          Carbohydrates: parseFloat(row['Carbohydrt']),
          Protein: parseFloat(row['Protein (g)']),
          Fats: parseFloat(row['Fats (g)']),
          FreeSugar: parseFloat(row['Free Sugar']),
          Fibre: parseFloat(row['Fibre (g)']),
          Sodium: parseFloat(row['Sodium (mg)']),
          Calcium: parseFloat(row['Calcium (mg)']),
          Iron: parseFloat(row['Iron (mg)']),
          VitaminC: parseFloat(row['Vitamin C']),
          Folate: parseFloat(row['Folate (Âµg)']),
        });
      })
      .on('end', async () => {
        try {
          await Nutrition.insertMany(nutritionData, { ordered: false });
          console.log(`✅ Imported ${nutritionData.length} nutrition records.`);
          resolve(nutritionData);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

const getNutritionById = async (nutritionId) => {
  console.log('Querying nutritionId (MongoDB _id):', nutritionId);
  try {
    const result = await Nutrition.findById(new mongoose.Types.ObjectId(nutritionId));
    console.log('Query result:', result);
    return result ? [result] : [];  
  } catch (err) {
    console.error('Error fetching nutrition:', err.message);
    return [];
  }
};

const getSelectedNutrition = async () => {
  return await Nutrition.find({ selected: "Select" });
};

const addNutritionData = async (nutritionData) => {
  try {
    if (!nutritionData.DishName) {
      throw new Error('DishName is required');
    }

    const existingDish = await Nutrition.findOne({ DishName: nutritionData.DishName });
    if (existingDish) {
      throw new Error('Dish with this name already exists');
    }

    const nutrition = new Nutrition({
      ...nutritionData,
      selected: nutritionData.selected || "Not Selected",
      type: nutritionData.type || "NULL",
      time: nutritionData.time || "NULL",
      day: nutritionData.day || [],
      Protein: nutritionData.Protein || 0,
      Calories: nutritionData.Calories || 0,
      Carbohydrates : nutritionData.Carbohydrates || 0,
      QuantityRequired: nutritionData.QuantityRequired || "NULL",

    });

    const savedNutrition = await nutrition.save();
    return {
      success: true,
      data: savedNutrition
    };
  } catch (error) {
    console.error('Error adding nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to add nutrition data'
    };
  }
};

// Update nutrition data by ID
const updateNutritionData = async (id, updateData) => {
  try {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided');
    }

    if (updateData.DishName) {
      const existingDish = await Nutrition.findOne({ 
        DishName: updateData.DishName,
        _id: { $ne: id } 
      });
      
      if (existingDish) {
        throw new Error('A dish with this name already exists');
      }
    }

    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedNutrition) {
      throw new Error('Nutrition data not found');
    }

    return {
      success: true,
      data: updatedNutrition
    };
  } catch (error) {
    console.error('Error updating nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to update nutrition data'
    };
  }
};

// Delete nutrition data by ID
const deleteNutritionData = async (id) => {
  try {
    const deletedNutrition = await Nutrition.findByIdAndDelete(id);
    
    if (!deletedNutrition) {
      throw new Error('Nutrition data not found');
    }

    return {
      success: true,
      message: 'Nutrition data deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting nutrition data:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to delete nutrition data'
    };
  }
};



module.exports = {
  importNutritionData,
  getNutritionById,
  getSelectedNutrition,
  addNutritionData,
  updateNutritionData,
  deleteNutritionData
};
