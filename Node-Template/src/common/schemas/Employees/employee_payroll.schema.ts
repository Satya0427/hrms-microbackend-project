import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeePayroll extends Document {
  user_id: Types.ObjectId;

  ctc: number;
  basic_salary: number;
  hra: number;
  allowances: number;

  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

const EMPLOYEE_PAYROLL_SCHEMA = new Schema<IEmployeePayroll>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true
    },

    ctc: {
      type: Number,
      required: true
    },

    basic_salary: Number,
    hra: Number,
    allowances: Number,

    bank_name: String,
    account_number: String,
    ifsc_code: String
  },
  { timestamps: true }
);

export const EMPLOYEE_PAYROLL_MODEL =
  mongoose.model<IEmployeePayroll>("employee_payroll", EMPLOYEE_PAYROLL_SCHEMA);
