const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Plan name is required"],
        trim: true,
        minlength: [3, "Plan name must be at least 3 characters"],
        maxlength: [100, "Plan name cannot exceed 100 characters"],
    },

    code: {
        type: String,
        required: [true, "Plan code is required"],
        unique: [true, "Duplicate plan code"],
        trim: true,
        uppercase: true,
        minlength: [3, "Plan code must be at least 3 characters"],
        maxlength: [50, "Plan code cannot exceed 50 characters"],
    },

    monthly_price: {
        type: Number,
        required: false,
        min: [0, "Monthly price cannot be negative"],
    },

    yearly_price: {
        type: Number,
        required: false,
        min: [0, "Yearly price cannot be negative"],
    },

    employee_limit: {
        type: Number,
        required: true,
        min: [1, "Employee limit must be at least 1"],
    },

    storage_limit_gb: {
        type: Number,
        required: true,
        min: [1, "Storage limit must be at least 1 GB"],
    },

    modules: [
        {
            module_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "platform_modules",
                required: true,
            },
            enabled: {
                type: Boolean,
                default: true,
            }
        }
    ],

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
    },

    created_on: {
        type: Date,
        default: Date.now,
    },

    updated_on: {
        type: Date,
        default: Date.now,
    }
});

const SUBSCRIPTION_PLAN_SCHEMA = mongoose.model(
    "subscription_plans",
    SCHEMA,
    "subscription_plans"
);

module.exports = { SUBSCRIPTION_PLAN_SCHEMA };
