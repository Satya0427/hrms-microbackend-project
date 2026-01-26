const express = require("express");
const { userCreationApiHandler, userListAPIHandler } = require("./user.controller");
const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts")


const user_router = express.Router();

user_router.post('/creation', userCreationApiHandler);
user_router.post('/orginization-list', accessTokenValidatorMiddleware, userListAPIHandler)

module.exports = { orginization }