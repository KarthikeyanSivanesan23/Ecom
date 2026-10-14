import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): void {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  res.status(statusCode).json(response);
}

export function sendError(res: Response, statusCode: number, message: string, errorCode?: string): void {
  const response: ApiResponse = { success: false, message, errorCode };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.status(statusCode).json(response);
}
