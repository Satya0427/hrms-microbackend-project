import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { async_error_handler } from '../../../common/utils/async_error_handler';
import { apiDataResponse, apiResponse } from '../../../common/utils/api_response';
import { MESSAGES } from '../../../common/utils/messages';
import { EMPLOYEE_SALARY_ASSIGNMENT_MODEL, IEarningsSnapshot, IDeductionsSnapshot } from '../../../common/schemas/payroll-module-schema/payroll-structure/employee_salary_assignment.schema';
import { PAYROLL_SALARY_TEMPLATE_MODEL } from '../../../common/schemas/payroll-module-schema/payroll-structure/payroll_salary_template.schema';
import { PAYROLL_SALARY_COMPONENT_MODEL } from '../../../common/schemas/payroll-module-schema/payroll-structure/payroll_salary_components.schema';

interface CustomRequest extends Request {
    user?: {
        user_id: string;
        session_id: string;
        organization_id?: string;
    };
}

// ========================================
// 🔹 EMPLOYEE SALARY ASSIGNMENT REGION
// ========================================

// 1️⃣ ASSIGN SALARY TO EMPLOYEE
const assignSalaryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const user_id = req.user?.user_id;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const {
        employee_id,
        template_id,
        annual_ctc,
        monthly_gross,
        effective_from,
        payroll_start_month,
        status
    } = req.body;

    // 🔴 BUSINESS LOGIC 1: Only one active salary record per employee
    const existingActive = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        is_active: true,
        is_deleted: false
    });

    if (existingActive) {
        res.status(409).json(apiResponse(409, 'Employee already has an active salary assignment. Revise instead of creating new.'));
        return;
    }

    // 🔴 BUSINESS LOGIC 2: Verify template exists and is active
    const template = await PAYROLL_SALARY_TEMPLATE_MODEL.findOne({
        _id: new Types.ObjectId(template_id),
        organization_id: new Types.ObjectId(organization_id),
        status: 'ACTIVE',
        is_deleted: false
    });

    if (!template) {
        res.status(400).json(apiResponse(400, 'Template not found or is inactive'));
        return;
    }

    // 🔴 BUSINESS LOGIC 3: Template must have components
    if (!template.earnings || template.earnings.length === 0) {
        res.status(400).json(apiResponse(400, 'Selected template has no earnings components configured'));
        return;
    }

    // 🔴 BUSINESS LOGIC 4: Fetch and validate all components
    const allComponentIds = [
        ...template.earnings.map(e => new Types.ObjectId(e.component_id)),
        ...template.deductions.map(d => new Types.ObjectId(d.component_id))
    ];

    const components = await PAYROLL_SALARY_COMPONENT_MODEL.find({
        _id: { $in: allComponentIds },
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    }).lean();

    if (components.length !== allComponentIds.length) {
        res.status(400).json(apiResponse(400, 'One or more components in template not found'));
        return;
    }

    // 🔴 BUSINESS LOGIC 5: Create earnings snapshot
    const earningsSnapshot: IEarningsSnapshot[] = [];
    let totalEarningsMonthly = 0;
    let totalEarningsAnnual = 0;

    for (const earning of template.earnings) {
        const component = components.find(c => c._id.equals(earning.component_id));
        if (!component) continue;

        let monthlyValue = 0;
        let annualValue = 0;

        if (earning.value_type === 'fixed') {
            monthlyValue = earning.fixed_amount || 0;
            annualValue = monthlyValue * 12;
        } else if (earning.value_type === 'percentage') {
            // Calculate percentage of annual CTC
            annualValue = (annual_ctc * (earning.percentage || 0)) / 100;
            monthlyValue = annualValue / 12;
        } else {
            // For formula or other types
            monthlyValue = earning.fixed_amount || 0;
            annualValue = monthlyValue * 12;
        }

        totalEarningsMonthly += monthlyValue;
        totalEarningsAnnual += annualValue;

        earningsSnapshot.push({
            component_id: new Types.ObjectId(earning.component_id),
            component_code: component.component_code,
            component_name: component.component_name,
            value_type: earning.value_type as 'FIXED' | 'PERCENTAGE',
            fixed_amount: earning.fixed_amount,
            percentage: earning.percentage,
            formula: earning.formula,
            monthly_value: Math.round(monthlyValue * 100) / 100,
            annual_value: Math.round(annualValue * 100) / 100,
            override_allowed: earning.override_allowed,
            is_mandatory: earning.is_mandatory,
            calculation_order: earning.calculation_order
        });
    }

    // 🔴 BUSINESS LOGIC 6: Create deductions snapshot
    const deductionsSnapshot: IDeductionsSnapshot[] = [];
    let totalDeductionsMonthly = 0;

    for (const deduction of template.deductions) {
        const component = components.find(c => c._id.equals(deduction.component_id));
        if (!component) continue;

        let monthlyValue = 0;

        if (component.calculation_type === 'fixed') {
            monthlyValue = component.fixed_amount || 0;
        } else if (component.calculation_type === 'percentage_of_basic') {
            if (component.percentage !== undefined) {
                const basicComponent = components.find(c => c.is_basic === true);
                if (basicComponent) {
                    const basicMonthly = basicComponent.fixed_amount || 0;
                    monthlyValue = (basicMonthly * component.percentage) / 100;
                    
                    // Apply max cap if exists
                    if (component.max_cap && monthlyValue > component.max_cap) {
                        monthlyValue = component.max_cap;
                    }
                }
            }
        }

        totalDeductionsMonthly += monthlyValue;

        deductionsSnapshot.push({
            component_id: new Types.ObjectId(deduction.component_id),
            component_code: component.component_code,
            component_name: component.component_name,
            deduction_nature: component.deduction_nature,
            calculation_type: component.calculation_type,
            percentage: component.percentage,
            fixed_amount: component.fixed_amount,
            formula: component.formula,
            employer_contribution: component.employer_contribution,
            employee_contribution: component.employee_contribution,
            max_cap: component.max_cap,
            monthly_value: Math.round(monthlyValue * 100) / 100,
            override_allowed: deduction.override_allowed
        });
    }

    // 🔴 BUSINESS LOGIC 7: Validate CTC matches earnings
    const ctcTolerance = annual_ctc * 0.02; // 2% tolerance
    if (Math.abs(totalEarningsAnnual - annual_ctc) > ctcTolerance) {
        res.status(400).json(apiResponse(400, `CTC mismatch. Earnings total: ${totalEarningsAnnual}, Expected: ${annual_ctc}`));
        return;
    }

    // Create assignment with snapshots
    const assignmentPayload: any = {
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        template_id: new Types.ObjectId(template_id),
        annual_ctc,
        monthly_gross: Math.round(monthly_gross * 100) / 100,
        effective_from: new Date(effective_from),
        status: status || 'ACTIVE',
        version: 1,
        earnings_snapshot: earningsSnapshot,
        deductions_snapshot: deductionsSnapshot,
        is_active: true,
        is_deleted: false,
        created_by: new Types.ObjectId(user_id)
    };

    const assignment = new EMPLOYEE_SALARY_ASSIGNMENT_MODEL(assignmentPayload);
    const created = await assignment.save();

    // 🔴 UPDATE TEMPLATE: Increment employees_count
    await PAYROLL_SALARY_TEMPLATE_MODEL.updateOne(
        { _id: new Types.ObjectId(template_id) },
        { $inc: { employees_count: 1 } }
    );

    res.status(201).json(apiDataResponse(201, 'Salary assigned successfully', {
        assignment_id: created._id,
        version: 1,
        annual_ctc,
        monthly_gross: Math.round(monthly_gross * 100) / 100
    }));
});

