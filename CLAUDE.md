# Vidu Video Skill

This is a Claude Code skill for generating videos using Vidu models via Atlas Cloud API.

## Setup

If not already installed, run:

```bash
cd ~/tools/vidu-video-skill && bun install && bun link
```

Or clone fresh:

```bash
git clone https://github.com/thoughtincode/vidu-video-skill.git ~/tools/vidu-video-skill
cd ~/tools/vidu-video-skill && bun install && bun link
```

Make sure `ATLAS_API_KEY` is set in your environment or in `~/.vidu-video/.env`.

## Commands

The `vidu-video` CLI generates videos from text prompts, images, start-end frames, or reference images.

### Text-to-Video
```bash
vidu-video "a cat walking across a sunny garden"
```

### Image-to-Video
```bash
vidu-video "animate this character waving" --mode i2v --image character.png
```

### Start-End Frame Video
```bash
vidu-video "smooth transition" --mode start-end --image start.png --end-image end.png
```

### Reference-to-Video
```bash
vidu-video "character dancing in a garden" --mode ref --image reference.png
```

### Anime Style
```bash
vidu-video "magical girl transformation" --style anime
```

### Audio and BGM
```bash
vidu-video "thunderstorm rolling in" --audio --bgm
```

### Options
- `--model` — Model alias: q3-pro (default), q3-turbo, ref-q1, ref-2.0
- `--mode` — t2v (default), i2v, start-end, ref
- `--duration` — 5 (default) or 8 seconds
- `--resolution` — 540p, 720p (default), 1080p
- `--style` — general (default) or anime
- `--movement` — auto (default), small, medium, large
- `--audio` — Enable AI audio generation
- `--bgm` — Enable AI background music
- `--image` — Input/start image path
- `--end-image` — End frame image path (start-end mode)
- `--aspect` — Aspect ratio (default: 16:9)
- `-o` — Output filename (no extension)
- `-d` — Output directory

## When to Use

Use this skill when the user asks to:
- Generate a video from a text description
- Animate a static image
- Create a transition between two frames (start-end mode)
- Generate character-consistent video (reference mode)
- Create anime-styled video content
- Generate video with audio or background music

## Models

| Model | Price | Use Case |
|-------|-------|----------|
| Q3-Pro T2V | $0.06 | Best quality text-to-video, 1080p |
| Q3-Pro I2V | $0.06 | Animate images, 1080p |
| Q3-Pro Start-End | $0.06 | Start-end frame interpolation |
| Q3-Turbo T2V | $0.034 | Fast, affordable text-to-video |
| Q3-Turbo I2V | $0.034 | Fast image animation |
| Q3-Turbo Start-End | $0.034 | Fast start-end generation |
| Ref-to-Video Q1 | $0.06 | Character-consistent video |
| Ref-to-Video 2.0 | $0.06 | Improved reference adherence |
