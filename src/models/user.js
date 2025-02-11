const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../auth/generateToken');
const Token = require("../models/token")
const getUserInfo = require("../libs/getUserInfo");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    surveys: [{
        ref: 'Survey',
        type: Schema.Types.ObjectId,
    }],
    roles: [{
        ref: 'Role',
        type: Schema.Types.ObjectId
    }]
}, {
    timestamps: true,
    versionKey: false
}
)


userSchema.statics.encryptPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

userSchema.methods.userExist = async function (email) {
    const result = await mongoose.model('User').findOne({ email });
    return !!result;
}

userSchema.statics.comparePassword = async function (password, receivedPassword) {
    const same = await bcrypt.compare(password, receivedPassword);
    return !!same;
}

userSchema.methods.createAccessToken = function () {
    return generateAccessToken(getUserInfo(this));
}

userSchema.methods.createRefreshToken = async function () {
    const refreshToken = generateRefreshToken(getUserInfo(this));

    try {
        await new Token({ token: refreshToken }).save();
        return refreshToken;
    } catch (error) {
        console.log(error);
    }
}


module.exports = mongoose.model('User', userSchema);