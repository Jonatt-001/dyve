"use strict";

/*
============================================================
DYVE TECH
DYNAMIC TAXONOMY ENGINE
VERSION: 2.1.0

Routes:

/tech/category/:slug/
/tech/tag/:slug/

Examples:

/tech/category/artificial-intelligence/
/tech/category/developer-tools/
/tech/category/software/

/tech/tag/openai/
/tech/tag/iphone/

SEO OUTPUT:

- Canonical URL
- Dynamic <title>
- Dynamic meta description
- Dynamic H1
- BreadcrumbList schema
- CollectionPage schema
- ItemList schema
- Pagination
- rel="prev"
- rel="next"
- Pagination-aware canonical URLs
- Proper 404 responses
- noindex for 404 / empty taxonomy states
- Canonical alias handling

ARTICLE URL OUTPUT:

/tech/:article-slug.html

Example:

/tech/gemini-37-flash-vs-36-flash-whats-new-for-developers.html

IMPORTANT:

The taxonomy engine MUST use the same canonical
article URL structure as the Dyve Tech article system.

No:

/tech/article/:slug/
/tech/article/:slug/

Yes:

/tech/:slug.html

No dependencies.
No build step.
No manually-created category pages.

Data source:

/assets/tech-articles.json
============================================================
*/


/* =========================================================
   CONFIGURATION
========================================================= */

const ARTICLES_URL =
    "https://www.dyve.online/assets/tech-articles.json";

const SITE_URL =
    "https://www.dyve.online";

const TECH_URL =
    SITE_URL + "/tech/";

const TAXONOMY_API_URL =
    SITE_URL + "/api/tech-taxonomy";

const ARTICLES_PER_PAGE =
    12;


/* =========================================================
   CATEGORY CONFIGURATION
========================================================= */

const CATEGORY_CONFIG = {

    "artificial-intelligence": {

        name:
            "Artificial Intelligence",

        short:
            "AI",

        type:
            "Intelligence",

        color:
            "#a78bfa",

        description:
            "Artificial intelligence, machine learning, generative AI, AI agents, models and the systems turning intelligence into a programmable layer of modern computing."

    },


    "developer-tools": {

        name:
            "Developer Tools",

        short:
            "DEV",

        type:
            "Engineering",

        color:
            "#56d8ff",

        description:
            "Developer tools, APIs, coding agents, programming environments, frameworks and the infrastructure behind modern software engineering."

    },


    "software": {

        name:
            "Software",

        short:
            "SW",

        type:
            "Systems",

        color:
            "#7aa7ff",

        description:
            "Software applications, operating systems, SaaS products, platforms and the engineering decisions behind the digital tools people use."

    },


    "hardware": {

        name:
            "Hardware",

        short:
            "HW",

        type:
            "Hardware",

        color:
            "#ff5c5c",

        description:
            "Processors, chips, semiconductors, computers, electronics and the physical systems powering modern software and intelligent computing."

    },


    "mobile-technology": {

        name:
            "Mobile Technology",

        short:
            "MOB",

        type:
            "Devices",

        color:
            "#f38bc8",

        description:
            "Smartphones, mobile operating systems, applications, device ecosystems and the technologies moving computing beyond the desktop."

    },


    "cloud-infrastructure": {

        name:
            "Cloud & Infrastructure",

        short:
            "CLOUD",

        type:
            "Infrastructure",

        color:
            "#56d8ff",

        description:
            "Cloud platforms, compute, hosting, distributed systems, APIs and the technical foundations behind modern internet services."

    },


    "emerging-technology": {

        name:
            "Emerging Technology",

        short:
            "EMRG",

        type:
            "Frontier",

        color:
            "#ff6a00",

        description:
            "Quantum computing, robotics, advanced networks, frontier computing and new technology paradigms moving toward real-world systems."

    },


    "platforms-products": {

        name:
            "Platforms & Products",

        short:
            "PLAT",

        type:
            "Products",

        color:
            "#f7c948",

        description:
            "Major technology platforms, product launches, ecosystem shifts, strategic moves and the companies building the systems people rely on."

    }

};


/* =========================================================
   CATEGORY ALIASES
========================================================= */

const CATEGORY_ALIASES = {

    "ai":
        "artificial-intelligence",

    "a-i":
        "artificial-intelligence",

    "artificial-intelligence":
        "artificial-intelligence",

    "artificial-intelligence-news":
        "artificial-intelligence",

    "artificial intelligence":
        "artificial-intelligence",

    "machine-learning":
        "artificial-intelligence",

    "machine learning":
        "artificial-intelligence",


    "developer":
        "developer-tools",

    "developers":
        "developer-tools",

    "devtools":
        "developer-tools",

    "developer-tools":
        "developer-tools",

    "developer tools":
        "developer-tools",


    "software":
        "software",

    "software-development":
        "software",

    "software development":
        "software",


    "hardware":
        "hardware",


    "mobile":
        "mobile-technology",

    "mobile-technology":
        "mobile-technology",

    "mobile technology":
        "mobile-technology",

    "smartphones":
        "mobile-technology",


    "cloud":
        "cloud-infrastructure",

    "cloud-infrastructure":
        "cloud-infrastructure",

    "cloud infrastructure":
        "cloud-infrastructure",

    "infrastructure":
        "cloud-infrastructure",


    "emerging":
        "emerging-technology",

    "emerging-technology":
        "emerging-technology",

    "emerging technology":
        "emerging-technology",

    "frontier-technology":
        "emerging-technology",


    "platforms":
        "platforms-products",

    "platforms-products":
        "platforms-products",

    "platforms & products":
        "platforms-products",

    "products":
        "platforms-products"

};


/* =========================================================
   RESPONSE HELPERS
========================================================= */

function sendHTML(
    res,
    status,
    html,
    headers
) {

    res.statusCode =
        status;

    res.setHeader(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=3600"
    );

    res.setHeader(
        "X-Dyve-Taxonomy",
        "dynamic"
    );

    if (headers) {

        Object.keys(headers)
            .forEach(function(key) {

                res.setHeader(
                    key,
                    headers[key]
                );

            });

    }

    res.end(html);
}


function redirect(
    res,
    status,
    location
) {

    res.statusCode =
        status;

    res.setHeader(
        "Location",
        location
    );

    res.setHeader(
        "Cache-Control",
        "public, max-age=3600"
    );

    res.setHeader(
        "X-Dyve-Taxonomy",
        "canonical-redirect"
    );

    res.end();
}


/* =========================================================
   TEXT HELPERS
========================================================= */

