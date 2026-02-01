import { Request, Response } from 'express';
import { async_error_handler } from '../../common/utils/async_error_handler';
import { apiResponse, apiDataResponse } from '../../common/utils/api_response';
import { MESSAGES } from '../../common/utils/messages';
import { EMPLOYMENT_PROFILE_MODEL } from '../../common/schemas/Employees/employment_profile.schema';
import { safeValidate } from '../../common/utils/validation_middleware';
import {
  createEmploymentProfileSchema,
  updateEmploymentProfileSchema,
  getEmploymentProfileByIdSchema,
  deleteEmploymentProfileSchema,
  listEmploymentProfilesSchema
} from './onboarding.validator';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
  user?: {
    user_id: string;
    session_id: string;
  };
}

//  ==================== CREATE EMPLOYMENT PROFILE ====================
const createEmploymentProfileAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  // Zod Validation
  const validation = safeValidate(createEmploymentProfileSchema, {
    body: req.body
  });

  if (!validation.success) {
    res.status(400).json(apiDataResponse(400, "Validation failed", validation.errors?.[0]?.message));
  }

  const {
    user_id,
    organization_id,
    employee_code,
    joining_date,
    employment_type,
    work_mode,
    status,
    personal_email,
    date_of_birth,
    gender,
    manager_id,
    grade,
    cost_center,
    annual_ctc,
    bank_name,
    account_number,
    ifsc_code,
    pan_number,
    aadhaar_number,
    uan_number
  } = validation.data.body;

  // Check if employee already exists for this user and organization
  const existingEmployee = await EMPLOYMENT_PROFILE_MODEL.findOne({
    user_id: new Types.ObjectId(user_id),
    organization_id: new Types.ObjectId(organization_id),
    is_deleted: false
  });

  if (existingEmployee) {
    res.status(409).json(apiResponse(409, "Employment profile already exists for this user"));
  }

  // Create new employment profile
  const payload = {
    user_id: new Types.ObjectId(user_id),
    organization_id: new Types.ObjectId(organization_id),
    employee_code,
    joining_date,
    employment_type,
    work_mode,
    status,
    personal_email,
    date_of_birth,
    gender,
    manager_id: manager_id ? new Types.ObjectId(manager_id) : undefined,
    grade,
    cost_center,
    annual_ctc,
    bank_name,
    account_number,
    ifsc_code,
    pan_number,
    aadhaar_number,
    uan_number,
    is_active: true,
    is_deleted: false,
    created_by: req.user?.user_id ? new Types.ObjectId(req.user.user_id) : undefined
  };

  const result = await EMPLOYMENT_PROFILE_MODEL.create(payload);

  res.status(201).json(apiDataResponse(201, "Employment profile created successfully", result));
});

//   ==================== GET EMPLOYMENT PROFILE BY ID ====================
const getEmploymentProfileByIdAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  const validation = safeValidate(getEmploymentProfileByIdSchema, {
    params: req.params
  });

  if (!validation.success) {
    res.status(400).json(apiDataResponse(400, "Validation failed", validation.errors?.[0]?.message));
  }

  const { id } = validation.data.params;

  const result = await EMPLOYMENT_PROFILE_MODEL.findOne({
    _id: new Types.ObjectId(id),
    is_deleted: false
  }).populate([
    { path: 'user_id', select: 'first_name last_name email' },
    { path: 'organization_id', select: 'organization_name' },
    { path: 'manager_id', select: 'first_name last_name email' }
  ]);

  if (!result) {
    res.status(404).json(apiResponse(404, "Employment profile not found"));
  }

  res.status(200).json(apiDataResponse(200, "Employment profile retrieved successfully", result));
});

//  ==================== UPDATE EMPLOYMENT PROFILE ====================
const updateEmploymentProfileAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  const validation = safeValidate(updateEmploymentProfileSchema, {
    body: req.body
  });

  if (!validation.success) {
    res.status(400).json(apiDataResponse(400, "Validation failed", validation.errors?.[0]?.message));
  }

  const { id } = req.params;

  // Check if employment profile exists
  const existingProfile = await EMPLOYMENT_PROFILE_MODEL.findOne({
    _id: new Types.ObjectId(id),
    is_deleted: false
  });

  if (!existingProfile) {
    res.status(404).json(apiResponse(404, "Employment profile not found"));
  }

  // Prepare update payload
  const updatePayload = {
    ...validation.data.body,
    manager_id: validation.data.body.manager_id ? new Types.ObjectId(validation.data.body.manager_id) : undefined,
    updated_by: req.user?.user_id ? new Types.ObjectId(req.user.user_id) : undefined
  };

  // Remove undefined values
  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

  const result = await EMPLOYMENT_PROFILE_MODEL.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: updatePayload },
    { new: true, runValidators: true }
  ).populate([
    { path: 'user_id', select: 'first_name last_name email' },
    { path: 'organization_id', select: 'organization_name' },
    { path: 'manager_id', select: 'first_name last_name email' }
  ]);

  res.status(200).json(apiDataResponse(200, "Employment profile updated successfully", result));
});

