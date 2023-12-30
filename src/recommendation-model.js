const mongoose = require('mongoose');
let Schema = mongoose.Schema; 
let recommendationSchema = new Schema({
    _id:Object,
    restaurationId: String,
    slogan: String,
    link: String,
    promotionDay: String
});
module.exports = mongoose.model('recommendations', recommendationSchema);