function escapeHTML(value) {

    return String(
        value === undefined ||
        value === null
            ? ""
            : value
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeJSONLD(value) {

    return JSON.stringify(
        value
    )
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}


function stripHTML(value) {

    return String(
        value || ""
    )
    .replace(
        /<[^>]*>/g,
        " "
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim();
}


/*
------------------------------------------------------------
CANONICAL ARTICLE SLUG NORMALIZATION

Dyve Tech article slugs intentionally collapse decimal
notation before the normal slugification process.

Example:

3.7 -> 37
3.6 -> 36

This ensures:

"Gemini 3.7 Flash vs 3.6 Flash"

becomes:

"gemini-37-flash-vs-36-flash"

instead of:

"gemini-3-7-flash-vs-3-6-flash"

The transformation is intentionally limited to numeric
decimal separators so normal word boundaries remain intact.
------------------------------------------------------------
*/

function normalizeArticleSlugInput(value) {

    return String(
        value || ""
    )
    .trim()
    .replace(
        /(\d)\.(\d)/g,
        "$1$2"
    );

}


function slugify(value) {

    return String(
        value || ""
    )
    .normalize("NFKD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .toLowerCase()
    .trim()
    .replace(
        /(\d)\.(\d)/g,
        "$1$2"
    )
    .replace(
        /['\u2019\u2018]/g,
        ""
    )
    .replace(
        /&/g,
        " and "
    )
    .replace(
        /[^a-z0-9]+/g,
        "-"
    )
    .replace(
        /^-+|-+$/g,
        "");
}


function titleCaseSlug(value) {

    return String(
        value || ""
    )
    .split("-")
    .filter(Boolean)
    .map(function(word) {

        return (
            word.charAt(0).toUpperCase() +
            word.slice(1)
        );

    })
    .join(" ");
}


function truncate(
    value,
    length
) {

    const text =
        String(
            value || ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

    if (
        text.length <= length
    ) {

        return text;

    }

    return (
        text
        .slice(
            0,
            length
        )
        .replace(
            /\s+\S*$/,
            ""
        )
        .trim() +
        "..."
    );
}


/* =========================================================
   URL HELPERS
========================================================= */

function normalizeSlug(value) {

    let slug =
        String(
            value || ""
        )
        .trim();

    try {

        slug =
            decodeURIComponent(
                slug
            );

    } catch (error) {

        /*
         * Keep the original value if
         * the URL contained malformed
         * percent encoding.
         */

    }

    return slugify(
        slug
    );

}


function categoryCanonicalSlug(
    slug
) {

    const normalized =
        normalizeSlug(
            slug
        );

    return (
        CATEGORY_ALIASES[
            normalized
        ] ||
        normalized
    );

}


function buildTaxonomyPath(
    type,
    slug
) {

    return (
        "/tech/" +
        type +
        "/" +
        encodeURIComponent(
            slug
        ) +
        "/"
    );

}


function buildCanonicalURL(
    type,
    slug,
    page
) {

    const path =
        buildTaxonomyPath(
            type,
            slug
        );

    if (
        page &&
        page > 1
    ) {

        return (
            SITE_URL +
            path +
            "?page=" +
            encodeURIComponent(
                page
            )
        );

    }

    return (
        SITE_URL +
        path
    );

}


function parsePage(
    value
) {

    const page =
        parseInt(
            String(
                value || "1"
            ),
            10
        );

    if (
        !Number.isFinite(page) ||
        page < 1
    ) {

        return 1;

    }

    return page;

}


/* =========================================================
   DATA HELPERS
========================================================= */

function extractArticles(
    payload
) {

    if (
        Array.isArray(
            payload
        )
    ) {

        return payload;

    }

    if (
        payload &&
        typeof payload === "object"
    ) {

        const candidates = [

            payload.articles,

            payload.posts,

            payload.items,

            payload.records,

            payload.data

        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                Array.isArray(
                    candidate
                )
            ) {

                return candidate;

            }

        }

    }

    return [];
}


function firstValue(
    article,
    keys
) {

    for (
        const key
        of keys
    ) {

        const value =
            article &&
            article[key];


        if (
            value !== undefined &&
            value !== null &&
            String(
                value
            ).trim()
        ) {

            return value;

        }

    }

    return "";
}


/* =========================================================
   ARTICLE HELPERS
========================================================= */

function articleTitle(
    article
) {

    return String(
        firstValue(
            article,
            [
                "title",
                "headline",
                "name"
            ]
        )
    ).trim();

}


/*
------------------------------------------------------------
ARTICLE SLUG

Priority:

1. Existing article slug / urlSlug
2. Existing permalink
3. Article title

If the supplied permalink is:

/tech/gemini-37-flash-vs-36-flash-whats-new-for-developers.html

the engine preserves:

gemini-37-flash-vs-36-flash-whats-new-for-developers

It does NOT reconstruct it from the title.

This prevents taxonomy pages from inventing a different
URL than the actual published article URL.
------------------------------------------------------------
*/

function articleSlug(
    article
) {

    const supplied =
        firstValue(
            article,
            [
                "slug",
                "urlSlug",
                "permalink"
            ]
        );


    if (
        supplied
    ) {

        let suppliedString =
            String(
                supplied
            )
            .trim();


        /*
        ----------------------------------------------------
        Absolute URL
        ----------------------------------------------------
        */

        try {

            if (
                /^https?:\/\//i.test(
                    suppliedString
                )
            ) {

                suppliedString =
                    new URL(
                        suppliedString
                    ).pathname;

            }

        } catch (error) {

            /*
             * Fall back to the supplied
             * string if URL parsing fails.
             */

        }


        /*
        ----------------------------------------------------
        Remove query string / hash
        ----------------------------------------------------
        */

        suppliedString =
            suppliedString
                .split("?")[0]
                .split("#")[0];


        /*
        ----------------------------------------------------
        Remove trailing slash
        ----------------------------------------------------
        */

        suppliedString =
            suppliedString.replace(
                /\/+$/g,
                ""
            );


        /*
        ----------------------------------------------------
        Remove .html extension
        ----------------------------------------------------
        */

        suppliedString =
            suppliedString.replace(
                /\.html$/i,
                ""
            );


        /*
        ----------------------------------------------------
        Extract final pathname segment
        ----------------------------------------------------
        */

        suppliedString =
            suppliedString
                .split("/")
                .pop();


        if (
            suppliedString
        ) {

            return slugify(
                normalizeArticleSlugInput(
                    suppliedString
                )
            );

        }

    }


    /*
    --------------------------------------------------------
    FALLBACK TO TITLE
    --------------------------------------------------------
    */

    return slugify(
        normalizeArticleSlugInput(
            articleTitle(
                article
            )
        )
    );

}


/*
------------------------------------------------------------
CANONICAL DYVE TECH ARTICLE URL

IMPORTANT:

This MUST remain aligned with the real article router.

Canonical format:

/tech/:slug.html

Example:

/tech/gemini-37-flash-vs-36-flash-whats-new-for-developers.html

NOT:

/tech/article/:slug/

NOT:

/tech/article/:slug.html
------------------------------------------------------------
*/

function articleURL(
    article
) {

    const slug =
        articleSlug(
            article
        );


    return (
        TECH_URL +
        encodeURIComponent(
            slug
        ) +
        ".html"
    );

}


function articleDescription(
    article
) {

    const value =
        firstValue(
            article,
            [
                "description",
                "excerpt",
                "summary",
                "seoDescription",
                "dek"
            ]
        );


    return truncate(
        stripHTML(
            value
        ),
        190
    );

}


function articleImage(
    article
) {

    const value =
        firstValue(
            article,
            [
                "coverImage",
                "image",
                "imageUrl",
                "featuredImage",
                "thumbnail",
                "cover"
            ]
        );


    if (!value) {

        return "";

    }


    const image =
        String(
            value
        ).trim();


    if (
        /^https?:\/\//i.test(
            image
        )
    ) {

        return image;

    }


    if (
        image.startsWith("/")
    ) {

        return (
            SITE_URL +
            image
        );

    }


    return (
        TECH_URL +
        image.replace(
            /^\.?\//,
            ""
        )
    );

}


function articleDate(
    article
) {

    return firstValue(
        article,
        [
            "publishDate",
            "publishedAt",
            "date",
            "createdAt",
            "updatedAt"
        ]
    );

}


function articleAuthor(
    article
) {

    const value =
        firstValue(
            article,
            [
                "author",
                "authorName",
                "writer"
            ]
        );


    if (
        value &&
        typeof value === "object"
    ) {

        return String(
            value.name ||
            value.displayName ||
            ""
        ).trim();

    }


    return String(
        value ||
        "Dyve Tech"
    ).trim();

}


/* =========================================================
   CATEGORY EXTRACTION
========================================================= */

function articleCategories(
    article
) {

    const raw =
        firstValue(
            article,
            [
                "category",
                "categories",
                "section",
                "topic",
                "beat"
            ]
        );


    if (
        Array.isArray(
            raw
        )
    ) {

        return raw
            .map(function(item) {

                if (
                    item &&
                    typeof item === "object"
                ) {

                    return (
                        item.name ||
                        item.title ||
                        item.slug ||
                        ""
                    );

                }

                return String(
                    item || ""
                );

            })
            .map(function(item) {

                return String(
                    item
                ).trim();

            })
            .filter(Boolean);

    }


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(",")
            .map(function(item) {

                return item.trim();

            })
            .filter(Boolean);

    }


    return [];
}


/* =========================================================
   TAG EXTRACTION
========================================================= */

function articleTags(
    article
) {

    const raw =
        firstValue(
            article,
            [
                "tags",
                "tag",
                "keywords"
            ]
        );


    if (
        Array.isArray(
            raw
        )
    ) {

        return raw
            .map(function(item) {

                if (
                    item &&
                    typeof item === "object"
                ) {

                    return (
                        item.name ||
                        item.title ||
                        item.slug ||
                        ""
                    );

                }

                return String(
                    item || ""
                );

            })
            .map(function(item) {

                return String(
                    item
                ).trim();

            })
            .filter(Boolean);

    }


    if (
        typeof raw === "string"
    ) {

        return raw
            .split(",")
            .map(function(item) {

                return item.trim();

            })
            .filter(Boolean);

    }


    return [];
}


/* =========================================================
   CATEGORY MATCHING
========================================================= */

function categoryMatches(
    article,
    slug
) {

    const categories =
        articleCategories(
            article
        );


    return categories.some(
        function(category) {

            return (
                slugify(
                    CATEGORY_ALIASES[
                        String(
                            category
                        )
                        .trim()
                        .toLowerCase()
                    ] ||
                    category
                ) === slug
            );

        }
    );

}


/* =========================================================
   TAG MATCHING
========================================================= */

function tagMatches(
    article,
    slug
) {

    const tags =
        articleTags(
            article
        );


    return tags.some(
        function(tag) {

            return (
                slugify(
                    tag
                ) === slug
            );

        }
    );

}


/* =========================================================
   SORT
========================================================= */

function sortArticles(
    articles
) {

    return articles.sort(
        function(a, b) {

            const dateA =
                new Date(
                    articleDate(a) || 0
                ).getTime();


            const dateB =
                new Date(
                    articleDate(b) || 0
                ).getTime();


            return (
                dateB -
                dateA
            );

        }
    );

}


/* =========================================================
   TAG DISCOVERY
========================================================= */

function findTag(
    articles,
    slug
) {

    for (
        const article
        of articles
    ) {

        const tags =
            articleTags(
                article
            );


        for (
            const tag
            of tags
        ) {

            if (
                slugify(
                    tag
                ) === slug
            ) {

                return tag;

            }

        }

    }


    return null;

}


/* =========================================================
   PAGE CALCULATIONS
========================================================= */

function paginate(
    articles,
    page
) {

    const total =
        articles.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                ARTICLES_PER_PAGE
            )
        );


    const safePage =
        Math.min(
            Math.max(
                page,
                1
            ),
            totalPages
        );


    const start =
        (
            safePage -
            1
        ) *
        ARTICLES_PER_PAGE;


    const end =
        start +
        ARTICLES_PER_PAGE;


    return {

        items:
            articles.slice(
                start,
                end
            ),

        page:
            safePage,

        totalPages:
            totalPages,

        total:
            total,

        start:
            start,

        end:
            Math.min(
                end,
                total
            )

    };

}


