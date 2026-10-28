# ResumeForge — AI Resume Builder

A responsive, local-first resume builder with live preview, ATS-friendly single-column formatting, browser autosave, print-to-PDF export, and optional AI writing assistance.

## Run locally

No build tools or package installation are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Enter your details. The preview updates as you edit.
4. Select **Print / PDF** or **Export PDF**, then choose **Save as PDF** in the print dialog.

For GitHub Pages, keep `index.html` at the repository root and publish from the repository's configured branch.

## Project structure

```text
.
├── index.html
├── assets/
│   └── favicon.svg
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── resume.js
│   └── ai.js
├── README.md
└── LICENSE
```

- **`index.html`** — semantic page structure and script/style references.
- **`css/style.css`** — responsive editor, preview, accessibility states and print styles.
- **`js/resume.js`** — resume data model, local storage, sample data and safe preview rendering.
- **`js/app.js`** — editor tabs, repeatable sections, live updates and PDF printing.
- **`js/ai.js`** — optional AI provider requests and offline text helpers.
- **`assets/favicon.svg`** — small brand icon.

## Features

- Personal details, summary, experience, education, skills and projects.
- Add and remove repeatable entries.
- Live preview with Modern Indigo, Classic Charcoal and Professional Green themes.
- Browser-local draft autosave.
- Print dialog export to PDF with A4 print styles.
- Optional Google Gemini and OpenAI-compatible chat-completions providers.
- Offline wording helpers when no AI key is configured.
- Responsive layout and keyboard-visible focus styles.
- Sample resume for quickly checking the interface.

## Optional AI configuration

Open **Configure AI provider** under the AI writing assistant.

### Google Gemini
- Provider: Google Gemini
- Model: `gemini-2.5-flash` (editable)
- API key: your own Gemini key

### OpenAI-compatible API
- Provider: OpenAI-compatible API
- Model: enter a model supported by your provider
- API key: your provider key
- Endpoint: your provider's chat-completions endpoint

AI requests require internet access and may incur charges depending on your provider/account. The app sends the selected text to the configured provider only when an AI action is requested. Without a key, the app uses simple local text cleanup; this is not generative AI.

## Privacy and security notes

- Resume data and AI settings are stored in the browser's local storage on the current device.
- This is a static frontend and does not upload resumes to a project-owned backend.
- The optional API key is stored in browser local storage. Do not use this on a shared or public computer.
- For a public production service, do not expose a provider key in client-side code. Add a secured server-side proxy with authentication, rate limiting and usage controls.
- Review all AI suggestions. Do not include fabricated metrics, qualifications, or work experience.

## Limitations

- PDF export uses the browser's print dialog; choose **Save as PDF**.
- AI generation depends on provider availability, key permissions, CORS policy and model access.
- This starter does not include login, cloud sync, a server database, or automatic resume parsing.

## License

MIT. See [LICENSE](LICENSE).
