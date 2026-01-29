const express = require("express");
const router = express.Router();

const {
  createPermissionAPIHandler,
  getPermissionByIdAPIHandler,
  listPermissionsAPIHandler,
  updatePermissionAPIHandler,
  updatePermissionStatusAPIHandler
} = require("./permission.controller");

const { accessTokenValidatorMiddleware } = require("../../../common/middleware/error.middleware.ts");

// Create permission
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createPermissionAPIHandler
);

// Get permission by ID
router.get(
  "/:permissionId",
  accessTokenValidatorMiddleware,
  getPermissionByIdAPIHandler
);

// List permissions
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listPermissionsAPIHandler
);

// Update permission
router.put(
  "/:permissionId",
  accessTokenValidatorMiddleware,
  updatePermissionAPIHandler
);

// Activate / Deactivate permission
router.patch(
  "/:permissionId/status",
  accessTokenValidatorMiddleware,
  updatePermissionStatusAPIHandler
);

module.exports = router;
