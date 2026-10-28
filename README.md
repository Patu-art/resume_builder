# Forma — Resume Studio

Forma is a local-first resume editor with an editorial visual identity, live preview, ATS-friendly document styling, local autosave, print-to-PDF export and optional AI writing assistance.

## Run locally

No build tools or package installation are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Enter your details and review the live preview.
4. Choose **Print / PDF** and select **Save as PDF** in the browser print dialog.

For GitHub Pages, keep `index.html` at the repository root and publish from the configured branch.

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

## Features

- Personal details, summary, experience, education, skills and projects.
- Repeatable experience, education and project entries.
- Live resume preview with Forest, Ink and Copper document accents.
- Browser-local draft autosave.
- Print-to-PDF with A4 layout.
- Optional Google Gemini and OpenAI-compatible AI writing assistance.
- Local text helpers when no AI key is configured.
- Responsive editor, keyboard focus states and reduced-motion support.

## Optional AI setup

Open **AI provider settings** in the Writing desk panel.

### Google Gemini
- Provider: Google Gemini
- Model: `gemini-2.5-flash` (editable)
- API key: your own Gemini key

### OpenAI-compatible API
- Provider: OpenAI-compatible API
- Model: enter a model supported by your provider
- API key: your provider key
- Endpoint: your provider's chat-completions endpoint

Generative AI requires internet access and a valid key. Usage may be subject to provider limits or charges. Without a key, Forma uses simple local text cleanup; that is not generative AI.

## Privacy and security

- Resume content and AI settings are saved in local storage in the current browser.
- This static frontend does not upload resumes to a Forma-owned backend.
- The optional API key is stored in browser local storage. Avoid shared or public computers.
- For a public production service, use a secured server-side proxy instead of exposing provider keys in the browser.
- Review all AI suggestions and keep every claim accurate.

## Limitations

- PDF export uses the browser print dialog.
- AI generation depends on provider availability, key permissions, CORS and model access.
- No account system, cloud sync, database or automatic resume parsing is included.

## License

MIT. See [LICENSE](LICENSE).
