import Order from "../models/order.js";
import Product from "../models/product.js";
import { isItAdmin, isItCustomer } from "./userController.js";


// create order
export async function createOrder(req, res) {
    const data = req.body;
    const orderInfo = {
        orderedItems: [],
    };

    if (!req.user) {
        return res.status(401).json({ message: "Please login and try again" });
    }

    orderInfo.email = req.user.email;

    // Generate order ID
    const lastOrder = await Order.find().sort({ orderDate: -1 }).limit(1);
    if (lastOrder.length === 0) {
        orderInfo.orderId = "ORD0001";
    } else {
        const lastOrderNumber = parseInt(lastOrder[0].orderId.replace("ORD", ""));
        const currentOrderNumber = lastOrderNumber + 1;
        orderInfo.orderId = "ORD" + String(currentOrderNumber).padStart(4, "0");
    }

    let oneDayCost = 0;

    for (let i = 0; i < data.orderedItems.length; i++) {
        try {
            const item = data.orderedItems[i];
            const product = await Product.findOne({ key: item.key });

            if (!product) {
                return res.status(404).json({
                    message: `Product with key ${item.key} not found`,
                });
            }

            if (!product.isAvailable) {
                return res.status(400).json({
                    message: `Product with key ${item.key} is not available`,
                });
            }

            const quantity = Number(item.qty) || 1;
            const unitCost = product.dailyRate;

            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.model, // using 'model' as name
                    image: product.image[0],
                    price: unitCost // using 'dailyRate' as price
                },
                quantity
            });

            oneDayCost += unitCost * quantity;

        } catch (error) {
            console.error("Error fetching product:", error);
            return res.status(500).json({ message: "Failed to fetch product info" });
        }
    }

    orderInfo.days = Number(data.days);
    orderInfo.startingDate = new Date(data.startingDate);
    orderInfo.endingDate = new Date(data.endingDate);
    orderInfo.totalAmount = oneDayCost * orderInfo.days;

    try {
        const newOrder = new Order(orderInfo);
        const result = await newOrder.save();
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: result,
        });
    } catch (e) {
        console.error("Error saving order:", e);
        res.status(500).json({ message: "Failed to create order" });
    }
}


// get quote
export async function getQuote(req, res) {
    try {
        const { orderedItems, startingDate, endingDate } = req.body;


        if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one vehicle must be selected"
            });
        }


        const invalidItems = orderedItems.filter(item =>
            !item.key || typeof item.qty !== 'number' || item.qty <= 0
        );

        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid items in order",
                invalidItems
            });
        }


        const startDate = new Date(startingDate);
        const endDate = new Date(endingDate);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format (use YYYY-MM-DD)"
            });
        }

        if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }


        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (days <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid rental duration"
            });
        }


        const productKeys = orderedItems.map(item => item.key);
        const products = await Product.find({ key: { $in: productKeys } });


        const foundKeys = products.map(p => p.key);
        const missingProducts = orderedItems
            .filter(item => !foundKeys.includes(item.key))
            .map(item => item.key);

        if (missingProducts.length > 0) {
            return res.status(404).json({
                success: false,
                message: "Some vehicles not found",
                missingProducts
            });
        }


        const unavailableProducts = [];
        const productMap = products.reduce((map, product) => {
            map[product.key] = product;

            if (!product.isAvailable || product.rented) {
                unavailableProducts.push({
                    key: product.key,
                    model: product.model,
                    reason: product.rented ? "Currently rented" : "Not available"
                });
            }

            return map;
        }, {});

        if (unavailableProducts.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some vehicles are not available",
                unavailableProducts
            });
        }


        let oneDayCost = 0;
        let detailedItems = [];

        for (const item of orderedItems) {
            const product = productMap[item.key];
            const itemCost = product.dailyRate * item.qty;
            oneDayCost += itemCost;

            detailedItems.push({
                key: product.key,
                model: product.model,
                make: product.make,
                year: product.year,
                image: product.image[0],
                qty: item.qty,
                dailyRate: product.dailyRate,
                itemTotal: itemCost,
                totalForPeriod: itemCost * days
            });
        }

        const total = oneDayCost * days;


        res.json({
            success: true,
            message: "Quote calculated successfully",
            total,
            dailyRate: oneDayCost,
            days,
            detailedItems,
            currency: "LKR",
            validUntil: new Date(Date.now() + 30 * 60 * 1000),
            metadata: {
                vehicleCount: orderedItems.reduce((sum, item) => sum + item.qty, 0),
                rentalPeriod: {
                    start: startDate,
                    end: endDate
                }
            }
        });

    } catch (error) {
        console.error("Quote calculation error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while calculating quote",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}


// get orders
export async function getOrders(req, res) {

    if (isItCustomer(req)) {
        try {
            const orders = await Order.find({ email: req.user.email });
            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: "Failed to get orders" });
        }
    } else if (isItAdmin(req)) {
        try {
            const orders = await Order.find();
            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: "Failed to get orders" });
        }
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
}

// approve or reject order
export async function approveOrRejectOrder(req, res) {
    const orderId = req.params.orderId;
    const status = req.body.status;

    if (isItAdmin(req)) {
        try {
            const order = await Order.findOne(
                {
                    orderId: orderId
                }
            )

            if (order == null) {
                res.status(404).json({ error: "Order not found" });
                return;
            }

            await Order.updateOne(
                {
                    orderId: orderId
                },
                {
                    status: status
                }
            );

            res.json({ message: "Order approved/rejected successfully" });

        } catch (e) {
            res.status(500).json({ error: "Failed to get order" });
        }
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
}

