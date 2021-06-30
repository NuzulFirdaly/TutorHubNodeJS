const express = require('express');
const Handlebars = require('handlebars')
const Admin = require('../models/Admin');
const router = express.Router();
const User = require('../models/User');
// Required for file upload
const fs = require('fs');
const upload = require('../helpers/adminUploadCertificate');

// Display Admin Home Page
router.get('/', (req, res) => {
    res.render('admin/adminHome/admin', {
        layout: 'adminMain',
        user: req.user.dataValues
    })
});

//Display Profile Page
router.get('/profile', (req, res) => {
    Admin.findOne({ where: { userUserId: req.user.user_id } }).then(admin => {
        console.log(admin)
        res.render('admin/adminProfile/profile', {
            layout: 'adminMain',
            user: req.user.dataValues,
            admin
        })
    })
});

//Display Edit Profile Page
router.get('/editprofile', (req, res) => {
    Admin.findOne({ where: { userUserId: req.user.user_id } }).then(admin => {
        console.log(admin)
        res.render('admin/adminProfile/editprofile', {
            layout: 'adminMain',
            user: req.user.dataValues,
            admin
        })
    })
});

router.post("/editprofile", (req, res) => {
    upload(req, res, (err) => {
        console.log(req.file)
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
            console.log("err 1")
        } else {
            if (req.file === undefined) {
                let { firstname, lastname, username, language, region, description, email, phonenumber } = req.body;
                console.log(req.body)

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
                console.log(req.body)

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
    User.findAll({ raw: true }).then(userlist => {
        res.render('admin/adminCertificate/certificate', {
            layout: 'adminMain',
            user: req.user.dataValues,
            userlist
        })
    });
});

//Display Account Page
router.get('/create', (req, res) => {
    User.findAll({ raw: true }).then(userlist => {
        res.render('admin/adminAccount/create', {
            layout: 'adminMain',
            user: req.user.dataValues,
            userlist
        })
    });
});

module.exports = router;