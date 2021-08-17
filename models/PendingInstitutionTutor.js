const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the
entity name as the table name
*/

const PendingInstitutionTutor = db.define('pendinginstitutiontutor', { //Creates a table for pending institution
    pending_institution__tutor_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    FirstName: {
        type: Sequelize.STRING
    },
    LastName: {
        type: Sequelize.STRING
    },
    Username: {
        type: Sequelize.STRING
    },
    resume: {
        type: Sequelize.STRING
    },
    reason: {
        type: Sequelize.STRING
    },
});

module.exports = PendingInstitutionTutor;