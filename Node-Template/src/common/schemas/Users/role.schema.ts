import mongoose, { Schema, Document } from 'mongoose';

interface IRole extends Document {
    role_name: string;
    role_code: string;
    description?: string;
    scope: 'PLATFORM' | 'ORGANIZATION';
    organization_id?: mongoose.Schema.Types.ObjectId;
    is_default: boolean;
    is_system_role: boolean;
    is_active: boolean;
    is_deleted: boolean;
    created_by?: mongoose.Schema.Types.ObjectId;
    updated_by?: mongoose.Schema.Types.ObjectId;
    metadata: any;
    createdAt?: Date;
    updatedAt?: Date;
}

const ROLE_SCHEMA = new Schema<IRole>(
    {
        // ===== Role Identity =====
        role_name: {
            type: String,
            required: [true, "Role name is required"],
            trim: true,
            minlength: [3, "Role name must be at least 3 characters"],
            maxlength: [50, "Role name cannot exceed 50 characters"]
        },

        role_code: {
            type: String,
            required: [true, "Role code is required"],
            trim: true,
            uppercase: true,
            unique: true,
            minlength: [3, "Role code must be at least 3 characters"],
            maxlength: [30, "Role code cannot exceed 30 characters"]
        },

        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: [250, "Description cannot exceed 250 characters"]
        },

        // ===== Role Scope =====
        scope: {
            type: String,
            required: true,
            enum: ["PLATFORM", "ORGANIZATION"],
            default: "ORGANIZATION"
        },

        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "organizations",
            required: function (this: IRole) {
                return this.scope === "ORGANIZATION";
            }
        },

        // ===== Default Role Flags =====
        is_default: {
            type: Boolean,
            default: false
        },

        is_system_role: {
            type: Boolean,
            default: false
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

const ROLE_MODEL = mongoose.model<IRole>(
    "roles",
    ROLE_SCHEMA,
    "roles"
);

export { ROLE_MODEL, IRole };
