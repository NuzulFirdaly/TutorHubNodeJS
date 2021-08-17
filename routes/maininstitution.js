const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
//express validator
const { body, validationResult } = require('express-validator');

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
const PendingInstitutionTutor = require('../models/PendingInstitutionTutor');

//helpers
console.log("Retrieve messenger helper flash");
const alertMessage = require('../helpers/messenger');
console.log("Retrieved flash");
const institutionDocumentUpload = require('../helpers/DocumentUpload');
const ensureAuthenticated = require('../helpers/auth');
const resumeUpload = require('../helpers/resumeUpload');

// // Email
// var MailConfig = require('../config/email');
// var hbs = require("nodemailer-express-handlebars");
// var gmailTransport = MailConfig.GmailTransport;

// Email
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const CLIENT_ID = '993285737810-tfpuqq5vhfdjk5s5ng5v6vcbc3cht53s.apps.googleusercontent.com';
const CLIENT_SECRET = 'uvWjFqdiAgVK_sFq_uaYcbGV';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04NJ-IXlwUJ_7CgYIARAAGAQSNgF-L9Irvecmxx12BMYyPKTIrSjhEroQErhaG49HwPEugWn5nSq3MJAb9py5_yEVmIwNd6gj5A';
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMailinstitution(custom_mailemail,
    custom_mailsubject, instituteName,
    instituteAddress, institutePC, instituteEmail, instituteUrl,
    instituteNo, IAFname, IALname, IANo, IAEmail) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'adm.tutorhub@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
            to: custom_mailemail,
            subject: custom_mailsubject,
            html: "<h1> Thank you for registering your institution in TutorHub! </h1> \
            <br> <p>Below are the details of your registration. Please do note it will take about 2 to 3 business days to approve your registration. Thank you.</p> \
            <br><h4>Institution Details:</h4> \
            <br><p>Institution Name: </p>" + instituteName + "\
            <p>Address: </p>" + instituteAddress + " \
            <p>Postal Code: </p>" + institutePC + " \
            <p>Email: </p>" + instituteEmail + " \
            <p>Your website: </p>" + instituteUrl + "\
            <p>Office No: </p>" + instituteNo + "\
            <h4>Administrator details</h4>  \
            <p>First name: </p>" + IAFname + " \
            <p>Last name: </p>" + IALname + " \
            <p>Phone No: </p>" + IANo + " \
            <p>Email: </p>" + IAEmail
        };

        const result = await transport.sendMail(mailOptions)
        return result;

    } catch (error) {
        return error;
    }
}



// ---------------------------------------------
router.use(express.urlencoded({
    extended: true
}));

// Main institution page
router.get('/showallSchools', (req, res) => {
    console.log("Fetching all registered institution....");
    Institution.findAll()
        .then((displayinstitution) => {
            console.log("Fetching all institution completed...");
            if (displayinstitution) {
                console.log("There are institutions that are registered.");
                console.log("Here are the institutions that are registered --------------");
                console.log(displayinstitution);
            } else {
                console.log("There are currently no registered institution.");
            }
            res.render('institution/allSchools', {
                institutionarray: displayinstitution
            });
        });
    console.log("Displaying institutions now......");
});

// registration
router.get('/showregistration', (req, res) => {
    console.log("Displaying Institution's registration form now...");
    res.render('institution/registration')
});

