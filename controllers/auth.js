/**E:\learn-code\backend-pos\controllers\auth.js */

const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const logger  = require('../utils/logger');
const AuthService = require('../services/authService')

exports.register = async (req, res, next) => {
    const { username, password, role } = req.body;
    if (!['admin', 'cashier'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
 
    if (!username || !password || !role) {
        return res.status(400).json({
            success: false,
            error: 'Please provide username, password and role'
        });
    }
    
    try {
        const user = await User.create({ username, password, role });
        console.log(AuthService.sendTokenResponse(user, 201, res));
        res.send(AuthService.sendTokenResponse(user, 201, res))
    } catch (err) {
        console.error('Registration Error:', err);
        
       
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};


exports.login = async (req,res,next) =>{
    try{
        const {username,password} = req.body;
        if(!username || !password){
            return res.status(400).json({success: false , message:'please provide username and password'})
        };

        const user = await User.findOne({username}).select('+password');
        console.log("USER FOUND:", user);
       
        if(!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const matchPassword = await user.comparePassword(password);

        if(!matchPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        logger.info(`User logged in: ${user.username}`);
        console.log(AuthService.sendTokenResponse(user, 201, res));
        res.send(AuthService.sendTokenResponse(user, 201, res))
    }catch(err){
        next(err)
        logger.error(`Login error: ${err.message}`);
    }
};



exports.getme = async (req,res,next) =>{
    try{
        const user = await User.findById(req.user.id);
        res.status(200).json({success: true,data: user });



    }catch(err){
        next(err)
    }
}


exports.logout = async (req,res,next) =>{
    try{
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            signed: true
          });
          res.status(200).json({
            success: true,
            data: {},
          });
    }catch(err){
        next(err)
    }
}
