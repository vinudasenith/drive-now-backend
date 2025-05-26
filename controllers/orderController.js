import Order from "../models/order.js";
import Product from "../models/product.js";
import { isItAdmin, isItCustomer } from "./userController.js";

export async function createOrder(req, res) {
    const data = req.body;
    const orderInfo = {
        orderedItems: [],
    };

    if (req.user == null) {
        res.status(401).json({
            message: "Please login and try again",
        });
        return;
    }
    orderInfo.email = req.user.email;

    const lastOrder = await Order.find().sort({ orderDate: -1 }).limit(1);

    if (lastOrder.length == 0) {
        orderInfo.orderId = "ORD0001";
    } else {
        const lastOrderId = lastOrder[0].orderId;
        const lastOrderNumberInString = lastOrderId.replace("ORD", "");
        const lastOrderNumber = parseInt(lastOrderNumberInString);
        const currentOrderNumber = lastOrderNumber + 1;
        const formattedNumber = String(currentOrderNumber).padStart(4, "0");
        orderInfo.orderId = "ORD" + formattedNumber;
    }
    let oneDayCost = 0;
    for (let i = 0; i < data.orderedItems.length; i++) {
        try {
            const product = await Product.findOne({ key: data.orderedItems[i].key });
            if (product == null) {
                res.status(404).json({
                    message:
                        "Product with key " + data.orderedItems[i].key + " not found",
                });
                return;
            }
            if (product.availability == false) {
                res.status(400).json({
                    message:
                        "Product with key " +
                        data.orderedItems[i].key +
                        " is not available",
                });
                return;
            }
            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price,
                },
                quantity: data.orderedItems[i].qty,
            });

            oneDayCost += product.price * data.orderedItems[i].qty;
        } catch (e) {
            res.status(500).json({
                message: "Failed to create order",
            });
            return;
        }
    }

    orderInfo.days = data.days;
    orderInfo.startingDate = data.startingDate;
    orderInfo.endingDate = data.endingDate;
    orderInfo.totalAmount = oneDayCost * data.days;
    try {
        const newOrder = new Order(orderInfo);
        const result = await newOrder.save();
        res.json({
            message: "Order created successfully",
            order: result,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Failed to create order",
        });
    }
}




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

