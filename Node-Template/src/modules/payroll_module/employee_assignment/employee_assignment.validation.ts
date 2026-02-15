import { z } from 'zod';

const objectId = z.string().min(12);

// 1️⃣ ASSIGN SALARY
export const assignSalarySchema = z.object({
    body: z.object({
        employee_id: objectId,
        template_id: objectId,
        annual_ctc: z.number().positive('Annual CTC must be positive'),
        monthly_gross: z.number().positive('Monthly Gross must be positive'),
        effective_from: z.string().datetime(),
        payroll_start_month: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
    }).refine((data) => {
        // Monthly gross should be approximately annual_ctc / 12
        const expectedMonthly = data.annual_ctc / 12;
        // Allow 2% tolerance
        const tolerance = expectedMonthly * 0.02;
        return Math.abs(data.monthly_gross - expectedMonthly) <= tolerance;
    }, {
        message: 'Monthly Gross should be approximately Annual CTC / 12'
    })
});

// 2️⃣ GET EMPLOYEE SALARY
export const getEmployeeSalarySchema = z.object({
    body: z.object({
        employee_id: objectId
    })
});

// 3️⃣ REVISE SALARY
export const reviseSalarySchema = z.object({
    body: z.object({
        employee_id: objectId,
        template_id: objectId.optional(),
        annual_ctc: z.number().positive().optional(),
        monthly_gross: z.number().positive().optional(),
        effective_from: z.string().datetime(),
        earnings_overrides: z.array(z.object({
            component_id: objectId,
            monthly_value: z.number().optional(),
            annual_value: z.number().optional()
        })).optional(),
        reason: z.string().optional()
    }).refine((data) => {
        // If providing monthly_gross and annual_ctc, validate relationship
        if (data.monthly_gross && data.annual_ctc) {
            const expectedMonthly = data.annual_ctc / 12;
            const tolerance = expectedMonthly * 0.02;
            return Math.abs(data.monthly_gross - expectedMonthly) <= tolerance;
        }
        return true;
    }, {
        message: 'Monthly Gross should be approximately Annual CTC / 12'
    })
});

// 4️⃣ GET SALARY HISTORY
export const getSalaryHistorySchema = z.object({
    body: z.object({
        employee_id: objectId,
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10)
    })
});

// 5️⃣ DEACTIVATE SALARY
export const deactivateSalarySchema = z.object({
    body: z.object({
        id: objectId,
        reason: z.string().optional()
    })
});

// 6️⃣ GET ALL ASSIGNMENTS (LIST)
export const getAllAssignmentsSchema = z.object({
    body: z.object({
        status: z.enum(['ASSIGNED', 'NOT_ASSIGNED']).optional().nullable(),
        search: z.string().optional().nullable(),
        department_id: objectId.optional().nullable(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(100)
    })
});

// 7️⃣ GET ASSIGNMENT BY ID
export const getAssignmentByIdSchema = z.object({
    body: z.object({
        id: objectId
    })
});

// 8️⃣ VALIDATE CTC
export const validateCTCSchema = z.object({
    body: z.object({
        template_id: objectId,
        annual_ctc: z.number().positive()
    })
});
