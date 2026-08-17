import { S3Client } from '@aws-sdk/client-s3';

let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  if (!r2ClientInstance) {
    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2ClientInstance;
}

export function getR2BucketName(): string {
  return process.env.R2_BUCKET_NAME?.trim() || 'yapil';
}

export function getR2PublicDomain(): string | null {
  const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN?.trim();
  if (!domain) return null;
  return domain.replace(/\/$/, '');
}
