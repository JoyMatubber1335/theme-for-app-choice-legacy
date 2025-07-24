if (!customElements.get("slideshow-component")) {
  class SlideshowComponent extends HTMLElement {
    constructor() {
      super();
      this.swiper = null;
    }

    connectedCallback() {
      this.initializeSwiper();
    }

    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }

    initializeSwiper() {
      const swiperContainer = this.querySelector(".swiper-container");

      if (swiperContainer) {
        const autoplayEnabled = this.dataset.autoplay === "true";
        const autoplayDelay = parseInt(this.dataset.autoplayDelay) || 3000;
        const pauseOnHover = this.dataset.pauseOnHover === "true";
        const showPartialSlides = this.dataset.showPartialSlides === "true";
        const showProgressBar = this.dataset.showProgressBar === "true";
        const carouselMode = this.dataset.carouselMode === "true";

        const slidesPerViewForFullSlides =
          parseInt(this.dataset.slidesPerViewDesktop) || 1;

        const customNextButton = this.querySelector(
          ".slideshow-nav-button-next"
        );
        const customPrevButton = this.querySelector(
          ".slideshow-nav-button-prev"
        );

        const swiperConfig = {
          navigation: {
            nextEl: customNextButton,
            prevEl: customPrevButton,
          },
          loop: true,
        };

        if (showProgressBar) {
          swiperConfig.pagination = {
            el: ".custom-pagination",
            type: "progressbar",
          };
        }

        // Carousel mode configuration
        if (carouselMode) {
          // Free mode allows continuous scrolling based on drag distance
          swiperConfig.freeMode = {
            enabled: true,
            sticky: false,
            momentumRatio: 1,
            momentumVelocityRatio: 1,
            momentumBounceRatio: 1,
          };

          // Disable loop for carousel mode as it interferes with free scrolling
          swiperConfig.loop = false;

          // Enable grabCursor for better UX
          swiperConfig.grabCursor = true;

          // Set resistance for better feel when reaching edges
          swiperConfig.resistanceRatio = 0.85;

          // Configure slides per view as 'auto' for dynamic widths
          swiperConfig.slidesPerView = "auto";
          swiperConfig.spaceBetween = 16; // Consistent spacing between slides
          swiperConfig.centeredSlides = false;

          // Responsive breakpoints for carousel mode
          swiperConfig.breakpoints = {
            320: {
              slidesPerView: "auto",
              spaceBetween: 12,
            },
            768: {
              slidesPerView: "auto",
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: "auto",
              spaceBetween: 20,
            },
          };

          // Get slide widths from data attributes for different devices
          const slideWidthMobile = this.dataset.slideWidthMobile || "220px";
          const slideWidthTablet = this.dataset.slideWidthTablet || "240px";
          const slideWidthDesktop = this.dataset.slideWidthDesktop || "268px";

          // Add custom CSS to handle dynamic widths and remove margin-right
          if (!document.querySelector("#carousel-mode-styles")) {
            const style = document.createElement("style");
            style.id = "carousel-mode-styles";
            style.textContent = `
              .swiper-container[data-carousel-mode="true"] .swiper-slide {
                width: auto !important;
                margin-right: 0 !important;
              }
              
              .swiper-container[data-carousel-mode="true"] .product-video-item {
                width: var(--slide-width-mobile, 220px);
                flex-shrink: 0;
              }
              
              @media screen and (min-width: 768px) {
                .swiper-container[data-carousel-mode="true"] .product-video-item {
                  width: var(--slide-width-tablet, 240px);
                }
              }
              
              @media screen and (min-width: 1024px) {
                .swiper-container[data-carousel-mode="true"] .product-video-item {
                  width: var(--slide-width-desktop, 268px);
                }
              }
            `;
            document.head.appendChild(style);
          }

          // Set the CSS custom properties for different device widths
          swiperContainer.style.setProperty(
            "--slide-width-mobile",
            slideWidthMobile
          );
          swiperContainer.style.setProperty(
            "--slide-width-tablet",
            slideWidthTablet
          );
          swiperContainer.style.setProperty(
            "--slide-width-desktop",
            slideWidthDesktop
          );

          // Mark the container for carousel mode styling
          swiperContainer.setAttribute("data-carousel-mode", "true");
        } else {
          // Original slideshow behavior
          swiperConfig.slidesPerView = slidesPerViewForFullSlides;
          swiperConfig.spaceBetween = 16;
          swiperConfig.centeredSlides = false;

          swiperConfig.breakpoints = {
            769: {
              slidesPerView: showPartialSlides
                ? 1.2
                : slidesPerViewForFullSlides,
              spaceBetween: showPartialSlides ? 20 : 16,
              centeredSlides: showPartialSlides,
            },
          };

          // Remove carousel mode attribute if not in carousel mode
          swiperContainer.removeAttribute("data-carousel-mode");
        }

        if (autoplayEnabled) {
          swiperConfig.autoplay = {
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: pauseOnHover,
          };
        }

        this.swiper = new Swiper(swiperContainer, swiperConfig);
      }
    }
  }

  customElements.define("slideshow-component", SlideshowComponent);
}
