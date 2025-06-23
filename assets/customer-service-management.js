document.addEventListener("DOMContentLoaded", function () {
  const quill = new Quill("#editor", {
    theme: "snow",
  });

  const form = document.getElementById("support-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Set rich text HTML content into hidden input
    document.getElementById("message").value = quill.root.innerHTML;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(
        "/apps/choice-legacy-app/customer-service-management/message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      alert(data.message || "Sent!");
      form.reset();
      quill.setContents([]);
    } catch (err) {
      alert("Error sending message");
    }
  });
});
