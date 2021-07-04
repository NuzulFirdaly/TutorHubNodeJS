const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const FeaturedInstitutionTutor = db.define('featuredinstitutiontutor', {
    featured_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    Username:{
        type: Sequelize.STRING
    },
    FirstName: {
    type: Sequelize.STRING
    },
    LastName: {
    type: Sequelize.STRING
    },
    User_id: {
        type: Sequelize.STRING
    },
    Profile_pic: {
    type: Sequelize.STRING,
    defaultValue: "avatar2.jpg"
    // accountType
    }
});

module.exports = FeaturedInstitutionTutor;