let wishlistConfig = {
  apiUrl: "/apps/generic-name", // TODO:
  shopDomain: window.shopDomain,
  customerId: null,
};

function getCustomerId() {
  if (window.customerLoggedIn && window.customerId) {
    return window.customerId.toString();
  }
  return null;
}

function displayWishlistItems(products) {
  const itemsEl = document.getElementById("wishlist-items");
  let html = "";

  products.forEach((product) => {
    html += `
      <div class="wishlist-item" data-product-id="${product.productId}">
        <div class="wishlist-item-image">
          ${
            product.productImage
              ? `<img src="${product.productImage}" alt="${product.productTitle}" style="max-width: 100px;">`
              : ""
          }
        </div>
        <div class="wishlist-item-details">
          <h3><a href="/products/${product.productHandle}">${
      product.productTitle
    }</a></h3>
          ${product.productPrice ? `<p>Price: ${product.productPrice}</p>` : ""}
          <p>Added: ${new Date(product.addedAt).toLocaleDateString()}</p>
        </div>
        <div class="wishlist-item-actions">
          <button onclick="removeFromWishlist('${product.productId}', '${
      product.variantId || ""
    }')" class="btn-remove">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  itemsEl.innerHTML = html;
}

function initWishlist(options = {}) {
  wishlistConfig = { ...wishlistConfig, ...options };
  wishlistConfig.customerId = getCustomerId();

  bindWishlistEvents();
  updateWishlistButtons();
  updateWishlistCount();
}

function bindWishlistEvents() {
  document.addEventListener("click", (e) => {
    if (
      e.target.matches(".wishlist-btn") ||
      e.target.closest(".wishlist-btn")
    ) {
      e.preventDefault();
      handleWishlistClick(e.target.closest(".wishlist-btn"));
    }
  });
}

async function handleWishlistClick(button) {
  // Check if user is logged in
  if (!wishlistConfig.customerId) {
    showLoginPrompt();
    return;
  }

  const productId = button.dataset.productId;
  const variantId = button.dataset.variantId || null;
  const productTitle = button.dataset.productTitle;
  const productHandle = button.dataset.productHandle;
  const productImage = button.dataset.productImage;
  const productPrice = button.dataset.productPrice;

  if (!productId) {
    console.error("Product ID not found");
    return;
  }

  // Check current state
  const isInWishlist = button.classList.contains("in-wishlist");

  try {
    button.disabled = true;

    if (isInWishlist) {
      await removeFromWishlist(productId, variantId);
      updateButtonState(button, false);
      showMessage("Product removed from wishlist");
    } else {
      const result = await addToWishlist({
        productId,
        variantId,
        productTitle,
        productHandle,
        productImage,
        productPrice,
      });

      if (result.success) {
        updateButtonState(button, true);
        showMessage("Added to wishlist");
      } else if (result.alreadyExists) {
        updateButtonState(button, true);
        showMessage("Already in wishlist");
      }
    }

    updateWishlistCount();
  } catch (error) {
    console.error("Wishlist error:", error);
    showMessage("Something went wrong. Please try again.");
  } finally {
    button.disabled = false;
  }
}

async function addToWishlist(productData) {
  const response = await fetch(`${wishlistConfig.apiUrl}/wishlist/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...productData,
    }),
  });

  return await response.json();
}

async function removeFromWishlist(productId, variantId = null) {
  const response = await fetch(`${wishlistConfig.apiUrl}/wishlist/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: wishlistConfig.customerId,
      shopDomain: wishlistConfig.shopDomain,
      productId,
      variantId,
    }),
  });

  return await response.json();
}

async function loadWishlist() {
  console.log("Loading wishlist for customer:", window.customerId);
  try {
    const response = await fetch(`${wishlistConfig.apiUrl}/wishlist`);
    const data = await response.json();

    const loadingEl = document.getElementById("wishlist-loading");
    const contentEl = document.getElementById("wishlist-content");
    const itemsEl = document.getElementById("wishlist-items");
    const emptyEl = document.getElementById("wishlist-empty");

    loadingEl.style.display = "none";
    contentEl.style.display = "block";

    if (data.success && data.products && data.products.length > 0) {
      displayWishlistItems(data.products);
      emptyEl.style.display = "none";
    } else {
      itemsEl.innerHTML = "";
      emptyEl.style.display = "block";
    }
  } catch (error) {
    console.error("Error loading wishlist:", error);
    document.getElementById("wishlist-loading").innerHTML =
      "Error loading wishlist. Please try again.";
  }
}

async function isInWishlist(productId, variantId = null) {
  if (!wishlistConfig.customerId) return false;

  const url = `${wishlistConfig.apiUrl}/wishlist/check/${
    wishlistConfig.customerId
  }/${wishlistConfig.shopDomain}/${productId}${
    variantId ? `?variantId=${variantId}` : ""
  }`;
  const response = await fetch(url);
  const result = await response.json();
  return result.inWishlist;
}

async function updateWishlistButtons() {
  if (!wishlistConfig.customerId) return;

  const buttons = document.querySelectorAll(".wishlist-btn");

  for (const button of buttons) {
    const productId = button.dataset.productId;
    const variantId = button.dataset.variantId || null;

    if (productId) {
      try {
        const inWishlist = await isInWishlist(productId, variantId);
        updateButtonState(button, inWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    }
  }
}

function updateButtonState(button, inWishlist) {
  if (inWishlist) {
    button.classList.add("in-wishlist");
    button.innerHTML = "♥ Remove from Wishlist";
    button.title = "Remove from wishlist";
  } else {
    button.classList.remove("in-wishlist");
    button.innerHTML = "♡ Add to Wishlist";
    button.title = "Add to wishlist";
  }
}

async function updateWishlistCount() {
  if (!wishlistConfig.customerId) return;

  try {
    const response = await fetch(
      `${wishlistConfig.apiUrl}/wishlist/count/${wishlistConfig.customerId}/${wishlistConfig.shopDomain}`
    );
    const result = await response.json();

    const countElements = document.querySelectorAll(".wishlist-count");
    countElements.forEach((el) => {
      el.textContent = result.count;
      el.style.display = result.count > 0 ? "inline" : "none";
    });
  } catch (error) {
    console.error("Error updating wishlist count:", error);
  }
}

function showLoginPrompt() {
  if (
    confirm(
      "Please log in to add items to your wishlist. Would you like to log in now?"
    )
  ) {
    window.location.href = "/account/login";
  }
}

function showMessage(message) {
  let messageEl = document.getElementById("wishlist-message");

  if (!messageEl) {
    messageEl = document.createElement("div");
    messageEl.id = "wishlist-message";
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #000;
      color: #fff;
      padding: 10px 15px;
      border-radius: 4px;
      z-index: 9999;
      font-size: 14px;
    `;
    document.body.appendChild(messageEl);
  }

  messageEl.textContent = message;
  messageEl.style.display = "block";

  // Hide after 3 seconds
  setTimeout(() => {
    messageEl.style.display = "none";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  initWishlist({
    apiUrl: `/apps/generic-name`,
  });
});

window.wishlistFunctions = {
  initWishlist,
  addToWishlist,
  removeFromWishlist,
  loadWishlist,
  isInWishlist,
  updateWishlistButtons,
  updateWishlistCount,
  showMessage,
  handleWishlistClick,
};
