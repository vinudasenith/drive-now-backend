import express from "express"
import { registerUser, loginUser } from "../controllers/UserController.js"

const userRouter = express.Router()

userRouter.post("/", registerUser);
userRouter.post("/login", loginUser)






export default userRouter