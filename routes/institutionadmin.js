const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
// models
const User = require('../models/User');
const Institution = require("../models/Institution");
const Banner = require("../models/banners");
const Description = require("../models/descriptions");
const SeminarEvent = require("../models/seminarevents");
const Widget = require("../models/widgets");
const FeaturedTutor = require("../models/featuredinstitutiontutor");
const CourseListing = require("../models/CoursesListing");
const FeaturedCourse = require("../models/featuredinstitutioncourses");
const ItemListing = require("../models/ItemListing");
const PendingInstitutionTutor = require("../models/PendingInstitutionTutor");

console.log("Retrieve messenger helper flash");
const alertMessage = require('../helpers/messenger');
console.log("Retrieved flash");

// Email
var MailConfig = require('../config/email');
var hbs = require("nodemailer-express-handlebars");
var gmailTransport = MailConfig.GmailTransport;

const passport = require('passport');
const { session } = require('passport');
const multer = require('multer');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

// helper
// const pendingdocUpload = require('../helpers/docUpload');
const ensureAuthenticated = require('../helpers/auth');
const institutionBannerUpload = require('../helpers/bannerUploads');
const institutionMainLogoUpload = require('../helpers/mainLogoUploads');
const profilePictureUpload = require('../helpers/imageUploads');
const pendingcertsUpload = require('../helpers/certUpload');
const institutionWidgetUpload = require('../helpers/widgetUploads');
const institutionSeminarUpload = require('../helpers/seminarUploads');

//express validator
const { body, validationResult } = require('express-validator');

//const { ValidationError } = require('sequelize/types');
const { error } = require('console');

// Email
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = '993285737810-b2086rifaqci7h4ko45g7u4jmk6grp5m.apps.googleusercontent.com';
const CLIENT_SECRET = 'doF29jucLtQ5-9fbVRCUvUMH';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04Tu6GvZqypctCgYIARAAGAQSNgF-L9IrzUZJi2ZYp6pmGFMAiP4ysKtoX3JaAuIPqMrvveKG1OgDf6lY8QXZMKof2a67sLaEcA';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(mailOptions) {
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

        console.log(mailOptions);
        // const mailOptions = {
        //     from: 'TutorHub Administrator :man_teacher:<adm.tutorhub@gmail.com>',
        //     to: 'christophertw2706@gmail.com',
        //     subject: custom_mailsubject,
        //     html: custom_mailmessage,
        // };

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

var banneritems;
var alloftutors;
var bothdescriptions;
var allwidgets;
var allseminars;
var allfeaturetutors;
var allcourselistings;
var allfeaturedcourse;

var pendITTutor;
var pendITTutCourse;




// show edit home page  -- Main overall page
router.get('/showyourpage', async(req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        // obtaining the institution Admin id in order for them to edit their specific institution page
        console.log("Fetching Institution Admin Id....................");
        institutionadminid = req.user.dataValues.user_id;
        console.log("This is the admin id: ", institutionadminid);
        console.log("Fetching Institution Admin Id successful............................");

        // Finding the institution associated with the admin.
        // for security purposes (in order for others not to be able to edit other pages), Institution and admin id will not need to be pass through URL
        console.log("Finding institution associated with admin.........");
        Institution.findOne({
                where: {
                    AdminUserID: institutionadminid
                },
                raw: true
            })
            .then(async(institute) => {
                //getting the institution id to be used to get the items under it
                console.log("fetching institution id........");
                institutionid = institute.institution_id;
                console.log("Institution id: ", institutionid);
                console.log("Fetching institutionid complete......");

                //Getting all items from the models and putting into array
                if (institute) {
                    // if institution is found it will go here
                    // getting all banners
                    console.log("Fetching all institution banners.........");
                    await Banner.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            raw: true
                        })
                        .then((banners) => {
                            console.log("Putting banners into bannerarray....");
                            console.log(banners);
                            banneritems = banners
                            console.log("successfully put banners into bannerarray..");
                        }).catch(err => console.log(err));

                    // getting all institution tutors
                    console.log("Fetching all institution's tutors.....");
                    await User.findAll({
                            where: {
                                AccountTypeID: 1,
                                institutionInstitutionId: institutionid
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
                    console.log("Fetching institution's descriptions......")
                    await Description.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            raw: true
                        })
                        .then(founddescription => {
                            console.log("Putting descriptions into descriptionarray......");
                            console.log(founddescription);
                            bothdescriptions = founddescription
                            console.log("successfully put descriptions into descriptionarray...");
                        }).catch(err => console.log(err));

                    // getting institution's widgets
                    console.log("Fetching institution's widget");
                    await Widget.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            raw: true
                        })
                        .then(foundwidget => {
                            console.log("putting widget into widgetarray......");
                            console.log(foundwidget);
                            allwidgets = foundwidget
                            console.log("successfully put widgets into widgetsarray.....");
                        }).catch(err => console.log(err));

                    // getting institution's seminar
                    console.log("Fetching institution's seminars");
                    await SeminarEvent.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            raw: true
                        })
                        .then(foundseminar => {
                            console.log("putting seminar into seminaraaray.....");
                            console.log(foundseminar);
                            allseminars = foundseminar
                            console.log("successfully put seminar into seminararray......");
                        }).catch(err => console.log(err));

                    // getting institution's featured tutors
                    await FeaturedTutor.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            raw: true
                        })
                        .then(foundfeaturetutor => {
                            console.log("Putting featured tutors into array.....");
                            console.log(foundfeaturetutor);
                            allfeaturetutors = foundfeaturetutor
                            console.log("successfully put featured tutor in array.....");
                        }).catch(err => console.log(err));

                    // getting institution's courses
                    await CourseListing.findAll({
                            where: {
                                institutionInstitutionId: institutionid
                            },
                            include: { model: User }
                        })
                        .then(foundcourse => {
                            console.log("Putting course into courselistingarray.....");
                            console.log(foundcourse);
                            allcourselistings = foundcourse;
                            console.log("Successfully put courses into array.......");
                        }).catch(err => console.log(err));

                    // getting institution featured courses
                    await FeaturedCourse.findAll({
                            where: {
                                institutionInstitutionId: institutionid,
                            },
                            raw: true
                        })
                        .then(foundfeaturecourse => {
                            console.log("Putting course into allfeaturedcoursearray.....");
                            console.log(foundfeaturecourse);
                            allfeaturedcourse = foundfeaturecourse;
                            console.log("Successfully put courses into array.......");
                        });
                    // if (logincount == 0) {
                    //     await alertMessage(res, 'success', 'Successfully Logged in. Welcome Back!', 'fas fa-sign-in-alt', true);
                    //     logincount++;
                    // }
                    // render page
                    res.render('institution_admin/yourpage', {
                        title: "Your institution",
                        layout: 'institution_admin_base',
                        user: req.user.dataValues,
                        bannerarray: banneritems,
                        institutiontutorarray: alloftutors,
                        descriptionarray: bothdescriptions,
                        widgetarray: allwidgets,
                        seminararray: allseminars,
                        featuretutorarray: allfeaturetutors,
                        allinstcoursearray: allcourselistings,
                        allfeaturedcoursearray: allfeaturedcourse
                    });
                } else {
                    //institution does not exist.
                    console.log("Unable to find institution");
                    alertMessage(res, 'danger', 'Institution does not exist!', 'fas fa-sign-in-alt', true);
                    res.redirect("/")
                }
            }).catch(err => console.log(err));
    } else {
        alertMessage(res, 'danger', 'You do not have access to that page!', 'fas fa-sign-in-alt', true);
        res.redirect("/")
    };
});

