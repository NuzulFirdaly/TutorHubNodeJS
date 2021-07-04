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


// ---------------------------------------------
router.use(express.urlencoded({
    extended: true
}));

// show edit home page  -- Main overall page
router.get('/showyourpage', async (req, res) => {
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
        })
            .then(async (institute) => {
                console.log("fetching institution id........");
                institutionid = institute.institution_id;
                console.log("Institution id: ", institutionid);
                console.log("Fetching institutionid complete...");
                if (institute) {
                    var banneritems;
                    var alloftutors;
                    var bothdescriptions;
                    var allwidgets;
                    var allseminars;
                    var allfeaturetutors;
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
                    console.log("Fetching institution's descriptions")
                    await Description.findAll({
                        where: {
                            institutionInstitutionId: institutionid
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
                            institutionInstitutionId: institutionid
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
                            institutionInstitutionId: institutionid
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
                            institutionInstitutionId: institutionid
                        },
                        raw: true
                    })
                        .then(foundfeaturetutor => {
                            console.log("Putting featured tutors into array");
                            console.log(foundfeaturetutor);
                            allfeaturetutors = foundfeaturetutor
                            console.log("successfully put featured tutor in array");
                        }).catch(err => console.log(err));

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
                        featuretutorarray: allfeaturetutors
                    });
                } else {
                    console.log("Unable to find institution");
                }
            }).catch(err => console.log(err));
    } else {
        res.redirect("/")
    };
});




// show edit main school logo -------------------------------
router.get('/showeditmainlogo', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
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
                        mainlogoarray: foundinstitution
                    });
                }
            });
    } else {
        res.redirect("/")
    };
});

router.post('/editmainlogo/editlogo', [body('trueFileLogoName').not().isEmpty().trim().escape().withMessage("Please upload a logo image")], (req, res) => {
    console.log("request edit main logo form........");
    console.log(req.body);
    let { trueFileLogoName } = req.body;
    //console.log(trueFileLogoName);
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) {
        console.log("There are errors uploading the logo. Please try again.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('/institution_admin/showeditmainlogo', {
            user: req.user.dataValues,
            errors
        });
    }
    else {
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
                    console.log("This is the file: ", trueFileLogoName);
                    updateinstit.update({ mainlogo: trueFileLogoName })
                        .catch(err => console.log(err));
                    console.log("Update main logo successfully");
                    res.redirect('/institution_admin/showeditmainlogo');
                }
                else {
                    console.log("Updating main logo UNSUCCESSFUL.");
                }
            }).catch(err => console.log(err));
    }
});

router.post('/institutionMainLogoUpload', (req, res) => {
    console.log("Attempting to upload main institution logo...");
    institutionMainLogoUpload(req, res, async (err) => {
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

// ------------------------------------------------------




// show register tutor page -------------------------------------------------
router.get('/showregistertutor', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/registertutor', {
            title: "Your institution",
            layout: 'institution_admin_base'
        });
    } else {
        res.redirect("/")
    };
});

router.post("/profilePictureUpload", (req, res) => {
    profilePictureUpload(req, res, async (err) => {
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
                // await User.findOne({where: {user_id:  req.user.user_id } }).then(user => {
                //     user.update({Profile_pic:req.file.filename})
                // })
            }
        }
    });
})

router.post('/pendingcertUpload', (req, res) => {
    pendingcertsUpload(req, res, async (err) => {
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

router.post('/registertutor', [
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
    body('profilePictureUpload').not().isEmpty().trim().escape().withMessage("Please upload a cert"),
], ensureAuthenticated, (req, res) => {
    console.log("retrieving the institution tutor forms......")
    let { firstname, lastname, description, trueFileCertName, username, password, email } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })

    } else {
        console.log("Creating instititution tutor...........");
        console.log("This is the institution: ", req.user.user_id);
        Institution.findOne({
            where: {
                AdminUserID: req.user.user_id
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        }).then(createnewtutor => {
            User.create({ FirstName: firstname, LastName: lastname, description: description, Email: email, Username: username, Password: password, AccountTypeID: 1, institutionInstitutionId: createnewtutor.institution_id })
            .catch(err => console.log(err));
        });

        res.redirect('/institution_admin/tutorcompletion');
    }
})

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





// show your tutor page ------------------------------------------------------
router.get('/showyourtutors', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/yourtutor', {
            title: "Your institution",
            layout: 'institution_admin_base'
        });
    } else {
        res.redirect("/");
    };
});
// -----------------------------------------------------------------------





// show your course page ----------------------------------------------------
router.get('/showyourcourses', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/yourcourse', {
            title: "Your institution",
            layout: 'institution_admin_base'
        });
    } else {
        res.redirect("/");
    }
});
// ------------------------------------------------------------------------




// ADMIN CRUD -----------------------------------------------------------------------------------------



// CRUD for banner - Create -------------------------------------------------------------
//var uploadB = multer({dest: 'public/images/Institutionpictures/banner/'});
router.post('/yourpage/addbanner', [body('trueFileInstitutionName').not().isEmpty().trim().escape().withMessage("Please upload a banner image")], (req, res) => {
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
        res.render('/institution_admin/showyourpage', {
            user: req.user.dataValues,
            errors
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
    institutionBannerUpload(req, res, async (err) => {
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
        res.render('/institution_admin/showyourpage',
            {
                user: req.user.dataValues,
                errors
            });
    }
    else {
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

                res.redirect('/institution_admin/showyourpage');

                console.log("Successfully deleted the banner.");
            })
    }
});
// -----------------------------------------------------------------------------------------------





// CRUD for description ------------------------------------------------------------------------
router.post('/yourpage/editdescription',
    uploadnone.none(),
    [body('instituteAbout').not().isEmpty().trim().escape().withMessage("about is invalid")],
    [body('instituteMyCourse').not().isEmpty().trim().escape().withMessage("My course is invalid")],
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
            res.render('/institution_admin/showyourpage',
                {
                    user: req.user.dataValues,
                    errors
                });
        }
        else {
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
                        }
                        else {
                            console.log("There is no description that exist");
                            Description.create({ about: instituteAbout, mycourse: instituteMyCourse, institutionInstitutionId: founddescription.institution_id })
                                .catch(err => console.log(err));
                        }
                    }).catch(err => console.log(err));
            }).catch(err => console.log(err));
            res.redirect('/institution_admin/showyourpage');
        }
    });
