import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ProductQuery extends PaginationQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  sort?: string;
  isNewArrival?: string;
  isBestSeller?: string;
  isFeatured?: string;
}

export interface OrderQuery extends PaginationQuery {
  status?: string;
  search?: string;
}

export interface UserQuery extends PaginationQuery {
  search?: string;
  role?: string;
}
