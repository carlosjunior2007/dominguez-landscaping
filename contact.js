// Free estimate form (contact.html #quote-form)
// - Client-side validation with inline messages
// - Submits to get-quote.php with fetch (Accept: application/json)
// - Shows the result of a non-JS submission (?sent=1 / ?error=...)
// - Preselects the service from ?service=Mulch (deep links from other pages)

document.addEventListener("DOMContentLoaded", initQuoteForm);

function initQuoteForm() {
    const form = document.getElementById("quoteForm");
    if (!form) return;

    const alertBox = document.getElementById("formAlert");
    const alertText = document.getElementById("formAlertText");
    const submitBtn = document.getElementById("quoteFormSubmit");
    const submitText = document.getElementById("quoteFormSubmitText");
    const submitIcon = document.getElementById("quoteFormSubmitIcon");
    const spinner = document.getElementById("quoteFormSpinner");
    const details = form.elements.namedItem("details");
    const counter = document.getElementById("detailsCounter");

    const MAX_DETAILS = 2000;
    const PHONE_RE = /^[0-9+\-()\s.]{7,25}$/;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* ---------- Validation rules (mirror get-quote.php) ---------- */
    const rules = {
        fullName: (v) => (v.length >= 2 && v.length <= 100 ? "" : "Please enter your full name."),
        phone: (v) => (PHONE_RE.test(v) ? "" : "Please enter a valid phone number, e.g. (910) 330-3783."),
        email: (v) =>
            !v ? "Please enter your email address." : EMAIL_RE.test(v) && v.length <= 120 ? "" : "Please enter a valid email address.",
        city: (v) => (v ? "" : "Please select your city or area."),
        service: (v) => (v ? "" : "Please select at least one service."),
        timeframe: (v) => (v ? "" : "Please select a project timeframe."),
        propertyType: (v) => (v ? "" : "Please choose a property type."),
        preferredContact: (v) => (v ? "" : "Please choose how we should contact you."),
        details: (v) =>
            v.length < 10
                ? "Please tell us a bit more about your project (at least 10 characters)."
                : v.length > MAX_DETAILS
                  ? `Please keep the details under ${MAX_DETAILS} characters.`
                  : "",
    };

    // "service" son casillas (name="service[]"): se puede elegir más de una
    const serviceBoxes = Array.from(form.querySelectorAll('input[name="service[]"]'));
    const serviceCount = document.getElementById("serviceCount");
    const updateServiceCount = () => {
        if (serviceCount) serviceCount.textContent = `${serviceBoxes.filter((b) => b.checked).length} selected`;
    };
    serviceBoxes.forEach((b) => b.addEventListener("change", updateServiceCount));
    const inputsOf = (name) => {
        if (name === "service") return serviceBoxes;
        const el = form.elements.namedItem(name);
        return el instanceof RadioNodeList ? Array.from(el) : [el];
    };

    const getValue = (name) => {
        if (name === "service") return serviceBoxes.filter((b) => b.checked).map((b) => b.value).join(", ");
        const el = form.elements.namedItem(name);
        if (!el) return "";
        // RadioNodeList for radio groups
        return String(el.value ?? "").trim();
    };

    function setFieldError(name, message) {
        const errorEl = document.getElementById(`${name}-error`);
        const inputs = inputsOf(name);

        inputs.forEach((input) => {
            if (!input) return;
            if (message) input.setAttribute("aria-invalid", "true");
            else input.removeAttribute("aria-invalid");
        });

        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.toggle("hidden", !message);
        }
    }

    function validateField(name) {
        const message = rules[name](getValue(name));
        setFieldError(name, message);
        return !message;
    }

    function validateAll() {
        let firstInvalid = null;
        Object.keys(rules).forEach((name) => {
            if (!validateField(name) && !firstInvalid) firstInvalid = name;
        });
        if (firstInvalid) {
            inputsOf(firstInvalid)[0]?.focus();
        }
        return !firstInvalid;
    }

    // Re-validate on change once a field has been touched
    Object.keys(rules).forEach((name) => {
        inputsOf(name).forEach((input) => {
            if (!input) return;
            const isChoice = input.type === "radio" || input.type === "checkbox";
            input.addEventListener("blur", () => {
                if (!isChoice && getValue(name)) validateField(name);
            });
            input.addEventListener("input", () => {
                if (input.hasAttribute("aria-invalid") || isChoice) validateField(name);
            });
            input.addEventListener("change", () => {
                if (input.hasAttribute("aria-invalid") || isChoice) validateField(name);
            });
        });
    });

    /* ---------- Character counter ---------- */
    function updateCounter() {
        if (!details || !counter) return;
        const len = details.value.length;
        counter.textContent = `${len} / ${MAX_DETAILS}`;
        counter.classList.toggle("text-red-700", len > MAX_DETAILS - 100);
        counter.classList.toggle("text-ink/60", len <= MAX_DETAILS - 100);
    }
    details?.addEventListener("input", updateCounter);
    updateCounter();

    /* ---------- Alert ---------- */
    function showAlert(type, message, { focus = true } = {}) {
        if (!alertBox || !alertText) return;
        const isSuccess = type === "success";

        alertBox.classList.remove("hidden", "border-brand-100", "bg-brand-50", "text-brand-900", "border-red-200", "bg-red-50", "text-red-800");
        alertBox.classList.add("flex");
        alertBox.classList.add(...(isSuccess ? ["border-brand-100", "bg-brand-50", "text-brand-900"] : ["border-red-200", "bg-red-50", "text-red-800"]));
        alertBox.setAttribute("role", isSuccess ? "status" : "alert");

        alertBox.querySelectorAll("[data-alert-icon]").forEach((icon) => {
            icon.classList.toggle("hidden", icon.dataset.alertIcon !== type);
        });

        alertText.textContent = message;

        if (focus) {
            alertBox.focus({ preventScroll: true });
            alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function hideAlert() {
        alertBox?.classList.add("hidden");
        alertBox?.classList.remove("flex");
        if (alertText) alertText.textContent = "";
    }

    /* ---------- Loading state ---------- */
    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.setAttribute("aria-busy", String(isLoading));
        spinner?.classList.toggle("hidden", !isLoading);
        submitIcon?.classList.toggle("hidden", isLoading);
        if (submitText) submitText.textContent = isLoading ? "Sending…" : "Send My Request";
    }

    /* ---------- Submit ---------- */
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (form.dataset.preview === "true") {
            showAlert("error", "This preview does not send requests. Please call (910) 330-3783 or email dominguezlandscaping9@gmail.com.");
            return;
        }
        hideAlert();

        if (!validateAll()) {
            showAlert("error", "Please check the highlighted fields and try again.", { focus: false });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            let data = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok && data?.success) {
                form.reset();
                updateCounter();
                updateServiceCount();
                Object.keys(rules).forEach((name) => setFieldError(name, ""));
                showAlert("success", data.message || "Thank you! Your request was sent. We will contact you soon.");
            } else {
                showAlert(
                    "error",
                    data?.message || "We could not send your request. Please try again or call us at (910) 330-3783.",
                );
            }
        } catch {
            showAlert("error", "Network error. Please check your connection and try again, or call us at (910) 330-3783.");
        } finally {
            setLoading(false);
        }
    });

    /* ---------- URL params: non-JS result + service deep link ---------- */
    const params = new URLSearchParams(window.location.search);

    const service = params.getAll("service").join(",");
    if (service) {
        // Acepta uno o varios: ?service=Mulch  o  ?service=Mulch,Pine Straw
        const wanted = service.split(",").map((s) => s.trim().toLowerCase());
        serviceBoxes.forEach((b) => { if (wanted.includes(b.value.toLowerCase())) b.checked = true; });
    }
    updateServiceCount();
    window.addEventListener("pageshow", updateServiceCount);
    form.addEventListener("reset", () => {
        setTimeout(() => {
            updateServiceCount();
            updateCounter();
            Object.keys(rules).forEach((name) => setFieldError(name, ""));
        }, 0);
    });

    if (params.get("sent") === "1") {
        showAlert("success", "Thank you! Your request was sent. We will contact you soon.");
    } else if (params.has("error")) {
        // textContent only — never inject the param as HTML
        const msg = (params.get("error") || "").slice(0, 300);
        showAlert("error", msg || "We could not send your request. Please try again.");
    }

    // Clean the result flags from the URL so a refresh does not repeat the message
    if (params.has("sent") || params.has("error")) {
        params.delete("sent");
        params.delete("error");
        const qs = params.toString();
        history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    }
}
