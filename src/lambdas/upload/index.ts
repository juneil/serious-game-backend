import { generateHandler, Lambda, Event } from '@ekonoo/lambdi';
import { S3Event, SNSMessage, SQSEvent } from 'aws-lambda';
import { SpaceService } from '../../services/space.service';

@Lambda({
    providers: [SpaceService]
})
export class LoginLambda {
    constructor(private readonly space: SpaceService) {}

    async onHandler(@Event data: SQSEvent): Promise<void> {
        return Promise.all(
            data.Records.map(record => JSON.parse(record.body) as SNSMessage)
                .map(msg => JSON.parse(msg.Message) as S3Event)
                .map(msg => msg.Records)
                .reduce((a, c) => a.concat(c), [])
                .filter(Boolean)
                .map(item => (item.s3?.object?.key || '').split('/'))
                .filter(keys => keys.length > 0)
                .map(([space, type, id]) => this.space.confirmUpload(space, id, type))
        ).then(() => undefined);
    }
}

export const handler = generateHandler(LoginLambda);
