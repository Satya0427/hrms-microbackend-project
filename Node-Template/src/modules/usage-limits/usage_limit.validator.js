const validateUsageLimitCreate = (data) => {
  const errors = [];

  if (!data.organization_id) errors.push("Organization ID is required");
  if (!data.subscription_id) errors.push("Subscription ID is required");

  return errors;
};

module.exports = {
  validateUsageLimitCreate
};
