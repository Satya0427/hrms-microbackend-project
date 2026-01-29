const express = require("express");
const router = express.Router();

const {
  createUsageLimitAPIHandler,
  getUsageLimitByOrganizationAPIHandler,
  listUsageLimitsAPIHandler,
  updateUsageLimitAPIHandler,
  updateUsageLimitStatusAPIHandler
} = require("./usage_limit.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Create / initialize usage limit
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createUsageLimitAPIHandler
);

// Get usage limit by organization
router.get(
  "/organization/:organizationId",
  accessTokenValidatorMiddleware,
  getUsageLimitByOrganizationAPIHandler
);

// List usage limits (platform view)
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listUsageLimitsAPIHandler
);

// Update usage counters
router.put(
  "/:usageLimitId",
  accessTokenValidatorMiddleware,
  updateUsageLimitAPIHandler
);

// Update limit exceeded status
router.patch(
  "/:usageLimitId/status",
  accessTokenValidatorMiddleware,
  updateUsageLimitStatusAPIHandler
);

module.exports = router;