// 2️⃣ GET EMPLOYEE CURRENT SALARY
const getEmployeeSalaryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const { employee_id } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const assignment = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        is_active: true,
        is_deleted: false
    })
    .populate('template_id', 'template_name template_code status')
    .lean();

    if (!assignment) {
        res.status(404).json(apiResponse(404, 'No active salary assignment found for this employee'));
        return;
    }

    // Calculate summary
    const earningsSummary = {
        total_monthly: assignment.earnings_snapshot.reduce((sum, e) => sum + e.monthly_value, 0),
        total_annual: assignment.earnings_snapshot.reduce((sum, e) => sum + e.annual_value, 0),
        count: assignment.earnings_snapshot.length
    };

    const deductionsSummary = {
        total_monthly: assignment.deductions_snapshot.reduce((sum, d) => sum + d.monthly_value, 0),
        count: assignment.deductions_snapshot.length
    };

    const netSalary = {
        monthly: earningsSummary.total_monthly - deductionsSummary.total_monthly,
        annual: earningsSummary.total_annual - (deductionsSummary.total_monthly * 12)
    };

    const enhancedAssignment = {
        ...assignment,
        earnings_summary: earningsSummary,
        deductions_summary: deductionsSummary,
        net_salary: netSalary
    };

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, enhancedAssignment));
});

