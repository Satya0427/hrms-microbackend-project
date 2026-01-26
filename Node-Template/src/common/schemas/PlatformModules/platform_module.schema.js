const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Module name is required"],
        trim: true,
        minlength: [3, "Module name must be at least 3 characters"],
        maxlength: [50, "Module name cannot exceed 50 characters"]
    },

    code: {
        type: String,
        required: [true, "Module code is required"],
        unique: [true, "Duplicate module code"],
        trim: true,
        uppercase: true,
        minlength: [3, "Module code must be at least 3 characters"],
        maxlength: [30, "Module code cannot exceed 30 characters"]
    },

    description: {
        type: String,
        required: false,
        trim: true,
        minlength: [5, "Description must be at least 5 characters"],
        maxlength: [500, "Description cannot exceed 500 characters"]
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

const PLATFORM_MODULE_SCHEMA = mongoose.model(
    "platform_modules",
    SCHEMA,
    "platform_modules"
);

module.exports = { PLATFORM_MODULE_SCHEMA };
