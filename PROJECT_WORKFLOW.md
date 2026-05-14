# Project Workflow Notes

## Project Context

- This repo is an Adobe Experience Manager Edge Delivery Services site based on the Adobe AEM boilerplate.
- The stack is vanilla JavaScript, scoped block CSS, semantic HTML, and Node-based linting.
- Block work should stay aligned with the authoring model used by AEM and DA.live.

## Working Agreement

- For UI requests, show a quick visual representation of the current state before making changes.
- After the visual check, proceed with the implementation instead of waiting for repeated prompts.
- Assume implementation should continue immediately unless a risky product decision needs confirmation.
- The user will handle manual testing, so report what changed without sending local run or test commands back to them.
- Keep explanations concise and grounded in the current block structure and AEM project conventions.
- Prefer minimal, block-scoped changes over broad global styling edits.

## Current UI Request Reference

- The `search-bar` block should keep the search field and sort control on a single row.
- The search field should take the remaining width and the sort control should stay right-aligned.
- Mobile behavior should preserve the single-row layout with tighter spacing instead of dropping to a second line.