// -----------------------------------------------------------------------------------




// show edit main school logo ----------------------------------------------------------
router.get('/showeditmainlogo', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        // getting the institution's admin to be used
        console.log("Fetching admin id.....");
        institutionadminid = req.user.dataValues.user_id;
        console.log(institutionadminid);
        console.log("Fetching adminid successful");

        console.log("Finding institution.........");
        Institution.findOne({
                where: {
                    AdminUserID: institutionadminid
                },
                raw: true
            })
            .then((foundinstitution) => {
                if (foundinstitution) {
                    //Institution that the admin is under has been found
                    console.log("fetching institution id........");
                    institutionid = foundinstitution.institution_id;
                    console.log("Institution id: ", institutionid)
                    console.log("Fetching institutionid complete...");

                    console.log("fetching main logo of institution and putting it into an array..");
                    res.render('institution_admin/editmainlogo', {
                        title: "Your institution",
                        layout: 'institution_admin_base',
                        user: req.user.dataValues,
                        mainlogoarray: foundinstitution
                    });
                } else {
                    // institution does not exist
                    alertMessage(res, 'danger', 'Institution does not exist!', 'fas fa-sign-in-alt', true);
                    res.redirect("/")
                }
            });
    } else {
        alertMessage(res, 'danger', 'You do not have access to that page!', 'fas fa-sign-in-alt', true);
        res.redirect("/")
    };
});

//process upload form
router.post('/editmainlogo/editlogo', [
        body('trueFileLogoName').not().isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")
    ],
    (req, res) => {
        //get the data from the form
        console.log("request edit main logo form........");
        console.log(req.body);
        let { trueFileLogoName } = req.body;
        //console.log(trueFileLogoName);
        let errors = [];
        const validatorErrors = validationResult(req);

        // validation if there are errors
        if (!validatorErrors.isEmpty()) {
            console.log("There are errors uploading the logo. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg })
            })

            // I didn't make the mainlogoarray a global variable, thus i have to find the image and put it in the array once more
            Institution.findOne({
                    where: {
                        AdminUserID: institutionadminid
                    },
                    raw: true
                })
                .then((foundinstitution) => {
                    console.log("fetching institution id........");
                    institutionid = foundinstitution.institution_id;
                    console.log("Institution id: ", institutionid)
                    console.log("Fetching institutionid complete...");

                    if (foundinstitution) {
                        console.log("fetching main logo of institution and putting it into an array..");
                        res.render('institution_admin/editmainlogo', {
                            title: "Your institution",
                            layout: 'institution_admin_base',
                            user: req.user.dataValues,
                            mainlogoarray: foundinstitution,
                            errors
                        });
                    } else {
                        // institution does not exist
                        alertMessage(res, 'danger', 'Institution does not exist!', 'fas fa-sign-in-alt', true);
                        res.redirect("/")
                    }
                });
        } else {
            //Uploading the institution new main logo image
            console.log("There are no errors found.");
            userid = req.user.dataValues.user_id;
            console.log("User id: ", userid);
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    },
                    order: [
                        ['name', 'ASC']
                    ]
                })
                .then(updateinstit => {
                    if (updateinstit) {
                        //institution is found
                        console.log("This is the file: ", trueFileLogoName);

                        updateinstit.update({
                                mainlogo: trueFileLogoName
                            })
                            .catch(err => console.log(err));

                        console.log("Update main logo successfully");
                        res.redirect('/institution_admin/showeditmainlogo');
                    } else {
                        //institution not found
                        console.log("Updating main logo UNSUCCESSFUL.");
                        alertMessage(res, 'danger', 'Institution does not exist!', 'fas fa-sign-in-alt', true);
                        res.redirect("/")

                    }
                })
                .catch(err => console.log(err));
        }
    });

//router for uploading main logo
router.post('/institutionMainLogoUpload', (req, res) => {
    console.log("Attempting to upload main institution logo...");
    institutionMainLogoUpload(req, res, async(err) => {
        console.log("Main logo image upload printing req.file.filename");
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                console.log("The file is undefine.");
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/Institutionpictures/' + `${req.file.filename}` });
            }
        }
    });
});

// -------------------------------------------------------------------------------------





// show register tutor page -------------------------------------------------
router.get('/showregistertutor', async(req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        //get institution id
        console.log("Getting institution's id.....");
        institutionid = req.user.dataValues.institutionInstitutionId;
        console.log("This is the institution id: ", institutionid);
        console.log("Fetched of institution id compeleted");

        await PendingInstitutionTutor.findAll({
                where: {
                    institutionInstitutionId: institutionid
                },
                include: { model: User }
            })
            .then(pendinginstitT => {
                console.log("Here are the tutors who applied: ", pendinginstitT);
                pendITTutor = pendinginstitT;
            })
            .catch(err => console.log(err));

        await CourseListing.findAll({})
            .then(tutorcourse => {
                console.log("Here are all the courses: ", tutorcourse);
                pendITTutCourse = tutorcourse;
            })
            .catch(err => console.log(err));


        res.render('institution_admin/registertutor', {
            title: "Your institution",
            layout: 'institution_admin_base',
            PITutor: pendITTutor,
            PITutorCourse: pendITTutCourse
        });
    } else {
        res.redirect("/")
    };
});

router.post('/pendingcertUpload2', (req, res) => {
    pendingcertsUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ path: `/pendingcerts/${req.file.filename}`, file: `${req.file.filename}` });
                // await Pending.findOne({where: {user_id:  req.user.user_id } }).then(user => {
                //     user.update({cert:req.file.filename})
                // })
            }
        }
    });
})

