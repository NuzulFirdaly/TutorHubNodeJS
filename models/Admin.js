const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Admin = db.define('adminlist', {
    Language: {
        type: Sequelize.STRING,
    },
    Region: {
        type: Sequelize.STRING
    },
    Description: {
        type: Sequelize.STRING,
    },
    PhoneNumber: {
        type: Sequelize.INTEGER,
    },
    Certificate: {
        type: Sequelize.STRING,
    },
});

module.exports = Admin;