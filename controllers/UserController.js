import User from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


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