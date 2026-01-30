import { Request, Response } from 'express';
import { async_error_handler } from '../../common/utils/async_error_handler';
import { apiResponse, apiDataResponse } from '../../common/utils/api_response';
import { MESSAGES } from '../../common/utils/messages';
import { ORGANIZATION_MODULE_MODEL } from '../../common/schemas/PlatformModules/organization_module.schema';

interface CustomRequest extends Request {
    user?: any;
    validatedBody?: any;
}
const createOrganizationModuleAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { } = req.body
    const module = await ORGANIZATION_MODULE_MODEL.create({
        ...req.body,
        created_by: req.user?.user_id
    });
    res.status(201).json(apiDataResponse(201, MESSAGES.SUCCESS, module));
});

const getOrganizationModuleByIdAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { moduleId } = req.params;
    const module = await ORGANIZATION_MODULE_MODEL.findOne({ _id: moduleId, is_deleted: false });
    if (!module) {
        res.status(404).json(apiResponse(404, "Module not found"));
        return;
    }
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, module));
});

const listOrganizationModulesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const organization_id = req.query.organization_id as string | undefined;

    const query: any = { is_deleted: false };
    if (organization_id) query.organization_id = organization_id;

    const modules = await ORGANIZATION_MODULE_MODEL.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await ORGANIZATION_MODULE_MODEL.countDocuments(query);
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, { data: modules, total, page, limit }));
});

const updateOrganizationModuleAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { moduleId } = req.params;
    const updated = await ORGANIZATION_MODULE_MODEL.findOneAndUpdate(
        { _id: moduleId, is_deleted: false },
        { ...req.body, updated_by: req.user?.user_id },
        { new: true }
    );
    if (!updated) {
        res.status(404).json(apiResponse(404, "Module not found"));
        return;
    }
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, updated));
});

export {
    createOrganizationModuleAPIHandler,
    getOrganizationModuleByIdAPIHandler,
    listOrganizationModulesAPIHandler,
    updateOrganizationModuleAPIHandler
};
