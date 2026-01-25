const JWT = require("jsonwebtoken");
const { env } = require("../../config/env")



// #region AccessToken
// Access Token Generation
async function generateAccessToken(user_id, session_id) {
    const accessToken = await JWT.sign(
        {
            user_id: user_id || '',
            session_id
        },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES });
    return accessToken
}

// Verify the Access Token
const verifyAccessToken = (token) => {
    try {
        return JWT.verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return err;
    }
}

// #endregion Access Token

// #region the Refresh Token
const generateRefreshToken = async (user_id, session_id) => {
    const refreshToken = await JWT.sign(
        {
            user_id,
            session_id
        },
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
    );
    return refreshToken
}

const verifyRefreshToken = async (token) => {
    try {
        return JWT.verify(token, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return err;
    }
}

// #endregion Refresh Token




module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}