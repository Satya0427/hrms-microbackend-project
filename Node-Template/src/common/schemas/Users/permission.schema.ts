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

const ROLE_PERMISSION_SCHEMA = new Schema(
    {
        role_code: {
            type: String,
            required: true,
            uppercase: true,
            index: true
        },

        module_code: {
            type: String,
            required: true,
            uppercase: true,
            index: true
        },

        feature_code: {
            type: String,
            required: true,
            uppercase: true,
            index: true
        },

        // ===== Action-Level Permissions =====
        permissions: {
            view: { type: Boolean, default: false },
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },

            // Future-proof actions
            approve: { type: Boolean, default: false },
            export: { type: Boolean, default: false },
            assign: { type: Boolean, default: false },
            configure: { type: Boolean, default: false }
        },

        // ===== Data Scope Rules =====
        data_scope: {
            type: String,
            enum: [
                "ALL",
                "SELF",
                "TEAM",
                "DEPARTMENT",
                "ORGANIZATION"
            ],
            default: "SELF"
        },

        // ===== Subscription Dependency =====
        requires_subscription: {
            type: Boolean,
            default: false
        },

        min_plan_code: {
            type: String
        },

        // ===== Overrides =====
        allow_override: {
            type: Boolean,
            default: false
        },

        // ===== Control =====
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
        }
    },
    { timestamps: true }
);


const PERMISSION_MODEL = mongoose.model<IPermission>(
    "permissions",
    ROLE_PERMISSION_SCHEMA,
    "permissions"
);

export { PERMISSION_MODEL, IPermission };
