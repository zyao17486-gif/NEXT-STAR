import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const PRODUCTION_ORIGIN = "https://next-star-5s9.pages.dev";
const LOCAL_ORIGIN = "http://localhost:5173";
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.next-star-5s9\.pages\.dev$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === PRODUCTION_ORIGIN || origin === LOCAL_ORIGIN || PREVIEW_ORIGIN.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("Origin not allowed"));
  },
}));
app.use(express.json({ limit: "32kb", strict: true }));
app.use((_req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
  });
  next();
});

// ── In-memory rate limiters (per trusted proxy IP) ───────────────────────
const limiterStores = [];

function createRateLimiter(limit, windowMs) {
  const store = new Map();
  limiterStores.push(store);

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const current = store.get(key);
    const entry = current?.resetAt > now
      ? current
      : { count: 0, resetAt: now + windowMs };

    if (entry.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ error: "请求过于频繁，请稍后再试" });
    }
    entry.count++;
    store.set(key, entry);
    next();
  };
}

const scoutRateLimit = createRateLimiter(10, 60_000);
const translateRateLimit = createRateLimiter(3, 60 * 60_000);

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const store of limiterStores) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }
}, 60_000);
cleanupTimer.unref();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const PORT = process.env.PORT || 3001;
const MAX_QUERY_LENGTH = 300;
const MAX_TRANSLATION_LENGTH = 8_000;

// ── Load 20-player 2026 draft database ────────────────────────────────────
const DB_PATH = join(__dirname, "data", "2026-draft-database.json");

/** @type {Array<{id:number,name:string,position:string,team:string,profile_text:string,attributes:{finishing:number,shooting:number,playmaking:number,defense:number,athleticism:number},tags:string[],combine:object,embedding:number[]}>} */
let PLAYER_DB = [];

function loadDatabase() {
  if (!existsSync(DB_PATH)) {
    console.error(`⚠ Database not found at ${DB_PATH}`);
    return;
  }
  try {
    PLAYER_DB = JSON.parse(readFileSync(DB_PATH, "utf-8"));
    console.log(`📋 Loaded ${PLAYER_DB.length} players from 2026 draft database`);
  } catch (err) {
    console.error("Failed to load player database:", err.message);
  }
}
loadDatabase();

// ── Cosine similarity ─────────────────────────────────────────────────────
/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity score [0, 1]
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── 13D attribute keys (matches frontend) ──────────────────────────────────
const ATTR_13D_KEYS = [
  "身体", "突破", "篮下", "背身", "中投", "三分",
  "传球", "控运", "内防", "外防", "抢断", "盖帽", "篮板",
];

/**
 * Convert attributes object → 13D number array
 * Supports both old 6D and new 13D attribute formats
 */
function attrsToVector(attrs) {
  // Primary path: new 13D Chinese keys
  if (ATTR_13D_KEYS.some(k => k in attrs)) {
    return ATTR_13D_KEYS.map(k => attrs[k] ?? 50);
  }
  // Fallback: LLM output uses English keys matching VECTOR_PROMPT
  return [
    attrs.athleticism           ?? 50,  // 身体
    attrs.driving               ?? 50,  // 突破
    attrs.insideScoring         ?? 50,  // 篮下
    attrs.postScoring           ?? 30,  // 背身
    attrs.midRange              ?? 50,  // 中投
    attrs.threePoint            ?? 50,  // 三分
    attrs.passing               ?? 50,  // 传球
    attrs.ballHandling          ?? 50,  // 控运
    attrs.interiorDefense       ?? 50,  // 内防
    attrs.perimeterDefense      ?? 50,  // 外防
    attrs.steal                 ?? 50,  // 抢断
    attrs.block                 ?? 50,  // 盖帽
    attrs.rebounding            ?? 50,  // 篮板
  ];
}

