import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { async_error_handler } from '../../../common/utils/async_error_handler';
import { apiResponse, apiDataResponse } from '../../../common/utils/api_response';
import { MESSAGES } from '../../../common/utils/messages';
import { LEAVE_TYPE_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-type.schema';
import { LEAVE_POLICY_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-policies.schema';
import { LEAVE_CALENDAR_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-calendar.schema';
import { LEAVE_LEDGER_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-ledger.schema';
import { EMPLOYEE_PROFILE_MODEL } from '../../../common/schemas/Employees/employee_onboarding.schema';
import { safeValidate } from '../../../common/utils/validation_middleware';
import {
    createLeaveTypeSchema,
    listLeaveTypesSchema,
    updateLeaveTypeStatusSchema,
    createLeavePolicySchema,
    getLeavePolicyByIdSchema,
    listLeavePoliciesSchema,
    deleteLeavePolicySchema,
    createHolidaySchema,
    listHolidaySchema,
    deleteHolidaySchema,
    createWeeklyOffSchema,
    getLeaveBalanceSchema
} from './leave_config.validator';

interface CustomRequest extends Request {
    user?: {
        user_id: string;
        session_id: string;
        organization_id?: string;
    };
}

//#region LEAVE TYPE CONFIGURATION
// ========== CREATE LEAVE TYPE API HANDLER ==========
const createLeaveTypeAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const {
        id,
        name,
        code,
        category,
        color,
        description,
        is_system,
        is_active
    } = req.body;

    const validation = safeValidate(createLeaveTypeSchema, {
        body: {
            name,
            code,
            category,
            color,
            description,
            is_system,
            is_active,
            id
        }
    });

    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const normalizedName = String(name).trim();
    const normalizedCode = String(code).trim().toUpperCase();

    const existingLeaveType = await LEAVE_TYPE_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        code: normalizedCode,
        ...(id ? { _id: { $ne: new Types.ObjectId(id) } } : {})
    });

    if (existingLeaveType) {
        res.status(409).json(apiResponse(409, 'Leave type code already exists'));
        return;
    }

    const payload = {
        organization_id: new Types.ObjectId(organization_id),
        name: normalizedName,
        code: normalizedCode,
        category,
        color,
        description,
        is_system,
        is_active
    };

    if (id) {
        const updatedLeaveType = await LEAVE_TYPE_MODEL.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                organization_id: new Types.ObjectId(organization_id)
            },
            { $set: payload },
            { new: true, runValidators: true }
        );

        if (!updatedLeaveType) {
            res.status(404).json(apiResponse(404, 'Leave type not found'));
            return;
        }

        res.status(200).json(apiDataResponse(200, 'Leave type updated', updatedLeaveType));
        return;
    }

    const leaveType = await LEAVE_TYPE_MODEL.create(payload);
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, leaveType));
});

// ========= LIST LEAVE TYPES API HANDLER ==========
const listLeaveTypesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    let { page, limit, search_key, is_active } = req.body;

    const validation = safeValidate(listLeaveTypesSchema, {
        body: { page, limit, search_key, is_active }
    });

    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const pageNumber = typeof page === 'string' ? Number(page) : Number(page ?? 1);
    const limitNumber = typeof limit === 'string' ? Number(limit) : Number(limit ?? 10);
    const safePage = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
    const safeLimit = Number.isFinite(limitNumber) && limitNumber > 0 ? limitNumber : 10;

    const query: Record<string, any> = {
        organization_id: new Types.ObjectId(organization_id)
    };

    if (search_key) {
        query.$or = [
            { name: { $regex: search_key, $options: 'i' } },
            { code: { $regex: search_key, $options: 'i' } }
        ];
    }

    if (typeof is_active === 'boolean') {
        query.is_active = is_active;
    }

    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
        LEAVE_TYPE_MODEL.find(query)
            .skip(skip)
            .limit(safeLimit)
            .sort({ createdAt: -1 }),
        LEAVE_TYPE_MODEL.countDocuments(query)
    ]);

    res.status(200).json(
        apiDataResponse(200, MESSAGES.SUCCESS, {
            data,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit)
            }
        })
    );
});

// ========= UPDATE LEAVE TYPE STATUS API HANDLER ==========
const updateLeaveTypeStatusAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { id, is_active } = req.body;

    const validation = safeValidate(updateLeaveTypeStatusSchema, {
        body: { id, is_active }
    });

    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const updatedLeaveType = await LEAVE_TYPE_MODEL.findOneAndUpdate(
        {
            _id: new Types.ObjectId(id),
            organization_id: new Types.ObjectId(organization_id)
        },
        { is_active },
        { new: true }
    );

    if (!updatedLeaveType) {
        res.status(404).json(apiResponse(404, 'Leave type not found'));
        return;
    }

    res.status(200).json(apiDataResponse(200, 'Leave type status updated', updatedLeaveType));
});
//#endregion


