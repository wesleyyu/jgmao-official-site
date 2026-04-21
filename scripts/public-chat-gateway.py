#!/usr/bin/env python3
import json
import os
import re
import subprocess
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn


HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "18788"))
SHARED_TOKEN = os.environ.get("AGENT_BRIDGE_TOKEN", "")
PUBLIC_CHAT_MODEL = os.environ.get("PUBLIC_CHAT_MODEL", "qwen3.6-plus")
PUBLIC_CHAT_API_BASE_URL = os.environ.get("PUBLIC_CHAT_API_BASE_URL", "https://coding.dashscope.aliyuncs.com/v1").rstrip("/")
PUBLIC_CHAT_API_KEY = os.environ.get("PUBLIC_CHAT_API_KEY", "")
PUBLIC_CHAT_API_KEY_FILE = os.environ.get("PUBLIC_CHAT_API_KEY_FILE", "")
PUBLIC_CHAT_TIMEOUT_MS = int(os.environ.get("PUBLIC_CHAT_TIMEOUT_MS", "120000"))
PUBLIC_CHAT_MAX_TOKENS = int(os.environ.get("PUBLIC_CHAT_MAX_TOKENS", "240"))
PUBLIC_CHAT_TEMPERATURE = float(os.environ.get("PUBLIC_CHAT_TEMPERATURE", "0.3"))
STREAM_CHUNK_DELAY_MS = int(os.environ.get("CHAT_STREAM_CHUNK_DELAY_MS", "26"))
STREAM_CHUNK_SIZE = int(os.environ.get("CHAT_STREAM_CHUNK_SIZE", "22"))

SENSITIVE_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in [
        r"ssh",
        r"private key",
        r"public key",
        r"api key",
        r"access token",
        r"password",
        r"cookie",
        r"秘钥",
        r"密钥",
        r"私钥",
        r"公钥",
        r"密码",
        r"令牌",
        r"凭据",
        r"token",
    ]
]

INSTANT_REPLY_RULES = [
    (
        re.compile(r"^(你好|您好|hi|hello|hey)[!！,.。 ]*$", re.I),
        {
            "zh": "你好，我在。你可以直接告诉我公司名称、官网地址，或者当前最想提升的增长问题。",
            "en": "Hi, I’m here. You can share your company, website URL, or the main growth issue you want to improve.",
        },
    ),
    (
        re.compile(r"(怎么联系|如何联系|联系你们|联系顾问|怎么合作|如何合作|预约咨询|预约演示|demo|consultation|contact)", re.I),
        {
            "zh": "可以直接在这里说你的公司、官网和当前问题，我会先帮你梳理需求；如果合适，也可以继续留下联系方式，方便顾问跟进。",
            "en": "You can share your company, website, and current issue here. I’ll help qualify the need first, and you can leave contact details for follow-up if useful.",
        },
    ),
    (
        re.compile(r"(你们做什么|做什么的|是什么|能做什么|jgmao是做什么|what do you do|what is jgmao)", re.I),
        {
            "zh": "坚果猫 JGMAO 主要帮助企业把 AI 可见性、内容生产、官网承接、智能获客和推荐决策连成一个真正可运转的增长飞轮。",
            "en": "JGMAO helps businesses connect AI visibility, content production, website conversion, lead capture, and recommendation insights into one working growth flywheel.",
        },
    ),
    (
        re.compile(r"(价格|收费|多少钱|报价|套餐|price|pricing|quote)", re.I),
        {
            "zh": "报价会根据行业、当前网站基础和你最想解决的问题来定。你可以先告诉我官网地址和当前目标，我先帮你判断适合从哪一块开始。",
            "en": "Pricing depends on your industry, website baseline, and what you want to solve first. Share your website and current goal, and I can help narrow down the right starting point.",
        },
    ),
    (
        re.compile(r"(企业怎么做增长|怎么做增长|如何做增长|怎么提升增长|how to grow a business|how to drive growth)", re.I),
        {
            "zh": "企业做增长，核心不是单纯加投流，而是先找清楚卡点，再把获客、转化、留存和复购这条链路逐段提效。如果你愿意，可以直接告诉我行业、官网和当前最卡的一段，我帮你先判断从哪里下手。",
            "en": "Growth usually starts with finding the main bottleneck first, then improving acquisition, conversion, retention, and repeat purchase step by step. If you want, share your industry, website, and current bottleneck, and I’ll help narrow down the best starting point.",
        },
    ),
    (
        re.compile(r"(官网.*怎么优化|网站.*怎么优化|官网优化|网站优化|how to improve (our )?(website|site))", re.I),
        {
            "zh": "官网优化通常先看三件事：信息是否足够清晰、页面是否能承接转化、内容是否容易被 AI 和搜索理解。如果你愿意，可以把官网地址发给我，我先帮你判断最值得优先改的部分。",
            "en": "Website optimization usually starts with three things: clarity of messaging, conversion flow, and whether the content is easy for AI/search systems to understand. If you share the website URL, I can help identify the best place to start.",
        },
    ),
]


