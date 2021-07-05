const express = require('express');
const router = express.Router();
// models
const PendingInstitution = require('../models/PendingInstitution');
const User = require('../models/User');
const Institution = require("../models/Institution");
const Banner = require("../models/banners");
const Description = require("../models/descriptions");
const SeminarEvent = require("../models/seminarevents");
const Widget = require("../models/widgets");
const FeaturedTutor = require("../models/featuredinstitutiontutor");
const CourseListing = require("../models/CoursesListing");
const FeaturedCourse = require("../models/featuredinstitutioncourses");

console.log("Retrieve messenger helper flash");
const alertMessage = require('../helpers/messenger');
console.log("Retrieved flash");

// Email
var MailConfig = require('../config/email');
var hbs = require("nodemailer-express-handlebars");
var gmailTransport = MailConfig.GmailTransport;

const passport = require('passport');
const multer = require('multer');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

//express validator
const { body, validationResult } = require('express-validator');

// helpers
const institutionDocumentUpload = require('../helpers/DocumentUpload');
const ensureAuthenticated = require('../helpers/auth');

// ---------------------------------------------
router.use(express.urlencoded({
    extended: true
}));

router.get('/showallSchools', (req, res) => {
    console.log("Fetching all registered institution....");
    Institution.findAll()
        .then((displayinstitution) => {
            if (displayinstitution) {
                console.log("There are institutions that are registered.");
            } else {
                console.log("There are currently no registered institution.");
            }
            res.render('institution/allSchools', {
                institutionarray: displayinstitution
            });
        });
    console.log("Fetching all institution completed...");
});

// registration
router.get('/showregistration', (req, res) => {
    res.render('institution/registration')
});

router.post('/institutionDocumentUpload', (req, res) => {
    console.log(req.file);
    institutionDocumentUpload(req, res, async(err) => {
        console.log("Institution's document upload printing req.file.filename");
        console.log(req.file);
        if (err) {
            res.json({err: err});
        }
        else {
            if (req.file === undefined) {
                res.json({err: err});
            } else {
                res.json({path: `/pendingdocs/${req.file.filename}`, file: `${req.file.filename}`});
            }
        }
    });
});