/* =========================================================
   CSS
========================================================= */

function pageCSS(
    accent
) {

    return `
:root{
    --black:#070707;
    --black-2:#0a0a0a;
    --panel:#111111;
    --white:#f4f2ed;
    --white-2:#dedbd4;
    --soft:#aaa7a0;
    --muted:#77746e;
    --muted-2:#55534f;
    --line:rgba(255,255,255,.09);
    --line-soft:rgba(255,255,255,.055);
    --line-strong:rgba(255,255,255,.15);
    --orange:#ff6a00;
    --accent:${accent};
    --display:Audiowide,Inter,sans-serif;
    --body:Inter,system-ui,sans-serif;
    --tech:Space Grotesk,Inter,sans-serif;
}

*{
    box-sizing:border-box;
}

html{
    background:var(--black);
    color-scheme:dark;
    scroll-behavior:smooth;
}

body{
    margin:0;
    min-height:100vh;
    overflow-x:hidden;
    color:var(--white);
    background:
        radial-gradient(
            circle at 50% -20%,
            rgba(255,255,255,.025),
            transparent 32%
        ),
        linear-gradient(
            180deg,
            #080808 0%,
            #070707 50%,
            #050505 100%
        );
    font-family:var(--body);
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
}

body::before{
    content:"";
    position:fixed;
    inset:0;
    z-index:-1;
    pointer-events:none;
    opacity:.35;
    background-image:
        linear-gradient(
            rgba(255,255,255,.022) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(255,255,255,.022) 1px,
            transparent 1px
        );
    background-size:52px 52px;
    mask-image:
        linear-gradient(
            to bottom,
            black,
            transparent 100%
        );
}

a{
    color:inherit;
    text-decoration:none;
}

.wrap{
    width:min(
        calc(100% - 30px),
        1240px
    );
    margin:auto;
}

.system-bar{
    height:31px;
    display:flex;
    align-items:center;
    border-bottom:1px solid var(--line-soft);
    background:#0b0b0b;
    overflow:hidden;
}

.system-inner{
    width:min(
        calc(100% - 30px),
        1240px
    );
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:15px;
}

.system-left,
.system-right{
    display:flex;
    align-items:center;
    gap:10px;
    color:var(--muted);
    font-family:var(--tech);
    font-size:7px;
    letter-spacing:.08em;
    text-transform:uppercase;
    white-space:nowrap;
}

.system-mark{
    width:6px;
    height:6px;
    flex:0 0 6px;
    border-radius:50%;
    background:var(--accent);
    box-shadow:
        0 0 12px var(--accent);
}

.live{
    color:var(--accent);
}

header{
    position:sticky;
    top:0;
    z-index:100;
    border-bottom:1px solid var(--line);
    background:rgba(7,7,7,.90);
    backdrop-filter:blur(22px);
    -webkit-backdrop-filter:blur(22px);
}

.header-inner{
    width:min(
        calc(100% - 30px),
        1240px
    );
    min-height:67px;
    margin:auto;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:15px;
}

.brand{
    display:flex;
    align-items:center;
    gap:8px;
    font-family:var(--display);
    font-size:13px;
    letter-spacing:.055em;
}

.brand-mark{
    width:25px;
    height:25px;
    display:grid;
    place-items:center;
    border:1px solid var(--accent);
    background:rgba(255,255,255,.02);
    color:var(--accent);
    transform:rotate(45deg);
}

.brand-mark span{
    transform:rotate(-45deg);
}

.brand-tech{
    color:var(--muted);
}

.header-index{
    display:flex;
    align-items:center;
    gap:7px;
    color:var(--muted);
    font-family:var(--tech);
    font-size:7px;
    letter-spacing:.07em;
    text-transform:uppercase;
}

.header-index strong{
    color:var(--white);
}

main{
    padding:18px 0 90px;
}

.breadcrumb{
    display:flex;
    align-items:center;
    gap:7px;
    flex-wrap:wrap;
    color:var(--muted-2);
    font-family:var(--tech);
    font-size:7px;
    text-transform:uppercase;
    letter-spacing:.05em;
}

.breadcrumb a:hover{
    color:var(--accent);
}

.breadcrumb-current{
    color:var(--soft);
}

.hero{
    position:relative;
    min-height:470px;
    display:flex;
    align-items:center;
    padding:70px 0 55px;
    border-bottom:1px solid var(--line);
    overflow:hidden;
}

.hero::before{
    content:"";
    position:absolute;
    width:520px;
    height:520px;
    right:-210px;
    top:-170px;
    border:1px solid var(--accent);
    opacity:.18;
    border-radius:50%;
    box-shadow:
        0 0 0 45px rgba(255,255,255,.012),
        0 0 0 90px rgba(255,255,255,.008);
}

.hero-content{
    position:relative;
    z-index:2;
    max-width:950px;
}

.hero-code{
    display:flex;
    align-items:center;
    gap:10px;
    color:var(--accent);
    font-family:var(--tech);
    font-size:8px;
    font-weight:700;
    letter-spacing:.14em;
    text-transform:uppercase;
}

.hero-code::before{
    content:"";
    width:26px;
    height:1px;
    background:var(--accent);
}

.hero-kicker{
    margin-top:17px;
    color:var(--muted);
    font-family:var(--tech);
    font-size:9px;
    letter-spacing:.15em;
    text-transform:uppercase;
}

h1{
    max-width:1000px;
    margin:12px 0 0;
    font-family:var(--display);
    font-size:clamp(
        2.7rem,
        10vw,
        7rem
    );
    font-weight:400;
    line-height:.91;
    letter-spacing:-.075em;
    text-transform:uppercase;
}

h1 span{
    display:block;
    color:var(--accent);
}

.hero-description{
    max-width:700px;
    margin:25px 0 0;
    color:var(--soft);
    font-size:11px;
    line-height:1.8;
}

.hero-meta{
    display:flex;
    flex-wrap:wrap;
    margin-top:35px;
    border-top:1px solid var(--line);
    border-bottom:1px solid var(--line);
}

.meta-box{
    min-width:105px;
    padding:14px 17px;
    border-right:1px solid var(--line);
}

.meta-number{
    color:var(--white);
    font-family:var(--display);
    font-size:20px;
}

.meta-label{
    margin-top:4px;
    color:var(--muted);
    font-family:var(--tech);
    font-size:6px;
    letter-spacing:.08em;
    text-transform:uppercase;
}

.index-head{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    gap:20px;
    padding:43px 0 17px;
}

.index-code{
    color:var(--accent);
    font-family:var(--tech);
    font-size:7px;
    font-weight:700;
    letter-spacing:.12em;
    text-transform:uppercase;
}

.index-title{
    margin:9px 0 0;
    font-family:var(--tech);
    font-size:clamp(
        1.5rem,
        5vw,
        2.7rem
    );
    font-weight:500;
    line-height:1;
    letter-spacing:-.05em;
}

.index-description{
    max-width:650px;
    margin-top:9px;
    color:var(--muted);
    font-size:9px;
    line-height:1.7;
}

.article-count{
    text-align:right;
    color:var(--muted);
    font-family:var(--tech);
    font-size:6px;
    letter-spacing:.08em;
    text-transform:uppercase;
}

.article-count strong{
    display:block;
    color:var(--white);
    font-family:var(--display);
    font-size:24px;
}

.article-list{
    border-top:1px solid var(--line);
}

.article-card{
    display:grid;
    grid-template-columns:100px 1fr;
    gap:16px;
    padding:15px 0;
    border-bottom:1px solid var(--line);
}

.article-image{
    width:100px;
    height:75px;
    display:block;
    object-fit:cover;
    border:1px solid var(--line);
    background:#101010;
}

.article-image-placeholder{
    width:100px;
    height:75px;
    display:grid;
    place-items:center;
    border:1px solid var(--line);
    color:var(--accent);
    background:#101010;
    font-family:var(--tech);
    font-size:7px;
}

.article-category{
    color:var(--accent);
    font-family:var(--tech);
    font-size:6px;
    font-weight:700;
    letter-spacing:.1em;
    text-transform:uppercase;
}

.article-title{
    margin:6px 0 0;
    color:var(--white);
    font-family:var(--tech);
    font-size:17px;
    font-weight:500;
    line-height:1.08;
    letter-spacing:-.035em;
}

.article-title a:hover{
    color:var(--accent);
}

.article-excerpt{
    margin:7px 0 0;
    color:var(--muted);
    font-size:8px;
    line-height:1.6;
}

.article-meta{
    display:flex;
    flex-wrap:wrap;
    gap:9px;
    margin-top:9px;
    color:var(--muted-2);
    font-family:var(--tech);
    font-size:6px;
    letter-spacing:.05em;
    text-transform:uppercase;
}

.article-meta span + span::before{
    content:"/";
    margin-right:9px;
}

.empty{
    padding:60px 20px;
    border:1px solid var(--line);
    text-align:center;
}

.empty-code{
    color:var(--accent);
    font-family:var(--tech);
    font-size:7px;
    letter-spacing:.12em;
}

.empty h2{
    margin:13px 0 0;
    font-family:var(--tech);
    font-size:24px;
    font-weight:500;
}

.empty p{
    max-width:500px;
    margin:10px auto 0;
    color:var(--muted);
    font-size:9px;
    line-height:1.7;
}

.pagination{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    flex-wrap:wrap;
    padding:28px 0 0;
}

.pagination-link{
    min-width:38px;
    height:36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:0 10px;
    border:1px solid var(--line);
    color:var(--muted);
    background:#0c0c0c;
    font-family:var(--tech);
    font-size:7px;
    font-weight:700;
    letter-spacing:.06em;
    text-transform:uppercase;
}

.pagination-link:hover{
    color:var(--accent);
    border-color:var(--accent);
}

.pagination-link.active{
    color:#070707;
    border-color:var(--accent);
    background:var(--accent);
}

.pagination-link.disabled{
    opacity:.35;
    pointer-events:none;
}

.pagination-info{
    margin:0 8px;
    color:var(--muted-2);
    font-family:var(--tech);
    font-size:6px;
    letter-spacing:.08em;
    text-transform:uppercase;
}

footer{
    border-top:1px solid var(--line);
    background:#050505;
}

.footer-inner{
    width:min(
        calc(100% - 30px),
        1240px
    );
    margin:auto;
    padding:35px 0 40px;
}

.footer-brand{
    font-family:var(--display);
    font-size:16px;
}

.footer-brand span{
    color:var(--accent);
}

.footer-description{
    max-width:520px;
    margin:9px 0 0;
    color:var(--muted);
    font-size:8px;
    line-height:1.7;
}

.footer-bottom{
    display:flex;
    justify-content:space-between;
    gap:15px;
    margin-top:30px;
    padding-top:14px;
    border-top:1px solid var(--line-soft);
    color:var(--muted-2);
    font-family:var(--tech);
    font-size:6px;
    letter-spacing:.05em;
    text-transform:uppercase;
}

@media(min-width:700px){

    .article-card{
        grid-template-columns:180px 1fr;
        gap:24px;
        padding:20px 0;
    }

    .article-image,
    .article-image-placeholder{
        width:180px;
        height:115px;
    }

    .article-title{
        font-size:22px;
    }

}

@media(min-width:801px){

    .wrap,
    .header-inner,
    .system-inner,
    .footer-inner{
        width:min(
            calc(100% - 48px),
            1240px
        );
    }

    .hero{
        min-height:570px;
        padding:95px 0 70px;
    }

    .hero-description{
        font-size:12px;
    }

}

@media(max-width:420px){

    .system-right{
        display:none;
    }

    .header-index{
        display:none;
    }

    .hero{
        min-height:440px;
        padding-top:50px;
    }

    h1{
        font-size:2.65rem;
    }

    .hero-description{
        font-size:10px;
    }

    .index-head{
        flex-direction:column;
        align-items:flex-start;
    }

    .article-count{
        text-align:left;
    }

    .article-count strong{
        display:inline;
        margin-right:5px;
        font-size:17px;
    }

    .pagination-info{
        width:100%;
        margin:5px 0;
        text-align:center;
    }

    .footer-bottom{
        flex-direction:column;
    }

}
`;
}


