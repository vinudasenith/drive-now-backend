import express from "express";
import { getReviews, addReview, approveReview, deleteReviews } from "../controllers/reviewController.js";


const reviewRouter = express.Router()

reviewRouter.get("/", getReviews)
reviewRouter.post("/", addReview)
reviewRouter.put("/approve/:email", approveReview)
reviewRouter.delete("/delete/:email", deleteReviews)

export default reviewRouter


