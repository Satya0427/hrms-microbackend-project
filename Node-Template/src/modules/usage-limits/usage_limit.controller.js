const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
  USAGE_LIMIT_MODEL
} = require("../../common/schemas/UsageLimits/usage_limit.schema");

const {
  validateUsageLimitCreate
} = require("./usage_limit.validator");

/**
 * CREATE / INITIALIZE USAGE LIMIT
 */
const createUsageLimitAPIHandler = async_error_handler(async (req, res) => {
  const {
    organization_id,
    subscription_id,
    limits
  } = req.body;

  const validationErrors = validateUsageLimitCreate(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
  }

  const existing = await USAGE_LIMIT_MODEL.findOne({
    organization_id,
    subscription_id,
    is_deleted: false
  });

  if (existing) {
    return res
      .status(400)
      .json(apiResponse(400, "Usage limit already exists"));
  }

  const usageLimit = await USAGE_LIMIT_MODEL.create({
    organization_id,
    subscription_id,
    limits,
    created_by: req.user?.user_id
  });

  return res
    .status(201)
    .json(apiResponse(201, MESSAGES.SUCCESS, usageLimit));
});

/**
 * GET USAGE LIMIT BY ORGANIZATION
 */
const getUsageLimitByOrganizationAPIHandler = async_error_handler(async (req, res) => {
  const { organizationId } = req.params;

  const usageLimit = await USAGE_LIMIT_MODEL.findOne({
    organization_id: organizationId,
    is_deleted: false
  });

  if (!usageLimit) {
    return res
      .status(404)
      .json(apiResponse(404, "Usage limit not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, usageLimit));
});

/**
 * LIST USAGE LIMITS (PLATFORM VIEW)
 */
const listUsageLimitsAPIHandler = async_error_handler(async (req, res) => {
  const { page = 1, limit = 10, is_limit_exceeded } = req.query;

  const query = { is_deleted: false };
  if (is_limit_exceeded !== undefined) {
    query.is_limit_exceeded = is_limit_exceeded === "true";
  }

  const usageLimits = await USAGE_LIMIT_MODEL.find(query)
    .populate("organization_id", "organization_name domain")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ updatedAt: -1 });

  const total = await USAGE_LIMIT_MODEL.countDocuments(query);

  return res.status(200).json(
    apiResponse(200, MESSAGES.SUCCESS, {
      data: usageLimits,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  );
});

/**
 * UPDATE USAGE COUNTERS
 */
const updateUsageLimitAPIHandler = async_error_handler(async (req, res) => {
  const { usageLimitId } = req.params;

  const updatedUsage = await USAGE_LIMIT_MODEL.findOneAndUpdate(
    { _id: usageLimitId, is_deleted: false },
    {
      usage: req.body.usage,
      last_calculated_at: new Date(),
      updated_by: req.user?.user_id
    },
    { new: true }
  );

  if (!updatedUsage) {
    return res
      .status(404)
      .json(apiResponse(404, "Usage limit not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, updatedUsage));
});

/**
 * UPDATE LIMIT EXCEEDED STATUS
 */
const updateUsageLimitStatusAPIHandler = async_error_handler(async (req, res) => {
  const { usageLimitId } = req.params;
  const { is_limit_exceeded } = req.body;

  if (typeof is_limit_exceeded !== "boolean") {
    return res
      .status(400)
      .json(apiResponse(400, "is_limit_exceeded must be boolean"));
  }

  const updatedUsage = await USAGE_LIMIT_MODEL.findOneAndUpdate(
    { _id: usageLimitId, is_deleted: false },
    {
      is_limit_exceeded,
      updated_by: req.user?.user_id
    },
    { new: true }
  );

  if (!updatedUsage) {
    return res
      .status(404)
      .json(apiResponse(404, "Usage limit not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, "Usage limit status updated", updatedUsage));
});

module.exports = {
  createUsageLimitAPIHandler,
  getUsageLimitByOrganizationAPIHandler,
  listUsageLimitsAPIHandler,
  updateUsageLimitAPIHandler,
  updateUsageLimitStatusAPIHandler
};
