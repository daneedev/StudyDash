interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string | string[];
  data?: T;
}

export type { ApiResponse };
