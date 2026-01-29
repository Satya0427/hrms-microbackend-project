const mongoose = require("mongoose");

const PLATFORM_SETTING_SCHEMA = new mongoose.Schema(
    {
        // ===== Setting Identity =====
        setting_key: {
            type: String,
            required: [true, "Setting key is required"],
            trim: true,
            uppercase: true,
            unique: true,
            minlength: [3, "Setting key must be at least 3 characters"],
            maxlength: [100, "Setting key cannot exceed 100 characters"]
        },

        setting_value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: [250, "Description cannot exceed 250 characters"]
        },

        // ===== Category (UI grouping) =====
        category: {
            type: String,
            required: true,
            enum: [
                "SECURITY",
                "AUTH",
                "SUBSCRIPTION",
                "EMAIL",
                "STORAGE",
                "FEATURE",
                "SYSTEM"
            ],
            default: "SYSTEM"
        },

        // ===== Data Type =====
        data_type: {
            type: String,
            required: true,
            enum: ["STRING", "NUMBER", "BOOLEAN", "JSON"]
        },

        // ===== Scope =====
        scope: {
            type: String,
            enum: ["PLATFORM"],
            default: "PLATFORM"
        },

        // ===== Control Flags =====
        is_editable: {
            type: Boolean,
            default: true
        },

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


const PLATFORM_SETTING_MODEL = mongoose.model(
    "platform_settings",
    PLATFORM_SETTING_SCHEMA,
    "platform_settings"
);

module.exports = { PLATFORM_SETTING_MODEL };
