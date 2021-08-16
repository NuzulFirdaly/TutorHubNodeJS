const CourseListing = require('../models/CoursesListing');
const Sequelize = require('sequelize');
const Lessons = require('../models/Lessons');
const User = require('../models/User');
const mySQLDB = require('./DBConfig');
const PendingTutor = require('../models/PendingTutor');
const ItemListing = require('../models/ItemListing');
const RateReview = require('../models/RateReview');

const PendingInstitution = require('../models/PendingInstitution');
const Institution = require('../models/Institution');
const Banners = require('../models/banners');
const Descriptions = require('../models/descriptions');
const Widgets = require('../models/widgets');
const SeminarEvents = require('../models/seminarevents');
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');
const professionalProfile = require('../models/professionalProfile');

// const user = require('../models/User');
// const video = require('../models/Video');

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
            User.hasMany(CourseListing, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            CourseListing.belongsTo(User);
            CourseListing.hasMany(Lessons, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Lessons.belongsTo(CourseListing);
            User.hasOne(PendingTutor, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            PendingTutor.belongsTo(User);

            // Order
            User.hasMany(Orders, { foreignKey: "BuyerId" });
            Orders.belongsTo(User, { foreignKey: "BuyerId" });

            Orders.hasMany(OrderDetails, { foreignKey: "OrderId" });
            OrderDetails.belongsTo(Orders, { foreignKey: "OrderId" });

            // User.hasMany(OrderDetails, { foreignKey: "SellerId" });
            // OrderDetails.belongsTo(User, { foreignKey: "SellerId" });
            
            ItemListing.hasMany(OrderDetails, { foreignKey: "item_id" });
            OrderDetails.belongsTo(ItemListing, { foreignKey: "item_id" });

            // Itemlisting
            User.hasMany(ItemListing);
            ItemListing.belongsTo(User);
            User.hasMany(Calendar);
            Calendar.belongsTo(User)

            // Rate Review
            CourseListing.hasMany(RateReview, { foreignKey: "CourseId" });
            RateReview.belongsTo(CourseListing, { foreignKey: "CourseId" });
            User.hasMany(RateReview, { foreignKey: "TutorId" });
            RateReview.belongsTo(User, { foreignKey: "TutorId" });
            User.hasMany(RateReview, { foreignKey: "UserId" });
            RateReview.belongsTo(User, { foreignKey: "UserId" });

            //professionalInfo
            User.hasOne(professionalProfile);
            professionalProfile.belongsTo(User);

            // institution --------
            User.hasOne(Institution, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Institution.belongsTo(User);
            Institution.hasMany(Banners, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Banners.belongsTo(Institution);
            Institution.hasMany(Descriptions, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Descriptions.belongsTo(Institution);
            Institution.hasMany(Widgets, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Widgets.belongsTo(Institution);
            Institution.hasMany(SeminarEvents, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            SeminarEvents.belongsTo(Institution);
            // user.hasMany(video);
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
            console.log('Create tables if none exists')
            }).catch(err => console.log(err))
            })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };