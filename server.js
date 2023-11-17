const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Restauration = require("./restauration-model.js");
const pug = require("pug");
const app = express();
app.set('views', './public');
app.set("view engine", "pug");
app.use(express.static(__dirname + '/public'));
app.use('images', express.static(path.join(__dirname,'/public/images')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.get('/filter', (req, res) => {
    let foodType = req.query.foodType;
    Restauration.find({type: foodType}).then((data) => {
        res.render('restaurations', {restaurations: data});
    });
})

app.get('/restaurations', (req, res) => {
    mongoose.connect("mongodb://127.0.0.1:27017/foodApplication");
    Restauration.find().then((data) => {
        res.render('restaurations', {restaurations: data});
        console.log(data);
    });
});

app.listen(3000);