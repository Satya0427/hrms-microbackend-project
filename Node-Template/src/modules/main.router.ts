import express, { Router } from 'express';

// Modules Importing
import auth_router from './Auth/auth.router';
import organization_router from './organization/organization.router';
// import organization_module_router from './organization-modules/organization_module.router';
// import organization_subscription_router from './organization-subscription/organization_subscription.router';
// import role_router from './rbac/role/role.router';
// import permissions_router from './rbac/permission/permission.router';
import subscription_router from './subscription/subscription_plan.router';
import LOOKUP_ROUTER from '../common/controllers/lookups/lookup.router';
import org_admin_router from './global-admin/org_admin.router';
import MODULE_FEATURES_ROUTER from './module_features/module_features.router';

const main_router: Router = express.Router();

main_router.use('/auth', auth_router);
main_router.use('/organization', organization_router);
// main_router.use('/organization-modules', organization_module_router);
// main_router.use('/organization-subscription', organization_subscription_router);
// main_router.use('/role', role_router);
// main_router.use('/permission', permissions_router);
main_router.use('/subscription', subscription_router);
main_router.use('/org-admin',org_admin_router);
main_router.use('/lookup', LOOKUP_ROUTER);
main_router.use('/module-feature', MODULE_FEATURES_ROUTER);

export default main_router;
