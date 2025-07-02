document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll("#beauty-tabs button");
  const container = document.getElementById("questions-container");
  const apiURL = "/apps/choice-legacy-app/customer/beauty-profile";

  tabs.forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.getAttribute("data-type");

      container.innerHTML = "<p>Loading...</p>";

      try {
        const response = await fetch(`${apiURL}/questions?key=${type}`);
        const data = await response.json();

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const html = data.questions
            .map((q) => {
              const optionsHTML = q.options
                .map((opt) => {
                  if (q.type === "picture_choice") {
                    return `
                    <label>
                      <input type="radio" name="${q._id}" value="${opt.value}">
                      <img src="${opt.imageUrl}" alt="${opt.label}" width="80" height="80">
                    </label>
                  `;
                  } else if (q.type === "multi_choice") {
                    return `
                    <label>
                      <input type="checkbox" name="${q._id}" value="${opt.value}"> ${opt.label}
                    </label>
                  `;
                  } else {
                    return `
                    <label>
                      <input type="radio" name="${q._id}" value="${opt.value}"> ${opt.label}
                    </label>
                  `;
                  }
                })
                .join("<br>");

              return `
                <div>
                  <p><strong>${q.title}</strong>${q.isRequired ? " *" : ""}</p>
                  ${optionsHTML}
                </div>
                <hr>
              `;
            })
            .join("");

          container.innerHTML = html;
        } else {
          container.innerHTML = "<p>No questions available.</p>";
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        container.innerHTML = "<p>Failed to load questions.</p>";
      }
    });
  });

  // 👉 Automatically load first tab (skincare)
  tabs[0].click();
});
