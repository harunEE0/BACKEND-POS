const winston = require('winston');

const exceptionLogger = winston.createLogger({
    transports:[],
    exceptionHandlers:[
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }) 
    ],
    rejectionHandlers:[
        new winston.transports.File({
            filename: 'logs/rejections.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
})

exports = exceptionLogger;