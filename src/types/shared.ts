export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RequestUser {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum LearningPathStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
