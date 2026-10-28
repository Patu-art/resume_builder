(() => {
    "use strict";

    const STORAGE_KEY = "resumeforge.resume.v1";

    const createEmptyResume = () => ({
        personal: {
            name: "",
            role: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            website: "",
            summary: ""
        },
        experience: [
            {
                role: "",
                company: "",
                location: "",
                start: "",
                end: "",
                details: ""
            }
        ],
        education: [
            {
                degree: "",
                school: "",
                location: "",
                year: "",
                details: ""
            }
        ],
        projects: [
            {
                name: "",
                link: "",
                details: ""
            }
        ],
        skills: "",
        certifications: [],
        achievements: [],
        languages: "",
        additional: "",
        theme: "modern"
    });

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

    const getResume = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return createEmptyResume();
            }

            const parsed = JSON.parse(saved);
            const empty = createEmptyResume();

            return {
                ...empty,
                ...parsed,
                personal: {
                    ...empty.personal,
                    ...(parsed.personal || {})
                },
                experience: Array.isArray(parsed.experience) ? parsed.experience : empty.experience,
                education: Array.isArray(parsed.education) ? parsed.education : empty.education,
                projects: Array.isArray(parsed.projects) ? parsed.projects : empty.projects,
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                achievements: Array.isArray(parsed.achievements) ? parsed.achievements : []
            };
        } catch (error) {
            console.warn("Could not load the saved resume.", error);
            return createEmptyResume();
        }
    };

    const saveResume = (resume) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
            return true;
        } catch (error) {
            console.error("Could not save the resume.", error);
            return false;
        }
    };

    const getValue = (resume, path) => path.split(".").reduce((current, key) => {
        return current == null ? undefined : current[key];
    }, resume) ?? "";

    const setValue = (resume, path, value) => {
        const keys = path.split(".");
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => current[key], resume);
        target[lastKey] = value;
    };

    const nonEmptyEntries = (entries, keys) => entries.filter((entry) => {
        return keys.some((key) => String(entry[key] || "").trim());
    });

    const renderSection = (title, content) => {
        if (!content) {
            return "";
        }

        return `
            <section class="resume-section">
                <h3>${escapeHtml(title)}</h3>
                ${content}
            </section>
        `;
    };

    const renderExperience = (entries) => nonEmptyEntries(entries, ["role", "company", "details"])
        .map((entry) => {
            const title = [entry.role, entry.company].filter(Boolean).map(escapeHtml).join(" · ");
            const dates = [entry.start, entry.end].filter(Boolean).map(escapeHtml).join(" – ");
            const details = String(entry.details || "")
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            const description = details.length > 1
                ? `<ul>${details.map((line) => `<li>${escapeHtml(line.replace(/^[-•]\s*/, ""))}</li>`).join("")}</ul>`
                : (details.length ? `<p>${escapeHtml(details[0].replace(/^[-•]\s*/, ""))}</p>` : "");

            return `
                <div class="resume-item">
                    <div class="resume-item-heading">
                        <span>${title}</span>
                        <span class="resume-item-date">${dates}</span>
                    </div>
                    ${entry.location ? `<div class="resume-subline">${escapeHtml(entry.location)}</div>` : ""}
                    ${description}
                </div>
            `;
        })
        .join("");

    const renderEducation = (entries) => nonEmptyEntries(entries, ["degree", "school", "details"])
        .map((entry) => `
            <div class="resume-item">
                <div class="resume-item-heading">
                    <span>${[entry.degree, entry.school].filter(Boolean).map(escapeHtml).join(" · ")}</span>
                    <span class="resume-item-date">${escapeHtml(entry.year)}</span>
                </div>
                ${entry.location ? `<div class="resume-subline">${escapeHtml(entry.location)}</div>` : ""}
                ${entry.details ? `<p>${escapeHtml(entry.details)}</p>` : ""}
            </div>
        `)
        .join("");

    const renderProjects = (entries) => nonEmptyEntries(entries, ["name", "details"])
        .map((entry) => `
            <div class="resume-item">
                <div class="resume-item-heading">
                    <span>${escapeHtml(entry.name)}</span>
                    ${entry.link ? `<span class="resume-item-date">${escapeHtml(entry.link)}</span>` : ""}
                </div>
                ${entry.details ? `<p>${escapeHtml(entry.details)}</p>` : ""}
            </div>
        `)
        .join("");

    const renderSimpleEntries = (entries) => (entries || []).filter((entry) => entry.name || entry.title || entry.details).map((entry) => `<div class="resume-item"><div class="resume-item-heading"><span>${escapeHtml(entry.name || entry.title || "")}</span><span class="resume-item-date">${escapeHtml(entry.date || "")}</span></div>${entry.details ? `<p>${escapeHtml(entry.details)}</p>` : ""}</div>`).join("");

    const renderPreview = (resume, container) => {
        const personal = resume.personal;
        const contactDetails = [
            personal.email,
            personal.phone,
            personal.location,
            personal.linkedin,
            personal.website
        ].filter(Boolean).map(escapeHtml);

        const photo = personal.showPhoto && personal.photo ? `<img class="resume-photo" src="${personal.photo}" alt="Candidate photo">` : "";
        const preview = `
            <header class="resume-header ${photo ? "has-photo" : ""}">
                <div class="resume-header-copy">
                <h1 class="resume-name">${escapeHtml(personal.name || "Your Name")}</h1>
                <div class="resume-role">${escapeHtml(personal.role || personal.targetRole || "Target Job Title")}</div>
                <div class="resume-contact">
                    ${contactDetails.length ? contactDetails.join(" &nbsp; · &nbsp; ") : '<span class="empty-preview">Email · Phone · Location · LinkedIn / Portfolio</span>'}
                </div>
                </div>${photo}
            </header>
            ${renderSection("Professional Summary", personal.summary ? `<p>${escapeHtml(personal.summary)}</p>` : "")}
            ${renderSection("Experience", personal.hasExperience === false ? "" : renderExperience(resume.experience))}
            ${renderSection("Education", renderEducation(resume.education))}
            ${renderSection("Skills", resume.skills.trim()
                ? `<p class="resume-skills">${resume.skills.split(/[,;\n]/).map((skill) => escapeHtml(skill.trim())).filter(Boolean).join(" &nbsp; · &nbsp; ")}</p>`
                : "")}
            ${renderSection("Projects", renderProjects(resume.projects))}
            ${renderSection("Certifications", renderSimpleEntries(resume.certifications))}
            ${renderSection("Achievements & Activities", renderSimpleEntries(resume.achievements))}
            ${renderSection("Languages", resume.languages ? `<p>${escapeHtml(resume.languages)}</p>` : "")}
            ${renderSection("Additional Information", resume.additional ? `<p>${escapeHtml(resume.additional)}</p>` : "")}
        `;

        container.className = `resume-document theme-${["modern", "classic", "green"].includes(resume.theme) ? resume.theme : "modern"}`;
        container.innerHTML = preview;
    };

    const createSampleResume = () => ({
        personal: {
            name: "Alex Morgan",
            role: "Frontend Developer",
            email: "alex.morgan@email.com",
            phone: "+91 98765 43210",
            location: "Mumbai, Maharashtra",
            linkedin: "linkedin.com/in/alexmorgan",
            website: "github.com/alexmorgan",
            summary: "Computer Science student focused on building responsive, accessible web experiences. Comfortable with HTML, CSS and JavaScript, with a practical approach to debugging and learning new tools. Seeking an entry-level frontend opportunity to contribute to real products and grow through feedback."
        },
        experience: [
            {
                role: "Web Development Volunteer",
                company: "Campus Tech Club",
                location: "Mumbai",
                start: "Aug 2025",
                end: "Present",
                details: "Built and updated responsive event pages using HTML, CSS and JavaScript.\nCoordinated with a small student team to publish event information and improve mobile readability."
            }
        ],
        education: [
            {
                degree: "B.Tech, Computer Science",
                school: "Example Institute of Technology",
                location: "Mumbai, India",
                year: "2029",
                details: "Relevant coursework: Data Structures, Web Development, Database Fundamentals"
            }
        ],
        projects: [
            {
                name: "Student Portfolio Website",
                link: "github.com/alexmorgan/portfolio",
                details: "Created a responsive portfolio to showcase projects and coursework. Improved navigation and layout across mobile and desktop screens."
            }
        ],
        skills: "HTML, CSS, JavaScript, Git, Responsive Design, Debugging, Teamwork",
        certifications: [],
        achievements: [],
        languages: "",
        additional: "",
        theme: "modern"
    });

    window.ResumeForge = {
        createEmptyResume,
        createSampleResume,
        escapeHtml,
        getResume,
        getValue,
        saveResume,
        setValue,
        renderPreview
    };
})();