def get_public_chat_api_key():
    if PUBLIC_CHAT_API_KEY:
        return PUBLIC_CHAT_API_KEY.strip()
    if PUBLIC_CHAT_API_KEY_FILE:
        with open(PUBLIC_CHAT_API_KEY_FILE, "r") as fh:
            return fh.read().strip()
    raise RuntimeError("Missing public chat API key.")


def is_authorized(handler):
    if not SHARED_TOKEN:
        return True
    return handler.headers.get("Authorization", "") == "Bearer {}".format(SHARED_TOKEN)


def is_zh(text):
    return bool(re.search(r"[\u4e00-\u9fff]", text or ""))


def get_localized_copy(copy, message):
    return copy["zh"] if is_zh(message) else copy["en"]


def get_instant_reply(message):
    trimmed = (message or "").strip()
    if not trimmed:
        return ""
    for pattern, reply in INSTANT_REPLY_RULES:
        if pattern.search(trimmed):
            return get_localized_copy(reply, trimmed)
    return ""


def is_sensitive_credential_request(message):
    text = (message or "").lower()
    for pattern in SENSITIVE_PATTERNS:
        if pattern.search(text):
            return True
    return False


def get_sensitive_credential_refusal(message):
    if is_zh(message):
        return "不要在聊天里提供 SSH 密钥、密码、API Key 或其他敏感凭据。我可以继续帮你梳理官网、业务目标、技术栈和接入需求；如果需要正式技术对接，我们会通过安全方式安排工程师跟进。"
    return "Please do not share SSH keys, passwords, API keys, cookies, or any other sensitive credentials in chat. I can still help with your website context, goals, stack, and integration needs, and an engineer can follow up through a secure process if needed."


def create_public_chat_prompt(message):
    return "\n".join(
        [
            "你是坚果猫 JGMAO 官网对外咨询助手，底层模型为 qwen-3.6-plus。",
            "你的职责只包括：介绍坚果猫公开能力、判断是否适合、回答公开 FAQ、收集基础需求、引导用户通过官网/电话/邮箱继续联系。",
            "严格禁止：索要源码、SSH、密码、密钥、Token、Cookie、后台权限、数据库信息、私有仓库内容、内部配置文件。",
            "如果用户问题涉及技术接入、权限操作、代码部署、内容发布后台或任何敏感凭据，只能提醒不要在聊天中提供敏感信息，并引导其通过正式商务/工程师对接方式继续。",
            "回答要求：默认中文、简洁、可信、官网口吻；优先 1 句核心判断 + 最多 3 个短点；尽量控制在 120 字以内，除非用户明确要求更详细。",
            "不要暴露内部 Agent、OpenClaw、飞书或后台工作流细节。",
            "",
            "用户消息：",
            message,
        ]
    )


def normalize_model_error(text):
    normalized = text or ""
    lowered = normalized.lower()
    if "timed out" in lowered or "timeout" in lowered:
        return "咨询助手响应稍慢，请稍后重试，或直接留下官网地址和问题重点，我会尽量用更简短的方式回答。"
    if "429" in lowered or "too many requests" in lowered or "rate limit" in lowered:
        return "咨询量有点高，我这边稍后再试一次；如果比较着急，也可以直接通过官网联系方式与我们沟通。"
    if re.search(r"50[0-9]", lowered) or "bad gateway" in lowered or "upstream" in lowered:
        return "咨询助手暂时连接不稳定，请稍后再试；如果比较着急，也可以直接通过官网联系方式与我们沟通。"
    return ""


def create_stream_chunks(text):
    normalized = (text or "").replace("\r", "").strip()
    if not normalized:
        return []

    chunks = []
    paragraphs = [part.strip() for part in re.split(r"\n{2,}", normalized) if part.strip()]

    for paragraph in paragraphs:
        if len(paragraph) <= STREAM_CHUNK_SIZE:
            chunks.append(paragraph)
            continue

        segments = [part.strip() for part in re.split(r"(?<=[。！？!?；;：:])\s*|(?<=\.)\s+", paragraph) if part.strip()]
        if not segments:
            chunks.append(paragraph)
            continue

        current = ""
        for segment in segments:
            if not current:
                current = segment
                continue
            if len(current + segment) <= STREAM_CHUNK_SIZE:
                current += segment
                continue
            chunks.append(current)
            current = segment
        if current:
            chunks.append(current)

    return chunks


