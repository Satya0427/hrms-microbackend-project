const ImageKit = require('imagekit');
const { env } = require("../../config/env")


const imagekit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URLENDPOINT
});

module.exports = { imagekit }