# Vidu Video Skill

An AI Agent Skill for generating videos using Vidu models via Atlas Cloud API. Text-to-video, image-to-video, start-end frame video, reference-to-video — all from your terminal. Anime style, 1080p, audio generation, and fine-grained motion control.

Built for the open agent skills ecosystem — works with Claude Code, Cursor, Codex, Copilot, Gemini CLI, Windsurf, OpenCode, Kiro, and 15+ AI coding agents.

## Features

- **Text-to-Video** — Generate video from a text prompt
- **Image-to-Video** — Animate a static image into a video
- **Start-End Frame Video** — Define start and end frames, Vidu fills the motion between
- **Reference-to-Video** — Use a reference image to guide style and character consistency
- **Anime Style** — Built-in anime mode for stylized generation
- **1080p Output** — Full HD resolution support
- **Audio Generation** — Optional AI-generated audio and background music
- **Movement Amplitude Control** — Fine-tune motion intensity (auto, small, medium, large)
- **Multiple Aspect Ratios** — 16:9, 9:16, 1:1, and more
- **Variable Duration** — 5s or 8s video clips
- **Affordable Pricing** — Starting at just from $0.034/s with Atlas Cloud

## Model Variants

| Model | Mode | Starting Price per Second | Resolution | Duration | Notes |
|-------|------|--------------------------|------------|----------|-------|
| Vidu Q3-Pro T2V | Text-to-Video | from $0.06/s | Up to 1080p | 5/8s | Highest quality |
| Vidu Q3-Pro I2V | Image-to-Video | from $0.06/s | Up to 1080p | 5/8s | Animate any image |
| Vidu Q3-Pro Start-End | Start-End Frame | from $0.06/s | Up to 1080p | 5/8s | Define start and end frames |
| Vidu Q3-Turbo T2V | Text-to-Video | from $0.034/s | Up to 720p | 5/8s | Fast and affordable |
| Vidu Q3-Turbo I2V | Image-to-Video | from $0.034/s | Up to 720p | 5/8s | Fast image animation |
| Vidu Q3-Turbo Start-End | Start-End Frame | from $0.034/s | Up to 720p | 5/8s | Fast start-end generation |
| Vidu Ref-to-Video Q1 | Reference-to-Video | from $0.06/s | Up to 720p | 5/8s | Character-consistent generation |
| Vidu Ref-to-Video 2.0 | Reference-to-Video | from $0.06/s | Up to 720p | 5/8s | Improved reference adherence |

*Prices shown are starting prices. Higher resolution or longer duration may cost more.*

> ⚠️ **Note:** Vidu Q3 models may add mosaic/blur to certain NSFW scenes due to training data limitations. Not guaranteed 100% uncensored. For reliable uncensored output, use **Wan 2.2 Spicy** ($0.03) or **Wan 2.6** ($0.07).

## Install

