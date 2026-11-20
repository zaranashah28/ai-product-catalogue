# Decisions and assumptions

- The owner selects five featured IDs in source-controlled catalogue configuration. Category highlights use the three highest ratings, then review count descending and ID ascending. Remaining products follow the same order.
- Search first matches a trimmed, case-insensitive substring in title or description. If none match, words of four or more characters may match with one typo, including adjacent letters swapped. Prices are displayed as USD. Name and email are required, and the message is optional.
- The API uses Fake Store metadata and images. It caches a valid catalogue, uses stale data when refresh fails, and can start with bundled demo products when the upstream is unavailable. Demo images use a generic placeholder.
- The sales inbox and sender come from server configuration. The product comes from the route ID and the customer email becomes Reply-To. Success means SMTP accepted the message. The local capture adapter logs fabricated submissions for development.
- A single npm manifest and lockfile support the two applications and shared contracts. Reusable React components and CSS tokens support new branding. Injected product and mail functions provide replacement points and deterministic tests.
- Accounts, checkout, admin tooling, and cloud deployment are outside the prototype. With another day after the submission work, prioritize abuse protection and a durable email outbox before serving public traffic.
