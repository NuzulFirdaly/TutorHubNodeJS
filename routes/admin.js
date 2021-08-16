const express = require('express');
const Handlebars = require('handlebars')
const Admin = require('../models/Admin');
const router = express.Router();
const User = require('../models/User');
var bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
var crypto = require('crypto');

// Required for file upload
const fs = require('fs');
const upload = require('../helpers/adminUploadCertificate');

// Email 
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const PendingInstitution = require('../models/PendingInstitution');
const Institution = require('../models/Institution');
const Notification = require('../models/Notification');
const NotificationMessages = require('../models/NotificationMessages');

const CLIENT_ID = '993285737810-tfpuqq5vhfdjk5s5ng5v6vcbc3cht53s.apps.googleusercontent.com';
const CLIENT_SECRET = 'uvWjFqdiAgVK_sFq_uaYcbGV';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04FCJRO2ERpNtCgYIARAAGAQSNgF-L9Ir04i2vJquiWPY3uttanChRwntkLG_5HiIGpPQlj5LXvqC39z71rIW7luJ8otdamCo6A';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//SocketIO
// var appRoot = require('http://localhost:3000');
// var io = require('socket.io')();
// var socket = io('http://localhost:3000');

// Display Admin Home Page
router.get('/', (req, res) => {
    console.log(res.locals.notification);
    res.render('admin/adminHome/admin', {
        layout: 'adminMain',
        user: req.user.dataValues,
        active: { home: true }
    })
});

//Display Profile Page
router.get('/profile', (req, res) => {
    User.findOne({ where: { user_id: req.user.user_id }, include: [Admin] }).then(userselect => {
        console.log(JSON.parse(JSON.stringify(userselect)))
        switch (userselect.AccountTypeID) {
            case 3: //admin
                userselect.AccountTypeID = 'Admin';
                break;
            case 4:
                userselect.AccountTypeID = 'Admin';
                break;
            case 5:
                userselect.AccountTypeID = 'Admin';
                break;
            case 6:
                userselect.AccountTypeID = 'Admin';
                break;
            case 7: //SuperAdmin
                userselect.AccountTypeID = 'SuperAdmin';
                break;
            default:
                break;
        };

        res.render('admin/adminProfile/profile', {
            layout: 'adminMain',
            user: userselect
        })
    });
});

//Display Edit Profile Page
router.get('/editprofile', (req, res) => {
    Admin.findOne({ where: { userUserId: req.user.user_id } }).then(admin => {
        // console.log(admin)
        res.render('admin/adminProfile/editprofile', {
            layout: 'adminMain',
            user: req.user.dataValues,
            admin
        })
    })
});

router.post("/editprofile", (req, res) => {
    upload(req, res, (err) => {
        // console.log(req.file)
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
            // console.log("err 1")
        } else {
            if (req.file === undefined) {
                let { firstname, lastname, username, language, region, description, email, phonenumber } = req.body;
                // console.log(req.body)

                Admin.findOne({ where: { userUserId: req.user.user_id } })
                    .then(admin => {
                        if (admin) {
                            admin.update({ Language: language, Region: region, Description: description, PhoneNumber: phonenumber })
                            User.findOne({ where: { user_id: req.user.user_id } })
                                .then(user => {
                                    user.update({ FirstName: firstname, LastName: lastname, Username: username, Email: email })
                                    res.redirect(301, '/admin/profile')
                                })
                                .catch(err => console.log(err));
                        } else {
                            User.findOne({ where: { user_id: req.user.user_id } })
                                .then(user => {
                                    Admin.create({ Language: language, Region: region, Description: description, PhoneNumber: phonenumber, userUserId: user.user_id })
                                    user.update({ FirstName: firstname, LastName: lastname, Username: username, Email: email })
                                    res.redirect(301, '/admin/profile')
                                })
                                .catch(err => console.log(err));
                        }
                    });
            } else {
                let { firstname, lastname, username, language, region, description, email, phonenumber } = req.body;
                // console.log(req.body)

                Admin.findOne({ where: { userUserId: req.user.user_id } })
                    .then(admin => {
                        if (admin) {
                            admin.update({ Language: language, Region: region, Description: description, PhoneNumber: phonenumber, Certificate: req.file.filename })
                            User.findOne({ where: { user_id: req.user.user_id } })
                                .then(user => {
                                    user.update({ FirstName: firstname, LastName: lastname, Username: username, Email: email })
                                    res.redirect(301, '/admin/profile')
                                })
                                .catch(err => console.log(err));
                        } else {
                            User.findOne({ where: { user_id: req.user.user_id } })
                                .then(user => {
                                    Admin.create({ Language: language, Region: region, Description: description, PhoneNumber: phonenumber, Certificate: req.file.filename, userUserId: user.user_id })
                                    user.update({ FirstName: firstname, LastName: lastname, Username: username, Email: email })
                                    res.redirect(301, '/admin/profile')
                                })
                                .catch(err => console.log(err));
                        }
                    });
            }
        }
    });
});

