const express = require("express");
const router = express.Router();

const {
  createPlatformSettingAPIHandler,
  getPlatformSettingByKeyAPIHandler,
  listPlatformSettingsAPIHandler,
  updatePlatformSettingAPIHandler,
  updatePlatformSettingStatusAPIHandler
} = require("./platform_setting.controller");

const { accessTokenValidatorMiddleware } = require("../../common/middleware/error.middleware.ts");

// Create platform setting
router.post(
  "/create",
  accessTokenValidatorMiddleware,
  createPlatformSettingAPIHandler
);

// Get setting by key
router.get(
  "/:settingKey",
  accessTokenValidatorMiddleware,
  getPlatformSettingByKeyAPIHandler
);

// List settings
router.get(
  "/",
  accessTokenValidatorMiddleware,
  listPlatformSettingsAPIHandler
);

// Update setting
router.put(
  "/:settingId",
  accessTokenValidatorMiddleware,
  updatePlatformSettingAPIHandler
);

// Enable / Disable setting
router.patch(
  "/:settingId/status",
  accessTokenValidatorMiddleware,
  updatePlatformSettingStatusAPIHandler
);

module.exports = router;
