#!/usr/bin/env python3
import json
import html
import os
import re
import subprocess
import time
import hashlib
import random
import string
import secrets
import base64
import struct
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from socketserver import ThreadingMixIn
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree
from urllib.error import HTTPError
from urllib import request as urllib_request
from urllib.parse import parse_qs, quote, urlencode, urljoin, urlparse


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
FEISHU_WEBHOOK_URL = os.environ.get("FEISHU_WEBHOOK_URL", "").strip()
FEISHU_APP_ID = os.environ.get("FEISHU_APP_ID", "").strip()
FEISHU_APP_SECRET = os.environ.get("FEISHU_APP_SECRET", "").strip()
FEISHU_TARGET_CHAT_ID = os.environ.get("FEISHU_TARGET_CHAT_ID", "").strip()
FEISHU_TARGET_USER_OPEN_ID = os.environ.get("FEISHU_TARGET_USER_OPEN_ID", "").strip()
WECHAT_APP_ID = os.environ.get("WECHAT_APP_ID", "").strip()
WECHAT_APP_SECRET = os.environ.get("WECHAT_APP_SECRET", "").strip()
LEAD_LOG_FILE = os.environ.get("LEAD_LOG_FILE", "/tmp/jgmao-leads.ndjson")
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://www.jgmao.com").rstrip("/")
GEO_REPORT_DIR = os.environ.get("GEO_REPORT_DIR", "/tmp/jgmao-geo-reports")
GEO_ORDER_DIR = os.environ.get("GEO_ORDER_DIR", "/tmp/jgmao-geo-orders")
WECOM_SUPPORT_LINK = (os.environ.get("WECOM_SUPPORT_LINK", "https://work.weixin.qq.com/u/vc111a7db585fe5798?v=5.0.7.68221&bb=2a039738e3") or "").strip()
WECOM_CORP_ID = os.environ.get("WECOM_CORP_ID", "").strip()
WECOM_AGENT_ID = os.environ.get("WECOM_AGENT_ID", "").strip()
WECOM_AGENT_SECRET = os.environ.get("WECOM_AGENT_SECRET", "").strip()
WECOM_AGENT_USER_ID = os.environ.get("WECOM_AGENT_USER_ID", "").strip()
WECOM_CONTACT_SECRET = os.environ.get("WECOM_CONTACT_SECRET", "").strip()
WECOM_CALLBACK_TOKEN = os.environ.get("WECOM_CALLBACK_TOKEN", "").strip()
WECOM_CALLBACK_AES_KEY = os.environ.get("WECOM_CALLBACK_AES_KEY", "").strip()
WECHAT_PAY_APP_ID = os.environ.get("WECHAT_PAY_APP_ID", WECHAT_APP_ID).strip()
WECHAT_PAY_MCH_ID = os.environ.get("WECHAT_PAY_MCH_ID", "").strip()
WECHAT_PAY_API_V2_KEY = os.environ.get("WECHAT_PAY_API_V2_KEY", "").strip()
WECHAT_PAY_APP_SECRET = os.environ.get("WECHAT_PAY_APP_SECRET", WECHAT_APP_SECRET).strip()
WECHAT_PAY_NOTIFY_URL = os.environ.get("WECHAT_PAY_NOTIFY_URL", "").strip()
WECHAT_PAY_OAUTH_BASE_URL = os.environ.get("WECHAT_PAY_OAUTH_BASE_URL", "").strip().rstrip("/")
WECHAT_PAY_OAUTH_CALLBACK_PATH = (os.environ.get("WECHAT_PAY_OAUTH_CALLBACK_PATH", "/pay/wechat/callback/") or "/pay/wechat/callback/").strip()
WECHAT_PAY_SOLUTION_PRICE_FEN = int(os.environ.get("WECHAT_PAY_SOLUTION_PRICE_FEN", "9900"))
WECHAT_PAY_STANDARD_PRICE_FEN = int(os.environ.get("WECHAT_PAY_STANDARD_PRICE_FEN", "129900"))
WECHAT_ACCESS_TOKEN_CACHE = {"value": "", "expires_at": 0}
WECHAT_JSAPI_TICKET_CACHE = {"value": "", "expires_at": 0}
WECOM_ACCESS_TOKEN_CACHE = {"value": "", "expires_at": 0}

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
            "zh": "你好，我是坚果猫官网咨询助手。坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。请简述你的行业场景、官网现状与核心诉求。",
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
            "zh": "坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。你可以继续告诉我行业场景、官网现状与核心诉求，我会按官网公开业务范围为你判断合适方向。",
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
            "你是坚果猫（JGMAO）官网对外咨询助手，底层模型为 qwen-3.6-plus。",
            "坚果猫（JGMAO）专注于帮助企业提升 AI 可见性、内容生产效率、官网转化与智能获客能力。",
            "你的职责只包括：介绍坚果猫公开能力、判断是否适合、回答公开 FAQ、收集基础需求、引导用户通过官网/电话/邮箱继续联系。",
            "严格禁止：索要源码、SSH、密码、密钥、Token、Cookie、后台权限、数据库信息、私有仓库内容、内部配置文件。",
            "如果用户问题涉及技术接入、权限操作、代码部署、内容发布后台或任何敏感凭据，只能提醒不要在聊天中提供敏感信息，并引导其通过正式商务/工程师对接方式继续。",
            "如果用户问题与坚果猫官网公开业务明显无关，不要发散回答通用知识；先用 1 句说明坚果猫的业务范围，再请用户简述行业场景、官网现状与核心诉求。",
            "回答要求：默认中文、简洁、可信、官网口吻；优先 1 句核心判断 + 最多 3 个短点；尽量控制在 120 字以内，除非用户明确要求更详细。",
            "不要暴露内部 Agent、OpenClaw、飞书或后台工作流细节。",
            "在合适时，可自然补一句：完整资料与演示预约请访问官网或致电/邮件客服，我们将安排专人对接。",
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


def normalize_website_url(value):
    trimmed = str(value or "").strip()
    if not trimmed:
        raise RuntimeError("请填写官网网址。")

    if not re.match(r"^https?://", trimmed, re.I):
        trimmed = "https://" + trimmed

    parsed = urlparse(trimmed)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise RuntimeError("官网网址格式不正确，请检查后再试。")
    return trimmed


def build_report_site_key(value):
    normalized = normalize_website_url(value)
    parsed = urlparse(normalized)
    hostname = (parsed.hostname or "").lower()
    if hostname.startswith("www."):
        hostname = hostname[4:]
    port = parsed.port
    if port and port not in (80, 443):
        hostname = "{}:{}".format(hostname, port)
    return hostname or normalized.lower()


def build_report_token(value):
    site_key = build_report_site_key(value)
    return hashlib.sha1(site_key.encode("utf-8")).hexdigest()[:24]


