const { Schema, model } = require("mongoose");
const Bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 1024,
    },
    refreshTokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// comparing the passwords
UserSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });

  // if user is found, compare the passwords
  if (user) {
    const isMatch = await Bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

// Modify anything i receive in the db, at every res.send()
// .methods is a mongoose method that allows to create custom functions
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

// hash the password.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = Bcrypt.hashSync(this.password, 10);
  next();
});

module.exports = model("user", UserSchema);
