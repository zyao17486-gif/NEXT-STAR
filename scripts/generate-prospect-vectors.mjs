import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

async function callDeepSeek(systemPrompt, userMessage, maxTokens = 8192) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.3, max_tokens: maxTokens }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) { const e = await response.text().catch(() => ""); throw new Error(`API ${response.status}: ${e.slice(0, 200)}`); }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (err) { clearTimeout(timeout); throw err; }
}

// Read prompt template
const promptTemplate = readFileSync(join(__dirname, "prompts", "prospect-13d-prompt.md"), "utf-8");

// Read draft database
const prospects = JSON.parse(readFileSync(join(__dirname, "..", "src", "data", "2026-draft-database.json"), "utf-8"));

// Split into 4 batches of 9
const BATCH_SIZE = 9;
const batches = [];
for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
  batches.push(prospects.slice(i, i + BATCH_SIZE));
}

// System prompt: same for all batches
const systemPrompt = "你是一位 NBA 选秀球探数据分析师。请严格按照用户提供的格式，为每组新秀生成完整的 JSON 数组。每次只输出一个 JSON 数组，不要输出任何其他内容。";

const allResults = [];

for (let batchNum = 0; batchNum < batches.length; batchNum++) {
  const batch = batches[batchNum];
  console.log(`\n📋 Batch ${batchNum + 1}/${batches.length} — ${batch.length} players (${batch[0].name} ... ${batch[batch.length - 1].name})`);

  // Build user message
  let userMsg = `### 批次 ${batchNum + 1}：请为以下 ${batch.length} 名新秀生成数据\n\n`;
  batch.forEach((p, j) => {
    const globalIdx = batchNum * BATCH_SIZE + j + 1;
    userMsg += `**${globalIdx}. ${p.name}** (${p.nameCn})\n`;
    userMsg += `位置: ${p.position} | 副位置: ${(p.positions||[]).join("/")} | 球队: ${p.team} | 年龄: ${p.age}\n`;
    userMsg += `身高: ${p.height} (${p.heightInches}英寸) | 体重: ${p.weight} | 臂展: ${p.wingspan}\n`;
    userMsg += `站立摸高: ${p.standingReach}\n`;
    userMsg += `球探报告: ${p.profile_text.slice(0, 600)}\n`;
    userMsg += `现有标签: ${(p.tags||[]).join(", ")}\n`;
    userMsg += `现有6D: finishing=${p.attributes?.finishing} shooting=${p.attributes?.shooting} playmaking=${p.attributes?.playmaking} defense=${p.attributes?.defense} athleticism=${p.attributes?.athleticism} rebounding=${p.attributes?.rebounding||"N/A"}\n`;
    userMsg += `即战力: isPolished=${p.isPolished||"unknown"} prod=${p.productionScore||"?"} bbiq=${p.bbiq||"?"} motor=${p.motor||"?"}\n\n`;
  });

  const fullPrompt = promptTemplate + "\n\n" + userMsg;
  console.log(`   Input: ~${Math.round(fullPrompt.length / 4)} tokens`);

  try {
    const result = await callDeepSeek(systemPrompt, fullPrompt, 8192);
    // Extract JSON array
    let jsonStr = result.trim();
    // Strip markdown fence
    const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) jsonStr = fence[1].trim();
    // Find array
    const arrStart = jsonStr.indexOf("[");
    if (arrStart >= 0) {
      let level = 0, arrEnd = -1;
      for (let i = arrStart; i < jsonStr.length; i++) {
        if (jsonStr[i] === "[") level++;
        if (jsonStr[i] === "]") { level--; if (level === 0) { arrEnd = i + 1; break; } }
      }
      if (arrEnd > 0) {
        const clean = jsonStr.slice(arrStart, arrEnd);
        try {
          const parsed = JSON.parse(clean);
          console.log(`   ✅ Parsed ${parsed.length} players`);
          allResults.push(...parsed);
        } catch (e) {
          console.error(`   ❌ Parse error: ${e.message}`);
          console.log(`   First 200: ${clean.slice(0, 200)}`);
          console.log(`   Last 200: ${clean.slice(-200)}`);
        }
      } else { console.error("   ❌ Array not closed"); }
    } else { console.error("   ❌ No JSON array"); console.log(`   Preview: ${jsonStr.slice(0, 300)}`); }
  } catch (err) {
    console.error(`   ❌ API error: ${err.message}`);
  }
}

// Save combined results
if (allResults.length > 0) {
  const outPath = join(__dirname, "..", "src", "data", "prospects-13d.json");
  writeFileSync(outPath, JSON.stringify(allResults, null, 2), "utf-8");
  console.log(`\n✅ Total: ${allResults.length} prospects saved to prospects-13d.json`);

  // Quick stats
  const polished = allResults.filter(p => p.isPolished);
  console.log(`   isPolished=true: ${polished.length} | isPolished=false: ${allResults.length - polished.length}`);

  // Check all have 85+ signature
  const no85 = allResults.filter(p => !Object.values(p.attributes || {}).some(v => v >= 85));
  if (no85.length) console.log(`   ⚠️ No 85+ signature: ${no85.map(p=>p.name).join(", ")}`);
  else console.log(`   ✅ All have >=85 signature skill`);
} else {
  console.error("\n❌ No results generated");
}