/* =========================================================
   ARTICLE CARD RENDERER
========================================================= */

function renderArticle(
    article,
    globalIndex
) {

    const title =
        articleTitle(
            article
        ) ||
        "Untitled technology article";


    const url =
        articleURL(
            article
        );


    const description =
        articleDescription(
            article
        );


    const image =
        articleImage(
            article
        );


    const date =
        articleDate(
            article
        );


    const author =
        articleAuthor(
            article
        );


    const categories =
        articleCategories(
            article
        );


    const category =
        categories[0] ||
        "Technology";


    const imageHTML =
        image

            ? `
<img
    class="article-image"
    src="${escapeHTML(image)}"
    alt="${escapeHTML(title)}"
    loading="lazy"
    decoding="async"
>
`

            : `
<div
    class="article-image-placeholder"
    aria-hidden="true"
>
    DYVE / TECH
</div>
`;


    return `
<article
    class="article-card"
    data-position="${globalIndex}"
>

    <a
        href="${escapeHTML(url)}"
        aria-label="${escapeHTML(title)}"
    >
        ${imageHTML}
    </a>

    <div>

        <div class="article-category">
            ${escapeHTML(category)}
        </div>

        <h2 class="article-title">

            <a
                href="${escapeHTML(url)}"
            >
                ${escapeHTML(title)}
            </a>

        </h2>

        ${
            description
                ? `
        <p class="article-excerpt">
            ${escapeHTML(description)}
        </p>
        `
                : ""
        }

        <div class="article-meta">

            <span>
                ${escapeHTML(author)}
            </span>

            ${
                date
                    ? `
            <span>
                ${escapeHTML(
                    formatDate(
                        date
                    )
                )}
            </span>
            `
                    : ""
            }

        </div>

    </div>

</article>
`;
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    value
) {

    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return new Intl.DateTimeFormat(
        "en",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric"
        }
    ).format(
        date
    );

}


