//E:\learn-code\backend-pos\models\User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  
  lastLogin: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
 

}
, {
  timestamps: true,
  versionKey: false,
   strict: true, 
  strictQuery: true 
}
);

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    logger.error(`Password hashing error: ${err.message}`);
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    logger.error(`Password comparison error: ${err.message}`);
    throw err;
  }
};

UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", UserSchema);
