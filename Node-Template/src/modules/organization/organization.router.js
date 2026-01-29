const express = require("express");
const ORGANIZATION_ROUTER = express.Router();

const {
  createOrganizationAPIHandler,
  getOrganizationByIdAPIHandler,
  listOrganizationsAPIHandler,
  updateOrganizationAPIHandler,
  updateOrganizationStatusAPIHandler
} = require("./organization.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Create organization
ORGANIZATION_ROUTER.post("/create", accessTokenValidatorMiddleware, createOrganizationAPIHandler);

// Get organization by ID
ORGANIZATION_ROUTER.get("/:organizationId", accessTokenValidatorMiddleware, getOrganizationByIdAPIHandler);

// List organizations (pagination, filters)
ORGANIZATION_ROUTER.get("/", accessTokenValidatorMiddleware, listOrganizationsAPIHandler);

// Update organization
ORGANIZATION_ROUTER.put("/:organizationId", accessTokenValidatorMiddleware, updateOrganizationAPIHandler);

// Activate / Suspend organization
ORGANIZATION_ROUTER.patch("/:organizationId/status", accessTokenValidatorMiddleware, updateOrganizationStatusAPIHandler);

module.exports = ORGANIZATION_ROUTER;
