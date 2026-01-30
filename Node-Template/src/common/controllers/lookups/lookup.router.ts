import express, { Router } from 'express';
import { getOrganizationsDropdownAPIHandler } from './lookup.controller';
import { accessTokenValidatorMiddleware } from '../../middleware/error.middleware';
import { validateRequest } from '../../utils/validation_middleware';
import { organizationsDropdownSchema } from './lookup.validator';

const LOOKUP_ROUTER: Router = express.Router();

// Organizations Dropdown (Without pagination)
LOOKUP_ROUTER.post(
    '/organizations-dropdown',
    accessTokenValidatorMiddleware,
    validateRequest(organizationsDropdownSchema, 'body'),
    getOrganizationsDropdownAPIHandler
);

export default LOOKUP_ROUTER;
