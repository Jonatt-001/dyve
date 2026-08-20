const dns = require("node:dns").promises;
const net = require("node:net");
const tls = require("node:tls");

const MAX_BODY = 1024 * 1024;

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(data));
}

function normalizeDomain(input) {
  let value = String(input || "").trim().toLowerCase();
  if (!value) throw new Error("Enter a domain.");

  if (!/^https?:\/\//i.test(value)) value = "https://" + value;

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid domain such as example.com.");
  }

  if (url.username || url.password) throw new Error("Credentials are not allowed.");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("Only standard HTTP and HTTPS ports are supported.");

  const hostname = url.hostname.replace(/\.$/, "");
  if (!hostname || hostname.length > 253 || hostname.includes("_")) {
    throw new Error("Enter a valid public domain.");
  }

  const labels = hostname.split(".");
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9-]{1,63}$/i.test(label) || label.startsWith("-") || label.endsWith("-"))) {
    throw new Error("Enter a valid public domain such as example.com.");
  }

  return hostname;
}

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;
  const [a, b] = parts;
  return a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 0;
}

function isPrivateIPv6(ip) {
  const v = ip.toLowerCase();
  return v === "::1" ||
    v.startsWith("fc") ||
    v.startsWith("fd") ||
    v.startsWith("fe80:") ||
    v === "::";
}

function isPublicIp(ip) {
  if (net.isIPv4(ip)) return !isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return !isPrivateIPv6(ip);
  return false;
}

async function resolvePublic(hostname) {
  const [a, aaaa] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname)
  ]);

  const ipv4 = a.status === "fulfilled" ? a.value : [];
  const ipv6 = aaaa.status === "fulfilled" ? aaaa.value : [];
  const addresses = [...ipv4, ...ipv6];

  if (!addresses.length) throw new Error("The domain does not resolve to a public IP address.");
  if (!addresses.every(isPublicIp)) throw new Error("The target resolves to a private or reserved IP address.");

  return { ipv4, ipv6 };
}

function headerMap(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) out[key.toLowerCase()] = value;
  return out;
}

function finding(id, name, status, severity, summary, detail, fix) {
  return { id, name, status, severity, summary, detail, fix };
}

function statusFor(condition, good = "pass", bad = "fail") {
  return condition ? good : bad;
}

async function fetchWithTimeout(url, options = {}, timeout = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      ...options,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Dyve-Domain-Intelligence/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(options.headers || {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getHttpProfile(hostname) {
  const urls = [`https://${hostname}/`, `http://${hostname}/`];
  const results = [];

  for (const url of urls) {
    try {
      const response = await fetchWithTimeout(url);
      const headers = headerMap(response.headers);
      let body = "";
      const contentType = headers["content-type"] || "";
      if (contentType.includes("text/html") || contentType.includes("text/plain") || contentType.includes("application/xhtml+xml")) {
        const reader = response.body?.getReader();
        if (reader) {
          const chunks = [];
          let total = 0;
          while (total < MAX_BODY) {
            const { done, value } = await reader.read();
            if (done) break;
            const slice = value.slice(0, Math.max(0, MAX_BODY - total));
            chunks.push(slice);
            total += slice.length;
            if (total >= MAX_BODY) {
              try { await reader.cancel(); } catch {}
              break;
            }
          }
          body = Buffer.concat(chunks.map(x => Buffer.from(x))).toString("utf8");
        }
      }
      results.push({
        url,
        status: response.status,
        headers,
        body: body.slice(0, MAX_BODY)
      });
    } catch (error) {
      results.push({ url, error: error.name === "AbortError" ? "timeout" : error.message });
    }
  }

  return results;
}

function tlsProfile(hostname) {
  return new Promise(resolve => {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 7000
    });

    const finish = (result) => {
      try { socket.destroy(); } catch {}
      resolve(result);
    };

    socket.once("secureConnect", () => {
      const cert = socket.getPeerCertificate();
      const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
      const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
      const now = new Date();
      finish({
        authorized: socket.authorized,
        authorizationError: socket.authorizationError || null,
        subject: cert.subject || null,
        issuer: cert.issuer || null,
        validFrom: validFrom?.toISOString() || null,
        validTo: validTo?.toISOString() || null,
        daysRemaining: validTo ? Math.floor((validTo - now) / 86400000) : null,
        serialNumber: cert.serialNumber || null
      });
    });

    socket.once("error", error => finish({ error: error.message }));
    socket.once("timeout", () => finish({ error: "TLS connection timed out." }));
  });
}

async function resolveRecord(hostname, type) {
  try {
    return await dns.resolve(hostname, type);
  } catch {
    return [];
  }
}

function parseCanonical(html) {
  const match = html.match(/<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["']/i);
  return match ? match[1] : null;
}

function parseMetaRobots(html) {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']robots["']/i);
  return match ? match[1] : null;
}

function scoreFindings(findings) {
  const weights = { critical: 20, high: 12, medium: 7, low: 3 };
  let score = 100;
  for (const item of findings) {
    if (item.status === "fail") score -= weights[item.severity] || 0;
    if (item.status === "warn") score -= Math.ceil((weights[item.severity] || 0) / 2);
  }
  return Math.max(0, Math.min(100, score));
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 55) return "Needs attention";
  return "Weak";
}

