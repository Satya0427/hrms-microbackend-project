const { apiDataResponse } = require("../../common/utils/api_response");
const { async_error_handler } = require("../../common/utils/async_error_handler");
const { MESSAGES } = require("../../common/utils/messages");
const { imagekit } = require("../../config/db_connections/imagekit");
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 50,            // max 50 images
        fileSize: 5 * 1024 * 1024 // 5MB per image
    }
});

// GET IMAGES FROM S3 BUCKET
const getImagesHandler = async_error_handler(async (req, res) => {
    const { skip_records } = req.body
    const result = await imagekit.listFiles({
        path: 10,
        limit: 5,
        skip: skip_records
    });
    const images = result.map((e) => ({
        imageName: e.name,
        imageUrl: e.url
    }))
    console.log(result);
    return res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, images))

});


// UPLOAD IMAGE TO S3 BUCKET
const uploadImagesHandler = async_error_handler(async (req, res) => {
    const { user_id } = req.body
    if (!req.files || !req.files.length) {
        return res.status(400).json(
            apiDataResponse(400, 'No images uploaded', null)
        );
    }

    // Upload all images in parallel
    const uploadResults = await Promise.all(
        req.files.map((file, index) =>
            imagekit.upload({
                file: file.buffer.toString('base64'),
                fileName: file.originalname,
                folder: user_id
            })
        )
    );
    const images = uploadResults.map((img) => ({
        imageName: img.name,
        imageUrl: img.url,
        fileId: img.fileId
    }));

    return res.status(201).json(
        apiDataResponse(201, 'Images uploaded successfully', images)
    );
});


module.exports = { getImagesHandler, uploadImagesHandler }
