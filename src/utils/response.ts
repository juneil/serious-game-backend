import { APIGatewayProxyResponse, Logger } from '@ekonoo/lambdi';
import { BusinessError, BusinessErrorResponse } from './error';

export function createResponse<T>(body: T): APIGatewayProxyResponse<T> {
    return {
        statusCode: 200,
        body
    };
}

export function createErrorResponse(error: Error, logger: Logger): APIGatewayProxyResponse<BusinessErrorResponse> {
    const e = BusinessError.wrap(error);
    logger.error(e);
    return { statusCode: e.http_code, body: e.toResponse() };
}
