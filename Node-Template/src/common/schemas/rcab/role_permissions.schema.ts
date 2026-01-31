import { Schema } from "mongoose";

const ROLE_SCHEMA = new Schema(
{
  role_name: {
    type: String,
    required: [true, "Role name is required"],
    trim: true,
    minlength: [3, "Role name must be at least 3 characters"],
    maxlength: [50, "Role name cannot exceed 50 characters"]
  },

  role_code: {
    type: String,
    required: [true, "Role code is required"],
    trim: true,
    uppercase: true,
    minlength: [3, "Role code must be at least 3 characters"],
    maxlength: [30, "Role code cannot exceed 30 characters"],
    match: [
      /^[A-Z0-9_]+$/,
      "Role code must contain only uppercase letters, numbers, and underscores"
    ],
    unique: true
  },

  description: {
    type: String,
    trim: true,
    maxlength: [250, "Description cannot exceed 250 characters"]
  },

  scope: {
    type: String,
    required: [true, "Role scope is required"],
    enum: {
      values: ["PLATFORM", "ORGANIZATION"],
      message: "Scope must be PLATFORM or ORGANIZATION"
    },
    default: "ORGANIZATION"
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

  is_system_role: {
    type: Boolean,
    default: false
  },

  is_default: {
    type: Boolean,
    default: false
  },

  priority: {
    type: Number,
    default: 0,
    min: [0, "Priority cannot be negative"]
  },

  is_active: {
    type: Boolean,
    default: true
  },

  is_deleted: {
    type: Boolean,
    default: false
  },

  created_by: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  updated_by: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  metadata: {
    type: Object,
    default: {}
  }
},
{ timestamps: true }
);