// 3️⃣ REVISE SALARY (Create new version, deactivate old)
const reviseSalaryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const user_id = req.user?.user_id;
    const { employee_id, template_id, annual_ctc, monthly_gross, effective_from, earnings_overrides, reason } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    // Get current active assignment
    const currentAssignment = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.findOne({
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        is_active: true,
        is_deleted: false
    });

    if (!currentAssignment) {
        res.status(404).json(apiResponse(404, 'No active salary assignment found to revise'));
        return;
    }

    // 🔴 BUSINESS LOGIC: Effective date cannot be before current active assignment
    const effectiveDate = new Date(effective_from);
    if (effectiveDate < currentAssignment.effective_from) {
        res.status(400).json(apiResponse(400, 'Effective date cannot be before current assignment date'));
        return;
    }

    // Prepare new assignment data
    const newTemplateId = template_id || currentAssignment.template_id;
    const newAnnualCtc = annual_ctc || currentAssignment.annual_ctc;
    const newMonthlyGross = monthly_gross || currentAssignment.monthly_gross;

    // If template changed, fetch and validate new template
    let template = currentAssignment.template_id.equals(newTemplateId) 
        ? null 
        : await PAYROLL_SALARY_TEMPLATE_MODEL.findOne({
            _id: new Types.ObjectId(newTemplateId),
            organization_id: new Types.ObjectId(organization_id),
            status: 'ACTIVE',
            is_deleted: false
        });

    if (template_id && !template) {
        res.status(400).json(apiResponse(400, 'New template not found or is inactive'));
        return;
    }

    // Use current template if not changing
    if (!template) {
        template = await PAYROLL_SALARY_TEMPLATE_MODEL.findById(currentAssignment.template_id).lean() as any;
    }

    // Fetch components
    const allComponentIds = [
        ...template!.earnings.map(e => new Types.ObjectId(e.component_id)),
        ...template!.deductions.map(d => new Types.ObjectId(d.component_id))
    ];

    const components = await PAYROLL_SALARY_COMPONENT_MODEL.find({
        _id: { $in: allComponentIds },
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    }).lean();

    // Create new earnings snapshot with overrides
    const newEarningsSnapshot: IEarningsSnapshot[] = [];
    let totalEarningsAnnual = 0;

    for (const earning of template!.earnings) {
        const component = components.find(c => c._id.equals(earning.component_id));
        if (!component) continue;

        // Check for overrides
        const override = earnings_overrides?.find((o: any) => o.component_id === earning.component_id.toString());

        let monthlyValue = override?.monthly_value || 0;
        let annualValue = override?.annual_value || 0;

        if (!override) {
            // Calculate values same as assignment
            if (earning.value_type === 'fixed') {
                monthlyValue = earning.fixed_amount || 0;
            } else if (earning.value_type === 'percentage') {
                annualValue = (newAnnualCtc * (earning.percentage || 0)) / 100;
                monthlyValue = annualValue / 12;
            } else {
                // For formula or other types
                monthlyValue = earning.fixed_amount || 0;
            }
            annualValue = monthlyValue * 12;
        }

        totalEarningsAnnual += annualValue;

        newEarningsSnapshot.push({
            component_id: new Types.ObjectId(earning.component_id),
            component_code: component.component_code,
            component_name: component.component_name,
            value_type: earning.value_type as 'FIXED' | 'PERCENTAGE',
            fixed_amount: earning.fixed_amount,
            percentage: earning.percentage,
            formula: earning.formula,
            monthly_value: Math.round(monthlyValue * 100) / 100,
            annual_value: Math.round(annualValue * 100) / 100,
            override_allowed: earning.override_allowed,
            is_mandatory: earning.is_mandatory,
            calculation_order: earning.calculation_order
        });
    }

    // Create new deductions snapshot
    const newDeductionsSnapshot: IDeductionsSnapshot[] = [];
    for (const deduction of template!.deductions) {
        const component = components.find(c => c._id.equals(deduction.component_id));
        if (!component) continue;

        let monthlyValue = 0;
        if (component.calculation_type === 'fixed') {
            monthlyValue = component.fixed_amount || 0;
        } else if (component.calculation_type === 'percentage_of_basic') {
            if (component.percentage !== undefined) {
                const basicComponent = components.find(c => c.is_basic === true);
                if (basicComponent) {
                    const basicMonthly = basicComponent.fixed_amount || 0;
                    monthlyValue = (basicMonthly * component.percentage) / 100;
                    if (component.max_cap && monthlyValue > component.max_cap) {
                        monthlyValue = component.max_cap;
                    }
                }
            }
        }

        newDeductionsSnapshot.push({
            component_id: new Types.ObjectId(deduction.component_id),
            component_code: component.component_code,
            component_name: component.component_name,
            deduction_nature: component.deduction_nature,
            calculation_type: component.calculation_type,
            percentage: component.percentage,
            fixed_amount: component.fixed_amount,
            formula: component.formula,
            employer_contribution: component.employer_contribution,
            employee_contribution: component.employee_contribution,
            max_cap: component.max_cap,
            monthly_value: Math.round(monthlyValue * 100) / 100,
            override_allowed: deduction.override_allowed
        });
    }

    // Deactivate old assignment
    await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.updateOne(
        { _id: currentAssignment._id },
        {
            $set: {
                is_active: false,
                status: 'REVISED',
                updated_by: new Types.ObjectId(user_id)
            }
        }
    );

    // Create new revised assignment
    const revisedAssignmentPayload: any = {
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        template_id: new Types.ObjectId(newTemplateId),
        annual_ctc: newAnnualCtc,
        monthly_gross: newMonthlyGross,
        effective_from: effectiveDate,
        status: 'ACTIVE',
        version: (currentAssignment.version || 0) + 1,
        earnings_snapshot: newEarningsSnapshot,
        deductions_snapshot: newDeductionsSnapshot,
        is_active: true,
        is_deleted: false,
        created_by: new Types.ObjectId(user_id)
    };

    const revisedAssignment = new EMPLOYEE_SALARY_ASSIGNMENT_MODEL(revisedAssignmentPayload);
    const created = await revisedAssignment.save();

    res.status(201).json(apiDataResponse(201, 'Salary revised successfully', {
        assignment_id: created._id,
        version: created.version,
        previous_version: currentAssignment.version
    }));
});