//Display Certificate Page
router.get('/certificate', (req, res) => {
    PendingInstitution.findAll({ raw: true }).then(pInstList => {
        // console.log(pInstList)
        res.render('admin/adminCertificate/certificate', {
            layout: 'adminMain',
            user: req.user.dataValues,
            pInstList,
            active: { certificate: true }
        })
    });
});

router.post("/certificate", (req, res) => {
    let { id, action } = req.body

    var mailOptions;
    if (action == 'inst_approve') {
        PendingInstitution.findOne({ raw: true, where: { pending_institution_id: id } })
            .then(async function(approvedinst) {
                var APassword = crypto.randomBytes(20).toString('hex');
                console.log(APassword)
                console.log(req.user.user_id + 'user id')
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(APassword, salt, function(err, hash) {
                        // Store hash in your password DB.
                        if (err) {
                            throw err;
                        } else {
                            hashedpassword = hash;
                        }
                    })
                })
                await User.create({ Username: approvedinst.fname + approvedinst.lname, FirstName: approvedinst.fname, LastName: approvedinst.lname, Email: approvedinst.aemail, Password: hashedpassword, description: null, AccountTypeID: 2, InstitutionName: approvedinst.name })
                await Institution.create({ name: approvedinst.name, email: approvedinst.iemail })
                mailOptions = {
                    from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                    to: approvedinst.aemail,
                    subject: 'Welcome! Your Application Has Been Approved!',
                    html: '<h3>Password : </h3>' + APassword,
                };
                // console.log(mailOptions);
                sendMail(mailOptions)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));
                await PendingInstitution.destroy({ where: { pending_institution_id: id } })
                res.sendStatus(200)
            })
    } else if (action == 'inst_reject') {
        PendingInstitution.findOne({ raw: true, where: { pending_institution_id: id } })
            .then(rejectedinst => {
                mailOptions = {
                    from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
                    to: rejectedinst.aemail,
                    subject: 'Sorry! Your Application Has Been Denied!',
                    html: '<h3>HTML Testing!!</h3>',
                };
                // console.log(mailOptions);
                sendMail(mailOptions)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));
                PendingInstitution.destroy({ where: { pending_institution_id: id } })
                res.sendStatus(200)
                    // res.redirect(301, )
            })
    }
});


//Display Account Page
router.get('/create', (req, res) => {
    User.findAll({
            raw: true,
            where: {
                [Op.and]: [{
                    AccountTypeID: {
                        [Op.between]: [3, 7]
                    }
                }, {
                    user_id: {
                        [Op.notLike]: req.user.user_id
                    }
                }]
            }
        })
        .then(userlist => {
            // console.log(userlist)
            for (let i = 0; i < userlist.length; i++) {
                switch (userlist[i].AccountTypeID) {
                    case 3: //admin
                        userlist[i].AccountTypeID = 'Admin';
                        break;
                    case 4:
                        userlist[i].AccountTypeID = 'Admin';
                        break;
                    case 5:
                        userlist[i].AccountTypeID = 'Admin';
                        break;
                    case 6:
                        userlist[i].AccountTypeID = 'Admin';
                        break;
                    case 7: //SuperAdmin
                        userlist[i].AccountTypeID = 'SuperAdmin';
                        break;
                    default:
                        break;
                };
            }
            res.render('admin/adminAccount/create', {
                layout: 'adminMain',
                user: req.user.dataValues,
                userlist,
                active: { create: true }
            })
        });
});