/* =========================================================
   PAGINATION HTML
========================================================= */

function renderPagination(
    type,
    slug,
    pagination
) {

    if (
        pagination.totalPages <= 1
    ) {

        return "";

    }


    const page =
        pagination.page;

    const totalPages =
        pagination.totalPages;


    let html =
        '<nav class="pagination" aria-label="Pagination">';


    if (
        page > 1
    ) {

        html += `
<a
    class="pagination-link"
    rel="prev"
    href="${escapeHTML(
        buildTaxonomyPath(
            type,
            slug
        ) +
        (
            page - 1 > 1
                ? "?page=" +
                    (page - 1)
                : ""
        )
    )}"
>
    Previous
</a>
`;

    } else {

        html += `
<span
    class="pagination-link disabled"
    aria-disabled="true"
>
    Previous
</span>
`;

    }


    const start =
        Math.max(
            1,
            page - 2
        );


    const end =
        Math.min(
            totalPages,
            page + 2
        );


    if (
        start > 1
    ) {

        html += `
<a
    class="pagination-link"
    href="${escapeHTML(
        buildTaxonomyPath(
            type,
            slug
        )
    )}"
>
    1
</a>
`;

        if (
            start > 2
        ) {

            html += `
<span
    class="pagination-info"
>
    ...
</span>
`;

        }

    }


    for (
        let i = start;
        i <= end;
        i++
    ) {

        const href =
            buildTaxonomyPath(
                type,
                slug
            ) +
            (
                i > 1
                    ? "?page=" +
                        i
                    : ""
            );


        html += `

<a
    class="pagination-link ${
        i === page
            ? "active"
            : ""
    }"
    href="${escapeHTML(
        href
    )}"
    ${
        i === page
            ? 'aria-current="page"'
            : ""
    }
>
    ${i}
</a>

`;

    }


    if (
        end < totalPages
    ) {

        if (
            end < totalPages - 1
        ) {

            html += `
<span
    class="pagination-info"
>
    ...
</span>
`;

        }


        html += `
<a
    class="pagination-link"
    href="${escapeHTML(
        buildTaxonomyPath(
            type,
            slug
        ) +
        "?page=" +
        totalPages
    )}"
>
    ${totalPages}
</a>
`;

    }


    if (
        page < totalPages
    ) {

        html += `
<a
    class="pagination-link"
    rel="next"
    href="${escapeHTML(
        buildTaxonomyPath(
            type,
            slug
        ) +
        "?page=" +
        (page + 1)
    )}"
>
    Next
</a>
`;

    } else {

        html += `
<span
    class="pagination-link disabled"
    aria-disabled="true"
>
    Next
</span>
`;

    }


    html += `

<span class="pagination-info">

    PAGE
    ${page}
    /
    ${totalPages}

</span>

</nav>
`;


    return html;

}


