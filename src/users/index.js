const express = require("express");
const { authorize } = require("../middlewares/authorize");
const UserSchema = require("./UserSchema");
// const { authenticate, refreshToken } = require("../middlewares/authenticate");
const jwt = require("jsonwebtoken");

const userRouter = express.Router();

// login --> check credentials --> generate token with user.id --> return accessToken

// sign up
userRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = UserSchema(req.body);
    const { _id } = await newUser.save();
    res.status(200).send(_id);
  } catch (error) {
    next(error);
  }
});

// login
userRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findByCredentials(username, password);

    // validate login and create new JWT token
    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    // create the refresh token with longer lifespan
    const refreshToken = await jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH,
      { expiresIn: "1w" }
    );

    // store refresh topken in user's token array
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

module.exports = userRouter;
