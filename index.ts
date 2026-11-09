#!/usr/bin/env node
/**
 * buy-crypto-pressrelease-faq-generator
 * Buy Crypto Press Release FAQ Generator: library and CLI.
 *
 * Type a question in plain English and get the best official answer from 50
 * BuyCryptoPressRelease.com FAQs, with a match confidence score (0 to 100).
 * It can also generate the FAQ as Markdown, JSON, FAQPage JSON-LD or HTML.
 *
 *   bcpr-faq "how much does a crypto press release cost"
 *   bcpr-faq --top 3 "can i pay with usdt"
 *   bcpr-faq --list pricing
 *   bcpr-faq --export jsonld
 *
 * Built by BuyCryptoPressRelease.com (https://buycryptopressrelease.com/). MIT License.
 */

export const VERSION = "1.0.0";
export const WEBSITE = "https://buycryptopressrelease.com/";
export const SERVICE_PAGE = "https://buycryptopressrelease.com/";
export const REPO = "https://github.com/buycryptopressrelease/buy-crypto-pressrelease-faq-generator";

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface Result {
  id: number;
  category: string;
  question: string;
  answer: string;
  confidence: number;
  band: string;
}

export type ExportFormat = "markdown" | "json" | "jsonld" | "html";

const STOPWORDS = new Set(
  ("a an the is are was were be been do does did can could will would should " +
    "i me my we our you your it its to of in on for with and or at by from as " +
    "how what which who when where why this that there their them they if so " +
    "any get got have has about into up out than then just very need want much").split(" ")
);

const SYNONYMS: Record<string, string> = {
  "cost": "price", "costs": "price", "pricing": "price", "prices": "price",
  "backlink": "link", "backlinks": "link", "hyperlink": "link", "follow": "dofollow",
  "charge": "fee", "charges": "fee", "fees": "fee",
  "remove": "removal", "removed": "removal", "removing": "removal",
  "takedown": "removal", "delete": "removal", "deleted": "removal",
  "chatgpt": "ai", "llm": "ai", "gemini": "ai", "perplexity": "ai", "geo": "ai",
  "web3": "crypto", "blockchain": "crypto", "token": "crypto", "tokens": "crypto",
  "pr": "press", "release": "press", "releases": "press",
  "refunds": "refund", "pay": "payment", "paying": "payment",
  "long": "time", "quick": "fast", "quickly": "fast", "faster": "fast",
  "article": "article", "articles": "article", "post": "article",
  "ranking": "rank", "rankings": "rank", "ranked": "rank",
  "visitors": "traffic", "visits": "traffic",
  "mistake": "error", "mistakes": "error", "typo": "error", "typos": "error",
  "contact": "support", "whatsapp": "support",
  "cancel": "refund", "money": "refund",
  "use": "benefit", "using": "benefit", "benefits": "benefit", "advantage": "benefit", "advantages": "benefit",
  "site": "website", "sites": "website", "websites": "website", "several": "multiple",
  "negotiate": "counteroffer", "bundle": "combo", "bundles": "combo", "purchase": "buy", "individual": "single",
  "pictures": "image", "photos": "image", "photo": "image", "images": "image"
};

const WEIGHTS = { question: 2.0, keywords: 1.5, answer: 0.5 };

export const BANDS: [number, number, string, string][] = [
  [0, 30, "No match", "Rephrase the question or contact support"],
  [31, 60, "Possible match", "Answer may be related; check the question shown"],
  [61, 80, "Good match", "Answer is likely what you need"],
  [81, 100, "Strong match", "Answer directly addresses the question"],
];

export const CATEGORIES: Record<string, string> = {
  "distribution": "Crypto press release distribution, single placements and combo packages",
  "pricing": "Prices, named combo packages and counteroffers",
  "writing": "Press release writing, drafts, briefs, revisions and approval",
  "publication": "Google indexing, dofollow links, live URLs and timelines",
  "payments": "Crypto and card payments, presale, ICO, IDO, NFT, DeFi and cloud mining PR"
};

