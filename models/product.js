import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    model: {
        type: String,
        required: true
    },
    make: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    image: {
        type: [String],
        required: true
    },
    dailyRate: {
        type: Number,
        required: true
    },
    availableQuantity: {
        type: Number,
        required: false
    },
    location: {
        type: String,
        required: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    transmission: {
        type: String,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    carType: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    rented: {
        type: Boolean,
        default: false
    }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
