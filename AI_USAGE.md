# AI usage

## Tools, model, and plan

- **AI coding tool and model** — OpenAI Codex, based on GPT-6. The exact model variant was unavailable.
- **Verification tools** — npm and Vite for builds, Vitest for frontend and backend tests, and Docker Compose, Playwright, and Mailpit for the browser-to-email smoke test.
- **Agent instructions** — The repo contains no committed project-specific agent instruction files.
- **Plan and spec** — The working plan is in [TODAY_PLAN.md](TODAY_PLAN.md). The acceptance assumptions are in [DECISIONS.md](DECISIONS.md).

## Prompts and decisions that shaped the solution

1. The user directed Codex to use one Axios client and keep hooks and API calls with their features. Page components could then focus on rendering the catalogue and form.
2. The user chose Docker Compose and Mailpit for the enquiry demo. Codex submitted an enquiry through the browser and checked that one matching email arrived.
3. The user asked to see both browser URLs when running plain `docker compose up`. The app logs the catalogue and Mailpit URLs at startup.
4. The user reiterated that product data must go through the backend and asked for the provider URL in environment configuration. Codex verified that metadata and images already used Express routes, then added the server-side `PRODUCT_API_ORIGIN` setting to Compose and `.env.example`.

## What the AI got wrong and how it was caught

- **Node version** — The initial AI plan assumed Node 24. Inspecting NVM revealed an existing Node 22 installation, and the user’s startup logs showed their terminal still used Node 16. The project was built and tested on Node 22, and the setup instructions specify the required version.
- **Mail dependency** — The initial AI dependency draft used an older Nodemailer major. The npm audit flagged it, so the dependency was upgraded and verification was rerun.
- **Startup command** — The AI first added a `make up` wrapper to display URLs. The user clarified that plain `docker compose up` should display them. Codex added the URLs to the app’s startup logs and verified the production build.

## Time

Total project time was approximately **2 hours**. The split below is a rough estimate.

| Activity | Approximate time |
| --- | ---: |
| Planning and clarifying acceptance criteria | 25 minutes |
| Building the catalogue, enquiry flow, and Docker setup | 55 minutes |
| Running tests and verifying the enquiry in Mailpit | 25 minutes |
| Reviewing the code and updating submission documentation | 15 minutes |
