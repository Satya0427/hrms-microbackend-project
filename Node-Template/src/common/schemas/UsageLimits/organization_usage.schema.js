const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: [true, "Organization id is required"],
    },

    module_code: {
        type: String,
        required: [true, "Module code is required"],
        trim: true,
        lowercase: true,
        minlength: [2, "Module code must be at least 2 characters"],
        maxlength: [50, "Module code cannot exceed 50 characters"],
    },

    feature_code: {
        type: String,
        required: [true, "Feature code is required"],
        trim: true,
        lowercase: true,
        minlength: [2, "Feature code must be at least 2 characters"],
        maxlength: [50, "Feature code cannot exceed 50 characters"],
    },

    allowed_limit: {
        type: Number,
        required: [true, "Allowed limit is required"],
        min: [0, "Allowed limit cannot be negative"],
    },

    used_count: {
        type: Number,
        default: 0,
        min: [0, "Used count cannot be negative"],
    },

    reset_cycle: {
        type: String,
        required: true,
        enum: ["Daily", "Monthly", "Yearly"],
        default: "Monthly",
    },

    last_reset_on: {
        type: Date,
        default: Date.now,
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

const ORGANIZATION_USAGE_SCHEMA = mongoose.model(
    "organization_usages",
    SCHEMA,
    "organization_usages"
);

module.exports = { ORGANIZATION_USAGE_SCHEMA };
