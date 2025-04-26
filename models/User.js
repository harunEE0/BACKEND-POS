const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
        
    },
    email: {
        type: String,
        unique: true,
        sparse: true
      },
    role: {
        type: String,
        enum: ['admin', 'cashier'],
        default: 'cashier'
    },
    createAt:{
        type: Date,
        default: Date.now
    }

});

UserSchema.pre('save', async function(next) {
    if (this.isNew || this.modifiedPaths().includes('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });


  UserSchema.methods.comparePassword = async function(enteredPassword){
    console.log('Comparing:', enteredPassword, 'WITH', this.password); // 👀 ดูค่า
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);