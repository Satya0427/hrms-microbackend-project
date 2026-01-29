const validateSubscriptionPlanCreate = (data) => {
  const errors = [];

  if (!data.plan_name) errors.push("Plan name is required");
  if (!data.plan_code) errors.push("Plan code is required");
  if (data.price === undefined) errors.push("Price is required");
  if (!data.billing_cycle) errors.push("Billing cycle is required");

  if (data.plan_name && typeof data.plan_name !== "string")
    errors.push("Plan name must be a string");

  if (data.plan_code && typeof data.plan_code !== "string")
    errors.push("Plan code must be a string");

  if (data.price !== undefined && typeof data.price !== "number")
    errors.push("Price must be a number");

  return errors;
};

module.exports = {
  validateSubscriptionPlanCreate
};
