const mongoose = require("mongoose");

const ROLE_SCHEMA = new mongoose.Schema(
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
            required: function () {
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


const ROLE_MODEL = mongoose.model(
    "roles",
    ROLE_SCHEMA,
    "roles"
);

module.exports = { ROLE_MODEL };
