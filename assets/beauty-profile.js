document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("questions-container");
  const tabsWrapper = document.getElementById("beauty-tabs");
  const apiURL = "/apps/choice-legacy-app/customer/beauty-profile";
  const ageInput = document.getElementById("customer-age");
  let activeTab = null;
  const tabAnswers = {
    skincare: {},
    haircare: {},
    makeup: {},
  };

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
      activeTab = button.getAttribute("data-type");
      container.innerHTML = "<p>Loading...</p>";

      const filteredQuestions = allQuestions.filter((q) => q.key === activeTab);

      if (filteredQuestions.length > 0) {
        if (activeTab === "skincare") {
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

    // Fix here: assign answers to tabAnswers.skincare to sync with validation
    const answers = (tabAnswers.skincare = {});
    const renderedOrders = new Set();
    const suggestionBlock = document.getElementById("suggestion-output");
    suggestionBlock.innerHTML = "";

    const saveButton = document.getElementById("save-answers");
    saveButton.style.display = "inline-block";

    saveButton.onclick = async () => {
      const ageValue = ageInput.value.trim();
      if (!ageValue) {
        alert("Please enter your age.");
        return;
      }

      const requiredQuestions = allQuestions.filter(
        (q) => q.isRequired && activeTab === q.key
      );

      const answers = tabAnswers[activeTab] || {};

      for (const q of requiredQuestions) {
        // For skincare questions, answers use q.order as key
        const key = activeTab === "skincare" ? q.order : q._id;
        const val = answers[key];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          alert(`Please answer: ${q.title}`);
          return;
        }
      }

      if (activeTab === "skincare") {
        const val5 = answers[5];
        const val6 = answers[6];

        let suggestion = "Suggested products";
        if (val5 === "only_allergy") {
          suggestion = "No suggestion";
        } else if (
          (val5 === "only_acne" || val5 === "both_acne_allergy") &&
          val6 !== "no_itch_pain"
        ) {
          suggestion = "No suggestion";
        }

        suggestionBlock.innerHTML = `<p><strong>${suggestion}</strong></p>`;
      } else {
        suggestionBlock.innerHTML = "";
      }

      const payload = {
        customerAge: Number(ageValue),
      };

      if (activeTab === "skincare") {
        const ageRange = getAgeRange(Number(ageValue)); // 👈 maps age to text range

        payload.skinCare = {
          ageRange,
          skinConcerns: answers[1] || [],
          currentSkinCareProducts: answers[3] || [],
          productTypePreference: answers[4] || [],
          skinType: answers[2] || "",
          skinIssueCondition: answers[5] || "",
          acneIrritation: answers[6] || "",
          acneType: answers[7] || "",
          usedWhiteningProduct: answers[8] || "",
          faceImageUploaded: answers[9] === "yes",
          isCompleted: true,
        };
      }

      if (
        activeTab === "haircare" &&
        tabAnswers.haircare &&
        Object.keys(tabAnswers.haircare).length > 0
      ) {
        payload.hairCare = {
          concern: tabAnswers.haircare.concern || "",
          isCompleted: true,
        };
      }

      if (
        activeTab === "makeup" &&
        tabAnswers.makeup &&
        Object.keys(tabAnswers.makeup).length > 0
      ) {
        const skinToneType = tabAnswers.makeup["skinTone.type"];
        const skinToneGroup = tabAnswers.makeup["skinTone.group"];
        payload.makeup = {
          categories: tabAnswers.makeup.categories || "",
          subCategories: tabAnswers.makeup.subCategories || "",
          skinType: tabAnswers.makeup.skinType || "",
          skinTone: {
            type: skinToneType || "",
            group: skinToneGroup || "",
          },
          skinUnderTone: tabAnswers.makeup.skinUnderTone || "",
          isCompleted: true,
        };
      }

      try {
        const res = await fetch(`${apiURL}/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Submission failed");

        alert("Profile submitted successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to submit profile.");
      }
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
      skippedOrders.forEach((order) => {
        const el = form.querySelector(`.question-block[data-order='${order}']`);
        if (el) {
          el.remove();
          renderedOrders.delete(order);
        }
      });

      const q5Val = answers[5];
      const q6Val = answers[6];
      const getQ = (order) => questions.find((q) => q.order === order);

      if (q5Val === "neither_acne_allergy") {
        return;
      }

      if (q5Val === "only_allergy") {
        [7, 8, 9, 10, 11].forEach((order) => {
          const q = getQ(order);
          if (q) renderQuestion(q);
        });
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
          return;
        } else if (q6Val === "no_itch_pain") {
          [7, 8, 9, 10, 11].forEach((order) => {
            const q = getQ(order);
            if (q) renderQuestion(q);
          });
          return;
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

  function getAgeRange(age) {
    if (age >= 0 && age <= 0.5) return "Newborn – 6 months";
    if (age > 0.5 && age <= 9) return "6 months- 9 years";
    if (age >= 10 && age <= 17) return "10–17 years";
    if (age >= 18 && age <= 25) return "18–25 years";
    return "25+ years";
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
