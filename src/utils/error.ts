import { customAlphabet } from 'nanoid';
const NanoID = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

export function generateId(): string {
    return NanoID();
}

export class ErrorCode {
    http: number;
    message: string;

    static E001 = {
        http: 400,
        message: 'Login failed'
    };

    static E002 = {
        http: 400,
        message: 'Space not found'
    };

    static E003 = {
        http: 403,
        message: 'Forbidden'
    };

    static E004 = {
        http: 404,
        message: 'Resource not found'
    };

    static E005 = {
        http: 410,
        message: 'Resource not available'
    };

    static E006 = {
        http: 400,
        message: 'Bad Request'
    };

    static E007 = {
        http: 500,
        message: 'Unrecognized state'
    };

    static E999 = {
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
            : new BusinessError(ErrorCode.E999, err.message, err.stack);
    }

    constructor(errCode: ErrorCode, logMessage: string, stack?: Error['stack']) {
        super(logMessage);
        this.name = 'BusinessError';
        this.code =
            Object.entries(ErrorCode)
                .filter(([_, v]) => v === errCode)
                .map(([k, _]) => k)
                .pop() || 'E999';

        this.short_message = this.code ? errCode.message : ErrorCode.E999.message;
        this.http_code = this.code ? errCode.http : ErrorCode.E999.http;
        this.stack = stack;
    }

    toResponse(): BusinessErrorResponse {
        return { code: this.code, message: this.short_message };
    }
}