export const FAQS: FAQ[] = [
  {"id": 1, "category": "distribution", "question": "What is BuyCryptoPressRelease.com?", "answer": "BuyCryptoPressRelease.com is a cryptocurrency press release distribution platform that helps Web3 projects publish announcements across crypto, finance, business and technology media outlets.", "keywords": ["buycryptopressrelease", "platform", "about", "what", "who"]},
  {"id": 2, "category": "distribution", "question": "What services does BuyCryptoPressRelease.com offer?", "answer": "The platform offers individual media placements and prebuilt combo packages for crypto presales, ICOs, IDOs, NFTs, exchange listings, token launches, DeFi, cloud mining and other Web3 announcements.", "keywords": ["services", "offer", "products", "types", "list"]},
  {"id": 3, "category": "distribution", "question": "How does crypto press release distribution work?", "answer": "Choose an individual publication or combo package, submit your press release or brief, review and approve the prepared content, and the team distributes it to the selected outlets. You receive verified live URLs for confirmed placements.", "keywords": ["how", "works", "process", "steps", "distribution"]},
  {"id": 4, "category": "distribution", "question": "Can I buy a press release placement on a single website?", "answer": "Yes. The platform offers individual outlet placements starting at $20. You can select a specific publication instead of buying a multi outlet package.", "keywords": ["single", "one", "website", "outlet", "individual", "placement"]},
  {"id": 5, "category": "distribution", "question": "What is a crypto press release combo package?", "answer": "A combo package is a predefined distribution bundle containing several publications at one fixed price. Each package has a specified list of included outlets.", "keywords": ["combo", "package", "bundle", "meaning"]},
  {"id": 6, "category": "distribution", "question": "Can I customize a combo package by selecting my own websites?", "answer": "No. The website offers prebuilt combo packages with fixed publication combinations. Custom mixing of outlets between different packages is not available.", "keywords": ["customize", "custom", "mix", "choose", "own", "websites"]},
  {"id": 7, "category": "distribution", "question": "What is the difference between a single placement and a combo package?", "answer": "A single placement covers one publication at a fixed price. A combo package includes several predefined publications at a combined fixed price.", "keywords": ["difference", "single", "placement", "combo", "compare"]},
  {"id": 8, "category": "distribution", "question": "What types of crypto projects can use the platform?", "answer": "The platform serves crypto presales, ICOs, IDOs, NFT projects, DeFi protocols, cloud mining platforms, exchanges, token launches, metaverse projects and other Web3 businesses.", "keywords": ["types", "projects", "who", "can", "use", "eligible"]},
  {"id": 9, "category": "distribution", "question": "Does BuyCryptoPressRelease.com distribute announcements outside the crypto industry?", "answer": "Yes. Its publication network includes crypto and finance outlets as well as broader business and technology publications. The available options depend on the selected product.", "keywords": ["outside", "non", "crypto", "business", "technology", "finance"]},
  {"id": 10, "category": "distribution", "question": "How many media outlets are available through BuyCryptoPressRelease.com?", "answer": "The homepage advertises a network of more than 320 outlets. The publications available to you depend on the individual placements and combo packages listed on the website.", "keywords": ["how", "many", "outlets", "network", "320", "sites", "number"]},
  {"id": 11, "category": "pricing", "question": "What is the starting price for crypto press release distribution?", "answer": "Individual publication placements start at $20. Prices for other placements and combo packages vary by product.", "keywords": ["starting", "price", "cost", "cheapest", "how", "much", "minimum"]},
  {"id": 12, "category": "pricing", "question": "How much does the Power Pack combo cost?", "answer": "The Power Pack is listed at $114. It includes StreetInsider, Big News Network and FinancialContent placements. Check the website for the current price.", "keywords": ["power", "pack", "price", "cost"]},
  {"id": 13, "category": "pricing", "question": "What websites are included in the Power Pack?", "answer": "The Power Pack includes StreetInsider, Big News Network and FinancialContent. It also includes Google indexed article placements, dofollow links where the outlet supports them, and verified live URLs after publication.", "keywords": ["power", "pack", "websites", "included", "outlets", "streetinsider", "financialcontent"]},
  {"id": 14, "category": "pricing", "question": "What is the Prime Press Network package?", "answer": "Prime Press Network is an India focused PR combo listed at $385. It includes PTI Wire, TheWire.in, Tribune India and IndiaTechnologyNews.", "keywords": ["prime", "press", "network", "india", "pti", "tribune"]},
  {"id": 15, "category": "pricing", "question": "What is the CoinPedia + Binance Combo?", "answer": "It is a $450 combo package featuring CoinPedia and Binance coverage, aimed at token launches, presales, blockchain projects, DeFi, partnerships, product launches and Web3 campaigns.", "keywords": ["coinpedia", "binance", "combo"]},
  {"id": 16, "category": "pricing", "question": "What is the OpenPR + StreetInsider + Big News Network Combo?", "answer": "This is a $71 package that includes placements on OpenPR, StreetInsider and Big News Network, giving you coverage across three publications.", "keywords": ["openpr", "streetinsider", "big", "news", "network", "combo"]},
  {"id": 17, "category": "pricing", "question": "Are combo packages available at fixed prices?", "answer": "Yes. Combo packages are prebuilt products with defined publication combinations and fixed listed prices.", "keywords": ["fixed", "prices", "combo", "set"]},
  {"id": 18, "category": "pricing", "question": "Can I purchase multiple individual placements?", "answer": "Yes. You can select any available individual publications and place separate orders to match your distribution needs.", "keywords": ["multiple", "several", "individual", "placements", "orders"]},
  {"id": 19, "category": "pricing", "question": "How can I find the right crypto press release package?", "answer": "Compare the publication names, package price, included outlets, target audience and distribution details, then choose the individual placement or combo that best fits your announcement.", "keywords": ["right", "best", "package", "choose", "which", "find"]},
  {"id": 20, "category": "pricing", "question": "Can I submit a counteroffer for a combo package?", "answer": "Yes. The homepage invites customers to submit counteroffers on packages, and the team says it responds within hours.", "keywords": ["counteroffer", "negotiate", "offer", "discount"]},
  {"id": 21, "category": "writing", "question": "Does BuyCryptoPressRelease.com write crypto press releases?", "answer": "Yes. The team writes crypto press releases at no extra cost as part of the distribution process. You can submit a brief instead of a finished draft.", "keywords": ["write", "writing", "writer", "copywriting"]},
  {"id": 22, "category": "writing", "question": "Is press release writing included in the distribution price?", "answer": "Yes. According to the homepage, the editorial team writes and polishes the press release at no extra cost.", "keywords": ["writing", "included", "free", "extra", "cost"]},
  {"id": 23, "category": "writing", "question": "Can I upload my own press release draft?", "answer": "Yes. You can upload your existing draft for the team to review and prepare for distribution.", "keywords": ["upload", "own", "draft", "existing"]},
  {"id": 24, "category": "writing", "question": "Can I submit a brief instead of a complete press release?", "answer": "Yes. Send a brief with your announcement details, and the editorial team turns it into a complete press release.", "keywords": ["brief", "instead", "outline", "details"]},
  {"id": 25, "category": "writing", "question": "Can I review the press release before distribution?", "answer": "Yes. The team prepares the content and shares it with you for review and approval before distribution begins.", "keywords": ["review", "approve", "before", "preview"]},
  {"id": 26, "category": "writing", "question": "Are revisions included in the press release writing service?", "answer": "Yes. The homepage states that revisions are included as part of the writing process.", "keywords": ["revisions", "edits", "changes", "included"]},
  {"id": 27, "category": "writing", "question": "How does the editorial team prepare a crypto press release?", "answer": "The team writes and polishes your announcement for SEO, tone and crypto readability, based on the information in your draft or brief.", "keywords": ["editorial", "team", "prepare", "seo", "tone"]},
  {"id": 28, "category": "writing", "question": "What happens after I approve the press release?", "answer": "After you approve it, the team distributes it to the publications in your selected individual placement or combo package.", "keywords": ["after", "approve", "approval", "next"]},
  {"id": 29, "category": "writing", "question": "Can I submit a press release for a token launch?", "answer": "Yes. The platform offers token launch and listing PR for token launches, listing updates and post presale visibility.", "keywords": ["token", "launch", "listing", "pr"]},
  {"id": 30, "category": "writing", "question": "Can I distribute an exchange listing announcement?", "answer": "Yes. BuyCryptoPressRelease.com offers exchange listing announcement PR for CEX, DEX and trading pair listing news.", "keywords": ["exchange", "listing", "announcement", "cex", "dex", "trading", "pair"]},
  {"id": 31, "category": "publication", "question": "Are press releases published on Google indexed websites?", "answer": "The website advertises Google indexed article placements across its network, and its homepage states that all outlets in the network deliver Google indexed placements.", "keywords": ["google", "indexed", "indexing", "search"]},
  {"id": 32, "category": "publication", "question": "Does BuyCryptoPressRelease.com provide dofollow backlinks?", "answer": "The website advertises dofollow links where the outlet supports them. Link attributes depend on each publication's own policies.", "keywords": ["dofollow", "backlinks", "links", "nofollow"]},
  {"id": 33, "category": "publication", "question": "Will I receive live publication URLs?", "answer": "Yes. The platform provides verified live URLs for every confirmed publication after distribution.", "keywords": ["live", "urls", "links", "proof", "report"]},
  {"id": 34, "category": "publication", "question": "How long does it take for a crypto press release to go live?", "answer": "Each publication follows its own editorial timeline. The team tells you the expected publishing window for each outlet upfront.", "keywords": ["how", "long", "time", "fast", "live", "days", "timeline"]},
  {"id": 35, "category": "publication", "question": "Can all publications in a combo package publish on the same day?", "answer": "Not necessarily. Each outlet follows its own editorial timeline, so publication dates can differ within a combo package.", "keywords": ["same", "day", "all", "combo", "publish", "together"]},
  {"id": 36, "category": "publication", "question": "Does the platform guarantee a specific publication date?", "answer": "The team shares expected publication windows for your selected outlets. Actual timing depends on each outlet's editorial schedule.", "keywords": ["guarantee", "specific", "date", "exact", "schedule"]},
  {"id": 37, "category": "publication", "question": "Can I use the live publication URLs after distribution?", "answer": "Yes. You can share the verified live URLs with your community and use them to reference your published announcements.", "keywords": ["use", "share", "urls", "community", "after"]},
  {"id": 38, "category": "publication", "question": "Can I see sample press release publications before ordering?", "answer": "Yes. Some individual publication product pages have a View Sample Work option so you can see examples before buying.", "keywords": ["sample", "examples", "work", "before", "ordering"]},
  {"id": 39, "category": "publication", "question": "Does the platform offer international media coverage?", "answer": "Yes. The publication network includes outlets serving different markets, including international crypto and finance audiences. Coverage depends on the selected product.", "keywords": ["international", "global", "coverage", "markets", "countries"]},
  {"id": 40, "category": "publication", "question": "Are publication placements guaranteed once I place an order?", "answer": "The platform distributes to your selected outlets and provides verified URLs for confirmed placements. Publication is still subject to each outlet's editorial process and requirements.", "keywords": ["guaranteed", "placement", "order", "rejected", "editorial"]},
  {"id": 41, "category": "payments", "question": "What payment methods does BuyCryptoPressRelease.com accept?", "answer": "The homepage lists Bitcoin (BTC), Ethereum (ETH), USDT on ERC20 and TRC20, Solana (SOL) and card payments through Stripe.", "keywords": ["payment", "methods", "pay", "accepted", "options"]},
  {"id": 42, "category": "payments", "question": "Can I pay for a press release using Bitcoin?", "answer": "Yes. Bitcoin is one of the cryptocurrency payment methods listed by BuyCryptoPressRelease.com.", "keywords": ["bitcoin", "btc", "pay"]},
  {"id": 43, "category": "payments", "question": "Can I pay using USDT?", "answer": "Yes. The platform accepts USDT on both the ERC20 and TRC20 networks.", "keywords": ["usdt", "tether", "erc20", "trc20"]},
  {"id": 44, "category": "payments", "question": "Can I pay using Ethereum or Solana?", "answer": "Yes. ETH and SOL are listed among the accepted cryptocurrency payment options.", "keywords": ["ethereum", "eth", "solana", "sol"]},
  {"id": 45, "category": "payments", "question": "Can I pay using a credit or debit card?", "answer": "Yes. Card payments are supported through Stripe, according to the website.", "keywords": ["card", "credit", "debit", "stripe"]},
  {"id": 46, "category": "payments", "question": "Does BuyCryptoPressRelease.com offer crypto presale PR distribution?", "answer": "Yes. The platform offers crypto presale press release distribution to help projects build visibility before their token sale opens.", "keywords": ["presale", "token", "sale", "pr"]},
  {"id": 47, "category": "payments", "question": "Can I distribute ICO and IDO announcements?", "answer": "Yes. The platform has ICO and IDO press release services for fundraising announcements, launchpad campaigns and investor updates.", "keywords": ["ico", "ido", "launchpad", "fundraising"]},
  {"id": 48, "category": "payments", "question": "Does BuyCryptoPressRelease.com offer NFT press release distribution?", "answer": "Yes. Its NFT service covers collection launches, mint announcements, marketplace developments and Web3 art projects.", "keywords": ["nft", "collection", "mint", "marketplace", "art"]},
  {"id": 49, "category": "payments", "question": "Can DeFi projects distribute press releases through the platform?", "answer": "Yes. The DeFi PR service supports announcements about protocol launches, liquidity updates, staking and ecosystem developments.", "keywords": ["defi", "protocol", "liquidity", "staking"]},
  {"id": 50, "category": "payments", "question": "Does BuyCryptoPressRelease.com offer cloud mining and Web3 press release distribution?", "answer": "Yes. The platform lists cloud mining press release distribution and metaverse and Web3 press release services for relevant project announcements.", "keywords": ["cloud", "mining", "metaverse", "web3"]},
];

