(() => {
    "use strict";

    const SETTINGS_KEY = "resumeforge.ai-settings.v1";
    const status = document.querySelector("#aiStatus");
    const providerSelect = document.querySelector("#aiProvider");
    const modelInput = document.querySelector("#aiModel");
    const keyInput = document.querySelector("#aiKey");
    const endpointInput = document.querySelector("#aiEndpoint");
    const endpointField = document.querySelector("#endpointField");

    const readSettings = () => {
        try {
            return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
        } catch (error) {
            return {};
        }
    };

    const settings = readSettings();
    providerSelect.value = settings.provider || "gemini";
    modelInput.value = settings.model || "gemini-2.5-flash";
    keyInput.value = settings.apiKey || "";
    endpointInput.value = settings.endpoint || "https://api.openai.com/v1/chat/completions";
    endpointField.hidden = providerSelect.value !== "openai";

    const setStatus = (message) => {
        status.textContent = message;
    };

    const localRewrite = (text, kind) => {
        const cleaned = text.trim().replace(/[ \t]+/g, " ");

        if (!cleaned) {
            return "";
        }

        if (kind === "summary") {
            return cleaned
                .replace(/\bI am\b/gi, "")
                .replace(/\bI'm\b/gi, "")
                .replace(/\bvery\b/gi, "")
                .replace(/\bgood at\b/gi, "skilled in")
                .replace(/\bworked on\b/gi, "contributed to")
                .replace(/\bhelped\b/gi, "supported")
                .replace(/\bthings\b/gi, "projects")
                .replace(/\s{2,}/g, " ")
                .replace(/^\s+/, "")
                .replace(/^./, (character) => character.toUpperCase());
        }

        if (kind === "experience") {
            return text.split(/\n|•/).map((line) => line.trim()).filter(Boolean)
                .map((line) => line.replace(/^[-*]\s*/, ""))
                .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
                .map((line) => `• ${line}`)
                .join("\n");
        }

        return cleaned.split(/[,;\n]/).map((skill) => skill.trim()).filter(Boolean).join(", ");
    };

    const getInput = (kind) => {
        const { resume } = window.ResumeForgeApp.getState();

        if (kind === "summary") {
            return {
                path: "personal.summary",
                text: resume.personal.summary
            };
        }

        if (kind === "skills") {
            return {
                path: "skills",
                text: resume.skills
            };
        }

        const index = resume.experience.findIndex((entry) => entry.details.trim());

        if (index === -1) {
            return { path: "", text: "" };
        }

        return {
            path: `experience.${index}.details`,
            text: resume.experience[index].details
        };
    };

    const createPrompt = (kind, input, role) => {
        const targetRole = role || "the target role";
        const instructions = {
            summary: `Rewrite this resume summary to be concise, professional, ATS-friendly, and 2–4 sentences for ${targetRole}. Preserve the candidate's meaning and use only facts in the input. Do not invent credentials, tools, or achievements. Return only the rewritten summary.`,
            experience: `Rewrite these experience notes as clear, action-oriented resume bullet points for ${targetRole}. Preserve all facts and numbers exactly. Do not invent metrics or responsibilities. Return only the bullet points.`,
            skills: `Clean up and organize this candidate's existing skills for a resume targeting ${targetRole}. Do not add skills not present in the input. Return only a comma-separated list.`
        };

        return `${instructions[kind]}\n\nCandidate text:\n${input}`;
    };

    const requestGemini = async (prompt, config) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 600 }
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "Gemini request failed.");
        }

        return (result.candidates?.[0]?.content?.parts || [])
            .map((part) => part.text || "")
            .join("")
            .trim();
    };

    const requestOpenAiCompatible = async (prompt, config) => {
        const response = await fetch(config.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "AI provider request failed.");
        }

        return result.choices?.[0]?.message?.content?.trim() || "";
    };

    const runAiAction = async (kind) => {
        const input = getInput(kind);

        if (!input.text.trim()) {
            setStatus(kind === "experience"
                ? "Add experience notes first, then try again."
                : "Add your text first, then try again.");
            return;
        }

        const { resume } = window.ResumeForgeApp.getState();
        const config = {
            provider: providerSelect.value,
            model: modelInput.value.trim(),
            apiKey: keyInput.value.trim(),
            endpoint: endpointInput.value.trim()
        };

        if (!config.apiKey) {
            const rewritten = localRewrite(input.text, kind);
            window.ResumeForge.setValue(resume, input.path, rewritten);
            window.ResumeForgeApp.persist();
            window.ResumeForgeApp.renderEditor();
            setStatus("Offline writing helper used. Configure an API key for generative AI.");
            return;
        }

        if (!config.model) {
            setStatus("Enter a model name in AI settings.");
            return;
        }

        setStatus("Generating suggestion…");

        try {
            const prompt = createPrompt(kind, input.text, resume.personal.role);
            const output = config.provider === "gemini"
                ? await requestGemini(prompt, config)
                : await requestOpenAiCompatible(prompt, config);

            if (!output) {
                throw new Error("The provider returned an empty response.");
            }

            window.ResumeForge.setValue(resume, input.path, output);
            window.ResumeForgeApp.persist();
            window.ResumeForgeApp.renderEditor();
            setStatus("Suggestion added. Check the facts and wording before using it.");
        } catch (error) {
            setStatus(`AI request failed: ${error.message} Check the key, model and connection.`);
        }
    };

    document.querySelector("#saveAiSettingsButton").addEventListener("click", () => {
        const nextSettings = {
            provider: providerSelect.value,
            model: modelInput.value.trim(),
            apiKey: keyInput.value.trim(),
            endpoint: endpointInput.value.trim()
        };

        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
            setStatus("AI settings saved in this browser.");
            window.ResumeForgeApp.showToast("AI settings saved.");
        } catch (error) {
            setStatus("Could not save settings in this browser.");
        }
    });

    providerSelect.addEventListener("change", () => {
        endpointField.hidden = providerSelect.value !== "openai";
    });

    document.querySelector("#improveSummaryButton").addEventListener("click", () => runAiAction("summary"));
    document.querySelector("#improveExperienceButton").addEventListener("click", () => runAiAction("experience"));
    document.querySelector("#improveSkillsButton").addEventListener("click", () => runAiAction("skills"));
})();