//  ==================== DELETE EMPLOYMENT PROFILE ====================
const deleteEmploymentProfileAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  const validation = safeValidate(deleteEmploymentProfileSchema, {
    params: req.params
  });

  if (!validation.success) {
    res.status(400).json(apiDataResponse(400, "Validation failed", validation.errors?.[0]?.message));
  }

  const { id } = validation.data.params;

  // Soft delete
  const result = await EMPLOYMENT_PROFILE_MODEL.findByIdAndUpdate(
    new Types.ObjectId(id),
    {
      $set: {
        is_deleted: true,
        is_active: false,
        updated_by: req.user?.user_id ? new Types.ObjectId(req.user.user_id) : undefined
      }
    },
    { new: true }
  );

  if (!result) {
    res.status(404).json(apiResponse(404, "Employment profile not found"));
  }

  res.status(200).json(apiDataResponse(200, "Employment profile deleted successfully", null));
});

//  ==================== LIST EMPLOYMENT PROFILES ====================
const listEmploymentProfilesAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  const validation = safeValidate(listEmploymentProfilesSchema, {
    body: req.body
  });

  if (!validation.success) {
     res.status(400).json(apiDataResponse(400, "Validation failed", validation.errors?.[0]?.message));
  }

  const {
    organization_id,
    page = 1,
    limit = 10,
    status,
    employment_type,
    search
  } = validation.data.body;

  // Build filter object
  const filter: any = {
    organization_id: new Types.ObjectId(organization_id),
    is_deleted: false
  };

  if (status) {
    filter.status = status;
  }

  if (employment_type) {
    filter.employment_type = employment_type;
  }

  if (search) {
    filter.$or = [
      { employee_code: { $regex: search, $options: 'i' } },
      { personal_email: { $regex: search, $options: 'i' } },
      { pan_number: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Fetch total count for pagination
  const total = await EMPLOYMENT_PROFILE_MODEL.countDocuments(filter);

  // Fetch results
  const results = await EMPLOYMENT_PROFILE_MODEL.find(filter)
    .populate([
      { path: 'user_id', select: 'first_name last_name email' },
      { path: 'organization_id', select: 'organization_name' },
      { path: 'manager_id', select: 'first_name last_name email' }
    ])
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(apiDataResponse(200, "Employment profiles retrieved successfully", {
    data: results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }));
});

//  ==================== GET BY USER AND ORGANIZATION ====================
const getEmploymentProfileByUserAndOrgAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
  const { user_id, organization_id } = req.body;

  // Validate IDs
  if (!user_id || !organization_id) {
    res.status(400).json(apiResponse(400, "user_id and organization_id are required"));
  }

  if (!/^[0-9a-fA-F]{24}$/.test(user_id) || !/^[0-9a-fA-F]{24}$/.test(organization_id)) {
    res.status(400).json(apiResponse(400, "Invalid user_id or organization_id format"));
  }

  const result = await EMPLOYMENT_PROFILE_MODEL.findOne({
    user_id: new Types.ObjectId(user_id),
    organization_id: new Types.ObjectId(organization_id),
    is_deleted: false
  }).populate([
    { path: 'user_id', select: 'first_name last_name email' },
    { path: 'organization_id', select: 'organization_name' },
    { path: 'manager_id', select: 'first_name last_name email' }
  ]);

  if (!result) {
    res.status(404).json(apiResponse(404, "Employment profile not found for this user and organization"));
  }

  res.status(200).json(apiDataResponse(200, "Employment profile retrieved successfully", result));
});

export {
  createEmploymentProfileAPIHandler,
  getEmploymentProfileByIdAPIHandler,
  updateEmploymentProfileAPIHandler,
  deleteEmploymentProfileAPIHandler,
  listEmploymentProfilesAPIHandler,
  getEmploymentProfileByUserAndOrgAPIHandler
};
