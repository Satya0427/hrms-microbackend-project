const {async_error_handler} = require("../../common/utils/async_error_handler");
const apiResponse = require("../../common/utils/api_response");
const MESSAGES = require("../../common/utils/messages");

const {
    AUDIT_LOG_MODEL
} = require("../../common/schemas/AuditLogs/audit_log.schema");

/**
 * LIST AUDIT LOGS
 * Filters:
 * - module
 * - action_type
 * - organization_id
 * - user_id
 * - date range
 */
const listAuditLogsAPIHandler = async_error_handler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        module,
        action_type,
        organization_id,
        user_id,
        from_date,
        to_date
    } = req.query;

    const query = { is_deleted: false };

    if (module) query.module = module;
    if (action_type) query.action_type = action_type;
    if (organization_id) query.organization_id = organization_id;
    if (user_id) query.user_id = user_id;

    if (from_date || to_date) {
        query.createdAt = {};
        if (from_date) query.createdAt.$gte = new Date(from_date);
        if (to_date) query.createdAt.$lte = new Date(to_date);
    }

    const logs = await AUDIT_LOG_MODEL.find(query)
        .populate("user_id", "name email")
        .populate("organization_id", "organization_name domain")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await AUDIT_LOG_MODEL.countDocuments(query);

    return res.status(200).json(
        apiResponse(200, MESSAGES.SUCCESS, {
            data: logs,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    );
});

/**
 * GET AUDIT LOG BY ID
 */
const getAuditLogByIdAPIHandler = async_error_handler(async (req, res) => {
    const { auditLogId } = req.params;

    const log = await AUDIT_LOG_MODEL.findOne({
        _id: auditLogId,
        is_deleted: false
    })
        .populate("user_id", "name email")
        .populate("organization_id", "organization_name domain");

    if (!log) {
        return res
            .status(404)
            .json(apiResponse(404, "Audit log not found"));
    }

    return res
        .status(200)
        .json(apiResponse(200, MESSAGES.SUCCESS, log));
});

module.exports = {
    listAuditLogsAPIHandler,
    getAuditLogByIdAPIHandler
};
