





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

module.exports = {
  importNutritionData,
  getNutritionById,
  getSelectedNutrition
};
