import { Request, Response } from 'express';
import { async_error_handler } from '../../utils/async_error_handler';
import { apiDataResponse, apiResponse } from '../../utils/api_response';
import { MESSAGES } from '../../utils/messages';
import { ORGANIZATION_MODEL } from '../../schemas/Organizations/organization.schema';
import { safeValidate } from '../../utils/validation_middleware';
import { leaveTypesDropdownSchema, organizationsDropdownSchema } from './dropdown.validator';
import { DEPARTMENT_MODEL } from '../../../common/schemas/departments_designations/departments.schema';
import { DESIGNATION_MODEL } from '../../../common/schemas/departments_designations/designation.schema';
import { EMPLOYEE_USER_MODEL } from '../../../common/schemas/Employees/user.schema';
import { LEAVE_TYPE_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-type.schema';
import { Types } from 'mongoose';
import { getGridFSBucket } from '../../../config/db_connections/gridfs';

interface CustomRequest extends Request {
    user?: {
        user_id: string;
        session_id: string;
        organization_id: string;
    };
}

//  GET ORGANIZATIONS FOR DROPDOWN (Without Pagination)
const getOrganizationsDropdownAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const validation = safeValidate(organizationsDropdownSchema, req.body);
    if (!validation.success) {
        res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
        return;
    }
    const { search_key } = validation.data || {};
    const query: any = { is_deleted: false, is_active: true };
    if (search_key) {
        query.$or = [
            { 'organization.organization_name': { $regex: search_key, $options: "i" } }
        ];
    }

    // Get only organization_name and _id fields
    const organizations = await ORGANIZATION_MODEL.find(query)
        .select('organization._id organization.organization_name _id')
        .sort({ 'organization.organization_name': 1 })
        .lean();
    const dropdownData = organizations.map(org => ({
        org_id: org._id,
        org_name: org.organization.organization_name
    }));

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, dropdownData));
});

const getDepartmentsByOrganizationAPIHandler = async_error_handler(
    async (req: CustomRequest, res: Response) => {

        const organization_id = req.user?.organization_id;

        if (!organization_id) {
            res.status(400).json(apiResponse(400, "Organization Id is Required"));
            return;
        }

        /* ================= QUERY ================= */
        const departments = await DEPARTMENT_MODEL.find({
            organization_id: organization_id,
            is_deleted: false,
            is_active: true
        })
            .select("_id department_code department_name")
            .sort({ department_name: 1 });

        /* ================= RESPONSE ================= */
        res.status(200).json(apiDataResponse(200, "Departments fetched successfully", departments));
    }
);


const getDesignationsByDepartmentAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {

    const { departmentId } = req.body;
    const organizationId = req.user?.organization_id

    if (!departmentId || !organizationId) {
        res.status(400).json(apiResponse(400, "DepartmentId and organizationId is required"));
        return;
    }


    /* ================= QUERY ================= */
    const designations = await DESIGNATION_MODEL.find({
        organization_id: organizationId,
        department_id: departmentId,
        is_deleted: false,
        is_active: true
    })
        .select("_id designation_code designation_name level")
        .sort({ level: 1 });

    /* ================= RESPONSE ================= */
    res.status(200).json(apiDataResponse(200, "Designations fetched successfully", designations));
}
);

const getEmployeeByOrganizationAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {

    const organization_id = req.user?.organization_id;

    if (!organization_id) {
        res.status(400).json(apiResponse(400, "Organization Id is required"));
        return
    }

    const employees = await EMPLOYEE_USER_MODEL.aggregate([
        {
            $match: {
                organization_id: organization_id,
                is_deleted: false
            }
        },
        {
            $project: {
                _id: 1,
                first_name: 1,
                last_name: 1,
                emp_name: {
                    $trim: {
                        input: {
                            $concat: [
                                { $ifNull: ["$first_name", ""] },
                                " ",
                                { $ifNull: ["$last_name", ""] }
                            ]
                        }
                    }
                }
            }
        },
        {
            $sort: { emp_name: 1 }
        }
    ]);

    const dropdownData = employees.map(emp => ({
        id: emp._id,
        emp_name: emp.emp_name
    }));

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, dropdownData));
}
);

// GET LEAVE TYPES FOR DROPDOWN (Without Pagination)
const getLeaveTypesDropdownAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    // const validation = safeValidate(leaveTypesDropdownSchema, req.body);
    // if (!validation.success) {
    //     res.status(400).json(apiDataResponse(400, 'Validation failed', validation.errors?.[0]?.message));
    //     return;
    // }

    const organization_id = req.user?.organization_id;
    if (!organization_id) {
        res.status(400).json(apiResponse(400, 'Organization Id is required'));
        return;
    }

    const { search_key, is_active } = {search_key:"", is_active: true};
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

    const leaveTypes = await LEAVE_TYPE_MODEL.find(query)
        .select('_id name code')
        .sort({ name: 1 })
        .lean();

    const dropdownData = leaveTypes.map(item => ({
        id: item._id,
        name: item.name,
        code: item.code
    }));

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, dropdownData));
});

const getEmployeeProfileImage = async_error_handler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json(apiResponse(400, "Invalid file id"));
        return;
    }
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(
        new Types.ObjectId(id)
    );
    downloadStream.on("error", () => {
        res.status(404).json(apiResponse(404, "Image not found"));
    });
    res.setHeader("Content-Type", "image/jpeg"); // or detect dynamically
    downloadStream.pipe(res);
});

const getDocumentsAPIHandler = async_error_handler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
        res.status(400).json(apiResponse(400, "Invalid file id"));
        return;
    }
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(
        new Types.ObjectId(id)
    );
    downloadStream.on("error", () => {
        res.status(404).json(apiResponse(404, "Image not found"));
    });
    res.setHeader("Content-Type", "image/jpeg"); // or detect dynamically
    downloadStream.pipe(res);
});


export {
    getOrganizationsDropdownAPIHandler,
    getDesignationsByDepartmentAPIHandler,
    getDepartmentsByOrganizationAPIHandler,
    getEmployeeByOrganizationAPIHandler,
    getEmployeeProfileImage,
    getLeaveTypesDropdownAPIHandler
};
