const validatePlatformSettingCreate = (data) => {
  const errors = [];

  if (!data.setting_key) errors.push("Setting key is required");
  if (data.setting_value === undefined) errors.push("Setting value is required");
  if (!data.category) errors.push("Category is required");
  if (!data.data_type) errors.push("Data type is required");

  if (data.setting_key && typeof data.setting_key !== "string")
    errors.push("Setting key must be a string");

  if (
    data.data_type &&
    !["STRING", "NUMBER", "BOOLEAN", "JSON"].includes(data.data_type)
  )
    errors.push("Invalid data type");

  return errors;
};

module.exports = {
  validatePlatformSettingCreate
};
