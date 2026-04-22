const siteUrl = "https://www.jgmao.com";

// Bump this value when you need a fresh WeChat share URL to bypass cached cards.
export const h5ShareVersion = "20260422-1";
export const geoScoreShareVersion = "20260422-1";

export const homeCanonicalPath = "/";
export const h5CanonicalPath = "/h5/";
export const aiGrowthCanonicalPath = "/ai-growth/";
export const geoScoreCanonicalPath = "/geo-score/";

function withVersionQuery(url: string, version: string) {
  if (!version) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export const siteOrigin = siteUrl;
export const homeCanonicalUrl = `${siteUrl}${homeCanonicalPath}`;
export const h5CanonicalUrl = `${siteUrl}${h5CanonicalPath}`;
export const aiGrowthCanonicalUrl = `${siteUrl}${aiGrowthCanonicalPath}`;
export const geoScoreCanonicalUrl = `${siteUrl}${geoScoreCanonicalPath}`;
export const h5WechatShareUrl = withVersionQuery(aiGrowthCanonicalUrl, h5ShareVersion);
export const geoScoreWechatShareUrl = withVersionQuery(geoScoreCanonicalUrl, geoScoreShareVersion);
