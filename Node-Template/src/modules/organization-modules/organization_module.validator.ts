const validateOrganizationModuleCreate = (data: any): string[] => {
    const errors: string[] = [];
    if (!data.organization_id) errors.push("Organization ID is required");
    if (!data.module_id) errors.push("Module ID is required");
    return errors;
};

export { validateOrganizationModuleCreate };