// 4️⃣ GET SALARY HISTORY
const getSalaryHistoryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const { employee_id, page, limit } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = {
        organization_id: new Types.ObjectId(organization_id),
        employee_id: new Types.ObjectId(employee_id),
        is_deleted: false
    };

    const totalCount = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.countDocuments(query);

    const history = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.find(query)
        .select('version status effective_from annual_ctc monthly_gross is_active createdAt')
        .sort({ version: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, {
        history,
        pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_count: totalCount,
            limit: limitNum,
            has_next: pageNum < totalPages,
            has_prev: pageNum > 1
        }
    }));
});

// 5️⃣ GET ALL ASSIGNMENTS (Employee List)
const getAllAssignmentsAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const { status, search, department_id, page, limit } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    };

    // Filter by assignment status
    if (status === 'ASSIGNED') {
        query.is_active = true;
    } else if (status === 'NOT_ASSIGNED') {
        // This would need a different query - employees without assignments
        // For now, filtering by is_active
        query.is_active = false;
    }

    const totalCount = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.countDocuments(query);

    const assignments = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.find(query)
        .select('employee_id template_id annual_ctc monthly_gross effective_from status is_active version createdAt')
        .populate('employee_id', 'employee_name employee_id department_id designation_id')
        .populate('template_id', 'template_name template_code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Enhance with computed field: Used By (employees_count from template)
    const enhancedAssignments = assignments.map(a => ({
        ...a,
        status_display: a.is_active ? 'ACTIVE' : 'REVISED'
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, {
        assignments: enhancedAssignments,
        pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_count: totalCount,
            limit: limitNum,
            has_next: pageNum < totalPages,
            has_prev: pageNum > 1
        }
    }));
});

