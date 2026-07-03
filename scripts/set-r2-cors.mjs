// Apply a CORS policy to the R2 resources bucket so the browser can upload files
// directly to R2 with a presigned PUT (used by the admin resource uploader).
//
// Run with the R2 creds from your env file (secrets stay in the file):
//   node --env-file=.env.local scripts/set-r2-cors.mjs
//
// Override the allowed origins (comma-separated) if needed:
//   CORS_ORIGINS="https://your-domain.com,http://localhost:3000" \
//     node --env-file=.env.local scripts/set-r2-cors.mjs

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error(
    "Missing R2_* env vars. Run: node --env-file=.env.local scripts/set-r2-cors.mjs",
  );
  process.exit(1);
}

const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,https://nibraslibrary.vercel.app")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: R2_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedMethods: ["PUT", "GET"],
          AllowedOrigins: origins,
          AllowedHeaders: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

const check = await client.send(new GetBucketCorsCommand({ Bucket: R2_BUCKET }));
console.log(`✅ R2 CORS applied to bucket "${R2_BUCKET}" for:\n  - ${origins.join("\n  - ")}`);
console.log("Current rules:", JSON.stringify(check.CORSRules, null, 2));
