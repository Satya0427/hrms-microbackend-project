import { Request, Response } from 'express';
import { apiDataResponse, apiResponse } from '../../../common/utils/api_response';
import { async_error_handler } from '../../../common/utils/async_error_handler';
import logger from '../../../config/logger';
import { ATTENDANCE_PUNCH_MODEL } from '../../../common/schemas/leave-attendance/attendance/attendance_punches.schema';
import { ATTENDANCE_RECORD_MODEL } from '../../../common/schemas/leave-attendance/attendance/attendance_records.schema';
import { ATTENDANCE_SHIFT_MODEL } from '../../../common/schemas/leave-attendance/attendance/attendance_shifts.schema';
import { LEAVE_REQUEST_MODEL } from '../../../common/schemas/leave-attendance/leave-configs/leave-requests.schema';
import { EMPLOYEE_PROFILE_MODEL } from '../../../common/schemas/Employees/employee_onboarding.schema';
import { WFH_REQUEST_MODEL } from '../../../common/schemas/leave-attendance/attendance/wfh.schema';
import { Types } from 'mongoose';

type PunchType = 'IN' | 'OUT';

interface CustomRequest extends Request {
    user?: {
        user_id: string;
        session_id: string;
        organization_id?: string;
    };
}

function toDate(val?: string): Date {
    return val ? new Date(val) : new Date();
}

