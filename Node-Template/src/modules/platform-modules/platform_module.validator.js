const validatePlatformModuleCreate = (data) => {
  const errors = [];

  if (!data.module_name) errors.push("Module name is required");
  if (!data.module_code) errors.push("Module code is required");

  if (data.module_name && typeof data.module_name !== "string")
    errors.push("Module name must be a string");

  if (data.module_code && typeof data.module_code !== "string")
    errors.push("Module code must be a string");

  return errors;
};

module.exports = {
  validatePlatformModuleCreate
};
