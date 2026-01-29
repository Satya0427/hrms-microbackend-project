const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
  ORGANIZATION_MODULE_MODEL
} = require("../../common/schemas/PlatformModules/organization_module.schema");

const {
  PLATFORM_MODULE_MODEL
} = require("../../common/schemas/PlatformModules/platform_module.schema");

const {
  validateOrganizationModuleEnable
} = require("./organization_module.validator");

/**
 * ENABLE MODULE FOR ORGANIZATION
 */
const enableOrganizationModuleAPIHandler = async_error_handler(async (req, res) => {
  const {
    organization_id,
    module_id,
    enabled_from,
    enabled_till,
    enabled_via
  } = req.body;

  const validationErrors = validateOrganizationModuleEnable(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
  }

  const platformModule = await PLATFORM_MODULE_MODEL.findOne({
    _id: module_id,
    is_active: true,
    is_deleted: false
  });

  if (!platformModule) {
    return res.status(404).json(apiResponse(404, "Platform module not found"));
  }

  const orgModule = await ORGANIZATION_MODULE_MODEL.create({
    organization_id,
    module_id,
    enabled_from,
    enabled_till,
    enabled_via,
    created_by: req.user?.user_id
  });

  return res
    .status(201)
    .json(apiResponse(201, MESSAGES.SUCCESS, orgModule));
});

/**
 * GET MODULES BY ORGANIZATION
 */
const getModulesByOrganizationAPIHandler = async_error_handler(async (req, res) => {
  const { organizationId } = req.params;

  const modules = await ORGANIZATION_MODULE_MODEL.find({
    organization_id: organizationId,
    is_deleted: false
  }).populate("module_id", "module_name module_code route icon");

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, modules));
});

/**
 * LIST ALL ORGANIZATION MODULES
 */
const listOrganizationModulesAPIHandler = async_error_handler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const query = { is_deleted: false };

  const modules = await ORGANIZATION_MODULE_MODEL.find(query)
    .populate("organization_id", "organization_name domain")
    .populate("module_id", "module_name module_code")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await ORGANIZATION_MODULE_MODEL.countDocuments(query);

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
 * UPDATE ORGANIZATION MODULE
 */
const updateOrganizationModuleAPIHandler = async_error_handler(async (req, res) => {
  const { orgModuleId } = req.params;

  const updatedModule = await ORGANIZATION_MODULE_MODEL.findOneAndUpdate(
    { _id: orgModuleId, is_deleted: false },
    { ...req.body, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedModule) {
    return res
      .status(404)
      .json(apiResponse(404, "Organization module not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, updatedModule));
});

/**
 * ENABLE / DISABLE ORGANIZATION MODULE
 */
const updateOrganizationModuleStatusAPIHandler = async_error_handler(async (req, res) => {
  const { orgModuleId } = req.params;
  const { is_enabled } = req.body;

  if (typeof is_enabled !== "boolean") {
    return res
      .status(400)
      .json(apiResponse(400, "is_enabled must be boolean"));
  }

  const updatedModule = await ORGANIZATION_MODULE_MODEL.findOneAndUpdate(
    { _id: orgModuleId, is_deleted: false },
    { is_enabled, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedModule) {
    return res
      .status(404)
      .json(apiResponse(404, "Organization module not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, "Organization module status updated", updatedModule));
});

module.exports = {
  enableOrganizationModuleAPIHandler,
  getModulesByOrganizationAPIHandler,
  listOrganizationModulesAPIHandler,
  updateOrganizationModuleAPIHandler,
  updateOrganizationModuleStatusAPIHandler
};
