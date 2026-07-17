# backend/storage/

`outbox/` holds password-reset emails written by `Mailer::send()` when
`MAIL_ENABLED` is not `true` in `.env` (the default). Each file is a plain
`.txt` snapshot of one email — open the most recent one to get the reset
link during local development or a demo, instead of needing a real mail
server configured.

This directory is not served over HTTP — it lives outside `public/`, which
is the web server's document root.
