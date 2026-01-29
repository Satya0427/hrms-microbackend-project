const {async_error_handler} = require("../../../common/utils/async_error_handler");
const apiResponse = require("../../../common/utils/api_response");
const MESSAGES = require("../../../common/utils/messages");

const {
    ROLE_MODEL
} = require("../../../common/schemas/Users/role.schema");

const {
    validateRoleCreate
} = require("./role.validator");

/**
 * CREATE ROLE
 */
const createRoleAPIHandler = async_error_handler(async (req, res) => {
    let {
        role_name,
        role_code,
        description,
        scope,
        organization_id,
        is_default
    } = req.body;

    const validationErrors = validateRoleCreate(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
    }

    role_name = role_name.trim();
    role_code = role_code.trim().toUpperCase();

    const existingRole = await ROLE_MODEL.findOne({
        role_code,
        is_deleted: false
    });

    if (existingRole) {
        return res
            .status(400)
            .json(apiResponse(400, "Role already exists"));
    }

    const role = await ROLE_MODEL.create({
        role_name,
        role_code,
        description,
        scope,
        organization_id: scope === "ORGANIZATION" ? organization_id : null,
        is_default,
        created_by: req.user?.user_id
    });

    return res
        .status(201)
        .json(apiResponse(201, MESSAGES.SUCCESS, role));
});

/**
 * GET ROLE BY ID
 */
const getRoleByIdAPIHandler = async_error_handler(async (req, res) => {
    const { roleId } = req.params;

    const role = await ROLE_MODEL.findOne({
        _id: roleId,
        is_deleted: false
    });

    if (!role) {
        return res.status(404).json(apiResponse(404, "Role not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, role));
});

/**
 * LIST ROLES
 */
const listRolesAPIHandler = async_error_handler(async (req, res) => {
    const { page = 1, limit = 10, scope, organization_id } = req.query;

    const query = { is_deleted: false };

    if (scope) query.scope = scope;
    if (organization_id) query.organization_id = organization_id;

    const roles = await ROLE_MODEL.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ROLE_MODEL.countDocuments(query);

    return res.status(200).json(
        apiResponse(200, MESSAGES.SUCCESS, {
            data: roles,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    );
});

/**
 * UPDATE ROLE
 */
const updateRoleAPIHandler = async_error_handler(async (req, res) => {
    const { roleId } = req.params;

    const updatedRole = await ROLE_MODEL.findOneAndUpdate(
        { _id: roleId, is_deleted: false },
        { ...req.body, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedRole) {
        return res.status(404).json(apiResponse(404, "Role not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, updatedRole));
});

/**
 * ACTIVATE / DEACTIVATE ROLE
 */
const updateRoleStatusAPIHandler = async_error_handler(async (req, res) => {
    const { roleId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
        return res
            .status(400)
            .json(apiResponse(400, "is_active must be boolean"));
    }

    const updatedRole = await ROLE_MODEL.findOneAndUpdate(
        { _id: roleId, is_deleted: false },
        { is_active, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedRole) {
        return res.status(404).json(apiResponse(404, "Role not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, "Role status updated", updatedRole));
});

module.exports = {
    createRoleAPIHandler,
    getRoleByIdAPIHandler,
    listRolesAPIHandler,
    updateRoleAPIHandler,
    updateRoleStatusAPIHandler
};
