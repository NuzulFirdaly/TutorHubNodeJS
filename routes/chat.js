const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { Op } = require("sequelize");

/* models */
const Chatdata = require('../models/Chat');
const User = require('../models/User');

var GlobalReceiverID;
var GlobalsearchCHECK;
var GlobalsearchedUser;

// Main Chat system
router.get('/system', (req, res) => {
    try {
        let user = req.user.dataValues
    } catch (e) {
        res.redirect('/');
    }
    if (GlobalsearchCHECK == true) {
        console.log("Searched Chats")
        let index = 0;
        GlobalsearchCHECK = false;
        res.render('chat/chatsystemmain', { user: req.user.dataValues, users: GlobalsearchedUser, index: index })

    } else {
        console.log("All chats")
        User.findAll({
            order: [
                ['User_id', 'ASC']
            ],
            raw: true
        }).then((users) => {

            let index = 0;
            res.render('chat/chatsystemmain', { user: req.user.dataValues, users: users, index: index })
        }).catch(err => console.log(err));
    }
});

// 1 to 1 User Chat System
router.post('/systemNotMain', (req, res) => {
    try {
        let user = req.user.dataValues
    } catch (e) {
        res.redirect('/');
    }

    let { receiverid } = req.body;
    if (receiverid == null) {
        receiverid = GlobalReceiverID
            // GlobalReceiverID = null
    }


    User.findAll({
        order: [
            ['User_id', 'ASC']
        ],
        raw: true
    }).then((users) => {

        Chatdata.findAll({
            where: {
                [Op.or]: [{
                        [Op.and]: [{ Sender_id: req.user.user_id }, { Receiver_id: receiverid }]
                    },
                    {
                        [Op.and]: [{ Sender_id: receiverid }, { Receiver_id: req.user.user_id }]
                    }
                ]
            },
            order: [
                ['Timestamp', 'ASC']
            ],
            raw: true

        }).then((chatData) => {
            User.findOne({
                where: {
                    user_id: receiverid
                },
                raw: true
            }).then((talkingtoUser) => {
                let receiverName = talkingtoUser.Username;
                let index = 0;
                res.render('chat/chatsystem', { user: req.user.dataValues, chatData: chatData, users: users, index: index, receiverBOI: receiverid, receiverName: receiverName })
            })

            // console.log(req.user);
            // console.log(chatData);
            // console.log(users);
            // let index = chatData.count('Chat_id');
            // console.log(index);
            // chatData.count({}, function( err, count){
            //     console.log( "Number of users:", count );
            // })


        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
});

// Search chat
router.post('/searchChat', (req, res) => {
    console.log("Searching Chat...")
        // let { receiverBOI } = req.body;
        // GlobalReceiverID = receiverBOI;
    let searchedUser = req.body.searchedUser;
    console.log("User search name", searchedUser)
    User.findAll({
        where: {
            Username: searchedUser
        },
        raw: true
    }).then((searchedUsers) => {
        console.log("Users Searched ", searchedUsers)
        GlobalsearchedUser = searchedUsers;
        GlobalsearchCHECK = true;
        res.redirect('system');
    }).catch(err => console.log(err))
});

// Delete
router.post('/delete', (req, res) => {

    let { receiverBOI } = req.body;

    User.findOne({
        where: {
            user_id: receiverBOI
        },
        raw: true
    }).then((Other_user) => {
        console.log(Other_user);
        GlobalReceiverID = Other_user.user_id;
        Chatdata.destroy({
            where: {
                [Op.or]: [{
                        [Op.and]: [{ Sender_id: req.user.user_id }, { Receiver_id: Other_user.user_id }]
                    },
                    {
                        [Op.and]: [{ Sender_id: Other_user.user_id }, { Receiver_id: req.user.user_id }]
                    }
                ]
            },
        }).then(res.redirect(307, 'systemNotMain'))
    }).catch(err => console.log(err))
});

// Create Text message
router.post('/sendText', (req, res) => {
    console.log("Message sent")
    let { receiverBOI } = req.body;

    let txt_msg = req.body.txt;
    let sender_id = req.user.user_id;
    let SenderName = req.user.Username;
    User.findOne({
        where: {
            user_id: receiverBOI
        },
        raw: true
    }).then((user) => {
        console.log(user);
        let Receiver_id = user.user_id;
        let ReceiverName = user.Username;
        console.log(sender_id);
        console.log(txt_msg);
        console.log(Receiver_id);
        let timestamp = new Date();
        Chatdata.create({
            Sender_id: sender_id,
            Receiver_id,
            ReceiverName,
            SenderName,
            Txt_msg: txt_msg,
            Timestamp: timestamp,
            Status: 1
        }).then(() => {
            GlobalReceiverID = Receiver_id;
            res.redirect(307, 'systemNotMain');
        }).catch(err => console.log(err))
    })
});

// Broadcast Form
router.get('/chatbroadcast', (req, res) => {
        console.log('Broadcast Form')
        if (GlobalsearchCHECK == true) {
            console.log("Searched Chats")
            let index = 0;
            GlobalsearchCHECK = false;
            res.render('chat/chatsystemmain', { user: req.user.dataValues, users: GlobalsearchedUser, index: index })

        } else {
            console.log("All chats")
            User.findAll({
                order: [
                    ['User_id', 'ASC']
                ],
                raw: true
            }).then((users) => {

                let index = 0;
                res.render('chat/chatbroadcast', { user: req.user.dataValues, users: users, index: index })
            }).catch(err => console.log(err));
        }
    })
    // Broadcast to ALL
router.post('/broadcastsend', (req, res) => {
    let txt_msg = req.body.txt;
    console.log("Text Msg", txt_msg)
    User.findAll({
        order: [
            ['User_id', 'ASC']
        ],
        raw: true
    }).then((users) => {
        console.log(users);
        let sender_id = req.user.user_id;
        let SenderName = req.user.Username;
        for (i in users) {
            if (users[i].user_id == sender_id) {

            } else {
                let Receiver_id = users[i].user_id
                let ReceiverName = users[i].Username
                let timestamp = new Date();
                // console.log(sender_id, SenderName, Receiver_id, ReceiverName, timestamp, txt_msg)
                Chatdata.create({
                    Sender_id: sender_id,
                    Receiver_id,
                    ReceiverName,
                    SenderName,
                    Txt_msg: txt_msg,
                    Timestamp: timestamp,
                    Status: 1
                })
            }
        }
        res.redirect('system');
    })
})

// Broadcast User List (Hopeless)
router.post('/broadcastaddUser', (req, res) => {
    let receiverid = req.body.receiverid2;
    console.log("Add Broadcast Receiver User", receiverid)
    res.redirect('chatbroadcast');
})

router.post('/systemkkkk/:id', (req, res) => {
    console.log("Message sent")
    let txt_msg = req.body.txt;
    let sender_id = req.user.user_id;
    let SenderName = req.user.Username;
    User.findOne({
        where: {
            Username: req.params.id, // "User1"
        },
        raw: true
    }).then((user) => {
        // console.log(user);
        let Receiver_id = user.user_id;
        let ReceiverName = user.Username;
        console.log(sender_id);
        console.log(txt_msg);
        console.log(Receiver_id);
        let timestamp = new Date();
        Chatdata.create({
            Sender_id: sender_id,
            Receiver_id,
            ReceiverName,
            SenderName,
            Txt_msg: txt_msg,
            Timestamp: timestamp,
            Status: 1
        }).then(() => {
            res.redirect('system');
        }).catch(err => console.log(err))
    })
});





























// Test route
router.get('/chatsystem', (req, res) => {
    Chatdata.findAll({
        where: {
            Sender_id: req.user.user_id // req.param.id
        },
        order: [
            ['Chat_id', 'ASC']
        ],
        raw: true
    }).then((chatData) => {
        let example = "red";
        console.log(req.user);
        console.log(chatData);
        res.render('chat/chatTest', { user: req.user.dataValues, test: example, chatData: chatData })
    }).catch(err => console.log(err));
});

// Create Text message
router.post('/chatsystem', (req, res, next) => {
    console.log("Message sent")
    let txt_msg = req.body.txt;
    let sender_id = req.user.user_id;
    let SenderName = req.user.Username;
    User.findOne({
        where: {
            Username: "User1"
        },
        raw: true
    }).then((user) => {
        console.log(user);
        let Receiver_id = user.user_id;
        let ReceiverName = user.Username;
        console.log(sender_id);
        console.log(txt_msg);
        console.log(Receiver_id);
        let timestamp = new Date();
        Chatdata.create({
            Sender_id: sender_id,
            Receiver_id,
            ReceiverName,
            SenderName,
            Txt_msg: txt_msg,
            Timestamp: timestamp,
            Status: 1
        }).then(() => {
            res.redirect('chatsystem');
        }).catch(err => console.log(err))
    })

});



module.exports = router;

/*



*/