router.post('/registertutor/byadmin', [
    body('firstname').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('lastname').not().isEmpty().trim().escape().withMessage("Last name is invalid"),
    body('description').not().isEmpty().trim().escape().withMessage("description is invalid"),
    body('occupation').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('college_country').not().isEmpty().trim().escape().withMessage("Please select college country"),
    body('collegename').not().isEmpty().trim().escape().withMessage("Last name is invalid"),
    body('major').not().isEmpty().trim().escape().withMessage("description is invalid"),
    body('nric').not().isEmpty().trim().escape().withMessage("nric is invalid").matches(/^[STFG]\d{7}[A-Z]/i).withMessage("NRIC is not in the right format"),
    body('fromyear').custom(value => {
        var d = new Date().getFullYear - 20;
        console.log(d);
        if (value <= d) {
            throw new Error('Your professional record must be recent and relevant');
        }
        return true;
    }),
    body('toyear').custom(value => {
        var d = new Date().getFullYear + 5;
        if (value > d) {
            throw new Error('Your record is too early');
        }
        return true;
    }),
    body('graduateyear').custom(value => {
        var d = new Date().getFullYear + 5;
        if (value >= d) {
            throw new Error('graduate year is invalid');
        }
        return true;
    }),
    body('profilePictureUpload2').not().isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif"),
    body('username').not().isEmpty().trim().escape().withMessage("Username is invalid"),
    body('email').trim().isEmail().withMessage("Email must be a valid email").normalizeEmail().toLowerCase()
], ensureAuthenticated, (req, res) => {
    console.log("retrieving the institution tutor forms......")
    let { firstname, lastname, description, occupation, college_country, collegename, major, nric, fromyear, toyear, graduateyear, trueFileCertName, username, email } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        });
        res.render('institution_admin/registertutor', {
            title: "Your institution",
            layout: 'institution_admin_base',
            errors,
            firstname,
            lastname,
            description,
            username,
            email,
            occupation,
            college_country,
            collegename,
            major,
            nric,
            toyear,
            fromyear,
            graduateyear
        });

    } else {
        console.log("Creating instititution tutor...........");
        console.log("This is the institution: ", req.user.user_id);
        User.findOne({ where: { Email: email } })
            .then(user => {
                if (user) {
                    res.render('institution_admin/registertutor', {
                        title: "Your institution",
                        layout: 'institution_admin_base',
                        error: email + ' already registered.',
                        firstname,
                        lastname,
                        description,
                        username,
                        email,
                        occupation,
                        college_country,
                        collegename,
                        major,
                        nric,
                        toyear,
                        fromyear,
                        graduateyear
                    });
                } else {
                    var APassword = crypto.randomBytes(20).toString('hex');
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(APassword, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                throw err;
                            } else {
                                hashedpassword = hash;
                                console.log("this is the password before it is hashed: ", APassword);
                                console.log("This is hashed pasword \n", hashedpassword);
                                // Create new user record
                                Institution.findOne({
                                    where: {
                                        AdminUserID: req.user.user_id
                                    },
                                    order: [
                                        ['name', 'ASC']
                                    ],
                                    raw: true
                                }).then(createnewtutor => {
                                    User.create({ FirstName: firstname, LastName: lastname, description: description, Email: email, Username: username, Password: hashedpassword, AccountTypeID: 1, institutionInstitutionId: createnewtutor.institution_id })
                                        .catch(err => console.log(err));
                                });

                                // send email to tutor
                                const mailOptions = {
                                    from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                                    to: email,
                                    subject: "Your TutorHub Account is ready!",
                                    html: "<h1> Congratulations. Your account is ready to be used.</h1> \
                                    <br> <p>Your institution has registered your account and you are now able to login and start using!. Below are the details of your account.</p> \
                                    <br><h4>It is highly recommended to immediately change your password once you've logged in.</h4> \
                                    <br><p>Your email: </p>" + email + "\
                                    <p>Username: </p>" + username + " \
                                    <p>Password: </p>" + APassword
                                };
                                sendMail(mailOptions)
                                    .then((result) => console.log('Email sent...', result))
                                    .catch((error) => console.log(error.message));
                                res.redirect('/institution_admin/tutorcompletion');
                                res.sendStatus(200);
                            }
                        });
                    });
                }
            })
    }
})

var uploadnone = multer();
router.post('/registertutor/approvetutor', [
    body('approvethetutor').not().isEmpty().trim().escape().withMessage("Please select a tutor to approve")
], uploadnone.none(), (req, res) => {
    console.log("Processing approvable of tutor.....");
    // console.log(req.body);
    // let {approvethetutor, institutionid} = req.body;
    let approvethetutor = req.body.approvethetutor;
    let institutionid = req.body.institutionid;
    let email = req.body.approveemail;
    console.log(approvethetutor);
    console.log(email);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        });
        res.render('institution_admin/registertutor', {
            title: "Your institution",
            layout: 'institution_admin_base',
            errors
        });

    } else {
        PendingInstitutionTutor.findOne({
            where: {
                userUserId: approvethetutor
            }
        }).then(pendtut => {
            if (pendtut) {
                pendtut.destroy({})
                User.findOne({
                    where: {
                        user_id: approvethetutor
                    }
                }).then(theuser => {
                    theuser.update({ institutionInstitutionId: institutionid })
                    const mailOptions = {
                        from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                        to: email,
                        subject: "Congratulations! Your institution application has been approved.",
                        html: "You are now official part of the family. Check your account now!"
                    };
                    sendMail(mailOptions)
                        .then((result) => console.log('Email sent...', result))
                        .catch((error) => console.log(error.message));
                    alertMessage(res, 'success', "Successfully added.", 'fas fa-sign-in-alt', true);
                    res.redirect("/institution_admin/showregistertutor");
                }).catch(err => console.log(err));
            } else {
                console.log("User does not exist");
            }
        }).catch(err => console.log(err));
    }

});

router.post('/registertutor/rejecttutor', [
    body('rejectthetutor').not().isEmpty().trim().escape().withMessage("Please select a tutor to reject")
], (req, res) => {
    console.log("Processing approvable of tutor.....");
    let { rejectthetutor, rejectemail } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        });
        res.render('institution_admin/registertutor', {
            title: "Your institution",
            layout: 'institution_admin_base',
            errors
        });

    } else {
        PendingInstitutionTutor.findOne({
            where: {
                pending_institution__tutor_id: rejectthetutor
            }
        }).then(pendtut => {
            if (pendtut) {
                console.log("Reject tutor...");
                pendtut.destroy({})
                const mailOptions = {
                    from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                    to: rejectemail,
                    subject: "I am so sorry! Your institution application has been rejected.",
                    html: "Better luck next time."
                };
                sendMail(mailOptions)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));
                alertMessage(res, 'success', "Successfully rejected.", 'fas fa-sign-in-alt', true);
                res.redirect("/institution_admin/showregistertutor");
            } else {
                console.log("User does not exist");
            }
        }).catch(err => console.log(err));
    }

});


