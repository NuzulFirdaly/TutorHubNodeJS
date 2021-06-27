const express = require('express');
const router = express.Router();
// models
const User = require('../models/User');
const PendingInstitution = require('../models/PendingInstitution');
const Institution = require("../models/Institution");

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

var upload = multer({ dest: 'public/pendingdocs/' })
router.post('/registration', upload.single('instituteDoc'), (req, res) => {
    let errors = [];
    let { instituteName, instituteAddress, institutePC, instituteEmail, instituteUrl, instituteNo, instituteDoc, IAFname, IALname, IANo, IAEmail } = req.body;

    // check for errors
    if (req.body.instituteName.length < 5) {
        errors.push({ text: 'Institution Name must be at least 5 characters long' });
    }
    if (req.body.instituteAddress.length < 10) {
        errors.push({ text: 'Address must be at least 10 characters long' });
    }
    User.findOne({ where: { Email: IAEmail } })
        .then(checkcheck => {
            if (checkcheck) {
                console.log("it's working");
            } else {
                console.log("it's not working");
            }
        })

    //console.log("Checking if admin email to be registered exist......")

    // User.findOne({
    //     where: {
    //         Email: IAEmail
    //     }
    // })
    // .then((checkemail) => {
    //     if (checkemail) {
    //         console.log("Email is already taken");
    //         errors.push({text: "Admin email is already taken. Please choose another email."});
    //     }
    //     else {
    //         console.log("Email to be used for admin is available");
    //     }
    // });

    // if there are errors
    if (errors.length > 0) {
        res.render('institution/registration', {
            errors: errors,
            // institution
            instituteName: req.body.instituteName,
            instituteAddress: req.body.instituteAddress,
            institutePC: req.body.institutePC,
            instituteEmail: req.body.InstituteEmail,
            instituteUrl: req.body.instituteUrl,
            instituteNo: req.body.instituteNo,
            instituteDoc: req.body.instituteDoc,
            // institution admin
            IAFname: req.body.IAFname,
            IALname: req.body.IALname,
            IANo: req.body.IANo,
            IAEmail: req.body.IAEmail,
        });
    }
    // if there are no errors
    else {
        // check if the institution name exist
        Institution.findOne({ where: { name: req.body.instituteName } })
            // if institution name is found, there's error
            .then(institutions => {
                if (institutions) {
                    res.render("institution/registration", {
                        error: institutions.name + ' has been taken. Please try another name.',
                        instituteName,
                        instituteAddress,
                        institutePC,
                        instituteEmail,
                        instituteUrl,
                        instituteNo,
                        instituteDoc,
                        IAFname,
                        IALname,
                        IANo,
                        IAEmail
                    });
                }
                // if it's a new institution
                else {
                    // creates a new pending institution
                    console.log("Uploading to pending institution...........");
                    PendingInstitution.create({ name: instituteName, address: instituteAddress, postalcode: institutePC, iemail: instituteEmail, website: instituteUrl, officeno: instituteNo, document: instituteDoc, fname: IAFname, lname: IALname, phoneno: IANo, aemail: IAEmail })
                        .catch(err => console.log(err));
                    console.log("Upload to pending institution completed.");
                    // sending email for confirmation of registration

                    // if it's already been confirmed - chris part

                    // admin account created; creation of username and random-password
                    // console.log("Creating admin account..................");
                    // var APassword = crypto.randomBytes(20).toString('hex');
                    // var AUsername = IAFname + IALname;
                    // console.log("Admin account details: ---------------------------------------------- ")
                    // console.log("Username: ", AUsername);
                    // console.log("Email: ", IAEmail);
                    // console.log("Password: ", APassword);

                    // bcrypt.genSalt(10, function (err, salt) {
                    //     bcrypt.hash(APassword, salt, function (err, hash) {
                    //         // Store hash in your password DB.
                    //         if (err) {
                    //             throw err;
                    //         } else {
                    //             hashedpassword = hash;
                    //             console.log("This is hashed pasword \n", hashedpassword);
                    //             // Create new user record
                    //             User.create({ FirstName: IAFname, LastName: IALname, Username: AUsername, Email: IAEmail, Password: hashedpassword, AccountTypeID: 2, InstitutionName: instituteName })
                    //             .catch(err => console.log(err));
                    //             console.log("Admin user has been created ------------------------------------------");
                    //         }
                    //     });
                    // });
                    // console.log("Approving institution.......");
                    // User.findOne({where: {Email: IAEmail}})
                    // .then(adminemail => {
                    //     console.log(adminemail);
                    //     console.log(IAEmail);
                    //     //console.log("admin id here: ", adminemail);
                    //     if(adminemail){
                    //         console.log("User for institution was found....");
                    //         Institution.create({
                    //             name: instituteName, 
                    //             email: instituteEmail, 
                    //             userUserId: adminemail.user_id
                    //         })
                    //         .catch(err => console.log(err));
                    //         console.log("Institution has been approved and created. -----------------------------------");
                    //     }
                    //     else {
                    //         // console.log(adminemail.Email);
                    //         console.log("There was a problem approving the institution. ------------------------");
                    //     }
                    // });

                    // Sending email of complettion of registration
                    MailConfig.ViewOption(gmailTransport, hbs);
                    let HelperOptions = {
                        from: '"TutorHub" <Iamtestingtutorhub@gmail.com>',
                        to: IAEmail,
                        subject: 'Your institution is now under approval.',
                        template: 'TutorhubEmail',
                        context: {
                            name: instituteName,
                            address: instituteAddress,
                            postalcode: institutePC,
                            iemail: instituteEmail,
                            url: instituteUrl,
                            officeno: instituteNo,
                            Fname: IAFname,
                            Lname: IALname,
                            phoneno: IANo,
                            aemail: IAEmail
                        }
                    };
                    gmailTransport.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                            console.log("There is an error sending the email");
                            console.log(error);
                            res.json(error);
                        }
                        console.log("Email is successfully sent.");
                        console.log(info);
                        res.json(info);
                    });

                    res.redirect('/institution/showcompletion');

                }
            });
    }
});

// registration completed
router.get('/showcompletion', (req, res) => {
    res.render('institution/completion')
});

// institution's page
router.get('/showinstitutionpage', (req, res) => {
    res.render('institution/institutionpage')
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