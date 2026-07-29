/* CEDRUMO pre-registration tracking.
 * Fires the Plausible "Registration" goal when a signup form is submitted.
 * utm_source (e.g. instagram) is captured automatically by Plausible from the URL,
 * so campaign traffic already shows as its own source with no extra code here.
 * Same-origin file (CSP script-src 'self'); Plausible event uses connect-src plausible.io.
 */
(function () {
  'use strict';
  function track() {
    if (typeof window.plausible === 'function') {
      window.plausible('Registration');
    }
  }
  var forms = document.querySelectorAll('form.signup');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', track);
  }
})();
