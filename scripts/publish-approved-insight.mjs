#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function usage() {
  console.log(`Usage:
  npm run insight:publish-approved -- article-slug

Optional env:
  SERVER_HOST=8.130.11.205
  SERVER_USER=root
  SERVER_KEY=$HOME/Downloads/Y-001.pem
  INSIGHT_PUBLISH_TASK_DIR=/tmp/jgmao-insight-publish-tasks
`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed${details ? `:\n${details}` : ""}`);
  }

  return result.stdout || "";
}

function sshArgs(remoteCommand) {
  const host = process.env.SERVER_HOST || "8.130.11.205";
  const user = process.env.SERVER_USER || "root";
  const key = (process.env.SERVER_KEY || "$HOME/Downloads/Y-001.pem").replace("$HOME", process.env.HOME || "");
  return ["-i", key, "-o", "StrictHostKeyChecking=no", `${user}@${host}`, remoteCommand];
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

function assertSlug(value) {
  const slug = String(value || "").trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid article slug.");
  }
  return slug;
}

async function main() {
  if (!process.argv[2] || process.argv[2] === "--help" || process.argv[2] === "-h") {
    usage();
    process.exit(process.argv[2] ? 0 : 1);
  }

  const slug = assertSlug(process.argv[2]);

  const taskDir = process.env.INSIGHT_PUBLISH_TASK_DIR || "/tmp/jgmao-insight-publish-tasks";
  const remoteTaskPath = `${taskDir.replace(/\/+$/g, "")}/${slug}.json`;
  const taskJson = run("ssh", sshArgs(`cat ${shellQuote(remoteTaskPath)}`), { capture: true });
  const task = JSON.parse(taskJson);

  if (task.status !== "approved") {
    throw new Error(`Task is not approved yet: ${task.status || "unknown"}`);
  }

  const draft = task.draft;
  if (!draft) {
    throw new Error("Approved task does not contain a draft.");
  }

  const localDraftDir = path.join(rootDir, "tmp", "insight-drafts");
  await mkdir(localDraftDir, { recursive: true });

  const approvedDraft = {
    ...draft,
    status: "published",
    publishedAt: draft.publishedAt || new Date().toISOString().slice(0, 10),
  };
  const localDraftPath = path.join(localDraftDir, `${slug}.approved.json`);
  await writeFile(localDraftPath, `${JSON.stringify(approvedDraft, null, 2)}\n`, "utf8");

  const relativeDraftPath = path.relative(rootDir, localDraftPath);
  run("node", ["scripts/import-insight-draft.mjs", relativeDraftPath, "--check"]);
  run("node", ["scripts/import-insight-draft.mjs", relativeDraftPath]);
  run("npm", ["run", "build"]);
  run("bash", ["deploy/deploy-jgmao-8080.sh"]);

  const articleUrl = `https://www.jgmao.com/insights/${slug}/`;
  const now = new Date().toISOString();
  const publishedTask = {
    ...task,
    status: "published",
    articleUrl,
    publishedAt: now,
    updatedAt: now,
  };
  const localTaskPath = path.join(localDraftDir, `${slug}.published-task.json`);
  await writeFile(localTaskPath, `${JSON.stringify(publishedTask, null, 2)}\n`, "utf8");

  run("scp", [
    "-i",
    (process.env.SERVER_KEY || "$HOME/Downloads/Y-001.pem").replace("$HOME", process.env.HOME || ""),
    "-o",
    "StrictHostKeyChecking=no",
    localTaskPath,
    `${process.env.SERVER_USER || "root"}@${process.env.SERVER_HOST || "8.130.11.205"}:${remoteTaskPath}`,
  ]);

  const notificationMessage = `官网文章已发布\n标题：${approvedDraft.title || ""}\n链接：${articleUrl}`;
  const notifyScript = `
python3 - <<'PY'
import json, shlex, subprocess, urllib.request
raw = subprocess.check_output(["systemctl", "show", "jgmao-public-chat.service", "-p", "Environment"], universal_newlines=True)
env_line = raw.split("=", 1)[1] if "=" in raw else raw
config = {}
for item in shlex.split(env_line):
    if "=" in item:
        key, value = item.split("=", 1)
        config[key] = value
def post_json(url, payload, headers=None):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    merged = {"Content-Type": "application/json; charset=utf-8"}
    if headers:
        merged.update(headers)
    req = urllib.request.Request(url, data=data, headers=merged, method="POST")
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))
token = post_json("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    "app_id": config.get("FEISHU_APP_ID", ""),
    "app_secret": config.get("FEISHU_APP_SECRET", ""),
}).get("tenant_access_token", "")
message = ${JSON.stringify(notificationMessage)}
post_json("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
    "receive_id": config.get("FEISHU_TARGET_CHAT_ID", ""),
    "msg_type": "text",
    "content": json.dumps({"text": message}, ensure_ascii=False),
}, {"Authorization": "Bearer " + token})
print("notified")
PY`;
  run("ssh", sshArgs(notifyScript));

  console.log(`Published insight: ${articleUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
