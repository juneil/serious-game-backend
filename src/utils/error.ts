import { customAlphabet } from 'nanoid';
const NanoID = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

export function generateId(): string {
    return NanoID();
}

export class ErrorCode {
    http: number;
    message: string;

    static LoginFailed = {
        http: 400,
        message: 'Login failed'
    };

    static GameNotFound = {
        http: 400,
        message: 'Game not found'
    };

    static Forbidden = {
        http: 403,
        message: 'Forbidden'
    };

    static ResourceNotFound = {
        http: 404,
        message: 'Resource not found'
    };

    static ResourceNotAvailable = {
        http: 410,
        message: 'Resource not available'
    };

    static BadRequest = {
        http: 400,
        message: 'Bad Request'
    };

    static UnrecognizedState = {
        http: 500,
        message: 'Unrecognized state'
    };

    static InternalServerError = {
        http: 500,
        message: 'Internal Server Error'
    };
}

export interface BusinessErrorResponse {
    code: string;
    message: string;
}

export class BusinessError extends Error {
    readonly code: string;
    readonly short_message: string;
    readonly http_code: number;

    static wrap(err: Error | BusinessError): BusinessError {
        return err instanceof BusinessError
            ? err
            : new BusinessError(ErrorCode.InternalServerError, err.message, err.stack);
    }

    constructor(errCode: ErrorCode, logMessage: string, stack?: Error['stack']) {
        super(logMessage);
        this.name = 'BusinessError';
        this.code =
            Object.entries(ErrorCode)
                .filter(([_, v]) => v === errCode)
                .map(([k, _]) => k)
                .pop() || 'InternalServerError';

        this.short_message = this.code ? errCode.message : ErrorCode.InternalServerError.message;
        this.http_code = this.code ? errCode.http : ErrorCode.InternalServerError.http;
        this.stack = stack;
    }

    toResponse(): BusinessErrorResponse {
        return { code: this.code, message: this.short_message };
    }
}
