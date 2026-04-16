// 企业内容工厂演示：数据模型（仅用于前端模拟，无后端）

export type ContentType = "image" | "video";
export type Channel = "抖音" | "小红书" | "公众号" | "官网" | "广告投放";
export type Regions = "CN-only" | "CN+海外" | "EU" | "US";

export type JobStatus =
  | "DRAFT"
  | "GENERATED"
  | "WATERMARKED"
  | "REGISTERED"
  | "ANCHORED"
  | "SCANNED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "BLOCKED";

export type AnchorStatus = "OK" | "PENDING" | "FAIL";
export type RiskDecision = "PASS" | "REVIEW" | "BLOCK";
export type LicenseStatus = "OK" | "MISSING" | "CONFLICT";
export type TicketStatus = "open" | "in_progress" | "pending" | "solved" | "closed";
export type ApprovalResult = "APPROVED" | "REJECTED" | "NEED_CHANGES" | "-";

export type ScenarioId =
  | "normal"
  | "license_missing"
  | "license_conflict"
  | "high_risk_terms"
  | "region_restricted"
  | "similarity_conflict";

export type ProductEditionId = "enterprise_on_prem" | "starter" | "team" | "business";

export type Scenario = {
  id: ScenarioId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  availableIn: ProductEditionId[];
  defaults: {
    content_type: ContentType;
    channel: Channel;
    target_regions: Regions;
  };
};

export const SCENARIOS: Scenario[] = [
  {
    id: "normal",
    name: "正常放行",
    nameEn: "Normal Release",
    description: "PASS + OK + ANCHORED → 自动发布 → 自动封存（企业内容工厂的理想闭环）",
    descriptionEn: "PASS + OK + ANCHORED -> auto publish -> auto archive.",
    availableIn: ["enterprise_on_prem", "starter", "team", "business"],
    defaults: { content_type: "image", channel: "广告投放", target_regions: "CN-only" },
  },
  {
    id: "license_missing",
    name: "授权缺失",
    nameEn: "Missing License",
    description: "素材授权缺失：默认不放行 → 自动工单 → 等待审批补齐后再放行",
    descriptionEn: "Missing source license -> route to ticket and approval before release.",
    availableIn: ["enterprise_on_prem", "team", "business"],
    defaults: { content_type: "video", channel: "公众号", target_regions: "CN-only" },
  },
  {
    id: "license_conflict",
    name: "授权冲突",
    nameEn: "License Conflict",
    description: "授权冲突/超范围：默认 BLOCK → 必须法务介入处理（演示阻断分支）",
    descriptionEn: "Conflict or out-of-scope usage -> blocked by default and requires legal review.",
    availableIn: ["enterprise_on_prem", "business"],
    defaults: { content_type: "image", channel: "广告投放", target_regions: "CN-only" },
  },
  {
    id: "similarity_conflict",
    name: "素材比对冲突",
    nameEn: "Similarity Conflict",
    description: "生成产物与参考图高度相似：触发‘可能搬运/二创’预警，并演示授权冲突处理（比对→工单→阻断/放行）",
    descriptionEn: "High similarity to a reference asset triggers a possible copy alert and downstream license conflict handling.",
    availableIn: ["enterprise_on_prem"],
    defaults: { content_type: "image", channel: "广告投放", target_regions: "CN-only" },
  },
  {
    id: "high_risk_terms",
    name: "高风险词命中",
    nameEn: "High-Risk Terms",
    description: "命中高风险词：进入 REVIEW 或 BLOCK（演示审批路由与工单协作）",
    descriptionEn: "High-risk terms trigger REVIEW or BLOCK with approval routing.",
    availableIn: ["enterprise_on_prem", "team", "business"],
    defaults: { content_type: "image", channel: "小红书", target_regions: "CN-only" },
  },
  {
    id: "region_restricted",
    name: "跨境限制",
    nameEn: "Region Restricted",
    description: "目标地域触发限制：REGION_RESTRICTED → 直接 BLOCK（即使其他项 OK）",
    descriptionEn: "Region restriction triggers direct BLOCK even if other checks pass.",
    availableIn: ["enterprise_on_prem", "business"],
    defaults: { content_type: "video", channel: "官网", target_regions: "EU" },
  },
];