// ── LLM helpers ───────────────────────────────────────────────────────────
class UpstreamAIError extends Error {
  constructor(status) {
    super(`DeepSeek request failed with status ${status}`);
    this.name = "UpstreamAIError";
    this.status = status;
  }
}

async function requestDeepSeek(systemPrompt, userMessage, maxTokens = 1024, temperature = 0.5) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new UpstreamAIError(response.status);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new UpstreamAIError(502);
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

async function callDeepSeek(systemPrompt, userMessage, maxTokens = 1024) {
  const raw = await requestDeepSeek(systemPrompt, userMessage, maxTokens);

  // Strip markdown code fences
  let jsonStr = raw.trim();
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();

  return JSON.parse(jsonStr);
}

function sendAIError(res, error, operation) {
  if (error?.name === "AbortError") {
    console.error(`${operation} timed out`);
    return res.status(504).json({ error: "AI 响应超时，请稍后重试" });
  }
  if (error instanceof UpstreamAIError) {
    console.error(`${operation} upstream failure:`, error.status);
    return res.status(502).json({ error: "AI 服务暂时不可用，请稍后重试" });
  }
  console.error(`${operation} failed:`, error?.message || error);
  return res.status(500).json({ error: "AI 服务处理失败，请稍后重试" });
}

function validateDnaVector(value) {
  return value === undefined || (
    Array.isArray(value) &&
    value.length === ATTR_13D_KEYS.length &&
    value.every(item => Number.isFinite(item) && item >= 0 && item <= 100)
  );
}

// ── Chinese NBA player name aliases (abbreviation → full English) ─────────
// DeepSeek may not recognize abbreviated Chinese names; augment queries with the
// full English name to disambiguate before sending to the LLM.
const CN_NAME_ALIASES = {
  "亚历山大": "Shai Gilgeous-Alexander",
  "扬尼斯": "Giannis Antetokounmpo",
  "字母哥": "Giannis Antetokounmpo",
  "勒布朗": "LeBron James",
  "老詹": "LeBron James",
  "库里": "Stephen Curry",
  "杜兰特": "Kevin Durant",
  "KD": "Kevin Durant",
  "约基奇": "Nikola Jokic",
  "恩比德": "Joel Embiid",
  "东契奇": "Luka Doncic",
  "浓眉": "Anthony Davis",
  "哈登": "James Harden",
  "欧文": "Kyrie Irving",
  "塔图姆": "Jayson Tatum",
  "巴特勒": "Jimmy Butler",
  "伦纳德": "Kawhi Leonard",
  "乔治": "Paul George",
  "威少": "Russell Westbrook",
  "保罗": "Chris Paul",
  "韦德": "Dwyane Wade",
  "科比": "Kobe Bryant",
  "乔丹": "Michael Jordan",
  "奥尼尔": "Shaquille O'Neal",
  "邓肯": "Tim Duncan",
  "加内特": "Kevin Garnett",
  "诺维茨基": "Dirk Nowitzki",
  "文班": "Victor Wembanyama",
  "文班亚马": "Victor Wembanyama",
  "锡安": "Zion Williamson",
  "莫兰特": "Ja Morant",
  "爱德华兹": "Anthony Edwards",
  "布克": "Devin Booker",
  "利拉德": "Damian Lillard",
  "唐斯": "Karl-Anthony Towns",
};

/**
 * Resolve Chinese player name abbreviations to their canonical English form
 * for the LLM call. The LLM reliably knows NBA players by English name but
 * struggles with abbreviated Chinese names. The original query is preserved
 * for logging; only the LLM-facing prompt uses the resolved name.
 *
 * Returns { llmQuery, originalQuery } — llmQuery is what we send to DeepSeek.
 */
function resolveQuery(query) {
  const trimmed = query.trim();
  for (const [cn, en] of Object.entries(CN_NAME_ALIASES)) {
    if (trimmed.includes(cn)) {
      // Replace ONLY the Chinese fragment with the English name, preserving
      // any surrounding descriptive text the user may have typed.
      const resolved = trimmed.replace(cn, en);
      return { llmQuery: resolved, originalQuery: trimmed };
    }
  }
  return { llmQuery: trimmed, originalQuery: trimmed };
}

