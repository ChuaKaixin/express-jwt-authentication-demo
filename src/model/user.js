const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const status = require("http-status");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: [3, "Min length of 3."],
    validate: [/^\S*$/, "cannot contain space"],
    index: true,
    lowercase: true,
    unique: true,
    required: [true, "field is required"]
  },
  email: {
    type: String,
    validate: [/\S+@\S+/, "not a valid email address"],
    index: true,
    lowercase: true,
    unique: true,
    required: [true, "field is required"]
  },
  passwordHash: String,
  passwordSalt: String
});

UserSchema.methods.setPassword = function(password) {
  if (password.length > 4) {
    this.passwordSalt = generateSalt();
    this.passwordHash = hashPassword(password, this.passwordSalt);
  } else {
    let error = new Error("Password min length is 4");
    error.messageDefined = true;
    throw error;
  }
};

UserSchema.methods.validPassword = function(password) {
  return this.passwordHash === hashPassword(password, this.passwordSalt);
};

UserSchema.methods.generateJWT = function() {
  const today = new Date();
  const exp = new Date();
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      userid: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    secret
  );
};

UserSchema.methods.verifyJWT = function(token) {
  try {
    jwt.verify(token, secret);
    return true;
  } catch (e) {
    return false;
  }
};

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
}

UserSchema.plugin(uniqueValidator, { message: "should be unique" });
module.exports = mongoose.model("User", UserSchema);
