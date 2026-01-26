const async_error_handler = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const { ORGANIZATION_SCHEMA } = require("./organization.schema");

/**
 * CREATE ORGANIZATION
 */
const createOrganizationAPIHandler = async_error_handler(async (req, res) => {

    let { name, email, phone_number, address } = req.body;

    // Required validation
    if (!name) return res.status(400).json(apiResponse(400, MESSAGES.NAME.REQUIRED));
    if (!email) return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.REQUIRED));
    if (!phone_number) return res.status(400).json(apiResponse(400, MESSAGES.PHONE_NUMBER.REQUIRED));

    // Type validation
    if (typeof name !== "string") return res.status(400).json(apiResponse(400, MESSAGES.NAME.TYPE));
    if (typeof email !== "string") return res.status(400).json(apiResponse(400, MESSAGES.EMAIL.TYPE));
    if (typeof phone_number !== "string") return res.status(400).json(apiResponse(400, MESSAGES.PHONE_NUMBER.TYPE));

    // Trim
    name = name.trim();
    email = email.trim();
    phone_number = phone_number.trim();
    address = address?.trim();

    // Duplicate check
    const exists = await ORGANIZATION_SCHEMA.findOne({
        $or: [{ email }, { phone_number }]
    });

    if (exists)
        return res.status(400).json(apiResponse(400, "Organization already exists"));

    const payload = {
        name,
        email,
        phone_number,
        address,
        status: "active"
    };

    await ORGANIZATION_SCHEMA.create(payload);

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS));
});


/**
 * LIST ORGANIZATIONS
 */
const getOrganizationListAPIHandler = async_error_handler(async (req, res) => {

    const organizations = await ORGANIZATION_SCHEMA.find()
        .select("name email phone_number status createdAt")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, organizations));
});


/**
 * VIEW ORGANIZATION
 */
const getOrganizationViewAPIHandler = async_error_handler(async (req, res) => {

    const { organization_id } = req.params;

    if (!organization_id)
        return res.status(400).json(apiResponse(400, "Organization ID required"));

    const organization = await ORGANIZATION_SCHEMA.findById(organization_id);

    if (!organization)
        return res.status(404).json(apiResponse(404, "Organization not found"));

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, organization));
});


/**
 * ENABLE / DISABLE ORGANIZATION
 */
const toggleOrganizationStatusAPIHandler = async_error_handler(async (req, res) => {

    const { organization_id } = req.params;

    const organization = await ORGANIZATION_SCHEMA.findById(organization_id);

    if (!organization)
        return res.status(404).json(apiResponse(404, "Organization not found"));

    organization.status =
        organization.status === "active" ? "inactive" : "active";

    await organization.save();

    return res
        .status(200)
        .json(apiResponse(200, "Organization status updated"));
});

module.exports = {
    createOrganizationAPIHandler,
    getOrganizationListAPIHandler,
    getOrganizationViewAPIHandler,
    toggleOrganizationStatusAPIHandler
};
