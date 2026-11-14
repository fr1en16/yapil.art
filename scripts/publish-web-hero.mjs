import fs from "node:fs/promises";
import { createHash, createHmac } from "node:crypto";

try {
  process.loadEnvFile(".env");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const [videoPath, posterPath] = process.argv.slice(2);
if (!videoPath || !posterPath)
  throw new Error(
    "Usage: node scripts/publish-web-hero.mjs <video.mp4> <poster.png>",
  );
for (const name of [
  "TINIFY_API_KEY",
  "R2_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
])
  if (!process.env[name]) throw new Error(`Missing ${name}`);
const sha = (data) => createHash("sha256").update(data).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();

async function publish(buffer, name, extension, contentType, processing) {
  const digest = sha(buffer);
  const key = `web/hero/${name}.${digest.slice(0, 16)}.${extension}`;
  const host = `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const uri = `/${process.env.R2_BUCKET}/${key}`;
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const headers = {
    host,
    "x-amz-date": date,
    "x-amz-content-sha256": digest,
    "content-type": contentType,
    "cache-control": "public, max-age=31536000, immutable",
  };
  const sorted = Object.keys(headers).sort(),
    signed = sorted.join(";");
  const canonical = [
    "PUT",
    uri,
    "",
    sorted.map((key) => `${key}:${headers[key]}\n`).join(""),
    signed,
    digest,
  ].join("\n");
  const scope = `${date.slice(0, 8)}/auto/s3/aws4_request`;
  let signing = hmac(
    `AWS4${process.env.R2_SECRET_ACCESS_KEY}`,
    date.slice(0, 8),
  );
  for (const part of ["auto", "s3", "aws4_request"])
    signing = hmac(signing, part);
  const signature = createHmac("sha256", signing)
    .update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${sha(canonical)}`)
    .digest("hex");
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${process.env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`;
  const uploaded = await fetch(`https://${host}${uri}`, {
    method: "PUT",
    headers,
    body: buffer,
  });
  if (!uploaded.ok) throw new Error(`R2 upload HTTP ${uploaded.status}`);
  const url = `https://media.yapil.art/${key}`;
  const check = await fetch(url);
  if (
    !check.ok ||
    check.headers.get("content-type")?.split(";")[0] !== contentType ||
    sha(Buffer.from(await check.arrayBuffer())) !== digest
  )
    throw new Error(`Verification failed: ${name}`);
  return { url, sha256: digest, bytes: buffer.length, contentType, processing };
}

const original = await fs.readFile(videoPath);
if (original.toString("ascii", 4, 8) !== "ftyp")
  throw new Error("Expected MP4 container");
const video = await publish(
  original,
  "keyboard",
  "mp4",
  "video/mp4",
  "original-video",
);
const posterInput = await fs.readFile(posterPath);
const auth = `Basic ${Buffer.from(`api:${process.env.TINIFY_API_KEY}`).toString("base64")}`;
const shrink = await fetch("https://api.tinify.com/shrink", {
  method: "POST",
  headers: { Authorization: auth },
  body: posterInput,
});
const location = shrink.headers.get("location");
if (!shrink.ok || !location || new URL(location).hostname !== "api.tinify.com")
  throw new Error(`Tinify shrink HTTP ${shrink.status}`);
const converted = await fetch(location, {
  method: "POST",
  headers: { Authorization: auth, "Content-Type": "application/json" },
  body: JSON.stringify({ convert: { type: "image/webp" } }),
});
if (!converted.ok)
  throw new Error(`Tinify conversion HTTP ${converted.status}`);
const posterBuffer = Buffer.from(await converted.arrayBuffer());
if (
  posterBuffer.toString("ascii", 0, 4) !== "RIFF" ||
  posterBuffer.toString("ascii", 8, 12) !== "WEBP"
)
  throw new Error("Not a true WebP");
const poster = await publish(
  posterBuffer,
  "keyboard-poster",
  "webp",
  "image/webp",
  "tinify-webp",
);
const media = {
  reference: "https://armory.framer.ai/",
  sourceVideo:
    "https://framerusercontent.com/assets/9PJB6pimDu8LsjZi85rDKOpOc.mp4",
  video,
  poster,
  verifiedAt: new Date().toISOString(),
};
await fs.writeFile(
  "web/src/data/hero-media.json",
  JSON.stringify(media, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    video: video.url,
    poster: poster.url,
    videoBytes: video.bytes,
    posterBytes: poster.bytes,
    verified: true,
  }),
);
