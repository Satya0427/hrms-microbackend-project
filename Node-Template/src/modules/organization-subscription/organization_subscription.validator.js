const validateOrganizationSubscriptionAssign = (data) => {
  const errors = [];

  if (!data.organization_id) errors.push("Organization ID is required");
  if (!data.subscription_plan_id) errors.push("Subscription plan ID is required");
  if (!data.start_date) errors.push("Start date is required");
  if (!data.billing_cycle) errors.push("Billing cycle is required");

  if (data.billing_cycle && typeof data.billing_cycle !== "string")
    errors.push("Billing cycle must be a string");

  return errors;
};

module.exports = {
  validateOrganizationSubscriptionAssign
};
