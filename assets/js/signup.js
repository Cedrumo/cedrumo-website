/* CEDRUMO pre-registration.
 * Intercepts the signup form, POSTs the email to the launchSubscribe Cloud
 * Function (self-hosted double opt-in), and shows an inline "check your inbox"
 * message. Fires the Plausible "Registration" goal on a successful submit.
 * utm_source (e.g. instagram) is captured automatically by Plausible.
 * Same-origin file (CSP script-src 'self'); the fetch target is allowed via
 * CSP connect-src. No inline styles (status reuses the .launch-note class).
 */
(function () {
  "use strict";

  var ENDPOINT =
    "https://europe-west3-cigar-collection-manager.cloudfunctions.net" +
    "/launchSubscribe";

  function locale() {
    var l = (document.documentElement.lang || "de").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "de";
  }

  function messages() {
    if (locale() === "en") {
      return {
        sending: "Sending...",
        ok: "Almost done. We've sent you an email, please confirm your " +
          "pre-registration in it.",
        invalid: "Please enter a valid email address.",
        consent: "Please confirm your consent to continue.",
        error: "Something went wrong. Please try again.",
      };
    }
    return {
      sending: "Wird gesendet...",
      ok: "Fast geschafft. Wir haben Ihnen eine E-Mail geschickt, bitte " +
        "bestätigen Sie darin Ihre Vormerkung.",
      invalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      consent: "Bitte bestätigen Sie Ihre Einwilligung.",
      error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    };
  }

  function setStatus(form, text, ok) {
    var el = form.querySelector(".signup-status");
    if (!el) {
      el = document.createElement("p");
      el.className = "signup-status launch-note";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      form.appendChild(el);
    }
    el.setAttribute("data-state", ok ? "ok" : "error");
    el.textContent = text;
  }

  function track() {
    if (typeof window.plausible === "function") {
      window.plausible("Registration");
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var m = messages();
    var emailInput = form.querySelector("input[type=email]");
    var consent = form.querySelector(".signup-consent input[type=checkbox]");
    var honeypot = form.querySelector("input[name=email_address_check]");
    var button = form.querySelector("button[type=submit]");
    var email = emailInput ? emailInput.value.trim() : "";

    if (!email || email.indexOf("@") < 1 || email.indexOf(".") < 0) {
      setStatus(form, m.invalid, false);
      return;
    }
    if (consent && !consent.checked) {
      setStatus(form, m.consent, false);
      return;
    }

    if (button) {
      button.disabled = true;
    }
    setStatus(form, m.sending, true);

    fetch(ENDPOINT, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: email,
        locale: locale(),
        email_address_check: honeypot ? honeypot.value : "",
        source: "website",
      }),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return {ok: false};
        });
      })
      .then(function (data) {
        if (data && data.ok) {
          track();
          if (emailInput) {
            emailInput.value = "";
          }
          setStatus(form, m.ok, true);
          return;
        }
        if (button) {
          button.disabled = false;
        }
        var invalid = data && data.error === "invalid_email";
        setStatus(form, invalid ? m.invalid : m.error, false);
      })
      .catch(function () {
        if (button) {
          button.disabled = false;
        }
        setStatus(form, m.error, false);
      });
  }

  var forms = document.querySelectorAll("form.signup");
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener("submit", onSubmit);
  }
})();
