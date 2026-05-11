#!/usr/bin/env node

import crypto from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const imageTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".avif", "image/avif"],
]);

const videoTypes = new Map([
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
  [".m4v", "video/x-m4v"],
]);

const allowedTypes = new Map([...imageTypes, ...videoTypes]);

function usage() {
  console.log(`Usage:
  ALIYUN_OSS_BUCKET=aiops001 \\
  ALIYUN_OSS_REGION=oss-cn-beijing \\
  ALIYUN_OSS_ACCESS_KEY_ID=xxx \\
  ALIYUN_OSS_ACCESS_KEY_SECRET=xxx \\
  ALIYUN_OSS_PUBLIC_BASE_URL=https://aiops001.oss-cn-beijing.aliyuncs.com \\
  npm run media:oss -- ./tmp/insight-media --prefix insights/article-slug

Dry run:
  npm run media:oss -- ./tmp/insight-media --prefix insights/article-slug --dry-run

Options:
  --prefix <path>       OSS object prefix, for example insights/article-slug
  --manifest <path>     Write uploaded URL mapping to JSON
  --dry-run             Print planned uploads without sending files

Optional env:
  ALIYUN_OSS_ENDPOINT=https://custom-endpoint
  ALIYUN_OSS_ACL=public-read
`);
}

function getArgValue(flag, fallback = "") {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function normalizePrefix(prefix) {
  return prefix.replace(/^\/+|\/+$/g, "");
}

function encodeObjectKey(key) {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function publicUrlFor(baseUrl, objectKey) {
  return `${baseUrl.replace(/\/+$/g, "")}/${encodeObjectKey(objectKey)}`;
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return allowedTypes.get(ext) || "application/octet-stream";
}

function isSupportedMedia(filePath) {
  return allowedTypes.has(path.extname(filePath).toLowerCase());
}

async function collectFiles(inputPath) {
  const absolute = path.resolve(process.cwd(), inputPath);
  const info = await stat(absolute);

  if (info.isFile()) {
    if (!isSupportedMedia(absolute)) {
      throw new Error(`Unsupported media type: ${inputPath}`);
    }
    return [{ absolutePath: absolute, relativePath: path.basename(absolute) }];
  }

  if (!info.isDirectory()) {
    throw new Error(`Input path is neither file nor directory: ${inputPath}`);
  }

  const files = [];

  async function walk(currentDir, relativeBase = "") {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absoluteEntryPath = path.join(currentDir, entry.name);
      const relativePath = path.join(relativeBase, entry.name);

      if (entry.isDirectory()) {
        await walk(absoluteEntryPath, relativePath);
        continue;
      }

      if (entry.isFile() && isSupportedMedia(absoluteEntryPath)) {
        files.push({ absolutePath: absoluteEntryPath, relativePath });
      }
    }
  }

  await walk(absolute);
  return files;
}

function buildConfig() {
  const bucket = process.env.ALIYUN_OSS_BUCKET || "";
  const region = process.env.ALIYUN_OSS_REGION || "";
  const accessKeyId = process.env.ALIYUN_OSS_ACCESS_KEY_ID || "";
  const accessKeySecret = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || "";
  const publicBaseUrl = process.env.ALIYUN_OSS_PUBLIC_BASE_URL || "";
  const endpoint =
    process.env.ALIYUN_OSS_ENDPOINT ||
    (bucket && region ? `https://${bucket}.${region}.aliyuncs.com` : "");
  const acl = process.env.ALIYUN_OSS_ACL || "";

  return { bucket, region, accessKeyId, accessKeySecret, publicBaseUrl, endpoint, acl };
}

function assertConfig(config, dryRun) {
  if (!config.bucket) throw new Error("Missing ALIYUN_OSS_BUCKET.");
  if (!config.publicBaseUrl) throw new Error("Missing ALIYUN_OSS_PUBLIC_BASE_URL.");

  if (!dryRun) {
    if (!config.endpoint) throw new Error("Missing ALIYUN_OSS_ENDPOINT or ALIYUN_OSS_REGION.");
    if (!config.accessKeyId) throw new Error("Missing ALIYUN_OSS_ACCESS_KEY_ID.");
    if (!config.accessKeySecret) throw new Error("Missing ALIYUN_OSS_ACCESS_KEY_SECRET.");
  }
}

function signOssRequest({ method, bucket, objectKey, date, contentType, accessKeySecret, ossHeaders }) {
  const canonicalizedOssHeaders = Object.entries(ossHeaders)
    .map(([key, value]) => [key.toLowerCase(), String(value).trim()])
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}\n`)
    .join("");
  const canonicalizedResource = `/${bucket}/${objectKey}`;
  const stringToSign = `${method}\n\n${contentType}\n${date}\n${canonicalizedOssHeaders}${canonicalizedResource}`;

  return crypto.createHmac("sha1", accessKeySecret).update(stringToSign).digest("base64");
}

async function uploadFile({ file, objectKey, config }) {
  const body = await readFile(file.absolutePath);
  const contentType = getContentType(file.absolutePath);
  const date = new Date().toUTCString();
  const ossHeaders = {};

  if (config.acl) {
    ossHeaders["x-oss-object-acl"] = config.acl;
  }

  const signature = signOssRequest({
    method: "PUT",
    bucket: config.bucket,
    objectKey,
    date,
    contentType,
    accessKeySecret: config.accessKeySecret,
    ossHeaders,
  });

  const response = await fetch(`${config.endpoint.replace(/\/+$/g, "")}/${encodeObjectKey(objectKey)}`, {
    method: "PUT",
    headers: {
      Authorization: `OSS ${config.accessKeyId}:${signature}`,
      Date: date,
      "Content-Type": contentType,
      "Content-Length": String(body.length),
      ...ossHeaders,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OSS upload failed for ${objectKey} (${response.status}): ${text.slice(0, 500)}`);
  }
}

async function main() {
  const input = process.argv[2];
  const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--check");

  if (!input || input === "--help" || input === "-h") {
    usage();
    process.exit(input ? 0 : 1);
  }

  const prefix = normalizePrefix(getArgValue("--prefix", ""));
  if (!prefix) {
    throw new Error("Please provide --prefix, for example --prefix insights/article-slug");
  }

  const config = buildConfig();
  assertConfig(config, dryRun);

  const files = await collectFiles(input);
  if (!files.length) {
    throw new Error("No supported image or video files found.");
  }

  const manifest = [];

  for (const file of files) {
    const objectKey = `${prefix}/${file.relativePath.split(path.sep).join("/")}`;
    const url = publicUrlFor(config.publicBaseUrl, objectKey);

    if (!dryRun) {
      await uploadFile({ file, objectKey, config });
    }

    manifest.push({
      localPath: path.relative(process.cwd(), file.absolutePath),
      objectKey,
      url,
      contentType: getContentType(file.absolutePath),
      uploaded: !dryRun,
    });

    console.log(`${dryRun ? "Would upload" : "Uploaded"} ${file.relativePath} -> ${url}`);
  }

  const manifestPath = getArgValue("--manifest", "");
  if (manifestPath) {
    await writeFile(path.resolve(process.cwd(), manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Manifest written: ${manifestPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