// documents for registration upload
router.post('/institutionDocumentUpload', (req, res) => {
    console.log(req.file);
    institutionDocumentUpload(req, res, async(err) => {
        console.log("Institution's document upload printing req.file.filename");
        console.log(req.file);
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ path: `/pendingdocs/${req.file.filename}`, file: `${req.file.filename}` });
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
    body('trueFileDocumentName').not().isEmpty().trim().escape().withMessage("Please upload a proper document. Only accept the following format: doc, docx, odt, pdf, zip"),
    body('IAFname').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('IALname').not().isEmpty().trim().escape().withMessage("last name is invalid"),
    body('IANo').not().isEmpty().trim().escape().withMessage("Phone number is invalid"),
    body('IAEmail').trim().isEmail().withMessage("Email must be a valid email").normalizeEmail().toLowerCase()
], uploadnone.none(), (req, res) => {
    console.log("Processing institution registration form now.....");
    let { instituteName, instituteAddress, institutePC, instituteNo, instituteEmail, instituteUrl, trueFileDocumentName, IAFname, IALname, IANo, IAEmail } = req.body;
    let errors = [];
    console.log("Here is the document uploaded: ", trueFileDocumentName);
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors in the form, unable to proceed");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('institution/registration', {
            errors,
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
        console.log("Validating if the institution has already been registered....");
        Institution.findOne({
            where: {
                name: instituteName
            }
        }).then(institution => {
            if (institution) {
                console.log("Instituion already exist. unable to proceed.");
                res.render('institution/registration', {
                    error: instituteName + ' has already been registered. If you did not register your institution, please contact TutorHub immediately.',
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
                console.log("Institution name is available.");
                console.log("Validating if the email for institution has already been registered...");
                Institution.findOne({
                    where: {
                        email: instituteEmail
                    }
                }).then(institutione => {
                    if (institutione) {
                        console.log("Instituion email already exist. unable to proceed.");
                        res.render('institution/registration', {
                            error: instituteEmail + ' has already been registered. If you think there must have been a mistake, please contact TutorHub immediately.',
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
                        console.log("Institution email is available.");
                        console.log("Validating if the Admin account exist.........");
                        User.findOne({
                            where: {
                                Email: IAEmail
                            }
                        }).then(user => {
                            if (user) {
                                console.log("User Account already exist. Unable to proceed.");
                                res.render('institution/registration', {
                                    error: IAEmail + ' has already been registered. Please use another email.',
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
                                console.log("User email is available.");
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
                                console.log("Registration form process has been completed. Redirecting now...");
                                res.redirect('/institution/showcompletion');
                            }
                        }).catch(err => console.log(err));
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
router.get('/showinstitutionpage/:institutionid/:institutionName', async(req, res) => {
    console.log("Finding institution...........");
    var banneritems;
    var alloftutors;
    var bothdescriptions;
    var allwidgets;
    var allseminars;
    var allfeaturetutors;
    var allcourselistings;
    var allfeaturedcourse;
    let institutionName = req.params.institutionName;
    console.log("This is the institution Name: ", institutionName);

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
            include: { model: User }
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
        bannerarray: banneritems,
        institutiontutorarray: alloftutors,
        descriptionarray: bothdescriptions,
        widgetarray: allwidgets,
        seminararray: allseminars,
        featuretutorarray: allfeaturetutors,
        allinstcoursearray: allcourselistings,
        allfeaturedcoursearray: allfeaturedcourse,
        institutionName: institutionName
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

// show affiliate page
router.get('/showaffiliate', (req, res) => {
    Institution.findAll({
            include: { model: User }
        })
        .then((displayinstitution) => {
            console.log("Here are all the institutions: ", displayinstitution);
            if (displayinstitution) {
                console.log("There are institutions that are registered.");
            } else {
                console.log("There are currently no registered institution.");
            }
            res.render('institution/affiliate', {
                institutionarray: displayinstitution
            });
        });
});

router.get('/application/:institutionid', (req, res) => {
    institutionid = req.params.institutionid
    Institution.findOne({
        where: {
            institution_id: institutionid
        },
        include: { model: User }
    }).then(institution => {
        if ((req.user != null) && (req.user.AccountTypeID == 1)) {
            console.log("here is the institution ", institution);
            res.render("institution/application", {
                institution
            })
        } else {
            alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
            res.redirect("/")
        }
    }).catch(error => console.log(error));
});

router.post('/userResumeUpload', (req, res) => {
    console.log(req.file);
    resumeUpload(req, res, async(err) => {
        console.log("User's resume upload printing req.file.filename");
        console.log(req.file);
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ path: `/pendingresumes/${req.file.filename}`, file: `${req.file.filename}` });
            }
        }
    });
});

router.post('/affiliationapplication', [body('firstname').not().isEmpty().trim().escape().withMessage("Please enter your first name")], [body('lastname').not().isEmpty().trim().escape().withMessage("Please enter your last name")], [body('username').not().isEmpty().trim().escape().withMessage("Please enter your username")], [body('reason').not().isEmpty().trim().escape().withMessage("Please enter your reason")], [body('trueFileResumeName').not().isEmpty().trim().escape().withMessage("Please upload a proper document. Only accept the following format: doc, docx, odt, pdf, zip")], uploadnone.none(), (req, res) => {
    console.log("processing institution application form now....");
    let { firstname, lastname, username, reason, trueFileResumeName, userid, useremail, institutionid } = req.body;
    let errors = [];
    console.log("institutionid: ", institutionid);
    console.log("here is the reason: ", reason);
    console.log("Here is the resume: ", trueFileResumeName);
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors in the form, unable to proceed.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        alertMessage(res, 'danger', "Please upload a proper document. Only accept the following format: doc, docx, odt, pdf, zip", 'fas fa-sign-in-alt', true);
        res.redirect('/institution/application/' + institutionid);
    } else {
        console.log("adding application now..");
        PendingInstitutionTutor.create({
            FirstName: firstname,
            LastName: lastname,
            Username: username,
            reason: reason,
            resume: trueFileResumeName,
            userUserId: userid,
            institutionInstitutionId: institutionid
        }).catch(err => console.log(err));
        res.redirect('/institution/showapplicationcomplete');

    }
});

router.get('/showapplicationcomplete', (req, res) => {
    res.render('institution/applicationcomplete');
})

module.exports = router;