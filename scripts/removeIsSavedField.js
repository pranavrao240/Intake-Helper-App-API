const mongoose = require('mongoose');
const Nutrition = require('../models/nutritions.model');
require('dotenv').config();

async function removeIsSavedField() {
  try {
    await mongoose.connect('mongodb+srv://pranavrao210:HCBunmPYZZ2tkbJQ@nutrition.obx6bxv.mongodb.net/IntakeHelperDB');
    console.log('Connected to MongoDB');

    const docsWithIsSaved = await Nutrition.countDocuments({ isSaved: { $exists: true } });
    console.log(`Found ${docsWithIsSaved} documents with isSaved field`);

    if (docsWithIsSaved > 0) {
      const docsToUpdate = await Nutrition.find({ isSaved: { $exists: true } }).select('_id');
      console.log(`Found ${docsToUpdate.length} documents to update`);

      if (docsToUpdate.length > 0) {
        const bulkOps = docsToUpdate.map(doc => ({
          updateOne: {
            filter: { _id: doc._id },
            update: { $unset: { isSaved: "" } }
          }
        }));

        const bulkResult = await Nutrition.bulkWrite(bulkOps);
        console.log(`Bulk update result:`, JSON.stringify(bulkResult, null, 2));
        console.log(`Successfully removed isSaved field from ${bulkResult.modifiedCount} documents`);
      }
    }

    const remainingDocs = await Nutrition.countDocuments({ isSaved: { $exists: true } });
    if (remainingDocs > 0) {
      console.log(`Warning: isSaved field still exists in ${remainingDocs} documents`);
    } else {
      console.log('Success: isSaved field completely removed');
    }

    const sample = await Nutrition.findOne().limit(1);
    if (sample && sample.isSaved !== undefined) {
      console.log('Sample document still has isSaved:', sample.isSaved);
    } else {
      console.log('Sample document looks clean');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error removing isSaved field:', error);
    process.exit(1);
  }
}

removeIsSavedField();