/* =========================================================
   PAGINATION HEAD LINKS
========================================================= */

function renderPaginationHead(
    type,
    slug,
    pagination
) {

    let html = "";


    if (
        pagination.page > 1
    ) {

        const previousURL =
            buildCanonicalURL(
                type,
                slug,
                pagination.page - 1
            );


        html += `
<link
    rel="prev"
    href="${escapeHTML(
        previousURL
    )}"
>
`;

    }


    if (
        pagination.page <
        pagination.totalPages
    ) {

        const nextURL =
            buildCanonicalURL(
                type,
                slug,
                pagination.page + 1
            );


        html += `
<link
    rel="next"
    href="${escapeHTML(
        nextURL
    )}"
>
`;

    }


    return html;

}


/* =========================================================
   JSON-LD SCHEMA
========================================================= */

function renderSchemas(
    options
) {

    const {
        type,
        slug,
        name,
        description,
        canonical,
        pagination
    } = options;


    const isTag =
        type === "tag";


    const itemList =
        pagination.items.map(
            function(article, index) {

                return {

                    "@type":
                        "ListItem",

                    "position":
                        pagination.start +
                        index +
                        1,

                    "url":
                        articleURL(
                            article
                        ),

                    "name":
                        articleTitle(
                            article
                        )

                };

            }
        );


    const collectionPage = {

        "@context":
            "https://schema.org",

        "@type":
            "CollectionPage",

        "@id":
            canonical +
            "#collection",

        "name":
            name +
            (
                isTag
                    ? " Tag"
                    : " Technology Category"
            ),

        "url":
            canonical,

        "description":
            description,

        "isPartOf":{

            "@type":
                "WebSite",

            "name":
                "Dyve",

            "url":
                SITE_URL +
                "/"

        },

        "publisher":{

            "@type":
                "Organization",

            "name":
                "Dyve Tech",

            "url":
                TECH_URL

        },

        "mainEntity":{

            "@type":
                "ItemList",

            "@id":
                canonical +
                "#itemlist",

            "name":
                name +
                " Articles",

            "numberOfItems":
                pagination.total,

            "itemListElement":
                itemList

        }

    };


    const breadcrumb = {

        "@context":
            "https://schema.org",

        "@type":
            "BreadcrumbList",

        "itemListElement":[

            {

                "@type":
                    "ListItem",

                "position":
                    1,

                "name":
                    "Dyve",

                "item":
                    SITE_URL +
                    "/"

            },

            {

                "@type":
                    "ListItem",

                "position":
                    2,

                "name":
                    "Dyve Tech",

                "item":
                    TECH_URL

            },

            {

                "@type":
                    "ListItem",

                "position":
                    3,

                "name":
                    isTag
                        ? "Tags"
                        : "Categories",

                "item":
                    SITE_URL +
                    "/tech/" +
                    (
                        isTag
                            ? "tags/"
                            : "categories.html"
                    )

            },

            {

                "@type":
                    "ListItem",

                "position":
                    4,

                "name":
                    name,

                "item":
                    canonical

            }

        ]

    };


    return [

        escapeJSONLD(
            collectionPage
        ),

        escapeJSONLD(
            breadcrumb
        )

    ];

}


/* =========================================================
   PAGE RENDERER
========================================================= */

