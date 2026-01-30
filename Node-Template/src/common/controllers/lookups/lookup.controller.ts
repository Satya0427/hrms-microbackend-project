import { Request, Response } from 'express';
import { async_error_handler } from '../../utils/async_error_handler';
import { apiDataResponse } from '../../utils/api_response';
import { MESSAGES } from '../../utils/messages';
import { ORGANIZATION_MODEL } from '../../schemas/Organizations/organization.schema';
import { safeValidate } from '../../utils/validation_middleware';
import { organizationsDropdownSchema } from './lookup.validator';

interface CustomRequest extends Request {
    user?: any;
    validatedBody?: any;
}

//  GET ORGANIZATIONS FOR DROPDOWN (Without Pagination)
const getOrganizationsDropdownAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(organizationsDropdownSchema, req.body);
    if (!validation.success) {
        res.status(400).json(
            apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message)
        );
        return;
    }
    const { search_key } = validation.data || {};
    const query: any = { is_deleted: false, is_active: true };
    if (search_key) {
        query.$or = [
            { 'organization.organization_name': { $regex: search_key, $options: "i" } }
        ];
    }

    // Get only organization_name and _id fields
    const organizations = await ORGANIZATION_MODEL.find(query)
        .select('organization._id organization.organization_name _id')
        .sort({ 'organization.organization_name': 1 })
        .lean();
    const dropdownData = organizations.map(org => ({
        org_id: org._id,
        org_name: org.organization.organization_name
    }));

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, dropdownData));
});

export {
    getOrganizationsDropdownAPIHandler
};
