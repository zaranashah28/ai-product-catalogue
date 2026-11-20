# AI usage

OpenAI Codex supported planning, implementation, review, and verification. The exact model identifier was unavailable to the assistant. The working plan is in [TODAY_PLAN.md](TODAY_PLAN.md). No agent instruction files were added.

## Review moments

- The initial plan assumed Node 24. Inspecting NVM revealed an existing Node 22 installation, and the build and test commands were verified on it.
- The user specified an isolated Axios client and feature-owned hooks and endpoints. This kept requests out of page components.
- The initial dependency draft used an older Nodemailer major. The registry audit flagged it, so the implementation upgraded it and reran verification.
- The first npm resolution hit an internal resolver error. Retrying with a temporary cache and explicitly declaring Testing Library’s DOM dependency resolved installation.

## Time

The implementation session took roughly 11 minutes elapsed, including about 6 minutes of building and 5 minutes of testing, review, and documentation. The earlier planning discussion was intermittent, and its active time was untracked. Docker verification and PR submission are pending.
