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

    const renderQuestionsTab = () => `
        <div class="section-heading"><h2>Let’s build the right resume</h2><span class="section-count">01 / 07</span></div>
        <p class="field-hint">Answer what you can. Skip anything that does not apply; you can return to every section later.</p>
        <div class="form-grid">
            ${field("What role are you applying for?", "personal.targetRole", "e.g. Frontend Developer / Data Analyst", false, true)}
            ${field("Paste the job description (optional)", "personal.jobDescription", "Paste the job ad to tailor keywords later.", true, true)}
            <div class="field field-full"><label for="experienceLevel">Which best describes you?</label><select id="experienceLevel" data-path="personal.experienceLevel"><option value="student" ${state.resume.personal.experienceLevel === "student" ? "selected" : ""}>Student / fresher</option><option value="entry" ${state.resume.personal.experienceLevel === "entry" ? "selected" : ""}>Entry-level candidate</option><option value="experienced" ${state.resume.personal.experienceLevel === "experienced" ? "selected" : ""}>Experienced professional</option><option value="career-change" ${state.resume.personal.experienceLevel === "career-change" ? "selected" : ""}>Career change / returning to work</option></select></div>
            <div class="field field-full"><label>Do you have formal work experience?</label><div class="choice-row"><label><input type="radio" name="hasExperience" data-bool-path="personal.hasExperience" value="yes" ${state.resume.personal.hasExperience === true ? "checked" : ""}> Yes, include jobs / internships</label><label><input type="radio" name="hasExperience" data-bool-path="personal.hasExperience" value="no" ${state.resume.personal.hasExperience === false ? "checked" : ""}> No, I’m a fresher</label><label><input type="radio" name="hasExperience" data-bool-path="personal.hasExperience" value="skip" ${state.resume.personal.hasExperience === null ? "checked" : ""}> Skip for now</label></div></div>
            <div class="field field-full"><label for="resumePurpose">What is this resume for?</label><select id="resumePurpose" data-path="personal.resumePurpose"><option value="job" ${state.resume.personal.resumePurpose === "job" ? "selected" : ""}>Job / internship application</option><option value="academic" ${state.resume.personal.resumePurpose === "academic" ? "selected" : ""}>College / scholarship / academic</option><option value="freelance" ${state.resume.personal.resumePurpose === "freelance" ? "selected" : ""}>Freelance / client work</option><option value="general" ${state.resume.personal.resumePurpose === "general" ? "selected" : ""}>General profile</option></select></div>
        </div>
        <div class="question-note"><strong>No experience is not a blocker.</strong> We can build a strong fresher resume around education, projects, skills, volunteering, coursework and achievements. Do not invent employment history.</div>
        <div class="form-actions"><span class="field-hint">Required details are marked when relevant; nothing here needs to be perfect yet.</span><button class="button button-primary" data-next="personal" type="button">Continue to contact details →</button></div>
    `;
    const renderPersonalTab = () => `
        <div class="section-heading">
            <h2>Personal details</h2>
            <span class="section-count">02 / 07</span>
        </div>
        <div class="form-grid">
            ${field("Full name", "personal.name", "e.g. Alex Morgan")}
            ${field("Target job title", "personal.role", "e.g. Frontend Developer")}
            ${field("Email address", "personal.email", "alex@email.com")}
            ${field("Phone number", "personal.phone", "+91 98765 43210")}
            ${field("City / location", "personal.location", "Kalyan, Maharashtra")}
            ${field("LinkedIn URL", "personal.linkedin", "linkedin.com/in/yourname")}
            ${field("Portfolio / GitHub", "personal.website", "github.com/yourname")}
            ${field("Professional summary", "personal.summary", "Your strengths, relevant experience and target role.", true, true)}\n            <div class="field field-full"><label for="photoUpload">Resume photo (optional)</label><input id="photoUpload" type="file" accept="image/jpeg,image/png,image/webp"><label class="check-inline"><input id="showPhoto" type="checkbox" ${state.resume.personal.showPhoto ? "checked" : ""}> Include photo on the resume</label><p class="field-hint">Photo is optional and often omitted for ATS-focused applications. Use a professional headshot only if appropriate for your country / industry.</p><div id="photoPreviewWrap" class="photo-upload-preview" ${state.resume.personal.photo ? "" : "hidden"}><img id="uploadedPhotoPreview" src="${state.resume.personal.photo || ""}" alt="Uploaded photo preview"><button class="button button-danger button-small" data-remove-photo type="button">Remove photo</button></div></div>
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

    const renderAdditionalTab = () => `\n        <div class="section-heading"><h2>Additional resume sections</h2><span class="section-count">06 / 07</span></div>\n        <p class="field-hint">Add only relevant items. Leave any section blank if you have nothing to include.</p>\n        <h3>Certifications & courses</h3>\n        ${renderEntries("certifications", state.resume.certifications || [], "Certification", [{ label: "Certificate / course name", key: "name", placeholder: "e.g. Intro to Python" }, { label: "Issuer / date", key: "date", placeholder: "Issuer · 2026" }, { label: "Details (optional)", key: "details", placeholder: "Skills covered or credential ID", multiline: true, fullWidth: true }])}\n        <button class="button add-entry" data-add="certifications" type="button">+ Add certification</button>\n        <h3>Achievements, volunteering & leadership</h3>\n        ${renderEntries("achievements", state.resume.achievements || [], "Achievement", [{ label: "Achievement / activity", key: "name", placeholder: "e.g. NSS volunteer" }, { label: "Date", key: "date", placeholder: "2025" }, { label: "What you did / recognition", key: "details", placeholder: "Brief, factual detail", multiline: true, fullWidth: true }])}\n        <button class="button add-entry" data-add="achievements" type="button">+ Add achievement</button>\n        <div class="form-grid additional-fields">${field("Languages", "languages", "English, Hindi, Marathi", true, true)}${field("Other relevant information (optional)", "additional", "Awards, publications, interests relevant to the role…", true, true)}</div>\n        <div class="form-actions"><button class="button button-quiet" data-next="skills" type="button">← Skills & projects</button><button class="button button-primary" data-next="design" type="button">Review resume →</button></div>\n    `;\n\n    const renderDesignTab = () => {
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
            questions: renderQuestionsTab,\n            personal: renderPersonalTab,
            questions: renderQuestionsTab,\n            experience: renderExperienceTab,
            education: renderEducationTab,
            skills: renderSkillsTab,
            additional: renderAdditionalTab,\n            design: renderDesignTab
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

    elements.editor.addEventListener("change", async (event) => {\n        if (event.target.id === "photoUpload" && event.target.files && event.target.files[0]) {\n            const file = event.target.files[0];\n            if (!file.type.startsWith("image/")) { showToast("Choose an image file."); return; }\n            if (file.size > 8 * 1024 * 1024) { showToast("Choose an image under 8 MB."); event.target.value = ""; return; }\n            const image = new Image(); const reader = new FileReader();\n            reader.onload = () => { image.onload = () => { const canvas = document.createElement("canvas"); const scale = Math.min(1, 500 / Math.max(image.width, image.height)); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height); state.resume.personal.photo = canvas.toDataURL("image/jpeg", 0.82); state.resume.personal.showPhoto = true; persist(); renderEditor(); showToast("Photo added. You can remove it anytime."); }; image.src = reader.result; }; reader.readAsDataURL(file);\n        }\n        if (event.target.id === "showPhoto") { state.resume.personal.showPhoto = event.target.checked; persist(); return; }\n        const path = event.target.dataset.path;\n        if (path) { setValue(state.resume, path, event.target.value); persist(); }\n    });\n\n    elements.editor.addEventListener("input", (event) => {
        const path = event.target.dataset.path;

        if (!path) {
            return;
        }

        setValue(state.resume, path, event.target.value);
        persist();
    });

    elements.editor.addEventListener("click", (event) => {
        if (event.target.closest("[data-remove-photo]")) { state.resume.personal.photo = ""; state.resume.personal.showPhoto = false; persist(); renderEditor(); showToast("Photo removed."); return; }\n        const nextButton = event.target.closest("[data-next]");

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
