const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
    PLATFORM_MODULE_MODEL
} = require("../../common/schemas/PlatformModules/platform_module.schema");

const {
    validatePlatformModuleCreate
} = require("./platform_module.validator");

/**
 * CREATE PLATFORM MODULE
 */
const createPlatformModuleAPIHandler = async_error_handler(async (req, res) => {
    let {
        module_name,
        module_code,
        description,
        icon,
        route,
        display_order,
        module_type
    } = req.body;

    const validationErrors = validatePlatformModuleCreate(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
    }

    module_name = module_name.trim();
    module_code = module_code.trim().toUpperCase();

    const existingModule = await PLATFORM_MODULE_MODEL.findOne({
        module_code,
        is_deleted: false
    });

    if (existingModule) {
        return res
            .status(400)
            .json(apiResponse(400, "Platform module already exists"));
    }

    const module = await PLATFORM_MODULE_MODEL.create({
        module_name,
        module_code,
        description,
        icon,
        route,
        display_order,
        module_type,
        created_by: req.user?.user_id
    });

    return res
        .status(201)
        .json(apiResponse(201, MESSAGES.SUCCESS, module));
});

/**
 * GET MODULE BY ID
 */
const getPlatformModuleByIdAPIHandler = async_error_handler(async (req, res) => {
    const { moduleId } = req.params;

    const module = await PLATFORM_MODULE_MODEL.findOne({
        _id: moduleId,
        is_deleted: false
    });

    if (!module) {
        return res.status(404).json(apiResponse(404, "Platform module not found"));
    }

    return res.status(200).json(apiResponse(200, MESSAGES.SUCCESS, module));
});

/**
 * LIST PLATFORM MODULES
 */
const listPlatformModulesAPIHandler = async_error_handler(async (req, res) => {
    const { page = 1, limit = 10, is_active } = req.query;

    const query = { is_deleted: false };
    if (is_active !== undefined) query.is_active = is_active === "true";

    const modules = await PLATFORM_MODULE_MODEL.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ display_order: 1 });

    const total = await PLATFORM_MODULE_MODEL.countDocuments(query);

    return res.status(200).json(
        apiResponse(200, MESSAGES.SUCCESS, {
            data: modules,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    );
});

/**
 * UPDATE PLATFORM MODULE
 */
const updatePlatformModuleAPIHandler = async_error_handler(async (req, res) => {
    const { moduleId } = req.params;

    const updatedModule = await PLATFORM_MODULE_MODEL.findOneAndUpdate(
        { _id: moduleId, is_deleted: false },
        { ...req.body, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedModule) {
        return res.status(404).json(apiResponse(404, "Platform module not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, updatedModule));
});

/**
 * ACTIVATE / DEACTIVATE PLATFORM MODULE
 */
const updatePlatformModuleStatusAPIHandler = async_error_handler(async (req, res) => {
    const { moduleId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
        return res
            .status(400)
            .json(apiResponse(400, "is_active must be boolean"));
    }

    const updatedModule = await PLATFORM_MODULE_MODEL.findOneAndUpdate(
        { _id: moduleId, is_deleted: false },
        { is_active, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedModule) {
        return res.status(404).json(apiResponse(404, "Platform module not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, "Platform module status updated", updatedModule));
});

module.exports = {
    createPlatformModuleAPIHandler,
    getPlatformModuleByIdAPIHandler,
    listPlatformModulesAPIHandler,
    updatePlatformModuleAPIHandler,
    updatePlatformModuleStatusAPIHandler
};
