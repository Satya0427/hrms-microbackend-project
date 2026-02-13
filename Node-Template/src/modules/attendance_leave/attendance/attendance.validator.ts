import { z } from 'zod';

const objectId = z.string().min(12);

export const checkInSchema = z.object({
	body: z.object({
		punch_time: z.string().datetime().optional(),
		source: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'API']).default('WEB'),
		device_info: z.string().optional(),
		geo_location: z
			.object({
				lat: z.number(),
				lng: z.number()
			})
			.optional(),
		is_manual_entry: z.boolean().optional()
	})
});

export const checkOutSchema = z.object({
	body: z.object({
		punch_time: z.string().datetime().optional(),
		source: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'API']).default('WEB'),
		device_info: z.string().optional(),
		geo_location: z
			.object({
				lat: z.number(),
				lng: z.number()
			})
			.optional(),
		is_manual_entry: z.boolean().optional()
	})
});

export const calculateAttendanceSchema = z.object({
	body: z.object({
		organization_id: objectId,
		employee_uuid: objectId,
		date: z.string().datetime().optional()
	})
});

export const getDayHistoryQuerySchema = z.object({
	query: z.object({
		date: z.string().datetime().optional()
	})
});

export const getMonthSummaryQuerySchema = z.object({
	query: z.object({
		date: z.string().datetime().optional()
	})
});

export const riseWFHRequestSchema = z.object({
	body: z.object({
		request_date: z.string().datetime(),
		request_type: z.enum(['FULL_DAY', 'HALF_DAY']),
		half_day_session: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
		reason: z.string().optional()
	}).refine((data) => {
		if (data.request_type === 'HALF_DAY') {
			return !!data.half_day_session;
		}
		return true;
	}, {
		message: 'half_day_session is required when request_type is HALF_DAY',
		path: ['half_day_session']
	})
});

export const getWFHRequestsQuerySchema = z.object({
	query: z.object({
		status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional()
	})
});

