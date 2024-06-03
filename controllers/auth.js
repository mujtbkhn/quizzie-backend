const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User: user, User } = require("../models/user");

const registeredUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email or password missing"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ userId: newUser._id, name: newUser.name, email: newUser.email }, process.env.SECRET_KEY);

    res.json({
      message: "User created successfully",
      token
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ errors });
    }
    next(error);
  }
};

const loginUser = async (req, res, next) => {
    try {

        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message: "email or password is empty"
            })
        }
        const userDetails = await user.findOne({ email })
        if (!userDetails) {
            return res.status(400).json({
                message: "invalid email"
            })
        }
        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        )
        if (!passwordMatch) {
            return res.status(400).json({
                message: "password is incorrect"
            })
        }

        const token = jwt.sign({ userId: userDetails._id, name: userDetails.username, email: userDetails.email }, process.env.SECRET_KEY)
        res.json({
            message: "user logged in successfully",
            token: token
        })
    } catch (error) {
        next(error)
    }


}

module.exports = { registeredUser, loginUser }
