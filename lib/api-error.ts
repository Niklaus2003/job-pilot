export type ApiErrorCode =
    | "PARSE_FAILED"
    | "LLM_INVALID_JSON"
    | "LLM_TIMEOUT"
    | "GUARDRAIL_BLOCKED"
    | "EXPORT_FAILED"
    | "CONFIG_ERROR"
    | "INVALID_REQUEST";

export interface ApiError {
    error: {
        code: ApiErrorCode;
        message: string;
        details?: unknown;
    };
}

export function createApiError(code: ApiErrorCode, message: string, details?: unknown): ApiError {
    return {
        error: {
            code,
            message,
            details,
        },
    };
}