async function scan(hostname) {
  const started = Date.now();
  const dnsProfile = await resolvePublic(hostname);
  const [httpProfiles, tlsData] = await Promise.all([
    getHttpProfile(hostname),
    tlsProfile(hostname)
  ]);

  const https = httpProfiles.find(x => x.url.startsWith("https://"));
  const http = httpProfiles.find(x => x.url.startsWith("http://"));
  const h = https?.headers || {};
  const httpsOk = !!https && https.status >= 200 && https.status < 400;
  const httpRedirects = http && [301, 302, 303, 307, 308].includes(http.status) && /^https:\/\//i.test(http.headers?.location || "");

  const findings = [];

  findings.push(finding(
    "https",
    "HTTPS",
    httpsOk ? "pass" : "fail",
    "high",
    httpsOk ? "HTTPS is available." : "HTTPS could not be confirmed.",
    httpsOk ? `HTTPS returned HTTP ${https.status}.` : "The HTTPS endpoint did not return a successful response.",
    "Install a valid TLS certificate and serve the site over HTTPS."
  ));

  const certGood = tlsData && !tlsData.error && tlsData.authorized && (tlsData.daysRemaining == null || tlsData.daysRemaining >= 0);
  findings.push(finding(
    "tls",
    "TLS certificate",
    certGood ? "pass" : "fail",
    "high",
    certGood ? "The TLS certificate is valid." : "The TLS certificate has a trust or validity problem.",
    tlsData?.error || (tlsData?.authorizationError ? `Certificate validation error: ${tlsData.authorizationError}` : "Certificate could not be validated."),
    "Use a publicly trusted certificate and renew it before expiry."
  ));

  findings.push(finding(
    "http-redirect",
    "HTTP to HTTPS redirect",
    httpRedirects ? "pass" : "warn",
    "medium",
    httpRedirects ? "HTTP redirects to HTTPS." : "An HTTP-to-HTTPS redirect was not confirmed.",
    http ? `HTTP returned ${http.status}${http.headers?.location ? ` with Location: ${http.headers.location}` : ""}.` : "HTTP endpoint could not be checked.",
    "Redirect all HTTP requests to their HTTPS equivalent."
  ));

  const hsts = h["strict-transport-security"];
  findings.push(finding(
    "hsts",
    "Strict-Transport-Security",
    hsts ? "pass" : "fail",
    "high",
    hsts ? "HSTS is enabled." : "HSTS is missing.",
    hsts || "No Strict-Transport-Security response header was detected.",
    "Add a Strict-Transport-Security header with an appropriate max-age. Only enable includeSubDomains/preload when the whole domain is ready."
  ));

  const csp = h["content-security-policy"];
  findings.push(finding(
    "csp",
    "Content-Security-Policy",
    csp ? "pass" : "warn",
    "medium",
    csp ? "A Content-Security-Policy is present." : "CSP is missing.",
    csp || "No Content-Security-Policy response header was detected.",
    "Define a restrictive CSP and progressively remove unsafe inline/script dependencies."
  ));

  const xcto = h["x-content-type-options"];
  findings.push(finding(
    "xcto",
    "X-Content-Type-Options",
    xcto?.toLowerCase() === "nosniff" ? "pass" : "warn",
    "low",
    xcto?.toLowerCase() === "nosniff" ? "MIME sniffing protection is enabled." : "MIME sniffing protection is missing.",
    xcto || "Expected X-Content-Type-Options: nosniff.",
    "Send X-Content-Type-Options: nosniff."
  ));

  const xfo = h["x-frame-options"];
  const frameProtected = !!xfo || !!csp?.match(/frame-ancestors/i);
  findings.push(finding(
    "clickjacking",
    "Clickjacking protection",
    frameProtected ? "pass" : "warn",
    "medium",
    frameProtected ? "Frame embedding is restricted." : "No clickjacking protection was detected.",
    xfo || (csp?.match(/frame-ancestors[^;]*/i)?.[0] || "Neither X-Frame-Options nor a CSP frame-ancestors directive was detected."),
    "Use CSP frame-ancestors or X-Frame-Options where appropriate."
  ));

  const referrer = h["referrer-policy"];
  findings.push(finding(
    "referrer",
    "Referrer-Policy",
    referrer ? "pass" : "warn",
    "low",
    referrer ? "A Referrer-Policy is present." : "Referrer-Policy is missing.",
    referrer || "No Referrer-Policy response header was detected.",
    "Set a deliberate policy such as strict-origin-when-cross-origin."
  ));

  const permissions = h["permissions-policy"];
  findings.push(finding(
    "permissions",
    "Permissions-Policy",
    permissions ? "pass" : "warn",
    "low",
    permissions ? "Permissions-Policy is present." : "Permissions-Policy is missing.",
    permissions || "No Permissions-Policy response header was detected.",
    "Restrict browser capabilities that your site does not need."
  ));

  const spf = (await resolveRecord(hostname, "TXT")).filter(x => x.some?.(v => /v=spf1/i.test(v)) || (typeof x === "string" && /v=spf1/i.test(x)));
  const txt = await resolveRecord(hostname, "TXT");
  const txtFlat = txt.flat ? txt.flat() : txt;
  const spfFound = txtFlat.some(x => /v=spf1/i.test(String(x)));
  const dmarcTxt = await resolveRecord(`_dmarc.${hostname}`, "TXT");
  const dmarcFlat = dmarcTxt.flat ? dmarcTxt.flat() : dmarcTxt;
  const dmarcFound = dmarcFlat.some(x => /v=dmarc1/i.test(String(x)));
  const mx = await resolveRecord(hostname, "MX");

  findings.push(finding(
    "spf",
    "SPF",
    spfFound ? "pass" : "warn",
    "medium",
    spfFound ? "SPF is published." : "SPF was not detected.",
    spfFound ? txtFlat.find(x => /v=spf1/i.test(String(x))) : "No v=spf1 TXT record was detected.",
    "Publish an SPF record listing the services authorized to send mail for the domain."
  ));

  findings.push(finding(
    "dmarc",
    "DMARC",
    dmarcFound ? "pass" : "warn",
    "medium",
    dmarcFound ? "DMARC is published." : "DMARC was not detected.",
    dmarcFound ? dmarcFlat.find(x => /v=dmarc1/i.test(String(x))) : "No v=DMARC1 TXT record was detected at _dmarc.",
    "Publish a DMARC policy and use reporting while moving toward an enforcement policy."
  ));

  findings.push(finding(
    "mx",
    "MX",
    mx.length ? "pass" : "warn",
    "low",
    mx.length ? "Mail exchange records exist." : "No MX records were detected.",
    mx.length ? mx.map(x => `${x.exchange} (${x.priority})`).join(", ") : "No MX record was returned.",
    "If the domain sends or receives email, configure the correct mail exchange records."
  ));

  const robotsUrl = `https://${hostname}/robots.txt`;
  const sitemapUrl = `https://${hostname}/sitemap.xml`;
  let robots = null;
  let sitemap = null;

  try {
    const r = await fetchWithTimeout(robotsUrl);
    robots = { status: r.status, body: (await r.text()).slice(0, 100000) };
  } catch (e) {
    robots = { error: e.message };
  }

  try {
    const s = await fetchWithTimeout(sitemapUrl);
    sitemap = { status: s.status, body: (await s.text()).slice(0, 100000) };
  } catch (e) {
    sitemap = { error: e.message };
  }

  const canonical = https?.body ? parseCanonical(https.body) : null;
  const metaRobots = https?.body ? parseMetaRobots(https.body) : null;

  findings.push(finding(
    "robots",
    "robots.txt",
    robots?.status === 200 ? "pass" : "warn",
    "low",
    robots?.status === 200 ? "robots.txt is reachable." : "robots.txt was not confirmed.",
    robots?.status === 200 ? "The scanner received a 200 response." : `Response: ${robots?.status || robots?.error || "unknown"}.`,
    "Publish a valid robots.txt when crawler directives are required."
  ));

  findings.push(finding(
    "sitemap",
    "sitemap.xml",
    sitemap?.status === 200 ? "pass" : "warn",
    "low",
    sitemap?.status === 200 ? "sitemap.xml is reachable." : "sitemap.xml was not confirmed.",
    sitemap?.status === 200 ? "The scanner received a 200 response." : `Response: ${sitemap?.status || sitemap?.error || "unknown"}.`,
    "Publish an XML sitemap containing canonical, indexable URLs when appropriate."
  ));

  findings.push(finding(
    "canonical",
    "Canonical URL",
    canonical ? "pass" : "warn",
    "low",
    canonical ? "A canonical link was detected." : "No canonical link was detected on the homepage.",
    canonical || "The homepage HTML did not expose a canonical link.",
    "Add a self-referencing canonical URL where appropriate and keep it aligned with the indexable URL."
  ));

  const score = scoreFindings(findings);

  return {
    domain: hostname,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    score,
    label: scoreLabel(score),
    dns: {
      ipv4: dnsProfile.ipv4,
      ipv6: dnsProfile.ipv6,
      ns: await resolveRecord(hostname, "NS"),
      mx
    },
    tls: tlsData,
    http: {
      https: https ? { status: https.status, headers: https.headers } : null,
      http: http ? { status: http.status, headers: http.headers } : null
    },
    email: {
      spf: spfFound,
      dmarc: dmarcFound,
      mx: mx.map(x => ({ exchange: x.exchange, priority: x.priority }))
    },
    seo: {
      robots: robots?.status === 200,
      sitemap: sitemap?.status === 200,
      canonical,
      metaRobots
    },
    findings
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  try {
    const domain = normalizeDomain(req.body?.domain);
    const result = await scan(domain);
    return json(res, 200, result);
  } catch (error) {
    return json(res, 400, { error: error.message || "Scan failed." });
  }
};
