import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getR2BucketName, getR2PublicDomain } from '@/lib/r2';
import { detectFileType, getFileExtension, cleanPrefix } from '@/lib/utils';
import { FilesApiResponse, R2File } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPrefix = searchParams.get('prefix') || '';
    const prefix = cleanPrefix(rawPrefix);

    const client = getR2Client();
    const bucketName = getR2BucketName();
    const publicDomain = getR2PublicDomain();

    if (!client) {
      return NextResponse.json<FilesApiResponse>({
        currentPrefix: prefix,
        folders: [],
        files: [],
        isConfigured: false,
        error: 'Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not set in .env.local',
      });
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: '/',
      Prefix: prefix || undefined,
    });

    const response = await client.send(command);

    // Extract subfolders from CommonPrefixes
    const folders: string[] = (response.CommonPrefixes || [])
      .map((cp) => cp.Prefix)
      .filter((p): p is string => Boolean(p));

    // Extract files from Contents
    const contents = response.Contents || [];
    const files: R2File[] = [];

    for (const item of contents) {
      const key = item.Key;
      if (!key) continue;

      // Ignore folder placeholder entries (e.g. "photos/" or "photos/subfolder/")
      if (key === prefix || key.endsWith('/')) {
        continue;
      }

      const filename = key.split('/').pop() || key;
      const size = item.Size ?? 0;
      const lastModified = item.LastModified ? item.LastModified.toISOString() : new Date().toISOString();
      const type = detectFileType(filename);
      const extension = getFileExtension(filename);

      let url = '';
      if (publicDomain) {
        url = `${publicDomain}/${encodeURI(key)}`;
      } else {
        try {
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          // 2 hours presigned expiration
          url = await getSignedUrl(client, getCommand, { expiresIn: 7200 });
        } catch (signErr) {
          console.error(`Failed to sign URL for key ${key}:`, signErr);
          url = '';
        }
      }

      files.push({
        key,
        name: filename,
        size,
        lastModified,
        type,
        url,
        extension,
      });
    }

    return NextResponse.json<FilesApiResponse>({
      currentPrefix: prefix,
      folders,
      files,
      isConfigured: true,
    });
  } catch (error: unknown) {
    console.error('Error listing R2 files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching files from R2';
    return NextResponse.json<FilesApiResponse>(
      {
        currentPrefix: '',
        folders: [],
        files: [],
        isConfigured: true,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