function startOfDay(d: Date): Date {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

function endOfDay(d: Date): Date {
    const nd = new Date(d);
    nd.setHours(23, 59, 59, 999);
    return nd;
}

function minutesBetween(a: Date, b: Date): number {
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}

function parseHHMM(date: Date, hhmm: string): Date {
    const [hh, mm] = hhmm.split(':').map((v) => parseInt(v, 10));
    const nd = new Date(date);
    nd.setHours(hh || 0, mm || 0, 0, 0);
    return nd;
}

const ACTIVE_LEAVE_STATUSES = ['APPROVED', 'SUBMITTED'];

async function isOnLeave(organization_id: string, employee_uuid: string, when: Date) {
    const start = startOfDay(when);
    const end = endOfDay(when);
    const existing = await LEAVE_REQUEST_MODEL.findOne({
        organization_id,
        employee_uuid,
        status: { $in: ACTIVE_LEAVE_STATUSES },
        from_date: { $lte: end },
        to_date: { $gte: start }
    }).lean();
    return !!existing;
}

async function getAssignedShiftSnapshot(organization_id: string, employee_uuid: string): Promise<{
    shift_id?: any;
    shift_name?: string;
    start_time?: string;
    end_time?: string;
    grace_minutes?: number;
    working_hours?: number;
} | undefined> {
    try {
        // Find employee's assigned shift from onboarding profile
        const profile = await EMPLOYEE_PROFILE_MODEL.findOne({ _id: employee_uuid, organization_id })
            .select('job_details.shift_id')
            .lean();

        const assignedShiftId = (profile as any)?.job_details?.shift_id;
        if (!assignedShiftId) return undefined;

        const shift = await ATTENDANCE_SHIFT_MODEL.findOne({ _id: assignedShiftId, organization_id, is_active: true }).lean();
        if (!shift) return undefined;
        return {
            shift_id: shift._id,
            shift_name: shift.shift_name,
            start_time: shift.start_time,
            end_time: shift.end_time,
            grace_minutes: shift.grace_minutes,
            working_hours: shift.working_hours ?? undefined
        };
    } catch (err) {
        logger.error('Error fetching shift', { err });
        return undefined;
    }
}

async function recalculateAttendance(organization_id: string, employee_uuid: string, forDate: Date) {
    const dayStart = startOfDay(forDate);
    const dayEnd = endOfDay(forDate);

    const onLeave = await isOnLeave(organization_id, employee_uuid, forDate);

    const punches = await ATTENDANCE_PUNCH_MODEL.find({
        organization_id,
        employee_uuid,
        punch_time: { $gte: dayStart, $lte: dayEnd }
    })
        .sort({ punch_time: 1 })
        .lean();

    const firstIn = punches.find((p) => p.punch_type === 'IN');
    const lastOut = [...punches].reverse().find((p) => p.punch_type === 'OUT');

    let totalWork = 0;
    let totalBreak = 0;

    // Pair IN -> OUT for work minutes; gaps OUT -> IN as breaks
    let lastInTime: Date | undefined;
    let lastOutTime: Date | undefined;
    for (const p of punches) {
        if (p.punch_type === 'IN') {
            if (lastOutTime) {
                // break from last OUT to this IN
                totalBreak += minutesBetween(new Date(lastOutTime), new Date(p.punch_time));
                lastOutTime = undefined;
            }
            lastInTime = new Date(p.punch_time);
        } else {
            if (lastInTime) {
                // work from last IN to this OUT
                totalWork += minutesBetween(new Date(lastInTime), new Date(p.punch_time));
                lastInTime = undefined;
                lastOutTime = new Date(p.punch_time);
            }
        }
    }

    const snapshot = await getAssignedShiftSnapshot(organization_id, employee_uuid);

    let lateMinutes = 0;
    let earlyExitMinutes = 0;
    let overtimeMinutes = 0;

    if (snapshot?.start_time && snapshot?.end_time) {
        const shiftStart = parseHHMM(dayStart, snapshot.start_time);
        const shiftEnd = parseHHMM(dayStart, snapshot.end_time);
        if (firstIn) {
            const delta = minutesBetween(shiftStart, new Date(firstIn.punch_time));
            // grace applied on late
            lateMinutes = Math.max(0, delta - (snapshot.grace_minutes || 0));
        }
        if (lastOut) {
            const delta = minutesBetween(new Date(lastOut.punch_time), shiftEnd);
            earlyExitMinutes = Math.max(0, delta);
        }
        if (snapshot.working_hours && totalWork > (snapshot.working_hours * 60)) {
            overtimeMinutes = totalWork - snapshot.working_hours * 60;
        }
    }

    const status = onLeave ? 'ON_LEAVE' : (firstIn ? 'PRESENT' : 'ABSENT');

    const updateDoc: any = {
        organization_id,
        employee_uuid,
        attendance_date: dayStart,
        shift_snapshot: snapshot ? {
            shift_id: snapshot.shift_id,
            shift_name: snapshot.shift_name,
            start_time: snapshot.start_time,
            end_time: snapshot.end_time,
            grace_minutes: snapshot.grace_minutes
        } : undefined,
        first_check_in: firstIn ? firstIn.punch_time : undefined,
        last_check_out: lastOut ? lastOut.punch_time : undefined,
        total_work_minutes: totalWork,
        total_break_minutes: totalBreak,
        overtime_minutes: overtimeMinutes,
        late_minutes: lateMinutes,
        early_exit_minutes: earlyExitMinutes,
        status
    };

    await ATTENDANCE_RECORD_MODEL.updateOne(
        { employee_uuid, attendance_date: dayStart },
        { $set: updateDoc },
        { upsert: true }
    );
}

// ======= CLOCK IN RECALCULATE HANDLERS =======
const checkInAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { punch_time, source, device_info, geo_location, is_manual_entry } = (req as any).validatedBody || req.body;
    const organization_id: any = req.user?.organization_id
    const employee_uuid: any = req.user?.user_id
    const when = toDate(punch_time);
    if (await isOnLeave(organization_id, employee_uuid, when)) {
        res.status(409).json(apiDataResponse(409, 'Clock-in blocked: employee is on leave (APPROVED/SUBMITTED).', {
            reason: 'ON_LEAVE',
            date: startOfDay(when)
        }));
        return;
    }

    // Prevent consecutive IN punches without an intervening OUT on the same day
    const dayStart = startOfDay(when);
    const dayEnd = endOfDay(when);
    const lastPunch = await ATTENDANCE_PUNCH_MODEL.findOne({
        organization_id,
        employee_uuid,
        punch_time: { $gte: dayStart, $lte: dayEnd }
    }).sort({ punch_time: -1 }).lean();

    if (lastPunch && lastPunch.punch_type === 'IN') {
        res.status(409).json(apiDataResponse(409, 'Clock-in blocked: already checked-in. Please clock-out first.', {
            last_punch_time: lastPunch.punch_time
        }));
        return;
    }

    const payload = {
        organization_id: req.user?.organization_id || organization_id,
        employee_uuid: req.user?.user_id || employee_uuid,
        punch_time: when,
        punch_type: 'IN' as PunchType,
        source,
        device_info,
        geo_location,
        is_manual_entry: !!is_manual_entry
    };
    const created = await ATTENDANCE_PUNCH_MODEL.create(payload);
    await recalculateAttendance(payload.organization_id, payload.employee_uuid, new Date(created.punch_time));
    res.status(200).json(apiDataResponse(200, 'Check-In recorded', { punch_id: created._id }));
});


