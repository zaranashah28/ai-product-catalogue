# Decisions and assumptions

## Acceptance assumptions

- **Homepage selection** — The owner chooses five featured products. Their IDs and display order are configured in the backend.
- **Category ranking** — The three highest-rated products appear first. Ties are broken by review count descending, then product ID ascending. Remaining products follow the same order.
- **Search matching** — The primary match is a case-insensitive substring in the product title or description, with leading and trailing whitespace ignored.
- **Enquiry details** — Name and email are required, and the message is optional. The product comes from the route ID, the customer’s email becomes the Reply-To address, and **Thank you** appears after SMTP accepts the email.
- **Local sales inbox** — Mailpit receives enquiries during local review without external credentials. The sales recipient and sender come from server configuration. The local capture adapter logs fabricated submissions during development.
- **Currency** — Prices are displayed in USD.

## Requirements simplified and why

- **Featured product selection** — The owner configures the five homepage picks in the backend. This gives the owner control over the selection without building an admin interface for the proof of concept.
- **Sales inbox** — Mailpit stands in for a live sales inbox so reviewers can verify delivery without setting up SMTP credentials or creating an external account.
- **Product data** — Fake Store API supplies the catalogue for the demo, so a product management system can wait. Bundled products keep browsing available if the upstream API is down.
- **Deployment** — Docker Compose runs the app and test inbox locally with one command. AWS deployment was deferred because the challenge makes cloud infrastructure optional and prioritizes quick local review.

## Known deviation

When there are no literal search matches, the backend can match words of four or more characters with one typo, including an adjacent letter swap. If there are still no results, the page can display recommended products. Both behaviors can show products without a literal text match, which deviates from the search acceptance criterion.

## How the design can grow beyond the proof of concept

- **Product data** — The client reads catalogue data through Express and shares TypeScript contracts with the server. A new provider can map its data to the existing product model so search and category pages keep using the same API. A provider with a different image URL structure would also require updating the image adapter. The current provider caches valid results and uses stale or bundled demo products if the upstream is unavailable.
- **Enquiry delivery** — The API receives a mail sender as a dependency. A future SMTP relay can be configured through environment variables, or a provider-specific adapter can implement the same mail sender contract. The form and enquiry validation can continue using the same endpoint.
- **Branding** — Reusable React components and shared CSS design tokens give a designer places to change colour, spacing, and presentation without touching the catalogue or enquiry rules.
- **Future AWS deployment** — The Dockerfile already builds the frontend and Express API into one Linux container image. A future deployment could run that image on AWS, with runtime configuration supplied by the hosting environment and Mailpit replaced by a live mail provider.

## Scope

Accounts, checkout, admin tooling, and cloud deployment are outside the prototype.

## What I’d do with another day

**Save enquiries and retry failed emails.** I’d store each enquiry and its pending notification in one database transaction, then use a background worker to retry temporary SMTP failures. I’d verify that an enquiry submitted during a Mailpit outage reaches the sales inbox after Mailpit returns, without asking the customer to resubmit.

Follow-up options depend on what the entrepreneur wants to validate next.

- **Sales dashboard** — Give sales a protected view of saved enquiries with the product, customer contact details, and follow-up status.
- **Featured product management** — Let the owner select and reorder the five homepage products in an admin screen without editing code or rebuilding the app.
- **Catalogue filters** — Let customers filter by price and sort by rating using the existing product data.
- **AWS staging demo** — Deploy the existing container and connect a live email provider once hosting and inbox access are available. This would give stakeholders a shareable preview.