router.get('/tutorcompletion', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/tutorcompletion', {
            title: "your institution",
            layout: 'institution_admin_base'
        });
    } else {
        res.redirect("/");
    }
});

// --------------------------------------------------------------------------------



var uploadnone = multer();

// show your tutor page CRUD ------------------------------------------------------
router.get('/showyourtutors', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        console.log("Fetching admin id.....");
        institutionadminid = req.user.dataValues.user_id;
        console.log(institutionadminid);
        console.log("Fetching adminid successful");
        // Institution.findOne({
        // 	where: {
        // 		user_id: req.params.institutionadminid
        // 	},
        // 	raw: true,
        // 	// order: [[]]
        // })
        // .then(institutionadmin => {
        // 	if(institutionadmin.user_id == req.user.user_id) {
        // 		res.render('institution_admin/yourpage', {title: "Your institution", layout: 'institution_admin_base'})
        // 	}
        // });,
        // ----
        console.log("Finding institution.........");
        Institution.findOne({
            where: {
                AdminUserID: institutionadminid
            },
            raw: true
        }).then(async(institute) => {
            console.log("fetching institution id........");
            institutionid = institute.institution_id;
            console.log("Institution id: ", institutionid);
            console.log("Fetching institutionid complete...");
            if (institute) {
                // getting all institution tutors
                console.log("Fetching all institution's tutors");
                await User.findAll({
                        where: {
                            AccountTypeID: 1,
                            institutionInstitutionId: institutionid
                        },
                        raw: true
                    })
                    .then(foundtutor => {
                        console.log("Putting tutors into an array.....");
                        console.log(foundtutor);
                        alloftutors = foundtutor
                        console.log("Successfully put tutors into institutiontutorarray...");
                    }).catch(err => console.log(err));

                res.render('institution_admin/yourtutor', {
                    title: "Your institution",
                    layout: 'institution_admin_base',
                    user: req.user.dataValues,
                    institutiontutorarray: alloftutors
                });
            }
        }).catch(err => console.log(err));
    } else {
        res.redirect("/");
    };
});

router.post('/profilePictureUpload4', (req, res) => {
    profilePictureUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ path: `/images/profilepictures/${req.file.filename}`, file: `${req.file.filename}` });
                // await Pending.findOne({where: {user_id:  req.user.user_id } }).then(user => {
                //     user.update({cert:req.file.filename})
                // })
            }
        }
    });
});

router.post('/yourtutor/updatetutortable', [body('trueFileInstitutionProfileName').isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('FirstName').isEmpty().trim().escape().withMessage("Please enter a firstname")], [body('LastName').isEmpty().trim().escape().withMessage("Please enter a lastname")], [body('Username').isEmpty().trim().escape().withMessage("Please enter a username")], [body('Email').isEmpty().trim().escape().withMessage("Please enter a email")], [body('Description').isEmpty().trim().escape().withMessage("Please enter a description")],
    (req, res) => {
        console.log("Retrieving update tutor table");
        let { trueFileInstitutionProfileName, FirstName, LastName, Username, Email, deletetutortableid, Description } = req.body;
        let errors = [];
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors when deleting the tutor");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg })
            })
            res.render('institution_admin/yourtutor', {
                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                institutiontutorarray: alloftutors,
                errors
            });
        } else {
            console.log("Updating tutor table...");
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(foundinstitution => {
                    User.findOne({
                        where: {
                            institutionInstitutionId: foundinstitution.institution_id,
                            user_id: deletetutortableid
                        }
                    }).then(updatetutor => {
                        updatetutor.update({ Username: Username, FirstName: FirstName, LastName: LastName, Email: Email, Profile_pic: trueFileInstitutionProfileName, description: Description })
                            .catch(err => console.log(err));
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            const mailOptions = {
                from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                to: Email,
                subject: "Your Account details have been updated by your administrator",
                html: "<h3>Here are the updated details of your account.</h3>" + "<br> \
                    <p>First Name: </p>" + firstname + "<br> <p>Last Name: </p>" + lastname + "<br> \
                    <p>Username: </p>" + username + "<br><p>Email: </p>" + email + "<br><p>Description: </p>" + description + "\
                    <br><p>Profile picture file: </p>" + profilepic + " \
                    <br><p>If there was a mistake, please inform your administrator immediately.</p>"
            };
            sendMail(mailOptions)
                .then((result) => console.log('Email sent...', result))
                .catch((error) => console.log(error.message));
            alertMessage(res, 'success', "Successfully updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showyourtutors');
        }
    });

router.post('/yourtutor/deletetutortable', uploadnone.none(), [body('removetutortable').not().isEmpty().escape().withMessage("Pleas select a tutor")], async(req, res) => {
    console.log("request delete tutor table form......");
    let { removetutortable, tutoremail, removalreason } = req.body;
    console.log(removetutortable);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when deleting the tutor");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('institution_admin/yourtutor', {
            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            institutiontutorarray: alloftutors,
            errors
        });
    } else {
        console.log("There are no errors");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(async(deletebannerinst) => {
                console.log("this is the institution: ", deletebannerinst);
                console.log("Attempting to delete tutor chosen.....");
                console.log("tutor id to be deleted: ", removetutortable);
                await User.destroy({
                    where: {
                        institutionInstitutionId: deletebannerinst.institution_id,
                        user_id: removetutortable
                    }
                }).catch(err => console.log(err));

                await CourseListing.destroy({
                    where: {
                        institutionInstitutionId: deletebannerinst.institution_id,
                        userUserId: removetutortable
                    }
                }).catch(err => console.log(err));

                await FeaturedTutor.destroy({
                    where: {
                        institutionInstitutionId: deletebannerinst.institution_id,
                        User_id: removetutortable
                    }
                }).catch(err => console.log(err));

                await ItemListing.destroy({
                    where: {
                        userUserId: removetutortable
                    }
                }).catch(err => console.log(err));
                const mailOptions = {
                    from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                    to: tutoremail,
                    subject: "You have been removed from  " + institution,
                    html: "<h3> Unfortunately, " + institution + " removed you from their institution. Due to the removal and security purposes, your account has been deleted. \
                    <br> <p>This is the reason why you were removed.</p>" + removalreason + "<br><p>If there was a mistake, please inform your administrator immediately.</p>"
                };
                sendMail(mailOptions)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));

                alertMessage(res, 'success', "Successfully removed.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourtutors');

                console.log("Successfully deleted the tutor");
            }).catch(err => console.log(err));
    }
});
// -----------------------------------------------------------------------





