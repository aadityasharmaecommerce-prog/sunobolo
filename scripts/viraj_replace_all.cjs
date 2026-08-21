#!/usr/bin/env node
/**
 * SunoBolo — Replace ALL audio with ElevenLabs Viraj voice.
 *
 * - Loads OLD viraj_batch_state.json to skip already-Viraj sentences
 * - Regenerates ALL other sentences (normal AI → Viraj)
 * - Generates missing sentences with Viraj
 * - Tracks progress in viraj_replace_state.json for resume
 *
 * Voice: ElevenLabs Viraj (JBFqnCBsd6RMkjVDRZzb)
 * Model: eleven_multilingual_v2
 *
 * Usage:
 *   node scripts/viraj_replace_all.cjs                    # continue from old Viraj + generate rest
 *   node scripts/viraj_replace_all.cjs --limit 10         # quick test
 *   node scripts/viraj_replace_all.cjs --course beginner  # specific course only
 *   node scripts/viraj_replace_all.cjs --reset            # reset state, start fresh
 *   node scripts/viraj_replace_all.cjs --skip-existing    # skip if both EN+HI mp3 exist
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ── Configuration ──
const API_KEY = process.env.ELEVENLABS_API_KEY || "sk_97f8f6beb41ec989934d9664ae16e860ebed5d62f506e259";
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // Viraj voice
const MODEL = "eleven_multilingual_v2";
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.35 };

const BASE = path.resolve(__dirname, "..");
const CONTENT_TS = path.join(BASE, "src", "data", "content.ts");
const AUDIO_BASE = path.join(BASE, "public", "audio");
const STATE_FILE = path.join(BASE, "scripts", "viraj_replace_state.json");
const OLD_STATE_FILE = path.join(BASE, "scripts", "viraj_batch_state.json");
const LOG_FILE = path.join(BASE, "scripts", "viraj_replace_log.txt");

// Rate limiting
const DELAY_BETWEEN_CALLS = 400; // ms
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // ms
const SAVE_EVERY = 10;

// ── Parse content.ts ──
function parseSentences() {
  const text = fs.readFileSync(CONTENT_TS, "utf-8");
  const seen = new Map();

  const regex = /"id"\s*:\s*"([^"]+)"\s*,\s*"courseId"\s*:\s*"([^"]+)"\s*,\s*"lessonId"\s*:\s*"[^"]+"\s*,\s*"order"\s*:\s*\d+\s*,\s*"english"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"hindi"\s*:\s*"((?:[^"\\]|\\.)*)"/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const [, sid, course, eng, hin] = match;
    if (seen.has(sid)) continue;
    const english = unescape(eng);
    const hindi = unescape(hin);
    if (english) {
      seen.set(sid, { id: sid, courseId: course, english, hindi });
    }
  }

  return Array.from(seen.values());
}

function unescape(s) {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .trim();
}

// ── Load old Viraj state ──
function loadOldVirajIds() {
  if (!fs.existsSync(OLD_STATE_FILE)) {
    console.log("   No old viraj_batch_state.json found — starting fresh");
    return new Set();
  }
  const old = JSON.parse(fs.readFileSync(OLD_STATE_FILE, "utf-8"));
  const ids = new Set(old.generated || []);
  console.log(`   Loaded ${ids.size} already-Viraj sentence IDs from old state`);
  return ids;
}

// ── State management ──
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  }
  return { completed: [], errors: [], skipped: 0, totalApiCalls: 0 };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ── ElevenLabs TTS ──
function tts(text, outputPath) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: VOICE_SETTINGS,
    });

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
    let attempt = 0;

    function tryRequest() {
      attempt++;
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            const data = Buffer.concat(chunks);
            fs.writeFileSync(outputPath, data);
            resolve(data.length);
          } else if (res.statusCode === 429) {
            const wait = RETRY_DELAY * attempt;
            log(`    ⏳ Rate limited, waiting ${wait / 1000}s...`);
            setTimeout(tryRequest, wait);
          } else if (res.statusCode === 401) {
            const body = Buffer.concat(chunks).toString().substring(0, 200);
            reject(new Error(`API error (${res.statusCode}): ${body}`));
          } else {
            const body = Buffer.concat(chunks).toString().substring(0, 200);
            if (attempt < MAX_RETRIES) {
              log(`    ⚠️  HTTP ${res.statusCode}: ${body}`);
              setTimeout(tryRequest, RETRY_DELAY);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            }
          }
        });
      });

      req.on("error", (e) => {
        if (attempt < MAX_RETRIES) {
          log(`    ⚠️  Network error: ${e.message}`);
          setTimeout(tryRequest, RETRY_DELAY);
        } else {
          reject(e);
        }
      });

      req.on("timeout", () => {
        req.destroy();
        if (attempt < MAX_RETRIES) {
          log(`    ⚠️  Timeout, retrying...`);
          setTimeout(tryRequest, RETRY_DELAY);
        } else {
          reject(new Error("Request timed out"));
        }
      });

      req.write(payload);
      req.end();
    }

    tryRequest();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + "\n");
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) || 0 : 0;
  const courseIdx = args.indexOf("--course");
  const course = courseIdx >= 0 ? args[courseIdx + 1] : "";
  const reset = args.includes("--reset");
  const skipExisting = args.includes("--skip-existing");

  if (reset) {
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    console.log("🔄 State reset. Starting fresh.");
    return;
  }

  // Clear log
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  log("=".repeat(60));
  log("🎙️ SunoBolo — Viraj Voice Replacement (CONTINUE)");
  log(`Voice: ${VOICE_ID} (ElevenLabs Viraj)`);
  log(`Model: ${MODEL}`);
  log("=".repeat(60));

  // Parse sentences
  log("\n📖 Parsing content.ts...");
  const allSentences = parseSentences();
  log(`   Total unique sentences: ${allSentences.length}`);

  // Show course breakdown
  const courseCounts = {};
  for (const s of allSentences) {
    courseCounts[s.courseId] = (courseCounts[s.courseId] || 0) + 1;
  }
  for (const [c, n] of Object.entries(courseCounts).sort((a, b) => b[1] - a[1])) {
    log(`   ${c}: ${n} sentences`);
  }

  // Load old Viraj IDs (skip these — already done)
  const oldVirajIds = loadOldVirajIds();

  // Filter by course
  let sentences = allSentences;
  if (course) {
    sentences = allSentences.filter((s) => s.courseId === course);
    log(`\n   Filtered to course '${course}': ${sentences.length} sentences`);
  }

  // Load state
  const state = loadState();
  const doneSet = new Set(state.completed);

  // Find what needs to be done
  const todo = [];
  let skippedOldViraj = 0;
  let skippedCompleted = 0;
  let skippedExisting = 0;

  for (const s of sentences) {
    // Skip if already processed in THIS run
    if (doneSet.has(s.id)) {
      skippedCompleted++;
      continue;
    }
    // Skip if already Viraj from old run
    if (oldVirajIds.has(s.id)) {
      skippedOldViraj++;
      continue;
    }
    // Skip if audio files exist (if --skip-existing)
    if (skipExisting) {
      const enPath = path.join(AUDIO_BASE, s.courseId, `${s.id}.mp3`);
      const hiPath = path.join(AUDIO_BASE, s.courseId, `${s.id}.hindi.mp3`);
      if (fs.existsSync(enPath) && fs.existsSync(hiPath)) {
        skippedExisting++;
        continue;
      }
    }
    todo.push(s);
  }

  log(`\n   Already Viraj (old run): ${skippedOldViraj}`);
  log(`   Already completed (this run): ${skippedCompleted}`);
  if (skipExisting) log(`   Skipped (files exist): ${skippedExisting}`);
  log(`   📋 TO GENERATE: ${todo.length}`);

  // Show breakdown by course
  const todoByCourse = {};
  for (const s of todo) {
    todoByCourse[s.courseId] = (todoByCourse[s.courseId] || 0) + 1;
  }
  log("\n   Breakdown:");
  for (const [c, n] of Object.entries(todoByCourse).sort((a, b) => b[1] - a[1])) {
    log(`   ${c}: ${n} sentences (${n * 2} API calls)`);
  }

  let workList = todo;
  if (limit > 0) {
    workList = todo.slice(0, limit);
    log(`\n   Limited to: ${workList.length} (test mode)`);
  }

  if (workList.length === 0) {
    log("\n✅ All sentences already Viraj! Nothing to do.");
    return;
  }

  // Generate audio
  log(`\n🚀 Starting generation...`);
  const estMinutes = (workList.length * (DELAY_BETWEEN_CALLS + 1500)) / 60000;
  log(`   Estimated time: ~${estMinutes.toFixed(0)} minutes`);
  log(`   Each sentence = 2 API calls (English + Hindi)`);
  log(`   Total API calls needed: ${workList.length * 2}`);
  log("");

  let success = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < workList.length; i++) {
    const s = workList[i];
    const outDir = path.join(AUDIO_BASE, s.courseId);
    fs.mkdirSync(outDir, { recursive: true });

    const enPath = path.join(outDir, `${s.id}.mp3`);
    const hiPath = path.join(outDir, `${s.id}.hindi.mp3`);

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = success > 0 ? success / (elapsed / 60) : 0;
    const eta = rate > 0 ? (workList.length - i) / rate : 0;

    log(`[${i + 1}/${workList.length}] ${s.courseId}/${s.id} (✓${success} ✗${errors} ETA:${eta.toFixed(0)}min)`);

    try {
      // Generate English audio
      const sizeEn = await tts(s.english, enPath);
      log(`  EN: ${sizeEn.toLocaleString()} bytes — "${s.english.substring(0, 60)}..."`);
      await sleep(DELAY_BETWEEN_CALLS);

      // Generate Hindi audio (with मतलब prefix)
      const hindiText = `मतलब ${s.hindi}`;
      const sizeHi = await tts(hindiText, hiPath);
      log(`  HI: ${sizeHi.toLocaleString()} bytes — "${hindiText.substring(0, 60)}..."`);
      await sleep(DELAY_BETWEEN_CALLS);

      // Mark complete
      state.completed.push(s.id);
      state.totalApiCalls = (state.totalApiCalls || 0) + 2;
      success++;

      // Save progress periodically
      if (success % SAVE_EVERY === 0) {
        saveState(state);
        const elapsedMin = (Date.now() - startTime) / 60000;
        log(`  💾 Saved progress: ${success}/${workList.length} done (${elapsedMin.toFixed(1)} min)`);
      }
    } catch (e) {
      log(`  ❌ FAILED: ${e.message}`);
      state.errors.push({ id: s.id, error: e.message.substring(0, 200) });
      errors++;
      // Don't save on error — let it retry on next run
    }
  }

  // Final save
  saveState(state);

  const elapsedMin = (Date.now() - startTime) / 60000;
  log("\n" + "=".repeat(60));
  log("📊 GENERATION COMPLETE");
  log(`   ✅ Success: ${success}`);
  log(`   ❌ Errors: ${errors}`);
  log(`   ⏱️  Time: ${elapsedMin.toFixed(1)} minutes`);
  log(`   📞 API calls this run: ${state.totalApiCalls || 0}`);
  log(`   📁 Audio files in: ${AUDIO_BASE}`);
  log("=".repeat(60));

  if (errors > 0) {
    log(`\n⚠️  ${errors} sentences failed. Run the script again to retry them.`);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
