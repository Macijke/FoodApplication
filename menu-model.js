const mongoose = require('mongoose');
let Schema = mongoose.Schema; 
let menuSchema = new Schema({
    _id:Object,
    restaurant_id:String,
    item_id:String,
    name:String,
    type:Array,
    price:Number,
    sauces: Array,
    meat: Array,
    products:Array,
    images:String
});
module.exports = mongoose.model('menu', menuSchema);