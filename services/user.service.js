

const User = require('../models/user.model'); // Adjust the path if necessary
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');


// Login function
async function login({ email, password }, callback) {
    try {
        const userModel = await User.findOne({ email });
        if (userModel) {
            if (bcrypt.compareSync(password, userModel.password)) {
                const userPayload = {
                    _id: userModel._id,
                    email: userModel.email,
                    fullName: userModel.fullName,
                };
                const token = auth.generateAccessToken(userPayload);
                return callback(null, { ...userModel.toJSON(), token });
            } else {
                return callback({ message: "Invalid Email/Password" });
            }
        } else {
            return callback({ message: "Invalid Email/Password2" });
        }
    } catch (error) {
        return callback(error);
    }
}

// Register function
async function register(params, callback) {
    if (!params.email) {
        return callback({ message: "Email is required" });
    }

    try {
        const isUserExist = await User.findOne({ email: params.email });
        if (isUserExist) {
            return callback({ message: "Email is already registered" });
        }

        const salt = bcrypt.genSaltSync(10);
        params.password = bcrypt.hashSync(params.password, salt);

        const userSchema = new User(params);
        const response = await userSchema.save();
        return callback(null, response);
    } catch (error) {
        return callback(error);
    }
}

module.exports = {
    login,
    register,
};
