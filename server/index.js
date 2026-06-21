import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ── Rate limiter — 10 AI searches per minute per IP ─────────────────────
const rateLimit = new Map(); // IP → { count, resetAt }
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (entry.resetAt < now) rateLimit.delete(ip);
  }
}, 60_000);

function checkRate(req, res, next) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= 10) {
      return res.status(429).json({ error: "请求过于频繁，请稍后再试" });
    }
    entry.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
  }
  next();
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const PORT = process.env.PORT || 3001;

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

/**
 * Convert attributes object → 5D number array
 */
function attrsToVector(attrs) {
  return [
    attrs.finishing,
    attrs.shooting,
    attrs.playmaking,
    attrs.defense,
    attrs.athleticism,
    attrs.rebounding ?? 50,   // V2: 6D with rebounding
  ];
}

// ── LLM helper ────────────────────────────────────────────────────────────
async function callDeepSeek(systemPrompt, userMessage, maxTokens = 1024) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

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
      temperature: 0.5,
      max_tokens: maxTokens,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`DeepSeek API ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Strip markdown code fences
  let jsonStr = raw.trim();
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();

  return JSON.parse(jsonStr);
}

// ── Prompt 1: Query → 5D vector ──────────────────────────────────────────
const VECTOR_PROMPT = `You are an NBA scouting data scientist. Convert any natural-language player query into a 6-dimensional attribute vector and a query description.

## The 6 dimensions (each 0–100):
1. **finishing** — rim pressure, dunking, layup package, foul-drawing, interior scoring
2. **shooting** — three-point range, midrange, free throws, shot mechanics, off-movement shooting
3. **playmaking** — passing vision, pick-and-roll reads, assist generation, transition decision-making
4. **defense** — on-ball defense, off-ball rotations, steals, blocks, defensive IQ, versatility
5. **athleticism** — vertical explosiveness, lateral quickness, speed, strength, body control
6. **rebounding** — offensive rebounding, defensive rebounding, box-out positioning, second-chance creation

## Rules:
- If the user mentions a specific NBA player, set the vector to match that player's known profile
- If the user describes traits (e.g., "defensive stopper who can shoot"), translate directly
- Be decisive — don't put everything at 50

## Output ONLY valid JSON (no markdown, no code fences):
{
  "vector": { "finishing": 85, "shooting": 70, "playmaking": 65, "defense": 75, "athleticism": 88, "rebounding": 55 },
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
app.post("/api/scout", checkRate, async (req, res) => {
  const { query, dnaVector } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "请提供搜索问题" });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  if (PLAYER_DB.length === 0) {
    return res.status(500).json({ error: "球员数据库未加载" });
  }

  try {
    // ── Phase 1: Query → Vector ─────────────────────────────────────────
    console.log(`🔍 Phase 1: Converting query to vector — "${query.trim()}"`);

    const vectorResult = await callDeepSeek(
      VECTOR_PROMPT,
      `User query: "${query.trim()}"`,
      512
    );

    const queryVector = attrsToVector(vectorResult.vector);
    const queryDesc = vectorResult.queryDescription || query.trim();
    const comparedPlayer = vectorResult.comparedPlayer || "none";

    console.log(`   Vector: [${queryVector.map(v => v.toFixed(0)).join(", ")}]`);
    console.log(`   Description: ${queryDesc}`);

    // ── Blend with user DNA vector if provided ───────────────────────────
    const hasDNA = dnaVector && Array.isArray(dnaVector) && dnaVector.length === 5;
    if (hasDNA) {
      console.log(`   🧬 Blending with user DNA: [${dnaVector.map(v => v.toFixed(0)).join(", ")}]`);
    }

    // 70% query intent + 30% user DNA profile (when DNA is available) — 6D support
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
      const embSim = cosineSimilarity(finalVector.slice(0, 6), player.embedding.slice(0, 6));
      let combinedScore = attrSim * 0.8 + embSim * 0.2;

      // V2: position-weighted bonus (15% for matching positions, was position filter)
      const playerPositions = player.positions || [player.position];
      const positionBonus = 0.15; // 15% boost for same-position
      // The position is derived from the query — if the query implies a position, boost it
      // For now, we apply a mild boost based on positional attribute patterns.

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
    if (err.name === "AbortError") {
      console.error("⏱ LLM timeout");
      return res.status(504).json({ error: "AI 响应超时" });
    }
    console.error("❌ Scout error:", err.message);
    res.status(500).json({ error: err.message || "AI 分析失败" });
  }
});

