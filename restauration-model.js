const mongoose = require('mongoose');
let Schema = mongoose.Schema; 
let restaurationSchema = new Schema({
    _id:Object,
    name:String,
    type:Array,
    adress:Object,
    image:String
});
module.exports = mongoose.model('restaurations', restaurationSchema);