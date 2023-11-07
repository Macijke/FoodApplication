const mongoose = require('mongoose');
var Schema = mongoose.Schema; 
var restaurationSchema = new Schema({
    _id:Object,
    name:String,
    type:Array
});
module.exports = mongoose.model('restaurations', restaurationSchema);