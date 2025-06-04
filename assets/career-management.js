document.addEventListener("DOMContentLoaded", () => {
  // If this file is named 'career-management.js.liquid', you can use:
  // const API_BASE_URL = "{{ routes.root_url | append: 'apps/generic-name/career-management' }}";
  const API_BASE_URL = "/apps/generic-name/career-management"; // Using hardcoded path as per your last JS version

  const careerManagementSection = document.getElementById("career-management-section");

  if (!careerManagementSection) {
    return;
  }

  const jobListingsContainer = careerManagementSection.querySelector("#job-listings-container");
  const noJobsMessageEl = careerManagementSection.querySelector("#no-jobs-message");
  const paginationContainerEl = careerManagementSection.querySelector("#pagination-container");
  const jobDetailModalEl = careerManagementSection.querySelector("#job-detail-modal");
  const modalCloseButton = jobDetailModalEl ? jobDetailModalEl.querySelector(".modal-close-button") : null;
  const loadingSpinner = jobListingsContainer ? jobListingsContainer.querySelector(".loading-spinner") : null;

  if (!jobListingsContainer || !noJobsMessageEl || !paginationContainerEl) {
    console.error("Essential career management HTML elements are missing.");
    return;
  }
  if (!jobDetailModalEl || !modalCloseButton) {
    console.warn("Job detail modal elements are missing. Detail view might not work.");
  }

  let allFetchedJobsData = [];
  let currentPage = 1;
  const defaultJobsPerPage = 10;

  function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === "undefined") return "";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createSummaryFromHtml(htmlString, maxLength = 200) {
    if (!htmlString) return "No summary available.";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    let text = tempDiv.textContent || tempDiv.innerText || "";
    text = text.trim();
    if (text.length > maxLength) {
      return text.substring(0, maxLength).trimEnd() + "...";
    }
    return text || "View details for more information.";
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.warn("Could not parse date:", dateString, e);
      return "Invalid Date";
    }
  }

  async function fetchActiveJobs(page = 1, limit = defaultJobsPerPage) {
    if (loadingSpinner) loadingSpinner.style.display = "block";
    jobListingsContainer.innerHTML = "";
    if (loadingSpinner) jobListingsContainer.appendChild(loadingSpinner);

    noJobsMessageEl.style.display = "none";
    paginationContainerEl.innerHTML = "";

    try {
      const response = await fetch(`${API_BASE_URL}/active-jobs?page=${page}&limit=${limit}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();

      if (loadingSpinner) loadingSpinner.style.display = "none";

      if (data.jobs && data.jobs.length > 0) {
        allFetchedJobsData = data.jobs;
        renderJobListings(data.jobs);
        renderPaginationControls(data.pagination);
        jobListingsContainer.style.display = "block";
      } else {
        noJobsMessageEl.style.display = "block";
        jobListingsContainer.style.display = "none";
      }
      currentPage = parseInt(page);
    } catch (error) {
      console.error("Error fetching active job postings:", error);
      if (loadingSpinner) loadingSpinner.style.display = "none";
      jobListingsContainer.innerHTML = `<p style="color: red; text-align: center;">Failed to load job postings. Error: ${escapeHtml(
        error.message
      )}</p>`;
      jobListingsContainer.style.display = "block";
    }
  }

  function renderJobListings(jobs) {
    jobListingsContainer.innerHTML = "";
    jobs.forEach((job, index) => {
      const jobElement = document.createElement("article");
      jobElement.classList.add("job-posting");
      jobElement.setAttribute("aria-labelledby", `job-title-${job._id || index}`);

      const summary = createSummaryFromHtml(job.fullJobDescription, 200);

      let deadlineHtml = "";
      if (job.deadlineDate) {
        deadlineHtml = `<p class="job-posting-deadline"><strong>Deadline:</strong> ${formatDate(job.deadlineDate)}</p>`;
      }

      jobElement.innerHTML = `
          <h3 class="job-posting-title" id="job-title-${job._id || index}">${escapeHtml(
        job.jobTitle || "Untitled Job"
      )}</h3>
          <p class="job-posting-summary">${summary}</p>
          ${deadlineHtml}
          <button type="button" class="view-details-button" data-job-index="${index}" aria-expanded="false" aria-controls="job-detail-modal">View Details</button>
        `;

      const viewDetailsButton = jobElement.querySelector(".view-details-button");
      if (viewDetailsButton) {
        viewDetailsButton.addEventListener("click", (event) => {
          const jobIndex = parseInt(event.currentTarget.getAttribute("data-job-index"));
          if (allFetchedJobsData[jobIndex]) {
            displayJobDetails(allFetchedJobsData[jobIndex]);
            event.currentTarget.setAttribute("aria-expanded", "true");
          } else {
            console.error("Job data not found for index:", jobIndex);
          }
        });
      }
      jobListingsContainer.appendChild(jobElement);
    });
  }

  function renderPaginationControls(pagination) {
    paginationContainerEl.innerHTML = "";
    if (!pagination || pagination.totalPages <= 1) return;

    const { total, page: PcurrentStr, limit: Plimit, totalPages } = pagination;
    const Pcurrent = parseInt(PcurrentStr);

    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = Pcurrent === 1;
    prevButton.addEventListener("click", () => fetchActiveJobs(Pcurrent - 1, Plimit));
    paginationContainerEl.appendChild(prevButton);

    const maxPageButtons = 5;
    let startPage = Math.max(1, Pcurrent - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (totalPages > maxPageButtons && endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      const firstButton = document.createElement("button");
      firstButton.textContent = "1";
      firstButton.addEventListener("click", () => fetchActiveJobs(1, Plimit));
      paginationContainerEl.appendChild(firstButton);
      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainerEl.appendChild(ellipsis);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      if (i === Pcurrent) {
        pageButton.classList.add("active");
        pageButton.setAttribute("aria-current", "page");
      } else {
        pageButton.addEventListener("click", () => fetchActiveJobs(i, Plimit));
      }
      paginationContainerEl.appendChild(pageButton);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        paginationContainerEl.appendChild(ellipsis);
      }
      const lastButton = document.createElement("button");
      lastButton.textContent = totalPages;
      lastButton.addEventListener("click", () => fetchActiveJobs(totalPages, Plimit));
      paginationContainerEl.appendChild(lastButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = Pcurrent === totalPages;
    nextButton.addEventListener("click", () => fetchActiveJobs(Pcurrent + 1, Plimit));
    paginationContainerEl.appendChild(nextButton);
  }

  function displayJobDetails(job) {
    if (!job || !jobDetailModalEl) {
      console.error("Job data or modal element is missing for displaying details.");
      return;
    }

    jobDetailModalEl.querySelector("#modal-job-title").textContent = escapeHtml(job.jobTitle || "N/A");

    let postingMeta = `<strong>Posted on:</strong> ${formatDate(job.postingDate || job.createdAt)}`;
    if (job.deadlineDate) {
      postingMeta += ` | <strong class="deadline-text">Deadline:</strong> ${formatDate(job.deadlineDate)}`;
    }
    jobDetailModalEl.querySelector(".modal-meta").innerHTML = postingMeta;

    const modalSummaryText = createSummaryFromHtml(job.fullJobDescription, 250);
    jobDetailModalEl.querySelector("#modal-job-summary").innerHTML = modalSummaryText;

    // SECURITY NOTE: Trust the source of job.fullJobDescription if rendering as HTML
    jobDetailModalEl.querySelector("#modal-job-fullDescription").innerHTML =
      job.fullJobDescription || "<p>Not provided.</p>";

    // Application Instructions
    let applicationInfoHtml = "";
    if (job.applicationUrl) {
      const cleanUrl = job.applicationUrl.trim();
      applicationInfoHtml += `<p><a href="${escapeHtml(
        cleanUrl
      )}" class="button apply-online-button" target="_blank" rel="noopener noreferrer">Apply Online via Link</a></p>`;
    }
    if (job.applicationEmailAddress) {
      applicationInfoHtml += `<p>${
        job.applicationUrl ? "Or, s" : "S"
      }end your application to: <a href="mailto:${escapeHtml(job.applicationEmailAddress)}">${escapeHtml(
        job.applicationEmailAddress
      )}</a></p>`;
    }

    if (!applicationInfoHtml) {
      applicationInfoHtml = "<p>Application instructions not specified.</p>";
    }
    jobDetailModalEl.querySelector("#modal-job-applicationInstructions").innerHTML = applicationInfoHtml;

    jobDetailModalEl.style.display = "block";
    document.body.style.overflow = "hidden";
    if (modalCloseButton) modalCloseButton.focus();
  }

  function closeModal() {
    if (!jobDetailModalEl) return;
    jobDetailModalEl.style.display = "none";
    document.body.style.overflow = "";

    const allViewDetailsButtons = jobListingsContainer.querySelectorAll('.view-details-button[aria-expanded="true"]');
    allViewDetailsButtons.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  }

  if (modalCloseButton) {
    modalCloseButton.addEventListener("click", closeModal);
  }
  if (jobDetailModalEl) {
    jobDetailModalEl.addEventListener("click", (event) => {
      if (event.target === jobDetailModalEl) {
        closeModal();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && jobDetailModalEl && jobDetailModalEl.style.display === "block") {
      closeModal();
    }
  });

  fetchActiveJobs(currentPage, defaultJobsPerPage);
});
