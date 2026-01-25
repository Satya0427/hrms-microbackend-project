const app = require("express")
const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts")
const { getImagesHandler } = require("../gallery/gallery.controller")


const gallery_route = app.Router();

gallery_route.post('/view_images', accessTokenValidatorMiddleware, getImagesHandler);
// gallery_route.post('/upload_images')

module.exports = { gallery_route }