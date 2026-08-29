document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusBox = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.textContent : "Send";

  function clearFieldErrors() {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  function showStatus(kind, message) {
    statusBox.className = "form-status visible " + kind;
    statusBox.textContent = message;
  }

  function showFieldErrors(errors) {
    errors.forEach(function (err) {
      if (!err.field) return;
      var target = form.querySelector('[data-error-for="' + err.field + '"]');
      var input = form.querySelector('[name="' + err.field + '"]');
      if (target) target.textContent = err.message;
      if (input) input.setAttribute("aria-invalid", "true");
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFieldErrors();
    statusBox.className = "form-status";
    statusBox.textContent = "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    var data = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          showStatus(
            "success",
            "Thanks — your message is in. We'll get back to you within one business day."
          );
        } else if (result.body && result.body.errors) {
          showFieldErrors(result.body.errors);
          showStatus(
            "error",
            "Please fix the highlighted field" +
              (result.body.errors.length > 1 ? "s" : "") +
              " and try again."
          );
        } else {
          showStatus(
            "error",
            "Something went wrong sending your message. Please try again, or email us directly at clients@wearebirr.com."
          );
        }
      })
      .catch(function () {
        showStatus(
          "error",
          "We couldn't reach the server. Please check your connection and try again, or email us directly at clients@wearebirr.com."
        );
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
      });
  });
});
