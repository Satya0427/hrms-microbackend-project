import { Schema, model } from "mongoose";

const USER_ROLE_MAPPING_SCHEMA = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User is required"],
      index: true
    },

    role_code: {
      type: String,
      required: [true, "Role code is required"],
      trim: true,
      uppercase: true,
      minlength: [3, "Role code must be at least 3 characters"],
      maxlength: [30, "Role code cannot exceed 30 characters"]
    },

    scope: {
      type: String,
      required: [true, "Role scope is required"],
      enum: {
        values: ["PLATFORM", "ORGANIZATION"],
        message: "Scope must be PLATFORM or ORGANIZATION"
      }
    },

    organization_id: {
      type: Schema.Types.ObjectId,
      ref: "organizations",
      required: [
        function (this: any) {
          return this.scope === "ORGANIZATION";
        },
        "Organization is required for organization-level roles"
      ]
    },

    is_primary: {
      type: Boolean,
      default: false
    },

    is_active: {
      type: Boolean,
      default: true
    },

    valid_from: {
      type: Date,
      default: Date.now
    },

    valid_to: {
      type: Date
    },

    assigned_by: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [250, "Reason cannot exceed 250 characters"]
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
