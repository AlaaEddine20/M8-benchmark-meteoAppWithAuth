const UserSchema = require("../users/UserSchema");
const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (error, verifiedJWT) => {
      if (error) {
        res.send(error.message);
      } else {
        console.log(verifiedJWT);
        const user = UserSchema.findById(decoded._id);
        req.user = user;
        res.send(verifiedJWT);
      }
    });
  } catch (e) {
    const err = new Error("something is wrong");
    next(err);
  }
};

module.exports = { authorize };
