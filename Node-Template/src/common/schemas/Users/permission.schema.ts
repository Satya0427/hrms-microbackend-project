import mongoose, { Schema, Document } from 'mongoose';

interface IPermission extends Document {
    permission_name: string;
    permission_code: string;
    description?: string;
    module_id?: mongoose.Schema.Types.ObjectId;
    scope: 'PLATFORM' | 'ORGANIZATION';
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'EXPORT';
    is_active: boolean;
    is_deleted: boolean;
    created_by?: mongoose.Schema.Types.ObjectId;
    updated_by?: mongoose.Schema.Types.ObjectId;
    metadata: any;
    createdAt?: Date;
    updatedAt?: Date;
}

const PERMISSION_SCHEMA = new Schema<IPermission>(
    {
        // ===== Permission Identity =====
        permission_name: {
            type: String,
            required: [true, "Permission name is required"],
            trim: true,
            minlength: [3, "Permission name must be at least 3 characters"],
            maxlength: [100, "Permission name cannot exceed 100 characters"]
        },

        permission_code: {
            type: String,
            required: [true, "Permission code is required"],
            trim: true,
            uppercase: true,
            unique: true,
            minlength: [3, "Permission code must be at least 3 characters"],
            maxlength: [100, "Permission code cannot exceed 100 characters"]
        },

        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: [250, "Description cannot exceed 250 characters"]
        },

        // ===== Module Mapping =====
        module_id: {
            type: Schema.Types.ObjectId,
            ref: "platform_modules",
            required: false
        },

        // ===== Permission Scope =====
        scope: {
            type: String,
            enum: ["PLATFORM", "ORGANIZATION"],
            required: true
        },

        // ===== Action Type =====
        action: {
            type: String,
            required: true,
            enum: ["CREATE", "READ", "UPDATE", "DELETE", "APPROVE", "EXPORT"]
        },

        // ===== Control Flags =====
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
            ref: "users"
        },

        updated_by: {
            type: Schema.Types.ObjectId,
            ref: "users"
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

const PERMISSION_MODEL = mongoose.model<IPermission>(
    "permissions",
    PERMISSION_SCHEMA,
    "permissions"
);

export { PERMISSION_MODEL, IPermission };
