const CISA_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const THREATFOX_URL = 'https://threatfox-api.abuse.ch/api/v1/';
const MALWAREBAZAAR_URL = 'https://mb-api.abuse.ch/api/v1/';
const URLHAUS_RECENT_URL = (key) => `https://urlhaus-api.abuse.ch/v2/files/exports/${encodeURIComponent(key)}/recent.csv`;

const SOURCE_META = {
  cisa: { name: 'CISA KEV', short: 'CISA', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
  threatfox: { name: 'ThreatFox', short: 'THREATFOX', url: 'https://threatfox.abuse.ch/' },
  malwarebazaar: { name: 'MalwareBazaar', short: 'MALWAREBAZAAR', url: 'https://bazaar.abuse.ch/' },
  urlhaus: { name: 'URLhaus', short: 'URLHAUS', url: 'https://urlhaus.abuse.ch/' }
};

const FETCH_TIMEOUT = 12000;
const MAX_PER_SOURCE = 45;
const MAX_OUTPUT = 100;

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

async function fetchJson(url, options = {}) {
  const { controller, timer } = timeoutSignal(FETCH_TIMEOUT);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url, options = {}) {
  const { controller, timer } = timeoutSignal(FETCH_TIMEOUT);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function postJson(url, body, authKey) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (authKey) headers['Auth-Key'] = authKey;
  return fetchJson(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(String(value).replace(' UTC', 'Z'));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function severityFromConfidence(confidence, threatType = '') {
  const n = Number(confidence);
  const type = String(threatType).toLowerCase();
  if (type.includes('botnet') || type.includes('cc_') || type.includes('payload')) {
    if (n >= 80) return 'critical';
    if (n >= 55) return 'high';
  }
  if (n >= 90) return 'critical';
  if (n >= 65) return 'high';
  if (n >= 35) return 'medium';
  return 'low';
}

function severityFromKev(item) {
  return item.knownRansomwareCampaignUse === 'Known' ? 'critical' : 'high';
}

function severityFromUrlhaus(item) {
  const threat = String(item.threat || '').toLowerCase();
  if (threat.includes('ransom') || threat.includes('stealer')) return 'critical';
  if (item.url_status === 'online') return 'high';
  return 'medium';
}

function makeSignal(partial) {
  const observedAt = safeDate(partial.observedAt) || new Date().toISOString();
  return {
    id: String(partial.id),
    source: partial.source,
    sourceName: SOURCE_META[partial.source]?.name || partial.source,
    sourceUrl: partial.sourceUrl || SOURCE_META[partial.source]?.url || null,
    type: partial.type || 'signal',
    indicatorType: partial.indicatorType || null,
    indicator: partial.indicator || null,
    title: partial.title || 'Threat intelligence observation',
    description: partial.description || '',
    severity: partial.severity || 'medium',
    confidence: Number.isFinite(Number(partial.confidence)) ? Math.max(0, Math.min(100, Number(partial.confidence))) : null,
    malware: partial.malware || null,
    cve: partial.cve || null,
    vendor: partial.vendor || null,
    product: partial.product || null,
    country: partial.country || null,
    tags: Array.isArray(partial.tags) ? partial.tags.slice(0, 12) : [],
    observedAt,
    firstSeen: safeDate(partial.firstSeen),
    lastSeen: safeDate(partial.lastSeen),
    ransomware: partial.ransomware || null,
    assessment: partial.assessment || 'Observed',
    reference: partial.reference || null
  };
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += ch;
    }
  }
  values.push(value);
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((x) => x.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

async function getCisaSignals() {
  const json = await fetchJson(CISA_URL, { headers: { Accept: 'application/json' } });
  const vulnerabilities = Array.isArray(json.vulnerabilities) ? json.vulnerabilities : [];
  return vulnerabilities
    .sort((a, b) => String(b.dateAdded || '').localeCompare(String(a.dateAdded || '')))
    .slice(0, MAX_PER_SOURCE)
    .map((item) => makeSignal({
      id: `cisa:${item.cveID}`,
      source: 'cisa',
      type: 'vulnerability',
      indicatorType: 'CVE',
      indicator: item.cveID,
      cve: item.cveID,
      title: `${item.vendorProject || 'Vendor'} — ${item.product || 'Product'}`,
      description: item.vulnerabilityName || item.shortDescription || 'Known exploited vulnerability listed by CISA.',
      severity: severityFromKev(item),
      confidence: 100,
      vendor: item.vendorProject || null,
      product: item.product || null,
      observedAt: item.dateAdded,
      firstSeen: item.dateAdded,
      ransomware: item.knownRansomwareCampaignUse || null,
      assessment: 'Known exploited',
      reference: item.notes || null,
      sourceUrl: `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(item.cveID)}`,
      tags: ['kev', item.knownRansomwareCampaignUse === 'Known' ? 'ransomware' : 'exploited']
    }));
}

async function getThreatFoxSignals(authKey) {
  if (!authKey) throw new Error('THREATFOX_AUTH_KEY not configured');
  const json = await postJson(THREATFOX_URL, { query: 'get_iocs', days: 1 }, authKey);
  const data = Array.isArray(json.data) ? json.data : [];
  return data.slice(0, MAX_PER_SOURCE).map((item) => makeSignal({
    id: `threatfox:${item.id}`,
    source: 'threatfox',
    type: 'ioc',
    indicatorType: item.ioc_type,
    indicator: item.ioc,
    title: item.malware_printable ? `${item.malware_printable} infrastructure observed` : `${item.ioc_type_desc || 'IOC'} observed`,
    description: item.threat_type_desc || 'Indicator of compromise reported through ThreatFox.',
    severity: severityFromConfidence(item.confidence_level, item.threat_type),
    confidence: item.confidence_level,
    malware: item.malware_printable || item.malware || null,
    observedAt: item.first_seen,
    firstSeen: item.first_seen,
    lastSeen: item.last_seen,
    tags: Array.isArray(item.tags) ? item.tags : [],
    assessment: 'IOC observed',
    reference: item.reference || null,
    sourceUrl: `https://threatfox.abuse.ch/ioc/${encodeURIComponent(item.id)}/`
  }));
}

async function getMalwareBazaarSignals(authKey) {
  if (!authKey) throw new Error('MALWAREBAZAAR_AUTH_KEY not configured');
  const json = await postJson(MALWAREBAZAAR_URL, { query: 'recent_detections', hours: 24 }, authKey);
  const data = Array.isArray(json.data) ? json.data : [];
  return data.slice(0, MAX_PER_SOURCE).map((item) => {
    const signature = item.signature || 'Unclassified malware';
    return makeSignal({
      id: `malwarebazaar:${item.sha256_hash || item.md5_hash || item.first_seen}`,
      source: 'malwarebazaar',
      type: 'malware',
      indicatorType: 'SHA-256',
      indicator: item.sha256_hash || item.md5_hash || null,
      title: `${signature} detection`,
      description: `${item.file_type || 'File'} malware sample recently labeled by MalwareBazaar.`,
      severity: /stealer|ransom|rat|loader|bot/i.test(signature) ? 'critical' : 'high',
      confidence: 100,
      malware: signature,
      country: item.origin_country || null,
      observedAt: item.first_seen,
      firstSeen: item.first_seen,
      tags: [item.file_type, signature].filter(Boolean),
      assessment: 'Malware detected',
      sourceUrl: `https://bazaar.abuse.ch/sample/${encodeURIComponent(item.sha256_hash || '')}/`
    });
  });
}

async function getUrlhausSignals(authKey) {
  if (!authKey) throw new Error('URLHAUS_AUTH_KEY not configured');
  const text = await fetchText(URLHAUS_RECENT_URL(authKey), { headers: { Accept: 'text/csv' } });
  const rows = parseCsv(text);
  return rows
    .sort((a, b) => String(b.dateadded || '').localeCompare(String(a.dateadded || '')))
    .slice(0, MAX_PER_SOURCE)
    .map((item) => makeSignal({
      id: `urlhaus:${item.id || item.urlid || item.url || item.dateadded}`,
      source: 'urlhaus',
      type: 'malware-url',
      indicatorType: 'URL',
      indicator: item.url || item.host || null,
      title: item.threat ? `${item.threat} malware URL observed` : 'Malware distribution URL observed',
      description: item.url_status ? `URL status: ${item.url_status}.` : 'Malware distribution URL reported by URLhaus.',
      severity: severityFromUrlhaus(item),
      confidence: 100,
      malware: item.threat || null,
      observedAt: item.dateadded || item.last_online,
      firstSeen: item.dateadded,
      lastSeen: item.last_online,
      tags: String(item.tags || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 10),
      assessment: item.url_status === 'online' ? 'Active malware URL' : 'Observed malware URL',
      sourceUrl: item.url || 'https://urlhaus.abuse.ch/'
    }));
}

function sortSignals(signals) {
  const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  return signals.sort((a, b) => {
    const sev = (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    if (sev) return sev;
    return new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime();
  });
}

function dedupeSignals(signals) {
  const seen = new Set();
  return signals.filter((signal) => {
    const key = `${signal.type}|${String(signal.indicator || signal.cve || signal.title).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function runSource(name, fn) {
  try {
    const data = await fn();
    return {
      key: name,
      status: 'online',
      count: data.length,
      signals: data,
      error: null
    };
  } catch (error) {
    return {
      key: name,
      status: 'offline',
      count: 0,
      signals: [],
      error: error?.message || 'Source unavailable'
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = await Promise.all([
    runSource('cisa', getCisaSignals),
    runSource('threatfox', () => getThreatFoxSignals(process.env.THREATFOX_AUTH_KEY)),
    runSource('malwarebazaar', () => getMalwareBazaarSignals(process.env.MALWAREBAZAAR_AUTH_KEY)),
    runSource('urlhaus', () => getUrlhausSignals(process.env.URLHAUS_AUTH_KEY))
  ]);

  const allSignals = dedupeSignals(sortSignals(results.flatMap((result) => result.signals))).slice(0, MAX_OUTPUT);
  const severity = (name) => allSignals.filter((item) => item.severity === name).length;
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const newToday = allSignals.filter((item) => new Date(item.observedAt).getTime() >= todayStart.getTime()).length;

  const online = results.filter((result) => result.status === 'online').length;
  const configured = ['THREATFOX_AUTH_KEY', 'MALWAREBAZAAR_AUTH_KEY', 'URLHAUS_AUTH_KEY'].filter((key) => Boolean(process.env[key])).length + 1;

  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    refreshSeconds: 60,
    mode: 'near-real-time',
    sourceCount: results.length,
    onlineSources: online,
    configuredSources: configured,
    metrics: {
      activeSignals: allSignals.length,
      newToday,
      highRisk: severity('high'),
      critical: severity('critical'),
      medium: severity('medium'),
      low: severity('low')
    },
    sources: results.map(({ signals, ...source }) => ({
      ...source,
      name: SOURCE_META[source.key]?.name || source.key,
      url: SOURCE_META[source.key]?.url || null,
      error: source.error
    })),
    signals: allSignals
  };

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).json(payload);
};
