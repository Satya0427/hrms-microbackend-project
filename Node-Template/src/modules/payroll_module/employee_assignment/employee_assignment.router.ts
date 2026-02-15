import express, { Router } from 'express';
import { accessTokenValidatorMiddleware } from '../../../common/middleware/error.middleware';
import { validateRequest } from '../../../common/utils/validation_middleware';
import {
    assignSalarySchema,
    getEmployeeSalarySchema,
    reviseSalarySchema,
    getSalaryHistorySchema,
    getAllAssignmentsSchema,
    getAssignmentByIdSchema,
    deactivateSalarySchema
} from './employee_assignment.validation';
import {
    assignSalaryAPIHandler,
    getEmployeeSalaryAPIHandler,
    reviseSalaryAPIHandler,
    getSalaryHistoryAPIHandler,
    getAllAssignmentsAPIHandler,
    getAssignmentByIdAPIHandler,
    deactivateSalaryAPIHandler
} from './employee_assignment.controller';

const EMPLOYEE_ASSIGNMENT_ROUTER: Router = express.Router();

// ========================================
// 🔹 EMPLOYEE SALARY ASSIGNMENT ROUTES
// ========================================

// 1️⃣ Assign Salary to Employee
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/assign',
    accessTokenValidatorMiddleware,
    validateRequest(assignSalarySchema, 'body'),
    assignSalaryAPIHandler
);

// 2️⃣ Get Employee Current Salary
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/get-salary',
    accessTokenValidatorMiddleware,
    validateRequest(getEmployeeSalarySchema, 'body'),
    getEmployeeSalaryAPIHandler
);

// 3️⃣ Revise Salary (Create new version)
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/revise',
    accessTokenValidatorMiddleware,
    validateRequest(reviseSalarySchema, 'body'),
    reviseSalaryAPIHandler
);

// 4️⃣ Get Salary History
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/history',
    accessTokenValidatorMiddleware,
    validateRequest(getSalaryHistorySchema, 'body'),
    getSalaryHistoryAPIHandler
);

// 5️⃣ Get All Assignments
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/get_list',
    accessTokenValidatorMiddleware,
    validateRequest(getAllAssignmentsSchema, 'body'),
    getAllAssignmentsAPIHandler
);

// 6️⃣ Get Assignment by ID
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/get_by_employee_id',
    accessTokenValidatorMiddleware,
    validateRequest(getAssignmentByIdSchema, 'body'),
    getAssignmentByIdAPIHandler
);

// 7️⃣ Deactivate Salary Assignment
EMPLOYEE_ASSIGNMENT_ROUTER.post(
    '/deactivate',
    accessTokenValidatorMiddleware,
    validateRequest(deactivateSalarySchema, 'body'),
    deactivateSalaryAPIHandler
);

export default EMPLOYEE_ASSIGNMENT_ROUTER;
