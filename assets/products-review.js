// products-review.js
(function () {
  const reviewAppContainers = document.querySelectorAll(".review-extension-container");
  reviewAppContainers.forEach((container) => {
    const sectionId = container.dataset.sectionId;
    const productId = container.dataset.productId;
    const shopDomain = container.dataset.shopDomain;
    const customerId = container.dataset.customerId;
    const customerName = container.dataset.customerName || "Anonymous";
    const customerEmail = container.dataset.customerEmail || "";
    const starColorFilled = container.dataset.starFilledColor || "#FFD700";
    const starColorEmpty = container.dataset.starEmptyColor || "#CCCCCC";
    const showEmptyReviewsSetting = container.dataset.showEmpty === "true";

    const API_BASE_URL = "/apps/generic-name/customer/product-review";
    // const IMAGE_UPLOAD_URL = "/apps/generic-name/image-upload"; // New API endpoint for image upload

    const reviewForm = container.querySelector(`#review-submission-form-${sectionId}`);
    const reviewListContainer = container.querySelector(`#reviews-list-${sectionId}`);
    const formMessage = container.querySelector(`#form-message-${sectionId}`);
    const submitButton = container.querySelector(`#submit-review-btn-${sectionId}`);
    const ratingStarsContainer = container.querySelector(`#form-star-rating-${sectionId}`);
    const ratingValueInput = container.querySelector(`#rating-value-${sectionId}`);
    const reviewsSpinner = container.querySelector(`#reviews-spinner-${sectionId}`);
    const reviewSummaryContainer = container.querySelector(`#review-summary-${sectionId}`);
    const reviewImageInput = container.querySelector(`#reviewImage-${sectionId}`); // Get the image input

    let currentRating = 0;
    let uploadedImageUrl = null; // Variable to store the S3 URL after upload
    let isUploadingImage = false; // Flag to prevent multiple uploads or early submission
    let allProductReviews = [];

    if (ratingStarsContainer) {
      ratingStarsContainer.querySelectorAll(".star").forEach((s) => (s.style.color = starColorEmpty));
    }

    // Star Rating Logic for Form
    if (ratingStarsContainer) {
      const stars = ratingStarsContainer.querySelectorAll(".star");
      stars.forEach((star) => {
        star.addEventListener("click", function () {
          currentRating = parseInt(this.dataset.value);
          if (ratingValueInput) ratingValueInput.value = currentRating;
          stars.forEach((s) => {
            const sValue = parseInt(s.dataset.value);
            s.innerHTML = sValue <= currentRating ? "&#9733;" : "&#9734;";
            s.style.color = sValue <= currentRating ? starColorFilled : starColorEmpty;
          });
        });
        star.addEventListener("mouseover", function () {
          const hoverValue = parseInt(this.dataset.value);
          stars.forEach((s) => {
            const sValue = parseInt(s.dataset.value);
            s.innerHTML = sValue <= hoverValue ? "&#9733;" : "&#9734;";
            s.style.color = sValue <= hoverValue ? starColorFilled : starColorEmpty;
          });
        });
      });
      ratingStarsContainer.addEventListener("mouseout", function () {
        stars.forEach((s) => {
          const sValue = parseInt(s.dataset.value);
          s.innerHTML = sValue <= currentRating ? "&#9733;" : "&#9734;";
          s.style.color = sValue <= currentRating ? starColorFilled : starColorEmpty;
        });
      });
    }

    if (reviewImageInput) {
      reviewImageInput.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) {
          uploadedImageUrl = null;
          return;
        }
        console.log("Selected file:", file);

        // ... (validation and UI updates) ...

        const imageFormData = new FormData();
        imageFormData.append("reviewImage", file);
        console.log("Image FormData prepared:", imageFormData);

        try {
          const response = await fetch(`${API_BASE_URL}/image-upload`, {
            // This is the call
            method: "POST",
            body: imageFormData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: "Image upload failed with status: " + response.status,
            }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          uploadedImageUrl = result.reviewImage; // Store the URL returned by the backend
          if (formMessage) {
            formMessage.textContent = "Image uploaded successfully!";
            formMessage.style.color = "green";
            setTimeout(() => {
              if (formMessage) formMessage.style.display = "none";
            }, 3000);
          }
          console.log("Dummy Image URL:", uploadedImageUrl); // Console log the dummy URL
        } catch (error) {
          console.error("Error uploading image:", error);
          if (formMessage) {
            formMessage.style.display = "block";
            formMessage.textContent = `Image upload failed: ${error.message}`;
            formMessage.style.color = "red";
          }
          uploadedImageUrl = null;
        } finally {
          isUploadingImage = false;
          if (submitButton) submitButton.disabled = false;
        }
      });
    }

    // Handle Review Submission
    if (reviewForm) {
      reviewForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (isUploadingImage) {
          if (formMessage) {
            formMessage.style.display = "block";
            formMessage.textContent = "Please wait, image is still uploading...";
            formMessage.style.color = "orange";
          }
          return; // Prevent submission while image is uploading
        }

        if (submitButton) submitButton.disabled = true;
        if (formMessage) {
          formMessage.style.display = "block";
          formMessage.textContent = "Submitting review...";
          formMessage.style.color = "blue";
        }

        if (currentRating === 0) {
          if (formMessage) {
            formMessage.textContent = "Please select a rating.";
            formMessage.style.color = "red";
          }
          if (submitButton) submitButton.disabled = false;
          return;
        }

        // Prepare data for the main review submission
        const reviewData = {
          reviewText: this.querySelector(`#reviewText-${sectionId}`).value,
          rating: currentRating,
          productId: productId,
          customerName: customerName,
          customerEmail: customerEmail,
          reviewImage: uploadedImageUrl, // Include the S3 URL here
        };

        // Validate if image is required and uploaded
        if (reviewImageInput && reviewImageInput.hasAttribute("required") && !uploadedImageUrl) {
          if (formMessage) {
            formMessage.textContent = "Please upload an image before submitting.";
            formMessage.style.color = "red";
          }
          if (submitButton) submitButton.disabled = false;
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Send as JSON for the main review data
            },
            body: JSON.stringify(reviewData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: "Submission failed with status: " + response.status,
            }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (formMessage) {
            formMessage.textContent = result.message || "Review submitted successfully!";
            formMessage.style.color = "green";
          }
          this.reset();
          currentRating = 0;
          uploadedImageUrl = null; // Clear the uploaded URL after successful submission
          if (ratingValueInput) ratingValueInput.value = "";
          if (ratingStarsContainer) {
            ratingStarsContainer.querySelectorAll(".star").forEach((s) => {
              s.innerHTML = "&#9734;";
              s.style.color = starColorEmpty;
            });
          }
          fetchReviews(); // This will also re-calculate and render the summary
        } catch (error) {
          console.error("Error submitting review:", error);
          if (formMessage) {
            formMessage.textContent = `Error: ${error.message || "Could not submit review."}`;
            formMessage.style.color = "red";
          }
        } finally {
          if (submitButton) submitButton.disabled = false;
          setTimeout(() => {
            if (formMessage) formMessage.style.display = "none";
          }, 5000);
        }
      });
    }

    // Fetch and Display Reviews
    async function fetchReviews() {
      if (!reviewListContainer || !productId) return;
      if (reviewsSpinner) reviewsSpinner.style.display = "flex";
      if (reviewListContainer) reviewListContainer.innerHTML = "";

      try {
        const response = await fetch(`${API_BASE_URL}/list/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: "Failed to fetch reviews with status: " + response.status,
          }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const reviewResponse = await response?.json();
        console.log("Product review data:", reviewResponse?.data);
        allProductReviews = reviewResponse?.data || [];
        renderReviews(allProductReviews);
        calculateAndRenderSummary(allProductReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        allProductReviews = [];
        if (reviewListContainer) {
          reviewListContainer.innerHTML = `<p class="reviews-message">Could not load reviews. ${error.message}</p>`;
        }
        calculateAndRenderSummary(allProductReviews);
      } finally {
        if (reviewsSpinner) reviewsSpinner.style.display = "none";
      }
    }

    function calculateAndRenderSummary(reviewsArray) {
      if (!reviewSummaryContainer) return;

      if (!reviewsArray || reviewsArray.length === 0) {
        reviewSummaryContainer.innerHTML = `<p>No reviews yet.</p>`;
        return;
      }

      const totalReviews = reviewsArray.length;
      const sumOfRatings = reviewsArray.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalReviews > 0 ? sumOfRatings / totalReviews : 0;

      const fullStars = Math.floor(averageRating);
      const decimalPart = averageRating - fullStars;
      const hasHalfStar = decimalPart >= 0.25 && decimalPart < 0.75;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      const starColorFilled = "#FFD700";
      const starColorEmpty = "#CCCCCC";

      let starsHTML = "";

      for (let i = 0; i < fullStars; i++) {
        starsHTML += `<span class="star" style="color:${starColorFilled}; font-size: 1.2em;">&#9733;</span>`;
      }

      if (hasHalfStar) {
        starsHTML += `<span class="star half-star" style="position: relative; display: inline-block; font-size: 1.2em;">
                    <span style="color:${starColorEmpty};">&#9734;</span>
                    <span style="color:${starColorFilled}; position: absolute; overflow: hidden; width: 50%; top: 0; left: 0;">&#9733;</span>
                </span>`;
      }

      for (let i = 0; i < emptyStars; i++) {
        starsHTML += `<span class="star" style="color:${starColorEmpty}; font-size: 1.2em;">&#9734;</span>`;
      }

      reviewSummaryContainer.innerHTML = `
                <div class="summary-average-rating">
                  ${starsHTML} (${totalReviews})
                </div>
            `;
    }

    function renderReviews(reviewsArray) {
      if (!reviewListContainer) return;
      reviewListContainer.innerHTML = "";

      if (!reviewsArray || reviewsArray.length === 0) {
        if (showEmptyReviewsSetting) {
          reviewListContainer.innerHTML = '<p class="no-reviews">Be the first to review this product!</p>';
        } else {
          reviewListContainer.innerHTML = "";
        }
        return;
      }

      reviewsArray.forEach((review) => {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";

        const ratingStarsHTML = Array(5)
          .fill(0)
          .map((_, i) => {
            const isFilled = i < review.rating;
            return `<span class="star" style="color:${isFilled ? starColorFilled : starColorEmpty};">${
              isFilled ? "&#9733;" : "&#9734;"
            }</span>`;
          })
          .join("");

        const reviewDate = review.reviewPlacedAt ? new Date(review.reviewPlacedAt).toLocaleDateString() : "N/A";

        // Add image display if imageUrl exists
        const reviewImageHTML = review.imageUrl
          ? `<img src="${escapeHTML(review.imageUrl)}" alt="Review Image" class="review-uploaded-image">`
          : "";

        reviewItem.innerHTML = `
                    <div class="review-header">
                        <span class="reviewer-name">${escapeHTML(review.customerName || "Anonymous")}</span>
                        <span class="review-date">${reviewDate}</span>
                    </div>
                    <div class="review-rating">${ratingStarsHTML}</div>
                    ${reviewImageHTML} <p class="review-text">${escapeHTML(review.reviewText || "")}</p>
                    ${
                      review.reviewImage
                        ? `<p class="review-image"><img src="${escapeHTML(
                            review.reviewImage
                          )}" alt="Review Image" class="review-uploaded-image"></p>`
                        : ""
                    }
                `;
        reviewListContainer.appendChild(reviewItem);
      });
    }

    function escapeHTML(str) {
      if (str === null || typeof str === "undefined") return "";
      return str
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    if (productId && shopDomain) {
      fetchReviews();
    } else {
      console.warn(`[Product Reviews App ${sectionId}]: Missing productId or shopDomain. Cannot fetch reviews.`);
      if (reviewListContainer)
        reviewListContainer.innerHTML =
          '<p class="reviews-message">Configuration error (missing product/store data).</p>';
      if (reviewSummaryContainer)
        reviewSummaryContainer.innerHTML = "<p>Could not load review summary due to configuration error.</p>";
      if (reviewsSpinner) reviewsSpinner.style.display = "none";
    }
  });
})();
