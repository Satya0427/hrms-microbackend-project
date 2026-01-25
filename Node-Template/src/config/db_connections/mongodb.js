const mongoose = require("mongoose");
const { env } = require("../env");
const logger = require("../logger")



async function server_connection() {
    await mongoose.connect(env.MONGO_URI).then(() => {
        console.log('Database is connected successfully');
        logger.info("Database is connected successfully");
    }).catch(() => {
        console.log("Database connection failed");
        logger.error("Database connection failed");
        
    })
}

module.exports = { server_connection }