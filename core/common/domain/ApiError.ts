import z, { core } from 'zod';

export const apiErrorSchema = z.object({
  status: z.number(),
  error: z.string(),
  code: z.string(),
  message: z.string(),
  timestamp: z.string(),
})

export type ApiErrorType = z.infer<typeof apiErrorSchema>;

export class ApiError extends Error implements ApiErrorType {

  public static handleErrors: (errorType: string, issues?: core.$ZodIssue[]) => ApiError = (errorType, issues) => {
    return new ApiError({
      status: 400,
      error: errorType,
      code: '',
      message: issues?.[0]?.message ?? '',
      timestamp: new Date().toISOString(),
    });
  }

  public status: number;
  public error: string;
  public code: string;
  public message: string;
  public timestamp: string;

  constructor(args: Omit<ApiErrorType, 'timestamp'> & Partial<Pick<ApiErrorType, 'timestamp'>>) {
    super(args.message);

    this.status = args.status;
    this.error = args.error;
    this.code = args.code;
    this.message = args.message;
    this.timestamp = args.timestamp ?? new Date().toISOString();
  }
}