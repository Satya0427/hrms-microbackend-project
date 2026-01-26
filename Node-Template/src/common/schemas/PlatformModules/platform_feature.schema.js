const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    module_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Module ID is required"],
        ref: "platform_modules"
    },

    name: {
        type: String,
        required: [true, "Feature name is required"],
        trim: true,
        minlength: [3, "Feature name must be at least 3 characters"],
        maxlength: [50, "Feature name cannot exceed 50 characters"]
    },

    code: {
        type: String,
        required: [true, "Feature code is required"],
        unique: [true, "Duplicate feature code"],
        trim: true,
        uppercase: true,
        minlength: [3, "Feature code must be at least 3 characters"],
        maxlength: [30, "Feature code cannot exceed 30 characters"]
    },

    enabled: {
        type: Boolean,
        required: true,
        default: true
    },

    status: {
        type: String,
        required: true,
        enum: ["Enabled", "Disabled"],
        default: "Enabled"
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },

    created_at: {
        type: Date,
        default: Date.now
    },

    updated_at: {
        type: Date,
        default: null
    }
});

const PLATFORM_FEATURE_SCHEMA = mongoose.model(
    "platform_features",
    SCHEMA,
    "platform_features"
);

module.exports = { PLATFORM_FEATURE_SCHEMA };
