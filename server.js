const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const Restauration = require("./restauration-model.js");
const Menu = require('./menu-model.js');
const Filter = require('./filter-model.js');
const bodyParser = require('body-parser');

const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);
app.set('views', './public');
app.set("view engine", "pug");
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('images', express.static(path.join(__dirname,'/public/images')));

app.use(session({
    secret: 'password',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    res.render('index');
});

app.get('/filter', (req, res) => {
    let foodType = req.query.foodType;
    Restauration.find({type: foodType}).then((rest) => {
        Filter.find().then((data) => {
            res.render('restaurations', {filters: data, restaurations: rest});

        });
    });
})

app.get('/restaurations', (req, res) => {
    Restauration.find().then((rest) => {
        Filter.find().then((data) => {
            res.render('restaurations', {filters: data, restaurations: rest});
        });
    });
    
});

app.get('/order', (req, res) => {
    let rID = req.query.r;
    Menu.find({restaurant_id: rID}).then((data) => {
        Restauration.findOne({_id: new ObjectId(rID)}).then((rest) => {
            res.render('order', {menu: data, restauration: rest});
        });
    })
});

app.get('/conf', (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    console.log(req.session.cartOrder);
    let rID = req.query.r;
    let fID = req.query.f;
    Menu.find({restaurant_id: rID}).then((data) => {
        Restauration.findOne({_id: new ObjectId(rID)}).then((rest) => {
            Menu.findOne({_id: new ObjectId(fID)}).then((food) => {
                res.render('order', {menu: data, restauration: rest, dish: food});
            });
        });
    })
});

app.post('/conf', (req, res) => {
    req.session.cartOrder = {"sos" : req.body.sauceRadio, "mieso": req.body.meatRadio};
});

app.get('/account', (req, res) => {
    res.render('register');
});

app.listen(3000);