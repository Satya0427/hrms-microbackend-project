const express = require("express");

const { loginAPIHandler, refreshTokenApiHandler, logoutApiHandler } = require("../Auth/auth.controller")
const { refreshTokenValidatorMiddleware,accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts")
const auth_router = express.Router();


auth_router.post('/login', loginAPIHandler);
auth_router.get('/logout', accessTokenValidatorMiddleware, logoutApiHandler);
auth_router.get('/token_refresh',refreshTokenValidatorMiddleware, refreshTokenApiHandler);
module.exports = auth_router;