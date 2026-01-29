const express = require("express");
const router = express.Router();

const {
  assignSubscriptionAPIHandler,
  getSubscriptionByOrganizationAPIHandler,
  listOrganizationSubscriptionsAPIHandler,
  updateOrganizationSubscriptionAPIHandler,
  updateOrganizationSubscriptionStatusAPIHandler
} = require("./organization_subscription.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Assign subscription to organization
router.post(
  "/assign",
  accessTokenValidatorMiddleware,
  assignSubscriptionAPIHandler
);

// Get subscription by organization ID
router.get(
  "/organization/:organizationId",
  accessTokenValidatorMiddleware,
  getSubscriptionByOrganizationAPIHandler
);

// List all organization subscriptions
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listOrganizationSubscriptionsAPIHandler
);

// Update subscription (upgrade / downgrade)
router.put(
  "/:subscriptionId",
  accessTokenValidatorMiddleware,
  updateOrganizationSubscriptionAPIHandler
);

// Update subscription status
router.patch(
  "/:subscriptionId/status",
  accessTokenValidatorMiddleware,
  updateOrganizationSubscriptionStatusAPIHandler
);

module.exports = router;
