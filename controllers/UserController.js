import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export function registerUser(req, res) {

    const data = req.body;
    data.password = bcrypt.hashSync(data.password, 10)


    const newUser = new User(data)



    newUser.save().then(() => {

        res.json({ message: "User registered successfully" })

    }).catch((error) => {
        res.status(500).json(({ error: "User registration failed" }))
    })

}

export function loginUser(req, res) {
    const data = req.body;

    User.findOne({
        email: data.email
    }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({ error: "User not found" })
            } else {
                if (user.isBlocked) {
                    res.status(403).json({ error: "User account is blocked.Please contact the admin" });
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);

                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        phoneNumber: user.phone,

                    }, process.env.JWT_SECRET)

                    res.json({ message: "Login Successful", token: token, user: user });
                } else {
                    res.status(401).json({ error: "login failed" });
                }

            }


        }

    )
}

export function isItAdmin(req) {
    let isAdmin = false;

    if (req.user != null) {
        if (req.user.role == "admin") {
            isAdmin = true;
        }
    }
    return isAdmin;
}

export function isItCustomer(req) {
    let isCustomer = false;

    if (req.user != null) {
        if (req.user.role == "customer") {
            isCustomer = true;
        }
    }
    return isCustomer;
}

export async function getAllUsers(req, res) {
    if (isItAdmin(req)) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (e) {
            res.status(500).json({ error: "Failed to get users" })
        }
    } else {
        res.status(403).json({ error: "Unauthorized" })
    }
}



export async function blockOrUnblockUser(req, res) {
    const email = req.params.email;
    if (isItAdmin(req)) {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const newStatus = !user.isBlocked;
            user.isBlocked = newStatus;
            await user.save();

            res.json({
                message: `User ${newStatus ? 'blocked' : 'unblocked'} successfully`,
                updatedUser: user
            });
        } catch (e) {
            res.status(500).json({ error: "Failed to update user status" });
        }
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
}

