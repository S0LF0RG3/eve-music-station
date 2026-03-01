# Eve Music Generation Station – Copilot Instructions

## Project Overview

Eve Music Generation Station is a dual-mode agentic music generation web app. It generates Suno prompts (lyrics + style text) and creates actual AI music via the ElevenLabs Music API, using the golden ratio (φ = 1.618033988749) as an algorithmic signature throughout.

## Tech Stack

- **Runtime**: React 19 + TypeScript (strict)
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS v4 (OKLCH colour tokens defined in `theme.json`)
- **UI components**: shadcn/ui + Radix UI primitives (see `components.json`)
- **State / persistence**: `@github/spark` (`useKV`, `spark.llm`)
- **External APIs**: OpenAI GPT-4o-mini (via `spark.llm`), ElevenLabs Music API v1
- **Linting**: ESLint 9 with `typescript-eslint`
- **No test framework is currently present in this repo**

## Repository Layout

```
src/
  App.tsx               – Root component, routing, global state
  components/           – Feature components (AlgorithmDisplay, GenreSelector, …)
  components/ui/        – shadcn/ui primitives (do not edit manually; use shadcn CLI)
  hooks/                – Custom React hooks
  lib/                  – Utility helpers
eve_skills/             – Python helpers for the Moltbook/Eve agent integration
```

## Development Commands

```bash
npm run dev      # Start Vite dev server (port 5000)
npm run build    # Type-check (no emit) then Vite production build
npm run lint     # ESLint across all source files
npm run preview  # Preview production build locally
```

Always run `npm run lint` and `npm run build` after making code changes to confirm there are no type or lint errors.

## Code Style Guidelines

- **TypeScript strict mode** – avoid `any`; prefer explicit types or inference.
- **Functional React only** – no class components.
- **Tailwind utility classes** – use existing OKLCH colour tokens from `theme.json` (e.g. `bg-background`, `text-foreground`, `accent`). Do not add raw hex/rgb values in JSX.
- **shadcn/ui components** – prefer existing primitives in `src/components/ui/` over new dependencies.
- **No default exports for utilities** – use named exports in `lib/` and `hooks/`.
- **Golden ratio signature** – all algorithmic calculations must include φ = 1.618033988749 and 808 bass/percussion references, per the PRD.
- **Comments** – only add comments where logic is non-obvious (mathematical formulas, API quirks). Match the style of existing comments.

## Key Patterns

### LLM calls
Use `spark.llm` for all OpenAI calls. Example:
```ts
import { spark } from "@github/spark";
const result = await spark.llm({ messages: [...], model: "gpt-4o-mini" });
```

### Persistent storage
Use `useKV` from `@github/spark` for browser-side persistence (API keys, library tracks).

### ElevenLabs API
- Endpoint: `POST /v1/music/compose`
- Required body fields: `prompt` (string), `music_length_ms` (3000–300000)
- Returns a streaming MP3 blob; create a `URL.createObjectURL` for playback/download.
- Lyrics character limit: 450 chars (truncate with `…` and show a warning toast).
- Always include "heavy 808 bass and percussion" in prompts.

### Music library
Tracks are stored in KV under a well-known key and capped at 50 entries (oldest removed first).

## Design Constraints

- Dark cosmic aesthetic – deep purple/obsidian backgrounds, golden accent for CTAs and active states.
- Primary font: Space Grotesk; monospace elements: JetBrains Mono.
- Animations use Framer Motion; keep them subtle and performance-friendly.
- Maintain WCAG contrast ratios defined in `PRD.md`.

## What NOT to Do

- Do **not** add new npm dependencies without checking for existing alternatives in `package.json`.
- Do **not** modify files in `src/components/ui/` directly; regenerate them with the shadcn CLI.
- Do **not** store secrets or API keys in source code or environment files committed to the repo.
- Do **not** remove the golden ratio (φ) signature from generation logic.
