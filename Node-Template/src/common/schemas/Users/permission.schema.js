const mongoose = require("mongoose");

const PERMISSION_SCHEMA = new mongoose.Schema(
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
            type: mongoose.Schema.Types.ObjectId,
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
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


const PERMISSION_MODEL = mongoose.model(
    "permissions",
    PERMISSION_SCHEMA,
    "permissions"
);

module.exports = { PERMISSION_MODEL };
