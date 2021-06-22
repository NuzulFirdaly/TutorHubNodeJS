const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/itemUpload');
const ItemListing = require('../models/ItemListing');
const User = require('../models/User')

router.get('/viewShop', (req, res) => {
    ItemListing.findAll({ include: User })
        .then(itemlist => {
            // console.log(itemlist)
            itemlists = JSON.parse(JSON.stringify(itemlist,null,2))
            console.log(itemlists)

            res.render('shop/viewShop', { layout: 'shop', itemlists, user: req.user.dataValues});
        })
});

router.post('/ItemListingUpload', (req, res) => {
    if (!fs.existsSync('./public/images/itemlisting/')) {
        fs.mkdirSync('./public/images/itemlisting/');
    }

    upload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                image = req.file.filename;
                res.json({ path: `/images/itemlisting/${req.file.filename}` , file:`${req.file.filename}`});
            }
        }
    });
});

router.post('/ItemListing', (req, res) => {
    let { name, price, description, fileName } = req.body;
    console.log(name, price, description, fileName)
    //express validator
    ItemListing.create({Name:name, Price:price, Description:description, Picture:fileName, userUserId:req.user.user_id})
        .then(itemlist => {
            alertMessage(res, 'success', itemlist.Name + ' added.', 'fas fa-sign-in-alt', true);
            res.redirect(301,'/shop/viewShop');
        })
        .catch(err => console.log(err));
});

router.post('/ItemDelete/:itemid', (req, res) => {
    ItemListing.destroy({where:{item_id:req.params.itemid}}).then(res.redirect('/shop/Viewshop'))
})
module.exports = router;