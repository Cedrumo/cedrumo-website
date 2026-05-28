# CEDRUMO Website

Source code for the official CEDRUMO website (cedrumo.com).

**Owner:** CEDRUMO Digital Ventures GmbH i.G.
**Stack:** Static HTML/CSS/JS, no framework, no build step.
**Hosting:** IONOS Webhosting Standard (contract 112314626) via SFTP.
**Deployment:** Automated on every push to `main` via GitHub Actions.

## Structure

```
/                       — landing (DE) / redirect logic
/de/                    — German landing
/en/                    — English landing
/de/features/           — features page DE
/en/features/           — features page EN
/de/premium/            — premium page DE
/en/premium/            — premium page EN
/de/privacy/            — privacy DE (Ms Kirsch's approved text)
/en/privacy/            — privacy EN (Ms Kirsch's approved text)
/de/support/            — support DE
/en/support/            — support EN
/de/impressum/          — Impressum DE
/en/legal/              — legal EN
/assets/css/            — shared stylesheet
/assets/img/            — images + favicons
/assets/js/             — minimal vanilla JS
```

## Deployment

Pushes to `main` automatically deploy to IONOS via SFTP.

Required GitHub Secrets (set in repo Settings > Secrets and variables > Actions):

- `IONOS_SFTP_HOST` — e.g. `access-5020562671.webspace-host.com`
- `IONOS_SFTP_USER` — e.g. `su570288`
- `IONOS_SFTP_PASS` — the SFTP password
- `IONOS_SFTP_REMOTE_DIR` — usually `/` or a subpath under the webspace root

## Local preview

Open `index.html` directly in a browser, or run a simple static server:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000/de/`.

## License

Proprietary. All rights reserved by CEDRUMO Digital Ventures GmbH i.G.