**Requirements:** [Bun](https://bun.sh)

```bash
# Clone the repo
git clone https://github.com/thoughtincode/vidu-video-skill.git ~/tools/vidu-video-skill
cd ~/tools/vidu-video-skill

# Install dependencies
bun install

# Link globally (no sudo needed - uses Bun's global bin)
bun link

# Set up your API key
cp .env.example .env
# Edit .env and add your Atlas Cloud API key
```

Get an Atlas Cloud API key at [Atlas Cloud](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=vidu-video-skill).

Now you can use `vidu-video` from anywhere.

### As an Agent Skill

When installed as an agent skill (works with Claude Code, Cursor, Codex, Copilot, and 15+ AI coding agents), just say `/init` and your AI agent will clone the repo, install deps, and link the command for you. Then use it by saying "generate a video of..." and the agent handles the rest.

### Fallback (if `bun link` doesn't work)

```bash
mkdir -p ~/.local/bin
ln -sf ~/tools/vidu-video-skill/src/cli.ts ~/.local/bin/vidu-video
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Usage

```bash
# Basic text-to-video
vidu-video "a cat walking across a sunny garden"

# Custom output name
vidu-video "ocean waves crashing on rocks" -o waves

# 1080p resolution
vidu-video "futuristic city flyover" --resolution 1080p

# 8-second clip
vidu-video "time-lapse of flowers blooming" --duration 8

# Custom output directory
vidu-video "sunset timelapse" -o sunset -d ~/Videos
```

### Modes

```bash
# Text-to-Video (default)
vidu-video "your prompt"

# Image-to-Video — animate a static image
vidu-video "make this character walk forward" --mode i2v --image character.png

# Start-End Frame — define start and end, Vidu fills the motion
vidu-video "smooth transition between scenes" --mode start-end --image start.png --end-image end.png

# Reference-to-Video — character/style-consistent generation
vidu-video "the character is dancing in a garden" --mode ref --image reference.png
```

### Models

```bash
# Default — Vidu Q3-Pro (highest quality)
vidu-video "your prompt"

# Q3-Turbo — fast and affordable
vidu-video "your prompt" --model q3-turbo

# Q3-Pro Image-to-Video
vidu-video "animate this scene" --model q3-pro-i2v --image scene.png

# Reference-to-Video 2.0
vidu-video "character walks through forest" --model ref-2.0 --image character.png
```

| Alias | Model ID | Best For |
|-------|----------|----------|
| `q3-pro`, `q3-pro-t2v` | `vidu/q3-pro/text-to-video` | Best quality text-to-video |
| `q3-pro-i2v` | `vidu/q3-pro/image-to-video` | Animating static images |
| `q3-pro-start-end` | `vidu/q3-pro/start-end-to-video` | Start-end frame interpolation |
| `q3-turbo`, `q3-turbo-t2v` | `vidu/q3-turbo/text-to-video` | Fast, cost-effective generation |
| `q3-turbo-i2v` | `vidu/q3-turbo/image-to-video` | Fast image animation |
| `q3-turbo-start-end` | `vidu/q3-turbo/start-end-to-video` | Fast start-end generation |
| `ref-q1` | `vidu/reference-to-video/q1` | Character-consistent video |
| `ref-2.0` | `vidu/reference-to-video/2.0` | Improved reference adherence |

### Anime Style

Use the `--style anime` flag to generate anime-styled videos:

```bash
# Anime text-to-video
vidu-video "a magical girl transformation sequence" --style anime

# Anime image-to-video
vidu-video "animate this anime character running" --style anime --mode i2v --image character.png
```

The `--style` flag supports `general` (default) and `anime`.

### Movement Amplitude

Control the intensity of motion in generated videos:

```bash
# Auto (model decides)
vidu-video "a person talking" --movement auto

# Minimal motion
vidu-video "a serene lake at dawn" --movement small

# Moderate motion
vidu-video "a person walking through a park" --movement medium

# Maximum motion
vidu-video "an intense car chase scene" --movement large
```

### Audio Generation

Generate AI audio and background music for your videos:

```bash
# Enable audio generation
vidu-video "a thunderstorm rolling in" --audio

# Enable background music
vidu-video "a romantic sunset scene" --bgm

# Both audio and music
vidu-video "a busy city street" --audio --bgm
```

### Start-End Frame Mode

Define the start and end frames of your video, and Vidu fills in the motion between them:

```bash
# Provide start and end frames
vidu-video "smooth camera pan from left to right" --mode start-end --image start.png --end-image end.png

# With custom duration
vidu-video "character walks from A to B" --mode start-end --image pose-a.png --end-image pose-b.png --duration 8
```

### Resolution and Duration

```bash
# 540p (fastest)
vidu-video "quick concept video" --resolution 540p

# 720p (default, balanced)
vidu-video "product demo video" --resolution 720p

# 1080p (highest quality, Q3-Pro only)
vidu-video "cinematic trailer" --resolution 1080p

# 5-second clip (default)
vidu-video "logo animation" --duration 5

# 8-second clip
vidu-video "extended scene" --duration 8
```

### Aspect Ratios

```bash
# Widescreen (default)
vidu-video "cinematic landscape" --aspect 16:9

# Portrait (social media)
vidu-video "mobile app promo" --aspect 9:16

# Square
vidu-video "instagram post" --aspect 1:1
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output` | `vidu-gen-{timestamp}` | Output filename (no extension) |
| `--model` | `q3-pro` | Model alias or full model ID |
| `--mode` | `t2v` | Generation mode: `t2v`, `i2v`, `start-end`, `ref` |
| `--duration` | `5` | Video duration: `5` or `8` seconds |
| `--resolution` | `720p` | Output resolution: `540p`, `720p`, `1080p` |
| `--style` | `general` | Visual style: `general` or `anime` |
| `--movement` | `auto` | Movement amplitude: `auto`, `small`, `medium`, `large` |
| `--audio` | `false` | Enable AI audio generation |
| `--bgm` | `false` | Enable AI background music |
| `--image` | - | Input/start image path (for i2v/start-end/ref modes) |
| `--end-image` | - | End frame image path (for start-end mode) |
| `--aspect` | `16:9` | Aspect ratio: `16:9`, `9:16`, `1:1`, etc. |
| `-d, --dir` | current directory | Output directory |
| `--api-key` | - | Atlas Cloud API key (overrides env/file) |
| `-h, --help` | - | Show help |

## API Key Configuration

The CLI resolves the Atlas Cloud API key in priority order:

1. `--api-key` flag on the command line
2. `ATLAS_API_KEY` environment variable
3. `.env` file in the current working directory
4. `.env` file in the repo root (next to `src/`)
5. `~/.vidu-video/.env`

```bash
# Option 1: Environment variable
export ATLAS_API_KEY=your_key_here

# Option 2: .env file in current directory
echo "ATLAS_API_KEY=your_key_here" > .env

# Option 3: Global config
mkdir -p ~/.vidu-video
echo "ATLAS_API_KEY=your_key_here" > ~/.vidu-video/.env

# Option 4: Pass directly
vidu-video "your prompt" --api-key your_key_here
```

## How It Works

The CLI uses the Atlas Cloud API to interface with Vidu's video generation models:

1. **Submit Request** — Sends your prompt, images, and configuration to the Atlas Cloud API
2. **Poll for Completion** — Checks the prediction status every 5 seconds until the video is ready
3. **Download Result** — Downloads the generated video to your specified output location

### API Flow

```
POST /api/v1/model/prediction
  → Returns request_id

GET /api/v1/model/prediction/{request_id}
  → Poll until status: "completed"
  → Download output video URL
```

### Model Selection Logic

```
Default:              vidu/q3-pro/text-to-video
--mode i2v:           vidu/q3-pro/image-to-video
--mode start-end:     vidu/q3-pro/start-end-to-video
--mode ref:           vidu/reference-to-video/2.0
--model q3-turbo:     vidu/q3-turbo/text-to-video
--model q3-turbo-i2v: vidu/q3-turbo/image-to-video
--model ref-q1:       vidu/reference-to-video/q1
```

## Vidu Model Deep Dive

### Q3-Pro (Latest)

Vidu's flagship model delivering the highest quality video generation. Q3-Pro supports full 1080p resolution and excels at complex prompts, detailed scenes, and photorealistic output. It handles all generation modes: text-to-video, image-to-video, and start-end frame video.

- **Best for:** Production-quality video, commercial content, high-detail scenes
- **Strengths:** 1080p output, superior motion quality, accurate prompt following
- **Price:** from $0.06/s

### Q3-Turbo

The fast and affordable variant optimized for speed and cost efficiency. Q3-Turbo generates videos up to 720p with shorter processing times, making it ideal for rapid prototyping, batch generation, and cost-sensitive production workflows.

- **Best for:** Prototyping, batch generation, fast iteration, budget-conscious production
- **Strengths:** Fast generation, low cost, reliable quality
- **Price:** from $0.034/s

> ⚠️ **Note:** Vidu Q3 models may add mosaic/blur to certain NSFW scenes due to training data limitations. Not guaranteed 100% uncensored. For reliable uncensored output, use **Wan 2.2 Spicy** ($0.03) or **Wan 2.6** ($0.07).

### Reference-to-Video

Specialized models for character-consistent and style-consistent video generation. Provide a reference image of a character or scene, and the model maintains visual consistency throughout the generated video.

- **Q1:** First generation reference model with solid character consistency
- **2.0:** Improved adherence to reference images with better motion quality
- **Best for:** Character animation, consistent branding, series content
- **Strengths:** Visual consistency, character preservation, style transfer
- **Price:** from $0.06/s

## Unique Features

### Start-End Frame Interpolation

Vidu's start-end frame mode is unique among video generation models. You provide the first and last frames, and the model generates smooth, coherent motion between them. This is perfect for:

- **Morphing effects** — Smooth transitions between two different images
- **Controlled motion** — Define exact start and end poses for character animation
- **Scene transitions** — Create cinematic transitions between shots
- **Storyboard-to-video** — Animate between storyboard keyframes

### Movement Amplitude Control

Fine-tune how much motion appears in your videos with the `--movement` parameter:

- **auto** — Model decides the appropriate level of motion
- **small** — Subtle, minimal movement (talking heads, gentle breeze)
- **medium** — Moderate motion (walking, slow panning shots)
- **large** — Dynamic, high-energy motion (action scenes, fast camera movement)

### Anime Mode

Built-in anime style support produces high-quality anime-styled videos without needing to craft complex style prompts. The `--style anime` flag optimizes the model's output for anime aesthetics, including:

- Character design with anime proportions
- Anime-style shading and coloring
- Fluid animation consistent with anime conventions
- Background art in anime style

## Use Cases

- **Marketing Videos** — Product demos, social media clips, ad creatives
- **Anime Content** — Anime-styled videos with built-in style support
- **Character Animation** — Reference-to-video for consistent character videos
- **Scene Transitions** — Start-end frame mode for smooth transitions
- **Prototyping** — Q3-Turbo for quick, affordable video concepts
- **Social Media** — Portrait mode (9:16) for TikTok, Reels, Shorts
- **Audio-Visual Content** — Built-in audio and BGM generation
- **Storyboard Animation** — Start-end frame mode to animate storyboards
- **Game Development** — Cutscene concepts, character motion studies
- **Video Production** — Visual elements for Remotion/video compositions

## Agent Skill Integration

When installed as an agent skill (works with Claude Code, Cursor, Codex, Copilot, Gemini CLI, Windsurf, Kiro, and more), the skill triggers on phrases like:
- "generate a video"
- "create a video clip"
- "animate this image"
- "make an anime video"
- "create a transition between these frames"
- "generate a video with audio"

Your AI agent will construct the appropriate `vidu-video` command based on your request, handling model selection, resolution, duration, style, movement, audio, and output configuration automatically.

### Example Skill Interactions

```
User: "Generate an 8-second anime video of a samurai battle"
Agent: vidu-video "epic samurai battle scene, dynamic sword fighting" --style anime --duration 8

User: "Animate this character image with minimal movement"
Agent: vidu-video "character performs subtle idle animation" --mode i2v --image character.png --movement small

User: "Create a smooth transition between these two frames"
Agent: vidu-video "smooth cinematic transition" --mode start-end --image start.png --end-image end.png

User: "Make a product demo video with background music"
Agent: vidu-video "product rotating on pedestal, clean white background" --bgm --resolution 1080p
```

## Comparison with Other Video Models

| Feature | Vidu Q3-Pro | Wan 2.6 | Kling 2.0 | Runway Gen-3 |
|---------|-------------|---------|-----------|---------------|
| Price | from $0.06/s | from $0.07/s | $0.10+ | $0.50+ |
| 1080p Support | Yes | No | Yes | Yes |
| Anime Mode | Yes | No | No | No |
| Start-End Frame | Yes | No | No | No |
| Reference Video | Yes | No | No | No |
| Audio Generation | Yes | No | No | No |
| Movement Control | Yes | No | No | No |
| Text-to-Video | Yes | Yes | Yes | Yes |
| Image-to-Video | Yes | Yes | Yes | Yes |

## Troubleshooting

### "API key not found"

Make sure your Atlas Cloud API key is set. See [API Key Configuration](#api-key-configuration).

### "Request timed out"

Video generation can take 30-120 seconds depending on the model and resolution. The CLI will poll automatically. If it times out after 5 minutes, try again or use a lower resolution.

### "Model not found"

Check that you're using a valid model alias. Run `vidu-video --help` to see all available models.

### "Start-end mode requires --image and --end-image"

Both start and end frame images are required for start-end frame mode.

### "1080p only available with Q3-Pro"

Q3-Turbo supports up to 720p. Use `--model q3-pro` for 1080p output.

## 🚀 Take This to Production Today

This workflow is optimized for Atlas Cloud. Move from experiment to enterprise-ready scale.

- **Production-Ready**: Vidu Q3-Pro at only from $0.06/s — premium quality at low cost
- **Budget Option**: Vidu Q3-Turbo at just from $0.034/s for high-volume generation
- **Enterprise Security**: SOC I & II Certified | HIPAA Compliant
- **Zero Maintenance**: Serverless architecture—focus on your product, not the servers

👉 [Start Building](https://www.atlascloud.ai?ref=JPM683&utm_source=github&utm_campaign=vidu-video-skill)

## License

MIT