// ── Prompt 1: Query → 13D vector ──────────────────────────────────────────
const VECTOR_PROMPT = `You are an NBA scouting data scientist. Convert any natural-language player query into a 13-dimensional attribute vector and a query description.

## The 13 dimensions (each 0-100, based on NBA 2K-style attributes):
1. **athleticism** — 身体天赋：speed, vertical, strength, agility composite
2. **driving** — 突破：face-up driving ability, first step, speed with ball
3. **insideScoring** — 篮下终结：close shot, layup package, standing dunk
4. **postScoring** — 背身进攻：post control, post fade, post hook
5. **midRange** — 中投：mid-range shooting, pull-ups, turnaround jumpers
6. **threePoint** — 三分：three-point shooting, off-movement shooting, range
7. **passing** — 组织传球：pass accuracy, court vision, pick-and-roll reads
8. **ballHandling** — 控运：ball handle, dribble moves, speed with ball
9. **interiorDefense** — 内线防守：interior defense, rim protection help
10. **perimeterDefense** — 外线防守：on-ball perimeter defense, screen navigation
11. **steal** — 抢断：steals, passing lane disruption
12. **block** — 盖帽：shot blocking, vertical contest
13. **rebounding** — 篮板：offensive/defensive rebounding, box-out positioning

## Rules:
- If the user mentions a specific NBA player, set the vector to match that player's known profile
- If the user describes traits (e.g., "defensive stopper who can shoot"), translate directly
- Be decisive — don't put everything at 50
- 65 = NBA rotation-level (passable), 80 = elite, 90 = top-tier, 99 = all-time ceiling

## Output ONLY valid JSON (no markdown, no code fences):
{
  "vector": { "athleticism": 82, "driving": 85, "insideScoring": 70, "postScoring": 35, "midRange": 88, "threePoint": 78, "passing": 72, "ballHandling": 80, "interiorDefense": 40, "perimeterDefense": 75, "steal": 70, "block": 30, "rebounding": 45 },
  "queryDescription": "One English sentence describing what the user is looking for",
  "comparedPlayer": "Jaylen Brown"
}`;

// ── Prompt 2: Generate explanations for top 3 ─────────────────────────────
const EXPLAIN_PROMPT = `You are an elite NBA draft scout explaining why specific 2026 prospects match a user's query.
The ranking is already determined by statistical cosine similarity — you just explain WHY.

## Output ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "name": "exact Chinese name from the input",
      "en": "exact English name from the input",
      "matchScore": 85,
      "reason": "Concise Chinese explanation (under 120 chars) of why this prospect fits the query",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "risks": ["risk 1", "risk 2"]
    }
  ],
  "summary": "One-sentence overall analysis in Chinese (under 80 chars)"
}

## Rules:
- **name and en MUST be typed exactly as provided in the input — no rewriting or transliteration**
- matchScore MUST use the exact score from the input
- reason should reference the player's actual profile_text details
- All text in Chinese except player English names`;

