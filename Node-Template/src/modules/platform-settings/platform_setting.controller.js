const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
  PLATFORM_SETTING_MODEL
} = require("../../common/schemas/PlatformSettings/platform_setting.schema");

const {
  validatePlatformSettingCreate
} = require("./platform_setting.validator");

/**
 * CREATE PLATFORM SETTING
 */
const createPlatformSettingAPIHandler = async_error_handler(async (req, res) => {
  let {
    setting_key,
    setting_value,
    description,
    category,
    data_type,
    is_editable
  } = req.body;

  const validationErrors = validatePlatformSettingCreate(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
  }

  setting_key = setting_key.trim().toUpperCase();

  const existingSetting = await PLATFORM_SETTING_MODEL.findOne({
    setting_key,
    is_deleted: false
  });

  if (existingSetting) {
    return res
      .status(400)
      .json(apiResponse(400, "Platform setting already exists"));
  }

  const setting = await PLATFORM_SETTING_MODEL.create({
    setting_key,
    setting_value,
    description,
    category,
    data_type,
    is_editable,
    created_by: req.user?.user_id
  });

  return res
    .status(201)
    .json(apiResponse(201, MESSAGES.SUCCESS, setting));
});

/**
 * GET PLATFORM SETTING BY KEY
 */
const getPlatformSettingByKeyAPIHandler = async_error_handler(async (req, res) => {
  const { settingKey } = req.params;

  const setting = await PLATFORM_SETTING_MODEL.findOne({
    setting_key: settingKey.toUpperCase(),
    is_deleted: false,
    is_active: true
  });

  if (!setting) {
    return res
      .status(404)
      .json(apiResponse(404, "Platform setting not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, setting));
});

/**
 * LIST PLATFORM SETTINGS
 */
const listPlatformSettingsAPIHandler = async_error_handler(async (req, res) => {
  const { page = 1, limit = 10, category, is_active } = req.query;

  const query = { is_deleted: false };

  if (category) query.category = category;
  if (is_active !== undefined) query.is_active = is_active === "true";

  const settings = await PLATFORM_SETTING_MODEL.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ category: 1, setting_key: 1 });

  const total = await PLATFORM_SETTING_MODEL.countDocuments(query);

  return res.status(200).json(
    apiResponse(200, MESSAGES.SUCCESS, {
      data: settings,
      total,
      page: Number(page),
      limit: Number(limit)
    })
  );
});

/**
 * UPDATE PLATFORM SETTING
 */
const updatePlatformSettingAPIHandler = async_error_handler(async (req, res) => {
  const { settingId } = req.params;

  const updatedSetting = await PLATFORM_SETTING_MODEL.findOneAndUpdate(
    { _id: settingId, is_deleted: false, is_editable: true },
    { ...req.body, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedSetting) {
    return res
      .status(404)
      .json(apiResponse(404, "Platform setting not found or not editable"));
  }

  return res
    .status(200)
    .json(apiResponse(200, MESSAGES.SUCCESS, updatedSetting));
});

/**
 * ENABLE / DISABLE PLATFORM SETTING
 */
const updatePlatformSettingStatusAPIHandler = async_error_handler(async (req, res) => {
  const { settingId } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res
      .status(400)
      .json(apiResponse(400, "is_active must be boolean"));
  }

  const updatedSetting = await PLATFORM_SETTING_MODEL.findOneAndUpdate(
    { _id: settingId, is_deleted: false },
    { is_active, updated_by: req.user?.user_id },
    { new: true }
  );

  if (!updatedSetting) {
    return res
      .status(404)
      .json(apiResponse(404, "Platform setting not found"));
  }

  return res
    .status(200)
    .json(apiResponse(200, "Platform setting status updated", updatedSetting));
});

module.exports = {
  createPlatformSettingAPIHandler,
  getPlatformSettingByKeyAPIHandler,
  listPlatformSettingsAPIHandler,
  updatePlatformSettingAPIHandler,
  updatePlatformSettingStatusAPIHandler
};
