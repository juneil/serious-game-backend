import { Cors, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { S3 } from 'aws-sdk';
import { BusinessError } from '../../utils/error';

@Lambda()
export class SwaggerLambda {
    constructor(private readonly s3: S3, private logger: Logger) {}

    @Cors('*')
    async onHandler(): Promise<unknown> {
        return this.s3
            .getObject({ Key: 'swagger.json', Bucket: 'skillins-init' })
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
