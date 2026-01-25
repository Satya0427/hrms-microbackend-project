
// Module Imports
const { env } = require("../../config/env");
const logger = require("../../config/logger");
const { apiResponse } = require("../utils/api_response");
const { MESSAGES } = require("../utils/messages");
const JWT = require("jsonwebtoken");
const { verifyRefreshToken } = require("../utils/token_methods");
const { isRefreshTokenInRedis } = require("../../config/db_connections/redisDb");

const wrongRouteErrorCatch = (req, res) => {
    const sts = 404;
    const msg = `Can't find ${req.method}: ${req.originalUrl} on the server`;
    res.status(sts).json(apiResponse(sts, msg))
}

const globalErrorCatch = (error, req, res, _) => {
    console.log('In Global error handler', error);
    let sts = 500;
    let msg = `Internal Server error`
    if (error?.type === 'entity.parse.failed') {
        sts = 400;
        msg = "Request payload error";
    } else if (error['cause']?.code == 11000) {
        sts = 404;
        msg = error.message
    } else if (error.name === "ValidationError") {
        const firstError = Object.values(error.errors)[0];
        sts = 404;
        msg = firstError.message;
    }
    res.status(sts).json(apiResponse(sts, msg));
    logger.error({ sts, msg });
}

// Access token validate
function accessTokenValidatorMiddleware(req, res, next) {
    try {
        let authorization  = req.headers['authorization'];
        if (!authorization) {
            return res.status(400).json(apiResponse(401, MESSAGES.AUTHORIZATION_HEADER_MISSING));
        }

        let access_token = authorization.split(' ')[1];
        if (!access_token) {
            return res.status(400).json(apiResponse(401, MESSAGES.ACCESS_TOKEN_MISSING));
        }

        /* Check if Access-Token is Valid */
        JWT.verify(access_token, env.ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err) {
                logger.error('Error verifying access-token JWT', { error: err });
                return res.status(401).json(apiResponse(401, MESSAGES.ACCESS_TOKEN_INVALID));
            }
            req.user = payload;
            next();
        });
    } catch (error) {
        logger.error('Error in Catch of accessTokenValidatorMiddleware', { error });
        next(new Error(MESSAGES.INTERNAL_SERVER_ERROR));
    }
}

/* Refresh-Token Authorization Middleware */
function refreshTokenValidatorMiddleware(req, res, next) {
    try {
        const refresh_token = req.cookies?.['refreshToken'] || req.body?.refreshToken;
        if (!refresh_token) {
            return res.status(401).json(apiResponse(400, MESSAGES.REFRESH_TOKEN_REQUIRED));
        }

        /* Check if Refresh-Token is Valid */
        JWT.verify(refresh_token, env.REFRESH_TOKEN_SECRET, async (err, payload) => {
            if (err) {
                logger.error('Error verifying refresh-token JWT', { error: err });
                return res.status(401).json(apiResponse(401, MESSAGES.REFRESH_TOKEN_INVALID));
            }
            req.user = payload;

            /* Check Session in MongoDB */
            const is_valid = isRefreshTokenInRedis(payload.userId,payload.session_id,refresh_token );
            if (!is_valid) {
                logger.error('Session not found in MongoDB', { user_id: req.user.id });
                return res.status(401).json(apiResponse(401, MESSAGES.REFRESH_TOKEN_INVALID));
            }

            next();
        });
    } catch (error) {
        logger.error('Error in Catch of refreshTokenValidatorMiddleware', { error });
        next(new Error(MESSAGES.INTERNAL_SERVER_ERROR));
    }
}





module.exports = { wrongRouteErrorCatch, globalErrorCatch, accessTokenValidatorMiddleware, refreshTokenValidatorMiddleware }