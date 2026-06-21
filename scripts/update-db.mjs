// Update 2026 draft database: rebounding, hybrid positions, derived fields
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "src", "data", "2026-draft-database.json");
const db = JSON.parse(readFileSync(DB_PATH, "utf-8"));

// ── Tag-based scoring helpers ──────────────────────────────────────────
const HIGH_REBOUNDING = /rebound|double.double|NCAA.*rebound|rim.protect/i;
const HIGH_BBIQ = /high IQ|cerebral|high feel|IQ|feel|instinct/i;
const HIGH_MOTOR = /high motor|dirty work|energy|motor|relentless/i;
const INJURY_TAGS = /injury risk|medical risk|injury recovery|injury/i;
const PRODUCTION_TAGS = /high production|instant impact|pro.ready|polished|safe pick|high floor/i;

function scoreTags(tags, regex) {
  if (!tags || !tags.length) return 40;
  const hits = tags.filter(t => regex.test(t)).length;
  return Math.min(100, 40 + hits * 20);
}

// ── Position → rebounding baseline ─────────────────────────────────────
const POS_REBOUNDING = { PG: 25, SG: 35, SF: 55, PF: 75, C: 90 };

// ── Hybrid position assignments (based on scouting reports) ────────────
const HYBRID_POSITIONS = {
  "AJ Dybantsa": ["SF", "SG"],           // 6'9" but plays like a guard-forward
  "Darryn Peterson": ["SG", "PG"],        // Combo guard
  "Cameron Boozer": ["PF", "SF"],         // Tweener forward
  "Caleb Wilson": ["PF", "SF"],           // Athletic forward, perimeter skills
  "Nate Ament": ["SF", "PF"],             // Tall SF with PF size
  "Mikel Brown Jr.": ["PG", "SG"],        // Scoring point, combo guard
  "Darius Acuff": ["PG", "SG"],           // Score-first PG
  "Kingston Flemings": ["PG"],             // Pure PG, undersized
  "Koa Peat": ["PF", "SF"],               // Tweener — "不三不四"
  "Brayden Burries": ["SG", "PG"],        // Combo guard build
  "Meleek Thomas": ["SG", "PG"],          // Scoring guard
  "Isaiah Evans": ["SF", "SG"],           // "Baby Ingram" — tall wing
  "VJ Edgecombe": ["SG", "SF"],           // Explosive 2-way wing
  "Morez Johnson Jr.": ["PF", "C"],       // Undersized big, PF/C tweener
  "Jaylen Harrell": ["SG"],               // Pure SG
  "Aday Mara": ["C"],                     // Pure center
  "Jayden Quaintance": ["C", "PF"],       // Athletic big
  "Chris Cenac Jr.": ["C", "PF"],         // Modern big with perimeter
  "Cameron Carr": ["SF", "SG"],           // 3&D wing
  "Billy Richmond III": ["SF", "SG"],     // Athletic wing
  "Karim Lopez": ["SF", "PF"],            // International forward
  "Tounde Yessoufou": ["SF"],             // Energy wing
  "Keaton Wagler": ["SG"],                // Pure shooter
  "Andrej Stojakovic": ["SF", "SG"],      // Tall shooter
  "Yaxel Lendeborg": ["PF", "C"],         // Two-way forward-big
  "Christian Anderson": ["PG"],            // Pure PG
  "Bennett Stirtz": ["PG"],               // Pure PG
  "Labaron Philon Jr.": ["SG", "PG"],     // Combo guard
  "Alex Karaban": ["PF", "SF"],           // Stretch forward
  "Hannes Steinbach": ["C"],              // Traditional center
  "Henri Veesaar": ["C", "PF"],           // Skilled big
  "Sergio de Larrea": ["PG", "SG"],       // Tall guard
  "Dailyn Swain": ["SF", "SG"],           // Defensive wing
  "Ebuka Okorie": ["PG"],                 // Speed guard
  "Allen Graves": ["PF", "SF"],           // 3&D forward
  "Cameron Boozer Jr.": ["PF", "SF"],     // Forward tweener
};

