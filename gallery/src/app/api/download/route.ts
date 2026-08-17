import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2BucketName } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const directUrl = searchParams.get('url');
    const customName = searchParams.get('name');

    if (key) {
      const client = getR2Client();
      const bucketName = getR2BucketName();

      if (!client) {
        return NextResponse.json({ error: 'R2 client not configured' }, { status: 500 });
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await client.send(command);
      const filename = customName || key.split('/').pop() || 'download';
      const encodedFilename = encodeURIComponent(filename);

      if (!response.Body) {
        return NextResponse.json({ error: 'File content empty' }, { status: 404 });
      }

      // Convert AWS SDK stream to Web ReadableStream
      const stream = response.Body.transformToWebStream();

      return new NextResponse(stream, {
        headers: {
          'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
          'Content-Type': response.ContentType || 'application/octet-stream',
          ...(response.ContentLength ? { 'Content-Length': response.ContentLength.toString() } : {}),
        },
      });
    }

    if (directUrl) {
      const res = await fetch(directUrl);
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch source file' }, { status: 502 });
      }

      const filename = customName || directUrl.split('/').pop() || 'download';
      const encodedFilename = encodeURIComponent(filename);
      const blob = await res.blob();

      return new NextResponse(blob, {
        headers: {
          'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
        },
      });
    }

    return NextResponse.json({ error: 'Missing key or url parameter' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Download error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
