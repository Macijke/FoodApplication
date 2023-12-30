const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const Restauration = require("./src/restauration-model.js");
const Menu = require('./src/menu-model.js');
const Filter = require('./src/filter-model.js');
const User = require('./src/user-model.js');
const Order = require('./src/order-model.js');
const Recommendation = require('./src/recommendation-model.js');
const {validateRegister, registerFormValidationRules} = require('./src/validation.js');
const DateFormatted = require('./src/date-format.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ObjectId = mongoose.Types.ObjectId;
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('trust proxy', 1);
app.set('views', './public');
app.set("view engine", "pug");
app.use(express.json());
app.use(express.static(path.join(__dirname + '/public')));
app.use('images', express.static(path.join(__dirname, '/public/images')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(session({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get('/', async (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    const recommendations =  await Recommendation.findOne({promotionDay: new Date().getDay()})
    var parsed = JSON.parse(JSON.stringify(recommendations));
    res.render('index', {recommendations: parsed});
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

app.get('/signup', (req, res) => {
    res.render('register', {errors: [], values: {}});
});

app.post('/signup', registerFormValidationRules(), validateRegister, (req, res) => {
    const {firstName, lastName, email, password, adressCity, adressStreet, adressNumber, adressLocal} = req.body;
    const user = new User({
        _id: new ObjectId(),
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
    res.redirect('/cart')
});

app.get('/cart', async (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    if (req.cookies.cart) {
        let userSession = null;
        if (req.session.user) {
            console.log(req.session.user)
            userSession = req.session.user;
        }
        let cartData = JSON.parse(req.cookies.cart);
        const itemsDetails = await Promise.all(cartData.map(async itemData => {
            const foodOrder = await Menu.findOne({_id: new ObjectId(itemData.foodId)}).populate('name');
            const restro = await Restauration.findOne({_id: new ObjectId(itemData.restaurationId)}).populate('name');
            return {
                foodId: foodOrder.name,
                restaurationId: restro.name,
                sauce: itemData.sauce,
                meat: itemData.meat,
                price: foodOrder.price,
                images: foodOrder.images
            };
        }));
        res.render('cart', {cart: itemsDetails, JSONCart: req.cookies.cart, user: userSession});
    } else {
        res.render('cart', {cart: null, JSONCart: null, user: userSession});
    }
});


app.get('/account', async (req, res) => {
    if (!req.session.user) {
        return res.render('login', {errors: [], values: {}, orders: null});
    }

    try {
        let orders = await Order.find({userId: req.session.user._id});
        let parsed = JSON.parse(JSON.stringify(orders));

        const ordersMap = await Promise.all(parsed.map(async order => {
            const itemsMap = await Promise.all(order.items.map(async item => {
                const foodOrder = await Menu.findOne({_id: new ObjectId(item.foodId)}).populate('name');
                const restro = await Restauration.findOne({_id: new ObjectId(item.restaurationId)}).populate('name');

                return {
                    foodId: foodOrder.name,
                    restaurationId: restro.name,
                    sauce: item.sauce,
                    meat: item.meat,
                    price: foodOrder.price,
                    dataZam: item.date
                };
            }));

            return {
                itemsMap,
                dataZam: order.date
            };
        }));

        res.render('account', {user: req.session.user, orders: ordersMap});
    } catch (e) {
        console.log(e);
    }
});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.render('login', {error: true});
    }

    try {
        const user = await User.findOne({email});

        if (!user || user.password !== password) {
            return res.render('login', {error: true});
        }
        req.session.user = user;
        res.redirect('/account');
    } catch (err) {
        console.log(err);
    }
});

app.post('/makeOrder', async (req, res) => {
    const order = JSON.parse(req.body.bodyCart);
    if (!req.session.user || !req.session.user._id) {
        return res.status(401).send('Brak autoryzacji'); //TODO: CHANGE
    }

    try {
        const items = order.map(item => ({
            restaurationId: item.restaurationId,
            foodId: item.foodId,
            sauce: item.sauce,
            meat: item.meat,
            price: item.price
        }));

        const orderDB = new Order({
            _id: new ObjectId(),
            userId: req.session.user._id,
            items: items,
            date: DateFormatted
        });
        await orderDB.save();

    } catch (error) {
        console.error(error);
        return res.status(500).send('Błąd przy zapisie zamówienia');
    }

    res.cookie('cart', null, {maxAge: 1000 * 60 * -3600});
    res.redirect('/');
});

app.get('/history', (req, res) => {

});

app.get('/logout', (req, res) => {
    console.log(req.session);
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

app.listen(3000);