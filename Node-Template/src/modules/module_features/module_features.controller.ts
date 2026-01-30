import { Request, Response } from 'express';
import { async_error_handler } from '../../common/utils/async_error_handler';
import { apiResponse, apiDataResponse } from '../../common/utils/api_response';
import { MESSAGES } from '../../common/utils/messages';
import { MODULE_FEATURES_MODEL } from '../../common/schemas/PlatformModules/module_features.schema';
import { safeValidate } from '../../common/utils/validation_middleware';
import {
    createModuleFeaturesSchema,
    getModuleFeaturesSchema,
    listModuleFeaturesSchema,
    updateModuleFeaturesSchema,
    CreateModuleFeaturesInput,
    UpdateModuleFeaturesInput
} from './module_features.validatior';
import mongoose, { Types } from 'mongoose';

interface CustomRequest extends Request {
    user?: {
        user_id: string;
        session_id: string;
    };
}

const buildModuleFeaturesPayload = (
    data: CreateModuleFeaturesInput,
    userId?: string
) => {
    return {
        module_name: data.body.module_name,
        module_code: data.body.module_code,
        description: data.body.description,
        icon: data.body.icon,
        active: data.body.active,

        features: data.body.features.map(feature => ({
            name: feature.name,
            code: feature.code,
            route_path: feature.route_path,
            active: feature.active
        })),

        is_deleted: false,
        created_by: userId
            ? new mongoose.Types.ObjectId(userId)
            : undefined
    };
};


//   CREATE MODULE FEATURES
const createModuleFeaturesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(createModuleFeaturesSchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
    }
    const validatedData = validation.data as CreateModuleFeaturesInput;
    const existingModule = await MODULE_FEATURES_MODEL.findOne({
        module_code: validatedData.body.module_code,
        is_deleted: false
    });
    if (existingModule) {
        res.status(400).json(apiDataResponse(400, 'Module code already exists', null));
    }
    const payload = buildModuleFeaturesPayload(
        validatedData,
        req.user?.user_id
    );
    const moduleFeatures = await MODULE_FEATURES_MODEL.create(payload);
    res.status(201).json(apiDataResponse(201, MESSAGES.SUCCESS, moduleFeatures));
}
);


/**
 * GET MODULE FEATURES BY ID
 */
const getModuleFeaturesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    // Validate params
    const validation = safeValidate(getModuleFeaturesSchema, req.params);

    if (!validation.success) {
        res.status(400).json(
            apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message)
        );
        return;
    }

    const { moduleId } = validation.data || { moduleId: '' };

    const moduleFeatures = await MODULE_FEATURES_MODEL.findOne({
        _id: moduleId,
        is_deleted: false
    });

    if (!moduleFeatures) {
        res.status(404).json(apiResponse(404, "Module features not found"));
        return;
    }

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, moduleFeatures));
});

/**
 * LIST MODULE FEATURES (Pagination + Filters)
 */
const listModuleFeaturesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {

    const modules = await MODULE_FEATURES_MODEL
        .find({ is_deleted: false })
        .sort({ createdAt: 1 }) // keeps order stable
        .lean(); // returns plain JSON
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, modules));
}
);

/**
 * UPDATE MODULE FEATURES
 */
const updateModuleFeaturesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    // Validate params and body
    const validation = safeValidate(updateModuleFeaturesSchema, {
        moduleId: req.params.moduleId,
        ...req.body
    });

    if (!validation.success) {
        res.status(400).json(
            apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message)
        );
        return;
    }

    const { moduleId, ...updateData } = validation.data || { moduleId: '' };
    const validatedData = updateData as UpdateModuleFeaturesInput;

    // Check if trying to update module_code and if it already exists
    if (validatedData.module_code) {
        const existingModule = await MODULE_FEATURES_MODEL.findOne({
            module_code: validatedData.module_code,
            _id: { $ne: moduleId },
            is_deleted: false
        });

        if (existingModule) {
            res.status(400).json(apiDataResponse(400, 'Module code already exists', null));
            return;
        }
    }

    const updatedModule = await MODULE_FEATURES_MODEL.findOneAndUpdate(
        { _id: moduleId, is_deleted: false },
        { ...validatedData, updated_by: req.user?.user_id },
        { new: true, runValidators: true }
    );

    if (!updatedModule) {
        res.status(404).json(apiResponse(404, "Module features not found"));
        return;
    }

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, updatedModule));
});

/**
 * DELETE MODULE FEATURES (Soft Delete)
 */
const deleteModuleFeaturesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    // Validate params
    const validation = safeValidate(getModuleFeaturesSchema, req.params);

    if (!validation.success) {
        res.status(400).json(
            apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message)
        );
        return;
    }

    const { moduleId } = validation.data || { moduleId: '' };

    const deletedModule = await MODULE_FEATURES_MODEL.findOneAndUpdate(
        { _id: moduleId, is_deleted: false },
        { is_deleted: true, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!deletedModule) {
        res.status(404).json(apiResponse(404, "Module features not found"));
        return;
    }

    res.status(200).json(apiDataResponse(200, 'Module features deleted successfully', deletedModule));
});

export {
    createModuleFeaturesAPIHandler,
    getModuleFeaturesAPIHandler,
    listModuleFeaturesAPIHandler,
    updateModuleFeaturesAPIHandler,
    deleteModuleFeaturesAPIHandler
};
