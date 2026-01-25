const bcrypt = require("bcrypt");
const { env } = require("../../config/env");

/* Encrypt/Hah Password */
async function encryptPassword(password) {
    try {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    } catch (error) {
        logger.error('Error in Catch of encryptPassword()', { error });
        throw new Error(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

/* Compare Password Hash */
async function verifyPassword(input_password, encrypted_password) {
    try {
        const isMatch = await bcrypt.compare(input_password, encrypted_password);
        return isMatch ? true : false;
        
    } catch (error) {
        logger.log('Error in Catch of verifyPassword()', { error });
        throw new Error(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}


module.exports = { encryptPassword, verifyPassword }