const CourseListing = require('../models/CoursesListing');
const Sequelize = require('sequelize');
const Lessons = require('../models/Lessons');
const User = require('../models/User');
const mySQLDB = require('./DBConfig');
const PendingTutor = require('../models/PendingTutor');
const ItemListing = require('../models/ItemListing');
const Calendar = require('../models/Calendar');

const RateReview = require('../models/RateReview');

const PendingInstitution = require('../models/PendingInstitution');
const Institution = require('../models/Institution');
const Banners = require('../models/banners');
const Descriptions = require('../models/descriptions');
const Widgets = require('../models/widgets');
const SeminarEvents = require('../models/seminarevents');
const FeaturedInstitutionTutor = require('../models/featuredinstitutiontutor');
const FeaturedInstitutionCourses = require("../models/featuredinstitutioncourses");

const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const NotificationMessages = require('../models/NotificationMessages');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate().then(() => {
            console.log('tutorhub database connected');
        }).then(() => {
            /*
            Defines the relationship where a user has many videos.
            In this case the primary key from user will be a foreign key
            in video.
            */
            //if user belongs to an institution
            User.belongsTo(Institution)
            Institution.hasMany(User)

            User.hasMany(CourseListing, { foreignKey: { type: Sequelize.UUID, allowNull: false } });

            // Course
            CourseListing.belongsTo(User);
            CourseListing.hasMany(Lessons, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Lessons.belongsTo(CourseListing);
            CourseListing.belongsTo(Institution);
            Institution.hasMany(CourseListing);
            User.hasOne(PendingTutor, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            PendingTutor.belongsTo(User);
            User.hasMany(ItemListing);
            ItemListing.belongsTo(User);
            User.hasMany(Calendar);
            Calendar.belongsTo(User)
            CourseListing.hasMany(RateReview, { foreignKey: "CourseId" });
            RateReview.belongsTo(CourseListing, { foreignKey: "CourseId" });
            User.hasMany(RateReview, { foreignKey: "TutorId" });
            RateReview.belongsTo(User, { foreignKey: "TutorId" });
            User.hasMany(RateReview, { foreignKey: "UserId" });
            RateReview.belongsTo(User, { foreignKey: "UserId" });

            // institution --------
            //for admin
            User.hasOne(Institution, { foreignKey: "AdminUserID", constraints: false });
            Institution.belongsTo(User, { foreignKey: "AdminUserID", constraints: false });
            Institution.hasMany(Banners, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Banners.belongsTo(Institution);
            Institution.hasMany(Descriptions, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Descriptions.belongsTo(Institution);
            Institution.hasMany(Widgets, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Widgets.belongsTo(Institution);
            Institution.hasMany(SeminarEvents, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            SeminarEvents.belongsTo(Institution);
            Institution.hasMany(FeaturedInstitutionTutor, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            FeaturedInstitutionTutor.belongsTo(Institution);
            Institution.hasMany(FeaturedInstitutionCourses, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            FeaturedInstitutionCourses.belongsTo(Institution);
            // user.hasMany(video);

            // admin ----------
            User.hasOne(Admin);
            Admin.belongsTo(User, { foreignKey: "userUserId" });
            User.hasMany(Notification);
            Notification.belongsTo(User, { foreignKey: "userUserId" });
            NotificationMessages.hasMany(Notification);
            Notification.belongsTo(NotificationMessages);

            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };