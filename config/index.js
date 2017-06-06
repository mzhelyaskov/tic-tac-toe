var env = process.env.NODE_ENV || 'development';
console.log('environment: ' + env);
module.exports = require('./config.json')[env];
