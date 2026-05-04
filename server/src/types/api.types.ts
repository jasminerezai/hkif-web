/**
 * Shared API response types used across controllers.
 */

/** Standard success response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Paginated response for list endpoints */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/** Standard query params for list endpoints */
export interface PaginationQuery {
  page?: string;
  perPage?: string;
}
