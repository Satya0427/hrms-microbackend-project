
const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const { ORGANIZATION_MODEL } = require("../../common/schemas/Organizations/organization.schema");
const { validateOrganizationCreate } = require("./organization.validator");

/**
 * CREATE ORGANIZATION
 */
const createOrganizationAPIHandler = async_error_handler(async (req, res) => {
    let {
        organization_name,
        organization_code,
        domain,
        industry,
        company_size,
        contact_email,
        contact_phone,
        address,
        country,
        timezone
    } = req.body;

    // Basic required checks
    const validationErrors = validateOrganizationCreate(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
    }

    // Trim values
    organization_name = organization_name.trim();
    organization_code = organization_code.trim();
    domain = domain.trim().toLowerCase();
    contact_email = contact_email.trim().toLowerCase();

    // Check duplicates
    const existingOrg = await ORGANIZATION_MODEL.findOne({
        $or: [{ organization_code }, { domain }],
        is_deleted: false
    });

    if (existingOrg) {
        return res.status(400).json(apiResponse(400, "Organization code or domain already exists"));
    }

    const organization = await ORGANIZATION_MODEL.create({
        organization_name,
        organization_code,
        domain,
        industry,
        company_size,
        contact_email,
        contact_phone,
        address,
        country,
        timezone,
        created_by: req.user?.user_id
    });

    return res.status(201).json(apiResponse(201, MESSAGES.SUCCESS, organization));
});

/**
 * GET ORGANIZATION BY ID
 */
const getOrganizationByIdAPIHandler = async_error_handler(async (req, res) => {
    const { organizationId } = req.params;
    const organization = await ORGANIZATION_MODEL.findOne({
        _id: organizationId,
        is_deleted: false
    });
    if (!organization) {
        return res.status(404).json(apiResponse(404, "Organization not found"));
    }
    return res.status(200).json(apiResponse(200, MESSAGES.SUCCESS, organization));
});

/**
 * LIST ORGANIZATIONS (Pagination + Filters)
 */
const listOrganizationsAPIHandler = async_error_handler(async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = { is_deleted: false };

    if (status) query.status = status;
    if (search) {
        query.$or = [
            { organization_name: { $regex: search, $options: "i" } },
            { domain: { $regex: search, $options: "i" } }
        ];
    }

    const organizations = await ORGANIZATION_MODEL.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ORGANIZATION_MODEL.countDocuments(query);

    return res.status(200).json(
        apiResponse(200, MESSAGES.SUCCESS, {
            data: organizations,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    );
});

/**
 * UPDATE ORGANIZATION
 */
const updateOrganizationAPIHandler = async_error_handler(async (req, res) => {
    const { organizationId } = req.params;

    const updatedOrg = await ORGANIZATION_MODEL.findOneAndUpdate(
        { _id: organizationId, is_deleted: false },
        { ...req.body, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedOrg) {
        return res.status(404).json(apiResponse(404, "Organization not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, updatedOrg));
});

/**
 * ACTIVATE / SUSPEND ORGANIZATION
 */
const updateOrganizationStatusAPIHandler = async_error_handler(async (req, res) => {
    const { organizationId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json(apiResponse(400, "Status is required"));
    }

    const updatedOrg = await ORGANIZATION_MODEL.findOneAndUpdate(
        { _id: organizationId, is_deleted: false },
        { status, updated_by: req.user?.user_id },
        { new: true }
    );

    if (!updatedOrg) {
        return res.status(404).json(apiResponse(404, "Organization not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, "Organization status updated", updatedOrg));
});

module.exports = {
    createOrganizationAPIHandler,
    getOrganizationByIdAPIHandler,
    listOrganizationsAPIHandler,
    updateOrganizationAPIHandler,
    updateOrganizationStatusAPIHandler
};