router.post("/create", (req, res) => {
    let { id, action, roleselected } = req.body
    console.log(req.body)
    var mailOptions;
    if (action == "createadmin") {
        var RPassword = crypto.randomBytes(20).toString('hex');
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(RPassword, salt, function(err, hash) {
                // Store hash in your password DB.
                if (err) {
                    throw err;
                } else {
                    hashedpassword = hash;
                    User.create({ Email: id, Password: hashedpassword, AccountTypeID: 3 })
                }
            })
        })
        mailOptions = {
            from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
            to: id,
            subject: 'Welcome! You are now an Admin!',
            html: '<h3>Password : </h3>' + RPassword,
        };
        // console.log(mailOptions);
        sendMail(mailOptions)
            .then((result) => console.log('Email sent...', result))
            .catch((error) => console.log(error.message));
        res.sendStatus(200)
    }
    if (action == "updateadmin") {
        // console.log(roleselected)
        switch (roleselected) {
            case 'Admin': //admin
                roleselected = 3;
                break;
            case 'SuperAdmin': //superadmin
                roleselected = 7;
                break;
            default:
                break;
        };
        // console.log(roleselected)
        User.findOne({ where: { user_id: id } })
            .then(user => {
                user.update({ AccountTypeID: roleselected })
            })
            .catch(err => console.log(err));
    }
    if (action == "deleteadmin") {
        User.destroy({ where: { user_id: id } })
    }
});

//Display Notification Page
router.get('/notification', (req, res) => {
    res.render('admin/adminNotification/notification', {
        layout: 'adminMain',
        user: req.user.dataValues,
        active: { notification: true }
    })
});

router.post("/notification", (req, res) => {
    let { email, action, target, subject, message, datetime } = req.body
    console.log(req.body)

    if (action == "sendnotification") {
        var gencontentid = crypto.randomBytes(20).toString('hex');

        NotificationMessages.create({ ContentID: gencontentid, Subject: subject, Message: message, DateSent: datetime })

        if (target.includes("User")) {
            User.findAll({
                    where: {
                        [Op.and]: [{
                            Email: {
                                [Op.not]: email
                            }
                        }, {
                            AccountTypeID: 0
                        }]
                    }
                }).then(user => {
                    user.forEach(oneuser => {
                        Notification.create({ SenderEmail: email, RecipientRole: "User", userUserId: oneuser.user_id, notificationmsgContentID: gencontentid })
                    });
                })
                .catch(err => console.log(err));
        }
        if (target.includes("Tutor")) {
            User.findAll({
                    where: {
                        [Op.and]: [{
                            Email: {
                                [Op.not]: email
                            }
                        }, {
                            AccountTypeID: 1
                        }]
                    }
                }).then(user => {
                    user.forEach(oneuser => {
                        Notification.create({ SenderEmail: email, RecipientRole: "Tutor", userUserId: oneuser.user_id, notificationmsgContentID: gencontentid })
                    });
                })
                .catch(err => console.log(err));
        }
        if (target.includes("Institution")) {
            User.findAll({
                    where: {
                        [Op.and]: [{
                            Email: {
                                [Op.not]: email
                            }
                        }, {
                            AccountTypeID: 2
                        }]
                    }
                }).then(user => {
                    user.forEach(oneuser => {
                        Notification.create({ SenderEmail: email, RecipientRole: "Institution", userUserId: oneuser.user_id, notificationmsgContentID: gencontentid })
                    });
                })
                .catch(err => console.log(err));
        }
        if (target.includes("Admin")) {
            User.findAll({
                    where: {
                        [Op.and]: [{
                            Email: {
                                [Op.not]: email
                            }
                        }, {
                            AccountTypeID: 3
                        }]
                    }
                }).then(user => {
                    user.forEach(oneuser => {
                        Notification.create({ SenderEmail: email, RecipientRole: "Admin", userUserId: oneuser.user_id, notificationmsgContentID: gencontentid })
                    });
                })
                .catch(err => console.log(err));
        }
        if (target.includes("SuperAdmin")) {
            User.findAll({
                    where: {
                        [Op.and]: [{
                            Email: {
                                [Op.not]: email
                            }
                        }, {
                            AccountTypeID: 7
                        }]
                    }
                }).then(user => {
                    user.forEach(oneuser => {
                        Notification.create({ SenderEmail: email, RecipientRole: "SuperAdmin", userUserId: oneuser.user_id, notificationmsgContentID: gencontentid })
                    });
                })
                .catch(err => console.log(err));
        }
    };
});

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
        //     from: 'TutorHub Administrator 👨‍🏫<adm.tutorhub@gmail.com>',
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

module.exports = router;