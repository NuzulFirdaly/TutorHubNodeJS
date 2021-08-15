const Sequelize = require('sequelize');
//bring in db.js which contains database name, username and password
const db = require('./db');

// Instantiates Sequelize with database parameters
const sequelize = new Sequelize(db.database, db.username, db.password, {
    host: db.host, // Name or IP address of MySQL server
    dialect: 'mysql', // Tells squelize that MySQL is used
    operatorsAliases: false,
    define: {
        timestamps: false // Don't create timestamp fields in database
    },
    pool: { // Database system params, don't need to know
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: "+08:00"
});

// console.log("defining relationships")
// const CLASSMETHODS = 'classMethods';
// const ASSOCIATE = 'associate';
// console.log(__dirname);
// fs.readdirSync(__dirname).filter(function (file) {
//     returnThis = (file.indexOf('.') !== 0) && (file !== 'index.js')
//     console.log(returnThis);
//     return returnThis;
// }).forEach(function (file) {
//     var model = sequelize['import'](path.join(__dirname, file));
//     db[model.name] = model;});

// Object.keys(db).forEach(function (modelName) {
//     if (CLASSMETHODS in db[modelName].options) {
//      if (ASSOCIATE in db[modelName].options[CLASSMETHODS]) {
//       db[modelName].options.classMethods.associate(db);
//     }}});

module.exports = sequelize;