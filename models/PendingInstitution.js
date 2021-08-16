const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the
entity name as the table name
*/

const PendingInstitution = db.define('pendinginstitution', { //Creates a table for pending institution
    pending_institution_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    postalcode: {
        type: Sequelize.INTEGER
    },
    iemail: {
        type: Sequelize.STRING
    },
    website: {
        type: Sequelize.STRING
    },
    officeno: {
        type: Sequelize.INTEGER
    },
    document: {
        type: Sequelize.STRING
    },
    // admin information
    fname: {
        type: Sequelize.STRING
    },
    lname: {
        type: Sequelize.STRING
    },
    phoneno: {
        type: Sequelize.INTEGER
    },
    aemail: {
        type: Sequelize.STRING
    }
});

module.exports = PendingInstitution;