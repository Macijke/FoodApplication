const mongoose = require('mongoose');
let Schema = mongoose.Schema; 
let userSchema = new Schema({
    _id:Object,
    firstName:String,
    lastName:String,
    email:String,
    password:String,
    adressCity:String,
    adressStreet:String,
    adressNumber:String,
    adressLocal:Number
});
module.exports = mongoose.model('users', userSchema);