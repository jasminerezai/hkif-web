/**
 * Barrel export for all server-side types.
 * Import from '@/types' (or '../types') instead of individual files.
 */

// ── Shared envelope ─────────────────────────────────────────────

/** Standard success response wrapper — matches the { status, data } shape all controllers return. */
export interface ApiResponse<T> {
  status: 'success';
  data: T;
}

/** Paginated response for list endpoints (no paginated endpoints yet). */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/** Standard query params for paginated list endpoints. */
export interface PaginationQuery {
  page?: string;
  perPage?: string;
}

// ── Domain types ────────────────────────────────────────────────

export type { UserDto, AuthResponseDto, MeResponseDto } from './auth.types';
export type {
  UpdateScheduleStatusBody,
  UpdateScheduleStatusDto,
  Activity,
  TimeSlot,
  ActivityDto,
} from './activity.types';

export type { ScheduleDto } from './schedule.types'
export type {
  FavoriteCreateDelete
} from './favorites.types'