var uploadnone = multer()
router.post('/institutionregistration', [
    body('instituteName').not().isEmpty().trim().escape().withMessage("Institution Name is invalid"),
    body('instituteAddress').not().isEmpty().trim().escape().withMessage("Address is invalid"),
    body('institutePC').not().isEmpty().trim().escape().withMessage("Postal code is invalid"),
    body('instituteEmail').trim().isEmail().withMessage("Email must be a valid email").normalizeEmail().toLowerCase(),
    body('instituteNo').not().isEmpty().trim().escape().withMessage("Phone number is invalid"),
    body('instituteUrl').not().isEmpty().withMessage("Please enter url"),
    body('trueFileDocumentName').not().isEmpty().trim().escape().withMessage("Please upload a document"),
    body('IAFname').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('IALname').not().isEmpty().trim().escape().withMessage("last name is invalid"),
    body('IANo').not().isEmpty().trim().escape().withMessage("Phone number is invalid"),
    body('IAEmail').trim().isEmail().withMessage("Email must be a valid email").normalizeEmail().toLowerCase()
],uploadnone.none(), (req, res) => {
    let {instituteName, instituteAddress, institutePC, instituteNo, instituteEmail, instituteUrl, trueFileDocumentName, IAFname, IALname, IANo, IAEmail} = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })

    } else {
        console.log("Validating if the institution has already been registered.");
        Institution.findOne({
            where: {
                name: instituteName
            }
        }).then(institution => {
            if (institution) {
                res.render('institution/registration', {
                    error: instituteName + ' already been registered.',
                    instituteName,
                    instituteAddress,
                    institutePC,
                    instituteEmail,
                    instituteUrl,
                    IAFname,
                    IALname,
                    IANo,
                    IAEmail,
                    instituteNo
                });
            } else {
                User.findOne({
                    where: {
                        Email: IAEmail
                    }
                }).then(user => {
                    if (user) {
                        res.render('institution/registration', {
                            error: IAEmail + ' already been registered.',
                            instituteName,
                            instituteAddress,
                            institutePC,
                            instituteEmail,
                            instituteUrl,
                            IAFname,
                            IALname,
                            IANo,
                            instituteEmail,
                            instituteNo
                        });
                    } else {
                        // Create pending institution
                        console.log("Uploading to pending institution...........");
                        PendingInstitution.create({ 
                            name: instituteName, 
                            address: instituteAddress, 
                            postalcode: institutePC, 
                            iemail: instituteEmail, 
                            website: instituteUrl, 
                            officeno: instituteNo, 
                            document: trueFileDocumentName, 
                            fname: IAFname, 
                            lname: IALname, 
                            phoneno: IANo, 
                            aemail: IAEmail 
                        })
                        .catch(err => console.log(err));
                        console.log("Upload to pending institution completed.");
                        res.redirect('/institution/showcompletion');
                    }
                }).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
    }
});

// registration completed
router.get('/showcompletion', (req, res) => {
    res.render('institution/completion')
});

// institution's page
router.get('/showinstitutionpage/:institutionid', async (req, res) => {
    console.log("Finding institution...........");
    var banneritems;
    var alloftutors;
    var bothdescriptions;
    var allwidgets;
    var allseminars;
    var allfeaturetutors;
    var allcourselistings;
    var allfeaturedcourse;

    // getting all banners
    console.log("Fetching all institution banners.........");
    await Banner.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then((banners) => {
            console.log("Putting banners into bannerarray....");
            console.log(banners);
            // res.render('institution_admin/yourpage', {
            //     title: "Your institution",
            //     layout: 'institution_admin_base',
            //     user: req.user.dataValues,
            //     bannerarray: banners
            // });
            banneritems = banners
            console.log("successfully put banners into bannerarray..");
        }).catch(err => console.log(err));

    // getting all institution tutors
    console.log("Fetching all institution's tutors");
    await User.findAll({
        where: {
            AccountTypeID: 1,
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then(foundtutor => {
            console.log("Putting tutors into an array.....");
            console.log(foundtutor);
            alloftutors = foundtutor
            console.log("Successfully put tutors into institutiontutorarray...");
        }).catch(err => console.log(err));

    // getting institution's description
    console.log("Fetching institution's descriptions")
    await Description.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then(founddescription => {
            console.log("Putting descriptions into descriptionarray");
            console.log(founddescription);
            bothdescriptions = founddescription
            console.log("successfully put descriptions into descriptionarray...");
        }).catch(err => console.log(err));

    // getting institution's widgets
    console.log("Fetching institution's widget");
    await Widget.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then(foundwidget => {
            console.log("putting widget into widgetarray");
            console.log(foundwidget);
            allwidgets = foundwidget
            console.log("successfully put widgets into widgetsarray..");
        }).catch(err => console.log(err));

    // getting institution's seminar
    console.log("Fetching institution's seminars");
    await SeminarEvent.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then(foundseminar => {
            console.log("putting seminar into seminaraaray");
            console.log(foundseminar);
            allseminars = foundseminar
            console.log("successfully put seminar into seminararray");
        }).catch(err => console.log(err));

    // getting institution's featured tutors
    await FeaturedTutor.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        raw: true
    })
        .then(foundfeaturetutor => {
            console.log("Putting featured tutors into array");
            console.log(foundfeaturetutor);
            allfeaturetutors = foundfeaturetutor
            console.log("successfully put featured tutor in array");
        }).catch(err => console.log(err));

    // getting institution's courses
    await CourseListing.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid
        },
        include: {model: User}
    })
    .then(foundcourse => {
        console.log("Putting course into courselistingarray");
        console.log(foundcourse);
        allcourselistings = foundcourse;
        console.log("Successfully put courses into array.");
    }).catch(err => console.log(err));

    // getting institution featured courses
    await FeaturedCourse.findAll({
        where: {
            institutionInstitutionId: req.params.institutionid,
        },
        raw: true
    })
    .then(foundfeaturecourse => {
        console.log("Putting course into allfeaturedcoursearray");
        console.log(foundfeaturecourse);
        allfeaturedcourse = foundfeaturecourse;
        console.log("Successfully put courses into array.");
    });

    // render page
    res.render('institution/institutionpage', {
        title: "Your institution",
        layout: 'institution_admin_base',
        bannerarray: banneritems,
        institutiontutorarray: alloftutors,
        descriptionarray: bothdescriptions,
        widgetarray: allwidgets,
        seminararray: allseminars,
        featuretutorarray: allfeaturetutors,
        allinstcoursearray: allcourselistings,
        allfeaturedcoursearray: allfeaturedcourse
    });
});

// show institution courses
router.get('/showinstitutioncourses', (req, res) => {
    res.render('institution/institutioncourses')
});

// show register tutor page
router.get('/showalltutors', (req, res) => {
    res.render('institution/alltutors')
});

module.exports = router;