const mongoose = require("mongoose");

const USER_SCHEMA = new mongoose.Schema(
  {
    // ===== Basic Identity =====
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [5, "Email must be at least 5 characters"],
      maxlength: [254, "Email cannot exceed 254 characters"]
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    phone_number: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      minlength: [7, "Phone number must be at least 7 characters"],
      maxlength: [15, "Phone number cannot exceed 15 characters"]
    },

    address: {
      type: String,
      required: false,
      trim: true,
      maxlength: [250, "Address cannot exceed 250 characters"]
    },

    // ===== User Classification =====
    user_type: {
      type: String,
      required: true,
      enum: [
        "PLATFORM_SUPER_ADMIN",
        "PLATFORM_ADMIN",
        "ORG_ADMIN",
        "ORG_USER"
      ]
    },

    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      required: function () {
        return this.user_type !== "PLATFORM_SUPER_ADMIN";
      }
    },

    // ===== Account Status =====
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    },

    is_email_verified: {
      type: Boolean,
      default: false
    },

    is_phone_verified: {
      type: Boolean,
      default: false
    },

    // ===== Security & Auth =====
    last_login_at: {
      type: Date,
      required: false
    },

    password_changed_at: {
      type: Date,
      required: false
    },

    failed_login_attempts: {
      type: Number,
      default: 0
    },

    account_locked_until: {
      type: Date,
      required: false
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
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);


const USERS_MODEL = mongoose.model("users", USER_SCHEMA, "users");

module.exports = { USERS_MODEL };
