const mongoose = require('mongoose');
let Schema = mongoose.Schema; 
let filterSchema = new Schema({
    _id:Object,
    name:String,
    visibleName:String,
    icon:String
});
module.exports = mongoose.model('filters', filterSchema);