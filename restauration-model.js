const mongoose = require('mongoose');
var Schema = mongoose.Schema; 
var Restauration = mongoose.model("Restauration", new Schema({}), "restaurations"); 
module.exports = mongoose.model('restaurations', Restauration);