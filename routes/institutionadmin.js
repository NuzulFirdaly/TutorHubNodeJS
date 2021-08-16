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

//express validator
const { body, validationResult } = require('express-validator');

//const { ValidationError } = require('sequelize/types');
const { error } = require('console');


// ---------------------------------------------
router.use(express.urlencoded({
    extended: true
})); 

// show edit home page
router.get('/showyourpage', async(req, res) => {
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
                    userUserId: institutionadminid
                },
                raw: true
            })
            .then( async (institute) => {
                console.log("fetching institution id........");
                institutionid = institute.institution_id;
                console.log("Institution id: ", institutionid);
                console.log("Fetching institutionid complete...");
                if (institute) {
                    var banneritems;
                    var alloftutors;
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
                            InstitutionName: institute.name
                        },
                        raw:  true
                    })
                    .then(foundtutor => {
                        console.log("Putting tutors into an array.....");
                        console.log(foundtutor);
                        alloftutors = foundtutor
                        console.log("Successfully put tutors into institutiontutorarray...");
                    }).catch(err => console.log(err));

                    // render page
                    res.render('institution_admin/yourpage', {
                            title: "Your institution",
                            layout: 'institution_admin_base',
                            user: req.user.dataValues,
                            bannerarray: banneritems,
                            institutiontutorarray: alloftutors
                        });
                } else {
                    console.log("Unable to find institution");
                }
            }).catch(err => console.log(err));
    } else {
        res.redirect("/")
    };
});

// show edit main school logo
router.get('/showeditmainlogo', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        console.log("Fetching admin id.....");
        institutionadminid = req.user.dataValues.user_id;
        console.log(institutionadminid);
        console.log("Fetching adminid successful");

        console.log("Finding institution.........");
        Institution.findOne({
                where: {
                    userUserId: institutionadminid
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

router.post('/editmainlogo/editlogo', (req, res) => {
    console.log("request edit main logo form........");
    console.log(req.body);
    let {trueFileLogoName} = req.body;
    console.log(trueFileLogoName);
    let errors = [];

    if (errors.length > 0) {
        console.log("There are errors uploading the logo. Please try again.");
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg})
        })
        res.redirect('/institution_admin/showeditmainlogo', {
            user: req.user/dataValues,
            errors
        });
    }
    else {
        console.log("There are no errors found.");
        userid = req.user.dataValues.user_id;
        console.log("User id: ", userid);
        Institution.findOne({
            where: {
                userUserId: userid
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        })
        .then(updateinstit => {
            if (updateinstit){
                updateinstit.update({mainlogo: trueFileLogoName})
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

// show register tutor page
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

router.post("/profilePictureUpload", (req,res)=>{
    profilePictureUpload(req,res, async (err)=>{
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({err: err});
        } else {
            if (req.file === undefined) {
                res.json({err: err});
            } else {
                res.json({file: `${req.file.filename}`, path:'/images/profilepictures/'+`${req.file.filename}`});
                //check to see if the course record exist or not if so just update it with the new picture
                // await User.findOne({where: {user_id:  req.user.user_id } }).then(user => {
                //     user.update({Profile_pic:req.file.filename})
                // })
            }
        }   
    });
})

router.post('/pendingcertUpload',(req,res)=>{
    pendingcertsUpload(req,res, async (err)=>{
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({err: err});
        } else {
            if (req.file === undefined) {
                res.json({err: err});
            } else {
                res.json({path: `/pendingcerts/${req.file.filename}`, file: `${req.file.filename}`});
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
        if(value <= d ) {
            throw new Error ('Your professional record must be recent and relevant');
        }
        return true;
    }),
    body('toyear').custom(value=> {
        var d = new Date().getFullYear + 5;
        if(value > d) {
            throw new Error ('Your record is too early');
        }
        return true;
    }),
    body('graduateyear').custom(value=> {
        var d = new Date().getFullYear + 5;
        if(value >= d) {
            throw new Error ('graduate year is invalid');
        }
        return true;
        }),
    body('profilePictureUpload').not().isEmpty().trim().escape().withMessage("Please upload a cert"), 
],ensureAuthenticated,(req, res) => {
    console.log("retrieving the institution tutor forms......")
    let {firstname, lastname, description, trueFileCertName} = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()){ //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error=>{
            console.log(error);
            errors.push({text:error.msg})
        })

    } else {
        console.log("Creating instititution tutor...........");
        console.log("This is the institution: ", req.user.InstitutionName);
        User.create({ FirstName: firstname, LastName: lastname, description: description, InstitutionName: req.user.InstitutionName})
        .catch(err => console.log(err));

        res.redirect('/institution_admin/showtutorcompletion', {
            user: req.user.dataValues,
            errors

        });
     }
})

router.get('/showtutorcompletion', (req, res) => {
    if ((req.user) && (req.user.AccountTypeID == 2)) {
        res.render('institution_admin/tutorcompletion', {
            title: "your institution",
            layout: 'institution_admin_base'
        });
    } else {
        res.redirect("/");
    }
});

// show your tutor page
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

// show your course page
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

// CRUD for banner - Create
//var uploadB = multer({dest: 'public/images/Institutionpictures/banner/'});
router.post('/yourpage/addbanner', (req, res) => {
    console.log("request banner form.....");
    console.log(req.body);
    let { trueFileInstitutionName } = req.body;
    console.log(trueFileInstitutionName);
    let errors = [];

    if (errors.length > 0) {
        console.log("There are errors uploading the banner")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.redirect('/institution_admin/showyourpage', {
            user: req.user.dataValues,
            errors
        })
    } else {
        userid = req.user.dataValues.user_id;
        console.log("User id: ",userid);
        Institution.findOne({
            where: {
                userUserId: userid
            },
            order: [
                ['name', 'ASC']
            ],
            raw: true
        }).then((institution) => {
            if (institution) {
                institutionid = institution.institution_id;
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
router.post('/yourpage/deletebanner', uploadnone.none(), function(req, res) {
    let uploaddeletebanner = req.body.uploaddeletebanner;
    console.log("Attempting to delete banner chosen.....");
    console.log(uploaddeletebanner);
    res.redirect('/institution_admin/showyourpage');
});

// CRUD for description
router.post('/yourpage/editabout', uploadnone.none(), function(req, res) {
    let instituteAbout = req.body.instituteAbout;
    res.redirect('//institution_adminshowyourpage');
});
router.post('/yourpage/editmycourses', uploadnone.none(), function(req, res) {
    let institutemycourse = req.body.institutemycourse;
    res.redirect('/institution_admin/showyourpage');
});

//CRUD for socialmedia
var uploadSM = multer({ dest: 'public/images/Institutionpictures/socialmedia/' });
router.post('/institution_admin/yourpage/addsocialmedia', uploadSM.single('uploadaddsm'), function(req, res) {
    let smimage = req.body.uploadaddsm;
    let smurl = req.body.smurl;
    res.redirect('/showyourpage');
});

module.exports = router;