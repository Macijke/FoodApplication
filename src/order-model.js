const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    _id: Object,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: String,
    fullPrice: Number,
    items: [
        {
            restaurationId: {
                type: String,
                required: true
            },
            foodId: {
                type: String,
                required: true
            },
            sauce: String,
            meat: String,
            price: Number
        }
    ]
});

module.exports = mongoose.model('order', orderSchema);