def run_public_model(message):
    payload = json.dumps(
        {
            "model": PUBLIC_CHAT_MODEL,
            "temperature": PUBLIC_CHAT_TEMPERATURE,
            "max_tokens": PUBLIC_CHAT_MAX_TOKENS,
            "messages": [{"role": "system", "content": create_public_chat_prompt(message)}],
        },
        ensure_ascii=False,
    ).encode("utf-8")

    result = subprocess.run(
        [
            "curl",
            "--silent",
            "--show-error",
            "--max-time",
            str(max(1, int(PUBLIC_CHAT_TIMEOUT_MS / 1000))),
            "-H",
            "Content-Type: application/json",
            "-H",
            "Authorization: Bearer {}".format(get_public_chat_api_key()),
            "-X",
            "POST",
            "--data-binary",
            "@-",
            "{}/chat/completions".format(PUBLIC_CHAT_API_BASE_URL),
        ],
        input=payload,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )

    stdout = result.stdout.decode("utf-8", errors="ignore")
    stderr = result.stderr.decode("utf-8", errors="ignore")

    if result.returncode != 0:
        raise RuntimeError(normalize_model_error(stderr or stdout) or stderr or stdout or "咨询助手暂时没有成功返回结果，请稍后重试。")

    try:
        parsed = json.loads(stdout)
    except Exception:
        raise RuntimeError(normalize_model_error(stdout) or "咨询助手暂时没有成功返回结果，请稍后重试。")

    choices = parsed.get("choices") or []
    reply_parts = []
    for choice in choices:
        content = ((choice or {}).get("message") or {}).get("content")
        if isinstance(content, str):
            if content.strip():
                reply_parts.append(content.strip())
        elif isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and isinstance(item.get("text"), str) and item["text"].strip():
                    reply_parts.append(item["text"].strip())

    reply = "\n\n".join(reply_parts).strip()
    if not reply:
        raise RuntimeError("咨询助手暂时没有成功返回结果，请稍后重试。")

    return {"reply": reply, "raw": parsed}


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class Handler(BaseHTTPRequestHandler):
    server_version = "JGMAOPublicChat/1.0"

    def log_message(self, format, *args):
        print("[gateway] {} - {}".format(self.address_string(), format % args))

    def do_OPTIONS(self):
        if self.path != "/chat":
            self.send_error(404, "Not found")
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        if self.path != "/chat":
            self._write_json(404, {"ok": False, "error": "Not found"})
            return

        if not is_authorized(self):
            self._write_json(401, {"ok": False, "error": "Unauthorized"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))
            message = (payload.get("message") or "").strip()
            session_id = (payload.get("sessionId") or "").strip()
            stream = bool(payload.get("stream")) or "application/x-ndjson" in (self.headers.get("Accept", "") or "")

            if not message or not session_id:
                self._write_json(400, {"ok": False, "error": "Missing message or sessionId"})
                return

            print("[gateway] incoming request session={} messageLength={}".format(session_id, len(message)))

            if is_sensitive_credential_request(message):
                reply = get_sensitive_credential_refusal(message)
                if stream:
                    self._stream_reply(reply, route="sensitive-guard")
                else:
                    self._write_json(200, {"ok": True, "reply": reply}, cache_control=True)
                return

            instant_reply = get_instant_reply(message)
            if instant_reply:
                if stream:
                    self._stream_reply(instant_reply, route="instant")
                else:
                    self._write_json(200, {"ok": True, "reply": instant_reply}, cache_control=True)
                return

            if stream:
                self.send_response(200)
                self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self._write_stream_event({"type": "start", "route": "public-model"})
                self._write_stream_event(
                    {
                        "type": "status",
                        "message": "我先快速整理问题，再给你一个简短答复。"
                        if is_zh(message)
                        else "Reviewing the question and preparing a concise reply.",
                    }
                )
                result = run_public_model(message)
                self._stream_reply(result["reply"], route="public-model", skip_start=True)
                return

            result = run_public_model(message)
            self._write_json(200, {"ok": True, "reply": result["reply"]}, cache_control=True)
        except Exception as error:
            print("[gateway] request failed {}".format(error))
            message_text = str(error)
            if "application/x-ndjson" in (self.headers.get("Accept", "") or ""):
                self.send_response(500)
                self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self._write_stream_event({"type": "error", "error": message_text})
                return
            self._write_json(500, {"ok": False, "error": message_text})

    def _write_json(self, status, payload, cache_control=False):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        if cache_control:
            self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _write_stream_event(self, payload):
        self.wfile.write((json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8"))
        self.wfile.flush()

    def _stream_reply(self, reply, route=None, skip_start=False):
        if not skip_start:
            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self._write_stream_event({"type": "start", "route": route})

        chunks = create_stream_chunks(reply)
        if not chunks:
            self._write_stream_event({"type": "done", "reply": reply})
            return

        for chunk in chunks:
            self._write_stream_event({"type": "delta", "delta": chunk})
            time.sleep(float(STREAM_CHUNK_DELAY_MS) / 1000.0)

        self._write_stream_event({"type": "done", "reply": reply})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Public chat gateway listening on http://{}:{}/chat".format(HOST, PORT))
    print("Forwarding website chat directly to public model: {}".format(PUBLIC_CHAT_MODEL))
    server.serve_forever()


if __name__ == "__main__":
    main()
