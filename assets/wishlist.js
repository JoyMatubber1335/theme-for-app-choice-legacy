let wishlistConfig = {
  apiUrl: `/apps/${APP_SUB_PATH}`,
};

async function addToWishlist(productHandle, variantId = null) {
  const response = await fetch(
    `${wishlistConfig.apiUrl}/customer/wishlist/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productHandle: productHandle,
        variantId: variantId,
      }),
    }
  );

  return await response.json();
}

async function removeFromWishlist(productHandle, variantId = null) {
  const response = await fetch(
    `${wishlistConfig.apiUrl}/customer/wishlist/remove`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productHandle: productHandle,
        variantId: variantId,
      }),
    }
  );

  return await response.json();
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

// Initialize wishlist functionality
document.addEventListener("DOMContentLoaded", function () {
  // Handle wishlist add buttons
  document.addEventListener("click", async (e) => {
    if (
      e.target.matches(".wishlist-btn") ||
      e.target.closest(".wishlist-btn")
    ) {
      e.preventDefault();
      const button = e.target.closest(".wishlist-btn");
      const productHandle = button.dataset.productHandle;
      const variantId = button.dataset.variantId || null;

      if (!productHandle) {
        console.error("Product handle not found");
        return;
      }

      try {
        button.disabled = true;
        const result = await addToWishlist(productHandle, variantId);

        if (result.success) {
          showMessage("Added to wishlist");
        } else if (result.alreadyExists) {
          showMessage("Already in wishlist");
        } else {
          showMessage("Failed to add to wishlist");
        }
      } catch (error) {
        console.error("Wishlist error:", error);
        showMessage("Something went wrong. Please try again.");
      } finally {
        button.disabled = false;
      }
    }
  });

  // Handle wishlist remove buttons (from wishlist page)
  document.addEventListener("click", async (e) => {
    if (e.target.matches(".remove-wishlist-button")) {
      const button = e.target;
      const productHandle = button.dataset.productHandle;
      const variantId = button.dataset.variantId || null;
      const itemId = button.dataset.itemId;

      button.disabled = true;
      button.textContent = "Removing...";

      try {
        const result = await removeFromWishlist(productHandle, variantId);

        if (result.success) {
          showMessage("Product removed from wishlist");

          // Remove the item from the page
          const listItem = document.getElementById(itemId);
          if (listItem) {
            listItem.remove();
          }

          // Check if wishlist is now empty
          const wishlistItemsList = document.getElementById(
            "customer-wishlist-items"
          );
          if (wishlistItemsList && wishlistItemsList.children.length === 0) {
            const emptyMessage = document.getElementById(
              "empty-wishlist-message"
            );
            if (emptyMessage) {
              emptyMessage.style.display = "block";
            }
            wishlistItemsList.style.display = "none";
          }
        } else {
          showMessage("Failed to remove from wishlist");
          button.disabled = false;
          button.textContent = "Remove";
        }
      } catch (error) {
        console.error("Remove error:", error);
        showMessage("Something went wrong. Please try again.");
        button.disabled = false;
        button.textContent = "Remove";
      }
    }
  });
});