// 6️⃣ GET ASSIGNMENT BY ID
const getAssignmentByIdAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const { id } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const assignment = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.findOne({
        _id: new Types.ObjectId(id),
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    })
    .populate('employee_id', 'employee_name employee_id department_id designation_id email')
    .populate('template_id', 'template_name template_code status')
    .lean();

    if (!assignment) {
        res.status(404).json(apiResponse(404, 'Assignment not found'));
        return;
    }

    // Calculate summaries
    const earningsSummary = {
        total_monthly: assignment.earnings_snapshot.reduce((sum, e) => sum + e.monthly_value, 0),
        total_annual: assignment.earnings_snapshot.reduce((sum, e) => sum + e.annual_value, 0),
        components: assignment.earnings_snapshot.length
    };

    const deductionsSummary = {
        total_monthly: assignment.deductions_snapshot.reduce((sum, d) => sum + d.monthly_value, 0),
        total_annual: assignment.deductions_snapshot.reduce((sum, d) => sum + (d.monthly_value * 12), 0),
        components: assignment.deductions_snapshot.length
    };

    const netSalary = {
        monthly: earningsSummary.total_monthly - deductionsSummary.total_monthly,
        annual: earningsSummary.total_annual - deductionsSummary.total_annual
    };

    const enhancedAssignment = {
        ...assignment,
        earnings_summary: earningsSummary,
        deductions_summary: deductionsSummary,
        net_salary: netSalary
    };

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, enhancedAssignment));
});

// 7️⃣ DEACTIVATE SALARY
const deactivateSalaryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id = req.user?.organization_id;
    const user_id = req.user?.user_id;
    const { id, reason } = req.body;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const assignment = await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.findOne({
        _id: new Types.ObjectId(id),
        organization_id: new Types.ObjectId(organization_id),
        is_deleted: false
    });

    if (!assignment) {
        res.status(404).json(apiResponse(404, 'Assignment not found'));
        return;
    }

    // Update to inactive
    await EMPLOYEE_SALARY_ASSIGNMENT_MODEL.updateOne(
        { _id: new Types.ObjectId(id) },
        {
            $set: {
                is_active: false,
                status: 'INACTIVE',
                updated_by: new Types.ObjectId(user_id)
            }
        }
    );

    // Decrement template employees_count
    await PAYROLL_SALARY_TEMPLATE_MODEL.updateOne(
        { _id: assignment.template_id },
        { $inc: { employees_count: -1 } }
    );

    res.status(200).json(apiResponse(200, 'Salary assignment deactivated successfully'));
});



// ========================================
// 🔹 EXPORTS
// ========================================

export {
    assignSalaryAPIHandler,
    getEmployeeSalaryAPIHandler,
    reviseSalaryAPIHandler,
    getSalaryHistoryAPIHandler,
    getAllAssignmentsAPIHandler,
    getAssignmentByIdAPIHandler,
    deactivateSalaryAPIHandler
};
