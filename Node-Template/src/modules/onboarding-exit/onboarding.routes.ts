import express, { Router } from 'express';

import {
  createEmploymentProfileAPIHandler,
  getEmploymentProfileByIdAPIHandler,
  updateEmploymentProfileAPIHandler,
  deleteEmploymentProfileAPIHandler,
  listEmploymentProfilesAPIHandler,
  getEmploymentProfileByUserAndOrgAPIHandler
} from './onboarding.controller';

import { accessTokenValidatorMiddleware } from '../../common/middleware/error.middleware';
import { validateRequest } from '../../common/utils/validation_middleware';
import {
  createEmploymentProfileSchema,
  updateEmploymentProfileSchema,
  getEmploymentProfileByIdSchema,
  deleteEmploymentProfileSchema,
  listEmploymentProfilesSchema
} from './onboarding.validator';

const ONBOARDING_ROUTER: Router = express.Router();

/**
 * ==================== CREATE ====================
 * POST /api/onboarding/create
 * Create a new employment profile
 */
ONBOARDING_ROUTER.post(
  "/create",
  accessTokenValidatorMiddleware,
  validateRequest(createEmploymentProfileSchema, 'body'),
  createEmploymentProfileAPIHandler
);

/**
 * ==================== GET BY ID ====================
 * GET /api/onboarding/:id
 * Get employment profile by ID
 */
ONBOARDING_ROUTER.get(
  "/:id",
  accessTokenValidatorMiddleware,
  validateRequest(getEmploymentProfileByIdSchema, 'params'),
  getEmploymentProfileByIdAPIHandler
);

/**
 * ==================== GET BY USER AND ORGANIZATION ====================
 * POST /api/onboarding/get_by_user_org
 * Get employment profile by user_id and organization_id
 */
ONBOARDING_ROUTER.post(
  "/get_by_user_org",
  accessTokenValidatorMiddleware,
  getEmploymentProfileByUserAndOrgAPIHandler
);

/**
 * ==================== UPDATE ====================
 * PUT /api/onboarding/:id
 * Update employment profile
 */
ONBOARDING_ROUTER.put(
  "/:id",
  accessTokenValidatorMiddleware,
  validateRequest(updateEmploymentProfileSchema, 'body'),
  updateEmploymentProfileAPIHandler
);

/**
 * ==================== DELETE ====================
 * DELETE /api/onboarding/:id
 * Soft delete employment profile
 */
ONBOARDING_ROUTER.delete(
  "/:id",
  accessTokenValidatorMiddleware,
  validateRequest(deleteEmploymentProfileSchema, 'params'),
  deleteEmploymentProfileAPIHandler
);

/**
 * ==================== LIST WITH PAGINATION & FILTERS ====================
 * POST /api/onboarding/list
 * Get list of employment profiles with pagination and filters
 */
ONBOARDING_ROUTER.post(
  "/list",
  accessTokenValidatorMiddleware,
  validateRequest(listEmploymentProfilesSchema, 'body'),
  listEmploymentProfilesAPIHandler
);

export { ONBOARDING_ROUTER };
