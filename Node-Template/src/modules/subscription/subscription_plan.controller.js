const { async_error_handler } = require("../../common/utils/async_error_handler");
const { apiResponse } = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
  SUBSCRIPTION_PLAN_MODEL
} = require("../../common/schemas/Subscription/subscription_plan.schema");

const {
  validateSubscriptionPlanCreate
} = require("./subscription_plan.validator");

/**
 * CREATE SUBSCRIPTION PLAN
 */
const createSubscriptionPlanAPIHandler = async_error_handler(async (req, res) => {
  const {
    name,
    plan_code,
    monthlyPrice,
    yearlyPrice,
    employeeLimit,
    storageLimit,
    modules
  } = req.body;

  const payload = {
    plan_name: name,
    plan_code,
    pricing: {
      monthly_price: monthlyPrice,
      yearly_price: yearlyPrice
    },
    limits: {
      employee_limit: employeeLimit,
      storage_limit_gb: storageLimit
    },
    modules,
    created_by: req.user.user_id
  }
  const plan = await SUBSCRIPTION_PLAN_MODEL.create(payload);

  return res.status(201).json(
    apiResponse(201, "Subscription plan created", plan)
  );
});

/**
 * GET PLAN BY ID
 */
const getSubscriptionPlanByIdAPIHandler = async_error_handler(async (req, res) => {
  const { planId } = req.params;

  const plan = await SUBSCRIPTION_PLAN_MODEL.findOne({
    _id: planId,
    is_deleted: false
  });

  if (!plan) {
    return res.status(404).json(apiResponse(404, "Subscription plan not found"));
  }

  return res.status(200).json(apiResponse(200, MESSAGES.SUCCESS, plan));
});

/**
 * LIST SUBSCRIPTION PLANS
 */
const listSubscriptionPlansAPIHandler = async_error_handler(async (req, res) => {

  const { page_size, page_index, search_key } = req.body;
  
  // const { page = 1, limit = 10, is_active } = req.query;

  // const query = { is_deleted: false };
  // if (is_active !== undefined) query.is_active = is_active === "true";

  // const plans = await SUBSCRIPTION_PLAN_MODEL.find(query)
  //   .skip((page - 1) * limit)
  //   .limit(Number(limit))
  //   .sort({ createdAt: -1 });

  // const total = await SUBSCRIPTION_PLAN_MODEL.countDocuments(query);

  // return res.status(200).json(
  //   apiResponse(200, MESSAGES.SUCCESS, {
  //     data: plans,
  //     total,
  //     page: Number(page),
  //     limit: Number(limit)
  //   })
  // );
});

/**
 * UPDATE SUBSCRIPTION PLAN
 */
const updateSubscriptionPlanAPIHandler = async_error_handler(async (req, res) => {
  const { planId } = req.params;

  const updatedPlan = await SUBSCRIPTION_PLAN_MODEL.findOneAndUpdate(
    { _id: planId, is_deleted: false },
    { ...req.body, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedPlan) {
    return res.status(404).json(apiResponse(404, "Subscription plan not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, updatedPlan));
});

/**
 * ACTIVATE / DEACTIVATE PLAN
 */
const updateSubscriptionPlanStatusAPIHandler = async_error_handler(async (req, res) => {
  const { planId } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res
      .status(400)
      .json(apiResponse(400, "is_active must be boolean"));
  }

  const updatedPlan = await SUBSCRIPTION_PLAN_MODEL.findOneAndUpdate(
    { _id: planId, is_deleted: false },
    { is_active, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedPlan) {
    return res.status(404).json(apiResponse(404, "Subscription plan not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, "Subscription plan status updated", updatedPlan));
});

module.exports = {
  createSubscriptionPlanAPIHandler,
  getSubscriptionPlanByIdAPIHandler,
  listSubscriptionPlansAPIHandler,
  updateSubscriptionPlanAPIHandler,
  updateSubscriptionPlanStatusAPIHandler
};
