





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
          _id: row['_id'],
          selected: row['selected'] || "Not Selected",
          isSaved: row['isSaved'] === 'true' || row['isSaved'] === true,
          DishImage: row['DishImage'],
          DishName: row['DishName'],
          Calories: parseFloat(row['Calories']) || 0,
          Protein: parseFloat(row['Protein']) || 0,
          Carbohydrates: parseFloat(row['Carbohydrates']) || 0,
          Fat: parseFloat(row['Fat']) || 0,
          Fiber: parseFloat(row['Fiber']) || 0,
          Sodium: parseFloat(row['Sodium']) || 0,
          Iron: parseFloat(row['Iron']) || 0,
          Calcium: parseFloat(row['Calcium']) || 0,
          Sugar: parseFloat(row['Sugar']) || 0,
          QuantityRequired: row['QuantityRequired'] || '',
          nutritionId: row['nutritionId'] || null,
          type: row['type'] || 'Breakfast',
          time: row['time'] || 'Morning',
          Fats: parseFloat(row['Fat']) || 0,
          Carbohydrt: parseFloat(row['Carbohydrates']) || 0,
        });
      })
      .on('end', async () => {
        try {
          console.log(`Importing ${nutritionData.length} nutrition records...`);
          
          await Nutrition.deleteMany({});
          
          const insertedData = await Nutrition.insertMany(nutritionData);
          console.log(`✅ Successfully imported ${insertedData.length} nutrition records`);
          
          resolve(insertedData);
        } catch (error) {
          console.error('Error inserting nutrition data:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
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
const getSavedNutrition = async () => {
    try {
        console.log('Querying for saved nutrition items...');
        
        const savedNutrition = await Nutrition.find({ isSaved: true });
        
        console.log('Found saved nutrition items:', savedNutrition.length);
        
        if (!savedNutrition || savedNutrition.length === 0) {
            console.log('No saved nutrition found');
            return [];
        }
        
        return savedNutrition;
    } catch (error) {
        console.error('Error fetching saved nutrition:', error);
        return [];
    }
};
const addNutritionData = async (nutritionData) => {
  try {
    if (!nutritionData.DishName) {
      throw new Error('DishName is required');
    }
    if (!nutritionData.DishImage) {
      throw new Error('DishImage is required');
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

const updateSavedMeal = async (id) => {
  try {
    const nutrition = await Nutrition.findById(id);

    if (!nutrition) {
      throw new Error('Nutrition data not found');
    }

    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      id,
      { $set: { isSaved: !nutrition.isSaved } },
      { new: true, runValidators: true }
    );

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
  updateSavedMeal,
  deleteNutritionData,
  getSavedNutrition
};
