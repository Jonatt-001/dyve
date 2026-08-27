/* HackaX Publisher Engine v2
   Shared onboarding state, media pipeline, SEO, intelligence classification,
   internal linking, GitHub publishing and sitemap generation.
*/
(function(){
"use strict";

const HAX = window.HackaX = {};
const STORAGE = {
    settings: "dyve-hackax-settings",
    drafts: "dyve-hackax-drafts",
    edit: "dyve-hackax-edit-article",
    publisher: "dyve-hackax-publisher-v2"
};

const DEFAULTS = {
    githubRepo: "",
    githubToken: "",
    githubBranch: "main",
    siteUrl: "https://www.dyve.online",
    articleDb: "assets/articles.json",
    sitemap: "hackax-sitemap.xml",
    newsSitemap: "hackax-news-sitemap.xml",
    imageSitemap: "hackax-image-sitemap.xml",
    minWords: 500,
    targetH2: 2,
    targetLinks: 2,
    metaMin: 140,
    autoAlt: true,
    autoLinks: true,
    cloudName: "dxdbn6xwy",
    uploadPreset: "geefox_unsigned",
    cloudEndpoint: "https://api.cloudinary.com/v1_1/dxdbn6xwy/image/upload"
};

const CATEGORIES = {
    general: "General Updates",
    breach: "Data Breach",
    "dark-web": "Dark Web Intelligence",
    ransomware: "Ransomware Intelligence",
    "threat-actors": "Threat Actors",
    signals: "Threat Signals",
    analysis: "Threat Analysis",
    vulnerability: "Vulnerability Intelligence",
    malware: "Malware Intelligence",
    advisory: "Security Advisory",
    research: "Research & Investigation",
    explainer: "Security Explainer"
};

const CATEGORY_ROUTES = {
    general: "updates",
    breach: "breaches",
    "dark-web": "dark-web",
    ransomware: "ransomware",
    "threat-actors": "threat-actors",
    signals: "signals",
    analysis: "analysis",
    vulnerability: "vulnerabilities",
    malware: "malware",
    advisory: "advisories",
    research: "research",
    explainer: "explainer"
};

const CONTENT_TYPES = [
    ["update", "General Update"],
    ["breaking", "Breaking Intelligence"],
    ["incident", "Incident Report"],
    ["analysis", "Threat Analysis"],
    ["research", "Research / Investigation"],
    ["advisory", "Security Advisory"],
    ["explainer", "Security Explainer"],
    ["brief", "Intelligence Brief"]
];

const INTEL_TAGS = [
    "CRITICAL","HIGH PRIORITY","LIVE INTEL","DARK WEB","ACTIVE THREAT",
    "VERIFIED","BREACH DATA","RANSOMWARE","APT GROUP","ZERO-DAY","IOCs",
    "TTPs","THREAT ACTOR","INFRASTRUCTURE","MALWARE","PHISHING","EXPLOIT",
    "VULNERABILITY","GENERAL UPDATE","SECURITY ADVISORY"
];

const THREAT_DOMAINS = [
    "Ransomware","Malware","Phishing","Credential Theft","Data Breach",
    "Data Leak","Vulnerability","Exploitation","Zero-Day","Dark Web",
    "Cyber Espionage","APT","Supply Chain","DDoS","Botnet","Cloud Security",
    "Identity & Access","Infrastructure","Web Security","Mobile Security",
    "IoT / OT","Social Engineering","Insider Threat","Financial Crime"
];

const META_STATUSES = [
    "Active Threat","Verified Intel","Operational Guide","Under Investigation",
    "Mitigated / Resolved","Emerging Threat","Critical Alert",
    "Historical Data","Routine Update"
];

const SEVERITIES = ["Informational","Low","Medium","High","Critical"];
const VERIFICATION = ["Unverified","Partially Verified","Corroborated","Verified"];
const CONFIDENCE = ["Low","Moderate","High"];

const STOPWORDS = new Set(("a an and are as at be been being by can could did do does for from had has have he her here hers him his how i if in into is it its just me more most my no not of on or our ours she should so than that the their theirs them then there these they this those through to under up us was we were what when where which who why will with would you your yours about above after again against all also among any because before below between both but during each few further itself once other over own same some such too very according across actually almost already although another around away back became become becoming behind beside besides beyond certain clearly despite down especially even ever every everything first following four found general generally given going good great however important including instead known last later less likely many maybe might much near nearly never new next often only otherwise particular perhaps possible probably recent really right several since still sure taken than though together toward towards usually using various well while within without").split(/\s+/));

let state = null;
let existingArticles = [];
let currentStage = 1;
let autosaveTimer = null;
let quill = null;
let currentImageJob = null;

function safeJSON(value, fallback){
    try{
        return JSON.parse(value);
    }catch(e){
        return fallback;
    }
}

function esc(value){
    return String(value == null ? "" : value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
}

function attr(value){ return esc(value); }

function b64(value){
    const bytes = new TextEncoder().encode(String(value));
    let binary = "";
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

function unb64(value){
    const binary = atob(String(value || "").replace(/\s/g,""));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function toast(message, type){
    const el = document.getElementById("toast");
    if(!el) return;
    el.textContent = message;
    el.classList.remove("hidden","toast-success","toast-error","toast-info");
    el.classList.add(type === "error" ? "toast-error" : type === "success" ? "toast-success" : "toast-info");
    clearTimeout(window.__hackaxToast);
    window.__hackaxToast = setTimeout(() => el.classList.add("hidden"), 3600);
}

function slugify(value){
    return String(value || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g,"")
        .replace(/\s+/g,"-")
        .replace(/-+/g,"-")
        .replace(/^-|-$/g,"")
        .slice(0,120);
}

function unique(arr){
    return [...new Set(arr.filter(Boolean))];
}

function cleanText(value){
    return String(value || "")
        .replace(/<[^>]*>/g," ")
        .replace(/&nbsp;/gi," ")
        .replace(/\s+/g," ")
        .trim();
}

function tokenize(value){
    return cleanText(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g," ")
        .split(/\s+/)
        .filter(Boolean);
}

function meaningfulTokens(value){
    return unique(
        tokenize(value).filter(x =>
            x.length >= 4 &&
            !STOPWORDS.has(x) &&
            !/^\d+$/.test(x)
        )
    );
}

function cfg(){
    const saved = safeJSON(localStorage.getItem(STORAGE.settings) || "{}", {});
    const merged = {...DEFAULTS, ...(saved && typeof saved === "object" ? saved : {})};
    return {
        ...merged,
        siteUrl: String(merged.siteUrl || DEFAULTS.siteUrl).replace(/\/+$/,""),
        githubRepo: String(merged.githubRepo || "").trim().replace(/^https?:\/\/github\.com\//i,"").replace(/\.git$/i,"").replace(/^\/+|\/+$/g,""),
        githubBranch: String(merged.githubBranch || "main").trim() || "main"
    };
}

function freshState(){
    return {
        version: 2,
        id: crypto.randomUUID(),
        article: {
            title: "",
            slug: "",
            summary: "",
            contentHtml: "",
            contentDelta: null,
            tags: []
        },
        media: {
            featured: null,
            body: []
        },
        classification: {
            contentType: "update",
            category: "general",
            domains: [],
            intelTag: "GENERAL UPDATE",
            status: "Routine Update",
            severity: "Informational",
            verification: "Verified",
            confidence: "Moderate",
            destination: "homepage"
        },
        intelligence: {
            actors: [],
            malware: [],
            cves: [],
            techniques: [],
            iocs: []
        },
        seo: {
            title: "",
            description: "",
            canonical: "",
            ogPrompt: ""
        },
        linking: {
            selected: [],
            applied: 0
        },
        technical: {
            index: true,
            follow: true
        },
        workflow: {
            currentStage: 1,
            completed: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
}

function normalizeState(input){
    const base = freshState();
    if(!input || typeof input !== "object") return base;
    const merged = {
        ...base,
        ...input,
        article: {...base.article, ...(input.article || {})},
        media: {...base.media, ...(input.media || {})},
        classification: {...base.classification, ...(input.classification || {})},
        intelligence: {...base.intelligence, ...(input.intelligence || {})},
        seo: {...base.seo, ...(input.seo || {})},
        linking: {...base.linking, ...(input.linking || {})},
        technical: {...base.technical, ...(input.technical || {})},
        workflow: {...base.workflow, ...(input.workflow || {})}
    };
    merged.article.tags = Array.isArray(merged.article.tags) ? merged.article.tags : [];
    merged.classification.domains = Array.isArray(merged.classification.domains) ? merged.classification.domains : [];
    merged.intelligence.actors = Array.isArray(merged.intelligence.actors) ? merged.intelligence.actors : [];
    merged.intelligence.malware = Array.isArray(merged.intelligence.malware) ? merged.intelligence.malware : [];
    merged.intelligence.cves = Array.isArray(merged.intelligence.cves) ? merged.intelligence.cves : [];
    merged.intelligence.techniques = Array.isArray(merged.intelligence.techniques) ? merged.intelligence.techniques : [];
    merged.intelligence.iocs = Array.isArray(merged.intelligence.iocs) ? merged.intelligence.iocs : [];
    merged.linking.selected = Array.isArray(merged.linking.selected) ? merged.linking.selected : [];
    merged.workflow.completed = Array.isArray(merged.workflow.completed) ? merged.workflow.completed : [];
    return merged;
}

function saveState(immediate){
    if(!state) return;
    state.workflow.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE.publisher, JSON.stringify(state));
    if(immediate) renderGlobalProgress();
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        if(state) localStorage.setItem(STORAGE.publisher, JSON.stringify(state));
        updateSaveIndicator();
    }, immediate ? 0 : 450);
    updateSaveIndicator();
}

function updateSaveIndicator(){
    const el = document.getElementById("saveState");
    if(!el) return;
    el.textContent = "Saved " + new Date(state.workflow.updatedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    el.classList.remove("hidden");
}

function renderGlobalProgress(){
    const step = document.getElementById("stageCounter");
    if(step) step.textContent = "STEP " + currentStage + " OF 8";
    const title = document.getElementById("stageTitle");
    if(title){
        const names = ["Article","Media","Classification","Intelligence","SEO","Internal Linking","Technical","Review"];
        title.textContent = names[currentStage - 1] || "Publisher";
    }
    document.querySelectorAll("[data-stage]").forEach(el => {
        const n = Number(el.dataset.stage);
        el.classList.toggle("stage-current", n === currentStage);
        el.classList.toggle("stage-complete", state.workflow.completed.includes(n));
    });
}

function goStage(n){
    n = Number(n);
    if(!Number.isFinite(n) || n < 1 || n > 8) return;
    saveCurrentPage();
    if(n > currentStage + 1 && !state.workflow.completed.includes(n - 1)){
        toast("Complete the current stage before jumping ahead.", "error");
        return;
    }
    currentStage = n;
    state.workflow.currentStage = n;
    saveState(true);
    const file = ["index.html","hackax-next2.html","hackax-next3.html","hackax-next4.html","hackax-next5.html","hackax-next6.html","hackax-next7.html","hackax-overview.html"][n-1];
    if(!location.pathname.endsWith(file)){
        location.href = file;
    }else{
        window.dispatchEvent(new CustomEvent("hackax:stage"));
    }
}

function completeStage(n){
    if(!state.workflow.completed.includes(n)){
        state.workflow.completed.push(n);
        state.workflow.completed.sort((a,b)=>a-b);
    }
    saveState(true);
}

function nextStage(){
    saveCurrentPage();
    const result = validateStage(currentStage);
    renderValidation(result);
    if(!result.ok){
        toast(result.message, "error");
        return;
    }
    completeStage(currentStage);
    goStage(Math.min(8, currentStage + 1));
}

function previousStage(){
    saveCurrentPage();
    goStage(Math.max(1, currentStage - 1));
}

function validateStage(stage){
    if(stage === 1){
        const title = state.article.title.trim();
        const body = cleanText(state.article.contentHtml);
        if(!title) return {ok:false,message:"Add an article title first."};
        if(body.length < 100) return {ok:false,message:"Add at least 100 characters of substantive article content before continuing."};
        return {ok:true};
    }
    if(stage === 2){
        if(!state.media.featured || !state.media.featured.url) return {ok:false,message:"Upload and process a featured image before continuing."};
        if(!state.media.featured.alt) return {ok:false,message:"Featured image alt text is required."};
        if(!state.media.featured.watermarked) return {ok:false,message:"The featured image must be watermarked before continuing."};
        return {ok:true};
    }
    if(stage === 3){
        if(!state.classification.category || !CATEGORIES[state.classification.category]) return {ok:false,message:"Select a valid HackaX category."};
        if(!state.classification.contentType) return {ok:false,message:"Select a content type."};
        return {ok:true};
    }
    if(stage === 4){
        return {ok:true};
    }
    if(stage === 5){
        if(!state.seo.title.trim()) return {ok:false,message:"SEO title is required."};
        if(!state.seo.description.trim()) return {ok:false,message:"Meta description is required."};
        if(state.seo.description.length > 160) return {ok:false,message:"Meta description exceeds 160 characters."};
        return {ok:true};
    }
    if(stage === 6){
        return {ok:true};
    }
    if(stage === 7){
        const checks = technicalChecks();
        const blockers = checks.filter(x => x.level === "error");
        if(blockers.length) return {ok:false,message:blockers[0].message};
        return {ok:true};
    }
    return {ok:true};
}

function renderValidation(result){
    const el = document.getElementById("validation");
    if(!el) return;
    el.className = "validation " + (result.ok ? "validation-ok" : "validation-error");
    el.textContent = result.ok ? "Stage ready." : result.message;
    el.classList.remove("hidden");
}

function bindNavigation(){
    document.querySelectorAll("[data-next]").forEach(b => b.addEventListener("click", nextStage));
    document.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", previousStage));
    document.querySelectorAll("[data-stage-link]").forEach(b => b.addEventListener("click", () => goStage(Number(b.dataset.stageLink))));
    const save = document.getElementById("saveDraftBtn");
    if(save) save.addEventListener("click", () => saveDraft());
    const publish = document.getElementById("publishBtn");
    if(publish) publish.addEventListener("click", publishArticle);
    const menu = document.getElementById("menuToggle");
    const panel = document.getElementById("slideMenu");
    if(menu && panel) menu.addEventListener("click", () => panel.classList.toggle("hidden"));
}

function initState(){
    const query = new URLSearchParams(location.search);
    if(query.get("new") === "1"){
        localStorage.removeItem(STORAGE.publisher);
        localStorage.removeItem(STORAGE.edit);
    }
    let stored = safeJSON(localStorage.getItem(STORAGE.publisher) || "null", null);
    state = normalizeState(stored);

    const q = new URLSearchParams(location.search);
    const draftId = q.get("draft");
    const edit = q.get("mode") === "edit";

    if(edit){
        const record = safeJSON(localStorage.getItem(STORAGE.edit) || "null", null);
        if(record) importLegacyRecord(record, true);
    }else if(draftId){
        const drafts = safeJSON(localStorage.getItem(STORAGE.drafts) || "[]", []);
        const record = Array.isArray(drafts) ? drafts.find(x => x.id === draftId) : null;
        if(record) importLegacyRecord(record, false);
    }

    currentStage = Number(state.workflow.currentStage) || 1;
    if(currentStage < 1 || currentStage > 8) currentStage = 1;
    state.workflow.currentStage = currentStage;
    saveState(true);
}

function importLegacyRecord(d, editMode){
    const imported = freshState();
    imported.id = d.id || imported.id;
    imported.article.title = d.title || "";
    imported.article.slug = d.slug || (d.url || "").split("/").pop()?.replace(/\.html$/,"") || slugify(d.title || "");
    imported.article.summary = d.description || d.desc || "";
    imported.article.contentDelta = typeof d.content === "string" ? safeJSON(d.content, null) : d.content || null;
    if(imported.article.contentDelta && typeof imported.article.contentDelta === "object" && Array.isArray(imported.article.contentDelta.ops)){
        imported.article.contentHtml = deltaToHtml(imported.article.contentDelta);
    }else{
        imported.article.contentHtml = d.contentHtml || "";
    }
    imported.article.tags = Array.isArray(d.keywords) ? d.keywords : (d.tags || []);
    imported.media.featured = d.image ? {
        url:d.image,
        alt:d.imageAlt || "",
        title:d.imageTitle || "",
        caption:d.imageCaption || "",
        width:d.imageWidth || null,
        height:d.imageHeight || null,
        format:d.imageFormat || "webp",
        publicId:d.imagePublicId || "",
        seoName:d.imageSeoName || "",
        watermarked:true,
        processed:true
    } : null;
    imported.classification.category = d.category || "general";
    imported.classification.contentType = d.contentType || "update";
    imported.classification.intelTag = d.intelTag || d.tag || "GENERAL UPDATE";
    imported.classification.status = d.metaStatus || d.meta || "Routine Update";
    imported.classification.destination = d.page || "homepage";
    imported.classification.severity = d.severity || "Informational";
    imported.classification.verification = d.verification || "Verified";
    imported.classification.confidence = d.confidence || "Moderate";
    imported.classification.domains = Array.isArray(d.threatDomains) ? d.threatDomains : [];
    imported.intelligence = {...imported.intelligence, ...(d.intelligence || {})};
    imported.seo.title = d.seoTitle || d.title || "";
    imported.seo.description = d.seoDescription || d.description || d.desc || "";
    imported.seo.canonical = d.canonical || "";
    imported.seo.ogPrompt = d.ogPrompt || "";
    imported.linking.selected = Array.isArray(d.relatedArticles) ? d.relatedArticles : [];
    imported.workflow.currentStage = editMode ? 8 : 1;
    imported.workflow.completed = editMode ? [1,2,3,4,5,6,7] : [];
    imported.workflow.createdAt = d.publishedAt || d.date || imported.workflow.createdAt;
    imported.workflow.updatedAt = new Date().toISOString();
    state = normalizeState(imported);
    localStorage.setItem(STORAGE.publisher, JSON.stringify(state));
    if(editMode){
        window.HackaXEditMode = true;
        window.HackaXEditId = d.id || null;
        window.HackaXEditSlug = imported.article.slug;
        window.HackaXEditDate = d.date || "";
        window.HackaXEditPublishedAt = d.publishedAt || d.date || "";
    }
}

function saveCurrentPage(){
    if(!state) return;
    const page = Number(document.body.dataset.stage || currentStage);
    if(page === 1) saveStage1();
    if(page === 2) saveStage2();
    if(page === 3) saveStage3();
    if(page === 4) saveStage4();
    if(page === 5) saveStage5();
    if(page === 6) saveStage6();
    if(page === 7) saveStage7();
    saveState();
}

function setValue(id, value){
    const el = document.getElementById(id);
    if(el) el.value = value == null ? "" : value;
}

function getValue(id){
    const el = document.getElementById(id);
    return el ? el.value : "";
}

function setChecked(id, value){
    const el = document.getElementById(id);
    if(el) el.checked = !!value;
}

function getChecked(id){
    const el = document.getElementById(id);
    return !!(el && el.checked);
}

function saveStage1(){
    state.article.title = getValue("titleInput").trim();
    state.article.slug = getValue("slugInput").trim() || slugify(state.article.title);
    state.article.summary = getValue("summaryInput").trim();
    state.seo.title = getValue("seoTitleInput").trim() || state.seo.title;
    state.seo.description = getValue("descriptionInput").trim() || state.seo.description;
    state.seo.ogPrompt = getValue("ogPrompt").trim() || state.seo.ogPrompt;
    if(quill){
        state.article.contentDelta = quill.getContents();
        state.article.contentHtml = sanitizeArticleHTML(quill.root.innerHTML);
    }
    const tags = getValue("tagsInput").split(",").map(x=>x.trim()).filter(Boolean);
    state.article.tags = unique(tags);
    state.article.slug = slugify(state.article.slug || state.article.title);
}

function saveStage2(){
    const meta = state.media.featured;
    if(meta){
        meta.alt = getValue("imageAltInput") || meta.alt;
        meta.title = getValue("imageTitleInput") || meta.title;
        meta.caption = getValue("imageCaptionInput") || meta.caption;
    }
}

function saveStage3(){
    state.classification.contentType = getValue("contentTypeInput") || state.classification.contentType;
    state.classification.category = getValue("categoryInput") || state.classification.category;
    state.classification.intelTag = getValue("intelTagInput") || state.classification.intelTag;
    state.classification.status = getValue("statusInput") || state.classification.status;
    state.classification.severity = getValue("severityInput") || state.classification.severity;
    state.classification.verification = getValue("verificationInput") || state.classification.verification;
    state.classification.confidence = getValue("confidenceInput") || state.classification.confidence;
    state.classification.destination = getValue("destinationInput") || state.classification.destination;
    state.classification.domains = [...document.querySelectorAll('input[name="domain"]:checked')].map(x=>x.value);
}

function saveStage4(){
    state.intelligence.actors = splitList(getValue("actorsInput"));
    state.intelligence.malware = splitList(getValue("malwareInput"));
    state.intelligence.cves = splitList(getValue("cvesInput"));
    state.intelligence.techniques = splitList(getValue("techniquesInput"));
    state.intelligence.iocs = parseIocs(getValue("iocsInput"));
}

function saveStage5(){
    state.seo.title = getValue("seoTitleInput").trim() || state.seo.title;
    state.seo.description = getValue("descriptionInput").trim() || state.seo.description;
    state.seo.canonical = getValue("canonicalInput").trim() || getCanonical(cfg().siteUrl);
    state.seo.ogPrompt = getValue("ogPrompt").trim();
}

function saveStage6(){
    state.linking.selected = [...document.querySelectorAll('input[name="relatedArticle"]:checked')].map(el => {
        const a = existingArticles.find(x => x.id === el.value || x.url === el.value);
        return a ? {id:a.id || null,title:a.title || "",url:a.url || "",score:Number(el.dataset.score || 0)} : null;
    }).filter(Boolean);
    state.linking.applied = countExistingInternalLinks();
}

function saveStage7(){
    const indexEl = document.getElementById("indexToggle");
    const followEl = document.getElementById("followToggle");
    if(indexEl) state.technical.index = indexEl.checked;
    if(followEl) state.technical.follow = followEl.checked;
}

function splitList(value){
    return unique(String(value || "").split(/[\n,]+/).map(x=>x.trim()).filter(Boolean)).slice(0,30);
}

function parseIocs(value){
    return unique(String(value || "").split(/[\n,]+/).map(x=>x.trim()).filter(Boolean)).slice(0,100);
}

function deltaToHtml(delta){
    if(!delta || !Array.isArray(delta.ops)) return "";
    const root = document.createElement("div");
    let html = "";
    let line = "";
    delta.ops.forEach(op => {
        if(typeof op.insert !== "string") return;
        const text = esc(op.insert).replace(/\n/g,"<br>");
        const attrs = op.attributes || {};
        let chunk = text;
        if(attrs.bold) chunk = "<strong>" + chunk + "</strong>";
        if(attrs.italic) chunk = "<em>" + chunk + "</em>";
        if(attrs.underline) chunk = "<u>" + chunk + "</u>";
        if(attrs.strike) chunk = "<s>" + chunk + "</s>";
        html += chunk;
    });
    root.innerHTML = html;
    return root.innerHTML;
}

function sanitizeArticleHTML(html){
    const root = document.createElement("div");
    root.innerHTML = String(html || "");
    root.querySelectorAll("script,iframe,object,embed,style,form,input,textarea,button,select,link,meta").forEach(x=>x.remove());
    root.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attrNode => {
            const n = attrNode.name.toLowerCase();
            const v = attrNode.value;
            if(n.startsWith("on") || n === "style" && /expression|javascript:/i.test(v)) el.removeAttribute(attrNode.name);
            if((n === "href" || n === "src") && /^\s*javascript:/i.test(v)) el.removeAttribute(attrNode.name);
        });
    });
    root.querySelectorAll("a").forEach(a=>{
        a.setAttribute("rel","noopener noreferrer");
        if(/^https?:\/\//i.test(a.getAttribute("href") || "")) a.setAttribute("target","_blank");
    });
    return root.innerHTML;
}

function imageBaseName(title, category, tag){
    const pieces = meaningfulTokens([title,CATEGORIES[category] || category,tag || ""].join(" "));
    return slugify(pieces.slice(0,12).join("-")) || "hackax-intelligence";
}

function generateImageAlt(title, category, tag, context){
    const label = CATEGORIES[category] || "Cyber Threat Intelligence";
    const suffix = context ? " " + context : " featured image";
    return `${cleanText(title)} - ${label}${suffix ? " " + suffix.trim() : ""}`.replace(/\s+/g," ").trim().slice(0,180);
}

function generateImageTitle(title, category){
    return `${cleanText(title)} | ${CATEGORIES[category] || "HackaX Intelligence"}`.slice(0,180);
}

function generateImageCaption(title, category, tag){
    return `${CATEGORIES[category] || "Cyber Threat Intelligence"} coverage: ${cleanText(title)}${tag ? " (" + tag + ")" : ""}.`;
}

async function loadWatermark(){
    if(window.__hackaxWatermarkPromise) return window.__hackaxWatermarkPromise;
    window.__hackaxWatermarkPromise = new Promise((resolve,reject)=>{
        const paths = [
            "../assets/dyve-hackax.png",
            "/assets/dyve-hackax.png",
            "assets/dyve-hackax.png"
        ];
        let index = 0;
        const tryNext = () => {
            if(index >= paths.length){
                reject(new Error("HackaX watermark asset assets/dyve-hackax.png was not found."));
                return;
            }
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => { index++; tryNext(); };
            img.src = paths[index++] + (paths[index-1].includes("?") ? "" : "?v=1");
        };
        tryNext();
    });
    return window.__hackaxWatermarkPromise;
}

async function processImage(file, options){
    options = options || {};
    if(!file || !file.type.startsWith("image/")) throw new Error("Please choose a valid image file.");
    if(file.size > 25 * 1024 * 1024) throw new Error("Image is larger than the 25 MB processing limit.");

    const bitmap = await createImageBitmap(file);
    const maxWidth = options.maxWidth || 1800;
    let width = bitmap.width;
    let height = bitmap.height;
    if(width > maxWidth){
        height = Math.round(height * maxWidth / width);
        width = maxWidth;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", {alpha:false});
    if(!ctx) throw new Error("Browser image processing is unavailable.");

    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,width,height);
    ctx.drawImage(bitmap,0,0,width,height);

    const watermark = await loadWatermark();
    const wmWidth = Math.max(110, Math.round(width * 0.18));
    const wmHeight = Math.round(watermark.naturalHeight * wmWidth / watermark.naturalWidth);
    const pad = Math.max(18, Math.round(width * 0.018));
    const x = width - wmWidth - pad;
    const y = height - wmHeight - pad;
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.shadowColor = "rgba(0,0,0,.38)";
    ctx.shadowBlur = Math.max(4, Math.round(width * .006));
    ctx.drawImage(watermark,x,y,wmWidth,wmHeight);
    ctx.restore();

    const blob = await new Promise((resolve,reject)=>{
        canvas.toBlob(b=>b ? resolve(b) : reject(new Error("WebP conversion failed.")), "image/webp", options.quality || 0.82);
    });
    if(!blob) throw new Error("Unable to create optimized WebP image.");

    const base = imageBaseName(state.article.title, state.classification.category, state.classification.intelTag);
    const filename = `${base}-${Date.now()}.webp`;
    return new File([blob], filename, {type:"image/webp"});
}

async function cloudinaryUpload(file, publicId){
    const c = cfg();
    if(!c.cloudName || !c.uploadPreset) throw new Error("Cloudinary media settings are not configured.");
    const endpoint = c.cloudEndpoint || `https://api.cloudinary.com/v1_1/${encodeURIComponent(c.cloudName)}/image/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", c.uploadPreset);
    form.append("use_filename", "true");
    form.append("unique_filename", "false");
    form.append("filename_override", file.name);
    if(publicId) form.append("public_id", publicId);
    const response = await fetch(endpoint, {method:"POST",body:form});
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error?.message || `Cloudinary upload failed (${response.status}).`);
    return data;
}

async function uploadAndProcessImage(file, context){
    if(currentImageJob) throw new Error("Another image is currently being processed.");
    currentImageJob = true;
    try{
        const optimized = await processImage(file, {maxWidth: context === "featured" ? 1800 : 1600, quality:.82});
        const base = imageBaseName(state.article.title, state.classification.category, context);
        let data;
        try{
            data = await cloudinaryUpload(optimized, `hackax/${base}-${Date.now()}`);
        }catch(first){
            data = await cloudinaryUpload(optimized, "");
        }
        const meta = {
            url:data.secure_url,
            width:data.width || null,
            height:data.height || null,
            format:data.format || "webp",
            publicId:data.public_id || "",
            resourceType:data.resource_type || "image",
            originalFilename:data.original_filename || optimized.name,
            seoName:base,
            alt:generateImageAlt(state.article.title,state.classification.category,state.classification.intelTag,context === "featured" ? "featured image" : "article image"),
            title:generateImageTitle(state.article.title,state.classification.category),
            caption:generateImageCaption(state.article.title,state.classification.category,state.classification.intelTag),
            watermarked:true,
            processed:true,
            compressed:true,
            webp:true,
            byteSize:optimized.size,
            uploadedAt:new Date().toISOString()
        };
        if(context === "featured") state.media.featured = meta;
        else state.media.body.push(meta);
        saveState(true);
        return meta;
    }finally{
        currentImageJob = false;
    }
}

function renderFeaturedMeta(){
    const m = state.media.featured;
    const preview = document.getElementById("featuredPreview");
    if(!m){
        if(preview) preview.classList.add("hidden");
        return;
    }
    const img = document.getElementById("previewImg");
    if(img) img.src = m.url;
    const status = document.getElementById("imageProcessingStatus");
    if(status){
        status.innerHTML = [
            "✓ Optimized",
            "✓ WebP",
            "✓ Compressed",
            "✓ Watermarked",
            "✓ SEO filename",
            "✓ Alt text"
        ].map(x=>`<span class="media-chip">${x}</span>`).join("");
    }
    setValue("imageAltInput",m.alt);
    setValue("imageTitleInput",m.title);
    setValue("imageCaptionInput",m.caption);
    if(preview) preview.classList.remove("hidden");
}

function getArticleTopicData(){
    const body = state?.article?.contentHtml || "";
    return {
        title:state?.article?.title || "",
        description:state?.seo?.description || state?.article?.summary || "",
        body:cleanText(body),
        html:body,
        category:state?.classification?.category || "general",
        tag:state?.classification?.intelTag || "",
        keywords:unique([
            ...meaningfulTokens(state?.article?.title || ""),
            ...meaningfulTokens(body),
            ...meaningfulTokens(state?.classification?.intelTag || ""),
            ...meaningfulTokens(CATEGORIES[state?.classification?.category] || "")
        ])
    };
}

function getArticlePath(category, slug, destination){
    const safeCategory = CATEGORY_ROUTES[category] || slugify(category) || "updates";
    return `article/${safeCategory}/${slug}.html`;
}

function getCanonical(siteUrl, category, slug, destination){
    return `${siteUrl}/${getArticlePath(category,slug,destination)}`.replace(/([^:]\/)\/+/g,"$1");
}

function getRecordUrl(a, siteUrl){
    if(!a) return siteUrl;
    if(/^https?:\/\//i.test(a.url || "")) return a.url;
    return `${siteUrl}/${String(a.url || "").replace(/^\/+/,"")}`;
}

async function fetchGithub(path){
    const c = cfg();
    if(!c.githubToken || !c.githubRepo) throw new Error("GitHub is not configured.");
    const url = `https://api.github.com/repos/${c.githubRepo}/contents/${String(path).replace(/^\/+/,"")}?ref=${encodeURIComponent(c.githubBranch)}`;
    const response = await fetch(url,{
        headers:{
            Authorization:`Bearer ${c.githubToken}`,
            Accept:"application/vnd.github+json",
            "X-GitHub-Api-Version":"2022-11-28"
        },
        cache:"no-store"
    });
    if(response.status === 404) return null;
    if(!response.ok) throw new Error(`GitHub returned HTTP ${response.status}.`);
    return response.json();
}

async function putGithub(path, content, message, sha){
    const c = cfg();
    if(!c.githubToken || !c.githubRepo) throw new Error("GitHub is not configured.");
    const payload = {message,content:b64(content),branch:c.githubBranch};
    if(sha) payload.sha = sha;
    const url = `https://api.github.com/repos/${c.githubRepo}/contents/${String(path).replace(/^\/+/,"")}`;
    const response = await fetch(url,{
        method:"PUT",
        headers:{
            Authorization:`Bearer ${c.githubToken}`,
            Accept:"application/vnd.github+json",
            "Content-Type":"application/json",
            "X-GitHub-Api-Version":"2022-11-28"
        },
        body:JSON.stringify(payload)
    });
    const data = await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.message || `GitHub publish failed (${response.status}).`);
    return data;
}

async function loadArticles(){
    try{
        const data = await fetchGithub(cfg().articleDb);
        if(!data){ existingArticles=[]; return; }
        const parsed = safeJSON(unb64(data.content), []);
        existingArticles = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.articles) ? parsed.articles : []);
        return existingArticles;
    }catch(e){
        existingArticles = [];
        console.warn("HackaX article corpus unavailable:", e);
        return [];
    }
}

function articleKeywords(a){
    return unique([
        ...meaningfulTokens(a.title || ""),
        ...meaningfulTokens(a.description || a.desc || ""),
        ...meaningfulTokens(a.tag || ""),
        ...meaningfulTokens(a.categoryLabel || a.category || ""),
        ...(Array.isArray(a.keywords) ? a.keywords.flatMap(meaningfulTokens) : [])
    ]);
}

function scoreArticleCandidate(a){
    const current = getArticleTopicData();
    const mine = new Set(current.keywords);
    const theirs = articleKeywords(a);
    if(!mine.size || !theirs.length) return 0;
    let shared = 0;
    theirs.forEach(k=>{ if(mine.has(k)) shared++; });
    const density = shared / Math.max(4, Math.min(12,theirs.length));
    const sameCategory = a.category === state.classification.category ? .18 : 0;
    const score = Math.min(99, Math.round(density * 80 + sameCategory * 100));
    return score;
}

function getSmartLinkCandidates(){
    return existingArticles
        .filter(a => a && a.url && a.title)
        .filter(a => a.id !== state.id && a.url !== getArticlePath(state.classification.category,state.article.slug,state.classification.destination))
        .map(article=>({article,score:scoreArticleCandidate(article)}))
        .filter(x=>x.score >= 18)
        .sort((a,b)=>b.score-a.score)
        .slice(0,12);
}

function renderLinkSuggestions(){
    const box = document.getElementById("linkSuggestions");
    if(!box) return;
    const candidates = getSmartLinkCandidates();
    if(!existingArticles.length){
        box.innerHTML = `<div class="empty-state">Connect GitHub and load the article corpus to calculate contextual relationships.</div>`;
        return;
    }
    if(!candidates.length){
        box.innerHTML = `<div class="empty-state">No high-confidence contextual relationship was found. The engine will not force an unrelated link.</div>`;
        return;
    }
    box.innerHTML = candidates.map(x=>{
        const checked = state.linking.selected.some(a=>a.url === x.article.url);
        return `<label class="link-option">
            <input type="checkbox" name="relatedArticle" value="${attr(x.article.id || x.article.url)}" data-score="${x.score}" ${checked ? "checked" : ""}>
            <span class="link-option-body">
                <span class="link-option-title">${esc(x.article.title)}</span>
                <span class="link-option-meta">${x.score}% contextual match · ${esc(x.article.url)}</span>
            </span>
        </label>`;
    }).join("");
}

function countExistingInternalLinks(){
    const html = state.article.contentHtml || "";
    return (html.match(/<a\b/gi) || []).length;
}

function chooseAnchor(title){
    const words = meaningfulTokens(title);
    return words.slice(0,4).join(" ") || title;
}

function automaticallyLinkArticle(){
    const candidates = getSmartLinkCandidates().slice(0,3);
    if(!candidates.length){
        toast("No safe contextual links found.", "info");
        return;
    }
    const root = document.createElement("div");
    root.innerHTML = sanitizeArticleHTML(state.article.contentHtml);
    const textNodes = [];
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while(node = walker.nextNode()){
        if(node.parentElement && ["A","SCRIPT","STYLE"].includes(node.parentElement.tagName)) continue;
        textNodes.push(node);
    }
    let applied = 0;
    candidates.forEach(c=>{
        const anchor = chooseAnchor(c.article.title);
        for(const tn of textNodes){
            if(applied >= candidates.length) break;
            const text = tn.nodeValue || "";
            const index = text.toLowerCase().indexOf(anchor.toLowerCase());
            if(index < 0) continue;
            const before = text.slice(0,index);
            const match = text.slice(index,index+anchor.length);
            const after = text.slice(index+anchor.length);
            const frag = document.createDocumentFragment();
            if(before) frag.appendChild(document.createTextNode(before));
            const a = document.createElement("a");
            a.href = getRecordUrl(c.article,cfg().siteUrl);
            a.textContent = match;
            a.setAttribute("data-hackax-auto-link","true");
            a.setAttribute("rel","noopener noreferrer");
            a.target = "_blank";
            frag.appendChild(a);
            if(after) frag.appendChild(document.createTextNode(after));
            tn.parentNode.replaceChild(frag,tn);
            applied++;
            break;
        }
    });
    state.article.contentHtml = root.innerHTML;
    state.linking.applied = applied;
    saveState(true);
    if(quill) quill.root.innerHTML = state.article.contentHtml;
    renderLinkSuggestions();
    renderStage6Metrics();
    toast(`${applied} contextual link${applied === 1 ? "" : "s"} applied.`, "success");
}

function autoDescription(){
    const topic = getArticleTopicData();
    if(!topic.title || topic.body.length < 30){
        toast("Add a title and article content first.", "error");
        return;
    }
    const sentences = topic.body.split(/(?<=[.!?])\s+/).filter(x=>x.length > 30);
    let desc = sentences.slice(0,2).join(" ");
    if(desc.length > 160) desc = desc.slice(0,157).replace(/\s+\S*$/,"") + "...";
    if(desc.length < 110){
        desc = `${topic.title}. ${desc}`.slice(0,160);
    }
    state.seo.description = desc;
    setValue("descriptionInput",desc);
    renderDescriptionQuality();
    saveState(true);
    toast("Meta description generated from the actual article.", "success");
}

function autoSEO(){
    const topic = getArticleTopicData();
    if(!topic.title || topic.body.length < 100){
        toast("Add more article content before generating SEO.", "error");
        return;
    }
    state.article.slug = slugify(state.article.title);
    state.seo.title = `${state.article.title} | Dyve HackaX`.slice(0,70);
    autoDescription();
    const topics = topic.keywords.slice(0,8);
    state.seo.ogPrompt = `Professional cyber threat intelligence editorial artwork about ${topics.join(", ") || "emerging cyber threats"}; dark forensic environment, emerald network glow, technical intelligence aesthetic, realistic, high contrast, premium publication image, no text, no logos.`;
    setValue("slugInput",state.article.slug);
    setValue("seoTitleInput",state.seo.title);
    setValue("descriptionInput",state.seo.description);
    setValue("ogPrompt",state.seo.ogPrompt);
    renderSeoScore();
    saveState(true);
    toast("Smart SEO metadata generated.", "success");
}

function analyzeSEO(){
    renderSeoScore();
    renderTechnicalChecks();
}

function renderDescriptionQuality(){
    const d = getValue("descriptionInput") || state.seo.description || "";
    const count = document.getElementById("descCount");
    const quality = document.getElementById("descQuality");
    if(count) count.textContent = `${d.length}/160`;
    if(quality){
        quality.className = "desc-quality " + (d.length >= 140 && d.length <= 160 ? "good" : d.length >= 100 ? "warn" : "bad");
        quality.textContent = !d ? "Waiting for input..." : d.length >= 140 && d.length <= 160 ? "Strong search snippet length" : d.length >= 100 ? "Usable, but can be improved" : "Too short for a strong search snippet";
    }
}

function seoChecks(){
    const topic = getArticleTopicData();
    const words = topic.body.split(/\s+/).filter(Boolean).length;
    const h2 = (topic.html.match(/<h2\b/gi) || []).length;
    const links = countExistingInternalLinks();
    const imageCount = (topic.html.match(/<img\b/gi) || []).length;
    const f = state.media.featured;
    const c = cfg();
    return [
        {ok:!!topic.title, level:topic.title ? "success":"error", message:topic.title ? "Article title is present." : "Article title is missing."},
        {ok:topic.title.length >= 45 && topic.title.length <= 70, level:topic.title.length >= 45 && topic.title.length <= 70 ? "success":"warning", message:`Title length: ${topic.title.length} characters.`},
        {ok:!!state.seo.description && state.seo.description.length >= 140 && state.seo.description.length <= 160, level:state.seo.description.length >= 140 && state.seo.description.length <= 160 ? "success":"warning", message:`Meta description: ${state.seo.description.length}/160 characters.`},
        {ok:words >= Number(cfg().minWords || 500), level:words >= Number(cfg().minWords || 500) ? "success":words >= 300 ? "warning":"error", message:`Article depth: ${words} words.`},
        {ok:h2 >= Number(cfg().targetH2 || 2), level:h2 >= Number(cfg().targetH2 || 2) ? "success":"warning", message:`Heading structure: ${h2} H2 sections.`},
        {ok:links >= Number(cfg().targetLinks || 2), level:links >= Number(cfg().targetLinks || 2) ? "success":"warning", message:`Internal links: ${links}.`},
        {ok:!!f?.alt, level:f?.alt ? "success":"error", message:f?.alt ? "Featured image has contextual alt text.":"Featured image alt text is missing."},
        {ok:!!f?.seoName, level:f?.seoName ? "success":"error", message:f?.seoName ? "SEO image filename is present.":"SEO image filename is missing."},
        {ok:!!f?.webp, level:f?.webp ? "success":"error", message:f?.webp ? "Featured image is WebP.":"Featured image is not confirmed as WebP."},
        {ok:!!f?.watermarked, level:f?.watermarked ? "success":"error", message:f?.watermarked ? "HackaX watermark is permanently embedded.":"HackaX watermark is missing."},
        {ok:!!c.siteUrl, level:c.siteUrl ? "success":"error", message:c.siteUrl ? "Canonical site URL is configured.":"Site URL is missing."}
    ];
}

function renderSeoScore(){
    const box = document.getElementById("seoAnalysis");
    const scoreBox = document.getElementById("seoScore");
    const checks = seoChecks();
    const points = checks.reduce((n,x)=>n+(x.level==="success"?1:x.level==="warning"?.5:0),0);
    const score = Math.round(points / checks.length * 100);
    if(scoreBox) scoreBox.textContent = `${score}/100`;
    if(box){
        box.innerHTML = checks.map(x=>`<div class="seo-check ${x.level}"><span>${x.level==="success"?"✓":x.level==="warning"?"!":"×"}</span><span>${esc(x.message)}</span></div>`).join("");
    }
    return score;
}

function technicalChecks(){
    const topic = getArticleTopicData();
    const path = getArticlePath(state.classification.category,state.article.slug,state.classification.destination);
    const canonical = state.seo.canonical || getCanonical(cfg().siteUrl,state.classification.category,state.article.slug,state.classification.destination);
    const checks = [
        {level:topic.title ? "success":"error",message:topic.title ? "H1/article title is present.":"Article title is missing."},
        {level:/^https:\/\//i.test(canonical) ? "success":"error",message:/^https:\/\//i.test(canonical) ? "Canonical URL is HTTPS.":"Canonical URL must be HTTPS."},
        {level:slugify(state.article.slug) === state.article.slug ? "success":"warning",message:"Slug is normalized for a clean URL."},
        {level:path.endsWith(".html") ? "success":"error",message:"Article route ends in .html for static SEO publishing."},
        {level:state.media.featured?.url ? "success":"error",message:state.media.featured?.url ? "Featured image URL is available.":"Featured image is missing."},
        {level:state.media.featured?.width && state.media.featured?.height ? "success":"warning",message:"Featured image intrinsic dimensions are stored."},
        {level:topic.html ? "success":"error",message:topic.html ? "Article body is present.":"Article body is empty."},
        {level:state.seo.description ? "success":"error",message:state.seo.description ? "Meta description is present.":"Meta description is missing."},
        {level:state.linking.applied >= 1 || countExistingInternalLinks() >= 1 ? "success":"warning",message:`Contextual linking: ${countExistingInternalLinks()} link(s).`},
        {level:existingArticles.length ? "success":"warning",message:existingArticles.length ? `${existingArticles.length} HackaX records loaded for discovery.`:"Article corpus is not currently available."}
    ];
    return checks;
}

function renderTechnicalChecks(){
    const box = document.getElementById("technicalChecks");
    if(!box) return;
    box.innerHTML = technicalChecks().map(x=>`<div class="seo-check ${x.level}"><span>${x.level==="success"?"✓":x.level==="warning"?"!":"×"}</span><span>${esc(x.message)}</span></div>`).join("");
}

function renderStage6Metrics(){
    const c = getSmartLinkCandidates();
    const count = document.getElementById("candidateCount");
    const high = document.getElementById("highMatchCount");
    const applied = document.getElementById("appliedLinkCount");
    if(count) count.textContent = String(c.length);
    if(high) high.textContent = String(c.filter(x=>x.score >= 60).length);
    if(applied) applied.textContent = String(countExistingInternalLinks());
}

function renderStage3(){
    setValue("contentTypeInput",state.classification.contentType);
    setValue("categoryInput",state.classification.category);
    setValue("intelTagInput",state.classification.intelTag);
    setValue("statusInput",state.classification.status);
    setValue("severityInput",state.classification.severity);
    setValue("verificationInput",state.classification.verification);
    setValue("confidenceInput",state.classification.confidence);
    setValue("destinationInput",state.classification.destination);
    document.querySelectorAll('input[name="domain"]').forEach(el=>el.checked=state.classification.domains.includes(el.value));
}

function renderStage4(){
    setValue("actorsInput",state.intelligence.actors.join(", "));
    setValue("malwareInput",state.intelligence.malware.join(", "));
    setValue("cvesInput",state.intelligence.cves.join(", "));
    setValue("techniquesInput",state.intelligence.techniques.join(", "));
    setValue("iocsInput",state.intelligence.iocs.join("\n"));
}

function renderStage5(){
    setValue("seoTitleInput",state.seo.title || state.article.title);
    setValue("descriptionInput",state.seo.description || state.article.summary);
    setValue("canonicalInput",state.seo.canonical || getCanonical(cfg().siteUrl,state.classification.category,state.article.slug,state.classification.destination));
    setValue("ogPrompt",state.seo.ogPrompt);
    renderDescriptionQuality();
    renderSeoScore();
}

function renderStage7(){
    setChecked("indexToggle",state.technical.index);
    setChecked("followToggle",state.technical.follow);
    renderTechnicalChecks();
}

function renderReview(){
    const root = document.getElementById("reviewContent");
    if(!root) return;
    const topic = getArticleTopicData();
    const checks = [...seoChecks(),...technicalChecks()];
    const errors = checks.filter(x=>x.level==="error").length;
    const warnings = checks.filter(x=>x.level==="warning").length;
    const score = renderSeoScore();
    const f = state.media.featured;
    const related = state.linking.selected;
    root.innerHTML = `
        <div class="review-hero">
            <div>
                <div class="eyebrow">FINAL EDITORIAL GATE</div>
                <h2>${esc(state.article.title || "Untitled Intel")}</h2>
                <p>${esc(state.seo.description || state.article.summary || "No meta description.")}</p>
            </div>
            <div class="review-score"><strong>${score}</strong><span>SEO / QA</span></div>
        </div>
        <div class="review-grid">
            ${reviewCard("ARTICLE",[
                ["Title",state.article.title || "Missing"],
                ["Slug",state.article.slug || "Missing"],
                ["Content",`${topic.body.split(/\\s+/).filter(Boolean).length} words`],
                ["Tags",state.article.tags.join(", ") || "None"]
            ])}
            ${reviewCard("MEDIA",[
                ["Featured",f ? "Processed" : "Missing"],
                ["Format",f?.format?.toUpperCase() || "—"],
                ["Watermark",f?.watermarked ? "Embedded" : "Missing"],
                ["Alt",f?.alt || "Missing"]
            ])}
            ${reviewCard("CLASSIFICATION",[
                ["Type",labelForContentType(state.classification.contentType)],
                ["Category",CATEGORIES[state.classification.category] || state.classification.category],
                ["Status",state.classification.status],
                ["Severity",state.classification.severity],
                ["Verification",state.classification.verification]
            ])}
            ${reviewCard("INTELLIGENCE",[
                ["Actors",state.intelligence.actors.length || "None"],
                ["Malware",state.intelligence.malware.length || "None"],
                ["CVEs",state.intelligence.cves.length || "None"],
                ["IOCs",state.intelligence.iocs.length || "None"]
            ])}
            ${reviewCard("SEO",[
                ["SEO title",state.seo.title || "Missing"],
                ["Description",`${state.seo.description.length}/160`],
                ["Canonical",state.seo.canonical || "Missing"],
                ["Score",`${score}/100`]
            ])}
            ${reviewCard("DISCOVERY",[
                ["Candidates",getSmartLinkCandidates().length],
                ["Applied links",countExistingInternalLinks()],
                ["Sitemap", "Will update on publish"],
                ["News sitemap", "Will update on publish"]
            ])}
        </div>
        <div class="review-status ${errors ? "has-errors" : warnings ? "has-warnings" : "ready"}">
            <strong>${errors ? `${errors} blocking issue${errors===1?"":"s"} remain` : warnings ? `${warnings} advisory warning${warnings===1?"":"s"}` : "Publication checks passed"}</strong>
            <span>${errors ? "Resolve the blocking checks before publishing." : "The publisher can generate the article, index record and sitemap updates."}</span>
        </div>
    `;
    const publish = document.getElementById("publishBtn");
    if(publish) publish.disabled = errors > 0;
}

function reviewCard(title,rows){
    return `<section class="review-card"><div class="review-card-head">${esc(title)}</div>${rows.map(r=>`<div class="review-row"><span>${esc(r[0])}</span><strong>${esc(r[1])}</strong></div>`).join("")}</section>`;
}

function labelForContentType(value){
    const x = CONTENT_TYPES.find(x=>x[0]===value);
    return x ? x[1] : value;
}

function createArticleSchema(data){
    return {
        "@context":"https://schema.org",
        "@type":"NewsArticle",
        "headline":data.title,
        "description":data.desc,
        "image":data.image ? [data.image] : [],
        "datePublished":data.date,
        "dateModified":data.modified || data.date,
        "mainEntityOfPage":{"@type":"WebPage","@id":data.canonical},
        "author":{"@type":"Organization","name":"Dyve HackaX Intelligence Unit","url":`${data.c.siteUrl}/`},
        "publisher":{"@type":"Organization","name":"Dyve HackaX","url":`${data.c.siteUrl}/`},
        "articleSection":data.label,
        "keywords":data.keywords || []
    };
}

function createBreadcrumbSchema(canonical,label,category,c){
    return {
        "@context":"https://schema.org",
        "@type":"BreadcrumbList",
        "itemListElement":[
            {"@type":"ListItem","position":1,"name":"HackaX","item":`${c.siteUrl}/`},
            {"@type":"ListItem","position":2,"name":label,"item":`${c.siteUrl}/${CATEGORY_ROUTES[category] || "updates"}/`},
            {"@type":"ListItem","position":3,"name":state.article.title,"item":canonical}
        ]
    };
}


function applyArticleImageMetadata(root){
    if(!root) return;
    const images = [...root.querySelectorAll("img")];
    images.forEach(img=>{
        const src = img.getAttribute("src") || "";
        const meta = [...(state.media.body || []), state.media.featured].find(x=>x && x.url === src);
        if(meta){
            img.setAttribute("alt",meta.alt || generateImageAlt(state.article.title,state.classification.category,state.classification.intelTag,"article image"));
            img.setAttribute("title",meta.title || generateImageTitle(state.article.title,state.classification.category));
            img.setAttribute("loading","lazy");
            img.setAttribute("decoding","async");
        }else if(!img.getAttribute("alt")){
            img.setAttribute("alt",generateImageAlt(state.article.title,state.classification.category,state.classification.intelTag,"article image"));
            img.setAttribute("loading","lazy");
            img.setAttribute("decoding","async");
        }
    });
}

function generateArticleHTML(c, data){
    const label = CATEGORIES[data.category] || "Cyber Threat Intelligence";
    const canonical = data.canonical;
    const pathDepth = "../..";
    const bodyRoot = document.createElement("div");
    bodyRoot.innerHTML = sanitizeArticleHTML(data.body || "");
    applyArticleImageMetadata(bodyRoot);
    const safeBody = bodyRoot.innerHTML;
    const schema = createArticleSchema({
        title:data.title,desc:data.desc,image:data.image,date:data.date,modified:data.modified,
        label,canonical,c,keywords:data.keywords
    });
    const breadcrumb = createBreadcrumbSchema(canonical,label,data.category,c);
    const imageFigure = data.image ? `<figure class="hero">
<img src="${attr(data.image)}" alt="${attr(data.imageAlt)}" title="${attr(data.imageTitle)}" width="${Number(data.imageWidth)||1200}" height="${Number(data.imageHeight)||675}" loading="eager" decoding="async" fetchpriority="high" itemprop="image">
<figcaption>${esc(data.imageCaption || "")}</figcaption>
</figure>` : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(data.title)} | Dyve HackaX</title>
<meta name="description" content="${attr(data.desc)}">
<meta name="keywords" content="${attr(unique([data.tag,label,...data.keywords,"Dyve HackaX","cyber threat intelligence"]).join(", "))}">
<meta name="robots" content="${attr((data.index === false ? "noindex" : "index") + "," + (data.follow === false ? "nofollow" : "follow") + ",max-image-preview:large,max-snippet:-1,max-video-preview:-1")}">
<link rel="canonical" href="${attr(canonical)}">
<link rel="author" href="${attr(c.siteUrl)}/about-us/">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Dyve HackaX">
<meta property="og:title" content="${attr(data.title)}">
<meta property="og:description" content="${attr(data.desc)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(data.image || "")}">
<meta property="og:image:alt" content="${attr(data.imageAlt || "")}">
<meta property="og:image:type" content="image/webp">
<meta property="article:published_time" content="${attr(data.date)}">
<meta property="article:modified_time" content="${attr(data.modified || data.date)}">
<meta property="article:author" content="Dyve HackaX Intelligence Unit">
<meta property="article:section" content="${attr(label)}">
<meta property="article:tag" content="${attr(data.tag)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(data.title)}">
<meta name="twitter:description" content="${attr(data.desc)}">
<meta name="twitter:image" content="${attr(data.image || "")}">
<meta name="twitter:image:alt" content="${attr(data.imageAlt || "")}">
<meta name="theme-color" content="#020403">
<link rel="icon" href="${attr(c.siteUrl)}/favicon.ico">
<link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${attr(pathDepth)}/article.css">
<script type="application/ld+json">${JSON.stringify(schema).replace(/<\/script/gi,"<\\/script")}<\/script>
<script type="application/ld+json">${JSON.stringify(breadcrumb).replace(/<\/script/gi,"<\\/script")}<\/script>
</head>
<body>
<header class="header"><div class="header-inner">
<button class="back-btn" onclick="goBack()" aria-label="Back">←</button>
<a class="logo" href="${attr(pathDepth)}/">DYVE // HACKAX</a>
<nav><a href="${attr(pathDepth)}/">Intel</a><a href="${attr(pathDepth)}/dark-web/">Dark Web</a><a href="${attr(pathDepth)}/signals/">Signals</a></nav>
</div></header>
<div class="layout">
<aside class="sidebar"><div class="intel-box">
<div class="intel-title">HACKAX INTELLIGENCE</div>
<div class="intel-item"><div class="intel-label">Classification</div><div class="intel-value">${esc(label)}</div></div>
<div class="intel-item"><div class="intel-label">Threat Type</div><div class="intel-value">${esc(data.tag)}</div></div>
<div class="intel-item"><div class="intel-label">Status</div><div class="intel-value">${esc(data.status)}</div></div>
<div class="intel-item"><div class="intel-label">Severity</div><div class="intel-value">${esc(data.severity)}</div></div>
<div class="intel-item"><div class="intel-label">Scope</div><div class="intel-value">Global</div></div>
</div></aside>
<main class="article" itemscope itemtype="https://schema.org/NewsArticle">
<meta itemprop="headline" content="${attr(data.title)}">
<meta itemprop="description" content="${attr(data.desc)}">
<meta itemprop="image" content="${attr(data.image || "")}">
<meta itemprop="datePublished" content="${attr(data.date)}">
<meta itemprop="dateModified" content="${attr(data.modified || data.date)}">
<div class="breadcrumb">[ HACKAX INTEL FEED ] / ${esc(label).toUpperCase()} / ${esc(data.tag)}</div>
<h1 itemprop="name">${esc(data.title)}</h1>
<div class="subhead" itemprop="description">${esc(data.desc)}</div>
<div class="meta">Dyve HackaX Intelligence Unit • <time datetime="${attr(data.date)}">${esc(data.date)}</time> • ${esc(data.status)}</div>
${imageFigure}
<div class="share"><button onclick="copyLink()">Copy</button><button onclick="shareX()">Share</button><button onclick="shareLinkedIn()">LinkedIn</button></div>
<div class="content" itemprop="articleBody">${safeBody}</div>
<div class="article-tags"><span>${esc(data.tag)}</span><span>${esc(label)}</span><span>Dyve HackaX</span></div>
</main></div>
<section class="hx-cta"><div class="hx-cta-card"><h2>Stay ahead of active threats</h2><p>Track breach signals, threat actors, ransomware activity and underground intelligence with Dyve HackaX.</p><a href="${attr(pathDepth)}/" class="hx-cta-btn">Explore HackaX Intelligence →</a></div></section>
<footer class="hx-footer"><div class="hx-footer-logo">DYVE // HACKAX</div><div class="hx-legal"><span>© 2026 Dyve</span><a href="${attr(pathDepth)}/privacy-policy/index.html">Privacy</a><a href="${attr(pathDepth)}/terms-of-service/index.html">Terms</a></div></footer>
<script>
function copyLink(){if(navigator.clipboard)navigator.clipboard.writeText(location.href);alert("Link copied");}
function shareX(){window.open("https://twitter.com/intent/tweet?url="+encodeURIComponent(location.href)+"&text="+encodeURIComponent(document.title),"_blank");}
function shareLinkedIn(){window.open("https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(location.href),"_blank");}
function goBack(){history.length>1?history.back():location.href="${attr(pathDepth)}/";}
<\/script>
</body></html>`;
}

function makeSitemap(articles,c){
    const urls=[
        {u:"/",p:"1.0"},
        ...Object.entries(CATEGORY_ROUTES).map(([k,r])=>({u:`/${r}/`,p:k==="general"?".8":".9"}))
    ];
    articles.forEach(a=>{
        if(!a.url) return;
        if(/^https?:\/\//i.test(a.url)) return;
        urls.push({u:"/"+String(a.url).replace(/^\/+/,""),p:".8",d:a.updatedAt||a.date||""});
    });
    const seen = new Set();
    const clean = urls.filter(x=>!seen.has(x.u) && seen.add(x.u));
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${clean.map(x=>`<url><loc>${esc(c.siteUrl+x.u)}</loc>${x.d?`<lastmod>${esc(String(x.d).split("T")[0])}</lastmod>`:""}<changefreq>weekly</changefreq><priority>${x.p}</priority></url>`).join("\n")}
</urlset>`;
}

function makeNewsSitemap(articles,c){
    const cutoff = Date.now() - 48*60*60*1000;
    const recent = articles.filter(a=>a.date && !Number.isNaN(new Date(a.date).getTime()) && new Date(a.date).getTime() >= cutoff && a.url);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recent.map(a=>`<url><loc>${esc(getRecordUrl(a,c.siteUrl))}</loc><news:news><news:publication><news:name>Dyve HackaX</news:name><news:language>en</news:language></news:publication><news:publication_date>${esc(new Date(a.date).toISOString())}</news:publication_date><news:title>${esc(a.title || "HackaX Intelligence")}</news:title></news:news></url>`).join("\n")}
</urlset>`;
}

function makeImageSitemap(articles,c){
    const entries = articles.filter(a=>a.url && a.image && /^https?:\/\//i.test(a.image)).map(a=>`<url><loc>${esc(getRecordUrl(a,c.siteUrl))}</loc><image:image><image:loc>${esc(a.image)}</image:loc><image:title>${esc(a.imageTitle || a.title || "HackaX Intelligence")}</image:title><image:caption>${esc(a.imageAlt || a.description || a.title || "")}</image:caption></image:image></url>`);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;
}

async function updateSitemapFile(path,content,message){
    const existing = await fetchGithub(path);
    return putGithub(path,content,message,existing && existing.sha);
}

function buildRecord(){
    const c = cfg();
    const topic = getArticleTopicData();
    const slug = window.HackaXEditSlug || slugify(state.article.slug || state.article.title);
    const destination = state.classification.destination;
    const path = getArticlePath(state.classification.category,slug,destination);
    const canonical = state.seo.canonical || getCanonical(c.siteUrl,state.classification.category,slug,destination);
    const date = window.HackaXEditDate || new Date().toISOString().split("T")[0];
    const modified = new Date().toISOString();
    const f = state.media.featured;
    const keywords = unique([
        ...topic.keywords,
        ...state.article.tags.flatMap(meaningfulTokens),
        ...state.classification.domains.flatMap(meaningfulTokens),
        ...meaningfulTokens(state.classification.intelTag),
        ...meaningfulTokens(CATEGORIES[state.classification.category] || "")
    ]).slice(0,30);
    return {
        id:window.HackaXEditId || state.id || crypto.randomUUID(),
        title:state.article.title.trim(),
        slug,
        desc:state.seo.description.trim(),
        description:state.seo.description.trim(),
        seoTitle:state.seo.title.trim() || state.article.title.trim(),
        seoDescription:state.seo.description.trim(),
        image:f?.url || "",
        imageAlt:f?.alt || "",
        imageTitle:f?.title || "",
        imageCaption:f?.caption || "",
        imageWidth:f?.width || 1200,
        imageHeight:f?.height || 675,
        imageFormat:f?.format || "webp",
        imagePublicId:f?.publicId || "",
        imageSeoName:f?.seoName || "",
        imageWatermarked:!!f?.watermarked,
        imageCompressed:!!f?.compressed,
        imageWebp:!!f?.webp,
        imageByteSize:f?.byteSize || null,
        url:path,
        canonical,
        tag:(state.classification.intelTag || "GENERAL UPDATE").toUpperCase(),
        meta:state.classification.status || "Routine Update",
        category:state.classification.category,
        categoryLabel:CATEGORIES[state.classification.category],
        contentType:state.classification.contentType,
        page:destination,
        severity:state.classification.severity,
        verification:state.classification.verification,
        confidence:state.classification.confidence,
        threatDomains:state.classification.domains,
        brand:"hackax",
        publisher:"Dyve HackaX",
        author:"Dyve HackaX Intelligence Unit",
        keywords,
        intelligence:state.intelligence,
        content:JSON.stringify(state.article.contentDelta || {ops:[]}),
        contentHtml:state.article.contentHtml,
        internalLinks:countExistingInternalLinks(),
        relatedArticles:state.linking.selected.slice(0,8),
        ogPrompt:state.seo.ogPrompt,
        index:state.technical.index !== false,
        follow:state.technical.follow !== false,
        date,
        publishedAt:window.HackaXEditMode ? (window.HackaXEditPublishedAt || date) : new Date().toISOString(),
        updatedAt:modified
    };
}

async function publishArticle(){
    saveCurrentPage();
    const blocking = [...seoChecks(), ...technicalChecks()].filter(x => x.level === "error");
    if(blocking.length){
        toast(blocking[0].message,"error");
        renderReview();
        return;
    }
    const c = cfg();
    if(!c.githubToken || !c.githubRepo){
        toast("Configure GitHub in HackaX Settings first.","error");
        return;
    }
    if(!state.media.featured?.url){
        toast("Featured image is required.","error");
        return;
    }

    const btn = document.getElementById("publishBtn");
    if(btn){
        btn.disabled = true;
        btn.textContent = window.HackaXEditMode ? "Updating..." : "Publishing...";
    }

    try{
        toast("Checking the live HackaX article index...");
        const record = buildRecord();
        const path = record.url;
        const oldFile = await fetchGithub(path);
        const db = await fetchGithub(c.articleDb);
        let articles = [];
        if(db){
            const parsed = safeJSON(unb64(db.content),[]);
            articles = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.articles) ? parsed.articles : []);
        }

        const index = articles.findIndex(a => (window.HackaXEditId && a.id === window.HackaXEditId) || a.url === path);
        if(index >= 0) articles[index] = {...articles[index],...record};
        else articles.unshift(record);

        const html = generateArticleHTML(c,{
            title:record.title,
            desc:record.description,
            image:record.image,
            imageAlt:record.imageAlt,
            imageTitle:record.imageTitle,
            imageCaption:record.imageCaption,
            tag:record.tag,
            status:record.meta,
            severity:record.severity,
            category:record.category,
            slug:record.slug,
            date:record.date,
            modified:record.updatedAt,
            body:record.contentHtml,
            canonical:record.canonical,
            destination:record.page,
            keywords:record.keywords,
            index:record.index,
            follow:record.follow
        });

        toast("Publishing article page to GitHub...");
        await putGithub(path,html,`${window.HackaXEditMode ? "update" : "feat"}: ${record.title}`,oldFile && oldFile.sha);

        toast("Updating assets/articles.json...");
        await putGithub(c.articleDb,JSON.stringify(articles,null,2),`${window.HackaXEditMode ? "update" : "chore"}: HackaX article index`,db && db.sha);

        toast("Updating HackaX XML sitemaps...");
        for(const [p,content,label] of [
            [c.sitemap,makeSitemap(articles,c),"HackaX sitemap"],
            [c.newsSitemap,makeNewsSitemap(articles,c),"HackaX news sitemap"],
            [c.imageSitemap,makeImageSitemap(articles,c),"HackaX image sitemap"]
        ]){
            const existing = await fetchGithub(p);
            await putGithub(p,content,`chore: update ${label}`,existing && existing.sha);
        }

        const drafts = safeJSON(localStorage.getItem(STORAGE.drafts) || "[]",[]);
        if(Array.isArray(drafts)){
            localStorage.setItem(STORAGE.drafts,JSON.stringify(drafts.filter(d=>d.id !== record.id)));
        }
        localStorage.removeItem(STORAGE.publisher);
        localStorage.removeItem(STORAGE.edit);
        toast(window.HackaXEditMode ? "HackaX Intel updated successfully." : "HackaX Intel published successfully.","success");
        setTimeout(()=>location.href="published.html",900);
    }catch(e){
        console.error(e);
        toast("Publish failed: " + e.message,"error");
        if(btn){
            btn.disabled = false;
            btn.textContent = window.HackaXEditMode ? "Update Intel" : "Publish Intel";
        }
    }
}

function saveDraft(){
    saveCurrentPage();
    const record = buildRecord();
    const drafts = safeJSON(localStorage.getItem(STORAGE.drafts) || "[]",[]);
    const list = Array.isArray(drafts) ? drafts : [];
    const i = list.findIndex(x=>x.id === record.id);
    const draft = {
        ...record,
        draft:true,
        content:JSON.stringify(state.article.contentDelta || {ops:[]}),
        contentHtml:state.article.contentHtml,
        updatedAt:new Date().toISOString()
    };
    if(i >= 0) list[i] = draft;
    else list.unshift(draft);
    localStorage.setItem(STORAGE.drafts,JSON.stringify(list));
    saveState(true);
    toast("Draft saved locally on this device.","success");
}


function aiGrammar(){
    if(!quill) return;
    let text = quill.getText();
    const rules = [
        [/\s{2,}/g," "],
        [/\bteh\b/gi,"the"],
        [/\brecieve\b/gi,"receive"],
        [/\bseperate\b/gi,"separate"],
        [/\boccured\b/gi,"occurred"],
        [/\bdefinately\b/gi,"definitely"],
        [/\bthier\b/gi,"their"]
    ];
    let count = 0;
    rules.forEach(([re,repl])=>{
        const matches = text.match(re);
        if(matches) count += matches.length;
        text = text.replace(re,repl);
    });
    quill.setText(text.trim() ? text : "");
    state.article.contentDelta = quill.getContents();
    state.article.contentHtml = sanitizeArticleHTML(quill.root.innerHTML);
    saveState(true);
    toast(count ? `Fixed ${count} common writing issues.` : "No common grammar issues found.","success");
}

function replaceSelection(transform){
    if(!quill) return;
    const range = quill.getSelection(true);
    if(!range || !range.length){
        toast("Select text in the article first.","error");
        return;
    }
    const current = quill.getText(range.index,range.length);
    const next = transform(current);
    quill.deleteText(range.index,range.length,"user");
    quill.insertText(range.index,next,"user");
    quill.setSelection(range.index,next.length,"silent");
}

function aiShorter(){
    replaceSelection(text=>text
        .replace(/\b(very|really|quite|actually|basically|just|simply)\b/gi,"")
        .replace(/in order to/gi,"to")
        .replace(/due to the fact that/gi,"because")
        .replace(/\s{2,}/g," ")
        .trim()
    );
    saveState(true);
    toast("Selected text condensed.","success");
}

function aiLonger(){
    replaceSelection(text=>`${text.trim()} This development should be assessed alongside the broader threat landscape, operational exposure, relevant indicators and the evidence currently available to defenders.`);
    saveState(true);
    toast("Selected text expanded.","success");
}

function aiSEO(){
    const terms = getArticleTopicData().keywords.slice(0,8);
    if(!terms.length){
        toast("Not enough article content to extract SEO topics.","error");
        return;
    }
    state.article.tags = unique([...state.article.tags,...terms]).slice(0,20);
    setValue("tagsInput",state.article.tags.join(", "));
    renderKeywordPreview();
    saveState(true);
    toast("SEO topic tags generated from the article.","success");
}

function aiGenerate(){
    if(!quill) return;
    const label = CATEGORIES[state.classification.category] || "Cyber Threat Intelligence";
    const html = `<h2>Key Intelligence</h2><p>This section summarizes the most important findings, observed indicators and operational significance of the ${esc(label.toLowerCase())} development.</p><h2>Why It Matters</h2><p>The development should be assessed alongside the broader threat landscape, affected infrastructure, exposure patterns and the evidence currently available to defenders.</p><h2>Recommended Actions</h2><ul><li>Validate affected systems, identities or infrastructure.</li><li>Review relevant logs and threat indicators.</li><li>Increase monitoring where evidence supports elevated risk.</li><li>Document observed indicators and preserve relevant evidence.</li></ul>`;
    quill.clipboard.dangerouslyPasteHTML(Math.max(0,quill.getLength()-1),html,"api");
    state.article.contentDelta = quill.getContents();
    state.article.contentHtml = sanitizeArticleHTML(quill.root.innerHTML);
    saveState(true);
    toast("HackaX analysis section added.","success");
}

function customAI(){
    const prompt = getValue("aiPrompt").trim().toLowerCase();
    if(!prompt){
        toast("Enter an editorial command.","error");
        return;
    }
    if(prompt.includes("uppercase")){
        replaceSelection(x=>x.toUpperCase());
    }else if(prompt.includes("lowercase")){
        replaceSelection(x=>x.toLowerCase());
    }else if(prompt.includes("summary")){
        replaceSelection(x=>{
            const parts=x.split(/[.!?]/).map(v=>v.trim()).filter(Boolean).slice(0,2);
            return parts.length ? parts.join(". ") + "." : x;
        });
    }else if(prompt.includes("bold")){
        const range=quill?.getSelection(true);
        if(!range || !range.length){toast("Select text first.","error");return;}
        quill.formatText(range.index,range.length,"bold",true,"user");
    }else{
        toast('Try "uppercase", "lowercase", "summary" or "bold".',"info");
        return;
    }
    state.article.contentDelta=quill.getContents();
    state.article.contentHtml=sanitizeArticleHTML(quill.root.innerHTML);
    saveState(true);
    toast("Editorial command applied.","success");
}

function initStage1(){
    if(!window.Quill) return;
    quill = new Quill("#editor",{
        theme:"snow",
        placeholder:"Begin HackaX intelligence report...",
        modules:{
            toolbar:{
                container:[
                    [{header:[1,2,3,false]}],
                    ["bold","italic","underline","strike"],
                    [{list:"ordered"},{list:"bullet"}],
                    ["blockquote","code-block"],
                    ["link","image"],
                    ["clean"]
                ],
                handlers:{image:()=>{
                    const input=document.createElement("input");
                    input.type="file"; input.accept="image/*"; input.multiple=true;
                    input.onchange=async()=>{
                        for(const file of input.files){
                            try{
                                toast("Processing article image...");
                                const meta = await uploadAndProcessImage(file,"body");
                                const range=quill.getSelection(true) || {index:quill.getLength()};
                                quill.insertEmbed(range.index,"image",meta.url);
                                const inserted = [...quill.root.querySelectorAll("img")].find(img => img.getAttribute("src") === meta.url);
                                if(inserted){
                                    inserted.setAttribute("alt",meta.alt);
                                    inserted.setAttribute("title",meta.title);
                                    inserted.setAttribute("loading","lazy");
                                    inserted.setAttribute("decoding","async");
                                }
                                quill.setSelection(range.index+1);
                                state.article.contentHtml = sanitizeArticleHTML(quill.root.innerHTML);
                                state.article.contentDelta = quill.getContents();
                                saveState(true);
                                toast("Image optimized, converted to WebP and watermarked.","success");
                            }catch(e){ toast(e.message,"error"); }
                        }
                    };
                    input.click();
                }}
            }
        }
    });
    if(state.article.contentDelta) quill.setContents(state.article.contentDelta);
    else if(state.article.contentHtml) quill.root.innerHTML = sanitizeArticleHTML(state.article.contentHtml);
    setValue("titleInput",state.article.title);
    setValue("slugInput",state.article.slug || slugify(state.article.title));
    setValue("summaryInput",state.article.summary);
    setValue("tagsInput",state.article.tags.join(", "));
    document.getElementById("titleInput")?.addEventListener("input",()=>{
        state.article.title=getValue("titleInput").trim();
        if(!getValue("slugInput") || getValue("slugInput")===slugify(state.article.title)){
            setValue("slugInput",slugify(state.article.title));
        }
        updateSlugPreview();
        renderKeywordPreview();
        saveState();
    });
    ["slugInput","summaryInput","tagsInput"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>{saveStage1();saveState();}));
    quill.on("text-change",()=>{
        state.article.contentDelta=quill.getContents();
        state.article.contentHtml=sanitizeArticleHTML(quill.root.innerHTML);
        renderKeywordPreview();
        renderWordCount();
        saveState();
    });
    document.getElementById("autoSeoBtn")?.addEventListener("click",autoSEO);
    document.getElementById("autoDescBtn")?.addEventListener("click",autoDescription);
    document.getElementById("analyzeBtn")?.addEventListener("click",analyzeSEO);
    document.getElementById("aiBtn")?.addEventListener("click",()=>document.getElementById("aiPanel")?.classList.toggle("active"));
    document.getElementById("closeAi")?.addEventListener("click",()=>document.getElementById("aiPanel")?.classList.remove("active"));
    document.querySelectorAll(".ai-action").forEach(button=>button.addEventListener("click",()=>{
        document.getElementById("aiPanel")?.classList.remove("active");
        const actions={grammar:aiGrammar,shorter:aiShorter,longer:aiLonger,seo:aiSEO,generate:aiGenerate};
        const action=actions[button.dataset.action];
        if(action) action();
    }));
    document.getElementById("aiGo")?.addEventListener("click",customAI);
    updateSlugPreview();
    renderKeywordPreview();
    renderWordCount();
}

function updateSlugPreview(){
    const slug = slugify(getValue("slugInput") || getValue("titleInput"));
    const p = document.getElementById("slugPreview");
    if(p) p.textContent = slug || "your-intel-slug";
    const route = document.getElementById("routePreview");
    if(route) route.textContent = "/" + getArticlePath(state.classification.category,slug,state.classification.destination);
}

function renderKeywordPreview(){
    const box=document.getElementById("keywordPreview");
    if(!box) return;
    const terms=getArticleTopicData().keywords.slice(0,16);
    box.innerHTML=terms.map(x=>`<span class="keyword-chip">${esc(x)}</span>`).join("");
}

function renderWordCount(){
    const box=document.getElementById("wordCount");
    if(box) box.textContent = getArticleTopicData().body.split(/\s+/).filter(Boolean).length;
}

function initStage2(){
    renderFeaturedMeta();
    document.getElementById("featuredImageInput")?.addEventListener("change",async e=>{
        const file=e.target.files[0];
        if(!file) return;
        try{
            toast("Compressing, converting to WebP and embedding HackaX watermark...");
            await uploadAndProcessImage(file,"featured");
            renderFeaturedMeta();
            toast("Featured image processed and uploaded.","success");
        }catch(err){toast(err.message,"error");}
    });
    ["imageAltInput","imageTitleInput","imageCaptionInput"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>{saveStage2();saveState();}));
}

function initStage3(){
    renderStage3();
    document.querySelectorAll("#stage3Form select").forEach(el=>el.addEventListener("change",()=>{saveStage3();updateSlugPreview();saveState();}));
    document.querySelectorAll('input[name="domain"]').forEach(el=>el.addEventListener("change",()=>{saveStage3();saveState();}));
}

function initStage4(){
    renderStage4();
    ["actorsInput","malwareInput","cvesInput","techniquesInput","iocsInput"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>{saveStage4();saveState();}));
}

function initStage5(){
    renderStage5();
    ["seoTitleInput","descriptionInput","canonicalInput","ogPrompt"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>{saveStage5();renderDescriptionQuality();renderSeoScore();saveState();}));
    document.getElementById("autoSeoBtn")?.addEventListener("click",autoSEO);
    document.getElementById("autoDescBtn")?.addEventListener("click",autoDescription);
}

function initStage6(){
    renderLinkSuggestions();
    renderStage6Metrics();
    document.getElementById("refreshLinksBtn")?.addEventListener("click",async()=>{
        await loadArticles(); renderLinkSuggestions(); renderStage6Metrics(); toast("Live article corpus refreshed.","success");
    });
    document.getElementById("autoLinksBtn")?.addEventListener("click",automaticallyLinkArticle);
    document.addEventListener("change",e=>{
        if(e.target.matches('input[name="relatedArticle"]')){saveStage6();saveState();renderStage6Metrics();}
    });
}

function initStage7(){
    renderStage7();
    ["indexToggle","followToggle"].forEach(id=>document.getElementById(id)?.addEventListener("change",()=>{saveStage7();renderTechnicalChecks();saveState(true);}));
    document.getElementById("runChecksBtn")?.addEventListener("click",()=>{saveStage7();renderTechnicalChecks();toast("Technical checks completed.","success");});
}

function initReview(){
    renderReview();
    document.getElementById("refreshReviewBtn")?.addEventListener("click",()=>{renderReview();toast("Review refreshed from current publisher state.","success");});
}

function initCommon(){
    bindNavigation();
    document.getElementById("refreshStatusBtn")?.addEventListener("click",checkGitHub);
    document.getElementById("resetPublisherBtn")?.addEventListener("click",()=>{
        if(confirm("Start a new HackaX publication? The current local publisher state will be cleared.")){
            localStorage.removeItem(STORAGE.publisher);
            location.href="index.html";
        }
    });
    renderGlobalProgress();
    window.addEventListener("beforeunload",saveCurrentPage);
    document.addEventListener("keydown",e=>{
        if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="s"){
            e.preventDefault(); saveDraft();
        }
    });
}

async function checkGitHub(){
    const dot=document.getElementById("statusDot");
    const text=document.getElementById("statusText");
    if(!dot || !text) return false;
    const c=cfg();
    if(!c.githubToken || !c.githubRepo){
        dot.className="status-dot offline";
        text.textContent="Not Configured";
        return false;
    }
    try{
        const response=await fetch(`https://api.github.com/repos/${c.githubRepo}`,{
            headers:{Authorization:`Bearer ${c.githubToken}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},
            cache:"no-store"
        });
        dot.className="status-dot " + (response.ok ? "online":"offline");
        text.textContent=response.ok ? "Connected":"Connection Failed";
        return response.ok;
    }catch(e){
        dot.className="status-dot offline";
        text.textContent="Offline";
        return false;
    }
}

function mountStage(){
    initState();
    initCommon();
    const stage=Number(document.body.dataset.stage || 1);
    currentStage=stage;
    if(stage === 1 && state.workflow.currentStage > 1 && state.workflow.currentStage < 8 && !new URLSearchParams(location.search).has("draft") && !new URLSearchParams(location.search).has("mode")){
        const resume = state.workflow.currentStage;
        if(!state.workflow.completed.includes(resume - 1)){
            state.workflow.currentStage = 1;
        }else{
            location.replace(["index.html","hackax-next2.html","hackax-next3.html","hackax-next4.html","hackax-next5.html","hackax-next6.html","hackax-next7.html","hackax-overview.html"][resume-1]);
            return;
        }
    }
    currentStage=stage;
    state.workflow.currentStage=stage;
    if(stage === 1) initStage1();
    if(stage === 2) initStage2();
    if(stage === 3) initStage3();
    if(stage === 4) initStage4();
    if(stage === 5) initStage5();
    if(stage === 6) initStage6();
    if(stage === 7) initStage7();
    if(stage === 8) initReview();
    loadArticles().then(()=>{
        renderLinkSuggestions();
        renderStage6Metrics();
        renderTechnicalChecks();
        renderReview();
    });
    checkGitHub();
}

HAX.state = () => state;
HAX.save = () => saveState(true);
HAX.next = nextStage;
HAX.back = previousStage;
HAX.toast = toast;
HAX.refreshArticles = loadArticles;
HAX.publish = publishArticle;

document.addEventListener("DOMContentLoaded",mountStage);
})();
