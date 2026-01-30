import mongoose, { Schema, Document } from 'mongoose';

interface IAuditLog extends Document {
    user_id: mongoose.Schema.Types.ObjectId;
    organization_id?: mongoose.Schema.Types.ObjectId;
    action: string;
    action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE';
    module: string;
    entity_type?: string;
    entity_id?: mongoose.Schema.Types.ObjectId;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
    user_agent?: string;
    request_id?: string;
    is_system_generated: boolean;
    is_deleted: boolean;
    metadata: any;
    createdAt?: Date;
    updatedAt?: Date;
}

const AUDIT_LOG_SCHEMA = new Schema<IAuditLog>(
    {
        // ===== Actor =====
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },

        organization_id: {
            type: Schema.Types.ObjectId,
            ref: "organizations",
            required: false,
            index: true
        },

        // ===== Action Info =====
        action: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Action cannot exceed 100 characters"]
        },

        action_type: {
            type: String,
            required: true,
            enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "STATUS_CHANGE"]
        },

        module: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, "Module name cannot exceed 50 characters"]
        },

        // ===== Target Entity =====
        entity_type: {
            type: String,
            required: false,
            trim: true,
            maxlength: [50, "Entity type cannot exceed 50 characters"]
        },

        entity_id: {
            type: Schema.Types.ObjectId,
            required: false
        },

        // ===== Change Tracking =====
        old_value: {
            type: Object,
            required: false
        },

        new_value: {
            type: Object,
            required: false
        },

        // ===== Request Context =====
        ip_address: {
            type: String,
            required: false,
            maxlength: [45, "Invalid IP address"]
        },

        user_agent: {
            type: String,
            required: false,
            maxlength: [500, "User agent too long"]
        },

        request_id: {
            type: String,
            required: false
        },

        // ===== Control Flags =====
        is_system_generated: {
            type: Boolean,
            default: false
        },

        is_deleted: {
            type: Boolean,
            default: false
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

const AUDIT_LOG_MODEL = mongoose.model<IAuditLog>(
    "audit_logs",
    AUDIT_LOG_SCHEMA,
    "audit_logs"
);

export { AUDIT_LOG_MODEL, IAuditLog };
