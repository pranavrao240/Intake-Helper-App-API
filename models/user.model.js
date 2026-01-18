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
    age:{
        type:Number,
        required:false
    },
    weight:{
        type:Number,
        required:false
    },
    height:{
        type:Number,
        required:false
    },
dateOfBirth: {
    type: String,  
    validate: {
        validator: function(v) {
            const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!regex.test(v)) return false;
            
            const [day, month, year] = v.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            return date.getFullYear() === year && 
                   date.getMonth() === month - 1 && 
                   date.getDate() === day;
        },
        message: 'Please provide a valid date in dd/mm/yyyy format'
    }
},
    stripeCustomerID: {
        type: String,
    }
}, {
    timestamps: true,  
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

