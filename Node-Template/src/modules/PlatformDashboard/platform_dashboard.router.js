const express = require("express");
const {
  createOrganizationAPIHandler,
  getOrganizationsAPIHandler,
  getOrganizationByIdAPIHandler
} = require("./organization.controller");

const {
  accessTokenValidatorMiddleware
} = require("../../common/middleware/error.middleware.ts");

const router = express.Router();

router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createOrganizationAPIHandler
);

router.get(
  "/list",
  accessTokenValidatorMiddleware,
  getOrganizationsAPIHandler
);

router.get(
  "/:organization_id",
  accessTokenValidatorMiddleware,
  getOrganizationByIdAPIHandler
);

module.exports = router;
