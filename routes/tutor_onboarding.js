const express = require('express');
const router = express.Router();
const path = require('path');
const { body, validationResult } = require('express-validator');

const alertMessage = require('../helpers/messenger');
const multer = require('multer'); //parser for file upload
const { url } = require('inspector');
const Tutor = require('../models/Tutor');
const PendingTutor = require('../models/PendingTutor');
const profilePictureUpload = require('../helpers/imageUploads');
const pendingcertsUpload = require('../helpers/certUpload')
const User = require('../models/User');

const ensureAuthenticated = require('../helpers/auth');

/// mfff https://stackoverflow.com/questions/53165658/what-findone-returns-when-there-is-no-match
// User -> Tutor Onboarding
router.get('/becometutor', async(req, res) => { //check if user is logged in here
    if ((req.user != null) && (req.user.AccountTypeID == 0)) {
        await PendingTutor.findOne({ where: { userUserId: req.user.user_id } }).then(pendingticket => {
            if (pendingticket !== null) {
                res.redirect('/tutor_onboarding/finish')
            } else {
                if ((req.user) && (req.user.AccountTypeID == 0)) {
                    res.render('tutor_onboarding/tutor_onboarding', { title: "Become A Tutor!", layout: 'tutor_onboarding_base', user: req.user.dataValues })
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };
            }
        })

    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
    // let o = await PendingTutor.findOne({where:{ userUserId: req.user.user_id}}) threads it is because of the limit 1 in the query


    // PendingTutor.count({where:{ userUserId: req.user.user_id}}).then(count => {
    //     console.log("becometutot rdasdas")
    //     console.log
    //     if(count != 0 ){ //if o is not null
    //         res.redirect(301,'/tutor_onboarding/finish')
    //     }else{
    //         if ((req.user) && (req.user.AccountTypeID == 0)){
    //         }
    //         else{
    //             res.redirect("/")
    //         };
    //     }

    // }) //so somehow i fixed it by changing from findOne to findAll, sequelize is weird
    // res.render('tutor_onboarding/tutor_onboarding', {title: "Become A Tutor!", layout: 'tutor_onboarding_base' })
});

router.post("/profilePictureUpload", (req, res) => {
    profilePictureUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/profilepictures/' + `${req.file.filename}` });
                //check to see if the course record exist or not if so just update it with the new picture
                await User.findOne({ where: { user_id: req.user.user_id } }).then(user => {
                    user.update({ Profile_pic: req.file.filename })
                })
            }
        }
    });
})

router.get('/personal_info', async(req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 0)) {
        await PendingTutor.findOne({ where: { userUserId: req.user.user_id } }).then(pendingticket => {
            if (pendingticket !== null) {
                res.redirect('/tutor_onboarding/finish')

            } else {
                if ((req.user) && (req.user.AccountTypeID == 0)) {
                    res.render('tutor_onboarding/personal_info', {
                        layout: 'tutor_onboarding_base'
                    });
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };
            }
        })
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

    //checking to see whether theres already a pending ticket

});

router.post('/pendingcertUpload', (req, res) => {
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
                await Pending.findOne({ where: { user_id: req.user.user_id } }).then(user => {
                    user.update({ cert: req.file.filename })
                })
            }
        }
    });
})
router.post('/personal_info_upload', [
    body('first_name').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('last_name').not().isEmpty().trim().escape().withMessage("Last name is invalid"),
    body('description').not().isEmpty().withMessage("description is invalid"),

], ensureAuthenticated, (req, res) => {
    //retrieve input
    //validate input
    //update record in user table
    //redirect to professional info
    console.log(req.body)
    let { first_name, last_name, description, trueFileName } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('tutor_onboarding/personal_info', {
            layout: 'tutor_onboarding_base',
            user: req.user.dataValues,
            errors

        });
    } else {
        User.findOne({ where: { user_id: req.user.user_id } }).then(user => {
            user.update({ FirstName: first_name, LastName: last_name, description: description })
        })
        res.redirect('/tutor_onboarding/professional_info')
    }
});

router.get('/professional_info', async(req, res) => {
    //checking to see whether theres already a pending ticket
    if ((req.user != null) && (req.user.AccountTypeID == 0)) {
        await PendingTutor.findOne({ where: { userUserId: req.user.user_id } }).then(pendingticket => {
            if (pendingticket !== null) {
                res.redirect('/tutor_onboarding/finish')

            } else {
                if ((req.user) && (req.user.AccountTypeID == 0)) {
                    res.render('tutor_onboarding/professional_info', {
                        layout: 'tutor_onboarding_base'
                    });
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };
            }
        })

    } else {
        alertMessage(res, 'error', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

});


router.post('/professional_info', [
    body('occupation').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('college_country').not().isEmpty().trim().escape().withMessage("Please select college country"),
    body('college_name').not().isEmpty().trim().escape().withMessage("Last name is invalid"),
    body('major').not().isEmpty().trim().escape().withMessage("description is invalid"),
    //the last character is derived through a calculation 
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
    body('cert').not().isEmpty().trim().escape().withMessage("Please upload a cert"),

], ensureAuthenticated, (req, res) => {
    let { occupation, fromyear, toyear, college_country, college_name, major, graduateyear, dateofbirth, nric, cert: trueFileName } = req.body
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('tutor_onboarding/professional_info', {
            layout: 'tutor_onboarding_base',
            user: req.user.dataValues,
            occupation,
            fromyear,
            toyear,
            college_country,
            college_name,
            major,
            graduateyear,
            dateofbirth,
            nric,
            trueFileName,
            errors

        });
    } else {
        //create a pending ticket

        //for review 1 purposes i will skip the pending ticket creation and jump straight to creating a tutor object using the user's ID
        console.log("======= creating tutor record ======")
        console.log(req.user.dataValues.user_id);
        userid = req.user.dataValues.user_id;
        PendingTutor.create({ occupation: occupation, fromyear: fromyear, toyear: toyear, college_country: college_country, college_name, major, graduate: graduateyear, dateofbirth, NRIC: nric, userUserId: userid, cert: trueFileName })
            .then(tutor => {
                alertMessage(res, 'success', tutor.tutor_id + 'user has been verified as tutor', 'fas fa-sign-in-alt', true);
                res.redirect('/');
            })
            .catch(err => console.log(err));
        res.redirect("/");
    }
});

router.get('/finish', ensureAuthenticated, (req, res) => {
    res.render('tutor_onboarding/finish', {
        user: req.user.dataValues
    })
})
module.exports = router;