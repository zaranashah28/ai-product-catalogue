# Fieldwork product catalogue

Browse five featured products, explore categories, search, and send an enquiry from a product page.

## Run locally

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

## Stack

React and Vite provide a responsive web client with a small development setup. Express keeps the API and email delivery on the server. TypeScript lets both sides share API contracts while the server validates runtime inputs. The client uses one Axios instance and feature-specific API modules and hooks. Catalogue rules, the product provider, and the email transport can evolve independently.

Docker Compose and the Mailpit walkthrough are planned for the next session.
