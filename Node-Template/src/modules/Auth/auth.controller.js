
/* Importing Modules */
const { async_error_handler } = require("../../common/utils/async_error_handler");
const { apiResponse, apiDataResponse } = require("../../common/utils/api_response");
const { MESSAGES } = require("../../common/utils/messages");
const { USERS_SCHEMA } = require("../Users/user.schema");
const { verifyPassword } = require("../../common/utils/common");
const {
    storeTokens,
    deleteRefreshToken,
    revokeAllUserRefreshTokens,
    isRefreshTokenInRedis
} = require("../../config/db_connections/redisDb")


const cookieOptions = {
    httpOnly: true,
    secure: true,   //env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    credentials: true
};
const coockieName = 'refreshToken'

// Login API call
const loginAPIHandler = async_error_handler(async (req, res) => {
    let { email, password } = req.body;

    //Required Checking
    if (!email) return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.REQUIRED));
    if (!password) return res.status(400).json(apiResponse(400, MESSAGES.PASSWORD.REQUIRED));

    // Type Checking
    if (typeof email != 'string') return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.TYPE));
    if (typeof password != 'string') return res.status(400).json(apiResponse(400, MESSAGES.PASSWORD.TYPE));

    // Trimming all the keys values
    email = email.trim();
    password = password.trim();
    const userDetails = await USERS_SCHEMA.findOne({ email: email });
    if (!userDetails) return res.status(400).json(apiResponse(400, 'Please check UserID and Password'));
    const isPasswordMatch = await verifyPassword(password, userDetails?.password);
    if (!isPasswordMatch) return res.status(500).json(apiResponse(400, `Wrong Password`));
    const payload = {
        user_id: userDetails._id,
        email: userDetails.email,
        phone_number: userDetails.phone_number,
        address: userDetails.address,
        user_type: userDetails.user_type
    }
    const { accessToken, refreshToken } = await storeTokens(payload);
    res.cookie(coockieName, refreshToken, cookieOptions);
    res.status(200).json({ sts: 200, msg: MESSAGES.SUCCESS, token: { accessToken } });
});

// Refresh Token API Call
const refreshTokenApiHandler = async_error_handler(async (req, res) => {
    const userDetails = req.user
    await deleteRefreshToken(userDetails.user_id,userDetails.session_id);
    res.clearCookie(coockieName, cookieOptions);
    const { accessToken, refreshToken } = await storeTokens(userDetails)
    res.cookie(coockieName, refreshToken, cookieOptions);
    res.status(200).json({ sts: 200, msg: MESSAGES.SUCCESS, token: { accessToken } });
});

// Logout APi
const logoutApiHandler = async_error_handler(async (req, res) => {
    const refreshToken = req.cookies?.[coockieName] || req.body?.refreshToken;
    const userDetails = req.user
    if (!refreshToken) {
        res.clearCookie(coockieName, cookieOptions);
        return res.status(200).json({ message: 'Logged out' });
    }
    try {
        const isAvailableInRedis = await isRefreshTokenInRedis(userDetails.user_id, userDetails.session_id, refreshToken);
        if (isAvailableInRedis) {
            await deleteRefreshToken(userDetails.user_id, userDetails.session_id)
        }
    } catch (err) {
        res.clearCookie(coockieName, cookieOptions);
        return res.status(200).json({ message: 'Logged out' });
    }
    res.clearCookie(coockieName, cookieOptions);
    return res.status(200).json({ message: 'Logged out' });
});

// Logout All API 
const logoutAllApiHandler = async_error_handler(async (req, res) => {

})



module.exports = { loginAPIHandler, refreshTokenApiHandler, logoutApiHandler }