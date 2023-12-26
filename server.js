const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const Restauration = require("./restauration-model.js");
const Menu = require('./menu-model.js');
const Filter = require('./filter-model.js');
const User = require('./user-model.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {body, validationResult} = require('express-validator');

const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.set('trust proxy', 1);
app.set('views', './public');
app.set("view engine", "pug");
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use('images', express.static(path.join(__dirname, '/public/images')));

app.use(session({
    secret: 'password',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get('/', (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    res.render('index');
});

app.get('/filter', async (req, res) => {
    let foodType = req.query.foodType;
    const rest = await Restauration.find({type: foodType});
    const data = await Filter.find();
    res.render('restaurations', {filters: data, restaurations: rest});
})

app.get('/restaurations', async (req, res) => {
    const rest = await Restauration.find();
    const data = await Filter.find();
    res.render('restaurations', {filters: data, restaurations: rest});
});

app.get('/order', (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    let rID = req.query.r;
    Menu.find({restaurant_id: rID}).then((data) => {
        Restauration.findOne({_id: new ObjectId(rID)}).then((rest) => {
            res.render('order', {menu: data, restauration: rest});
        });
    });
});

app.get('/conf', async (req, res) => {
    await mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    let rID = req.query.r;
    let fID = req.query.f;
    try {
        let data = await Menu.find({restaurant_id: rID});
        let rest = await Restauration.findOne({_id: new ObjectId(rID)});
        let food = await Menu.findOne({_id: new ObjectId(fID)});
        res.render('order', {menu: data, restauration: rest, dish: food});
    } catch (error) {
        console.error(error);
    }
});

const registerFormValidationRules = () => {
    return [
        body('firstName').isLength({min: 2}).trim().withMessage('Imię musi zawierać przynajmniej 2 znaki.'),
        body('lastName').isLength({min: 2}).trim().withMessage('Nazwisko musi zawierać przynajmniej 2 znaki.'),
        body('email').isEmail().trim().withMessage('Proszę podać prawidłowy adres e-mail.'),
        body('password').isLength({min: 8}).withMessage('Hasło musi zawierać co najmniej 8 znaków.'),
        body('rPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Hasła się nie zgadzają.');
            }
            return true;
        }),
        body('adressCity').notEmpty().trim().withMessage('Proszę podać miejscowość.'),
        body('adressStreet').notEmpty().trim().withMessage('Proszę podać ulicę.'),
        body('adressNumber').notEmpty().trim().withMessage('Proszę podać numer budynku.'),
        body('adressLocal').optional()
    ];
};

const validateRegister = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const {firstName, lastName, email, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
        let extractedErrors = {};
        errors.array().map(error => extractedErrors[error.path] = error.msg);
        console.log(extractedErrors);
        return res.render('register', {
            errors: extractedErrors,
            values: {firstName, lastName, email, adressCity, adressStreet, adressNumber, adressLocal},
        });

    }
    next();
};

app.post('/register', registerFormValidationRules(), validateRegister, (req, res) => {
    const {firstName, lastName, email, password, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        adressCity: adressCity,
        adressStreet: adressStreet,
        adressNumber: adressNumber,
        adressLocal: adressLocal ? adressLocal : ''
    });
    user.save();
    res.send("Zarejestrowano!");
});

app.post('/conf', (req, res) => {
    let cart;

    if (req.cookies['cart']) {
        if (typeof req.cookies['cart'] === 'string') {
            try {
                cart = JSON.parse(req.cookies['cart']);
            } catch (e) {
                console.error('Parsing error:', e);
                cart = [];
            }
        } else {
            cart = req.cookies['cart'];
        }
    } else {
        cart = [];
    }

    let newOrderItem = {
        restaurationId: req.query.r,
        foodId: req.query.f,
        sauce: req.body.sauceRadio,
        meat: req.body.meatRadio
    };

    cart.push(newOrderItem);

    let options = {
        maxAge: 1000 * 60 * 3600,
        httpOnly: true,
        signed: false
    };

    res.cookie('cart', JSON.stringify(cart), options);
    res.render('index')
});

app.get('/cart', async(req, res) => {
    let cart = JSON.parse(req.cookies.cart);
    const itemsWithNames = await Promise.all(cart.map(async item => {
        const order = await Menu.findOne({_id: new ObjectId(item.foodId)}).populate('name'); // zakładając, że 'name' to pole w Twoim modelu Order, które zawiera nazwę dania
        const restaurant = await Restauration.findOne({_id: new ObjectId(item.restaurationId)}).populate('name'); // zakładając, że 'name' to pole w Twoim modelu Restaurant, które zawiera nazwę restauracji
        return {
            foodId: order.name,
            restaurationId: restaurant.name,
            sauce: item.sauce,
            meat: item.meat,
            price: order.price
        };
    }));
    console.log(itemsWithNames);
    res.render('cart', {cart: itemsWithNames });
});

app.get('/account', (req, res) => {
    res.render('register', {errors: [], values: {}});
});

app.listen(3000);