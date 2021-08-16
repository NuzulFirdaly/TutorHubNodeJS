const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/


const PendingTutor = db.define('pendingtutor', { //Creates a table called user
    pending_ticket_id:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    occupation: {
    type: Sequelize.STRING
    },
    fromyear: {
    type: Sequelize.STRING
    },
    toyear: {
    type: Sequelize.STRING
    },
    college_country: {
    type: Sequelize.STRING
    }, 
    college_name: {
    type: Sequelize.STRING
    },
    major: {
    type: Sequelize.STRING
    },
    graduate: {
    type: Sequelize.INTEGER
    },
    dateofbirth:{
    type: Sequelize.DATE
    },
    NRIC: {
    type: Sequelize.STRING
    },
    cert: {
    type: Sequelize.STRING
    }
    
    // occupation, fromyear, toyear, college_country, college_name, major, graduateyear, dateofbirth, nric


    
});
console.log("Connected to user table");



//hasOne, belongsTo, hasMany, belongsToMany
//one-to-one 


module.exports = PendingTutor;