// ======= CLOCK OUT RECALCULATE HANDLERS =======
const checkOutAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const { punch_time, source, device_info, geo_location, is_manual_entry } = (req as any).validatedBody || req.body;
    const organization_id: any = req.user?.organization_id
    const employee_uuid: any = req.user?.user_id
    const when = toDate(punch_time);
    if (await isOnLeave(organization_id, employee_uuid, when)) {
        res.status(409).json(apiDataResponse(409, 'Clock-out blocked: employee is on leave (APPROVED/SUBMITTED).', {
            reason: 'ON_LEAVE',
            date: startOfDay(when)
        }));
        return;
    }

    const payload = {
        organization_id: req.user?.organization_id || organization_id,
        employee_uuid: req.user?.user_id || employee_uuid,
        punch_time: when,
        punch_type: 'OUT' as PunchType,
        source,
        device_info,
        geo_location,
        is_manual_entry: !!is_manual_entry
    };

    const created = await ATTENDANCE_PUNCH_MODEL.create(payload);
    await recalculateAttendance(payload.organization_id, payload.employee_uuid, new Date(created.punch_time));
    res.status(200).json(apiDataResponse(200, 'Check-Out recorded', { punch_id: created._id }));
});

const calculateAttendanceAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const date = new Date().toISOString();
    const organization_id: any = req.user?.organization_id
    const employee_uuid: any = req.user?.user_id
    const forDate = toDate(date);
    await recalculateAttendance(organization_id, employee_uuid, forDate);
    res.status(200).json(apiResponse(200, 'Attendance recalculated'));
});


// ======== GET CLOCK IN/OUT HISTORY FOR A DAY (OPTIONAL) ========
const getDayHistoryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id: any = req.user?.organization_id;
    const employee_uuid: any = req.user?.user_id;
    const dateParam = new Date().toISOString();
    const forDate = toDate(dateParam);

    const dayStart = startOfDay(forDate);
    const dayEnd = endOfDay(forDate);

    const punches = await ATTENDANCE_PUNCH_MODEL.find({
        organization_id,
        employee_uuid,
        punch_time: { $gte: dayStart, $lte: dayEnd }
    }).sort({ punch_time: 1 }).lean();

    const attendanceRecord = await ATTENDANCE_RECORD_MODEL.findOne({
        organization_id,
        employee_uuid,
        attendance_date: dayStart
    }).lean();

    const firstIn = punches.find((p) => p.punch_type === 'IN');
    const lastOut = [...punches].reverse().find((p) => p.punch_type === 'OUT');

    res.status(200).json(
        apiDataResponse(200, 'Attendance day history', {
            date: dayStart,
            first_check_in: firstIn?.punch_time ?? null,
            last_check_out: lastOut?.punch_time ?? null,
            punches,
            attendance_record: attendanceRecord ?? null
        })
    );
});

// ======== GET MONTHLY SUMMARY COUNTS (CURRENT OR SPECIFIED DATE'S MONTH) ========
const getMonthSummaryAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id: any = new Types.ObjectId(req.user?.organization_id);
    const employee_uuid: any = new Types.ObjectId(req.user?.user_id);

    // Current date
    const now = new Date();

    // Month Start (1st day 00:00:00)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    // Next Month Start (for safer $lt comparison)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonthStart.setHours(0, 0, 0, 0);

    const pipeline = [
        {
            $match: {
                organization_id,
                employee_uuid,
                attendance_date: { $gte: monthStart, $lte: nextMonthStart }
            }
        },
        {
            $group: {
                _id: null,
                present: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
                late_arrivals: { $sum: { $cond: [{ $gt: [{ $ifNull: ['$late_minutes', 0] }, 0] }, 1, 0] } },
                early_exits: { $sum: { $cond: [{ $gt: [{ $ifNull: ['$early_exit_minutes', 0] }, 0] }, 1, 0] } },
                overtime_minutes: { $sum: { $ifNull: ['$overtime_minutes', 0] } }
            }
        }
    ];

    const agg = await ATTENDANCE_RECORD_MODEL.aggregate(pipeline);

    const result = agg[0] || {
        present: 0,
        absent: 0,
        late_arrivals: 0,
        early_exits: 0,
        overtime_minutes: 0
    };

    const minutes = result.overtime_minutes || 0;
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const overtime_label = `${hoursPart}h ${minsPart}m`;

    // WFH days placeholder: not tracked in attendance_records schema
    const wfh_days = 0;

    res.status(200).json(
        apiDataResponse(200, 'Monthly summary', {
            month_start: monthStart,
            month_end: nextMonthStart,
            present: result.present,
            absent: result.absent,
            late_arrivals: result.late_arrivals,
            early_exits: result.early_exits,
            wfh_days,
            overtime_minutes: minutes,
            overtime_label
        })
    );
});

