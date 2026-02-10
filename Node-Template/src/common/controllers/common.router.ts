import express, { Router } from 'express';
import { accessTokenValidatorMiddleware } from '../middleware/error.middleware';
import { bulkLookupsDropdownSchema, leaveTypesDropdownSchema, lookupsDropdownSchema, organizationsDropdownSchema } from './dropdowns/dropdown.validator';
import { validateRequest } from '../utils/validation_middleware';
import { getLookupsByCategory } from '../utils/common';
import { getBulkLookups } from './lookups/lookup.controller';
import {
    getDepartmentsByOrganizationAPIHandler,
    getDesignationsByDepartmentAPIHandler,
    getEmployeeByOrganizationAPIHandler,
    getEmployeeProfileImage,
    getOrganizationsDropdownAPIHandler,
    getLeaveTypesDropdownAPIHandler,
} from './dropdowns/dropdown.controller';

const COMMON_ROUTER: Router = express.Router();
// Organizations Dropdown (Without pagination)
COMMON_ROUTER.post(
    '/organizations-dropdown',
    accessTokenValidatorMiddleware,
    validateRequest(organizationsDropdownSchema, 'body'),
    getOrganizationsDropdownAPIHandler
);

COMMON_ROUTER.post(
    '/designations-dropdown',
    accessTokenValidatorMiddleware,
    validateRequest(organizationsDropdownSchema, 'body'),
    getDesignationsByDepartmentAPIHandler
);

COMMON_ROUTER.get(
    '/departments-dropdown',
    accessTokenValidatorMiddleware,
    getDepartmentsByOrganizationAPIHandler
);

// Organizations Dropdown (Without pagination)
COMMON_ROUTER.get(
  '/get_image/:id',
  getEmployeeProfileImage
);

COMMON_ROUTER.get(
    '/employee-dropdown',
    accessTokenValidatorMiddleware,
    getEmployeeByOrganizationAPIHandler
);

// Leave Types Dropdown (Without pagination)
COMMON_ROUTER.get(
    '/leave-types-dropdown',
    accessTokenValidatorMiddleware,
    getLeaveTypesDropdownAPIHandler
);

// Organizations Dropdown (Without pagination)
COMMON_ROUTER.post(
    '/lookup',
    accessTokenValidatorMiddleware,
    validateRequest(lookupsDropdownSchema, 'body'),
    getLookupsByCategory
);

// Organizations Dropdown (Without pagination)
COMMON_ROUTER.post(
    '/bulk_lookup',
    accessTokenValidatorMiddleware,
    validateRequest(bulkLookupsDropdownSchema, 'body'),
    getBulkLookups
);



export default COMMON_ROUTER;
