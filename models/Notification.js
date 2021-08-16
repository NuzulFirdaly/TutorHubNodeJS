const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Notification = db.define('notification', {
    SenderEmail: {
        type: Sequelize.STRING,
    },
    RecipientRole: {
        type: Sequelize.STRING
    }
});

module.exports = Notification;