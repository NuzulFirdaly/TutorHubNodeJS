const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Institution = db.define('institution', {
    institution_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    mainlogo: {
        type: Sequelize.STRING,
        defaultValue: '1.jpg'
    }
});

module.exports = Institution;