function initScrollingBanners(root = document) {
  const scrollingBanners = root.querySelectorAll(".scrolling-banner");

  scrollingBanners.forEach((banner) => {
    const itemsContainers = banner.querySelectorAll(".scrolling-banner__items");
    const speed = parseInt(banner.getAttribute("data-speed")) || 24;
    const pausable = banner.getAttribute("data-pausable") === "true";

    const firstContainer = itemsContainers[0];
    const containerWidth = firstContainer.offsetWidth;
    const windowWidth = window.innerWidth;

    if (containerWidth < windowWidth * 2) {
      const items = firstContainer.querySelectorAll(".scrolling-banner__item");
      const itemsArray = Array.from(items);

      while (firstContainer.offsetWidth < windowWidth * 2) {
        itemsArray.forEach((item) => {
          const clone = item.cloneNode(true);
          firstContainer.appendChild(clone);
          itemsContainers[1].appendChild(clone.cloneNode(true));
        });
      }
    }

    itemsContainers.forEach((container) => {
      container.style.animationDuration = `${speed}s`;
    });

    if (pausable) {
      banner.addEventListener("mouseenter", () => {
        itemsContainers.forEach((container) => {
          container.style.animationPlayState = "paused";
        });
      });

      banner.addEventListener("mouseleave", () => {
        itemsContainers.forEach((container) => {
          container.style.animationPlayState = "running";
        });
      });
    }
  });
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  initScrollingBanners();
});

// Re-run when the section is loaded in theme editor
document.addEventListener("shopify:section:load", (event) => {
  if (event.target.classList.contains("scrolling-banner")) {
    initScrollingBanners(event.target);
  }
});

// Re-run when the section is selected in theme editor
document.addEventListener("shopify:section:select", (event) => {
  if (event.target.classList.contains("scrolling-banner")) {
    initScrollingBanners(event.target);
  }
});
