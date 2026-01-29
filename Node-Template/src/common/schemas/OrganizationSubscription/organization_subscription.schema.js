const mongoose = require("mongoose");

const ORGANIZATION_SUBSCRIPTION_SCHEMA = new mongoose.Schema(
    {
        // ===== References =====
        organization_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
            required: [true, "Organization ID is required"],
            index: true
        },

        subscription_plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subscription_plans",
            required: [true, "Subscription plan ID is required"]
        },

        // ===== Subscription Lifecycle =====
        status: {
            type: String,
            required: true,
            enum: ["TRIAL", "ACTIVE", "EXPIRED", "SUSPENDED", "CANCELLED"],
            default: "TRIAL"
        },

        start_date: {
            type: Date,
            required: true
        },

        end_date: {
            type: Date,
            required: false
        },

        trial_start_date: {
            type: Date,
            required: false
        },

        trial_end_date: {
            type: Date,
            required: false
        },

        // ===== Billing Snapshot =====
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
        },

        currency: {
            type: String,
            required: true,
            default: "INR"
        },

        billing_cycle: {
            type: String,
            required: true,
            enum: ["MONTHLY", "YEARLY"]
        },

        // ===== Plan Snapshot (IMPORTANT) =====
        // We store snapshot so future plan changes don't affect existing customers
        plan_snapshot: {
            type: Object,
            required: true
        },

        // ===== Platform Overrides =====
        override_limits: {
            type: Object,
            default: {}
        },

        override_modules: {
            type: Object,
            default: {}
        },

        // ===== Control Flags =====
        auto_renew: {
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

const ORGANIZATION_SUBSCRIPTION_MODEL = mongoose.model(
    "organization_subscriptions",
    ORGANIZATION_SUBSCRIPTION_SCHEMA,
    "organization_subscriptions"
);

module.exports = { ORGANIZATION_SUBSCRIPTION_MODEL };
