import bcrypt from 'bcrypt';
import logger from '../../config/logger';
import { MESSAGES } from './messages';
import { LOOKUP_MODEL } from '../schemas/lookups/lookup.schema';

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

const getLookupsByCategory = async (req: any, res: any) => {
    const { category_code } = req.params;
    const organization_id = req.user?.organization_id; // optional

    const lookups = await LOOKUP_MODEL.find({
        category_code: category_code.toUpperCase(),
        is_active: true,
        is_deleted: false,
        $or: [
            { scope: "PLATFORM" },
            {
                scope: "ORGANIZATION",
                organization_id
            }
        ]
    })
        .sort({ sort_order: 1 })
        .select("lookup_key lookup_value -_id");

    res.status(200).json({
        success: true,
        data: lookups
    });
};


export { encryptPassword, verifyPassword, getLookupsByCategory};
