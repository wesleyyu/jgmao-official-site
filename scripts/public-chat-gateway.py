#!/usr/bin/env python3
import json
import os
import re
import subprocess
import time
import hashlib
import random
import string
import secrets
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from socketserver import ThreadingMixIn
from datetime import datetime, timezone, timedelta
from urllib.error import HTTPError
from urllib import request as urllib_request
from urllib.parse import parse_qs, quote, urljoin, urlparse


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
WECHAT_ACCESS_TOKEN_CACHE = {"value": "", "expires_at": 0}
WECHAT_JSAPI_TICKET_CACHE = {"value": "", "expires_at": 0}

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


def strip_html(html):
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_tag_content(html, pattern):
    match = re.search(pattern, html, re.I)
    if not match:
        return ""
    return (match.group(1) or "").strip()


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


def save_geo_report(entry):
    token = secrets.token_hex(16)
    report = {
        "token": token,
        "type": "geo-score",
        "createdAt": entry["createdAt"],
        "reportUrl": "{}/geo-report/{}/".format(PUBLIC_SITE_URL, token),
        "input": {
            "name": entry.get("name") or "",
            "company": entry.get("company") or "",
            "contact": entry.get("contact") or "",
            "websiteUrl": entry.get("websiteUrl") or "",
            "source": entry.get("source") or "",
            "page": entry.get("page") or "",
        },
        "result": entry.get("result") or {},
    }

    report_dir = Path(GEO_REPORT_DIR)
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "{}.json".format(token)).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def read_geo_report(token):
    file_path = Path(GEO_REPORT_DIR) / "{}.json".format(token)
    if not file_path.exists():
        raise FileNotFoundError(token)
    return json.loads(file_path.read_text(encoding="utf-8"))


def check_remote_file(url):
    req = urllib_request.Request(url, headers={"User-Agent": "JGMAO GEO Score Bot/1.0"})
    try:
        with urllib_request.urlopen(req, timeout=10) as response:
            status = getattr(response, "status", 200)
            return 200 <= status < 300
    except Exception:
        return False