export type LedgerRow = {
  // 基础维度
  job_id: string;
  project_id: string;
  requestor: string;
  owner: string;
  created_at: string;
  updated_at: string;

  // 业务维度
  content_type: ContentType;
  channel: Channel;
  target_regions: Regions;
  job_status: JobStatus;

  // 生成与产物
  asset_id?: string;
  asset_uri?: string;
  model_name?: string;
  model_version?: string;
  prompt_hash?: string;

  // 确权/Provenance
  wm_fingerprint?: string;
  content_fingerprint_phash?: string;
  registry_id?: string;
  receipt_id?: string;
  chain_tx_id?: string;
  anchor_status?: AnchorStatus;

  // 素材比对（生成产物 vs 参考图）
  similarity_score?: number; // 0-1
  similarity_decision?: "OK" | "POSSIBLE_COPY" | "CONFLICT";
  similarity_reason?: string;

  // 风险与授权
  risk_decision?: RiskDecision;
  risk_score?: number;
  risk_reason?: string;
  license_status?: LicenseStatus;
  license_reason?: string;

  // 工单与审批
  ticket_id?: string;
  ticket_status?: TicketStatus;
  approval_route?: string;
  approval_result?: ApprovalResult;

  // 发布与留存
  publish_status?: "NOT_PUBLISHED" | "SUCCESS" | "FAIL";
  publish_id?: string;
  retention_pointer?: string;
};

export type StepId =
  | "intake"
  | "generate"
  | "watermark"
  | "fingerprint"
  | "asset_compare"
  | "register"
  | "anchor"
  | "risk_scan"
  | "license_check"
  | "approval_route"
  | "ticket"
  | "approval_wait"
  | "publish"
  | "archive"
  | "audit_pull";

export type StepDef = {
  id: StepId;
  title: string;
  titleEn: string;
  subtitle: string;
  writes: string[];
  statusAfter: JobStatus;
  availableIn: ProductEditionId[];
};

export const STEPS: StepDef[] = [
  {
    id: "intake",
    title: "任务创建",
    titleEn: "Create Job",
    subtitle: "intake.create_job",
    writes: ["job_id", "project_id", "requestor", "channel", "target_regions", "prompt_hash"],
    statusAfter: "DRAFT",
    availableIn: ["enterprise_on_prem", "starter", "team", "business"],
  },
  {
    id: "generate",
    title: "生成/渲染",
    titleEn: "Generate / Render",
    subtitle: "generate.render",
    writes: ["asset_id", "asset_uri", "model_name", "model_version"],
    statusAfter: "GENERATED",
    availableIn: ["enterprise_on_prem", "starter", "team", "business"],
  },
  {
    id: "watermark",
    title: "嵌入水印",
    titleEn: "Embed Watermark",
    subtitle: "provenance.embed_watermark",
    writes: ["wm_fingerprint"],
    statusAfter: "WATERMARKED",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "fingerprint",
    title: "生成指纹",
    titleEn: "Compute Fingerprint",
    subtitle: "provenance.compute_fingerprint",
    writes: ["content_fingerprint_phash"],
    statusAfter: "WATERMARKED",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "asset_compare",
    title: "素材比对",
    titleEn: "Asset Compare",
    subtitle: "asset.compare",
    writes: ["similarity_score", "similarity_decision"],
    statusAfter: "WATERMARKED",
    availableIn: ["enterprise_on_prem"],
  },
  {
    id: "register",
    title: "确权登记",
    titleEn: "Register Claim",
    subtitle: "registry.register_claim",
    writes: ["registry_id", "receipt_id"],
    statusAfter: "REGISTERED",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "anchor",
    title: "链上锚定",
    titleEn: "Anchor Receipt",
    subtitle: "chain.anchor_receipt",
    writes: ["chain_tx_id", "anchor_status"],
    statusAfter: "ANCHORED",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "risk_scan",
    title: "风险扫描",
    titleEn: "Risk Scan",
    subtitle: "policy.risk_scan",
    writes: ["risk_decision", "risk_score", "risk_reason"],
    statusAfter: "SCANNED",
    availableIn: ["enterprise_on_prem", "starter", "team", "business"],
  },
  {
    id: "license_check",
    title: "授权校验",
    titleEn: "License Check",
    subtitle: "license.check_sources",
    writes: ["license_status", "license_reason"],
    statusAfter: "SCANNED",
    availableIn: ["enterprise_on_prem", "team", "business"],
  },
  {
    id: "approval_route",
    title: "审批路由",
    titleEn: "Approval Route",
    subtitle: "approval.route",
    writes: ["approval_route"],
    statusAfter: "SCANNED",
    availableIn: ["enterprise_on_prem", "team", "business"],
  },
  {
    id: "ticket",
    title: "飞书工单",
    titleEn: "Feishu Ticket",
    subtitle: "feishu.ticket.create",
    writes: ["ticket_id", "ticket_status"],
    statusAfter: "PENDING_APPROVAL",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "approval_wait",
    title: "等待审批",
    titleEn: "Wait Approval",
    subtitle: "approval.wait_result",
    writes: ["approval_result"],
    statusAfter: "APPROVED",
    availableIn: ["enterprise_on_prem", "team", "business"],
  },
  {
    id: "publish",
    title: "发布/投放",
    titleEn: "Publish",
    subtitle: "publish.dispatch",
    writes: ["publish_status", "publish_id"],
    statusAfter: "PUBLISHED",
    availableIn: ["enterprise_on_prem", "starter", "team", "business"],
  },
  {
    id: "archive",
    title: "证据封存",
    titleEn: "Archive Evidence",
    subtitle: "archive.seal_evidence",
    writes: ["retention_pointer"],
    statusAfter: "ARCHIVED",
    availableIn: ["enterprise_on_prem", "business"],
  },
  {
    id: "audit_pull",
    title: "审计调取",
    titleEn: "Audit Pull",
    subtitle: "audit.pull",
    writes: [],
    statusAfter: "ARCHIVED",
    availableIn: ["enterprise_on_prem"],
  },
];

