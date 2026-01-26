const async_error_handler = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const { ORGANIZATION_SCHEMA } = require("./organization.schema");

/**
 * CREATE ORGANIZATION
 */
const createOrganizationAPIHandler = async_error_handler(async (req, res) => {
    let {
        organization_name,
        organization_code,
        email,
        phone_number,
        address,
        subscription_plan
    } = req.body;

    // Required checks
    if (!organization_name)
        return res.status(400).json(apiResponse(400, "Organization name is required"));
    if (!organization_code)
        return res.status(400).json(apiResponse(400, "Organization code is required"));
    if (!email)
        return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.REQUIRED));
    if (!phone_number)
        return res.status(400).json(apiResponse(400, MESSAGES.PHONE_NUMBER.REQUIRED));

    // Type checks
    if (typeof organization_name !== "string")
        return res.status(400).json(apiResponse(400, "Organization name must be string"));
    if (typeof organization_code !== "string")
        return res.status(400).json(apiResponse(400, "Organization code must be string"));
    if (typeof email !== "string")
        return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.TYPE));
    if (typeof phone_number !== "string")
        return res.status(400).json(apiResponse(400, MESSAGES.PHONE_NUMBER.TYPE));

    // Trim
    organization_name = organization_name.trim();
    organization_code = organization_code.trim().toUpperCase();
    email = email.trim().toLowerCase();
    phone_number = phone_number.trim();
    address = address?.trim();

    // Duplicate check
    const existingOrg = await ORGANIZATION_SCHEMA.findOne({
        $or: [{ organization_code }, { email }]
    });

    if (existingOrg)
        return res.status(400).json(apiResponse(400, "Organization already exists"));

    const payload = {
        organization_name,
        organization_code,
        email,
        phone_number,
        address,
        subscription_plan,
        status: "Active"
    };

    await ORGANIZATION_SCHEMA.create(payload);

    return res
        .status(200)
        .json(apiResponse(200, `Organization created ${MESSAGES.SUCCESS}`));
});

/**
 * LIST ORGANIZATIONS
 */
const listOrganizationsAPIHandler = async_error_handler(async (req, res) => {
    const organizations = await ORGANIZATION_SCHEMA.find({})
        .select("-__v")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, organizations));
});

/**
 * VIEW ORGANIZATION
 */
const getOrganizationByIdAPIHandler = async_error_handler(async (req, res) => {
    const { organization_id } = req.params;

    const organization = await ORGANIZATION_SCHEMA.findById(organization_id);

    if (!organization)
        return res.status(404).json(apiResponse(404, "Organization not found"));

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, organization));
});

/**
 * UPDATE ORGANIZATION
 */
const updateOrganizationAPIHandler = async_error_handler(async (req, res) => {
    const { organization_id } = req.params;
    let { email, phone_number, address, subscription_plan } = req.body;

    const organization = await ORGANIZATION_SCHEMA.findById(organization_id);

    if (!organization)
        return res.status(404).json(apiResponse(404, "Organization not found"));

    if (email) {
        if (typeof email !== "string")
            return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.TYPE));
        organization.email = email.trim().toLowerCase();
    }

    if (phone_number) {
        if (typeof phone_number !== "string")
            return res.status(400).json(apiResponse(400, MESSAGES.PHONE_NUMBER.TYPE));
        organization.phone_number = phone_number.trim();
    }

    if (address) {
        organization.address = address.trim();
    }

    if (subscription_plan) {
        organization.subscription_plan = subscription_plan;
    }

    await organization.save();

    return res
        .status(200)
        .json(apiResponse(200, `Organization updated ${MESSAGES.SUCCESS}`));
});

/**
 * ACTIVATE / DEACTIVATE ORGANIZATION
 */
const changeOrganizationStatusAPIHandler = async_error_handler(async (req, res) => {
    const { organization_id } = req.params;
    const { status, reason } = req.body;

    if (!status)
        return res.status(400).json(apiResponse(400, "Status is required"));

    if (!["Active", "Inactive"].includes(status))
        return res.status(400).json(apiResponse(400, "Invalid status"));

    const organization = await ORGANIZATION_SCHEMA.findById(organization_id);

    if (!organization)
        return res.status(404).json(apiResponse(404, "Organization not found"));

    organization.status = status;
    organization.status_reason = reason?.trim();

    await organization.save();

    return res
        .status(200)
        .json(apiResponse(200, `Organization ${status.toLowerCase()} successfully`));
});

module.exports = {
    createOrganizationAPIHandler,
    listOrganizationsAPIHandler,
    getOrganizationByIdAPIHandler,
    updateOrganizationAPIHandler,
    changeOrganizationStatusAPIHandler
};