//#region  LEAVE POLICY CONFIGURATION
// ========== CREATE LEAVE POLICY API HANDLER ==========
const createLeavePolicyAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(createLeavePolicySchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const {
        id,
        policy_name,
        description,
        effective_from,
        effective_to,
        status,
        applicability,
        leave_rules,
        sandwich_rule
    } = validation.data?.body || {};

    const existingPolicy = await LEAVE_POLICY_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        policy_name,
        ...(id ? { _id: { $ne: new Types.ObjectId(id) } } : {})
    });

    if (existingPolicy) {
        res.status(409).json(apiResponse(409, 'Leave policy already exists'));
        return;
    }

    const payload = {
        organization_id: new Types.ObjectId(organization_id),
        policy_name,
        description,
        status,
        effective_from: new Date(effective_from),
        effective_to: effective_to ? new Date(effective_to) : undefined,
        applicability,
        leave_rules,
        sandwich_rule
    };

    if (id) {
        const updatedPolicy = await LEAVE_POLICY_MODEL.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                organization_id: new Types.ObjectId(organization_id)
            },
            { $set: payload },
            { new: true, runValidators: true }
        );

        if (!updatedPolicy) {
            res.status(404).json(apiResponse(404, 'Leave policy not found'));
            return;
        }

        res.status(200).json(apiDataResponse(200, 'Leave policy updated', updatedPolicy));
        return;
    }

    const policy = await LEAVE_POLICY_MODEL.create(payload);
    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, policy));
});

// ========== GET LEAVE POLICY BY ID API HANDLER ==========
const getLeavePolicyByIdAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(getLeavePolicyByIdSchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { id } = validation.data?.body || { id: '' };

    const policy = await LEAVE_POLICY_MODEL.findOne({
        _id: new Types.ObjectId(id),
        organization_id: new Types.ObjectId(organization_id)
    });

    if (!policy) {
        res.status(404).json(apiResponse(404, 'Leave policy not found'));
        return;
    }

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, policy));
});

// ========== LIST LEAVE POLICIES API HANDLER ==========
const listLeavePoliciesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(listLeavePoliciesSchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { page, limit, search_key, status } = validation.data?.body || {};
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const query: Record<string, any> = {
        organization_id: new Types.ObjectId(organization_id)
    };

    if (search_key) {
        query.policy_name = { $regex: search_key, $options: 'i' };
    }

    if (status) {
        query.status = status;
    }

    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
        LEAVE_POLICY_MODEL.find(query)
            .skip(skip)
            .limit(safeLimit)
            .sort({ createdAt: -1 }),
        LEAVE_POLICY_MODEL.countDocuments(query)
    ]);

    res.status(200).json(
        apiDataResponse(200, MESSAGES.SUCCESS, {
            policies_data: data,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages: Math.ceil(total / safeLimit)
            }
        })
    );
});

// ========== DELETE LEAVE POLICY API HANDLER ==========
const deleteLeavePolicyAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(deleteLeavePolicySchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { id } = validation.data?.body || { id: '' };

    const deletedPolicy = await LEAVE_POLICY_MODEL.findOneAndDelete({
        _id: new Types.ObjectId(id),
        organization_id: new Types.ObjectId(organization_id)
    });

    if (!deletedPolicy) {
        res.status(404).json(apiResponse(404, 'Leave policy not found'));
        return;
    }

    res.status(200).json(apiDataResponse(200, 'Leave policy deleted', deletedPolicy));
});
//#endregion