// ── Physical score: heightInches + (wingspan in) + athleticism ─────────
function calcPhysicalScore(p) {
  const h = p.heightInches || 72;
  const wsMatch = String(p.wingspan || "6'8\"").match(/(\d+)'(\d+(?:\.\d+)?)/);
  const ws = wsMatch ? parseInt(wsMatch[1]) * 12 + parseFloat(wsMatch[2]) : h + 4;
  const ath = p.attributes?.athleticism || 50;
  // Normalize to 0-100: height 66-88→, wingspan delta →, athleticism
  const hScore = Math.min(100, Math.max(0, (h - 68) / 20 * 60 + 30));
  const wsBonus = Math.min(100, Math.max(0, ((ws - h) / 10) * 50 + 50));
  return Math.round(hScore * 0.3 + wsBonus * 0.2 + ath * 0.5);
}

// ── Production score from tags + season stats existence ─────────────────
function calcProductionScore(p) {
  const tagScore = scoreTags(p.tags, PRODUCTION_TAGS);
  const hasStats = p.seasonStats && p.seasonStats.length > 0;
  return Math.round(tagScore * 0.7 + (hasStats ? 20 : 0));
}

// ── Age (approximate from context) ──────────────────────────────────────
function estimateAge(p) {
  // Based on known draft class ages; most 2026 prospects born 2004-2007
  if (p.name.includes("Boozer")) return 19;  // Freshman
  if (p.name.includes("Dybantsa") || p.name.includes("Peterson")) return 19;
  if (p.name.includes("Ament") || p.name.includes("Wilson")) return 19;
  if (p.name.includes("Essengue")) return 19;  // Born 2007
  if (p.name.includes("Fland") || p.name.includes("Edgecombe")) return 20;
  if (p.name.includes("Bailey") || p.name.includes("Harper")) return 20;
  if (p.name.includes("Stojakovic") || p.name.includes("Karaban")) return 22;
  if (p.name.includes("Steinbach") || p.name.includes("Veesaar")) return 22;
  if (p.name.includes("de Larrea")) return 20;
  if (p.name.includes("Stirtz")) return 23;
  // Default: freshman = 19, sophomore = 20
  if (p.team?.includes("Kansas") || p.team?.includes("Duke")) return 19;
  return 20;
}

// ── MAIN UPDATE LOOP ────────────────────────────────────────────────────
for (const p of db) {
  const pos = p.position;
  const baseReb = POS_REBOUNDING[pos] || 50;
  const tagRebBonus = scoreTags(p.tags, HIGH_REBOUNDING);
  const rebounding = Math.round(baseReb * 0.5 + tagRebBonus * 0.5);

  // Add rebounding to attributes
  p.attributes.rebounding = Math.min(100, Math.max(0, rebounding));

  // Add hybrid positions
  p.positions = HYBRID_POSITIONS[p.name] || [pos];

  // Add derived fields
  p.bbiq = Math.min(100, Math.max(0, scoreTags(p.tags, HIGH_BBIQ)));
  p.motor = Math.min(100, Math.max(0, scoreTags(p.tags, HIGH_MOTOR)));
  p.physicalScore = calcPhysicalScore(p);
  p.injuryFlag = INJURY_TAGS.test((p.tags || []).join(" ")) ||
                 (p.profile_text || "").includes("injury") ||
                 (p.profile_text || "").includes("伤病");
  p.age = estimateAge(p);
  p.productionScore = calcProductionScore(p);
  // Distinguish polished (high floor, ready now) vs upside (raw, high ceiling)
  const rawTags = /raw|boom.or.bust|upside|ceiling|project|tools/i;
  p.isPolished = !rawTags.test((p.tags || []).join(" "));

  console.log(`✓ ${p.name}: reb=${rebounding} pos=${p.positions.join("/")} bbiq=${p.bbiq} motor=${p.motor} phys=${p.physicalScore}`);
}

writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
console.log(`\n💾 Updated ${db.length} players`);
