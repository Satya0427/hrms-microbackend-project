import mongoose, { Schema, Document, Types } from 'mongoose';

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

const ROLE_SCHEMA = new Schema(
    {
        role_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },

        role_code: {
            type: String,
            required: true,
            uppercase: true,
            unique: true
        },

        scope: {
            type: String,
            enum: ["PLATFORM", "ORGANIZATION"],
            default: "ORGANIZATION"
        },

        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "organizations",
            required: function () {
                return this.scope === "ORGANIZATION";
            }
        },

        inherits_from: {
            type: Schema.Types.ObjectId,
            ref: "roles"
        },

        is_system_role: {
            type: Boolean,
            default: false
        },

        is_active: {
            type: Boolean,
            default: true
        },

        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);



const ROLE_MODEL = mongoose.model<IRole>(
    "roles",
    ROLE_SCHEMA,
    "roles"
);

export { ROLE_MODEL, IRole };
