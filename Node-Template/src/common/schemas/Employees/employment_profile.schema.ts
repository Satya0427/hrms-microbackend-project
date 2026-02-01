import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmploymentProfile extends Document {
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;

  // Employment Profile
  employee_code: string;
  joining_date: Date;
  employment_type: "PERMANENT" | "CONTRACT" | "INTERN";
  work_mode: "WFH" | "WFO" | "HYBRID";
  status: "ACTIVE" | "ON_NOTICE" | "RESIGNED" | "TERMINATED";

  // Personal Details
  personal_email: string;
  date_of_birth: Date;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

  // Job Assignment
  manager_id?: Types.ObjectId;
  grade?: string;
  cost_center?: string;

  // Payroll & Bank Details
  annual_ctc: number;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;

  // Compliance
  pan_number?: string;
  aadhaar_number?: string;
  uan_number?: string;

  is_active: boolean;
  is_deleted: boolean;
  created_by?: Types.ObjectId;
  updated_by?: Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

const EMPLOYMENT_PROFILE_SCHEMA = new Schema<IEmploymentProfile>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },

    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "organizations",
      required: true,
      index: true
    },

    // Employment Profile
    employee_code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    joining_date: {
      type: Date,
      required: true
    },

    employment_type: {
      type: String,
      enum: ["PERMANENT", "CONTRACT", "INTERN"],
      required: true,
      default: "PERMANENT"
    },

    work_mode: {
      type: String,
      enum: ["WFH", "WFO", "HYBRID"],
      required: true,
      default: "WFO"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"],
      required: true,
      default: "ACTIVE"
    },

    // Personal Details
    personal_email: {
      type: String,
      trim: true,
      lowercase: true
    },

    date_of_birth: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
      required: true
    },

    // Job Assignment
    manager_id: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },

    grade: {
      type: String,
      trim: true
    },

    cost_center: {
      type: String,
      trim: true
    },

    // Payroll & Bank Details
    annual_ctc: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    bank_name: {
      type: String,
      trim: true
    },

    account_number: {
      type: String,
      trim: true
    },

    ifsc_code: {
      type: String,
      trim: true,
      uppercase: true
    },

    // Compliance
    pan_number: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },

    aadhaar_number: {
      type: String,
      trim: true,
      match: /^[0-9]{12}$/
    },

    uan_number: {
      type: String,
      trim: true,
      match: /^[0-9]{12}$/
    },

    is_active: {
      type: Boolean,
      default: true
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },

    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "users"
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user_id and organization_id
EMPLOYMENT_PROFILE_SCHEMA.index({ user_id: 1, organization_id: 1 }, { unique: true });

// Index for organization_id for faster queries
EMPLOYMENT_PROFILE_SCHEMA.index({ organization_id: 1, is_deleted: 1 });

export const EMPLOYMENT_PROFILE_MODEL = mongoose.model<IEmploymentProfile>(
  "employment_profiles",
  EMPLOYMENT_PROFILE_SCHEMA
);
