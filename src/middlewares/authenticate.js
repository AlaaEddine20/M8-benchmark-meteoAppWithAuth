const user = require("./../users/UserSchema");

const authenticate = async (user) => {
  try {
    const accessToken = await generateAccessToken({ _id: user._id });
    const refreshToken = await generateRefreshToken({ _id: user._id });

    //insert refresh token in user's property array "refreshTokens"
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });

    await user.save(); // save the refresh token

    return { token: accessToken, refreshToken: refreshToken };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = { authenticate };
