const express = require('express');

const router = express.Router();

const User = require('../models/User');
const alertMessage = require('../helpers/messenger');

router.get('/viewProfile', (req, res) => {
    res.render('user/viewProfile', { layout: 'userFunctions' });
});

router.get('/editProfile', (req,res) => {
    res.render('user/editProfile', { layout: 'userFunctions' });
});


router.post('/editProfile', (req, res, next) => {
    User.findOne({ where: {Email: req.body.email} }).then(user => {
        console.log(user.AccountTypeID)
    })
});

module.exports = router;