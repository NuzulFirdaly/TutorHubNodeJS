const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const ChatData = db.define('Chat_data', { //Creates a table called ChatData
    //the reason why in mysql there is a id column because we never define a primarykey!!
    Chat_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    Sender_id: {
        type: Sequelize.UUID
    },
    Receiver_id: {
        type: Sequelize.UUID
    },
    SenderName: {
        type: Sequelize.STRING
    },
    ReceiverName: {
        type: Sequelize.STRING
    },
    Txt_msg: {
        type: Sequelize.STRING
    },
    Status: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    Timestamp: {
        type: Sequelize.DATE(),
    },
});
module.exports = ChatData;