// ------------------------------------------------------------------------------------------------





//CRUD for Widget -------------------------------------------------------------------------
// var uploadSM = multer({ dest: 'public/images/Institutionpictures/socialmedia/' });
router.post('/yourpage/addwidget',
    [body('trueFileWidgetName').not().isEmpty().trim().escape().withMessage("Please upload a widget image")],
    [body('widgeturl').not().isEmpty().withMessage("Please enter url")]
    , (req, res) => {
        console.log("Requesting widget form....");
        let { trueFileWidgetName, widgeturl } = req.body;
        let errors = [];

        const validatorErrors = validationResult(req);
        if (!validatorErrors.isEmpty()) {
            console.log("There are errors uploading the widget. Please try again");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error_msg })
            });
            res.render('/institution_admin/showyourpage', {
                user: req.user.dataValues,
                errors
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
                    res.redirect('/institution_admin/showyourpage');
                }
                else {
                    console.log("Unable to find institution id. Error in uploading.");
                }
            }).catch(err => console.log(err));
        }
    });

router.post('/institutionWidgetUpload', (req, res) => {
    console.log("attempting to upload widget imager");
    institutionWidgetUpload(req, res, async (err) => {
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

router.post("/yourpage/updatewidget", 
    [body('trueFileWidgetName2').isEmpty().trim().escape().withMessage("Please upload a seminar image")],
    [body('widgeturl').isEmpty().withMessage("Please enter a url")], uploadnone.none(),
    ensureAuthenticated, (req, res) => {
        console.log("Retireving update widget form....");
        let {trueFileWidgetName2, widgeturl, widgetid} = req.body;
        const validatorErrors = validationResult(req);
        if (validatorErrors.isEmpty()) {
            console.log("There are errors uploading the widget. Please try again.");
            validatorErrors.array().forEach(error => {
                console.log(error);
                errors.push({ text: error.msg });
            })
            res.render('/institution_admin/showyourpage',
                {
                    user: req.user.dataValues,
                    errors
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
                    updatewidgets.update({widgetimage: trueFileWidgetName2, widgeturl: widgeturl})
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
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
        res.render('/institution_admin/showyourpage',
            {
                user: req.user.dataValues,
                errors
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
        res.render('institution_admin/showyourpage',
            {
                user: req.user.dataValues,
                errors
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
                            res.redirect('/institution_admin/showyourpage');
                        }
                        else {
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
        res.render('/institution_admin/showyourpage',
            {
                user: req.user.dataValues,
                errors
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

                res.redirect('/institution_admin/showyourpage');
                console.log("Successfully deleted the featured tutor");
            });
    }
});
// ------------------------------------------------------------------------------



// CRUD for featured courses ---------------------------------------------------------
// -----------------------------------------------------------------------------------





// CRUD for seminar and events ----------------------------------------------------
router.post('/institutionSeminarUpload', (req, res) => {
    console.log("Attempting to upload seminar image");
    institutionSeminarUpload(req, res, async (err) => {
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


router.post("/yourpage/addseminar",
    [body('trueFileSeminarName').not().isEmpty().withMessage("Please upload a seminar image")],
    [body('seminartitle').not().isEmpty().trim().escape().withMessage("Please write a title")],
    [body('seminardescription').not().isEmail().trim().escape().withMessage("Please enter a description")],
    [body('seminarurl').not().isEmpty().withMessage("Please enter a url")], uploadnone.none(),
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
            res.render('/institution_admin/showyourpage', {
                user: req.user.dataValues,
                errors
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
                    res.redirect('/institution_admin/showyourpage');
                } else {
                    console.log("Unable to find institution id. Error in uploading.");
                }
            }).catch(err => console.log(err));
        }
    });

router.post("/yourpage/updateseminar",
    [body('trueFileSeminarName2').isEmpty().trim().escape().withMessage("Please upload a seminar image")],
    [body('seminartitle').isEmpty().trim().escape().withMessage("Please write a title")],
    [body('seminardescription').isEmpty().trim().escape().withMessage("Please enter a description")],
    [body('seminarurl').isEmpty().withMessage("Please enter a url")], uploadnone.none(),
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
            res.render('/institution_admin/showyourpage',
                {
                    user: req.user.dataValues,
                    errors
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
                        updateseminar.update({SEImage: trueFileSeminarName2, SETitle: seminartitle, SEDescription: seminardescription, SEUrl: seminarurl})
                        .catch(err => console.log(err));
                    }) .catch(err => console.log(err));
                }) .catch(err => console.log(err));
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
        res.render('/institution_admin/showyourpage',
            {
                user: req.user.dataValues,
                errors
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
                res.redirect('/institution_admin/showyourpage');
                console.log("Successfully deleted the seminar");
            }).catch(err => console.log(err));
    }
});
// -------------------------------------------------------------------------------
module.exports = router;