function renderPage(
    options
) {

    const {

        type,

        slug,

        name,

        description,

        pagination,

        accent

    } = options;


    const canonical =
        buildCanonicalURL(
            type,
            slug,
            pagination.page
        );


    const isTag =
        type === "tag";


    const pageSuffix =
        pagination.page > 1
            ? " - Page " +
                pagination.page
            : "";


    const pageTitle =
        name +
        (
            isTag
                ? " Tag"
                : " Technology"
        ) +
        pageSuffix +
        " | Dyve Tech";


    const pageDescription =
        truncate(
            (
                description +
                (
                    pagination.page > 1
                        ? (
                            " Page " +
                            pagination.page +
                            " of the latest indexed articles."
                        )
                        : ""
                )
            ),
            155
        );


    const robots =
        pagination.total > 0
            ? "index,follow,max-image-preview:large"
            : "noindex,follow";


    const schemas =
        renderSchemas({

            type,

            slug,

            name,

            description:
                pageDescription,

            canonical,

            pagination

        });


    const articleHTML =
        pagination.items.length

            ? pagination.items
                .map(
                    function(
                        article,
                        index
                    ) {

                        return renderArticle(
                            article,
                            pagination.start +
                            index +
                            1
                        );

                    }
                )
                .join("")

            : `
<div class="empty">

    <div class="empty-code">
        INDEX / EMPTY
    </div>

    <h2>
        No articles indexed yet.
    </h2>

    <p>
        This ${
            isTag
                ? "tag"
                : "technology category"
        }
        exists in the Dyve Tech taxonomy, but no published
        articles currently match it.
    </p>

</div>
`;


    return `
<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1,viewport-fit=cover"
>

<title>
    ${escapeHTML(
        pageTitle
    )}
</title>

<meta
    name="description"
    content="${escapeHTML(
        pageDescription
    )}"
>

<meta
    name="robots"
    content="${robots}"
>

<link
    rel="canonical"
    href="${escapeHTML(
        canonical
    )}"
>

${renderPaginationHead(
    type,
    slug,
    pagination
)}

<meta
    name="theme-color"
    content="#070707"
>

<meta
    name="color-scheme"
    content="dark"
>


<meta
    property="og:type"
    content="website"
>

<meta
    property="og:title"
    content="${escapeHTML(
        pageTitle
    )}"
>

<meta
    property="og:description"
    content="${escapeHTML(
        pageDescription
    )}"
>

<meta
    property="og:url"
    content="${escapeHTML(
        canonical
    )}"
>

<meta
    property="og:site_name"
    content="Dyve Tech"
>


<meta
    name="twitter:card"
    content="summary_large_image"
>

<meta
    name="twitter:title"
    content="${escapeHTML(
        pageTitle
    )}"
>

<meta
    name="twitter:description"
    content="${escapeHTML(
        pageDescription
    )}"
>


<link
    rel="preconnect"
    href="https://fonts.googleapis.com"
>

<link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
>

<link
    href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
>


<script type="application/ld+json">
${schemas[0]}
</script>


<script type="application/ld+json">
${schemas[1]}
</script>


<style>

${pageCSS(
    accent
)}

</style>

</head>


<body>


<div class="system-bar">

    <div class="system-inner">

        <div class="system-left">

            <span class="system-mark"></span>

            <span>
                DYVE TECH / EDITORIAL SYSTEM
            </span>

            <span class="live">
                LIVE
            </span>

        </div>


        <div class="system-right">

            <span>
                TECHNOLOGY INTELLIGENCE
            </span>

            <span>
                / 2026
            </span>

        </div>

    </div>

</div>


<header>

    <div class="header-inner">

        <a
            href="/tech/"
            class="brand"
            aria-label="Dyve Tech home"
        >

            <span class="brand-mark">
                <span>+</span>
            </span>

            <span>
                DYVE
            </span>

            <span class="brand-tech">
                TECH
            </span>

        </a>


        <div class="header-index">

            <span>
                INDEX
            </span>

            <strong>
                ${pagination.total}
            </strong>

        </div>

    </div>

</header>


<main>

<div class="wrap">


    <nav
        class="breadcrumb"
        aria-label="Breadcrumb"
    >

        <a href="/">
            Dyve
        </a>

        <span>/</span>

        <a href="/tech/">
            Tech
        </a>

        <span>/</span>

        <span>

            ${
                isTag
                    ? "Tag"
                    : "Category"
            }

        </span>

        <span>/</span>

        <span class="breadcrumb-current">

            ${escapeHTML(
                name
            )}

        </span>

    </nav>


    <section class="hero">

        <div class="hero-content">

            <div class="hero-code">

                ${
                    isTag
                        ? "TAXONOMY / TAG"
                        : "TAXONOMY / CATEGORY"
                }

            </div>


            <div class="hero-kicker">

                Dyve Tech /
                Technology Intelligence

            </div>


            <h1>

                ${
                    isTag
                        ? "Tag"
                        : "Technology"
                }

                <span>
                    ${escapeHTML(
                        name
                    )}
                </span>

            </h1>


            <p class="hero-description">

                ${escapeHTML(
                    pageDescription
                )}

            </p>


            <div class="hero-meta">


                <div class="meta-box">

                    <div class="meta-number">

                        ${pagination.total}

                    </div>

                    <div class="meta-label">
                        Indexed Articles
                    </div>

                </div>


                <div class="meta-box">

                    <div class="meta-number">

                        ${
                            isTag
                                ? "TAG"
                                : "BEAT"
                        }

                    </div>

                    <div class="meta-label">
                        Taxonomy Type
                    </div>

                </div>


                <div class="meta-box">

                    <div class="meta-number">

                        ${pagination.page}
                        /
                        ${pagination.totalPages}

                    </div>

                    <div class="meta-label">
                        Archive Page
                    </div>

                </div>


            </div>

        </div>

    </section>


    <section>


        <div class="index-head">

            <div>

                <div class="index-code">
                    01 / ARTICLE INDEX
                </div>


                <h2 class="index-title">
                    Latest intelligence.
                </h2>


                <p class="index-description">

                    Published Dyve Tech articles indexed
                    under this ${
                        isTag
                            ? "tag"
                            : "technology category"
                    }.
                    The archive updates automatically as new
                    stories are published.

                </p>

            </div>


            <div class="article-count">

                <strong>

                    ${String(
                        pagination.total
                    ).padStart(
                        2,
                        "0"
                    )}

                </strong>

                Articles

            </div>

        </div>


        <div
            class="article-list"
            aria-live="polite"
        >

            ${articleHTML}

        </div>


        ${renderPagination(
            type,
            slug,
            pagination
        )}

    </section>


</div>

</main>


<footer>

    <div class="footer-inner">

        <div class="footer-brand">
            DYVE<span>TECH</span>
        </div>


        <p class="footer-description">

            Technology news, product intelligence and
            analysis from Dyve Tech.

        </p>


        <div class="footer-bottom">

            <span>
                © ${
                    new Date()
                        .getFullYear()
                }
                DYVE TECH
            </span>

            <span>
                TECHNOLOGY INTELLIGENCE
            </span>

        </div>

    </div>

</footer>


</body>

</html>
`;

}


/* =========================================================
   404 PAGE
========================================================= */

function render404(
    type,
    slug
) {

    const taxonomyName =
        type === "tag"
            ? "Tag"
            : "Category";


    return `
<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1"
>

<title>
    ${taxonomyName} Not Found | Dyve Tech
</title>

<meta
    name="robots"
    content="noindex,follow"
>

<meta
    name="description"
    content="The requested Dyve Tech taxonomy page could not be found."
>

<meta
    name="theme-color"
    content="#070707"
>

<style>

*{
    box-sizing:border-box;
}

html,
body{
    margin:0;
    min-height:100%;
}

body{
    min-height:100vh;
    display:grid;
    place-items:center;
    padding:25px;
    background:#070707;
    color:#f4f2ed;
    font-family:Inter,system-ui,sans-serif;
    text-align:center;
}

div{
    width:min(
        100%,
        650px
    );
    padding:45px 25px;
    border:1px solid rgba(255,255,255,.09);
    background:#0b0b0b;
}

.code{
    color:#ff6a00;
    font-family:monospace;
    font-size:11px;
    letter-spacing:.15em;
}

h1{
    margin:18px 0 0;
    font-family:Space Grotesk,sans-serif;
    font-size:clamp(
        2rem,
        8vw,
        4rem
    );
    line-height:1;
}

p{
    max-width:500px;
    margin:16px auto 0;
    color:#77746e;
    font-size:13px;
    line-height:1.7;
}

a{
    display:inline-flex;
    margin-top:25px;
    min-height:42px;
    align-items:center;
    padding:0 15px;
    border:1px solid rgba(255,106,0,.35);
    color:#ff6a00;
    background:rgba(255,106,0,.06);
    font-family:Space Grotesk,sans-serif;
    font-size:11px;
    font-weight:700;
    text-decoration:none;
    text-transform:uppercase;
    letter-spacing:.06em;
}

</style>

</head>

<body>

<div>

    <div class="code">
        DYVE TECH / 404
    </div>

    <h1>
        ${taxonomyName} Not Found
    </h1>

    <p>
        The requested ${
            taxonomyName.toLowerCase()
        }
        <strong>
            ${escapeHTML(
                titleCaseSlug(
                    slug
                )
            )}
        </strong>
        does not exist in the Dyve Tech taxonomy.
    </p>

    <a href="/tech/">
        Return to Dyve Tech
    </a>

</div>

</body>

</html>
`;

}