//#region HOLIDEY CONFIGURATION
// ========== CREATE/UPDATE HOLIDAY API HANDLER ==========
const createHolidayAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(createHolidaySchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const {
        id,
        name,
        date,
        description,
        type,
        is_optional,
        is_paid,
        color,
        applicable_to,
        applicable_locations,
        applicable_departments,
        applicable_employee_types,
        applicable_gender,
        optional_holiday_rules,
        is_active
    } = validation.data?.body || {};

    const holidayDate = new Date(date);
    const year = holidayDate.getFullYear();
    const normalizedApplicableTo = applicable_to
        ? String(applicable_to).toUpperCase()
        : 'ALL';

    const holidayPayload = {
        name,
        date: holidayDate,
        type,
        is_optional,
        is_paid,
        color: color || undefined,
        applicable_to: normalizedApplicableTo === 'SPECIFIC' ? 'SPECIFIC' : 'ALL',
        applicable_locations: applicable_locations || [],
        applicable_departments: applicable_departments || [],
        applicable_employee_types: applicable_employee_types || [],
        applicable_gender: applicable_gender || [],
        optional_holiday_rules: optional_holiday_rules || undefined,
        description: description || undefined,
        is_active
    };

    if (id) {
        const updatedCalendar = await LEAVE_CALENDAR_MODEL.findOneAndUpdate(
            {
                organization_id: new Types.ObjectId(organization_id),
                year,
                'holidays.holiday_id': new Types.ObjectId(id)
            },
            {
                $set: {
                    'holidays.$[holiday].name': holidayPayload.name,
                    'holidays.$[holiday].date': holidayPayload.date,
                    'holidays.$[holiday].type': holidayPayload.type,
                    'holidays.$[holiday].is_optional': holidayPayload.is_optional,
                    'holidays.$[holiday].is_paid': holidayPayload.is_paid,
                    'holidays.$[holiday].color': holidayPayload.color,
                    'holidays.$[holiday].applicable_to': holidayPayload.applicable_to,
                    'holidays.$[holiday].applicable_locations': holidayPayload.applicable_locations,
                    'holidays.$[holiday].applicable_departments': holidayPayload.applicable_departments,
                    'holidays.$[holiday].applicable_employee_types': holidayPayload.applicable_employee_types,
                    'holidays.$[holiday].applicable_gender': holidayPayload.applicable_gender,
                    'holidays.$[holiday].optional_holiday_rules': holidayPayload.optional_holiday_rules,
                    'holidays.$[holiday].description': holidayPayload.description,
                    'holidays.$[holiday].is_active': holidayPayload.is_active
                }
            },
            {
                new: true,
                arrayFilters: [{ 'holiday.holiday_id': new Types.ObjectId(id) }]
            }
        );

        if (!updatedCalendar) {
            res.status(404).json(apiResponse(404, 'Holiday not found'));
            return;
        }

        res.status(200).json(apiDataResponse(200, 'Holiday updated', updatedCalendar));
        return;
    }

    const updatedCalendar = await LEAVE_CALENDAR_MODEL.findOneAndUpdate(
        {
            organization_id: new Types.ObjectId(organization_id),
            year
        },
        {
            $setOnInsert: {
                organization_id: new Types.ObjectId(organization_id),
                year
            },
            $push: { holidays: holidayPayload }
        },
        { new: true, upsert: true }
    );

    res.status(200).json(apiDataResponse(200, 'Holiday created', updatedCalendar));
});

// ========== LIST HOLIDAYS API HANDLER ==========
const listHolidaysAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(listHolidaySchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { year, search_key, is_active } = validation.data?.body || {};
    const targetYear = year ?? new Date().getFullYear();

    const pipeline: any[] = [
        {
            $match: {
                organization_id: new Types.ObjectId(organization_id),
                year: targetYear
            }
        },
        { $unwind: '$holidays' }
    ];

    const holidayMatch: Record<string, any> = {};
    if (search_key) {
        holidayMatch['holidays.name'] = { $regex: search_key, $options: 'i' };
    }

    if (typeof is_active === 'boolean') {
        holidayMatch['holidays.is_active'] = is_active;
    }

    if (Object.keys(holidayMatch).length > 0) {
        pipeline.push({ $match: holidayMatch });
    }

    pipeline.push(
        {
            $project: {
                _id: 0,
                holiday_id: '$holidays.holiday_id',
                name: '$holidays.name',
                date: '$holidays.date',
                description: '$holidays.description',
                type: '$holidays.type',
                is_optional: '$holidays.is_optional',
                is_paid: '$holidays.is_paid',
                color: '$holidays.color',
                applicable_to: '$holidays.applicable_to',
                applicable_locations: '$holidays.applicable_locations',
                applicable_departments: '$holidays.applicable_departments',
                applicable_employee_types: '$holidays.applicable_employee_types',
                applicable_gender: '$holidays.applicable_gender',
                optional_holiday_rules: '$holidays.optional_holiday_rules',
                is_active: '$holidays.is_active'
            }
        },
        { $sort: { date: 1 } }
    );

    const holidays = await LEAVE_CALENDAR_MODEL.aggregate(pipeline);

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, {
        year: targetYear,
        data: holidays
    }));
});