// show your course page ----------------------------------------------------
router.get('/showyourcourses', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        institutionadminid = req.user.dataValues.user_id;
        Institution.findOne({
            where: {
                AdminUserID: institutionadminid
            },
            raw: true
        }).then(async(institute) => {
            console.log("fetching institution id........");
            institutionid = institute.institution_id;
            console.log("Institution id: ", institutionid);
            console.log("Fetching institutionid complete...");
            if (institute) {
                await CourseListing.findAll({
                        where: {
                            institutionInstitutionId: institutionid
                        },
                        include: { model: User }
                    })
                    .then(foundcourse => {
                        console.log("Putting course into courselistingarray");
                        console.log(foundcourse);
                        allcourselistings = foundcourse;
                        console.log("Successfully put courses into array.");
                    }).catch(err => console.log(err));

                res.render('institution_admin/yourcourse', {
                    title: "Your institution",
                    layout: 'institution_admin_base',
                    user: req.user.dataValues,
                    allinstcoursearray: allcourselistings
                });
            }
        })

    } else {
        res.redirect("/");
    }
});

router.post('/yourcourse/updatecoursetable', [body('trueFileName').isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('coursetitle').isEmpty().trim().escape().withMessage("Please add a title")], [body('courseshortdescription').isEmpty().trim().escape().withMessage("Please add a short description")], [body('Description').isEmpty().trim().escape().withMessage("Please add a description")], [body('hourlyrate').isEmpty().trim().escape().withMessage("Please add a hourly rate")],

    (req, res) => {
        console.log("Retrieving update course table");
        let { trueFileName, coursetitle, courseshortdescription, Description, hourlyrate, deletecoursetableid, courseemail } = req.body;
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors when deleting the course");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg })
            })
            res.render('institution_admin/yourcourse', {
                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                allinstcoursearray: allcourselistings,
                errors
            });
        } else {
            console.log("updating course table...");
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(foundinstitution => {
                    CourseListing.findOne({
                        where: {
                            institutionInstitutionId: foundinstitution.institution_id,
                            course_id: deletecoursetableid
                        }
                    }).then(updatecourse => {
                        updatecourse.update({ Title: coursetitle, Short_description: courseshortdescription, Description: Description, Hourlyrate: hourlyrate, Course_thumbnail: trueFileName })
                            .catch(err => console.log(err));
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            const mailOptions = {
                from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                to: courseemail,
                subject: "Your course " + coursename + " has been updated by your administrator",
                html: "<h3>Here are the details of your updated course. </h3>" + "<br> \
                    <p>Title: </p>" + coursename + "<br><p>Short Description: </p>" + shortdescription + "<br> \
                    <p>description: </p>" + description + "<br><p><Hourly rate: /p>" + hourylrate + "<br> \
                    <p>Thumbnail File: </p>" + thumbnail + "<br><p>If there was a mistake, please inform your administrator immediately.</p>"
            };
            sendMail(mailOptions)
                .then((result) => console.log('Email sent...', result))
                .catch((error) => console.log(error.message));

            alertMessage(res, 'success', "Successfully updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showyourcourses');
        }
    });

router.post('/yourcourse/deletecoursetable', uploadnone.none(), [body('removalreason').not().isEmpty().escape().withMessage("Please add a reason")], [body('removecoursetable').not().isEmpty().escape().withMessage("Pleas select a course")], [body('coursename').not().isEmpty().escape().withMessage("Pleas select a course")], [body('courseemail').not().isEmpty().escape().withMessage("please have an email")],
    (req, res) => {
        console.log("request delete course from table form ...");
        let { removalreason, removecoursetable, coursename, courseemail } = req.body;
        let errors = [];
        const validatorErrors = validationResult(req);
        if (!validatorErrors.isEmpty()) {
            console.log("There are errors when deleting the course");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg })
            })
            res.render('institution_admin/yourcourse', {
                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                allinstcoursearray: allcourselistings,
                errors
            });
        } else {
            console.log("There are no errors");
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(deletecourse => {
                    console.log("Attempting to delete course chosen.....");
                    console.log("course id to be deleted: ", removecoursetable);
                    CourseListing.destroy({
                        where: {
                            institutionInstitutionId: deletecourse.institution_id,
                            course_id: removecoursetable
                        }
                    }).catch(err => console.log(err));
                    const mailOptions = {
                        from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                        to: courseemail,
                        subject: "Removal of your course: " + coursename,
                        html: "<h3> Unfortunately, your course: </h3>" + coursename + " was removed by your institution. \
                        <br> <p>This is the reason why your course was remove.</p>" + removalreason + "<br><p>If there was a mistake, please inform your administrator immediately.</p>"
                    };
                    sendMail(mailOptions)
                        .then((result) => console.log('Email sent...', result))
                        .catch((error) => console.log(error.message));

                    alertMessage(res, 'success', "Successfully removed. Email has been sent to the tutor.", 'fas fa-sign-in-alt', true);
                    res.redirect('/institution_admin/showyourcourses');

                    console.log("Successfully deleted the tutor");
                })
        }
    });
// ------------------------------------------------------------------------




// ADMIN CRUD -----------------------------------------------------------------------------------------



// CRUD for banner - Create -------------------------------------------------------------
//var uploadB = multer({dest: 'public/images/Institutionpictures/banner/'});
router.post('/yourpage/addbanner', [body('trueFileInstitutionName').not().isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], (req, res) => {
    console.log("request banner form.....");
    console.log(req.body);
    let { trueFileInstitutionName } = req.body;
    console.log(trueFileInstitutionName);
    let errors = [];

    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors uploading the banner. Please try again.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('institution_admin/yourpage', {
            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no erros");
        userid = req.user.dataValues.user_id;
        console.log("User id: ", userid);
        Institution.findOne({
            where: {
                AdminUserID: userid
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        }).then((institution) => {
            if (institution) {
                institutionid = institution.institution_id;
                console.log("This is the file:  ", trueFileInstitutionName);
                Banner.create({ bannerpicture: trueFileInstitutionName, institutionInstitutionId: institutionid })
                    .catch(err => console.log(err));
                alertMessage(res, 'success', "Banner added.", 'fas fa-sign-in-alt', true);
                console.log("redirecting back to show your page");
                res.redirect('/institution_admin/showyourpage');
            } else {
                console.log("Unable to find institution id. Error in uploading.")
            }
        }).catch(err => console.log(err));
    }
});

router.post("/institutionBannerUpload", (req, res) => {
    console.log("attempting to upload banner");
    institutionBannerUpload(req, res, async(err) => {
        console.log("Banner image upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                console.log("the file is undefined.");
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/Institutionpictures/banner/' + `${req.file.filename}` });
            }
        }
    });
})

var uploadnone = multer();
router.post('/yourpage/deletebanner', uploadnone.none(), [body('uploaddeletebanner').not().isEmpty().escape().withMessage("Pleas select an image")], (req, res) => {
    console.log("request delete image form......");
    let { uploaddeletebanner } = req.body;
    console.log(uploaddeletebanner);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when deleting the banner");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no errors");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(deletebannerinst => {
                console.log("Attempting to delete banner chosen.....");
                console.log("File id to be deleted: ", uploaddeletebanner);
                Banner.destroy({
                    where: {
                        institutionInstitutionId: deletebannerinst.institution_id,
                        banner_id: uploaddeletebanner
                    }
                }).catch(err => console.log(err));
                alertMessage(res, 'success', "Banner deleted.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');

                console.log("Successfully deleted the banner.");
            })
    }
});
// -----------------------------------------------------------------------------------------------





