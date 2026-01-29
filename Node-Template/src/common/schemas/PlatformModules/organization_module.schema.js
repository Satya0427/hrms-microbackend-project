const mongoose = require("mongoose");

const ORGANIZATION_MODULE_SCHEMA = new mongoose.Schema(
    {
        // ===== References =====
        organization_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
            required: [true, "Organization ID is required"],
            index: true
        },

        module_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "platform_modules",
            required: [true, "Module ID is required"],
            index: true
        },

        // ===== Module Access =====
        is_enabled: {
            type: Boolean,
            default: true
        },

        enabled_from: {
            type: Date,
            required: false
        },

        enabled_till: {
            type: Date,
            required: false
        },

        // ===== Source of Enablement =====
        enabled_via: {
            type: String,
            enum: ["PLAN", "OVERRIDE", "TRIAL", "PROMOTION"],
            default: "PLAN"
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

const ORGANIZATION_MODULE_MODEL = mongoose.model(
    "organization_modules",
    ORGANIZATION_MODULE_SCHEMA,
    "organization_modules"
);

module.exports = { ORGANIZATION_MODULE_MODEL };