def strip_html(html):
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def count_geo_score_entries():
    log_path = Path(LEAD_LOG_FILE)
    if not log_path.exists():
        return 0

    total = 0
    with log_path.open("r", encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped:
                continue
            try:
                entry = json.loads(stripped)
            except Exception:
                continue
            if entry.get("type") == "geo-score":
                total += 1
    return total


def extract_tag_content(html, pattern):
    match = re.search(pattern, html, re.I)
    if not match:
        return ""
    return (match.group(1) or "").strip()


THEME_STOP_TERMS = {
    "首页",
    "官网",
    "我们",
    "关于",
    "联系",
    "欢迎",
    "更多",
    "了解",
    "服务",
    "产品",
    "方案",
    "案例",
    "新闻",
    "博客",
    "文章",
    "详情",
    "home",
    "about",
    "contact",
    "service",
    "services",
    "product",
    "products",
    "solution",
    "solutions",
    "case",
    "cases",
    "blog",
    "news",
    "article",
    "articles",
    "details",
    "learn",
    "more",
}


def extract_theme_terms(*texts):
    source = " ".join(text for text in texts if text)
    if not source:
        return []
    matches = re.findall(r"[\u4e00-\u9fff]{2,8}|[A-Za-z][A-Za-z0-9&+/\-]{3,}", source)
    terms = []
    for match in matches:
        term = (match or "").strip().lower()
        if not term or term in THEME_STOP_TERMS:
            continue
        if term not in terms:
            terms.append(term)
    return terms[:12]


def count_question_signals(text):
    source = (text or "")[:6000]
    patterns = [
        r"问[:：]",
        r"Q[:：]",
        r"[？?]",
        r"什么是",
        r"如何",
        r"为什么",
        r"是否",
        r"\bhow\b",
        r"\bwhat\b",
        r"\bwhy\b",
        r"\bwhen\b",
        r"\bwhere\b",
        r"\bcan\b",
    ]
    return sum(len(re.findall(pattern, source, re.I)) for pattern in patterns)


def fetch_html(url, timeout=10):
    if not url or not isinstance(url, str):
        return "", ""
    req = urllib_request.Request(
        url,
        headers={
            "User-Agent": "JGMAO GEO Score Bot/1.0",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib_request.urlopen(req, timeout=timeout) as response:
        status = getattr(response, "status", 200)
        if status < 200 or status >= 300:
            raise RuntimeError("fetch failed")
        final_url = response.geturl() or url
        html = response.read().decode("utf-8", errors="ignore")
        return final_url, html


def extract_candidate_page_urls(home_html, final_url):
    parsed = urlparse(final_url)
    origin = "{}://{}".format(parsed.scheme, parsed.netloc)
    hostname = (parsed.hostname or "").lower()
    matches = re.findall(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)</a>', home_html, re.I)
    candidates = []

    for href, anchor_html in matches:
        full_url = urljoin(final_url, (href or "").strip())
        target = urlparse(full_url)
        if target.scheme not in ("http", "https"):
            continue
        if (target.hostname or "").lower() != hostname:
            continue
        if target.fragment:
            full_url = full_url.split("#", 1)[0]
        if re.search(r"\.(jpg|jpeg|png|gif|svg|webp|pdf|docx?|xlsx?|pptx?|zip)$", target.path or "", re.I):
            continue
        anchor_text = strip_html(anchor_html or "")
        hint = " ".join([target.path or "", anchor_text]).lower()
        if re.search(r"(faq|常见问题|问答|case|案例|portfolio|work|insight|blog|news|article|洞察|报道|contact|联系我们)", hint, re.I):
            if full_url not in candidates:
                candidates.append(full_url)

    fallback_paths = [
        "/faq",
        "/faq/",
        "/cases",
        "/cases/",
        "/case",
        "/case/",
        "/blog",
        "/blog/",
        "/insights",
        "/insights/",
        "/news",
        "/news/",
    ]
    for item in fallback_paths:
        full_url = urljoin(origin, item)
        if full_url not in candidates:
            candidates.append(full_url)

    return candidates[:8]


def collect_site_samples(home_html, final_url):
    samples = []
    for candidate in extract_candidate_page_urls(home_html, final_url):
        if len(samples) >= 4:
            break
        try:
            sample_final_url, sample_html = fetch_html(candidate, timeout=8)
        except Exception:
            continue
        sample_text = strip_html(sample_html)
        signal_text = " ".join([sample_final_url, sample_html[:3000], sample_text[:3000]])
        samples.append(
            {
                "url": sample_final_url,
                "text": sample_text,
                "signalText": signal_text,
                "faq": bool(re.search(r"(FAQPage|常见问题|常见问答|\bfaq\b|frequently asked questions)", signal_text, re.I)),
                "contentAsset": bool(re.search(r"(案例|客户案例|洞察|白皮书|专题|blog|blogs|insights|portfolio|case stud(?:y|ies)|resources|knowledge|article|articles)", signal_text, re.I)),
                "contact": bool(re.search(r"(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询|电话|邮箱|e-?mail|contact us|get in touch|call us|office)", signal_text, re.I)),
                "cta": bool(re.search(r"(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo|book|schedule|quote|contact us|get in touch|enquiry|enquire|start now)", signal_text, re.I)),
            }
        )
    return samples


DIMENSION_META = {
    "crawl": {
        "title": "抓取与索引基础",
        "advice": "优先补齐 HTTPS、canonical、robots.txt 与 sitemap.xml，确保官网地址规范、抓取稳定、可被搜索与 AI 系统持续发现。",
    },
    "theme": {
        "title": "主题结构与页面语义",
        "advice": "集中首页主题表达，补齐 H1、标题、描述和更清晰的页面语义，让 AI 与用户都能更快理解官网重点。",
    },
    "ai": {
        "title": "AI 可见性信号",
        "advice": "继续完善 FAQ、结构化数据与分享语义，增强内容被 AI 理解、抽取、引用与推荐的稳定性。",
    },
    "content": {
        "title": "内容资产与 FAQ 体系",
        "advice": "继续补齐 FAQ、案例、专题页与洞察栏目，让内容形成可复用、可沉淀、可持续扩展的资产体系。",
    },
    "convert": {
        "title": "承接路径与转化能力",
        "advice": "强化电话、企微、表单与 CTA 等高意向承接入口，让官网不只被看见，也能有效承接咨询动作。",
    },
    "trust": {
        "title": "品牌可信度与信任信号",
        "advice": "继续补齐公司信息、备案资质、客户背书与媒体报道等信任信号，增强官网的可信度与商务说服力。",
    },
}


def build_detailed_score(metrics, final_url):
    total_weight = sum(item["weight"] for item in metrics)
    raw_score = sum(item["weight"] for item in metrics if item["ok"])
    score = round((raw_score / total_weight) * 100) if total_weight else 0

    strengths = [item["positive"] for item in metrics if item["ok"]][:3]
    priorities = [item["negative"] for item in metrics if not item["ok"]][:3]

    grouped = {}
    for item in metrics:
        grouped.setdefault(item["dimension"], []).append(item)

    dimensions = []
    for key, items in grouped.items():
        max_score = sum(item["weight"] for item in items)
        dimension_score = sum(item["weight"] for item in items if item["ok"])
        dimensions.append(
            {
                "key": key,
                "title": DIMENSION_META.get(key, {}).get("title", key),
                "score": round((dimension_score / max_score) * 100) if max_score else 0,
                "rawScore": dimension_score,
                "maxScore": max_score,
                "items": [
                    {
                        "key": item["key"],
                        "label": item["label"],
                        "ok": item["ok"],
                        "weight": item["weight"],
                        "positive": item["positive"],
                        "negative": item["negative"],
                    }
                    for item in items
                ],
            }
        )

    dimension_order = ["crawl", "theme", "ai", "content", "convert", "trust"]
    dimensions.sort(key=lambda item: dimension_order.index(item["key"]) if item["key"] in dimension_order else 99)
    deep_advice = [
        {
            "priority": index + 1,
            "title": item["title"],
            "summary": DIMENSION_META.get(item["key"], {}).get("advice", "建议继续补齐这一维度的基础能力。"),
        }
        for index, item in enumerate(sorted([dim for dim in dimensions if dim["score"] < 100], key=lambda dim: dim["score"])[:3])
    ]

    return {
        "score": score,
        "level": get_score_level(score),
        "strengths": strengths or ["官网已有一定基础，可以继续强化 GEO 结构与承接路径。"],
        "priorities": priorities or ["建议继续扩大 FAQ、专题页与结构化数据覆盖，进一步提升 GEO 表现。"],
        "checkedUrl": final_url,
        "dimensions": dimensions,
        "deepAdvice": deep_advice,
    }


def build_geo_report_invite_state(token, previous_invite=None, updated_at=""):
    previous_invite = previous_invite or {}
    accepted_site_keys = [
        item
        for item in (previous_invite.get("acceptedSiteKeys") or [])
        if isinstance(item, str) and item.strip()
    ]
    required_count = 2
    completed_count = len(accepted_site_keys)
    unlocked = bool(previous_invite.get("unlocked")) or completed_count >= required_count
    return {
        "requiredCount": required_count,
        "completedCount": completed_count,
        "unlocked": unlocked,
        "inviteToken": token,
        "inviteUrl": "{}/geo-score/?invite={}".format(PUBLIC_SITE_URL, quote(token, safe="")),
        "acceptedSiteKeys": accepted_site_keys,
        "updatedAt": updated_at or previous_invite.get("updatedAt") or "",
    }


def build_geo_report_wecom_state(token, previous_state=None, updated_at=""):
    previous_state = previous_state or {}
    claim_token = (previous_state.get("claimToken") or "").strip() or secrets.token_hex(12)
    status = (previous_state.get("status") or "").strip() or "pending"
    delivered_at = (previous_state.get("deliveredAt") or "").strip()
    if delivered_at:
        status = "delivered"
    relationship_status = (previous_state.get("relationshipStatus") or "").strip() or "pending"
    if relationship_status == "removed":
        status = "removed"
    return {
        "claimToken": claim_token,
        "status": status,
        "deliveredAt": delivered_at,
        "supportUrl": (previous_state.get("supportUrl") or "").strip() or WECOM_SUPPORT_LINK,
        "configId": (previous_state.get("configId") or "").strip(),
        "sourceType": (previous_state.get("sourceType") or "static").strip(),
        "welcomeSentAt": (previous_state.get("welcomeSentAt") or "").strip(),
        "lastWelcomeCode": (previous_state.get("lastWelcomeCode") or "").strip(),
        "lastError": (previous_state.get("lastError") or "").strip(),
        "externalUserId": (previous_state.get("externalUserId") or "").strip(),
        "followUserId": (previous_state.get("followUserId") or "").strip(),
        "relationshipStatus": relationship_status,
        "unlockedAt": (previous_state.get("unlockedAt") or "").strip(),
        "lastVerifiedAt": (previous_state.get("lastVerifiedAt") or "").strip(),
        "updatedAt": updated_at or previous_state.get("updatedAt") or "",
    }


def apply_geo_report_invite(invite_token, current_report, created_at):
    token = (invite_token or "").strip()
    if not token:
        return None

    if token == (current_report.get("token") or ""):
        return {"status": "self", "invite": None}

    try:
        inviter_report = read_geo_report(token)
    except Exception:
        return {"status": "missing", "invite": None}

    inviter_input = inviter_report.get("input") or {}
    inviter_result = inviter_report.get("result") or {}
    current_input = current_report.get("input") or {}
    current_result = current_report.get("result") or {}
    inviter_site_key = inviter_report.get("siteKey") or build_report_site_key(
        inviter_input.get("websiteUrl") or inviter_result.get("checkedUrl") or ""
    )
    current_site_key = current_report.get("siteKey") or build_report_site_key(
        current_input.get("websiteUrl") or current_result.get("checkedUrl") or ""
    )

    if not current_site_key:
        return {"status": "invalid", "invite": None}

    if inviter_site_key and inviter_site_key == current_site_key:
        return {"status": "self", "invite": None}

    inviter_contact = (inviter_input.get("contact") or "").strip().lower()
    current_contact = (current_input.get("contact") or "").strip().lower()
    if inviter_contact and current_contact and inviter_contact == current_contact:
        return {"status": "self", "invite": None}

    invite_state = build_geo_report_invite_state(token, inviter_report.get("invite") or {}, created_at)
    accepted_site_keys = invite_state.get("acceptedSiteKeys") or []
    if current_site_key in accepted_site_keys:
        return {"status": "duplicate", "invite": invite_state}

    accepted_site_keys.append(current_site_key)
    invite_state["acceptedSiteKeys"] = accepted_site_keys
    invite_state["completedCount"] = len(accepted_site_keys)
    invite_state["unlocked"] = invite_state["completedCount"] >= invite_state["requiredCount"]
    invite_state["updatedAt"] = created_at
    inviter_report["invite"] = invite_state
    inviter_report["updatedAt"] = created_at

    file_path = Path(GEO_REPORT_DIR) / "{}.json".format(token)
    file_path.write_text(json.dumps(inviter_report, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "counted", "invite": invite_state}


def deliver_geo_report_wecom_claim(claim_token, delivered_at="", external_user_id="", follow_user_id=""):
    token = (claim_token or "").strip()
    if not token:
        raise ValueError("缺少企微领取 token。")

    report_dir = Path(GEO_REPORT_DIR)
    if not report_dir.exists():
        raise FileNotFoundError(token)

    for file_path in report_dir.glob("*.json"):
        try:
            report = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        wecom_state = report.get("wecomClaim") or {}
        if (wecom_state.get("claimToken") or "").strip() != token:
            continue

        delivered_time = delivered_at or datetime.now(timezone.utc).astimezone().isoformat()
        next_state = {
            **build_geo_report_wecom_state(report.get("token") or "", wecom_state, delivered_time),
            "status": "delivered",
            "deliveredAt": delivered_time,
            "relationshipStatus": "active",
            "unlockedAt": delivered_time,
            "lastVerifiedAt": delivered_time,
            "updatedAt": delivered_time,
        }
        if (external_user_id or "").strip():
            next_state["externalUserId"] = external_user_id.strip()
        if (follow_user_id or "").strip():
            next_state["followUserId"] = follow_user_id.strip()
        report["wecomClaim"] = next_state
        report["updatedAt"] = delivered_time
        file_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        return report

    raise FileNotFoundError(token)


def update_geo_report_wecom_relationship(external_user_id="", follow_user_id="", relationship_status="removed"):
    external_id = (external_user_id or "").strip()
    user_id = (follow_user_id or "").strip()
    next_status = (relationship_status or "").strip() or "removed"
    if not external_id:
        raise ValueError("缺少 external_user_id。")

    report_dir = Path(GEO_REPORT_DIR)
    if not report_dir.exists():
        raise FileNotFoundError(external_id)

    now_text = datetime.now(timezone.utc).astimezone().isoformat()
    for file_path in report_dir.glob("*.json"):
        try:
            report = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        wecom_state = report.get("wecomClaim") or {}
        if (wecom_state.get("externalUserId") or "").strip() != external_id:
            continue
        if user_id and (wecom_state.get("followUserId") or "").strip() != user_id:
            continue
        next_state = {
            **build_geo_report_wecom_state(report.get("token") or "", wecom_state, now_text),
            "relationshipStatus": next_status,
            "lastVerifiedAt": now_text,
            "updatedAt": now_text,
        }
        if next_status == "removed":
            next_state["status"] = "removed"
        elif (next_state.get("deliveredAt") or "").strip():
            next_state["status"] = "delivered"
        report["wecomClaim"] = next_state
        report["updatedAt"] = now_text
        file_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        return report

    raise FileNotFoundError(external_id)


def verify_geo_report_wecom_relationship(report, refresh_after_hours=6):
    report = report or {}
    wecom_state = report.get("wecomClaim") or {}
    external_user_id = (wecom_state.get("externalUserId") or "").strip()
    follow_user_id = (wecom_state.get("followUserId") or "").strip()
    relationship_status = (wecom_state.get("relationshipStatus") or "").strip() or "pending"
    delivered_at = (wecom_state.get("deliveredAt") or "").strip()
    if not external_user_id or not follow_user_id or not delivered_at:
        return report
    if relationship_status == "removed":
        return report

    last_verified_at = (wecom_state.get("lastVerifiedAt") or "").strip()
    if last_verified_at:
        try:
            verified_time = parse_datetime_value(last_verified_at)
            now_time = datetime.now(timezone.utc).astimezone()
            if (now_time - verified_time) <= timedelta(hours=refresh_after_hours):
                return report
        except Exception:
            pass

    try:
        response = get_wecom_json(
            "/cgi-bin/externalcontact/get",
            {"external_userid": external_user_id},
        )
        follow_users = response.get("follow_user") or []
        if not isinstance(follow_users, list):
            follow_users = [follow_users] if follow_users else []
        is_active = any(
            isinstance(item, dict)
            and (item.get("userid") or "").strip() == follow_user_id
            for item in follow_users
        )
        next_status = "active" if is_active else "removed"
    except Exception as error:
        next_status = relationship_status
        wecom_state["lastError"] = str(error)
        report["wecomClaim"] = wecom_state
        return report

    refreshed_at = datetime.now(timezone.utc).astimezone().isoformat()
    report["wecomClaim"] = {
        **build_geo_report_wecom_state(report.get("token") or "", wecom_state, refreshed_at),
        "relationshipStatus": next_status,
        "lastVerifiedAt": refreshed_at,
        "updatedAt": refreshed_at,
        "status": "removed" if next_status == "removed" else "delivered",
    }
    report["updatedAt"] = refreshed_at
    report_path = Path(GEO_REPORT_DIR) / "{}.json".format(report.get("token") or "")
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def build_geo_report_access_state(report):
    report = report or {}
    wecom_state = report.get("wecomClaim") or {}
    relationship_status = (wecom_state.get("relationshipStatus") or "").strip() or "pending"
    delivered_at = (wecom_state.get("deliveredAt") or "").strip()
    is_unlocked = bool(delivered_at) and relationship_status != "removed"
    if is_unlocked:
        return {
            "locked": False,
            "message": "",
        }
    if relationship_status == "removed":
        return {
            "locked": True,
            "message": "你已不在当前企微客户关系中，请重新添加企微后继续查看详细报告。",
        }
    return {
        "locked": True,
        "message": "添加企微后可继续查看详细报告。",
    }


def build_geo_report_locked_payload(report):
    report = report or {}
    result = report.get("result") or {}
    return {
        "token": report.get("token") or "",
        "createdAt": report.get("createdAt") or "",
        "firstCreatedAt": report.get("firstCreatedAt") or "",
        "updatedAt": report.get("updatedAt") or "",
        "reportUrl": report.get("reportUrl") or "",
        "siteKey": report.get("siteKey") or "",
        "reportStatus": report.get("reportStatus") or "",
        "unchangedWithin24h": bool(report.get("unchangedWithin24h")),
        "input": report.get("input") or {},
        "result": {
            "score": result.get("score", 0),
            "level": result.get("level") or "",
            "strengths": result.get("strengths") or [],
            "priorities": result.get("priorities") or [],
            "checkedUrl": result.get("checkedUrl") or "",
        },
        "wecomClaim": report.get("wecomClaim") or {},
    }


def save_geo_report(entry):
    token = build_report_token(entry.get("websiteUrl") or entry.get("result", {}).get("checkedUrl") or "")
    report_dir = Path(GEO_REPORT_DIR)
    report_dir.mkdir(parents=True, exist_ok=True)
    file_path = report_dir / "{}.json".format(token)
    previous = {}

    if file_path.exists():
        try:
            previous = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            previous = {}

    current_result = entry.get("result") or {}
    report_exists = file_path.exists()
    current_snapshot = {
        "createdAt": entry["createdAt"],
        "score": current_result.get("score", 0),
        "level": current_result.get("level", ""),
        "checkedUrl": current_result.get("checkedUrl") or entry.get("websiteUrl") or "",
        "dimensions": [
            {
                "key": item.get("key"),
                "title": item.get("title"),
                "score": item.get("score", 0),
            }
            for item in (current_result.get("dimensions") or [])
        ],
    }
    result_fingerprint = hashlib.sha1(
        json.dumps(
            {
                "score": current_snapshot["score"],
                "level": current_snapshot["level"],
                "checkedUrl": current_snapshot["checkedUrl"],
                "dimensions": current_snapshot["dimensions"],
            },
            ensure_ascii=False,
            sort_keys=True,
        ).encode("utf-8")
    ).hexdigest()
    previous_fingerprint = previous.get("resultFingerprint") or ""
    previous_updated_at = previous.get("updatedAt") or previous.get("createdAt") or previous.get("firstCreatedAt") or ""
    same_within_24h = False

    if report_exists and previous_fingerprint and previous_fingerprint == result_fingerprint and previous_updated_at:
        try:
            previous_time = parse_datetime_value(previous_updated_at)
            current_time = parse_datetime_value(str(entry["createdAt"]))
            same_within_24h = (current_time - previous_time) <= timedelta(hours=24)
        except Exception:
            same_within_24h = False

    if same_within_24h:
        refreshed_report = {
            **previous,
            "updatedAt": entry["createdAt"],
            "reportUrl": previous.get("reportUrl") or "{}/geo-report/{}/".format(PUBLIC_SITE_URL, token),
            "input": {
                **(previous.get("input") or {}),
                "name": entry.get("name") or "",
                "company": entry.get("company") or "",
                "contact": entry.get("contact") or "",
                "websiteUrl": entry.get("websiteUrl") or "",
                "source": entry.get("source") or "",
                "page": entry.get("page") or "",
            },
            "reportStatus": "unchanged",
            "unchangedWithin24h": True,
        }
        refreshed_report["invite"] = build_geo_report_invite_state(
            token,
            previous.get("invite") or {},
            entry["createdAt"],
        )
        refreshed_report["wecomClaim"] = build_geo_report_wecom_state(
            token,
            previous.get("wecomClaim") or {},
            entry["createdAt"],
        )
        ensure_geo_report_wecom_contact_way(refreshed_report)
        report_dir.mkdir(parents=True, exist_ok=True)
        file_path.write_text(json.dumps(refreshed_report, ensure_ascii=False, indent=2), encoding="utf-8")
        return refreshed_report

    previous_history = previous.get("history") or []
    filtered_history = [
        item
        for item in previous_history
        if item.get("createdAt") != current_snapshot["createdAt"]
    ]
    history = (filtered_history + [current_snapshot])[-20:]

    report = {
        "token": token,
        "type": "geo-score",
        "createdAt": entry["createdAt"],
        "firstCreatedAt": previous.get("firstCreatedAt") or entry["createdAt"],
        "updatedAt": entry["createdAt"],
        "reportUrl": "{}/geo-report/{}/".format(PUBLIC_SITE_URL, token),
        "siteKey": build_report_site_key(entry.get("websiteUrl") or current_result.get("checkedUrl") or ""),
        "input": {
            "name": entry.get("name") or "",
            "company": entry.get("company") or "",
            "contact": entry.get("contact") or "",
            "websiteUrl": entry.get("websiteUrl") or "",
            "source": entry.get("source") or "",
            "page": entry.get("page") or "",
        },
        "result": current_result,
        "history": history,
        "resultFingerprint": result_fingerprint,
    }
    report["invite"] = build_geo_report_invite_state(
        token,
        previous.get("invite") or {},
        entry["createdAt"],
    )
    report["wecomClaim"] = build_geo_report_wecom_state(
        token,
        previous.get("wecomClaim") or {},
        entry["createdAt"],
    )
    ensure_geo_report_wecom_contact_way(report)

    file_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return {
        **report,
        "reportStatus": "updated" if report_exists else "new",
        "unchangedWithin24h": False,
    }


def read_geo_report(token):
    file_path = Path(GEO_REPORT_DIR) / "{}.json".format(token)
    if not file_path.exists():
        raise FileNotFoundError(token)
    return json.loads(file_path.read_text(encoding="utf-8"))


def build_wecom_callback_status():
    return {
        "corpIdReady": bool(WECOM_CORP_ID),
        "agentReady": bool(WECOM_AGENT_ID and WECOM_AGENT_SECRET and WECOM_AGENT_USER_ID),
        "contactReady": bool(WECOM_CORP_ID and WECOM_AGENT_SECRET and WECOM_AGENT_USER_ID),
        "callbackCryptoReady": bool(WECOM_CALLBACK_TOKEN and WECOM_CALLBACK_AES_KEY),
    }


def get_wecom_access_token():
    now = int(time.time())
    cached_value = (WECOM_ACCESS_TOKEN_CACHE.get("value") or "").strip()
    cached_expiry = int(WECOM_ACCESS_TOKEN_CACHE.get("expires_at") or 0)
    if cached_value and cached_expiry - 120 > now:
        return cached_value

    if not (WECOM_CORP_ID and WECOM_AGENT_SECRET):
        raise RuntimeError("企微自建应用参数未配置完整。")

    token_url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={}&corpsecret={}".format(
        quote(WECOM_CORP_ID, safe=""),
        quote(WECOM_AGENT_SECRET, safe=""),
    )
    final_url, response_text = fetch_html(token_url, timeout=10)
    payload = json.loads(response_text or "{}")
    access_token = (payload.get("access_token") or "").strip()
    if not access_token:
        raise RuntimeError(payload.get("errmsg") or "企微 access_token 获取失败。")
    expires_in = int(payload.get("expires_in") or 7200)
    WECOM_ACCESS_TOKEN_CACHE["value"] = access_token
    WECOM_ACCESS_TOKEN_CACHE["expires_at"] = now + expires_in
    return access_token


def post_wecom_json(api_path, payload):
    token = get_wecom_access_token()
    request_url = "https://qyapi.weixin.qq.com{}?access_token={}".format(api_path, quote(token, safe=""))
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib_request.Request(
        request_url,
        data=data,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "JGMAO GEO Score Bot/1.0",
        },
        method="POST",
    )
    with urllib_request.urlopen(req, timeout=10) as response:
        body = response.read().decode("utf-8", errors="ignore")
    parsed = json.loads(body or "{}")
    if int(parsed.get("errcode") or 0) != 0:
        raise RuntimeError(parsed.get("errmsg") or "企微接口调用失败。")
    return parsed


def get_wecom_json(api_path, params=None):
    token = get_wecom_access_token()
    query = {"access_token": token}
    if params:
        for key, value in params.items():
            if value is None:
                continue
            query[str(key)] = str(value)
    request_url = "https://qyapi.weixin.qq.com{}?{}".format(
        api_path,
        urlencode(query),
    )
    final_url, response_text = fetch_html(request_url, timeout=10)
    parsed = json.loads(response_text or "{}")
    if int(parsed.get("errcode") or 0) != 0:
        raise RuntimeError(parsed.get("errmsg") or "企微接口调用失败。")
    return parsed


def resolve_geo_report_wecom_claim_token(external_user_id="", user_id=""):
    external_id = (external_user_id or "").strip()
    follow_user_id = (user_id or "").strip()
    if not external_id:
        return ""
    response = get_wecom_json(
        "/cgi-bin/externalcontact/get",
        {"external_userid": external_id},
    )
    follow_users = response.get("follow_user") or []
    if isinstance(follow_users, dict):
        follow_users = [follow_users]
    if not isinstance(follow_users, list):
        return ""

    fallback_state = ""
    for follow in follow_users:
        if not isinstance(follow, dict):
            continue
        state_value = (follow.get("state") or "").strip()
        if not state_value:
            continue
        if follow_user_id and (follow.get("userid") or "").strip() == follow_user_id:
            return state_value
        if not fallback_state:
            fallback_state = state_value
    return fallback_state


def find_recent_geo_report_claim(max_age_minutes=60):
    report_dir = Path(GEO_REPORT_DIR)
    if not report_dir.exists():
        return ""
    now = datetime.now(timezone.utc).astimezone()
    candidates = []
    for file_path in report_dir.glob("*.json"):
        try:
            report = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        wecom_state = report.get("wecomClaim") or {}
        claim_token = (wecom_state.get("claimToken") or "").strip()
        if not claim_token:
            continue
        if (wecom_state.get("sourceType") or "").strip() != "dynamic":
            continue
        updated_at = (
            report.get("updatedAt")
            or wecom_state.get("updatedAt")
            or report.get("createdAt")
            or report.get("firstCreatedAt")
            or ""
        )
        try:
            updated_time = parse_datetime_value(updated_at)
        except Exception:
            continue
        age_minutes = (now - updated_time.astimezone()).total_seconds() / 60
        if age_minutes < 0 or age_minutes > max_age_minutes:
            continue
        candidates.append((updated_time, claim_token))
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1] if candidates else ""


def ensure_geo_report_wecom_contact_way(report):
    if not build_wecom_callback_status()["contactReady"]:
        return report.get("wecomClaim") or {}

    claim = build_geo_report_wecom_state(report.get("token") or "", report.get("wecomClaim") or {}, report.get("updatedAt") or "")
    existing_url = (claim.get("supportUrl") or "").strip()
    report_url = (report.get("reportUrl") or "").strip()
    existing_config_id = (claim.get("configId") or "").strip()
    if existing_config_id and existing_url and existing_url != WECOM_SUPPORT_LINK:
        if report_url:
            try:
                post_wecom_json(
                    "/cgi-bin/externalcontact/update_contact_way",
                    {
                        "config_id": existing_config_id,
                        "conclusions": {
                            "text": {
                                "content": "你好，已为你准备好本次官网 GEO 详细报告：{}".format(report_url),
                            }
                        },
                    },
                )
                claim["lastError"] = ""
            except Exception as error:
                claim["lastError"] = str(error)
        report["wecomClaim"] = claim
        return claim

    payload = {
        "type": 1,
        "scene": 2,
        "style": 1,
        "skip_verify": True,
        "state": claim.get("claimToken") or "",
        "remark": "geo:{}".format((report.get("token") or "")[:16]),
        "user": [WECOM_AGENT_USER_ID],
    }
    if report_url:
        payload["conclusions"] = {
            "text": {
                "content": "你好，已为你准备好本次官网 GEO 详细报告：{}".format(report_url),
            }
        }
    try:
        response = post_wecom_json("/cgi-bin/externalcontact/add_contact_way", payload)
        claim["supportUrl"] = (response.get("qr_code") or "").strip() or existing_url or WECOM_SUPPORT_LINK
        claim["configId"] = (response.get("config_id") or "").strip()
        claim["sourceType"] = "dynamic"
        claim["lastError"] = ""
    except Exception as error:
        claim["supportUrl"] = existing_url or WECOM_SUPPORT_LINK
        claim["sourceType"] = "static"
        claim["lastError"] = str(error)
    claim["updatedAt"] = report.get("updatedAt") or claim.get("updatedAt") or ""
    report["wecomClaim"] = claim
    return claim


def find_geo_report_by_claim_token(claim_token):
    token = (claim_token or "").strip()
    if not token:
        raise FileNotFoundError(token)
    report_dir = Path(GEO_REPORT_DIR)
    if not report_dir.exists():
        raise FileNotFoundError(token)
    for file_path in report_dir.glob("*.json"):
        try:
            report = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        wecom_state = report.get("wecomClaim") or {}
        if (wecom_state.get("claimToken") or "").strip() == token:
            return report, file_path
    raise FileNotFoundError(token)


def send_wecom_welcome_message(welcome_code, report):
    code = (welcome_code or "").strip()
    if not code:
        return False
    report_url = (report.get("reportUrl") or "").strip()
    if not report_url:
        return False
    payload = {
        "welcome_code": code,
        "text": {
            "content": "你好，已为你准备好本次官网 GEO 详细报告：{}".format(report_url),
        },
    }
    post_wecom_json("/cgi-bin/externalcontact/send_welcome_msg", payload)
    return True


def build_geo_report_wecom_sent_feishu_message(report):
    report = report or {}
    report_input = report.get("input") or {}
    report_result = report.get("result") or {}
    lines = [
        "详细报告已通过企业微信发送",
        "公司 / 品牌：{}".format(report_input.get("company") or "未填写"),
        "姓名 / 称呼：{}".format(report_input.get("name") or "未填写"),
        "联系方式：{}".format(report_input.get("contact") or "未填写"),
        *(
            ["官网网址：{}".format(report_input.get("websiteUrl"))]
            if report_input.get("websiteUrl")
            else []
        ),
        *(
            [
                "基础评分：{}/100".format(report_result.get("score")),
                "评分结论：{}".format(report_result.get("level")),
            ]
            if report_result
            else []
        ),
        "发送方式：企业微信自动发送",
        *(
            ["详细报告：{}".format(report.get("reportUrl"))]
            if report.get("reportUrl")
            else []
        ),
        "发送时间：{}".format(format_beijing_time(datetime.now(timezone.utc).astimezone().isoformat())),
    ]
    return "\n".join(lines)


def push_geo_report_wecom_sent_to_feishu(report):
    message_text = build_geo_report_wecom_sent_feishu_message(report)

    if FEISHU_WEBHOOK_URL:
        payload = json.dumps(
            {
                "msg_type": "text",
                "content": {
                    "text": message_text,
                },
            },
            ensure_ascii=False,
        ).encode("utf-8")

        req = urllib_request.Request(
            FEISHU_WEBHOOK_URL,
            data=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )

        with urllib_request.urlopen(req, timeout=10) as response:
            status = getattr(response, "status", 200)
            if status < 200 or status >= 300:
                raise RuntimeError("飞书推送失败（{}）".format(status))
        return

    if FEISHU_APP_ID and FEISHU_APP_SECRET:
        payload = json.dumps(
            {
                "app_id": FEISHU_APP_ID,
                "app_secret": FEISHU_APP_SECRET,
            },
            ensure_ascii=False,
        ).encode("utf-8")

        req = urllib_request.Request(
            "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
            data=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )

        try:
            with urllib_request.urlopen(req, timeout=10) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            body = error.read().decode("utf-8", errors="ignore")
            raise RuntimeError("飞书 tenant_access_token 获取失败：{}".format(body or error.reason))

        data = json.loads(body or "{}")
        tenant_access_token = data.get("tenant_access_token") or ""
        if data.get("code") != 0 or not tenant_access_token:
            raise RuntimeError("飞书 tenant_access_token 获取失败：{}".format(data.get("msg") or "unknown error"))

        if FEISHU_TARGET_CHAT_ID:
            receive_id_type = "chat_id"
            receive_id = FEISHU_TARGET_CHAT_ID
        elif FEISHU_TARGET_USER_OPEN_ID:
            receive_id_type = "open_id"
            receive_id = FEISHU_TARGET_USER_OPEN_ID
        else:
            raise RuntimeError("尚未配置飞书接收目标（chat_id 或 user open_id）。")

        send_payload = json.dumps(
            {
                "receive_id": receive_id,
                "msg_type": "text",
                "content": json.dumps({"text": message_text}, ensure_ascii=False),
            },
            ensure_ascii=False,
        ).encode("utf-8")

        send_req = urllib_request.Request(
            "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={}".format(receive_id_type),
            data=send_payload,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer {}".format(tenant_access_token),
            },
            method="POST",
        )

        try:
            with urllib_request.urlopen(send_req, timeout=10) as response:
                send_body = response.read().decode("utf-8")
        except HTTPError as error:
            send_body = error.read().decode("utf-8", errors="ignore")
            raise RuntimeError("飞书消息发送失败：{}".format(send_body or error.reason))

        send_data = json.loads(send_body or "{}")
        if send_data.get("code") != 0:
            raise RuntimeError("飞书消息发送失败：{}".format(send_data.get("msg") or "unknown error"))
        return

    raise RuntimeError("尚未配置飞书 webhook 或飞书应用凭证。")


