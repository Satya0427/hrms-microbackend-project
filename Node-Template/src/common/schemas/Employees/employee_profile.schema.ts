import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeeProfile extends Document {
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;

  employee_code: string;
  joining_date: Date;
  confirmation_date?: Date;

  employment_type: "PERMANENT" | "CONTRACT" | "INTERN";
  work_location: string;
  work_mode: "WFH" | "WFO" | "HYBRID";

  status: "ACTIVE" | "ON_NOTICE" | "RESIGNED" | "TERMINATED";
}

const EMPLOYEE_PROFILE_SCHEMA = new Schema<IEmployeeProfile>(
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

    employee_code: {
      type: String,
      required: true,
      unique: true
    },

    joining_date: {
      type: Date,
      required: true
    },

    confirmation_date: {
      type: Date
    },

    employment_type: {
      type: String,
      enum: ["PERMANENT", "CONTRACT", "INTERN"],
      default: "PERMANENT"
    },

    work_location: {
      type: String,
      required: true
    },

    work_mode: {
      type: String,
      enum: ["WFH", "WFO", "HYBRID"],
      default: "WFO"
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ON_NOTICE", "RESIGNED", "TERMINATED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export const EMPLOYEE_PROFILE_MODEL =
  mongoose.model<IEmployeeProfile>("employee_profiles", EMPLOYEE_PROFILE_SCHEMA);
