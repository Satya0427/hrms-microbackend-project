import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeeEmergency extends Document {
  user_id: Types.ObjectId;

  name: string;
  relation: string;
  phone: string;
  address?: string;
}

const EMPLOYEE_EMERGENCY_SCHEMA = new Schema<IEmployeeEmergency>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    relation: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    address: String
  },
  { timestamps: true }
);

export const EMPLOYEE_EMERGENCY_MODEL =
  mongoose.model<IEmployeeEmergency>("employee_emergency", EMPLOYEE_EMERGENCY_SCHEMA);