// ── POST /api/scout (V2) ──────────────────────────────────────────────────
app.post("/api/scout", scoutRateLimit, async (req, res) => {
  const { query, dnaVector } = req.body || {};

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "请提供搜索问题" });
  }
  if (query.trim().length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `搜索问题不能超过 ${MAX_QUERY_LENGTH} 个字符` });
  }
  if (!validateDnaVector(dnaVector)) {
    return res.status(400).json({ error: "DNA 数据格式无效" });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  if (PLAYER_DB.length === 0) {
    return res.status(500).json({ error: "球员数据库未加载" });
  }

  try {
    // ── Phase 1: Query → Vector ─────────────────────────────────────────
    const { llmQuery, originalQuery } = resolveQuery(query.trim());
    console.log(`🔍 Phase 1: Converting query to vector — "${originalQuery}"${llmQuery !== originalQuery ? ` → "${llmQuery}"` : ""}`);

    const vectorResult = await callDeepSeek(
      VECTOR_PROMPT,
      `User query: "${llmQuery}"`,
      512
    );

    const queryVector = attrsToVector(vectorResult.vector);
    const queryDesc = vectorResult.queryDescription || originalQuery;
    const comparedPlayer = vectorResult.comparedPlayer || "none";

    console.log(`   Vector: [${queryVector.map(v => v.toFixed(0)).join(", ")}]`);
    console.log(`   Description: ${queryDesc}`);

    // ── Blend with user DNA vector if provided ───────────────────────────
    const hasDNA = dnaVector && Array.isArray(dnaVector) && dnaVector.length >= 5;
    if (hasDNA) {
      console.log(`   🧬 Blending with user DNA: [${dnaVector.map(v => v.toFixed(0)).join(", ")}]`);
    }

    // 70% query intent + 30% user DNA profile (when DNA is available) — 13D support
    const finalVector = hasDNA
      ? queryVector.map((v, i) => Math.round(v * 0.7 + (dnaVector[i] ?? 50) * 0.3))
      : queryVector;

    if (hasDNA) {
      console.log(`   Blended vector: [${finalVector.map(v => v.toFixed(0)).join(", ")}]`);
    }

    // ── Phase 2: Cosine similarity ranking ───────────────────────────────
    console.log("📊 Phase 2: Computing cosine similarity...");

    const scored = PLAYER_DB.map((player) => {
      const playerVector = attrsToVector(player.attributes);
      const attrSim = cosineSimilarity(finalVector, playerVector);

      // Blend with embedding similarity for nuance (20% weight)
      const embSim = cosineSimilarity(finalVector.slice(0, 10), player.embedding.slice(0, 10));
      const combinedScore = attrSim * 0.8 + embSim * 0.2;

      return { player, score: Math.round(combinedScore * 100), rawScore: combinedScore };
    });

    scored.sort((a, b) => b.rawScore - a.rawScore);
    const top3 = scored.slice(0, 3);

    console.log(`   Top 3: ${top3.map(s => `${s.player.name} (${s.score}%)`).join(", ")}`);

    // ── Phase 3: LLM explains the top 3 ─────────────────────────────────
    console.log("💬 Phase 3: Generating explanations...");

    const top3Context = top3.map((s, i) => ({
      rank: i + 1,
      name: s.player.name,
      en: s.player.name, // Our DB uses English names in the 'name' field
      position: s.player.position,
      team: s.player.team,
      matchScore: s.score,
      attributes: s.player.attributes,
      profile: s.player.profile_text.slice(0, 400),
      tags: s.player.tags,
    }));

    const explainResult = await callDeepSeek(
      EXPLAIN_PROMPT,
      `User query: "${query.trim()}"
Query description: ${queryDesc}
Compared NBA player: ${comparedPlayer}

Top 3 matches (ranked by cosine similarity):
${JSON.stringify(top3Context, null, 2)}

Generate explanations for why each prospect matches the query.`,
      1536
    );

    // ── Merge match scores (LLM scores are decorative; use our computed scores) ──
    const recommendations = (explainResult.recommendations || []).map((rec, i) => ({
      ...rec,
      matchScore: top3[i]?.score ?? rec.matchScore,
    }));

    const result = {
      recommendations,
      summary: explainResult.summary || "",
      _meta: {
        algorithm: "cosine-similarity",
        queryVector: vectorResult.vector,
        comparedPlayer,
      },
    };

    console.log(`✅ Scout complete — returned ${recommendations.length} recommendations`);
    res.json(result);
  } catch (err) {
    return sendAIError(res, err, "Scout request");
  }
});