// ========== DELETE HOLIDAY API HANDLER ==========
const deleteHolidayAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(deleteHolidaySchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }
    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }
    const { id, year } = validation.data?.body || { id: '' };
    const calendarQuery: Record<string, any> = {
        organization_id: new Types.ObjectId(organization_id)
    };
    if (year) {
        calendarQuery.year = year;
    }
    const updatedCalendar = await LEAVE_CALENDAR_MODEL.findOneAndUpdate(
        {
            ...calendarQuery,
            'holidays.holiday_id': new Types.ObjectId(id)
        },
        {
            $pull: {
                holidays: { holiday_id: new Types.ObjectId(id) }
            }
        },
        { new: true }
    );
    if (!updatedCalendar) {
        res.status(404).json(apiResponse(404, 'Holiday not found'));
        return;
    }
    res.status(200).json(apiDataResponse(200, 'Holiday deleted', updatedCalendar));
});


//#region WEEKLY OFF CONFIGURATION

// ========== CREATE/UPDATE WEEKLY OFF API HANDLER ==========
const createWeeklyOffAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(createWeeklyOffSchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { id, name, effectiveFrom, offDays } = validation.data?.body || {};
    const effectiveDate = new Date(effectiveFrom);
    const year = effectiveDate.getFullYear();

    const weeks = Object.keys(offDays || {})
        .map((weekKey) => {
            const weekNumber = Number(weekKey);
            const days = offDays?.[weekKey as keyof typeof offDays];
            if (!weekNumber || !days) return null;
            return {
                week: weekNumber,
                days: {
                    mon: days.Mon,
                    tue: days.Tue,
                    wed: days.Wed,
                    thu: days.Thu,
                    fri: days.Fri,
                    sat: days.Sat,
                    sun: days.Sun
                }
            };
        })
        .filter((item): item is { week: number; days: any } => Boolean(item));

    const weeklyOffPayload = {
        policy_name: name,
        effective_from: effectiveDate,
        applicable_employees: 'ALL',
        weeks
    };

    if (id) {
        const updatedCalendar = await LEAVE_CALENDAR_MODEL.findOneAndUpdate(
            {
                organization_id: new Types.ObjectId(organization_id),
                year,
                'weekly_off_policy.policy_id': new Types.ObjectId(id)
            },
            {
                $set: {
                    'weekly_off_policy.policy_name': weeklyOffPayload.policy_name,
                    'weekly_off_policy.effective_from': weeklyOffPayload.effective_from,
                    'weekly_off_policy.applicable_employees': weeklyOffPayload.applicable_employees,
                    'weekly_off_policy.weeks': weeklyOffPayload.weeks
                }
            },
            { new: true }
        );

        if (!updatedCalendar) {
            res.status(404).json(apiResponse(404, 'Weekly off policy not found'));
            return;
        }

        res.status(200).json(apiDataResponse(200, 'Weekly off policy updated', updatedCalendar));
        return;
    }

    const updatedCalendar = await LEAVE_CALENDAR_MODEL.findOneAndUpdate(
        {
            organization_id: new Types.ObjectId(organization_id),
            year
        },
        {
            $setOnInsert: {
                organization_id: new Types.ObjectId(organization_id),
                year
            },
            $set: {
                weekly_off_policy: weeklyOffPayload
            }
        },
        { new: true, upsert: true }
    );

    res.status(200).json(apiDataResponse(200, 'Weekly off policy created', updatedCalendar));
});

//#endregion

//#region LEAVE BALANCE API




//#endregion
const calculateAccruedCredits = (
    accrual: { frequency?: string; credit_amount?: number; max_balance?: number } | undefined,
    startDate: Date,
    asOfDate: Date
): number => {
    if (!accrual?.frequency || accrual.credit_amount == null) return 0;

    let credits = 0;
    if (accrual.frequency === 'MONTHLY') {
        const months = (asOfDate.getFullYear() - startDate.getFullYear()) * 12 + (asOfDate.getMonth() - startDate.getMonth());
        const fullMonths = asOfDate.getDate() >= startDate.getDate() ? months : months - 1;
        credits = Math.max(0, fullMonths) * accrual.credit_amount;
    } else if (accrual.frequency === 'QUARTERLY') {
        const months = (asOfDate.getFullYear() - startDate.getFullYear()) * 12 + (asOfDate.getMonth() - startDate.getMonth());
        const fullMonths = asOfDate.getDate() >= startDate.getDate() ? months : months - 1;
        credits = Math.max(0, Math.floor(fullMonths / 3)) * accrual.credit_amount;
    } else if (accrual.frequency === 'YEARLY') {
        credits = accrual.credit_amount;
    }

    if (accrual.max_balance != null) {
        credits = Math.min(credits, accrual.max_balance);
    }

    return credits;
};

const getLeaveBalanceAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(getLeaveBalanceSchema, { body: req.body });
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }

    const organization_id = req.user?.organization_id || req.body.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization id is required'));
        return;
    }

    const { employee_id, as_of_date } = validation.data?.body || { employee_id: '' };
    const asOfDate = as_of_date ? new Date(as_of_date) : new Date();

    const employee = await EMPLOYEE_PROFILE_MODEL.findOne({
        _id: new Types.ObjectId(employee_id),
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    });

    if (!employee) {
        res.status(404).json(apiResponse(404, 'Employee not found'));
        return;
    }

    const policy = await LEAVE_POLICY_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        status: 'ACTIVE',
        effective_from: { $lte: asOfDate },
        $or: [
            { effective_to: { $gte: asOfDate } },
            { effective_to: { $exists: false } },
            { effective_to: null }
        ]
    }).sort({ effective_from: -1 });

    if (!policy) {
        res.status(404).json(apiResponse(404, 'Active leave policy not found'));
        return;
    }

    const employeeType = employee?.job_details?.employmentType?.toUpperCase();
    const employeeGender = employee?.personal_details?.gender?.toUpperCase();
    const employeeMaritalStatus = employee?.personal_details?.maritalStatus?.toUpperCase();

    const applicability:any = policy.applicability || {};
    if (
        (applicability.employee_type && applicability.employee_type !== 'ALL' && applicability.employee_type !== employeeType) ||
        (applicability.gender && applicability.gender !== 'ALL' && applicability.gender !== employeeGender) ||
        (applicability.marital_status && applicability.marital_status !== 'ALL' && applicability.marital_status !== employeeMaritalStatus)
    ) {
        res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, {
            summary: { total_balance: 0, total_credits: 0, total_used: 0 },
            balances: []
        }));
        return;
    }

    const leaveTypeIds = policy.leave_rules.map((rule) => rule.leave_type_id);
    const leaveTypes = await LEAVE_TYPE_MODEL.find({ _id: { $in: leaveTypeIds } }).lean();
    const leaveTypeMap = new Map(leaveTypes.map((lt) => [String(lt._id), lt]));

    const balances = [] as Array<any>;
    let totalCredits = 0;
    let totalUsed = 0;

    for (const rule of policy.leave_rules) {
        const leaveType = leaveTypeMap.get(String(rule.leave_type_id));
        const ledgerTotals = await LEAVE_LEDGER_MODEL.aggregate([
            {
                $match: {
                    organization_id: new Types.ObjectId(organization_id),
                    employee_uuid: new Types.ObjectId(employee._id),
                    leave_type_id: new Types.ObjectId(rule.leave_type_id),
                    effective_date: { $lte: asOfDate }
                }
            },
            { $group: { _id: '$entry_type', total: { $sum: '$quantity' } } }
        ]);

        const totals = ledgerTotals.reduce((acc: Record<string, number>, row: { _id: string; total: number }) => {
            acc[row._id] = row.total;
            return acc;
        }, {});

        const ledgerCredits = (totals.CREDIT || 0) + (totals.ADJUSTMENT || 0);
        const ledgerDebits = totals.DEBIT || 0;
        const ledgerReversals = totals.REVERSAL || 0;

        const ruleCredits = calculateAccruedCredits(
            rule.accrual as any,
            employee?.job_details?.joiningDate || employee?.createdAt || new Date(),
            asOfDate
        );

        const credit = ledgerCredits > 0 ? ledgerCredits : ruleCredits;
        const used = Math.max(0, ledgerDebits - ledgerReversals);
        const balance = credit - used;

        totalCredits += credit;
        totalUsed += used;

        balances.push({
            leave_type_id: rule.leave_type_id,
            leave_type_name: leaveType?.name || null,
            leave_type_code: leaveType?.code || null,
            credited: credit,
            used,
            balance
        });
    }

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, {
        summary: {
            total_balance: totalCredits - totalUsed,
            total_credits: totalCredits,
            total_used: totalUsed
        },
        balances
    }));
});

export {
    createLeaveTypeAPIHandler,
    listLeaveTypesAPIHandler,
    updateLeaveTypeStatusAPIHandler,
    createLeavePolicyAPIHandler,
    getLeavePolicyByIdAPIHandler,
    listLeavePoliciesAPIHandler,
    deleteLeavePolicyAPIHandler,
    createHolidayAPIHandler,
    listHolidaysAPIHandler,
    deleteHolidayAPIHandler,
    createWeeklyOffAPIHandler,
    getLeaveBalanceAPIHandler
};

