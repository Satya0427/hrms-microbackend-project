const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema({
    organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
        required: [true, "Organization id is required"],
    },

    subscription_plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subscription_plans",
        required: [true, "Subscription plan id is required"],
    },

    start_date: {
        type: Date,
        required: [true, "Start date is required"],
    },

    end_date: {
        type: Date,
        required: [true, "End date is required"],
    },

    status: {
        type: String,
        required: true,
        enum: ["Active", "Expired", "Cancelled"],
        default: "Active",
        trim: true,
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

const ORGANIZATION_SUBSCRIPTION_SCHEMA = mongoose.model(
    "organization_subscriptions",
    SCHEMA,
    "organization_subscriptions"
);

module.exports = { ORGANIZATION_SUBSCRIPTION_SCHEMA };
