# Fieldwork product catalogue

Browse five featured products, explore categories, search, and send an enquiry from a product page.

## MVP acceptance

| Requirement | Implementation |
| --- | --- |
| Browse and search the catalogue on the web | The responsive catalogue includes featured products, category browsing, product detail pages, and search by title or description. |
| Enquire about a product | The product page validates contact details and confirms the enquiry after SMTP accepts it. A Docker smoke test verified that the browser showed **Thank you** and Mailpit received the product details, message, and customer Reply-To address. |
| Use provisional product data | Fake Store API supplies product metadata. Bundled demo products support browsing when the upstream API is unavailable. |
| Build a foundation that can evolve | Product data and email delivery sit behind replaceable server adapters. Reusable React components and CSS design tokens support changes to the look and feel. |

Mailpit is the local test inbox. Delivery to a real sales inbox requires configuring a live email provider. Moving to a different product data source may also require updating the image proxy, which currently accepts Fake Store image URLs.

## Run with Docker Compose

With Docker running and Docker Compose available, start the app and a local Mailpit inbox:

```sh
docker compose up
```

The local demo needs no paid service, account, API key, or `.env` setup. Mailpit runs alongside the app and catches test enquiries.

The startup logs show both browser URLs. Use `docker compose up --build` after changing the app, or `make up` to run in the background and print both URLs after the services are healthy.

1. Open [Fieldwork](http://localhost:8080), choose a product, and click **Enquire**.
2. Submit the form with sample contact details. The page shows **Thank you** after the SMTP server accepts the message.
3. Open [Mailpit](http://localhost:8025). Check that the email is addressed to `sales@example.test` and includes the product, contact details, and customer email as the reply address.

Compose defaults to the local inbox. To override the demo sender or recipient, set `SMTP_FROM` or `SALES_EMAIL` in a local `.env` file. Stop the stack with `docker compose down`.

## Develop with Node

Use Node.js 22.12 or newer in the Node 22 line and npm. With NVM, run `nvm use` first.

```sh
npm ci
ENQUIRY_MODE=capture npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to Express on port 3001. Submit a sample enquiry and look for “Local enquiry captured” in the API terminal. Capture mode is for fabricated contact details during local development.

For SMTP, copy `.env.example` to `.env`, set the inbox and SMTP settings, and run `npm run dev`. Leave `ENQUIRY_MODE=smtp`. If changing the local API port, set `PORT` in the launching shell so both Vite and Express use it.

```sh
npm test
npm run build
```

## Submission notes

- Implementation assumptions and scope decisions are recorded in [DECISIONS.md](DECISIONS.md).
- AI use, review moments, and the time recorded so far are documented in [AI_USAGE.md](AI_USAGE.md).
- The build plan and Docker enquiry verification are recorded in [TODAY_PLAN.md](TODAY_PLAN.md).

## Stack choice

- **Client — React with TypeScript and Vite.** A responsive web app lets reviewers open the catalogue in a browser. Reusable React components and CSS design tokens support later branding changes.
- **Backend — Node.js 22 with Express and TypeScript.** Express provides catalogue and enquiry endpoints and serves the built frontend in Docker. Sharing TypeScript contracts keeps the client and server aligned, and server adapters let the product source and email provider evolve independently.

The React frontend calls our Express API under `/api`. The Express product adapter fetches catalogue data from Fake Store API and handles validation, caching, and fallback data on the server.

Set `PRODUCT_API_ORIGIN` in `.env` to configure the server-side product provider. See [.env.example](.env.example) for the supported settings. Node and Docker Compose default to Fake Store API.

The Dockerfile builds a standard Linux container image for the app. Docker Compose provides the local demo environment. AWS deployment resources are outside the MVP scope.
