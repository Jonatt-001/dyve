/**
 * Dyve HackaX - Live Threat Signal Aggregator
 * Vercel Serverless Function
 *
 * Expected environment variables:
 *   THREATFOX_AUTH_KEY
 *   MALWAREBAZAAR_AUTH_KEY
 *   URLHAUS_AUTH_KEY
 *
 * CISA KEV does not require an API key.
 */

const CISA_URL =
  'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

const THREATFOX_URL =
  'https://threatfox-api.abuse.ch/api/v1/';

const MALWAREBAZAAR_URL =
  'https://mb-api.abuse.ch/api/v1/';

const URLHAUS_URL =
  'https://urlhaus-api.abuse.ch/v1/urls/recent/limit/100/';

const SOURCE_LIMIT = 45;

const CISA_LOOKBACK_DAYS = 90;

const THREATFOX_DAYS = 3;

const MALWAREBAZAAR_HOURS = 2;

const REQUEST_TIMEOUT_MS = 9000;

const MEMORY_CACHE_MS = 60000;

let memoryCache = null;

const sourceDefinitions = [
  {
    key: 'cisa',
    name: 'CISA KEV'
  },
  {
    key: 'threatfox',
    name: 'ThreatFox'
  },
  {
    key: 'malwarebazaar',
    name: 'MalwareBazaar'
  },
  {
    key: 'urlhaus',
    name: 'URLhaus'
  }
];


/* ============================================================
   RESPONSE HELPERS
============================================================ */

function json(res, status, body, headers = {}) {
  res.status(status);

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  res.setHeader(
    'Content-Type',
    'application/json; charset=utf-8'
  );

  res.send(JSON.stringify(body));
}


/* ============================================================
   GENERAL HELPERS
============================================================ */

function nowIso() {
  return new Date().toISOString();
}


function safeString(value) {
  return value == null ? '' : String(value).trim();
}


function parseDate(value) {
  if (!value) return null;

  const raw = safeString(value);

  const normalized = raw
    .replace(/ UTC$/i, 'Z')
    .replace(' ', 'T');

  const time = Date.parse(normalized);

  if (Number.isNaN(time)) {
    return null;
  }

  return new Date(time).toISOString();
}


function daysAgoIso(days) {
  return new Date(
    Date.now() - days * 86400000
  ).toISOString();
}


function uniqueStrings(values) {
  return [
    ...new Set(
      (values || [])
        .map(safeString)
        .filter(Boolean)
    )
  ];
}


function sha256(value) {
  const crypto = require('crypto');

  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex');
}


function makeId(source, key) {
  return `${source}:${sha256(key).slice(0, 24)}`;
}


function cleanUrl(value) {
  const raw = safeString(value);

  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw);

    if (
      ![
        'http:',
        'https:'
      ].includes(url.protocol)
    ) {
      return '';
    }

    return url.toString();
  } catch (_) {
    return '';
  }
}


