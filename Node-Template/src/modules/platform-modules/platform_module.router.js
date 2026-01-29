const express = require("express");
const router = express.Router();

const {
  createPlatformModuleAPIHandler,
  getPlatformModuleByIdAPIHandler,
  listPlatformModulesAPIHandler,
  updatePlatformModuleAPIHandler,
  updatePlatformModuleStatusAPIHandler
} = require("./platform_module.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Create platform module
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createPlatformModuleAPIHandler
);

// Get module by ID
router.get(
  "/:moduleId",
  accessTokenValidatorMiddleware,
  getPlatformModuleByIdAPIHandler
);

// List modules
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listPlatformModulesAPIHandler
);

// Update module
router.put(
  "/:moduleId",
  accessTokenValidatorMiddleware,
  updatePlatformModuleAPIHandler
);

// Activate / Deactivate module
router.patch(
  "/:moduleId/status",
  accessTokenValidatorMiddleware,
  updatePlatformModuleStatusAPIHandler
);

module.exports = router;