/** Lowercase, split, drop stopwords, singularise and map synonyms. */
export function tokenize(text: string): string[] {
  const t = text
    .toLowerCase()
    .split("bhmarketer.ai").join("bhmarketer")
    .split("buycryptopressrelease").join("buy crypto press release")
    .split("big news network").join("bignewsnetwork");
  const out: string[] = [];
  for (let w of t.split(/[^a-z0-9]+/)) {
    if (!w || STOPWORDS.has(w)) continue;
    w = SYNONYMS[w] ?? w;
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
    w = SYNONYMS[w] ?? w;
    out.push(w);
  }
  return out;
}

function buildIndex(faq: FAQ): Map<string, number> {
  const idx = new Map<string, number>();
  const fields: [string, number][] = [
    [faq.question, WEIGHTS.question],
    [faq.keywords.join(" "), WEIGHTS.keywords],
    [faq.answer, WEIGHTS.answer],
  ];
  for (const [text, weight] of fields) {
    for (const tok of tokenize(text)) idx.set(tok, Math.max(idx.get(tok) ?? 0, weight));
  }
  return idx;
}

const INDEX = FAQS.map((f) => ({ idx: buildIndex(f), qtokens: new Set(tokenize(f.question)), faq: f }));

/** Return [label, meaning] for a confidence score. */
export function band(score: number): [string, string] {
  for (const [low, high, label, meaning] of BANDS) {
    if (score >= low && score <= high) return [label, meaning];
  }
  return ["No match", ""];
}

