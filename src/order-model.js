const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
            meat: String
        }
    ]
});

module.exports = mongoose.model('order', orderSchema);