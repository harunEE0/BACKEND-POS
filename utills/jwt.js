/**E:\learn-code\backend-pos\utills\jwt.js*/

const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/env');


const getSignedJwtToken = (userId) => {
     return jwt.sign({ id: userId }, JWT_SECRET , {
        expiresIn: '10m',
        issuer: 'my',
         audience: 'my-app'});
};


const refreshToken = (payload) => {
    return jwt.sign({id:payload}, JWT_SECRET,{
        expiresIn: '1d',
        issuer: 'my',
        audience: 'my-app'
    })
};


const verifyToken  = (token) =>{
    return jwt.verify(token, JWT_SECRET)
};


module.exports = {
    getSignedJwtToken ,
    refreshToken,
    verifyToken  

}
