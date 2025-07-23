import express from "express";
import { registerUser, loginUser, getAllUsers, blockOrUnblockUser } from "../controllers/userController.js";


const userRouter = express.Router()

userRouter.post("/", registerUser);
userRouter.post("/login", loginUser)
userRouter.get("/all", getAllUsers)
userRouter.put("/block/:email", blockOrUnblockUser)






export default userRouter