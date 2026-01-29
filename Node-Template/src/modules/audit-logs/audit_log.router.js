const express = require("express");
const router = express.Router();

const {
  listAuditLogsAPIHandler,
  getAuditLogByIdAPIHandler
} = require("./audit_log.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// List audit logs
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listAuditLogsAPIHandler
);

// Get audit log by ID
router.get(
  "/:auditLogId",
  accessTokenValidatorMiddleware,
  getAuditLogByIdAPIHandler
);

module.exports = router;
