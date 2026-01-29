const express = require("express");
// Modules Importing
const auth_router = require("./Auth/auth.router");
const organization_router = require('./organization/organization.router');
const organization_module_router = require('./organization-modules/organization_module.router');
const organization_subscription_router = require('./organization-subscription/organization_subscription.router');
const platform_module_router = require('./platform-modules/platform_module.router');
const platform_settings_router = require('./platform-settings/platform_setting.router');
const platform_dashobard_router = require('./PlatformDashboard/platform_dashboard.router');
const role_router = require('./rbac/role/role.router');
const permissions_router = require('./rbac/permission/permission.router');
const subscription_router = require('./subscription/subscription_plan.router')
const usage_limit_router = require('./usage-limits/usage_limit.router')
const main_router = express.Router();



main_router.use('/auth', auth_router);
main_router.use('/organization',organization_router);
main_router.use('/organization-modules', organization_module_router);
main_router.use('/organization-subscription', organization_subscription_router);
main_router.use('/platform-modules', platform_module_router);
main_router.use('/platform-settings', platform_settings_router);
// main_router.use('/platform-dashboard', platform_dashobard_router);
main_router.use('/role', role_router);
main_router.use('/permission', permissions_router);
main_router.use('/subscription', subscription_router);
main_router.use('/usage-limits', usage_limit_router);

module.exports = main_router;