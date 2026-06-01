# CEDRUMO Website

Public-facing website for the CEDRUMO app (Personal Cigar & Pairing Companion).
Static, bilingual (German + English), responsive, no tracking, no third-party calls.

- **Domain:** cedrumo.com
- **Hosting:** IONOS Webhosting Standard (contract 112314626)
- **Owner:** CEDRUMO Digital Ventures GmbH i.G. (Dietmar Münnich)

---

## Tech stack

- Hand-written HTML / CSS, no framework, no build step, no JavaScript dependencies
- Self-hosted Cormorant Garamond (serif headings) + Inter (sans body) as woff2 in `assets/fonts/`
- Single stylesheet at `assets/css/main.css` with CSS custom properties for the palette
- Static deploy via SFTP, no server-side rendering, no API calls

This is intentional. The signed agreement (Vereinbarungspunkte 27.05.2026) explicitly
requires no analytics, no tracking, no marketing pixels, no third-party calls at launch.
Self-hosting the fonts (instead of loading from fonts.googleapis.com) is the same rule
applied to typography, see LG München ruling 2022 on Google Fonts and DSGVO.

---

## Local preview

```bash
cd cedrumo-website
python3 -m http.server 8080
# then open http://localhost:8080/de/ or http://localhost:8080/en/
```

No build step. Edit the .html / .css files directly. Refresh the browser.

---

## File and page structure

```
/
├── index.html                     Root redirect (browser language → /de/ or /en/)
├── icon.svg                       CEDRUMO favicon source (serif "C" on midnight blue)
├── favicon.ico                    16+32 multi-resolution icon
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png           180x180 for iOS home-screen pinning
├── sitemap.xml                    All 14 page URLs with hreflang alternates
├── robots.txt                     Allow all, points crawlers at sitemap
├── README.md                      This file
├── assets/
│   ├── css/main.css               Single stylesheet
│   ├── fonts/                     9 woff2 files (4 Cormorant Garamond + 5 Inter weights)
│   └── images/                    App screenshots used in landing hero
├── de/                            German pages
│   ├── index.html                 Landing
│   ├── features/index.html        Funktionen
│   ├── premium/index.html         Premium-Modell
│   ├── privacy/index.html         Datenschutz (provisional, Ms Kirsch finalises)
│   ├── support/index.html         Support + FAQ
│   ├── impressum/index.html       § 5 TMG / § 18 MStV
│   └── fachhaendler/index.html    B2B onepager for specialist retailers
└── en/                            English pages (mirror of /de/ except /impressum → /legal)
    ├── index.html
    ├── features/index.html
    ├── premium/index.html
    ├── privacy/index.html
    ├── support/index.html
    ├── legal/index.html
    └── retailers/index.html
```

Every page in both languages shares the same header navigation and footer; the language
switch link in the header swaps the locale prefix while preserving the route.

---

## Deploy mechanism

Auto-deploy fires on every push to `main` via GitHub Actions:
`.github/workflows/deploy.yml` runs `lftp ... mirror --reverse --delete` against the
IONOS SFTP endpoint. Takes ~30 seconds.

### Required GitHub repository secrets

Settings → Secrets and variables → Actions → New repository secret

| Secret | Value | Notes |
|---|---|---|
| `IONOS_SFTP_HOST` | `access-5020562671.webspace-host.com` | Stable IONOS endpoint for this webspace |
| `IONOS_SFTP_USER` | `su570288` | IONOS contract user ID |
| `IONOS_SFTP_PASS` | (see IONOS dashboard or password manager) | Rotate from IONOS dashboard if compromised |
| `IONOS_SFTP_REMOTE_DIR` | `/Website/` | cedrumo.com is bound at the IONOS dashboard to a `Website` folder inside the webspace. Deploy must target this subdirectory; deploying to `/` (webspace root) does NOT serve to cedrumo.com and the next `mirror --delete` would wipe the `Website` folder. Do NOT change to `/`. |

### Rotating the SFTP password

1. Log into IONOS dashboard → Hosting → Webhosting Standard (contract 112314626) → SFTP Access
2. Reset password
3. Update `IONOS_SFTP_PASS` secret: `gh secret set IONOS_SFTP_PASS -R Cedrumo/cedrumo-website` then paste the new password
4. Re-run the workflow: `gh workflow run deploy.yml -R Cedrumo/cedrumo-website --ref main`

### Manual deploy fallback (no GitHub Actions)

```bash
SSHPASS='<the-password>' sshpass -e lftp -e \
  "set sftp:auto-confirm yes; \
   mirror --reverse --delete --verbose \
     --exclude-glob .git* --exclude-glob .github* \
     --exclude-glob README.md --exclude-glob .gitignore \
     . /Website/; bye" \
  sftp://su570288@access-5020562671.webspace-host.com
```