/* ============================================================
   NETWORK
============================================================ */

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      ...options,

      signal: controller.signal,

      headers: {
        Accept: 'application/json',

        'User-Agent':
          'Dyve-HackaX-Threat-Intelligence/1.0',

        ...(options.headers || {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
}


async function readJson(response) {
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error(
      `Invalid JSON response (${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Upstream HTTP ${response.status}`
    );
  }

  return data;
}


/* ============================================================
   SOURCE STATUS
============================================================ */

function emptySource(
  key,
  error,
  configured = true
) {
  const definition =
    sourceDefinitions.find(
      item => item.key === key
    );

  return {
    key,

    name:
      definition
        ? definition.name
        : key,

    status: 'offline',

    count: 0,

    error:
      error ||
      'Source unavailable',

    configured
  };
}


function onlineSource(
  key,
  count
) {
  const definition =
    sourceDefinitions.find(
      item => item.key === key
    );

  return {
    key,

    name:
      definition
        ? definition.name
        : key,

    status: 'online',

    count: Number(count || 0),

    error: null,

    configured: true
  };
}


/* ============================================================
   CISA KEV
============================================================ */

function normalizeCisa(item) {
  const cve =
    safeString(
      item.vulnerabilityName
    );

  const vendor =
    safeString(
      item.vendorProject
    );

  const product =
    safeString(
      item.product
    );

  const title =
    [
      vendor,
      product
    ]
      .filter(Boolean)
      .join(' - ') ||
    cve ||
    'Known exploited vulnerability';

  const observedAt =
    parseDate(item.dateAdded) ||
    nowIso();

  const ransomware =
    safeString(
      item.knownRansomwareCampaignUse
    ).toLowerCase() === 'known';

  /*
   * CISA KEV itself does not assign a universal
   * "critical/high" severity field.
   *
   * This is HackaX presentation-level priority:
   * known ransomware use -> critical
   * otherwise -> high.
   */

  const severity =
    ransomware
      ? 'critical'
      : 'high';

  return {
    id: makeId(
      'cisa',
      cve ||
        `${vendor}:${product}:${item.dateAdded}`
    ),

    source: 'cisa',

    sourceName: 'CISA KEV',

    type: 'vulnerability',

    severity,

    title,

    description:
      safeString(
        item.shortDescription
      ) ||
      'Known exploited vulnerability listed in the CISA Known Exploited Vulnerabilities catalog.',

    indicator: cve,

    indicatorType: 'CVE',

    cve,

    vendor,

    product,

    malware: '',

    country: '',

    confidence: 100,

    observedAt,

    assessment:
      ransomware
        ? 'Known exploited · ransomware use reported'
        : 'Known exploited',

    ransomware:
      ransomware
        ? 'Known'
        : '',

    reference:
      cve
        ? `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve)}`
        : 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',

    sourceUrl:
      'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',

    tags: uniqueStrings([
      vendor,
      product,
      'known exploited',
      ransomware
        ? 'ransomware'
        : ''
    ]),

    correlationKey:
      cve
        ? `cve:${cve.toLowerCase()}`
        : ''
  };
}


async function fetchCisa() {
  const response =
    await fetchWithTimeout(
      CISA_URL,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json'
        }
      }
    );

  const data =
    await readJson(response);

  const vulnerabilities =
    Array.isArray(
      data.vulnerabilities
    )
      ? data.vulnerabilities
      : [];

  const cutoff =
    daysAgoIso(
      CISA_LOOKBACK_DAYS
    );

  const signals =
    vulnerabilities
      .map(normalizeCisa)

      .filter(
        signal =>
          signal.observedAt >= cutoff
      )

      .sort(
        (a, b) =>
          Date.parse(b.observedAt) -
          Date.parse(a.observedAt)
      )

      .slice(
        0,
        SOURCE_LIMIT
      );

  return {
    signals,

    source:
      onlineSource(
        'cisa',
        signals.length
      )
  };
}


/* ============================================================
   THREATFOX
============================================================ */

async function fetchThreatFox() {
  const key =
    process.env.THREATFOX_AUTH_KEY;

  if (!key) {
    return {
      signals: [],

      source:
        emptySource(
          'threatfox',
          'API key not configured',
          false
        )
    };
  }

  const response =
    await fetchWithTimeout(
      THREATFOX_URL,
      {
        method: 'POST',

        headers: {
          'Auth-Key': key,

          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          query: 'get_iocs',

          days: THREATFOX_DAYS
        })
      }
    );

  const data =
    await readJson(response);

  if (
    data.query_status !== 'ok'
  ) {
    throw new Error(
      `ThreatFox query status: ${
        safeString(
          data.query_status
        ) || 'unknown'
      }`
    );
  }

  const rows =
    Array.isArray(data.data)
      ? data.data
      : [];

  const signals =
    rows

      .map(item => {
        const ioc =
          safeString(item.ioc);

        const malware =
          safeString(
            item.malware_printable ||
            item.malware
          );

        const confidence =
          Number(
            item.confidence_level
          );

        let severity = 'medium';

        if (
          Number.isFinite(confidence) &&
          confidence >= 85
        ) {
          severity = 'high';
        } else if (
          Number.isFinite(confidence) &&
          confidence < 50
        ) {
          severity = 'low';
        }

        return {
          id: makeId(
            'threatfox',

            safeString(item.id) ||
              `${ioc}:${item.first_seen}`
          ),

          source: 'threatfox',

          sourceName: 'ThreatFox',

          type: 'ioc',

          severity,

          title:
            malware
              ? `${malware} — ${
                  safeString(
                    item.ioc_type_desc ||
                    item.ioc_type ||
                    'IOC'
                  )
                }`
              : `ThreatFox ${
                  safeString(
                    item.ioc_type ||
                    'IOC'
                  )
                }`,

          description:
            safeString(
              item.threat_type_desc
            ) ||
            'Indicator of compromise reported through ThreatFox.',

          indicator: ioc,

          indicatorType:
            safeString(
              item.ioc_type ||
              'IOC'
            ),

          cve: '',

          vendor: '',

          product: '',

          malware,

          country: '',

          confidence:
            Number.isFinite(confidence)
              ? confidence
              : null,

          observedAt:
            parseDate(
              item.first_seen
            ) ||
            nowIso(),

          assessment:
            safeString(
              item.threat_type_desc
            ) ||
            'Observed IOC',

          ransomware: '',

          reference:
            cleanUrl(
              item.reference
            ) ||
            `https://threatfox.abuse.ch/ioc/${encodeURIComponent(
              safeString(item.id)
            )}/`,

          sourceUrl:
            'https://threatfox.abuse.ch/',

          tags: uniqueStrings([
            ...(Array.isArray(item.tags)
              ? item.tags
              : []),

            item.threat_type,

            item.ioc_type,

            malware
          ]),

          correlationKey:
            ioc
              ? `ioc:${ioc.toLowerCase()}`
              : ''
        };
      })

      .filter(
        signal =>
          signal.indicator
      );

  signals.sort(
    (a, b) =>
      Date.parse(b.observedAt) -
      Date.parse(a.observedAt)
  );

  return {
    signals:
      signals.slice(
        0,
        SOURCE_LIMIT
      ),

    source:
      onlineSource(
        'threatfox',
        Math.min(
          signals.length,
          SOURCE_LIMIT
        )
      )
  };
}