// CRUD for description ------------------------------------------------------------------------
router.post('/yourpage/editdescription',
    uploadnone.none(), [body('instituteAbout').not().isEmpty().trim().escape().withMessage("about is invalid")], [body('instituteMyCourse').not().isEmpty().trim().escape().withMessage("My course is invalid")],
    ensureAuthenticated, (req, res) => {
        console.log("Retrieving  description form...");
        let { instituteAbout, instituteMyCourse } = req.body;
        let errors = [];
        const validatorErrors = validationResult(req);
        if (!validatorErrors.isEmpty()) {
            console.log("There are errors uploading the description. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg });
            })
            res.render('institution_admin/yourpage', {

                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                errors,
                bannerarray: banneritems,
                institutiontutorarray: alloftutors,
                descriptionarray: bothdescriptions,
                widgetarray: allwidgets,
                seminararray: allseminars,
                featuretutorarray: allfeaturetutors,
                allinstcoursearray: allcourselistings,
                allfeaturedcoursearray: allfeaturedcourse
            });
        } else {
            console.log("adding/updating about....");
            // check if the about row for instituion has been created
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(founddescription => {
                    Description.findOne({
                            where: {
                                institutionInstitutionId: founddescription.institution_id
                            }
                        })
                        .then(updatedescription => {
                            if (updatedescription) {
                                console.log("There is a description that exist");
                                updatedescription.update({ about: instituteAbout, mycourse: instituteMyCourse })
                                    .catch(err => console.log(err));
                            } else {
                                console.log("There is no description that exist");
                                Description.create({ about: instituteAbout, mycourse: instituteMyCourse, institutionInstitutionId: founddescription.institution_id })
                                    .catch(err => console.log(err));
                            }
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            alertMessage(res, 'success', "Description updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showyourpage');
        }
    });
// ------------------------------------------------------------------------------------------------





//CRUD for Widget -------------------------------------------------------------------------
// var uploadSM = multer({ dest: 'public/images/Institutionpictures/socialmedia/' });
router.post('/yourpage/addwidget', [body('trueFileWidgetName').not().isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('widgeturl').not().isEmpty().withMessage("Please enter url")], (req, res) => {
    console.log("Requesting widget form....");
    let { trueFileWidgetName, widgeturl } = req.body;
    let errors = [];

    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors uploading the widget. Please try again");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no errors");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
            where: {
                AdminUserID: userid
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        }).then((institution) => {
            if (institution) {
                // institutionid = institution.institution_id;
                Widget.create({ widgetimage: trueFileWidgetName, widgeturl: widgeturl, institutionInstitutionId: institution.institution_id })
                    .catch(err => console.log(err));
                console.log("redirecting back to show your page");
                alertMessage(res, 'success', "Widget added.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');
            } else {
                console.log("Unable to find institution id. Error in uploading.");
            }
        }).catch(err => console.log(err));
    }
});

router.post('/institutionWidgetUpload', (req, res) => {
    console.log("attempting to upload widget imager");
    institutionWidgetUpload(req, res, async(err) => {
        console.log("widget image upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                console.log("the file is undefined.");
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/Institutionpictures/socialmedia/' + `${req.file.filename}` });
            }
        }
    });

});

router.post("/yourpage/updatewidget", [body('trueFileWidgetName2').isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('widgeturl').isEmpty().withMessage("Please enter a url")], uploadnone.none(),
    ensureAuthenticated, (req, res) => {
        console.log("Retireving update widget form....");
        let { trueFileWidgetName2, widgeturl, widgetid } = req.body;
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors uploading the widget. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg });
            })
            res.render('institution_admin/yourpage', {

                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                errors,
                bannerarray: banneritems,
                institutiontutorarray: alloftutors,
                descriptionarray: bothdescriptions,
                widgetarray: allwidgets,
                seminararray: allseminars,
                featuretutorarray: allfeaturetutors,
                allinstcoursearray: allcourselistings,
                allfeaturedcoursearray: allfeaturedcourse
            });
        } else {
            console.log("Updating Widget....");
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(foundinstitution => {
                    Widget.findOne({
                            where: {
                                institutionInstitutionId: foundinstitution.institution_id,
                                widget_id: widgetid
                            }
                        })
                        .then(updatewidgets => {
                            updatewidgets.update({ widgetimage: trueFileWidgetName2, widgeturl: widgeturl })
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            alertMessage(res, 'success', "Widget updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showyourpage');
        }
    });

var uploadnone = multer();
router.post('/yourpage/deletewidget', uploadnone.none(), [body('deletewidget').not().isEmpty().escape().withMessage("Please select a widget")], (req, res) => {
    console.log("Requesting delete widget form.....");
    let { deletewidget } = req.body;
    console.log(deletewidget);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when deleting the widget");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("THere are no errors uploading.");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(deletewidgetinst => {
                console.log("Attempting to delete widget chosen.........");
                console.log("File id to be deleted: ", deletewidgetinst);
                Widget.destroy({
                    where: {
                        institutionInstitutionId: deletewidgetinst.institution_id,
                        widget_id: deletewidget
                    }
                }).catch(err => console.log(err));
                alertMessage(res, 'success', "Widget deleted.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');
                console.log("Successfully deleted the widget");
            }).catch(err => console.log(err));
    }
});
// --------------------------------------------------------------------------


var uploadnone = multer();
// CRUD For feature tutor -----------------------------------------------------------
router.post('/yourpage/featuretutor', uploadnone.none(), [body('featuretutor').not().isEmpty().escape().withMessage("Please select a tutor")], (req, res) => {
    console.log("Requesting feature tutor....");
    let { featuretutor } = req.body;
    console.log(featuretutor);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when featuring the tutor.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no errors.");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(fft => {
                User.findOne({
                        where: {
                            user_id: featuretutor
                        }
                    })
                    .then(addfeaturetutor => {
                        if (addfeaturetutor) {
                            FeaturedTutor.create({ Username: addfeaturetutor.Username, FirstName: addfeaturetutor.FirstName, LastName: addfeaturetutor.LastName, Profile_pic: addfeaturetutor.Profile_pic, User_id: featuretutor, institutionInstitutionId: fft.institution_id })
                                .catch(err => console.log(err));
                            console.log("featured tutors added complete.");
                            alertMessage(res, 'success', "Successfully Featured.", 'fas fa-sign-in-alt', true);
                            res.redirect('/institution_admin/showyourpage');
                        } else {
                            console.log("Tutor does not exist.");
                        }
                    }).catch(err => console.log(err));
            }).catch(err => console.log(err));
    }
});

