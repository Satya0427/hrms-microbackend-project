const express = require("express");
const router = express.Router();

const {
  createSubscriptionPlanAPIHandler,
  getSubscriptionPlanByIdAPIHandler,
  listSubscriptionPlansAPIHandler,
  updateSubscriptionPlanAPIHandler,
  updateSubscriptionPlanStatusAPIHandler
} = require("./subscription_plan.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Create plan
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createSubscriptionPlanAPIHandler
);

// Get plan by ID
router.get(
  "/:planId",
  accessTokenValidatorMiddleware,
  getSubscriptionPlanByIdAPIHandler
);

// List plans
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listSubscriptionPlansAPIHandler
);

// Update plan
router.put(
  "/:planId",
  accessTokenValidatorMiddleware,
  updateSubscriptionPlanAPIHandler
);

// Activate / Deactivate plan
router.patch(
  "/:planId/status",
  accessTokenValidatorMiddleware,
  updateSubscriptionPlanStatusAPIHandler
);

module.exports = router;