def build_geo_plan_url_for_order(order):
    order_no = quote(order.get("orderNo") or "", safe="")
    report_token = (order.get("reportToken") or "").strip()
    if report_token:
        return "{}/geo-plan/{}/?paid=1&orderNo={}".format(PUBLIC_SITE_URL, quote(report_token, safe=""), order_no)
    return "{}/geo-plan/?paid=1&orderNo={}".format(PUBLIC_SITE_URL, order_no)


def find_paid_geo_plan_order(plan_key="solution", report_token=""):
    token = (report_token or "").strip()
    if not token:
        return None
    order_dir = Path(GEO_ORDER_DIR)
    if not order_dir.exists():
        return None
    matches = []
    for file_path in order_dir.glob("*.json"):
        try:
            order = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if (order.get("planKey") or "") != plan_key:
            continue
        if (order.get("reportToken") or "").strip() != token:
            continue
        if order.get("paymentStatus") != "paid":
            continue
        matches.append(order)
    if not matches:
        return None
    matches.sort(key=lambda item: item.get("paidAt") or item.get("updatedAt") or item.get("createdAt") or "", reverse=True)
    order = matches[0]
    order["planUrl"] = build_geo_plan_url_for_order(order)
    return order


def attach_geo_report_plan_access(report):
    if not report:
        return report
    paid_order = find_paid_geo_plan_order("solution", report.get("token") or "")
    if not paid_order:
        return report
    report["paidPlanUrl"] = paid_order.get("planUrl") or build_geo_plan_url_for_order(paid_order)
    report["paidPlanOrder"] = {
        "orderNo": paid_order.get("orderNo") or "",
        "planTitle": paid_order.get("planTitle") or "",
        "amountLabel": paid_order.get("amountLabel") or "",
        "paidAt": paid_order.get("paidAt") or "",
    }
    return report


