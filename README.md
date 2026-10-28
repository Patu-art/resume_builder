# Forma — Resume Studio

Forma is a guided, local-first resume builder. It asks for the target role and application type, supports candidates with or without formal work experience, accepts an optional profile photo, and builds a structured resume with a live A4 preview.

## Run locally

No build tools or package installation are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Start with **Start & questions**. Answer what applies; return to any step whenever you need.
4. Add your contact details, education, skills, projects and any relevant experience or additional sections.
5. Review the live preview, then choose **Print / PDF** and select **Save as PDF**.

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

- Guided intake: target role, job description, experience level and resume purpose.
- Explicit work-experience choice; fresher resumes can omit the work-experience section.
- Optional profile-photo upload with a preview, include/exclude toggle and remove control.
- Structured sections for summary, work experience, education, skills, projects, certifications, achievements/activities, languages and additional information.
- Add/remove repeatable entries for experience, education, projects, certifications and achievements.
- ATS-conscious single-column resume document with Forest, Ink and Copper accents.
- Live preview, browser-local autosave and A4 print-to-PDF export.
- Optional Google Gemini and OpenAI-compatible AI writing assistance.
- Local text helpers when no AI key is configured.
- Responsive layout, keyboard focus states and reduced-motion support.

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

- Resume content, the optional photo and AI settings are saved in local storage in the current browser.
- This static frontend does not upload resumes to a Forma-owned backend.
- The optional API key is stored in browser local storage. Avoid shared or public computers.
- For a public production service, use a secured server-side proxy instead of exposing provider keys in the browser.
- Review AI suggestions and keep every claim accurate. Never invent employment, qualifications or achievements.

## Limitations

- PDF export uses the browser print dialog.
- AI generation depends on provider availability, key permissions, CORS and model access.
- No account system, cloud sync, database or automatic resume parsing is included.

## License

MIT. See [LICENSE](LICENSE).
