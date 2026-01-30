import express, { Router } from 'express';

import {
    listAuditLogsAPIHandler,
    getAuditLogByIdAPIHandler
} from './audit_log.controller';

import { accessTokenValidatorMiddleware } from '../../common/middleware/error.middleware';

const audit_log_router: Router = express.Router();

// List audit logs
audit_log_router.get(
    "/",
    accessTokenValidatorMiddleware,
    listAuditLogsAPIHandler
);

// Get audit log by ID
audit_log_router.get(
    "/:auditLogId",
    accessTokenValidatorMiddleware,
    getAuditLogByIdAPIHandler
);

export default audit_log_router;