def pkcs7_unpad(data):
    if not data:
        raise RuntimeError("企微回调解密失败：空数据。")
    pad = data[-1]
    if pad < 1 or pad > 32:
        raise RuntimeError("企微回调解密失败：填充长度无效。")
    if data[-pad:] != bytes([pad]) * pad:
        raise RuntimeError("企微回调解密失败：填充校验失败。")
    return data[:-pad]


def verify_wecom_signature(msg_signature, timestamp, nonce, encrypted):
    expected = hashlib.sha1("".join(sorted([WECOM_CALLBACK_TOKEN, timestamp or "", nonce or "", encrypted or ""])).encode("utf-8")).hexdigest()
    return expected == (msg_signature or "")


def decrypt_wecom_ciphertext(encrypted):
    if not WECOM_CALLBACK_AES_KEY:
        raise RuntimeError("企微回调未配置 EncodingAESKey。")
    aes_key = base64.b64decode(WECOM_CALLBACK_AES_KEY + "=")
    iv = aes_key[:16]
    cipher_bytes = base64.b64decode((encrypted or "").encode("utf-8"))
    process = subprocess.run(
        [
            "openssl",
            "enc",
            "-d",
            "-aes-256-cbc",
            "-K",
            aes_key.hex(),
            "-iv",
            iv.hex(),
            "-nopad",
            "-nosalt",
        ],
        input=cipher_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if process.returncode != 0:
        stderr = (process.stderr or b"").decode("utf-8", errors="ignore").strip() or "openssl error"
        raise RuntimeError("企微回调解密失败：{}".format(stderr))
    plain = pkcs7_unpad(process.stdout)
    if len(plain) < 20:
        raise RuntimeError("企微回调解密失败：明文长度异常。")
    content = plain[16:]
    msg_len = struct.unpack("!I", content[:4])[0]
    message = content[4 : 4 + msg_len]
    receive_id = content[4 + msg_len :].decode("utf-8", errors="ignore")
    if WECOM_CORP_ID and receive_id and receive_id != WECOM_CORP_ID:
        raise RuntimeError("企微回调校验失败：企业 ID 不匹配。")
    return message.decode("utf-8", errors="ignore")


PLAN_ORDER_META = {
    "solution": {
        "title": "官网 GEO 优化方案",
        "priceFen": WECHAT_PAY_SOLUTION_PRICE_FEN,
    },
    "standard": {
        "title": "坚果猫AI增长引擎标准版",
        "priceFen": WECHAT_PAY_STANDARD_PRICE_FEN,
    },
}


def format_price_label(amount_fen, plan_key):
    amount = float(amount_fen) / 100.0
    if amount.is_integer():
        amount_text = str(int(amount))
    else:
        amount_text = "{:.2f}".format(amount)
    suffix = "/次" if plan_key == "solution" else "/月"
    return "{}元{}".format(amount_text, suffix)


def build_geo_order_no(plan_key):
    prefix = "JG{}".format("S" if plan_key == "solution" else "P")
    return "{}{}{}".format(prefix, datetime.now().strftime("%Y%m%d%H%M%S"), secrets.token_hex(3).upper())


def is_wechat_pay_ready():
    return all(
        [
            WECHAT_PAY_APP_ID,
            WECHAT_PAY_MCH_ID,
            WECHAT_PAY_API_V2_KEY,
            WECHAT_PAY_NOTIFY_URL,
        ]
    )


def create_geo_plan_order(plan_key, report_token="", source="geo-upgrade", page="/geo-upgrade/"):
    if plan_key not in PLAN_ORDER_META:
        raise ValueError("暂不支持的方案类型。")

    paid_order = find_paid_geo_plan_order(plan_key, report_token)
    if paid_order:
        paid_order["paymentMessage"] = "本次官网 GEO 优化方案已支付，可直接查看交付页。"
        paid_order["planUrl"] = build_geo_plan_url_for_order(paid_order)
        return paid_order

    report = None
    if report_token:
        try:
            report = read_geo_report(report_token)
        except Exception:
            report = None

    meta = PLAN_ORDER_META[plan_key]
    created_at = datetime.now(timezone.utc).astimezone().isoformat()
    buyer = (report or {}).get("input") or {}
    checked_url = ((report or {}).get("result") or {}).get("checkedUrl") or buyer.get("websiteUrl") or ""
    payment_ready = is_wechat_pay_ready()
    order = {
        "orderNo": build_geo_order_no(plan_key),
        "planKey": plan_key,
        "planTitle": meta["title"],
        "amountFen": meta["priceFen"],
        "amountLabel": format_price_label(meta["priceFen"], plan_key),
        "status": "created",
        "paymentStatus": "ready" if payment_ready else "not_configured",
        "paymentMessage": (
            "订单已创建，微信支付已准备就绪，可继续完成支付。"
            if payment_ready
            else "订单已创建，当前微信支付商户参数尚未接入，先保留订单信息，支付打通后可直接使用。"
        ),
        "source": source or "geo-upgrade",
        "page": page or "/geo-upgrade/",
        "reportToken": report_token or "",
        "reportUrl": (report or {}).get("reportUrl") or "",
        "websiteUrl": buyer.get("websiteUrl") or checked_url,
        "company": buyer.get("company") or "",
        "contact": buyer.get("contact") or "",
        "createdAt": created_at,
        "updatedAt": created_at,
    }

    order_dir = Path(GEO_ORDER_DIR)
    order_dir.mkdir(parents=True, exist_ok=True)
    (order_dir / "{}.json".format(order["orderNo"])).write_text(json.dumps(order, ensure_ascii=False, indent=2), encoding="utf-8")
    return order


def read_geo_order(order_no):
    file_path = Path(GEO_ORDER_DIR) / "{}.json".format(order_no)
    if not file_path.exists():
        raise FileNotFoundError(order_no)
    return json.loads(file_path.read_text(encoding="utf-8"))


def write_geo_order(order):
    order_dir = Path(GEO_ORDER_DIR)
    order_dir.mkdir(parents=True, exist_ok=True)
    (order_dir / "{}.json".format(order["orderNo"])).write_text(json.dumps(order, ensure_ascii=False, indent=2), encoding="utf-8")


def mark_geo_order_payment_error(order, error, openid=""):
    message = str(error) or "支付初始化失败。"
    order["paymentStatus"] = "error"
    order["paymentMessage"] = message
    order["lastPaymentError"] = message
    if openid:
        order["openid"] = openid
    order["updatedAt"] = datetime.now(timezone.utc).astimezone().isoformat()
    try:
        write_geo_order(order)
    except Exception:
        pass
    print("[wechat-pay] order={} payment_error={}".format(order.get("orderNo", ""), message), flush=True)


def build_wechat_pay_sign(params):
    keys = sorted(
        key
        for key, value in params.items()
        if key != "sign" and value is not None and str(value) != ""
    )
    signature_base = "&".join(["{}={}".format(key, params[key]) for key in keys]) + "&key={}".format(WECHAT_PAY_API_V2_KEY)
    return hashlib.md5(signature_base.encode("utf-8")).hexdigest().upper()


def build_wechat_pay_xml(params):
    entries = []
    for key, value in params.items():
        if value is None or str(value) == "":
            continue
        entries.append("<{0}><![CDATA[{1}]]></{0}>".format(key, value))
    return "<xml>{}</xml>".format("".join(entries))


def parse_wechat_xml(xml_text):
    root = ElementTree.fromstring(xml_text)
    return {child.tag: child.text or "" for child in root}


def is_wechat_browser(user_agent):
    return "micromessenger" in (user_agent or "").lower()


def request_origin(handler):
    forwarded_proto = (handler.headers.get("X-Forwarded-Proto") or "").split(",")[0].strip()
    host = handler.headers.get("Host") or "127.0.0.1:18788"
    public_parsed = urlparse(PUBLIC_SITE_URL)
    proto = forwarded_proto or ("https" if getattr(handler.connection, "cipher", None) else "http")
    if not forwarded_proto and public_parsed.netloc and host == public_parsed.netloc:
        proto = public_parsed.scheme or proto
    return "{}://{}".format(proto, host)


def sanitize_pay_return_url(value, fallback, handler):
    fallback_url = fallback or "{}/geo-upgrade/?paid=1".format(request_origin(handler))
    if not value:
        return fallback_url
    try:
        parsed = urlparse(urljoin(request_origin(handler), value))
        if parsed.scheme not in ["http", "https"]:
            return fallback_url
        return parsed.geturl()
    except Exception:
        return fallback_url


def fetch_wechat_oauth_openid(code):
    data = fetch_url_json(
        "https://api.weixin.qq.com/sns/oauth2/access_token?appid={}&secret={}&code={}&grant_type=authorization_code".format(
            quote(WECHAT_PAY_APP_ID, safe=""),
            quote(WECHAT_PAY_APP_SECRET, safe=""),
            quote(code, safe=""),
        )
    )
    if not data.get("openid"):
        raise RuntimeError("微信授权换取 openid 失败：{}".format(data.get("errmsg") or "unknown error"))
    return data["openid"]


def prepare_wechat_jsapi_payment(order_no, return_url, code, handler):
    if not order_no:
        raise RuntimeError("缺少订单编号。")
    if not code:
        raise RuntimeError("缺少微信授权 code。")
    if not is_wechat_pay_ready():
        raise RuntimeError("微信支付商户参数尚未配置完成。")

    order = read_geo_order(order_no)
    openid = fetch_wechat_oauth_openid(code)
    pay_params = create_wechat_jsapi_params(order, openid, handler)
    order["openid"] = openid
    order["prepayId"] = pay_params.get("prepayId") or ""
    order["updatedAt"] = datetime.now(timezone.utc).astimezone().isoformat()
    write_geo_order(order)
    return order, pay_params, return_url


def create_wechat_jsapi_params(order, openid, handler):
    nonce_str = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    raw_ip = (handler.headers.get("X-Forwarded-For") or handler.client_address[0] or "127.0.0.1").split(",")[0].strip()
    spbill_create_ip = "127.0.0.1" if ":" in raw_ip else (raw_ip or "127.0.0.1")
    params = {
        "appid": WECHAT_PAY_APP_ID,
        "mch_id": WECHAT_PAY_MCH_ID,
        "nonce_str": nonce_str,
        "body": order["planTitle"],
        "out_trade_no": order["orderNo"],
        "total_fee": str(order["amountFen"]),
        "spbill_create_ip": spbill_create_ip,
        "notify_url": WECHAT_PAY_NOTIFY_URL,
        "trade_type": "JSAPI",
        "openid": openid,
    }
    params["sign"] = build_wechat_pay_sign(params)
    payload = build_wechat_pay_xml(params).encode("utf-8")
    req = urllib_request.Request(
        "https://api.mch.weixin.qq.com/pay/unifiedorder",
        data=payload,
        headers={"Content-Type": "text/xml; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8")
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(body or error.reason)

    data = parse_wechat_xml(body)
    if data.get("return_code") != "SUCCESS" or data.get("result_code") != "SUCCESS" or not data.get("prepay_id"):
        details = data.get("err_code_des") or data.get("err_code") or data.get("return_msg") or "微信统一下单失败。"
        raise RuntimeError("微信统一下单失败：{}".format(details))

    pay_nonce_str = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    time_stamp = str(int(time.time()))
    pay_params = {
        "appId": WECHAT_PAY_APP_ID,
        "timeStamp": time_stamp,
        "nonceStr": pay_nonce_str,
        "package": "prepay_id={}".format(data["prepay_id"]),
        "signType": "MD5",
    }
    pay_params["paySign"] = build_wechat_pay_sign(pay_params)
    pay_params["prepayId"] = data["prepay_id"]
    return pay_params


def build_wechat_jsapi_pay_html(order, pay_params, success_url, error_message=""):
    def escape(value):
        return html.escape(value or "", quote=True)

    pay_ready = all(
        [
            pay_params.get("appId"),
            pay_params.get("timeStamp"),
            pay_params.get("nonceStr"),
            pay_params.get("package"),
            pay_params.get("paySign"),
        ]
    )
    button_html = (
        '<button class="btn" onclick="invokePay()">立即完成支付</button>'
        if pay_ready
        else '<button class="btn" type="button" disabled style="opacity:.45;cursor:not-allowed">暂时无法拉起支付</button>'
    )
    helper_text = (
        "如果支付没有自动弹出，可点击上方按钮再次发起。"
        if pay_ready
        else "支付初始化未完成，请根据下方提示检查配置后再试。"
    )

    return """<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>微信支付获取</title>
    <style>
      body{{margin:0;background:#071224;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}}
      .card{{max-width:420px;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:28px;box-shadow:0 24px 80px rgba(2,8,23,.45)}}
      .tag{{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8be9fd}}
      h1{{margin:14px 0 0;font-size:28px}}
      p{{line-height:1.8;color:#d6deeb}}
      .meta{{margin-top:18px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}}
      .btn{{margin-top:20px;width:100%;border:none;border-radius:999px;background:#2dd4bf;color:#04111d;padding:14px 16px;font-size:15px;font-weight:700}}
      .muted{{margin-top:12px;font-size:13px;color:#94a3b8}}
      .error{{margin-top:14px;color:#fecaca}}
    </style>
  </head>
  <body>
    <div class="card">
      <div class="tag">微信支付获取</div>
      <h1>{title}</h1>
      <div class="meta">订单编号：{order_no}<br/>支付金额：{amount}</div>
      <p>即将拉起微信支付。支付完成后，将自动返回方案页面继续查看结果。</p>
      {button_html}
      <div class="muted">{helper_text}</div>
      {error_block}
    </div>
    <script>
      function onPayResult(res){{
        if(res && res.err_msg === 'get_brand_wcpay_request:ok'){{
          window.location.href = {success_url_js};
          return;
        }}
        var old = document.querySelector('.error');
        if (old) old.remove();
        var div = document.createElement('div');
        div.className = 'error';
        div.textContent = '支付未完成：' + ((res && res.err_msg) || 'unknown');
        document.querySelector('.card').appendChild(div);
      }}
      function invokePay(){{
        if(!{pay_ready}){{
          return;
        }}
        if(!window.WeixinJSBridge){{
          document.addEventListener('WeixinJSBridgeReady', invokePay, {{ once: true }});
          return;
        }}
        window.WeixinJSBridge.invoke('getBrandWCPayRequest', {{
          appId: '{app_id}',
          timeStamp: '{time_stamp}',
          nonceStr: '{nonce_str}',
          package: '{package}',
          signType: '{sign_type}',
          paySign: '{pay_sign}'
        }}, onPayResult);
      }}
      invokePay();
    </script>
  </body>
</html>""".format(
        title=escape(order.get("planTitle")),
        order_no=escape(order.get("orderNo")),
        amount=escape(order.get("amountLabel")),
        success_url_js=json.dumps(success_url or "", ensure_ascii=False),
        button_html=button_html,
        helper_text=escape(helper_text),
        pay_ready="true" if pay_ready else "false",
        app_id=escape(pay_params.get("appId")),
        time_stamp=escape(pay_params.get("timeStamp")),
        nonce_str=escape(pay_params.get("nonceStr")),
        package=escape(pay_params.get("package")),
        sign_type=escape(pay_params.get("signType")),
        pay_sign=escape(pay_params.get("paySign")),
        error_block='<div class="error">{}</div>'.format(escape(error_message)) if error_message else "",
    )


def report_domain_from_url(value):
    if not value:
        return ""
    try:
        return urlparse(value).hostname or value
    except Exception:
        return value


def geo_report_title_text(report):
    input_data = report.get("input") or {}
    result = report.get("result") or {}
    company = (input_data.get("company") or "").strip()
    if company:
        return "{}官网 GEO 详细诊断报告".format(company)
    domain = report_domain_from_url(result.get("checkedUrl") or input_data.get("websiteUrl") or "")
    if domain:
        return "{} GEO 详细诊断报告".format(domain)
    return "企业官网 GEO 详细诊断报告"


def geo_plan_title_text(report):
    input_data = report.get("input") or {}
    result = report.get("result") or {}
    company = (input_data.get("company") or "").strip()
    if company:
        return "{}官网 GEO 优化方案".format(company)
    domain = report_domain_from_url(result.get("checkedUrl") or input_data.get("websiteUrl") or "")
    if domain:
        return "{} GEO 优化方案".format(domain)
    return "企业官网 GEO 优化方案"


def build_geo_report_share_html(report, token):
    title = geo_report_title_text(report)
    description = "查看官网在抓取、主题结构、AI 可见性、内容资产与承接转化等维度的详细诊断结果。"
    share_url = "{}/api/lead/submit?share=geo-report&token={}".format(PUBLIC_SITE_URL, quote(token, safe=""))
    report_url = "{}/geo-report/{}/".format(PUBLIC_SITE_URL, token)
    image_url = "{}/geo-score-share-cover.png".format(PUBLIC_SITE_URL)
    title_html = html.escape(title, quote=True)
    description_html = html.escape(description, quote=True)
    share_url_html = html.escape(share_url, quote=True)
    report_url_html = html.escape(report_url, quote=True)
    image_url_html = html.escape(image_url, quote=True)

    return """<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <link rel="canonical" href="{share_url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:url" content="{share_url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{image_url}" />
    <style>
      :root {{ color-scheme: dark; }}
      body {{
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #0f2d57 0%, #071224 42%, #040812 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif;
      }}
      .card {{
        width: min(92vw, 460px);
        padding: 28px 24px;
        border-radius: 24px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        background: rgba(8, 15, 31, 0.86);
        box-shadow: 0 24px 90px rgba(2, 6, 23, 0.48);
      }}
      .label {{
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        color: #bae6fd;
        font-size: 13px;
        letter-spacing: 0.02em;
      }}
      h1 {{ margin: 16px 0 10px; font-size: 28px; line-height: 1.18; }}
      p {{ margin: 0; color: rgba(226, 232, 240, 0.88); line-height: 1.7; font-size: 15px; }}
      a {{
        display: inline-flex;
        margin-top: 22px;
        padding: 12px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }}
    </style>
  </head>
  <body>
    <main class="card">
      <span class="label">企业官网 GEO 详细诊断报告</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <a href="{report_url}">正在打开详细报告</a>
    </main>
    <script>
      window.setTimeout(function () {{
        window.location.replace({report_url_json});
      }}, 120);
    </script>
  </body>
</html>""".format(
        title=title_html,
        description=description_html,
        share_url=share_url_html,
        image_url=image_url_html,
        report_url=report_url_html,
        report_url_json=json.dumps(report_url, ensure_ascii=False),
    )


def build_geo_plan_share_html(report, token):
    title = geo_plan_title_text(report)
    description = "查看官网在首页主题、FAQ 体系、专题页、结构化数据与承接路径等方面的具体优化方案。"
    share_url = "{}/geo-plan-share/{}/".format(PUBLIC_SITE_URL, quote(token, safe=""))
    plan_url = "{}/geo-plan/{}/".format(PUBLIC_SITE_URL, token)
    image_url = "{}/geo-score-share-cover.png".format(PUBLIC_SITE_URL)
    title_html = html.escape(title, quote=True)
    description_html = html.escape(description, quote=True)
    share_url_html = html.escape(share_url, quote=True)
    image_url_html = html.escape(image_url, quote=True)
    plan_url_html = html.escape(plan_url, quote=True)

    return """<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <link rel="canonical" href="{share_url}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:url" content="{share_url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{image_url}" />
    <style>
      :root {{ color-scheme: dark; }}
      body {{
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #0f2d57 0%, #071224 42%, #040812 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif;
      }}
      .card {{
        width: min(92vw, 460px);
        padding: 28px 24px;
        border-radius: 24px;
        border: 1px solid rgba(125, 211, 252, 0.18);
        background: rgba(8, 15, 31, 0.86);
        box-shadow: 0 24px 90px rgba(2, 6, 23, 0.48);
      }}
      .label {{
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.14);
        color: #bae6fd;
        font-size: 13px;
        letter-spacing: 0.02em;
      }}
      h1 {{ margin: 16px 0 10px; font-size: 28px; line-height: 1.18; }}
      p {{ margin: 0; color: rgba(226, 232, 240, 0.88); line-height: 1.7; font-size: 15px; }}
      a {{
        display: inline-flex;
        margin-top: 22px;
        padding: 12px 18px;
        border-radius: 999px;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
        color: white;
        text-decoration: none;
        font-weight: 600;
      }}
    </style>
  </head>
  <body>
    <main class="card">
      <span class="label">企业官网 GEO 优化方案</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <a href="{plan_url}">正在打开优化方案</a>
    </main>
    <script>
      window.setTimeout(function () {{
        window.location.replace({plan_url_json});
      }}, 120);
    </script>
  </body>
</html>""".format(
        title=title_html,
        description=description_html,
        share_url=share_url_html,
        image_url=image_url_html,
        plan_url=plan_url_html,
        plan_url_json=json.dumps(plan_url, ensure_ascii=False),
    )


def check_remote_file(url):
    if not url or not isinstance(url, str):
        return False
    req = urllib_request.Request(url, headers={"User-Agent": "JGMAO GEO Score Bot/1.0"})
    try:
        with urllib_request.urlopen(req, timeout=10) as response:
            status = getattr(response, "status", 200)
            return 200 <= status < 300
    except Exception:
        return False


def analyze_homepage(html, final_url, sampled_pages=None):
    title = extract_tag_content(html, r"<title[^>]*>([\s\S]*?)</title>")
    meta_description = extract_tag_content(html, r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']')
    if not meta_description:
        meta_description = extract_tag_content(html, r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']')
    canonical = extract_tag_content(html, r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']')
    if not canonical:
        canonical = extract_tag_content(html, r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']')
    h1 = extract_tag_content(html, r"<h1[^>]*>([\s\S]*?)</h1>")
    has_og_title = bool(re.search(r'property=["\']og:title["\']', html, re.I))
    has_og_description = bool(re.search(r'property=["\']og:description["\']', html, re.I))
    contact_signal = bool(re.search(r"(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询|电话|邮箱|e-?mail|contact us|get in touch|call us|office)", html, re.I))
    content_text = strip_html(html)
    has_relevant_structured_data = bool(
        re.search(
            r'"@type"\s*:\s*"(Organization|Corporation|LocalBusiness|WebSite|FAQPage|Article|NewsArticle|BlogPosting|BreadcrumbList)"',
            html,
            re.I,
        )
    )
    faq_heading_signal = bool(re.search(r"(FAQPage|常见问题|常见问答|\bfaq\b|frequently asked questions)", html, re.I))
    question_signal_count = count_question_signals(content_text)
    has_faq_signal = bool(re.search(r"FAQPage", html, re.I)) or (faq_heading_signal and question_signal_count >= 2)
    theme_terms = extract_theme_terms(title, h1)
    theme_context = " ".join([title, meta_description, h1, content_text[:1600]]).lower()
    has_theme_focus = bool(
        theme_terms
        and any(len(re.findall(re.escape(term), theme_context)) >= 2 for term in theme_terms)
    )
    sampled_pages = sampled_pages or []
    contact_signal = contact_signal or any(item.get("contact") for item in sampled_pages)
    has_content_assets = bool(re.search(r"(案例|客户案例|新闻|洞察|blog|blogs|insights|专题|白皮书|报告|FAQ|常见问题|portfolio|case stud(?:y|ies)|resources|knowledge|article|articles)", html, re.I)) or any(item.get("contentAsset") for item in sampled_pages)
    has_cta_signal = bool(re.search(r"(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo|book|schedule|quote|contact us|get in touch|enquiry|enquire|start now)", html, re.I)) or any(item.get("cta") for item in sampled_pages)
    has_company_signal = bool(
        re.search(
            r"(有限公司|公司地址|地址[:：]|北京市|商务邮箱|联系电话|电话|邮箱|e-?mail|service@|400-\d{4}-\d{3}|copyright|all rights reserved|about us|关于我们|studio|office|company)",
            html,
            re.I,
        )
    )
    has_trust_signal = bool(
        re.search(
            r"(高新技术企业|新华社|备案|ICP备|icp备|公网安备|许可证|license|certification|iso|认证|资质|奖项|award|awards|PICC|奥迪|沃尔沃|壳牌|美孚|中国平安|人民日报|客户案例|设计案例|合作客户|服务客户|合作伙伴|媒体报道|trusted by|featured in)",
            html,
            re.I,
        )
    )
    has_faq_signal = has_faq_signal or any(item.get("faq") for item in sampled_pages)
    has_topic_depth = len(content_text) >= 1200 or sum(min(len((item.get("text") or "").strip()), 2000) for item in sampled_pages) >= 1200

    return {
        "metrics": [
            {"ok": final_url.startswith("https://"), "weight": 8, "positive": "已启用 HTTPS，基础可信度较好。", "negative": "建议优先确保官网全站使用 HTTPS。", "key": "https", "label": "HTTPS", "dimension": "crawl"},
            {"ok": 8 <= len(title) <= 65, "weight": 6, "positive": "页面标题长度较合适。", "negative": "页面标题过短或过长，建议优化标题表达。", "key": "title", "label": "Title 标题长度", "dimension": "theme"},
            {"ok": 30 <= len(meta_description) <= 180, "weight": 6, "positive": "已配置较完整的 meta description。", "negative": "缺少清晰的 meta description。", "key": "description", "label": "Meta Description", "dimension": "theme"},
            {"ok": bool(h1), "weight": 6, "positive": "首页已有明确 H1 主题。", "negative": "首页缺少明确 H1，主题表达不够集中。", "key": "h1", "label": "首页 H1", "dimension": "theme"},
            {"ok": has_theme_focus, "weight": 6, "positive": "首页主题关键词较集中，页面语义比较明确。", "negative": "首页主题关键词分散，建议收紧主题表达与页面语义。", "key": "theme-focus", "label": "主题聚焦度", "dimension": "theme"},
            {"ok": bool(canonical), "weight": 7, "positive": "已配置 canonical 规范地址。", "negative": "建议补 canonical，减少重复地址干扰。", "key": "canonical", "label": "Canonical", "dimension": "crawl"},
            {"ok": has_og_title and has_og_description, "weight": 5, "positive": "社交分享标题与描述较完整。", "negative": "建议补全 og:title / og:description。", "key": "og", "label": "OG 分享信息", "dimension": "ai"},
            {"ok": has_relevant_structured_data, "weight": 7, "positive": "页面已带与官网语义相关的结构化数据。", "negative": "建议补充 Organization / FAQ / Article 等相关结构化数据。", "key": "schema", "label": "相关结构化数据", "dimension": "ai"},
            {"ok": has_faq_signal, "weight": 6, "positive": "页面已有较清晰的 FAQ / 问答信号。", "negative": "建议补更清晰的 FAQ / 问答结构，增强 AI 抽取与引用能力。", "key": "faq", "label": "FAQ / 问答信号", "dimension": "ai"},
            {"ok": has_topic_depth, "weight": 6, "positive": "内容长度与主题覆盖基础尚可。", "negative": "内容深度偏弱，建议补主题页与可复用内容资产。", "key": "content-depth", "label": "内容深度", "dimension": "content"},
            {"ok": has_content_assets, "weight": 7, "positive": "已具备 FAQ、案例或洞察等内容资产信号。", "negative": "建议补案例、FAQ、洞察或专题页，形成更完整的内容资产体系。", "key": "content-assets", "label": "内容资产信号", "dimension": "content"},
            {"ok": contact_signal, "weight": 6, "positive": "联系方式与咨询入口较清晰。", "negative": "建议补电话、邮箱或联系入口，增强转化承接。", "key": "contact", "label": "联系方式", "dimension": "convert"},
            {"ok": has_cta_signal, "weight": 5, "positive": "页面已有较明确的行动引导与转化入口。", "negative": "建议补强 CTA、表单或咨询动作，让高意向用户更容易继续沟通。", "key": "cta", "label": "CTA / 转化动作", "dimension": "convert"},
            {"ok": has_company_signal, "weight": 4, "positive": "公司信息较完整，基础可信度较好。", "negative": "建议补公司信息、地址、电话、邮箱等基础信任信息。", "key": "company", "label": "公司信息完整度", "dimension": "trust"},
            {"ok": has_trust_signal, "weight": 3, "positive": "页面已有备案、资质或客户背书等信任信号。", "negative": "建议补资质、备案、客户背书或媒体报道，增强品牌可信度。", "key": "trust", "label": "资质 / 背书信号", "dimension": "trust"},
        ]
    }


def get_score_level(score):
    if score >= 85:
        return "基础不错，适合进一步做深 GEO 与内容增长。"
    if score >= 65:
        return "已有一定基础，但结构、FAQ 或承接能力还有明显优化空间。"
    return "当前 GEO 基础偏弱，建议尽快补齐抓取、结构与承接能力。"


def summarize_geo_result(result):
    dimensions = sorted(
        result.get("dimensions") or [],
        key=lambda item: item.get("score", 0),
        reverse=True,
    )
    if not dimensions:
        return []

    overview = " / ".join(
        "{} {}分".format(item.get("title") or "未命名维度", item.get("score", 0))
        for item in dimensions
    )
    strongest = dimensions[0]
    weakest = dimensions[-1]

    return [
        "六维概览：{}".format(overview),
        "当前强项：{}（{}）".format(strongest.get("title") or "未命名维度", strongest.get("score", 0)),
        "当前短板：{}（{}）".format(weakest.get("title") or "未命名维度", weakest.get("score", 0)),
    ]


def format_entry_page(page):
    value = (page or "").strip()
    if not value:
        return PUBLIC_SITE_URL
    if value.startswith("http://") or value.startswith("https://"):
        return value
    if not value.startswith("/"):
        value = "/" + value
    return "{}{}".format(PUBLIC_SITE_URL, value)


def parse_datetime_value(value):
    text = (value or "").strip()
    if not text:
        raise ValueError("missing datetime")

    normalized = text
    if normalized.endswith("Z"):
        return datetime.strptime(normalized, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

    if re.search(r"[+-]\d{2}:\d{2}$", normalized):
        normalized = normalized[:-3] + normalized[-2:]

    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S%z"):
        try:
            return datetime.strptime(normalized, fmt)
        except Exception:
            continue

    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(normalized, fmt).replace(tzinfo=timezone.utc)
        except Exception:
            continue

    raise ValueError("invalid datetime")


def format_beijing_time(value):
    text = (value or "").strip()
    if not text:
        return ""
    try:
        parsed = parse_datetime_value(text)
        beijing = parsed.astimezone(timezone(timedelta(hours=8)))
        return "{}（北京时间）".format(beijing.strftime("%Y-%m-%d %H:%M:%S"))
    except Exception:
        return text


def score_website(website_url):
    normalized_url = normalize_website_url(website_url)
    try:
        final_url, html = fetch_html(normalized_url, timeout=15)
    except HTTPError as error:
        raise RuntimeError("官网暂时无法访问（{}），请确认网址是否可正常打开。".format(error.code))
    except Exception as error:
        raise RuntimeError(str(error) or "官网暂时无法访问，请稍后重试。")

    if not final_url:
        raise RuntimeError("官网地址解析失败，请稍后重试。")

    parsed = urlparse(final_url)
    base_url = "{}://{}".format(parsed.scheme, parsed.netloc)
    robots_ok = check_remote_file(urljoin(base_url, "/robots.txt"))
    sitemap_ok = check_remote_file(urljoin(base_url, "/sitemap.xml"))
    sampled_pages = collect_site_samples(html, final_url)
    analysis = analyze_homepage(html, final_url, sampled_pages=sampled_pages)
    metrics = list(analysis["metrics"])
    metrics.append(
        {"ok": robots_ok, "weight": 8, "positive": "站点已提供 robots.txt。", "negative": "建议补 robots.txt，明确抓取边界。", "key": "robots", "label": "robots.txt", "dimension": "crawl"}
    )
    metrics.append(
        {"ok": sitemap_ok, "weight": 8, "positive": "站点已提供 sitemap.xml。", "negative": "建议补 sitemap.xml，帮助搜索与 AI 系统理解站点结构。", "key": "sitemap", "label": "sitemap.xml", "dimension": "crawl"}
    )
    return build_detailed_score(metrics, final_url)


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


def fetch_url_json(url, timeout=10):
    if not url or not isinstance(url, str):
        raise RuntimeError("请求地址无效。")
    req = urllib_request.Request(url, headers={"User-Agent": "JGMAO/1.0"})
    try:
        with urllib_request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8")
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(body or error.reason)

    try:
        return json.loads(body)
    except Exception as error:
        raise RuntimeError("微信接口返回无法解析。") from error


def get_wechat_access_token():
    now = int(time.time())
    if WECHAT_ACCESS_TOKEN_CACHE["value"] and WECHAT_ACCESS_TOKEN_CACHE["expires_at"] > now + 60:
        return WECHAT_ACCESS_TOKEN_CACHE["value"]

    if not WECHAT_APP_ID or not WECHAT_APP_SECRET:
        raise RuntimeError("尚未配置微信公众号 appId / appSecret。")

    data = fetch_url_json(
        "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={}&secret={}".format(
            quote(WECHAT_APP_ID, safe=""),
            quote(WECHAT_APP_SECRET, safe=""),
        )
    )

    if not data.get("access_token"):
        raise RuntimeError("微信公众号 access_token 获取失败：{}".format(data.get("errmsg") or "unknown error"))

    expires_in = int(data.get("expires_in") or 7200)
    WECHAT_ACCESS_TOKEN_CACHE["value"] = data["access_token"]
    WECHAT_ACCESS_TOKEN_CACHE["expires_at"] = now + max(0, expires_in - 120)
    return WECHAT_ACCESS_TOKEN_CACHE["value"]


def get_wechat_jsapi_ticket():
    now = int(time.time())
    if WECHAT_JSAPI_TICKET_CACHE["value"] and WECHAT_JSAPI_TICKET_CACHE["expires_at"] > now + 60:
        return WECHAT_JSAPI_TICKET_CACHE["value"]

    access_token = get_wechat_access_token()
    data = fetch_url_json(
        "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={}&type=jsapi".format(
            quote(access_token, safe="")
        )
    )

    if data.get("errcode") != 0 or not data.get("ticket"):
        raise RuntimeError("微信公众号 jsapi_ticket 获取失败：{}".format(data.get("errmsg") or "unknown error"))

    expires_in = int(data.get("expires_in") or 7200)
    WECHAT_JSAPI_TICKET_CACHE["value"] = data["ticket"]
    WECHAT_JSAPI_TICKET_CACHE["expires_at"] = now + max(0, expires_in - 120)
    return WECHAT_JSAPI_TICKET_CACHE["value"]


def build_wechat_share_config(url):
    if not url:
        raise RuntimeError("缺少当前页面 URL。")

    jsapi_ticket = get_wechat_jsapi_ticket()
    timestamp = str(int(time.time()))
    nonce_str = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(16))
    signature_base = "jsapi_ticket={}&noncestr={}&timestamp={}&url={}".format(
        jsapi_ticket,
        nonce_str,
        timestamp,
        url,
    )
    signature = hashlib.sha1(signature_base.encode("utf-8")).hexdigest()

    return {
        "appId": WECHAT_APP_ID,
        "timestamp": int(timestamp),
        "nonceStr": nonce_str,
        "signature": signature,
    }


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


class Handler(BaseHTTPRequestHandler):
    server_version = "JGMAOPublicChat/1.0"

    def log_message(self, format, *args):
        print("[gateway] {} - {}".format(self.address_string(), format % args))

    def do_OPTIONS(self):
        path_only = (self.path or "").split("?", 1)[0]
        if path_only not in ["/chat", "/lead", "/geo-score", "/wechat/share-config", "/geo-report", "/wechat/pay/start", "/wechat/pay/callback", "/pay/wechat/callback", "/pay/wechat/callback/", "/auth/callback", "/api/wechat/pay/notify", "/wechat/pay/notify", "/pay/notify", "/wecom/contact/callback"]:
            self.send_error(404, "Not found")
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        if path_only == "/geo-report":
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path_only = (self.path or "").split("?", 1)[0]
        if path_only == "/lead":
            params = parse_qs(urlparse(self.path).query or "")
            payment_mode = (params.get("payment") or [""])[0].strip().lower()
            if payment_mode == "start":
                self._handle_wechat_pay_start()
                return
            if payment_mode == "prepare":
                self._handle_wechat_pay_prepare()
                return
            if payment_mode == "callback":
                self._handle_wechat_pay_callback()
                return
            self._handle_lead_share_page()
            return
        if path_only == "/geo-report":
            self._handle_geo_report_fetch()
            return
        if path_only == "/wechat/pay/start":
            self._handle_wechat_pay_start()
            return
        if path_only == "/wechat/pay/prepare":
            self._handle_wechat_pay_prepare()
            return
        if path_only in ["/wechat/pay/callback", "/pay/wechat/callback", "/pay/wechat/callback/"]:
            self._handle_wechat_pay_callback()
            return
        if path_only == "/auth/callback":
            self._handle_wechat_pay_callback()
            return
        if path_only == "/wecom/contact/callback":
            self._handle_wecom_contact_callback()
            return
        if path_only.startswith("/geo-plan-share/"):
            self._handle_geo_plan_share_page()
            return
        self._write_json(404, {"ok": False, "error": "Not found"})

    def do_POST(self):
        path_only = (self.path or "").split("?", 1)[0]
        if path_only in ["/api/wechat/pay/notify", "/wechat/pay/notify", "/pay/notify"]:
            self._handle_wechat_pay_notify()
            return
        if path_only == "/geo-score":
            self._handle_geo_score_submit()
            return

        if path_only == "/wechat/share-config":
            self._handle_wechat_share_config()
            return

        if path_only == "/lead":
            self._handle_lead_submit()
            return
        if path_only == "/wecom/contact/callback":
            self._handle_wecom_contact_callback()
            return

        if path_only != "/chat":
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

    def _handle_lead_submit(self):
        if not is_authorized(self):
            self._write_json(401, {"ok": False, "error": "Unauthorized"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))

            lead_type = (payload.get("type") or "").strip()
            name = (payload.get("name") or "").strip()
            company = (payload.get("company") or "").strip()
            contact = (payload.get("contact") or "").strip()
            demand = (payload.get("demand") or "").strip()
            source = (payload.get("source") or "website").strip()
            page = (payload.get("page") or "").strip()
            website_url = (payload.get("websiteUrl") or "").strip()
            invite_token = (payload.get("inviteToken") or "").strip()

            if lead_type == "geo-score-stats":
                count = count_geo_score_entries()
                display_count = str(count) if count > 100 else "100+"
                self._write_json(200, {"ok": True, "count": count, "displayCount": display_count}, cache_control=True)
                return

            if lead_type == "geo-score":
                if not website_url or not contact:
                    self._write_json(400, {"ok": False, "error": "请至少填写官网网址和联系方式。"})
                    return

                result = score_website(website_url)
                entry = {
                    "type": lead_type,
                    "name": name,
                    "company": company,
                    "contact": contact,
                    "websiteUrl": website_url,
                    "inviteToken": invite_token,
                    "source": source,
                    "page": page or "/geo-score/",
                    "result": result,
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                }
                report = save_geo_report(entry)
                invite_result = apply_geo_report_invite(invite_token, report, entry["createdAt"])
                self._append_lead_log(entry)
                self._push_lead_to_feishu(
                    {
                        **entry,
                        "reportUrl": report["reportUrl"],
                        "reportStatus": report.get("reportStatus"),
                        "demand": "官网 GEO 基础评分：{}/100；优先改进：{}".format(
                            result["score"], "；".join(result["priorities"])
                        ),
                    }
                )
                self._write_json(
                    200,
                    {
                        "ok": True,
                        "result": result,
                        "reportToken": report.get("token"),
                        "reportUrl": report["reportUrl"],
                        "reportStatus": report.get("reportStatus"),
                        "unchangedWithin24h": bool(report.get("unchangedWithin24h")),
                        "wecomClaim": report.get("wecomClaim") or {},
                        "invite": report.get("invite") or {},
                        "inviteResult": invite_result or {},
                    },
                    cache_control=True,
                )
                return

            if lead_type == "geo-report-fetch":
                token = (payload.get("token") or "").strip()
                if not token:
                    self._write_json(400, {"ok": False, "error": "缺少报告 token。"})
                    return
                try:
                    report = read_geo_report(token)
                    report = verify_geo_report_wecom_relationship(report)
                except FileNotFoundError:
                    self._write_json(404, {"ok": False, "error": "报告不存在或已过期。"}, cache_control=True)
                    return
                access_state = build_geo_report_access_state(report)
                if not access_state["locked"]:
                    report = attach_geo_report_plan_access(report)
                self._write_json(
                    200,
                    {
                        "ok": True,
                        "report": build_geo_report_locked_payload(report) if access_state["locked"] else report,
                        "accessLocked": access_state["locked"],
                        "accessMessage": access_state["message"],
                    },
                    cache_control=True,
                )
                return

            if lead_type == "geo-report-wecom-deliver":
                claim_token = (payload.get("claimToken") or "").strip()
                if not claim_token:
                    self._write_json(400, {"ok": False, "error": "缺少企微领取 token。"})
                    return
                try:
                    report = deliver_geo_report_wecom_claim(claim_token)
                except FileNotFoundError:
                    self._write_json(404, {"ok": False, "error": "未找到对应的报告领取记录。"}, cache_control=True)
                    return
                self._write_json(
                    200,
                    {
                        "ok": True,
                        "reportToken": report.get("token") or "",
                        "reportUrl": report.get("reportUrl") or "",
                        "wecomClaim": report.get("wecomClaim") or {},
                    },
                    cache_control=True,
                )
                return

            if lead_type == "geo-plan-order-create":
                plan_key = (payload.get("planKey") or "solution").strip()
                report_token = (payload.get("reportToken") or "").strip()
                source = (payload.get("source") or "geo-upgrade").strip()
                page = (payload.get("page") or "/geo-upgrade/").strip()
                order = create_geo_plan_order(plan_key, report_token=report_token, source=source, page=page)
                self._write_json(200, {"ok": True, "order": order}, cache_control=True)
                return

            if not contact or not demand:
                self._write_json(400, {"ok": False, "error": "请至少填写联系方式和需求简述。"})
                return

            entry = {
                "name": name,
                "company": company,
                "contact": contact,
                "demand": demand,
                "source": source,
                "page": page,
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            }

            self._append_lead_log(entry)
            self._push_lead_to_feishu(entry)
            self._write_json(200, {"ok": True}, cache_control=True)
        except Exception as error:
            self._write_json(500, {"ok": False, "error": str(error) or "提交失败，请稍后再试。"})

    def _handle_wechat_share_config(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))
            page_url = (payload.get("url") or "").strip()

            config = build_wechat_share_config(page_url)
            self._write_json(200, {"ok": True, "config": config}, cache_control=True)
        except Exception as error:
            self._write_json(500, {"ok": False, "error": str(error) or "微信分享配置失败。"})

    def _handle_wechat_pay_start(self):
        params = parse_qs(urlparse(self.path).query or "")
        order_no = (params.get("orderNo") or [""])[0].strip()
        return_url = sanitize_pay_return_url(
            (params.get("returnUrl") or [""])[0].strip(),
            "{}/geo-upgrade/?paid=1".format(request_origin(self)),
            self,
        )
        code = (params.get("code") or [""])[0].strip()

        if not order_no:
            self.send_response(400)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("缺少订单编号。".encode("utf-8"))
            return

        try:
            order = read_geo_order(order_no)
        except Exception:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write("订单不存在。".encode("utf-8"))
            return

        if not is_wechat_pay_ready():
            html_body = build_wechat_jsapi_pay_html(
                order,
                {"appId": "", "timeStamp": "", "nonceStr": "", "package": "", "signType": "MD5", "paySign": ""},
                return_url,
                "微信支付商户参数尚未配置完成。",
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(html_body.encode("utf-8"))
            return

        if not is_wechat_browser(self.headers.get("User-Agent") or ""):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                """<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#071224;color:#fff;padding:24px"><h2>请在微信内打开继续支付</h2><p style="line-height:1.8;color:#d6deeb">当前这条支付链路使用微信内 JSAPI 支付，请在微信内重新打开此页面后继续。</p></body></html>""".encode("utf-8")
            )
            return

        if not code:
            oauth_base_url = WECHAT_PAY_OAUTH_BASE_URL or request_origin(self)
            callback_path = WECHAT_PAY_OAUTH_CALLBACK_PATH if WECHAT_PAY_OAUTH_CALLBACK_PATH.startswith("/") else "/{}".format(WECHAT_PAY_OAUTH_CALLBACK_PATH)
            separator = "&" if "?" in callback_path else "?"
            callback_url = "{}{}{}orderNo={}&returnUrl={}".format(
                oauth_base_url,
                callback_path,
                separator,
                quote(order_no, safe=""),
                quote(return_url, safe=""),
            )
            oauth_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid={}&redirect_uri={}&response_type=code&scope=snsapi_base&state={}#wechat_redirect".format(
                quote(WECHAT_PAY_APP_ID, safe=""),
                quote(callback_url, safe=""),
                quote(order_no, safe=""),
            )
            self.send_response(302)
            self.send_header("Location", oauth_url)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return

        try:
            openid = ""
            openid = fetch_wechat_oauth_openid(code)
            pay_params = create_wechat_jsapi_params(order, openid, self)
            order["openid"] = openid
            order["prepayId"] = pay_params.get("prepayId") or ""
            order["updatedAt"] = datetime.now(timezone.utc).astimezone().isoformat()
            write_geo_order(order)
            html_body = build_wechat_jsapi_pay_html(order, pay_params, return_url)
        except Exception as error:
            mark_geo_order_payment_error(order, error, openid if "openid" in locals() else "")
            html_body = build_wechat_jsapi_pay_html(
                order,
                {"appId": "", "timeStamp": "", "nonceStr": "", "package": "", "signType": "MD5", "paySign": ""},
                return_url,
                str(error) or "支付初始化失败。",
            )

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(html_body.encode("utf-8"))

    def _handle_wechat_pay_prepare(self):
        params = parse_qs(urlparse(self.path).query or "")
        order_no = (params.get("orderNo") or [""])[0].strip()
        return_url = sanitize_pay_return_url(
            (params.get("returnUrl") or [""])[0].strip(),
            "{}/geo-upgrade/?paid=1".format(request_origin(self)),
            self,
        )
        code = (params.get("code") or [""])[0].strip()

        try:
            order, pay_params, next_url = prepare_wechat_jsapi_payment(order_no, return_url, code, self)
            self._write_json(
                200,
                {
                    "ok": True,
                    "order": order,
                    "payParams": pay_params,
                    "returnUrl": next_url,
                },
                cache_control=True,
            )
        except FileNotFoundError:
            self._write_json(404, {"ok": False, "error": "订单不存在。"}, cache_control=True)
        except Exception as error:
            self._write_json(400, {"ok": False, "error": str(error) or "支付初始化失败。"}, cache_control=True)

    def _handle_wechat_pay_callback(self):
        self._handle_wechat_pay_start()

    def _handle_wechat_pay_notify(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b""
            xml_text = raw_body.decode("utf-8", errors="ignore")
            payload = parse_wechat_xml(xml_text) if xml_text else {}

            received_sign = payload.get("sign", "")
            verify_payload = {key: value for key, value in payload.items() if key != "sign"}
            expected_sign = build_wechat_pay_sign(verify_payload) if received_sign else ""
            if not payload or not received_sign or expected_sign != received_sign:
                raise RuntimeError("微信支付通知验签失败。")
            if payload.get("return_code") != "SUCCESS" or payload.get("result_code") != "SUCCESS":
                raise RuntimeError(payload.get("return_msg") or payload.get("err_code_des") or "微信支付未成功。")

            order_no = (payload.get("out_trade_no") or "").strip()
            if not order_no:
                raise RuntimeError("微信支付通知缺少订单号。")

            order = read_geo_order(order_no)
            already_notified = bool(order.get("feishuPaymentNotifiedAt"))
            order["status"] = "paid"
            order["paymentStatus"] = "paid"
            order["paymentMessage"] = "微信支付已完成。"
            order["transactionId"] = payload.get("transaction_id") or ""
            order["paidAt"] = datetime.now(timezone.utc).astimezone().isoformat()
            order["updatedAt"] = order["paidAt"]
            order["notifyPayload"] = payload
            write_geo_order(order)

            if not already_notified:
                try:
                    self._push_wechat_pay_success_to_feishu(order)
                    order["feishuPaymentNotifiedAt"] = datetime.now(timezone.utc).astimezone().isoformat()
                    order["updatedAt"] = order["feishuPaymentNotifiedAt"]
                    order.pop("feishuPaymentNotifyError", None)
                    write_geo_order(order)
                except Exception as feishu_error:
                    order["feishuPaymentNotifyError"] = str(feishu_error)
                    order["updatedAt"] = datetime.now(timezone.utc).astimezone().isoformat()
                    write_geo_order(order)
                    print("[wechat-pay] order={} feishu_notify_error={}".format(order_no, feishu_error), flush=True)

            response_xml = build_wechat_pay_xml(
                {"return_code": "SUCCESS", "return_msg": "OK"}
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/xml; charset=utf-8")
            self.end_headers()
            self.wfile.write(response_xml.encode("utf-8"))
        except Exception as error:
            response_xml = build_wechat_pay_xml(
                {"return_code": "FAIL", "return_msg": str(error) or "FAIL"}
            )
            self.send_response(200)
            self.send_header("Content-Type", "text/xml; charset=utf-8")
            self.end_headers()
            self.wfile.write(response_xml.encode("utf-8"))

    def _handle_geo_score_submit(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(raw_body.decode("utf-8"))
            website_url = (payload.get("websiteUrl") or "").strip()
            contact = (payload.get("contact") or "").strip()
            company = (payload.get("company") or "").strip()
            name = (payload.get("name") or "").strip()
            source = (payload.get("source") or "geo-score").strip()
            page = (payload.get("page") or "/geo-score/").strip()

            if not website_url or not contact:
                self._write_json(400, {"ok": False, "error": "请至少填写官网网址和联系方式。"})
                return

            result = score_website(website_url)
            entry = {
                "type": "geo-score",
                "websiteUrl": website_url,
                "name": name,
                "company": company,
                "contact": contact,
                "source": source,
                "page": page,
                "result": result,
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            report = save_geo_report(entry)
            self._append_lead_log(entry)
            self._push_lead_to_feishu(
                {
                    **entry,
                    "reportUrl": report["reportUrl"],
                    "reportStatus": report.get("reportStatus"),
                    "demand": "官网 GEO 基础评分：{}/100；优先改进：{}".format(
                        result["score"], "；".join(result["priorities"])
                    ),
                }
            )
            self._write_json(
                200,
                {
                    "ok": True,
                    "result": result,
                    "reportUrl": report["reportUrl"],
                    "reportStatus": report.get("reportStatus"),
                    "unchangedWithin24h": bool(report.get("unchangedWithin24h")),
                },
                cache_control=True,
            )
        except Exception as error:
            self._write_json(500, {"ok": False, "error": str(error) or "提交失败，请稍后再试。"})

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

    def _append_lead_log(self, entry):
        log_path = Path(LEAD_LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def _push_lead_to_feishu(self, entry):
        lines = [
            (
                "收到一条新的官网 GEO 评分线索"
                if entry.get("type") == "geo-score" and entry.get("reportStatus") == "new"
                else (
                    "同一官网评分结果无变化，当前报告仍为最新"
                    if entry.get("type") == "geo-score" and entry.get("reportStatus") == "unchanged"
                    else "同一官网已更新 GEO 评分报告"
                )
            )
            if entry.get("type") == "geo-score"
            else "收到一条新的 H5 留资线索",
            "姓名 / 称呼：{}".format(entry.get("name") or "未填写"),
            "公司 / 品牌：{}".format(entry.get("company") or "未填写"),
            *(
                ["官网网址：{}".format(entry.get("websiteUrl"))]
                if entry.get("websiteUrl")
                else []
            ),
            "联系方式：{}".format(entry.get("contact") or "未填写"),
            "需求简述：{}".format(entry.get("demand") or "未填写"),
            *(
                [
                    "基础评分：{}/100".format((entry.get("result") or {}).get("score")),
                    "评分结论：{}".format((entry.get("result") or {}).get("level")),
                ]
                if entry.get("result")
                else []
            ),
            *(
                summarize_geo_result(entry.get("result") or {})
                if entry.get("type") == "geo-score" and entry.get("result")
                else []
            ),
            *(
                ["详细报告：{}".format(entry.get("reportUrl"))]
                if entry.get("reportUrl")
                else []
            ),
            "来源页面：{}".format(format_entry_page(entry.get("page") or "")),
            "提交时间：{}".format(format_beijing_time(entry.get("createdAt") or "")),
        ]
        message_text = "\n".join(lines)

        if FEISHU_WEBHOOK_URL:
            payload = json.dumps(
                {
                    "msg_type": "text",
                    "content": {
                        "text": message_text,
                    },
                },
                ensure_ascii=False,
            ).encode("utf-8")

            req = urllib_request.Request(
                FEISHU_WEBHOOK_URL,
                data=payload,
                headers={"Content-Type": "application/json; charset=utf-8"},
                method="POST",
            )

            with urllib_request.urlopen(req, timeout=10) as response:
                status = getattr(response, "status", 200)
                if status < 200 or status >= 300:
                    raise RuntimeError("飞书推送失败（{}）".format(status))
            return

        if FEISHU_APP_ID and FEISHU_APP_SECRET:
            tenant_access_token = self._fetch_feishu_tenant_access_token()
            self._send_feishu_app_message(tenant_access_token, message_text)
            return

        raise RuntimeError("尚未配置飞书 webhook 或飞书应用凭证。")

    def _push_wechat_pay_success_to_feishu(self, order):
        plan_url = build_geo_plan_url_for_order(order)
        lines = [
            "微信支付已完成，优化方案可查看",
            "订单编号：{}".format(order.get("orderNo") or "未记录"),
            "购买内容：{}".format(order.get("planTitle") or "官网 GEO 优化方案"),
            "支付金额：{}".format(order.get("amountLabel") or "未记录"),
            "公司 / 品牌：{}".format(order.get("company") or "未填写"),
            *(
                ["官网网址：{}".format(order.get("websiteUrl"))]
                if order.get("websiteUrl")
                else []
            ),
            "联系方式：{}".format(order.get("contact") or "未填写"),
            *(
                ["微信交易号：{}".format(order.get("transactionId"))]
                if order.get("transactionId")
                else []
            ),
            "优化方案：{}".format(plan_url),
            "支付时间：{}".format(format_beijing_time(order.get("paidAt") or order.get("updatedAt") or "")),
        ]
        message_text = "\n".join(lines)

        if FEISHU_WEBHOOK_URL:
            payload = json.dumps(
                {
                    "msg_type": "text",
                    "content": {
                        "text": message_text,
                    },
                },
                ensure_ascii=False,
            ).encode("utf-8")

            req = urllib_request.Request(
                FEISHU_WEBHOOK_URL,
                data=payload,
                headers={"Content-Type": "application/json; charset=utf-8"},
                method="POST",
            )

            with urllib_request.urlopen(req, timeout=10) as response:
                status = getattr(response, "status", 200)
                if status < 200 or status >= 300:
                    raise RuntimeError("飞书推送失败（{}）".format(status))
            return

        if FEISHU_APP_ID and FEISHU_APP_SECRET:
            tenant_access_token = self._fetch_feishu_tenant_access_token()
            self._send_feishu_app_message(tenant_access_token, message_text)
            return

        raise RuntimeError("尚未配置飞书 webhook 或飞书应用凭证。")

    def _fetch_feishu_tenant_access_token(self):
        payload = json.dumps(
            {
                "app_id": FEISHU_APP_ID,
                "app_secret": FEISHU_APP_SECRET,
            },
            ensure_ascii=False,
        ).encode("utf-8")

        req = urllib_request.Request(
            "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
            data=payload,
            headers={"Content-Type": "application/json; charset=utf-8"},
            method="POST",
        )

        try:
            with urllib_request.urlopen(req, timeout=10) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            body = error.read().decode("utf-8", errors="ignore")
            raise RuntimeError("飞书 tenant_access_token 获取失败：{}".format(body or error.reason))

        try:
            data = json.loads(body)
        except Exception as error:
            raise RuntimeError("飞书 tenant_access_token 返回无法解析。") from error

        if data.get("code") != 0 or not data.get("tenant_access_token"):
            raise RuntimeError("飞书 tenant_access_token 获取失败：{}".format(data.get("msg") or "unknown error"))

        return data["tenant_access_token"]

    def _send_feishu_app_message(self, tenant_access_token, message_text):
        if FEISHU_TARGET_CHAT_ID:
            receive_id_type = "chat_id"
            receive_id = FEISHU_TARGET_CHAT_ID
        elif FEISHU_TARGET_USER_OPEN_ID:
            receive_id_type = "open_id"
            receive_id = FEISHU_TARGET_USER_OPEN_ID
        else:
            raise RuntimeError("尚未配置飞书接收目标（chat_id 或 user open_id）。")

        payload = json.dumps(
            {
                "receive_id": receive_id,
                "msg_type": "text",
                "content": json.dumps({"text": message_text}, ensure_ascii=False),
            },
            ensure_ascii=False,
        ).encode("utf-8")

        req = urllib_request.Request(
            "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={}".format(receive_id_type),
            data=payload,
            headers={
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer {}".format(tenant_access_token),
            },
            method="POST",
        )

        try:
            with urllib_request.urlopen(req, timeout=10) as response:
                body = response.read().decode("utf-8")
        except HTTPError as error:
            body = error.read().decode("utf-8", errors="ignore")
            raise RuntimeError("飞书消息发送失败：{}".format(body or error.reason))

        try:
            data = json.loads(body)
        except Exception as error:
            raise RuntimeError("飞书消息发送返回无法解析。") from error

        if data.get("code") != 0:
            raise RuntimeError("飞书消息发送失败：{}".format(data.get("msg") or "unknown error"))

    def _handle_geo_report_fetch(self):
        parsed = urlparse(self.path or "")
        if parsed.path != "/geo-report":
            self._write_json(404, {"ok": False, "error": "Not found"})
            return

        token = (parse_qs(parsed.query).get("token") or [""])[0].strip()
        share_mode = (parse_qs(parsed.query).get("share") or [""])[0].strip() == "1"
        if not token:
            if share_mode:
                self.send_error(400, "缺少报告 token。")
            else:
                self._write_json(400, {"ok": False, "error": "缺少报告 token。"}, cache_control=True)
            return

        try:
            report = read_geo_report(token)
            if share_mode:
                html = build_geo_report_share_html(report, token)
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
                self.end_headers()
                self.wfile.write(html.encode("utf-8"))
            else:
                self._write_json(200, {"ok": True, "report": report}, cache_control=True)
        except FileNotFoundError:
            if share_mode:
                self.send_error(404, "报告不存在或已过期。")
            else:
                self._write_json(404, {"ok": False, "error": "报告不存在或已过期。"}, cache_control=True)
        except Exception as error:
            if share_mode:
                self.send_error(500, str(error) or "报告分享页生成失败。")
            else:
                self._write_json(500, {"ok": False, "error": str(error) or "报告读取失败。"}, cache_control=True)

    def _handle_lead_share_page(self):
        parsed = urlparse(self.path or "")
        share_type = (parse_qs(parsed.query).get("share") or [""])[0].strip()
        token = (parse_qs(parsed.query).get("token") or [""])[0].strip()

        if share_type not in ["geo-report", "geo-plan"]:
            self._write_json(404, {"ok": False, "error": "Not found"})
            return

        if not token:
            self.send_error(400, "缺少报告 token。")
            return

        try:
            report = read_geo_report(token)
            html = build_geo_report_share_html(report, token) if share_type == "geo-report" else build_geo_plan_share_html(report, token)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
        except FileNotFoundError:
            self.send_error(404, "报告不存在或已过期。")
        except Exception:
            self.send_error(500, "报告分享页生成失败。")

    def _handle_geo_plan_share_page(self):
        parsed = urlparse(self.path or "")
        path_only = parsed.path or ""
        if not path_only.startswith("/geo-plan-share/"):
            self._write_json(404, {"ok": False, "error": "Not found"})
            return

        token = path_only[len("/geo-plan-share/") :].strip("/")
        if not token:
            self.send_error(400, "缺少报告 token。")
            return

        try:
            report = read_geo_report(token)
            html = build_geo_plan_share_html(report, token)
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
        except FileNotFoundError:
            self.send_error(404, "报告不存在或已过期。")
        except Exception:
            self.send_error(500, "报告分享页生成失败。")

    def _handle_wecom_contact_callback(self):
        status = build_wecom_callback_status()
        if self.command == "GET":
            parsed = urlparse(self.path or "")
            query = parse_qs(parsed.query)
            echostr = (query.get("echostr") or [""])[0]
            msg_signature = (query.get("msg_signature") or [""])[0]
            timestamp = (query.get("timestamp") or [""])[0]
            nonce = (query.get("nonce") or [""])[0]
            if status["callbackCryptoReady"] and echostr:
                try:
                    if not verify_wecom_signature(msg_signature, timestamp, nonce, echostr):
                        raise RuntimeError("企微回调校验失败：msg_signature 不匹配。")
                    plain_echo = decrypt_wecom_ciphertext(echostr)
                    self.send_response(200)
                    self.send_header("Content-Type", "text/plain; charset=utf-8")
                    self.send_header("Cache-Control", "no-store")
                    self.end_headers()
                    self.wfile.write(plain_echo.encode("utf-8"))
                    return
                except Exception as error:
                    self._write_json(
                        500,
                        {
                            "ok": False,
                            "error": str(error),
                            "status": status,
                        },
                        cache_control=True,
                    )
                    return

            self._write_json(
                500,
                {
                    "ok": False,
                    "error": "企微回调地址已接通，但尚未配置回调 Token / EncodingAESKey，当前无法完成企微后台校验。",
                    "status": status,
                },
                cache_control=True,
            )
            return

        if self.command == "POST":
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b""
            if not status["callbackCryptoReady"]:
                self._write_json(
                    500,
                    {
                        "ok": False,
                        "error": "企微回调地址已接通，但尚未配置回调 Token / EncodingAESKey，当前无法验证并处理企微事件。",
                        "status": status,
                    },
                    cache_control=True,
                )
                return
            try:
                parsed = urlparse(self.path or "")
                query = parse_qs(parsed.query)
                msg_signature = (query.get("msg_signature") or [""])[0]
                timestamp = (query.get("timestamp") or [""])[0]
                nonce = (query.get("nonce") or [""])[0]
                xml_root = ElementTree.fromstring(raw_body.decode("utf-8", errors="ignore") or "<xml/>")
                encrypted = (xml_root.findtext("Encrypt") or "").strip()
                if not encrypted:
                    raise RuntimeError("企微回调缺少 Encrypt 字段。")
                if not verify_wecom_signature(msg_signature, timestamp, nonce, encrypted):
                    raise RuntimeError("企微回调校验失败：msg_signature 不匹配。")
                decrypted_xml = decrypt_wecom_ciphertext(encrypted)
                event_root = ElementTree.fromstring(decrypted_xml or "<xml/>")
                event_name = (event_root.findtext("Event") or "").strip()
                change_type = (event_root.findtext("ChangeType") or "").strip()
                state_value = (event_root.findtext("State") or "").strip()
                user_id = (event_root.findtext("UserID") or "").strip()
                external_user_id = (event_root.findtext("ExternalUserID") or "").strip()
                welcome_code = (event_root.findtext("WelcomeCode") or "").strip()
                if change_type == "del_follow_user" and external_user_id and user_id:
                    try:
                        update_geo_report_wecom_relationship(external_user_id, user_id, "removed")
                    except Exception:
                        pass
                if change_type == "add_external_contact":
                    claim_token = state_value
                    if not claim_token and external_user_id:
                        try:
                            claim_token = resolve_geo_report_wecom_claim_token(external_user_id, user_id)
                        except Exception:
                            claim_token = ""
                    if not claim_token:
                        claim_token = find_recent_geo_report_claim()
                    if not claim_token:
                        self.send_response(200)
                        self.send_header("Content-Type", "text/plain; charset=utf-8")
                        self.send_header("Cache-Control", "no-store")
                        self.end_headers()
                        self.wfile.write("success".encode("utf-8"))
                        return
                    try:
                        report = deliver_geo_report_wecom_claim(claim_token, external_user_id=external_user_id, follow_user_id=user_id)
                        wecom_state = report.get("wecomClaim") or {}
                        if welcome_code:
                            try:
                                previous_welcome_code = (wecom_state.get("lastWelcomeCode") or "").strip()
                                should_send = previous_welcome_code != welcome_code
                                if should_send:
                                    send_wecom_welcome_message(welcome_code, report)
                                send_time = datetime.now(timezone.utc).astimezone().isoformat()
                                wecom_state["welcomeSentAt"] = send_time
                                wecom_state["lastWelcomeCode"] = welcome_code
                                wecom_state["lastError"] = ""
                                report["wecomClaim"] = wecom_state
                                report["updatedAt"] = send_time
                                report_path = Path(GEO_REPORT_DIR) / "{}.json".format(report.get("token") or "")
                                report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
                                if should_send:
                                    try:
                                        push_geo_report_wecom_sent_to_feishu(report)
                                    except Exception as feishu_error:
                                        wecom_state["lastError"] = str(feishu_error)
                                        report["wecomClaim"] = wecom_state
                                        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
                            except Exception as welcome_error:
                                wecom_state["lastError"] = str(welcome_error)
                                report["wecomClaim"] = wecom_state
                                report_path = Path(GEO_REPORT_DIR) / "{}.json".format(report.get("token") or "")
                                report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
                    except Exception:
                        pass
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write("success".encode("utf-8"))
                return
            except Exception as error:
                self._write_json(
                    500,
                    {
                        "ok": False,
                        "error": str(error),
                        "status": status,
                    },
                    cache_control=True,
                )
                return
            return

        self.send_error(405, "Method Not Allowed")


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Public chat gateway listening on http://{}:{}/chat".format(HOST, PORT))
    print("Forwarding website chat directly to public model: {}".format(PUBLIC_CHAT_MODEL))
    server.serve_forever()


if __name__ == "__main__":
    main()
