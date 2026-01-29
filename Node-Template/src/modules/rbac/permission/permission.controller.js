const {async_error_handler} = require("../../../common/utils/async_error_handler");
const apiResponse = require("../../../common/utils/api_response");
const MESSAGES = require("../../../common/utils/messages");

const {
  PERMISSION_MODEL
} = require("../../../common/schemas/Users/permission.schema");

const {
  validatePermissionCreate
} = require("./permission.validator");

/**
 * CREATE PERMISSION
 */
const createPermissionAPIHandler = async_error_handler(async (req, res) => {
  let {
    permission_name,
    permission_code,
    description,
    module_id,
    scope,
    action
  } = req.body;

  const validationErrors = validatePermissionCreate(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
  }

  permission_name = permission_name.trim();
  permission_code = permission_code.trim().toUpperCase();

  const existingPermission = await PERMISSION_MODEL.findOne({
    permission_code,
    is_deleted: false
  });

  if (existingPermission) {
    return res
      .status(400)
      .json(apiResponse(400, "Permission already exists"));
  }

  const permission = await PERMISSION_MODEL.create({
    permission_name,
    permission_code,
    description,
    module_id,
    scope,
    action,
    created_by: req.user?.user_id
  });

  return res
    .status(201)
    .json(apiResponse(201, MESSAGES.SUCCESS, permission));
});

/**
 * GET PERMISSION BY ID
 */
const getPermissionByIdAPIHandler = async_error_handler(async (req, res) => {
  const { permissionId } = req.params;

  const permission = await PERMISSION_MODEL.findOne({
    _id: permissionId,
    is_deleted: false
  });

  if (!permission) {
    return res
      .status(404)
      .json(apiResponse(404, "Permission not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, permission));
});

/**
 * LIST PERMISSIONS
 */
const listPermissionsAPIHandler = async_error_handler(async (req, res) => {
  const { page = 1, limit = 10, scope, module_id } = req.query;

  const query = { is_deleted: false };
  if (scope) query.scope = scope;
  if (module_id) query.module_id = module_id;

  const permissions = await PERMISSION_MODEL.find(query)
    .populate("module_id", "module_name module_code")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await PERMISSION_MODEL.countDocuments(query);

  return res.status(200).json(
    apiResponse(200, MESSAGES.SUCCESS, {
      data: permissions,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  );
});

/**
 * UPDATE PERMISSION
 */
const updatePermissionAPIHandler = async_error_handler(async (req, res) => {
  const { permissionId } = req.params;

  const updatedPermission = await PERMISSION_MODEL.findOneAndUpdate(
    { _id: permissionId, is_deleted: false },
    { ...req.body, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedPermission) {
    return res
      .status(404)
      .json(apiResponse(404, "Permission not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, updatedPermission));
});

/**
 * ACTIVATE / DEACTIVATE PERMISSION
 */
const updatePermissionStatusAPIHandler = async_error_handler(async (req, res) => {
  const { permissionId } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res
      .status(400)
      .json(apiResponse(400, "is_active must be boolean"));
  }

  const updatedPermission = await PERMISSION_MODEL.findOneAndUpdate(
    { _id: permissionId, is_deleted: false },
    { is_active, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedPermission) {
    return res
      .status(404)
      .json(apiResponse(404, "Permission not found"));
  }

  return res
    .status(200)
    .json(
      apiResponse(200, "Permission status updated", updatedPermission)
    );
});

module.exports = {
  createPermissionAPIHandler,
  getPermissionByIdAPIHandler,
  listPermissionsAPIHandler,
  updatePermissionAPIHandler,
  updatePermissionStatusAPIHandler
};
