const mongoose = require("mongoose");

const ORGANIZATION_SCHEMA = new mongoose.Schema(
    {
        // ===== Core Company Info (UI Fields) =====
        organization_name: {
            type: String,
            required: [true, "Organization name is required"],
            trim: true,
            minlength: [3, "Organization name must be at least 3 characters"],
            maxlength: [100, "Organization name cannot exceed 100 characters"]
        },

        organization_code: {
            type: String,
            required: [true, "Organization code is required"],
            trim: true,
            uppercase: true,
            unique: true,
            minlength: [2, "Organization code must be at least 2 characters"],
            maxlength: [10, "Organization code cannot exceed 10 characters"]
        },

        domain: {
            type: String,
            required: [true, "Domain is required"],
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [100, "Domain cannot exceed 100 characters"]
        },

        industry: {
            type: String,
            required: false,
            trim: true,
            maxlength: [100, "Industry cannot exceed 100 characters"]
        },

        company_size: {
            type: String,
            required: false,
            min: [1, "Company size must be at least 1"]
        },

        // ===== Status & Lifecycle =====
        status: {
            type: String,
            required: true,
            enum: ["TRIAL", "ACTIVE", "SUSPENDED", "INACTIVE"],
            default: "TRIAL"
        },

        trial_start_date: {
            type: Date,
            required: false
        },

        trial_end_date: {
            type: Date,
            required: false
        },

        // ===== Contact Info =====
        contact_email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: [254, "Email cannot exceed 254 characters"]
        },

        contact_phone: {
            type: String,
            required: false,
            trim: true,
            maxlength: [15, "Phone number cannot exceed 15 characters"]
        },

        address: {
            type: String,
            required: false,
            trim: true,
            maxlength: [250, "Address cannot exceed 250 characters"]
        },

        country: {
            type: String,
            required: false,
            trim: true,
            maxlength: [50, "Country cannot exceed 50 characters"]
        },

        timezone: {
            type: String,
            required: false,
            default: "Asia/Kolkata"
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: false
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: false
        },

        // ===== Future Flexibility =====
        tags: {
            type: [String],
            default: []
        },

        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);


const ORGANIZATION_MODEL = mongoose.model(
    "organizations",
    ORGANIZATION_SCHEMA,
    "organizations"
);

module.exports = { ORGANIZATION_MODEL };
