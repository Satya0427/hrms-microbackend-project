const express = require("express");
const router = express.Router();

const {
  enableOrganizationModuleAPIHandler,
  getModulesByOrganizationAPIHandler,
  listOrganizationModulesAPIHandler,
  updateOrganizationModuleAPIHandler,
  updateOrganizationModuleStatusAPIHandler
} = require("./organization_module.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Enable module for organization
router.post(
  "/enable",
  accessTokenValidatorMiddleware,
  enableOrganizationModuleAPIHandler
);

// Get modules by organization
router.get(
  "/organization/:organizationId",
  accessTokenValidatorMiddleware,
  getModulesByOrganizationAPIHandler
);

// List all organization modules
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listOrganizationModulesAPIHandler
);

// Update organization module
router.put(
  "/:orgModuleId",
  accessTokenValidatorMiddleware,
  updateOrganizationModuleAPIHandler
);

// Enable / Disable module
router.patch(
  "/:orgModuleId/status",
  accessTokenValidatorMiddleware,
  updateOrganizationModuleStatusAPIHandler
);

module.exports = router;
