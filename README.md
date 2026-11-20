# Fieldwork product catalogue

Browse five featured products, explore categories, search, and send an enquiry from a product page.

## Run with Docker Compose

With Docker and Docker Compose running, launch the app and a local Mailpit inbox:

```sh
docker compose up --build
```

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

## Stack

React and Vite provide a responsive web client with a small development setup. Express keeps the API and email delivery on the server. TypeScript lets both sides share API contracts while the server validates runtime inputs. The client uses one Axios instance and feature-specific API modules and hooks. Catalogue rules, the product provider, and the email transport can evolve independently.
