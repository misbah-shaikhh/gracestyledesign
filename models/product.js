const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: String,
    name: String,

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    originalPrice: Number,
    discountPercentage: Number,
    discountedPrice: Number,
    totalStock: Number,

    images: [String],

    description: {
        material: String,
        neckType: String,
        sleeveType: String,
        countryOfOrigin: String
    },

    variants: [
        {
            color: String,
            size: String,
            stock: Number
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);