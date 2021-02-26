const UserSchema = require("../users/UserSchema");
const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const user = await userSchema.findById(decoded._id);
      req.user = user;

      next();
    } else {
      const err = new Error("unauthorized");
      next(err);
    }
  } catch (e) {
    console.log(e);
    const err = new Error("something is wrong");
    next(err);
  }
};

module.exports = { authorize };
