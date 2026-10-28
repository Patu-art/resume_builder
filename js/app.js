(() => {
    "use strict";

    const { createEmptyResume, createSampleResume, getResume, getValue, saveResume, setValue, renderPreview } = window.ResumeForge;
    const state = {
        resume: getResume(),
        activeTab: "personal"
    };

    const elements = {
        editor: document.querySelector("#editorPanel"),
        preview: document.querySelector("#resumePreview"),
        saveStatus: document.querySelector("#saveStatus"),
        toast: document.querySelector("#toast"),
        aiStatus: document.querySelector("#aiStatus")
    };

    const field = (label, path, placeholder = "", multiline = false, fullWidth = false) => {
        const value = ResumeForge.escapeHtml(getValue(state.resume, path));
        const className = `field${fullWidth ? " field-full" : ""}`;
        const control = multiline
            ? `<textarea data-path="${path}" placeholder="${placeholder}">${value}</textarea>`
            : `<input data-path="${path}" value="${value}" placeholder="${placeholder}">`;

        return `
            <div class="${className}">
                <label>${label}</label>
                ${control}
            </div>
        `;
    };

    const renderPersonalTab = () => `
        <div class="section-heading">
            <h2>Personal details</h2>
            <span class="section-count">01 / 05</span>
        </div>
        <div class="form-grid">
            ${field("Full name", "personal.name", "e.g. Alex Morgan")}
            ${field("Target job title", "personal.role", "e.g. Frontend Developer")}
            ${field("Email address", "personal.email", "alex@email.com")}
            ${field("Phone number", "personal.phone", "+91 98765 43210")}
            ${field("City / location", "personal.location", "Kalyan, Maharashtra")}
            ${field("LinkedIn URL", "personal.linkedin", "linkedin.com/in/yourname")}
            ${field("Portfolio / GitHub", "personal.website", "github.com/yourname")}
            ${field("Professional summary", "personal.summary", "Your strengths, relevant experience and target role.", true, true)}
        </div>
        <div class="form-actions">
            <span class="field-hint">Keep your contact details current and use a specific job title.</span>
            <button class="button button-primary" data-next="experience" type="button">Next: Experience →</button>
        </div>
    `;

    const renderEntries = (type, entries, title, fields) => {
        const cards = entries.map((entry, index) => {
            const entryFields = fields.map((item) => {
                return field(item.label, `${type}.${index}.${item.key}`, item.placeholder, Boolean(item.multiline), Boolean(item.fullWidth));
            }).join("");

            return `
                <section class="entry-card">
                    <div class="entry-header">
                        <strong>${title} ${index + 1}</strong>
                        <button class="button button-danger button-small" data-remove="${type}" data-index="${index}" type="button">Remove</button>
                    </div>
                    <div class="form-grid">${entryFields}</div>
                </section>
            `;
        }).join("");

        return cards;
    };

    const renderExperienceTab = () => `
        <div class="section-heading">
            <h2>Experience</h2>
            <span class="section-count">02 / 05</span>
        </div>
        <p class="field-hint">Include employment, internships, volunteering, freelance work or leadership. Describe what you actually did.</p>
        ${renderEntries("experience", state.resume.experience, "Role", [
            { label: "Job title", key: "role", placeholder: "e.g. Web Development Intern" },
            { label: "Company / organization", key: "company", placeholder: "Organization name" },
            { label: "Location", key: "location", placeholder: "Remote / Mumbai" },
            { label: "Start date", key: "start", placeholder: "Jan 2025" },
            { label: "End date", key: "end", placeholder: "Present" },
            { label: "Responsibilities and achievements", key: "details", placeholder: "Use action verbs. Add real results where known.", multiline: true, fullWidth: true }
        ])}
        <button class="button add-entry" data-add="experience" type="button">+ Add experience</button>
        <div class="form-actions">
            <button class="button button-quiet" data-next="personal" type="button">← Basics</button>
            <button class="button button-primary" data-next="education" type="button">Next: Education →</button>
        </div>
    `;

    const renderEducationTab = () => `
        <div class="section-heading">
            <h2>Education</h2>
            <span class="section-count">03 / 05</span>
        </div>
        ${renderEntries("education", state.resume.education, "Education", [
            { label: "Degree / qualification", key: "degree", placeholder: "B.Tech Computer Science" },
            { label: "School / college", key: "school", placeholder: "Institution name" },
            { label: "Location", key: "location", placeholder: "City" },
            { label: "Graduation year", key: "year", placeholder: "2029" },
            { label: "Relevant coursework / result", key: "details", placeholder: "Optional: CGPA, coursework, honors", multiline: true, fullWidth: true }
        ])}
        <button class="button add-entry" data-add="education" type="button">+ Add education</button>
        <div class="form-actions">
            <button class="button button-quiet" data-next="experience" type="button">← Experience</button>
            <button class="button button-primary" data-next="skills" type="button">Next: Skills →</button>
        </div>
    `;

    const renderSkillsTab = () => `
        <div class="section-heading">
            <h2>Skills and projects</h2>
            <span class="section-count">04 / 05</span>
        </div>
        ${field("Skills (comma separated)", "skills", "HTML, CSS, JavaScript, teamwork...", true, true)}
        <p class="field-hint">Only list skills you can confidently discuss in an interview.</p>
        <h3>Projects</h3>
        ${renderEntries("projects", state.resume.projects, "Project", [
            { label: "Project name", key: "name", placeholder: "Portfolio website" },
            { label: "Project link", key: "link", placeholder: "GitHub or live demo" },
            { label: "What you built / impact", key: "details", placeholder: "Problem, tools used and outcome.", multiline: true, fullWidth: true }
        ])}
        <button class="button add-entry" data-add="projects" type="button">+ Add project</button>
        <div class="form-actions">
            <button class="button button-quiet" data-next="education" type="button">← Education</button>
            <button class="button button-primary" data-next="design" type="button">Next: Style →</button>
        </div>
    `;

    const renderDesignTab = () => {
        const themes = [
            { value: "modern", label: "Forest" },
            { value: "classic", label: "Ink" },
            { value: "green", label: "Copper" }
        ];

        return `
            <div class="section-heading">
                <h2>Resume style</h2>
                <span class="section-count">05 / 05</span>
            </div>
            <p class="field-hint">Choose a restrained accent. The resume keeps a single-column structure for easier ATS parsing.</p>
            <div class="style-options">
                ${themes.map((theme) => `
                    <button class="style-option" data-theme="${theme.value}" aria-pressed="${state.resume.theme === theme.value}" type="button">
                        ${theme.label}
                    </button>
                `).join("")}
            </div>
            <div class="checklist">
                <h3>Before exporting</h3>
                <ul>
                    <li>Check spelling, dates and contact information.</li>
                    <li>Match relevant keywords to the job description.</li>
                    <li>Keep every achievement and qualification truthful.</li>
                    <li>Open the print dialog and save as PDF on A4 paper.</li>
                </ul>
            </div>
            <div class="form-actions">
                <button class="button button-quiet" data-next="skills" type="button">← Skills</button>
                <button class="button button-primary" data-export type="button">Export resume ↗</button>
            </div>
        `;
    };

    const renderEditor = () => {
        const renderers = {
            personal: renderPersonalTab,
            experience: renderExperienceTab,
            education: renderEducationTab,
            skills: renderSkillsTab,
            design: renderDesignTab
        };

        elements.editor.innerHTML = renderers[state.activeTab]();
        document.querySelectorAll("[data-tab]").forEach((button) => {
            const isActive = button.dataset.tab === state.activeTab;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-current", isActive ? "step" : "false");
        });
    };

    const refresh = () => {
        renderPreview(state.resume, elements.preview);
    };

    const persist = () => {
        const saved = saveResume(state.resume);
        elements.saveStatus.textContent = saved ? "Saved on this device" : "Could not save — export a copy";
        elements.saveStatus.style.color = saved ? "var(--success)" : "#b42318";
        refresh();
    };

    const showToast = (message) => {
        elements.toast.textContent = message;
        elements.toast.classList.add("is-visible");
        window.clearTimeout(showToast.timeout);
        showToast.timeout = window.setTimeout(() => {
            elements.toast.classList.remove("is-visible");
        }, 2600);
    };

    const addEntry = (type) => {
        const templates = {
            experience: { role: "", company: "", location: "", start: "", end: "", details: "" },
            education: { degree: "", school: "", location: "", year: "", details: "" },
            projects: { name: "", link: "", details: "" }
        };

        state.resume[type].push({ ...templates[type] });
        persist();
        renderEditor();
    };

    const exportPdf = () => window.print();

    elements.editor.addEventListener("input", (event) => {
        const path = event.target.dataset.path;

        if (!path) {
            return;
        }

        setValue(state.resume, path, event.target.value);
        persist();
    });

    elements.editor.addEventListener("click", (event) => {
        const nextButton = event.target.closest("[data-next]");

        if (nextButton) {
            state.activeTab = nextButton.dataset.next;
            renderEditor();
            return;
        }

        const addButton = event.target.closest("[data-add]");

        if (addButton) {
            addEntry(addButton.dataset.add);
            return;
        }

        const removeButton = event.target.closest("[data-remove]");

        if (removeButton) {
            const entries = state.resume[removeButton.dataset.remove];
            entries.splice(Number(removeButton.dataset.index), 1);
            persist();
            renderEditor();
            return;
        }

        const themeButton = event.target.closest("[data-theme]");

        if (themeButton) {
            state.resume.theme = themeButton.dataset.theme;
            persist();
            renderEditor();
            return;
        }

        if (event.target.closest("[data-export]")) {
            exportPdf();
        }
    });

    document.querySelector(".section-tabs").addEventListener("click", (event) => {
        const button = event.target.closest("[data-tab]");

        if (!button) {
            return;
        }

        state.activeTab = button.dataset.tab;
        renderEditor();
    });

    document.querySelector("#sampleButton").addEventListener("click", () => {
        state.resume = createSampleResume();
        persist();
        state.activeTab = "personal";
        renderEditor();
        showToast("Sample loaded. Replace it with your own accurate details.");
    });

    document.querySelector("#exportButton").addEventListener("click", exportPdf);
    document.querySelector("#printButton").addEventListener("click", exportPdf);

    document.querySelector("#resetButton").addEventListener("click", () => {
        const confirmed = window.confirm("Clear this resume and its saved draft from this browser?");

        if (!confirmed) {
            return;
        }

        state.resume = createEmptyResume();
        persist();
        state.activeTab = "personal";
        renderEditor();
        showToast("Resume cleared.");
    });

    window.ResumeForgeApp = {
        getState: () => state,
        persist,
        renderEditor,
        showToast
    };

    renderEditor();
    refresh();
})();
