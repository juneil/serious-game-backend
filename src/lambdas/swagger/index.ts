import { generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { S3 } from 'aws-sdk';
import { BusinessError } from '../../utils';

@Lambda()
export class SwaggerLambda {
    constructor(private readonly s3: S3, private logger: Logger) {}

    async onHandler(): Promise<any> {
        return this.s3
            .getObject({ Key: 'swagger.json', Bucket: 'guyfumcf' })
            .promise()
            .then(res => ({
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.parse(res.Body?.toString() || '')
            }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return {
                    statusCode: e.http_code,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(e.toResponse())
                };
            });
    }
}

export const handler = generateHandler(SwaggerLambda);