// ── POST /api/scout/quick (fast mode — vector only, no explanation) ───────
app.post("/api/scout/quick", scoutRateLimit, async (req, res) => {
  const { query, dnaVector } = req.body || {};
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "请提供搜索问题" });
  }
  if (query.trim().length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `搜索问题不能超过 ${MAX_QUERY_LENGTH} 个字符` });
  }
  if (!validateDnaVector(dnaVector)) {
    return res.status(400).json({ error: "DNA 数据格式无效" });
  }
  if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: "AI 服务未配置" });
  if (PLAYER_DB.length === 0) return res.status(500).json({ error: "球员数据库未加载" });

  try {
    const { llmQuery } = resolveQuery(query.trim());
    const vectorResult = await callDeepSeek(VECTOR_PROMPT, `User query: "${llmQuery}"`, 512);
    const queryVector = attrsToVector(vectorResult.vector);

    // Blend with user DNA vector if provided — 6D support
    const hasDNA = dnaVector && Array.isArray(dnaVector) && dnaVector.length >= 5;
    const finalVector = hasDNA
      ? queryVector.map((v, i) => Math.round(v * 0.7 + (dnaVector[i] ?? 50) * 0.3))
      : queryVector;

    const scored = PLAYER_DB.map((player) => {
      const playerVector = attrsToVector(player.attributes);
      const embSim = cosineSimilarity(finalVector.slice(0, 10), player.embedding.slice(0, 10));
      const score = Math.round((cosineSimilarity(finalVector, playerVector) * 0.8 + embSim * 0.2) * 100);
      return { id: player.id, name: player.name, position: player.position, team: player.team, score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json({ recommendations: scored.slice(0, 5), queryVector: vectorResult.vector });
  } catch (err) {
    return sendAIError(res, err, "Quick scout request");
  }
});

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!DEEPSEEK_API_KEY,
    playersLoaded: PLAYER_DB.length,
    algorithm: "cosine-similarity-v2",
  });
});

// ── Profile translation endpoint ────────────────────────────────────────────
const TRANSLATE_PROMPT = `You are a professional Chinese basketball translator. Translate the following NBA draft scouting report into fluent, natural Chinese.

Rules:
- Use standard Chinese basketball terminology (e.g., "终结能力" for finishing, "挡拆" for pick-and-roll, "护框" for rim protection)
- Keep player names, team names, and statistics in their original form
- Preserve all factual details and measurements
- Output ONLY the Chinese translation, no explanations or notes
- Make it read like a professional Chinese sports article`;

app.post("/api/translate", translateRateLimit, async (req, res) => {
  const { text } = req.body || {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "请提供要翻译的文本" });
  }
  if (text.trim().length > MAX_TRANSLATION_LENGTH) {
    return res.status(400).json({ error: `翻译文本不能超过 ${MAX_TRANSLATION_LENGTH} 个字符` });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  try {
    console.log(`🌐 Translating profile (${text.length} chars)...`);

    const translated = await requestDeepSeek(TRANSLATE_PROMPT, text.trim(), 2048, 0.3);

    console.log(`   Translated (${translated.length} chars)`);
    res.json({ translated });
  } catch (err) {
    return sendAIError(res, err, "Translation request");
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "接口不存在" });
});

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "请求内容过大" });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "JSON 格式无效" });
  }
  if (error?.message === "Origin not allowed") {
    return res.status(403).json({ error: "来源不允许" });
  }
  console.error("Unhandled server error:", error?.message || error);
  return res.status(500).json({ error: "服务器处理失败" });
});

app.listen(PORT, () => {
  console.log(`🏀 Scout Agent V2 running on http://localhost:${PORT}`);
  console.log(`   DeepSeek API: ${DEEPSEEK_API_KEY ? "✓ configured" : "✗ NOT configured"}`);
  console.log(`   Player DB:    ${PLAYER_DB.length} prospects loaded`);
  console.log(`   Algorithm:    cosine similarity (LLM explains, math ranks)`);
});