router.post('/yourpage/removefeaturetutor', uploadnone.none(), [body('removefeaturetutor').not().isEmpty().escape().withMessage("Please select a tutor to remove")], (req, res) => {
    console.log("Requesting to remove feature form.....");
    let { removefeaturetutor } = req.body;
    console.log(removefeaturetutor);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when deleting the featured tutor");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no errors uploading..");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(deletefeaturedtutor => {
                console.log("Attempting to remove featured tutor....");
                FeaturedTutor.destroy({
                    where: {
                        institutionInstitutionId: deletefeaturedtutor.institution_id,
                        User_id: removefeaturetutor
                    }
                }).catch(err => console.log(err));
                alertMessage(res, 'success', "Successfully removed.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');
                console.log("Successfully deleted the featured tutor");
            });
    }
});
// ------------------------------------------------------------------------------



// CRUD for featured courses ---------------------------------------------------------
router.post('/yourpage/featurecourses', uploadnone.none(), [body('featurecourse').not().isEmpty().escape().withMessage("Please select a course")], (req, res) => {
    console.log("Requesting feature courses");
    let { featurecourse } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when featuring the course.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(fic => {
                CourseListing.findOne({
                    where: {
                        course_id: featurecourse
                    },
                    raw: true
                }).then(addfeaturecourse => {
                    // console.log(addfeaturecourse);
                    // console.log("name: ", addfeaturecourse.FirstName);
                    User.findOne({
                            where: {
                                user_id: addfeaturecourse.userUserId
                            }
                        }).then(courseuser => {
                            console.log("Course id: ", courseuser.FirstName);
                            console.log("Course thumbnail: ", addfeaturecourse.Course_thumbnail);
                            FeaturedCourse.create({
                                course_id: featurecourse,
                                Title: addfeaturecourse.Title,
                                Short_description: addfeaturecourse.short_description,
                                Description: addfeaturecourse.Description,
                                Hourlyrate: addfeaturecourse.Hourlyrate,
                                FirstName: courseuser.FirstName,
                                LastName: courseuser.LastName,
                                Profile_pic: courseuser.Profile_pic,
                                Course_thumbnail: addfeaturecourse.Course_thumbnail,
                                institutionInstitutionId: fic.institution_id
                            }).catch(err => console.log(err));
                            console.log("Successfully created feature courses");
                            alertMessage(res, 'success', "Successfully featured.", 'fas fa-sign-in-alt', true);
                            res.redirect('/institution_admin/showyourpage');
                        })
                        // res.redirect('/institution_admin/showyourpage');
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
    }
});

router.post('/yourpage/deletefeaturecourse', uploadnone.none(), [body('removefeaturedcourse').not().isEmpty().escape().withMessage("Please select a course")], (req, res) => {
    console.log("Requesting feature courses");
    let { removefeaturedcourse } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when removing the course.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(fic => {
                FeaturedCourse.destroy({
                    where: {
                        featuredcourse_id: removefeaturedcourse,
                        institutionInstitutionId: fic.institution_id
                    }
                }).catch(err => console.log(err));
                console.log("Successfully created feature courses");
                alertMessage(res, 'success', "Successfully removed.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');

                // res.redirect('/institution_admin/showyourpage');
            }).catch(err => console.log(err));
    }
});
// -----------------------------------------------------------------------------------





// CRUD for seminar and events ----------------------------------------------------
router.post('/institutionSeminarUpload', (req, res) => {
    console.log("Attempting to upload seminar image");
    institutionSeminarUpload(req, res, async(err) => {
        console.log("Seminar image upload printing req.file.filename");
        console.log(req.file);
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                console.log("The file is undefined");
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/Institutionpictures/seminar/' + `${req.file.filename}` });
            }
        }
    });
});


router.post("/yourpage/addseminar", [body('trueFileSeminarName').not().isEmpty().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('seminartitle').not().isEmpty().trim().escape().withMessage("Please write a title")], [body('seminardescription').not().isEmail().trim().escape().withMessage("Please enter a description")], [body('seminarurl').not().isEmpty().withMessage("Please enter a url")], uploadnone.none(),
    ensureAuthenticated, (req, res) => {
        console.log("Requesting seminar form..........");
        let { trueFileSeminarName, seminartitle, seminardescription, seminarurl } = req.body;
        let errors = [];
        console.log(trueFileSeminarName);

        const validatorErrors = validationResult(req);
        if (!validatorErrors.isEmpty()) {
            console.log("There are errors uploading the seminar. Please try again");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg })
            });
            res.render('institution_admin/yourpage', {

                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                errors,
                bannerarray: banneritems,
                institutiontutorarray: alloftutors,
                descriptionarray: bothdescriptions,
                widgetarray: allwidgets,
                seminararray: allseminars,
                featuretutorarray: allfeaturetutors,
                allinstcoursearray: allcourselistings,
                allfeaturedcoursearray: allfeaturedcourse
            });
        } else {
            console.log("There are no errors");
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                where: {
                    AdminUserID: userid
                },
                order: [
                    ['name', 'ASC']
                ],
                raw: true
            }).then((foundinstitution) => {
                if (foundinstitution) {
                    SeminarEvent.create({ SEImage: trueFileSeminarName, SETitle: seminartitle, SEDescription: seminardescription, SEUrl: seminarurl, institutionInstitutionId: foundinstitution.institution_id })
                        .catch(err => console.log(err));
                    console.log("redirecting back to show your page");
                    alertMessage(res, 'success', "Successfully Added seminar.", 'fas fa-sign-in-alt', true);
                    res.redirect('/institution_admin/showyourpage');
                } else {
                    console.log("Unable to find institution id. Error in uploading.");
                }
            }).catch(err => console.log(err));
        }
    });

