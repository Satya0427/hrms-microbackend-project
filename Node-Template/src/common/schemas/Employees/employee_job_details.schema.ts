import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeeJob extends Document {
  user_id: Types.ObjectId;

  department_id: Types.ObjectId;
  designation_id: Types.ObjectId;
  manager_id?: Types.ObjectId;

  grade?: string;
  cost_center?: string;
}

const EMPLOYEE_JOB_SCHEMA = new Schema<IEmployeeJob>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true
    },

    department_id: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      required: true
    },

    designation_id: {
      type: Schema.Types.ObjectId,
      ref: "designations",
      required: true
    },

    manager_id: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },

    grade: String,
    cost_center: String
  },
  { timestamps: true }
);

export const EMPLOYEE_JOB_MODEL =
  mongoose.model<IEmployeeJob>("employee_job", EMPLOYEE_JOB_SCHEMA);