// ── POST /api/scout/quick (fast mode — vector only, no explanation) ───────
app.post("/api/scout/quick", checkRate, async (req, res) => {
  const { query, dnaVector } = req.body;
  if (!query) return res.status(400).json({ error: "请提供搜索问题" });
  if (PLAYER_DB.length === 0) return res.status(500).json({ error: "球员数据库未加载" });

  try {
    const vectorResult = await callDeepSeek(VECTOR_PROMPT, `User query: "${query.trim()}"`, 512);
    const queryVector = attrsToVector(vectorResult.vector);

    // Blend with user DNA vector if provided — 6D support
    const hasDNA = dnaVector && Array.isArray(dnaVector) && dnaVector.length >= 5;
    const finalVector = hasDNA
      ? queryVector.map((v, i) => Math.round(v * 0.7 + (dnaVector[i] ?? 50) * 0.3))
      : queryVector;

    const scored = PLAYER_DB.map((player) => {
      const playerVector = attrsToVector(player.attributes);
      const embSim = cosineSimilarity(finalVector.slice(0, 6), player.embedding.slice(0, 6));
      const score = Math.round((cosineSimilarity(finalVector, playerVector) * 0.8 + embSim * 0.2) * 100);
      return { id: player.id, name: player.name, position: player.position, team: player.team, score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json({ recommendations: scored.slice(0, 5), queryVector: vectorResult.vector });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post("/api/translate", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "请提供要翻译的文本" });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  try {
    console.log(`🌐 Translating profile (${text.length} chars)...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: TRANSLATE_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`DeepSeek API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content || text;

    console.log(`   Translated (${translated.length} chars)`);
    res.json({ translated });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "翻译超时" });
    }
    console.error("❌ Translation error:", err.message);
    res.status(500).json({ error: err.message || "翻译失败" });
  }
});

// ── Batch pre-translate all profiles & save to DB ──────────────────────────
app.post("/api/translate/batch", async (_req, res) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "AI 服务未配置" });
  }

  if (PLAYER_DB.length === 0) {
    return res.status(500).json({ error: "球员数据库未加载" });
  }

  try {
    const results = [];
    for (const player of PLAYER_DB) {
      // Skip if already translated
      if (player.profile_text_cn) {
        console.log(`⏭ ${player.name}: already translated`);
        results.push({ name: player.name, status: "skipped" });
        continue;
      }

      console.log(`🌐 Translating ${player.name}...`);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: TRANSLATE_PROMPT },
              { role: "user", content: player.profile_text },
            ],
            temperature: 0.3,
            max_tokens: 2048,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`API ${response.status}`);
        }

        const data = await response.json();
        player.profile_text_cn = data.choices?.[0]?.message?.content || "";
        console.log(`   ✓ ${player.name}: ${player.profile_text_cn.length} chars`);
        results.push({ name: player.name, status: "translated" });
      } catch (err) {
        console.error(`   ✗ ${player.name}: ${err.message}`);
        results.push({ name: player.name, status: "failed", error: err.message });
      }
    }

    // Save updated database back to disk
    const { writeFileSync } = await import("fs");
    writeFileSync(DB_PATH, JSON.stringify(PLAYER_DB, null, 2), "utf-8");
    console.log(`💾 Database saved with ${PLAYER_DB.filter(p => p.profile_text_cn).length} translations`);

    res.json({ results, totalTranslated: PLAYER_DB.filter(p => p.profile_text_cn).length });
  } catch (err) {
    console.error("❌ Batch translation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏀 Scout Agent V2 running on http://localhost:${PORT}`);
  console.log(`   DeepSeek API: ${DEEPSEEK_API_KEY ? "✓ configured" : "✗ NOT configured"}`);
  console.log(`   Player DB:    ${PLAYER_DB.length} prospects loaded`);
  console.log(`   Algorithm:    cosine similarity (LLM explains, math ranks)`);
});
