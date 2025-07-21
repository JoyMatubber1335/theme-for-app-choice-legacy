function initScrollingLogos(root = document) {
  const scrollingLogos = root.querySelectorAll(".scrolling-logo");

  scrollingLogos.forEach((logo) => {
    const itemsContainers = logo.querySelectorAll(".scrolling-logo__items");
    const speed = parseInt(logo.getAttribute("data-speed")) || 24;
    const pausable = logo.getAttribute("data-pausable") === "true";

    const firstContainer = itemsContainers[0];
    const containerWidth = firstContainer.offsetWidth;
    const windowWidth = window.innerWidth;

    if (containerWidth < windowWidth * 2) {
      const items = firstContainer.querySelectorAll(".scrolling-logo__item");
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
      logo.addEventListener("mouseenter", () => {
        itemsContainers.forEach((container) => {
          container.style.animationPlayState = "paused";
        });
      });

      logo.addEventListener("mouseleave", () => {
        itemsContainers.forEach((container) => {
          container.style.animationPlayState = "running";
        });
      });
    }
  });
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  initScrollingLogos();
});

// Shopify section reload
document.addEventListener("shopify:section:load", (event) => {
  if (event.target.classList.contains("scrolling-logo")) {
    initScrollingLogos(event.target);
  }
});

document.addEventListener("shopify:section:select", (event) => {
  if (event.target.classList.contains("scrolling-logo")) {
    initScrollingLogos(event.target);
  }
});