/* ============================================================
   MALWAREBAZAAR
============================================================ */

async function fetchMalwareBazaar() {
  const key =
    process.env.MALWAREBAZAAR_AUTH_KEY;

  if (!key) {
    return {
      signals: [],

      source:
        emptySource(
          'malwarebazaar',
          'API key not configured',
          false
        )
    };
  }

  const body =
    new URLSearchParams({
      query:
        'recent_detections',

      hours:
        String(
          MALWAREBAZAAR_HOURS
        )
    });

  const response =
    await fetchWithTimeout(
      MALWAREBAZAAR_URL,
      {
        method: 'POST',

        headers: {
          'Auth-Key': key,

          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body:
          body.toString()
      }
    );

  const data =
    await readJson(response);

  if (
    data.query_status !== 'ok'
  ) {
    throw new Error(
      `MalwareBazaar query status: ${
        safeString(
          data.query_status
        ) || 'unknown'
      }`
    );
  }

  const rows =
    Array.isArray(data.data)
      ? data.data
      : [];

  const signals =
    rows

      .map(item => {
        const hash =
          safeString(
            item.sha256_hash ||
            item.sha1_hash ||
            item.md5_hash
          );

        const malware =
          safeString(
            item.signature
          );

        const title =
          malware ||
          safeString(
            item.file_name
          ) ||
          'Malware sample detected';

        return {
          id: makeId(
            'malwarebazaar',

            hash ||
              `${item.file_name}:${item.first_seen}`
          ),

          source:
            'malwarebazaar',

          sourceName:
            'MalwareBazaar',

          type:
            'malware',

          severity:
            malware
              ? 'high'
              : 'medium',

          title,

          description:
            malware
              ? `MalwareBazaar recently labeled a sample as ${malware}.`
              : 'A recent malware sample was added to MalwareBazaar without a family label.',

          indicator: hash,

          indicatorType:
            hash.length === 64
              ? 'SHA256'
              : hash.length === 40
                ? 'SHA1'
                : 'MD5',

          cve: '',

          vendor: '',

          product: '',

          malware,

          country:
            safeString(
              item.origin_country
            ),

          confidence:
            malware
              ? 100
              : null,

          observedAt:
            parseDate(
              item.first_seen
            ) ||
            nowIso(),

          assessment:
            malware
              ? 'Malware family labeled'
              : 'Malware sample observed',

          ransomware: '',

          reference:
            hash
              ? `https://bazaar.abuse.ch/sample/${encodeURIComponent(
                  hash
                )}/`
              : 'https://bazaar.abuse.ch/',

          sourceUrl:
            'https://bazaar.abuse.ch/',

          tags: uniqueStrings([
            ...(Array.isArray(item.tags)
              ? item.tags
              : []),

            item.file_type,

            malware
          ]),

          correlationKey:
            hash
              ? `hash:${hash.toLowerCase()}`
              : ''
        };
      })

      .filter(
        signal =>
          signal.indicator
      );

  signals.sort(
    (a, b) =>
      Date.parse(b.observedAt) -
      Date.parse(a.observedAt)
  );

  return {
    signals:
      signals.slice(
        0,
        SOURCE_LIMIT
      ),

    source:
      onlineSource(
        'malwarebazaar',
        Math.min(
          signals.length,
          SOURCE_LIMIT
        )
      )
  };
}


/* ============================================================
   URLHAUS
============================================================ */

async function fetchUrlhaus() {
  const key =
    process.env.URLHAUS_AUTH_KEY;

  if (!key) {
    return {
      signals: [],

      source:
        emptySource(
          'urlhaus',
          'API key not configured',
          false
        )
    };
  }

  const response =
    await fetchWithTimeout(
      URLHAUS_URL,
      {
        method: 'GET',

        headers: {
          'Auth-Key': key
        }
      }
    );

  const data =
    await readJson(response);

  if (
    data.query_status !== 'ok'
  ) {
    throw new Error(
      `URLhaus query status: ${
        safeString(
          data.query_status
        ) || 'unknown'
      }`
    );
  }

  const rows =
    Array.isArray(data.urls)
      ? data.urls
      : [];

  const signals =
    rows

      .map(item => {
        const url =
          safeString(
            item.url
          );

        const status =
          safeString(
            item.url_status
          ).toLowerCase();

        const tags =
          Array.isArray(item.tags)
            ? item.tags
            : [];

        const malware =
          tags.find(
            tag =>
              /^(win|elf|android|linux|mirai|emotet|heodo|agent|ransom)/i.test(
                String(tag)
              )
          ) || '';

        return {
          id: makeId(
            'urlhaus',

            safeString(item.id) ||
              url
          ),

          source:
            'urlhaus',

          sourceName:
            'URLhaus',

          type:
            'malware-url',

          severity:
            status === 'online'
              ? 'high'
              : 'medium',

          title:
            safeString(
              item.host
            )
              ? `${safeString(
                  item.host
                )} — Malicious URL`
              : 'Malicious URL observed',

          description:
            `URLhaus tracks this URL as malware distribution infrastructure${
              status
                ? ` (${status})`
                : ''
            }. `,

          indicator:
            url,

          indicatorType:
            'URL',

          cve: '',

          vendor: '',

          product: '',

          malware,

          country: '',

          confidence:
            status === 'online'
              ? 100
              : 90,

          observedAt:
            parseDate(
              item.date_added
            ) ||
            nowIso(),

          assessment:
            status === 'online'
              ? 'Active malware infrastructure'
              : 'Known malware infrastructure',

          ransomware: '',

          reference:
            cleanUrl(
              item.urlhaus_reference
            ) ||
            'https://urlhaus.abuse.ch/',

          sourceUrl:
            'https://urlhaus.abuse.ch/',

          tags: uniqueStrings([
            ...tags,

            item.threat,

            status
          ]),

          correlationKey:
            url
              ? `url:${url.toLowerCase()}`
              : ''
        };
      })

      .filter(
        signal =>
          signal.indicator
      );

  signals.sort(
    (a, b) =>
      Date.parse(b.observedAt) -
      Date.parse(a.observedAt)
  );

  return {
    signals:
      signals.slice(
        0,
        SOURCE_LIMIT
      ),

    source:
      onlineSource(
        'urlhaus',
        Math.min(
          signals.length,
          SOURCE_LIMIT
        )
      )
  };
}


/* ============================================================
   CROSS-SOURCE CORRELATION
============================================================ */

function correlate(signals) {
  const groups =
    new Map();

  for (const signal of signals) {
    if (!signal.correlationKey) {
      continue;
    }

    if (
      !groups.has(
        signal.correlationKey
      )
    ) {
      groups.set(
        signal.correlationKey,
        []
      );
    }

    groups
      .get(
        signal.correlationKey
      )
      .push(signal);
  }

  for (const signal of signals) {
    const matches =
      signal.correlationKey
        ? groups.get(
            signal.correlationKey
          ) || []
        : [];

    const sourceNames =
      uniqueStrings(
        matches.map(
          item =>
            item.sourceName
        )
      );

    signal.correlatedSources =
      sourceNames;

    signal.correlationCount =
      sourceNames.length;
  }

  return signals;
}


/* ============================================================
   METRICS
============================================================ */

function buildMetrics(signals) {
  const todayStart =
    new Date();

  todayStart.setUTCHours(
    0,
    0,
    0,
    0
  );

  const todayTime =
    todayStart.getTime();

  return {
    activeSignals:
      signals.length,

    newToday:
      signals.filter(
        signal => {
          const time =
            Date.parse(
              signal.observedAt
            );

          return (
            !Number.isNaN(time) &&
            time >= todayTime
          );
        }
      ).length,

    highRisk:
      signals.filter(
        signal =>
          signal.severity === 'high'
      ).length,

    critical:
      signals.filter(
        signal =>
          signal.severity === 'critical'
      ).length,

    medium:
      signals.filter(
        signal =>
          signal.severity === 'medium'
      ).length,

    low:
      signals.filter(
        signal =>
          signal.severity === 'low'
      ).length
  };
}


/* ============================================================
   AGGREGATION
============================================================ */

async function aggregate() {
  const jobs = [
    [
      'cisa',
      fetchCisa
    ],

    [
      'threatfox',
      fetchThreatFox
    ],

    [
      'malwarebazaar',
      fetchMalwareBazaar
    ],

    [
      'urlhaus',
      fetchUrlhaus
    ]
  ];

  const results =
    await Promise.all(
      jobs.map(
        async ([key, fn]) => {
          try {
            return await fn();
          } catch (error) {
            return {
              signals: [],

              source:
                emptySource(
                  key,
                  'Upstream source unavailable'
                )
            };
          }
        }
      )
    );

  const signals =
    correlate(
      results
        .flatMap(
          result =>
            result.signals || []
        )
        .sort(
          (a, b) =>
            Date.parse(
              b.observedAt
            ) -
            Date.parse(
              a.observedAt
            )
        )
    );

  const sources =
    results.map(
      result =>
        result.source
    );

  const onlineSources =
    sources.filter(
      source =>
        source.status ===
        'online'
    ).length;

  return {
    ok: true,

    generatedAt:
      nowIso(),

    sourceCount:
      sources.length,

    onlineSources,

    sources,

    metrics:
      buildMetrics(
        signals
      ),

    signals
  };
}


/* ============================================================
   VERCEL HANDLER
============================================================ */

module.exports =
  async function handler(
    req,
    res
  ) {
    const commonHeaders = {
      'Access-Control-Allow-Origin':
        '*',

      'Access-Control-Allow-Methods':
        'GET, OPTIONS',

      'Access-Control-Allow-Headers':
        'Content-Type, Accept',

      'Cache-Control':
        'public, s-maxage=60, stale-while-revalidate=300'
    };


    /* --------------------------------------------------------
       PREFLIGHT
    -------------------------------------------------------- */

    if (
      req.method ===
      'OPTIONS'
    ) {
      res.status(204);

      Object.entries(
        commonHeaders
      ).forEach(
        ([key, value]) => {
          res.setHeader(
            key,
            value
          );
        }
      );

      return res.end();
    }


    /* --------------------------------------------------------
       METHOD
    -------------------------------------------------------- */

    if (
      req.method !==
      'GET'
    ) {
      return json(
        res,
        405,
        {
          ok: false,

          error:
            'Method not allowed'
        },
        commonHeaders
      );
    }


    /* --------------------------------------------------------
       WARM INSTANCE CACHE
    -------------------------------------------------------- */

    const now =
      Date.now();

    if (
      memoryCache &&
      now -
        memoryCache.timestamp <
        MEMORY_CACHE_MS
    ) {
      return json(
        res,
        200,
        memoryCache.data,
        commonHeaders
      );
    }


    /* --------------------------------------------------------
       AGGREGATE
    -------------------------------------------------------- */

    try {
      const data =
        await aggregate();

      memoryCache = {
        timestamp: now,

        data
      };

      return json(
        res,
        200,
        data,
        commonHeaders
      );
    } catch (_) {
      return json(
        res,
        502,
        {
          ok: false,

          error:
            'The HackaX intelligence aggregation layer is temporarily unavailable.'
        },
        commonHeaders
      );
    }
  };