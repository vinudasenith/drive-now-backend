import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    orderedItems: [
        {
            product: {
                key: { type: String, required: true },
                name: { type: String, required: true },
                image: { type: String, required: true },
                price: { type: Number, required: true }
            },
            quantity: { type: Number, required: true }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return !isNaN(v);
            },
            message: 'totalAmount must be a valid number.'
        }
    },
    days: {
        type: Number,
        required: true
    },
    startingDate: {
        type: Date,
        required: true
    },
    endingDate: {
        type: Date,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        required: true
    },
    status: {
        type: String,
        default: "Pending",
        required: true
    }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
