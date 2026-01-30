import bcrypt from 'bcrypt';
import logger from '../../config/logger';
import { MESSAGES } from './messages';

/* Encrypt/Hash Password */
async function encryptPassword(password: string): Promise<string> {
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        logger.error('Error in Catch of encryptPassword()', { error });
        throw new Error(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

/* Compare Password Hash */
async function verifyPassword(input_password: string, encrypted_password: string): Promise<boolean> {
    try {
        const isMatch = await bcrypt.compare(input_password, encrypted_password);
        return isMatch ? true : false;
    } catch (error) {
        logger.error('Error in Catch of verifyPassword()', { error });
        throw new Error(MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

export { encryptPassword, verifyPassword };
