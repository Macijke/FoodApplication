const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.get('/restaurations', (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/restaurations.html"));

    mongoose.connect("mongodb://localhost/foodApplication"); 
    var Schema = mongoose.Schema; 
    var Restauration = mongoose.model("Restauration", new Schema({}), "restaurations"); 
    Restauration.find().then((data) => {
        console.log(data);
    })
});

app.listen(3000);