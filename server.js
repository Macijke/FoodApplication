const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Restauration = require("./restauration-model.js");
const pug = require("pug");
const app = express();
var variable;
app.set("view engine", "pug");
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.get('/restaurations', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/restaurations.html"));

    var bookStore = [
        {
            title: "Templating with Pug",
            author: "Winston Smith",
            pages: 143,
            year: 2017        
        },
        {
            title: "Node.js will help",
            author: "Guy Fake",
            pages: 879,
            year: 2015        
        }
    ];
    res.render("restaurations", {
        bookStore: bookStore
    });
    mongoose.connect("mongodb://localhost/foodApplication");
    Restauration.find().then((data) => {
        
    })
});

app.listen(3000);