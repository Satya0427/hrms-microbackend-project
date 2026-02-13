import express, { Router } from 'express';
import { accessTokenValidatorMiddleware } from '../../../common/middleware/error.middleware';
import { validateRequest } from '../../../common/utils/validation_middleware';
import { checkInSchema, checkOutSchema, calculateAttendanceSchema, getDayHistoryQuerySchema, getMonthSummaryQuerySchema, riseWFHRequestSchema, getWFHRequestsQuerySchema } from './attendance.validator';
import { checkInAPIHandler, checkOutAPIHandler, calculateAttendanceAPIHandler, getDayHistoryAPIHandler, getClockLogsAPIHandler, riseWFHRequestAPIHandler, getWFHRequestStatusAPIHandler } from './attendance.controller';
import { getMonthSummaryAPIHandler } from './attendance.controller';

const ATTENDANCE_ROUTER: Router = express.Router();

ATTENDANCE_ROUTER.post(
	'/check_in',
	accessTokenValidatorMiddleware,
	validateRequest(checkInSchema, 'body'),
	checkInAPIHandler
);

ATTENDANCE_ROUTER.post(
	'/check_out',
	accessTokenValidatorMiddleware,
	validateRequest(checkOutSchema, 'body'),
	checkOutAPIHandler
);


ATTENDANCE_ROUTER.get(
	'/monthly-summary',
	accessTokenValidatorMiddleware,
	getMonthSummaryAPIHandler
);
ATTENDANCE_ROUTER.get(
	'/calculate',
	accessTokenValidatorMiddleware,
	// validateRequest(calculateAttendanceSchema, 'body'),
	calculateAttendanceAPIHandler
);

ATTENDANCE_ROUTER.get(
	'/history',
	accessTokenValidatorMiddleware,
	// validateRequest(getDayHistoryQuerySchema, 'query'),
	getDayHistoryAPIHandler
);

ATTENDANCE_ROUTER.get(
    '/clock_logs',
    accessTokenValidatorMiddleware,
    // validateRequest(getMonthSummaryQuerySchema, 'query'),
    getClockLogsAPIHandler
);

ATTENDANCE_ROUTER.post(
	'/wfh/rise-request',
	accessTokenValidatorMiddleware,
	validateRequest(riseWFHRequestSchema, 'body'),
	riseWFHRequestAPIHandler
);

ATTENDANCE_ROUTER.get(
	'/wfh/requests',
	accessTokenValidatorMiddleware,
	validateRequest(getWFHRequestsQuerySchema, 'query'),
	getWFHRequestStatusAPIHandler
);

export default ATTENDANCE_ROUTER;

