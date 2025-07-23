import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import bodyParser from "body-parser"
import cors from "cors"

dotenv.config()

const app = express()
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    let token = req.header
        ("Authorization");



    if (token != null) {
        token = token.replace("Bearer", "").trim();

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;


            }

        });



    }
    next()

});

let mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)

const connection = mongoose.connection
connection.once("open", () => {
    console.log("MongoDB connection established successfully")
})

app.listen(3000, () => {
    console.log("server is running on port 3000")
})









app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);