/** Return up to `top` results, best first. */
export function search(query: string, top = 1): Result[] {
  const q = Array.from(new Set(tokenize(query)));
  if (q.length === 0) return [];
  const scored: { conf: number; cover: number; faq: FAQ }[] = [];
  for (const { idx, qtokens, faq } of INDEX) {
    let points = 0;
    for (const t of q) points += idx.get(t) ?? 0;
    if (points <= 0) continue;
    const conf = Math.min(100, Math.floor((points / (WEIGHTS.question * q.length)) * 100 + 0.5));
    let hit = 0;
    for (const t of qtokens) if (q.includes(t)) hit++;
    const cover = Math.floor((hit * 1000) / Math.max(1, qtokens.size));
    scored.push({ conf, cover, faq });
  }
  scored.sort((a, b) => b.conf - a.conf || b.cover - a.cover || a.faq.id - b.faq.id);
  return scored.slice(0, top).map(({ conf, faq }) => ({
    id: faq.id, category: faq.category, question: faq.question,
    answer: faq.answer, confidence: conf, band: band(conf)[0],
  }));
}

/** Return the single best result, or null when nothing matches. */
export function ask(query: string): Result | null {
  const r = search(query, 1);
  return r.length ? r[0] : null;
}

/** Return one FAQ by number (1 to 50), or null. */
export function getFaq(id: number): FAQ | null {
  return FAQS.find((f) => f.id === id) ?? null;
}

