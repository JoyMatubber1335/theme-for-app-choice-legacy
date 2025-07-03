document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("questions-container");
  const tabsWrapper = document.getElementById("beauty-tabs");
  const apiURL = "/apps/choice-legacy-app/customer/beauty-profile";

  const skippedOrders = [6, 7, 8, 9, 10, 11];
  let allQuestions = [];
  let productTypes = [];

  try {
    const response = await fetch(`${apiURL}/questions`);
    const data = await response.json();
    if (Array.isArray(data.questions)) {
      allQuestions = data.questions;
      const productTypeQuestion = allQuestions.find(
        (q) => q.key === "product_type"
      );
      if (productTypeQuestion) {
        productTypes = productTypeQuestion.options;
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    container.innerHTML = "<p>Failed to load questions.</p>";
    return;
  }

  tabsWrapper.innerHTML = "";
  productTypes.forEach((type) => {
    const btn = document.createElement("button");
    btn.textContent = type.label;
    btn.setAttribute("data-type", type.value);
    tabsWrapper.appendChild(btn);
  });

  const tabs = tabsWrapper.querySelectorAll("button");

  tabs.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.getAttribute("data-type");
      container.innerHTML = "<p>Loading...</p>";

      const filteredQuestions = allQuestions.filter((q) => q.key === type);

      if (filteredQuestions.length > 0) {
        if (type === "skincare") {
          renderSkincare(filteredQuestions);
        } else {
          renderGeneric(filteredQuestions);
          document.getElementById("save-answers").style.display = "none";
        }
      } else {
        container.innerHTML = "<p>No questions available.</p>";
        document.getElementById("save-answers").style.display = "none";
      }
    });
  });

  if (tabs.length > 0) tabs[0].click();

  // --- renderSkincare function ---
  function renderSkincare(questions) {
    container.innerHTML = "";
    const form = document.createElement("form");
    form.id = "skincare-form";
    const answers = {};
    const renderedOrders = new Set();
    const suggestionBlock = document.getElementById("suggestion-output");
    suggestionBlock.innerHTML = "";

    const saveButton = document.getElementById("save-answers");
    saveButton.style.display = "inline-block";

    saveButton.onclick = () => {
      const requiredQuestions = questions.filter(
        (q) => q.isRequired && renderedOrders.has(q.order)
      );

      for (const q of requiredQuestions) {
        const val = answers[q.order];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          alert(`Please answer: ${q.title}`);
          return;
        }
      }

      const val5 = answers[5];
      const val6 = answers[6];

      if (val5 === "neither_acne_allergy") {
        showSuggestion("Suggested products");
        return;
      }

      if (val5 === "only_allergy") {
        showSuggestion("No suggestion");
        return;
      }

      if (val5 === "only_acne" || val5 === "both_acne_allergy") {
        if (val6 === "no_itch_pain") {
          showSuggestion("Suggested products");
        } else {
          showSuggestion("No suggestion");
        }
        return;
      }

      showSuggestion("Suggested products"); // fallback
    };

    const showSuggestion = (text) => {
      suggestionBlock.innerHTML = `<p><strong>${text}</strong></p>`;
    };

    const renderQuestion = (q) => {
      if (renderedOrders.has(q.order)) return;
      const wrapper = document.createElement("div");
      wrapper.className = "question-block";
      wrapper.dataset.order = q.order;

      const title = document.createElement("p");
      title.innerHTML = `<strong>${q.title}</strong>${
        q.isRequired ? " *" : ""
      }`;
      wrapper.appendChild(title);

      q.options.forEach((opt) => {
        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = q.type === "multi_choice" ? "checkbox" : "radio";
        input.name = q._id;
        input.value = opt.value;

        if (answers[q.order]) {
          if (input.type === "checkbox") {
            if (
              Array.isArray(answers[q.order]) &&
              answers[q.order].includes(opt.value)
            ) {
              input.checked = true;
            }
          } else {
            if (answers[q.order] === opt.value) {
              input.checked = true;
            }
          }
        }

        if (q.type === "picture_choice") {
          const img = document.createElement("img");
          img.src = opt.imageUrl;
          img.alt = opt.label;
          img.width = 80;
          img.height = 80;
          label.appendChild(input);
          label.appendChild(img);
        } else {
          label.appendChild(input);
          label.append(` ${opt.label}`);
        }

        input.addEventListener("change", () => {
          answers[q.order] =
            input.type === "checkbox"
              ? getCheckedValues(form, q._id)
              : input.value;
          handleConditionals();

          // Show or hide file upload for face photo question (order 9)
          if (q.order === 9) {
            if (input.value === "yes" && input.checked) {
              showFileInput(wrapper);
            } else if (input.value === "no" && input.checked) {
              removeFileInput(wrapper);
            }
          }

          if (opt.sub_category && input.checked) {
            showSubCategory(opt, wrapper, q.order);
          } else if (opt.sub_category) {
            removeSubCategory(wrapper);
          }
        });

        wrapper.appendChild(label);
        wrapper.appendChild(document.createElement("br"));
      });

      form.appendChild(wrapper);
      renderedOrders.add(q.order);

      // If face photo question was answered "yes" previously, show the file input on load
      if (q.order === 9 && answers[9] === "yes") {
        showFileInput(wrapper);
      }
    };

    const showSubCategory = (opt, wrapper, order) => {
      removeSubCategory(wrapper);
      const subWrapper = document.createElement("div");
      subWrapper.className = "subcategory-block";
      subWrapper.dataset.parentOrder = order;
      opt.sub_category.forEach((sub) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = `sub_${order}`;
        input.value = sub.value;
        label.appendChild(input);
        label.append(` ${sub.label}`);
        subWrapper.appendChild(label);
        subWrapper.appendChild(document.createElement("br"));
      });
      wrapper.appendChild(subWrapper);
    };

    const removeSubCategory = (wrapper) => {
      const existing = wrapper.querySelector(".subcategory-block");
      if (existing) existing.remove();
    };

    const showFileInput = (wrapper) => {
      removeFileInput(wrapper);
      const fileInputWrapper = document.createElement("div");
      fileInputWrapper.className = "file-input-wrapper";

      const fileLabel = document.createElement("label");
      fileLabel.textContent = "Upload your face photo:";
      fileLabel.htmlFor = "face-photo-upload";

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.id = "face-photo-upload";
      fileInput.name = "face_photo";

      fileInputWrapper.appendChild(fileLabel);
      fileInputWrapper.appendChild(fileInput);
      wrapper.appendChild(fileInputWrapper);
    };

    const removeFileInput = (wrapper) => {
      const existingInput = wrapper.querySelector(".file-input-wrapper");
      if (existingInput) existingInput.remove();
    };

    const handleConditionals = () => {
      // Clear skipped orders
      skippedOrders.forEach((order) => {
        const el = form.querySelector(`.question-block[data-order='${order}']`);
        if (el) {
          el.remove();
          renderedOrders.delete(order);
        }
      });

      suggestionBlock.innerHTML = "";

      const q5Val = answers[5];
      const q6Val = answers[6];
      const getQ = (order) => questions.find((q) => q.order === order);

      if (q5Val === "neither_acne_allergy") {
        showSuggestion("Suggested products");
        return;
      }

      if (q5Val === "only_allergy") {
        // Skip Q6
        // Show Q7–11
        [7, 8, 9, 10, 11].forEach((order) => {
          const q = getQ(order);
          if (q) renderQuestion(q);
        });
        showSuggestion("No suggestion");
        return;
      }

      if (q5Val === "only_acne" || q5Val === "both_acne_allergy") {
        const q6 = getQ(6);
        if (q6) renderQuestion(q6);

        if (["itch_red_burn", "itch_sometimes", "painful"].includes(q6Val)) {
          [7, 8, 9, 10, 11].forEach((order) => {
            const q = getQ(order);
            if (q) renderQuestion(q);
          });
          showSuggestion("No suggestion");
        } else if (q6Val === "no_itch_pain") {
          [7, 8, 9, 10, 11].forEach((order) => {
            const q = getQ(order);
            if (q) renderQuestion(q);
          });
          showSuggestion("Suggested products");
        }
      }
    };

    questions
      .filter((q) => q.order !== null && q.order <= 5)
      .sort((a, b) => a.order - b.order)
      .forEach((q) => renderQuestion(q));

    container.appendChild(form);
  }

  // --- helper function to get checked values ---
  function getCheckedValues(form, name) {
    return Array.from(
      form.querySelectorAll(`input[name="${name}"]:checked`)
    ).map((input) => input.value);
  }

  // --- renderGeneric function ---
  function renderGeneric(questions) {
    container.innerHTML = "";
    const form = document.createElement("form");

    questions.forEach((q) => {
      const wrapper = document.createElement("div");
      wrapper.className = "question-block";

      const title = document.createElement("p");
      title.innerHTML = `<strong>${q.title}</strong>${
        q.isRequired ? " *" : ""
      }`;
      wrapper.appendChild(title);

      q.options.forEach((opt) => {
        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = q.type === "multi_choice" ? "checkbox" : "radio";
        input.name = q._id;
        input.value = opt.value;

        if (q.type === "picture_choice") {
          const img = document.createElement("img");
          img.src = opt.imageUrl;
          img.alt = opt.label;
          img.width = 80;
          img.height = 80;
          label.appendChild(input);
          label.appendChild(img);
        } else {
          label.appendChild(input);
          label.append(` ${opt.label}`);
        }

        input.addEventListener("change", () => {
          removeSubCategory(wrapper);
          if (opt.sub_category && input.checked) {
            showSubCategory(opt, wrapper, q._id);
          }
        });

        label.appendChild(document.createElement("br"));
        wrapper.appendChild(label);
      });

      form.appendChild(wrapper);
    });

    container.appendChild(form);

    function showSubCategory(opt, wrapper, name) {
      const subWrapper = document.createElement("div");
      subWrapper.className = "subcategory-block";
      opt.sub_category.forEach((sub) => {
        const subLabel = document.createElement("label");
        const subInput = document.createElement("input");
        subInput.type = "checkbox";
        subInput.name = `sub_${name}`;
        subInput.value = sub.value;
        subLabel.appendChild(subInput);
        subLabel.append(` ${sub.label}`);
        subWrapper.appendChild(subLabel);
        subWrapper.appendChild(document.createElement("br"));
      });
      wrapper.appendChild(subWrapper);
    }

    function removeSubCategory(wrapper) {
      const existing = wrapper.querySelector(".subcategory-block");
      if (existing) existing.remove();
    }
  }
});
