const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const User = require('../models/User');


//todo 
//try to see whether its possible to implement angular scheduler system
// tutor no need to select time
// they just select the date, course and session
// because they already indicate the time on the session
// they only need to indicate start time
router.get("/retrievetutorid",(req,res)=>{
    res.send(JSON.stringify(req.user.user_id))
})
router.get("/:tutorid", (req,res)=>{
    if (req.user != null){
        User.findOne({where: {user_id: req.params.tutorid}})
        .then(tutor =>{
            if(tutor.user_id == req.user.user_id){
                res.render("schedule/myschedule",{
                    tutor_id: req.params.tutorid,
                    user: req.user.dataValues,

                })
            }else{
                res.redirect("/")
            }
        })
    }else{
        res.redirect("/")
    }
    //validate whether req iser is the same
})
module.exports = router;