export type ProductEdition = {
  id: ProductEditionId;
  name: string;
  nameEn: string;
  shortName: string;
  shortNameEn: string;
  segment: string;
  segmentEn: string;
  description: string;
  descriptionEn: string;
  flowSummary: string;
  flowSummaryEn: string;
  deployment: string;
  deploymentEn: string;
  collaboration: string;
  collaborationEn: string;
};

export const PRODUCT_EDITIONS: ProductEdition[] = [
  {
    id: "enterprise_on_prem",
    name: "企业本地版",
    nameEn: "Enterprise On-Prem",
    shortName: "企业本地版",
    shortNameEn: "Enterprise",
    segment: "大中型企业本地版",
    segmentEn: "On-prem for large enterprises",
    description: "面向大中型企业的 Compute Node + Compliance Node 本地部署，覆盖完整确权、审批、台账与审计链路。",
    descriptionEn: "On-prem deployment for large enterprises with Compute Node + Compliance Node and a full compliance chain.",
    flowSummary: "完整 TrustOps 流程：生成 → Provenance → 合规门禁 → 飞书工单 → 发布 → 封存 → 审计。",
    flowSummaryEn: "Full TrustOps flow: generate -> provenance -> compliance gates -> ticket -> publish -> archive -> audit.",
    deployment: "私有化 / 本地部署",
    deploymentEn: "Private / On-prem",
    collaboration: "法务、品牌、合规、安全多角色协作",
    collaborationEn: "Legal, brand, compliance and security collaboration",
  },
  {
    id: "starter",
    name: "启航版",
    nameEn: "Starter",
    shortName: "启航版",
    shortNameEn: "Starter",
    segment: "中小企业在线启航版",
    segmentEn: "Self-serve SaaS for SMBs",
    description: "面向中小企业的自助服务版本，突出快速生成、基础风险检查与直接发布。",
    descriptionEn: "Self-serve SaaS for SMBs focused on fast generation, basic risk checks and direct publishing.",
    flowSummary: "轻流程：任务创建 → 生成 → 风险扫描 → 发布。",
    flowSummaryEn: "Light flow: create job -> generate -> risk scan -> publish.",
    deployment: "在线 SaaS",
    deploymentEn: "Cloud SaaS",
    collaboration: "单人 / 自助式",
    collaborationEn: "Single-user / self-serve",
  },
  {
    id: "team",
    name: "团队版",
    nameEn: "Team",
    shortName: "团队版",
    shortNameEn: "Team",
    segment: "中小企业团队版",
    segmentEn: "Light collaboration SaaS",
    description: "在自助生成基础上加入轻量协作、授权校验与审批流，适合小团队运营。",
    descriptionEn: "Adds lightweight collaboration, license checks and approvals for small teams.",
    flowSummary: "轻协作流程：生成 → 风险/授权 → 审批 → 发布。",
    flowSummaryEn: "Collaborative flow: generate -> risk/license -> approval -> publish.",
    deployment: "在线 SaaS",
    deploymentEn: "Cloud SaaS",
    collaboration: "小团队协作",
    collaborationEn: "Small-team collaboration",
  },
  {
    id: "business",
    name: "企业增强版",
    nameEn: "Business",
    shortName: "企业增强版",
    shortNameEn: "Business",
    segment: "企业在线版",
    segmentEn: "Enhanced enterprise SaaS",
    description: "面向成长型企业的在线企业版，保留核心合规能力，但比本地版更轻、更标准化。",
    descriptionEn: "Enhanced SaaS edition for growing companies with key compliance features in a lighter form.",
    flowSummary: "增强流程：生成 → Provenance 精简版 → 风险/授权 → 工单/审批 → 发布/封存。",
    flowSummaryEn: "Enhanced flow: generate -> light provenance -> risk/license -> ticket/approval -> publish/archive.",
    deployment: "在线 SaaS",
    deploymentEn: "Cloud SaaS",
    collaboration: "企业团队协作",
    collaborationEn: "Enterprise team collaboration",
  },
];

export function getEditionScenarios(editionId: ProductEditionId) {
  return SCENARIOS.filter((scenario) => scenario.availableIn.includes(editionId));
}

export function getEditionSteps(editionId: ProductEditionId) {
  return STEPS.filter((step) => step.availableIn.includes(editionId));
}