def analyze_homepage(html, final_url):
    title = extract_tag_content(html, r"<title[^>]*>([\s\S]*?)</title>")
    meta_description = extract_tag_content(html, r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']')
    if not meta_description:
        meta_description = extract_tag_content(html, r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']')
    canonical = extract_tag_content(html, r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']')
    if not canonical:
        canonical = extract_tag_content(html, r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']')
    h1 = extract_tag_content(html, r"<h1[^>]*>([\s\S]*?)</h1>")
    has_structured_data = bool(re.search(r"application/ld\+json", html, re.I))
    has_faq_signal = bool(re.search(r"FAQPage|常见问题|faq", html, re.I))
    has_og_title = bool(re.search(r'property=["\']og:title["\']', html, re.I))
    has_og_description = bool(re.search(r'property=["\']og:description["\']', html, re.I))
    contact_signal = bool(re.search(r"(400-\d{4}-\d{3}|@\w|联系电话|商务邮箱|联系我们|电话咨询)", html, re.I))
    content_text = strip_html(html)
    has_theme_focus = bool(re.search(r"(GEO|AI增长|增长飞轮|智能获客|AI 可见性|官网 GEO)", " ".join([title, meta_description, h1, content_text[:800]]), re.I))
    has_content_assets = bool(re.search(r"(案例|新闻|洞察|blog|insights|专题|白皮书|报告|FAQ|常见问题)", html, re.I))
    has_cta_signal = bool(re.search(r"(预约|咨询|提交需求|立即联系|联系我们|电话咨询|扫码|表单|demo)", html, re.I))
    has_company_signal = bool(re.search(r"(有限公司|公司地址|北京市|商务邮箱|联系电话|service@|400-\d{4}-\d{3})", html, re.I))
    has_trust_signal = bool(re.search(r"(高新技术企业|新华社|备案|许可证|PICC|奥迪|沃尔沃|壳牌|美孚|中国平安|人民日报)", html, re.I))
    has_topic_depth = len(content_text) >= 1200

    return {
        "metrics": [
            {"ok": final_url.startswith("https://"), "weight": 8, "positive": "已启用 HTTPS，基础可信度较好。", "negative": "建议优先确保官网全站使用 HTTPS。", "key": "https", "label": "HTTPS", "dimension": "crawl"},
            {"ok": 8 <= len(title) <= 65, "weight": 6, "positive": "页面标题长度较合适。", "negative": "页面标题过短或过长，建议优化标题表达。", "key": "title", "label": "Title 标题长度", "dimension": "theme"},
            {"ok": 30 <= len(meta_description) <= 180, "weight": 6, "positive": "已配置较完整的 meta description。", "negative": "缺少清晰的 meta description。", "key": "description", "label": "Meta Description", "dimension": "theme"},
            {"ok": bool(h1), "weight": 6, "positive": "首页已有明确 H1 主题。", "negative": "首页缺少明确 H1，主题表达不够集中。", "key": "h1", "label": "首页 H1", "dimension": "theme"},
            {"ok": has_theme_focus, "weight": 6, "positive": "首页主题关键词较集中，页面语义比较明确。", "negative": "首页主题关键词分散，建议收紧主题表达与页面语义。", "key": "theme-focus", "label": "主题聚焦度", "dimension": "theme"},
            {"ok": bool(canonical), "weight": 7, "positive": "已配置 canonical 规范地址。", "negative": "建议补 canonical，减少重复地址干扰。", "key": "canonical", "label": "Canonical", "dimension": "crawl"},
            {"ok": has_og_title and has_og_description, "weight": 5, "positive": "社交分享标题与描述较完整。", "negative": "建议补全 og:title / og:description。", "key": "og", "label": "OG 分享信息", "dimension": "ai"},
            {"ok": has_structured_data, "weight": 7, "positive": "页面已带结构化数据。", "negative": "建议补充 Organization / FAQ / Article 等结构化数据。", "key": "schema", "label": "结构化数据", "dimension": "ai"},
            {"ok": has_faq_signal, "weight": 6, "positive": "页面已有 FAQ / 问答信号。", "negative": "建议补 FAQ 区块，增强 AI 抽取与引用能力。", "key": "faq", "label": "FAQ 信号", "dimension": "ai"},
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


def format_beijing_time(value):
    text = (value or "").strip()
    if not text:
        return ""
    try:
        normalized = text.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        beijing = parsed.astimezone(timezone(timedelta(hours=8)))
        return "{}（北京时间）".format(beijing.strftime("%Y-%m-%d %H:%M:%S"))
    except Exception:
        return text


def score_website(website_url):
    normalized_url = normalize_website_url(website_url)
    req = urllib_request.Request(
        normalized_url,
        headers={
            "User-Agent": "JGMAO GEO Score Bot/1.0",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    try:
        with urllib_request.urlopen(req, timeout=15) as response:
            status = getattr(response, "status", 200)
            if status < 200 or status >= 300:
                raise RuntimeError("官网暂时无法访问（{}），请确认网址是否可正常打开。".format(status))
            final_url = response.geturl() or normalized_url
            html = response.read().decode("utf-8", errors="ignore")
    except HTTPError as error:
        raise RuntimeError("官网暂时无法访问（{}），请确认网址是否可正常打开。".format(error.code))
    except Exception as error:
        raise RuntimeError(str(error) or "官网暂时无法访问，请稍后重试。")

    parsed = urlparse(final_url)
    base_url = "{}://{}".format(parsed.scheme, parsed.netloc)
    robots_ok = check_remote_file(urljoin(base_url, "/robots.txt"))
    sitemap_ok = check_remote_file(urljoin(base_url, "/sitemap.xml"))
    analysis = analyze_homepage(html, final_url)
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
        if path_only not in ["/chat", "/lead", "/geo-score", "/wechat/share-config", "/geo-report"]:
            self.send_error(404, "Not found")
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        if path_only == "/geo-report":
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path_only = (self.path or "").split("?", 1)[0]
        if path_only == "/geo-report":
            self._handle_geo_report_fetch()
            return
        self._write_json(404, {"ok": False, "error": "Not found"})

    def do_POST(self):
        if self.path == "/geo-score":
            self._handle_geo_score_submit()
            return

        if self.path == "/wechat/share-config":
            self._handle_wechat_share_config()
            return

        if self.path == "/lead":
            self._handle_lead_submit()
            return

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
                    "source": source,
                    "page": page or "/geo-score/",
                    "result": result,
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                }
                report = save_geo_report(entry)
                self._append_lead_log(entry)
                self._push_lead_to_feishu(
                    {
                        **entry,
                        "reportUrl": report["reportUrl"],
                        "demand": "官网 GEO 基础评分：{}/100；优先改进：{}".format(
                            result["score"], "；".join(result["priorities"])
                        ),
                    }
                )
                self._write_json(200, {"ok": True, "result": result}, cache_control=True)
                return

            if lead_type == "geo-report-fetch":
                token = (payload.get("token") or "").strip()
                if not token:
                    self._write_json(400, {"ok": False, "error": "缺少报告 token。"})
                    return
                try:
                    report = read_geo_report(token)
                except FileNotFoundError:
                    self._write_json(404, {"ok": False, "error": "报告不存在或已过期。"}, cache_control=True)
                    return
                self._write_json(200, {"ok": True, "report": report}, cache_control=True)
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
                    "demand": "官网 GEO 基础评分：{}/100；优先改进：{}".format(
                        result["score"], "；".join(result["priorities"])
                    ),
                }
            )
            self._write_json(200, {"ok": True, "result": result}, cache_control=True)
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
            "收到一条新的官网 GEO 评分线索" if entry.get("type") == "geo-score" else "收到一条新的 H5 留资线索",
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
        if not token:
            self._write_json(400, {"ok": False, "error": "缺少报告 token。"}, cache_control=True)
            return

        try:
            report = read_geo_report(token)
            self._write_json(200, {"ok": True, "report": report}, cache_control=True)
        except FileNotFoundError:
            self._write_json(404, {"ok": False, "error": "报告不存在或已过期。"}, cache_control=True)
        except Exception as error:
            self._write_json(500, {"ok": False, "error": str(error) or "报告读取失败。"}, cache_control=True)


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Public chat gateway listening on http://{}:{}/chat".format(HOST, PORT))
    print("Forwarding website chat directly to public model: {}".format(PUBLIC_CHAT_MODEL))
    server.serve_forever()


if __name__ == "__main__":
    main()
