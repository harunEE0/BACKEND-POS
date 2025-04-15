/**JWT/config/db.js */
const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI||'mongodb://localhost:27017/BackendPoS');
        console.log("MongoDB connected");
    } catch(err){
        console.log('MONGO error',err);
        process.exit(1);
    }
}

module.exports = connectDB;