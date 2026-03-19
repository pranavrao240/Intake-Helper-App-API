const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({

    profileImage:{
        type:String,
        required:false
    },
    bodyFat:{
        type:Number,
        required:false
    },
    gender:{
        type:String,
        required:false
    },
    FCMToken:{
        type:String,
        required:false,
        default:null
    },
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

emailVerificationToken: {
    type: String,
    default: null
},
emailVerified: {
    type: Boolean,
    default: false
},
emailVerificationExpires: {
    type: Date,
    default: null
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



userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

userSchema.set('toObject', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

