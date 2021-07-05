const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const FeaturedInstitutionCourses = db.define('featuredinstitutioncourses', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    featuredcourse_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    course_id: {
        type: Sequelize.STRING
    },
    Title: {
        type: Sequelize.STRING
    },
    Short_description: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.TEXT
    },
    Course_thumbnail: {
        type: Sequelize.STRING,
        defaultValue: "avatar2.jpg"
    },
    //cannot be more than 8
    Hourlyrate: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    FirstName: {
        type: Sequelize.STRING
    },
    LastName: {
        type: Sequelize.STRING
    },
    Profile_pic: {
        type: Sequelize.STRING,
        defaultValue: "avatar2.jpg"
    },
});
module.exports = FeaturedInstitutionCourses;