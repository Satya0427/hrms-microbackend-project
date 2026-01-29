const validateOrganizationCreate = (data) => {
  const errors = [];

  if (!data.organization_name) errors.push("Organization name is required");
  if (!data.organization_code) errors.push("Organization code is required");
  if (!data.domain) errors.push("Domain is required");
  if (!data.contact_email) errors.push("Contact email is required");

  if (data.organization_name && typeof data.organization_name !== "string")
    errors.push("Organization name must be a string");

  if (data.domain && typeof data.domain !== "string")
    errors.push("Domain must be a string");

  if (data.contact_email && typeof data.contact_email !== "string")
    errors.push("Contact email must be a string");

  return errors;
};

module.exports = {
  validateOrganizationCreate
};