router.post("/yourpage/updateseminar", [body('trueFileSeminarName2').isEmpty().trim().escape().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")], [body('seminartitle').isEmpty().trim().escape().withMessage("Please write a title")], [body('seminardescription').isEmpty().trim().escape().withMessage("Please enter a description")], [body('seminarurl').isEmpty().withMessage("Please enter a url")], uploadnone.none(),
    ensureAuthenticated, (req, res) => {
        console.log("Retrieving update seminar form..");
        let { trueFileSeminarName2, seminartitle, seminardescription, seminarurl, seminarid } = req.body;
        console.log("file name: ", trueFileSeminarName2);
        console.log(seminartitle);
        console.log(seminardescription);
        let errors = [];
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors uploading the seminar. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg });
            })
            res.render('institution_admin/yourpage', {

                title: "Your institution",
                layout: 'institution_admin_base',
                user: req.user.dataValues,
                errors,
                bannerarray: banneritems,
                institutiontutorarray: alloftutors,
                descriptionarray: bothdescriptions,
                widgetarray: allwidgets,
                seminararray: allseminars,
                featuretutorarray: allfeaturetutors,
                allinstcoursearray: allcourselistings,
                allfeaturedcoursearray: allfeaturedcourse
            });
        } else {
            console.log("updating seminar....");
            // check if the about row for instituion has been created
            userid = req.user.dataValues.user_id;
            Institution.findOne({
                    where: {
                        AdminUserID: userid
                    }
                })
                .then(foundinstitution => {
                    SeminarEvent.findOne({
                            where: {
                                institutionInstitutionId: foundinstitution.institution_id,
                                seminarevents_id: seminarid
                            }
                        })
                        .then(updateseminar => {
                            updateseminar.update({ SEImage: trueFileSeminarName2, SETitle: seminartitle, SEDescription: seminardescription, SEUrl: seminarurl })
                                .catch(err => console.log(err));
                        }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            alertMessage(res, 'success', "Successfully updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showyourpage');
        }
    })

router.post("/yourpage/deleteseminar", uploadnone.none(), [body('deleteseminar').not().isEmpty().escape().withMessage("Please select a seminar")], (req, res) => {
    console.log("Requesting delete seminar form..............");
    let { deleteseminar } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors when deleting the seminar");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        });
        res.render('institution_admin/yourpage', {

            title: "Your institution",
            layout: 'institution_admin_base',
            user: req.user.dataValues,
            errors,
            bannerarray: banneritems,
            institutiontutorarray: alloftutors,
            descriptionarray: bothdescriptions,
            widgetarray: allwidgets,
            seminararray: allseminars,
            featuretutorarray: allfeaturetutors,
            allinstcoursearray: allcourselistings,
            allfeaturedcoursearray: allfeaturedcourse
        });
    } else {
        console.log("There are no errors deleting.");
        userid = req.user.dataValues.user_id;
        Institution.findOne({
                where: {
                    AdminUserID: userid
                }
            })
            .then(deleteseminarevents => {
                console.log("Attempting to delete seminar chosen....");
                SeminarEvent.destroy({
                    where: {
                        institutionInstitutionId: deleteseminarevents.institution_id,
                        seminarevents_id: deleteseminar
                    }
                }).catch(err => console.log(err));
                alertMessage(res, 'success', "Successfully deleted.", 'fas fa-sign-in-alt', true);
                res.redirect('/institution_admin/showyourpage');
                console.log("Successfully deleted the seminar");
            }).catch(err => console.log(err));
    }
});
// -------------------------------------------------------------------------------

//admin profile ------------------------------------------------------------------
router.get('/showadminprofile', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/adminprofile', {
            title: "Your institution",
            layout: 'institution_admin_base'

        });
    } else {
        res.redirect("/")
    };
});

router.post("/adminprofile/updateprofile", [body('username').isEmpty().trim().escape().withMessage("please enter username")], [body('firstname').isEmpty().trim().escape().withMessage("Please enter firstname")], [body('lastname').isEmpty().trim().escape().withMessage("Please enter lastname")], [body('trueFileProfile').isEmpty().withMessage("Please upload a proper Image. Only accept the following format: jpeg, jpg, png, gif")],
    uploadnone.none(),
    ensureAuthenticated, (req, res) => {
        console.log("retrieving update admin profile form...");
        let { username, firstname, lastname, trueFileProfile, profileid } = req.body;
        console.log("This is the image: ", trueFileProfile);
        let errors = [];
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors uploading the profile. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg });
            })
            res.render('institution_admin/adminprofile', {
                title: "Your institution",
                layout: 'institution_admin_base',
                errors,
                username,
                firstname,
                lastname,
                trueFileProfile,

            });
        } else {
            //findOne function returns a promise 
            User.findOne({
                where: {
                    user_id: profileid
                }
            }).then(adminuser => {
                adminuser.update({ Username: username, FirstName: firstname, LastName: lastname, lastname, Profile_pic: trueFileProfile })
            }).catch(err => console.log(err));
            alertMessage(res, 'success', "Successfully updated.", 'fas fa-sign-in-alt', true);
            res.redirect('/institution_admin/showadminprofile');


        }
    });

router.post("/adminprofile/changepassword", [body('password').isLength({ min: 8 }).withMessage("Password must be at least 8 Character").matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/
    ).withMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 special character"),
    body('ConfirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    })
], ensureAuthenticated, (req, res) => {
    console.log("retrieving change password for admin...");
    let { password, profileid } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors changing password Please try again.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg });
        })
        res.render('institution_admin/adminprofile', {
            title: "Your institution",
            layout: 'institution_admin_base',
            errors,
            password

        });
    } else {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    throw err;
                } else {
                    hashedpassword = hash;
                    console.log("This is hashed pasword \n", hashedpassword);
                    // Create new user record
                    User.findOne({
                        where: {
                            user_id: profileid
                        }
                    }).then(adminuser => {
                        adminuser.update({ Password: hashedpassword })
                    }).catch(err => console.log(err));
                    alertMessage(res, 'success', "Successfully updated.", 'fas fa-sign-in-alt', true);
                    res.redirect('/institution_admin/showadminprofile');
                }
            });
        });
    }
});





// forum ??? (extra - yet to implement)
router.get('/showforum', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/forum', {
            title: "Your institution",
            layout: 'institution_admin_base'

        });
    } else {
        res.redirect("/")
    };
});




module.exports = router;