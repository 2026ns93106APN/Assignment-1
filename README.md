# Assignment 1 — AI Augmented SDLC

This repository contains both parts of Assignment 1 for the AI-Augmented SDLC course.

## Part 1A — UI5 Manifest Validator
A deterministic Node.js CLI that validates SAPUI5 `manifest.json` files against six rules with a harness enforcing lint, security, and test gates.

See [`Part-1A/README.md`](Part-1A/README.md) for full details, and [`Part-1A/evidence/harness-log.md`](Part-1A/evidence/harness-log.md) for the development and verification history.

## Part 1B — UI5 Review Assistant
A non-deterministic AI-based code review tool that uses the Gemini API to flag hardcoded text and missing error handling in SAPUI5 code, evaluated against an 18-case synthetic dataset.

See [`Part-1B/README.md`](Part-1B/README.md) for full details, and [`Part-1B/evidence/harness-log.md`](Part-1B/evidence/harness-log.md) for the development and verification history, including the final evaluation result (macro-F1 0.929, PASS).

