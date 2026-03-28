# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

## Architecture

Next.js 14 App Router project — no database, all user state in localStorage.

### Key Directories
- `src/app/` — App Router pages and layouts. Each section (study, quiz, flashcards, etc.) has its own subdirectory.
- `src/components/` — Split into `ui/` (shadcn primitives), `layout/` (sidebar, header, nav), and feature components (`study/`, `quiz/`, `flashcards/`, `scenarios/`, `progress/`, `labs/`).
- `src/content/` — All static content as TypeScript data files and MDX. No CMS.
  - `domains.ts` — Domain metadata (name, weight, color, topic list)
  - `quizzes/domain-N.ts` — Arrays of `QuizQuestion` objects
  - `flashcards/domain-N.ts` — Arrays of `Flashcard` objects
  - `topics/domain-N/*.mdx` — Topic content rendered with custom MDX components
- `src/lib/` — Utilities: `types.ts` (all TS types), `progress.ts` (localStorage CRUD), `quiz-engine.ts`, `flashcard-engine.ts` (SM-2 algorithm)
- `src/hooks/` — React hooks wrapping lib utilities for components

### Content Rules
- Every `QuizQuestion`: scenario-based, 4 options, `explanation` required, plausible wrong answers
- Core exam philosophy: programmatic enforcement > prompt-based guidance
- All code examples must be syntactically valid
- Anti-patterns are exam gold — use `AntiPatternCard` component to highlight them
- Source of truth: docs.anthropic.com

### Exam Domains
1. Agentic Architecture & Orchestration — 27%
2. Tool Design & MCP Integration — 18%
3. Claude Code Configuration & Workflows — 20%
4. Prompt Engineering & Structured Output — 20%
5. Context Management & Reliability — 15%

### Theme System
- Dark-first with light mode toggle via `next-themes`
- CSS variables in `globals.css` map to Tailwind tokens
- Deep navy background (`--background: 222 47% 8%`), electric blue primary, amber accent for exam tips
- `domainColorMap` in `src/content/domains.ts` maps domain color names → Tailwind classes

### localStorage Schema
`UserProgress` stored at key `cca-study-progress`. Never access localStorage directly — use `src/lib/progress.ts` functions (`getProgress`, `markTopicComplete`, `recordQuizAttempt`, `updateFlashcardProgress`).

### local/ Directory
The `local/` directory contains Python labs and Claude Code skills — these are NOT part of the Next.js web app. They're standalone Python scripts for hands-on practice.
