interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string | string[];
  error?: string;
  data?: T;
}

export type { ApiResponse };
