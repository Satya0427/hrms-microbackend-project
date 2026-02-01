import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeeCompliance extends Document {
  user_id: Types.ObjectId;

  pan_number?: string;
  aadhaar_number?: string;

  pf_number?: string;
  uan_number?: string;
  esic_number?: string;
}

const EMPLOYEE_COMPLIANCE_SCHEMA = new Schema<IEmployeeCompliance>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true
    },

    pan_number: String,
    aadhaar_number: String,
    pf_number: String,
    uan_number: String,
    esic_number: String
  },
  { timestamps: true }
);

export const EMPLOYEE_COMPLIANCE_MODEL =
  mongoose.model<IEmployeeCompliance>("employee_compliance", EMPLOYEE_COMPLIANCE_SCHEMA);