// ======= GET ATTENDANCE LOGS FOR A MONTH (OPTIONAL) =======
const getClockLogsAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id: any = req.user?.organization_id;
    const employee_uuid: any = req.user?.user_id;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonthStart.setHours(0, 0, 0, 0);

    const records = await ATTENDANCE_RECORD_MODEL.find({
        organization_id,
        employee_uuid,
        attendance_date: { $gte: monthStart, $lte: nextMonthStart }
    }).sort({ attendance_date: 1 }).lean();

    res.status(200).json(
        apiDataResponse(200, 'Monthly attendance logs', {
            month_start: monthStart,
            month_end: nextMonthStart,
            records
        })
    );
});

// ======= WORK FROM HOME REQUESTS HANDLERS =======
const riseWFHRequestAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id: any = req.user?.organization_id;
    const employee_uuid: any = req.user?.user_id;
    const { request_date, request_type, half_day_session, reason } = (req as any).validatedBody || req.body;
    const forDate = toDate(request_date);
    const dayStart = startOfDay(forDate);
    if (await isOnLeave(organization_id, employee_uuid, forDate)) {
        res.status(409).json(apiDataResponse(409, 'WFH request blocked: employee is on leave for the requested day.', {
            reason: 'ON_LEAVE',
            date: dayStart
        }));
        return;
    }
    const existing = await WFH_REQUEST_MODEL.findOne({ employee_uuid, request_date: dayStart }).lean();
    if (existing) {
        res.status(409).json(apiDataResponse(409, 'WFH request already exists for this day.', { request_id: existing._id }));
        return;
    }
    const payload: any = {
        organization_id: new Types.ObjectId(organization_id),
        employee_uuid: String(employee_uuid),
        request_date: dayStart,
        request_type,
        half_day_session: request_type === 'HALF_DAY' ? half_day_session : undefined,
        reason,
        status: 'PENDING',
        requested_at: new Date(),
        is_active: true,
        created_by: new Types.ObjectId(employee_uuid)
    };

    const created = await WFH_REQUEST_MODEL.create(payload);
    res.status(200).json(apiDataResponse(200, 'WFH request submitted', { request_id: (created as any)._id }));
});

// ======= GET WFH REQUEST STATUS FOR EMPLOYEES' REQUESTS =======
const getWFHRequestStatusAPIHandler = async_error_handler(async (req: CustomRequest, res: Response) => {
    const organization_id: any = req.user?.organization_id;
    const manager_id: any = req.user?.user_id;
    const status = ((req as any).validatedData?.query?.status || req.query?.status) as string | undefined;
    const query: any = {
        organization_id: new Types.ObjectId(organization_id),
        manager_id: new Types.ObjectId(manager_id),
        is_active: true
    };
    if (status) {
        query.status = status;
    }
    const requests = await WFH_REQUEST_MODEL.find(query)
        .sort({ requested_at: -1 })
        .lean();

    const summary = requests.reduce((acc: Record<string, number>, r: any) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});
    res.status(200).json(apiDataResponse(200, 'WFH requests fetched', {
            total: requests.length,
            summary,
            requests
        })
    );
});


export {
    checkInAPIHandler,
    checkOutAPIHandler,
    calculateAttendanceAPIHandler,
    getDayHistoryAPIHandler,
    getMonthSummaryAPIHandler,
    getClockLogsAPIHandler,
    riseWFHRequestAPIHandler,
    getWFHRequestStatusAPIHandler
}
