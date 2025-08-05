const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    stripeCustomerID: {
        type: String,
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt fields
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

