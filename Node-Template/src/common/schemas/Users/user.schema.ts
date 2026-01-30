import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    employee_id: string,
    name: string;
    email: string;
    password: string;
    phone_number?: string;
    address?: string;
    user_type: 'PLATFORM_SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'ORG_ADMIN' | 'ORG_USER';
    role: 'GLOBAL_ADMIN' | 'ADMIN' | 'USER'
    organization_id?: mongoose.Schema.Types.ObjectId;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    is_email_verified: boolean;
    is_phone_verified: boolean;
    last_login_at?: Date;
    password_changed_at?: Date;
    failed_login_attempts: number;
    account_locked_until?: Date;
    is_active: boolean;
    is_deleted: boolean;
    created_by?: mongoose.Schema.Types.ObjectId;
    updated_by?: mongoose.Schema.Types.ObjectId;
    metadata: any;
    createdAt?: Date;
    updatedAt?: Date;
}

const USER_SCHEMA = new Schema<IUser>(
    {
        // ===== Basic Identity =====
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"]
        },
        employee_id: {
            type: String,
            trim: true,
            unique: true,
            index: true,
            match: [
                /^[A-Z0-9]{2,10}-\d{4}$/,
                "Employee ID must be in format ORGCODE-0001"
            ]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [5, "Email must be at least 5 characters"],
            maxlength: [254, "Email cannot exceed 254 characters"]
        },

        password: {
            type: String,
            required: [true, "Password is required"]
        },

        phone_number: {
            type: String,
            required: false,
            unique: true,
            trim: true,
            minlength: [7, "Phone number must be at least 7 characters"],
            maxlength: [15, "Phone number cannot exceed 15 characters"]
        },

        address: {
            type: String,
            required: false,
            trim: true,
            maxlength: [250, "Address cannot exceed 250 characters"]
        },

        // ===== User Classification =====
        user_type: {
            type: String,
            required: true,
            enum: [
                "PLATFORM_SUPER_ADMIN",
                "PLATFORM_ADMIN",
                "ORG_ADMIN",
                "ORG_USER"
            ]
        },
        // ===== User Classification =====
        role: {
            type: String,
            required: true,
            enum: [
                "GLOBAL_ADMIN",
                "ADMIN",
                "USER",
            ]
        },


        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "organizations",
            required: function (this: IUser) {
                return this.user_type !== "PLATFORM_SUPER_ADMIN";
            }
        },

        // ===== Account Status =====
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
            default: "ACTIVE"
        },

        is_email_verified: {
            type: Boolean,
            default: false
        },

        is_phone_verified: {
            type: Boolean,
            default: false
        },

        // ===== Security & Auth =====
        last_login_at: {
            type: Date,
            required: false
        },

        password_changed_at: {
            type: Date,
            required: false
        },

        failed_login_attempts: {
            type: Number,
            default: 0
        },

        account_locked_until: {
            type: Date,
            required: false
        },

        // ===== Platform Control =====
        is_active: {
            type: Boolean,
            default: true
        },

        is_deleted: {
            type: Boolean,
            default: false
        },

        // ===== Audit =====
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: false
        },

        updated_by: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: false
        },

        // ===== Future Flexibility =====
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);
USER_SCHEMA.index({ emp_id: 1 });

const USERS_MODEL = mongoose.model<IUser>("users", USER_SCHEMA, "users");

export { USERS_MODEL, IUser };
