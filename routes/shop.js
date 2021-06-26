const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/itemUpload');
const ItemListing = require('../models/ItemListing');
const User = require('../models/User')
const path = require('path');

router.get('/viewShop', (req, res) => {
    ItemListing.findAll({ include: User })
        .then(itemlist => {
            // console.log(itemlist)
            ItemListing.findAll({ where: { userUserId: req.user.user_id } })
                .then(yourlist => {
                    itemlists = JSON.parse(JSON.stringify(itemlist, null, 2));
                    console.log(itemlists);
                    yourlists = JSON.parse(JSON.stringify(yourlist, null, 2));
                    res.render('shop/viewShop', { layout: 'shop', yourlists, itemlists, user: req.user.dataValues });
                })
        }
        )
});

// router.post('/ItemListingUpload', (req, res) => {
//     if (!fs.existsSync('./public/images/itemlisting/')) {
//         fs.mkdirSync('./public/images/itemlisting/');
//     }

//     upload(req, res, (err) => {
//         if (err) {
//             res.json({ file: '/img/no-image.jpg', err: err });
//         } else {
//             if (req.file === undefined) {
//                 res.json({ file: '/img/no-image.jpg', err: err });
//             } else {
//                 image = req.file.filename;
//                 res.json({ path: `/images/itemlisting/${req.file.filename}` , file:`${req.file.filename}`});
//             }
//         }
//     });
// });

router.post('/ItemListing', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                let { name, price, description } = req.body;
                let filename = req.file.filename
                //express validator
                ItemListing.create({ Name: name, Price: price, Description: description, Picture: filename, userUserId: req.user.user_id })
                    .then(itemlist => {
                        alertMessage(res, 'success', itemlist.Name + ' added.', 'fas fa-sign-in-alt', true);
                        res.redirect(301, '/shop/viewShop');
                    })
                    .catch(err => console.log(err));
            }
        }

        });
});

router.post('/ItemDelete/:itemid', (req, res) => {
    ItemListing.destroy({ where: { item_id: req.params.itemid } }).then(res.redirect('/shop/Viewshop'))
})
module.exports = router;