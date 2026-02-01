import mongoose, { Schema, Document, Types } from "mongoose";

interface IEmployeePersonal extends Document {
    user_id: Types.ObjectId;

    dob: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    marital_status: "SINGLE" | "MARRIED";

    blood_group?: string;
    nationality?: string;
    personal_email?: string;
}

const EMPLOYEE_PERSONAL_SCHEMA = new Schema<IEmployeePersonal>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            unique: true
        },

        dob: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            enum: ["MALE", "FEMALE", "OTHER"],
            required: true
        },

        marital_status: {
            type: String,
            enum: ["SINGLE", "MARRIED"],
            default: "SINGLE"
        },

        blood_group: String,
        nationality: String,
        personal_email: String
    },
    { timestamps: true }
);

export const EMPLOYEE_PERSONAL_MODEL =
    mongoose.model<IEmployeePersonal>("employee_personal", EMPLOYEE_PERSONAL_SCHEMA);
