import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 (S3-compatible) storage for resource files. Active only when all
 * four R2_* env vars are set — otherwise `r2Enabled()` is false and the storage
 * layer falls back to Supabase Storage, so the app runs with no R2 setup at all.
 *
 * Env is read at call time (not module load) so tests can toggle it.
 */
function env() {
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
  };
}

export function r2Enabled(): boolean {
  const e = env();
  return Boolean(e.accountId && e.accessKeyId && e.secretAccessKey && e.bucket);
}

// Cache the client but key it on the credential tuple, so rotated R2_* env vars
// take effect (a plain module-scope singleton would pin stale credentials for the
// life of the process).
let cached: { client: S3Client; sig: string } | null = null;
function s3(): { client: S3Client; bucket: string } {
  const e = env();
  const sig = `${e.accountId}:${e.accessKeyId}:${e.secretAccessKey}`;
  if (!cached || cached.sig !== sig) {
    cached = {
      sig,
      client: new S3Client({
        region: "auto",
        endpoint: `https://${e.accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: e.accessKeyId as string, secretAccessKey: e.secretAccessKey as string },
      }),
    };
  }
  return { client: cached.client, bucket: e.bucket as string };
}

/** Split a list into batches of `size` (DeleteObjects allows ≤1000 per call). Pure. */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Build a CopyObject `CopySource` ("bucket/key"), encoding unsafe chars while
 *  keeping the path slashes. Pure. */
export function copySource(bucket: string, key: string): string {
  return encodeURI(`${bucket}/${key}`);
}

export async function r2Upload(key: string, file: File): Promise<void> {
  const { client, bucket } = s3();
  const body = Buffer.from(await file.arrayBuffer());
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      // Set the real content type so PDFs/images/videos preview inline.
      ContentType: file.type || "application/octet-stream",
    }),
  );
}

export async function r2SignedUrl(key: string, expiresIn: number): Promise<string> {
  const { client, bucket } = s3();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}

export async function r2Remove(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const { client, bucket } = s3();
  if (keys.length === 1) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: keys[0] }));
    return;
  }
  for (const batch of chunk(keys, 1000)) {
    await client.send(
      new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true } }),
    );
  }
}

export async function r2Copy(from: string, to: string): Promise<void> {
  const { client, bucket } = s3();
  await client.send(new CopyObjectCommand({ Bucket: bucket, Key: to, CopySource: copySource(bucket, from) }));
}
