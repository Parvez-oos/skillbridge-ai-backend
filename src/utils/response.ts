import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../../shared/types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination,
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): void => {
  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
  };
  
  sendSuccess(res, data as T, message, 200, pagination);
};