/* =========================================================
   ERROR PAGE
========================================================= */

function render500() {

    return `
<!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta
    name="robots"
    content="noindex,follow"
>

<title>
    Dyve Tech | Temporary Error
</title>

<style>

body{
    margin:0;
    min-height:100vh;
    display:grid;
    place-items:center;
    padding:20px;
    background:#070707;
    color:#f4f2ed;
    font-family:Inter,system-ui,sans-serif;
    text-align:center;
}

div{
    max-width:600px;
    padding:35px;
}

h1{
    font-family:Space Grotesk,sans-serif;
}

p{
    color:#77746e;
    line-height:1.7;
}

a{
    color:#ff6a00;
}

</style>

</head>

<body>

<div>

<h1>
    Technology index temporarily unavailable.
</h1>

<p>
    Dyve Tech could not load the article index.
    Please try again shortly.
</p>

<a href="/tech/">
    Return to Dyve Tech
</a>

</div>

</body>

</html>
`;

}


/* =========================================================
   MAIN HANDLER
========================================================= */

module.exports =
async function handler(
    req,
    res
) {

    try {

        const query =
            req.query ||
            {};


        /*
        ------------------------------------------------------
        TAXONOMY TYPE
        ------------------------------------------------------
        */

        const type =
            String(
                query.type ||
                "category"
            )
            .toLowerCase()
            .trim();


        if (
            type !== "category" &&
            type !== "tag"
        ) {

            sendHTML(
                res,
                404,
                render404(
                    type,
                    ""
                )
            );

            return;

        }


        /*
        ------------------------------------------------------
        SLUG
        ------------------------------------------------------
        */

        let slug =
            normalizeSlug(
                query.slug ||
                ""
            );


        /*
        ------------------------------------------------------
        EMPTY SLUG
        ------------------------------------------------------
        */

        if (!slug) {

            sendHTML(
                res,
                404,
                render404(
                    type,
                    slug
                )
            );

            return;

        }


        /*
        ------------------------------------------------------
        CANONICAL CATEGORY ALIAS
        ------------------------------------------------------
        */

        if (
            type === "category"
        ) {

            const canonicalSlug =
                categoryCanonicalSlug(
                    slug
                );


            /*
             * If /ai/ is requested,
             * redirect to:
             *
             * /artificial-intelligence/
             *
             * This consolidates SEO signals.
             */

            if (
                canonicalSlug !==
                slug
            ) {

                const target =
                    buildTaxonomyPath(
                        "category",
                        canonicalSlug
                    );


                const page =
                    parsePage(
                        query.page
                    );


                const location =
                    page > 1
                        ? target +
                            "?page=" +
                            page
                        : target;


                redirect(
                    res,
                    301,
                    location
                );

                return;

            }


            slug =
                canonicalSlug;

        }


        /*
        ------------------------------------------------------
        PAGE
        ------------------------------------------------------
        */

        const requestedPage =
            parsePage(
                query.page
            );


        /*
        ------------------------------------------------------
        LOAD ARTICLE DATA
        ------------------------------------------------------
        */

        const response =
            await fetch(
                ARTICLES_URL,
                {
                    headers:{
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Article database returned HTTP " +
                response.status
            );

        }


        const payload =
            await response.json();


        const allArticles =
            extractArticles(
                payload
            );


        /*
        ------------------------------------------------------
        MATCH ARTICLES
        ------------------------------------------------------
        */

        let matchedArticles =
            [];


        if (
            type === "category"
        ) {

            matchedArticles =
                allArticles.filter(
                    function(article) {

                        return categoryMatches(
                            article,
                            slug
                        );

                    }
                );

        } else {

            matchedArticles =
                allArticles.filter(
                    function(article) {

                        return tagMatches(
                            article,
                            slug
                        );

                    }
                );

        }


        matchedArticles =
            sortArticles(
                matchedArticles
            );


        /*
        ------------------------------------------------------
        CATEGORY VALIDATION
        ------------------------------------------------------
        */

        let name;
        let description;
        let accent;


        if (
            type === "category"
        ) {

            /*
             * Categories are controlled
             * editorial taxonomy entities.
             *
             * Unknown category slug =
             * actual 404.
             */

            const config =
                CATEGORY_CONFIG[
                    slug
                ];


            if (!config) {

                sendHTML(
                    res,
                    404,
                    render404(
                        type,
                        slug
                    )
                );

                return;

            }


            name =
                config.name;


            description =
                config.description;


            accent =
                config.color;

        }


        /*
        ------------------------------------------------------
        TAG VALIDATION
        ------------------------------------------------------
        */

        if (
            type === "tag"
        ) {

            /*
             * Tags are data-driven.
             *
             * If no article currently carries
             * this tag, the tag does not exist.
             */

            const discoveredTag =
                findTag(
                    allArticles,
                    slug
                );


            if (
                !discoveredTag
            ) {

                sendHTML(
                    res,
                    404,
                    render404(
                        type,
                        slug
                    )
                );

                return;

            }


            name =
                discoveredTag;


            description =
                "Explore Dyve Tech articles, analysis and technology intelligence related to " +
                name +
                ". Follow the latest developments, products, systems and ideas indexed under this technology tag.";


            accent =
                "#ff6a00";

        }


        /*
        ------------------------------------------------------
        PAGINATION
        ------------------------------------------------------
        */

        const pagination =
            paginate(
                matchedArticles,
                requestedPage
            );


        /*
        ------------------------------------------------------
        PAGE OUT OF RANGE
        ------------------------------------------------------
        */

        if (
            matchedArticles.length > 0 &&
            requestedPage >
                pagination.totalPages
        ) {

            /*
             * A page that cannot exist should not
             * silently render the final page.
             *
             * Return 404.
             */

            sendHTML(
                res,
                404,
                render404(
                    type,
                    slug
                )
            );

            return;

        }


        /*
        ------------------------------------------------------
        KNOWN TAXONOMY WITH ZERO ARTICLES
        ------------------------------------------------------
        */

        if (
            matchedArticles.length === 0
        ) {

            /*
             * The taxonomy entity is known,
             * therefore this is NOT a 404.
             *
             * But there is no useful content to index.
             *
             * The renderer therefore emits:
             *
             * 200
             * noindex,follow
             */

        }


        /*
        ------------------------------------------------------
        RENDER PAGE
        ------------------------------------------------------
        */

        const html =
            renderPage({

                type:

                    type,

                slug:

                    slug,

                name:

                    name,

                description:

                    description,

                pagination:

                    pagination,

                accent:

                    accent

            });


        /*
        ------------------------------------------------------
        SEND
        ------------------------------------------------------
        */

        sendHTML(
            res,
            200,
            html
        );


    } catch (error) {

        console.error(
            "Dyve Tech taxonomy error:",
            error
        );


        sendHTML(
            res,
            500,
            render500()
        );

    }

};