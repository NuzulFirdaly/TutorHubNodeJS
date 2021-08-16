const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const NotificationMessages = db.define('notificationmsg', {
    ContentID: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    Subject: {
        type: Sequelize.STRING
    },
    Message: {
        type: Sequelize.STRING,
    },
    DateSent: {
        type: Sequelize.STRING
    },
});

module.exports = NotificationMessages;