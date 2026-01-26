const async_error_handler = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const { ORGANIZATION_SCHEMA } = require("./organization.schema");

/**
 * CREATE ORGANIZATION
 */
const createOrganizationAPIHandler = async_error_handler(async (req, res) => {

  const {
    organization_name,
    domain,
    industry,
    country,
    subscription_plan_id,
    plan_name,
    price,
    employee_limit,
    trial_period_days,
    admin_name,
    admin_email,
    admin_mobile
  } = req.body;

  /* Required validations */
  if (!organization_name)
    return res.status(400).json(apiResponse(400, "Organization name required"));

  if (!domain)
    return res.status(400).json(apiResponse(400, "Domain required"));

  if (!subscription_plan_id)
    return res.status(400).json(apiResponse(400, "Subscription plan required"));

  /* Duplicate domain check */
  const existingOrg = await ORGANIZATION_SCHEMA.findOne({ domain });
  if (existingOrg)
    return res.status(400).json(apiResponse(400, "Domain already exists"));

  const org = await ORGANIZATION_SCHEMA.create({
    organization_name: organization_name.trim(),
    domain: domain.trim(),
    industry,
    country,
    subscription_plan_id,
    plan_name,
    price,
    employee_limit,
    trial_period_days,
    admin_name,
    admin_email,
    admin_mobile,
    created_by: req.user.user_id
  });

  return res
    .status(201)
    .json(apiResponse(201, MESSAGES.SUCCESS, org));
});

/**
 * GET ALL ORGANIZATIONS
 */
const getOrganizationsAPIHandler = async_error_handler(async (req, res) => {

  const organizations = await ORGANIZATION_SCHEMA
    .find()
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, organizations));
});

/**
 * GET ORGANIZATION BY ID
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

module.exports = {
  createOrganizationAPIHandler,
  getOrganizationsAPIHandler,
  getOrganizationByIdAPIHandler
};
