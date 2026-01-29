const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
    ORGANIZATION_SUBSCRIPTION_MODEL
} = require("../../common/schemas/OrganizationSubscription/organization_subscription.schema");

const {
    SUBSCRIPTION_PLAN_MODEL
} = require("../../common/schemas/Subscription/subscription_plan.schema");

const {
    validateOrganizationSubscriptionAssign
} = require("./organization_subscription.validator");

/**
 * ASSIGN SUBSCRIPTION TO ORGANIZATION
 */
const assignSubscriptionAPIHandler = async_error_handler(async (req, res) => {
    const {
        organization_id,
        subscription_plan_id,
        start_date,
        billing_cycle,
        auto_renew
    } = req.body;

    const validationErrors = validateOrganizationSubscriptionAssign(req.body);
    if (validationErrors.length > 0) {
        return res.status(400).json(apiResponse(400, validationErrors.join(", ")));
    }

    const plan = await SUBSCRIPTION_PLAN_MODEL.findOne({
        _id: subscription_plan_id,
        is_active: true,
        is_deleted: false
    });

    if (!plan) {
        return res.status(404).json(apiResponse(404, "Subscription plan not found"));
    }

    const subscription = await ORGANIZATION_SUBSCRIPTION_MODEL.create({
        organization_id,
        subscription_plan_id,
        status: plan.trial_days > 0 ? "TRIAL" : "ACTIVE",
        start_date,
        trial_start_date: plan.trial_days > 0 ? start_date : null,
        trial_end_date:
            plan.trial_days > 0
                ? new Date(new Date(start_date).getTime() + plan.trial_days * 86400000)
                : null,
        price: plan.price,
        currency: plan.currency,
        billing_cycle,
        plan_snapshot: plan.toObject(),
        auto_renew,
        created_by: req.user?.user_id
    });

    return res
        .status(201)
        .json(apiResponse(201, MESSAGES.SUCCESS, subscription));
});

/**
 * GET SUBSCRIPTION BY ORGANIZATION
 */
const getSubscriptionByOrganizationAPIHandler = async_error_handler(async (req, res) => {
    const { organizationId } = req.params;

    const subscription = await ORGANIZATION_SUBSCRIPTION_MODEL.findOne({
        organization_id: organizationId,
        is_deleted: false
    }).sort({ createdAt: -1 });

    if (!subscription) {
        return res
            .status(404)
            .json(apiResponse(404, "Subscription not found for organization"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, subscription));
});

/**
 * LIST ORGANIZATION SUBSCRIPTIONS
 */
const listOrganizationSubscriptionsAPIHandler = async_error_handler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { is_deleted: false };
    if (status) query.status = status;

    const subscriptions = await ORGANIZATION_SUBSCRIPTION_MODEL.find(query)
        .populate("organization_id", "organization_name domain")
        .populate("subscription_plan_id", "plan_name plan_code")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ORGANIZATION_SUBSCRIPTION_MODEL.countDocuments(query);

    return res.status(200).json(
        apiResponse(200, MESSAGES.SUCCESS, {
            data: subscriptions,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    );
});

/**
 * UPDATE ORGANIZATION SUBSCRIPTION
 */
const updateOrganizationSubscriptionAPIHandler = async_error_handler(async (req, res) => {
    const { subscriptionId } = req.params;

    const updatedSubscription =
        await ORGANIZATION_SUBSCRIPTION_MODEL.findOneAndUpdate(
            { _id: subscriptionId, is_deleted: false },
            { ...req.body, updated_by: req.user?.user_id },
            { new: true }
        );

    if (!updatedSubscription) {
        return res
            .status(404)
            .json(apiResponse(404, "Subscription not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, updatedSubscription));
});

/**
 * UPDATE SUBSCRIPTION STATUS
 */
const updateOrganizationSubscriptionStatusAPIHandler = async_error_handler(
    async (req, res) => {
        const { subscriptionId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json(apiResponse(400, "Status is required"));
        }

        const updatedSubscription =
            await ORGANIZATION_SUBSCRIPTION_MODEL.findOneAndUpdate(
                { _id: subscriptionId, is_deleted: false },
                { status, updated_by: req.user?.user_id },
                { new: true }
            );

        if (!updatedSubscription) {
            return res
                .status(404)
                .json(apiResponse(404, "Subscription not found"));
        }

        return res
            .status(200)
            .json(apiResponse(200, "Subscription status updated", updatedSubscription));
    }
);

module.exports = {
    assignSubscriptionAPIHandler,
    getSubscriptionByOrganizationAPIHandler,
    listOrganizationSubscriptionsAPIHandler,
    updateOrganizationSubscriptionAPIHandler,
    updateOrganizationSubscriptionStatusAPIHandler
};
