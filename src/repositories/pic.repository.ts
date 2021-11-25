import { Service } from '@ekonoo/lambdi';
import { S3 } from 'aws-sdk';

@Service()
export class PicRepository {
    private readonly BUCKET = process.env.BUCKET || 'UnknownTable';

    constructor(private readonly s3: S3) {}

    getUploadUrl(key: string, contentType: string): string {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.BUCKET,
            Key: key,
            Expires: 600,
            ContentType: contentType
        });
    }

    getReadUrl(key: string): Promise<string> {
        return this.s3.getSignedUrlPromise('getObject', {
            Bucket: this.BUCKET,
            Key: key,
            Expires: 600
        });
    }
}