Note the trailing `/Website/` — see the `IONOS_SFTP_REMOTE_DIR` row in the
secrets table for why this subdirectory is mandatory.

---

## Rollback procedure

If a deploy puts a bad build live (broken layout, missing page, regressed
content) the recovery path is git-driven and takes about a minute:

```bash
git revert <bad-commit-sha>     # creates an inverse commit
git push origin main            # triggers the SFTP deploy workflow
```

The GitHub Actions workflow re-mirrors the now-reverted working tree to
the IONOS webspace, so the prior good state goes live within ~30 seconds
of the push. No manual SFTP intervention needed for the common case.

If GitHub Actions itself is unavailable or the working tree is in an
unrecoverable state, the manual fallback above (lftp via SFTP into
`/Website/`) can push any local snapshot. The IONOS Webhosting Standard
customer dashboard also offers an automatic snapshot backup feature
(Hosting → Webhosting Standard → Backups) that holds several days of
file-level snapshots and can roll the entire webspace back from within
the IONOS UI — this is the second line of defence if both the GitHub
repo and the local working tree are compromised.

### What the deploy workflow refuses to do

The `Guard against destructive REMOTE_DIR misconfiguration` step in
`.github/workflows/deploy.yml` aborts before lftp runs if
`IONOS_SFTP_REMOTE_DIR` is empty, exactly `/`, `.`, `./`, or any path
that does not start with `/Website`. This is the programmatic backstop
against the failure mode that took cedrumo.com offline on 1 June 2026
when the secret was briefly set to `/` and `mirror --reverse --delete`
wiped the `Website` wrapper folder cedrumo.com is bound to. If the
guard ever triggers, fix the secret (`gh secret set
IONOS_SFTP_REMOTE_DIR -R Cedrumo/cedrumo-website` then type `/Website/`)
and re-run the workflow.

---

## What is provisional and needs to be replaced

| File | What replaces it | Owner |
|---|---|---|
| `de/privacy/index.html` + `en/privacy/index.html` | Final DSGVO text from Ms Kirsch | Dietmar / Ms Kirsch |
| `de/impressum/index.html` + `en/legal/index.html` | Register number + VAT ID once Handelsregister entry completes | Dietmar |
| Landing-hero "App Store / Google Play" placeholder buttons | Real App Store + Google Play URLs once the app is live | Hevin |
| Hero screenshots in `assets/images/` | Higher-fidelity screenshots from production app once it ships | Hevin |

All provisional content is clearly marked in-page as such (e.g. "vorläufige Angabe bis
Handelsregistereintrag" in the footer).

---

## Ownership

The repository, the IONOS account, the domain `cedrumo.com`, the email infrastructure
under that domain, and the source code are all the property of Dietmar Münnich / the
future CEDRUMO Digital Ventures GmbH. Hevin (hevinmgolakiya4@gmail.com) is a
time-limited collaborator on the GitHub repository for implementation and maintenance;
access can be revoked at any time without breaking the deploy.

## Usage rights

Per the signed Vereinbarungspunkte (27 May 2026), Dietmar Münnich / CEDRUMO Digital
Ventures GmbH i.G. is granted unrestricted commercial use, modification, sublicensing
and distribution rights to every individually created website asset in this repository:
HTML, CSS, copy, layout, the `icon.svg` source, the rendered favicons + Apple touch
icon, the og:image card under `assets/og/`, the sitemap.xml, the deploy workflow under
`.github/workflows/`, and this README.

### Third-party components disclosed

| Component | Source | License | Notes |
|---|---|---|---|
| Cormorant Garamond (woff2 subsets, weights 400/500/600/700) | https://github.com/CatharsisFonts/Cormorant | SIL Open Font License 1.1 | Bundled license text at `assets/fonts/OFL.txt`. May be re-used, modified, embedded and shipped with the site without further permission. |
| Inter (woff2 subsets, weights 300/400/500/600/700) | https://github.com/rsms/inter | SIL Open Font License 1.1 | Same OFL.txt covers both families. |
| App screenshot PNGs under `assets/images/` | CEDRUMO app build 14 (Hevin) | Transferred to CEDRUMO Digital Ventures GmbH i.G. under the same Vereinbarungspunkte agreement | Subject to refresh when production app ships. |

### Not third-party (intentionally absent)

The site loads zero scripts, fonts, stylesheets, analytics, marketing pixels, social
widgets, fingerprinters, A/B testers, consent vendors or CDNs from any external origin.
Subresource Integrity (SRI) attributes are therefore not currently used. If any external
asset is ever added in the future, it must carry both `integrity=` and
`crossorigin="anonymous"` attributes and be re-evaluated against the agreement's
"no third-party calls at launch" clause.

## License

Proprietary. All rights reserved by CEDRUMO Digital Ventures GmbH i.G.

Bundled webfonts retain their SIL Open Font License 1.1 — see `assets/fonts/OFL.txt`.
