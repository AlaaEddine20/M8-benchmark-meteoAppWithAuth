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
    console.log(error);
    next(error);
  }
});

// login
userRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findByCredentials(username, password);

    // validate login and create new JWT token
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    // create the refresh token with longer lifespan
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH, {
      expiresIn: "1w",
    });

    // store refresh topken in user's token array
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// logout
userRouter.post("/logout", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.body.refreshToken
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// generate new refresh token when old one expires or user logs out
userRouter.get("/refreshToken", async (req, res, next) => {
  try {
    const oldRefreshToken = req.body.oldRefreshToken;
    const decodedRefresh = await jwt.verify(
      oldRefreshToken,
      process.env.JWT_REFRESH
    );

    if (decodedRefresh) {
      const user = await UserSchema.findById(decodedRefresh._id);
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== oldRefreshToken
      );
      const accessToken = await jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "15 mins" }
      );
      const refreshToken = await jwt.sign(
        { _id: user._id },
        process.env.JWT_REFRESH,
        { expiresIn: "1 week" }
      );
      user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });

      await user.save();

      res.send({ refreshToken, accessToken });
    } else {
      const error = new Error("Something wrong in refresh token");
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// allow user to access content
userRouter.get("/", authorize, async (req, res, next) => {
  try {
    const users = await UserSchema.find();
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = userRouter;
