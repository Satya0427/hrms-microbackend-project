const express = require("express");
const router = express.Router();

const {
  createRoleAPIHandler,
  getRoleByIdAPIHandler,
  listRolesAPIHandler,
  updateRoleAPIHandler,
  updateRoleStatusAPIHandler
} = require("./role.controller");

const { accessTokenValidatorMiddleware } = require("../../../common/middleware/error.middleware.ts");

// Create role
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createRoleAPIHandler
);

// Get role by ID
router.get(
  "/:roleId",
  accessTokenValidatorMiddleware,
  getRoleByIdAPIHandler
);

// List roles
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listRolesAPIHandler
);

// Update role
router.put(
  "/:roleId",
  accessTokenValidatorMiddleware,
  updateRoleAPIHandler
);

// Activate / Deactivate role
router.patch(
  "/:roleId/status",
  accessTokenValidatorMiddleware,
  updateRoleStatusAPIHandler
);

module.exports = router;
