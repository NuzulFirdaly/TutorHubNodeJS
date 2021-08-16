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
                    yourlists = JSON.parse(JSON.stringify(yourlist, null, 2));
                    var cart = Object.keys(req.session.cart).length;
                    res.render('shop/viewShop', { layout: 'shop', yourlists, itemlists, user: req.user.dataValues, cart });
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
                        alertMessage(res, 'success', itemlist.Name + ' added to Your Listing.', 'fas fa-sign-in-alt', true);
                        res.redirect(301, '/shop/viewShop');
                    })
                    .catch(err => console.log(err));
            }
        }

    });
});

router.post('/ItemDelete/:itemid', (req, res) => {
    ItemListing.destroy({ where: { item_id: req.params.itemid } }).then(res.redirect('/shop/Viewshop'))
});

router.get('/viewCart', async (req, res) => {
    var cartLength = 0
    var cart = req.session.cart;
    if (cart) {
        cartLength = Object.keys(req.session.cart).length;
        for (var key in cart){
            await ItemListing.findOne({ where: { item_id: key }})
            .then(item => {
                if (cart[key][0] !== item.dataValues.Price){
                    var old = cart[key][0];
                    cart[key][0] = item.dataValues.Price;
                    cart[key][2] = cart[key][0] * cart[key][1];
                    alertMessage(res, 'info', cart[key][3] + ` price has been changed from ${old} to ${cart[key][0]}.`, 'fas fa-sign-in-alt', true);
                }
            })
        }
    }
    res.render('shop/viewCart', { cart, cartLength })
})

router.post('/addCart', (req, res) => {
    let { itemid, name, price, quantity } = req.body;
    Price = parseFloat(price);
    Quantity = parseInt(quantity);
    total = Price * Quantity;
    var cart = req.session.cart;
    if (cart[itemid] !== undefined) {
        cart[itemid][1] += Quantity;
        cart[itemid][2] += total;
    } else {
        cart[itemid] = [Price, Quantity, total, name];
    }
    req.session.cart = cart;
    alertMessage(res, 'success', name + ' added to cart.', 'fas fa-sign-in-alt', true);
    res.redirect('/shop/viewShop');
});

router.post('/updateCart/:id', (req, res) => {
    let { newValue } = req.body;
    cart = req.session.cart;
    cart[req.params.id][1] = newValue
    console.log(newValue);
    console.log(cart[req.params.id][1]);
    res.redirect('/shop/viewCart');
});

router.post('/removeCart/:id', (req, res) => {
    cart = req.session.cart;
    delete cart[req.params.id];
    res.redirect('/shop/viewCart');
});

router.post('/saveCart/:id', (req, res) => {
    
});

module.exports = router;