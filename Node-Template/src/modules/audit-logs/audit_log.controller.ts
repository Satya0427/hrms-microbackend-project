import { Request, Response } from 'express';
import { async_error_handler } from '../../common/utils/async_error_handler';
import { apiResponse, apiDataResponse } from '../../common/utils/api_response';
import { MESSAGES } from '../../common/utils/messages';
import { AUDIT_LOG_MODEL } from '../../common/schemas/AuditLogs/audit_log.schema';

interface CustomRequest extends Request {
    user?: any;
}

/**
 * LIST AUDIT LOGS
 */
const listAuditLogsAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const module = req.query.module as string | undefined;
    const action_type = req.query.action_type as string | undefined;
    const organization_id = req.query.organization_id as string | undefined;
    const user_id = req.query.user_id as string | undefined;
    const from_date = req.query.from_date as string | undefined;
    const to_date = req.query.to_date as string | undefined;

    const query: any = { is_deleted: false };

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
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await AUDIT_LOG_MODEL.countDocuments(query);

    res.status(200).json(
        apiDataResponse(200, MESSAGES.SUCCESS, {
            data: logs,
            total,
            page,
            limit
        })
    );
});

/**
 * GET AUDIT LOG BY ID
 */
const getAuditLogByIdAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { auditLogId } = req.params;

    const log = await AUDIT_LOG_MODEL.findOne({
        _id: auditLogId,
        is_deleted: false
    })
        .populate("user_id", "name email")
        .populate("organization_id", "organization_name domain");

    if (!log) {
        res.status(404).json(apiResponse(404, "Audit log not found"));
        return;
    }

    res.status(200).json(apiDataResponse(200, MESSAGES.SUCCESS, log));
});

export {
    listAuditLogsAPIHandler,
    getAuditLogByIdAPIHandler
};
