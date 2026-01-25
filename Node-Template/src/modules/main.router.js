const express = require("express")
// Modules Importing
const auth_router = require("./Auth/auth.router")
const { user_router } = require("./Users/user.router")
const {gallery_route} = require("./gallery/gallery.router")

const main_router = express.Router();



main_router.use('/auth', auth_router);
main_router.use('/user', user_router);
main_router.use('/gallery',gallery_route)

module.exports = main_router;