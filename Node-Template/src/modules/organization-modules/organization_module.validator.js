const validateOrganizationModuleEnable = (data) => {
  const errors = [];

  if (!data.organization_id) errors.push("Organization ID is required");
  if (!data.module_id) errors.push("Module ID is required");

  return errors;
};

module.exports = {
  validateOrganizationModuleEnable
};
