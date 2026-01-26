const mongoose = require("mongoose");

const SCHEMA = new mongoose.Schema(
  {
    organization_name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      minlength: [3, "Organization name must be at least 3 characters"],
      maxlength: [100, "Organization name cannot exceed 100 characters"]
    },

    domain: {
      type: String,
      required: [true, "Domain is required"],
      trim: true,
      lowercase: true,
      unique: true
    },

    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true
    },

    /* Subscription Info */
    subscription_plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription_plans",
      required: true
    },

    plan_name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    billing_cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },

    employee_limit: {
      type: Number,
      required: true
    },

    trial_period_days: {
      type: Number,
      default: 0
    },

    subscription_status: {
      type: String,
      enum: ["trial", "active", "expired"],
      default: "trial"
    },

    /* Admin Info */
    admin_name: {
      type: String,
      required: true,
      trim: true
    },

    admin_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    admin_mobile: {
      type: String,
      required: true,
      trim: true
    },

    /* System */
    organization_status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    }
  },
  { timestamps: true }
);

const ORGANIZATION_SCHEMA = mongoose.model(
  "organizations",
  SCHEMA,
  "organizations"
);

module.exports = { ORGANIZATION_SCHEMA };
