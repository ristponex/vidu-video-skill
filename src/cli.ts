#!/usr/bin/env bun
/**
 * Vidu Video Skill - AI Video Generation CLI
 * Powered by Vidu models via Atlas Cloud API
 *
 * Usage:
 *   vidu-video "your prompt here"
 *   vidu-video "your prompt" --model q3-turbo
 *   vidu-video "your prompt" --mode i2v --image input.png
 *   vidu-video "your prompt" --mode start-end --image start.png --end-image end.png
 *   vidu-video "your prompt" --style anime --duration 8
 *   vidu-video "your prompt" --audio --bgm
 */

import { writeFile, mkdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { homedir } from "os";

// Model aliases mapping
const MODEL_ALIASES: Record<string, string> = {
  "q3-pro": "vidu/q3-pro/text-to-video",
  "q3-pro-t2v": "vidu/q3-pro/text-to-video",
  "q3-pro-i2v": "vidu/q3-pro/image-to-video",
  "q3-pro-start-end": "vidu/q3-pro/start-end-to-video",
  "q3-turbo": "vidu/q3-turbo/text-to-video",
  "q3-turbo-t2v": "vidu/q3-turbo/text-to-video",
  "q3-turbo-i2v": "vidu/q3-turbo/image-to-video",
  "q3-turbo-start-end": "vidu/q3-turbo/start-end-to-video",
  "ref-q1": "vidu/reference-to-video/q1",
  "ref-2.0": "vidu/reference-to-video/2.0",
};

// Mode suffixes for Q3-Pro
const MODE_SUFFIXES_PRO: Record<string, string> = {
  t2v: "text-to-video",
  i2v: "image-to-video",
  "start-end": "start-end-to-video",
};

// Mode suffixes for Q3-Turbo
const MODE_SUFFIXES_TURBO: Record<string, string> = {
  t2v: "text-to-video",
  i2v: "image-to-video",
  "start-end": "start-end-to-video",
};

const API_BASE = "https://api.atlascloud.ai/api/v1/model/prediction";
const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 300000; // 5 minutes

interface Args {
  prompt: string;
  model: string;
  mode: string;
  duration: number;
  resolution: string;
  style: string;
  movement: string;
  audio: boolean;
  bgm: boolean;
  image: string | null;
  endImage: string | null;
  aspect: string;
  output: string;
  dir: string;
  apiKey: string | null;
  help: boolean;
}

// Print help text
function printHelp(): void {
  console.log(`
Vidu Video - AI Video Generation CLI
Powered by Vidu models via Atlas Cloud

USAGE:
  vidu-video <prompt> [options]

ARGUMENTS:
  prompt                    Text description of the video to generate

OPTIONS:
  -o, --output <name>       Output filename without extension (default: vidu-gen-{timestamp})
  --model <model>           Model alias or full model ID (default: q3-pro)
  --mode <mode>             Generation mode: t2v, i2v, start-end, ref (default: t2v)
  --duration <seconds>      Video duration: 5 or 8 seconds (default: 5)
  --resolution <res>        Output resolution: 540p, 720p, 1080p (default: 720p)
  --style <style>           Visual style: general, anime (default: general)
  --movement <amp>          Movement amplitude: auto, small, medium, large (default: auto)
  --audio                   Enable AI audio generation
  --bgm                     Enable AI background music
  --image <path>            Input/start image path (for i2v/start-end/ref)
  --end-image <path>        End frame image path (for start-end mode)
  --aspect <ratio>          Aspect ratio: 16:9, 9:16, 1:1, etc. (default: 16:9)
  -d, --dir <path>          Output directory (default: current directory)
  --api-key <key>           Atlas Cloud API key (overrides env/file)
  -h, --help                Show this help message

MODELS:
  q3-pro, q3-pro-t2v        Vidu Q3-Pro Text-to-Video ($0.06/req) — best quality, 1080p
  q3-pro-i2v                Vidu Q3-Pro Image-to-Video ($0.06/req)
  q3-pro-start-end          Vidu Q3-Pro Start-End Frame ($0.06/req)
  q3-turbo, q3-turbo-t2v    Vidu Q3-Turbo Text-to-Video ($0.034/req) — fast, affordable
  q3-turbo-i2v              Vidu Q3-Turbo Image-to-Video ($0.034/req)
  q3-turbo-start-end        Vidu Q3-Turbo Start-End Frame ($0.034/req)
  ref-q1                    Reference-to-Video Q1 ($0.06/req)
  ref-2.0                   Reference-to-Video 2.0 ($0.06/req)

EXAMPLES:
  vidu-video "a cat playing in a garden"
  vidu-video "anime samurai battle" --style anime --duration 8
  vidu-video "animate this character" --mode i2v --image character.png
  vidu-video "smooth transition" --mode start-end --image start.png --end-image end.png
  vidu-video "character dancing" --mode ref --image reference.png
  vidu-video "thunderstorm scene" --audio --bgm --movement large
  vidu-video "product demo" --model q3-turbo --resolution 1080p
`);
}

// Parse command line arguments
function parseArgs(): Args {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const result: Args = {
    prompt: "",
    model: "q3-pro",
    mode: "t2v",
    duration: 5,
    resolution: "720p",
    style: "general",
    movement: "auto",
    audio: false,
    bgm: false,
    image: null,
    endImage: null,
    aspect: "16:9",
    output: `vidu-gen-${Date.now()}`,
    dir: process.cwd(),
    apiKey: null,
    help: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        result.help = true;
        return result;

      case "-o":
      case "--output":
        result.output = args[++i];
        break;

      case "--model":
        result.model = args[++i];
        break;

      case "--mode":
        result.mode = args[++i];
        if (!["t2v", "i2v", "start-end", "ref"].includes(result.mode)) {
          console.error("Error: Mode must be t2v, i2v, start-end, or ref");
          process.exit(1);
        }
        break;

      case "--duration":
        result.duration = parseInt(args[++i], 10);
        if (![5, 8].includes(result.duration)) {
          console.error("Error: Duration must be 5 or 8 seconds");
          process.exit(1);
        }
        break;

      case "--resolution":
        result.resolution = args[++i];
        if (!["540p", "720p", "1080p"].includes(result.resolution)) {
          console.error("Error: Resolution must be 540p, 720p, or 1080p");
          process.exit(1);
        }
        break;

      case "--style":
        result.style = args[++i];
        if (!["general", "anime"].includes(result.style)) {
          console.error("Error: Style must be general or anime");
          process.exit(1);
        }
        break;

      case "--movement":
        result.movement = args[++i];
        if (!["auto", "small", "medium", "large"].includes(result.movement)) {
          console.error("Error: Movement must be auto, small, medium, or large");
          process.exit(1);
        }
        break;

      case "--audio":
        result.audio = true;
        break;

      case "--bgm":
        result.bgm = true;
        break;

      case "--image":
        result.image = args[++i];
        break;

      case "--end-image":
        result.endImage = args[++i];
        break;

      case "--aspect":
        result.aspect = args[++i];
        break;

      case "-d":
      case "--dir":
        result.dir = args[++i];
        break;

      case "--api-key":
        result.apiKey = args[++i];
        break;

      default:
        // First non-flag argument is the prompt
        if (!arg.startsWith("-") && !result.prompt) {
          result.prompt = arg;
        } else if (!arg.startsWith("-")) {
          result.prompt += " " + arg;
        } else {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
    i++;
  }

  return result;
}

// Resolve API key from multiple sources
function resolveApiKey(flagKey: string | null): string {
  // 1. CLI flag
  if (flagKey) return flagKey;

  // 2. Environment variable
  if (process.env.ATLAS_API_KEY) return process.env.ATLAS_API_KEY;

  // 3. .env in current directory
  const cwdEnv = join(process.cwd(), ".env");
  if (existsSync(cwdEnv)) {
    const key = extractKeyFromEnv(cwdEnv);
    if (key) return key;
  }

  // 4. .env in repo root
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoEnv = join(dirname(scriptDir), ".env");
  if (existsSync(repoEnv)) {
    const key = extractKeyFromEnv(repoEnv);
    if (key) return key;
  }

  // 5. ~/.vidu-video/.env
  const homeEnv = join(homedir(), ".vidu-video", ".env");
  if (existsSync(homeEnv)) {
    const key = extractKeyFromEnv(homeEnv);
    if (key) return key;
  }

  console.error("Error: Atlas Cloud API key not found.");
  console.error("Set ATLAS_API_KEY env var, create a .env file, or pass --api-key");
  process.exit(1);
}

// Extract ATLAS_API_KEY from a .env file
function extractKeyFromEnv(path: string): string | null {
  try {
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("ATLAS_API_KEY=")) {
        return trimmed.slice("ATLAS_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // File read failed, skip
  }
  return null;
}

// Resolve model ID from alias and flags
function resolveModel(args: Args): string {
  // Check if it's a direct model ID (contains /)
  if (args.model.includes("/")) {
    return args.model;
  }

  // Reference mode overrides
  if (args.mode === "ref") {
    if (args.model === "ref-q1") return "vidu/reference-to-video/q1";
    return "vidu/reference-to-video/2.0";
  }

  // Handle mode-specific resolution for base model aliases
  const isTurbo = args.model.startsWith("q3-turbo");
  const isPro = args.model === "q3-pro" || args.model === "q3-pro-t2v";

  if (isPro && args.mode !== "t2v") {
    const suffix = MODE_SUFFIXES_PRO[args.mode];
    if (suffix) return `vidu/q3-pro/${suffix}`;
  }

  if (isTurbo && args.mode !== "t2v" && args.model === "q3-turbo") {
    const suffix = MODE_SUFFIXES_TURBO[args.mode];
    if (suffix) return `vidu/q3-turbo/${suffix}`;
  }

  // Look up alias
  const resolved = MODEL_ALIASES[args.model];
  if (resolved) return resolved;

  // Fallback: treat as direct model ID
  return args.model;
}

// Read file as base64 data URI
async function readFileAsBase64(filePath: string): Promise<string> {
  const absolutePath = filePath.startsWith("/") ? filePath : join(process.cwd(), filePath);
  if (!existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    process.exit(1);
  }
  const buffer = await readFile(absolutePath);
  const ext = filePath.split(".").pop()?.toLowerCase() || "png";
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    mov: "video/quicktime",
  };
  const mime = mimeTypes[ext] || "application/octet-stream";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

// Build request payload
async function buildPayload(args: Args, modelId: string): Promise<Record<string, any>> {
  const input: Record<string, any> = {
    prompt: args.prompt,
    duration: args.duration,
    resolution: args.resolution,
    style: args.style,
    movement_amplitude: args.movement,
    aspect_ratio: args.aspect,
  };

  // Audio options
  if (args.audio) {
    input.generate_audio = true;
  }
  if (args.bgm) {
    input.bgm = true;
  }

  // Add image input if provided
  if (args.image) {
    const dataUri = await readFileAsBase64(args.image);
    input.image = dataUri;
  }

  // Add end image for start-end mode
  if (args.endImage) {
    const dataUri = await readFileAsBase64(args.endImage);
    input.end_image = dataUri;
  }

  return {
    model_id: modelId,
    input,
  };
}

// Submit prediction request to Atlas Cloud API
async function submitPrediction(
  payload: Record<string, any>,
  apiKey: string
): Promise<string> {
  console.log("Submitting video generation request...");

  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API error (${response.status}): ${errorText}`);
    process.exit(1);
  }

  const data = (await response.json()) as { request_id: string };
  console.log(`Request submitted. ID: ${data.request_id}`);
  return data.request_id;
}

// Poll prediction status until complete
async function pollPrediction(
  requestId: string,
  apiKey: string
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    const response = await fetch(`${API_BASE}/${requestId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Poll error (${response.status}): ${errorText}`);
      process.exit(1);
    }

    const data = (await response.json()) as {
      status: string;
      output?: { video_url?: string; url?: string };
      error?: string;
    };

    switch (data.status) {
      case "completed":
      case "succeeded":
        const videoUrl = data.output?.video_url || data.output?.url;
        if (!videoUrl) {
          console.error("Error: Completed but no video URL in response");
          process.exit(1);
        }
        console.log("\nVideo generation complete!");
        return videoUrl;

      case "failed":
        console.error(`\nGeneration failed: ${data.error || "Unknown error"}`);
        process.exit(1);
        break;

      case "processing":
      case "queued":
      case "starting":
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        process.stdout.write(`\rStatus: ${data.status} (${elapsed}s elapsed)...`);
        break;

      default:
        const elapsedDefault = Math.round((Date.now() - startTime) / 1000);
        process.stdout.write(`\rStatus: ${data.status} (${elapsedDefault}s elapsed)...`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  console.error("\nError: Request timed out after 5 minutes");
  process.exit(1);
}

// Download video from URL
async function downloadVideo(
  url: string,
  outputPath: string
): Promise<void> {
  console.log("Downloading video...");

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Download error (${response.status})`);
    process.exit(1);
  }

  const buffer = await response.arrayBuffer();
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(outputPath, Buffer.from(buffer));
  console.log(`Video saved to: ${outputPath}`);
}

// Main entry point
async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.prompt) {
    console.error("Error: Prompt is required");
    console.error('Usage: vidu-video "your prompt here" [options]');
    process.exit(1);
  }

  // Validate mode-specific requirements
  if ((args.mode === "i2v" || args.mode === "ref") && !args.image) {
    console.error(`Error: --mode ${args.mode} requires --image flag`);
    process.exit(1);
  }

  if (args.mode === "start-end" && (!args.image || !args.endImage)) {
    console.error("Error: --mode start-end requires both --image and --end-image flags");
    process.exit(1);
  }

  // Validate 1080p is only available with Q3-Pro
  if (args.resolution === "1080p" && args.model.startsWith("q3-turbo")) {
    console.error("Error: 1080p resolution is only available with Q3-Pro models");
    console.error("Use --model q3-pro or choose 540p/720p resolution");
    process.exit(1);
  }

  const apiKey = resolveApiKey(args.apiKey);
  const modelId = resolveModel(args);

  console.log(`Model: ${modelId}`);
  console.log(`Prompt: ${args.prompt}`);
  console.log(`Duration: ${args.duration}s | Resolution: ${args.resolution} | Aspect: ${args.aspect}`);
  console.log(`Style: ${args.style} | Movement: ${args.movement}`);
  if (args.image) console.log(`Input image: ${args.image}`);
  if (args.endImage) console.log(`End image: ${args.endImage}`);
  if (args.audio) console.log("Audio: enabled");
  if (args.bgm) console.log("BGM: enabled");
  console.log("");

  // Build and submit request
  const payload = await buildPayload(args, modelId);
  const requestId = await submitPrediction(payload, apiKey);

  // Poll until complete
  console.log("");
  const videoUrl = await pollPrediction(requestId, apiKey);

  // Download the video
  const outputPath = join(args.dir, `${args.output}.mp4`);
  console.log("");
  await downloadVideo(videoUrl, outputPath);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err.message || err);
  process.exit(1);
});