/** Return all FAQs in a category. */
export function byCategory(category: string): FAQ[] {
  return FAQS.filter((f) => f.category === category);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

/** FAQPage JSON-LD for a list of FAQs. */
export function toJsonLd(faqs: FAQ[]): string {
  return JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question", name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }, null, 2);
}

/** Generate the FAQ (all or one category) as markdown, json, jsonld or html. */
export function exportFaq(format: ExportFormat = "markdown", category?: string): string {
  const faqs = category ? byCategory(category) : FAQS;
  const title = "Crypto Press Release FAQ";
  if (format === "json") {
    return JSON.stringify(faqs.map((f) => ({ question: f.question, answer: f.answer })), null, 2) + "\n";
  }
  if (format === "jsonld") return toJsonLd(faqs) + "\n";
  if (format === "html") {
    const items = faqs.map((f) => `  <h3>${esc(f.question)}</h3>\n  <p>${esc(f.answer)}</p>`).join("\n");
    return `<section class="bcpr-faq">\n  <h2>${esc(title)}</h2>\n${items}\n</section>\n` +
      `<script type="application/ld+json">\n${toJsonLd(faqs)}\n</script>\n`;
  }
  const lines = [`# ${title}`, ""];
  for (const f of faqs) lines.push(`## ${f.id}. ${f.question}`, "", f.answer, "");
  lines.push(`*Generated by the Buy Crypto Press Release FAQ Generator. Learn more: ${SERVICE_PAGE}*`);
  return lines.join("\n") + "\n";
}

const USAGE = `Buy Crypto Press Release FAQ Generator v${VERSION}

Usage:
  bcpr-faq "how much does a crypto press release cost"
  bcpr-faq --top 3 "can i pay with usdt"
  bcpr-faq --json "can i customize a combo package"
  bcpr-faq --list [category]
  bcpr-faq --id 11
  bcpr-faq --categories
  bcpr-faq --export markdown|json|jsonld|html [category]
  bcpr-faq --version`;

export function main(argv: string[] = process.argv.slice(2)): number {
  let args = [...argv];
  const print = (s: string) => console.log(s);
  if (!args.length || args[0] === "-h" || args[0] === "--help") { print(USAGE); return 0; }
  if (args[0] === "--version") { print(VERSION); return 0; }
  if (args[0] === "--categories") {
    for (const [c, d] of Object.entries(CATEGORIES)) {
      print(`${c.padEnd(18)} ${String(byCategory(c).length).padStart(2)}  ${d}`);
    }
    return 0;
  }
  if (args[0] === "--list") {
    const items = args.length > 1 ? byCategory(args[1]) : FAQS;
    if (!items.length) { print("Unknown category. Try --categories"); return 1; }
    for (const f of items) print(`${String(f.id).padStart(2)}. ${f.question}`);
    return 0;
  }
  if (args[0] === "--id") {
    const f = args.length > 1 && /^\d+$/.test(args[1]) ? getFaq(parseInt(args[1], 10)) : null;
    if (!f) { print("FAQ number must be 1 to 50"); return 1; }
    print(`Q${f.id}. ${f.question}\n${f.answer}`);
    return 0;
  }
  if (args[0] === "--export") {
    const fmt = (args[1] ?? "markdown") as ExportFormat;
    const cat = args[2];
    if (!["markdown", "json", "jsonld", "html"].includes(fmt) || (cat && !(cat in CATEGORIES))) {
      print("Use: --export markdown|json|jsonld|html [category]");
      return 1;
    }
    process.stdout.write(exportFaq(fmt, cat));
    return 0;
  }

  let asJson = false;
  let top = 1;
  if (args[0] === "--json") { asJson = true; args = args.slice(1); }
  if (args[0] === "--top") { top = parseInt(args[1], 10); args = args.slice(2); }
  const query = args.join(" ");
  const results = search(query, top);

  if (asJson) {
    print(JSON.stringify({ query, results }, null, 2));
    return results.length ? 0 : 1;
  }
  if (!results.length) {
    print("No matching FAQ found. Try --list to browse all 50 questions,");
    print(`or contact support: ${WEBSITE}contact/`);
    return 1;
  }
  for (const r of results) {
    print(`Q${r.id}. ${r.question}  [${r.category}]`);
    print(`   ${r.answer}`);
    print(`   Confidence: ${r.confidence}/100 (${r.band})\n`);
  }
  print(`Buy Crypto Press Release FAQ Generator v${VERSION}  |  ${SERVICE_PAGE}`);
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}
