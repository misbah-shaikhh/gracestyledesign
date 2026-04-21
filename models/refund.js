const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request"
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },

    amount: {
        type: Number,
        required: true
    },

    method: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },

    status: {
        type: String,
        enum: ["Pending", "Processed"],
        default: "Pending"
    },

    refundDate: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model("Refund", refundSchema);