import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

async function callDeepSeek(systemPrompt, userMessage, maxTokens = 8192) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

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
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`DeepSeek API ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Read the prompt
const promptPath = join(__dirname, "prompts", "star-template-prompt.md");
const prompt = readFileSync(promptPath, "utf-8");

console.log("🚀 Generating 36 star player 13D templates...");
console.log(`   Prompt length: ${prompt.length} chars`);
console.log("");

try {
  const result = await callDeepSeek(
    "You are a basketball data engineer. Output ONLY valid JSON with 36 player objects and a self-check report. NO markdown, NO code fences, NO explanation text outside the JSON.",
    prompt,
    8192
  );

  // Extract JSON array from response
  let jsonStr = result.trim();
  // Strip markdown fences if present
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();
  // If there's a JSON array followed by markdown, extract just the array
  const arrayMatch = jsonStr.match(/^(\[[\s\S]*?\])\s*[\n\r]+#/);
  if (arrayMatch) {
    jsonStr = arrayMatch[1].trim();
    // Save the report separately
    const reportText = result.slice(result.indexOf(jsonStr) + jsonStr.length).trim();
    const reportPath = join(__dirname, "..", "src", "data", "star-players-13d-report.md");
    writeFileSync(reportPath, reportText, "utf-8");
    console.log(`📝 Self-check report saved to src/data/star-players-13d-report.md`);
  }

  // Save raw output
  const rawPath = join(__dirname, "..", "src", "data", "star-players-13d-raw.json");
  writeFileSync(rawPath, jsonStr, "utf-8");
  console.log(`✅ Raw output saved to src/data/star-players-13d-raw.json`);
  console.log(`   Output length: ${jsonStr.length} chars`);

  // Try to parse and validate
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      console.log(`✅ Parsed successfully: ${parsed.length} players`);
      // Show first player as sample
      if (parsed.length > 0) {
        console.log("\n📋 Sample (first player):");
        console.log(JSON.stringify(parsed[0], null, 2));
      }
    } else if (parsed.players && Array.isArray(parsed.players)) {
      console.log(`✅ Parsed successfully: ${parsed.players.length} players`);
      console.log("\n📋 Sample (first player):");
      console.log(JSON.stringify(parsed.players[0], null, 2));
    } else {
      console.log("⚠️  Parsed but unexpected structure:", Object.keys(parsed));
    }

    // Save parsed version
    const parsedPath = join(__dirname, "..", "src", "data", "star-players-13d.json");
    writeFileSync(parsedPath, JSON.stringify(parsed, null, 2), "utf-8");
    console.log(`\n📁 Parsed JSON saved to src/data/star-players-13d.json`);
  } catch (parseErr) {
    console.error("⚠️  Could not parse JSON:", parseErr.message);
    console.log("   First 500 chars:", jsonStr.slice(0, 500));
  }

} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exit(1);
}
